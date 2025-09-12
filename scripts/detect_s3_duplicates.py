#!/usr/bin/env python3
"""
S3 Duplicate Image Detection Script for Apple Cottage
Detects duplicate images based on file size, name patterns, and content hashes
"""

import subprocess
import json
import hashlib
import re
from collections import defaultdict
from typing import Dict, List, Tuple, Set
import os

def run_aws_command(command: List[str]) -> str:
    """Run AWS CLI command and return output"""
    try:
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

def get_all_image_files() -> List[Dict]:
    """Get all image files from S3 bucket"""
    print("📁 Scanning S3 bucket for image files...")
    
    output = run_aws_command([
        'aws', 's3', 'ls', 's3://apple-cottage-media-eu/', 
        '--recursive'
    ])
    
    if not output:
        return []
    
    image_files = []
    image_extensions = {'.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.avif', '.heic'}
    
    for line in output.strip().split('\n'):
        if not line.strip():
            continue
            
        parts = line.split()
        if len(parts) < 4:
            continue
            
        date = parts[0]
        time = parts[1]
        size_bytes = int(parts[2])  # Size is in bytes without human-readable flag
        full_path = parts[3]
        
        # Extract filename and check if it's an image
        filename = os.path.basename(full_path)
        file_ext = os.path.splitext(filename)[1].lower()
        
        if file_ext in image_extensions:
            # Convert size to human readable
            if size_bytes > 1024 * 1024:
                size_str = f"{size_bytes / (1024 * 1024):.1f} MiB"
            elif size_bytes > 1024:
                size_str = f"{size_bytes / 1024:.1f} KiB"
            else:
                size_str = f"{size_bytes} bytes"
            
            image_files.append({
                'filename': filename,
                'full_path': full_path,
                'size_bytes': size_bytes,
                'size_str': size_str,
                'date': date,
                'time': time,
                'extension': file_ext
            })
    
    print(f"📊 Found {len(image_files)} image files")
    return image_files

def find_size_duplicates(image_files: List[Dict]) -> Dict[int, List[Dict]]:
    """Find files with identical sizes"""
    size_groups = defaultdict(list)
    
    for file_info in image_files:
        size_groups[file_info['size_bytes']].append(file_info)
    
    # Return only groups with more than one file
    duplicates = {size: files for size, files in size_groups.items() if len(files) > 1}
    
    return duplicates

def find_name_pattern_duplicates(image_files: List[Dict]) -> Dict[str, List[Dict]]:
    """Find files that appear to be the same based on naming patterns"""
    
    # Group by base UUID (first part of Apple's naming scheme)
    uuid_groups = defaultdict(list)
    
    for file_info in image_files:
        filename = file_info['filename']
        
        # Extract UUID pattern (Apple's naming: UUID_format_quality.extension)
        uuid_match = re.match(r'^([A-F0-9]{8}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{12})', filename)
        if uuid_match:
            base_uuid = uuid_match.group(1)
            uuid_groups[base_uuid].append(file_info)
        else:
            # For non-UUID files, group by base name (without resolution/format suffixes)
            base_name = re.sub(r'-\d+\.(jpg|jpeg|png|webp|avif)$', '', filename.lower())
            base_name = re.sub(r'\.(jpg|jpeg|png|webp|avif)$', '', base_name.lower())
            if base_name:
                uuid_groups[f"basename_{base_name}"].append(file_info)
    
    # Return only groups with more than one file
    duplicates = {pattern: files for pattern, files in uuid_groups.items() if len(files) > 1}
    
    return duplicates

def download_and_hash_file(s3_path: str, temp_dir: str = "/tmp") -> str:
    """Download file from S3 and calculate its MD5 hash"""
    local_path = os.path.join(temp_dir, f"s3_temp_{hashlib.md5(s3_path.encode()).hexdigest()}")
    
    try:
        # Download file
        result = run_aws_command([
            'aws', 's3', 'cp', f's3://apple-cottage-media-eu/{s3_path}', local_path
        ])
        
        if not result and not os.path.exists(local_path):
            return ""
        
        # Calculate hash
        with open(local_path, 'rb') as f:
            file_hash = hashlib.md5(f.read()).hexdigest()
        
        # Clean up
        os.remove(local_path)
        
        return file_hash
    
    except Exception as e:
        print(f"Error processing {s3_path}: {e}")
        if os.path.exists(local_path):
            os.remove(local_path)
        return ""

def find_content_duplicates(image_files: List[Dict], max_files: int = 20) -> Dict[str, List[Dict]]:
    """Find files with identical content by comparing MD5 hashes"""
    print(f"🔍 Checking content hashes for up to {max_files} files...")
    print("⚠️  This may take a while as it downloads files for comparison...")
    
    # Limit to reasonable number for demonstration
    files_to_check = image_files[:max_files]
    hash_groups = defaultdict(list)
    
    for i, file_info in enumerate(files_to_check):
        print(f"  📥 Downloading and hashing {file_info['filename']} ({i+1}/{len(files_to_check)})")
        
        file_hash = download_and_hash_file(file_info['full_path'])
        if file_hash:
            file_info['md5_hash'] = file_hash
            hash_groups[file_hash].append(file_info)
        
    # Return only groups with more than one file
    duplicates = {hash_val: files for hash_val, files in hash_groups.items() if len(files) > 1}
    
    return duplicates

def analyze_duplicates():
    """Main function to analyze duplicates"""
    print("🔍 S3 Duplicate Image Detection")
    print("=" * 50)
    
    # Get all image files
    image_files = get_all_image_files()
    if not image_files:
        print("❌ No image files found!")
        return
    
    print("\n" + "=" * 50)
    print("1️⃣  ANALYZING SIZE-BASED DUPLICATES")
    print("=" * 50)
    
    size_duplicates = find_size_duplicates(image_files)
    
    if size_duplicates:
        print(f"📊 Found {len(size_duplicates)} size groups with potential duplicates:")
        
        for size_bytes, files in sorted(size_duplicates.items(), key=lambda x: x[0], reverse=True):
            print(f"\n📏 Size: {size_bytes:,} bytes ({files[0]['size_str']}) - {len(files)} files:")
            for file_info in files:
                print(f"   📁 {file_info['full_path']}")
    else:
        print("✅ No size-based duplicates found")
    
    print("\n" + "=" * 50)
    print("2️⃣  ANALYZING NAME PATTERN DUPLICATES")
    print("=" * 50)
    
    name_duplicates = find_name_pattern_duplicates(image_files)
    
    if name_duplicates:
        print(f"📊 Found {len(name_duplicates)} naming patterns with multiple versions:")
        
        for pattern, files in sorted(name_duplicates.items()):
            print(f"\n🏷️  Pattern: {pattern} - {len(files)} files:")
            # Sort by size descending to show largest first
            files.sort(key=lambda x: x['size_bytes'], reverse=True)
            for file_info in files:
                print(f"   📁 {file_info['full_path']} ({file_info['size_str']})")
    else:
        print("✅ No name pattern duplicates found")
    
    print("\n" + "=" * 50)
    print("3️⃣  ANALYZING CONTENT-BASED DUPLICATES")
    print("=" * 50)
    
    # Ask user if they want to do content analysis (it's slow)
    print("⚠️  Content analysis requires downloading files - this is slow!")
    response = input("Do you want to check for content duplicates? (y/n): ").lower().strip()
    
    if response in ['y', 'yes']:
        max_files = 10  # Reasonable limit for demo
        print(f"🔍 Checking first {max_files} files for content duplicates...")
        
        content_duplicates = find_content_duplicates(image_files, max_files)
        
        if content_duplicates:
            print(f"📊 Found {len(content_duplicates)} content-based duplicate groups:")
            
            for hash_val, files in content_duplicates.items():
                print(f"\n🔐 Hash: {hash_val} - {len(files)} identical files:")
                for file_info in files:
                    print(f"   📁 {file_info['full_path']} ({file_info['size_str']})")
        else:
            print("✅ No content-based duplicates found in checked files")
    else:
        print("⏭️  Skipping content analysis")
    
    print("\n" + "=" * 50)
    print("📋 SUMMARY")
    print("=" * 50)
    print(f"📊 Total image files scanned: {len(image_files)}")
    print(f"📏 Size duplicate groups: {len(size_duplicates)}")
    print(f"🏷️  Name pattern groups: {len(name_duplicates)}")
    print(f"🔍 Potential storage savings available if duplicates are cleaned up")
    
    # Suggest cleanup commands for obvious duplicates
    if size_duplicates or name_duplicates:
        print("\n💡 CLEANUP SUGGESTIONS:")
        
        if name_duplicates:
            print("\n🏷️  Name Pattern Duplicates - Consider keeping only the highest quality version:")
            for pattern, files in list(name_duplicates.items())[:3]:  # Show first 3 examples
                if len(files) > 1:
                    files.sort(key=lambda x: x['size_bytes'], reverse=True)
                    print(f"\n   Pattern: {pattern}")
                    print(f"   Keep: {files[0]['full_path']} ({files[0]['size_str']}) - LARGEST")
                    for file_info in files[1:]:
                        print(f"   Consider removing: {file_info['full_path']} ({file_info['size_str']})")

if __name__ == "__main__":
    analyze_duplicates()
