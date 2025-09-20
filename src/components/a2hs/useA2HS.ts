import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const GALLERY_VIEW_THRESHOLD = 5;
const TOUR_SECONDS_THRESHOLD = 60;

type TriggerReason = 'gallery' | 'tour' | 'offline';
type PromptVariant = 'native' | 'manual';
type ManualPlatform = 'ios';

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
    prompt_variant: payload.prompt_variant,
    manual_platform: payload.manual_platform,
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
  const [promptVariant, setPromptVariant] = useState<PromptVariant | null>(null);
  const [dismissed, setDismissed] = useState<boolean>(() => readDismissedPreference());
  const [supportsInstallPrompt, setSupportsInstallPrompt] = useState<boolean>(() => {
    if (!isBrowser) {
      return false;
    }
    return 'onbeforeinstallprompt' in window || 'BeforeInstallPromptEvent' in window;
  });
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (!isBrowser) {
      return false;
    }
    if (window.matchMedia?.('(display-mode: standalone)').matches) {
      return true;
    }
    return Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
  });
  const [isSupported, setIsSupported] = useState<boolean>(() => {
    if (!isBrowser) {
      return false;
    }
    return (
      'onbeforeinstallprompt' in window ||
      'BeforeInstallPromptEvent' in window ||
      /iphone|ipad|ipod/i.test(window.navigator.userAgent || '')
    );
  });
  const galleryViewsRef = useRef<Set<string>>(new Set());
  const tourSecondsRef = useRef<number>(0);
  const offlineTriggeredRef = useRef<boolean>(false);
  const galleryThresholdLoggedRef = useRef<boolean>(false);
  const tourThresholdLoggedRef = useRef<boolean>(false);
  const offlineLoggedRef = useRef<boolean>(false);
  const promptVisibleRef = useRef<boolean>(false);
  const lastReportedReasonRef = useRef<TriggerReason | null>(null);
  const triggerReasonRef = useRef<TriggerReason | null>(null);
  const promptVariantRef = useRef<PromptVariant | null>(null);

  const isIosDevice = useMemo(() => {
    if (!isBrowser) {
      return false;
    }
    const userAgent = window.navigator.userAgent || '';
    return /iphone|ipad|ipod/i.test(userAgent);
  }, []);

  const manualPlatform = useMemo<ManualPlatform | null>(() => {
    if (!isBrowser) {
      return null;
    }
    if (dismissed) {
      return null;
    }
    if (supportsInstallPrompt) {
      return null;
    }
    if (!isIosDevice) {
      return null;
    }
    if (isStandalone) {
      return null;
    }
    return 'ios';
  }, [dismissed, isIosDevice, isStandalone, supportsInstallPrompt]);

  const getTriggerReason = useCallback((): TriggerReason | null => {
    if (dismissed) {
      return null;
    }

    const hasDeferredPrompt = Boolean(deferredPrompt);
    const canShowManual = manualPlatform !== null;
    if (!hasDeferredPrompt && !canShowManual) {
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
  }, [deferredPrompt, dismissed, manualPlatform]);

  const evaluatePromptVisibility = useCallback(() => {
    const reason = getTriggerReason();
    if (reason) {
      setTriggerReason(reason);
      const hasDeferredPrompt = Boolean(deferredPrompt);
      const variant: PromptVariant | null = hasDeferredPrompt ? 'native' : manualPlatform ? 'manual' : null;
      if (!variant) {
        return;
      }
      setPromptVariant(variant);
      setPromptVisible(true);
      const engagementSnapshot = {
        engagement_gallery_views: galleryViewsRef.current.size,
        engagement_tour_seconds: tourSecondsRef.current,
        engagement_offline_ready: offlineTriggeredRef.current,
        trigger_reason: reason,
        prompt_variant: variant,
        manual_platform: manualPlatform,
      };
      if (
        !promptVisibleRef.current ||
        lastReportedReasonRef.current !== reason ||
        promptVariantRef.current !== variant
      ) {
        trackPwaEvent(variant === 'native' ? 'a2hs_prompt_ready' : 'a2hs_manual_ready', engagementSnapshot);
        lastReportedReasonRef.current = reason;
        promptVariantRef.current = variant;
      }
    }
  }, [deferredPrompt, getTriggerReason, manualPlatform]);

  useEffect(() => {
    if (!isBrowser) {
      setIsSupported(false);
      return;
    }

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setSupportsInstallPrompt(true);
      setIsSupported(true);
      trackPwaEvent('a2hs_event_captured');
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setPromptVisible(false);
      setTriggerReason(null);
      setPromptVariant(null);
      setDismissed(true);
      persistDismissedPreference(true);
      setIsStandalone(true);
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
  }, [deferredPrompt, evaluatePromptVisibility, manualPlatform]);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }

    const mediaQuery = window.matchMedia?.('(display-mode: standalone)');
    const updateStandalone = () => {
      const matchesMedia = Boolean(mediaQuery?.matches);
      const navigatorStandalone = Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone);
      setIsStandalone(matchesMedia || navigatorStandalone);
    };

    updateStandalone();

    mediaQuery?.addEventListener?.('change', updateStandalone);
    const onVisibility = () => updateStandalone();
    window.addEventListener('visibilitychange', onVisibility);

    return () => {
      mediaQuery?.removeEventListener?.('change', updateStandalone);
      window.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  useEffect(() => {
    if (!isBrowser) {
      return;
    }
    setIsSupported(supportsInstallPrompt || manualPlatform !== null);
  }, [manualPlatform, supportsInstallPrompt]);

  useEffect(() => {
    promptVisibleRef.current = isPromptVisible;
    triggerReasonRef.current = triggerReason;
    promptVariantRef.current = promptVariant;
    if (isPromptVisible && triggerReason && promptVariant) {
      trackPwaEvent(promptVariant === 'native' ? 'a2hs_prompt_shown' : 'a2hs_manual_shown', {
        trigger_reason: triggerReason,
        engagement_gallery_views: galleryViewsRef.current.size,
        engagement_tour_seconds: tourSecondsRef.current,
        engagement_offline_ready: offlineTriggeredRef.current,
        prompt_variant: promptVariant,
        manual_platform: manualPlatform,
      });
    }
  }, [isPromptVisible, manualPlatform, promptVariant, triggerReason]);

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
        prompt_variant: promptVariantRef.current,
        manual_platform: manualPlatform,
      });
    }
  }, [evaluatePromptVisibility, manualPlatform]);

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
        prompt_variant: promptVariantRef.current,
        manual_platform: manualPlatform,
      });
    }
  }, [evaluatePromptVisibility, manualPlatform]);

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
        prompt_variant: promptVariantRef.current,
        manual_platform: manualPlatform,
      });
    }
  }, [evaluatePromptVisibility, manualPlatform]);

  const showPrompt = useCallback(async () => {
    if (promptVariantRef.current === 'manual') {
      trackPwaEvent('a2hs_manual_acknowledged', {
        trigger_reason: triggerReasonRef.current,
        engagement_gallery_views: galleryViewsRef.current.size,
        engagement_tour_seconds: tourSecondsRef.current,
        engagement_offline_ready: offlineTriggeredRef.current,
        prompt_variant: promptVariantRef.current,
        manual_platform: manualPlatform,
      });
      setPromptVisible(false);
      setTriggerReason(null);
      setPromptVariant(null);
      setDismissed(true);
      persistDismissedPreference(true);
      return;
    }
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
      setPromptVariant(null);
      setDismissed(true);
      persistDismissedPreference(true);
    }
  }, [deferredPrompt, manualPlatform]);

  const dismissPrompt = useCallback(() => {
    setPromptVisible(false);
    setTriggerReason(null);
    setPromptVariant(null);
    setDismissed(true);
    persistDismissedPreference(true);
    trackPwaEvent(promptVariantRef.current === 'manual' ? 'a2hs_manual_dismissed' : 'a2hs_prompt_dismissed', {
      trigger_reason: triggerReasonRef.current,
      engagement_gallery_views: galleryViewsRef.current.size,
      engagement_tour_seconds: tourSecondsRef.current,
      engagement_offline_ready: offlineTriggeredRef.current,
      prompt_variant: promptVariantRef.current,
      manual_platform: manualPlatform,
    });
  }, [manualPlatform]);

  const canInstall = useMemo(() => Boolean(deferredPrompt) && !dismissed, [deferredPrompt, dismissed]);
  const manualInstructions = useMemo(() => {
    if (manualPlatform === 'ios') {
      return [
        'Tap the share button in Safari\'s toolbar.',
        'Scroll down and choose “Add to Home Screen”.',
        'Pick a name if prompted, then tap “Add”.',
      ];
    }
    return [];
  }, [manualPlatform]);

  return {
    isSupported,
    canInstall,
    isPromptVisible: isPromptVisible && (promptVariant !== null),
    triggerReason,
    promptVariant,
    manualPlatform,
    manualInstructions,
    showPrompt,
    dismissPrompt,
    registerGalleryView,
    registerTourWatch,
    registerOfflineDownload,
  };
};

export type UseA2HSResult = ReturnType<typeof useA2HS>;

export default useA2HS;
