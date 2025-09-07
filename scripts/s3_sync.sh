#!/usr/bin/env bash
set -euo pipefail

if [ $# -lt 2 ]; then
  echo "Usage: $0 s3://bucket-name region [profile]" >&2
  exit 1
fi

BUCKET_URI="$1"; REGION="$2"; PROFILE="${3:-}"
AWS=(aws --region "$REGION"); [ -n "$PROFILE" ] && AWS+=(--profile "$PROFILE")

# Validate bucket exists before syncing
BUCKET_NAME=$(echo "$BUCKET_URI" | sed 's|s3://||')
echo "Validating bucket $BUCKET_NAME exists..."
if ! "${AWS[@]}" s3 ls "$BUCKET_URI" >/dev/null 2>&1; then
  echo "Error: Bucket $BUCKET_NAME does not exist or is not accessible" >&2
  exit 1
fi

echo "Syncing images..."
"${AWS[@]}" s3 sync assets/images "$BUCKET_URI/images" \
  --delete \
  --cache-control "public,max-age=31536000,immutable" \
  --exclude "*.py" --exclude "*.DS_Store"

echo "Syncing videos..."
"${AWS[@]}" s3 sync assets/videos "$BUCKET_URI/videos" \
  --delete \
  --cache-control "public,max-age=31536000" \
  --exclude "*.DS_Store"

echo "Done. MEDIA_BASE_URL should be: ${BUCKET_URI/\/*/}"
