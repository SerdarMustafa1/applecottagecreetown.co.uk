#!/usr/bin/env bash
set -euo pipefail

# Transcode a source video into:
# - Poster JPEG
# - Progressive MP4 (1080p, 2160p)
# - Progressive WebM (1080p)
# - HLS variants (720p, 1080p, 2160p) + master playlist
#
# Usage:
#   scripts/transcode_b4a.sh /path/to/b4a.mov ./dist/b4a
#
# Requirements:
#   - ffmpeg installed

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Error: ffmpeg is not installed.\nInstall via: brew install ffmpeg (macOS)" >&2
  exit 1
fi

SRC=${1:-}
OUT=${2:-}

if [[ -z "$SRC" || -z "$OUT" ]]; then
  echo "Usage: $0 <source.mov> <output_dir>" >&2
  exit 1
fi

mkdir -p "$OUT/hls"

echo "Generating poster..."
ffmpeg -y -ss 00:00:03 -i "$SRC" -frames:v 1 -q:v 2 "$OUT/b4a-poster.jpg"

echo "Encoding MP4 1080p..."
ffmpeg -y -i "$SRC" -vf "scale=-2:1080" -c:v libx264 -preset slow -crf 20 -c:a aac -b:a 160k "$OUT/b4a-1080p.mp4"

echo "Encoding MP4 2160p (4K)..."
ffmpeg -y -i "$SRC" -vf "scale=-2:2160" -c:v libx264 -preset slow -crf 20 -c:a aac -b:a 192k "$OUT/b4a-2160p.mp4"

echo "Encoding WebM 1080p (VP9)..."
ffmpeg -y -i "$SRC" -vf "scale=-2:1080" -c:v libvpx-vp9 -crf 30 -b:v 0 -row-mt 1 -c:a libopus -b:a 128k "$OUT/b4a-1080p.webm"

echo "Creating HLS renditions..."
# 720p
ffmpeg -y -i "$SRC" -vf "scale=-2:720" -c:v libx264 -crf 21 -preset slow -c:a aac -b:a 128k \
  -hls_time 6 -hls_playlist_type vod -hls_segment_filename "$OUT/hls/720p_%03d.ts" "$OUT/hls/720p.m3u8"
# 1080p
ffmpeg -y -i "$SRC" -vf "scale=-2:1080" -c:v libx264 -crf 20 -preset slow -c:a aac -b:a 160k \
  -hls_time 6 -hls_playlist_type vod -hls_segment_filename "$OUT/hls/1080p_%03d.ts" "$OUT/hls/1080p.m3u8"
# 2160p
ffmpeg -y -i "$SRC" -vf "scale=-2:2160" -c:v libx264 -crf 20 -preset slow -c:a aac -b:a 192k \
  -hls_time 6 -hls_playlist_type vod -hls_segment_filename "$OUT/hls/2160p_%03d.ts" "$OUT/hls/2160p.m3u8"

echo "Writing HLS master playlist..."
cat > "$OUT/hls/master.m3u8" <<EOF
#EXTM3U
#EXT-X-VERSION:3
#EXT-X-STREAM-INF:BANDWIDTH=2500000,RESOLUTION=1280x720
720p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=16000000,RESOLUTION=3840x2160
2160p.m3u8
EOF

echo "Done. Outputs in: $OUT"
echo "Next: upload $OUT/* to S3/CloudFront and set URLs in site.config.ts > beforeAfterVideo."

