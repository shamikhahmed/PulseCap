// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('PulseCap smoke', () => {
  test('loads shell without fatal errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(800);
    const fatal = errors.filter(e => !/serviceWorker|ResizeObserver|favicon/i.test(e));
    expect(fatal).toEqual([]);
  });

  test('manifest link present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  });

  test('demo mode has nutrition and active quest data', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.S !== 'undefined' && window.S.activeId && window.S.activeId() === 'demo');
    await page.waitForTimeout(400);
    const demo = await page.evaluate(() => {
      const meals = window.S.g('meals') || [];
      const today = new Date().toISOString().slice(0, 10);
      const todayMeals = meals.filter(m => m.date === today);
      const quests = window.S.g('activeQuests') || [];
      return { todayMeals: todayMeals.length, activeQuests: quests.length };
    });
    expect(demo.todayMeals).toBeGreaterThan(0);
    expect(demo.activeQuests).toBeGreaterThan(0);
  });

  test('navigates to workout screen without JS errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.go === 'function');
    await page.evaluate(() => window.go('workout'));
    await page.waitForTimeout(600);
    await expect(page.locator('#view .screen')).toBeVisible();
    const fatal = errors.filter(e => !/serviceWorker|ResizeObserver|favicon/i.test(e));
    expect(fatal).toEqual([]);
  });

  test('progress screen shows periodization block in demo mode', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.go === 'function');
    await page.evaluate(() => window.go('progress'));
    await page.waitForTimeout(600);
    await expect(page.getByText('Training Block')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Week \d+ ·/)).toBeVisible();
  });

  test('home quick start invokes active workout in demo mode', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.startWorkout === 'function');
    await page.evaluate(() => window.startWorkout());
    await page.waitForTimeout(800);
    await expect(page.getByText(/Log sets|Active Workout|Finish/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('progress empty state shows start CTA without workouts', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.go === 'function');
    await page.evaluate(() => {
      window.S.set('workouts', []);
      window.go('progress');
    });
    await page.waitForTimeout(600);
    await expect(page.getByText('No workouts yet')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.cap-empty').getByRole('button', { name: /Start Workout/i })).toBeVisible();
  });
});
