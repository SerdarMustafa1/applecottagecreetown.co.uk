terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.region
}

resource "aws_s3_bucket" "media" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_ownership_controls" "this" {
  bucket = aws_s3_bucket.media.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "this" {
  bucket                  = aws_s3_bucket.media.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_cors_configuration" "this" {
  bucket = aws_s3_bucket.media.id
  cors_rule {
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    allowed_headers = ["*"]
    max_age_seconds = 3600
  }
}

# CloudFront OAC (recommended)
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "${var.bucket_name}-oac"
  description                       = "OAC for ${var.bucket_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

locals { s3_domain = "${aws_s3_bucket.media.bucket}.s3.${var.region}.amazonaws.com" }

resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  comment             = "Media CDN for ${var.bucket_name}"
  default_root_object = "index.html"

  origin {
    domain_name              = local.s3_domain
    origin_id                = aws_s3_bucket.media.id
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = aws_s3_bucket.media.id
    viewer_protocol_policy = "redirect-to-https"
    compress               = true
    response_headers_policy_id = aws_cloudfront_response_headers_policy.cors_headers.id
    forwarded_values {
      query_string = false
      headers      = []
      cookies { forward = "none" }
    }
    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# Response headers policy to enable CORS for images/videos used by the site
resource "aws_cloudfront_response_headers_policy" "cors_headers" {
  name = "${var.bucket_name}-cors-open"

  cors_config {
    access_control_allow_credentials = false
    access_control_allow_headers = ["*"]
    access_control_allow_methods = ["GET", "HEAD"]
    access_control_allow_origins = ["*"]
    access_control_expose_headers = ["Content-Length", "Content-Range"]
    origin_override = true
  }

  custom_headers_config {
    items = [
      {
        header   = "Timing-Allow-Origin"
        value    = "*"
        override = true
      }
    ]
  }
}

# S3 bucket policy to allow CloudFront OAC access
data "aws_iam_policy_document" "cf_access" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.media.arn}/*"]
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.cdn.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "allow_cf" {
  bucket = aws_s3_bucket.media.id
  policy = data.aws_iam_policy_document.cf_access.json
}

output "bucket_name" { value = aws_s3_bucket.media.bucket }
output "bucket_arn" { value = aws_s3_bucket.media.arn }
output "cloudfront_domain" { value = aws_cloudfront_distribution.cdn.domain_name }
