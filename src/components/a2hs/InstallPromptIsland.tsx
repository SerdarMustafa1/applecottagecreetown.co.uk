import React, { useEffect, useMemo, useRef } from 'react';
import { installValuePropositions } from '../../lib/pwa/pushCampaigns';
import { useA2HS } from './useA2HS';

export default function InstallPromptIsland(): JSX.Element | null {
  const {
    isSupported,
    canInstall,
    isPromptVisible,
    triggerReason,
    showPrompt,
    dismissPrompt,
    registerGalleryView,
    registerTourWatch,
    registerOfflineDownload,
    registerBookingIntent,
  } = useA2HS();

  const installButtonRef = useRef<HTMLButtonElement>(null);

  const message = useMemo(() => {
    switch (triggerReason) {
      case 'gallery':
        return 'Loved those photos? Add Apple Cottage to your home screen to revisit the gallery anytime.';
      case 'tour':
        return 'Enjoying the virtual tour? Install the app for quick, offline-friendly access to every room.';
      case 'offline':
        return 'Offline access unlocked — install the app so the full experience is just a tap away.';
      case 'booking':
        return 'Lock in booking updates, reminders and insider property tips directly on your home screen.';
      default:
        return 'Install Apple Cottage on your device for faster access and offline viewing.';
    }
  }, [triggerReason]);

  useEffect(() => {
    if (!isPromptVisible) return;
    const id = window.setTimeout(() => {
      installButtonRef.current?.focus();
    }, 0);
    return () => window.clearTimeout(id);
  }, [isPromptVisible]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleGalleryViewed = (event: Event) => {
      const { detail } = event as CustomEvent<{ id?: string; src?: string; index?: number }>;
      const identifier = detail?.id ?? detail?.src ?? (typeof detail?.index === 'number' ? `index-${detail.index}` : undefined);
      if (identifier) {
        registerGalleryView(String(identifier));
      }
    };

    const handleTourWatch = (event: Event) => {
      const { detail } = event as CustomEvent<{ secondsWatched?: number; seconds?: number; delta?: number }>; // backward compatibility keys
      const seconds = Number(detail?.secondsWatched ?? detail?.seconds ?? detail?.delta ?? 0);
      if (Number.isFinite(seconds) && seconds > 0) {
        registerTourWatch(seconds);
      }
    };

    const handleOfflineDownload = () => {
      registerOfflineDownload();
    };

    const handleBookingIntent = () => {
      registerBookingIntent();
    };

    window.addEventListener('applecottage:gallery-viewed', handleGalleryViewed as EventListener);
    window.addEventListener('applecottage:tour-watch', handleTourWatch as EventListener);
    window.addEventListener('applecottage:offline-download', handleOfflineDownload);
    window.addEventListener('applecottage:booking-interest', handleBookingIntent);

    return () => {
      window.removeEventListener('applecottage:gallery-viewed', handleGalleryViewed as EventListener);
      window.removeEventListener('applecottage:tour-watch', handleTourWatch as EventListener);
      window.removeEventListener('applecottage:offline-download', handleOfflineDownload);
      window.removeEventListener('applecottage:booking-interest', handleBookingIntent);
    };
  }, [registerGalleryView, registerTourWatch, registerOfflineDownload, registerBookingIntent]);

  if (!isSupported || !canInstall || !isPromptVisible) {
    return null;
  }

  const listId = 'a2hs-benefits';
  const descriptionId = 'a2hs-description';

  return (
    <section className="fixed bottom-4 right-4 z-[2147483646] flex flex-col items-end gap-3" aria-live="polite">
      <article
        role="dialog"
        aria-modal="false"
        aria-labelledby="a2hs-title"
        aria-describedby={`${descriptionId} ${listId}`}
        className="max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-200 p-4 sm:p-5 text-slate-900 focus-within:ring-2 focus-within:ring-blue-500"
      >
        <header className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white" aria-hidden="true">
            📱
          </div>
          <div className="flex-1">
            <h2 id="a2hs-title" className="text-lg font-semibold mb-1">
              Install Apple Cottage
            </h2>
            <p id={descriptionId} className="text-sm text-slate-600 leading-relaxed">
              {message}
            </p>
          </div>
        </header>
        <ul id={listId} className="mt-3 list-disc pl-5 text-sm text-slate-600 space-y-2">
          {installValuePropositions.slice(0, 3).map((valueProp) => (
            <li key={valueProp}>{valueProp}</li>
          ))}
        </ul>
        <footer className="mt-4 flex flex-wrap gap-2 justify-end">
          <button
            type="button"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
            onClick={dismissPrompt}
          >
            Maybe later
          </button>
          <button
            ref={installButtonRef}
            type="button"
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
            onClick={() => {
              void showPrompt();
            }}
          >
            Install now
          </button>
        </footer>
      </article>
    </section>
  );
}
