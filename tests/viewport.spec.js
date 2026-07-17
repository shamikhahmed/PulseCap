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

  test('430px — large phone shell', async ({ page }) => {
    await page.setViewportSize({ width: 430, height: 932 });
    await assertCapSharedMobile(page, expect);
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

  test('1280px — sidebar and full-width main', async ({ page }) => {
    await resize(page, 'desktop');
    await assertCapSharedDesktop(page, expect);
  });
});
