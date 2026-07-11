// @ts-check
const { test, expect } = require('@playwright/test');

/** Every registered module must render with zero page errors (P2). */
test.describe('PulseCap per-module smoke', () => {
  test('every registered screen renders without page errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));

    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.go === 'function' && typeof window.listScreens === 'function');

    const ids = await page.evaluate(() => window.listScreens());
    expect(ids.length).toBeGreaterThanOrEqual(30);

    const failed = [];
    for (const id of ids) {
      errors.length = 0;
      await page.evaluate((screenId) => {
        try {
          window.go(screenId);
        } catch (e) {
          throw e;
        }
      }, id);
      await page.waitForTimeout(120);
      const fatal = errors.filter(e => !/serviceWorker|ResizeObserver|favicon/i.test(e));
      const hasScreen = await page.locator('#view .screen').count();
      if (fatal.length || !hasScreen) {
        failed.push({ id, fatal, hasScreen });
      }
    }

    expect(failed, JSON.stringify(failed, null, 2)).toEqual([]);
  });

  test('IA aliases resolve to canonical screens', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.go === 'function');

    const map = await page.evaluate(() => {
      const out = {};
      ['today', 'home', 'train', 'body', 'learn', 'explore', 'me'].forEach(function(alias) {
        window.go(alias);
        out[alias] = document.title;
      });
      return out;
    });

    expect(map.today).toMatch(/Dashboard/i);
    expect(map.home).toMatch(/Dashboard/i);
    expect(map.train).toMatch(/Workout/i);
    expect(map.body).toMatch(/Bodymap|Body/i);
    expect(map.learn).toMatch(/Hub/i);
    expect(map.explore).toMatch(/Hub/i);
    expect(map.me).toMatch(/Settings/i);
  });

  test('default nav is Today Train Body Learn Me', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.buildNav === 'function');
    await page.evaluate(() => {
      window.S.set('settings.navMigration', 0);
      window.buildNav();
    });
    const labels = await page.locator('#nav .nb span').allTextContents();
    expect(labels).toEqual(['Today', 'Train', 'Body', 'Learn', 'Me']);
  });

  test('physique merge aliases + migration idempotent', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.go === 'function' && typeof window.migratePhysiqueMerge === 'function');

    const titles = await page.evaluate(() => {
      window.go('physique-archetype');
      const a = document.title;
      window.go('physique-timeline');
      const b = document.title;
      window.go('physique', { tab: 'score' });
      const c = document.querySelector('.topbar-title') && document.querySelector('.topbar-title').textContent;
      const first = window.migratePhysiqueMerge();
      const second = window.migratePhysiqueMerge();
      return { a, b, c, first, second, flag: window.S.g('settings.migrations.physiqueMerge') };
    });

    expect(titles.a).toMatch(/Physique/i);
    expect(titles.b).toMatch(/Physique/i);
    expect(titles.c).toMatch(/Physique/i);
    expect(titles.flag).toBe(1);
    expect(titles.second).toBe(false);
  });
});
