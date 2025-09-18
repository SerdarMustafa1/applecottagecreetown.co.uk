import { fileURLToPath } from 'node:url';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import pngToIco from 'png-to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const publicDir = path.join(projectRoot, 'public');
const iconsDir = path.join(publicDir, 'icons');

async function ensureDir(dir) {
  await mkdir(dir, { recursive: true });
}

async function generatePngVariants(sourceSvgPath, outputs) {
  const svgBuffer = await readFile(sourceSvgPath);
  return Promise.all(
    outputs.map(async ({ size, destination, fit = 'contain', background = { r: 0, g: 0, b: 0, alpha: 0 } }) => {
      const buffer = await sharp(svgBuffer)
        .resize(size, size, { fit, background })
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer();
      await ensureDir(path.dirname(destination));
      await writeFile(destination, buffer);
    })
  );
}

async function generateFavicon(svgPath, outputPath) {
  const svgBuffer = await readFile(svgPath);
  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    sizes.map((size) =>
      sharp(svgBuffer)
        .resize(size, size, { fit: 'cover' })
        .png({ compressionLevel: 9, adaptiveFiltering: true })
        .toBuffer()
    )
  );
  const icoBuffer = await pngToIco(pngBuffers);
  await writeFile(outputPath, icoBuffer);
}

async function main() {
  const primarySvg = path.join(iconsDir, 'pwa-icon.svg');
  const maskableSvg = path.join(iconsDir, 'pwa-icon-maskable.svg');

  await Promise.all([
    generatePngVariants(primarySvg, [
      { size: 192, destination: path.join(iconsDir, 'icon-192.png') },
      { size: 512, destination: path.join(iconsDir, 'icon-512.png') },
      { size: 1024, destination: path.join(iconsDir, 'icon-1024.png') },
      { size: 256, destination: path.join(publicDir, 'favicon.png') },
      { size: 180, destination: path.join(publicDir, 'apple-touch-icon.png'), fit: 'cover', background: { r: 255, g: 255, b: 255, alpha: 1 } }
    ]),
    generatePngVariants(maskableSvg, [
      { size: 192, destination: path.join(iconsDir, 'maskable-icon-192.png'), fit: 'cover', background: { r: 47, g: 186, b: 138, alpha: 1 } },
      { size: 512, destination: path.join(iconsDir, 'maskable-icon-512.png'), fit: 'cover', background: { r: 47, g: 186, b: 138, alpha: 1 } },
      { size: 1024, destination: path.join(iconsDir, 'maskable-icon-1024.png'), fit: 'cover', background: { r: 47, g: 186, b: 138, alpha: 1 } }
    ]),
    generateFavicon(primarySvg, path.join(publicDir, 'favicon.ico'))
  ]);
}

main().catch((error) => {
  console.error('Failed to generate PWA assets', error);
  process.exitCode = 1;
});
