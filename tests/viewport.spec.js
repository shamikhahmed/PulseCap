// @ts-check
const { test, expect } = require('@playwright/test');
const {
  resize,
  assertCapSharedMobile,
  assertCapSharedDesktop,
} = require('./helpers/viewport-helpers');

test.describe('PulseCap viewport contract', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.buildNav === 'function');
    await page.waitForTimeout(400);
  });

  test('320px — small phone shell', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    await assertCapSharedMobile(page, expect);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
    expect(overflow).toBeFalsy();
  });

  test('390px — iPhone 12/13 shell, no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await assertCapSharedMobile(page, expect);
    await page.evaluate(() => window.go('my-plan'));
    await page.waitForTimeout(200);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
    expect(overflow).toBeFalsy();
    await expect(page.locator('#view')).toContainText(/My Plan|Machine-only|Install|Import/i);
  });

  test('393px — iPhone 14/15 shell + safe-area padding', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--safe', '34px');
      document.documentElement.style.setProperty('--top-safe', '47px');
    });
    await assertCapSharedMobile(page, expect);
    const clearance = await page.evaluate(() => {
      const view = document.getElementById('view');
      if (!view) return { pb: 0, spacer: 0 };
      const pb = parseFloat(getComputedStyle(view).paddingBottom) || 0;
      const sp = document.querySelector('.spacer-bottom');
      const spacer = sp ? (parseFloat(getComputedStyle(sp).height) || 0) : 0;
      return { pb, spacer };
    });
    // Must clear floating pill (~60) + safe (34) without double-counting spacer
    expect(clearance.pb).toBeGreaterThanOrEqual(100);
    expect(clearance.pb).toBeLessThan(130);
    expect(clearance.spacer).toBeLessThanOrEqual(16);
  });

  test('430px — large phone shell', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 });
    await assertCapSharedMobile(page, expect);
  });

  test('light theme — secondary text contrast tokens', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.evaluate(() => window.applyTheme('light', false));
    await page.waitForTimeout(100);
    const ok = await page.evaluate(() => {
      const cs = getComputedStyle(document.documentElement);
      const txt3 = cs.getPropertyValue('--txt3').trim();
      // Must not be the old ultra-faint 0.42 alpha
      return txt3.includes('0.58') || txt3.includes('0.55') || !txt3.includes('0.42');
    });
    expect(ok).toBeTruthy();
    await page.evaluate(() => window.go('nutrition'));
    await page.waitForTimeout(300);
    await expect(page.locator('#view .screen')).toBeVisible();
  });

  test('768px — tablet mid breakpoint', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(200);
    await expect(page.locator('#view')).toBeVisible();
  });

  test('375px — phone shell and bottom nav', async ({ page }) => {
    await resize(page, 'mobile');
    await assertCapSharedMobile(page, expect);
  });

  test('744px — iPad mini band uses sidebar (Cap BP 700)', async ({ page }) => {
    await page.setViewportSize({ width: 744, height: 1133 });
    await page.waitForTimeout(200);
    await page.evaluate(() => {
      if (window.CapDesktopNav && window.CapDesktopNav.sync) window.CapDesktopNav.sync();
    });
    await page.waitForTimeout(80);
    await expect(page.locator('body')).toHaveClass(/cap-desktop-nav/);
    await expect(page.locator('#cap-nav-sidebar')).toBeVisible();
    await expect(page.locator('#nav')).toBeHidden();
  });

  test('699px — just under Cap BP keeps phone tabs', async ({ page }) => {
    await page.setViewportSize({ width: 699, height: 900 });
    await page.waitForTimeout(200);
    await page.evaluate(() => {
      if (window.CapDesktopNav && window.CapDesktopNav.sync) window.CapDesktopNav.sync();
    });
    await page.waitForTimeout(80);
    await expect(page.locator('body')).not.toHaveClass(/cap-desktop-nav/);
    await expect(page.locator('#nav')).toBeVisible();
  });
});
