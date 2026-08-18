// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Phase 34 — edge states copy', () => {
  test('storage full shows export-backup next step', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForFunction(() => window.S && window.S._pid && typeof window.toast === 'function');

    const msg = await page.evaluate(() => {
      const proto = Storage.prototype;
      const orig = proto.setItem;
      proto.setItem = function() {
        const e = new Error('The quota has been exceeded.');
        e.name = 'QuotaExceededError';
        throw e;
      };
      try {
        window.S.set('user.name', 'QuotaTest');
        const t = document.querySelector('#toast .toast-msg');
        return t ? String(t.textContent || '') : '';
      } finally {
        proto.setItem = orig;
      }
    });

    expect(msg).toMatch(/Storage is full/i);
    expect(msg).toMatch(/Export a backup/i);
    expect(msg).toMatch(/before adding more data/i);
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
