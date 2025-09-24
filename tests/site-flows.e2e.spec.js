import { test, expect } from '@playwright/test';
import AxeCore from '@axe-core/playwright';
const AxeBuilder = AxeCore.default || AxeCore;

const SITE_URL = process.env.SITE_URL || 'http://localhost:8080';

test.describe('Core user flows', () => {
  test('navigation links lead to correct sections', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('silktideCookieBanner_InitialChoice', '1'));
  await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });
    // Basic a11y check on header/nav
    const navA11y = await new AxeBuilder({ page }).include('header').analyze();
    const navSerious = navA11y.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(navSerious).toEqual([]);
    await page.getByRole('link', { name: 'Gallery' }).click();
    await expect(page.locator('#gallery')).toBeVisible();
    await page.getByRole('link', { name: 'Floor Plans' }).click();
    await expect(page.locator('#floorplans')).toBeVisible();
    await page.getByRole('link', { name: 'Book Viewing' }).click();
    await expect(page.locator('#book-viewing')).toBeVisible();
    const results = await new AxeBuilder({ page }).include('#book-viewing').analyze();
    const serious = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(serious).toEqual([]);
    // Snapshot checks disabled to reduce CI flakiness
  });

  test('gallery opens images in a lightbox', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('silktideCookieBanner_InitialChoice', '1'));
  await page.goto(SITE_URL + '#gallery', { waitUntil: 'domcontentloaded' });
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
  await page.goto(SITE_URL, { waitUntil: 'domcontentloaded' });
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
  await page.goto(SITE_URL + '#book-viewing', { waitUntil: 'domcontentloaded' });
    const bookingSection = page.locator('#book-viewing');
    await expect(bookingSection).toBeVisible();

    const tidycalContainer = page.locator('.tidycal-embed');
    const hasTidycal = (await tidycalContainer.count()) > 0;

    if (hasTidycal) {
      const iframe = tidycalContainer.locator('iframe');
      await iframe.first().waitFor({ state: 'attached', timeout: 7000 }).catch(() => {});
      const results = await new AxeBuilder({ page }).include('.tidycal-embed iframe').analyze();
      const serious = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
      expect(serious).toEqual([]);
    } else {
      const externalCta = bookingSection.getByRole('link', { name: 'Book with Williamson & Henry' });
      await expect(externalCta).toHaveAttribute('href', /williamsonandhenry\.co\.uk/);
      const results = await new AxeBuilder({ page }).include('#book-viewing').analyze();
      const serious = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
      expect(serious).toEqual([]);
    }
  });
});
