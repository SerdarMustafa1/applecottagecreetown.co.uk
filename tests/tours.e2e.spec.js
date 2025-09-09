const { test, expect } = require('@playwright/test');

const SITE_URL = process.env.SITE_URL;
const MEDIA_BASE_URL = process.env.MEDIA_BASE_URL;

test.describe('360° Tours playback', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!SITE_URL, 'SITE_URL not set');
    await page.goto(SITE_URL + '#tours360');
    
    // Handle cookie consent banner if it appears
    const acceptAllButton = page.locator('#silktide-banner .accept-all');
    if (await acceptAllButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await acceptAllButton.click();
      // Wait for banner to disappear
      await page.waitForSelector('#silktide-banner', { state: 'hidden', timeout: 3000 }).catch(() => {});
    }
    
    // Ensure section opens (the app auto-opens via script as well)
    await page.waitForSelector('#tours360', { state: 'attached' });
  });

  async function playViewer(viewer) {
    const playBtn = viewer.locator('.vr-play');
    await playBtn.scrollIntoViewIfNeeded();
    await expect(playBtn).toBeVisible();
    await playBtn.click();
    const video = viewer.locator('video#' + (await playBtn.getAttribute('data-target')));
    const flat = viewer.locator('video.flat-video');
    // Wait for either sphere video to start or flat fallback to show
    await video.evaluate(v => v && v.load && v.load());
    const started = await viewer.page().waitForFunction(() => {
      const v = document.querySelector('video#' + document.activeElement?.getAttribute?.('data-target'));
      return v && (v.readyState >= 2);
    }, null, { timeout: 8000 }).catch(() => null);
    // Check time progression on either video
    const okSphere = await video.evaluate(async v => {
      if (!v) return false; try { v.play(); } catch(_) {}
      return await new Promise(res => {
        const start = v.currentTime || 0; const t = setTimeout(() => res(false), 8000);
        const tick = () => { if ((v.currentTime||0) > start + 0.5) { clearTimeout(t); res(true); } else requestAnimationFrame(tick); };
        tick();
      });
    }).catch(() => false);
    if (okSphere) return true;
    // fallback: flat player
    await flat.evaluate(f => { if (f) try { f.load(); f.play(); } catch(_) {} });
    const okFlat = await viewer.page().waitForFunction(() => {
      const f = document.querySelector('video.flat-video');
      return f && f.currentTime > 0.5;
    }, null, { timeout: 8000 }).catch(() => null);
    return !!okFlat;
  }

  test(SITE_URL ? 'each 360 viewer plays (sphere or flat fallback)' : 'skipped', async ({ page }) => {
    test.skip(!SITE_URL, 'SITE_URL not set');
    const viewers = page.locator('#tours360 .vr-viewer');
    const count = await viewers.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const viewer = viewers.nth(i);
      const ok = await playViewer(viewer);
      expect(ok, `viewer ${i+1} should play`).toBeTruthy();
      // Check default speed control shows 0.75×
      const sel = viewer.locator('select.vr-speed');
      await expect(sel).toHaveValue('0.75');
    }
  });
});

