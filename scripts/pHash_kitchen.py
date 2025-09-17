#!/usr/bin/env python3
import os
import sys
from PIL import Image
import imagehash

def compute_hashes(dirpath, recursive=True):
    # Collect image files. If recursive, walk subdirectories and keep relative paths.
    files = []
    if recursive:
        for root, _, fnames in os.walk(dirpath):
            for fname in fnames:
                if fname.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    rel = os.path.relpath(os.path.join(root, fname), dirpath)
                    files.append(rel)
    else:
        files = [f for f in os.listdir(dirpath) if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    files = sorted(files)
    hashes = {}
    print('Computing pHash for files in', dirpath)
    for f in files:
        p = os.path.join(dirpath, f)
        try:
            h = imagehash.phash(Image.open(p))
            hashes[f] = h
            print(f"{f}\t{h}")
        except Exception as e:
            print('ERROR', f, e)
    return files, hashes

def report_near_duplicates(files, hashes, threshold):
    near = []
    for i in range(len(files)):
        for j in range(i+1, len(files)):
            a = hashes.get(files[i])
            b = hashes.get(files[j])
            if a is None or b is None:
                continue
            d = a - b
            if d <= threshold:
                near.append((files[i], files[j], d))

    if not near:
        print('\nNo near-duplicates found (threshold=%d).' % threshold)
    else:
        print('\nNear-duplicates (threshold=%d):' % threshold)
        for x,y,d in near:
            print(f"{x} <-> {y}  distance={d}")

    print('\nPairwise distances:')
    for i in range(len(files)):
        row = []
        for j in range(len(files)):
            if i==j:
                row.append('0')
            else:
                a = hashes.get(files[i])
                b = hashes.get(files[j])
                if a is None or b is None:
                    row.append('NA')
                else:
                    row.append(str(a-b))
        print(files[i] + ': ' + ','.join(row))

def main(argv=None):
    if argv is None:
        argv = sys.argv[1:]
    import argparse
    p = argparse.ArgumentParser(description='Compute pHash for images in a directory and report near-duplicates')
    p.add_argument('dir', nargs='?', default='/tmp/scan_kitchen', help='Directory containing images')
    p.add_argument('--threshold', '-t', type=int, default=8, help='Hamming distance threshold')
    args = p.parse_args(argv)

    dirpath = args.dir
    if not os.path.isdir(dirpath):
        print('Directory not found:', dirpath)
        return 2

    files, hashes = compute_hashes(dirpath)
    if not files:
        print('No image files found in', dirpath)
        return 1

    report_near_duplicates(files, hashes, args.threshold)
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
