#!/usr/bin/env python3
import re
import json
import subprocess
import sys
from pathlib import Path

HTML = Path('dist/index.html').read_text(encoding='utf-8')

# Find the "const siteConfig = { ... };" block
m = re.search(r"const siteConfig\s*=\s*\{", HTML)
if not m:
    print('siteConfig start not found', file=sys.stderr)
    raise SystemExit(1)
start = HTML.find('{', m.start())

# Find matching closing brace
i = start
depth = 0
end = None
while i < len(HTML):
    c = HTML[i]
    if c == '{':
        depth += 1
    elif c == '}':
        depth -= 1
        if depth == 0:
            end = i + 1
            break
    i += 1

if end is None:
    print('could not find end of siteConfig', file=sys.stderr)
    raise SystemExit(2)

obj_text = HTML[start:end]

# Parse JSON
try:
    data = json.loads(obj_text)
except Exception as e:
    # Fallback: try to clean common trailing commas
    t = re.sub(r",\s*}\s*\]", '}]', obj_text)
    t = re.sub(r",\s*}\s*,", '},', t)
    try:
        data = json.loads(t)
    except Exception as e2:
        print('json parse failed:', e)
        print('json parse fallback failed:', e2)
        raise

# Collect URLs
urls = set()

def collect(o):
    if isinstance(o, str):
        if o.startswith('http://') or o.startswith('https://') or o.startswith('/'):
            urls.add(o)
    elif isinstance(o, dict):
        for v in o.values():
            collect(v)
    elif isinstance(o, list):
        for v in o:
            collect(v)

collect(data)

# Normalize: absolute URLs for leading '/'
BASE = 'https://d1t6lpjdsu4646.cloudfront.net/'
norm = []
for u in sorted(urls):
    if u.startswith('/'):
        # strip leading slash(es)
        norm.append(BASE + u.lstrip('/'))
    else:
        norm.append(u)

out_txt = Path('/tmp/emitted_cdn_urls.txt')
out_txt.write_text('\n'.join(norm), encoding='utf-8')
print(f'wrote {len(norm)} URLs to {out_txt}')

# Check each URL with curl -I and capture HTTP status (uses system curl)
results = []
for u in norm:
    try:
        # -L follow redirects, -I fetch headers, -s silent, -S show errors
        r = subprocess.run(['curl','-L','-I','-s','-S','-o','/dev/null','-w','%{http_code}',u], capture_output=True, text=True, timeout=20)
        status = r.stdout.strip() or '0'
    except Exception as exc:
        status = '0'
    results.append({'url': u, 'status': int(status) if str(status).isdigit() else 0})

csv_path = Path('/tmp/media_vs_cdn.csv')
with csv_path.open('w', encoding='utf-8') as fh:
    fh.write('url,status\n')
    for r in results:
        fh.write(f"{r['url']},{r['status']}\n")

json_path = Path('/tmp/media_vs_cdn.json')
json_path.write_text(json.dumps(results, indent=2), encoding='utf-8')

print('Wrote CSV ->', csv_path)
print('Wrote JSON ->', json_path)
