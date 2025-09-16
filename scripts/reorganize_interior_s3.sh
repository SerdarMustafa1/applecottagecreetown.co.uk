#!/bin/bash

# Script to reorganize interior images in S3 based on naming conventions
# Usage: bash scripts/reorganize_interior_s3.sh

set -e

BUCKET="apple-cottage-media-eu"
BASE_PATH="images/interior"

echo "=== Reorganizing Interior Images in S3 ==="
echo "Bucket: $BUCKET"
echo "Base path: $BASE_PATH"
echo ""

# Get all files in the interior folder
echo "📋 Scanning current interior folder structure..."
interior_files=$(aws s3 ls s3://$BUCKET/$BASE_PATH/ --recursive | grep -v "/$" | awk '{print $4}')

if [[ -z "$interior_files" ]]; then
    echo "❌ No files found in $BASE_PATH/"
    exit 1
fi

echo "Found $(echo "$interior_files" | wc -l) files in interior folder"
echo ""

# Arrays to store file movements
declare -a kitchen_files=()
declare -a bathroom_files=()
declare -a bedroom_files=()
declare -a living_files=()
declare -a conservatory_files=()
declare -a hallway_files=()
declare -a other_files=()

# Analyze each file and categorize
echo "🔍 Analyzing files for categorization..."
while IFS= read -r file_path; do
    # Extract just the filename from the full path
    filename=$(basename "$file_path")
    
    # Skip if already in a subfolder
    if [[ "$file_path" == *"/"*"/"* ]]; then
        subfolder=$(echo "$file_path" | cut -d'/' -f3)
        if [[ "$subfolder" != "interior" ]]; then
            echo "  ⏭️  Skipping $filename (already in $subfolder/)"
            continue
        fi
    fi
    
    # Categorize based on filename patterns
    if [[ "$filename" =~ (kitchen|kitch) ]]; then
        kitchen_files+=("$file_path:kitchen/$filename")
    elif [[ "$filename" =~ (bathroom|bath) ]]; then
        bathroom_files+=("$file_path:bathroom/$filename")
    elif [[ "$filename" =~ (bedroom|bed|master) ]]; then
        bedroom_files+=("$file_path:bedrooms/$filename")
    elif [[ "$filename" =~ (lounge|living|conservatory) ]]; then
        living_files+=("$file_path:living/$filename")
    elif [[ "$filename" =~ (hallway|hall|entrance) ]]; then
        hallway_files+=("$file_path:hallway/$filename")
    else
        other_files+=("$file_path:general/$filename")
    fi
done <<< "$interior_files"

echo ""
echo "📊 Categorization Summary:"
echo "  Kitchen: ${#kitchen_files[@]} files"
echo "  Bathroom: ${#bathroom_files[@]} files"
echo "  Bedrooms: ${#bedroom_files[@]} files"
echo "  Living areas: ${#living_files[@]} files"
echo "  Hallway: ${#hallway_files[@]} files"
echo "  General: ${#other_files[@]} files"
echo ""

# Function to move files
move_files() {
    local category="$1"
    local -n files_array=$2
    
    if [[ ${#files_array[@]} -gt 0 ]]; then
        echo "📁 Moving ${#files_array[@]} files to $category/..."
        for file_info in "${files_array[@]}"; do
            IFS=':' read -r original_path new_path <<< "$file_info"
            echo "  Moving $(basename "$original_path") → $new_path"
            
            # Create the destination path
            dest_path="s3://$BUCKET/$BASE_PATH/$new_path"
            src_path="s3://$BUCKET/$original_path"
            
            # Move the file
            aws s3 mv "$src_path" "$dest_path"
        done
        echo ""
    fi
}

# Confirm before proceeding
echo "🚨 This will reorganize files in S3. Continue? (y/N)"
read -r confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "❌ Operation cancelled"
    exit 0
fi

echo ""
echo "🚀 Starting file reorganization..."

# Move files by category
move_files "kitchen" kitchen_files
move_files "bathroom" bathroom_files
move_files "bedrooms" bedroom_files
move_files "living" living_files
move_files "hallway" hallway_files
move_files "general" other_files

echo "✅ Reorganization complete!"
echo ""

# Show final structure
echo "📁 Final interior folder structure:"
aws s3 ls s3://$BUCKET/$BASE_PATH/ | grep "PRE" | awk '{print "  " $2}' || echo "  (no subfolders found)"

echo ""
echo "📊 File counts by subfolder:"
for subfolder in kitchen bathroom bedrooms living hallway general; do
    count=$(aws s3 ls s3://$BUCKET/$BASE_PATH/$subfolder/ --recursive 2>/dev/null | grep -v "/$" | wc -l || echo "0")
    if [[ $count -gt 0 ]]; then
        echo "  $subfolder: $count files"
    fi
done

echo ""
echo "🎉 Interior images reorganization complete!"