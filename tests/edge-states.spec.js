// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Phase 34 — edge states copy', () => {
  test('storage full shows export-backup next step', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => typeof window.S !== 'undefined' && typeof window.S.set === 'function');

    await page.evaluate(() => {
      // Force the localStorage write path to throw a QuotaExceededError.
      // PulseCap catches this and surfaces a user-facing toast.
      // @ts-ignore
      localStorage.setItem = function() {
        const e = new Error('quota exceeded');
        e.name = 'QuotaExceededError';
        throw e;
      };
      window.S.set('user.name', 'QuotaTest');
    });

    const toastMsg = page.locator('#toast .toast-msg');
    await expect(toastMsg).toContainText(/Storage is full/i);
    await expect(toastMsg).toContainText(/Export a backup/i);
    await expect(toastMsg).toContainText(/before adding more data/i);
  });

  test('invalid plan JSON returns plain-language next steps', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => typeof window.parsePlanJson === 'function');

    const res = await page.evaluate(() => window.parsePlanJson({}));
    expect(res.ok).toBeFalsy();
    expect(res.error).toMatch(/valid PulseCap plan JSON/i);
    expect(res.error).toMatch(/Export.*PulseCap JSON|paste the plan text/i);
  });
});

