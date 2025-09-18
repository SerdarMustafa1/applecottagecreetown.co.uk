import { describe, it, expect } from 'vitest';
import { parseSizeToken, buildVerifiedSrcSet } from '../../src/lib/imageVariants';

describe('imageVariants helpers', () => {
  describe('parseSizeToken', () => {
    it('returns null for non-sized filenames', () => {
      expect(parseSizeToken('/images/foo.jpg')).toBeNull();
      expect(parseSizeToken('foo-abc.jpg')).toBeNull();
    });
    it('parses valid width tokens', () => {
      const p = parseSizeToken('/images/room/lounge-main-1200.jpg');
      expect(p).toEqual({ orig: 1200, ext: '.jpg' });
    });
  });

  describe('buildVerifiedSrcSet', () => {
    it('returns undefined for path without size token', () => {
      const all = new Set(['/images/foo.jpg']);
      expect(buildVerifiedSrcSet('/images/foo.jpg', all)).toBeUndefined();
    });

    it('returns undefined when only single variant present', () => {
      const all = new Set(['/images/bar-1200.jpg']);
      expect(buildVerifiedSrcSet('/images/bar-1200.jpg', all)).toBeUndefined();
    });

    it('includes only existing verified variants and requires >=2', () => {
      const all = new Set([
        '/images/kitchen/kitchen-480.jpg',
        '/images/kitchen/kitchen-768.jpg',
        '/images/kitchen/kitchen-1200.jpg'
        // 1600 missing intentionally
      ]);
      const srcset = buildVerifiedSrcSet('/images/kitchen/kitchen-480.jpg', all)!;
      expect(srcset.split(',').length).toBe(3); // 480,768,1200
      ['480','768','1200'].forEach(w => expect(srcset).toContain(`${w}.jpg ${w}w`));
      expect(srcset).not.toContain('1600');
    });

    it('works for webp variants', () => {
      const all = new Set([
        '/images/lounge/lounge-main-480.webp',
        '/images/lounge/lounge-main-768.webp',
        '/images/lounge/lounge-main-1200.webp',
        '/images/lounge/lounge-main-1600.webp'
      ]);
      const srcset = buildVerifiedSrcSet('/images/lounge/lounge-main-480.webp', all)!;
      ['480','768','1200','1600'].forEach(w => expect(srcset).toContain(`${w}.webp ${w}w`));
    });
  });
});
