#!/usr/bin/env python3
"""
Enhanced fix for lazy loading HTML5 compliance.
This removes sizes attributes from images that use placeholder srcset
to avoid validation conflicts.
"""

import re
from pathlib import Path

def fix_placeholder_srcset_issues(html_content):
    """Remove sizes attribute from images using placeholder srcset to avoid validation errors"""
    
    # Pattern to find img tags with placeholder srcset and sizes attribute
    pattern = r'(<img\s[^>]*?)srcset="data:image/gif[^"]*1x"([^>]*?sizes="[^"]*")([^>]*?>)'
    
    def fix_img(match):
        before = match.group(1)
        sizes_part = match.group(2)
        after = match.group(3)
        
        # Remove the sizes attribute
        sizes_removed = re.sub(r'\s*sizes="[^"]*"', '', sizes_part)
        
        return f'{before}srcset="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"{sizes_removed}{after}'
    
    return re.sub(pattern, fix_img, html_content, flags=re.DOTALL)

def main():
    """Fix placeholder srcset issues in HTML files"""
    root = Path(__file__).parent.parent
    
    for html_file in ['index.html']:
        file_path = root / html_file
        if not file_path.exists():
            continue
            
        print(f"Processing {html_file}...")
        
        # Read file
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Fix issues
        fixed_content = fix_placeholder_srcset_issues(content)
        
        # Write back only if changed
        if fixed_content != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"  ✓ Fixed placeholder srcset issues in {html_file}")
        else:
            print(f"  • No changes needed in {html_file}")

if __name__ == '__main__':
    main()