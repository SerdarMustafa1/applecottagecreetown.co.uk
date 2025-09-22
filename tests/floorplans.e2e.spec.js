const { test, expect } = require('@playwright/test');

test.describe('Floor Plans', () => {
  test('floor plans section exists and displays all plans', async ({ page }) => {
    await page.goto('/');
    
    // Check floor plans section exists
    const floorplansSection = page.locator('#floorplans');
    await expect(floorplansSection).toBeVisible();
    
    // Check section title
    await expect(page.locator('#floorplans h2')).toContainText('Floor Plans');
    
    // Check floor plan cards are present (should be 3: ground, first, 3D)
    const floorplanCards = page.locator('#floorplans .bg-white');
    await expect(floorplanCards).toHaveCount(3);
    
    // Check images load
    const images = page.locator('#floorplans img');
    await expect(images.first()).toBeVisible();
  });

  test('floor plans are clickable and open lightbox', async ({ page }) => {
    await page.goto('/');
    
    // Wait for floor plans to load
    await page.waitForSelector('#floorplans img');
    
    // Click first floor plan
    await page.locator('#floorplans .cursor-pointer').first().click();
    
    // Check lightbox dialog opens
    const lightboxDialog = page.locator('[role="dialog"]');
    await expect(lightboxDialog).toBeVisible();
    
    // Check lightbox image is visible
    const lightboxImage = lightboxDialog.locator('img');
    await expect(lightboxImage).toBeVisible();
    
    // Close lightbox with escape key
    await page.keyboard.press('Escape');
    await expect(lightboxDialog).not.toBeVisible();
  });
});