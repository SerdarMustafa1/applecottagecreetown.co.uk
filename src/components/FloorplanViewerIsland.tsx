/* eslint-env browser */
import React, { useEffect, useState } from 'react';
import { trackMediaEngagement } from '../lib/analytics';

interface Plan {
  label: string;
  src: string;
  preview?: string;
  type?: 'image' | 'video';
  poster?: string;
}

interface Props {
  plans: Plan[];
}

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|m4v)$/i;
const VIDEO_DEFAULT_POSTER = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#grad)" />
    <g fill="#ffffff">
      <circle cx="400" cy="300" r="110" fill="rgba(255,255,255,0.12)" />
      <polygon points="365,250 475,300 365,350" />
    </g>
    <text x="50%" y="480" text-anchor="middle" font-family="'Inter', Arial, sans-serif" font-size="62" font-weight="700" fill="#ffffff" letter-spacing="8">3D PLAN</text>
  </svg>`
)}`;

const isVideoPlan = (plan: Plan) => plan.type === 'video' || VIDEO_EXTENSIONS.test(plan.src);

const getVideoMimeType = (src: string) => {
  const lower = src.toLowerCase();
  if (lower.endsWith('.webm')) return 'video/webm';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  return 'video/mp4';
};

export default function FloorplanViewerIsland({ plans }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (plan: Plan, index: number) => {
    trackMediaEngagement({
      mediaType: 'floorplan',
      action: 'open',
      label: plan.label,
      identifier: plan.src,
      index,
      total: plans.length,
      format: isVideoPlan(plan) ? 'video' : 'image',
      location: 'floorplans',
    });
    setCurrentPlan(plan);
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    if (currentPlan) {
      trackMediaEngagement({
        mediaType: 'floorplan',
        action: 'close',
        label: currentPlan.label,
        identifier: currentPlan.src,
        index: currentIndex,
        total: plans.length,
        format: isVideoPlan(currentPlan) ? 'video' : 'image',
        location: 'floorplans',
      });
    }
    setLightboxOpen(false);
    setCurrentPlan(null);
  };

  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % plans.length;
    const nextPlan = plans[nextIndex];
    trackMediaEngagement({
      mediaType: 'floorplan',
      action: 'navigate',
      direction: 'next',
      label: nextPlan?.label,
      identifier: nextPlan?.src,
      index: nextIndex,
      total: plans.length,
      format: nextPlan ? (isVideoPlan(nextPlan) ? 'video' : 'image') : undefined,
      location: 'floorplans',
    });
    setCurrentIndex(nextIndex);
    setCurrentPlan(plans[nextIndex]);
  };

  const goToPrev = () => {
    const prevIndex = currentIndex === 0 ? plans.length - 1 : currentIndex - 1;
    const prevPlan = plans[prevIndex];
    trackMediaEngagement({
      mediaType: 'floorplan',
      action: 'navigate',
      direction: 'previous',
      label: prevPlan?.label,
      identifier: prevPlan?.src,
      index: prevIndex,
      total: plans.length,
      format: prevPlan ? (isVideoPlan(prevPlan) ? 'video' : 'image') : undefined,
      location: 'floorplans',
    });
    setCurrentIndex(prevIndex);
    setCurrentPlan(plans[prevIndex]);
  };

  return (
    <>
      <div
        className="grid gap-6 items-stretch sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
        style={{ gridAutoRows: '1fr' }}
      >
        {plans.map((plan, index) => (
          <ClickableFloorplan
            key={plan.label}
            plan={plan}
            onClick={() => openLightbox(plan, index)}
          />
        ))}
      </div>
      
      {lightboxOpen && currentPlan && (
        <SimpleLightbox
          plan={currentPlan}
          onClose={closeLightbox}
          onNext={plans.length > 1 ? goToNext : undefined}
          onPrev={plans.length > 1 ? goToPrev : undefined}
        />
      )}
    </>
  );
}

function ClickableFloorplan({ plan, onClick }: { plan: Plan; onClick: () => void }) {
  const isVideo = isVideoPlan(plan);
  const isAnnex = /annex/i.test(plan.label);
  const [isLoaded, setIsLoaded] = useState(false);
  const mediaClass = `max-h-full max-w-full object-contain transition-all duration-300 group-hover:scale-105 group-focus-visible:scale-105 ${
    isLoaded ? 'opacity-100' : 'opacity-0'
  }`;
  const ariaLabel = isVideo ? `Play ${plan.label}` : `View larger ${plan.label}`;
  const overlayIcon = isVideo ? '▶' : '🔍';
  const overlayCopy = isVideo ? 'Play 3D walkthrough' : 'Click to enlarge';
  const posterSource = isVideo ? plan.poster || plan.preview || VIDEO_DEFAULT_POSTER : undefined;
  const imageSource = !isVideo ? plan.preview || plan.src : undefined;

  const handleLoaded = () => setIsLoaded(true);

  useEffect(() => {
    if (isVideo && posterSource) {
      setIsLoaded(true);
    }
  }, [isVideo, posterSource]);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-300 hover:shadow-lg focus-within:shadow-lg">
      <button
        type="button"
        className="group relative flex w-full cursor-pointer items-center justify-center overflow-hidden bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        onClick={onClick}
        style={{ aspectRatio: '4 / 3' }}
        aria-label={ariaLabel}
      >
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        )}
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div
            className={`flex h-full w-full items-center justify-center ${
              isAnnex ? 'md:rotate-90 md:origin-center' : ''
            }`}
          >
            {isVideo ? (
              <video
                className={mediaClass}
                poster={posterSource}
                preload="metadata"
                playsInline
                muted
                loop
                autoPlay
                controls={false}
                onLoadedData={handleLoaded}
                onCanPlay={handleLoaded}
              >
                <source src={plan.src} type={getVideoMimeType(plan.src)} />
              </video>
            ) : (
              <img
                src={imageSource}
                alt={`${plan.label} floor plan`}
                className={mediaClass}
                onLoad={handleLoaded}
                loading="lazy"
              />
            )}
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-40 group-focus-visible:bg-opacity-30">
          <div className="text-center text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            <div className="mb-2 text-3xl">{overlayIcon}</div>
            <div className="text-sm font-semibold uppercase tracking-wide">{overlayCopy}</div>
          </div>
        </div>
      </button>
      <div className="flex flex-1 items-center justify-center p-4 text-center">
        <h3 className="text-lg font-semibold text-gray-900">{plan.label}</h3>
      </div>
    </article>
  );
}

function SimpleLightbox({ 
  plan, 
  onClose, 
  onNext, 
  onPrev 
}: { 
  plan: Plan; 
  onClose: () => void; 
  onNext?: () => void; 
  onPrev?: () => void; 
}) {
  const isVideo = isVideoPlan(plan);
  const isAnnex = /annex/i.test(plan.label);
  const posterSource = plan.poster || plan.preview;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative max-w-[90%] max-h-[90%]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex max-h-[85vh] max-w-[90vw] items-center justify-center rounded-lg bg-white p-4">
          <div
            className={`flex h-full w-full items-center justify-center ${
              isAnnex ? 'md:rotate-90 md:origin-center' : ''
            }`}
          >
            {isVideo ? (
              <video
                className="max-h-full max-w-full object-contain"
                controls
                autoPlay
                loop
                playsInline
                poster={posterSource}
              >
                <source src={plan.src} type={getVideoMimeType(plan.src)} />
              </video>
            ) : (
              <img
                src={plan.src}
                alt={`${plan.label} floor plan`}
                className="max-h-full max-w-full object-contain"
                loading="eager"
              />
            )}
          </div>
        </div>
        <div className="mt-2 text-center text-sm text-white">{plan.label}</div>
        <button
          aria-label="Close"
          className="absolute top-2 right-2 text-white text-2xl hover:text-gray-300"
          onClick={onClose}
        >
          ×
        </button>
        {onPrev && (
          <button
            aria-label="Previous"
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-2xl hover:text-gray-300"
            onClick={onPrev}
          >
            ‹
          </button>
        )}
        {onNext && (
          <button
            aria-label="Next"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-2xl hover:text-gray-300"
            onClick={onNext}
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
