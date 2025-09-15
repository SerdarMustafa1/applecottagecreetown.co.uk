#!/usr/bin/env node
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SITE_URL = process.env.SITE_URL || 'https://applecottagecreetown.co.uk';
const outDir = path.resolve('test-results');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.addInitScript(() => localStorage.setItem('silktideCookieBanner_InitialChoice', '1'));

  await page.goto(SITE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  // Scroll a bit to ensure sections are rendered
  await page.evaluate(() => window.scrollTo(0, 400));

  // Full page
  const fullPath = path.join(outDir, 'location-fullpage.png');
  await page.screenshot({ path: fullPath, fullPage: true });

  // Map/location section
  const loc = page.locator('#location');
  await loc.waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  const locPath = path.join(outDir, 'location-section.png');
  if (await loc.count()) {
    await loc.first().screenshot({ path: locPath });
  }

  // Around Apple Cottage grid
  const extras = page.locator('#location-extras');
  await extras.waitFor({ state: 'visible', timeout: 20000 }).catch(() => {});
  const extrasPath = path.join(outDir, 'around-apple-cottage-grid.png');
  if (await extras.count()) {
    await extras.first().screenshot({ path: extrasPath });
  }

  console.log('Saved screenshots to:', outDir);
  await browser.close();
}

run().catch((e) => { console.error(e); process.exit(1); });

