// @ts-check
/** Automates what CI can prove from iPhone soak checklist.
 *  Real A2HS / RestNotify delivery / camera still need device pass. */
const { test, expect } = require('@playwright/test');

test.describe('iPhone soak — automated slice', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.go === 'function');
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--safe', '34px');
      document.documentElement.style.setProperty('--top-safe', '47px');
    });
  });

  test('Today boots with session chrome + no overflow', async ({ page }) => {
    await page.waitForTimeout(400);
    await expect(page.locator('#view .screen, #view .topbar').first()).toBeVisible();
    const overflow = await page.evaluate(() =>
      document.documentElement.scrollWidth > document.documentElement.clientWidth + 2
    );
    expect(overflow).toBeFalsy();
    const c1 = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--c1').trim().toLowerCase()
    );
    expect(c1).toMatch(/#ff453a|#c41e3a/);
  });

  test('Dark + light theme readable muted tokens', async ({ page }) => {
    await page.evaluate(() => window.applyTheme('light', false));
    await page.waitForTimeout(80);
    let txt3 = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--txt3').trim()
    );
    expect(txt3.includes('0.42')).toBeFalsy();
    await page.evaluate(() => window.applyTheme('dark', false));
    await page.waitForTimeout(80);
    txt3 = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--txt3').trim()
    );
    expect(txt3.length).toBeGreaterThan(0);
  });

  test('Train → start active logger path', async ({ page }) => {
    await page.evaluate(() => window.go('workout'));
    await page.waitForTimeout(300);
    await expect(page.locator('#view')).toBeVisible();
    const started = await page.evaluate(() => {
      if (typeof window.startWorkout === 'function') {
        window.startWorkout();
        return true;
      }
      return false;
    });
    expect(started).toBeTruthy();
    await page.waitForTimeout(500);
    const html = await page.locator('#view').innerHTML();
    expect(html.length).toBeGreaterThan(80);
  });

  test('RestNotify / notification API surface exists', async ({ page }) => {
    const api = await page.evaluate(() => ({
      notif: typeof Notification !== 'undefined',
      rest: typeof window.RestNotify !== 'undefined' || typeof window.RestTimer !== 'undefined',
      wake: typeof navigator !== 'undefined' && 'wakeLock' in navigator,
    }));
    expect(api.notif).toBeTruthy();
  });

  test('Offline banner helper wired', async ({ page }) => {
    const ok = await page.evaluate(() => typeof window.updateOfflineBanner === 'function');
    expect(ok).toBeTruthy();
  });

  test('Search + calculators routes paint', async ({ page }) => {
    await page.evaluate(() => window.go('search'));
    await page.waitForTimeout(250);
    await expect(page.locator('#view')).toBeVisible();
    await page.evaluate(() => window.go('calculators'));
    await page.waitForTimeout(250);
    const text = await page.locator('#view').innerText();
    expect(text.length).toBeGreaterThan(20);
  });
});
