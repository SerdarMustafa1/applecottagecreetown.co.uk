export const site = {
  title: 'Apple Cottage',
  description: 'Charming home in Creetown',
  address: 'Apple Cottage, Creetown, Scotland',
  coordinates: { lat: 54.9, lng: -4.4 },
  contact: {
    phone: '+44 1234 567890',
    email: 'info@applecottagecreetown.co.uk'
  },
  price: '£500,000',
  bedrooms: 4,
  bathrooms: 2,
  epc: 'B',
  analyticsId: 'GA_MEASUREMENT_ID',
  floorplans: [
    { label: 'Ground Floor', src: '/floorplans/ground-floor.png' },
    { label: 'First Floor', src: '/floorplans/first-floor.png' }
  ],
  docs: [
    { label: 'EPC', href: '/docs/epc.pdf' },
    { label: 'Home Report', href: '/docs/home-report.pdf' }
  ]
};

export default site;
