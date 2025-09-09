const { test, expect } = require('@playwright/test');

test.describe('Floor Plans Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Open the floor plans section
    await page.getByText('Floor Plans & 3D Model').click();
    await page.waitForSelector('#floorplans[open]');
  });

  test.describe('Tab Navigation', () => {
    test('should display floor plan tabs correctly', async ({ page }) => {
      const tabs = page.locator('.floorplan-tab');
      await expect(tabs).toHaveCount(3);
      
      await expect(tabs.nth(0)).toHaveText('Ground Floor');
      await expect(tabs.nth(1)).toHaveText('First Floor');
      await expect(tabs.nth(2)).toHaveText('3D Model');
      
      // Ground floor should be active by default
      await expect(tabs.nth(0)).toHaveClass(/active/);
      await expect(tabs.nth(0)).toHaveAttribute('aria-selected', 'true');
    });

    test('should switch between floor plan tabs', async ({ page }) => {
      const groundFloorTab = page.locator('[data-target="ground-floor"]');
      const firstFloorTab = page.locator('[data-target="first-floor"]');
      const modelTab = page.locator('[data-target="model-3d"]');
      
      const groundFloorPanel = page.locator('#ground-floor-panel');
      const firstFloorPanel = page.locator('#first-floor-panel');
      const modelPanel = page.locator('#model-3d-panel');

      // Test first floor tab
      await firstFloorTab.click();
      await expect(firstFloorTab).toHaveClass(/active/);
      await expect(firstFloorPanel).toBeVisible();
      await expect(groundFloorPanel).not.toBeVisible();
      await expect(modelPanel).not.toBeVisible();

      // Test 3D model tab
      await modelTab.click();
      await expect(modelTab).toHaveClass(/active/);
      await expect(modelPanel).toBeVisible();
      await expect(groundFloorPanel).not.toBeVisible();
      await expect(firstFloorPanel).not.toBeVisible();

      // Test back to ground floor
      await groundFloorTab.click();
      await expect(groundFloorTab).toHaveClass(/active/);
      await expect(groundFloorPanel).toBeVisible();
      await expect(firstFloorPanel).not.toBeVisible();
      await expect(modelPanel).not.toBeVisible();
    });

    test('should support keyboard navigation between tabs', async ({ page }) => {
      const groundFloorTab = page.locator('[data-target="ground-floor"]');
      const firstFloorTab = page.locator('[data-target="first-floor"]');
      const modelTab = page.locator('[data-target="model-3d"]');

      // Focus first tab
      await groundFloorTab.focus();
      
      // Arrow right should move to next tab
      await page.keyboard.press('ArrowRight');
      await expect(firstFloorTab).toBeFocused();
      await expect(firstFloorTab).toHaveClass(/active/);

      // Arrow right again should move to 3D model tab
      await page.keyboard.press('ArrowRight');
      await expect(modelTab).toBeFocused();
      await expect(modelTab).toHaveClass(/active/);

      // Arrow right should wrap to first tab
      await page.keyboard.press('ArrowRight');
      await expect(groundFloorTab).toBeFocused();
      await expect(groundFloorTab).toHaveClass(/active/);

      // Arrow left should move to last tab
      await page.keyboard.press('ArrowLeft');
      await expect(modelTab).toBeFocused();
      await expect(modelTab).toHaveClass(/active/);
    });
  });

  test.describe('Format Toggle', () => {
    test('should display format toggle buttons', async ({ page }) => {
      const formatButtons = page.locator('.format-btn');
      await expect(formatButtons.first()).toHaveText('Vector (SVG)');
      await expect(formatButtons.nth(1)).toHaveText('Image (PNG)');
      
      // SVG should be active by default
      await expect(formatButtons.first()).toHaveClass(/active/);
      await expect(formatButtons.first()).toHaveAttribute('aria-pressed', 'true');
    });

    test('should switch between SVG and PNG formats', async ({ page }) => {
      const svgButton = page.locator('[data-format="svg"]').first();
      const pngButton = page.locator('[data-format="png"]').first();
      
      const svgImage = page.locator('[data-format="svg"].floorplan-image').first();
      const pngImage = page.locator('[data-format="png"].floorplan-image').first();

      // Initially SVG should be active
      await expect(svgButton).toHaveClass(/active/);
      await expect(svgImage).toBeVisible();
      await expect(pngImage).not.toBeVisible();

      // Click PNG button
      await pngButton.click();
      await expect(pngButton).toHaveClass(/active/);
      await expect(svgButton).not.toHaveClass(/active/);
      await expect(pngImage).toBeVisible();
      await expect(svgImage).not.toBeVisible();

      // Click SVG button
      await svgButton.click();
      await expect(svgButton).toHaveClass(/active/);
      await expect(pngButton).not.toHaveClass(/active/);
      await expect(svgImage).toBeVisible();
      await expect(pngImage).not.toBeVisible();
    });

    test('should maintain format selection when switching tabs', async ({ page }) => {
      const firstFloorTab = page.locator('[data-target="first-floor"]');
      
      // Change ground floor to PNG
      await page.locator('#ground-floor-panel [data-format="png"]').click();
      
      // Switch to first floor
      await firstFloorTab.click();
      
      // First floor should still default to SVG
      await expect(page.locator('#first-floor-panel [data-format="svg"]')).toHaveClass(/active/);
      
      // Switch back to ground floor
      await page.locator('[data-target="ground-floor"]').click();
      
      // Ground floor should remember PNG selection
      await expect(page.locator('#ground-floor-panel [data-format="png"]')).toHaveClass(/active/);
    });
  });

  test.describe('Download Functionality', () => {
    test('should display download buttons', async ({ page }) => {
      const downloadButtons = page.locator('.download-btn');
      await expect(downloadButtons).toHaveCount(3); // 2 individual plans + 1 complete pack
      
      await expect(page.locator('[data-plan="ground-floor"]')).toContainText('Download');
      await expect(page.locator('[data-plan="first-floor"]')).toContainText('Download');
      await expect(page.locator('[data-plan="complete"]')).toContainText('Download Complete Plan Pack');
    });

    test('should trigger downloads when clicked', async ({ page }) => {
      // Monitor download events
      const downloadPromise = page.waitForEvent('download');
      
      // Click ground floor download
      await page.locator('[data-plan="ground-floor"]').click();
      
      // Wait for download to start
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toMatch(/Apple-Cottage.*Ground.*Floor.*Plan\.(svg|png)/);
    });

    test('should show loading state during download', async ({ page }) => {
      const downloadButton = page.locator('[data-plan="ground-floor"]');
      const originalText = await downloadButton.textContent();
      
      // Click download
      await downloadButton.click();
      
      // Should show loading state
      await expect(downloadButton).toContainText('Preparing...');
      await expect(downloadButton).toBeDisabled();
      
      // Should restore original state
      await expect(downloadButton).toContainText(originalText.trim(), { timeout: 3000 });
      await expect(downloadButton).toBeEnabled();
    });

    test('should respect format selection for downloads', async ({ page }) => {
      // Change to PNG format
      await page.locator('[data-format="png"]').first().click();
      
      // Monitor download
      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-plan="ground-floor"]').click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('.png');
    });

    test('should download complete plan pack', async ({ page }) => {
      const downloadPromise = page.waitForEvent('download');
      
      await page.locator('[data-plan="complete"]').click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain('Apple-Cottage-Floor-Plans-Complete.pdf');
    });
  });

  test.describe('3D Model Viewer', () => {
    test('should display 3D model tab and viewer', async ({ page }) => {
      await page.locator('[data-target="model-3d"]').click();
      
      const modelViewer = page.locator('model-viewer#cottage-model');
      await expect(modelViewer).toBeVisible();
      
      // Check model attributes
      await expect(modelViewer).toHaveAttribute('src', 'https://d1t6lpjdsu4646.cloudfront.net/models/apple-cottage.usdz');
      await expect(modelViewer).toHaveAttribute('poster', 'https://d1t6lpjdsu4646.cloudfront.net/models/poster.jpg');
      await expect(modelViewer).toHaveAttribute('camera-controls');
      await expect(modelViewer).toHaveAttribute('auto-rotate');
      await expect(modelViewer).toHaveAttribute('ar');
    });

    test('should display AR notice and instructions', async ({ page }) => {
      await page.locator('[data-target="model-3d"]').click();
      
      await expect(page.locator('.ar-notice')).toContainText('AR available on iOS Safari');
      
      const modelInfo = page.locator('.model-info');
      await expect(modelInfo).toContainText('3D Model Controls:');
      await expect(modelInfo).toContainText('Rotate: Click and drag');
      await expect(modelInfo).toContainText('AR Compatibility:');
      await expect(modelInfo).toContainText('iOS: iPhone/iPad with iOS 12+');
    });

    test('should display AR button on compatible devices', async ({ page }) => {
      await page.locator('[data-target="model-3d"]').click();
      
      // AR button should be present in the model viewer
      const arButton = page.locator('.ar-button');
      await expect(arButton).toContainText('View in AR');
    });

    test('should handle model loading states', async ({ page }) => {
      await page.locator('[data-target="model-3d"]').click();
      
      const modelViewer = page.locator('model-viewer#cottage-model');
      
      // Check for loading indicator
      const loadingIndicator = page.locator('.model-loading');
      await expect(loadingIndicator).toContainText('Loading 3D model...');
    });
  });

  test.describe('Room Information', () => {
    test('should display ground floor room list', async ({ page }) => {
      const roomList = page.locator('#ground-floor-panel .room-list ul');
      
      await expect(roomList).toContainText('Kitchen');
      await expect(roomList).toContainText('Modern fitted kitchen');
      await expect(roomList).toContainText('Lounge');
      await expect(roomList).toContainText('Spacious living area');
      await expect(roomList).toContainText('Conservatory');
      await expect(roomList).toContainText('Bathroom');
      await expect(roomList).toContainText('Utility Room');
      await expect(roomList).toContainText('Hallway');
    });

    test('should display first floor room list', async ({ page }) => {
      await page.locator('[data-target="first-floor"]').click();
      
      const roomList = page.locator('#first-floor-panel .room-list ul');
      
      await expect(roomList).toContainText('Front Bedroom');
      await expect(roomList).toContainText('Double bedroom with street view');
      await expect(roomList).toContainText('Rear Bedroom');
      await expect(roomList).toContainText('Double bedroom with garden view');
      await expect(roomList).toContainText('Landing');
      await expect(roomList).toContainText('Approved Extension');
      await expect(roomList).toContainText('Planning permission granted');
    });
  });

  test.describe('Complete Plan Pack Section', () => {
    test('should display plan pack information', async ({ page }) => {
      const planPack = page.locator('.plan-pack-section');
      
      await expect(planPack).toContainText('Complete Plan Pack');
      await expect(planPack).toContainText('Download the complete architectural drawings');
      
      const features = page.locator('.plan-pack-features ul');
      await expect(features).toContainText('Both floor plans (SVG & PNG formats)');
      await expect(features).toContainText('Approved extension drawings');
      await expect(features).toContainText('Planning permission documents');
      await expect(features).toContainText('Building warrant details');
      await expect(features).toContainText('Technical specifications');
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Floor plan section should be responsive
      const floorPlanTabs = page.locator('.floorplan-tabs');
      await expect(floorPlanTabs).toBeVisible();
      
      // Tabs should be scrollable on small screens
      const tabs = page.locator('.floorplan-tab');
      await expect(tabs).toHaveCount(3);
      
      // Controls should stack vertically
      const controls = page.locator('.floorplan-controls');
      await expect(controls).toBeVisible();
    });

    test('should maintain functionality on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      // Test tab switching
      await page.locator('[data-target="first-floor"]').click();
      await expect(page.locator('#first-floor-panel')).toBeVisible();
      
      // Test format toggle
      await page.locator('[data-format="png"]').first().click();
      await expect(page.locator('[data-format="png"]').first()).toHaveClass(/active/);
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA attributes', async ({ page }) => {
      const tabs = page.locator('.floorplan-tab');
      const panels = page.locator('.floorplan-panel');
      
      // Check tab roles and attributes
      for (let i = 0; i < await tabs.count(); i++) {
        const tab = tabs.nth(i);
        await expect(tab).toHaveAttribute('role', 'tab');
        await expect(tab).toHaveAttribute('aria-controls');
      }
      
      // Check panel roles and attributes
      for (let i = 0; i < await panels.count(); i++) {
        const panel = panels.nth(i);
        await expect(panel).toHaveAttribute('role', 'tabpanel');
        await expect(panel).toHaveAttribute('aria-labelledby');
      }
    });

    test('should support screen readers', async ({ page }) => {
      // Check for proper headings
      await expect(page.locator('h3')).toContainText(['Ground Floor Plan', 'First Floor Plan', '3D Model & AR View']);
      
      // Check for descriptive alt text
      const floorPlanImages = page.locator('.floorplan-image');
      for (let i = 0; i < await floorPlanImages.count(); i++) {
        const img = floorPlanImages.nth(i);
        const altText = await img.getAttribute('alt');
        expect(altText).toBeTruthy();
        expect(altText.length).toBeGreaterThan(10);
      }
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Tab navigation should work
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Should be able to navigate tabs with arrow keys
      const firstTab = page.locator('[data-target="ground-floor"]');
      await firstTab.focus();
      await page.keyboard.press('ArrowRight');
      
      const secondTab = page.locator('[data-target="first-floor"]');
      await expect(secondTab).toBeFocused();
    });

    test('should support focus management', async ({ page }) => {
      // When switching tabs, focus should move to the panel
      await page.locator('[data-target="first-floor"]').click();
      
      const firstFloorPanel = page.locator('#first-floor-panel');
      await expect(firstFloorPanel).toBeFocused();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle missing images gracefully', async ({ page }) => {
      // Intercept image requests and return 404
      await page.route('**/floorplans/ground-floor.svg', route => {
        route.fulfill({
          status: 404,
          contentType: 'text/html',
          body: 'Not Found'
        });
      });
      
      await page.reload();
      await page.getByText('Floor Plans & 3D Model').click();
      
      // Should show error message
      await expect(page.locator('.floorplan-error')).toContainText('Floor plan unavailable');
      await expect(page.locator('.floorplan-error button')).toContainText('Refresh Page');
    });

    test('should handle 3D model loading errors', async ({ page }) => {
      // Intercept model file and return 404
      await page.route('**/models/apple-cottage.usdz', route => {
        route.fulfill({
          status: 404,
          contentType: 'text/html',
          body: 'Not Found'
        });
      });
      
      await page.locator('[data-target="model-3d"]').click();
      
      // Should show fallback content
      const fallback = page.locator('.model-fallback');
      await expect(fallback).toContainText('3D model viewer not supported');
    });
  });

  test.describe('Performance', () => {
    test('should load floor plan images efficiently', async ({ page }) => {
      // Images should be lazy loaded
      const lazyImages = page.locator('.floorplan-image[loading="lazy"]');
      await expect(lazyImages.first()).toHaveAttribute('loading', 'lazy');
    });

    test('should not load all panels immediately', async ({ page }) => {
      // Only ground floor panel should be visible initially
      await expect(page.locator('#ground-floor-panel')).toBeVisible();
      await expect(page.locator('#first-floor-panel')).not.toBeVisible();
      await expect(page.locator('#model-3d-panel')).not.toBeVisible();
    });
  });
});
