import React, { useMemo, useState, useEffect } from 'react';
import LightboxDialog from './LightboxDialog';

// Accept an array of image sources which may be string paths or
// ImageMetadata objects returned from Astro's asset pipeline.
type GalleryItem = { 
  src: string; 
  srcWebp?: string; // WebP version for progressive enhancement
  alt?: string; 
  caption?: string; 
  rooms?: string[];
};
interface GalleryIslandProps { images: GalleryItem[]; }

export default function GalleryIsland({ images }: GalleryIslandProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [filter, setFilter] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState(9);

  // Build filters from explicit rooms metadata first; fallback to simple categories inferred from path
  const itemsWithMeta = useMemo(() => images.map(img => ({ ...img, __rooms: Array.isArray((img as any).rooms) ? (img as any).rooms : [] })), [images]);

  const roomTags = useMemo(() => {
    const r = new Set<string>();
    itemsWithMeta.forEach(i => (i.__rooms || []).forEach((t: string) => { if (t) r.add(String(t)); }));
    return Array.from(r).map(s => String(s));
  }, [itemsWithMeta]);

  const categorize = (src: string): string => {
    if (/\/exterior\//i.test(src)) return 'Exterior';
    if (/\/interior\//i.test(src)) return 'Interior';
    if (/\/garden\//i.test(src)) return 'Garden';
    if (/\/new\//i.test(src)) return 'Featured';
    return 'Other';
  };

  const itemsWithCat = useMemo(() => itemsWithMeta.map((img: any) => ({ ...img, __cat: categorize(img.src) })), [itemsWithMeta]);

  const categories = useMemo(() => ['All', ...Array.from(new Set(itemsWithCat.map((i: any) => i.__cat)))], [itemsWithCat]);

  const allFilterOptions = useMemo(() => {
    // Prefer explicit room tags (human-friendly) and fall back to categories
    if (roomTags.length > 0) return ['All', ...roomTags];
    return categories;
  }, [roomTags, categories]);

  const filtered = useMemo(() => {
    if (filter === 'All') return itemsWithCat;
    // Check room tags first (case-sensitive as provided)
    const byRoom = itemsWithMeta.filter((i: any) => (i.__rooms || []).includes(filter));
    if (byRoom.length > 0) return byRoom.map((i: any) => ({ ...i, __cat: categorize(i.src) }));
    // Fallback to category filter
    return itemsWithCat.filter((i: any) => i.__cat === filter);
  }, [filter, itemsWithCat, itemsWithMeta]);

  useEffect(() => {
    // Reset visible items on filter change
    setVisibleCount(9);
  }, [filter]);

  // Read initial filter from query string (`gallery` or `room`) on mount
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search || '');
      const q = params.get('gallery') || params.get('room');
      if (q) {
        const opt = allFilterOptions.find(o => String(o).toLowerCase() === String(q).toLowerCase());
        if (opt) setFilter(opt);
      }
    } catch {
      // ignore - URL parsing not critical
    }
  }, []);

  // Update the query string when filter changes (pushState)
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (filter && filter !== 'All') {
        url.searchParams.set('gallery', String(filter));
      } else {
        url.searchParams.delete('gallery');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore - history.replaceState may fail in some environments
    }
  }, [filter]);

  const openAt = (i: number) => { setIndex(i); setOpen(true); };
  const close = () => setOpen(false);
  const next = () => setIndex((i) => (i + 1) % filtered.length);
  const prev = () => setIndex((i) => (i - 1 + filtered.length) % filtered.length);

  const showMore = () => setVisibleCount(c => Math.min(c + 9, filtered.length));

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2 justify-center">
        {allFilterOptions.map((c) => (
          <button
            key={c}
            className={`px-3 py-1.5 rounded-full text-sm border ${filter === c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            onClick={() => setFilter(c)}
            aria-pressed={filter === c}
          >
            {c}
          </button>
        ))}
        <div className="ml-auto" />
        <button
          className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50"
          onClick={() => { setIndex(0); setOpen(true); }}
          aria-label="Open slideshow"
        >
          Open slideshow
        </button>
      </div>

      <div id="gallery-grid" className="gallery grid grid-cols-2 sm:grid-cols-3 gap-2" role="list">
        {filtered.slice(0, visibleCount).map((item, i) => {
          const src = item.src;
          const alt = item.alt || `Gallery image ${i + 1}`;
          return (
            <figure key={`${item.src}-${i}`} className="flex flex-col" role="listitem">
              <button onClick={() => openAt(i)} className="focus:outline-none" aria-label={`Open image ${i + 1}`}>
                <div className="relative" style={{ paddingTop: '75%' }}>
                  {item.srcWebp ? (
                    <picture>
                      <source srcSet={item.srcWebp} type="image/webp" />
                      <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                    </picture>
                  ) : (
                    <img src={src} alt={alt} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                  )}
                </div>
              </button>
              {item.caption && (
                <figcaption className="text-xs text-gray-600 mt-1">{item.caption}</figcaption>
              )}
            </figure>
          );
        })}
      </div>

      {visibleCount < filtered.length && (
        <div className="mt-4 flex justify-center">
          <button onClick={showMore} className="px-4 py-2 rounded border hover:bg-gray-50">Show more</button>
        </div>
      )}

      <div className="sr-only" aria-live="polite">{`Showing ${Math.min(visibleCount, filtered.length)} of ${filtered.length} images${filter !== 'All' ? ' in ' + filter : ''}.`}</div>

      <LightboxDialog
        images={filtered}
        index={index}
        open={open}
        onClose={close}
        onPrev={prev}
        onNext={next}
      />
    </>
  );
}
