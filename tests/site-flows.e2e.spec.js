const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;

const SITE_URL = process.env.SITE_URL || 'http://localhost:8080';

test.describe('Core user flows', () => {
  test('navigation links lead to correct sections', async ({ page }) => {
    await page.goto(SITE_URL);
    await page.getByRole('link', { name: 'Gallery' }).click();
    await expect(page.locator('#gallery')).toBeVisible();
    await page.getByRole('link', { name: 'Floor Plans' }).click();
    await expect(page.locator('#floorplans')).toBeVisible();
    await page.getByRole('link', { name: 'Contact Us' }).click();
    await expect(page.locator('#contact')).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('gallery opens images in a lightbox', async ({ page }) => {
    await page.goto(SITE_URL + '#gallery');
    const firstImage = page.locator('#gallery .gallery img').first();
    await firstImage.click();
    await expect(page.locator('#lightbox')).toBeVisible();
    const results = await new AxeBuilder({ page }).include('#lightbox').analyze();
    expect(results.violations).toEqual([]);
  });

  test('floor plan tabs switch content', async ({ page }) => {
    await page.goto(SITE_URL);
    await page.getByText('Floor Plans & 3D Model').click();
    await page.waitForSelector('#floorplans[open]');
    const tabs = page.locator('.floorplan-tab');
    await tabs.nth(1).click();
    await expect(page.locator('#first-floor-panel')).toBeVisible();
    const results = await new AxeBuilder({ page }).include('#floorplans').analyze();
    expect(results.violations).toEqual([]);
  });

  test('contact form submits data', async ({ page }) => {
    await page.goto(SITE_URL + '#contact');
    await page.route('https://formsubmit.co/**', route => route.fulfill({ status: 200, body: 'OK' }));
    await page.fill('#firstName', 'Test');
    await page.fill('#lastName', 'User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#phone', '1234567890');
    await page.fill('#captchaAnswer', '2');
    await page.click('#homeReportForm button[type="submit"]');
    const results = await new AxeBuilder({ page }).include('#contact').analyze();
    expect(results.violations).toEqual([]);
  });
});

