const { test, expect } = require('@playwright/test');

test.describe('Unified Gallery and Room-by-Room integration', () => {
  test('Gallery filters, show more and lightbox work', async ({ page }) => {
  await page.goto(process.env.SITE_URL || 'http://localhost:8080/');

    // Wait for gallery island to load
    await page.waitForSelector('#gallery-grid');

    // Ensure filter buttons exist and click a room filter if present
    const filterButtons = await page.$$('section#gallery button[aria-pressed]');
    expect(filterButtons.length).toBeGreaterThan(0);

    // Click the first non-All filter if available
    const labels = await Promise.all(filterButtons.map(b => b.innerText()));
    const nonAllIndex = labels.findIndex(t => t && t.trim() !== 'All');
    if (nonAllIndex >= 0) {
      await filterButtons[nonAllIndex].click();
      await page.waitForTimeout(200);
    }

    // Show more if present
    const showMore = await page.$('button:has-text("Show more")');
    if (showMore) {
      await showMore.click();
      await page.waitForTimeout(200);
    }

    // Open first image in gallery
    const firstThumb = await page.$('#gallery-grid button');
    await expect(firstThumb).toBeTruthy();
    await firstThumb.click();

    // Lightbox should appear (dialog or similar)
    const lightbox = await page.$('dialog, [role="dialog"], .lightbox');
    expect(lightbox).toBeTruthy();
  });

  test('Room-by-Room accordion uses unified images', async ({ page }) => {
  await page.goto(process.env.SITE_URL || 'http://localhost:8080/');
    await page.waitForSelector('#room-galleries-accordion');

    // Open the first room accordion
    const firstDetails = await page.$('#room-galleries-accordion details');
  await firstDetails.evaluate(d => { d.open = true; });
    await page.waitForTimeout(150);

    // Check for a gallery grid inside
    const gallery = await firstDetails.$('#gallery-grid');
    expect(gallery).toBeTruthy();
  });
});
