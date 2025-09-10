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
    await page.getByRole('link', { name: 'Contact Us' }).click();
    await expect(page.locator('#contact')).toBeVisible();
    const results = await new AxeBuilder({ page }).include('#contact').analyze();
    const serious = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(serious).toEqual([]);
    await expect(page).toHaveScreenshot('navigation.png');
  });

  test('gallery opens images in a lightbox', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('silktideCookieBanner_InitialChoice', '1'));
    await page.goto(SITE_URL + '#gallery');
    const firstImage = page.locator('#gallery .gallery img').first();
    await firstImage.click();
    await expect(page.locator('#lightbox')).toBeVisible();
    const results = await new AxeBuilder({ page }).include('#lightbox').analyze();
    const serious = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(serious).toEqual([]);
    await expect(page.locator('#lightbox')).toHaveScreenshot('lightbox.png');
  });

  test('floor plan tabs switch content', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('silktideCookieBanner_InitialChoice', '1'));
    await page.goto(SITE_URL);
    await page.getByText('Floor Plans & 3D Model').click();
    await page.waitForSelector('#floorplans[open]');
    const tabs = page.locator('.floorplan-tab');
    await tabs.nth(1).click();
    await expect(page.locator('#first-floor-panel')).toBeVisible();
    const results = await new AxeBuilder({ page }).include('#floorplans').analyze();
    const serious = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(serious).toEqual([]);
    await expect(page.locator('#floorplans')).toHaveScreenshot('floorplans.png');
  });

  test('contact form submits data', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('silktideCookieBanner_InitialChoice', '1'));
    await page.goto(SITE_URL + '#contact');
    await page.route('https://formsubmit.co/**', route => route.fulfill({ status: 200, body: 'OK' }));
    await expect(page.locator('#firstName')).toBeVisible();
    await page.fill('#firstName', 'Test');
    await expect(page.locator('#lastName')).toBeVisible();
    await page.fill('#lastName', 'User');
    await expect(page.locator('#email')).toBeVisible();
    await page.fill('#email', 'test@example.com');
    await expect(page.locator('#phone')).toBeVisible();
    await page.fill('#phone', '1234567890');
    await expect(page.locator('#captchaAnswer')).toBeVisible();
    await page.fill('#captchaAnswer', '2');
    await page.click('#homeReportForm button[type="submit"]');
    const results = await new AxeBuilder({ page }).include('#contact').analyze();
    const serious = results.violations.filter(v => ['critical', 'serious'].includes(v.impact));
    expect(serious).toEqual([]);
    await expect(page.locator('#contact')).toHaveScreenshot('contact-form.png');
  });
});

