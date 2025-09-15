#!/usr/bin/env bash
set -euo pipefail

# Sync local media folders to S3 bucket
# Usage: AWS_REGION=eu-west-1 BUCKET=apple-cottage-media-eu ./scripts/s3_sync_media.sh

: "${AWS_REGION:=eu-west-1}"
: "${BUCKET:?Set BUCKET to your target S3 bucket name}"

echo "Syncing media to s3://${BUCKET} (region ${AWS_REGION})..."

sync_dir() {
  local src="$1" dst_prefix="$2" cache_control="$3"
  if [ -d "$src" ]; then
    echo "-> $src -> s3://${BUCKET}/${dst_prefix}"
    aws s3 sync "$src" "s3://${BUCKET}/${dst_prefix}" \
      --region "$AWS_REGION" \
      --exclude "*.svg" --exclude ".gitkeep" \
      --cache-control "$cache_control"
  else
    echo "(skip: $src does not exist)"
  fi
}

# Images (immutable)
sync_dir public/images images "public, max-age=31536000, immutable"
# Floorplans raster (immutable). SVG placeholders are excluded by default exclude above.
sync_dir public/floorplans floorplans "public, max-age=31536000, immutable"
# Panoramas (immutable)
sync_dir public/panos panos "public, max-age=31536000, immutable"
# Docs (change more often)
sync_dir public/docs docs "public, max-age=86400"

echo "Done. Set MEDIA_BASE_URL to https://<your-cloudfront-domain> in Netlify env."

