export type ImageItem = {
  src: string;
  srcWebp?: string;
  alt?: string;
  caption?: string;
  rooms?: string[];
};

// Marketing-focused room categories
export const MARKETING_CATEGORIES = [
  'Exterior & Gardens',
  'Kitchen', 
  'Living Areas',
  'Bedrooms',
  'Bathroom',
  'Annex Office',
  'Utility & Storage'
] as const;

export type MarketingCategory = typeof MARKETING_CATEGORIES[number];

export function flattenAndTagImages(site: any): ImageItem[] {
  const gallery: any[] = Array.isArray(site.gallery) ? site.gallery : [];
  const roomGalleries = site.roomGalleries || {};

  const bySrc = new Map<string, ImageItem>();

  function add(img: any, rooms: string[] = []) {
    if (!img || !img.src) return;
    const src = img.src;
    const existing = bySrc.get(src);
    if (existing) {
      const r = new Set([...(existing.rooms || []), ...rooms.map(String)]);
      existing.rooms = Array.from(r);
      if (!existing.alt && img.alt) existing.alt = img.alt;
      if (!existing.caption && img.caption) existing.caption = img.caption;
      if (!existing.srcWebp && img.srcWebp) existing.srcWebp = img.srcWebp;
    } else {
      bySrc.set(src, { src: img.src, srcWebp: img.srcWebp, alt: img.alt, caption: img.caption, rooms: rooms.slice() });
    }
  }

  gallery.forEach((g) => add(g, []));

  Object.keys(roomGalleries).forEach((room) => {
    const imgs = Array.isArray(roomGalleries[room]) ? roomGalleries[room] : [];
    imgs.forEach((img) => add(img, [room]));
  });

  const inferRoom = (src: string, alt?: string, caption?: string) => {
    if (!src) return undefined;
    const text = `${src} ${alt || ''} ${caption || ''}`.toLowerCase();
    
    // Exterior & Gardens (most appealing first)
    if (/exterior|garden|drive|pano|outside|street|front|elevation|hero/.test(text)) {
      return 'Exterior & Gardens';
    }
    
    // Kitchen (high-impact selling point)
    if (/kitchen|kitch/.test(text)) {
      return 'Kitchen';
    }
    
    // Living Areas (comfort & lifestyle)
    if (/lounge|living|conservatory|hallway|zen/.test(text)) {
      return 'Living Areas';
    }
    
    // Bedrooms (essential for buyers)
    if (/bedroom|bed|master/.test(text)) {
      return 'Bedrooms';
    }
    
    // Bathroom
    if (/bathroom|bath/.test(text)) {
      return 'Bathroom';
    }
    
    // Annex Office (unique selling point)
    if (/annex|office/.test(text)) {
      return 'Annex Office';
    }
    
    // Utility & Storage
    if (/utility|downstairs.*wc|storage/.test(text)) {
      return 'Utility & Storage';
    }
    
    return undefined;
  };

  const results: ImageItem[] = Array.from(bySrc.values()).map((it) => {
    if ((!it.rooms || it.rooms.length === 0) && it.src) {
      const inferred = inferRoom(it.src, it.alt, it.caption);
      if (inferred) it.rooms = [inferred];
    }
    // Normalize room names to marketing-friendly versions
    it.rooms = Array.from(new Set((it.rooms || []).map((r) => {
      const room = String(r).trim();
      // Map legacy room names to new marketing names
      const roomMap: Record<string, string> = {
        'exterior': 'Exterior & Gardens',
        'garden': 'Exterior & Gardens',
        'kitchen': 'Kitchen',
        'livingAreas': 'Living Areas',
        'lounge': 'Living Areas',
        'conservatory': 'Living Areas',
        'zenRoom': 'Living Areas',
        'bedrooms': 'Bedrooms',
        'bathroom': 'Bathroom',
        'annex': 'Annex Office',
        'utility': 'Utility & Storage',
        'downstairsWc': 'Utility & Storage'
      };
      return roomMap[room] || room;
    })));
    return it;
  });

  // Marketing-focused ordering: most appealing and sellable features first
  const roomPriority: Record<string, number> = {
    'hero': 0,
    'front': 0,
    'Exterior & Gardens': 1,  // Curb appeal first
    'Kitchen': 2,             // High-impact selling point
    'Living Areas': 3,        // Lifestyle and comfort
    'Bedrooms': 4,           // Essential for buyers
    'Bathroom': 5,           // Functional necessity
    'Annex Office': 6,       // Unique selling point
    'Utility & Storage': 7,  // Practical but less exciting
  };

  function detectFrontLike(src: string, caption?: string) {
    if (!src) return false;
    const s = src.toLowerCase();
    if (/front|elevation|fa[cç]ade|facade|street|approach|hero|main[-_\s]?elev|frontview/.test(s)) return true;
    if (caption && /front|elevation|hero/.test(String(caption).toLowerCase())) return true;
    return false;
  }

  function getPriority(it: ImageItem) {
    const src = (it.src || '').toLowerCase();
    const caption = it.caption;
    const alt = it.alt;
    
    // Hero/front elevation images get top priority
    if (detectFrontLike(src, caption)) return roomPriority.front;
    
    // Check room assignments
    const rooms = (it.rooms || []);
    for (const room of rooms) {
      if (room in roomPriority) return roomPriority[room];
    }
    
    // Fallback: infer from content
    const text = `${src} ${alt || ''} ${caption || ''}`.toLowerCase();
    if (/exterior|garden|drive|outside|street|elevation/.test(text)) return roomPriority['Exterior & Gardens'];
    if (/kitchen/.test(text)) return roomPriority['Kitchen'];
    if (/lounge|living|conservatory|hallway|zen/.test(text)) return roomPriority['Living Areas'];
    if (/bedroom|bed|master/.test(text)) return roomPriority['Bedrooms'];
    if (/bathroom|bath/.test(text)) return roomPriority['Bathroom'];
    if (/annex|office/.test(text)) return roomPriority['Annex Office'];
    if (/utility|storage|wc/.test(text)) return roomPriority['Utility & Storage'];

    return 99; // least priority
  }

  results.sort((a, b) => {
    const pa = getPriority(a);
    const pb = getPriority(b);
    if (pa !== pb) return pa - pb;
    
    // Within same category, prioritize by marketing appeal
    const aText = `${a.src} ${a.alt || ''} ${a.caption || ''}`.toLowerCase();
    const bText = `${b.src} ${b.alt || ''} ${b.caption || ''}`.toLowerCase();
    
    // Hero/main images first
    const aIsHero = /hero|main|front|elevation/.test(aText);
    const bIsHero = /hero|main|front|elevation/.test(bText);
    if (aIsHero !== bIsHero) return aIsHero ? -1 : 1;
    
    // Prefer images with better descriptions
    const aHasGoodCaption = (a.caption?.length || 0) > 10;
    const bHasGoodCaption = (b.caption?.length || 0) > 10;
    if (aHasGoodCaption !== bHasGoodCaption) return aHasGoodCaption ? -1 : 1;
    
    // Deterministic tie-breaker: shorter src first, then lexicographic
    if ((a.src || '').length !== (b.src || '').length) return (a.src || '').length - (b.src || '').length;
    return (a.src || '').localeCompare(b.src || '');
  });

  return results;
}
