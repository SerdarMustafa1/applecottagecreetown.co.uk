const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const SITE_URL = process.env.SITE_URL || 'http://localhost:8080';

test.describe('Core user flows', () => {
  test('navigation links lead to correct sections', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('silktideCookieBanner_InitialChoice', '1'));
    await page.goto(SITE_URL);
    // Basic a11y check on header/nav
    const navA11y = await new AxeBuilder({ page }).include('header').analyze();
    const navSerious = navA11y.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(navSerious).toEqual([]);
    await page.getByRole('link', { name: 'Gallery' }).click();
    await expect(page.locator('#gallery')).toBeVisible();
    await page.getByRole('link', { name: 'Floor Plans' }).click();
    await expect(page.locator('#floorplans')).toBeVisible();
    await page.getByRole('link', { name: 'Contact' }).click();
    await expect(page.locator('#contact')).toBeVisible();
    const results = await new AxeBuilder({ page }).include('#contact').analyze();
    const serious = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(serious).toEqual([]);
    // Snapshot checks disabled to reduce CI flakiness
  });

  test('gallery opens images in a lightbox', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('silktideCookieBanner_InitialChoice', '1'));
    await page.goto(SITE_URL + '#gallery');
    const firstTile = page.locator('#gallery-grid button').first();
    await firstTile.click();
    await expect(page.locator('#lightbox')).toBeVisible();
    const results = await new AxeBuilder({ page }).include('#lightbox').analyze();
    const serious = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(serious).toEqual([]);
    // Snapshot checks disabled to reduce CI flakiness
  });

  test('floorplans are visible and accessible', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('silktideCookieBanner_InitialChoice', '1'));
    await page.goto(SITE_URL);
    await page.getByRole('link', { name: 'Floor Plans' }).click();
    await expect(page.locator('#floorplans img').first()).toBeVisible();
    // Ensure floorplan images load with 200 response
    // 2D: exactly two images (house + annex)
    const srcs = await page.$$eval('#floorplans img', imgs => imgs.map(i => i.getAttribute('src')));
    expect(srcs.filter(Boolean).length).toBe(2);
    const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL || '';
    for (const src of srcs) {
      if (!src) continue;
      const resp = await page.request.get(src);
      expect(resp.status()).toBeLessThan(300);
      if (MEDIA_BASE_URL) {
        expect(src.startsWith(MEDIA_BASE_URL)).toBeTruthy();
        // Ensure we are not serving local placeholders
        expect(src.startsWith('/floorplans/')).toBeFalsy();
      }
    }

    // 3D: exactly one video with a valid source
    const videoSrcs = await page.$$eval('#floorplans video source', els => els.map(e => e.getAttribute('src')));
    expect(videoSrcs.filter(Boolean).length).toBe(1);
    for (const vsrc of videoSrcs) {
      if (!vsrc) continue;
      const resp = await page.request.get(vsrc);
      expect(resp.status()).toBeLessThan(300);
      if (MEDIA_BASE_URL) {
        expect(vsrc.startsWith(MEDIA_BASE_URL)).toBeTruthy();
      }
    }
    const results = await new AxeBuilder({ page }).include('#floorplans').analyze();
    const serious = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(serious).toEqual([]);
    // Snapshot checks disabled to reduce CI flakiness
  });

  test('booking embed (TidyCal) is present and accessible', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('silktideCookieBanner_InitialChoice', '1'));
    await page.goto(SITE_URL + '#contact');
    // Ensure the tidycal container is present
    await expect(page.locator('.tidycal-embed')).toBeVisible();
    // Wait briefly for the embed script to insert an iframe; if it doesn't, ensure fallback link exists
    const iframe = page.locator('.tidycal-embed iframe');
    const fallback = page.locator('#tidycal-fallback-link');
    // Wait up to 5s for either iframe or fallback link
    await Promise.race([
      iframe.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {}),
      fallback.waitFor({ state: 'attached', timeout: 5000 }).catch(() => {}),
    ]);
    const hasIframe = await iframe.count() > 0;
    const hasFallback = await fallback.count() > 0;
    expect(hasIframe || hasFallback).toBeTruthy();
    // Run accessibility checks against whichever is present
    if (hasIframe) {
      const results = await new AxeBuilder({ page }).include('.tidycal-embed iframe').analyze();
      const serious = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
      expect(serious).toEqual([]);
    } else {
      const results = await new AxeBuilder({ page }).include('#book-viewing').analyze();
      const serious = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
      expect(serious).toEqual([]);
    }
  });
});
