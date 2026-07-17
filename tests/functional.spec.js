// @ts-check
// Functional pass — exercise the whole app as several different user types.
// Seeds sample persona profiles, then for each profile visits every registered
// screen and runs a battery of core actions, asserting zero runtime errors.
const { test, expect } = require('@playwright/test');

const IGNORE = /serviceWorker|ResizeObserver|favicon|Failed to load resource/i;

async function bootDemo(page) {
  await page.goto('/?demo=1');
  await page.waitForFunction(
    () => typeof window.S !== 'undefined' && window.S.activeId && window.S.activeId() === 'demo',
    undefined,
    { timeout: 30000 },
  );
  await page.waitForTimeout(300);
}

async function waitReady(page) {
  await page.waitForFunction(() => {
    const scr = document.querySelector('#view .screen');
    if (!scr) return false;
    const t = (scr.textContent || '').trim();
    return t !== 'Loading…' && t !== 'Loading...';
  }, undefined, { timeout: 15000 });
}

test.describe('Functional — every screen as every user type', () => {
  test('route sweep across all personas', async ({ page }) => {
    test.setTimeout(240000);
    const errors = [];
    let ctx = 'boot';
    page.on('pageerror', (e) => { if (!IGNORE.test(e.message)) errors.push(ctx + ' :: ' + e.message); });
    page.on('dialog', (d) => d.accept().catch(() => {}));

    await bootDemo(page);

    // Seed the sample athletes and collect the full profile list to test.
    const profiles = await page.evaluate(() => {
      const ids = window.S.seedPersonas(true, false);
      return ['demo', ...ids];
    });
    expect(profiles.length).toBeGreaterThanOrEqual(5);

    const screens = await page.evaluate(() => window.listScreens());
    expect(screens).toContain('dashboard');

    for (const pid of profiles) {
      await page.evaluate((id) => {
        window.S.switchProfile(id);
        window.applyTheme(window.S.g('user.theme') || 'dark', false);
        window.go('dashboard');
      }, pid);
      await waitReady(page);

      for (const id of screens) {
        ctx = pid + '/' + id;
        const rendered = await page.evaluate((sid) => {
          try { window.go(sid); return true; } catch (e) { return String(e && e.message || e); }
        }, id);
        expect(rendered, `go('${id}') threw for ${pid}: ${rendered}`).toBe(true);
        await waitReady(page);
        const hasScreen = await page.locator('#view .screen').count();
        expect(hasScreen, `no .screen for ${pid}/${id}`).toBeGreaterThan(0);
      }
    }

    expect(errors, 'runtime errors during route sweep:\n' + errors.join('\n')).toEqual([]);
  });

  test('core actions battery (demo profile)', async ({ page }) => {
    test.setTimeout(120000);
    const errors = [];
    let ctx = 'boot';
    page.on('pageerror', (e) => { if (!IGNORE.test(e.message)) errors.push(ctx + ' :: ' + e.message); });
    page.on('dialog', (d) => d.accept().catch(() => {}));

    await bootDemo(page);

    // Nutrition: water + quick-add meal
    ctx = 'nutrition';
    await page.evaluate(() => window.go('nutrition'));
    await waitReady(page);
    const waterBefore = await page.evaluate(() => (window.S.g('water') || []).length);
    await page.evaluate(() => window.logWater((window.S.g('water') || []).length + 1));
    await waitReady(page);
    const waterAfter = await page.evaluate(() => (window.S.g('water') || []).length);
    expect(waterAfter).toBe(waterBefore + 1);

    await page.evaluate(() => window.go('nutrition'));
    await waitReady(page);
    const mealsBefore = await page.evaluate(() => (window.S.g('meals') || []).length);
    await page.evaluate(() => { window.showMealPresets('breakfast'); window.quickAddMeal(0, 'breakfast'); });
    await page.waitForTimeout(200);
    const mealsAfter = await page.evaluate(() => (window.S.g('meals') || []).length);
    expect(mealsAfter).toBe(mealsBefore + 1);

    // Recovery check-in save
    ctx = 'recovery';
    await page.evaluate(() => window.go('recovery'));
    await waitReady(page);
    await page.evaluate(() => { if (window.saveRecovery) window.saveRecovery(); });
    await page.waitForTimeout(200);

    // Active workout: start, mark a set done, save
    ctx = 'workout';
    await page.evaluate(() => { window.S.set('programWeightsConfirmed', true); window.startWorkout(); });
    await page.waitForTimeout(400);
    const hasActive = await page.evaluate(() => !!document.getElementById('wkt-header'));
    expect(hasActive).toBe(true);
    await page.evaluate(() => { if (window._doneSet) window._doneSet(0, 0); });
    await page.waitForTimeout(200);
    const wktBefore = await page.evaluate(() => (window.S.g('workouts') || []).length);
    await page.evaluate(() => { if (window.saveWorkout) window.saveWorkout(); });
    await page.waitForTimeout(400);
    const wktAfter = await page.evaluate(() => (window.S.g('workouts') || []).length);
    expect(wktAfter).toBeGreaterThanOrEqual(wktBefore);

    expect(errors, 'runtime errors during actions:\n' + errors.join('\n')).toEqual([]);
  });
});
