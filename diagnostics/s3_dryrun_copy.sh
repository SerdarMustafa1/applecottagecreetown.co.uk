#!/usr/bin/env bash
# Safe S3 dry-run copy script (DRY-RUN only)
# Usage: review commands, then run with AWS_PROFILE=smustafa bash diagnostics/s3_dryrun_copy.sh
# This script intentionally uses `--dryrun` so nothing is modified. Remove `--dryrun` only after review.

set -euo pipefail

AWS_PROFILE=${AWS_PROFILE:-smustafa}
S3_BUCKET=${S3_BUCKET:-apple-cottage-media-eu}
S3_REGION=${S3_REGION:-eu-west-1}

echo "S3 dry-run copy template"
echo "AWS profile: $AWS_PROFILE"
echo "S3 bucket: $S3_BUCKET"
echo "Region: $S3_REGION"
echo

# Example: if an object exists at a different key, copy it to the expected key.
# Replace SOURCE_KEY with the actual key where the object currently exists in S3.
# Replace DEST_KEY with the expected key (the path the site emits).
# The script below demonstrates the form of the command for review.

# Example template (dry-run):
# aws s3 cp --profile "$AWS_PROFILE" --region "$S3_REGION" "s3://$S3_BUCKET/SOURCE_KEY" "s3://$S3_BUCKET/DEST_KEY" --acl public-read --storage-class STANDARD --dryrun

echo "Review the remediation CSV at diagnostics/remediation.csv for suggested actions."
echo "No actions will be performed unless you edit this file and remove --dryrun from commands."
echo

cat <<'EOF'
# Suggested copy commands (DRY-RUN placeholders). Replace SOURCE_KEY with actual source path.
# Example:
# aws s3 cp --profile "smustafa" --region "eu-west-1" "s3://apple-cottage-media-eu/images/originals/kitchen-detail-866679f9.jpg" "s3://apple-cottage-media-eu/images/interior/kitchen/kitchen-detail-866679f9.jpg" --acl public-read --storage-class STANDARD --dryrun

EOF

echo "Done. Edit this file to add concrete copy lines and run after verifying." 

# Auto-generated suggested dry-run copy commands

# Suggested move: move misplaced kitchen pano into interior/kitchen (dry-run)
# Verify SOURCE exists before removing --dryrun
aws s3 cp --profile "$AWS_PROFILE" --region "$S3_REGION" "s3://$S3_BUCKET/images/panos/kitchen-detail-866679f9.jpg" "s3://$S3_BUCKET/images/interior/kitchen/kitchen-detail-866679f9.jpg" --acl public-read --storage-class STANDARD --dryrun

# ACL check candidates (objects present in S3 but returning 403 through CDN)
# These commands will fetch the ACL for inspection (dry-run not applicable for get-object-acl)
echo "\nACL checks for objects present in S3 but returning 403 through CDN:" 
aws s3api get-object-acl --profile "$AWS_PROFILE" --region "$S3_REGION" --bucket "$S3_BUCKET" --key "images/interior/bathroom-360-poster.jpg" || true
aws s3api get-object-acl --profile "$AWS_PROFILE" --region "$S3_REGION" --bucket "$S3_BUCKET" --key "images/interior/front-bedroom-360-poster.jpg" || true
aws s3api get-object-acl --profile "$AWS_PROFILE" --region "$S3_REGION" --bucket "$S3_BUCKET" --key "images/interior/kitchen-360-poster.jpg" || true
aws s3api get-object-acl --profile "$AWS_PROFILE" --region "$S3_REGION" --bucket "$S3_BUCKET" --key "images/interior/rear-bedroom-360-poster.jpg" || true

# Suggested copy candidates (dry-run) discovered by basename matching
# These copy commands will only run in dry-run mode. Replace SOURCE_KEY if you know the exact source.
aws s3 cp --profile "$AWS_PROFILE" --region "$S3_REGION" "s3://$S3_BUCKET/images/originals/annex-office-389752AB.jpeg" "s3://$S3_BUCKET/images/exterior/annex-office-389752AB.jpeg" --acl public-read --storage-class STANDARD --dryrun || true
aws s3 cp --profile "$AWS_PROFILE" --region "$S3_REGION" "s3://$S3_BUCKET/images/originals/exterior-from-landing-2EE3F1E1.jpeg" "s3://$S3_BUCKET/images/exterior/exterior-from-landing-2EE3F1E1.jpeg" --acl public-read --storage-class STANDARD --dryrun || true
aws s3 cp --profile "$AWS_PROFILE" --region "$S3_REGION" "s3://$S3_BUCKET/images/originals/garden-lean-to-view-032D67F9.jpeg" "s3://$S3_BUCKET/images/exterior/garden-lean-to-view-032D67F9.jpeg" --acl public-read --storage-class STANDARD --dryrun || true
aws s3 cp --profile "$AWS_PROFILE" --region "$S3_REGION" "s3://$S3_BUCKET/images/originals/hero-exterior-6D088E35.webp" "s3://$S3_BUCKET/images/exterior/hero-exterior-6D088E35.webp" --acl public-read --storage-class STANDARD --dryrun || true

echo "\nNote: Verify the SOURCE paths above exist in S3 (use aws s3 ls) before removing --dryrun."

# Auto-generated suggested dry-run copy commands

# Suggested move: move misplaced kitchen pano into interior/kitchen (dry-run)
# Verify SOURCE exists before removing --dryrun
aws s3 cp --profile "$AWS_PROFILE" --region "$S3_REGION" "s3://$S3_BUCKET/images/panos/kitchen-detail-866679f9.jpg" "s3://$S3_BUCKET/images/interior/kitchen/kitchen-detail-866679f9.jpg" --acl public-read --storage-class STANDARD --dryrun
