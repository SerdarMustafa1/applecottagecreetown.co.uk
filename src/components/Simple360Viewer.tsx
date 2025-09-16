import React, { useEffect, useRef, useState } from 'react';

interface Props {
  pano: {
    label?: string;
    src: string;
    preview?: string;
  };
  height?: number;
}

export default function Simple360Viewer({ pano, height = 320 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

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

      // Create scene using React-safe approach
      const scene = document.createElement('a-scene');
      scene.setAttribute('embedded', '');
      scene.style.width = '100%';
      scene.style.height = '100%';
      scene.setAttribute('vr-mode-ui', 'enabled: false');
      scene.setAttribute('device-orientation-permission-ui', 'enabled: false');

      const sky = document.createElement('a-sky');
      sky.setAttribute('src', pano.src);
      sky.setAttribute('rotation', '0 -90 0');

      const camera = document.createElement('a-camera');
      camera.setAttribute('look-controls', 'enabled: true');
      camera.setAttribute('wasd-controls', 'enabled: false');

      scene.appendChild(sky);
      scene.appendChild(camera);
      
      // Clear container and add scene
      container.innerHTML = '';
      container.appendChild(scene);
      
      setLoaded(true);
    };

    loadAFrame().catch(() => setError(true));

    // No cleanup to avoid React DOM conflicts
  }, [pano.src]);

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
          <img
            src={pano.preview || pano.src}
            alt={pano.label || '360 preview'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">Drag to look around</p>
    </div>
  );
}