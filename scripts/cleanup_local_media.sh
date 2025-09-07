#!/usr/bin/env bash
set -euo pipefail
echo "This will remove local media (assets/images, assets/videos) from the repo."
echo "Make sure MEDIA_BASE_URL is set in Netlify and CDN verification has passed."
read -r -p "Type 'yes' to continue: " ans
if [ "$ans" != "yes" ]; then echo "Aborted"; exit 1; fi

git rm -r assets/images || true
git rm -r assets/videos || true

cat >> .gitignore <<'EOF'
assets/images/
assets/videos/
EOF

git add .gitignore || true
echo "Local media removed and .gitignore updated. Commit and push to finalize."
