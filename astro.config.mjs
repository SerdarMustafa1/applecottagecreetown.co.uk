import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://applecottagecreetown.co.uk',
  output: 'static',
  integrations: [tailwind(), react()],
  adapter: netlify()
});
