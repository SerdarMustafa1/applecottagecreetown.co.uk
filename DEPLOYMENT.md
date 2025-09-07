# AWS CDN Deployment Guide

This repository contains all the necessary infrastructure and automation scripts to set up AWS S3 + CloudFront CDN for media hosting.

## Prerequisites

- AWS CLI configured with credentials for account `992382689545`
- Permissions for S3, CloudFront, and IAM (for OAC)
- Terraform installed
- Netlify access to set environment variables

## Deployment Steps

### 1. Provision AWS Infrastructure

```bash
cd infra
terraform init
terraform apply -var="bucket_name=apple-cottage-media-eu" -auto-approve
```

**Expected Output**: CloudFront domain (e.g., `d1234567890.cloudfront.net`)

### 2. Upload Media to S3

```bash
# Make script executable (if needed)
chmod +x scripts/s3_sync.sh

# Sync media files
./scripts/s3_sync.sh s3://apple-cottage-media-eu eu-west-1 [aws_profile]
```

This uploads:
- `assets/images/` → `s3://apple-cottage-media-eu/images/`
- `assets/videos/` → `s3://apple-cottage-media-eu/videos/`

With cache headers: `public,max-age=31536000,immutable` for images and `public,max-age=31536000` for videos.

### 3. Configure Netlify

Set environment variable in Netlify:
```
MEDIA_BASE_URL=https://<your-cloudfront-domain>
```

Then trigger a redeploy. The build process will:
- Convert 360° videos to MP4/WebM
- Extract poster frames
- Rewrite all media URLs in `index.html` to use the CDN

### 4. Verify CDN Assets

```bash
MEDIA_BASE_URL=https://<your-cloudfront-domain> npm run verify-cdn
```

This checks all 641+ media assets are accessible via CDN. If any are missing, re-run the sync script.

### 5. Clean Up Local Media (After Verification)

```bash
chmod +x scripts/cleanup_local_media.sh
./scripts/cleanup_local_media.sh

git commit -m "Remove local media; serve from CDN"
git push
```

This removes `assets/images/` and `assets/videos/` from the repository and adds them to `.gitignore`.

## File Structure

```
├── infra/
│   ├── main.tf          # S3 bucket + CloudFront + OAC
│   ├── variables.tf     # Region and bucket name variables
│   └── README.md        # Infrastructure documentation
├── scripts/
│   ├── s3_sync.sh       # Upload media with cache headers
│   ├── verify_cdn.js    # Check all assets are accessible
│   ├── rewrite_media_base.js  # Replace URLs in HTML
│   ├── cleanup_local_media.sh # Remove local media files
│   └── convert_videos.js # Video conversion for build
├── assets/
│   ├── images/          # 151MB of images (will be removed after CDN)
│   └── videos/          # 140MB of videos (will be removed after CDN)
└── netlify.toml         # Build configuration
```

## Build Process

The Netlify build (`npm run build`) automatically:
1. Converts 360° videos to optimized MP4/WebM formats
2. Extracts poster frames for video thumbnails
3. Rewrites media paths in HTML if `MEDIA_BASE_URL` is set

## Troubleshooting

- **Video conversion fails**: Ensure FFmpeg is available in build environment
- **S3 sync fails**: Check AWS credentials and bucket permissions
- **CDN verification fails**: Wait for CloudFront propagation (up to 15 minutes)
- **Missing assets**: Re-run the S3 sync script

## Security

- S3 bucket is private (no public access)
- CloudFront uses Origin Access Control (OAC) for secure access
- HTTPS-only distribution with compression enabled
- Long-lived cache headers for optimal performance

## Cost Optimization

- Images use `immutable` cache headers (never re-fetched)
- Videos use 1-year cache headers
- CloudFront compression reduces bandwidth
- S3 in EU-West-1 for optimal European delivery