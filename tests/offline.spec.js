'use strict';
const { test, expect } = require('@playwright/test');

test.describe('Offline + update', () => {
  test('offline banner shows when navigator.onLine is false', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.updateOfflineBanner === 'function' || document.getElementById('offline-banner'));
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
      window.dispatchEvent(new Event('offline'));
      if (typeof updateOfflineBanner === 'function') updateOfflineBanner();
    });
    const banner = page.locator('#offline-banner');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(/offline/i);

    await page.evaluate(() => {
      Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => true });
      window.dispatchEvent(new Event('online'));
      if (typeof updateOfflineBanner === 'function') updateOfflineBanner();
    });
    await expect(banner).toBeHidden();
  });

  test('core navigation works while network aborted (cached scripts in page)', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.go === 'function');
    // Abort further network after boot — shell already in memory
    await page.route('**/*', (route) => {
      const t = route.request().resourceType();
      if (t === 'document') return route.continue();
      return route.abort();
    });
    for (const id of ['workout', 'progress', 'my-plan', 'settings', 'dashboard']) {
      await page.evaluate((s) => window.go(s), id);
      await page.waitForTimeout(50);
      const html = await page.locator('#view').innerHTML();
      expect(html.length).toBeGreaterThan(40);
      expect(html).not.toMatch(/Screen error/i);
    }
  });

  test('SW cache name matches VERSION.json', async ({ page }) => {
    const ver = require('../VERSION.json');
    const sw = await page.request.get('/sw.js');
    const text = await sw.text();
    expect(text).toContain(ver.swCache);
    expect(ver.version).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('APP_VERSION matches VERSION.json', async ({ page }) => {
    const ver = require('../VERSION.json');
    await page.goto('/');
    await page.waitForFunction(() => typeof window.APP_VERSION === 'string');
    const appV = await page.evaluate(() => window.APP_VERSION);
    expect(appV).toBe(ver.version);
  });

  test('airplane-mode: log a set then view Progress', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => typeof window.introQuickStart === 'function' && typeof window.startWorkout === 'function');
    await page.evaluate(() => window.introQuickStart());
    await page.waitForFunction(() => document.querySelector('.dash-session'));
    await page.route('**/*', (route) => {
      const t = route.request().resourceType();
      if (t === 'document') return route.continue();
      return route.abort();
    });
    const out = await page.evaluate(() => {
      const before = (window.S.g('workouts') || []).length;
      window.S.set('programWeightsConfirmed', true);
      window.startWorkout();
      window._doneSet(0, 0);
      window.confirmFinishWorkout();
      const save = Array.from(document.querySelectorAll('button')).find(function(b) {
        return /SAVE WORKOUT/i.test(b.textContent || '');
      });
      if (save) save.click();
      window.go('progress');
      const html = document.getElementById('view') ? document.getElementById('view').innerHTML : '';
      return {
        before: before,
        after: (window.S.g('workouts') || []).length,
        progress: html.length,
        error: /Screen error/i.test(html),
        hasChart: /This lift vs itself|No workouts yet|Training Block/i.test(html)
      };
    });
    expect(out.after).toBeGreaterThan(out.before);
    expect(out.error).toBeFalsy();
    expect(out.hasChart).toBeTruthy();
  });
});
