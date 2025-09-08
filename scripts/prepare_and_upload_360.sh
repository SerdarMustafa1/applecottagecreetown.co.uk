#!/usr/bin/env bash

# Convert 360 MOV/MP4 sources to H.264 MP4 + poster JPGs, upload to S3, and invalidate CloudFront.
#
# Usage:
#   AWS_PROFILE=smustafa \
#   ./scripts/prepare_and_upload_360.sh \
#     --src 360-source \
#     --bucket apple-cottage-media-eu \
#     --distribution E39Y2XKLK15BLJ \
#     [--region eu-west-1] [--no-upload] [--no-invalidate]
#
# Expected input names (examples):
#   kitchen-360.mov|mp4, bathroom-360.mov|mp4, bedroom-2-360.mov|mp4,
#   front-bedroom-360.mov|mp4, rear-bedroom-360.mov|mp4,
#   conservatory-360.mov|mp4, lounge-360.mov|mp4

set -euo pipefail

SRC_DIR="360-source"
OUT_DIR="dist"
REGION="eu-west-1"
BUCKET="apple-cottage-media-eu"
DISTRIBUTION_ID="E39Y2XKLK15BLJ"
DO_UPLOAD=1
DO_INVALIDATE=1

while [[ $# -gt 0 ]]; do
  case "$1" in
    --src)
      SRC_DIR="$2"; shift 2 ;;
    --bucket)
      BUCKET="$2"; shift 2 ;;
    --distribution)
      DISTRIBUTION_ID="$2"; shift 2 ;;
    --region)
      REGION="$2"; shift 2 ;;
    --no-upload)
      DO_UPLOAD=0; shift ;;
    --no-invalidate)
      DO_INVALIDATE=0; shift ;;
    -h|--help)
      sed -n '1,40p' "$0"; exit 0 ;;
    *)
      echo "Unknown arg: $1"; exit 1 ;;
  esac
done

command -v ffmpeg >/dev/null 2>&1 || { echo "ffmpeg is required. Install via: brew install ffmpeg"; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "AWS CLI is required. Install via: brew install awscli"; exit 1; }

VID_OUT="$OUT_DIR/videos/interior"
POSTER_OUT="$OUT_DIR/images/interior"
mkdir -p "$VID_OUT" "$POSTER_OUT"

shopt -s nullglob nocaseglob
inputs=("$SRC_DIR"/*-360.mov "$SRC_DIR"/*-360.mp4)

if [[ ${#inputs[@]} -eq 0 ]]; then
  echo "No 360 source files found in '$SRC_DIR'. Expected names like 'kitchen-360.mov' or '.mp4'." >&2
  exit 1
fi

echo "Processing ${#inputs[@]} file(s) from '$SRC_DIR' → '$OUT_DIR'"

processed_video_paths=()
processed_poster_paths=()

for inpath in "${inputs[@]}"; do
  basefile=$(basename "$inpath")
  name="${basefile%.*}"
  vout="$VID_OUT/${name}.mp4"
  pout="$POSTER_OUT/${name}-poster.jpg"

  echo "\n→ Transcoding: $basefile"
  # H.264 + AAC, faststart, broadly compatible. Preserves original resolution/frame rate.
  ffmpeg -y -hide_banner -loglevel warning -i "$inpath" \
    -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart \
    -c:a aac -b:a 160k \
    "$vout"

  echo "→ Poster: $basefile"
  # Capture a representative frame at 1s; -update 1 clarifies single-image write for image2 muxer.
  ffmpeg -y -hide_banner -loglevel warning -ss 1 -i "$vout" -frames:v 1 -q:v 2 -update 1 "$pout"

  processed_video_paths+=("$vout")
  processed_poster_paths+=("$pout")
done

echo "\nCreated ${#processed_video_paths[@]} video(s) and ${#processed_poster_paths[@]} poster(s)."

if [[ $DO_UPLOAD -eq 1 ]]; then
  echo "\nUploading to s3://$BUCKET ..."
  # Upload videos to /videos and posters to /images/posters
  aws s3 cp "$OUT_DIR/videos/" "s3://$BUCKET/videos/" --recursive --only-show-errors --region "$REGION"
  aws s3 cp "$OUT_DIR/images/" "s3://$BUCKET/images/" --recursive --only-show-errors --region "$REGION"
fi

if [[ $DO_INVALIDATE -eq 1 ]]; then
  echo "\nCreating CloudFront invalidation on $DISTRIBUTION_ID ..."
  # Build precise invalidation paths
  paths=( )
  for p in "${processed_video_paths[@]}"; do
    # p looks like dist/videos/interior/<file>
    rel=${p#*$OUT_DIR}
    paths+=("${rel}")
  done
  for p in "${processed_poster_paths[@]}"; do
    rel=${p#*$OUT_DIR}
    paths+=("${rel}")
  done

  # CloudFront allows up to 30 paths per request; chunk if necessary
  chunk_size=30
  total=${#paths[@]}
  if (( total == 0 )); then
    echo "No paths to invalidate."
  else
    for ((i=0; i<total; i+=chunk_size)); do
      chunk=("${paths[@]:i:chunk_size}")
      aws cloudfront create-invalidation \
        --distribution-id "$DISTRIBUTION_ID" \
        --paths "${chunk[@]}" \
        --query 'Invalidation.Id' --output text >/dev/null
      echo "Invalidated ${#chunk[@]} path(s)"
    done
  fi
fi

echo "\nDone. Output in '$OUT_DIR'. S3 bucket: s3://$BUCKET"
