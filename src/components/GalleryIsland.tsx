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
  const desiredIndexRef = React.useRef<number | null>(null);

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

  // When filtered items are ready, if an index was requested via query, open lightbox
  useEffect(() => {
    if (desiredIndexRef.current == null) return;
    const raw = desiredIndexRef.current as number;
    const idx = Math.max(0, Math.min(raw, filtered.length - 1));
    if (filtered.length > 0) {
      setIndex(idx);
      setOpen(true);
      desiredIndexRef.current = null;
    }
  }, [filtered]);

  // Read initial filter and index from query (search or hash) on mount
  useEffect(() => {
    try {
      let search = window.location.search || '';
      if (!search && window.location.hash && window.location.hash.includes('?')) {
        search = window.location.hash.slice(window.location.hash.indexOf('?'));
      }
      const params = new URLSearchParams(search || '');
      const q = params.get('gallery') || params.get('room');
      const idx = params.has('index') ? Number(params.get('index')) : null;
      if (q) {
        const opt = allFilterOptions.find(o => String(o).toLowerCase() === String(q).toLowerCase());
        if (opt) setFilter(opt);
      }
      if (idx !== null && !Number.isNaN(idx)) desiredIndexRef.current = idx;
    } catch {
      // ignore - URL parsing not critical
    }
  }, [allFilterOptions]);

  // Update the query string when filter changes (pushState)
  const updateUrlParams = (opts: { gallery?: string | null; index?: number | null }) => {
    try {
      const url = new URL(window.location.href);
      if (opts.gallery != null) {
        if (opts.gallery && opts.gallery !== 'All') url.searchParams.set('gallery', String(opts.gallery));
        else url.searchParams.delete('gallery');
      }
      if (opts.index != null) {
        if (opts.index >= 0) url.searchParams.set('index', String(opts.index));
        else url.searchParams.delete('index');
      }
      if (!url.hash) url.hash = '#gallery';
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore - history/URL updates are non-essential
    }
  };

  useEffect(() => {
    updateUrlParams({ gallery: filter });
  }, [filter]);

  // Update index param when open or index changes
  useEffect(() => {
    if (open) updateUrlParams({ index });
    else updateUrlParams({ index: null });
  }, [open, index]);

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

          // Helper: if filename contains a trailing size token like "-1200.jpg",
          // generate srcset variants by replacing that number with standard widths.
          const parseSizeToken = (s?: string) => {
            if (!s) return null;
            const m = s.match(/-(\d{2,4})(\.(jpe?g|png|webp|avif))$/i);
            if (!m) return null;
            return { orig: Number(m[1]), ext: m[2], index: m.index };
          };

          const buildSrcSet = (s?: string) => {
            if (!s) return undefined;
            const info = parseSizeToken(s);
            if (!info) return undefined;
            const widths = [480, 768, 1200, 1600];
            const parts = widths.map((w) => s.replace(/-(\d{2,4})(\.(jpe?g|png|webp|avif))$/i, `-${w}$2`) + ` ${w}w`);
            return parts.join(', ');
          };

          const srcSet = buildSrcSet(src);
          const webpSrcSet = item.srcWebp ? buildSrcSet(item.srcWebp) : undefined;

          // Derive width/height from original token when available (assume 4:3 aspect ratio)
          const sizeInfo = parseSizeToken(src);
          const widthAttr = sizeInfo ? sizeInfo.orig : undefined;
          const heightAttr = sizeInfo ? Math.round(sizeInfo.orig * 0.75) : undefined;

          return (
            <figure key={item.src} className="flex flex-col" role="listitem">
              <button onClick={() => openAt(i)} className="focus:outline-none" aria-label={`Open image ${i + 1}`}>
                <div className="relative" style={{ paddingTop: '75%' }}>
                  {item.srcWebp ? (
                    <picture>
                      {webpSrcSet ? <source srcSet={webpSrcSet} type="image/webp" /> : <source srcSet={item.srcWebp} type="image/webp" />}
                      {srcSet ? (
                        <img src={src} srcSet={srcSet} sizes="(min-width: 640px) 33vw, 50vw" width={widthAttr} height={heightAttr} alt={alt} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                      ) : (
                        <img src={src} alt={alt} width={widthAttr} height={heightAttr} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                      )}
                    </picture>
                  ) : (
                    srcSet ? (
                      <img src={src} srcSet={srcSet} sizes="(min-width: 640px) 33vw, 50vw" alt={alt} width={widthAttr} height={heightAttr} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                    ) : (
                      <img src={src} alt={alt} width={widthAttr} height={heightAttr} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                    )
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
