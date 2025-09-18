// Lightweight runtime polyfill for IntersectionObserver (very minimal)
// Only provides the API surface used in GalleryIsland (observe/disconnect).
export function ensureIntersectionObserver() {
  if (typeof window === 'undefined') return;
  if ('IntersectionObserver' in window) return;
  (window as any).IntersectionObserver = class {
    _cb: IntersectionObserverCallback;
    constructor(cb: IntersectionObserverCallback) { this._cb = cb; }
    observe() {/* no-op */}
    unobserve() {/* no-op */}
    disconnect() {/* no-op */}
    takeRecords() { return []; }
    root = null;
    rootMargin = '';
    thresholds: number[] = [];
  };
}
