#!/usr/bin/env node
/**
 * Quick verification script for annex media assets on CDN.
 * Usage:
 *   MEDIA_BASE_URL="https://dxxxxxxxx.cloudfront.net" node scripts/verify_annex_media.js
 */
import https from 'https';

const base = (process.env.MEDIA_BASE_URL || '').replace(/\/$/, '');
if (!base) {
  console.error('Set MEDIA_BASE_URL to your CloudFront base, e.g. https://d1t6lpjdsu4646.cloudfront.net');
  process.exit(1);
}

const paths = [
  '/videos/annex/annex-360.mp4',
  '/videos/annex/annex-360.webm',
  '/images/annex/annex-360-poster.jpg',
  '/images/annex/annex-still-1200.jpg'
];

function head(url) {
  return new Promise(resolve => {
    const req = https.request(url, { method: 'HEAD', timeout: 8000 }, res => {
      resolve({ url, status: res.statusCode, type: res.headers['content-type'], size: res.headers['content-length'] });
    });
    req.on('error', err => resolve({ url, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ url, error: 'timeout'}); });
    req.end();
  });
}

(async () => {
  const results = await Promise.all(paths.map(p => head(base + p)));
  for (const r of results) {
    if (r.error) {
      console.log(r.url, 'ERROR', r.error);
    } else {
      console.log(r.url, r.status, r.type || '', r.size || '');
    }
  }
})();
