#!/usr/bin/env python3
"""Generate diagnostics/remediation.csv and append dry-run S3 copy commands.
Reads `site.config.ts` for media(...) paths and `dist/index.html` for emitted CDN URLs.
Performs a lightweight HEAD (falls back to GET range) to determine status.
Writes `diagnostics/remediation.csv` and appends suggested `aws s3 cp --dryrun` lines
to `diagnostics/s3_dryrun_copy.sh` when a likely source key is found.
"""
import re
import sys
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

ROOT = Path(__file__).resolve().parent.parent
SITE_CFG = ROOT / 'site.config.ts'
DIST = ROOT / 'dist' / 'index.html'
DIAG_DIR = ROOT / 'diagnostics'
CSV = DIAG_DIR / 'remediation.csv'
DRYRUN = DIAG_DIR / 's3_dryrun_copy.sh'

DEFAULT_CDN = 'https://d1t6lpjdsu4646.cloudfront.net'

def extract_media_paths(text):
    # find media('/path') or media("/path") occurrences
    return sorted({m.group(1) for m in re.finditer(r"media\(\s*['\"](/[^'\"]+)['\"]\s*\)", text)})

def extract_emitted_urls(text, base=DEFAULT_CDN):
    # find all URLs starting with the CDN base
    # also find any http(s) urls generally to be safe
    urls = set(re.findall(r"https?://[^\"\'\s>]+", text))
    return sorted([u for u in urls if u.startswith(base)])

def head_status(url, timeout=8):
    # Try HEAD; if not allowed, perform GET with range bytes=0-0
    try:
        req = Request(url, method='HEAD')
        with urlopen(req, timeout=timeout) as resp:
            return resp.getcode()
    except HTTPError as e:
        # return code for HTTP errors (403, 404, etc.)
        return e.code
    except Exception:
        try:
            req = Request(url)
            req.add_header('Range', 'bytes=0-0')
            with urlopen(req, timeout=timeout) as resp:
                return resp.getcode()
        except HTTPError as e:
            return e.code
        except Exception as e:
            return None

def main():
    DIAG_DIR.mkdir(exist_ok=True)
    if SITE_CFG.exists():
        site_text = SITE_CFG.read_text(encoding='utf-8')
        # try to extract DEFAULT_CDN if present
        m = re.search(r"DEFAULT_CDN\s*=\s*(?:.*?')?(https?://[A-Za-z0-9\-\._/]+)(?:'|\)|;)", site_text)
        if m:
            global DEFAULT_CDN
            DEFAULT_CDN = m.group(1).rstrip('/')
    else:
        site_text = ''

    if DIST.exists():
        dist_text = DIST.read_text(encoding='utf-8')
    else:
        print('Error: dist/index.html not found', file=sys.stderr)
        dist_text = ''

    media_paths = extract_media_paths(site_text)
    emitted_urls = extract_emitted_urls(dist_text, base=DEFAULT_CDN)
    emitted_set = set(emitted_urls)

    # Build a map of basename -> emitted url(s)
    basename_map = {}
    for u in emitted_urls:
        name = Path(u).name
        basename_map.setdefault(name, []).append(u)

    rows = []
    print(f'Found {len(media_paths)} media() paths and {len(emitted_urls)} emitted CDN urls')
    for p in media_paths:
        rel = p.lstrip('/')
        expected = f'{DEFAULT_CDN}/{rel}'
        status = head_status(expected)
        if status == 200:
            action = 'KEEP'
            fix = ''
        elif status == 403:
            action = 'CHECK_PERMISSIONS'
            fix = ''
        elif status == 404 or status is None:
            # Attempt to find candidate source by basename
            name = Path(rel).name
            candidates = basename_map.get(name, [])
            if candidates:
                # choose first candidate as likely source
                src = candidates[0]
                # compute source and dest keys for S3
                src_key = src.replace(DEFAULT_CDN + '/', '')
                dest_key = rel
                action = 'S3_COPY_DRY_RUN'
                fix = f'aws s3 cp --profile "$AWS_PROFILE" --region "$S3_REGION" "s3://$S3_BUCKET/{src_key}" "s3://$S3_BUCKET/{dest_key}" --acl public-read --storage-class STANDARD --dryrun'
            else:
                action = 'VERIFY_CDN'
                fix = ''
        else:
            action = 'VERIFY_CDN'
            fix = ''

        rows.append((p, expected, status if status is not None else 'missing', action, fix))

    # write CSV
    with CSV.open('w', encoding='utf-8') as fh:
        fh.write('relative_path,expected_cdn_url,status,suggested_action,suggested_fix\n')
        for r in rows:
            # escape double quotes
            fh.write('"%s","%s",%s,%s,"%s"\n' % (r[0], r[1], r[2], r[3], r[4].replace('"','\"')))

    print('Wrote', CSV)

    # Append suggested dry-run commands to s3_dryrun_copy.sh
    with DRYRUN.open('a', encoding='utf-8') as fh:
        fh.write('\n# Auto-generated suggested dry-run copy commands\n')
        for r in rows:
            if r[3] == 'S3_COPY_DRY_RUN' and r[4]:
                fh.write('# For %s -> %s\n' % (r[0], r[1]))
                fh.write(r[4] + '\n')

        # Add explicit kitchen pano move example if not already present
        special_src = 'images/panos/kitchen-detail-866679f9.jpg'
        special_dest = 'images/interior/kitchen/kitchen-detail-866679f9.jpg'
        special_cmd = f'aws s3 cp --profile "$AWS_PROFILE" --region "$S3_REGION" "s3://$S3_BUCKET/{special_src}" "s3://$S3_BUCKET/{special_dest}" --acl public-read --storage-class STANDARD --dryrun'
        fh.write('\n# Suggested move: move misplaced kitchen pano into interior/kitchen (dry-run)\n')
        fh.write('# Verify SOURCE exists before removing --dryrun\n')
        fh.write(special_cmd + '\n')

    print('Appended suggestions to', DRYRUN)

if __name__ == '__main__':
    main()
