const MEDIA_BASE = import.meta.env.PUBLIC_MEDIA_BASE_URL || '';
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
    image: media('/images/hero.jpg'),
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
    { src: media('/images/sample-1.svg'), alt: 'Front elevation', caption: 'Front elevation' },
    { src: media('/images/sample-2.svg'), alt: 'Lounge', caption: 'Lounge' },
    { src: media('/images/sample-3.svg'), alt: 'Kitchen', caption: 'Kitchen' },
    { src: media('/images/sample-4.svg'), alt: 'Bedroom', caption: 'Bedroom' },
    { src: media('/images/sample-5.svg'), alt: 'Garden', caption: 'Garden' },
    { src: media('/images/sample-6.svg'), alt: 'View toward hills', caption: 'View toward hills' }
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
    // { label: 'Lounge', src: media('/panos/lounge-360.jpg'), preview: media('/images/lounge-thumb.jpg') },
    // { label: 'Kitchen', src: media('/panos/kitchen-360.jpg') }
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
