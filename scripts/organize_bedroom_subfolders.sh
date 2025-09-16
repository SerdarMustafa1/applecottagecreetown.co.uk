#!/bin/bash

# Script to organize bedroom images into individual bedroom subfolders
set -e

BUCKET="apple-cottage-media-eu"
BASE_PATH="images/interior/bedrooms"
PROFILE="smustafa"

echo "=== Organizing Bedroom Images into Individual Bedroom Folders ==="
echo ""

# Master bedroom files
echo "📁 Moving master bedroom files to master-bedroom/ folder..."
aws s3 mv s3://$BUCKET/$BASE_PATH/master-bedroom-1.jpg s3://$BUCKET/$BASE_PATH/master-bedroom/master-bedroom-1.jpg --profile $PROFILE
aws s3 mv s3://$BUCKET/$BASE_PATH/master-bedroom-2.jpg s3://$BUCKET/$BASE_PATH/master-bedroom/master-bedroom-2.jpg --profile $PROFILE
aws s3 mv s3://$BUCKET/$BASE_PATH/master-bedroom-3.jpg s3://$BUCKET/$BASE_PATH/master-bedroom/master-bedroom-3.jpg --profile $PROFILE
aws s3 mv s3://$BUCKET/$BASE_PATH/master-bedroom-360-poster.jpg s3://$BUCKET/$BASE_PATH/master-bedroom/master-bedroom-360-poster.jpg --profile $PROFILE

# Rear bedroom files  
echo "📁 Moving rear bedroom files to rear-bedroom/ folder..."
aws s3 mv s3://$BUCKET/$BASE_PATH/bedroom-rear.jpg s3://$BUCKET/$BASE_PATH/rear-bedroom/bedroom-rear.jpg --profile $PROFILE
aws s3 mv s3://$BUCKET/$BASE_PATH/rear-bedroom-360-poster.jpg s3://$BUCKET/$BASE_PATH/rear-bedroom/rear-bedroom-360-poster.jpg --profile $PROFILE
aws s3 mv s3://$BUCKET/$BASE_PATH/rear-bedroom-interior.jpg s3://$BUCKET/$BASE_PATH/rear-bedroom/rear-bedroom-interior.jpg --profile $PROFILE

# Front bedroom files
echo "📁 Moving front bedroom files to front-bedroom/ folder..."
aws s3 mv s3://$BUCKET/$BASE_PATH/front-bedroom-360-poster.jpg s3://$BUCKET/$BASE_PATH/front-bedroom/front-bedroom-360-poster.jpg --profile $PROFILE
aws s3 mv s3://$BUCKET/$BASE_PATH/view-front-bedroom-1200.jpg s3://$BUCKET/$BASE_PATH/front-bedroom/view-front-bedroom-1200.jpg --profile $PROFILE
aws s3 mv s3://$BUCKET/$BASE_PATH/view-front-bedroom-1200.webp s3://$BUCKET/$BASE_PATH/front-bedroom/view-front-bedroom-1200.webp --profile $PROFILE

echo ""
echo "✅ Bedroom reorganization complete!"
echo ""
echo "📁 Final bedroom structure:"
aws s3 ls s3://$BUCKET/$BASE_PATH/ --profile $PROFILE | grep "PRE" | awk '{print "  bedrooms/" $2}'

echo ""
echo "📊 File counts by bedroom subfolder:"
for bedroom in master-bedroom rear-bedroom front-bedroom; do
    count=$(aws s3 ls s3://$BUCKET/$BASE_PATH/$bedroom/ --recursive --profile $PROFILE 2>/dev/null | grep -v "/$" | wc -l || echo "0")
    if [[ $count -gt 0 ]]; then
        echo "  $bedroom: $count files"
    fi
done

echo ""
echo "📋 Detailed file listing:"
for bedroom in master-bedroom rear-bedroom front-bedroom; do
    echo "  📂 $bedroom/:"
    aws s3 ls s3://$BUCKET/$BASE_PATH/$bedroom/ --profile $PROFILE 2>/dev/null | awk '{print "    " $4}' || echo "    (no files found)"
done