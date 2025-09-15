#!/usr/bin/env bash
set -euo pipefail
# Map missing CDN keys (from check_cdn_urls) to existing S3 objects by hash suffixes in s3_media_listing.txt, then copy to the expected key.
# Usage:
#   MEDIA_BASE_URL=https://<cloudfront> \
#   AWS_PROFILE=smustafa AWS_REGION=eu-west-1 BUCKET=apple-cottage-media-eu \
#   bash scripts/repair_cdn_images_from_s3.sh

: "${AWS_REGION:=eu-west-1}"
: "${BUCKET:=apple-cottage-media-eu}"

if [[ ! -f s3_media_listing.txt ]]; then
  echo "s3_media_listing.txt not found; export an ls of your bucket first." >&2
  exit 1
fi

# Run CDN check and capture missing URLs
OUT=$(MEDIA_BASE_URL="${MEDIA_BASE_URL:-}" node scripts/check_cdn_urls.js || true)
MISSING=$(echo "$OUT" | awk '/^(4|5)[0-9][0-9] https?:\/\// {print $2}' | sed -E 's#^https?://[^/]+/##' | sort -u)
if [[ -z "$MISSING" ]]; then
  echo "No missing CDN images detected."
  exit 0
fi

echo "Missing keys:" >&2
echo "$MISSING" | sed 's/^/  - /'

# Build a map of S3 objects by their UUID-ish tokens present in filenames; fallback to full name search
# Example: interior-room-64B4DF3B.jpeg should map to S3 object containing 64B4DF3B
TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

# Normalize listing to just object keys we have under images/ (or top-level originals)
awk '{print $NF}' s3_media_listing.txt > "$TMP"

copied=0; skipped=0; failed=0
while IFS= read -r key; do
  # Only handle images/*
  if [[ ! "$key" =~ ^images/ ]]; then
    continue
  fi
  filename=$(basename "$key")
  # Heuristic token: last 8 hex/alnum before extension, if present
  token=$(echo "$filename" | sed -E 's/\.[^.]+$//' | grep -oE '[A-F0-9]{8}$' || true)
  src=""
  if [[ -n "$token" ]]; then
    # Prefer matching original full-res in listing (top-level keys) or under images/new
    cand=$(grep -E "(^|/)${token}([A-F0-9-]*)\.(jpeg|jpg|png|heic|avif|webp)$" "$TMP" | head -n1 || true)
    if [[ -n "$cand" ]]; then src="$cand"; fi
  fi
  # Fallback: try same basename exists somewhere under images/new or originals
  if [[ -z "$src" ]]; then
    cand=$(grep -E "(^|/)images/.*/$(printf '%s' "$filename" | sed 's/[].[^$*]/\\&/g')$" "$TMP" | head -n1 || true)
    if [[ -n "$cand" ]]; then src="$cand"; fi
  fi
  if [[ -z "$src" ]]; then
    echo "No source match found for $key" >&2
    ((skipped++))
    continue
  fi
  echo "Copying s3://$BUCKET/$src -> s3://$BUCKET/$key"
  if aws s3 cp "s3://$BUCKET/$src" "s3://$BUCKET/$key" --cache-control "public, max-age=31536000, immutable" >/dev/null; then
    ((copied++))
  else
    ((failed++))
  fi

done < <(echo "$MISSING" | grep '^images/' )

echo "Done. Copied: $copied, Skipped: $skipped, Failed: $failed"
if [[ $copied -gt 0 ]]; then
  echo "Consider CloudFront invalidation for updated keys, e.g.:"
  echo "  aws cloudfront create-invalidation --distribution-id E39Y2XKLK15BLJ --paths \"/images/*\""
fi
