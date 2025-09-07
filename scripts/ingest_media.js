/*
 Ingest media from a local folder (recursively) into the site assets.
 - Detect 360 videos (*.mp4 with '360' in the name) -> copy to assets/videos/interior
   (conversion handled by scripts/convert_videos.js at build time)
 - Detect panoramic photos (equirectangular 2:1 images) -> resize to max 4096w JPG + WEBP, copy to assets/images/panos, generate data/panos.json manifest
 - Detect regular stills (JPG/PNG/HEIC) -> copy to assets/images/new and produce 800/1200 AVIF/WEBP/JPG variants for gallery use

 Usage:
   node scripts/ingest_media.js \
     --src "/Users/you/Downloads/Apple-Cottage-Media" \
     [--videos-dir assets/videos/interior] [--images-dir assets/images]
*/
const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const sharp = require("sharp");

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {
    src: null,
    videosDir: "assets/videos/interior",
    imagesDir: "assets/images",
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--src") out.src = args[++i];
    else if (args[i] === "--videos-dir") out.videosDir = args[++i];
    else if (args[i] === "--images-dir") out.imagesDir = args[++i];
  }
  if (!out.src) {
    console.error("[ingest] --src PATH is required");
    process.exit(2);
  }
  return out;
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}
function isImage(fn) {
  return /\.(jpe?g|png|webp|heic|heif)$/i.test(fn);
}
function isVideo(fn) {
  return /\.(mp4|mov|webm)$/i.test(fn);
}
function looksPano(meta) {
  return (
    meta &&
    meta.width &&
    meta.height &&
    Math.abs(meta.width / meta.height - 2) < 0.05
  ); // ~2:1
}

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

async function copyFile(src, dst) {
  ensureDir(path.dirname(dst));
  await fs.promises.copyFile(src, dst);
}

async function run() {
  const { src, videosDir, imagesDir } = parseArgs();
  const root = path.resolve(src);
  const vidsOut = path.resolve(path.join(process.cwd(), videosDir));
  const imgsOut = path.resolve(path.join(process.cwd(), imagesDir));
  const panosOut = path.join(imgsOut, "panos");
  const newOut = path.join(imgsOut, "new");
  const panosManifestPath = path.join(process.cwd(), "data", "panos.json");
  ensureDir(vidsOut);
  ensureDir(panosOut);
  ensureDir(newOut);
  ensureDir(path.dirname(panosManifestPath));

  const panos = [];
  let copiedVideos = 0,
    copiedPhotos = 0,
    panosCount = 0;

  for await (const file of walk(root)) {
    const base = path.basename(file);
    if (isVideo(base)) {
      // Consider 360 video if name contains '360'
      if (!/360/i.test(base)) continue; // skip non-360 videos
      const name = base.toLowerCase().replace(/\s+/g, "-");
      const out = path.join(vidsOut, name);
      await copyFile(file, out);
      copiedVideos++;
      continue;
    }
    if (isImage(base)) {
      // Get metadata via sharp
      try {
        const img = sharp(file);
        const meta = await img.metadata();
        if (looksPano(meta)) {
          // Pano: normalize name
          const stem = path
            .basename(base, path.extname(base))
            .toLowerCase()
            .replace(/\s+/g, "-");
          const outStem = stem.replace(/[^a-z0-9\-]+/g, "");
          const outJpg = path.join(panosOut, `${outStem}.jpg`);
          const outWebp = path.join(panosOut, `${outStem}.webp`);
          ensureDir(path.dirname(outJpg));
          // Resize to max 4096 width
          await img
            .clone()
            .rotate()
            .resize({ width: 4096, withoutEnlargement: true })
            .jpeg({ quality: 82 })
            .toFile(outJpg);
          await img
            .clone()
            .rotate()
            .resize({ width: 4096, withoutEnlargement: true })
            .webp({ quality: 82 })
            .toFile(outWebp);
          panos.push({
            title: stem
              .replace(/[-_]/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase()),
            srcJpg: path.relative(process.cwd(), outJpg),
            srcWebp: path.relative(process.cwd(), outWebp),
          });
          panosCount++;
        } else {
          // Regular still: produce sizes 800/1200 for JPG/WEBP/AVIF
          const stem = path
            .basename(base, path.extname(base))
            .toLowerCase()
            .replace(/\s+/g, "-");
          const sizes = [800, 1200];
          for (const w of sizes) {
            const baseOut = path.join(newOut, `${stem}-${w}`);
            await img
              .clone()
              .rotate()
              .resize({ width: w, withoutEnlargement: true })
              .jpeg({ quality: 84 })
              .toFile(baseOut + ".jpg");
            await img
              .clone()
              .rotate()
              .resize({ width: w, withoutEnlargement: true })
              .webp({ quality: 84 })
              .toFile(baseOut + ".webp");
            try {
              await img
                .clone()
                .rotate()
                .resize({ width: w, withoutEnlargement: true })
                .avif({ quality: 50 })
                .toFile(baseOut + ".avif");
            } catch (_) {}
          }
          copiedPhotos++;
        }
      } catch (e) {
        console.warn(
          "[ingest] image skipped:",
          file,
          e && e.message ? e.message : e
        );
      }
    }
  }

  // Write manifest
  await fs.promises.writeFile(
    panosManifestPath,
    JSON.stringify({ items: panos }, null, 2)
  );
  console.log(
    `[ingest] done. videos=${copiedVideos}, panos=${panosCount}, stills=${copiedPhotos}`
  );
}

run().catch((err) => {
  console.error("[ingest] failed:", err && err.message ? err.message : err);
  process.exit(1);
});
