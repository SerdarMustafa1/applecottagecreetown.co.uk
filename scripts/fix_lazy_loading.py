#!/usr/bin/env python3
"""
Fix lazy loading HTML5 compliance by adding fallback src/srcset attributes
while preserving the data- attributes for JavaScript enhancement.
"""

import re
from pathlib import Path

# Transparent 1x1 pixel GIF as base64
PLACEHOLDER_GIF = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

def fix_lazy_images(html_content):
    """Fix lazy loading images to be HTML5 compliant"""
    
    # Fix img tags that have data-src but no src
    img_pattern = r'<img\s+([^>]*?)data-src="([^"]*?)"([^>]*?)>'
    
    def fix_img(match):
        before_attrs = match.group(1)
        data_src = match.group(2)
        after_attrs = match.group(3)
        
        # Check if src already exists
        if 'src=' in before_attrs or 'src=' in after_attrs:
            return match.group(0)  # Already has src, don't modify
            
        # Add fallback src with placeholder
        fixed = f'<img {before_attrs}src="{PLACEHOLDER_GIF}" data-src="{data_src}"{after_attrs}>'
        return fixed
    
    html_content = re.sub(img_pattern, fix_img, html_content, flags=re.DOTALL)
    
    # Fix img tags that have data-srcset but no srcset
    img_srcset_pattern = r'<img\s+([^>]*?)data-srcset="([^"]*?)"([^>]*?)>'
    
    def fix_img_srcset(match):
        before_attrs = match.group(1)
        data_srcset = match.group(2)
        after_attrs = match.group(3)
        
        # Check if srcset already exists
        if 'srcset=' in before_attrs or 'srcset=' in after_attrs:
            return match.group(0)  # Already has srcset, don't modify
            
        # Check if sizes attribute is present - if so, use width descriptors
        if 'sizes=' in before_attrs or 'sizes=' in after_attrs:
            # Use a small width descriptor to match format
            fixed = f'<img {before_attrs}srcset="{PLACEHOLDER_GIF} 1w" data-srcset="{data_srcset}"{after_attrs}>'
        else:
            # Use pixel density descriptor
            fixed = f'<img {before_attrs}srcset="{PLACEHOLDER_GIF} 1x" data-srcset="{data_srcset}"{after_attrs}>'
        return fixed
    
    html_content = re.sub(img_srcset_pattern, fix_img_srcset, html_content, flags=re.DOTALL)
    
    # Fix source tags that have data-srcset but no srcset  
    source_pattern = r'<source\s+([^>]*?)data-srcset="([^"]*?)"([^>]*?)/?>'
    
    def fix_source(match):
        before_attrs = match.group(1)
        data_srcset = match.group(2)
        after_attrs = match.group(3)
        
        # Check if srcset already exists
        if 'srcset=' in before_attrs or 'srcset=' in after_attrs:
            return match.group(0)  # Already has srcset, don't modify
            
        # Add fallback srcset with placeholder - use width descriptor for responsive images
        is_self_closing = match.group(0).endswith('/>')
        close_tag = '/>' if is_self_closing else '>'
        fixed = f'<source {before_attrs}srcset="{PLACEHOLDER_GIF} 1w" data-srcset="{data_srcset}"{after_attrs}{close_tag}'
        return fixed
    
    html_content = re.sub(source_pattern, fix_source, html_content, flags=re.DOTALL)
    
    return html_content

def fix_lazy_videos(html_content):
    """Fix lazy loading video sources to be HTML5 compliant"""
    
    # Fix video source tags that have data-src but no src
    video_source_pattern = r'<source\s+([^>]*?)data-src="([^"]*?)"([^>]*?)/?>'
    
    def fix_video_source(match):
        before_attrs = match.group(1)
        data_src = match.group(2)
        after_attrs = match.group(3)
        
        # Check if src already exists
        if 'src=' in before_attrs or 'src=' in after_attrs:
            return match.group(0)  # Already has src, don't modify
            
        # Add placeholder src - use empty data URL for video
        is_self_closing = match.group(0).endswith('/>')
        close_tag = '/>' if is_self_closing else '>'
        # For video sources, we use a minimal data URL
        placeholder_video = "data:video/mp4;base64,"
        fixed = f'<source {before_attrs}src="{placeholder_video}" data-src="{data_src}"{after_attrs}{close_tag}'
        return fixed
    
    html_content = re.sub(video_source_pattern, fix_video_source, html_content, flags=re.DOTALL)
    return html_content

def main():
    """Fix lazy loading in HTML files"""
    root = Path(__file__).parent.parent
    
    for html_file in ['index.html', 'viewing-confirmation.html']:
        file_path = root / html_file
        if not file_path.exists():
            continue
            
        print(f"Processing {html_file}...")
        
        # Read file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Fix lazy loading
        fixed_content = fix_lazy_images(content)
        fixed_content = fix_lazy_videos(fixed_content)
        
        # Write back only if changed
        if fixed_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"  ✓ Fixed lazy loading in {html_file}")
        else:
            print(f"  • No changes needed in {html_file}")

if __name__ == '__main__':
    main()