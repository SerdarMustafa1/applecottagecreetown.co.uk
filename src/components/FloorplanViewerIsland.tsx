/* eslint-env browser */
import React, { useState } from 'react';

interface Plan {
  label: string;
  src: string;
  preview?: string;
}

interface Props {
  plans: Plan[];
}

export default function FloorplanViewerIsland({ plans }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (plan: Plan, index: number) => {
    setCurrentPlan(plan);
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentPlan(null);
  };

  const goToNext = () => {
    const nextIndex = (currentIndex + 1) % plans.length;
    setCurrentIndex(nextIndex);
    setCurrentPlan(plans[nextIndex]);
  };

  const goToPrev = () => {
    const prevIndex = currentIndex === 0 ? plans.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setCurrentPlan(plans[prevIndex]);
  };

  return (
    <>
      <div className="grid gap-6 items-stretch sm:grid-cols-2 lg:grid-cols-3">
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
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-lg border bg-white shadow-sm transition-all duration-300 hover:shadow-lg focus-within:shadow-lg">
      <button
        type="button"
        className="relative w-full cursor-pointer bg-gray-50 p-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        onClick={onClick}
        style={{ aspectRatio: '4 / 3' }}
        aria-label={`View larger ${plan.label}`}
      >
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        )}
        
        <img
          src={plan.preview || plan.src}
          alt={`${plan.label} floor plan`}
          className={`h-full w-full object-contain transition-all duration-300 group-hover:scale-105 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
        
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 transition-all duration-300 group-hover:bg-opacity-50 group-focus-visible:bg-opacity-40">
          <div className="text-center text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            <div className="text-3xl mb-2">🔍</div>
            <div className="text-sm font-semibold uppercase tracking-wide">Click to enlarge</div>
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
        <img
          src={plan.src}
          alt={`${plan.label} floor plan`}
          className="max-h-[90vh] w-auto"
          loading="eager"
        />
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
