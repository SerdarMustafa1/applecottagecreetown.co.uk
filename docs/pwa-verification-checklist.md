# PWA update verification checklist

Use this quick runbook each time you deploy to make sure the new service worker is active and shipping the fresh build.

1. Open Chrome DevTools → **Application** → **Service Workers**.
   - Confirm the `@vite-pwa` worker shows **activated and running** (green dot). If it is in "waiting", click **Skip waiting**.
   - Toggle **Update on reload** while testing so each refresh pulls the latest build from the network.
2. Trigger a content change (e.g. bump copy) and run `npm run build && npm run preview`.
   - Inspect the generated `dist` folder: hashed asset names should change when content changes.
3. In the preview, load the page, then refresh. Updated copy should appear without a hard reload.
4. In DevTools, switch the network tab to **Offline** and reload.
   - Critical UI (shell, cached assets) should load from cache, API requests can fail gracefully.
   - Navigations should fall back to `/offline.html` with the action links usable while disconnected.
5. Visit `/api/*` endpoints and ensure only GET calls are cached. Confirm POST/PUT/PATCH/DELETE bypass the service worker.
6. Re-test after invalidating caches in DevTools (**Clear site data**) to simulate a first-time visitor.
7. During development, disable the worker with `navigator.serviceWorker.getRegistrations().then(list => list.forEach(r => r.unregister()))` if it interferes, then reload.

---

## Configuration rationale

- **@vite-pwa/astro integration**: Workbox handles asset hashing, cache versioning, and lifecycle (skip waiting / clients claim) so updates activate immediately without custom code.
- **No HTML in precache**: Navigations use a network-first strategy which prevents stale markup from sticking around after deploys.
- **Runtime caching**: Assets (CSS/JS/images/fonts) use `StaleWhileRevalidate` for instant loads with background refreshes; `/api/*` GETs get a tiny 60s cache for resiliency; mutations never touch the cache.
- **Prompt helper**: `registerServiceWorkerWithPrompt` exposes a toast-based UX that calls `updateSW(true)` so teams can choose between silent updates and user-driven refreshes.
- **Install analytics**: `useA2HS` emits `a2hs_*` events to `gtag`/`dataLayer` so marketing can monitor when the prompt appears, is dismissed, or completes. Filter by `event_category: 'pwa'` to analyse install funnels by trigger reason.
- **Dev ergonomics**: `devOptions.enabled` keeps the worker available locally, but the note in config documents that it should be disabled if it confuses local QA.
