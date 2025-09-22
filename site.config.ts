const MEDIA_BASE = import.meta.env.MEDIA_BASE_URL || '';
const DEFAULT_CDN = MEDIA_BASE ? MEDIA_BASE.replace(/\/$/, '') : 'https://d1t6lpjdsu4646.cloudfront.net';
// Optional video env vars for Before/After section
const B4A = {
  HLS: (import.meta as any).env.PUBLIC_B4A_HLS as string | undefined,
  MP4_2160: (import.meta as any).env.PUBLIC_B4A_MP4_2160 as string | undefined,
  MP4_1080: (import.meta as any).env.PUBLIC_B4A_MP4_1080 as string | undefined,
  WEBM_1080: (import.meta as any).env.PUBLIC_B4A_WEBM_1080 as string | undefined,
  POSTER: (import.meta as any).env.PUBLIC_B4A_POSTER as string | undefined,
};
// Optional overrides for doc URLs
const OVERRIDES = {
  FLOORPLAN_GROUND_URL: (import.meta as any).env.FLOORPLAN_GROUND_URL as string | undefined,
  FLOORPLAN_FIRST_URL: (import.meta as any).env.FLOORPLAN_FIRST_URL as string | undefined,
  FLOORPLAN_3D_URL: (import.meta as any).env.FLOORPLAN_3D_URL as string | undefined,
  EPC_IMAGE_URL: (import.meta as any).env.EPC_IMAGE_URL as string | undefined,
  PLOT_IMAGE_URL: (import.meta as any).env.PLOT_IMAGE_URL as string | undefined,
  HOME_REPORT_URL: (import.meta as any).env.HOME_REPORT_URL as string | undefined,
};
function media(path: string) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  // Keep certain assets served locally from Netlify/public
  if (path.startsWith('/docs/')) return path;
  const base = MEDIA_BASE ? MEDIA_BASE.replace(/\/$/, '') : '';
  const p = path.startsWith('/') ? path.slice(1) : path;
  return base ? `${base}/${p}` : path;
}

const DEFAULT_B4A = {
  hls: media('/videos/b4a/hls/master.m3u8'),
  mp4_2160: media('/videos/b4a/b4a-2160p.mp4'),
  mp4_1080: media('/videos/b4a/b4a-1080p.mp4'),
  webm_1080: media('/videos/b4a/b4a-1080p.webm'),
  poster: media('/videos/b4a/b4a-poster.jpg'),
};

const DEFAULT_HOUSE_2D_PLAN = `${DEFAULT_CDN}/floorplans/house-2d.png`;
const DEFAULT_ANNEX_2D_PLAN = `${DEFAULT_CDN}/floorplans/annex-floor-plan.png`;
const DEFAULT_HOUSE_3D_PLAN = `${DEFAULT_CDN}/floorplans/house-3d.mp4`;
const FALLBACK_PLOT_PLAN = `${DEFAULT_CDN}/docs/plot.png`;

const mainFloorplanSrc = OVERRIDES.FLOORPLAN_GROUND_URL || DEFAULT_HOUSE_2D_PLAN;
const annexFloorplanSrc = OVERRIDES.FLOORPLAN_FIRST_URL || DEFAULT_ANNEX_2D_PLAN;

const rawThirdFloorplanSrc = OVERRIDES.FLOORPLAN_3D_URL || DEFAULT_HOUSE_3D_PLAN;
const thirdFloorplanSrc = rawThirdFloorplanSrc || FALLBACK_PLOT_PLAN;
const thirdFloorplanIsVideo = /\.(mp4|webm|mov|m4v)$/i.test(thirdFloorplanSrc);
const thirdFloorplanLabel = thirdFloorplanIsVideo ? '3D House Plan' : 'Plot Plan';
const thirdFloorplanPreview = thirdFloorplanIsVideo ? undefined : thirdFloorplanSrc;
const thirdFloorplanType = thirdFloorplanIsVideo ? 'video' as const : 'image' as const;

export const site = {
  title: 'Apple Cottage',
  description: 'Recently renovated three‑bed with annex, EV charging & landscaped gardens.',
  siteUrl: 'https://applecottagecreetown.co.uk',
  address: 'Apple Cottage, Creetown, Scotland',
  coordinates: { lat: 54.899611, lng: -4.380458 },
  bookingUrl: 'https://www.williamsonandhenry.co.uk/property/apple-cottage-creetown/',
  price: '💰 Offers Over £300,000',
  bedrooms: '🛏️ 3 Double Bedrooms',
  bathrooms: '🛁 1 + Downstairs WC',
  epc: '⚡ B - Energy Efficient',
  plotSize: '0.13 acres (≈ 532 m²)',
  internalArea: '~122 m² main house + ~25 m² annex',
  what3words: '///silk.dynamics.quitter',
  hero: {
    image: media('/images/exterior/hero-exterior-6D088E35.jpg'),
    tagline: 'Renovated 3-bed with annex, EPC B, solar + EV — move-in ready in Creetown',
    ctaLabel: 'Book a viewing',
    bookUrl: '/#contact'
  },
  distances: {
    a75: '2 min',
    kirroughtree: '5 min', 
    newtonStewart: '10 min',
    mossyard: '15 min'
  },
  energyFeatures: {
    hotWater: 'Vaillant aroSTOR 270 ASHP water cylinder for efficient, low‑carbon hot water',
    heating: 'Infrared heating panels: zoned, fast‑response room heating; minimal air movement and comfortable radiant warmth',
    evCharger: 'Ohme Home Pro smart charger on the driveway',
    energySupplier: 'Currently Octopus Energy on an Intelligent tariff with export; linked to the Ohme charger for smart, off‑peak charging'
  },
  analyticsId: 'G-LHB9R5TLL1', // GA4 measurement ID
  // Optional Points of Interest for the map (add real coordinates when ready)
  // Example: { title: 'Gem Rock Museum', lat: 54.8963, lng: -4.3752, subtitle: 'Family attraction', meta: '≈2 min drive' }
  pois: [
    // Populate with real lat/lng values to display markers on the map
  // Both Heritage Museum and Ellangowan are on St John Street; lat/lng marked approximate
    { title: 'Ellangowan Hotel (The Wicker Man pub)', lat: 54.9001368 as any, lng: -4.3791208 as any, subtitle: 'In village', meta: 'St John Street (approx.)' },
    { title: 'Cairnsmore of Fleet NNR', lat: 54.9475428, lng: -4.258444, subtitle: 'Hill & wildlife', meta: '≈15 min drive' },
    { title: 'Mossyard Beach', lat: 54.8405845, lng: -4.2579869, subtitle: 'Family beach', meta: '≈15 min drive' },
  ],
  // Floor plans: main house, annex, and plot plan
  floorplans: [
    {
      label: 'Main House Floor Plan',
      src: mainFloorplanSrc,
      preview: mainFloorplanSrc,
      type: 'image'
    },
    {
      label: 'Annex Floor Plan',
      src: annexFloorplanSrc,
      preview: annexFloorplanSrc,
      type: 'image'
    },
    {
      label: thirdFloorplanLabel,
      src: thirdFloorplanSrc,
      preview: thirdFloorplanPreview,
      type: thirdFloorplanType
    }
  ],
  // Additional 3D plans are currently surfaced in the main array for consistency
  floorplans3d: [],
  // Optional Before/After video sources (wired to component)
  beforeAfterVideo: {
    label: 'Before & After Renovation',
    description: 'See Apple Cottage evolve from shell to showcase.',
    hls: B4A.HLS || DEFAULT_B4A.hls,
    mp4_2160: B4A.MP4_2160 || DEFAULT_B4A.mp4_2160,
    mp4_1080: B4A.MP4_1080 || DEFAULT_B4A.mp4_1080,
    webm_1080: B4A.WEBM_1080 || DEFAULT_B4A.webm_1080,
    poster: B4A.POSTER || DEFAULT_B4A.poster,
  },
  gallery: [
    // Exterior views (front elevation first)
    { src: media('/images/exterior/hero-exterior-6D088E35.jpg'), alt: 'Front elevation of Apple Cottage with driveway and EV charger', caption: 'Front elevation' },
    { src: media('/images/exterior/garden-centre-1200.jpg'), alt: 'Garden centre view', caption: 'Garden centre view' },
    { src: media('/images/exterior/garden-corner-1200.jpg'), alt: 'Garden corner area', caption: 'Garden corner area' },
    { src: media('/images/exterior/street-cairnsmore-1200.jpg'), alt: 'Street view towards Cairnsmore', caption: 'Street view towards Cairnsmore' },
    { src: media('/images/exterior/street-left-1200.jpg'), alt: 'Street view from left', caption: 'Street view from left' },
    
    // Interior views
    { src: media('/images/interior/bedrooms/front-bedroom/view-front-bedroom-1200.jpg'), alt: 'View from front bedroom', caption: 'View from front bedroom' },
    { src: media('/images/interior/hallway/view-hallway-1200.jpg'), alt: 'View from hallway', caption: 'View from hallway' },
  { src: media('/images/interior/kitchen/kitchen-1.jpg'), alt: 'Kitchen main view', caption: 'Modern fitted kitchen' },
  { src: media('/images/interior/kitchen/kitchen-2.jpg'), alt: 'Kitchen angle 2', caption: 'Kitchen workspace and storage' },
  { src: media('/images/interior/kitchen/kitchen-4.jpg'), alt: 'Kitchen detail', caption: 'Kitchen appliances and fittings' },
  { src: media('/images/interior/utility/utility-main.jpg'), alt: 'Utility room main', caption: 'Practical utility room space' },
    { src: media('/images/interior/conservatory/conservatory-main.jpg'), alt: 'Conservatory', caption: 'Bright conservatory with garden access' },

    { src: media('/images/interior/bedrooms/rear-bedroom/bedroom-rear.jpg'), alt: 'Rear bedroom', caption: 'Rear bedroom with garden views' },
    { src: media('/images/interior/bedrooms/master-bedroom/master-bedroom-1.jpg'), alt: 'Master bedroom main', caption: 'Spacious master bedroom' },
    { src: media('/images/interior/bedrooms/master-bedroom/master-bedroom-2.jpg'), alt: 'Master bedroom angle 2', caption: 'Master bedroom' },
    { src: media('/images/interior/bedrooms/master-bedroom/master-bedroom-3.jpg'), alt: 'Master bedroom angle 3', caption: 'Master bedroom storage area' },
    { src: media('/images/interior/zen-room/zen-room-main.jpg'), alt: 'Zen room', caption: 'Peaceful zen room space' },
    
    // Dramatic exterior additions
    { src: media('/images/exterior/exterior-from-landing-2EE3F1E1.jpeg'), alt: 'Property from elevated view', caption: 'Elevated property perspective' },
    { src: media('/images/exterior/property-rear-main-DA26379D.jpeg'), alt: 'Main rear garden view', caption: 'Main rear garden with full property view' },
    { src: media('/images/exterior/property-rear-1-900A7CB2.jpeg'), alt: 'Alternative rear view', caption: 'Rear garden alternative angle' },
  { src: media('/images/exterior/garden-view-1.jpg'), alt: 'Garden flat area overview', caption: 'Flat garden area - perfect for entertaining' },
  { src: media('/images/exterior/garden-view-2.jpg'), alt: 'Garden flat area angle 2', caption: 'Garden space from different perspective' },
  { src: media('/images/exterior/garden-view-3.jpg'), alt: 'Garden flat area angle 3', caption: 'Expansive garden showing full potential' },

  // Annex (new media additions)
  // Still image extracted from annex 360 video (responsive variants optional)
  { src: media('/images/annex/annex-still-1200.jpg'), alt: 'Annex living space', caption: 'Annex living space', rooms: ['annex'] },
    
  // Exterior panoramic views
  { src: media('/images/panos/garden-1-exterior-view.jpg'), alt: 'Garden panoramic view', caption: 'Wide garden panorama showing full outdoor space' },
  { src: media('/images/panos/garden-central-exterior-view.jpg'), alt: 'Central garden panorama', caption: 'Central garden area with mature landscaping' },
  { src: media('/images/panos/garden-4-exterior-view.jpg'), alt: 'Rear garden panorama', caption: 'Rear garden showing entertaining areas' },
  { src: media('/images/panos/drive-bottom-exterior-view.jpg'), alt: 'Driveway approach view', caption: 'Property approach and parking area' },
    
    // Premium interior shots
    { src: media('/images/exterior/street-view-19d500ce.jpg'), alt: 'Street view from interior', caption: 'Street view from front window' },
    
    // Property features
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
  
  panos: [
    { label: 'Back Bedroom', src: media('/images/panos/back-bedroom-pano.jpg'), srcWebp: media('/images/panos/back-bedroom-pano.webp'), preview: media('/images/panos/back-bedroom-pano.jpg'), alt: '360° panoramic back bedroom view' },
    { label: 'Bathroom', src: media('/images/panos/bathroom-pano.jpg'), srcWebp: media('/images/panos/bathroom-pano.webp'), preview: media('/images/panos/bathroom-pano.jpg'), alt: '360° panoramic bathroom view' },
    { label: 'Front Bedroom', src: media('/images/panos/front-bedroom-pano.jpg'), srcWebp: media('/images/panos/front-bedroom-pano.webp'), preview: media('/images/panos/front-bedroom-pano.jpg'), alt: '360° panoramic front bedroom view' },
    { label: 'Hallway', src: media('/images/panos/hallway-pano.jpg'), srcWebp: media('/images/panos/hallway-pano.webp'), preview: media('/images/panos/hallway-pano.jpg'), alt: '360° panoramic hallway view' },
    { label: 'Lounge', src: media('/images/panos/lounge-pano.jpg'), srcWebp: media('/images/panos/lounge-pano.webp'), preview: media('/images/panos/lounge-pano.jpg'), alt: '360° panoramic lounge view' },
    { label: 'Entrance Steps', src: media('/images/panos/steps-pano.jpg'), srcWebp: media('/images/panos/steps-pano.webp'), preview: media('/images/panos/steps-pano.jpg'), alt: '360° panoramic entrance steps view' },
    { label: 'Annex', src: media('/images/panos/annex-pano.jpg'), srcWebp: media('/images/panos/annex-pano.webp'), preview: media('/images/panos/annex-pano.jpg'), alt: '360° panoramic annex view' },
    { label: 'Master Bedroom', src: media('/images/panos/master-bedroom-pano.jpg'), preview: media('/images/panos/master-bedroom-pano.jpg'), alt: '360° panoramic master bedroom view' },
    { label: 'Drive Bottom View', src: media('/images/panos/drive-bottom-exterior-view.jpg'), preview: media('/images/panos/drive-bottom-exterior-view.jpg'), alt: '360° panoramic driveway and approach' },
    { label: 'Garden View 1', src: media('/images/panos/garden-1-exterior-view.jpg'), preview: media('/images/panos/garden-1-exterior-view.jpg'), alt: '360° panoramic garden view 1' },
    { label: 'Garden Central View', src: media('/images/panos/garden-central-exterior-view.jpg'), preview: media('/images/panos/garden-central-exterior-view.jpg'), alt: '360° panoramic central garden view' },
    { label: 'Garden View 4', src: media('/images/panos/garden-4-exterior-view.jpg'), preview: media('/images/panos/garden-4-exterior-view.jpg'), alt: '360° panoramic garden view 4' },
    { label: 'Interior Living Panoramic', src: media('/images/panos/interior-living-panoramic.jpg'), preview: media('/images/panos/interior-living-panoramic.jpg'), alt: '360° panoramic interior living area' }
  ],
  
  // 360° Virtual Tours - Interactive room experiences
  virtual360Tours: [
    { 
      label: 'Kitchen 360°', 
      videoMp4: media('/videos/interior/kitchen-360.mp4'), 
      videoWebm: media('/videos/interior/kitchen-360.webm'), 
      poster: media('/images/interior/kitchen/kitchen-360-poster.jpg'),
      description: 'Complete kitchen tour with full 360° view'
    },
    { 
      label: 'Bathroom 360°', 
      videoMp4: media('/videos/interior/bathroom-360.mp4'), 
      videoWebm: media('/videos/interior/bathroom-360.webm'), 
      poster: media('/images/interior/bathroom/bathroom-360-poster.jpg'),
      description: 'Family bathroom with modern fittings'
    },
    { 
      label: 'Rear Bedroom 360°', 
      videoMp4: media('/videos/interior/rear-bedroom-360.mp4'), 
      videoWebm: media('/videos/interior/rear-bedroom-360.webm'), 
      poster: media('/images/interior/bedrooms/rear-bedroom/rear-bedroom-360-poster.jpg'),
      description: 'Spacious rear bedroom with garden views'
    },
    { 
      label: 'Front Bedroom 360°', 
      videoMp4: media('/videos/interior/front-bedroom-360.mp4'), 
      videoWebm: media('/videos/interior/front-bedroom-360.webm'), 
      poster: media('/images/interior/bedrooms/front-bedroom/front-bedroom-360-poster.jpg'),
      description: 'Front-facing bedroom with street views'
    },
    { 
      label: 'Lounge 360°', 
      videoMp4: media('/videos/interior/lounge-360.mp4'), 
      videoWebm: media('/videos/interior/lounge-360.webm'), 
      poster: media('/images/interior/lounge/lounge-360-poster.jpg'),
      description: 'Main living room with fireplace'
    },
    { 
      label: 'Conservatory 360°', 
      videoMp4: media('/videos/interior/conservatory-360.mp4'), 
      videoWebm: media('/videos/interior/conservatory-360.webm'), 
      poster: media('/images/interior/conservatory/conservatory-360-poster.jpg'),
      description: 'Bright conservatory with garden access'
    },
    { 
      label: 'Master Bedroom 360°', 
  videoMp4: media('/videos/interior/master-bedroom-360.mp4'), 
  videoWebm: media('/videos/interior/master-bedroom-360.webm'), 
  poster: media('/images/interior/bedrooms/master-bedroom/master-bedroom-360-poster.jpg'),
      description: 'Spacious master bedroom with wraparound view'
    },
    { 
      label: 'Annex 360°',
      videoMp4: media('/videos/annex/annex-360.mp4'),
      videoWebm: media('/videos/annex/annex-360.webm'),
      poster: media('/images/annex/annex-360-poster.jpg'),
      description: 'Self-contained annex living space'
    }
  ],
  
  // Room-specific photo galleries
  roomGalleries: {
    kitchen: [
      { src: media('/images/interior/kitchen/kitchen-1.jpg'), alt: 'Kitchen main view', caption: 'Modern kitchen with ample storage' },
      { src: media('/images/interior/kitchen/kitchen-2.jpg'), alt: 'Kitchen angle 2', caption: 'Kitchen main view' },
      { src: media('/images/interior/kitchen/kitchen-4.jpg'), alt: 'Kitchen workspace', caption: 'Kitchen workspace and appliances' },
      { src: media('/images/interior/kitchen/kitchen-detail-d97e815c.jpg'), alt: 'Kitchen detail', caption: 'Quality kitchen fittings' }
    ],
    livingAreas: [
    ],
    lounge: [
      { src: media('/images/interior/lounge/lounge-workspace.jpg'), alt: 'Lounge workspace', caption: 'Lounge workspace area' },
      { src: media('/images/interior/lounge/lounge-3.jpg'), alt: 'Lounge angle 3', caption: 'Lounge alternate view' },
      { src: media('/images/interior/lounge/lounge-diner-3b198390.jpg'), alt: 'Lounge diner area', caption: 'Lounge dining area' }
    ],
    conservatory: [
      { src: media('/images/interior/conservatory/conservatory-view.jpg'), alt: 'Conservatory view', caption: 'Bright conservatory space' },
      { src: media('/images/interior/conservatory/conservatory-main.jpg'), alt: 'Conservatory main', caption: 'Conservatory with garden access' },
      { src: media('/images/interior/conservatory/conservatory-1.jpg'), alt: 'Conservatory interior', caption: 'Natural light-filled conservatory' },
      { src: media('/images/interior/conservatory/conservatory-entrance.jpg'), alt: 'Conservatory entrance', caption: 'Conservatory entrance view' }
    ],
    zenRoom: [
      { src: media('/images/interior/zen-room/zen-room-main.jpg'), alt: 'Zen room', caption: 'Peaceful zen room space' }
    ],
    bedrooms: [
      // Master bedroom images from organized subfolder
      { src: media('/images/interior/bedrooms/master-bedroom/master-bedroom-1.jpg'), alt: 'Master bedroom main', caption: 'Master bedroom main view' },
      { src: media('/images/interior/bedrooms/master-bedroom/master-bedroom-2.jpg'), alt: 'Master bedroom angle 2', caption: 'Master bedroom alternate angle' },
      { src: media('/images/interior/bedrooms/master-bedroom/master-bedroom-3.jpg'), alt: 'Master bedroom angle 3', caption: 'Master bedroom with storage' },

      // Front bedroom
      { src: media('/images/interior/bedrooms/front-bedroom/view-front-bedroom-1200.jpg'), alt: 'Front bedroom view', caption: 'Front bedroom with street views' },
      // Rear bedroom
      { src: media('/images/interior/bedrooms/rear-bedroom/bedroom-rear.jpg'), alt: 'Rear bedroom', caption: 'Rear bedroom with garden views' }
    ],
    utility: [
      { src: media('/images/interior/utility/utility-main.jpg'), alt: 'Utility room main', caption: 'Practical utility room space' },
    ],
    downstairsWc: [
      { src: media('/images/interior/downstairs-wc/downstairs-wc-detail-b48c6425.jpg'), alt: 'Downstairs WC', caption: 'Convenient downstairs WC' }
    ],
    bathroom: [
      { src: media('/images/interior/bathroom/bathroom.jpg'), alt: 'Family bathroom', caption: 'Modern family bathroom' }
    ],
    annex: [
      { src: media('/images/exterior/annex-office-389752AB.jpg'), alt: 'Annex office space', caption: 'Separate annex office - perfect for working from home' }
    ],
    exterior: [
      { src: media('/images/exterior/exterior-view-93b1365c.jpg'), alt: 'Exterior property view', caption: 'Property exterior perspective' },
      { src: media('/images/exterior/exterior-view-E516C44F.jpg'), alt: 'Exterior kitchen view', caption: 'Property exterior from kitchen side' },
      { src: media('/images/exterior/exterior-main-3b60cbff.jpg'), alt: 'Main exterior view', caption: 'Main property exterior perspective' }
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
      { src: `${DEFAULT_CDN}/docs/epc.png`, alt: 'EPC Rating B', caption: 'Energy Performance Certificate - Rating B', feature: 'Energy Efficient' }
    ]
  },
  portals: {
    williamsonhenry: 'https://www.williamsonandhenry.co.uk/property/apple-cottage-creetown/'
  },
  docs: [
    { label: 'Plot Plan', href: OVERRIDES.PLOT_IMAGE_URL || media('/docs/plot.png') },
    { label: 'Home Report', href: OVERRIDES.HOME_REPORT_URL || 'https://www.williamsonandhenry.co.uk/property/apple-cottage-creetown/' },
    { label: 'Planning Permission', href: `${DEFAULT_CDN}/docs/planning-permission.png` }
  ]
};

// Compute a flattened, deduplicated image list with room tags for the unified gallery.
import { flattenAndTagImages } from './src/lib/gallery';
// `flattenAndTagImages` expects the same `site` shape; attach computed images here.
(site as any).images = flattenAndTagImages(site as any);

export default site;
