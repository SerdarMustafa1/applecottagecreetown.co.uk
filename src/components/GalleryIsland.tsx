import React, { useMemo, useState, useEffect, useCallback, useRef, Suspense, lazy } from 'react';
const LightboxDialog = lazy(() => import('./LightboxDialog'));
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

// Room/area icons mapping with marketing-focused labels
const ROOM_ICONS: Record<string, string> = {
  'All Photos': '🏠',
  'Exterior & Gardens': '🌿',
  'Kitchen': '🍳',
  'Living Areas': '🛋️',
  'Bedrooms': '🛏️',
  'Bathroom': '🛁',
  'Utility & Storage': '🧺',
  'Annex Office': '🏢',
  'Other': '📷'
};

// Marketing-focused filter order (most appealing first)
const MARKETING_ORDER = [
  'All Photos',
  'Exterior & Gardens', 
  'Kitchen',
  'Living Areas',
  'Bedrooms',
  'Bathroom',
  'Annex Office',
  'Utility & Storage'
];

export default function GalleryIsland({ images }: GalleryIslandProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [filter, setFilter] = useState<string>('All Photos');
  const [visibleCount, setVisibleCount] = useState(12);
  const [isLoading, setIsLoading] = useState(false);
  const desiredIndexRef = React.useRef<number | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<IntersectionObserver | null>(null);

  // Expose a simple global flag so E2E tests can reliably wait for hydration
  useEffect(() => {
    (window as any).__GALLERY_HYDRATED = true;
  }, []);

  // Enhanced categorization with marketing-focused grouping
  const categorizeImage = (img: GalleryItem): string => {
    // First check explicit room assignments
    if (img.rooms && img.rooms.length > 0) {
      const room = img.rooms[0];
      if (room === 'Kitchen' || room === 'kitchen') return 'Kitchen';
      if (room === 'Bedrooms' || room === 'bedrooms') return 'Bedrooms';
      if (room === 'Bathroom' || room === 'bathroom') return 'Bathroom';
      if (room === 'Living Areas' || room === 'livingAreas' || room === 'lounge') return 'Living Areas';
      if (room === 'Exterior & Gardens' || room === 'exterior' || room === 'garden') return 'Exterior & Gardens';
      if (room === 'Annex Office' || room === 'annex') return 'Annex Office';
      if (room === 'Utility & Storage' || room === 'utility' || room === 'downstairsWc') return 'Utility & Storage';
    }
    
    // Fallback to text analysis
    const text = `${img.src} ${img.alt || ''} ${img.caption || ''}`.toLowerCase();
    
    // Check specific exclusions first
    if (/bathroom|bath/.test(text)) {
      return 'Bathroom';
    }
    if (/annex|office/.test(text)) {
      return 'Annex Office';
    }
    if (/utility|downstairs.*wc|storage/.test(text)) {
      return 'Utility & Storage';
    }
    if (/kitchen|kitch/.test(text)) {
      return 'Kitchen';
    }
    if (/bedroom|bed|master/.test(text)) {
      return 'Bedrooms';
    }
    if (/lounge|living|conservatory|hallway|zen/.test(text)) {
      return 'Living Areas';
    }
    
    // Exterior only for actual exterior/garden images (exclude interior panoramic)
    if (/exterior|garden|drive|outside|street|front|elevation|hero/.test(text) && !/interior|panoramic.*interior/.test(text)) {
      return 'Exterior & Gardens';
    }
    
    // Handle panoramic images - if it's a pano but not clearly exterior, categorize by content
    if (/pano/.test(text)) {
      if (/garden|exterior|drive|approach|parking/.test(text)) {
        return 'Exterior & Gardens';
      }
      // Interior panoramic goes to Living Areas by default
      return 'Living Areas';
    }
    
    return 'Other';
  };

  const itemsWithCategories = useMemo(() => 
    images.map(img => ({
      ...img,
      __category: categorizeImage(img)
    })), [images]);

  const allFilterOptions = useMemo(() => {
    const availableCategories = new Set(itemsWithCategories.map(img => img.__category));
    return MARKETING_ORDER.filter(category => 
      category === 'All Photos' || availableCategories.has(category)
    );
  }, [itemsWithCategories]);

  const filtered = useMemo(() => {
    if (filter === 'All Photos') return itemsWithCategories;
    return itemsWithCategories.filter(img => img.__category === filter);
  }, [filter, itemsWithCategories]);

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
    let cancelled = false;
    (async () => {
      if (typeof window === 'undefined') return;
      const target = observerRef.current;
      if (!target) return;
      if (!('IntersectionObserver' in window)) {
        try {
          const mod = await import('../lib/polyfills/intersectionObserver');
          if (!cancelled) mod.ensureIntersectionObserver();
        } catch {
          // ignore polyfill load errors
        }
      }
      if (cancelled) return;
      if (!('IntersectionObserver' in window)) return; // still unavailable
      loadMoreRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            loadMore();
          }
        },
        { threshold: 0.1 }
      );
      loadMoreRef.current.observe(target);
    })();
    return () => {
      cancelled = true;
      if (loadMoreRef.current) loadMoreRef.current.disconnect();
    };
  }, [loadMore]);

  // When filtered items are ready, if an index was requested via query, open lightbox
  useEffect(() => {
    if (desiredIndexRef.current == null) return;
    const raw = desiredIndexRef.current as number;
    const idx = Math.max(0, Math.min(raw, filtered.length - 1));
    if (filtered.length > 0 && raw >= 0) {
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
        // Handle legacy filter names
        const legacyMap: Record<string, string> = {
          'all': 'All Photos',
          'exterior': 'Exterior & Gardens',
          'garden': 'Exterior & Gardens',
          'kitchen': 'Kitchen',
          'livingareas': 'Living Areas',
          'lounge': 'Living Areas',
          'bedrooms': 'Bedrooms',
          'bathroom': 'Bathroom',
          'annex': 'Annex Office',
          'utility': 'Utility & Storage'
        };
        const mappedFilter = legacyMap[q.toLowerCase()] || q;
        const opt = allFilterOptions.find(o => String(o).toLowerCase() === String(mappedFilter).toLowerCase());
        if (opt) setFilter(opt);
      }
      if (idx !== null && !Number.isNaN(idx) && idx >= 0) desiredIndexRef.current = idx;
    } catch {
      // ignore - URL parsing not critical
    }
  }, [allFilterOptions]);

  // Update the query string when filter changes (pushState)
  const updateUrlParams = (opts: { gallery?: string | null; index?: number | null }) => {
    try {
      const url = new URL(window.location.href);
      if (opts.gallery != null) {
        if (opts.gallery && opts.gallery !== 'All Photos') {
          // Use URL-friendly version of filter name
          const urlFriendly = opts.gallery.toLowerCase().replace(/[^a-z0-9]/g, '');
          url.searchParams.set('gallery', urlFriendly);
        } else {
          url.searchParams.delete('gallery');
        }
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

  // Prevent lightbox from opening on filter change
  useEffect(() => {
    if (desiredIndexRef.current !== null) {
      desiredIndexRef.current = null;
    }
  }, [filter]);

  // Update index param when open or index changes
  useEffect(() => {
    if (open) updateUrlParams({ index });
    else updateUrlParams({ index: null });
  }, [open, index]);

  const openAt = (i: number) => { 
    if (i >= 0 && i < filtered.length && filtered[i]?.src) {
      setIndex(i); 
      setOpen(true); 
    }
  };
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
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-2 justify-center mb-4">
          {allFilterOptions.map((category) => (
            <button
              key={category}
              className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 flex items-center gap-2 ${
                filter === category 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg transform scale-105' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md'
              }`}
              onClick={() => setFilter(category)}
              aria-pressed={filter === category}
            >
              <span className="text-lg">{getFilterIcon(category)}</span>
              <span>{category}</span>
            </button>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>{filtered.length} {filtered.length === 1 ? 'photo' : 'photos'}</span>
            {filter !== 'All Photos' && (
              <button
                onClick={() => setFilter('All Photos')}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                View all photos
              </button>
            )}
          </div>
          <button
            className="px-3 py-1.5 rounded border text-sm hover:bg-gray-50 flex items-center gap-1.5 transition-colors"
            onClick={(e) => { 
              e.stopPropagation(); 
              if (filtered.length > 0 && filtered[0]?.src) {
                setIndex(0); 
                setOpen(true); 
              }
            }}
            aria-label="Open slideshow"
          >
            <span>🎬</span>
            <span>Slideshow</span>
          </button>
        </div>
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
                aria-label={`Open image ${i + 1}: ${alt}`}
              >
                <div className="relative bg-gray-100 transition-transform duration-200 group-hover:scale-105" style={{ paddingTop: '75%' }}>
                  {/* Loading shimmer placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                  
                  {item.srcWebp ? (
                      <picture>
                        {webpSrcSet ? <source srcSet={webpSrcSet} type="image/webp" /> : <source srcSet={item.srcWebp} type="image/webp" />}
                        {srcSet ? (
                          <img 
                            src={src} 
                            srcSet={srcSet} 
                            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" 
                            width={widthAttr} 
                            height={heightAttr} 
                            alt={alt} 
                            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300" 
                            loading="lazy" 
                            decoding="async"
                            onLoad={(e) => {
                              const img = e.target as HTMLImageElement;
                              const shimmer = img.parentElement?.querySelector('.animate-pulse');
                              if (shimmer) shimmer.remove();
                            }}
                          />
                        ) : (
                          <img 
                            src={src} 
                            alt={alt} 
                            width={widthAttr} 
                            height={heightAttr} 
                            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300" 
                            loading="lazy" 
                            decoding="async"
                            onLoad={(e) => {
                              const img = e.target as HTMLImageElement;
                              const shimmer = img.parentElement?.querySelector('.animate-pulse');
                              if (shimmer) shimmer.remove();
                            }}
                          />
                        )}
                      </picture>
                    ) : (
                      srcSet ? (
                        <img 
                          src={src} 
                          srcSet={srcSet} 
                          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw" 
                          alt={alt} 
                          width={widthAttr} 
                          height={heightAttr} 
                          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300" 
                          loading="lazy" 
                          decoding="async"
                          onLoad={(e) => {
                            const img = e.target as HTMLImageElement;
                            const shimmer = img.parentElement?.querySelector('.animate-pulse');
                            if (shimmer) shimmer.remove();
                          }}
                        />
                      ) : (
                        <img 
                          src={src} 
                          alt={alt} 
                          width={widthAttr} 
                          height={heightAttr} 
                          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300" 
                          loading="lazy" 
                          decoding="async"
                          onLoad={(e) => {
                            const img = e.target as HTMLImageElement;
                            const shimmer = img.parentElement?.querySelector('.animate-pulse');
                            if (shimmer) shimmer.remove();
                          }}
                        />
                      )
                    )}
                </div>
              </button>
              {item.caption && (
                <figcaption className="text-xs text-gray-600 mt-2 px-1 leading-relaxed">{item.caption}</figcaption>
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
        {`Showing ${Math.min(visibleCount, filtered.length)} of ${filtered.length} images${filter !== 'All Photos' ? ' in ' + filter : ''}.`}
        {isLoading && ' Loading more images...'}
      </div>

      <Suspense fallback={null}>
        {open && (
          <LightboxDialog
            images={filtered}
            index={index}
            open={open}
            onClose={close}
            onPrev={prev}
            onNext={next}
          />
        )}
      </Suspense>
    </>
  );
}
