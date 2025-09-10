import React, { useState } from 'react';
import type { ImageMetadata } from 'astro:assets';
import { Image } from 'astro:assets';
import LightboxDialog from './LightboxDialog';

interface GalleryIslandProps {
  images: ImageMetadata[];
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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => openAt(i)}
            className="focus:outline-none"
          >
            <Image src={img} alt={`Gallery image ${i + 1}`} className="w-full h-full object-cover" />
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
