// Rewrite media URLs in index.html to point to S3 when MEDIA_BASE_URL is set
const fs = require('fs');
const path = require('path');
const base = process.env.MEDIA_BASE_URL;
if (!base) {
  console.log('[rewrite] MEDIA_BASE_URL not set; skipping');
  process.exit(0);
}
const indexPath = path.join(__dirname, '..', 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
const map = [
  { re: /\bassets\/images\//g, to: `${base.replace(/\/$/, '')}/images/` },
  { re: /\bassets\/videos\//g, to: `${base.replace(/\/$/, '')}/videos/` },
];
map.forEach(({ re, to }) => { html = html.replace(re, to); });
fs.writeFileSync(indexPath, html);
console.log('[rewrite] media base ->', base);

