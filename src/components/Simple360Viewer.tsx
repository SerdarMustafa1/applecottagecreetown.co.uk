import React, { useCallback, useEffect, useRef, useState } from 'react';
import { trackMediaEngagement } from '../lib/analytics';

interface Props {
  pano: {
    label?: string;
    src: string;
    srcWebp?: string;
    preview?: string;
  };
  height?: number;
}

export default function Simple360Viewer({ pano, height = 320 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const watchIntervalRef = useRef<number | null>(null);
  const trackedOpenRef = useRef(false);

  const dispatchTourWatch = useCallback((seconds: number) => {
    if (typeof window === 'undefined') return;
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    window.dispatchEvent(new CustomEvent('applecottage:tour-watch', {
      detail: {
        secondsWatched: seconds,
        source: 'a-frame',
        panoSrc: pano.src,
        label: pano.label,
      },
    }));
  }, [pano.label, pano.src]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const loadAFrame = async () => {
      // Load A-Frame only once globally
      if (!(window as any).AFRAME) {
        if (!(window as any).aframeLoading) {
          (window as any).aframeLoading = new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://aframe.io/releases/1.4.0/aframe.min.js';
            script.onload = resolve;
            document.head.appendChild(script);
          });
        }
        await (window as any).aframeLoading;
      }

      // Set loaded first to hide React-managed preview
      setLoaded(true);
      
      // Small delay to ensure React has updated
      setTimeout(() => {
        container.innerHTML = `
          <a-scene embedded style="width: 100%; height: 100%;" vr-mode-ui="enabled: false" device-orientation-permission-ui="enabled: false">
            <a-sky src="${pano.src}" rotation="0 -90 0"></a-sky>
            <a-camera look-controls="enabled: true" wasd-controls="enabled: false"></a-camera>
          </a-scene>
        `;
      }, 50);
    };

    loadAFrame().catch(() => setError(true));
  }, [pano.src]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      setIsVisible(Boolean(entry?.isIntersecting));
    }, { threshold: 0.25 });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (!loaded || !isVisible) {
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
    }, 5000);

    return () => {
      if (watchIntervalRef.current !== null) {
        window.clearInterval(watchIntervalRef.current);
        watchIntervalRef.current = null;
      }
    };
  }, [dispatchTourWatch, isVisible, loaded]);

  useEffect(() => {
    if (trackedOpenRef.current) return;
    if (!loaded || !isVisible) return;
    trackedOpenRef.current = true;
    trackMediaEngagement({
      mediaType: 'pano',
      action: 'open',
      label: pano.label,
      identifier: pano.src,
      location: 'panos',
    });
  }, [loaded, isVisible, pano.label, pano.src]);

  if (error) {
    return (
      <div className="w-full">
        {pano.label && <h3 className="mb-2 font-semibold text-lg">{pano.label}</h3>}
        <div 
          className="rounded border bg-gray-100 flex items-center justify-center"
          style={{ height }}
        >
          <p className="text-gray-500">Failed to load 360° image</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {pano.label && <h3 className="mb-2 font-semibold text-lg">{pano.label}</h3>}
      <div 
        ref={containerRef}
        className="rounded border overflow-hidden bg-black"
        style={{ width: '100%', height }}
      >
        {!loaded && (
          <div className="relative w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
            <picture>
              {pano.srcWebp && (
                <source srcSet={pano.srcWebp} type="image/webp" />
              )}
              <img
                src={pano.preview || pano.src}
                alt={pano.label || '360 preview'}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
                onLoad={(e) => {
                  const img = e.target as HTMLImageElement;
                  const shimmer = img.parentElement?.parentElement?.querySelector('.animate-pulse');
                  if (shimmer) shimmer.remove();
                }}
              />
            </picture>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">Drag to look around</p>
    </div>
  );
}
