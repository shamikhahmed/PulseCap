// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('v6 Coach Kernel', () => {
  test('kernel + foods + food engine online after demo boot', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForFunction(() => window.S && window.S.activeId && window.S.activeId() === 'demo', undefined, { timeout: 30000 });
    await page.waitForTimeout(400);

    const ok = await page.evaluate(() => {
      const need = ['CoachKernel', 'AutoregEngine', 'VolumeLander', 'JointBudget', 'MesocycleEngine', 'PushPullEngine', 'FoodEngine', 'GymFloor'];
      const missing = need.filter((n) => typeof window[n] === 'undefined');
      const snap = window.CoachKernel.snapshot();
      const one = window.CoachKernel.oneThing();
      const foods = window.FoodEngine.search('chick');
      return {
        missing,
        hasReadiness: typeof snap.readiness === 'number',
        oneTitle: !!(one && one.title),
        foodHits: foods.length > 0,
        mesoWeek: window.MesocycleEngine.weekIndex() >= 1
      };
    });
    expect(ok.missing, 'missing globals: ' + ok.missing.join(',')).toEqual([]);
    expect(ok.hasReadiness).toBeTruthy();
    expect(ok.oneTitle).toBeTruthy();
    expect(ok.foodHits).toBeTruthy();
    expect(ok.mesoWeek).toBeTruthy();

    await page.evaluate(() => window.go('dashboard'));
    await page.waitForTimeout(200);
    const insight = await page.evaluate(() => {
      const one = window.CoachKernel && window.CoachKernel.oneThing && window.CoachKernel.oneThing();
      return !!(one && one.title);
    });
    expect(insight).toBeTruthy();
  });
});
