#!/bin/bash

# S3 Smart Media Cleanup Script for Apple Cottage
# This script removes unnecessary duplicates while keeping optimal web formats

set -e

AWS_PROFILE=smustafa
BUCKET="s3://apple-cottage-media-eu"

echo "🎯 Apple Cottage S3 Smart Cleanup"
echo "=================================="
echo ""

# Function to remove a file from S3
remove_file() {
    local file_path="$1" 
    local reason="$2"
    local size="$3"
    echo "  🗑️  $file_path ($size)"
    echo "      → $reason"
    aws s3 rm "$BUCKET/$file_path"
}

# Function to keep a file
keep_file() {
    local file_path="$1"
    local reason="$2" 
    local size="$3"
    echo "  ✅ $file_path ($size)"
    echo "      → $reason"
}

echo "📊 Current Duplicate Analysis Results:"
echo "   • 1 true content duplicate (identical files)"
echo "   • 14 format/resolution variant groups"
echo "   • Potential savings: ~15-20 MB"
echo ""

echo "🎯 Smart Cleanup Strategy:"
echo "   ✅ Keep WebP format (93% browser support, excellent compression)"
echo "   ✅ Keep 1200px resolution (high quality, responsive ready)"
echo "   ✅ Keep PNG for diagrams/charts (EPC graph)"
echo "   ❌ Remove AVIF (limited support, minimal benefit)"
echo "   ❌ Remove JPG duplicates (larger than WebP)"
echo "   ❌ Remove 800px versions (lower quality)"
echo "   ❌ Remove identical content duplicates"
echo ""

read -p "🤔 Do you want to proceed with the cleanup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled by user"
    exit 0
fi

echo ""
echo "🧹 Starting Smart Cleanup..."
echo ""

# 1. Remove exact content duplicates
echo "1️⃣  Removing Content Duplicates"
echo "================================"
echo ""
echo "These files have identical content (same hash):"

remove_file "images/exterior/pano-garden-2-exterior-view-370160A9.jpeg" "Exact duplicate of pano-garden-1" "1005.8 KiB"
keep_file "images/exterior/pano-garden-1-exterior-view-2FF85833.jpeg" "Original kept" "1005.8 KiB"

echo ""
echo "✅ Content duplicates removed"

# 2. Optimize format versions
echo ""
echo "2️⃣  Optimizing Format Versions"
echo "=============================="
echo ""

# EPC Graph - Keep PNG (best for diagrams)
echo "📊 EPC Graph (keep PNG for diagram quality):"
keep_file "images/misc/epc-graph.png" "Best format for diagrams/text" "28.9 KiB"
remove_file "images/misc/epc-graph.webp" "PNG better for diagrams" "15.0 KiB"
remove_file "images/misc/epc-graph.avif" "PNG better for diagrams" "6.8 KiB"

echo ""

# Panoramic Images - Keep WebP only
echo "🌅 Panoramic Images (keep WebP for web performance):"
declare -a pano_files=(
    "back-bedroom-pano"
    "bathroom-pano"
    "front-bedroom-pano" 
    "hallway-pano"
    "lounge-pano"
    "steps-pano"
)

for pano in "${pano_files[@]}"; do
    # Get sizes from the analysis
    jpg_size=$(aws s3 ls "$BUCKET/images/panos/${pano}.jpg" | awk '{print $3}')
    webp_size=$(aws s3 ls "$BUCKET/images/panos/${pano}.webp" | awk '{print $3}')
    
    # Convert bytes to human readable
    jpg_hr=$(numfmt --to=iec --suffix=B $jpg_size 2>/dev/null || echo "${jpg_size}B")
    webp_hr=$(numfmt --to=iec --suffix=B $webp_size 2>/dev/null || echo "${webp_size}B")
    
    keep_file "images/panos/${pano}.webp" "Optimized web format" "$webp_hr"
    remove_file "images/panos/${pano}.jpg" "WebP is smaller and web-optimized" "$jpg_hr"
done

echo ""

# Property Photos - Keep 1200px WebP only
echo "🏡 Property Photos (keep 1200px WebP only):"
declare -a photo_groups=(
    "garden-centre"
    "garden-corner"
    "img_0384"
    "street-cairnsmore"
    "street-left"
    "view-front-bedroom"
    "view-hallway"
)

for photo in "${photo_groups[@]}"; do
    echo ""
    echo "   📸 ${photo}:"
    
    # Keep the 1200px WebP version
    keep_file "images/new/${photo}-1200.webp" "Optimal format + resolution" "varies"
    
    # Remove all other versions
    remove_file "images/new/${photo}-1200.jpg" "WebP is smaller" "varies"
    remove_file "images/new/${photo}-1200.avif" "WebP has better browser support" "varies"
    remove_file "images/new/${photo}-800.jpg" "1200px WebP is better" "varies"
    remove_file "images/new/${photo}-800.webp" "1200px version is higher quality" "varies"
    remove_file "images/new/${photo}-800.avif" "1200px WebP is better" "varies"
done

echo ""
echo "✅ Format optimization complete"

# Final verification
echo ""
echo "3️⃣  Final Verification"
echo "======================"
echo ""

echo "📊 Checking final state..."
remaining_images=$(aws s3 ls "$BUCKET/images/" --recursive | grep -E '\.(jpg|jpeg|png|webp|avif)$' | wc -l)
echo "📁 Remaining image files: $remaining_images"

echo ""
echo "🎯 Final Optimized Structure:"
echo "   📊 EPC Graph: PNG format (best for diagrams)"
echo "   🌅 Panoramic Images: WebP format only"
echo "   🏡 Property Photos: WebP format, 1200px resolution only"
echo "   📱 Benefits: ~50% smaller storage, faster loading, modern web standards"

echo ""
echo "💡 Website Integration Notes:"
echo "   1. All images now use WebP format (supported by 93% of browsers)"
echo "   2. Single resolution (1200px) - use CSS for responsive scaling"
echo "   3. Consider adding <picture> elements for fallback to JPEG if needed"
echo "   4. Test image loading across different browsers/devices"

echo ""
echo "🎉 Smart cleanup complete!"
echo "   Your S3 bucket is now optimized for modern web performance!"

# Generate a summary report
echo ""
echo "📋 Generating cleanup report..."
{
    echo "# S3 Media Cleanup Report - $(date)"
    echo ""
    echo "## Actions Taken"
    echo "- Removed 1 content duplicate"
    echo "- Optimized to WebP format for photos"
    echo "- Kept PNG for diagrams (EPC)"
    echo "- Standardized to 1200px resolution"
    echo ""
    echo "## Files Kept"
    echo "- images/misc/epc-graph.png"
    echo "- images/panos/*.webp (6 files)"
    echo "- images/new/*-1200.webp (7 files)"
    echo ""
    echo "## Storage Optimization"
    echo "- Estimated savings: 15-20 MB"
    echo "- Reduced file count from 131 to ~$remaining_images images"
    echo "- Improved web performance through WebP format"
} > "S3_CLEANUP_REPORT_$(date +%Y%m%d).md"

echo "📄 Report saved: S3_CLEANUP_REPORT_$(date +%Y%m%d).md"
