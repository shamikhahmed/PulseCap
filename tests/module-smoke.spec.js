// @ts-check
const { test, expect } = require('@playwright/test');

/** Ember survivors must render with zero page errors. */
test.describe('PulseCap per-module smoke', () => {
  test('every registered screen renders without page errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.go === 'function' && typeof window.listScreens === 'function');

    const ids = await page.evaluate(() => window.listScreens());
    expect(ids.length).toBeGreaterThanOrEqual(10);

    const failed = [];
    for (const id of ids) {
      errors.length = 0;
      await page.evaluate((screenId) => { window.go(screenId); }, id);
      await page.waitForFunction((screenId) => {
        const scr = document.querySelector('#view .screen');
        if (!scr) return false;
        const t = (scr.textContent || '').trim();
        if (t === 'Loading…' || t === 'Loading...') return false;
        return !!window.currentScreenId();
      }, id, { timeout: 15000 });
      await page.waitForTimeout(80);
      const fatal = errors.filter(e => !/serviceWorker|ResizeObserver|favicon/i.test(e));
      const hasScreen = await page.locator('#view .screen').count();
      if (fatal.length || !hasScreen) {
        failed.push({ id, fatal, hasScreen });
      }
    }

    expect(failed, JSON.stringify(failed, null, 2)).toEqual([]);
  });

  test('IA aliases resolve to Ember survivors', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.go === 'function');

    const map = await page.evaluate(() => {
      const out = {};
      ['today', 'home', 'train', 'body', 'learn', 'explore', 'me', 'programs'].forEach(function(alias) {
        window.go(alias);
        out[alias] = { title: document.title, id: window.currentScreenId() };
      });
      return out;
    });

    expect(map.today.id).toBe('dashboard');
    expect(map.home.id).toBe('dashboard');
    expect(map.train.id).toBe('workout');
    expect(map.body.id).toBe('progress');
    expect(map.learn.id).toBe('my-plan');
    expect(map.explore.id).toBe('my-plan');
    expect(map.me.id).toBe('settings');
    expect(map.programs.id).toBe('my-plan');
  });

  test('default nav is Today Train Progress Programs Me', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.buildNav === 'function');
    await page.evaluate(() => {
      window.S.set('settings.navMigration', 0);
      window.buildNav();
    });
    const labels = await page.locator('#nav .nb span').allTextContents();
    expect(labels).toEqual(['Today', 'Train', 'Progress', 'Programs', 'Me']);
  });

  test('killed routes alias without loading deprecated modules', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.go === 'function');

    const out = await page.evaluate(() => {
      window.go('calculators');
      const a = window.currentScreenId();
      window.go('bodymap');
      const b = window.currentScreenId();
      window.go('quests');
      const c = window.currentScreenId();
      const deprecatedScript = !!document.querySelector('script[src*="_deprecated"]') ||
        !!document.querySelector('script[data-pc-mod*="calculators"]');
      return { a, b, c, deprecatedScript };
    });

    expect(out.a).toBe('settings');
    expect(out.b).toBe('progress');
    expect(out.c).toBe('dashboard');
    expect(out.deprecatedScript).toBeFalsy();
  });
});
