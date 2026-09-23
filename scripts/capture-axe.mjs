/**
 * Capture axe-core results for finish-loop (C-32).
 * Usage: node scripts/capture-axe.mjs
 * Requires a local server on :8766 (or set BASE_URL).
 */
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:8766';
const OUT = path.join('qa', 'finish-loop', 'axe');
const ROUTES = [{ id: 'home-demo', path: '/?demo=1' }];
const THEMES = ['light', 'dark'];

async function waitReady(page) {
  await page.waitForFunction(
    () => window.__APP_READY__ === true || document.documentElement.dataset.appReady === 'true',
    null,
    { timeout: 20000 },
  );
}

async function applyTheme(page, theme) {
  await page.addInitScript((t) => {
    try {
      localStorage.setItem('pc_theme', t);
      document.documentElement.setAttribute('data-theme', t);
    } catch (_) {}
  }, theme);
}

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const results = [];

for (const route of ROUTES) {
  for (const theme of THEMES) {
    const context = await browser.newContext({
      viewport: { width: 393, height: 852 },
    });
    const page = await context.newPage();
    await applyTheme(page, theme);
    await page.goto(BASE + route.path, { waitUntil: 'domcontentloaded' });
    await waitReady(page).catch(async () => {
      await page.waitForTimeout(2000);
    });
    await page.evaluate((t) => {
      document.documentElement.setAttribute('data-theme', t);
      try {
        localStorage.setItem('pc_theme', t);
      } catch (_) {}
    }, theme);
    await page.waitForTimeout(400);

    const axe = await new AxeBuilder({ page }).analyze();
    const outName = `${route.id}-${theme}.json`;
    const payload = {
      url: page.url(),
      route: route.id,
      theme,
      timestamp: new Date().toISOString(),
      violations: axe.violations,
      passes: axe.passes?.length ?? 0,
      incomplete: axe.incomplete?.length ?? 0,
      inapplicable: axe.inapplicable?.length ?? 0,
    };
    fs.writeFileSync(path.join(OUT, outName), JSON.stringify(payload, null, 2));
    const serious = axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    results.push({
      file: outName,
      violations: axe.violations.length,
      serious: serious.length,
      ids: serious.map((v) => v.id),
    });
    await context.close();
  }
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
const bad = results.filter((r) => r.serious > 0);
process.exit(bad.length ? 1 : 0);
