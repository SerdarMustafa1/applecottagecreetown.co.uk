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
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#f8fafc"/>
        <stop offset="100%" stop-color="#e2e8f0"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" stroke-width="1" opacity="0.3"/>
      </pattern>
    </defs>
    
    <!-- Background -->
    <rect x="0" y="0" width="100%" height="100%" fill="url(#bg)"/>
    <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)"/>
    
    <!-- Border -->
    <rect x="40" y="40" width="${width - 80}" height="${height - 80}" 
          fill="none" stroke="#475569" stroke-width="3"/>
    
    <!-- Title Block -->
    <rect x="60" y="60" width="240" height="80" fill="#ffffff" stroke="#475569" stroke-width="1"/>
    <text x="180" y="85" fill="#1e293b" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif" 
          font-size="14" text-anchor="middle" font-weight="600">TITLE PLAN</text>
    <text x="180" y="105" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif" 
          font-size="12" text-anchor="middle">Apple Cottage</text>
    <text x="180" y="125" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif" 
          font-size="12" text-anchor="middle">Silver Street, Creetown</text>
    
    <!-- Property outline (simplified house shape) -->
    <g transform="translate(${width/2 - 150}, ${height/2 - 80})">
      <!-- Main house rectangle -->
      <rect x="0" y="20" width="200" height="120" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
      
      <!-- Roof -->
      <polygon points="0,20 100,0 200,20" fill="#dc2626" stroke="#991b1b" stroke-width="2"/>
      
      <!-- Extension -->
      <rect x="200" y="40" width="80" height="80" fill="#ddd6fe" stroke="#7c3aed" stroke-width="2"/>
      
      <!-- Annex (separate building) -->
      <rect x="60" y="160" width="60" height="40" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
      
      <!-- Labels -->
      <text x="100" y="85" fill="#1e293b" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif" 
            font-size="10" text-anchor="middle" font-weight="500">MAIN HOUSE</text>
      <text x="240" y="85" fill="#1e293b" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif" 
            font-size="9" text-anchor="middle" font-weight="500">EXTENSION</text>
      <text x="90" y="185" fill="#1e293b" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif" 
            font-size="9" text-anchor="middle" font-weight="500">ANNEX</text>
    </g>
    
    <!-- Scale and measurements -->
    <text x="60" y="${height - 60}" fill="#475569" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif" 
          font-size="12" font-weight="500">Approx. plot size: 0.13 acres (≈ 532 m²)</text>
    <text x="60" y="${height - 40}" fill="#64748b" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif" 
          font-size="11">Based on title deeds and land registry records</text>
    
    <!-- North arrow -->
    <g transform="translate(${width - 120}, 80)">
      <circle cx="20" cy="20" r="18" fill="#ffffff" stroke="#475569" stroke-width="1"/>
      <polygon points="20,8 24,16 20,14 16,16" fill="#ef4444"/>
      <polygon points="20,32 16,24 20,26 24,24" fill="#64748b"/>
      <text x="20" y="6" fill="#1e293b" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif" 
            font-size="8" text-anchor="middle" font-weight="600">N</text>
    </g>
  </svg>`;
}

async function main() {
  const outDir = path.join(__dirname, "..", "assets", "images", "misc");
  await ensureDir(outDir);
  const width = 800,
    height = 600;
  const image = sharp(Buffer.from(svg(width, height)));
  await image
    .png({ compressionLevel: 9 })
    .toFile(path.join(outDir, "title-plan.png"));
  await image.webp({ quality: 85 }).toFile(path.join(outDir, "title-plan.webp"));
  await image.avif({ quality: 50 }).toFile(path.join(outDir, "title-plan.avif"));
  console.log("[gen] Wrote title plan placeholders to", outDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});