# Floor Plans & 3D Models - Assets Directory

This directory contains placeholder references for floor plan and 3D model assets. The actual files are served from CloudFront CDN for optimal performance.

## CDN Asset URLs

### Floor Plans
- Ground Floor (SVG): `https://d1t6lpjdsu4646.cloudfront.net/floorplans/ground-floor.svg`
- Ground Floor (PNG): `https://d1t6lpjdsu4646.cloudfront.net/floorplans/ground-floor.png`
- First Floor (SVG): `https://d1t6lpjdsu4646.cloudfront.net/floorplans/first-floor.svg`
- First Floor (PNG): `https://d1t6lpjdsu4646.cloudfront.net/floorplans/first-floor.png`
- Complete Plan Pack (PDF): `https://d1t6lpjdsu4646.cloudfront.net/floorplans/plan-pack.pdf`

### 3D Models
- Apple Cottage Model (USDZ): `https://d1t6lpjdsu4646.cloudfront.net/models/apple-cottage.usdz`
- Model Preview (JPG): `https://d1t6lpjdsu4646.cloudfront.net/models/poster.jpg`

## Local Development

For local development, assets are stored in:
- `assets/floorplans-local/` - Floor plan files (excluded from git)
- `assets/models-local/` - 3D model files (excluded from git)

These directories are excluded from the repository to keep it lightweight, as the assets are served from CDN in production.

## Asset Management

To update assets:
1. Update files in local directories for development/testing
2. Upload to S3 bucket using the media upload scripts
3. Test CDN URLs are working correctly
4. No need to commit large asset files to repository

## File Sizes (for reference)
- SVG floor plans: ~2MB each
- PNG floor plans: ~280KB each 
- Plan pack PDF: ~810KB
- 3D model USDZ: varies
- Model poster JPG: varies

All assets are optimized for web delivery via CloudFront CDN.
