#!/bin/bash

# S3 Hybrid Media Cleanup Script for Apple Cottage
# Progressive enhancement approach: Keep JPG + WebP, remove redundant resolutions

set -e

AWS_PROFILE=smustafa
BUCKET="s3://apple-cottage-media-eu"

echo "🎯 Apple Cottage S3 Hybrid Cleanup"
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

echo "📊 Hybrid Strategy for Property Website:"
echo "   ✅ Keep JPG + WebP at 1200px (progressive enhancement)"
echo "   ✅ Keep PNG for diagrams (EPC graph)"
echo "   ❌ Remove AVIF (limited browser support for property audience)"
echo "   ❌ Remove 800px versions (use CSS for responsive scaling)"
echo "   ❌ Remove exact content duplicates"
echo ""

echo "🏡 Property Website Benefits:"
echo "   • JPG: Universal compatibility, sharing, SEO"
echo "   • WebP: Modern browser performance (30% faster loading)"
echo "   • Progressive: Browser automatically chooses best format"
echo ""

read -p "🤔 Proceed with hybrid cleanup? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cleanup cancelled by user"
    exit 0
fi

echo ""
echo "🧹 Starting Hybrid Cleanup..."
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

# 2. Optimize format versions - HYBRID APPROACH
echo ""
echo "2️⃣  Hybrid Format Optimization"
echo "=============================="
echo ""

# EPC Graph - Keep PNG (best for diagrams)
echo "📊 EPC Graph (keep PNG for diagram quality):"
keep_file "images/misc/epc-graph.png" "Best format for diagrams/text" "28.9 KiB"
remove_file "images/misc/epc-graph.webp" "PNG better for diagrams" "15.0 KiB"
remove_file "images/misc/epc-graph.avif" "PNG better for diagrams" "6.8 KiB"

echo ""

# Panoramic Images - Keep BOTH JPG and WebP
echo "🌅 Panoramic Images (progressive enhancement - keep JPG + WebP):"
declare -a pano_files=(
    "back-bedroom-pano"
    "bathroom-pano"
    "front-bedroom-pano" 
    "hallway-pano"
    "lounge-pano"
    "steps-pano"
)

for pano in "${pano_files[@]}"; do
    echo ""
    echo "   🏠 ${pano}:"
    keep_file "images/panos/${pano}.jpg" "Universal compatibility, sharing, SEO" "varies"
    keep_file "images/panos/${pano}.webp" "Modern browser performance" "varies"
done

echo ""

# Property Photos - Keep 1200px JPG and WebP, remove everything else
echo "🏡 Property Photos (progressive enhancement - keep 1200px JPG + WebP only):"
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
    
    # Keep BOTH 1200px JPG and WebP versions
    keep_file "images/new/${photo}-1200.jpg" "Universal compatibility + high quality" "varies"
    keep_file "images/new/${photo}-1200.webp" "Modern browser performance" "varies"
    
    # Remove AVIF and 800px versions
    remove_file "images/new/${photo}-1200.avif" "Limited browser support for property audience" "varies"
    remove_file "images/new/${photo}-800.jpg" "1200px version is higher quality" "varies"
    remove_file "images/new/${photo}-800.webp" "1200px version is higher quality" "varies"
    remove_file "images/new/${photo}-800.avif" "1200px version is higher quality" "varies"
done

echo ""
echo "✅ Hybrid optimization complete"

# Final verification
echo ""
echo "3️⃣  Final Verification"
echo "======================"
echo ""

echo "📊 Checking final state..."
remaining_images=$(aws s3 ls "$BUCKET/images/" --recursive | grep -E '\.(jpg|jpeg|png|webp|avif)$' | wc -l)
echo "📁 Remaining image files: $remaining_images"

echo ""
echo "🎯 Final Hybrid Structure:"
echo "   📊 EPC Graph: PNG format (best for diagrams)"
echo "   🌅 Panoramic Images: JPG + WebP (progressive enhancement)"
echo "   🏡 Property Photos: JPG + WebP at 1200px (best of both worlds)"
echo ""

echo "💡 Progressive Enhancement Benefits:"
echo "   🌐 Modern browsers: Automatically use WebP (30% faster)"
echo "   📱 Older browsers: Fallback to JPG (universal compatibility)"
echo "   📧 Image sharing: JPG available for email/social media"
echo "   🔍 SEO: JPG ensures best search engine indexing"

echo ""
echo "🔧 Next Steps - Update Your HTML:"
echo '   Use <picture> elements for automatic format selection:'
echo '   <picture>'
echo '     <source srcset="image.webp" type="image/webp">'
echo '     <img src="image.jpg" alt="Property photo" loading="lazy">'
echo '   </picture>'

echo ""
echo "📈 Expected Results:"
echo "   • ~50% fewer files (removed redundant resolutions)"
echo "   • ~20% faster loading for modern browsers"
echo "   • 100% compatibility maintained"
echo "   • Better SEO and social sharing"

echo ""
echo "🎉 Hybrid cleanup complete!"
echo "   Your S3 bucket now uses progressive enhancement!"

# Generate a summary report
echo ""
echo "📋 Generating hybrid cleanup report..."
{
    echo "# S3 Hybrid Media Cleanup Report - $(date)"
    echo ""
    echo "## Strategy: Progressive Enhancement"
    echo "- Keep JPG + WebP for property photos (best of both worlds)"
    echo "- Keep PNG for diagrams (EPC graph)"
    echo "- Remove AVIF (limited browser support)"
    echo "- Remove 800px versions (use CSS for responsive scaling)"
    echo ""
    echo "## Files Kept (Progressive Enhancement)"
    echo "### Property Photos (JPG + WebP pairs)"
    for photo in "${photo_groups[@]}"; do
        echo "- images/new/${photo}-1200.jpg + .webp"
    done
    echo ""
    echo "### Panoramic Images (JPG + WebP pairs)"
    for pano in "${pano_files[@]}"; do
        echo "- images/panos/${pano}.jpg + .webp"
    done
    echo ""
    echo "### Diagrams"
    echo "- images/misc/epc-graph.png"
    echo ""
    echo "## Benefits"
    echo "- Universal compatibility (JPG fallback)"
    echo "- Modern performance (WebP for capable browsers)"
    echo "- Perfect for property websites"
    echo "- SEO and social media optimized"
    echo "- Image sharing friendly"
    echo ""
    echo "## Implementation"
    echo "Update HTML to use <picture> elements for automatic format selection"
} > "S3_HYBRID_CLEANUP_REPORT_$(date +%Y%m%d).md"

echo "📄 Report saved: S3_HYBRID_CLEANUP_REPORT_$(date +%Y%m%d).md"
