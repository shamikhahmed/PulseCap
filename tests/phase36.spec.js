// @ts-check
const { test, expect } = require('@playwright/test');
const { readFileSync } = require('fs');
const { join } = require('path');

test.describe('Phase 36 — PWA chrome + boot', () => {
  test('manifest, theme-color, maskable icons, and iOS launch images are wired', async ({ page }) => {
    const ver = require('../VERSION.json');
    await page.goto('/');
    await page.waitForFunction(() => typeof window.APP_VERSION === 'string');

    const meta = await page.evaluate(() => {
      const themeEl = function() { return document.querySelector('meta[name="theme-color"]'); };
      window.applyTheme('dark', false);
      const dark = themeEl() && themeEl().getAttribute('content');
      window.applyTheme('light', false);
      const light = themeEl() && themeEl().getAttribute('content');
      window.applyTheme('dark', false);
      const startups = Array.from(document.querySelectorAll('link[rel="apple-touch-startup-image"], meta[name="apple-touch-startup-image"]'));
      const touchIcons = Array.from(document.querySelectorAll('link[rel="apple-touch-icon"]'));
      const manifest = document.querySelector('link[rel="manifest"]');
      return {
        dark: dark,
        light: light,
        startupCount: startups.length,
        touchIconCount: touchIcons.length,
        manifestHref: manifest && manifest.getAttribute('href')
      };
    });

    expect(meta.dark && meta.dark.toUpperCase()).toBe('#0A0A0B');
    expect(meta.light && meta.light.toUpperCase()).toBe('#F5F5F7');
    expect(meta.startupCount).toBeGreaterThanOrEqual(12);
    expect(meta.touchIconCount).toBeGreaterThanOrEqual(3);
    expect(meta.manifestHref).toMatch(/manifest\.json/);

    const man = JSON.parse(readFileSync(join(process.cwd(), 'manifest.json'), 'utf8'));
    expect(man.theme_color.toUpperCase()).toBe('#0A0A0B');
    expect(man.background_color.toUpperCase()).toBe('#0A0A0B');
    const maskable = (man.icons || []).filter((i) => String(i.purpose || '').includes('maskable'));
    const anyMaskableCombo = (man.icons || []).filter((i) => /\bany\b.*\bmaskable\b|\bmaskable\b.*\bany\b/.test(String(i.purpose || '')));
    expect(maskable.length).toBeGreaterThanOrEqual(2);
    expect(anyMaskableCombo).toEqual([]);
    expect(ver.swCache).toMatch(/^pulsecap-v\d+$/);
  });

  test('fresh boot reaches Today with no page errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await page.waitForFunction(() => typeof window.introQuickStart === 'function');
    await page.evaluate(() => window.introQuickStart());
    await page.waitForFunction(() => !!document.querySelector('.dash-session'));
    expect(errors).toEqual([]);
  });
});
