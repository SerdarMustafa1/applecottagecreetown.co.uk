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

  return results;
}
