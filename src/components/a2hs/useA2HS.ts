import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const GALLERY_VIEW_THRESHOLD = 5;
const TOUR_SECONDS_THRESHOLD = 60;

type TriggerReason = 'gallery' | 'tour' | 'offline';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms?: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const isBrowser = typeof window !== 'undefined';

const storageKey = 'applecottage-a2hs-dismissed';

type AnalyticsPayload = Record<string, unknown>;

const cleanPayload = (payload: AnalyticsPayload = {}): AnalyticsPayload => {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
};

type AnalyticsWindow = Window & {
  gtag?: unknown;
  dataLayer?: unknown;
};

const getAnalyticsWindow = (): AnalyticsWindow | undefined => {
  if (!isBrowser) {
    return undefined;
  }

  return window as AnalyticsWindow;
};

const trackPwaEvent = (eventName: string, payload: AnalyticsPayload = {}): void => {
  const analyticsWindow = getAnalyticsWindow();
  if (!analyticsWindow) {
    return;
  }

  const basePayload = cleanPayload({
    event_category: 'pwa',
    engagement_gallery_views: payload.engagement_gallery_views,
    engagement_tour_seconds: payload.engagement_tour_seconds,
    engagement_offline_ready: payload.engagement_offline_ready,
    trigger_reason: payload.trigger_reason,
    outcome: payload.outcome,
    platform: payload.platform,
  });

  if (typeof analyticsWindow.gtag === 'function') {
    try {
      const gtagFunction = analyticsWindow.gtag as CallableFunction;
      gtagFunction.call(analyticsWindow, 'event', eventName, basePayload);
    } catch {
      // Ignore gtag errors — analytics should never block UX.
    }
  }

  const dataLayer = Array.isArray(analyticsWindow.dataLayer)
    ? (analyticsWindow.dataLayer as AnalyticsPayload[])
    : undefined;

  try {
    const dataLayerEvent: AnalyticsPayload = cleanPayload({
      event: eventName,
      ...basePayload,
    });
    if (dataLayer) {
      dataLayer.push(dataLayerEvent);
    } else {
      (analyticsWindow as AnalyticsWindow & { dataLayer: AnalyticsPayload[] }).dataLayer = [dataLayerEvent];
    }
  } catch {
    // Ignore analytics failures (e.g. blocked storage).
  }
};

const readDismissedPreference = (): boolean => {
  if (!isBrowser) return false;
  try {
    return window.localStorage?.getItem(storageKey) === '1';
  } catch {
    return false;
  }
};

const persistDismissedPreference = (value: boolean): void => {
  if (!isBrowser) return;
  try {
    if (value) {
      window.localStorage?.setItem(storageKey, '1');
    } else {
      window.localStorage?.removeItem(storageKey);
    }
  } catch {
    // Ignore persistence failures (Safari private mode, etc.)
  }
};

export const useA2HS = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isPromptVisible, setPromptVisible] = useState(false);
  const [triggerReason, setTriggerReason] = useState<TriggerReason | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(() => readDismissedPreference());
  const [isSupported, setIsSupported] = useState<boolean>(() => isBrowser);
  const galleryViewsRef = useRef<Set<string>>(new Set());
  const tourSecondsRef = useRef<number>(0);
  const offlineTriggeredRef = useRef<boolean>(false);
  const galleryThresholdLoggedRef = useRef<boolean>(false);
  const tourThresholdLoggedRef = useRef<boolean>(false);
  const offlineLoggedRef = useRef<boolean>(false);
  const promptVisibleRef = useRef<boolean>(false);
  const lastReportedReasonRef = useRef<TriggerReason | null>(null);
  const triggerReasonRef = useRef<TriggerReason | null>(null);

  const getTriggerReason = useCallback((): TriggerReason | null => {
    if (!deferredPrompt || dismissed) {
      return null;
    }
    if (offlineTriggeredRef.current) {
      return 'offline';
    }
    if (galleryViewsRef.current.size >= GALLERY_VIEW_THRESHOLD) {
      return 'gallery';
    }
    if (tourSecondsRef.current >= TOUR_SECONDS_THRESHOLD) {
      return 'tour';
    }
    return null;
  }, [deferredPrompt, dismissed]);

  const evaluatePromptVisibility = useCallback(() => {
    const reason = getTriggerReason();
    if (reason) {
      setTriggerReason(reason);
      setPromptVisible(true);
      const engagementSnapshot = {
        engagement_gallery_views: galleryViewsRef.current.size,
        engagement_tour_seconds: tourSecondsRef.current,
        engagement_offline_ready: offlineTriggeredRef.current,
        trigger_reason: reason,
      };
      if (!promptVisibleRef.current || lastReportedReasonRef.current !== reason) {
        trackPwaEvent('a2hs_prompt_ready', engagementSnapshot);
        lastReportedReasonRef.current = reason;
      }
    }
  }, [getTriggerReason]);

  useEffect(() => {
    if (!isBrowser) {
      setIsSupported(false);
      return;
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      trackPwaEvent('a2hs_event_captured');
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setPromptVisible(false);
      setTriggerReason(null);
      setDismissed(true);
      persistDismissedPreference(true);
      trackPwaEvent('a2hs_installed');
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener, { passive: true });
    window.addEventListener('appinstalled', onAppInstalled, { passive: true });

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  useEffect(() => {
    if (deferredPrompt) {
      evaluatePromptVisibility();
    }
  }, [deferredPrompt, evaluatePromptVisibility]);

  useEffect(() => {
    promptVisibleRef.current = isPromptVisible;
    triggerReasonRef.current = triggerReason;
    if (isPromptVisible && triggerReason) {
      trackPwaEvent('a2hs_prompt_shown', {
        trigger_reason: triggerReason,
        engagement_gallery_views: galleryViewsRef.current.size,
        engagement_tour_seconds: tourSecondsRef.current,
        engagement_offline_ready: offlineTriggeredRef.current,
      });
    }
  }, [isPromptVisible, triggerReason]);

  const registerGalleryView = useCallback((id: string) => {
    if (!id) return;
    galleryViewsRef.current.add(id);
    evaluatePromptVisibility();
    if (!galleryThresholdLoggedRef.current && galleryViewsRef.current.size >= GALLERY_VIEW_THRESHOLD) {
      galleryThresholdLoggedRef.current = true;
      trackPwaEvent('a2hs_gallery_threshold_met', {
        trigger_reason: triggerReasonRef.current,
        engagement_gallery_views: galleryViewsRef.current.size,
        engagement_tour_seconds: tourSecondsRef.current,
        engagement_offline_ready: offlineTriggeredRef.current,
      });
    }
  }, [evaluatePromptVisibility]);

  const registerTourWatch = useCallback((seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    tourSecondsRef.current += seconds;
    evaluatePromptVisibility();
    if (!tourThresholdLoggedRef.current && tourSecondsRef.current >= TOUR_SECONDS_THRESHOLD) {
      tourThresholdLoggedRef.current = true;
      trackPwaEvent('a2hs_tour_threshold_met', {
        trigger_reason: triggerReasonRef.current,
        engagement_gallery_views: galleryViewsRef.current.size,
        engagement_tour_seconds: tourSecondsRef.current,
        engagement_offline_ready: offlineTriggeredRef.current,
      });
    }
  }, [evaluatePromptVisibility]);

  const registerOfflineDownload = useCallback(() => {
    offlineTriggeredRef.current = true;
    evaluatePromptVisibility();
    if (!offlineLoggedRef.current) {
      offlineLoggedRef.current = true;
      trackPwaEvent('a2hs_offline_ready', {
        trigger_reason: triggerReasonRef.current,
        engagement_gallery_views: galleryViewsRef.current.size,
        engagement_tour_seconds: tourSecondsRef.current,
        engagement_offline_ready: offlineTriggeredRef.current,
      });
    }
  }, [evaluatePromptVisibility]);

  const showPrompt = useCallback(async () => {
    const promptEvent = deferredPrompt;
    if (!promptEvent) {
      return;
    }

    trackPwaEvent('a2hs_prompt_launch', {
      trigger_reason: triggerReasonRef.current,
      engagement_gallery_views: galleryViewsRef.current.size,
      engagement_tour_seconds: tourSecondsRef.current,
      engagement_offline_ready: offlineTriggeredRef.current,
    });

    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice.catch(() => undefined);
      if (choice) {
        trackPwaEvent('a2hs_prompt_resolved', {
          trigger_reason: triggerReasonRef.current,
          engagement_gallery_views: galleryViewsRef.current.size,
          engagement_tour_seconds: tourSecondsRef.current,
          engagement_offline_ready: offlineTriggeredRef.current,
          outcome: choice.outcome,
          platform: choice.platform,
        });
        if (choice.outcome === 'accepted') {
          trackPwaEvent('a2hs_prompt_accepted', {
            trigger_reason: triggerReasonRef.current,
            engagement_gallery_views: galleryViewsRef.current.size,
            engagement_tour_seconds: tourSecondsRef.current,
            engagement_offline_ready: offlineTriggeredRef.current,
            platform: choice.platform,
          });
        }
      }
    } finally {
      setDeferredPrompt(null);
      setPromptVisible(false);
      setTriggerReason(null);
      setDismissed(true);
      persistDismissedPreference(true);
    }
  }, [deferredPrompt]);

  const dismissPrompt = useCallback(() => {
    setPromptVisible(false);
    setTriggerReason(null);
    setDismissed(true);
    persistDismissedPreference(true);
    trackPwaEvent('a2hs_prompt_dismissed', {
      trigger_reason: triggerReasonRef.current,
      engagement_gallery_views: galleryViewsRef.current.size,
      engagement_tour_seconds: tourSecondsRef.current,
      engagement_offline_ready: offlineTriggeredRef.current,
    });
  }, []);

  const canInstall = useMemo(() => Boolean(deferredPrompt) && !dismissed, [deferredPrompt, dismissed]);

  return {
    isSupported,
    canInstall,
    isPromptVisible: isPromptVisible && canInstall,
    triggerReason,
    showPrompt,
    dismissPrompt,
    registerGalleryView,
    registerTourWatch,
    registerOfflineDownload,
  };
};

export type UseA2HSResult = ReturnType<typeof useA2HS>;

export default useA2HS;
