import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Polyfill IntersectionObserver for jsdom environment
if (typeof (global as any).IntersectionObserver === 'undefined') {
	(global as any).IntersectionObserver = class {
		_cb: IntersectionObserverCallback;
		constructor(cb: IntersectionObserverCallback) { this._cb = cb; }
		observe() {
			// Immediately invoke callback with a fake entry indicating not intersecting
			this._cb([{ isIntersecting: false, intersectionRatio: 0 }] as any, this as any);
		}
		unobserve() {}
		disconnect() {}
		takeRecords() { return []; }
		root = null;
		rootMargin = '';
		thresholds = [] as number[];
	} as any;
}

// Polyfill / override HTMLFormElement.requestSubmit for jsdom (jsdom marks as not implemented)
try {
	Object.defineProperty(HTMLFormElement.prototype, 'requestSubmit', {
		configurable: true,
		writable: true,
		value: function requestSubmit() { this.submit(); }
	});
} catch {
	// ignore if definition fails
}