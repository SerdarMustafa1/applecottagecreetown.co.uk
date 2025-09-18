#!/usr/bin/env bash
set -euo pipefail

# Apple Cottage – Annex Office Image Processing & Upload
#
# Purpose:
#  Process a raw annex office JPEG (or any image) into canonical hashed naming form
#  annex-office-<HASH>.jpg plus responsive variants, upload to S3, optionally update
#  site.config.ts (when rolling hash), optionally invalidate CloudFront, and optionally
#  remove the original local source in public/.
#
# Conventions already in codebase:
#  Existing reference pattern: /images/exterior/annex-office-XXXXXXXX.jpg
#  (8 uppercase hex chars). site.config.ts currently references one hashed variant.
#
# Requirements:
#  - macOS 'sips' OR ImageMagick 'convert' OR ffmpeg (at least one scaler)
#  - md5 (macOS) or md5sum (Linux)
#  - aws cli configured with profile (e.g. AWS_PROFILE=smustafa)
#
# Usage Examples:
#  Basic (reuse existing hash if present):
#    AWS_PROFILE=smustafa ./scripts/process_annex_office_image.sh \
#      --source public/IMG_20250918_092921_562.jpeg \
#      --bucket apple-cottage-media-eu --distribution E39Y2XKLK15BLJ --invalidate
#
#  Force new rolling hash & update site.config.ts:
#    AWS_PROFILE=smustafa ROLLING_HASH=1 ./scripts/process_annex_office_image.sh \
#      --source public/IMG_20250918_092921_562.jpeg --rolling-hash --update-config \
#      --bucket apple-cottage-media-eu --distribution E39Y2XKLK15BLJ --invalidate
#
#  Remove source after successful upload:
#    AWS_PROFILE=smustafa ./scripts/process_annex_office_image.sh --source public/raw.jpg --remove-source

SRC=""
BUCKET="apple-cottage-media-eu"
REGION="eu-west-1"
DISTRIBUTION=""
DO_INVALIDATE=0
ROLLING_HASH=${ROLLING_HASH:-0}
UPDATE_CONFIG=0
REMOVE_SOURCE=0
PROFILE_ARGS="${AWS_PROFILE:+--profile $AWS_PROFILE}"
OUT_DIR="tmp/annex_office_image"
mkdir -p "$OUT_DIR"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source) SRC="$2"; shift 2;;
    --bucket) BUCKET="$2"; shift 2;;
    --region) REGION="$2"; shift 2;;
    --distribution) DISTRIBUTION="$2"; shift 2;;
    --invalidate) DO_INVALIDATE=1; shift;;
    --rolling-hash) ROLLING_HASH=1; shift;;
    --update-config) UPDATE_CONFIG=1; shift;;
    --remove-source) REMOVE_SOURCE=1; shift;;
    -h|--help)
      grep '^# ' "$0" | sed 's/^# //'; exit 0;;
    *) echo "Unknown argument: $1" >&2; exit 1;;
  esac
done

if [[ -z "$SRC" ]]; then
  echo "ERROR: --source path required" >&2; exit 1; fi
if [[ ! -f "$SRC" ]]; then
  echo "ERROR: Source not found: $SRC" >&2; exit 1; fi

# Hash function (macOS md5 or Linux md5sum)
calc_hash() {
  if command -v md5 >/dev/null 2>&1; then
    md5 -q "$1" | cut -c1-8 | tr '[:lower:]' '[:upper:]'
  else
    md5sum "$1" | awk '{print $1}' | cut -c1-8 | tr '[:lower:]' '[:upper:]'
  fi
}

IMG_HASH=$(calc_hash "$SRC")

# Determine existing annex-office hash in site.config.ts if reusing
if [[ $ROLLING_HASH -eq 0 ]]; then
  EXISTING=$(grep -Eo '/images/exterior/annex-office-[A-F0-9]{8}\.jpg' site.config.ts | head -n1 || true)
  if [[ -n "$EXISTING" ]]; then
    BASENAME=$(basename "$EXISTING" .jpg)
  else
    BASENAME="annex-office-${IMG_HASH}"
  fi
else
  BASENAME="annex-office-${IMG_HASH}"
fi

PRIMARY_JPG="$OUT_DIR/${BASENAME}.jpg"

# Convert to JPEG (strip metadata) and generate responsive sizes 400/800/1200
copy_and_normalize() {
  local src="$1" dest="$2"
  if command -v sips >/dev/null 2>&1; then
    sips -s format jpeg "$src" --out "$dest" >/dev/null
  elif command -v convert >/dev/null 2>&1; then
    convert "$src" -strip -quality 90 "$dest"
  else
    # Fallback ffmpeg
    ffmpeg -hide_banner -loglevel error -y -i "$src" -q:v 3 "$dest"
  fi
}

resize_width() {
  local src="$1" width="$2" dest="$3"
  if command -v sips >/dev/null 2>&1; then
    sips -Z "$width" "$src" --out "$dest" >/dev/null
  elif command -v convert >/dev/null 2>&1; then
    convert "$src" -resize ${width}x -quality 85 "$dest"
  else
    ffmpeg -hide_banner -loglevel error -y -i "$src" -vf "scale=${width}:-1" -q:v 4 "$dest"
  fi
}

copy_and_normalize "$SRC" "$PRIMARY_JPG"

for W in 400 800 1200; do
  resize_width "$PRIMARY_JPG" "$W" "$OUT_DIR/${BASENAME}-${W}.jpg"
done

# Overwrite primary with 1200 width (canonical referenced size)
cp "$OUT_DIR/${BASENAME}-1200.jpg" "$PRIMARY_JPG"

echo "Prepared variants: $BASENAME-[400|800|1200].jpg"

S3_DIR="images/exterior"
PRIMARY_KEY="$S3_DIR/${BASENAME}.jpg"

echo "Uploading to s3://$BUCKET/$PRIMARY_KEY"
aws s3 cp "$PRIMARY_JPG" "s3://$BUCKET/$PRIMARY_KEY" $PROFILE_ARGS --region "$REGION"

# Upload additional variants (optional future responsive use)
for W in 400 800 1200; do
  aws s3 cp "$OUT_DIR/${BASENAME}-${W}.jpg" "s3://$BUCKET/$S3_DIR/${BASENAME}-${W}.jpg" $PROFILE_ARGS --region "$REGION" || true
done

if [[ $ROLLING_HASH -eq 1 && $UPDATE_CONFIG -eq 1 ]]; then
  # Replace existing hashed reference in site.config.ts
  sed -i.bak -E "s#annex-office-[A-F0-9]{8}#${BASENAME}#g" site.config.ts || true
  echo "site.config.ts updated with new annex office image hash: $BASENAME"
fi

if [[ $DO_INVALIDATE -eq 1 && -n "$DISTRIBUTION" ]]; then
  echo "Creating CloudFront invalidation for /$PRIMARY_KEY and variants"
  aws cloudfront create-invalidation $PROFILE_ARGS --distribution-id "$DISTRIBUTION" --paths \
    "/$PRIMARY_KEY" \
    "/$S3_DIR/${BASENAME}-400.jpg" \
    "/$S3_DIR/${BASENAME}-800.jpg" \
    "/$S3_DIR/${BASENAME}-1200.jpg" >/dev/null || true
fi

if [[ $REMOVE_SOURCE -eq 1 ]]; then
  rm -f "$SRC"
  echo "Removed local source: $SRC"
fi

echo "Done. If site.config.ts changed, commit the update:"
echo "  git add site.config.ts scripts/process_annex_office_image.sh"
echo "  git commit -m 'chore(media): update annex office image hash'"
