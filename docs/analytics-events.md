# Analytics Event Map

This site now emits structured GA4/GTM-friendly events via the global `window.appleAnalytics` helper. Events are queued until consent-enabled GA loads, and they are also pushed onto `dataLayer` for downstream GTM recipes.

## Core Helper

- **Global helper**: defined in `src/layouts/BaseLayout.astro` (`window.appleAnalytics`).
- **Module API**: `src/lib/analytics.ts` wraps the global helper for React/TSX components.
- Events are de-duplicated, queued until GA is available, and mirrored to `dataLayer`.

## Event Catalogue

| Event | Description | Key Params | Fired From |
| --- | --- | --- | --- |
| `cta_click` | Tracks all major calls-to-action. | `cta_name`, `cta_location`, `destination_url`, `cta_type`, `cta_variant` | Hero CTA + Home Report, hero portal pill, sticky CTA buttons, book-viewing section CTA, trust bar link, location what3words link, header nav, etc. |
| `document_open` | Captures PDF / document launches. | `document_name`, `document_location`, `document_url`, `document_format` | Hero home report, trust bar valuation link, property docs card, sticky CTA Home Report. |
| `media_engagement` | Normalises rich media engagement across galleries, floorplans, tours, panos. | `media_type`, `media_action`, `media_label`, `media_identifier`, `media_index`, `media_total`, `media_filter`, `media_direction`, `media_format`, `engagement_seconds` | Gallery lightbox open/close/navigate, floorplan lightbox interactions, virtual tour modal open/close, 360° pano visibility, custom `applecottage:tour-watch` progress events. |
| `gallery_view` | Image-level views triggered from the lightbox (with filter context). | `image_src`, `image_alt`, `image_index`, `gallery_total`, `gallery_filter` | Global listener responding to `applecottage:gallery-viewed`. |
| `gallery_filter` | Filter chip changes in the gallery. | `gallery_filter`, `gallery_count` | `GalleryIsland` filter change effect. |
| `gallery_slideshow_open` | Slideshow CTA within the gallery hero card. | `gallery_filter`, `gallery_count` | Slideshow button adjacent to filter chips. |
| `navigation_click` | Header nav interactions (desktop & mobile + brand logo). | `nav_label`, `nav_target`, `nav_location` | `src/components/Nav.astro`. |
| `contact_action` | Contact-style clicks (WhatsApp, external booking button). | `contact_method`, `contact_location`, `contact_destination` | Sticky CTA WhatsApp + book button, book-viewing section CTA, map what3words link. |
| `booking_interest` | Higher-intent signals funnelled from existing custom events. | `booking_source` | Global listener for `applecottage:booking-interest` (hero, sticky CTA, book-viewing section, embedded form, etc.). |
| `offline_download` | Fires when offline download event is announced. | `engagement_location` | Global listener for `applecottage:offline-download`. |
| `a2hs_prompt_shown` | PWA install prompt displayed. | `trigger_reason` | `InstallPromptIsland` when prompt is surfaced. |
| `a2hs_prompt_accept` | User opts to install the PWA. | `trigger_reason` | Install CTA button in `InstallPromptIsland`. |
| `a2hs_prompt_dismiss` | User dismisses the install prompt. | `trigger_reason` | "Maybe later" button. |
| `sticky_cta_state` | Tracks minimise/restore of floating CTA panel. | `sticky_cta_state` (`minimized`/`expanded`) | Sticky CTA toggle button. |

### Additional Notes

- Custom event listeners in `BaseLayout` convert legacy `applecottage:*` DOM events (gallery view, booking interest, tour watch, offline download) into GA4 events.
- `window.appleAnalytics.trackContact` is used wherever an outbound communication method is offered, supporting contact conversion tracking in GA4.
- Every outbound CTA includes its contextual `cta_location` to segment hero vs sticky vs section performance.
- Virtual tour progress events emit `media_engagement` with `media_type = virtual_tour` and `engagement_seconds` so GA4 funnels can be built around viewing time. 360° panos emit the same event with `media_type = pano`.
- `dataLayer` receives every event payload, enabling GTM tagging or debugging without relying on GA being present at trigger time.

Use this reference when creating GA4 custom dimensions/metrics or GTM tags to ensure parameter names map cleanly to marketing dashboards.
