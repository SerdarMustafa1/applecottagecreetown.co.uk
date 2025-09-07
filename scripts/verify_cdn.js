const fs = require('fs');
const path = require('path');
const https = require('https');

const base = process.env.MEDIA_BASE_URL;
if (!base) {
  console.error('[verify-cdn] MEDIA_BASE_URL not set');
  process.exit(2);
}

const IMG_DIR = path.join(__dirname, '..', 'assets', 'images');
const VID_DIR = path.join(__dirname, '..', 'assets', 'videos');
const urls = [];

function collect(dir, prefix) {
  if (!fs.existsSync(dir)) return;
  for (const root of walk(dir)) {
    const rel = path.relative(dir, root).replace(/\\/g, '/');
    const u = `${base.replace(/\/$/, '')}/${prefix}/${rel}`;
    urls.push(u);
  }
}

function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else if (/\.(avif|webp|jpg|jpeg|png|svg|mp4|webm|mov)$/i.test(e.name)) yield p;
  }
}

collect(IMG_DIR, 'images');
collect(VID_DIR, 'videos');

console.log(`[verify-cdn] checking ${urls.length} assets at ${base}`);

let failures = 0; let done = 0; const max = 16; let active = 0; let i = 0;
function head(u) {
  return new Promise(resolve => {
    const req = https.request(u, { method: 'HEAD' }, res => { resolve(res.statusCode); }).on('error', () => resolve(0));
    req.end();
  });
}
function pump() {
  while (active < max && i < urls.length) {
    const u = urls[i++]; active++;
    head(u).then(code => {
      if (code < 200 || code >= 400) { failures++; console.error('[missing]', code, u); }
    }).finally(() => { active--; done++; if (done % 50 === 0) console.log(`[verify-cdn] ${done}/${urls.length}`); if (i < urls.length) pump(); else if (!active) finish(); });
  }
}
function finish() {
  console.log(`[verify-cdn] complete. missing=${failures}`);
  process.exit(failures ? 1 : 0);
}

if (!urls.length) { console.log('[verify-cdn] nothing to verify'); process.exit(0); }
pump();

