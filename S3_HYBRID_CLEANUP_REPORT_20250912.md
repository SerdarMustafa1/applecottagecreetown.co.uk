# S3 Hybrid Media Cleanup Report - Fri Sep 12 10:37:05 BST 2025

## Strategy: Progressive Enhancement
- Keep JPG + WebP for property photos (best of both worlds)
- Keep PNG for diagrams (EPC graph)
- Remove AVIF (limited browser support)
- Remove 800px versions (use CSS for responsive scaling)

## Files Kept (Progressive Enhancement)
### Property Photos (JPG + WebP pairs)
- images/new/garden-centre-1200.jpg + .webp
- images/new/garden-corner-1200.jpg + .webp
- images/new/img_0384-1200.jpg + .webp
- images/new/street-cairnsmore-1200.jpg + .webp
- images/new/street-left-1200.jpg + .webp
- images/new/view-front-bedroom-1200.jpg + .webp
- images/new/view-hallway-1200.jpg + .webp

### Panoramic Images (JPG + WebP pairs)
- images/panos/back-bedroom-pano.jpg + .webp
- images/panos/bathroom-pano.jpg + .webp
- images/panos/front-bedroom-pano.jpg + .webp
- images/panos/hallway-pano.jpg + .webp
- images/panos/lounge-pano.jpg + .webp
- images/panos/steps-pano.jpg + .webp

### Diagrams
- images/misc/epc-graph.png

## Benefits
- Universal compatibility (JPG fallback)
- Modern performance (WebP for capable browsers)
- Perfect for property websites
- SEO and social media optimized
- Image sharing friendly

## Implementation
Update HTML to use <picture> elements for automatic format selection
