/* eslint-env browser */
import React, { useCallback, useEffect, useRef, useState } from 'react';

type Pano = {
  label?: string;
  src: string; // equirectangular JPG/PNG from Insta360 export
  preview?: string; // optional poster/thumb
};

interface Props {
  pano: Pano;
  height?: number;
}

const REPORT_INTERVAL_MS = 5000;

export default function PanoViewerIsland({ pano, height = 320 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inited, setInited] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const initializedRef = useRef(false);
  const watchIntervalRef = useRef<number | null>(null);

  const dispatchTourWatch = useCallback((seconds: number) => {
    if (typeof window === 'undefined') return;
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    window.dispatchEvent(new CustomEvent('applecottage:tour-watch', {
      detail: {
        secondsWatched: seconds,
        source: 'pannellum',
        panoSrc: pano.src,
        label: pano.label,
      },
    }));
  }, [pano.label, pano.src]);

  useEffect(() => {
    initializedRef.current = false;
    setInited(false);
  }, [pano.src]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let observer: IntersectionObserver | undefined;
    let cleanup: (() => void) | undefined;

    const init = async () => {
      if (initializedRef.current) return;
      try {
        await Promise.all([
          import('pannellum/build/pannellum.js'),
          import('pannellum/build/pannellum.css'),
        ]);
        const pannellumLib = (window as any).pannellum;
        if (!pannellumLib || !pannellumLib.viewer) {
          throw new Error('Pannellum not available on window');
        }
        // Rewrite CDN URLs to same-origin proxy to avoid CORS/XHR issues
        let src = pano.src;
        try {
          const u = new URL(pano.src, window.location.href);
          if (u.host.includes('cloudfront.net')) {
            src = '/proxy-cdn' + u.pathname;
          }
        } catch {
          src = pano.src;
        }
        const viewer = pannellumLib.viewer(el, {
          type: 'equirectangular',
          panorama: src,
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
        initializedRef.current = true;
      } catch (err) {

        console.error('Failed to init pannellum', err);
      }
    };

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const entry = entries[0];
      if (!entry) return;
      setIsVisible(entry.isIntersecting);
      if (entry.isIntersecting) {
        void init();
      }
    };

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(handleIntersection, { rootMargin: '200px', threshold: 0.2 });
      observer.observe(el);
    } else {
      setIsVisible(true);
      void init();
    }

    return () => {
      observer?.disconnect();
      cleanup?.();
    };
  }, [pano.src]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (!isVisible || !inited) {
      if (watchIntervalRef.current !== null) {
        window.clearInterval(watchIntervalRef.current);
        watchIntervalRef.current = null;
      }
      return;
    }

    if (watchIntervalRef.current !== null) {
      return;
    }

    let lastMark = Date.now();
    watchIntervalRef.current = window.setInterval(() => {
      const now = Date.now();
      const deltaSeconds = Math.max(0, Math.round((now - lastMark) / 1000));
      lastMark = now;
      if (deltaSeconds > 0) {
        dispatchTourWatch(deltaSeconds);
      }
    }, REPORT_INTERVAL_MS);

    return () => {
      if (watchIntervalRef.current !== null) {
        window.clearInterval(watchIntervalRef.current);
        watchIntervalRef.current = null;
      }
    };
  }, [dispatchTourWatch, inited, isVisible]);

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
