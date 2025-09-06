Infrastructure — S3 media bucket (EU)
====================================

This folder provides Terraform to create an S3 bucket for hosting site media
in AWS account 992382689545 (use credentials for that account).

What it does
- Creates a bucket in eu-west-1 (Ireland) named `apple-cottage-media-eu`
- Enables ACLs + bucket ownership controls
- Adds CORS policy for images/video (GET/HEAD)
- Adds public-read policy for objects (optional — you can serve via CloudFront instead)

Usage
1) Install Terraform and configure AWS credentials for account 992382689545.
2) From this folder:

   terraform init
   terraform apply -var="bucket_name=apple-cottage-media-eu" -auto-approve

3) Sync media (images/videos) using the provided script:

   ./../scripts/s3_sync.sh s3://apple-cottage-media-eu eu-west-1

4) Optional: set MEDIA_BASE_URL to serve media from S3 on deploy (Netlify):

   MEDIA_BASE_URL=https://apple-cottage-media-eu.s3.eu-west-1.amazonaws.com

The build will rewrite index.html media paths when MEDIA_BASE_URL is set.

