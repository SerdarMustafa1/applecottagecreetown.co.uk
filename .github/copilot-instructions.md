# Apple Cottage Creetown Website - GitHub Copilot Instructions

**ALWAYS FOLLOW THESE INSTRUCTIONS FIRST.** Only fallback to additional search and context gathering if the information in these instructions is incomplete or found to be in error.

## Overview

Apple Cottage Creetown is a static website with 360° virtual tours built with HTML, CSS, JavaScript, and Node.js build tools. The site uses FFmpeg for video processing, Python for image optimization, and deploys via Netlify with AWS S3/CloudFront for media hosting.

## Working Effectively

### Bootstrap and Dependencies
Execute these commands in order to set up the development environment:

1. **Install Node.js dependencies** (4 seconds):
   ```bash
   npm install
   ```

2. **Install Python dependencies for image processing**:
   ```bash
   pip3 install pillow pillow-heif
   ```

3. **Verify FFmpeg availability** (provided via npm package):
   ```bash
   node -e "console.log(require('@ffmpeg-installer/ffmpeg').path)"
   ```

### Build Process

**IMPORTANT:** Build times depend on video content. Set appropriate timeouts.

1. **Standard build** (0.2 seconds when no videos present):
   ```bash
   npm run build
   ```
   - Converts videos in `assets/videos/interior/` (if present)
   - Rewrites media URLs if `MEDIA_BASE_URL` is set
   - **NEVER CANCEL:** If videos are present, build can take 30+ minutes depending on video count and quality. Set timeout to 60+ minutes.

2. **Check local assets** (0.2 seconds):
   ```bash
   npm run assets:check-local
   ```

3. **Generate responsive images** (instant when no new images):
   ```bash
   python3 scripts/generate_responsive_images.py
   ```

### Development Server

1. **Start local development server**:
   ```bash
   npx http-server -p 8080 -c-1 .
   ```
   Server starts in ~2 seconds and serves site at `http://localhost:8080`

2. **Stop server when done**:
   ```bash
   pkill -f http-server
   ```

### Testing

**CRITICAL:** Many tests require environment variables to function correctly.

1. **CDN verification** (requires `MEDIA_BASE_URL`):
   ```bash
   npm run test:cdn
   ```
   - Fails with "MEDIA_BASE_URL not set" if environment variable missing
   - This is expected in local development

2. **CDN verification (skip WebM files)**:
   ```bash
   npm run verify-cdn:nowebm
   ```
   - Also requires `MEDIA_BASE_URL`
   - Use when WebM files are temporarily unavailable

3. **Full test suite**:
   ```bash
   npm test
   ```
   - **NEVER CANCEL:** Can take 15+ minutes. Set timeout to 30+ minutes.
   - Includes both CDN verification and E2E tests
   - E2E tests require Playwright browsers: `npx playwright install --with-deps`

4. **E2E tests only**:
   ```bash
   SITE_URL=http://localhost:8080 npm run test:e2e
   ```
   - **CRITICAL:** Start local server first
   - Tests 360° tour functionality and site interactions
   - **NEVER CANCEL:** E2E tests can take 10+ minutes. Set timeout to 20+ minutes.

## Manual Validation Scenarios

**ALWAYS manually validate functionality after changes.** Simply starting and stopping the application is NOT sufficient.

### Core Validation Workflow
1. **Start development server**: `npx http-server -p 8080 -c-1 .`
2. **Test home page**: Visit `http://localhost:8080/` and verify content loads
3. **Test 360° tours**: Click "Watch 360 Tours" button and verify tour section opens
4. **Test tour interaction**: Click play button on any 360° viewer and verify video loads or shows appropriate fallback
5. **Test navigation**: Verify all internal links work correctly
6. **Test responsive design**: Test site on different viewport sizes
7. **Stop server**: `pkill -f http-server`

### Advanced Validation for Media Changes
If working with videos or images:
1. **Test video processing**: Place test videos in `assets/videos/interior/` and run `npm run build`
2. **Verify video outputs**: Check that MP4 and WebM files are generated
3. **Test poster generation**: Verify poster images are created in `assets/images/interior/`
4. **Validate responsive images**: Run `python3 scripts/generate_responsive_images.py` and check multiple resolutions are created

## Media Upload and CDN

### Prerequisites for Media Upload
- AWS CLI configured with profile `smustafa`
- Access to S3 bucket `apple-cottage-media-eu` in `eu-west-1`
- Access to CloudFront distribution `E39Y2XKLK15BLJ`

### Upload 360° Videos
**NEVER CANCEL:** Video upload and processing can take 45+ minutes. Set timeout to 90+ minutes.

```bash
# Place source videos in 360-source/ directory first
AWS_PROFILE=smustafa scripts/prepare_and_upload_360.sh \
  --src 360-source \
  --bucket apple-cottage-media-eu \
  --distribution E39Y2XKLK15BLJ \
  --region eu-west-1
```

### Upload Images and Videos
```bash
scripts/media_push.sh \
  --videos-dir assets/videos/interior \
  --images-dir assets/images \
  --bucket apple-cottage-media-eu \
  --region eu-west-1 \
  --distribution-id E39Y2XKLK15BLJ \
  --profile smustafa
```

## Common Issues and Solutions

### Build Failures
- **"videos directory not found"**: Expected when no 360° videos are present
- **"MEDIA_BASE_URL not set"**: Expected in local development, only needed for CDN rewriting

### Test Failures
- **"MEDIA_BASE_URL not set"**: Set environment variable or skip CDN tests during local development
- **Playwright browser not found**: Run `npx playwright install --with-deps` (may take 10+ minutes)
- **E2E tests timeout**: Ensure local server is running and accessible

### Missing Dependencies
- **"No module named 'PIL'"**: Run `pip3 install pillow pillow-heif`
- **FFmpeg not found**: FFmpeg is provided via npm package, not system installation

## CI/CD Integration

The repository uses GitHub Actions for testing and Netlify for deployment:

- **Tests run on every PR**: CDN verification and E2E tests
- **Deployment**: Automatic on merge to main (gated by test success)
- **Environment variables needed for CI**: `MEDIA_BASE_URL`, `NETLIFY_BUILD_HOOK`

## Key Files and Directories

### Critical Files (Always Review After Changes)
- `index.html` - Main site content and 360° tour markup
- `script.js` - Interactive functionality for tours and forms
- `style.css` - Site styling and responsive design
- `package.json` - Build scripts and dependencies

### Build and Media Scripts
- `scripts/convert_videos.js` - Video processing with FFmpeg
- `scripts/rewrite_media_base.js` - CDN URL rewriting
- `scripts/generate_responsive_images.py` - Image optimization
- `scripts/verify_cdn.js` - CDN asset verification

### Configuration
- `netlify.toml` - Netlify build configuration
- `tests/playwright.config.js` - E2E test configuration
- `.gitignore` - Excludes build artifacts and media files

### Infrastructure
- `infra/` - Terraform configuration for AWS S3 and CloudFront
- Requires Terraform installation for infrastructure changes

## Performance Notes

- **Build is fast** when no videos to process (~0.2 seconds)
- **Video processing is intensive** and can take 30+ minutes for multiple 360° videos
- **Image processing is fast** when images already optimized
- **CDN uploads** depend on file sizes and network speed
- **E2E tests** include video playback testing and can be slow

## Security and Credentials

- **Never commit AWS credentials** to repository
- **Use AWS CLI profiles** for authentication
- **Media files are excluded** from repository via .gitignore
- **Infrastructure state** is excluded from version control

---

**Remember: ALWAYS validate your changes with the manual validation scenarios above. Test real user workflows, not just build success.**