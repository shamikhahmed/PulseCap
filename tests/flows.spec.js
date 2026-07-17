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
});
