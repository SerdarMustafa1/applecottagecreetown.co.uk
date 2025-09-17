#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
let fetch;
(async () => {
  try {
    const mod = await import('node-fetch');
    fetch = mod.default || mod;
  } catch {
    // Node 18+ has global fetch
    if (typeof globalThis.fetch !== 'undefined') fetch = globalThis.fetch;
  }
})();

async function fetchWithTimeout(url, opts = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const res = await fetch(url, { signal: controller.signal, ...opts });
  clearTimeout(id);
  return res;
}

async function headOrGet(url) {
  try {
    const res = await fetchWithTimeout(url, { method: 'HEAD' }, 5000);
    if (res && res.status) return res.status;
  } catch {
    // fallthrough to ranged GET
  }
  try {
    const res2 = await fetchWithTimeout(url, { method: 'GET', headers: { Range: 'bytes=0-0' } }, 5000);
    if (res2 && res2.status) return res2.status;
  } catch {
    return 0;
  }
  return 0;
}

async function main() {
  const distPath = path.join(process.cwd(), 'dist', 'index.html');
  if (!fs.existsSync(distPath)) {
    console.error('dist/index.html not found. Run `npm run build` first.');
    process.exit(2);
  }
  const html = fs.readFileSync(distPath, 'utf8');
  const regex = /https:\/\/d1t6lpjdsu4646\.cloudfront\.net[^"')\s>]+/g;
  const matches = html.match(regex) || [];
  const uniq = Array.from(new Set(matches));
  console.log(`Found ${uniq.length} unique CDN URLs to check`);

  const results = [];
  for (const url of uniq) {
    process.stdout.write(`Checking ${url} ... `);
    try {
      const status = await headOrGet(url);
      console.log(status);
      results.push({ url, status });
    } catch (err) {
      console.log('ERR');
      results.push({ url, status: 0, error: String(err) });
    }
  }

  const outTxt = results.map(r => `${r.status} ${r.url}`).join('\n');
  fs.writeFileSync(path.join('scripts', 'cdn_url_statuses.txt'), outTxt, 'utf8');
  fs.writeFileSync(path.join('scripts', 'cdn_url_statuses.json'), JSON.stringify(results, null, 2), 'utf8');
  console.log('Wrote scripts/cdn_url_statuses.txt and .json');
}

main().catch(err => { console.error(err); process.exit(1); });
