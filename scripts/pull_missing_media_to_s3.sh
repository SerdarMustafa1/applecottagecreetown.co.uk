#!/usr/bin/env bash
set -euo pipefail

# Pull missing media reported by scripts/check_cdn_urls.js from Netlify preview and upload to S3.
# Usage:
#   PREVIEW_BASE="https://<netlify-preview-domain>" \
#   AWS_PROFILE=smustafa AWS_REGION=eu-west-1 BUCKET=apple-cottage-media-eu \
#   bash ./scripts/pull_missing_media_to_s3.sh

: "${PREVIEW_BASE:?PREVIEW_BASE is required (e.g., https://<id>--<site>.netlify.app)}"
: "${AWS_REGION:=eu-west-1}"
: "${BUCKET:=apple-cottage-media-eu}"

CDN=${MEDIA_BASE_URL:-}
if [[ -z "$CDN" ]]; then
  echo "MEDIA_BASE_URL not set; reading CloudFront from netlify.toml or .env is recommended. Proceeding anyway..." >&2
fi

echo "Preview base: $PREVIEW_BASE"
echo "S3 bucket: s3://$BUCKET (region $AWS_REGION)"

tmpdir=$(mktemp -d)
cleanup() { rm -rf "$tmpdir" 2>/dev/null || true; }
trap cleanup EXIT

export AWS_REGION

# Get non-OK URLs
echo "-> Running CDN URL check to identify missing assets..."
if [[ -n "$CDN" ]]; then
  CHECK_OUT=$(MEDIA_BASE_URL="$CDN" node ./scripts/check_cdn_urls.js || true)
else
  CHECK_OUT=$(node ./scripts/check_cdn_urls.js || true)
fi

echo "$CHECK_OUT" | sed -n '1,60p'

# Extract URLs from lines like: "403 https://domain/path" and convert to absolute paths
missing_paths=$(echo "$CHECK_OUT" \
  | awk '/^(4|5)[0-9][0-9] https?:\/\// {print $2}' \
  | sed -E 's#^https?://[^/]+(/.*)$#\1#' \
  | sort -u)

if [[ -z "$missing_paths" ]]; then
  echo "No missing assets detected."
  exit 0
fi

echo "Found missing paths:" >&2
echo "$missing_paths" | sed 's/^/  - /'

success=0; fail=0
while IFS= read -r path; do
  # Only handle images for now
  if [[ ! "$path" =~ ^/images/ ]]; then
    echo "Skipping non-image path: $path"
    continue
  fi
  name=$(basename "$path")
  rel="${path#/}"
  dest="s3://$BUCKET/$rel"
  
  # Try preview candidates
  c1="$PREVIEW_BASE$path"
  c2="$PREVIEW_BASE/assets$path"
  src=""
  echo "\n-> Resolving $path"
  if curl -sfI "$c1" >/dev/null 2>&1; then
    src="$c1"
  elif curl -sfI "$c2" >/dev/null 2>&1; then
    src="$c2"
  else
    echo "  Preview source not found for $name" >&2
    ((fail++))
    continue
  fi
  echo "  Fetched head OK from: $src"
  # Download then upload
  out="$tmpdir/$name"
  curl -fsSL "$src" -o "$out"
  echo "  Uploading to $dest"
  if aws s3 cp "$out" "$dest" --cache-control "public, max-age=31536000, immutable" >/dev/null; then
    ((success++))
  else
    echo "  Upload failed for $name" >&2
    ((fail++))
  fi
done <<< "$missing_paths"

echo "\nCompleted. Uploaded: $success, Failed: $fail"
if [[ $success -gt 0 ]]; then
  echo "Consider invalidating CloudFront for changed paths, e.g.:"
  echo "  aws cloudfront create-invalidation --distribution-id E39Y2XKLK15BLJ --paths \"/images/*\""
fi
