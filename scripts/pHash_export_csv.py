#!/usr/bin/env python3
import os
import csv
import subprocess
import sys
from PIL import Image
import imagehash

BUCKET = 'apple-cottage-media-eu'
PREFIX = 'images/interior'

def aws_last_modified(s3_key, no_head=False):
    if no_head:
        return ''
    try:
        p = subprocess.run([
            'aws','s3api','head-object','--bucket',BUCKET,'--key',s3_key,'--profile','smustafa','--query','LastModified','--output','text'
        ], capture_output=True, text=True, check=False)
        if p.returncode == 0:
            return p.stdout.strip()
    except Exception:
        pass
    return ''

def compute(dirpath, threshold=8, no_head=False):
    entries = []
    for root, _, files in os.walk(dirpath):
        for fname in files:
            if not fname.lower().endswith(('.jpg','.jpeg','.png','.webp')):
                continue
            abspath = os.path.join(root, fname)
            rel = os.path.relpath(abspath, dirpath)
            rel_unix = rel.replace(os.path.sep, '/')
            s3_key = f"{PREFIX}/{rel_unix}"
            try:
                ph = imagehash.phash(Image.open(abspath))
            except Exception as e:
                print('ERROR hashing', abspath, e, file=sys.stderr)
                continue
            size = os.path.getsize(abspath)
            mtime = os.path.getmtime(abspath)
            lastmod = aws_last_modified(s3_key, no_head=no_head)
            entries.append({
                'relpath': rel_unix,
                's3_key': s3_key,
                'phash': str(ph),
                'size': size,
                'mtime': int(mtime),
                'lastmod': lastmod,
            })

    # write main CSV
    csv_path = '/tmp/pHash_interior.csv'
    with open(csv_path, 'w', newline='') as f:
        w = csv.DictWriter(f, fieldnames=['relpath','s3_key','phash','size','mtime','lastmod'])
        w.writeheader()
        for e in entries:
            w.writerow(e)
    print('Wrote', csv_path)

    # pairwise distances
    pairs_path = '/tmp/pHash_interior_pairs.csv'
    with open(pairs_path, 'w', newline='') as f:
        w = csv.writer(f)
        w.writerow(['file_a','file_b','distance'])
        for i in range(len(entries)):
            ha = imagehash.hex_to_hash(entries[i]['phash'])
            for j in range(i+1, len(entries)):
                hb = imagehash.hex_to_hash(entries[j]['phash'])
                d = ha - hb
                w.writerow([entries[i]['relpath'], entries[j]['relpath'], d])
    print('Wrote', pairs_path)

    # generate cleanup dry-run script for pairs with distance <= threshold
    script_path = '/tmp/s3_cleanup_dryrun.sh'
    with open(script_path, 'w') as f:
        f.write('#!/bin/sh\n')
        f.write('# Dry-run cleanup suggestions for visually similar images (threshold=%d)\n' % threshold)
        f.write('# Review before running. To actually delete, remove the leading echo or uncomment the aws rm lines.\n\n')
        for i in range(len(entries)):
            ha = imagehash.hex_to_hash(entries[i]['phash'])
            for j in range(i+1, len(entries)):
                hb = imagehash.hex_to_hash(entries[j]['phash'])
                d = ha - hb
                if d <= threshold:
                    a = entries[i]
                    b = entries[j]
                    # pick keep: larger size preferred, deterministic fallback on s3_key
                    if a['size'] > b['size']:
                        keep, remove = a, b
                    elif b['size'] > a['size']:
                        keep, remove = b, a
                    else:
                        if a['s3_key'] <= b['s3_key']:
                            keep, remove = a, b
                        else:
                            keep, remove = b, a
                    f.write('echo "SIMILAR d=%d: keep=%s remove=%s"\n' % (d, keep['s3_key'], remove['s3_key']))
                    f.write('# aws s3 rm s3://%s/%s --profile smustafa  # commented out, review before enabling\n' % (BUCKET, remove['s3_key']))
                    f.write('\n')
    os.chmod(script_path, 0o755)
    print('Wrote', script_path)

    return entries

if __name__ == '__main__':
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument('dir', nargs='?', default='/tmp/scan_interior')
    p.add_argument('--threshold', '-t', type=int, default=8)
    p.add_argument('--no-head', action='store_true', help='Skip AWS head-object calls')
    args = p.parse_args()
    compute(args.dir, threshold=args.threshold, no_head=args.no_head)
