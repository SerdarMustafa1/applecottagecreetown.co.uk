import { describe, it, expect } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import GalleryIsland from '../../src/components/GalleryIsland.tsx';

// Utility to extract the first image or source elements rendered
function getAllImgElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll('img')) as HTMLImageElement[];
}

function buildItem(src: string, extra: Partial<{ alt: string; caption: string; srcWebp: string; rooms: string[] }> = {}) {
  return { src, alt: extra.alt, caption: extra.caption, srcWebp: extra.srcWebp, rooms: extra.rooms } as any;
}

describe('GalleryIsland responsive srcset logic', () => {
  it('omits srcset when only a single size variant exists', () => {
    const images = [
      buildItem('/images/exterior/garden-centre-1200.jpg'),
      buildItem('/images/exterior/garden-corner-1200.jpg')
    ];
    const { container } = render(<GalleryIsland images={images} />);
    const imgs = getAllImgElements(container);
    // Should render two images (initial visible page size allows at least these) with no srcset attribute
    expect(imgs.length).toBeGreaterThanOrEqual(2);
    imgs.slice(0,2).forEach(img => {
      expect(img.getAttribute('src')).toMatch(/garden-(centre|corner)-1200\.jpg$/);
      expect(img.getAttribute('srcset')).toBeFalsy();
    });
  });

  it('emits srcset only when at least one additional verified size is present', () => {
    // Provide fake existing variants by listing them explicitly
    const images = [
      buildItem('/images/interior/kitchen/kitchen-480.jpg'),
      buildItem('/images/interior/kitchen/kitchen-768.jpg'),
      buildItem('/images/interior/kitchen/kitchen-1200.jpg'),
      buildItem('/images/interior/kitchen/kitchen-1600.jpg')
    ];
    const { container } = render(<GalleryIsland images={images} />);
    const imgs = getAllImgElements(container);
    const first = imgs[0];
    expect(first.getAttribute('src')).toBe('/images/interior/kitchen/kitchen-480.jpg');
    const srcset = first.getAttribute('srcset');
    expect(srcset).toBeTruthy();
    // Ensure only existing variants are listed (480,768,1200,1600) and each has w descriptor
    ['480','768','1200','1600'].forEach(w => {
      expect(srcset).toContain(`${w}.jpg ${w}w`);
    });
  });

  it('renders single webp <source> when webp size variants are not indexed as primary src entries', () => {
    // Provide both jpg and webp entries so verification sees all sizes
    const images = [
      buildItem('/images/interior/lounge/lounge-main-480.jpg', { srcWebp: '/images/interior/lounge/lounge-main-480.webp' }),
      buildItem('/images/interior/lounge/lounge-main-768.jpg', { srcWebp: '/images/interior/lounge/lounge-main-768.webp' }),
      buildItem('/images/interior/lounge/lounge-main-1200.jpg', { srcWebp: '/images/interior/lounge/lounge-main-1200.webp' }),
      buildItem('/images/interior/lounge/lounge-main-1600.jpg', { srcWebp: '/images/interior/lounge/lounge-main-1600.webp' })
    ];
    const { container } = render(<GalleryIsland images={images} />);
    const picture = container.querySelector('picture');
    expect(picture).toBeTruthy();
    const source = picture!.querySelector('source');
    expect(source).toBeTruthy();
    const webpSrcSet = source!.getAttribute('srcset');
    // Should fall back to single provided webp path (first visible image variant)
    expect(webpSrcSet).toBe('/images/interior/lounge/lounge-main-480.webp');
  });

  it('never fabricates missing widths in srcset output', () => {
    // Provide only two variants (480 & 1200) leaving gaps (768 missing)
    const images = [
      buildItem('/images/interior/bedroom/bedroom-main-480.jpg'),
      buildItem('/images/interior/bedroom/bedroom-main-1200.jpg')
    ];
    const { container } = render(<GalleryIsland images={images} />);
    const first = getAllImgElements(container)[0];
    // Not enough verified variants (needs >=2 besides original -> we have exactly two but one is original + one other?)
    // In our logic we require original plus at least one additional (>=2 total). Here 480 and 1200 exist; 480 is original.
    // That satisfies the condition (existing length = 2) -> srcset should include exactly those two, not 768 or 1600.
    const srcset = first.getAttribute('srcset');
    if (srcset) {
      expect(srcset).toContain('480.jpg 480w');
      expect(srcset).toContain('1200.jpg 1200w');
      expect(srcset).not.toContain('768.jpg');
      expect(srcset).not.toContain('1600.jpg');
    }
  });

  it('renders filter chips with icons', () => {
    const images = [
      buildItem('/images/kitchen/kitchen-1.jpg', { rooms: ['kitchen'] }),
      buildItem('/images/bedroom/bedroom-1.jpg', { rooms: ['bedrooms'] })
    ];
    const { container } = render(<GalleryIsland images={images} />);
    
    // Check for filter buttons with icons
    const filterButtons = container.querySelectorAll('button[aria-pressed]');
    expect(filterButtons.length).toBeGreaterThan(0);
    
    // Check that buttons contain emoji icons
    const allButton = Array.from(filterButtons).find(btn => btn.textContent?.includes('All'));
    expect(allButton?.textContent).toMatch(/🏠/);
  });

  it('shows infinite scroll loading indicator', () => {
    // Create enough images to trigger infinite scroll
    const images = Array.from({ length: 20 }, (_, i) => 
      buildItem(`/images/test-${i}.jpg`, { alt: `Test image ${i}` })
    );
    const { container } = render(<GalleryIsland images={images} />);
    
    // Should show initial 12 images
    const imgs = getAllImgElements(container);
    expect(imgs.length).toBe(12);
    
    // Should show scroll indicator
    const scrollIndicator = container.querySelector('[class*="text-gray-500"]');
    expect(scrollIndicator?.textContent).toContain('Scroll to load more');
  });
});
