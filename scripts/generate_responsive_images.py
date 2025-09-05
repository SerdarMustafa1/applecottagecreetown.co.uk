#!/usr/bin/env python3
import os
from pathlib import Path
from typing import List

from PIL import Image
try:
    from pillow_heif import register_heif_opener
    register_heif_opener()
    AVIF_ENABLED = True
except Exception:
    AVIF_ENABLED = False

ROOT = Path(__file__).resolve().parents[1]
EXTERIOR = ROOT / 'assets' / 'images' / 'exterior'

# Target widths for gallery images and hero
GALLERY_WIDTHS = [480, 800, 1200]
HERO_WIDTHS = [1200, 1600, 2000]

def resize_and_save(src: Path, out_base: Path, width: int):
    with Image.open(src) as im:
        if im.mode in ('P', 'RGBA'):
            im = im.convert('RGB')
        w, h = im.size
        if w <= width:
            resized = im.copy()
        else:
            new_h = int(h * (width / float(w)))
            resized = im.resize((width, new_h), Image.LANCZOS)
        # Save JPEG fallback
        jpg_path = out_base.with_name(f"{out_base.name}-{width}.jpg")
        if not jpg_path.exists():
            resized.save(jpg_path, format='JPEG', quality=80, optimize=True, progressive=True)
        # Save WebP
        webp_path = out_base.with_name(f"{out_base.name}-{width}.webp")
        if not webp_path.exists():
            resized.save(webp_path, format='WEBP', quality=72, method=6)
        # Save AVIF
        if AVIF_ENABLED:
            avif_path = out_base.with_name(f"{out_base.name}-{width}.avif")
            if not avif_path.exists():
                resized.save(avif_path, format='AVIF', quality=48)

def process_folder(folder: Path, hero_names: List[str]):
    for img in folder.glob('*.jpg'):
        base = img.with_suffix('')
        widths = HERO_WIDTHS if img.stem in hero_names else GALLERY_WIDTHS
        for w in widths:
            resize_and_save(img, base, w)

def main():
    hero = ['exteriormain']
    if EXTERIOR.exists():
        process_folder(EXTERIOR, hero)
    print('[responsive] Done')

if __name__ == '__main__':
    main()

