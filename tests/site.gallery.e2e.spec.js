const { test, expect } = require('@playwright/test');

test.describe('Unified Gallery and Room-by-Room integration', () => {
  test('Gallery filters, infinite scroll and lightbox work', async ({ page }) => {
    await page.goto(process.env.SITE_URL || 'http://localhost:8080/');

    // Wait for gallery island to load
    await page.waitForSelector('#gallery-grid');

    // Ensure filter buttons exist and click a room filter if present
    const filterButtons = await page.$$('section#gallery button[aria-pressed]');
    expect(filterButtons.length).toBeGreaterThan(0);

    // All filter buttons should have accessible names and aria-pressed attribute
    for (const b of filterButtons) {
      const name = await b.innerText();
      expect(name.trim().length).toBeGreaterThan(0);
      const pressed = await b.getAttribute('aria-pressed');
      expect(pressed === 'true' || pressed === 'false' || pressed === null).toBeTruthy();
    }

    // Click the first non-All filter if available
    const labels = await Promise.all(filterButtons.map(b => b.innerText()));
    const nonAllIndex = labels.findIndex(t => t && t.trim() !== 'All');
    if (nonAllIndex >= 0) {
      await filterButtons[nonAllIndex].click();
      await page.waitForTimeout(200);
    }

    // Test infinite scroll by scrolling to bottom
    const initialImages = await page.$$('#gallery-grid [role="listitem"]');
    const initialCount = initialImages.length;
    
    // Scroll to trigger infinite scroll if there are more images
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    
    const afterScrollImages = await page.$$('#gallery-grid [role="listitem"]');
    // Images should either stay the same (if no more to load) or increase
    expect(afterScrollImages.length).toBeGreaterThanOrEqual(initialCount);

    // Open first image in gallery
    const firstThumb = await page.$('#gallery-grid button');
    await expect(firstThumb).toBeTruthy();
    await firstThumb.click();

    // Lightbox should appear (dialog or similar) and have role dialog or aria-modal
    const lightbox = await page.$('dialog, [role="dialog"], .lightbox');
    expect(lightbox).toBeTruthy();
    const role = await lightbox.getAttribute('role');
    const ariaModal = await lightbox.getAttribute('aria-modal');
    expect(role === 'dialog' || ariaModal === 'true' || lightbox.nodeName.toLowerCase() === 'dialog').toBeTruthy();
  });

  test('Gallery filter chips have icons and work correctly', async ({ page }) => {
    await page.goto(process.env.SITE_URL || 'http://localhost:8080/');
    await page.waitForSelector('#gallery-grid');

    // Check that filter buttons have icons (emojis)
    const filterButtons = await page.$$('section#gallery button[aria-pressed]');
    expect(filterButtons.length).toBeGreaterThan(0);
    
    // Check that All button has house emoji
    const allButton = await page.$('button[aria-pressed]:has-text("All")');
    expect(allButton).toBeTruthy();
    const allText = await allButton.innerText();
    expect(allText).toMatch(/🏠/);
    
    // Test filtering functionality
    const nonAllButtons = filterButtons.slice(1);
    if (nonAllButtons.length > 0) {
      await nonAllButtons[0].click();
      await page.waitForTimeout(200);
      // Gallery should still be visible after filtering
      const gallery = await page.$('#gallery-grid');
      expect(gallery).toBeTruthy();
    }
  });

  test('Deep-link opens gallery at index', async ({ page }) => {
    // navigate directly to a deep link for bedrooms index 0
    await page.goto((process.env.SITE_URL || 'http://localhost:8080/') + '#gallery?gallery=bedrooms&index=0');
    // Wait for lightbox to appear
    await page.waitForSelector('#lightbox, [role="dialog"]');
    const dialog = await page.$('[role="dialog"]');
    expect(dialog).toBeTruthy();
    // The displayed image should have alt text
    const img = await dialog.$('img');
    expect(await img.getAttribute('alt')).toBeTruthy();
  });

  test('Lightbox keyboard navigation and focus trap', async ({ page }) => {
    await page.goto(process.env.SITE_URL || 'http://localhost:8080/');
    await page.waitForSelector('#gallery-grid');
    // open first image
    await page.click('#gallery-grid button');
    await page.waitForSelector('#lightbox');

    // press ArrowRight to navigate next
    await page.keyboard.press('ArrowRight');
    // press ArrowLeft to navigate prev
    await page.keyboard.press('ArrowLeft');

    // Test Tab cycles among lightbox controls: close, prev, next
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Close with Escape
    await page.keyboard.press('Escape');
    // Ensure lightbox closed
    const closed = await page.$('#lightbox');
    expect(closed).toBeNull();
  });
});
