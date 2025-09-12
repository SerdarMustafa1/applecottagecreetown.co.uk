import '@astrojs/internal-helpers/path';
import 'kleur/colors';
import { N as NOOP_MIDDLEWARE_HEADER, i as decodeKey } from './chunks/astro/server_wjQ5yTLm.mjs';
import 'clsx';
import 'cookie';
import 'es-module-lexer';
import 'html-escaper';

const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};

const codeToStatusMap = {
  // Implemented from IANA HTTP Status Code Registry
  // https://www.iana.org/assignments/http-status-codes/http-status-codes.xhtml
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  CONTENT_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_CONTENT: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NETWORK_AUTHENTICATION_REQUIRED: 511
};
Object.entries(codeToStatusMap).reduce(
  // reverse the key-value pairs
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {}
);

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/serdarmustafa-thm/apple_cottage_website/","cacheDir":"file:///Users/serdarmustafa-thm/apple_cottage_website/node_modules/.astro/","outDir":"file:///Users/serdarmustafa-thm/apple_cottage_website/dist/","srcDir":"file:///Users/serdarmustafa-thm/apple_cottage_website/src/","publicDir":"file:///Users/serdarmustafa-thm/apple_cottage_website/public/","buildClientDir":"file:///Users/serdarmustafa-thm/apple_cottage_website/dist/","buildServerDir":"file:///Users/serdarmustafa-thm/apple_cottage_website/.netlify/build/","adapterName":"@astrojs/netlify","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)\\/?$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"ignore"}}}],"site":"https://applecottagecreetown.co.uk","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/serdarmustafa-thm/apple_cottage_website/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000noop-actions":"_noop-actions.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","/Users/serdarmustafa-thm/apple_cottage_website/node_modules/pannellum/build/pannellum.css":"_astro/index.95d291e9.BGF8jmif.js","\u0000@astrojs-manifest":"manifest_DiHD6ETu.mjs","/Users/serdarmustafa-thm/apple_cottage_website/node_modules/astro/node_modules/unstorage/drivers/netlify-blobs.mjs":"chunks/netlify-blobs_DM36vZAS.mjs","/Users/serdarmustafa-thm/apple_cottage_website/src/components/ContactFormIsland.tsx":"_astro/ContactFormIsland.Duy2FjEM.js","/Users/serdarmustafa-thm/apple_cottage_website/src/components/FloorplanViewerIsland.tsx":"_astro/FloorplanViewerIsland.4RB2da2O.js","/Users/serdarmustafa-thm/apple_cottage_website/src/components/VirtualTours.astro?astro&type=script&index=0&lang.ts":"_astro/VirtualTours.astro_astro_type_script_index_0_lang.BZa-8-0Y.js","/Users/serdarmustafa-thm/apple_cottage_website/node_modules/pannellum/build/pannellum.js":"_astro/pannellum.DpHmzOs_.js","/Users/serdarmustafa-thm/apple_cottage_website/src/components/PanoViewerIsland.tsx":"_astro/PanoViewerIsland.C3OddXaD.js","@astrojs/react/client.js":"_astro/client.MPOeFQxP.js","/Users/serdarmustafa-thm/apple_cottage_website/src/components/GalleryIsland.tsx":"_astro/GalleryIsland.BgnYd9WA.js","/Users/serdarmustafa-thm/apple_cottage_website/src/components/GalleryIsland":"_astro/GalleryIsland.BcI0hpD4.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[["/Users/serdarmustafa-thm/apple_cottage_website/src/components/VirtualTours.astro?astro&type=script&index=0&lang.ts","window.openVirtualTour=function(t){const e=(window.siteConfig&&window.siteConfig.virtual360Tours||[])[t];if(!e)return;const d=document.getElementById(\"virtual-tour-modal\"),o=document.getElementById(\"virtual-tour-video\"),i=document.getElementById(\"virtual-tour-mp4\"),r=document.getElementById(\"virtual-tour-webm\"),u=document.getElementById(\"virtual-tour-title\"),l=document.getElementById(\"virtual-tour-description\");i.src=e.videoMp4,r.src=e.videoWebm,o.poster=e.poster,u.textContent=e.label,l.textContent=e.description,o.load(),d.classList.remove(\"hidden\"),document.body.style.overflow=\"hidden\"};window.closeVirtualTour=function(){const t=document.getElementById(\"virtual-tour-modal\");document.getElementById(\"virtual-tour-video\").pause(),t.classList.add(\"hidden\"),document.body.style.overflow=\"auto\"};document.addEventListener(\"keydown\",t=>{t.key===\"Escape\"&&window.closeVirtualTour()});document.getElementById(\"virtual-tour-modal\")?.addEventListener(\"click\",t=>{t.target===t.currentTarget&&window.closeVirtualTour()});"]],"assets":["/_astro/index.DdvzG7zL.css","/apple-touch-icon.png","/favicon.ico","/favicon.svg","/robots.txt","/site.webmanifest","/sitemap.xml","/_astro/ContactFormIsland.Duy2FjEM.js","/_astro/FloorplanViewerIsland.4RB2da2O.js","/_astro/GalleryIsland.BcI0hpD4.js","/_astro/GalleryIsland.BgnYd9WA.js","/_astro/PanoViewerIsland.C3OddXaD.js","/_astro/client.MPOeFQxP.js","/_astro/index.D33SxI2g.css","/_astro/index.DK-fsZOb.js","/_astro/jsx-runtime.ClP7wGfN.js","/_astro/pannellum.DpHmzOs_.js","/docs/epc.png","/docs/home-report.pdf","/docs/plot.png","/icons/icon-192.png","/icons/icon-512.png","/index.html"],"buildFormat":"directory","checkOrigin":true,"serverIslandNameMap":[],"key":"rOqJX6CVqvejrDM2iBmfwZ2FpYiFmXs7VMr87DpXM5o=","sessionConfig":{"driver":"netlify-blobs","options":{"name":"astro-sessions","consistency":"strong"}}});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = () => import('./chunks/netlify-blobs_DM36vZAS.mjs');

export { manifest };
