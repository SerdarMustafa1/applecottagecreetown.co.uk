import { describe, it, expect } from 'vitest';
import { flattenAndTagImages } from '../../src/lib/gallery';

describe('flattenAndTagImages', () => {
  it('deduplicates images by src and merges rooms', () => {
    const site = {
      gallery: [ { src: '/images/a.jpg', alt: 'A' }, { src: '/images/b.jpg', alt: 'B' } ],
      roomGalleries: {
        kitchen: [ { src: '/images/a.jpg', alt: 'A kitchen' } ],
        bathroom: [ { src: '/images/c.jpg', alt: 'C bathroom' } ]
      }
    };
    const out = flattenAndTagImages(site as any);
    // should contain a, b, c
    const srcs = out.map(i => i.src).sort();
    expect(srcs).toEqual(['/images/a.jpg','/images/b.jpg','/images/c.jpg']);
    const a = out.find(i => i.src === '/images/a.jpg')!;
    expect(a.rooms).toContain('kitchen');
    // alt should prefer existing alt from first seen (gallery)
    expect(a.alt).toBe('A');
  });

  it('infers room tags for images not in roomGalleries', () => {
    const site = {
      gallery: [ { src: '/images/kitchen-1.jpg' }, { src: '/images/master-bedroom-1.jpg' }, { src: '/images/exterior-1.jpg' } ],
      roomGalleries: {}
    };
    const out = flattenAndTagImages(site as any);
    const k = out.find(i => i.src === '/images/kitchen-1.jpg')!;
    const m = out.find(i => i.src === '/images/master-bedroom-1.jpg')!;
    const e = out.find(i => i.src === '/images/exterior-1.jpg')!;
    expect(k.rooms).toContain('kitchen');
    expect(m.rooms).toContain('bedrooms');
    expect(e.rooms).toContain('exterior');
  });

  it('handles empty site gracefully', () => {
    const out = flattenAndTagImages({});
    expect(Array.isArray(out)).toBe(true);
    expect(out.length).toBe(0);
  });

  it('merges srcWebp and prefers gallery alt when present', () => {
    const site = {
      gallery: [ { src: '/images/x.jpg', alt: 'gallery alt', srcWebp: '/images/x.webp' } ],
      roomGalleries: { kitchen: [ { src: '/images/x.jpg', alt: 'room alt' } ] }
    };
    const out = flattenAndTagImages(site as any);
    const x = out.find(i => i.src === '/images/x.jpg')!;
    expect(x.srcWebp).toBe('/images/x.webp');
    expect(x.alt).toBe('gallery alt');
    expect(x.rooms).toContain('kitchen');
  });
});
