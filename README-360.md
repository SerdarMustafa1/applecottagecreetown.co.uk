# 360 media: prepare and upload

Requirements (macOS):

- Homebrew installed
- ffmpeg and AWS CLI

Install once:

```bash
brew install ffmpeg awscli
```

1) Put your 360 source files into a folder named `360-source/` at the repo root.

   Example names (either .mov or .mp4):
   - kitchen-360.mov
   - bathroom-360.mov
   - bedroom-2-360.mov
   - front-bedroom-360.mov
   - rear-bedroom-360.mov
   - conservatory-360.mov
   - lounge-360.mov

2) Configure AWS profile with access that can write to the bucket and invalidate CloudFront.

3) Run the helper script:

```bash
AWS_PROFILE=smustafa \
./scripts/prepare_and_upload_360.sh \
  --src 360-source \
  --bucket apple-cottage-media-eu \
  --distribution E39Y2XKLK15BLJ \
  --region eu-west-1
```

This will:

- Transcode to MP4 (H.264 + AAC) into `dist/videos/interior/*.mp4`
- Create poster JPGs into `dist/images/interior/*-poster.jpg`
- Upload: `dist/videos/**` → `s3://apple-cottage-media-eu/videos/`
- Upload: `dist/images/**` → `s3://apple-cottage-media-eu/images/`
- Invalidate CloudFront for the uploaded paths (e.g. `/videos/interior/kitchen-360.mp4`, `/images/interior/kitchen-360-poster.jpg`)

Flags:

- `--no-upload` to skip S3 uploads
- `--no-invalidate` to skip CloudFront invalidation

After upload, your site should reference these via the CDN base URL.
