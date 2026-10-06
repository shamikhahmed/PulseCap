// @ts-check
const { test, expect } = require('@playwright/test');

/* Real people, real taps. Each persona goes through onboarding by clicking
   (no state injection — injected state is how the invisible disclaimer
   checkbox shipped), then the app must make sensible calls for THEM:
   split fits their days, food targets point the right way, every exercise
   fits their kit + joints, starting loads are sane, Easier works, a session
   saves, and every screen + Me tab renders without errors. */

const PERSONAS = [
  { name: 'Ayesha', sex: 'Female', goal: 'Lose fat', goalId: 'fat_loss', exp: 'Beginner', days: 3, kit: 'Dumbbells only', age: 29, h: 162, w: 78, lims: [] },
  { name: 'Bilal', sex: 'Male', goal: 'Gain weight', goalId: 'weight_gain', exp: 'Beginner', days: 3, kit: 'Full gym', age: 19, h: 178, w: 58, lims: [] },
  { name: 'Omar', sex: 'Male', goal: 'Build muscle', goalId: 'hypertrophy', exp: 'Intermediate', days: 5, kit: 'Full gym', age: 34, h: 180, w: 88, lims: ['shoulder'] },
  { name: 'Sana', sex: 'Female', goal: 'Lose fat', goalId: 'fat_loss', exp: 'Beginner', days: 2, kit: 'Home minimal', age: 41, h: 158, w: 95, lims: ['knee', 'low_back'] },
  { name: 'Hamza', sex: 'Male', goal: 'Get stronger', goalId: 'strength', exp: 'Advanced', days: 4, kit: 'Full gym', age: 27, h: 175, w: 82, lims: [] },
  { name: 'Zara', sex: 'Female', goal: 'Build muscle', goalId: 'hypertrophy', exp: 'Intermediate', days: 4, kit: 'Machines + cables', age: 24, h: 168, w: 60, lims: ['wrist'] },
  { name: 'Rashid', sex: 'Male', goal: 'Stay consistent', goalId: 'general_health', exp: 'Beginner', days: 3, kit: 'Machines + cables', age: 63, h: 172, w: 80, lims: ['hip', 'knee'] },
  { name: 'Imran', sex: 'Male', goal: 'Lose fat', goalId: 'fat_loss', exp: 'Beginner', days: 4, kit: 'Full gym', age: 45, h: 185, w: 130, lims: ['low_back'] },
  { name: 'Alex', sex: 'Prefer not to say', goal: 'Stay consistent', goalId: 'general_health', exp: 'Intermediate', days: 6, kit: 'Dumbbells only', age: 30, h: 70, w: 180, imperial: true, lims: [] }
];

async function pickOpt(page, title) {
  await page.locator('.ob-opt').filter({ has: page.locator('.ob-opt-title', { hasText: new RegExp('^' + title.replace(/[+]/g, '\\+') + '$') }) }).click();
}

for (const p of PERSONAS) {
  test(`persona ${p.name}: ${p.goalId}, ${p.exp}, ${p.days}d, ${p.kit}, limits [${p.lims.join(',') || 'none'}]`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.getByRole('button', { name: 'Get started' }).click();

    // Step 1 — name, goal, sex
    await page.fill('#ob-name-inp', p.name);
    await pickOpt(page, p.goal);
    await pickOpt(page, p.sex);
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 2 — experience, days, kit, size
    await expect(page.locator('.ob-title')).toHaveText('Gym and starting size');
    await pickOpt(page, p.exp);
    await page.locator(`[data-field="daysPerWeek"][data-val="${p.days}"]`).click();
    if (p.imperial) await page.locator('[data-field="units"][data-val="imperial"]').click();
    await pickOpt(page, p.kit);
    await page.locator('input[placeholder="25"]').fill(String(p.age));
    await page.locator(`input[placeholder="${p.imperial ? 70 : 175}"]`).fill(String(p.h));
    await page.locator(`input[placeholder="${p.imperial ? 165 : 75}"]`).fill(String(p.w));
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 3 — limitations: must open scrolled to the top, offer "No injuries",
    // and the consent tick must be visible and tappable.
    await expect(page.locator('.ob-title')).toHaveText('Anything bothering you?');
    expect(await page.evaluate(() => document.getElementById('view').scrollTop)).toBe(0);
    if (p.lims.length) {
      for (const j of p.lims) await page.locator(`.ob-opt[data-field="limitations"][data-val="${j}"]`).click();
    } else {
      await page.locator('[data-field="noLimitations"]').click();
    }
    const box = await page.locator('#ob-ack').boundingBox();
    expect(box && box.width).toBeGreaterThanOrEqual(20);
    await page.getByRole('button', { name: 'Continue' }).click();     // without tick → blocked
    await expect(page.locator('.ob-title')).toHaveText('Anything bothering you?');
    await expect(page.locator('#ob-ack-row')).toHaveClass(/err/);
    await page.locator('#ob-ack-row').click();
    await page.getByRole('button', { name: 'Continue' }).click();

    // Step 4
    await page.getByRole('button', { name: 'Start training' }).click();
    await page.waitForFunction(() => window.currentScreenId && window.currentScreenId() === 'dashboard');

    const plan = await page.evaluate((persona) => {
      const u = window.S.g('user');
      const split = window.SplitsDB.byId(u.split);
      const n = window.NutritionMath.fromUser(u);
      return {
        lims: (u.limitations || []).map(l => l.id),
        splitDays: split ? split.days : null, split: u.split,
        cal: u.calorieTarget, tdee: n.tdee, prot: u.proteinTarget, kg: u.weight,
        tip: document.querySelector('.dash-tip__body') ? document.querySelector('.dash-tip__body').textContent : ''
      };
    }, p);
    expect(plan.lims.sort()).toEqual(p.lims.slice().sort());
    expect(plan.splitDays).toBeLessThanOrEqual(p.days);
    if (p.goalId === 'fat_loss') expect(plan.cal).toBeLessThan(plan.tdee);
    if (p.goalId === 'weight_gain' || p.goalId === 'hypertrophy' || p.goalId === 'strength') expect(plan.cal).toBeGreaterThan(plan.tdee);
    if (p.goalId === 'general_health') expect(plan.cal).toBe(plan.tdee);
    expect(plan.prot).toBeLessThanOrEqual(200);
    expect(plan.prot).toBeGreaterThanOrEqual(Math.round(plan.kg * 1.2 > 200 ? 150 : plan.kg * 1.2));
    expect(plan.tip.length).toBeGreaterThan(20);
    expect(plan.tip).not.toMatch(/\{cal\}|\{prot\}/);

    // Session: kit + joints respected, sane starting loads
    await page.evaluate(() => window.startWorkout());
    await page.waitForFunction(() => window.currentScreenId() === 'active');
    const sess = await page.evaluate((persona) => {
      const u = window.S.g('user');
      const d = window.S.g('activeWorkoutDraft');
      const exs = (d && (d.exercises || (d.workout && d.workout.exercises))) || [];
      const problems = [];
      exs.forEach((ex) => {
        const row = window.ExDB.byName(ex.name);
        if (!window.Equipment.canPerform(ex.name)) problems.push(ex.name + ': not possible with ' + u.equipmentKit);
        if (!window.Equipment.jointOk(ex.name)) problems.push(ex.name + ': bad for ' + JSON.stringify(u.limitations.map(l => l.id)));
        const w0 = Number((ex.sets[0] || {}).weight) || 0;
        if (row && (row.bw || !(row.eq || []).length) && w0 > 0) problems.push(ex.name + ': bodyweight move pre-loaded ' + w0);
        if (u.exp === 'beginner' && row && /curl|raise|kickback|fly|extension|pushdown/i.test(row.n) && w0 > 15) problems.push(ex.name + ': beginner isolation at ' + w0 + 'kg');
      });
      return { count: exs.length, problems };
    }, p);
    expect(sess.count).toBeGreaterThan(0);
    expect(sess.problems).toEqual([]);

    // Easier sheet opens for every lift; swapping to an easier lift re-seeds the load
    const easier = await page.evaluate(() => {
      const d = window.S.g('activeWorkoutDraft');
      const exs = d.exercises || d.workout.exercises;
      let opened = 0, swapped = null;
      exs.forEach((ex, i) => {
        window.makeEasier(i);
        if (document.querySelector('.modal-sheet')) opened++;
        window.closeModal();
      });
      const idx = exs.findIndex(ex => {
        const r = window.ExDB.byName(ex.name);
        return r && (r.regressions || []).some(n => window.Equipment.canPerform(n) && window.Equipment.jointOk(n));
      });
      if (idx >= 0) {
        const r = window.ExDB.byName(exs[idx].name).regressions.find(n => window.Equipment.canPerform(n) && window.Equipment.jointOk(n));
        window._doSwapExercise(idx, r);
        const after = (window.S.g('activeWorkoutDraft').exercises || window.S.g('activeWorkoutDraft').workout.exercises)[idx];
        swapped = { name: after.name, want: r, w: Number(after.sets[0].weight) || 0, expect: window.WeightEngine.suggest(r, window.S.g('user')) || 0 };
      }
      return { opened, total: exs.length, swapped };
    });
    expect(easier.opened).toBe(easier.total);
    if (easier.swapped) {
      expect(easier.swapped.name).toBe(easier.swapped.want);
      expect(easier.swapped.w).toBe(easier.swapped.expect);
    }

    // Log one set, save, back on Today
    await page.evaluate(() => {
      window._doneSet(0, 0);
      window.confirmFinishWorkout();
    });
    await page.getByRole('button', { name: /save workout/i }).click();
    expect(await page.evaluate(() => (window.S.g('workouts') || []).length)).toBe(1);

    // Toasts stay on screen
    const t = await page.evaluate(() => { window.toast('A fairly long confirmation message that should wrap neatly on a phone', 'ok', 4000); const b = document.getElementById('toast').getBoundingClientRect(); return { l: b.left, r: b.right, vw: innerWidth }; });
    expect(t.l).toBeGreaterThanOrEqual(0);
    expect(t.r).toBeLessThanOrEqual(t.vw);

    // Every screen and every Me tab renders
    const walk = await page.evaluate(() => {
      const bad = [];
      window.listScreens().filter(id => ['active', 'onboarding'].indexOf(id) < 0).forEach(id => {
        try { window.go(id); if (!document.querySelector('#view .screen')) bad.push(id + ': no screen'); }
        catch (e) { bad.push(id + ': ' + e.message); }
      });
      ['account', 'training', 'fuel', 'appearance', 'accessibility', 'notifications', 'privacy', 'about'].forEach(tab => {
        try { window.go('settings', { tab }); if (!/Account|Training|Fuel|Appearance|Access|Alerts|Notification|Privacy|About/.test(document.querySelector('#view').textContent)) bad.push('settings/' + tab + ': empty'); }
        catch (e) { bad.push('settings/' + tab + ': ' + e.message); }
      });
      return bad;
    });
    expect(walk).toEqual([]);
    expect(errors.filter(e => !/vibrate|ResizeObserver|serviceWorker/i.test(e))).toEqual([]);
  });
}
