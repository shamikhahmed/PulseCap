// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('v6.1 gym tools', () => {
  test('WakeLock / VoiceLogger / MobilityFlow / PainFlag / BarcodeFood online', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForFunction(() => window.S && window.S.activeId && window.S.activeId() === 'demo', undefined, { timeout: 30000 });
    await page.waitForTimeout(400);

    const ok = await page.evaluate(() => {
      const need = ['WakeLock', 'VoiceLogger', 'BarcodeFood', 'MobilityFlow', 'PainFlag'];
      const missing = need.filter((n) => typeof window[n] === 'undefined');
      const parsed = window.VoiceLogger.parseUtterance('135 for 8 rpe 7');
      const flows = window.MobilityFlow.list();
      const pain = window.PainFlag.flagPain('shoulder');
      const meal = window.BarcodeFood.lookupLocal('0000001');
      const exNoEm = (window.ExDB && window.ExDB.db && window.ExDB.db[0] && window.ExDB.db[0].em == null);
      return {
        missing,
        weight: parsed.weight,
        reps: parsed.reps,
        rpe: parsed.rpe,
        flowCount: flows.length,
        painGo: pain && pain.go,
        mealName: meal && meal.name,
        exNoEm: !!exNoEm
      };
    });

    expect(ok.missing, 'missing: ' + ok.missing.join(',')).toEqual([]);
    expect(ok.weight).toBe(135);
    expect(ok.reps).toBe(8);
    expect(ok.rpe).toBe(7);
    expect(ok.flowCount).toBeGreaterThanOrEqual(3);
    expect(ok.painGo).toBe('rehab');
    expect(ok.mealName).toBeTruthy();
    expect(ok.exNoEm).toBeTruthy();
  });

  test('recovery shows mobility + nutrition has barcode section', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForFunction(() => window.S && window.S.activeId && window.S.activeId() === 'demo', undefined, { timeout: 30000 });

    await page.evaluate(() => window.go('recovery'));
    await page.waitForTimeout(300);
    const rec = await page.locator('#view').innerText();
    expect(rec).toMatch(/Mobility/i);

    await page.evaluate(() => window.go('nutrition'));
    await page.waitForTimeout(300);
    const nut = await page.locator('#view').innerText();
    expect(nut).toMatch(/barcode|Scan/i);
  });
});
