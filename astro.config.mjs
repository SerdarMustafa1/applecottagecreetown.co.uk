import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://applecottagecreetown.co.uk',
  output: 'static',
  integrations: [tailwind(), react()],
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