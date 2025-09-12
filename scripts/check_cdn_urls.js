#!/usr/bin/env node
const https = require('https');
const fs = require('fs');
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
    const req = https.request(url, { method: 'HEAD', timeout: 8000 }, (res) => {
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
  const bad = results.filter(r => r.status !== 200);
  console.log('Checked', results.length, 'URLs against', CDN);
  if (bad.length) {
    console.log('Non-200 URLs:');
    bad.forEach(r => console.log(r.status, r.url));
    process.exitCode = 1;
  } else {
    console.log('All URLs OK');
  }
})();

