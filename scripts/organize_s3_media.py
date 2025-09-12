#!/usr/bin/env python3
"""
Script to analyze and organize media files in S3 bucket
"""

import subprocess
import json
import re
from datetime import datetime
from typing import Dict, List, Tuple

def run_aws_command(command: List[str]) -> str:
    """Run AWS CLI command and return output"""
    try:
        import os
        env = os.environ.copy()
        env['AWS_PROFILE'] = 'smustafa'
        
        # Ensure we use the full path to aws
        command[0] = '/usr/local/bin/aws'
        
        result = subprocess.run(command, capture_output=True, text=True, env=env)
        if result.returncode != 0:
            print(f"Error running command: {' '.join(command)}")
            print(f"Error: {result.stderr}")
            return ""
        return result.stdout
    except Exception as e:
        print(f"Exception running command: {e}")
        return ""

def parse_file_size(size_str: str) -> int:
    """Convert human readable size to bytes"""
    size_str = size_str.strip()
    if size_str.endswith('KiB'):
        return int(float(size_str[:-3]) * 1024)
    elif size_str.endswith('MiB'):
        return int(float(size_str[:-3]) * 1024 * 1024)
    elif size_str.endswith('GiB'):
        return int(float(size_str[:-3]) * 1024 * 1024 * 1024)
    elif size_str.endswith('Bytes'):
        return int(float(size_str[:-5]))
    else:
        # Handle plain numbers with possible decimal
        try:
            return int(float(size_str))
        except ValueError:
            print(f"Warning: Could not parse size '{size_str}', defaulting to 0")
            return 0

def categorize_by_filename(filename: str) -> Tuple[str, str]:
    """Categorize file based on filename patterns and suggest new name"""
    
    # Extract file extension
    ext = filename.split('.')[-1].lower()
    base_name = filename.replace(f'.{ext}', '')
    
    # Analyze filename patterns
    if '_105_c' in filename:
        # Compressed/thumbnail version
        category = 'interior'
        suggested_name = f"interior-detail-{base_name[:8]}.{ext}"
    elif '_102_o' in filename:
        # Original/high quality version
        category = 'exterior' if 'exterior' not in filename else 'interior'
        suggested_name = f"property-view-{base_name[:8]}.{ext}"
    elif '_201_a' in filename:
        # Apple's automatic enhancement
        category = 'exterior'
        suggested_name = f"enhanced-view-{base_name[:8]}.{ext}"
    elif '4_5005_c' in filename:
        # Heavily compressed version
        category = 'misc'
        suggested_name = f"thumbnail-{base_name[:8]}.{ext}"
    else:
        # Default categorization
        category = 'misc'
        suggested_name = f"misc-{base_name[:8]}.{ext}"
    
    return category, suggested_name

def categorize_by_size(size_bytes: int) -> str:
    """Categorize file based on size"""
    if size_bytes > 800 * 1024:  # > 800KB likely exterior/main photos
        return 'exterior'
    elif size_bytes > 200 * 1024:  # 200KB-800KB likely interior photos
        return 'interior'
    else:  # < 200KB likely thumbnails or misc
        return 'misc'

def analyze_unorganized_files():
    """Analyze all unorganized files and suggest organization"""
    
    # Get list of unorganized files
    output = run_aws_command([
        'aws', 's3', 'ls', 's3://apple-cottage-media-eu/images/unorganized/', 
        '--human-readable', '--recursive'
    ])
    
    if not output:
        print("No files found or error accessing S3")
        return
    
    files_data = []
    
    for line in output.strip().split('\n'):
        if not line.strip():
            continue
            
        parts = line.split()
        if len(parts) < 4:
            continue
            
        date = parts[0]
        time = parts[1]
        size = parts[2]
        filename = parts[3].split('/')[-1]  # Get just the filename
        
        size_bytes = parse_file_size(size)
        
        # Get category suggestions
        filename_category, suggested_name = categorize_by_filename(filename)
        size_category = categorize_by_size(size_bytes)
        
        # Final category (prefer filename analysis over size)
        final_category = filename_category if filename_category != 'misc' else size_category
        
        files_data.append({
            'original_name': filename,
            'suggested_name': suggested_name,
            'category': final_category,
            'size_bytes': size_bytes,
            'size_human': size,
            'date': date,
            'time': time
        })
    
    # Sort by category and size
    files_data.sort(key=lambda x: (x['category'], -x['size_bytes']))
    
    # Print analysis
    print("=== S3 Media Organization Analysis ===\n")
    
    categories = {}
    for file_info in files_data:
        cat = file_info['category']
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(file_info)
    
    for category, files in categories.items():
        print(f"\n📁 {category.upper()} ({len(files)} files):")
        print("-" * 50)
        
        for file_info in files:
            print(f"  {file_info['original_name']}")
            print(f"    → {file_info['suggested_name']}")
            print(f"    Size: {file_info['size_human']} ({file_info['size_bytes']:,} bytes)")
            print(f"    Date: {file_info['date']} {file_info['time']}")
            print()
    
    # Generate organization commands
    print("\n=== Organization Commands ===\n")
    
    for category, files in categories.items():
        print(f"# Moving {len(files)} files to images/{category}/")
        
        for file_info in files:
            old_path = f"s3://apple-cottage-media-eu/images/unorganized/{file_info['original_name']}"
            new_path = f"s3://apple-cottage-media-eu/images/{category}/{file_info['suggested_name']}"
            
            print(f"AWS_PROFILE=smustafa aws s3 mv '{old_path}' '{new_path}'")
        print()
    
    return files_data

if __name__ == "__main__":
    analyze_unorganized_files()
