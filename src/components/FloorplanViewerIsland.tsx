/* eslint-env browser */
import React, { useState } from 'react';
import LightboxDialog from './LightboxDialog';

interface Plan {
  label: string;
  src: string;
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan, index) => (
          <ClickableFloorplan
            key={plan.label}
            plan={plan}
            onClick={() => openLightbox(plan, index)}
          />
        ))}
      </div>
      
      {lightboxOpen && currentPlan && (
        <LightboxDialog
          isOpen={lightboxOpen}
          onClose={closeLightbox}
          imageSrc={currentPlan.src}
          imageAlt={`${currentPlan.label} floor plan`}
          caption={currentPlan.label}
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
    <div className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
      <div
        className="relative group cursor-pointer bg-gray-50"
        onClick={onClick}
        style={{ aspectRatio: '4/3' }}
      >
        {!isLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        )}
        
        <img
          src={plan.src}
          alt={`${plan.label} floor plan`}
          className={`w-full h-full object-contain transition-all duration-300 group-hover:scale-105 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setIsLoaded(true)}
        />
        
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
            <div className="text-3xl mb-2">🔍</div>
            <div className="text-sm font-semibold uppercase tracking-wide">Click to enlarge</div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900">{plan.label}</h3>
      </div>
    </div>
  );
}
