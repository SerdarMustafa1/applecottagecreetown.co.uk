export type ImageItem = {
  src: string;
  srcWebp?: string;
  alt?: string;
  caption?: string;
  rooms?: string[];
};

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

  const inferRoom = (src: string) => {
    if (!src) return undefined;
    if (/kitchen|kitch/i.test(src)) return 'kitchen';
    if (/master[-_\s]?bedroom|front[-_\s]?bedroom|rear[-_\s]?bedroom|bedroom|bed/i.test(src)) return 'bedrooms';
    if (/bathroom|bath/i.test(src)) return 'bathroom';
    if (/exterior|garden|drive|panos|pano|outside/i.test(src)) return 'exterior';
    if (/interior|lounge|living|conservatory|hallway/i.test(src)) return 'livingAreas';
    return undefined;
  };

  const results: ImageItem[] = Array.from(bySrc.values()).map((it) => {
    if ((!it.rooms || it.rooms.length === 0) && it.src) {
      const inferred = inferRoom(it.src.toLowerCase());
      if (inferred) it.rooms = [inferred];
    }
    it.rooms = Array.from(new Set((it.rooms || []).map((r) => String(r).trim())));
    return it;
  });

  // Deterministic ordering to prefer hero / front elevation images first,
  // then kitchen, living/lounge, bedrooms, annex, exterior/garden, bathroom, then others.
  const roomPriority: Record<string, number> = {
    front: 0,
    hero: 0,
    kitchen: 1,
    livingAreas: 2,
    lounge: 2,
    bedrooms: 3,
    master: 3,
    annex: 4,
    exterior: 5,
    garden: 5,
    bathroom: 6,
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
    if (detectFrontLike(src, caption)) return roomPriority.front;
    const rooms = (it.rooms || []).map((r) => String(r).toLowerCase());
    for (const r of rooms) {
      if (r in roomPriority) return roomPriority[r];
      // handle common synonyms
      if (r.includes('kitchen')) return roomPriority.kitchen;
      if (r.includes('lounge') || r.includes('living') || r.includes('conservatory')) return roomPriority.livingAreas;
      if (r.includes('bed')) return roomPriority.bedrooms;
      if (r.includes('annex') || r.includes('studio')) return roomPriority.annex;
      if (r.includes('garden') || r.includes('exterior') || r.includes('drive')) return roomPriority.exterior;
      if (r.includes('bath')) return roomPriority.bathroom;
    }
    // fallback: check filename tokens
    if (/kitchen|kitch/.test(src)) return roomPriority.kitchen;
    if (/lounge|living|conservat/.test(src)) return roomPriority.livingAreas;
    if (/bedroom|bed-?room|master|bed/.test(src)) return roomPriority.bedrooms;
    if (/annex|studio/.test(src)) return roomPriority.annex;
    if (/garden|exterior|outside|drive/.test(src)) return roomPriority.exterior;
    if (/bathroom|bath/.test(src)) return roomPriority.bathroom;

    return 99; // least priority
  }

  results.sort((a, b) => {
    const pa = getPriority(a);
    const pb = getPriority(b);
    if (pa !== pb) return pa - pb;
    // deterministic tie-breaker: shorter src first, then lexicographic
    if ((a.src || '').length !== (b.src || '').length) return (a.src || '').length - (b.src || '').length;
    return (a.src || '').localeCompare(b.src || '');
  });

  return results;
}
