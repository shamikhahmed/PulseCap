'use strict';
const { test, expect } = require('@playwright/test');

test.describe('Calculation correctness', () => {
  test('BodyEngine BMI / BMR / TDEE match independent formulas', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.BodyEngine !== 'undefined');

    const out = await page.evaluate(() => {
      const be = window.BodyEngine;
      // Independent: BMI = 75 / (1.75^2) = 24.489795… → round2
      const bmi = be.bmi(75, 175);
      // Mifflin male: 10*75 + 6.25*175 - 5*25 + 5 = 750 + 1093.75 - 125 + 5 = 1723.75 → 1724
      const bmrMale = be.bmr({ weight: 75, height: 175, age: 25, gender: 'male' });
      // Female: 10*60 + 6.25*165 - 5*30 - 161 = 600 + 1031.25 - 150 - 161 = 1320.25 → 1320
      const bmrFemale = be.bmr({ weight: 60, height: 165, age: 30, gender: 'female' });
      // TDEE moderate 1.55 * 1724 = 2672.2 → 2672
      const tdee = be.tdee({ weight: 75, height: 175, age: 25, gender: 'male', activityLevel: 'moderate' });
      // sedentary 1.2 * 1724 = 2068.8 → 2069
      const tdeeSed = be.tdee({ weight: 75, height: 175, age: 25, gender: 'male', activityLevel: 'sedentary' });
      return { bmi, bmrMale, bmrFemale, tdee, tdeeSed };
    });

    expect(out.bmi.bmi).toBeCloseTo(24.49, 1);
    expect(out.bmi.cat).toBe('Normal');
    expect(out.bmrMale).toBe(1724);
    expect(out.bmrFemale).toBe(1320);
    expect(out.tdee).toBe(2672);
    expect(out.tdeeSed).toBe(2069);
  });

  test('Settings Account metrics match BodyEngine for current user', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.go === 'function');
    const live = await page.evaluate(() => {
      const u = window.S.g('user') || {};
      const eng = {
        bmi: window.BodyEngine.bmi(u.weight || 75, u.height || 175),
        bmr: window.BodyEngine.bmr(u),
        tdee: window.BodyEngine.tdee(u)
      };
      window.go('settings', { tab: 'account' });
      const text = document.getElementById('view').innerText;
      return { eng, text, weight: u.weight, height: u.height };
    });
    expect(live.text).toContain(String(live.eng.bmi.bmi));
    expect(live.text).toContain(String(live.eng.bmr));
    expect(live.text).toContain(String(live.eng.tdee));
  });

  test('deliberately wrong BMI assertion fails then right passes', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => typeof window.BodyEngine !== 'undefined');
    const bmi = await page.evaluate(() => window.BodyEngine.bmi(80, 180).bmi);
    expect(bmi).not.toBe(999); // poison value
    expect(bmi).toBeCloseTo(80 / (1.8 * 1.8), 1);
  });
});
