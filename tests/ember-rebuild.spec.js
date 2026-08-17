// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Ember rebuild UI', () => {
  test('onboarding is 4 steps and requires the educational disclaimer', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => typeof window.__pcOnboardingState === 'function');
    const meta = await page.evaluate(() => window.__pcOnboardingState({ step: 1, intro: 0 }));
    expect(meta.total).toBe(4);

    const step3 = await page.evaluate(() => {
      window.__pcOnboardingState({ step: 3, data: { name: 'Sam', disclaimerAck: false } });
      window.go('onboarding');
      const text = document.getElementById('view').innerText;
      window.obContinue();
      return {
        hasDisclaimer: /educational/i.test(text) && /not medical/i.test(text),
        stillStep: window.__pcOnboardingState().step
      };
    });
    expect(step3.hasDisclaimer).toBeTruthy();
    expect(step3.stillStep).toBe(3);
  });

  test('Today paints one session card and one insight', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.go === 'function');
    await page.evaluate(() => window.go('dashboard'));
    await expect(page.locator('.dash-session')).toBeVisible();
    await expect(page.getByRole('button', { name: /Start workout|Start light session|Recovery check-in/i }).first()).toBeVisible();
    await expect(page.locator('#view .banner').first()).toBeVisible();
  });

  test('per-side loads average into the logged set', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.startQuickWorkout === 'function');
    const out = await page.evaluate(() => {
      if (window.discardWorkoutDraft) window.discardWorkoutDraft();
      window.startQuickWorkout();
      const w = window.getActiveWorkout();
      if (!w || !w.exercises[0]) return { l: 0, r: 0, avg: 0 };
      w.exercises[0]._plan = { unit: 'kg_per_side' };
      window._setSide(0, 0, 'L', '20');
      window._setSide(0, 0, 'R', '24');
      const set = window.getActiveWorkout().exercises[0].sets[0];
      return { l: set.weightL, r: set.weightR, avg: set.weight };
    });
    expect(out.l).toBe(20);
    expect(out.r).toBe(24);
    expect(out.avg).toBe(22);
  });

  test('Progress keeps Training Block and self-vs-self chart, not e1RM', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.go === 'function');
    await page.evaluate(() => window.go('progress'));
    await expect(page.getByText('Training Block')).toBeVisible();
    const text = await page.locator('#view').innerText();
    expect(text).toMatch(/This lift vs itself|No workouts yet/);
    expect(text).not.toMatch(/e1RM/);
  });

  test('Programs tab chrome (not Settings back-stack)', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.go === 'function');
    await page.evaluate(() => window.go('my-plan'));
    await expect(page.locator('.topbar-title')).toHaveText('Programs');
    await expect(page.locator('#view')).toContainText(/Machine-only PPL|Import a plan/i);
  });

  test('Me limitations update deriveContext for Today and Log', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForFunction(() => window.Profile && window.toggleLimitation);
    const out = await page.evaluate(() => {
      if (window.discardWorkoutDraft) window.discardWorkoutDraft();
      window.S.set('user.limitations', []);
      window.S.set('user.injuries', []);
      window.toggleLimitation('shoulder');
      const ctx = window.Profile.deriveContext();
      const has = (ctx.limitations || []).some(function(l) {
        return String((l && (l.joint || l.id)) || l).toLowerCase().indexOf('shoulder') >= 0;
      });
      if (window.discardWorkoutDraft) window.discardWorkoutDraft();
      window.startQuickWorkout();
      window.go('active');
      const log = document.getElementById('view').innerText;
      window.go('settings', { tab: 'about' });
      const about = document.getElementById('view').innerText;
      return {
        has,
        caution: /Shoulder caution/i.test(log),
        nav: /Today · Train · Progress · Programs · Me/.test(about)
      };
    });
    expect(out.has).toBeTruthy();
    expect(out.caution).toBeTruthy();
    expect(out.nav).toBeTruthy();
  });

  test('Active logger: slim header, check in-row, last is --text-2', async ({ page }) => {
    const widths = [375, 390, 430];
    for (const width of widths) {
      await page.setViewportSize({ width, height: 812 });
      await page.goto('/?demo=1');
      await page.waitForFunction(() => typeof window.startQuickWorkout === 'function');
      const out = await page.evaluate(() => {
        if (window.discardWorkoutDraft) window.discardWorkoutDraft();
        window.startQuickWorkout();
        const header = document.getElementById('wkt-header');
        const actions = Array.from(document.querySelectorAll('#wkt-header .wkt-bar__actions > button')).map(function(b) {
          return (b.textContent || '').trim();
        });
        const row = document.querySelector('.set-row');
        const check = row && row.querySelector('.set-check');
        const last = document.querySelector('.log-last');
        const lastColor = last ? getComputedStyle(last).color : '';
        return {
          hasHeader: !!header,
          hasMore: !!document.querySelector('#wkt-header .log-more'),
          actions: actions,
          checkInRow: !!check,
          rowH: row ? Math.round(row.getBoundingClientRect().height) : 0,
          wrap: row ? row.scrollWidth > row.clientWidth + 2 : true,
          lastColor: lastColor,
          warmupClosed: !document.querySelector('.warmup-fold[open]')
        };
      });
      expect(out.hasHeader, String(width)).toBeTruthy();
      expect(out.hasMore, String(width)).toBeTruthy();
      expect(out.actions, String(width)).toEqual(['Finish']);
      expect(out.checkInRow, String(width)).toBeTruthy();
      expect(out.rowH, String(width)).toBeGreaterThanOrEqual(44);
      expect(out.rowH, String(width)).toBeLessThan(72);
      expect(out.wrap, String(width)).toBeFalsy();
      expect(out.warmupClosed, String(width)).toBeTruthy();
      if (out.lastColor) {
        expect(out.lastColor, String(width)).not.toMatch(/255,\s*122,\s*26/);
      }
    }
  });

  test('Train has no Progress/Cardio/Skills/Intel chips; split is select or segmented', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.go === 'function');
    const out = await page.evaluate(() => {
      window.go('workout');
      const view = document.getElementById('view');
      const text = view ? view.innerText : '';
      return {
        chips: !!document.querySelector('#view .mod-chip-row'),
        picker: !!document.querySelector('#view .split-select, #view .split-seg'),
        scroller: !!document.querySelector('#view [style*="overflow-x:auto"]'),
        hasProgressChip: /Progress/.test(text) && !!document.querySelector('#view .mod-chip'),
        intel: /Intel/.test(text) && !!document.querySelector('#view .inline-chip')
      };
    });
    expect(out.chips).toBeFalsy();
    expect(out.picker).toBeTruthy();
    expect(out.intel).toBeFalsy();
  });
});
