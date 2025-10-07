type AnalyticsEvent = {
  name: string;
  params?: Record<string, unknown>;
};

interface AnalyticsApi {
  trackEvent: Function;
}

type AnalyticsWindow = Window & {
  appleAnalytics?: AnalyticsApi;
  __appleAnalyticsQueue?: AnalyticsEvent[];
};

const QUEUE_KEY = '__appleAnalyticsQueue';

const enqueue = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return;
  const w = window as AnalyticsWindow;
  if (!Array.isArray(w[QUEUE_KEY])) {
    w[QUEUE_KEY] = [];
  }
  w[QUEUE_KEY]!.push({ name: eventName, params });
};

const dispatchThroughGlobal = (eventName: string, params?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return false;
  const w = window as AnalyticsWindow;
  if (w.appleAnalytics?.trackEvent) {
    try {
      w.appleAnalytics.trackEvent(eventName, params);
      return true;
    } catch (error) {
      console.error('Analytics dispatch failed', error);
    }
  }
  return false;
};

const send = (eventName: string, params?: Record<string, unknown>) => {
  if (!eventName) return;
  if (!dispatchThroughGlobal(eventName, params)) {
    enqueue(eventName, params);
  }
};

const compactParams = (params: Record<string, unknown>) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
};

export const trackEvent = (eventName: string, params: Record<string, unknown> = {}) => {
  send(eventName, compactParams(params));
};

export const trackCtaClick = (details: {
  name: string;
  location: string;
  destination?: string;
  type?: string;
  variant?: string;
  format?: string;
}) => {
  trackEvent('cta_click', compactParams({
    cta_name: details.name,
    cta_location: details.location,
    destination_url: details.destination,
    cta_type: details.type,
    cta_variant: details.variant,
    cta_format: details.format,
  }));
};

export const trackDocumentOpen = (details: {
  name: string;
  url: string;
  location: string;
  format?: string;
}) => {
  trackEvent('document_open', compactParams({
    document_name: details.name,
    document_url: details.url,
    document_location: details.location,
    document_format: details.format,
  }));
};

export const trackMediaEngagement = (details: {
  mediaType: string;
  action: string;
  label?: string;
  identifier?: string;
  index?: number;
  total?: number;
  filter?: string;
  seconds?: number;
  direction?: string;
  location?: string;
  format?: string;
}) => {
  trackEvent('media_engagement', compactParams({
    media_type: details.mediaType,
    media_action: details.action,
    media_label: details.label,
    media_identifier: details.identifier,
    media_index: details.index,
    media_total: details.total,
    media_filter: details.filter,
    media_direction: details.direction,
    media_location: details.location,
    media_format: details.format,
    engagement_seconds: details.seconds,
  }));
};

export const trackGalleryFilterChange = (details: {
  filter: string;
  total: number;
}) => {
  trackEvent('gallery_filter', compactParams({
    gallery_filter: details.filter,
    gallery_count: details.total,
  }));
};

export const trackNavigation = (details: {
  label: string;
  target: string;
  location?: string;
}) => {
  trackEvent('navigation_click', compactParams({
    nav_label: details.label,
    nav_target: details.target,
    nav_location: details.location,
  }));
};

export const trackContactAction = (details: {
  method: string;
  location: string;
  destination?: string;
}) => {
  trackEvent('contact_action', compactParams({
    contact_method: details.method,
    contact_location: details.location,
    contact_destination: details.destination,
  }));
};

export const trackBookingInterest = (details: { source?: string }) => {
  trackEvent('booking_interest', compactParams({
    booking_source: details.source || 'unknown',
  }));
};

export const flushAnalyticsQueue = () => {
  if (typeof window === 'undefined') return;
  const w = window as AnalyticsWindow;
  const queue = w[QUEUE_KEY];
  if (!Array.isArray(queue) || queue.length === 0) return;
  if (!w.appleAnalytics?.trackEvent) return;
  while (queue.length) {
    const entry = queue.shift();
    if (entry?.name) {
      w.appleAnalytics.trackEvent(entry.name, entry.params || {});
    }
  }
};

export default {
  trackEvent,
  trackCtaClick,
  trackDocumentOpen,
  trackMediaEngagement,
  trackGalleryFilterChange,
  trackNavigation,
  trackContactAction,
  trackBookingInterest,
  flushAnalyticsQueue,
};
