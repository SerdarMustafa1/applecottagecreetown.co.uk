#!/bin/bash

# S3 Hybrid Cleanup - DRY RUN MODE
# Preview the progressive enhancement approach

set -e

AWS_PROFILE=smustafa
BUCKET="s3://apple-cottage-media-eu"

echo "🔍 Apple Cottage S3 Hybrid Cleanup - DRY RUN"
echo "=============================================="
echo ""
echo "🏡 PROGRESSIVE ENHANCEMENT STRATEGY FOR PROPERTY WEBSITE"
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

echo "🎯 Hybrid Strategy Benefits:"
echo "   ✅ JPG: Universal compatibility, image sharing, SEO optimization"
echo "   ✅ WebP: 30% faster loading for 93% of browsers"
echo "   ✅ Progressive: Browser automatically chooses best format"
echo "   ✅ Property-friendly: Perfect for real estate websites"
echo ""

echo "📊 What Changes vs WebP-only approach:"
echo "   🔄 KEEP JPG versions (instead of removing them)"
echo "   🔄 KEEP WebP versions (for performance)"
echo "   ❌ Still remove AVIF (limited property audience benefit)"
echo "   ❌ Still remove 800px (CSS handles responsive scaling)"
echo ""

echo "🔍 DETAILED HYBRID CLEANUP PREVIEW:"
echo ""

# 1. Content Duplicates (same as before)
echo "1️⃣  CONTENT DUPLICATES"
echo "====================="
echo ""
preview_remove "images/exterior/pano-garden-2-exterior-view-370160A9.jpeg" "Exact duplicate (same hash as pano-garden-1)" "1005.8 KiB"
preview_keep "images/exterior/pano-garden-1-exterior-view-2FF85833.jpeg" "Original file" "1005.8 KiB"

echo ""

# 2. EPC Graph (same as before)
echo "2️⃣  EPC GRAPH FILES"
echo "=================="
echo ""
preview_keep "images/misc/epc-graph.png" "Best format for diagrams with text" "28.9 KiB"
preview_remove "images/misc/epc-graph.webp" "PNG is clearer for diagrams" "15.0 KiB"
preview_remove "images/misc/epc-graph.avif" "PNG is clearer for diagrams" "6.8 KiB"

echo ""

# 3. Panoramic Images - HYBRID APPROACH
echo "3️⃣  PANORAMIC IMAGES - PROGRESSIVE ENHANCEMENT"
echo "==============================================="
echo ""
echo "🏡 Strategy: Keep BOTH JPG and WebP for maximum compatibility + performance"

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
    preview_keep "images/panos/${name}.jpg" "Universal compatibility, sharing, SEO" "${jpg_size} KiB"
    preview_keep "images/panos/${name}.webp" "Modern browser performance (45% smaller)" "${webp_size} KiB"
done

echo ""

# 4. Property Photos - HYBRID APPROACH
echo "4️⃣  PROPERTY PHOTOS - PROGRESSIVE ENHANCEMENT"
echo "============================================="
echo ""
echo "🏡 Strategy: Keep 1200px JPG + WebP pairs, remove everything else"

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
    
    # KEEP both high-quality versions
    preview_keep "images/new/${name}-1200.jpg" "High quality + universal compatibility" "${jpg1200} KiB"
    preview_keep "images/new/${name}-1200.webp" "High quality + modern performance" "${webp1200} KiB"
    
    # REMOVE lower priority versions
    preview_remove "images/new/${name}-1200.avif" "Limited browser support for property audience" "${avif1200} KiB"
    preview_remove "images/new/${name}-800.jpg" "1200px version covers all needs" "${jpg800} KiB"
    preview_remove "images/new/${name}-800.webp" "1200px version covers all needs" "${webp800} KiB"
    preview_remove "images/new/${name}-800.avif" "1200px version covers all needs" "${avif800} KiB"
done

echo ""
echo "📊 HYBRID APPROACH SUMMARY"
echo "=========================="
echo ""

# Count files
total_removes=0
total_keeps=0

# Content duplicates
total_removes=$((total_removes + 1))
total_keeps=$((total_keeps + 1))

# EPC graph
total_keeps=$((total_keeps + 1))
total_removes=$((total_removes + 2))

# Panos - KEEP BOTH
total_keeps=$((total_keeps + 12))  # 6 JPG + 6 WebP

# Property photos - KEEP BOTH at 1200px
total_keeps=$((total_keeps + 14))  # 7 JPG + 7 WebP at 1200px
total_removes=$((total_removes + 28)) # Remove AVIF + 800px versions

echo "📁 Files to keep: $total_keeps"
echo "🗑️  Files to remove: $total_removes"
echo ""

echo "🎯 HYBRID BENEFITS vs WebP-only:"
echo "   ✅ Universal browser compatibility (JPG fallback)"
echo "   ✅ Perfect image sharing via email/social media"
echo "   ✅ Better SEO and social media thumbnails"
echo "   ✅ Real estate platform compatibility"
echo "   ✅ PLUS modern browser performance (WebP)"
echo ""

echo "💾 Storage Impact:"
echo "   • Still removes ~28 redundant files"
echo "   • Keeps quality high with 1200px resolution"
echo "   • Smart format selection per use case"
echo ""

echo "🌐 Implementation - Progressive Enhancement:"
echo '   <picture>'
echo '     <source srcset="property-1200.webp" type="image/webp">'
echo '     <img src="property-1200.jpg" alt="Property photo">'
echo '   </picture>'
echo ""
echo "   → Modern browsers: Use WebP (faster)"
echo "   → Older browsers: Use JPG (compatible)"
echo "   → Image sharing: Download JPG (universal)"
echo ""

echo "⚠️  IMPORTANT NOTES:"
echo "   • This is a DRY RUN - no files were actually modified"
echo "   • Hybrid approach perfect for property websites"
echo "   • Progressive enhancement = best of both worlds"
echo "   • Update HTML to use <picture> elements for automatic selection"
echo ""

echo "🚀 To execute the hybrid cleanup:"
echo "   ./scripts/hybrid_s3_cleanup.sh"
echo ""

echo "✅ Hybrid preview complete - perfect for property websites!"
