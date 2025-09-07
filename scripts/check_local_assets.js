#!/usr/bin/env node
// Parse index.html for local asset references under assets/images and assets/videos
// and report which files are missing locally, grouped by category.

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const indexPath = path.join(root, "index.html");
const html = fs.readFileSync(indexPath, "utf8");

const attrRe = /(src|href|poster|data-src)=\s*("|')(.*?)\2/gi;
const srcsetRe = /(srcset|data-srcset)=\s*("|')(.*?)\2/gi;

function norm(u) {
  if (!u) return null;
  if (/^assets\//.test(u)) return u; // keep as-is
  return null;
}

const urls = new Set();
let m;
while ((m = attrRe.exec(html))) {
  const u = norm(m[3]);
  if (u) urls.add(u);
}
while ((m = srcsetRe.exec(html))) {
  m[3].split(",").forEach((part) => {
    const u = norm(part.trim().split(" ")[0]);
    if (u) urls.add(u);
  });
}

const list = Array.from(urls).filter((u) =>
  /\.(avif|webp|jpe?g|png|svg|mp4|webm|mov)$/i.test(u)
);

const byCat = new Map();
for (const rel of list) {
  // We only care about images under assets/images and videos under assets/videos
  if (!/^assets\/(images|videos)\//.test(rel)) continue;
  const abs = path.join(root, rel);
  const exists = fs.existsSync(abs);
  const cat = rel.split("/").slice(0, 3).join("/"); // e.g., assets/images/exterior
  if (!byCat.has(cat)) byCat.set(cat, []);
  if (!exists) byCat.get(cat).push(rel);
}

let totalMissing = 0;
for (const [cat, files] of byCat) {
  if (!files.length) continue;
  console.log(`\n[missing] ${cat} -> ${files.length} files`);
  files.slice(0, 50).forEach((f) => console.log("  -", f));
  if (files.length > 50) console.log(`  ... +${files.length - 50} more`);
  totalMissing += files.length;
}

if (totalMissing === 0) {
  console.log("[check-local] All referenced local assets exist.");
} else {
  console.log(`\n[check-local] Missing local assets: ${totalMissing}`);
  console.log(
    "[check-local] Create the folders if needed (exterior/interior/locations/misc) and drop originals there."
  );
  console.log("[check-local] Then run:");
  console.log(
    "  - python3 scripts/generate_responsive_images.py   # to build 480/800/1200 variants"
  );
  console.log(
    "  - ./scripts/media_push.sh --videos-dir assets/videos/interior --images-dir assets/images --bucket apple-cottage-media-eu --region eu-west-1 --distribution-id E39Y2XKLK15BLJ --profile smustafa"
  );
}
