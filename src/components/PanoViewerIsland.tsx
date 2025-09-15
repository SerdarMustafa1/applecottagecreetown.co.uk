/* eslint-env browser */
import React, { useEffect, useRef, useState } from 'react';

type Pano = {
  label?: string;
  src: string; // equirectangular JPG/PNG from Insta360 export
  preview?: string; // optional poster/thumb
};

interface Props {
  pano: Pano;
  height?: number;
}

export default function PanoViewerIsland({ pano, height = 320 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inited, setInited] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let observer: IntersectionObserver | undefined;
    let cleanup: (() => void) | undefined;

    const init = async () => {
      if (inited) return;
      try {
        await Promise.all([
          import('pannellum/build/pannellum.js'),
          import('pannellum/build/pannellum.css'),
        ]);
        const pannellumLib = (window as any).pannellum;
        if (!pannellumLib || !pannellumLib.viewer) {
          throw new Error('Pannellum not available on window');
        }
        const viewer = pannellumLib.viewer(el, {
          type: 'equirectangular',
          panorama: pano.src,
          crossOrigin: 'anonymous',
          autoLoad: true,
          compass: false,
          showZoomCtrl: true,
          showFullscreenCtrl: true,
        });
        cleanup = () => {
          try { viewer.destroy && viewer.destroy(); } catch { /* noop */ }
        };
        setInited(true);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to init pannellum', err);
      }
    };

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          observer?.disconnect();
          init();
        }
      }, { rootMargin: '200px' });
      observer.observe(el);
    } else {
      init();
    }

    return () => {
      observer?.disconnect();
      cleanup?.();
    };
  }, [pano.src, inited]);

  return (
    <div className="w-full">
      {pano.label && (
        <h3 className="mb-2 font-semibold text-lg">{pano.label}</h3>
      )}
      <div
        ref={containerRef}
        className="rounded border overflow-hidden"
        style={{ width: '100%', height }}
        role="region"
        aria-label={pano.label ? `${pano.label} 360 viewer` : '360 viewer'}
      >
        {!inited && (
          <img
            src={pano.preview || pano.src}
            alt={pano.label || '360 preview'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}
