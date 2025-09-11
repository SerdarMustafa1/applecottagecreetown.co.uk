const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const SITE_URL = process.env.SITE_URL || 'http://localhost:8080';

test.describe('Core user flows', () => {
  test('navigation links lead to correct sections', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('silktideCookieBanner_InitialChoice', '1'));
    await page.goto(SITE_URL);
    await page.getByRole('link', { name: 'Gallery' }).click();
    await expect(page.locator('#gallery')).toBeVisible();
    await page.getByRole('link', { name: 'Floor Plans' }).click();
    await expect(page.locator('#floorplans')).toBeVisible();
    await page.getByRole('link', { name: 'Contact' }).click();
    await expect(page.locator('#contact')).toBeVisible();
    const results = await new AxeBuilder({ page }).include('#contact').analyze();
    const serious = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(serious).toEqual([]);
    await expect(page).toHaveScreenshot('navigation.png');
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
    await expect(page.locator('#lightbox')).toHaveScreenshot('lightbox.png');
  });

  test('floorplans are visible and accessible', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('silktideCookieBanner_InitialChoice', '1'));
    await page.goto(SITE_URL);
    await page.getByRole('link', { name: 'Floor Plans' }).click();
    await expect(page.locator('#floorplans img').first()).toBeVisible();
    const results = await new AxeBuilder({ page }).include('#floorplans').analyze();
    const serious = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(serious).toEqual([]);
    await expect(page.locator('#floorplans')).toHaveScreenshot('floorplans.png');
  });

  test('contact form validates and submits', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('silktideCookieBanner_InitialChoice', '1'));
    await page.goto(SITE_URL + '#contact');
    await expect(page.locator('#name')).toBeVisible();
    await page.fill('#name', 'Test User');
    await expect(page.locator('#email')).toBeVisible();
    await page.fill('#email', 'test@example.com');
    await expect(page.locator('#message')).toBeVisible();
    await page.fill('#message', 'I would like to book a viewing.');
    await page.click('form[name="contact"] button[type="submit"]');
    const results = await new AxeBuilder({ page }).include('#contact').analyze();
    const serious = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(serious).toEqual([]);
    await expect(page.locator('#contact')).toHaveScreenshot('contact-form.png');
  });
});
