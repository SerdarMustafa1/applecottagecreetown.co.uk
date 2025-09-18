#!/usr/bin/env bash
set -euo pipefail

# Apple Cottage – Annex 360° Media Processing & Upload
#
# This script:
#  1. Validates prerequisites (ffmpeg, aws cli)
#  2. Generates poster + still frame from source 360 capture (MOV/MP4/etc)
#  3. Encodes H.264 MP4 + VP9 WebM 360 video variants
#  4. (Optionally) creates responsive still variants
#  5. Uploads all assets to S3 under canonical paths expected by site.config.ts
#  6. (Optionally) invalidates CloudFront distribution cache
#
# Expected target keys (bucket: apple-cottage-media-eu):
#  videos/annex/annex-360.mp4
#  videos/annex/annex-360.webm
#  images/annex/annex-360-poster.jpg
#  images/annex/annex-still-1200.jpg
#
# Usage:
#  AWS_PROFILE=smustafa ./scripts/upload_annex_media.sh --source path/to/raw_annex_360.mov \
#    --bucket apple-cottage-media-eu --distribution E39Y2XKLK15BLJ
#
# Optional flags:
#   --no-upload          Skip S3 upload (just produce files)
#   --no-webm            Skip VP9/WebM encode (faster)
#   --width 3840         Target max width for video (default 3840)
#   --time-offset 3      Seconds into video to grab poster/still (default 3)
#   --invalidate         Perform CloudFront invalidation
#   --responsive-stills  Generate 800/1200/1600 still variants (only 1200 required by config)
#
# Notes:
#  - Script is idempotent: existing output files are not re-encoded unless --force specified.
#  - For very large sources you may downscale with --width 2880 for faster processing.

FORCE=0
DO_UPLOAD=1
DO_WEBM=1
DO_INVALIDATE=0
RESPONSIVE_STILLS=0
WIDTH=3840
TIME_OFFSET=3
SRC=""
BUCKET="apple-cottage-media-eu"
DISTRIBUTION_ID=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source) SRC="$2"; shift 2;;
    --bucket) BUCKET="$2"; shift 2;;
    --distribution) DISTRIBUTION_ID="$2"; shift 2;;
    --width) WIDTH="$2"; shift 2;;
    --time-offset) TIME_OFFSET="$2"; shift 2;;
    --no-upload) DO_UPLOAD=0; shift;;
    --no-webm) DO_WEBM=0; shift;;
    --invalidate) DO_INVALIDATE=1; shift;;
    --responsive-stills) RESPONSIVE_STILLS=1; shift;;
    --force) FORCE=1; shift;;
    -h|--help)
      grep '^# ' "$0" | sed 's/^# //'
      exit 0
      ;;
    *) echo "Unknown arg: $1"; exit 1;;
  esac
done

if [[ -z "$SRC" ]]; then
  echo "ERROR: --source path/to/raw_video required" >&2
  exit 1
fi
if [[ ! -f "$SRC" ]]; then
  echo "ERROR: Source file not found: $SRC" >&2
  exit 1
fi

command -v ffmpeg >/dev/null 2>&1 || { echo "ERROR: ffmpeg not found" >&2; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "ERROR: aws CLI not found" >&2; exit 1; }

OUT_DIR="annex_build"
mkdir -p "$OUT_DIR"

MP4_OUT="$OUT_DIR/annex-360.mp4"
WEBM_OUT="$OUT_DIR/annex-360.webm"
POSTER="$OUT_DIR/annex-360-poster.jpg"
STILL1200="$OUT_DIR/annex-still-1200.jpg"
FRAME_PNG="$OUT_DIR/frame.png"

echo "==> Extracting frame at ${TIME_OFFSET}s"
if [[ ! -f "$FRAME_PNG" || $FORCE -eq 1 ]]; then
  ffmpeg -hide_banner -loglevel error -ss "$TIME_OFFSET" -i "$SRC" -vframes 1 -q:v 2 "$FRAME_PNG"
else
  echo "Skipping frame extraction (exists)"
fi

echo "==> Generating poster (1920w)"
if [[ ! -f "$POSTER" || $FORCE -eq 1 ]]; then
  ffmpeg -hide_banner -loglevel error -i "$FRAME_PNG" -vf "scale=1920:-1" -q:v 3 "$POSTER"
fi

echo "==> Generating still (1200w)"
if [[ ! -f "$STILL1200" || $FORCE -eq 1 ]]; then
  ffmpeg -hide_banner -loglevel error -i "$FRAME_PNG" -vf "scale=1200:-1" -q:v 3 "$STILL1200"
fi

if [[ $RESPONSIVE_STILLS -eq 1 ]]; then
  for w in 800 1600; do
    f="$OUT_DIR/annex-still-${w}.jpg"
    if [[ ! -f "$f" || $FORCE -eq 1 ]]; then
      echo "==> Generating still ${w}w"
      ffmpeg -hide_banner -loglevel error -i "$FRAME_PNG" -vf "scale=${w}:-1" -q:v 3 "$f"
    fi
  done
fi

echo "==> Encoding MP4 (H.264 width=${WIDTH})"
if [[ ! -f "$MP4_OUT" || $FORCE -eq 1 ]]; then
  ffmpeg -hide_banner -loglevel error -i "$SRC" -vf "scale=${WIDTH}:-2" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 128k "$MP4_OUT"
fi

if [[ $DO_WEBM -eq 1 ]]; then
  echo "==> Encoding WebM (VP9 width=${WIDTH})"
  if [[ ! -f "$WEBM_OUT" || $FORCE -eq 1 ]]; then
    ffmpeg -hide_banner -loglevel error -i "$SRC" -vf "scale=${WIDTH}:-2" -c:v libvpx-vp9 -b:v 0 -crf 32 -row-mt 1 -pix_fmt yuv420p -an "$WEBM_OUT"
  fi
else
  echo "Skipping WebM encode (--no-webm)"
fi

if [[ $DO_UPLOAD -eq 1 ]]; then
  echo "==> Uploading to s3://${BUCKET}"
  aws s3 cp "$MP4_OUT"  "s3://${BUCKET}/videos/annex/annex-360.mp4"  --acl public-read
  if [[ $DO_WEBM -eq 1 ]]; then
    aws s3 cp "$WEBM_OUT" "s3://${BUCKET}/videos/annex/annex-360.webm" --acl public-read
  fi
  aws s3 cp "$POSTER"   "s3://${BUCKET}/images/annex/annex-360-poster.jpg" --acl public-read
  aws s3 cp "$STILL1200" "s3://${BUCKET}/images/annex/annex-still-1200.jpg" --acl public-read
  if [[ $RESPONSIVE_STILLS -eq 1 ]]; then
    for w in 800 1600; do
      f="$OUT_DIR/annex-still-${w}.jpg"
      [[ -f "$f" ]] && aws s3 cp "$f" "s3://${BUCKET}/images/annex/annex-still-${w}.jpg" --acl public-read || true
    done
  fi
else
  echo "Skipping upload (--no-upload)"
fi

if [[ $DO_INVALIDATE -eq 1 ]]; then
  if [[ -z "$DISTRIBUTION_ID" ]]; then
    echo "--invalidate specified but --distribution missing" >&2
  else
    echo "==> Creating CloudFront invalidation"
    aws cloudfront create-invalidation \
      --distribution-id "$DISTRIBUTION_ID" \
      --paths "/videos/annex/annex-360.mp4" \
              "/videos/annex/annex-360.webm" \
              "/images/annex/annex-360-poster.jpg" \
              "/images/annex/annex-still-1200.jpg" >/dev/null
    echo "CloudFront invalidation requested."
  fi
fi

echo "==> Done"
echo "Outputs in: $OUT_DIR"
echo "Verify CDN accessibility after a few minutes (or on invalidation completion)."
