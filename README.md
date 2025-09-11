# Apple Cottage Website (Astro)

This repository contains the rebuilt Apple Cottage website using [Astro](https://astro.build) with Tailwind CSS and React islands.

## Development

1. Node 20 is required. Use `.nvmrc`:
   - `nvm use` (or install 20.18.1)
2. Install dependencies with `corepack enable && pnpm install`.
2. Start a dev server with `pnpm dev`.
3. Run tests with `pnpm test` and lint with `pnpm lint`.
4. Create a production build with `pnpm build`.

## Content

Site copy is managed in the `content/` directory as Markdown files. Images and other static assets live in `public/`.

## Deployment

The site is deployed on Netlify. The build command and caching headers are defined in `netlify.toml`.

- Netlify uses Node 20 and runs `pnpm install --no-frozen-lockfile && pnpm build`.
- After updating dependencies, regenerate and commit `pnpm-lock.yaml` locally, then switch CI back to frozen installs.
