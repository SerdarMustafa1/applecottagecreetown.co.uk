import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import VitePWA from '@vite-pwa/astro';

export default defineConfig({
  site: 'https://applecottagecreetown.co.uk',
  output: 'static',
  integrations: [
    tailwind(),
    react(),
    VitePWA({
      // Use generateSW so Workbox manages the service worker lifecycle for us.
      strategies: 'generateSW',
      registerType: 'autoUpdate',
      injectRegister: null, // we manually register the SW from a client-only module.
      manifest: false, // reuse the existing public/site.webmanifest that is already curated.
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        navigateFallbackDenylist: [/^\/api\//],
        // Exclude HTML from the precache manifest to avoid shipping stale markup.
        globPatterns: ['**/*.{js,css,ico,png,svg,webp,avif,jpg,jpeg,json,woff2,woff}'],
        globIgnores: ['**/IMG_20250918_092921_562.jpeg'], // huge asset served on-demand; keep it out of the precache.
        runtimeCaching: [
          {
            // Network-first for navigation requests so HTML always comes from the origin first.
            urlPattern: ({ request, url }) => {
              if (request.mode !== 'navigate') {
                return false;
              }
              if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/preview')) {
                return false;
              }
              return true;
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // keep a day's worth of pages for quick back/forward nav.
              }
            }
          },
          {
            // Cache hashed build assets and same-origin images/fonts with SWR to keep them fresh.
            urlPattern: ({ request, sameOrigin, url }) => {
              if (request.method !== 'GET') {
                return false;
              }
              if (request.destination && ['style', 'script', 'font', 'image'].includes(request.destination)) {
                return sameOrigin;
              }
              if (!/^https?:\/\/[^/]+\/assets\//.test(url.href)) {
                return false;
              }
              return url.hostname.endsWith('.cloudfront.net');
            },
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'asset-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          {
            // API reads stay fast but up-to-date with a tight SWR window.
            urlPattern: ({ request, sameOrigin, url }) => {
              if (request.method !== 'GET') {
                return false;
              }
              if (sameOrigin && url.pathname.startsWith('/api/')) {
                return true;
              }
              return false;
            },
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true // Development convenience: remove before shipping to production if it causes confusion.
      }
    })
  ],
  adapter: netlify(),
  vite: {
    server: {
      proxy: {
        '/proxy-cdn': {
          target: 'https://d1t6lpjdsu4646.cloudfront.net',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/proxy-cdn/, ''),
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization'
          }
        }
      }
    }
  }
});