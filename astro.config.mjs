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
        globPatterns: ['**/*.{js,css,ico,png,svg,json,woff2,woff}'],
        globIgnores: [
          '**/IMG_20250918_092921_562.jpeg',
          '**/*-1600.*',
          '**/*-1200.*',
          '**/panos/**',
          '**/*.jpg',
          '**/*.jpeg',
          '**/*.webp',
          '**/*.avif'
        ],
        maximumFileSizeToCacheInBytes: 2 * 1024 * 1024, // 2MB limit
        runtimeCaching: [
          {
            // Network-first for navigation requests
            urlPattern: ({ request, url }) => {
              if (request.mode !== 'navigate') return false;
              if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/preview')) return false;
              return true;
            },
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 6
              }
            }
          },
          {
            // Cache only critical assets
            urlPattern: ({ request, sameOrigin }) => {
              if (request.method !== 'GET' || !sameOrigin) return false;
              return ['style', 'script', 'font'].includes(request.destination);
            },
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'asset-cache',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 3
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
          configure: (proxy) => {
            proxy.on('proxyRes', (proxyRes) => {
              proxyRes.headers['Access-Control-Allow-Origin'] = '*';
              proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, OPTIONS';
              proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type';
            });
          }
        }
      }
    }
  }
});