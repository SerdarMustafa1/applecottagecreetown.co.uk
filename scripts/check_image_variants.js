#!/usr/bin/env node
/*
 * Scans site.config.ts exported image arrays (via dynamic import of built config) is not trivial without build.
 * Instead, we read site.config.ts text and regex for image paths with size tokens then verify sibling variants.
 * Rules:
 *  - For any path ending -<width>.(jpg|jpeg|png|webp|avif), collect group base (path without -<width>.<ext> + extension).
 *  - Expected candidate widths: 480, 768, 1200, 1600 (does not enforce presence, but reports missing if some exist).
 *  - If only a single width exists for a base, OK (no responsive set required) — but we note informationally if gaps present.
 *  - If 2+ widths exist, report any missing in the canonical set to encourage completeness.
 *  - Exit code 1 only if a width >=1200 exists without at least one smaller companion (< orig), to catch likely upload mistakes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FILE = path.join(process.cwd(), 'site.config.ts');
const WIDTHS = [480, 768, 1200, 1600];

function main() {
  let text;
  try {
    text = fs.readFileSync(FILE, 'utf8');
  } catch (e) {
    console.error('[variants] Failed to read site.config.ts:', e.message);
    process.exit(1);
  }

  const regex = /(['"`])([^'"`]*?)-(\d{2,4})(\.(?:jpe?g|png|webp|avif))\1/g;
  const groups = new Map();
  let m;
  while ((m = regex.exec(text))) {
    const width = Number(m[3]);
    const ext = m[4];
  const base = m[2].replace(/-(\d{2,4})$/, ''); // strip trailing -<width> if present redundantly
    const key = base + ext; // group key without size token
    if (!groups.has(key)) groups.set(key, new Set());
    groups.get(key).add(width);
  }

  const warnings = [];
  const errors = [];

  for (const [key, widthsSet] of groups.entries()) {
    const widths = Array.from(widthsSet).sort((a,b)=>a-b);
    if (widths.length === 1) {
      // single variant fine; if it's large encourage smaller version
      if (widths[0] >= 1200) {
        warnings.push(`${key} only has large width ${widths[0]} — consider adding a smaller variant (480 or 768).`);
      }
      continue;
    }
    // multiple variants: check for missing expected ones up to the largest present
    const largest = widths[widths.length - 1];
    const expected = WIDTHS.filter(w => w <= largest);
    const missing = expected.filter(w => !widthsSet.has(w));
    if (missing.length) {
      warnings.push(`${key} has widths [${widths.join(',')}] but is missing [${missing.join(',')}]`);
    }
    // error rule: presence of a large (>=1200) width without any smaller (<800) companion
    if (widths.some(w => w >= 1200) && !widths.some(w => w < 800)) {
      errors.push(`${key} contains large width(s) ${widths.filter(w=>w>=1200).join(',')} but no small variant (480/768).`);
    }
  }

  warnings.forEach(w => console.warn('[variants][warn]', w));
  if (errors.length) {
    errors.forEach(e => console.error('[variants][error]', e));
    console.error(`Variant check failed: ${errors.length} error(s).`);
    process.exit(1);
  }
  console.log(`[variants] Completed. ${warnings.length} warning(s), ${errors.length} error(s).`);
}

main();
