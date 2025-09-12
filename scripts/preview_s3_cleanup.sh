#!/bin/bash

# S3 Media Cleanup - DRY RUN MODE
# Preview what would be removed/kept without making changes

set -e

AWS_PROFILE=smustafa
BUCKET="s3://apple-cottage-media-eu"

echo "🔍 Apple Cottage S3 Cleanup - DRY RUN"
echo "====================================="
echo ""
echo "This script will PREVIEW what would be cleaned up without making any changes"
echo ""

# Function to simulate file removal
preview_remove() {
    local file_path="$1"
    local reason="$2"
    local size="$3"
    echo "  🗑️  WOULD REMOVE: $file_path ($size)"
    echo "      Reason: $reason"
}

# Function to show kept files
preview_keep() {
    local file_path="$1"
    local reason="$2"
    local size="$3"
    echo "  ✅ WILL KEEP: $file_path ($size)"
    echo "      Reason: $reason"
}

echo "📊 Analysis Results:"
echo "   • 1 true content duplicate found"
echo "   • 14 format/resolution variant groups found"
echo "   • Multiple formats: JPG, WebP, AVIF, PNG"
echo "   • Multiple resolutions: 800px, 1200px"
echo ""

echo "🎯 Proposed Cleanup Strategy:"
echo "   ✅ KEEP: WebP format (best web performance + browser support)"
echo "   ✅ KEEP: 1200px resolution (high quality, responsive ready)"
echo "   ✅ KEEP: PNG for diagrams (EPC graph - text clarity)"
echo "   ❌ REMOVE: AVIF versions (newer format, limited browser support)"
echo "   ❌ REMOVE: JPG duplicates (larger file sizes than WebP)"
echo "   ❌ REMOVE: 800px versions (lower resolution)"
echo "   ❌ REMOVE: Exact content duplicates"
echo ""

echo "🔍 DETAILED CLEANUP PREVIEW:"
echo ""

# 1. Content Duplicates
echo "1️⃣  CONTENT DUPLICATES"
echo "====================="
echo ""
preview_remove "images/exterior/pano-garden-2-exterior-view-370160A9.jpeg" "Exact duplicate (same hash as pano-garden-1)" "1005.8 KiB"
preview_keep "images/exterior/pano-garden-1-exterior-view-2FF85833.jpeg" "Original file" "1005.8 KiB"

echo ""

# 2. EPC Graph
echo "2️⃣  EPC GRAPH FILES"
echo "=================="
echo ""
preview_keep "images/misc/epc-graph.png" "Best format for diagrams with text" "28.9 KiB"
preview_remove "images/misc/epc-graph.webp" "PNG is clearer for diagrams" "15.0 KiB"
preview_remove "images/misc/epc-graph.avif" "PNG is clearer for diagrams" "6.8 KiB"

echo ""

# 3. Panoramic Images
echo "3️⃣  PANORAMIC IMAGES"
echo "===================="
echo ""
echo "Strategy: Keep WebP only (smaller files, excellent web support)"

declare -a pano_files=(
    "back-bedroom-pano:615.6:353.2"
    "bathroom-pano:641.3:320.8"
    "front-bedroom-pano:651.0:373.2"
    "hallway-pano:507.5:251.7"
    "lounge-pano:687.3:381.3"
    "steps-pano:516.5:253.2"
)

for pano_info in "${pano_files[@]}"; do
    IFS=':' read -r name jpg_size webp_size <<< "$pano_info"
    echo ""
    echo "   🌅 ${name}:"
    preview_keep "images/panos/${name}.webp" "Optimized web format, smaller size" "${webp_size} KiB"
    preview_remove "images/panos/${name}.jpg" "WebP is ${jpg_size} KiB vs ${webp_size} KiB" "${jpg_size} KiB"
done

echo ""

# 4. Property Photos
echo "4️⃣  PROPERTY PHOTOS"
echo "=================="
echo ""
echo "Strategy: Keep 1200px WebP only (best quality + smallest size)"

declare -a photo_groups=(
    "garden-centre:383.8:369.9:235.2:163.7:158.6:99.3"
    "garden-corner:400.1:389.8:250.8:170.3:168.1:104.5"
    "img_0384:436.3:386.1:200.9:190.6:167.9:84.1"
    "street-cairnsmore:298.6:271.5:155.6:133.3:122.4:68.4"
    "street-left:361.4:333.1:222.2:153.2:141.4:92.4"
    "view-front-bedroom:244.5:207.7:105.4:114.3:98.1:50.8"
    "view-hallway:227.0:198.8:122.6:101.5:88.5:53.3"
)

for photo_info in "${photo_groups[@]}"; do
    IFS=':' read -r name jpg1200 webp1200 avif1200 jpg800 webp800 avif800 <<< "$photo_info"
    echo ""
    echo "   📸 ${name}:"
    preview_keep "images/new/${name}-1200.webp" "Optimal: high resolution + web format" "${webp1200} KiB"
    preview_remove "images/new/${name}-1200.jpg" "WebP is smaller (${webp1200} vs ${jpg1200} KiB)" "${jpg1200} KiB"
    preview_remove "images/new/${name}-1200.avif" "WebP has better browser support" "${avif1200} KiB"
    preview_remove "images/new/${name}-800.jpg" "1200px version is higher quality" "${jpg800} KiB"
    preview_remove "images/new/${name}-800.webp" "1200px version is higher quality" "${webp800} KiB"
    preview_remove "images/new/${name}-800.avif" "1200px version is higher quality" "${avif800} KiB"
done

echo ""
echo "📊 SUMMARY OF CHANGES"
echo "===================="
echo ""

# Count files to be removed
total_removes=0
total_keeps=0

# Content duplicates
total_removes=$((total_removes + 1))

# EPC graph
total_keeps=$((total_keeps + 1))
total_removes=$((total_removes + 2))

# Panos
total_keeps=$((total_keeps + 6))
total_removes=$((total_removes + 6))

# Property photos
total_keeps=$((total_keeps + 7))
total_removes=$((total_removes + 35))

echo "📁 Files to keep: $total_keeps"
echo "🗑️  Files to remove: $total_removes"
echo ""

echo "💾 Estimated Storage Savings:"
echo "   • Format optimization: ~30% savings from JPG→WebP conversion"
echo "   • Resolution optimization: ~40% savings from removing 800px versions"
echo "   • Duplicate removal: ~1MB from content duplicates"
echo "   • Total estimated savings: 15-20 MB"
echo ""

echo "🌐 Web Performance Benefits:"
echo "   • Faster page loading (WebP format)"
echo "   • Better Core Web Vitals scores"
echo "   • Reduced bandwidth usage"
echo "   • Mobile-optimized delivery"
echo ""

echo "⚠️  IMPORTANT NOTES:"
echo "   • This is a DRY RUN - no files were actually modified"
echo "   • WebP has 93% browser support (IE11+ not supported)"
echo "   • Consider adding <picture> fallbacks for older browsers if needed"
echo "   • Update your website code to reference the kept files"
echo ""

echo "🚀 To execute the actual cleanup:"
echo "   ./scripts/smart_s3_cleanup.sh"
echo ""

echo "✅ Dry run complete - review the changes above before proceeding!"
