const MEDIA_BASE = import.meta.env.MEDIA_BASE_URL || '';
// Optional video env vars for Before/After section
const B4A = {
  HLS: (import.meta as any).env.PUBLIC_B4A_HLS as string | undefined,
  MP4_2160: (import.meta as any).env.PUBLIC_B4A_MP4_2160 as string | undefined,
  MP4_1080: (import.meta as any).env.PUBLIC_B4A_MP4_1080 as string | undefined,
  WEBM_1080: (import.meta as any).env.PUBLIC_B4A_WEBM_1080 as string | undefined,
  POSTER: (import.meta as any).env.PUBLIC_B4A_POSTER as string | undefined,
};
// Optional overrides for floorplan and doc URLs; set absolute CDN URLs if assets live under /misc
const OVERRIDES = {
  FLOORPLAN_GROUND_URL: (import.meta as any).env.FLOORPLAN_GROUND_URL as string | undefined,
  FLOORPLAN_FIRST_URL: (import.meta as any).env.FLOORPLAN_FIRST_URL as string | undefined,
  FLOORPLAN_ANNEX_GROUND_URL: (import.meta as any).env.FLOORPLAN_ANNEX_GROUND_URL as string | undefined,
  FLOORPLAN_ANNEX_FIRST_URL: (import.meta as any).env.FLOORPLAN_ANNEX_FIRST_URL as string | undefined,
  FLOORPLAN_3D_URL: (import.meta as any).env.FLOORPLAN_3D_URL as string | undefined,
  EPC_IMAGE_URL: (import.meta as any).env.EPC_IMAGE_URL as string | undefined,
  PLOT_IMAGE_URL: (import.meta as any).env.PLOT_IMAGE_URL as string | undefined,
};
function media(path: string) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  // Keep certain assets served locally from Netlify/public
  if (path.startsWith('/floorplans/') || path.startsWith('/docs/')) return path;
  const base = MEDIA_BASE ? MEDIA_BASE.replace(/\/$/, '') : '';
  const p = path.startsWith('/') ? path.slice(1) : path;
  return base ? `${base}/${p}` : path;
}

export const site = {
  title: 'Apple Cottage',
  description: 'Recently renovated three‑bed with annex, EV charging & landscaped gardens.',
  siteUrl: 'https://applecottagecreetown.co.uk',
  address: 'Apple Cottage, Creetown, Scotland',
  coordinates: { lat: 54.9, lng: -4.4 },
  // Optional Points of Interest for the map (add real coordinates when ready)
  // Example: { title: 'Gem Rock Museum', lat: 54.8963, lng: -4.3752, subtitle: 'Family attraction', meta: '≈2 min drive' }
  pois: [
    // Populate with real lat/lng values to display markers on the map
    // Both Heritage Museum and Ellangowan are on St John Street; lat/lng marked approximate
    { title: 'Creetown Heritage Museum', lat: 54.9005368 as any, lng: -4.3791208 as any, subtitle: 'Local history', meta: 'St John Street (approx.)' },
    { title: 'The Gem Rock Museum & Café', lat: 54.9029544, lng: -4.3765811, subtitle: 'Family attraction', meta: '≈2 min drive' },
    { title: 'Kirroughtree Visitor Centre (7stanes)', lat: 54.9542686, lng: -4.4194704, subtitle: 'Trails & biking', meta: '≈5–10 min drive' },
    { title: 'Ellangowan Hotel (The Wicker Man pub)', lat: 54.9001368 as any, lng: -4.3791208 as any, subtitle: 'In village', meta: 'St John Street (approx.)' },
    { title: 'Cairnsmore of Fleet NNR', lat: 54.9475428, lng: -4.258444, subtitle: 'Hill & wildlife', meta: '≈15 min drive' },
    { title: 'Mossyard Beach', lat: 54.8405845, lng: -4.2579869, subtitle: 'Family beach', meta: '≈15 min drive' },
    { title: 'The Laird’s Inn (Castle Cary)', lat: 54.891254, lng: -4.3791756, subtitle: 'Castle Cary pub', meta: '≈7 min drive' },
    { title: 'Castle Cary Pools', lat: 54.891254, lng: -4.3791756, subtitle: 'Holiday park & pools', meta: '≈7 min drive' },
  ],
  contact: {
    phone: '+44 1234 567890',
    email: 'info@applecottagecreetown.co.uk'
  },
  hero: {
    image: 'https://d1t6lpjdsu4646.cloudfront.net/images/interior/interior-room-6D088E35.jpeg',
    imageWebp: 'https://d1t6lpjdsu4646.cloudfront.net/images/interior/interior-room-6D088E35.jpeg',
    alternativeImages: [
      { src: media('/images/exterior/property-rear-main-DA26379D.jpeg'), alt: 'Property rear garden view' },
      { src: media('/images/interior/interior-main-9A07279B.jpeg'), alt: 'Interior main living area' },
      { src: media('/images/new/img_0384-1200.jpg'), alt: 'Property exterior corner view' }
    ],
    tagline: 'Recently renovated three‑bed with annex, EV charging & landscaped gardens',
    ctaLabel: 'Book a Viewing',
    bookUrl: 'https://tidycal.com/sidmustafa/apple-cottage-viewing'
  },
  price: 'Offers over £300,000',
  bedrooms: 3,
  bathrooms: 1,
  epc: 'B',
  ogImage: media('/images/new/img_0384-1200.jpg'),
  // Google Analytics 4 Measurement ID
  analyticsId: 'G-LHB9R5TLL1',
  // Optional: before/after renovation video sources (fill in when available)
  beforeAfterVideo: {
    label: 'Before & After Renovation',
    description: 'See the transformation in up to 4K.',
    // Recommended to host via HLS on CloudFront for adaptive streaming
    hls: B4A.HLS, // e.g. https://cdn.example.com/b4a/hls/master.m3u8
    mp4_2160: B4A.MP4_2160, // e.g. https://cdn.example.com/b4a/b4a-2160p.mp4
    mp4_1080: B4A.MP4_1080, // e.g. https://cdn.example.com/b4a/b4a-1080p.mp4
    webm_1080: B4A.WEBM_1080, // optional VP9/AV1
    poster: B4A.POSTER, // optional poster image
  },
  gallery: [
    // Current optimized images
    { src: media('/images/new/garden-centre-1200.jpg'), srcWebp: media('/images/new/garden-centre-1200.webp'), alt: 'Garden centre view', caption: 'Garden centre view' },
    { src: media('/images/new/garden-corner-1200.jpg'), srcWebp: media('/images/new/garden-corner-1200.webp'), alt: 'Garden corner area', caption: 'Garden corner area' },
    { src: media('/images/new/img_0384-1200.jpg'), srcWebp: media('/images/new/img_0384-1200.webp'), alt: 'Property exterior', caption: 'Property exterior' },
    { src: media('/images/new/street-cairnsmore-1200.jpg'), srcWebp: media('/images/new/street-cairnsmore-1200.webp'), alt: 'Street view towards Cairnsmore', caption: 'Street view towards Cairnsmore' },
    { src: media('/images/new/street-left-1200.jpg'), srcWebp: media('/images/new/street-left-1200.webp'), alt: 'Street view from left', caption: 'Street view from left' },
    { src: media('/images/new/view-front-bedroom-1200.jpg'), srcWebp: media('/images/new/view-front-bedroom-1200.webp'), alt: 'View from front bedroom', caption: 'View from front bedroom' },
    { src: media('/images/new/view-hallway-1200.jpg'), srcWebp: media('/images/new/view-hallway-1200.webp'), alt: 'View from hallway', caption: 'View from hallway' },
    
    // Dramatic exterior additions
    { src: media('/images/exterior/exterior-from-landing-2EE3F1E1.jpeg'), alt: 'Property from elevated view', caption: 'Elevated property perspective' },
    { src: media('/images/exterior/property-rear-main-DA26379D.jpeg'), alt: 'Main rear garden view', caption: 'Main rear garden with full property view' },
    { src: media('/images/exterior/property-rear-1-900A7CB2.jpeg'), alt: 'Alternative rear view', caption: 'Rear garden alternative angle' },
  { src: media('/images/exterior/garden-view-1.jpg'), alt: 'Garden flat area overview', caption: 'Flat garden area - perfect for entertaining' },
  { src: media('/images/exterior/garden-view-2.jpg'), alt: 'Garden flat area angle 2', caption: 'Garden space from different perspective' },
  { src: media('/images/exterior/garden-view-3.jpg'), alt: 'Garden flat area angle 3', caption: 'Expansive garden showing full potential' },
    
    // Panoramic exterior views
    { src: media('/images/exterior/pano-garden-1-exterior-view-2FF85833.jpeg'), alt: 'Garden panoramic view', caption: 'Panoramic garden vista' },
    { src: media('/images/exterior/pano-garden-central-exterior-view-1FBEF43C.jpeg'), alt: 'Central garden panorama', caption: 'Central garden panoramic view' },
    { src: media('/images/exterior/pano-garden-4-exterior-view-55CAB83C.jpeg'), alt: 'Garden panorama 4', caption: 'Garden panoramic perspective' },
    { src: media('/images/exterior/pano-drive-bottom-exterior-view-0E980DF8.jpeg'), alt: 'Driveway panoramic view', caption: 'Driveway and approach panorama' },
    
    // Premium interior shots
    { src: media('/images/interior/interior-main-9A07279B.jpeg'), alt: 'Main interior living space', caption: 'Spacious main living area' },
    { src: media('/images/interior/interior-main-19D500CE.jpeg'), alt: 'Interior main room', caption: 'Bright and airy main room' },
    { src: media('/images/interior/interior-main-BAD2D8AD.jpeg'), alt: 'Interior main space', caption: 'Elegant interior main space' },
    { src: media('/images/interior/interior-main-4D0D375F.jpeg'), alt: 'Main interior area', caption: 'Well-appointed main interior' },
    
    // Property features
    { src: media('/images/exterior/annex-office-389752AB.jpeg'), alt: 'Annex office space', caption: 'Separate annex office - perfect for working from home' },
    { src: media('/images/exterior/garden-lean-to-view-032D67F9.jpeg'), alt: 'Garden lean-to structure', caption: 'Useful garden lean-to storage' }
  ],
  // Location & Lifestyle image grid
  locationExtras: [
    { title: 'Creetown Heritage Museum', subtitle: 'Local history', image: media('/images/locations/heritage_museum.jpg'), meta: '≈1 min drive', description: 'Volunteer‑run museum of local cultural and industrial history.' },
    { title: 'Gem Rock Museum & Café', subtitle: 'Family attraction', image: media('/images/locations/gem_rock.jpg'), meta: '≈2 min drive', description: 'Gemstones, crystals, fossils and a friendly café.' },
    { title: 'Kirroughtree & 7stanes', subtitle: 'Trails & biking', image: media('/images/locations/kirroughtree.jpg'), meta: '≈5–10 min drive', description: 'Forest trails, mountain biking, visitor centre and bike shop.' },
    { title: 'Ellangowan Hotel', subtitle: 'Wicker Man pub', image: media('/images/locations/ellangowan.jpg'), meta: 'In village', description: 'Friendly local with film memorabilia.' },
    { title: 'Cairnsmore of Fleet NNR', subtitle: 'Hill & wildlife', image: media('/images/locations/cairnsmore.jpg'), meta: '≈15 min drive', description: 'Wild granite hill with panoramic views and wildlife.' },
    { title: 'Mossyard Beach', subtitle: 'Family beach', image: media('/images/locations/mossyard.jpg'), meta: '≈15 min drive', description: 'Small sandy bay on Fleet Bay, great for family days.' },
    { title: 'The Laird’s Inn', subtitle: 'Castle Cary pub', image: media('/images/locations/the-laird-s-inn.jpg'), meta: '≈7 min drive', description: 'Cosy 16th‑century inn with beams, stone walls and fireplace.' },
    { title: 'Castle Cary Pools', subtitle: 'Holiday park & pools', image: media('/images/locations/castle-cary-pools.avif'), meta: '≈7 min drive', description: 'Family‑friendly park with seasonal outdoor pools.' },
  ],
  floorplans: [
    {
      label: 'Ground Floor',
      src:
        OVERRIDES.FLOORPLAN_GROUND_URL ||
        media('/floorplans/ground-floor.svg'),
    },
    {
      label: 'First Floor',
      src:
        OVERRIDES.FLOORPLAN_FIRST_URL ||
        media('/floorplans/first-floor.svg'),
    },
    // Annex floorplans removed per request to declutter
  ],
  floorplans3d: OVERRIDES.FLOORPLAN_3D_URL
    ? [{ label: '3D Overview', src: OVERRIDES.FLOORPLAN_3D_URL }]
    : [],
  panos: [
    { label: 'Back Bedroom', src: media('/images/panos/back-bedroom-pano.jpg'), srcWebp: media('/images/panos/back-bedroom-pano.webp'), preview: media('/images/panos/back-bedroom-pano.jpg') },
    { label: 'Bathroom', src: media('/images/panos/bathroom-pano.jpg'), srcWebp: media('/images/panos/bathroom-pano.webp'), preview: media('/images/panos/bathroom-pano.jpg') },
    { label: 'Front Bedroom', src: media('/images/panos/front-bedroom-pano.jpg'), srcWebp: media('/images/panos/front-bedroom-pano.webp'), preview: media('/images/panos/front-bedroom-pano.jpg') },
    { label: 'Hallway', src: media('/images/panos/hallway-pano.jpg'), srcWebp: media('/images/panos/hallway-pano.webp'), preview: media('/images/panos/hallway-pano.jpg') },
    { label: 'Lounge', src: media('/images/panos/lounge-pano.jpg'), srcWebp: media('/images/panos/lounge-pano.webp'), preview: media('/images/panos/lounge-pano.jpg') },
  { label: 'Entrance Steps', src: media('/images/panos/steps-pano.jpg'), srcWebp: media('/images/panos/steps-pano.webp'), preview: media('/images/panos/steps-pano.jpg') },
  { label: 'Master Bedroom', src: media('/images/panos/master-bedroom-pano.jpg'), preview: media('/images/panos/master-bedroom-pano.jpg') }
  ],
  
  // 360° Virtual Tours - Interactive room experiences
  virtual360Tours: [
    { 
      label: 'Kitchen 360°', 
      videoMp4: media('/videos/interior/kitchen-360.mp4'), 
      videoWebm: media('/videos/interior/kitchen-360.webm'), 
      poster: media('/images/interior/kitchen-360-poster.jpg'),
      description: 'Complete kitchen tour with full 360° view'
    },
    { 
      label: 'Bathroom 360°', 
      videoMp4: media('/videos/interior/bathroom-360.mp4'), 
      videoWebm: media('/videos/interior/bathroom-360.webm'), 
      poster: media('/images/interior/bathroom-360-poster.jpg'),
      description: 'Family bathroom with modern fittings'
    },
    { 
      label: 'Rear Bedroom 360°', 
      videoMp4: media('/videos/interior/rear-bedroom-360.mp4'), 
      videoWebm: media('/videos/interior/rear-bedroom-360.webm'), 
      poster: media('/images/interior/rear-bedroom-360-poster.jpg'),
      description: 'Spacious rear bedroom with garden views'
    },
    { 
      label: 'Front Bedroom 360°', 
      videoMp4: media('/videos/interior/front-bedroom-360.mp4'), 
      videoWebm: media('/videos/interior/front-bedroom-360.webm'), 
      poster: media('/images/interior/front-bedroom-360-poster.jpg'),
      description: 'Front-facing bedroom with street views'
    },
    { 
      label: 'Lounge 360°', 
      videoMp4: media('/videos/interior/lounge-360.mp4'), 
      videoWebm: media('/videos/interior/lounge-360.webm'), 
      poster: media('/images/interior/lounge-360-poster.jpg'),
      description: 'Main living room with fireplace'
    },
    { 
      label: 'Conservatory 360°', 
      videoMp4: media('/videos/interior/conservatory-360.mp4'), 
      videoWebm: media('/videos/interior/conservatory-360.webm'), 
      poster: media('/images/interior/conservatory-360-poster.jpg'),
      description: 'Bright conservatory with garden access'
    },
    { 
      label: 'Master Bedroom 360°', 
  videoMp4: media('/videos/interior/360-master-bedroom-1-interior.mp4'), 
  videoWebm: media('/videos/interior/360-master-bedroom-1-interior.webm'), 
  poster: media('/images/interior/master-bedroom-360-poster.jpg'),
      description: 'Spacious master bedroom with wraparound view'
    }
  ],
  
  // Room-specific photo galleries
  roomGalleries: {
    kitchen: [
      { src: media('/images/interior/interior-room-0DC5EADA.jpeg'), alt: 'Kitchen main view', caption: 'Modern kitchen with ample storage' },
      { src: media('/images/interior/interior-room-32A352BB.jpeg'), alt: 'Kitchen angle 2', caption: 'Kitchen workspace and appliances' },
      { src: media('/images/interior/interior-detail-3E745FF3.jpeg'), alt: 'Kitchen detail', caption: 'Quality kitchen fittings' }
    ],
    livingAreas: [
      { src: media('/images/interior/interior-room-3B60CBFF.jpeg'), alt: 'Living area main', caption: 'Spacious main living area' },
      { src: media('/images/interior/interior-room-64B4DF3B.jpeg'), alt: 'Living room view', caption: 'Comfortable living space' },
      { src: media('/images/interior/interior-room-93B1365C.jpeg'), alt: 'Living area perspective', caption: 'Open-plan living area' },
      { src: media('/images/interior/interior-detail-3E745FF3.jpeg'), alt: 'Living area detail', caption: 'Quality interior finishes' }
    ],
    bedrooms: [
      { src: media('/images/interior/interior-room-6D088E35.jpeg'), alt: 'Bedroom main view', caption: 'Bright and airy bedroom' },
      { src: media('/images/interior/interior-room-800F4A11.jpeg'), alt: 'Bedroom angle 2', caption: 'Bedroom with fitted storage' },
      { src: media('/images/interior/interior-room-AAA96C60.jpeg'), alt: 'Master bedroom', caption: 'Spacious master bedroom' },
  { src: media('/images/interior/interior-detail-1B21C73B.jpeg'), alt: 'Bedroom detail', caption: 'Quality bedroom fittings' },
  // New master bedroom images
  { src: media('/images/interior/master-bedroom-1.jpg'), alt: 'Master bedroom main', caption: 'Master bedroom main view' },
  { src: media('/images/interior/master-bedroom-2.jpg'), alt: 'Master bedroom angle 2', caption: 'Master bedroom alternate angle' },
  { src: media('/images/interior/master-bedroom-3.jpg'), alt: 'Master bedroom angle 3', caption: 'Master bedroom with storage' }
    ],
    bathroom: [
      { src: media('/images/interior/interior-room-B4EF8A08.jpeg'), alt: 'Bathroom main', caption: 'Modern family bathroom' },
      { src: media('/images/interior/interior-room-BFCFCC5A.jpeg'), alt: 'Bathroom view', caption: 'Well-appointed bathroom' },
      { src: media('/images/interior/interior-detail-1B21C73B.jpeg'), alt: 'Bathroom detail', caption: 'Quality bathroom fittings' }
    ]
  },
  
  // Property features showcase
  propertyFeatures: {
    exterior: [
      { src: media('/images/exterior/annex-office-389752AB.jpeg'), alt: 'Annex office', caption: 'Separate annex office - perfect for remote work or a home gym', feature: 'Home Office' },
      { src: media('/images/exterior/garden-lean-to-view-032D67F9.jpeg'), alt: 'Garden storage', caption: 'Useful lean-to for garden storage', feature: 'Storage' },
  { src: media('/images/exterior/garden-view-1.jpg'), alt: 'Flat garden area', caption: 'Level garden area perfect for entertaining', feature: 'Entertainment Space' }
    ],
    energyEfficiency: [
      { src: media('/docs/epc.png'), alt: 'EPC Rating B', caption: 'Energy Performance Certificate - Rating B', feature: 'Energy Efficient' }
    ]
  },
  portals: {
    purplebricks: 'https://www.purplebricks.co.uk/property-for-sale/3-bedroom-detached-house-newton-stewart-1964511',
    s1homes: 'https://s1homes.com/property-for-sale/Detached/20250905090829948'
  },
  docs: [
    { label: 'Plot Plan', href: OVERRIDES.PLOT_IMAGE_URL || media('/docs/plot.png') },
    { label: 'Home Report', href: media('/docs/home-report.pdf') }
  ]
};

export default site;
