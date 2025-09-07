const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL;
if (!MEDIA_BASE_URL) {
  console.warn('[cdn test] MEDIA_BASE_URL not set; skipping CDN asset checks');
}

function extractUrls(html) {
  const attrRe = /(src|href|poster|data-src)=("|')(.*?)\2/gi;
  const srcsetRe = /(srcset|data-srcset)=("|')(.*?)\2/gi;
  const urls = new Set();
  const norm = (u) => {
    if (!u) return null;
    if (/^https?:\/\//i.test(u)) return u;
    if (/^assets\//.test(u)) {
      return u.replace(/^assets\/images\//, MEDIA_BASE_URL.replace(/\/$/, '') + '/images/')
              .replace(/^assets\/videos\//, MEDIA_BASE_URL.replace(/\/$/, '') + '/videos/');
    }
    return null;
  };
  let m;
  while ((m = attrRe.exec(html))) { const u = norm(m[3]); if (u) urls.add(u); }
  while ((m = srcsetRe.exec(html))) {
    m[3].split(',').forEach(part => { const u = norm(part.trim().split(' ')[0]); if (u) urls.add(u); });
  }
  return Array.from(urls).filter(u => /\.(avif|webp|jpe?g|png|svg|mp4|webm|mov)$/i.test(u));
}

test.describe('CDN assets', () => {
  test(MEDIA_BASE_URL ? 'all referenced assets resolve on CDN' : 'skipped', async ({ request }) => {
    test.skip(!MEDIA_BASE_URL, 'MEDIA_BASE_URL not set');
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    const urls = extractUrls(html);
    const missing = [];
    for (const u of urls) {
      const res = await request.head(u);
      if (!res.ok()) missing.push({ url: u, status: res.status() });
    }
    if (missing.length) {
      console.error('[cdn missing]', missing);
    }
    expect(missing, 'missing or blocked assets on CDN').toHaveLength(0);
  });
});

