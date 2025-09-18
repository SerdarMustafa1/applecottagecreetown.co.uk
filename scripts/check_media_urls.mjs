#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

const configPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../site.config.ts');
const configSrc = fs.readFileSync(configPath, 'utf8');

// Extract all media('...') calls
const mediaUrls = Array.from(configSrc.matchAll(/media\(['"]([^'"]+)['"]\)/g)).map(m => m[1]);

// Remove duplicates and filter only CDN/absolute URLs
const uniqueUrls = Array.from(new Set(mediaUrls));

// If MEDIA_BASE_URL is set, prepend it
const baseUrl = process.env.MEDIA_BASE_URL || '';
const resolvedUrls = uniqueUrls.map(u =>
  u.startsWith('http') ? u : baseUrl ? baseUrl.replace(/\/$/, '') + u : u
);

function headUrl(url) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.request(url, { method: 'HEAD' }, (res) => {
      resolve({ url, status: res.statusCode });
    });
    req.on('error', () => resolve({ url, status: 0 }));
    req.end();
  });
}

(async () => {
  console.log(`Checking ${resolvedUrls.length} media URLs...`);
  const results = await Promise.all(resolvedUrls.map(headUrl));
  let failed = 0;
  for (const r of results) {
    if (r.status !== 200) {
      console.error(`FAIL: ${r.url} [${r.status}]`);
      failed++;
    } else {
      console.log(`OK:   ${r.url}`);
    }
  }
  if (failed > 0) {
    console.error(`\n${failed} media URLs failed.`);
    process.exit(1);
  } else {
    console.log('\nAll media URLs are reachable.');
  }
})();
