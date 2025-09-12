#!/bin/bash

# S3 Media Organization Script for Apple Cottage
# This script categorizes and renames files in the unorganized folder based on size and Apple's naming patterns

set -e

AWS_PROFILE=smustafa

echo "=== Apple Cottage S3 Media Organization ==="
echo ""

# Function to determine category based on file size and Apple naming patterns
categorize_file() {
    local filename="$1"
    local size_bytes="$2"
    
    local category=""
    local new_name=""
    
    # Extract base identifier (first 8 chars of UUID)
    local base_id=$(echo "$filename" | cut -d'-' -f1)
    
    # Categorize based on Apple's naming patterns
    if [[ "$filename" == *"_105_c"* ]]; then
        # Compressed/edited version - likely interior details
        if [[ $size_bytes -gt 200000 ]]; then
            category="interior"
            new_name="interior-room-${base_id}.jpeg"
        else
            category="interior" 
            new_name="interior-detail-${base_id}.jpeg"
        fi
    elif [[ "$filename" == *"_102_o"* ]]; then
        # Original version - likely main photos
        if [[ $size_bytes -gt 800000 ]]; then
            category="exterior"
            new_name="exterior-view-${base_id}.jpeg"
        else
            category="interior"
            new_name="interior-main-${base_id}.jpeg"
        fi
    elif [[ "$filename" == *"_201_a"* ]]; then
        # Auto-enhanced version - likely exterior
        category="exterior"
        new_name="exterior-enhanced-${base_id}.jpeg"
    elif [[ "$filename" == *"_102_a"* ]]; then
        # Edited original - likely main property photos
        category="exterior"
        new_name="property-main-${base_id}.jpeg"
    elif [[ "$filename" == *"4_5005_c"* ]] || [[ "$filename" == *"5005_c"* ]]; then
        # Heavily compressed thumbnail
        category="misc"
        new_name="thumbnail-${base_id}.jpeg"
    elif [[ "$filename" == *".heic" ]]; then
        # HEIC format - likely newer iPhone photos
        category="exterior"
        new_name="property-heic-${base_id}.heic"
    else
        # Default categorization by size
        if [[ $size_bytes -gt 1000000 ]]; then
            category="exterior"
            new_name="large-view-${base_id}.jpeg"
        elif [[ $size_bytes -gt 300000 ]]; then
            category="interior"
            new_name="room-view-${base_id}.jpeg"
        else
            category="misc"
            new_name="misc-${base_id}.jpeg"
        fi
    fi
    
    echo "$category:$new_name"
}

# Create the destination folders if they don't exist
echo "Creating destination folders..."
aws s3 ls s3://apple-cottage-media-eu/images/exterior/ > /dev/null 2>&1 || echo "exterior folder already exists or will be created on first upload"
aws s3 ls s3://apple-cottage-media-eu/images/interior/ > /dev/null 2>&1 || echo "interior folder already exists"
aws s3 ls s3://apple-cottage-media-eu/images/misc/ > /dev/null 2>&1 || echo "misc folder already exists"

echo ""
echo "Analyzing unorganized files..."

# Get all unorganized files
files_info=$(aws s3 ls s3://apple-cottage-media-eu/images/unorganized/ --recursive | grep -v "/$")

# Arrays to store file information by category
declare -a exterior_files
declare -a interior_files  
declare -a misc_files

# Process each file
while IFS= read -r line; do
    if [[ -z "$line" ]]; then
        continue
    fi
    
    # Parse the line: date time size path
    read -r date time size_bytes full_path <<< "$line"
    filename=$(basename "$full_path")
    
    if [[ -z "$filename" ]] || [[ "$filename" == "unorganized" ]]; then
        continue
    fi
    
    # Get category and new name
    category_result=$(categorize_file "$filename" "$size_bytes")
    category=$(echo "$category_result" | cut -d':' -f1)
    new_name=$(echo "$category_result" | cut -d':' -f2)
    
    # Store in appropriate array
    case $category in
        exterior)
            exterior_files+=("$filename:$new_name:$size_bytes")
            ;;
        interior)
            interior_files+=("$filename:$new_name:$size_bytes")
            ;;
        misc)
            misc_files+=("$filename:$new_name:$size_bytes")
            ;;
    esac
    
done <<< "$files_info"

# Display categorization results
echo ""
echo "=== Categorization Results ==="
echo ""
echo "📁 EXTERIOR (${#exterior_files[@]} files):"
for file_info in "${exterior_files[@]}"; do
    IFS=':' read -r original new_name size <<< "$file_info"
    printf "  %-50s → %-40s (%s bytes)\n" "$original" "$new_name" "$size"
done

echo ""
echo "🏠 INTERIOR (${#interior_files[@]} files):"
for file_info in "${interior_files[@]}"; do
    IFS=':' read -r original new_name size <<< "$file_info"
    printf "  %-50s → %-40s (%s bytes)\n" "$original" "$new_name" "$size"
done

echo ""
echo "📋 MISC (${#misc_files[@]} files):"
for file_info in "${misc_files[@]}"; do
    IFS=':' read -r original new_name size <<< "$file_info"
    printf "  %-50s → %-40s (%s bytes)\n" "$original" "$new_name" "$size"
done

echo ""
echo "=== Moving files to organized folders ==="
echo ""

# Move exterior files
if [[ ${#exterior_files[@]} -gt 0 ]]; then
    echo "Moving ${#exterior_files[@]} files to images/exterior/..."
    for file_info in "${exterior_files[@]}"; do
        IFS=':' read -r original new_name size <<< "$file_info"
        echo "  Moving $original → $new_name"
        aws s3 mv "s3://apple-cottage-media-eu/images/unorganized/$original" "s3://apple-cottage-media-eu/images/exterior/$new_name"
    done
    echo ""
fi

# Move interior files  
if [[ ${#interior_files[@]} -gt 0 ]]; then
    echo "Moving ${#interior_files[@]} files to images/interior/..."
    for file_info in "${interior_files[@]}"; do
        IFS=':' read -r original new_name size <<< "$file_info"
        echo "  Moving $original → $new_name"
        aws s3 mv "s3://apple-cottage-media-eu/images/unorganized/$original" "s3://apple-cottage-media-eu/images/interior/$new_name"
    done
    echo ""
fi

# Move misc files
if [[ ${#misc_files[@]} -gt 0 ]]; then
    echo "Moving ${#misc_files[@]} files to images/misc/..."
    for file_info in "${misc_files[@]}"; do
        IFS=':' read -r original new_name size <<< "$file_info"
        echo "  Moving $original → $new_name"
        aws s3 mv "s3://apple-cottage-media-eu/images/unorganized/$original" "s3://apple-cottage-media-eu/images/misc/$new_name"
    done
    echo ""
fi

echo "=== Organization Complete ==="
echo ""
echo "Verifying unorganized folder is empty..."
remaining=$(aws s3 ls s3://apple-cottage-media-eu/images/unorganized/ --recursive | grep -v "/$" | wc -l)
echo "Remaining unorganized files: $remaining"

if [[ $remaining -eq 0 ]]; then
    echo "✅ All files successfully organized!"
else
    echo "⚠️  $remaining files still in unorganized folder"
fi

echo ""
echo "=== Final folder structure ==="
echo "📁 Images folder contents:"
aws s3 ls s3://apple-cottage-media-eu/images/ | grep "PRE" | awk '{print "  " $2}'

echo ""
echo "📊 File counts by folder:"
for folder in exterior interior misc new panos unorganized; do
    count=$(aws s3 ls s3://apple-cottage-media-eu/images/$folder/ --recursive 2>/dev/null | grep -v "/$" | wc -l || echo "0")
    echo "  $folder: $count files"
done
