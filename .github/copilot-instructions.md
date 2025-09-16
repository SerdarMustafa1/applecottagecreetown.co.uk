# Apple Cottage Creetown Website - GitHub Copilot Instructions

**ALWAYS FOLLOW THESE INSTRUCTIONS FIRST.** Only fallback to additional search and context gathering if the information in these instructions is incomplete or found to be in error.
````instructions
# Apple Cottage Creetown — GitHub Copilot Instructions

Follow these notes first; they contain repository-specific conventions, long-running tasks, and critical file locations that help AI coding agents make safe, useful changes.

Overview
 - Static marketing site built with Astro/HTML/CSS/JS. Media-heavy: 360° tours and video assets are stored in `assets/` and processed before publish.
 - Media processing: FFmpeg (via `@ffmpeg-installer/ffmpeg` + `scripts/convert_videos.js`) and Python image scripts (`scripts/generate_responsive_images.py`).
 - Deploy: Netlify for site; AWS S3 + CloudFront for large media (`infra/` contains Terraform definitions).

Quick Setup
 - Install JS deps: `npm install`
 - Install Python image deps: `pip3 install pillow pillow-heif`
 - Verify packaged FFmpeg: `node -e "console.log(require('@ffmpeg-installer/ffmpeg').path)"`

Key Developer Workflows (explicit)
 - Build (may process videos): `npm run build` — if `assets/videos/interior/` contains sources this can take 30+ minutes. DO NOT cancel long-running builds.
 - Check local assets: `npm run assets:check-local`
 - Generate responsive images: `python3 scripts/generate_responsive_images.py`
 - Local static server (serve `dist/` after build or repo root for quick checks): `npx http-server -p 8080 -c-1 dist`
 - Stop server: `pkill -f http-server`

Tests and CI
 - Full tests: `npm test` (includes CDN verification and E2E). Can take 15+ minutes; tests run on PRs.
 - Playwright browsers for E2E: `npx playwright install --with-deps`
 - CDN tests require `MEDIA_BASE_URL` env var. Use `npm run test:cdn` or `npm run verify-cdn:nowebm` (skip WebM checks).

Media / CDN / Uploads (practical specifics)
 - Upload scripts assume AWS CLI profile `smustafa` and S3 bucket `apple-cottage-media-eu` (eu-west-1). See `scripts/media_push.sh` and `scripts/prepare_and_upload_360.sh`.
 - Example 360 upload (long-running):
   `AWS_PROFILE=smustafa scripts/prepare_and_upload_360.sh --src 360-source --bucket apple-cottage-media-eu --distribution E39Y2XKLK15BLJ --region eu-west-1`

Repository Conventions & Patterns
 - Media-first: avoid committing heavy media to repo; `assets/` may be referenced but large files live in S3.
 - Scripts with side effects: `scripts/convert_videos.js` and other media scripts mutate `assets/` and `dist/` — inspect before running.
 - Tests expect built output or running server for E2E. Use `SITE_URL=http://localhost:8080 npm run test:e2e` after starting server.
 - Playwright config: `tests/playwright.config.js`; E2E specs live under `tests/`.

Important Files to Review When Making Changes
 - Build & scripts: `package.json`, `scripts/convert_videos.js`, `scripts/rewrite_media_base.js`, `scripts/generate_responsive_images.py`
 - E2E & tests: `tests/`, `tests/playwright.config.js`, `tests/unit/`
 - Infra: `infra/` (Terraform), `netlify.toml`
 - Site source: `src/` (Astro components and islands), `public/`, `content/`

Performance & Timeouts
 - Video processing and CDN uploads are long-running; CI and local runs may need timeouts >> 10 minutes. Prefer incremental changes that avoid reprocessing media.

Common Gotchas
 - `MEDIA_BASE_URL` missing: CDN tests and URL rewrites will fail locally — set env var only when verifying CDN.
 - Missing Python deps: `pip3 install pillow pillow-heif`
 - Playwright not installed: run `npx playwright install --with-deps` before E2E tests.

Change Guidance for AI agents (concrete)
 - Small UI/content fixes: edit `src/` components and `content/` Markdown; run `npm run build` (fast if no media) and validate locally at `http://localhost:8080/`.
 - Media-processing changes: leave scripts as-is unless fixing a specific bug. If altering, add unit tests or a short local-run doc because these scripts are sensitive and long-running.
 - CI/Infra changes: consult `infra/README.md` and do NOT store secrets in repo. Use existing Terraform patterns.

When unsure, check these examples first:
 - How videos are converted: `scripts/convert_videos.js`
 - How responsive images are generated: `scripts/generate_responsive_images.py`
 - Playwright E2E flows: `tests/site-flows.e2e.spec.js`

Request for feedback
 - I updated these instructions to be shorter and more focused on actionable workflows. Tell me if you want more examples (specific files/commands) or a separate `AGENT.md` for long-running media tasks.
````