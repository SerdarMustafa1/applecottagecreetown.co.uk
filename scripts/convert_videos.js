/*
  Build-time converter for 360 videos.
  Scans assets/videos/interior for *.mov/*.mp4 and ensures mp4 + webm outputs
  with friendly names: kitchen-360.(mp4|webm), sunroom-360.(mp4|webm)
*/
const path = require('path');
const fs = require('fs');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffprobePath = require('@ffprobe-installer/ffprobe').path;
const ffmpeg = require('fluent-ffmpeg');
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const VID_DIR = path.join(__dirname, '..', 'assets', 'videos', 'interior');
const targets = [
  { base: 'kitchen-360', sources: ['kitchen-360.mov', 'kitchen-360.mp4'] },
  { base: 'sunroom-360', sources: ['sunroom-360.mov', 'sunroom-360.mp4'] }
];

function exists(p) { try { fs.accessSync(p); return true; } catch { return false; } }

function convert(input, out, codecArgs) {
  return new Promise((resolve, reject) => {
    console.log(`[ffmpeg] ${path.basename(input)} -> ${path.basename(out)}`);
    const cmd = ffmpeg(input)
      .outputOptions(codecArgs)
      .on('error', reject)
      .on('end', resolve)
      .save(out);
  });
}

async function ensureOutputs(base, input) {
  const mp4 = path.join(VID_DIR, `${base}.mp4`);
  const webm = path.join(VID_DIR, `${base}.webm`);
  if (!exists(input)) return;
  // MP4 (H.264 + AAC)
  if (!exists(mp4)) {
    await convert(input, mp4, [
      '-c:v libx264',
      '-preset veryfast',
      '-crf 22',
      '-pix_fmt yuv420p',
      '-movflags +faststart',
      '-c:a aac',
      '-b:a 128k'
    ]);
  }
  // WebM (VP9 + Opus)
  if (!exists(webm)) {
    await convert(input, webm, [
      '-c:v libvpx-vp9',
      '-b:v 0',
      '-crf 32',
      '-row-mt 1',
      '-c:a libopus',
      '-b:a 96k'
    ]);
  }
}

(async () => {
  try {
    if (!exists(VID_DIR)) { console.log('[videos] directory not found, skipping'); return; }
    for (const t of targets) {
      const input = t.sources.map(s => path.join(VID_DIR, s)).find(exists);
      if (!input) { console.log(`[videos] no source for ${t.base}, skipping`); continue; }
      await ensureOutputs(t.base, input);
    }
    console.log('[videos] conversion complete');
  } catch (err) {
    console.error('[videos] conversion failed:', err && err.message ? err.message : err);
    // Do not fail the whole Netlify build
    process.exit(0);
  }
})();

