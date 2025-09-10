import React, { useEffect, useRef } from 'react';
import type { ImageMetadata } from 'astro:assets';
import { Image } from 'astro:assets';

interface LightboxProps {
  images: ImageMetadata[];
  index: number;
  open: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function LightboxDialog({
  images,
  index,
  open,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number>();

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
      if (e.key === 'Tab') {
        const focusable = [closeRef.current, prevRef.current, nextRef.current].filter(Boolean) as HTMLElement[];
        if (focusable.length === 0) return;
        const idx = focusable.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        let nextIndex = e.shiftKey ? idx - 1 : idx + 1;
        if (nextIndex < 0) nextIndex = focusable.length - 1;
        if (nextIndex >= focusable.length) nextIndex = 0;
        focusable[nextIndex].focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('keydown', handleKey);
      previouslyFocused?.focus();
    };
  }, [open, onClose, onPrev, onNext]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    if (start == null) return;
    const diff = e.changedTouches[0].clientX - start;
    if (Math.abs(diff) > 50) {
      diff > 0 ? onPrev() : onNext();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="relative max-w-[90%] max-h-[90%]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image src={images[index]} alt={`Image ${index + 1}`} className="max-h-[90vh] w-auto" />
        <button
          ref={closeRef}
          aria-label="Close"
          className="absolute top-2 right-2 text-white text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        {images.length > 1 && (
          <>
            <button
              ref={prevRef}
              aria-label="Previous"
              className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-2xl"
              onClick={onPrev}
            >
              ‹
            </button>
            <button
              ref={nextRef}
              aria-label="Next"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-2xl"
              onClick={onNext}
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
}
