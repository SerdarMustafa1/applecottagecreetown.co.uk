import React, { useState } from 'react';
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

  const openAt = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  const close = () => setOpen(false);
  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <>
      <div id="gallery-grid" className="gallery grid grid-cols-2 sm:grid-cols-3 gap-2" role="list">
        {images.map((item, i) => {
          const src = item.src;
          const alt = item.alt || `Gallery image ${i + 1}`;
          return (
            <figure key={i} className="flex flex-col" role="listitem">
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
      <LightboxDialog
        images={images}
        index={index}
        open={open}
        onClose={close}
        onPrev={prev}
        onNext={next}
      />
    </>
  );
}
