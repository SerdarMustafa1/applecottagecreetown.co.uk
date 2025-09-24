const { test, expect } = require('@playwright/test');
const { playAudit } = require('playwright-lighthouse');

test.describe('Hero Section Lighthouse Performance', () => {
  test('hero section meets Lighthouse performance standards', async ({ page }) => {
    // Navigate to the page
    await page.goto('/');
    
    // Wait for hero section to load
    await page.waitForSelector('#hero');
    
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Run Lighthouse audit
    await playAudit({
      page,
      thresholds: {
        performance: 90,
        accessibility: 95,
        'best-practices': 90,
        seo: 95,
      },
      port: 9222,
    });
  });

  test('hero images have proper loading attributes', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#hero img');
    
    const images = await page.$$('#hero img');
    
    // First image should have eager loading
    const firstImageLoading = await images[0].getAttribute('loading');
    const firstImageFetchPriority = await images[0].getAttribute('fetchpriority');
    
    expect(firstImageLoading).toBe('eager');
    expect(firstImageFetchPriority).toBe('high');
    
    // Other images should have lazy loading
    if (images.length > 1) {
      for (let i = 1; i < images.length; i++) {
        const loading = await images[i].getAttribute('loading');
        const fetchPriority = await images[i].getAttribute('fetchpriority');
        
        expect(loading).toBe('lazy');
        expect(fetchPriority).toBe('low');
      }
    }
  });

  test('hero section has proper semantic structure', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading hierarchy
    const h1 = await page.$('#hero h1');
    expect(h1).toBeTruthy();
    
    // Check for proper ARIA attributes
    const overlay = await page.$('#hero [aria-hidden="true"]');
    expect(overlay).toBeTruthy();
    
    // Check for proper link attributes
    const links = await page.$$('#hero a[target="_blank"]');
    for (const link of links) {
      const rel = await link.getAttribute('rel');
      expect(rel).toContain('noopener');
    }
  });

  test('hero images alternate correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#hero img');
    
    const images = await page.$$('#hero img');
    
    if (images.length > 1) {
      // Check initial state
      const firstImageOpacity = await page.evaluate(() => {
        const img = document.querySelector('#hero img');
        return window.getComputedStyle(img.parentElement).opacity;
      });
      expect(firstImageOpacity).toBe('1');
      
      // Wait for transition and check second image
      await page.waitForTimeout(6000); // Wait for one cycle + transition
      
      const secondImageOpacity = await page.evaluate(() => {
        const images = document.querySelectorAll('#hero img');
        return window.getComputedStyle(images[1].parentElement).opacity;
      });
      expect(secondImageOpacity).toBe('1');
    }
  });

  test('hero section is accessible', async ({ page }) => {
    await page.goto('/');
    
    // Check for keyboard navigation
    await page.keyboard.press('Tab');
    const focusedElement = await page.evaluate(() => document.activeElement.tagName);
    expect(['A', 'BUTTON']).toContain(focusedElement);
    
    // Check for proper contrast (buttons should be visible)
    const ctaButton = await page.$('#hero a[href="#book-viewing"]');
    expect(ctaButton).toBeTruthy();
    
    const buttonStyles = await page.evaluate((btn) => {
      const styles = window.getComputedStyle(btn);
      return {
        backgroundColor: styles.backgroundColor,
        color: styles.color
      };
    }, ctaButton);
    
    // Blue button should have good contrast
    expect(buttonStyles.backgroundColor).toContain('rgb');
    expect(buttonStyles.color).toContain('rgb');
  });
});
