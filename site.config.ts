export const site = {
  title: 'Apple Cottage',
  description: 'Charming home in Creetown',
  siteUrl: 'https://applecottagecreetown.co.uk',
  address: 'Apple Cottage, Creetown, Scotland',
  coordinates: { lat: 54.9, lng: -4.4 },
  contact: {
    phone: '+44 1234 567890',
    email: 'info@applecottagecreetown.co.uk'
  },
  hero: {
    image: '/images/hero.jpg',
    tagline: 'Character home with gardens near the Solway Firth',
    ctaLabel: 'Book a Viewing'
  },
  price: '£500,000',
  bedrooms: 4,
  bathrooms: 2,
  epc: 'B',
  ogImage: '/images/sample-1.svg',
  analyticsId: 'GA_MEASUREMENT_ID',
  gallery: [
    { src: '/images/sample-1.svg', alt: 'Front elevation' },
    { src: '/images/sample-2.svg', alt: 'Lounge' },
    { src: '/images/sample-3.svg', alt: 'Kitchen' },
    { src: '/images/sample-4.svg', alt: 'Bedroom' },
    { src: '/images/sample-5.svg', alt: 'Garden' },
    { src: '/images/sample-6.svg', alt: 'View toward hills' }
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
  docs: [
    { label: 'EPC', href: '/docs/epc.pdf' },
    { label: 'Home Report', href: '/docs/home-report.pdf' }
  ]
};

export default site;
