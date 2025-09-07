#!/usr/bin/env node
// Inventories S3 objects under images/ and videos/, compares to assets referenced in index.html
// Prints: missing on S3, unreferenced on S3, and likely duplicates by basename.

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const BUCKET = process.env.MEDIA_BUCKET || "apple-cottage-media-eu";
const PROFILE = process.env.AWS_PROFILE || "smustafa";
const REGION = process.env.AWS_REGION || "eu-west-1";

function sh(cmd, args) {
  const res = spawnSync(cmd, args, { encoding: "utf8" });
  if (res.error) throw res.error;
  if (res.status !== 0) {
    const msg = (res.stderr || res.stdout || "").trim();
    throw new Error(`Command failed: ${cmd} ${args.join(" ")}\n${msg}`);
  }
  return res.stdout;
}

function listS3(prefix) {
  const out = sh("aws", [
    "s3api",
    "list-objects-v2",
    "--bucket",
    BUCKET,
    "--prefix",
    prefix,
    "--query",
    "Contents[].Key",
    "--output",
    "text",
    "--profile",
    PROFILE,
    "--region",
    REGION,
  ]);
  return out.split(/\s+/).filter(Boolean);
}

function parseIndexRefs() {
  const indexPath = path.join(__dirname, "..", "index.html");
  const html = fs.readFileSync(indexPath, "utf8");
  const MEDIA_BASE_URL =
    process.env.MEDIA_BASE_URL || "https://d1t6lpjdsu4646.cloudfront.net";
  const urls = new Set();
  const attrRe = /(src|href|poster|data-src)=\s*("|')(.*?)\2/gi;
  const srcsetRe = /(srcset|data-srcset)=\s*("|')(.*?)\2/gi;
  const norm = (u) => {
    if (!u) return null;
    if (/^https?:\/\//i.test(u)) return u;
    if (/^assets\//.test(u)) {
      return u
        .replace(/^assets\/images\//, MEDIA_BASE_URL + "/images/")
        .replace(/^assets\/videos\//, MEDIA_BASE_URL + "/videos/");
    }
    return null;
  };
  let m;
  while ((m = attrRe.exec(html))) {
    const u = norm(m[3]);
    if (u) urls.add(u);
  }
  while ((m = srcsetRe.exec(html))) {
    m[3].split(",").forEach((part) => {
      const u = norm(part.trim().split(" ")[0]);
      if (u) urls.add(u);
    });
  }
  const list = Array.from(urls).filter((u) =>
    /(\/images\/|\/videos\/)/.test(u)
  );
  // Convert CDN URLs to S3 keys
  const keys = list.map((u) => u.replace(/^https?:\/\/[^/]+\//, ""));
  return new Set(keys);
}

function groupByBase(keys) {
  const map = new Map();
  for (const k of keys) {
    const base = k
      .replace(/\.(avif|webp|jpe?g|png|svg|mp4|webm|mov)$/i, "")
      .replace(/-[0-9]+w$/, "");
    if (!map.has(base)) map.set(base, []);
    map.get(base).push(k);
  }
  return map;
}

(function main() {
  console.log(
    `[inventory] Bucket=${BUCKET} Region=${REGION} Profile=${PROFILE}`
  );
  const s3Images = new Set(listS3("images/"));
  const s3Videos = new Set(listS3("videos/"));
  const s3All = new Set([...s3Images, ...s3Videos]);
  console.log(
    `[inventory] S3 keys: images=${s3Images.size}, videos=${s3Videos.size}`
  );

  const refs = parseIndexRefs();
  console.log(`[inventory] Code references: ${refs.size}`);

  // Missing on S3
  const missing = [...refs].filter((k) => !s3All.has(k));
  // Unreferenced on S3
  const unref = [...s3All].filter((k) => !refs.has(k));

  // Duplicates by basename
  const dupGroups = [];
  const groups = groupByBase(s3All);
  for (const [base, arr] of groups) {
    if (arr.length > 1) dupGroups.push({ base, keys: arr });
  }

  console.log(`\n[report] missing_on_s3=${missing.length}`);
  missing.slice(0, 50).forEach((k) => console.log("  -", k));
  if (missing.length > 50) console.log(`  ... +${missing.length - 50} more`);

  console.log(`\n[report] unreferenced_on_s3=${unref.length}`);
  unref.slice(0, 100).forEach((k) => console.log("  -", k));
  if (unref.length > 100) console.log(`  ... +${unref.length - 100} more`);

  console.log(`\n[report] duplicate_groups=${dupGroups.length}`);
  dupGroups.slice(0, 50).forEach((g) => {
    console.log("  *", g.base);
    g.keys.forEach((k) => console.log("     -", k));
  });
  if (dupGroups.length > 50)
    console.log(`  ... +${dupGroups.length - 50} more groups`);

  // Write a cleanup suggestion file
  const outPath = path.join(__dirname, "s3_cleanup_suggestions.txt");
  const lines = [];
  lines.push("# Unreferenced S3 keys (safe to delete after review)");
  unref.forEach((k) => lines.push(k));
  fs.writeFileSync(outPath, lines.join("\n"));
  console.log(`\n[write] Suggestions saved to ${outPath}`);
})();
