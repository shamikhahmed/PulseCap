// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Ember spine (Phase 2)', () => {
  test('export → wipe → import restores workouts', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForFunction(() => window.Profile && window.S && window.S.activeId && window.S.activeId() === 'demo');
    const out = await page.evaluate(() => {
      const before = (window.S.g('workouts') || []).length;
      const json = window.Profile.exportJSON();
      window.Profile.wipeProfile();
      const wiped = (window.S.g('workouts') || []).length;
      window.Profile.importObject(JSON.parse(json));
      return {
        before: before,
        wiped: wiped,
        restored: (window.S.g('workouts') || []).length,
        schema: window.S.d._schemaVersion
      };
    });
    expect(out.before).toBeGreaterThan(0);
    expect(out.wiped).toBe(0);
    expect(out.restored).toBe(out.before);
    expect(out.schema).toBeGreaterThanOrEqual(4);
  });

  test('?owner=1 seeds machine PPL and shoulder limitation', async ({ page }) => {
    await page.goto('/?owner=1');
    await page.waitForFunction(() => window.S && window.TrainingPlanEngine && window.Profile);
    await page.waitForTimeout(400);
    const out = await page.evaluate(() => {
      const ctx = window.Profile.deriveContext();
      const lim = (ctx.limitations || []).some(function(l) {
        return String((l && (l.joint || l.id || l.note)) || '').toLowerCase().indexOf('shoulder') >= 0;
      });
      return {
        seeded: !!ctx.ownerSeed,
        hasPlan: !!ctx.hasPlan,
        template: !!(ctx.plan && ctx.plan.source && ctx.plan.source.name === 'machine_ppl_shoulder'),
        shoulder: lim,
        onboarded: !!ctx.onboarded
      };
    });
    expect(out.seeded).toBeTruthy();
    expect(out.hasPlan).toBeTruthy();
    expect(out.template).toBeTruthy();
    expect(out.shoulder).toBeTruthy();
    expect(out.onboarded).toBeTruthy();
  });

  test('deriveContext + EmberEngine expose today session', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForFunction(() => window.Profile && window.EmberEngine);
    const out = await page.evaluate(() => {
      const ctx = window.Profile.deriveContext();
      const sess = window.EmberEngine.todaySession();
      const insight = window.EmberEngine.insight();
      return {
        readiness: typeof ctx.readiness === 'number',
        hasInsight: !!(insight && insight.title),
        session: !!(sess && (sess.n || sess.name || sess.id))
      };
    });
    expect(out.readiness).toBeTruthy();
    expect(out.hasInsight).toBeTruthy();
    expect(out.session).toBeTruthy();
  });
});
