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
    image: '/images/hero.jpg',
    tagline: 'Energy‑smart three‑bed home with annex, EV charging & landscaped gardens',
    ctaLabel: 'Book a Viewing',
    bookUrl: 'https://tidycal.com/sidmustafa/apple-cottage-viewing'
  },
  price: 'Offers over £300,000',
  bedrooms: 3,
  bathrooms: 2,
  epc: 'B',
  ogImage: '/images/sample-1.svg',
  analyticsId: 'GA_MEASUREMENT_ID',
  gallery: [
    { src: '/images/sample-1.svg', alt: 'Front elevation', caption: 'Front elevation' },
    { src: '/images/sample-2.svg', alt: 'Lounge', caption: 'Lounge' },
    { src: '/images/sample-3.svg', alt: 'Kitchen', caption: 'Kitchen' },
    { src: '/images/sample-4.svg', alt: 'Bedroom', caption: 'Bedroom' },
    { src: '/images/sample-5.svg', alt: 'Garden', caption: 'Garden' },
    { src: '/images/sample-6.svg', alt: 'View toward hills', caption: 'View toward hills' }
  ],
  floorplans: [
    { label: 'Ground Floor', src: '/floorplans/ground-floor.svg' },
    { label: 'First Floor', src: '/floorplans/first-floor.svg' },
    { label: 'Annex Ground', src: '/floorplans/annex-ground.svg' },
    { label: 'Annex First', src: '/floorplans/annex-first.svg' }
  ],
  floorplans3d: [
    // { label: 'Main 3D Overview', src: '/floorplans/3d-overview.png' }
  ],
  panos: [
    // { label: 'Lounge', src: '/panos/lounge-360.jpg', preview: '/images/lounge-thumb.jpg' },
    // { label: 'Kitchen', src: '/panos/kitchen-360.jpg' }
  ],
  portals: {
    purplebricks: 'https://www.purplebricks.co.uk/property-for-sale/3-bedroom-detached-house-newton-stewart-1964511',
    s1homes: 'https://s1homes.com/property-for-sale/Detached/20250905090829948'
  },
  docs: [
    { label: 'EPC', href: '/docs/epc.pdf' },
    { label: 'Home Report', href: '/docs/home-report.pdf' }
  ]
};

export default site;
