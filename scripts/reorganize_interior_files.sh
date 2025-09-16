#!/bin/bash

# Script to reorganize interior images in S3 into proper subfolders
set -e

BUCKET="apple-cottage-media-eu"
BASE_PATH="images/interior"

echo "=== Reorganizing Interior Images by Room Type ==="
echo ""

# Kitchen files
echo "📁 Moving kitchen files..."
aws s3 mv s3://$BUCKET/$BASE_PATH/kitchen-1.jpg s3://$BUCKET/$BASE_PATH/kitchen/kitchen-1.jpg
aws s3 mv s3://$BUCKET/$BASE_PATH/kitchen-2.jpg s3://$BUCKET/$BASE_PATH/kitchen/kitchen-2.jpg
aws s3 mv s3://$BUCKET/$BASE_PATH/kitchen-4.jpg s3://$BUCKET/$BASE_PATH/kitchen/kitchen-4.jpg
aws s3 mv s3://$BUCKET/$BASE_PATH/kitchen-360-poster.jpg s3://$BUCKET/$BASE_PATH/kitchen/kitchen-360-poster.jpg

# Bathroom files
echo "📁 Moving bathroom files..."
aws s3 mv s3://$BUCKET/$BASE_PATH/bathroom.jpg s3://$BUCKET/$BASE_PATH/bathroom/bathroom.jpg
aws s3 mv s3://$BUCKET/$BASE_PATH/bathroom-interior.jpg s3://$BUCKET/$BASE_PATH/bathroom/bathroom-interior.jpg
aws s3 mv s3://$BUCKET/$BASE_PATH/bathroom-360-poster.jpg s3://$BUCKET/$BASE_PATH/bathroom/bathroom-360-poster-main.jpg

# Bedroom files
echo "📁 Moving bedroom files..."
aws s3 mv s3://$BUCKET/$BASE_PATH/master-bedroom-1.jpg s3://$BUCKET/$BASE_PATH/bedrooms/master-bedroom-1.jpg
aws s3 mv s3://$BUCKET/$BASE_PATH/master-bedroom-2.jpg s3://$BUCKET/$BASE_PATH/bedrooms/master-bedroom-2.jpg
aws s3 mv s3://$BUCKET/$BASE_PATH/master-bedroom-3.jpg s3://$BUCKET/$BASE_PATH/bedrooms/master-bedroom-3.jpg
aws s3 mv s3://$BUCKET/$BASE_PATH/master-bedroom-360-poster.jpg s3://$BUCKET/$BASE_PATH/bedrooms/master-bedroom-360-poster.jpg
aws s3 mv s3://$BUCKET/$BASE_PATH/bedroom-rear.jpg s3://$BUCKET/$BASE_PATH/bedrooms/bedroom-rear.jpg
aws s3 mv s3://$BUCKET/$BASE_PATH/rear-bedroom-360-poster.jpg s3://$BUCKET/$BASE_PATH/bedrooms/rear-bedroom-360-poster.jpg
aws s3 mv s3://$BUCKET/$BASE_PATH/rear-bedroom-interior.jpg s3://$BUCKET/$BASE_PATH/bedrooms/rear-bedroom-interior.jpg
aws s3 mv s3://$BUCKET/$BASE_PATH/front-bedroom-360-poster.jpg s3://$BUCKET/$BASE_PATH/bedrooms/front-bedroom-360-poster.jpg
aws s3 mv s3://$BUCKET/$BASE_PATH/view-front-bedroom-1200.jpg s3://$BUCKET/$BASE_PATH/bedrooms/view-front-bedroom-1200.jpg
aws s3 mv s3://$BUCKET/$BASE_PATH/view-front-bedroom-1200.webp s3://$BUCKET/$BASE_PATH/bedrooms/view-front-bedroom-1200.webp

# Living area files
echo "📁 Moving living area files..."
aws s3 mv s3://$BUCKET/$BASE_PATH/lounge-3.jpg s3://$BUCKET/$BASE_PATH/living/lounge-3.jpg
aws s3 mv s3://$BUCKET/$BASE_PATH/lounge-360-poster.jpg s3://$BUCKET/$BASE_PATH/living/lounge-360-poster.jpg
aws s3 mv s3://$BUCKET/$BASE_PATH/conservatory-1.jpg s3://$BUCKET/$BASE_PATH/living/conservatory-1.jpg
aws s3 mv s3://$BUCKET/$BASE_PATH/conservatory-360-poster.jpg s3://$BUCKET/$BASE_PATH/living/conservatory-360-poster.jpg

# Hallway/circulation files
echo "📁 Moving hallway files..."
aws s3 mv s3://$BUCKET/$BASE_PATH/view-hallway-1200.jpg s3://$BUCKET/$BASE_PATH/hallway/view-hallway-1200.jpg
aws s3 mv s3://$BUCKET/$BASE_PATH/view-hallway-1200.webp s3://$BUCKET/$BASE_PATH/hallway/view-hallway-1200.webp
aws s3 mv s3://$BUCKET/$BASE_PATH/stairs.jpg s3://$BUCKET/$BASE_PATH/hallway/stairs.jpg
aws s3 mv s3://$BUCKET/$BASE_PATH/landing.jpg s3://$BUCKET/$BASE_PATH/hallway/landing.jpg

# Utility/other files
echo "📁 Moving utility files..."
aws s3 mv s3://$BUCKET/$BASE_PATH/utility-room.jpg s3://$BUCKET/$BASE_PATH/utility/utility-room.jpg
aws s3 mv s3://$BUCKET/$BASE_PATH/zen-room-1.jpg s3://$BUCKET/$BASE_PATH/other/zen-room-1.jpg

# Move generic interior files to general folder
echo "📁 Moving generic interior files..."
for file in interior-detail-*.jpeg interior-main-*.jpeg interior-room-*.jpeg; do
    if aws s3 ls s3://$BUCKET/$BASE_PATH/$file >/dev/null 2>&1; then
        aws s3 mv s3://$BUCKET/$BASE_PATH/$file s3://$BUCKET/$BASE_PATH/general/$file
    fi
done

echo ""
echo "✅ Interior reorganization complete!"
echo ""
echo "📁 Final structure:"
aws s3 ls s3://$BUCKET/$BASE_PATH/ | grep "PRE" | awk '{print "  " $2}'

echo ""
echo "📊 File counts by subfolder:"
for subfolder in kitchen bathroom bedrooms living hallway utility other general; do
    count=$(aws s3 ls s3://$BUCKET/$BASE_PATH/$subfolder/ --recursive 2>/dev/null | grep -v "/$" | wc -l || echo "0")
    if [[ $count -gt 0 ]]; then
        echo "  $subfolder: $count files"
    fi
done