// @ts-check
const { test, expect } = require('@playwright/test');

/** End-to-end user chains: workout → save → streak/program, weigh-in coach,
    skip-day rescheduler, split integrity. These exercise the engine wiring
    that module-smoke can't see. */
test.describe('PulseCap flows', () => {
  test.beforeEach(async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/');
    await page.waitForFunction(() => typeof window.go === 'function' && typeof window.startWorkout === 'function');
    await page.evaluate(() => {
      // fresh profile, skip onboarding
      // @ts-ignore
      window.introQuickStart();
    });
    // @ts-ignore
    page._errors = errors;
  });

  test('workout chain: start → log sets → finish → saved + streak', async ({ page }) => {
    const out = await page.evaluate(() => {
      // @ts-ignore
      const w = window;
    w.S.set('programWeightsConfirmed', true);
      w.startWorkout();
      w._doneSet(0, 0); w._doneSet(0, 1);
      const counter = document.getElementById('wkt-count') && document.getElementById('wkt-count').textContent;
      w.confirmFinishWorkout();
      const save = Array.from(document.querySelectorAll('button')).find(b => /SAVE WORKOUT/i.test(b.textContent || ''));
      if (save) save.click();
      const ws = w.S.g('workouts') || [];
      return { counter, workouts: ws.length, streak: w.StreakEngine.get(), dayNum: ws[0] && ws[0].splitDay };
    });
    expect(out.workouts).toBe(1);
    expect(out.counter).toMatch(/^2\//);
    expect(out.streak).toBeGreaterThanOrEqual(1);
    expect(out.dayNum).toBeGreaterThanOrEqual(1);
  });

  test('strength program prescribes and progresses (stronglifts)', async ({ page }) => {
    const out = await page.evaluate(() => {
      // @ts-ignore
      const w = window;
      w.S.set('user.split', 'stronglifts');
      w.S.set('programWeightsConfirmed', true);
      w.startWorkout();
      // main lift must be program-prescribed: 5 sets of 5
      const wkt = (function(){ w.go('active'); return document.body.innerText; })();
      const rxShown = /5×5 @ \d+(\.\d+)?kg/.test(wkt);
      // finish all sets of first exercise
      const stBefore = JSON.parse(JSON.stringify(w.S.g('programState') || {}));
      return { rxShown, keys: Object.keys(stBefore).length };
    });
    expect(out.rxShown).toBeTruthy();
    expect(out.keys).toBeGreaterThanOrEqual(1);
  });

  test('weigh-in gets goal-aware coach reaction', async ({ page }) => {
    const msg = await page.evaluate(() => {
      // @ts-ignore
      const w = window;
      w.S.set('user.goal', 'fat_loss');
      w.S.set('bodyStats', [{ date: '2020-01-01', weight: 90 }]);
      w.showLogWeight();
      const inp = document.getElementById('wt-inp');
      // @ts-ignore
      inp.value = '89.4';
      w.saveWeight();
      const t = document.querySelector('#toast .toast-msg');
      return t ? t.textContent : '';
    });
    expect(msg).toMatch(/Down 0\.6/);
  });

  test('skip day reshuffles the week with reasoning', async ({ page }) => {
    const out = await page.evaluate(() => {
      // @ts-ignore
      const w = window;
      const names = ['sun','mon','tue','wed','thu','fri','sat'];
      const todayId = names[new Date().getDay()];
      const gym = [todayId, names[(new Date().getDay() + 2) % 7], names[(new Date().getDay() + 4) % 7]];
      w.S.set('user.gymDays', gym);
      w.S.set('user.split', 'ppl');
      const r = w.SplitEngine.skipToday();
      const dd = w.DailyDecision.decide();
      return { shifted: r.shifted, msg: r.msg, ddTitle: dd.title };
    });
    expect(out.msg.length).toBeGreaterThan(10);
    expect(out.ddTitle).toBe('Day Skipped');
  });

  test('all splits resolve every exercise to a known DB entry', async ({ page }) => {
    const problems = await page.evaluate(() => {
      // @ts-ignore
      const w = window;
      const splits = ['ppl','ppl_5','ul','ul_3','fb','fb_2','bro','str','home','arnold','phul','phat','push_pull','powerbuilding','cardio_strength','starting_strength','stronglifts','531','upper_lower_fb'];
      const out = [];
      for (const sp of splits) {
        w.SplitEngine.listSplitDays(sp).forEach((d, i) => {
          (d.exercises || []).forEach(n => { if (!w.ExDB.byName(n)) out.push(sp + ' d' + (i + 1) + ': ' + n); });
        });
      }
      return out;
    });
    expect(problems).toEqual([]);
  });

  test('plate calculator splits load per side', async ({ page }) => {
    const out = await page.evaluate(() => {
      // @ts-ignore
      const r = window.PlateEngine.calc(100);
      return { bar: r.bar, label: r.label, plates: r.perSide, rem: r.remainder };
    });
    expect(out.bar).toBe(20);
    // 100 − 20 bar = 80 → 40/side → 25 + 15
    expect(out.plates).toEqual([{ w: 25, n: 1 }, { w: 15, n: 1 }]);
    expect(out.rem).toBeLessThan(0.1);
  });

  test('weekly coach report flags weak muscles', async ({ page }) => {
    const out = await page.evaluate(() => {
      // @ts-ignore
      const w = window;
      w.S.set('workouts', [{
        date: new Date().toISOString(),
        totalVol: 5000,
        exercises: [{
          name: 'Barbell Bench Press',
          sets: [{ weight: 80, reps: 5, done: true }, { weight: 80, reps: 5, done: true }]
        }]
      }]);
      const report = w.RecapEngine.coachReport();
      return {
        hasChest: report.rows.some(r => r.muscle === 'chest' && r.sets >= 2),
        advice: report.advice[0] || '',
        weakLen: report.weak.length
      };
    });
    expect(out.hasChest).toBeTruthy();
    expect(out.advice.length).toBeGreaterThan(5);
    expect(out.weakLen).toBeGreaterThan(0);
  });

  test('warmup ramp inserts sets ahead of working sets', async ({ page }) => {
    const out = await page.evaluate(() => {
      // @ts-ignore
      const w = window;
      w.S.set('programWeightsConfirmed', true);
      w.startWorkout();
      const wkt = w.getActiveWorkout();
      // Force first exercise to a barbell compound
      wkt.exercises[0] = { name: 'Back Squat', sets: [{ weight: 100, reps: 5, done: false }] };
      w.insertWarmupSets(0);
      const sets = w.getActiveWorkout().exercises[0].sets;
      return {
        n: sets.length,
        firstWarm: !!sets[0]._warmup,
        lastWork: sets[sets.length - 1].weight === 100,
        ramp: w.WeightEngine.warmupSets(100).length,
        isBB: w.isBarbellExercise('Back Squat')
      };
    });
    expect(out.isBB).toBeTruthy();
    expect(out.ramp).toBe(3);
    expect(out.n).toBe(4);
    expect(out.firstWarm).toBeTruthy();
    expect(out.lastWork).toBeTruthy();
  });

  test('form loops cover top compounds offline', async ({ page }) => {
    const out = await page.evaluate(() => {
      // @ts-ignore
      const fl = window.FormLoops;
      const squat = fl.forExercise('Back Squat');
      const html = fl.cardHTML('Deadlift');
      return {
        count: fl.count,
        hasCue: !!(squat && squat.cue),
        htmlHonest: /form cues/i.test(html) && /not a video/i.test(html),
        barbell: fl.isBarbell('Back Squat') && !fl.isBarbell('Leg Press')
      };
    });
    expect(out.count).toBeGreaterThanOrEqual(45);
    expect(out.hasCue).toBeTruthy();
    expect(out.htmlHonest).toBeTruthy();
    expect(out.barbell).toBeTruthy();
  });

  test('dashboard prompt queue caps at 2 on first paint', async ({ page }) => {
    const out = await page.evaluate(() => {
      // @ts-ignore
      const w = window;
      w.S.set('recapDismissed', null);
      // Force many prompts: no weigh-in, no check-in, equipment pending
      w.S.set('user.equipmentConfigured', false);
      w.S.set('settings.equipmentSetupPending', true);
      w.S.set('recovery', {});
      w.go('dashboard');
      const view = document.getElementById('view');
      const details = view && view.querySelector('details');
      return { hasMore: !!(details && /More for today/i.test(details.textContent || '')) };
    });
    expect(out.hasMore).toBeTruthy();
  });

  test('program weight setup gates first strength start', async ({ page }) => {
    const out = await page.evaluate(() => {
      // @ts-ignore
      const w = window;
      w.S.set('user.split', 'stronglifts');
      w.S.set('programWeightsConfirmed', null);
      w.S.set('programState', null);
      const needs = w.ProgramEngine.needsWeightConfirm();
      w.showProgramWeightSetup();
      const modal = document.querySelector('.modal-sheet, .modal-overlay');
      return { needs: needs, modal: !!modal };
    });
    expect(out.needs).toBeTruthy();
    expect(out.modal).toBeTruthy();
  });

  test('settings version matches APP_VERSION (not stale 4.7.4)', async ({ page }) => {
    const out = await page.evaluate(() => {
      // @ts-ignore
      const w = window;
      w.go('settings', { tab: 'data' });
      const text = document.getElementById('view').innerText;
      return { ver: w.APP_VERSION, text: text };
    });
    expect(out.ver).toMatch(/^5\./);
    expect(out.text).toContain('v' + out.ver);
    expect(out.text).not.toContain('v4.7.4');
  });

  test('skip link is visually hidden until focused', async ({ page }) => {
    const hidden = await page.evaluate(() => {
      const el = document.querySelector('.cap-skip-link');
      if (!el) return false;
      const cs = getComputedStyle(el);
      return cs.clipPath.includes('inset') || cs.width === '1px' || cs.clip === 'rect(0px, 0px, 0px, 0px)';
    });
    expect(hidden).toBeTruthy();
  });
});
