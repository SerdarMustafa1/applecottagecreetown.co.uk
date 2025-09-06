Infrastructure — S3 media bucket (EU)
====================================

This folder provides Terraform to create an S3 bucket for hosting site media
in AWS account 992382689545 (use credentials for that account).

What it does
- Creates a private bucket in eu-west-1 (Ireland), e.g. `apple-cottage-media-eu`
- Enables ownership controls + CORS (GET/HEAD)
- Provisions a CloudFront distribution with Origin Access Control (OAC)
- Grants the distribution permission to read S3 objects (bucket remains private)

Usage
1) Install Terraform and configure AWS credentials for account 992382689545.
2) From this folder:

   terraform init
   terraform apply -var="bucket_name=apple-cottage-media-eu" -auto-approve

3) Sync media (images/videos) using the provided script (objects are private but
   readable via CloudFront OAC):

   ./../scripts/s3_sync.sh s3://apple-cottage-media-eu eu-west-1

4) Set MEDIA_BASE_URL to serve media via CloudFront on deploy (Netlify):

   MEDIA_BASE_URL=https://<cloudfront_domain_from_terraform>

   The build rewrites index.html media paths when MEDIA_BASE_URL is set.
