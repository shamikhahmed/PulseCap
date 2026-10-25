// @ts-check
/**
 * HIG design gate — Today, Train, Progress (+ log weight sheet), Programs, Me; light + dark; iPad sidebar.
 * Captures before/after evidence when HIG_SHOTS=<label> (writes build/qa/hig/<label>/).
 */
const { test, expect } = require('@playwright/test');
const path = require('path');

const LABEL = process.env.HIG_SHOTS || '';
const OUT = path.join(__dirname, '..', 'build', 'qa', 'hig', LABEL || 'tmp');

async function shot(page, name) {
  if (!LABEL) return;
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, name + '.png') });
}

async function boot(page, theme) {
  await page.goto('/?demo=1');
  await page.waitForFunction(() => typeof window.go === 'function' && document.getElementById('nav') && !document.getElementById('nav').hidden, { timeout: 30000 });
  await page.evaluate((t) => { if (typeof closeModal === 'function') closeModal(); applyTheme(t, false); }, theme);
  await page.waitForTimeout(600);
}

async function go(page, id) {
  await page.evaluate((s) => { if (typeof closeModal === 'function') closeModal(); return window.go(s); }, id);
  await page.waitForTimeout(800);
}

for (const theme of ['dark', 'light']) {
  test.describe(`HIG phone · ${theme}`, () => {
    test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true });

    test(`today, train, progress, sheet, programs, me (${theme})`, async ({ page }) => {
      await boot(page, theme);
      await go(page, 'dashboard');
      await shot(page, `phone-${theme}-01-today`);
      await go(page, 'workout');
      await shot(page, `phone-${theme}-02-train`);
      await go(page, 'progress');
      await shot(page, `phone-${theme}-03-progress`);
      await page.evaluate(() => window.showLogWeight());
      await page.locator('#_modal .modal-sheet').waitFor();
      await shot(page, `phone-${theme}-04-log-weight`);
      await page.evaluate(() => closeModal());
      await go(page, 'programs');
      await shot(page, `phone-${theme}-05-programs`);
      await go(page, 'settings');
      await shot(page, `phone-${theme}-06-me`);
      await expect(page.locator('#nav')).toBeVisible();
    });
  });
}

test.describe('HIG iPad · sidebar', () => {
  test.use({ viewport: { width: 1180, height: 820 } });

  test('sidebar shell + today + progress', async ({ page }) => {
    await boot(page, 'dark');
    await go(page, 'dashboard');
    await shot(page, 'ipad-dark-01-today');
    await go(page, 'progress');
    await shot(page, 'ipad-dark-02-progress');
  });
});
