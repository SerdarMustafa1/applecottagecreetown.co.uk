#!/bin/bash

# Verification script for S3 Media Reorganization
# Checks that all expected files are in their correct locations with uniform naming

set -e

BUCKET="apple-cottage-media-eu"
BASE_PATH="images/interior"

echo "=== S3 Media Organization Verification ==="
echo "Bucket: $BUCKET"
echo "Base path: $BASE_PATH"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a file exists and report status
check_file() {
    local file_path="$1"
    local description="$2"
    local expected="$3" # true if file should exist, false if it should NOT exist
    
    if aws s3 ls "s3://$BUCKET/$file_path" >/dev/null 2>&1; then
        if [ "$expected" = "true" ]; then
            echo -e "${GREEN}✅ FOUND:${NC} $file_path ($description)"
        else
            echo -e "${RED}❌ UNEXPECTED:${NC} $file_path ($description) - should have been moved/renamed"
        fi
    else
        if [ "$expected" = "true" ]; then
            echo -e "${RED}❌ MISSING:${NC} $file_path ($description)"
        else
            echo -e "${GREEN}✅ CORRECTLY ABSENT:${NC} $file_path ($description) - properly moved/renamed"
        fi
    fi
}

# Function to check folder structure
check_folder() {
    local folder_path="$1"
    local description="$2"
    
    echo -e "${BLUE}📁 Checking folder:${NC} $folder_path ($description)"
    if aws s3 ls "s3://$BUCKET/$folder_path/" >/dev/null 2>&1; then
        local file_count=$(aws s3 ls "s3://$BUCKET/$folder_path/" --recursive 2>/dev/null | grep -v "/$" | wc -l)
        echo -e "   ${GREEN}$file_count files found${NC}"
        
        # List files in folder for verification
        aws s3 ls "s3://$BUCKET/$folder_path/" --recursive 2>/dev/null | grep -v "/$" | while read -r line; do
            local filename=$(echo "$line" | awk '{print $4}' | sed "s|$folder_path/||")
            echo -e "   - ${filename}"
        done
    else
        echo -e "   ${YELLOW}Folder empty or not found${NC}"
    fi
    echo ""
}

echo "🏗️  CHECKING NEW FOLDER STRUCTURE..."
echo "==================================="

check_folder "$BASE_PATH/conservatory" "Conservatory dedicated folder"
check_folder "$BASE_PATH/lounge" "Lounge dedicated folder"  
check_folder "$BASE_PATH/zen-room" "Zen room dedicated folder"

echo "✅ CHECKING EXPECTED FILES IN NEW LOCATIONS..."
echo "=============================================="

# New conservatory files
check_file "$BASE_PATH/conservatory/conservatory-main.jpg" "Main conservatory image" "true"
check_file "$BASE_PATH/conservatory/conservatory-360-poster.jpg" "Conservatory 360° poster" "true"
check_file "$BASE_PATH/conservatory/conservatory-view.jpg" "Conservatory interior view" "true"

# New lounge files
check_file "$BASE_PATH/lounge/lounge-main.jpg" "Main lounge image" "true"
check_file "$BASE_PATH/lounge/lounge-360-poster.jpg" "Lounge 360° poster" "true"
check_file "$BASE_PATH/lounge/lounge-fireplace.jpg" "Lounge with fireplace" "true"

# New zen room files
check_file "$BASE_PATH/zen-room/zen-room-main.jpg" "Main zen room image" "true"

# Fixed kitchen file
check_file "$BASE_PATH/kitchen/kitchen-workspace.jpg" "Kitchen workspace (was misorganized)" "true"

echo ""
echo "❌ CHECKING OLD FILES (SHOULD BE ABSENT)..."
echo "==========================================="

# Old files that should have been moved/renamed
check_file "$BASE_PATH/conservatory-1.jpg" "Old conservatory file" "false"
check_file "$BASE_PATH/lounge-3.jpg" "Old lounge file" "false"
check_file "$BASE_PATH/zen-room-1.jpg" "Old zen room file (root level)" "false"
check_file "$BASE_PATH/other/zen-room-1.jpg" "Old zen room file (other folder)" "false"
check_file "$BASE_PATH/living/conservatory-1.jpg" "Old conservatory file (living folder)" "false"
check_file "$BASE_PATH/living/lounge-3.jpg" "Old lounge file (living folder)" "false"
check_file "$BASE_PATH/interior-room-32A352BB.jpeg" "Old misorganized kitchen file" "false"
check_file "$BASE_PATH/interior-room-3B60CBFF.jpeg" "Old lounge file with hex name" "false"
check_file "$BASE_PATH/interior-room-93B1365C.jpeg" "Old conservatory file with hex name" "false"

echo ""
echo "📊 NAMING CONVENTION VERIFICATION..."
echo "===================================="

echo "Checking for uniform .jpg extensions and descriptive names..."

# Check for any remaining .jpeg files (should be converted to .jpg)
echo "Scanning for any remaining .jpeg files..."
jpeg_files=$(aws s3 ls "s3://$BUCKET/$BASE_PATH/" --recursive 2>/dev/null | grep "\.jpeg" | wc -l || echo "0")
if [ "$jpeg_files" -eq 0 ]; then
    echo -e "${GREEN}✅ No .jpeg files found - all converted to .jpg${NC}"
else
    echo -e "${YELLOW}⚠️  Found $jpeg_files .jpeg files that may need conversion${NC}"
    aws s3 ls "s3://$BUCKET/$BASE_PATH/" --recursive 2>/dev/null | grep "\.jpeg" | while read -r line; do
        echo -e "   - $(echo "$line" | awk '{print $4}')"
    done
fi

# Check for hex-pattern files (should be renamed to descriptive names)
echo ""
echo "Scanning for files with hex patterns..."
hex_files=$(aws s3 ls "s3://$BUCKET/$BASE_PATH/" --recursive 2>/dev/null | grep -E "\-[A-F0-9]{8}\." | wc -l || echo "0")
if [ "$hex_files" -eq 0 ]; then
    echo -e "${GREEN}✅ No hex-pattern files found - all use descriptive names${NC}"
else
    echo -e "${YELLOW}⚠️  Found $hex_files files with hex patterns that may need renaming${NC}"
    aws s3 ls "s3://$BUCKET/$BASE_PATH/" --recursive 2>/dev/null | grep -E "\-[A-F0-9]{8}\." | while read -r line; do
        echo -e "   - $(echo "$line" | awk '{print $4}')"
    done
fi

echo ""
echo "🎯 OVERALL FOLDER STRUCTURE..."
echo "============================="

echo "Final directory structure:"
aws s3 ls "s3://$BUCKET/$BASE_PATH/" 2>/dev/null | grep "PRE" | awk '{print "📁 " $2}' | sort

echo ""
echo "📈 FOLDER STATISTICS..."
echo "====================="

for folder in conservatory lounge zen-room kitchen bathroom bedrooms living hallway utility general panos; do
    if aws s3 ls "s3://$BUCKET/$BASE_PATH/$folder/" >/dev/null 2>&1; then
        count=$(aws s3 ls "s3://$BUCKET/$BASE_PATH/$folder/" --recursive 2>/dev/null | grep -v "/$" | wc -l || echo "0")
        echo "   $folder/: $count files"
    fi
done

echo ""
echo "✅ Verification complete!"
echo ""
echo "📋 NEXT STEPS:"
echo "  1. Review any issues reported above"
echo "  2. Test site.config.ts file path references"
echo "  3. Verify images load correctly on the website"