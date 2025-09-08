# AWS IAM Setup for Media Upload

This document provides step-by-step AWS CLI commands to create a least-privilege IAM user for uploading media to the S3 bucket and invalidating CloudFront distribution.

## Prerequisites

- AWS CLI installed and configured with administrative access
- Access to AWS account 992382689545

## Setup Commands

### 1. Create the IAM Policy

Create an inline policy with permissions for S3 bucket operations and CloudFront invalidation:

```bash
cat > /tmp/media-uploader-policy.json <<'JSON'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BucketList",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::apple-cottage-media-eu"
    },
    {
      "Sid": "ObjectCrud",
      "Effect": "Allow",
      "Action": ["s3:GetObject","s3:PutObject","s3:DeleteObject","s3:PutObjectAcl"],
      "Resource": "arn:aws:s3:::apple-cottage-media-eu/*"
    },
    {
      "Sid": "CFInvalidate",
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation","cloudfront:GetDistribution","cloudfront:GetDistributionConfig","cloudfront:ListDistributions"],
      "Resource": "*"
    }
  ]
}
JSON

aws iam create-policy \
  --policy-name MediaUploaderPolicy \
  --policy-document file:///tmp/media-uploader-policy.json
```

### 2. Create the IAM User

Create a programmatic-only user for media uploads:

```bash
aws iam create-user --user-name media-uploader
```

Optionally, tag the user for better organization:

```bash
aws iam tag-user --user-name media-uploader --tags Key=Purpose,Value=MediaUpload
```

### 3. Attach Policy to User

Replace `YOUR_ACCOUNT_ID` with your AWS account ID (992382689545):

```bash
aws iam attach-user-policy \
  --user-name media-uploader \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/MediaUploaderPolicy
```

### 4. Create Access Keys

⚠️ **Important**: Store the output securely in your password manager!

```bash
aws iam create-access-key --user-name media-uploader
```

### 5. Configure Local AWS Profile

Set up the AWS CLI profile for use with the upload scripts:

```bash
aws configure --profile smustafa
```

When prompted, enter:
- **Access Key ID**: From step 4 output
- **Secret Access Key**: From step 4 output  
- **Default region name**: `eu-west-1`
- **Default output format**: `json`

## Verification

Test that the setup works correctly:

```bash
# Test S3 access
aws s3 ls s3://apple-cottage-media-eu --profile smustafa --region eu-west-1

# Test CloudFront access
aws cloudfront get-distribution --id E39Y2XKLK15BLJ --profile smustafa --region eu-west-1
```

## Usage with Upload Scripts

Now you can use the media upload scripts:

```bash
chmod +x scripts/media_push.sh
./scripts/media_push.sh \
  --videos-dir /path/to/360s \
  --profile smustafa \
  --region eu-west-1 \
  --bucket apple-cottage-media-eu \
  --distribution-id E39Y2XKLK15BLJ
```

## Security Hygiene

### Rotate or Delete Access Keys

When work is complete, clean up the credentials:

```bash
# List access keys
aws iam list-access-keys --user-name media-uploader

# Deactivate access key (replace KEY_ID with actual key ID)
aws iam update-access-key --user-name media-uploader --access-key-id KEY_ID --status Inactive

# Delete access key
aws iam delete-access-key --user-name media-uploader --access-key-id KEY_ID
```

### Complete Cleanup

To remove the user and policy entirely:

```bash
# Detach policy from user
aws iam detach-user-policy \
  --user-name media-uploader \
  --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/MediaUploaderPolicy

# Delete user
aws iam delete-user --user-name media-uploader

# Delete policy
aws iam delete-policy --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/MediaUploaderPolicy
```

## Key Security Points

- **Least Privilege**: This policy only grants the minimum permissions needed for media upload tasks
- **Scoped Access**: S3 permissions are limited to the specific bucket (`apple-cottage-media-eu`)
- **Programmatic Only**: The user has no console access
- **Temporary**: Credentials should be rotated regularly and deleted when not needed

## Related Documentation

- [Infrastructure Setup](infra/README.md) - Terraform setup for S3 bucket and CloudFront
- [360 Media Upload](README-360.md) - How to prepare and upload 360 degree videos