#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${NETLIFY_BUILD_HOOK:-}" ]]; then
  echo "NETLIFY_BUILD_HOOK not set. Configure it in your environment (.env.local)." >&2
  exit 1
fi

echo "Triggering Netlify build..."
curl -sS -X POST -H "Content-Type: application/json" -d '{"trigger_title":"Manual trigger from script"}' "$NETLIFY_BUILD_HOOK" && echo "\nDone."

