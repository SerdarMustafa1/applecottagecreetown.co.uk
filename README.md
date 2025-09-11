# Apple Cottage Website (Astro)

This repository contains the rebuilt Apple Cottage website using [Astro](https://astro.build) with Tailwind CSS and React islands.

## Development

1. Node 22 is recommended. Use `.nvmrc`:
   - `nvm use`
2. Install dependencies with `npm install`.
3. Start a dev server with `npm run dev`.
4. Run tests with `npm test` and lint with `npm run lint`.
5. Create a production build with `npm run build`.

## Content

Site copy is managed in the `content/` directory as Markdown files. Images and other static assets live in `public/`.

Editing content:
- `content/home.md`: Hero/intro prose and SEO frontmatter (title, description)
- `content/highlights.md`: Key facts cards via frontmatter list
- `content/property-details.md`: Main description using Tailwind Prose styles
- `content/location.md`: Text shown next to the map
- `content/faq.md`: FAQ entries via frontmatter list

Site-wide settings:
- `site.config.ts`: address, coordinates, contacts, price, EPC, documents, floorplans, analytics id, og image

Assets:
- Preferred: upload original media to your S3 bucket and serve via CloudFront (existing CDN). Set `PUBLIC_MEDIA_BASE_URL` in Netlify env to that CloudFront domain. All media paths in `site.config.ts` will be prefixed automatically at build time.
- Local dev: You can also drop files under `public/` (e.g., `public/images`, `public/floorplans`, `public/panos`, `public/docs`). If `PUBLIC_MEDIA_BASE_URL` is set, the paths will resolve to the CDN in production.
- 360° panoramas (Insta360 X5 exports) under `public/panos/` as equirectangular JPG/PNG. Configure labels and paths in `site.config.ts` under `panos`.

### Media structure (suggested)
- `public/images/` — listing photos (JPG/AVIF/WebP variants optional)
- `public/panos/` — `room-360.jpg` equirectangular (6000×3000 typical)
- `public/floorplans/` — `ground-floor.svg`, `first-floor.svg`, `annex-ground.svg`, `annex-first.svg`, optionally `3d-*.png`
- `public/docs/` — `epc.pdf`, `home-report.pdf`

Update `site.config.ts`:
- `floorplans`: 2D plans (images)
- `floorplans3d`: optional 3D renders (images/PDFs)
- `panos`: list of `{ label, src, preview? }`

CDN/S3 workflow:
- Upload media to your existing S3 bucket as before (keys matching the `public/` structure: `images/...`, `floorplans/...`, `panos/...`, `docs/...`).
- Ensure CloudFront serves the bucket content.
- In Netlify, set `PUBLIC_MEDIA_BASE_URL` to the CloudFront domain (e.g., `https://d123.cloudfront.net`). The site will render absolute CDN URLs without code changes.

## Deployment

The site is deployed on Netlify. The build command and caching headers are defined in `netlify.toml`.

- Netlify uses Node 22 and runs `npm install --no-audit --no-fund && npm run build`.
- CI uses `npm ci` for deterministic installs.

Redirects & caching:
- `netlify.toml` adds immutable caching for hashed assets. Add redirects here if you need to preserve old URLs.
