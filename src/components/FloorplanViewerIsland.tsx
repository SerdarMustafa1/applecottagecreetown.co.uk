/* eslint-env browser */
import React, { useRef, useState, useEffect } from 'react';

interface Plan {
  label: string;
  src: string;
}

interface Props {
  plans: Plan[];
}

export default function FloorplanViewerIsland({ plans }: Props) {
  return (
    <div>
      {plans.map((plan) => (
        <ZoomablePlan key={plan.label} plan={plan} />
      ))}
    </div>
  );
}

function ZoomablePlan({ plan }: { plan: Plan }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setScale((s) => Math.min(Math.max(0.5, s + delta), 4));
    };

    let initialDistance = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialDistance = Math.hypot(dx, dy);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const distance = Math.hypot(dx, dy);
        const factor = distance / initialDistance;
        setScale((s) => Math.min(Math.max(0.5, s * factor), 4));
        initialDistance = distance;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <div className="mb-8">
      <h3 className="mb-2 font-semibold">{plan.label}</h3>
      <div
        ref={containerRef}
        className="overflow-auto border rounded relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        <img
          src={plan.src}
          alt={`${plan.label} floor plan`}
          className="block mx-auto relative z-10"
          style={{ transform: `scale(${scale})`, transformOrigin: 'center' }}
          onLoad={(e) => {
            const img = e.target as HTMLImageElement;
            const shimmer = img.parentElement?.querySelector('.animate-pulse');
            if (shimmer) shimmer.remove();
          }}
        />
      </div>
    </div>
  );
}
