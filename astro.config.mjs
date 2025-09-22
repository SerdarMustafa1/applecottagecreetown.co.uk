import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
// import VitePWA from '@vite-pwa/astro';

export default defineConfig({
  site: 'https://applecottagecreetown.co.uk',
  output: 'static',
  integrations: [
    tailwind(),
    react()
    // PWA temporarily disabled due to cache quota issues
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