#!/bin/bash

# S3 Duplicate Cleanup Script for Apple Cottage
# Based on the duplicate analysis results

set -e
AWS_PROFILE=smustafa

echo "🧹 S3 Duplicate Cleanup for Apple Cottage"
echo "========================================"
echo ""

echo "⚠️  IMPORTANT: This script will show you commands to remove duplicates."
echo "   Review each command carefully before executing!"
echo ""

# Function to calculate storage savings
calculate_savings() {
    echo "💾 POTENTIAL STORAGE SAVINGS:"
    echo "----------------------------"
    
    # True duplicates (identical content)
    echo "🔐 True Duplicates (identical files):"
    echo "   Remove: images/exterior/pano-garden-2-exterior-view-370160A9.jpeg (1005.8 KiB)"
    echo "   Keep: images/exterior/pano-garden-1-exterior-view-2FF85833.jpeg"
    echo "   Savings: ~1.0 MiB"
    echo ""
    
    # Multiple format duplicates - these are intentional for web optimization
    echo "🌐 Multiple Format Files (WebP/AVIF optimizations):"
    echo "   These provide web performance benefits by offering multiple formats"
    echo "   Modern browsers can choose the most efficient format"
    echo "   Consider keeping all formats for optimal web performance"
    echo ""
    
    echo "📊 Breakdown by category:"
    echo "   • True duplicates: ~1.0 MiB savings"
    echo "   • Multi-format files: Keep for web optimization"
    echo "   • Size-based matches: Need manual review"
}

echo "🎯 DUPLICATE ANALYSIS RESULTS:"
echo "=============================="

echo ""
echo "1️⃣ TRUE DUPLICATES (Identical Content) - SAFE TO REMOVE:"
echo "--------------------------------------------------------"
echo "These files are identical and one copy can be safely removed:"
echo ""

echo "🔄 Identical files found:"
echo "aws s3 rm s3://apple-cottage-media-eu/images/exterior/pano-garden-2-exterior-view-370160A9.jpeg"
echo "# Keep: images/exterior/pano-garden-1-exterior-view-2FF85833.jpeg (same content)"
echo ""

echo "2️⃣ SUSPICIOUS SIZE MATCHES - MANUAL REVIEW NEEDED:"
echo "--------------------------------------------------"
echo "These files have identical sizes but may have different content:"
echo ""

echo "🔍 Interior images (438,368 bytes each) - REVIEW NEEDED:"
echo "# aws s3 cp s3://apple-cottage-media-eu/images/interior/interior-main-4D0D375F.jpeg /tmp/check1.jpg"
echo "# aws s3 cp s3://apple-cottage-media-eu/images/interior/interior-main-B5C1F5E1.jpeg /tmp/check2.jpg"  
echo "# aws s3 cp s3://apple-cottage-media-eu/images/interior/interior-main-CBE462F3.jpeg /tmp/check3.jpg"
echo "# Compare visually or use: diff /tmp/check1.jpg /tmp/check2.jpg"
echo ""

echo "3️⃣ MULTI-FORMAT FILES - KEEP FOR WEB OPTIMIZATION:"
echo "--------------------------------------------------"
echo "These are the same image in different formats (JPG/WebP/AVIF)"
echo "Modern web practices use multiple formats for browser optimization"
echo "🌐 RECOMMENDATION: Keep all formats for best web performance"
echo ""

echo "Examples of multi-format sets (showing largest file in each set):"
echo "• images/new/garden-centre-1200.jpg + WebP + AVIF variants"
echo "• images/new/garden-corner-1200.jpg + WebP + AVIF variants"  
echo "• images/new/street-left-1200.jpg + WebP + AVIF variants"
echo "• images/panos/*.jpg + *.webp variants"
echo ""

echo "4️⃣ RECOMMENDED CLEANUP ACTIONS:"
echo "==============================="

echo ""
echo "🎯 SAFE TO REMOVE (True Duplicates):"
echo "------------------------------------"
echo "AWS_PROFILE=smustafa aws s3 rm s3://apple-cottage-media-eu/images/exterior/pano-garden-2-exterior-view-370160A9.jpeg"
echo ""

echo "❓ MANUAL REVIEW REQUIRED:"
echo "-------------------------"
echo "# Download and visually compare these files:"
echo "AWS_PROFILE=smustafa aws s3 cp s3://apple-cottage-media-eu/images/interior/interior-main-4D0D375F.jpeg /tmp/"
echo "AWS_PROFILE=smustafa aws s3 cp s3://apple-cottage-media-eu/images/interior/interior-main-B5C1F5E1.jpeg /tmp/"
echo "AWS_PROFILE=smustafa aws s3 cp s3://apple-cottage-media-eu/images/interior/interior-main-CBE462F3.jpeg /tmp/"
echo ""
echo "# If they are identical, remove duplicates:"
echo "# AWS_PROFILE=smustafa aws s3 rm s3://apple-cottage-media-eu/images/interior/interior-main-[duplicate].jpeg"
echo ""

echo "✅ KEEP (Web Optimization):"
echo "---------------------------"
echo "All multi-format files should be kept for optimal web performance"
echo "This includes all JPG/WebP/AVIF variants and different resolutions"
echo ""

calculate_savings

echo ""
echo "🚀 EXECUTION INSTRUCTIONS:"
echo "=========================="
echo ""
echo "1. Review this analysis carefully"
echo "2. Execute the safe removal commands above"
echo "3. Manually review the suspicious size matches"
echo "4. Keep all multi-format variants for web performance"
echo ""

echo "💡 To execute the safe cleanup:"
echo 'read -p "Remove confirmed duplicate? (y/n): " -n 1 -r'
echo 'if [[ $REPLY =~ ^[Yy]$ ]]; then'
echo '    echo "Removing duplicate file..."'
echo '    AWS_PROFILE=smustafa aws s3 rm s3://apple-cottage-media-eu/images/exterior/pano-garden-2-exterior-view-370160A9.jpeg'
echo '    echo "✅ Duplicate removed!"'
echo 'else'
echo '    echo "Skipped removal"'
echo 'fi'

echo ""
echo "📊 Final bucket status after cleanup:"
echo "AWS_PROFILE=smustafa aws s3 ls s3://apple-cottage-media-eu/images/ --recursive --human-readable --summarize"
