const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

async function ensureDir(p) {
  await fs.promises.mkdir(p, { recursive: true }).catch(() => {});
}

function svg(width, height) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#2ecc71"/>
        <stop offset="50%" stop-color="#f1c40f"/>
        <stop offset="100%" stop-color="#e74c3c"/>
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="100%" height="100%" fill="#111827"/>
    <rect x="60" y="${height / 2 - 40}" width="${
    width - 120
  }" height="80" rx="10" fill="url(#g)"/>
    <text x="50%" y="35%" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif" font-size="${Math.floor(
      width * 0.05
    )}" text-anchor="middle" font-weight="700">Energy Performance Certificate</text>
    <text x="50%" y="65%" fill="#ffffff" opacity="0.9" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif" font-size="${Math.floor(
      width * 0.035
    )}" text-anchor="middle">EPC rating chart placeholder</text>
  </svg>`;
}

async function main() {
  const outDir = path.join(__dirname, "..", "assets", "images", "misc");
  await ensureDir(outDir);
  const width = 1200,
    height = 800;
  const image = sharp(Buffer.from(svg(width, height)));
  await image
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, "epc-graph.png"));
  await image.webp({ quality: 85 }).toFile(path.join(outDir, "epc-graph.webp"));
  await image.avif({ quality: 50 }).toFile(path.join(outDir, "epc-graph.avif"));
  console.log("[gen] Wrote EPC placeholders to", outDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
