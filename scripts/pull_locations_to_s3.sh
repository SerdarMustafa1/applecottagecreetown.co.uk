#!/usr/bin/env bash
set -euo pipefail

# Pull Location & Lifestyle images from a preview site and upload to S3 CDN
#
# Usage:
#   PREVIEW_BASE=https://<netlify-preview-domain> \
#   AWS_PROFILE=smustafa \
#   AWS_REGION=eu-west-1 \
#   BUCKET=apple-cottage-media-eu \
#   ./scripts/pull_locations_to_s3.sh
#
# Notes:
# - Tries two candidate source paths for each file:
#     $PREVIEW_BASE/images/locations/<file>
#     $PREVIEW_BASE/assets/images/locations/<file>
# - Uploads to: s3://$BUCKET/images/locations/<file>

: "${PREVIEW_BASE:?Set PREVIEW_BASE to your preview site base, e.g. https://<preview>.netlify.app}"
: "${BUCKET:=apple-cottage-media-eu}"
: "${AWS_REGION:=eu-west-1}"
: "${AWS_PROFILE:=smustafa}"

dest_prefix="images/locations"
workdir="$(mktemp -d)"
cleanup() { rm -rf "$workdir"; }
trap cleanup EXIT

echo "Preview base: $PREVIEW_BASE"
echo "S3 bucket: s3://$BUCKET/$dest_prefix (region $AWS_REGION, profile $AWS_PROFILE)"

files=(
  heritage_museum.jpg
  gem_rock.jpg
  kirroughtree.jpg
  ellangowan.jpg
  cairnsmore.jpg
  mossyard.jpg
  the-laird-s-inn.jpg
  castle-cary-pools.avif
)

fetch_one() {
  local name="$1" out="$2"
  local c1="$PREVIEW_BASE/images/locations/$name"
  local c2="$PREVIEW_BASE/assets/images/locations/$name"
  for url in "$c1" "$c2"; do
    echo "-> Trying $url"
    if curl -fsSL --retry 2 --retry-delay 1 -o "$out" "$url"; then
      echo "   Fetched $name"
      return 0
    fi
  done
  return 1
}

missed=()
for f in "${files[@]}"; do
  out="$workdir/$f"
  if fetch_one "$f" "$out"; then
    mime=$(file --mime-type -b "$out" || echo application/octet-stream)
    cache="public, max-age=31536000, immutable"
    echo "   Uploading to s3://$BUCKET/$dest_prefix/$f (Cache-Control: $cache)"
    aws s3 cp "$out" "s3://$BUCKET/$dest_prefix/$f" \
      --region "$AWS_REGION" \
      --cache-control "$cache" \
      --content-type "$mime"
  else
    echo "!! Could not fetch $f from preview"
    missed+=("$f")
  fi
done

if ((${#missed[@]})); then
  echo "\nMissing files (not found at preview):"
  printf ' - %s\n' "${missed[@]}"
  exit 2
fi

echo "\nAll location images pulled and uploaded. Consider a CloudFront invalidation:"
echo "  aws cloudfront create-invalidation --distribution-id E39Y2XKLK15BLJ --paths \"/images/locations/*\""
