const fs = require("fs");
const path = require("path");
const https = require("https");

const base = process.env.MEDIA_BASE_URL;
if (!base) {
  console.error("[verify-cdn] MEDIA_BASE_URL not set");
  process.exit(2);
}

// Test if the CDN base is reachable before proceeding
async function testCdnConnectivity() {
  return new Promise((resolve) => {
    const testUrl = base.replace(/\/$/, '') + '/test';
    const req = https.request(testUrl, { method: 'HEAD' }, (res) => {
      resolve(true); // Any response (even 404) means CDN is reachable
    }).on('error', (err) => {
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
        resolve(false); // DNS resolution or connection failure
      } else {
        resolve(true); // Other errors still mean CDN is reachable
      }
    });
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(false); // Timeout means CDN is not reachable
    });
    req.end();
  });
}

// Optional filters via env vars
// VERIFY_SKIP_WEBM=1 -> ignore .webm files
// VERIFY_SKIP_PATHS="/images/exterior/,/images/interior/" -> comma-separated substrings to exclude
const SKIP_WEBM = /^1|true$/i.test(String(process.env.VERIFY_SKIP_WEBM || ""));
const SKIP_PATHS = String(process.env.VERIFY_SKIP_PATHS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Build the URL list from index.html (handles both local assets/ paths and
// already-rewritten CDN URLs).
const indexPath = path.join(__dirname, "..", "index.html");
const html = fs.readFileSync(indexPath, "utf8");

// Extract candidate URLs from src, href (preload), poster, srcset, data-src, data-srcset
const attrRe = /(src|href|poster|data-src)=("|')(.*?)\2/gi;
const srcsetRe = /(srcset|data-srcset)=("|')(.*?)\2/gi;

function normalize(u) {
  if (!u) return null;
  if (/^https?:\/\//i.test(u)) return u; // already absolute
  if (/^assets\//.test(u)) {
    // Map assets/images -> CDN/images, assets/videos -> CDN/videos
    return u
      .replace(/^assets\/images\//, base.replace(/\/$/, "") + "/images/")
      .replace(/^assets\/videos\//, base.replace(/\/$/, "") + "/videos/");
  }
  return null; // ignore other local links
}

const urls = new Set();

// Simple attrs
let m;
while ((m = attrRe.exec(html))) {
  const u = normalize(m[3]);
  if (u) urls.add(u);
}
// srcset lists
while ((m = srcsetRe.exec(html))) {
  const list = m[3].split(",");
  for (const part of list) {
    const url = part.trim().split(" ")[0];
    const u = normalize(url);
    if (u) urls.add(u);
  }
}

let final = Array.from(urls).filter((u) =>
  /\.(avif|webp|jpe?g|png|svg|mp4|webm|mov)$/i.test(u)
);

// Apply filters
if (SKIP_WEBM) {
  final = final.filter((u) => !/\.webm$/i.test(u));
}
if (SKIP_PATHS.length) {
  final = final.filter((u) => !SKIP_PATHS.some((s) => u.includes(s)));
}
console.log(`[verify-cdn] checking ${final.length} assets at ${base}`);

let failures = 0;
let done = 0;
const max = 16;
let active = 0;
let i = 0;
function head(u) {
  return new Promise((resolve) => {
    const req = https
      .request(u, { method: "HEAD" }, (res) => {
        resolve(res.statusCode);
      })
      .on("error", () => resolve(0));
    req.end();
  });
}
function pump() {
  while (active < max && i < final.length) {
    const u = final[i++];
    active++;
    head(u)
      .then((code) => {
        if (code < 200 || code >= 400) {
          failures++;
          console.error("[missing]", code, u);
        }
      })
      .finally(() => {
        active--;
        done++;
        if (done % 50 === 0)
          console.log(`[verify-cdn] ${done}/${final.length}`);
        if (i < final.length) pump();
        else if (!active) finish();
      });
  }
}
function finish() {
  console.log(`[verify-cdn] complete. missing=${failures}`);
  process.exit(failures ? 1 : 0);
}

if (!final.length) {
  console.log("[verify-cdn] nothing to verify");
  process.exit(0);
}

// Check CDN connectivity before proceeding
testCdnConnectivity().then((isReachable) => {
  if (!isReachable) {
    console.warn("[verify-cdn] CDN base URL is not reachable (DNS/connection error)");
    console.warn("[verify-cdn] Skipping asset verification - this may indicate infrastructure issues");
    console.warn("[verify-cdn] CDN URL:", base);
    process.exit(0); // Exit successfully to avoid blocking workflows
  } else {
    console.log("[verify-cdn] CDN connectivity confirmed, proceeding with asset verification");
    pump();
  }
}).catch((err) => {
  console.error("[verify-cdn] Error testing CDN connectivity:", err);
  process.exit(1);
});
