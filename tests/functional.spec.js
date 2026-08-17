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
    const waterBefore = await page.evaluate(() => {
      const t = window.today();
      return (window.S.g('water') || []).filter(function(w) { return w.date === t; }).length;
    });
    await page.evaluate(() => {
      const t = window.today();
      const n = (window.S.g('water') || []).filter(function(w) { return w.date === t; }).length;
      window.logWater(n + 1);
    });
    await waitReady(page);
    const waterAfter = await page.evaluate(() => {
      const t = window.today();
      return (window.S.g('water') || []).filter(function(w) { return w.date === t; }).length;
    });
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

  test('exhaustive widget battery (demo)', async ({ page }) => {
    test.setTimeout(180000);
    const errors = [];
    let ctx = 'boot';
    page.on('pageerror', (e) => { if (!IGNORE.test(e.message)) errors.push(ctx + ' :: ' + e.message); });
    page.on('dialog', (d) => d.accept().catch(() => {}));

    await bootDemo(page);

    const steps = [
      ['settings-tabs', () => page.evaluate(() => {
        ['account', 'training', 'fuel', 'appearance', 'accessibility', 'notifications', 'privacy', 'about']
          .forEach((t) => window.go('settings', { tab: t }));
        return true;
      })],
      ['theme-cycle', () => page.evaluate(() => {
        window.applyTheme('light', false);
        window.applyTheme('dark', false);
        window.clearThemePref();
        window.applyTheme('dark', false);
        return true;
      })],
      ['body-weight', () => page.evaluate(() => {
        window.go('progress');
        if (window.showLogWeight) window.showLogWeight();
        if (window.saveWeight) {
          const inp = document.getElementById('weight-input') || document.querySelector('#modal input[type="number"]');
          if (inp) inp.value = '81.5';
          window.saveWeight();
        }
        return true;
      })],
      ['measurements', () => page.evaluate(() => {
        window.go('progress');
        if (window.showLogMeasurements) window.showLogMeasurements();
        if (window.saveMeasurements) window.saveMeasurements();
        return true;
      })],
      ['programs', () => page.evaluate(() => {
        window.go('programs');
        return window.currentScreenId() === 'my-plan';
      })],
      ['settings-alias', () => page.evaluate(() => {
        window.go('calculators');
        return window.currentScreenId() === 'settings';
      })],
      ['assistant-alias', () => page.evaluate(() => {
        window.go('assistant');
        return window.currentScreenId() === 'dashboard';
      })],
      ['rehab-protocol', () => page.evaluate(() => {
        window.go('rehab');
        if (window.showInjuryProtocol) window.showInjuryProtocol('shoulder_impingement');
        return true;
      })],
      ['rehab-alias-anatomy', () => page.evaluate(() => {
        window.go('anatomy');
        return window.currentScreenId() === 'rehab';
      })],
      ['quests-alias', () => page.evaluate(() => {
        window.go('quests');
        return window.currentScreenId() === 'dashboard';
      })],
      ['profiles-seed', () => page.evaluate(() => {
        window.go('profiles');
        if (window.loadSamplePersonas) window.loadSamplePersonas();
        return (window.S.profiles() || []).length >= 5;
      })],
      ['split-picker', () => page.evaluate(() => {
        window.go('workout');
        if (window.pickSplitDay) window.pickSplitDay(0);
        return true;
      })],
      ['quick-workout', () => page.evaluate(() => {
        window.S.set('programWeightsConfirmed', true);
        if (window.startQuickWorkout) window.startQuickWorkout();
        return !!document.getElementById('wkt-header') || !!document.querySelector('#view .screen');
      })],
      ['cardio', () => page.evaluate(() => {
        window.go('cardio');
        if (window.showLogCardio) window.showLogCardio();
        return true;
      })],
      ['equipment', () => page.evaluate(() => {
        window.go('equipment-setup');
        if (window.selectEquipmentPreset) window.selectEquipmentPreset('gym');
        return true;
      })],
      ['export', () => page.evaluate(() => {
        if (window.exportData) window.exportData();
        return true;
      })],
      ['coach-settings', () => page.evaluate(() => {
        window.go('settings', { tab: 'appearance' });
        window._setSetting('user.coachPersonality', 'maya');
        window._setSetting('settings.coachTone', 'scientific');
        return true;
      })],
      ['physique-alias', () => page.evaluate(() => {
        window.go('physique', { tab: 'score' });
        return window.currentScreenId() === 'progress';
      })],
      ['recovery-tabs', () => page.evaluate(() => {
        window.go('recovery', { tab: 'checkin' });
        window.go('recovery', { tab: 'debt' });
        return true;
      })],
      ['training-alias', () => page.evaluate(() => {
        window.go('training-intel', { tab: 'intel' });
        return window.currentScreenId() === 'workout';
      })],
      ['briefing', () => page.evaluate(() => {
        window.go('briefing');
        if (window.openMorningBriefing) window.openMorningBriefing();
        return true;
      })],
      ['supp-mark', () => page.evaluate(() => {
        window.go('nutrition');
        const supps = window.S.g('supplements') || [];
        if (supps[0] && window.SupplementEngine && window.SupplementEngine.markTaken) {
          window.SupplementEngine.markTaken(supps[0].id);
        }
        return true;
      })],
      ['modal-close', () => page.evaluate(() => {
        if (window.closeModal) window.closeModal();
        return true;
      })],
    ];

    for (const [name, fn] of steps) {
      ctx = name;
      const ok = await fn();
      expect(ok, name + ' failed').toBeTruthy();
      await page.waitForTimeout(80);
    }

    // Visual integrity: no fatal screen error chrome after battery
    const fatal = await page.evaluate(() => {
      const t = (document.querySelector('#view') || {}).textContent || '';
      return /Screen error:|Could not load screen/.test(t);
    });
    expect(fatal).toBe(false);
    expect(errors, 'runtime errors during widget battery:\n' + errors.join('\n')).toEqual([]);
  });
});
