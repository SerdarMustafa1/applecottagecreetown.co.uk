import React, { useState } from 'react';
import type { ImageMetadata } from 'astro:assets';
import LightboxDialog from './LightboxDialog';

// Accept an array of image sources which may be string paths or
// ImageMetadata objects returned from Astro's asset pipeline.
interface GalleryIslandProps {
  images: (string | ImageMetadata)[];
}

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
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => openAt(i)}
            className="focus:outline-none"
            aria-label={`Open image ${i + 1}`}
          >
            <img
              src={typeof img === 'string' ? img : (img as ImageMetadata).src}
              alt={`Gallery image ${i + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
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
