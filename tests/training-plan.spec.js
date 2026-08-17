// @ts-check
const { test, expect } = require('@playwright/test');

function miniPdf(text) {
  const stream = 'BT /F1 12 Tf 50 700 Td (' + text.replace(/[()\\]/g, '') + ') Tj ET';
  const body =
    '%PDF-1.1\n' +
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj\n' +
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj\n' +
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj\n' +
    '4 0 obj << /Length ' + stream.length + ' >> stream\n' + stream + '\nendstream endobj\n' +
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj\n' +
    'trailer << /Root 1 0 R >>\n%%EOF\n';
  return Buffer.from(body, 'latin1');
}

test.describe('Training plan intelligence', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForFunction(() => window.S && window.S.activeId && window.S.activeId() === 'demo' && window.TrainingPlanEngine, undefined, { timeout: 30000 });
  });

  test('schema validates the machine-only template', async ({ page }) => {
    const out = await page.evaluate(() => {
      const src = window.PLAN_TEMPLATES.machine_ppl_shoulder;
      const clean = window.validateTrainingPlan(src);
      return {
        sessions: Object.keys(clean.sessions).length,
        rotation: clean.rotation.length,
        weeks: clean.mesocycle.weeks,
        deload: clean.mesocycle.deloadWeek,
        rest: clean.restWeekdays,
        first: clean.sessions.push_a.exercises[0].name
      };
    });
    expect(out.sessions).toBe(6);
    expect(out.rotation).toBe(6);
    expect(out.weeks).toBe(5);
    expect(out.deload).toBe(5);
    expect(out.rest).toEqual(['sun']);
    expect(out.first).toContain('Incline');
  });

  test('install is opt-in and does not auto-convert the split', async ({ page }) => {
    const before = await page.evaluate(() => window.S.g('user.split'));
    expect(await page.evaluate(() => window.TrainingPlanEngine.hasActive())).toBeFalsy();
    await page.evaluate(() => {
      window.TrainingPlanEngine.installTemplate('machine_ppl_shoulder', { acknowledgedSafety: true, startDate: '2026-08-17' });
    });
    const after = await page.evaluate(() => ({
      split: window.S.g('user.split'),
      active: window.TrainingPlanEngine.hasActive(),
      schema: window.S.d._schemaVersion,
      workouts: (window.S.g('workouts') || []).length
    }));
    expect(after.split).toBe(before);
    expect(after.active).toBeTruthy();
    expect(after.schema).toBeGreaterThanOrEqual(3);
    expect(after.workouts).toBeGreaterThan(0);
  });

  test('Sunday is rest and rotation resumes after a miss', async ({ page }) => {
    const out = await page.evaluate(() => {
      const TP = window.TrainingPlanEngine;
      TP.installTemplate('machine_ppl_shoulder', { acknowledgedSafety: true, startDate: '2026-08-17' });
      TP._nowDate = '2026-08-23';
      const sun = TP.todaySession();
      const restEngine = window.SplitEngine.isScheduledRestDay();
      TP._nowDate = '2026-08-18';
      const tue = TP.todaySession();
      TP.setTodaySession('pull_a');
      const key = TP.todaySessionKey();
      TP._nowDate = null;
      return { sunRest: !!(sun && sun.rest), tueName: tue && tue.name, key: key, restEngine: restEngine };
    });
    expect(out.sunRest).toBeTruthy();
    expect(out.tueName).toMatch(/Push|Pull|Legs/);
    expect(out.key).toBe('pull_a');
  });

  test('week 5 is deload and double progression holds on a miss', async ({ page }) => {
    const out = await page.evaluate(() => {
      const TP = window.TrainingPlanEngine;
      TP.installTemplate('machine_ppl_shoulder', { acknowledgedSafety: true, startDate: '2026-08-17' });
      TP._nowDate = '2026-09-14';
      const deload = TP.isDeload();
      const week = TP.weekIndex();
      TP._nowDate = '2026-08-17';
      const ex = { name: 'Smith Incline Press', startKg: 10, reps: [10, 12], rpe: [8, 8] };
      const hold = TP.nextLoadAdvice(ex);
      const plan = TP.get();
      const workout = {
        id: 't1', date: '2026-08-17', planKey: 'push_a', shoulderPain: 0,
        exercises: [{
          name: 'Smith Incline Press', planName: 'Smith Incline Press',
          sets: [
            { weight: 10, reps: 12, rpe: 8, done: true },
            { weight: 10, reps: 12, rpe: 8, done: true },
            { weight: 10, reps: 12, rpe: 8, done: true },
            { weight: 10, reps: 12, rpe: 8, done: true }
          ]
        }]
      };
      const msgs = TP.onFinish(workout);
      const next = TP.loadFor('Smith Incline Press', 10);
      const miss = {
        id: 't2', date: '2026-08-18', planKey: 'push_a', shoulderPain: 0,
        exercises: [{
          name: 'Smith Incline Press', planName: 'Smith Incline Press',
          sets: [
            { weight: next.kg, reps: 8, rpe: 8, done: true },
            { weight: next.kg, reps: 8, rpe: 8, done: true }
          ]
        }]
      };
      TP.onFinish(miss);
      const held = TP.loadFor('Smith Incline Press', 10);
      const blocked = {
        id: 't3', date: '2026-08-19', planKey: 'push_a', shoulderPain: 8, stopFlag: true,
        exercises: [{
          name: 'Smith Incline Press', planName: 'Smith Incline Press',
          sets: [{ weight: held.kg, reps: 12, rpe: 8, done: true }]
        }]
      };
      const beforePain = held.kg;
      TP.onFinish(blocked);
      const afterPain = TP.loadFor('Smith Incline Press', 10).kg;
      TP._nowDate = null;
      return { deload: deload, week: week, holdReason: hold.reason, nextKg: next.kg, heldKg: held.kg, msgs: msgs, afterPain: afterPain, beforePain: beforePain };
    });
    expect(out.deload).toBeTruthy();
    expect(out.week).toBe(5);
    expect(out.nextKg).toBeGreaterThan(10);
    expect(out.heldKg).toBe(out.nextKg);
    expect(out.afterPain).toBe(out.beforePain);
  });

  test('My Plan screen and prescribed logger', async ({ page }) => {
    await page.evaluate(() => {
      window.TrainingPlanEngine.installTemplate('machine_ppl_shoulder', { acknowledgedSafety: true, startDate: '2026-08-17' });
      window.TrainingPlanEngine._nowDate = '2026-08-17';
      if (window.TrainingPlanEngine.isRestToday()) window.TrainingPlanEngine.setTodaySession('pull_a');
    });
    await page.evaluate(() => window.go('my-plan'));
    await page.waitForTimeout(400);
    await expect(page.locator('#view')).toContainText(/Machine-only PPL|Push|Pull|Legs|Full rest/i);
    await page.evaluate(() => {
      if (window.TrainingPlanEngine.isRestToday()) window.TrainingPlanEngine.setTodaySession('push_a');
      window.startWorkout();
    });
    await page.waitForTimeout(500);
    const wkt = await page.evaluate(() => {
      const w = window.getActiveWorkout && window.getActiveWorkout();
      return w ? { name: w.name, n: w.exercises.length, planKey: w.planKey, prehab: w.exercises.filter(function(e) { return e._prehab; }).length, rom: !!(w.exercises.find(function(e) { return e._plan && e._plan.rom; })) } : null;
    });
    expect(wkt).toBeTruthy();
    expect(wkt.n).toBeGreaterThan(6);
    expect(wkt.planKey).toBeTruthy();
    expect(wkt.prehab).toBeGreaterThan(0);
    expect(wkt.rom).toBeTruthy();
  });

  test('JSON import review and PDF text extract', async ({ page }) => {
    const json = await page.evaluate(() => {
      const p = window.validateTrainingPlan(window.PLAN_TEMPLATES.machine_ppl_shoulder);
      p.title = 'Imported copy';
      return JSON.stringify({ trainingPlan: p });
    });
    const parsed = await page.evaluate((raw) => window.parsePlanJson(JSON.parse(raw)), json);
    expect(parsed.ok).toBeTruthy();
    expect(parsed.draft.sessions.push_a).toBeTruthy();

    const textHit = await page.evaluate(() => window.parsePlanText('Machine-Only PPL Program\nPUSH A — Chest\nIncline chest press 4x10-12 RPE 8\nPULL A — Back\nLat pulldown 4x12 RPE 8'));
    expect(textHit.ok).toBeTruthy();

    const pdf = miniPdf('PUSH A Chest Incline press 4x10-12 RPE 8 PULL A Lat pulldown 4x12 RPE 8 LEGS A Leg press 4x10');
    const pdfRes = await page.evaluate(async (b64) => {
      const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      return window.extractPdfText(bin.buffer);
    }, pdf.toString('base64'));
    expect(pdfRes.scanned).toBeFalsy();
    expect(pdfRes.text.toLowerCase()).toContain('push a');

    const scanned = await page.evaluate(async () => {
      const bytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x31, 0x0a]);
      return window.extractPdfText(bytes.buffer);
    });
    expect(scanned.scanned).toBeTruthy();

    const tooBig = await page.evaluate(async () => {
      const blob = new Blob([new Uint8Array(2 * 1024 * 1024)], { type: 'application/pdf' });
      const file = new File([blob], 'huge.pdf', { type: 'application/pdf' });
      return window.PlanImport.readFile(file).then(function() { return { ok: true }; }).catch(function(e) {
        return { ok: false, error: e.message };
      });
    });
    expect(tooBig.ok).toBeFalsy();

    const empty = await page.evaluate(() => window.parsePlanText('hi'));
    expect(empty.ok).toBeFalsy();

    const badJson = await page.evaluate(() => window.parsePlanJson({ hello: true }));
    expect(badJson.ok).toBeFalsy();

    const provider = await page.evaluate(() => window.CoachProvider.suggestPlan().then((r) => r));
    expect(provider.ok).toBeFalsy();
  });

  test('remove plan keeps workout history and backup accepts trainingPlan', async ({ page }) => {
    const out = await page.evaluate(() => {
      window.TrainingPlanEngine.installTemplate('machine_ppl_shoulder', { acknowledgedSafety: true });
      const n = (window.S.g('workouts') || []).length;
      const backup = JSON.parse(JSON.stringify(window.S.d));
      let backupOk = false;
      try {
        if (backup.trainingPlan) window.validateTrainingPlan(backup.trainingPlan);
        backupOk = true;
      } catch (e) { backupOk = false; }
      window.TrainingPlanEngine.removePlan();
      return {
        n: n,
        active: window.TrainingPlanEngine.hasActive(),
        stillWorkouts: (window.S.g('workouts') || []).length,
        backupOk: backupOk,
        schema: backup._schemaVersion
      };
    });
    expect(out.n).toBeGreaterThan(0);
    expect(out.active).toBeFalsy();
    expect(out.stillWorkouts).toBe(out.n);
    expect(out.backupOk).toBeTruthy();
    expect(out.schema).toBeGreaterThanOrEqual(3);
  });
});
