import React, { useMemo, useState, useEffect } from 'react';
import LightboxDialog from './LightboxDialog';

// Accept an array of image sources which may be string paths or
// ImageMetadata objects returned from Astro's asset pipeline.
type GalleryItem = { 
  src: string; 
  srcWebp?: string; // WebP version for progressive enhancement
  alt?: string; 
  caption?: string; 
};
interface GalleryIslandProps { images: GalleryItem[]; }

export default function GalleryIsland({ images }: GalleryIslandProps) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [filter, setFilter] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState(9);

  // Infer simple categories from path
  const categorize = (src: string): string => {
    if (/\/exterior\//i.test(src)) return 'Exterior';
    if (/\/interior\//i.test(src)) return 'Interior';
    if (/\/garden\//i.test(src)) return 'Garden';
    if (/\/new\//i.test(src)) return 'Featured';
    return 'Other';
  };

  const itemsWithCat = useMemo(() => images.map(img => ({ ...img, __cat: categorize(img.src) })), [images]);
  const categories = useMemo(() => ['All', ...Array.from(new Set(itemsWithCat.map(i => i.__cat)))], [itemsWithCat]);
  const filtered = useMemo(() => filter === 'All' ? itemsWithCat : itemsWithCat.filter(i => i.__cat === filter), [itemsWithCat, filter]);

  useEffect(() => {
    // Reset visible items on filter change
    setVisibleCount(9);
  }, [filter]);

  const openAt = (i: number) => { setIndex(i); setOpen(true); };
  const close = () => setOpen(false);
  const next = () => setIndex((i) => (i + 1) % filtered.length);
  const prev = () => setIndex((i) => (i - 1 + filtered.length) % filtered.length);

  const showMore = () => setVisibleCount(c => Math.min(c + 9, filtered.length));

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2 justify-center">
        {categories.map((c) => (
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
