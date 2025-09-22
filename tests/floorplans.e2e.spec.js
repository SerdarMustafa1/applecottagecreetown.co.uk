const { test, expect } = require('@playwright/test');

test.describe('Floor Plans', () => {
  test('floor plans section exists and displays all plans', async ({ page }) => {
    await page.goto('/');
    
    // Check floor plans section exists
    const floorplansSection = page.locator('#floorplans');
    await expect(floorplansSection).toBeVisible();
    
    // Check section title
    await expect(page.locator('#floorplans h2')).toContainText('Floor Plans');
    
    // Check floor plan cards are present (should be 3: house, annex, 3d model)
    const floorplanCards = page.locator('#floorplans .bg-white');
    await expect(floorplanCards).toHaveCount(3);
    
    // Check images load with valid src
    const images = page.locator('#floorplans img');
    await expect(images.first()).toBeVisible();
    
    // Verify image sources are not empty
    const firstImgSrc = await images.first().getAttribute('src');
    expect(firstImgSrc).toBeTruthy();
    expect(firstImgSrc).not.toBe('');
  });

  test('floor plans are clickable and open lightbox', async ({ page }) => {
    await page.goto('/');
    
    // Wait for floor plans to load
    await page.waitForSelector('#floorplans img', { timeout: 10000 });
    
    // Click first floor plan card
    await page.locator('#floorplans .cursor-pointer').first().click();
    
    // Check lightbox dialog opens
    const lightboxDialog = page.locator('[role="dialog"]');
    await expect(lightboxDialog).toBeVisible({ timeout: 5000 });
    
    // Check lightbox image is visible
    const lightboxImage = lightboxDialog.locator('img');
    await expect(lightboxImage).toBeVisible();
    
    // Close lightbox with escape key
    await page.keyboard.press('Escape');
    await expect(lightboxDialog).not.toBeVisible();
  });
});