#!/usr/bin/env node
import https from 'https';
import fs from 'fs';
const CDN = process.env.MEDIA_BASE_URL || (process.env.CDN || '').replace(/\/$/, '');
if (!CDN) {
  console.error('Set MEDIA_BASE_URL to your CloudFront URL to check.');
  process.exit(1);
}
const text = fs.readFileSync('site.config.ts', 'utf8');
const paths = Array.from(text.matchAll(/media\('\/([^']+)'\)/g)).map(m => m[1]);
const unique = [...new Set(paths.filter(p => !p.startsWith('floorplans/') && !p.startsWith('docs/')))]
  .map(p => `${CDN.replace(/\/$/, '')}/${p}`);

function head(url) {
  return new Promise((resolve) => {
    // Use a lightweight GET with Range to avoid some origins denying HEAD
    const req = https.request(url, { method: 'GET', headers: { Range: 'bytes=0-0' }, timeout: 10000 }, (res) => {
      resolve({ url, status: res.statusCode });
      res.resume();
    });
    req.on('error', () => resolve({ url, status: 'ERR' }));
    req.on('timeout', () => { req.destroy(); resolve({ url, status: 'TIMEOUT' }); });
    req.end();
  });
}

(async () => {
  const results = await Promise.all(unique.map(head));
  const okStatuses = new Set([200, 206]);
  const bad = results.filter(r => !okStatuses.has(r.status));
  console.log('Checked', results.length, 'URLs against', CDN);
  if (bad.length) {
    console.log('Non-OK URLs (expected 200 or 206):');
    bad.forEach(r => console.log(r.status, r.url));
    if (process.env.STRICT_CDN_CHECK === '1') {
      process.exitCode = 1;
    }
  } else {
    console.log('All URLs OK');
  }
})();
