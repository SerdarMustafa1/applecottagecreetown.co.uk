// Helper utilities for working with image filename size variants.
// A valid size variant ends with -<width>.<ext> where width is 2-4 digits.

const CANDIDATE_WIDTHS = [480, 768, 1200, 1600];
const SIZE_TOKEN_REGEX = /-(\d{2,4})(\.(?:jpe?g|png|webp|avif))$/i;

export interface ParsedSizeToken {
  orig: number;
  ext: string; // includes leading dot, e.g. .jpg
}

export function parseSizeToken(path?: string): ParsedSizeToken | null {
  if (!path) return null;
  const m = path.match(SIZE_TOKEN_REGEX);
  if (!m) return null;
  return { orig: Number(m[1]), ext: m[2] };
}

// Build a srcset string for a given source path, verifying that each candidate
// variant actually exists in the provided Set of sources. Returns undefined if
// fewer than two variants (including the original) are present, or if the path
// does not contain a size token.
export function buildVerifiedSrcSet(src: string | undefined, allSrcs: Set<string>): string | undefined {
  if (!src) return undefined;
  const info = parseSizeToken(src);
  if (!info) return undefined;
  const base = src.replace(SIZE_TOKEN_REGEX, '');
  const candidates = CANDIDATE_WIDTHS.map(w => `${base}-${w}${info.ext}`);
  const existing = candidates.filter(c => allSrcs.has(c));
  if (existing.length < 2) return undefined;
  return existing.map(c => {
    const sizeMatch = c.match(SIZE_TOKEN_REGEX);
    const w = sizeMatch ? sizeMatch[1] : '0';
    return `${c} ${w}w`;
  }).join(', ');
}

export { CANDIDATE_WIDTHS };
