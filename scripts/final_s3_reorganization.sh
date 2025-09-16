#!/bin/bash

# Final S3 Media Reorganization Script
# Separates conservatory, lounge, and zen room into dedicated folders
# Ensures proper naming conventions and file locations

set -e

BUCKET="apple-cottage-media-eu"
BASE_PATH="images/interior"

echo "=== Final S3 Media Reorganization ==="
echo "Bucket: $BUCKET"
echo "Base path: $BASE_PATH"
echo ""

# Create the new folder structure
echo "📁 Creating new folder structure..."
echo "  - conservatory/"
echo "  - lounge/" 
echo "  - zen-room/"
echo ""

# Function to move files with validation
move_file() {
    local src_path="$1"
    local dest_path="$2"
    local description="$3"
    
    echo "Moving: $description"
    echo "  FROM: s3://$BUCKET/$src_path"
    echo "  TO:   s3://$BUCKET/$dest_path"
    
    # Check if source exists before moving
    if aws s3 ls "s3://$BUCKET/$src_path" >/dev/null 2>&1; then
        aws s3 mv "s3://$BUCKET/$src_path" "s3://$BUCKET/$dest_path"
        echo "  ✅ Moved successfully"
    else
        echo "  ⚠️  Source file not found: $src_path"
    fi
    echo ""
}

echo "🏠 CONSERVATORY FILES - Moving to dedicated folder..."
echo "=================================================="
move_file "$BASE_PATH/conservatory-1.jpg" "$BASE_PATH/conservatory/conservatory-main.jpg" "Main conservatory image"
move_file "$BASE_PATH/conservatory-360-poster.jpg" "$BASE_PATH/conservatory/conservatory-360-poster.jpg" "Conservatory 360° poster"
move_file "$BASE_PATH/living/conservatory-1.jpg" "$BASE_PATH/conservatory/conservatory-main.jpg" "Main conservatory image (from living folder)"
move_file "$BASE_PATH/living/conservatory-360-poster.jpg" "$BASE_PATH/conservatory/conservatory-360-poster.jpg" "Conservatory 360° poster (from living folder)"

echo "🛋️  LOUNGE FILES - Moving to dedicated folder..."
echo "=============================================="
move_file "$BASE_PATH/lounge-3.jpg" "$BASE_PATH/lounge/lounge-main.jpg" "Main lounge image"
move_file "$BASE_PATH/lounge-360-poster.jpg" "$BASE_PATH/lounge/lounge-360-poster.jpg" "Lounge 360° poster"
move_file "$BASE_PATH/living/lounge-3.jpg" "$BASE_PATH/lounge/lounge-main.jpg" "Main lounge image (from living folder)"
move_file "$BASE_PATH/living/lounge-360-poster.jpg" "$BASE_PATH/lounge/lounge-360-poster.jpg" "Lounge 360° poster (from living folder)"

echo "🧘 ZEN ROOM FILES - Moving to dedicated folder..."
echo "==============================================="
move_file "$BASE_PATH/zen-room-1.jpg" "$BASE_PATH/zen-room/zen-room-main.jpg" "Main zen room image"
move_file "$BASE_PATH/other/zen-room-1.jpg" "$BASE_PATH/zen-room/zen-room-main.jpg" "Main zen room image (from other folder)"

echo "🔄 MISORGANIZED FILES - Moving to correct locations..."
echo "====================================================="

# Check for any interior-room files that might need categorization
echo "Checking for misorganized interior-room files..."

# Files that should be in specific rooms based on site.config.ts analysis
move_file "$BASE_PATH/interior-room-32A352BB.jpeg" "$BASE_PATH/kitchen/kitchen-workspace.jpg" "Kitchen workspace (was misorganized)"
move_file "$BASE_PATH/general/interior-room-32A352BB.jpeg" "$BASE_PATH/kitchen/kitchen-workspace.jpg" "Kitchen workspace (from general folder)"
move_file "$BASE_PATH/kitchen/interior-room-32A352BB.jpeg" "$BASE_PATH/kitchen/kitchen-workspace.jpg" "Kitchen workspace (rename for consistency)"

move_file "$BASE_PATH/interior-room-3B60CBFF.jpeg" "$BASE_PATH/lounge/lounge-fireplace.jpg" "Lounge with fireplace"
move_file "$BASE_PATH/general/interior-room-3B60CBFF.jpeg" "$BASE_PATH/lounge/lounge-fireplace.jpg" "Lounge with fireplace (from general)"

move_file "$BASE_PATH/interior-room-93B1365C.jpeg" "$BASE_PATH/conservatory/conservatory-view.jpg" "Conservatory view"
move_file "$BASE_PATH/general/interior-room-93B1365C.jpeg" "$BASE_PATH/conservatory/conservatory-view.jpg" "Conservatory view (from general)"

echo "📋 FINAL STRUCTURE VERIFICATION..."
echo "================================="
echo "Checking final folder structure:"

for folder in conservatory lounge zen-room kitchen bathroom bedrooms living hallway utility general panos; do
    echo "📁 $folder/:"
    if aws s3 ls "s3://$BUCKET/$BASE_PATH/$folder/" 2>/dev/null; then
        file_count=$(aws s3 ls "s3://$BUCKET/$BASE_PATH/$folder/" --recursive 2>/dev/null | grep -v "/$" | wc -l)
        echo "   $file_count files"
    else
        echo "   (folder not found or empty)"
    fi
    echo ""
done

echo "✅ Final S3 Media Reorganization Complete!"
echo ""
echo "🎯 SUMMARY:"
echo "  • Conservatory files moved to dedicated /conservatory/ folder"
echo "  • Lounge files moved to dedicated /lounge/ folder"
echo "  • Zen room files moved to dedicated /zen-room/ folder"
echo "  • Misorganized files moved to correct locations with proper naming"
echo "  • All files follow uniform naming convention"
echo ""
echo "⚠️  IMPORTANT: Update site.config.ts file paths after running this script!"