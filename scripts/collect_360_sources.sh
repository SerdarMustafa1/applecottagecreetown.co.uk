#!/usr/bin/env bash

# Find and copy 360 source files (MOV/MP4 with names like *-360.*) into ./360-source
#
# Usage:
#   ./scripts/collect_360_sources.sh --from "/Volumes/SSD/AppleCottage/Videos"
#
# Notes:
# - This does not rename files; it copies matches as-is. Our pipeline expects
#   names like kitchen-360.mov|mp4, bathroom-360.mov|mp4, etc.
# - After copying, we validate presence of recommended basenames and report gaps.

set -euo pipefail

SRC=""
DEST_DIR="$(cd "$(dirname "$0")"/.. && pwd)/360-source"
mkdir -p "$DEST_DIR"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --from)
      SRC="$2"; shift 2 ;;
    -h|--help)
      sed -n '1,60p' "$0"; exit 0 ;;
    *)
      echo "Unknown arg: $1"; exit 1 ;;
  esac
done

if [[ -z "$SRC" ]]; then
  echo "Please provide a source path with --from <dir>" >&2
  exit 1
fi

if [[ ! -d "$SRC" ]]; then
  echo "Source path not found: $SRC" >&2
  exit 1
fi

shopt -s nocaseglob
mapfile -t files < <(find "$SRC" -type f \( -iname '*-360.mp4' -o -iname '*-360.mov' \) -print)

if (( ${#files[@]} == 0 )); then
  echo "No *-360.(mp4|mov) files found under: $SRC" >&2
  exit 2
fi

echo "Found ${#files[@]} file(s). Copying to $DEST_DIR ..."
for f in "${files[@]}"; do
  base=$(basename "$f")
  cp -v "$f" "$DEST_DIR/$base"
done

echo "\nValidating recommended basenames..."
missing=()
declare -a expected=(
  "kitchen-360"
  "bathroom-360"
  "bedroom-2-360"
  "front-bedroom-360"
  "rear-bedroom-360"
  "conservatory-360"
  "lounge-360"
)

for name in "${expected[@]}"; do
  if ! ls "$DEST_DIR/$name."{mp4,Mp4,MP4,mov,Mov,MOV} >/dev/null 2>&1; then
    missing+=("$name")
  fi
done

if (( ${#missing[@]} > 0 )); then
  echo "Missing ${#missing[@]} recommended file(s):"
  printf ' - %s\n' "${missing[@]}"
  echo "You can still proceed; posters/videos will be generated for the files you provided."
else
  echo "All recommended basenames are present."
fi

echo "\nDone. Collected files in: $DEST_DIR"
