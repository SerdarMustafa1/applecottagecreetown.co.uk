todos:

review legacy site https://68bca0be7774d400082b31d6--gorgeous-torrone-99504e.netlify.app/ and reinstate  any missing content related to the planning permission and the image of the architectural  plans

reinstate:

some of the key metrics:

0.13 acres
≈ 532 m² (title plan)
Approx. plot size — based on title plan
~122 m²
Main house internal area
Plus ~25 m² annex
~25 m²
Fully serviced brick annex Power, plumbing & WC
Landscaped Garden, covered lean-to & BBQ

location info:

A75 — 2 min Kirroughtree — 5 min Newton Stewart — 10 min Mossyard — 15 min
what3words: ///silk.dynamics.quitter

merge all in with existing site in a marketing and UI/ux friendly manner without creatging duplicates or causing any reqgression.

360 panos blocked by CORS
Symptoms: “No ‘Access-Control-Allow-Origin’ header” and a Pannellum error reading the image.
Why: Pannellum fetches the equirectangular JPGs via XHR. Your CDN (CloudFront → S3) must allow cross-origin requests from http://localhost:4321 and your production domain.
Fix required on CDN:
Add a Response Headers Policy (recommended): Include
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, HEAD
Access-Control-Allow-Headers: Range
Access-Control-Expose-Headers: Content-Length, Content-Range
Or enable an S3 CORS config:
AllowedOrigins: [“*”] or specific origins
AllowedMethods: [GET, HEAD]
AllowedHeaders: [“*”] or needed headers
Invalidate CloudFront or wait for cache TTL.


(index):3 Uncaught ReferenceError: gaId is not defined
    at (index):3:38
/cookie-banner/silktide-consent-manager.css:1  Failed to load resource: the server responded with a status of 404 ()
(index):6 Uncaught ReferenceError: gaId is not defined
    at (index):6:28
silktide-consent-manager.js:1  Failed to load resource: the server responded with a status of 404 ()
(index):1 Access to image at 'https://d1t6lpjdsu4646.cloudfront.net/images/new/garden-corner-1200.jpg' from origin 'https://applecottagecreetown.co.uk' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
d1t6lpjdsu4646.cloudfront.net/images/new/garden-corner-1200.jpg:1  Failed to load resource: net::ERR_FAILED
(index):1 Access to XMLHttpRequest at 'https://d1t6lpjdsu4646.cloudfront.net/images/panos/back-bedroom-pano.jpg' from origin 'https://applecottagecreetown.co.uk' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
pannellum.DpHmzOs_.js:45 Uncaught TypeError: Failed to execute 'readAsBinaryString' on 'FileReader': parameter 1 is not of type 'Blob'.
    at Kt (pannellum.DpHmzOs_.js:45:5179)
    at v.onloadend (pannellum.DpHmzOs_.js:45:1753)
d1t6lpjdsu4646.cloudfront.net/images/panos/back-bedroom-pano.jpg:1  Failed to load resource: net::ERR_FAILED
(index):1 Access to XMLHttpRequest at 'https://d1t6lpjdsu4646.cloudfront.net/images/panos/bathroom-pano.jpg' from origin 'https://applecottagecreetown.co.uk' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
pannellum.DpHmzOs_.js:45 Uncaught TypeError: Failed to execute 'readAsBinaryString' on 'FileReader': parameter 1 is not of type 'Blob'.
    at Kt (pannellum.DpHmzOs_.js:45:5179)
    at v.onloadend (pannellum.DpHmzOs_.js:45:1753)
d1t6lpjdsu4646.cloudfront.net/images/panos/bathroom-pano.jpg:1  Failed to load resource: net::ERR_FAILED
(index):1 Access to XMLHttpRequest at 'https://d1t6lpjdsu4646.cloudfront.net/images/panos/hallway-pano.jpg' from origin 'https://applecottagecreetown.co.uk' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
pannellum.DpHmzOs_.js:45 Uncaught TypeError: Failed to execute 'readAsBinaryString' on 'FileReader': parameter 1 is not of type 'Blob'.
    at Kt (pannellum.DpHmzOs_.js:45:5179)
    at v.onloadend (pannellum.DpHmzOs_.js:45:1753)
d1t6lpjdsu4646.cloudfront.net/images/panos/hallway-pano.jpg:1  Failed to load resource: net::ERR_FAILED
(index):1 Access to XMLHttpRequest at 'https://d1t6lpjdsu4646.cloudfront.net/images/panos/front-bedroom-pano.jpg' from origin 'https://applecottagecreetown.co.uk' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
pannellum.DpHmzOs_.js:45 Uncaught TypeError: Failed to execute 'readAsBinaryString' on 'FileReader': parameter 1 is not of type 'Blob'.
    at Kt (pannellum.DpHmzOs_.js:45:5179)
    at v.onloadend (pannellum.DpHmzOs_.js:45:1753)
d1t6lpjdsu4646.cloudfront.net/images/panos/front-bedroom-pano.jpg:1  Failed to load resource: net::ERR_FAILED
(index):1 Access to XMLHttpRequest at 'https://d1t6lpjdsu4646.cloudfront.net/images/panos/steps-pano.jpg' from origin 'https://applecottagecreetown.co.uk' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
pannellum.DpHmzOs_.js:45 Uncaught TypeError: Failed to execute 'readAsBinaryString' on 'FileReader': parameter 1 is not of type 'Blob'.
    at Kt (pannellum.DpHmzOs_.js:45:5179)
    at v.onloadend (pannellum.DpHmzOs_.js:45:1753)
d1t6lpjdsu4646.cloudfront.net/images/panos/steps-pano.jpg:1  Failed to load resource: net::ERR_FAILED
(index):1 Access to XMLHttpRequest at 'https://d1t6lpjdsu4646.cloudfront.net/images/panos/lounge-pano.jpg' from origin 'https://applecottagecreetown.co.uk' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
pannellum.DpHmzOs_.js:45 Uncaught TypeError: Failed to execute 'readAsBinaryString' on 'FileReader': parameter 1 is not of type 'Blob'.
    at Kt (pannellum.DpHmzOs_.js:45:5179)
    at v.onloadend (pannellum.DpHmzOs_.js:45:1753)
d1t6lpjdsu4646.cloudfront.net/images/panos/lounge-pano.jpg:1  Failed to load resource: net::ERR_FAILED
(index):1 Access to XMLHttpRequest at 'https://d1t6lpjdsu4646.cloudfront.net/images/panos/master-bedroom-pano.jpg' from origin 'https://applecottagecreetown.co.uk' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
pannellum.DpHmzOs_.js:45 Uncaught TypeError: Failed to execute 'readAsBinaryString' on 'FileReader': parameter 1 is not of type 'Blob'.
    at Kt (pannellum.DpHmzOs_.js:45:5179)
    at v.onloadend (pannellum.DpHmzOs_.js:45:1753)
d1t6lpjdsu4646.cloudfront.net/images/panos/master-bedroom-pano.jpg:1  Failed to load resource: net::ERR_FAILED
silktide-consent-manager.css:1  Failed to load resource: the server responded with a status of 404 ()


Hot water: Vaillant aroSTOR 270 ASHP water cylinder for efficient, low‑carbon hot water (about aroSTOR).
Infrared heating panels: zoned, fast‑response room heating; minimal air movement and comfortable radiant warmth (learn more).
EV charger: Ohme Home Pro smart charger on the driveway (ohme‑ev.com).
Energy supplier: currently Octopus Energy on an Intelligent tariff with export; linked to the Ohme charger for smart, off‑peak charging and efficient scheduling (about Intelligent Octopus).


Google tag: G-LHB9R5TLL1 not found