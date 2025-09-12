const MEDIA_BASE = import.meta.env.MEDIA_BASE_URL || '';
function media(path: string) {
  if (!path) return path;
  if (/^https?:\/\//i.test(path)) return path;
  const base = MEDIA_BASE ? MEDIA_BASE.replace(/\/$/, '') : '';
  const p = path.startsWith('/') ? path.slice(1) : path;
  return base ? `${base}/${p}` : path;
}

export const site = {
  title: 'Apple Cottage',
  description: 'Energy‑smart three‑bed home with annex, EV charging & landscaped gardens.',
  siteUrl: 'https://applecottagecreetown.co.uk',
  address: 'Apple Cottage, Creetown, Scotland',
  coordinates: { lat: 54.9, lng: -4.4 },
  contact: {
    phone: '+44 1234 567890',
    email: 'info@applecottagecreetown.co.uk'
  },
  hero: {
    image: media('/images/new/img_0384-1200.jpg'),
    imageWebp: media('/images/new/img_0384-1200.webp'),
    tagline: 'Energy‑smart three‑bed home with annex, EV charging & landscaped gardens',
    ctaLabel: 'Book a Viewing',
    bookUrl: 'https://tidycal.com/sidmustafa/apple-cottage-viewing'
  },
  price: 'Offers over £300,000',
  bedrooms: 3,
  bathrooms: 2,
  epc: 'B',
  ogImage: media('/images/sample-1.svg'),
  analyticsId: 'GA_MEASUREMENT_ID',
  gallery: [
    { src: media('/images/new/garden-centre-1200.jpg'), srcWebp: media('/images/new/garden-centre-1200.webp'), alt: 'Garden centre view', caption: 'Garden centre view' },
    { src: media('/images/new/garden-corner-1200.jpg'), srcWebp: media('/images/new/garden-corner-1200.webp'), alt: 'Garden corner area', caption: 'Garden corner area' },
    { src: media('/images/new/img_0384-1200.jpg'), srcWebp: media('/images/new/img_0384-1200.webp'), alt: 'Property exterior', caption: 'Property exterior' },
    { src: media('/images/new/street-cairnsmore-1200.jpg'), srcWebp: media('/images/new/street-cairnsmore-1200.webp'), alt: 'Street view towards Cairnsmore', caption: 'Street view towards Cairnsmore' },
    { src: media('/images/new/street-left-1200.jpg'), srcWebp: media('/images/new/street-left-1200.webp'), alt: 'Street view from left', caption: 'Street view from left' },
    { src: media('/images/new/view-front-bedroom-1200.jpg'), srcWebp: media('/images/new/view-front-bedroom-1200.webp'), alt: 'View from front bedroom', caption: 'View from front bedroom' },
    { src: media('/images/new/view-hallway-1200.jpg'), srcWebp: media('/images/new/view-hallway-1200.webp'), alt: 'View from hallway', caption: 'View from hallway' }
  ],
  floorplans: [
    { label: 'Ground Floor', src: media('/floorplans/ground-floor.svg') },
    { label: 'First Floor', src: media('/floorplans/first-floor.svg') },
    { label: 'Annex Ground', src: media('/floorplans/annex-ground.svg') },
    { label: 'Annex First', src: media('/floorplans/annex-first.svg') }
  ],
  floorplans3d: [
    // { label: 'Main 3D Overview', src: media('/floorplans/3d-overview.png') }
  ],
  panos: [
    { label: 'Back Bedroom', src: media('/images/panos/back-bedroom-pano.jpg'), srcWebp: media('/images/panos/back-bedroom-pano.webp'), preview: media('/images/panos/back-bedroom-pano.jpg') },
    { label: 'Bathroom', src: media('/images/panos/bathroom-pano.jpg'), srcWebp: media('/images/panos/bathroom-pano.webp'), preview: media('/images/panos/bathroom-pano.jpg') },
    { label: 'Front Bedroom', src: media('/images/panos/front-bedroom-pano.jpg'), srcWebp: media('/images/panos/front-bedroom-pano.webp'), preview: media('/images/panos/front-bedroom-pano.jpg') },
    { label: 'Hallway', src: media('/images/panos/hallway-pano.jpg'), srcWebp: media('/images/panos/hallway-pano.webp'), preview: media('/images/panos/hallway-pano.jpg') },
    { label: 'Lounge', src: media('/images/panos/lounge-pano.jpg'), srcWebp: media('/images/panos/lounge-pano.webp'), preview: media('/images/panos/lounge-pano.jpg') },
    { label: 'Entrance Steps', src: media('/images/panos/steps-pano.jpg'), srcWebp: media('/images/panos/steps-pano.webp'), preview: media('/images/panos/steps-pano.jpg') }
  ],
  portals: {
    purplebricks: 'https://www.purplebricks.co.uk/property-for-sale/3-bedroom-detached-house-newton-stewart-1964511',
    s1homes: 'https://s1homes.com/property-for-sale/Detached/20250905090829948'
  },
  docs: [
    { label: 'EPC', href: media('/docs/epc.pdf') },
    { label: 'Home Report', href: media('/docs/home-report.pdf') }
  ]
};

export default site;
