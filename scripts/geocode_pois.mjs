#!/usr/bin/env node
/*
  Geocode POI names to lat/lng using OSM Nominatim and print a JSON
  mapping you can paste back into site.config.ts. Requires an identifying
  User-Agent and contact email (per Nominatim policy).

  Usage:
    EMAIL=you@example.com node scripts/geocode_pois.mjs "Creetown Heritage Museum" "The Gem Rock Museum, Creetown" ...
*/
import https from 'node:https';

const email = process.env.EMAIL || '';
if (!email) {
  console.error('Please set EMAIL=you@example.com to comply with Nominatim usage policy.');
  process.exit(1);
}

const queries = process.argv.slice(2);
if (queries.length === 0) {
  console.error('Provide one or more place names as arguments.');
  process.exit(1);
}

function geocode(q) {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('q', q);
  url.searchParams.set('email', email);

  const ua = `AppleCottageSite/1.0 (${email})`;
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': ua } }, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => {
        try {
          const arr = JSON.parse(data);
          if (Array.isArray(arr) && arr.length) {
            resolve({ q, lat: parseFloat(arr[0].lat), lng: parseFloat(arr[0].lon) });
          } else {
            resolve({ q, lat: null, lng: null });
          }
        } catch {
          resolve({ q, lat: null, lng: null });
        }
      });
    }).on('error', () => resolve({ q, lat: null, lng: null }));
  });
}

(async () => {
  const results = [];
  for (const q of queries) {
    // Basic politeness delay to avoid rate limiting
    /* eslint-disable no-await-in-loop */
    const r = await geocode(q);
    results.push(r);
    await new Promise((r2) => setTimeout(r2, 1100));
    /* eslint-enable no-await-in-loop */
  }
  console.log(JSON.stringify(results, null, 2));
})();
