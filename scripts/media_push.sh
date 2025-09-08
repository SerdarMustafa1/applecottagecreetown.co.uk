#!/usr/bin/env bash

# Encode missing 360 video variants (mp4/webm) from .mov, upload media to S3,
# and invalidate CloudFront. Defaults for your setup:
# - profile: smustafa
# - region: eu-west-1
# - bucket: apple-cottage-media-eu
# - distro: E39Y2XKLK15BLJ
set -euo pipefail

PROFILE="smustafa"
REGION="eu-west-1"
BUCKET="apple-cottage-media-eu"
DISTRIBUTION_ID="E39Y2XKLK15BLJ"
VIDEOS_DIR=""
IMAGES_DIR=""
SKIP_POSTER="no"
BASENAMES=(
  kitchen-360
  bathroom-360
  bedroom-2-360
  rear-bedroom-360
  front-bedroom-360
  lounge-360
  conservatory-360
)
MAKE_WEBM="yes"

usage() {
  cat << EOF
Usage: $0 [options]
  --bucket NAME           S3 bucket name (default: $BUCKET)
  --distribution-id ID    CloudFront distribution ID (default: $DISTRIBUTION_ID)
  --profile NAME          AWS CLI profile (default: $PROFILE)
  --region NAME           AWS region (default: $REGION)
  --videos-dir PATH       Local dir containing 360 videos (MOV/MP4/WEBM)
  --images-dir PATH       Optional local dir to sync images (to s3://BUCKET/images)
  --skip-poster           Skip generating poster JPGs
  --skip-webm             Skip generating WebM files (MP4 only)
  -h, --help              Show this help

Examples:
  $0 --videos-dir /path/to/360videos
  $0 --videos-dir ~/Media/360 --images-dir ~/site-assets/images
EOF
}

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --bucket) BUCKET="$2"; shift 2;;
    --distribution-id) DISTRIBUTION_ID="$2"; shift 2;;
    --profile) PROFILE="$2"; shift 2;;
    --region) REGION="$2"; shift 2;;
    --videos-dir) VIDEOS_DIR="$2"; shift 2;;
    --images-dir) IMAGES_DIR="$2"; shift 2;;
  --skip-poster) SKIP_POSTER="yes"; shift;;
    --skip-webm) MAKE_WEBM="no"; shift;;
    -h|--help) usage; exit 0;;
    *) echo "Unknown option: $1"; usage; exit 1;;
  esac
done

if [[ -z "${VIDEOS_DIR}" || ! -d "${VIDEOS_DIR}" ]]; then
  echo "Error: --videos-dir is required and must exist" >&2
  exit 2
fi

AWS=(aws --profile "$PROFILE" --region "$REGION")

# Resolve ffmpeg binary: prefer system, else use @ffmpeg-installer/ffmpeg from node_modules
FFMPEG_BIN=""
if command -v ffmpeg >/dev/null 2>&1; then
  FFMPEG_BIN="$(command -v ffmpeg)"
else
  # Try node-provided ffmpeg
  if command -v node >/dev/null 2>&1; then
    FFMPEG_BIN="$(node -e "try{console.log(require('@ffmpeg-installer/ffmpeg').path)}catch(e){process.exit(1)}" 2>/dev/null || true)"
  fi
fi
have_ffmpeg() { [[ -n "$FFMPEG_BIN" ]] && [[ -x "$FFMPEG_BIN" || -f "$FFMPEG_BIN" ]]; }

encode_mp4() {
  local in="$1" out="$2"
  echo "[encode] mp4: $in -> $out"
  "$FFMPEG_BIN" -y -i "$in" \
    -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart \
    -c:a aac -b:a 128k "$out"
}

encode_webm() {
  local in="$1" out="$2"
  echo "[encode] webm: $in -> $out"
  "$FFMPEG_BIN" -y -i "$in" \
    -c:v libvpx-vp9 -b:v 0 -crf 28 -speed 0 -row-mt 1 \
    -c:a libopus -b:a 96k "$out"
}

extract_poster() {
  local video="$1" out="$2"
  echo "[poster] $video -> $out"
  "$FFMPEG_BIN" -y -ss 2 -i "$video" -frames:v 1 -q:v 2 "$out"
}

upload() {
  local src="$1" dst="$2"
  echo "[upload] $src -> $dst"
  "${AWS[@]}" s3 cp "$src" "$dst" \
    --cache-control "public,max-age=31536000"
}

sync_images() {
  local dir="$1"
  echo "[sync] images (safe): $dir -> s3://$BUCKET/images"
  # Sync known subfolders (no delete)
  local subs=(panos new exterior interior locations misc)
  local found_any="no"
  for sub in "${subs[@]}"; do
    if [[ -d "$dir/$sub" ]]; then
      found_any="yes"
      "${AWS[@]}" s3 sync "$dir/$sub" "s3://$BUCKET/images/$sub" \
        --cache-control "public,max-age=31536000,immutable" \
        --exclude "*.DS_Store"
    fi
  done
  # Fallback: sync the directory root (no delete) if none of the known subs exist
  if [[ "$found_any" == "no" ]]; then
    "${AWS[@]}" s3 sync "$dir" "s3://$BUCKET/images" \
      --cache-control "public,max-age=31536000,immutable" \
      --exclude "*.DS_Store"
  fi
}

# 1) Optional: sync images
if [[ -n "${IMAGES_DIR}" && -d "${IMAGES_DIR}" ]]; then
  sync_images "$IMAGES_DIR"
fi

# 2) Videos: ensure mp4 (+webm) exist locally; upload MOV/MP4/WEBM; upload poster
for base in "${BASENAMES[@]}"; do
  # We expect files named like kitchen-360.* in VIDEOS_DIR
  mov="$VIDEOS_DIR/${base}.mov"
  mp4="$VIDEOS_DIR/${base}.mp4"
  webm="$VIDEOS_DIR/${base}.webm"

  # Create MP4 (from MOV) if missing
  if [[ ! -f "$mp4" && -f "$mov" ]]; then
    if have_ffmpeg; then
      encode_mp4 "$mov" "$mp4"
    else
      echo "[warn] ffmpeg not installed; skipping mp4 for $base"
    fi
  fi

  # Create WebM (from MOV or MP4) if requested
  if [[ "$MAKE_WEBM" == "yes" && ! -f "$webm" ]]; then
    src=""
    if [[ -f "$mov" ]]; then src="$mov"; elif [[ -f "$mp4" ]]; then src="$mp4"; fi
    if [[ -n "$src" ]]; then
      if have_ffmpeg; then
        encode_webm "$src" "$webm"
      else
        echo "[warn] ffmpeg not installed; skipping webm for $base"
      fi
    fi
  fi

  # Upload available variants
  for f in "$mov" "$mp4" "$webm"; do
    [[ -f "$f" ]] || continue
    upload "$f" "s3://$BUCKET/videos/interior/$(basename "$f")"
  done

  # Poster generation (prefer MP4/MOV present locally)
  poster_local="$VIDEOS_DIR/${base}-poster.jpg"
  if [[ "$SKIP_POSTER" != "yes" && -z "${FFMPEG_DISABLED:-}" ]]; then
    if have_ffmpeg; then
      if [[ ! -f "$poster_local" ]]; then
        if [[ -f "$mp4" ]]; then
          extract_poster "$mp4" "$poster_local"
        elif [[ -f "$mov" ]]; then
          extract_poster "$mov" "$poster_local"
        fi
      fi
    else
      echo "[warn] ffmpeg not installed; skipping poster for $base"
    fi
  fi
  if [[ -f "$poster_local" ]]; then
    upload "$poster_local" "s3://$BUCKET/images/interior/${base}-poster.jpg"
  fi
done

# 3) Invalidate CloudFront (paths limited to videos/images prefixes)
echo "[cf] invalidating /images/* and /videos/* on $DISTRIBUTION_ID"
"${AWS[@]}" cloudfront create-invalidation \
  --distribution-id "$DISTRIBUTION_ID" \
  --paths "/images/*" "/videos/*" >/dev/null

echo "[done] Upload and invalidation complete."
echo "Now set MEDIA_BASE_URL=https://d1t6lpjdsu4646.cloudfront.net in Netlify (if not already), redeploy,"
echo "then run: MEDIA_BASE_URL=https://d1t6lpjdsu4646.cloudfront.net npm run verify-cdn"
