import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const GALLERY_VIEW_THRESHOLD = 5;
const TOUR_SECONDS_THRESHOLD = 60;

type TriggerReason = 'gallery' | 'tour' | 'offline' | 'booking';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms?: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const isBrowser = typeof window !== 'undefined';

const storageKey = 'applecottage-a2hs-dismissed';

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
  const bookingIntentRef = useRef<boolean>(false);

  const getTriggerReason = useCallback((): TriggerReason | null => {
    if (!deferredPrompt || dismissed) {
      return null;
    }
    if (bookingIntentRef.current) {
      return 'booking';
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
    };

    const onAppInstalled = () => {
      setDeferredPrompt(null);
      setPromptVisible(false);
      setTriggerReason(null);
      setDismissed(true);
      persistDismissedPreference(true);
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

  const registerGalleryView = useCallback((id: string) => {
    if (!id) return;
    galleryViewsRef.current.add(id);
    evaluatePromptVisibility();
  }, [evaluatePromptVisibility]);

  const registerTourWatch = useCallback((seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return;
    tourSecondsRef.current += seconds;
    evaluatePromptVisibility();
  }, [evaluatePromptVisibility]);

  const registerOfflineDownload = useCallback(() => {
    offlineTriggeredRef.current = true;
    evaluatePromptVisibility();
  }, [evaluatePromptVisibility]);

  const registerBookingIntent = useCallback(() => {
    bookingIntentRef.current = true;
    evaluatePromptVisibility();
  }, [evaluatePromptVisibility]);

  const showPrompt = useCallback(async () => {
    const promptEvent = deferredPrompt;
    if (!promptEvent) {
      return;
    }

    try {
      await promptEvent.prompt();
      await promptEvent.userChoice.catch(() => undefined);
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
    registerBookingIntent,
  };
};

export type UseA2HSResult = ReturnType<typeof useA2HS>;

export default useA2HS;
