#!/usr/bin/env python3
import os
import sys
from pathlib import Path

try:
    from PIL import Image
except Exception as e:
    print("[optimize] Pillow not installed:", e, file=sys.stderr)
    sys.exit(2)

# Try to register AVIF/HEIF via pillow-heif if available
AVIF_ENABLED = False
try:
    from pillow_heif import register_heif_opener  # type: ignore
    register_heif_opener()
    AVIF_ENABLED = True
except Exception:
    AVIF_ENABLED = False

ROOT = Path(__file__).resolve().parents[1]
IMG_DIR = ROOT / 'assets' / 'images'

VALID_EXTS = {'.jpg', '.jpeg', '.png'}

def convert_one(path: Path):
    if path.suffix.lower() not in VALID_EXTS:
        return
    base = path.with_suffix('')
    webp = base.with_suffix('.webp')
    avif = base.with_suffix('.avif')

    try:
        with Image.open(path) as im:
            if im.mode in ('P', 'RGBA'):
                im = im.convert('RGB')

            # WebP
            if not webp.exists():
                im.save(webp, format='WEBP', quality=72, method=6)
                print(f"[optimize] webp: {webp.relative_to(ROOT)}")
            else:
                # print(f"[skip] {webp} exists")
                pass

            # AVIF
            if AVIF_ENABLED and not avif.exists():
                im.save(avif, format='AVIF', quality=48)
                print(f"[optimize] avif: {avif.relative_to(ROOT)}")
    except Exception as e:
        print(f"[error] {path}: {e}")


def main():
    if not IMG_DIR.exists():
        print(f"Image directory not found: {IMG_DIR}", file=sys.stderr)
        return 1
    for root, _dirs, files in os.walk(IMG_DIR):
        for fn in files:
            p = Path(root) / fn
            if p.suffix.lower() in VALID_EXTS:
                convert_one(p)
    if not AVIF_ENABLED:
        print("[optimize] AVIF not enabled (pillow-heif missing). Generated WebP only.")
    return 0


if __name__ == '__main__':
    sys.exit(main())

