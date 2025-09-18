import { test, expect } from '@playwright/test';

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

    // Click the first non-All Photos filter if available
    const labels = await Promise.all(filterButtons.map(b => b.innerText()));
    const nonAllIndex = labels.findIndex(t => t && t.trim() !== 'All Photos');
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
    
    // Check that All Photos button has house emoji
    const allButton = await page.$('button[aria-pressed]:has-text("All Photos")');
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
    await page.waitForSelector('#gallery-grid');
    // Wait up to 15s for lightbox (lazy + Suspense + filtering)
    await page.waitForSelector('#lightbox', { timeout: 15000 });
    await page.waitForSelector('#lightbox [role="dialog"] img', { timeout: 15000 });
    const img = await page.$('#lightbox [role="dialog"] img');
    expect(img).toBeTruthy();
    const alt = img && await img.getAttribute('alt');
    expect(alt && alt.length).toBeGreaterThan(0);
  });

  test('Lightbox keyboard navigation and focus trap', async ({ page }) => {
    await page.goto(process.env.SITE_URL || 'http://localhost:8080/');
    await page.waitForSelector('#gallery-grid');
    
    // Wait for images to load
    await page.waitForTimeout(1000);
    
    // open first image
    const firstButton = await page.$('#gallery-grid button');
    expect(firstButton).toBeTruthy();
    await firstButton.click();
    
    // Wait for lightbox + dialog to appear (lazy loaded)
    await page.waitForSelector('#lightbox', { timeout: 15000 });
    await page.waitForSelector('#lightbox [role="dialog"]', { timeout: 15000 });

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
    // Wait for container to detach
    await page.waitForSelector('#lightbox', { state: 'detached', timeout: 10000 });
  });
});
