// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Exercise content integrity', () => {
  test('no duplicate names or ids in ExDB', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.ExDB && window.ExDB.db && window.ExDB.db.length);
    const out = await page.evaluate(() => {
      const names = [];
      const ids = [];
      window.ExDB.db.forEach(function(ex) {
        names.push(ex.n);
        ids.push(ex.id);
      });
      const dupNames = names.filter(function(n, i) { return names.indexOf(n) !== i; })
        .filter(function(n, i, a) { return a.indexOf(n) === i; });
      const dupIds = ids.filter(function(n, i) { return n && ids.indexOf(n) !== i; })
        .filter(function(n, i, a) { return a.indexOf(n) === i; });
      const missingId = window.ExDB.db.filter(function(ex) { return !ex.id; }).map(function(ex) { return ex.n; });
      return { count: window.ExDB.db.length, dupNames: dupNames, dupIds: dupIds, missingId: missingId };
    });
    expect(out.dupNames).toEqual([]);
    expect(out.dupIds).toEqual([]);
    expect(out.missingId).toEqual([]);
    expect(out.count).toBeGreaterThanOrEqual(250);
    expect(out.count).toBeLessThanOrEqual(400);
  });

  test('pre-id backup restores Hack Squat history onto hack-squat', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.S && window.S._migrate && window.ExDB);
    const out = await page.evaluate(() => {
      const old = {
        _schemaVersion: 5,
        user: { name: 'Legacy', units: 'metric', weight: 80, height: 180 },
        workouts: [{
          id: 'w1', name: 'Legs', date: '2026-02-01',
          exercises: [{
            name: 'Hack Squat',
            sets: [
              { weight: 80, reps: 8, done: true },
              { weight: 85, reps: 6, done: true }
            ]
          }]
        }],
        prs: [{ exercise: 'Hack Squat', weight: 85, reps: 6, e1rm: 102, date: '2026-02-01' }]
      };
      window.S.d = JSON.parse(JSON.stringify(old));
      window.S._migrate();
      const lift = window.S.d.workouts[0].exercises[0];
      const row = window.ExDB.byId(lift.exId) || window.ExDB.byName(lift.name);
      const hist = (window.S.d.workouts || []).reduce(function(n, w) {
        return n + (w.exercises || []).filter(function(ex) {
          return window.ExDB.sameLift(ex, 'Hack Squat');
        }).reduce(function(a, ex) { return a + (ex.sets || []).length; }, 0);
      }, 0);
      return {
        ver: window.S.d._schemaVersion,
        exId: lift.exId,
        name: lift.name,
        sets: (lift.sets || []).length,
        rowName: row && row.n,
        hist: hist,
        prExId: window.S.d.prs[0].exId
      };
    });
    expect(out.ver).toBe(6);
    expect(out.exId).toBe('hack-squat');
    expect(out.name).toBe('Hack Squat');
    expect(out.sets).toBe(2);
    expect(out.rowName).toBe('Hack Squat');
    expect(out.hist).toBe(2);
    expect(out.prExId).toBe('hack-squat');
  });

  test('every exercise has all eight joint keys', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.ExDB && window.Equipment);
    const out = await page.evaluate(() => {
      const keys = window.Equipment.JOINTS;
      const missing = [];
      window.ExDB.db.forEach(function(ex) {
        const miss = keys.filter(function(k) { return !ex.joint || ex.joint[k] == null; });
        if (miss.length) missing.push(ex.n + ':' + miss.join(','));
      });
      const wristHot = window.ExDB.db.filter(function(ex) { return (ex.joint.wrist || 0) >= 3; }).length;
      const neckHot = window.ExDB.db.filter(function(ex) { return (ex.joint.neck || 0) >= 3; }).length;
      const ankleHot = window.ExDB.db.filter(function(ex) { return (ex.joint.ankle || 0) >= 3; }).length;
      return { missing: missing, wristHot: wristHot, neckHot: neckHot, ankleHot: ankleHot };
    });
    expect(out.missing).toEqual([]);
    expect(out.wristHot).toBeGreaterThan(5);
    expect(out.neckHot).toBeGreaterThan(0);
    expect(out.ankleHot).toBeGreaterThan(5);
  });

  test('wrist limitation changes the library and Swap pool', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.Equipment && window.ExDB && window.SplitEngine);
    const out = await page.evaluate(() => {
      const user = {
        equipmentKit: 'full_gym', equipmentConfigured: true,
        equipment: window.Equipment.tagsForKit('full_gym'),
        limitations: [{ id: 'wrist', joint: 'wrist' }]
      };
      window.S.set('user', Object.assign({}, window.S.g('user') || {}, user));
      const open = window.Equipment.availableExercises(user);
      const blocked = window.ExDB.db.filter(function(ex) { return !window.Equipment.jointOk(ex, user); });
      const names = open.map(function(e) { return e.n; });
      const swaps = window.SplitEngine.rankSubstitutes('Barbell Bench Press');
      const swapHasUpright = swaps.some(function(s) { return /upright row/i.test(s.name); });
      return {
        open: open.length,
        blocked: blocked.length,
        blockedHasPushUp: blocked.some(function(e) { return e.n === 'Push-Ups'; }),
        openHasMachinePress: names.indexOf('Machine Chest Press') >= 0,
        swapHasUpright: swapHasUpright
      };
    });
    expect(out.blocked).toBeGreaterThan(0);
    expect(out.blockedHasPushUp).toBeTruthy();
    expect(out.openHasMachinePress).toBeTruthy();
    expect(out.swapHasUpright).toBeFalsy();
  });

  test('every exercise has a vocabulary pattern and 2+ resolvable substitutions', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.ExDB && window.ExDB.db.length);
    const out = await page.evaluate(() => {
      const vocab = ['horizontal_push','vertical_push','horizontal_pull','vertical_pull','hinge','squat','lunge','carry','core','isolation','conditioning'];
      const badPattern = [];
      const thin = [];
      const offPattern = [];
      window.ExDB.db.forEach(function(ex) {
        if (vocab.indexOf(ex.pattern) < 0) badPattern.push(ex.n);
        const names = (ex.regressions || []).concat(ex.progressions || []);
        const resolved = names.map(function(n) { return window.ExDB.byName(n); }).filter(Boolean);
        const uniq = [];
        resolved.forEach(function(r) { if (uniq.indexOf(r.n) < 0) uniq.push(r.n); });
        if (uniq.length < 2) thin.push(ex.n);
        uniq.forEach(function(n) {
          const row = window.ExDB.byName(n);
          if (row && ex.pattern && row.pattern && row.pattern !== ex.pattern) offPattern.push(ex.n + '→' + n);
        });
      });
      return { badPattern: badPattern.slice(0, 12), thin: thin.slice(0, 12), offPattern: offPattern.slice(0, 12), thinCount: thin.length };
    });
    expect(out.badPattern).toEqual([]);
    expect(out.thin).toEqual([]);
    expect(out.thinCount).toBe(0);
  });

  test('plyos are not sports; cricket exists; every lift has a MET source', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.ExDB && window.ExDB.db.length);
    const out = await page.evaluate(() => {
      const box = window.ExDB.byName('Box Jump');
      const cricket = window.ExDB.byName('Cricket — Batting') || window.ExDB.byName('Cricket - Batting');
      const missingMet = window.ExDB.db.filter(function(ex) { return ex.met == null || !ex.metSource; }).map(function(ex) { return ex.n; });
      const sports = window.ExDB.db.filter(function(ex) { return ex.grp === 'sports'; }).map(function(ex) { return ex.n; });
      return {
        boxGrp: box && box.grp,
        cricket: !!(cricket),
        missingMet: missingMet.slice(0, 8),
        sportsCount: sports.length,
        hasBadminton: sports.indexOf('Badminton') >= 0
      };
    });
    expect(out.boxGrp).toBe('plyometrics');
    expect(out.cricket).toBeTruthy();
    expect(out.missingMet).toEqual([]);
    expect(out.sportsCount).toBeGreaterThanOrEqual(10);
    expect(out.hasBadminton).toBeTruthy();
  });
});
