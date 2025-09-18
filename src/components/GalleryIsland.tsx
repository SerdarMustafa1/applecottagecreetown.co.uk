import React, { useMemo, useState, useEffect, useCallback, useRef } from 'react';
import LightboxDialog from './LightboxDialog';
import { parseSizeToken, buildVerifiedSrcSet } from '../lib/imageVariants';

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

// Room/area icons mapping
const ROOM_ICONS: Record<string, string> = {
  'All': '🏠',
  'kitchen': '🍳',
  'bedrooms': '🛏️',
  'bathroom': '🛁',
  'livingAreas': '🛋️',
  'lounge': '🛋️',
  'conservatory': '🪴',
  'zenRoom': '🧘',
  'utility': '🧺',
  'downstairsWc': '🚽',
  'exterior': '🌿',
  'garden': '🌻',
  'annex': '🏢',
  'Other': '📷'
};

export default function GalleryIsland({ images }: GalleryIslandProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [filter, setFilter] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const desiredIndexRef = React.useRef<number | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<IntersectionObserver | null>(null);

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
    setVisibleCount(12);
  }, [filter]);

  // Infinite scroll implementation
  const loadMore = useCallback(() => {
    if (isLoading || visibleCount >= filtered.length) return;
    setIsLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + 12, filtered.length));
      setIsLoading(false);
    }, 300);
  }, [isLoading, visibleCount, filtered.length]);

  useEffect(() => {
    const observer = observerRef.current;
    if (!observer) return;

    loadMoreRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    loadMoreRef.current.observe(observer);

    return () => {
      if (loadMoreRef.current) {
        loadMoreRef.current.disconnect();
      }
    };
  }, [loadMore]);

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

  // Get icon for filter option
  const getFilterIcon = (filterName: string) => {
    return ROOM_ICONS[filterName] || ROOM_ICONS['Other'];
  };

  // Precompute a Set of all srcs to verify variant existence
  const allSrcs = useMemo(() => new Set(images.map(i => i.src)), [images]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2 justify-center">
        {allFilterOptions.map((c) => (
          <button
            key={c}
            className={`px-3 py-2 rounded-full text-sm border transition-all duration-200 flex items-center gap-1.5 ${
              filter === c 
                ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300'
            }`}
            onClick={() => setFilter(c)}
            aria-pressed={filter === c}
          >
            <span className="text-base">{getFilterIcon(c)}</span>
            <span>{c}</span>
          </button>
        ))}
        <div className="ml-auto" />
        <button
          className="px-3 py-2 rounded border text-sm hover:bg-gray-50 flex items-center gap-1.5"
          onClick={() => { setIndex(0); setOpen(true); }}
          aria-label="Open slideshow"
        >
          <span>🎬</span>
          <span>Open slideshow</span>
        </button>
      </div>

      <div id="gallery-grid" className="gallery grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3" role="list">
        {filtered.slice(0, visibleCount).map((item, i) => {
          const src = item.src;
            const alt = item.alt || `Gallery image ${i + 1}`;
            const sizeInfo = parseSizeToken(src);
            const widthAttr = sizeInfo ? sizeInfo.orig : undefined;
            const heightAttr = sizeInfo ? Math.round(sizeInfo.orig * 0.75) : undefined;
            const srcSet = buildVerifiedSrcSet(src, allSrcs);
            const webpSrcSet = item.srcWebp ? buildVerifiedSrcSet(item.srcWebp, allSrcs) : undefined;

          return (
            <figure key={`${item.src}-${i}`} className="flex flex-col group" role="listitem">
              <button 
                onClick={() => openAt(i)} 
                className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg overflow-hidden" 
                aria-label={`Open image ${i + 1}`}
              >
                <div className="relative transition-transform duration-200 group-hover:scale-105" style={{ paddingTop: '75%' }}>
                  {item.srcWebp ? (
                      <picture>
                        {webpSrcSet ? <source srcSet={webpSrcSet} type="image/webp" /> : <source srcSet={item.srcWebp} type="image/webp" />}
                        {srcSet ? (
                          <img src={src} srcSet={srcSet} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" width={widthAttr} height={heightAttr} alt={alt} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                        ) : (
                          <img src={src} alt={alt} width={widthAttr} height={heightAttr} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                        )}
                      </picture>
                    ) : (
                      srcSet ? (
                        <img src={src} srcSet={srcSet} sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" alt={alt} width={widthAttr} height={heightAttr} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                      ) : (
                        <img src={src} alt={alt} width={widthAttr} height={heightAttr} className="absolute inset-0 w-full h-full object-cover" loading="lazy" decoding="async" />
                      )
                    )}
                </div>
              </button>
              {item.caption && (
                <figcaption className="text-xs text-gray-600 mt-2 px-1">{item.caption}</figcaption>
              )}
            </figure>
          );
        })}
      </div>

      {/* Infinite scroll trigger */}
      {visibleCount < filtered.length && (
        <div 
          ref={observerRef}
          className="mt-6 flex justify-center items-center h-16"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm">Loading more images...</span>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Scroll to load more images</div>
          )}
        </div>
      )}

      <div className="sr-only" aria-live="polite">
        {`Showing ${Math.min(visibleCount, filtered.length)} of ${filtered.length} images${filter !== 'All' ? ' in ' + filter : ''}.`}
        {isLoading && ' Loading more images...'}
      </div>

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
