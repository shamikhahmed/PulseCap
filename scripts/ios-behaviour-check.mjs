#!/usr/bin/env node
/**
 * iPhone/WebKit behaviour check (Cap fleet mobile bugs), adapted from ScentCap scripts/ios-behaviour-check.mjs.
 * Usage: node scripts/static-server.mjs 8766  →  node scripts/ios-behaviour-check.mjs [baseUrl]   (default http://127.0.0.1:8766/)
 * Checks: tab bar + header controls tappable, no sideways overflow, the document (not #view) scrolls,
 * navigation opens at top without reloading, sheets keep the page position, inputs ≥16px, SW doesn't self-activate.
 */
import { webkit, devices } from '@playwright/test';
import fs from 'node:fs';

const BASE = process.argv[2] || 'http://127.0.0.1:8766/';
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok, detail });
const step = async (name, fn) => {
  try {
    await fn();
  } catch (e) {
    check(name, false, String(e.message || e).split('\n')[0]);
  }
};

const browser = await webkit.launch();
const ctx = await browser.newContext({ ...devices['iPhone 15 Pro'], serviceWorkers: 'block' });
const page = await ctx.newPage();
page.setDefaultTimeout(8000);
await page.addInitScript(() => localStorage.setItem('pulsecap-splash-seen', '1'));

await page.goto(BASE + '?demo=1');
await page.waitForFunction(() => typeof window.go === 'function' && document.getElementById('nav') && !document.getElementById('nav').hidden, { timeout: 45000 });
await page.evaluate(() => { if (typeof closeModal === 'function') closeModal(); window.go('dashboard'); });
await page.waitForTimeout(1200);
await page.evaluate(() => { window.__noReload = 1; });

const go = async (id) => {
  await page.evaluate((s) => { if (typeof closeModal === 'function') closeModal(); window.go(s); }, id);
  await page.waitForTimeout(600);
};

// 1. Tabs and header controls are the topmost element at their centre
const covered = await page.evaluate(() =>
  [...document.querySelectorAll('#nav .nb, .topbar button')]
    .filter((t) => t.offsetParent !== null)
    .filter((t) => {
      const r = t.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return !t.contains(hit);
    })
    .map((t) => t.getAttribute('aria-label') || t.textContent.trim()),
);
check('tab bar + header controls tappable', covered.length === 0, covered.join(','));

const small = await page.evaluate(() =>
  [...document.querySelectorAll('#nav .nb')]
    .filter((t) => t.offsetParent !== null)
    .filter((t) => { const r = t.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).length,
);
check('hit areas ≥44pt (tabs)', small === 0, `${small} small`);

const bar = await page.evaluate(() => {
  const r = document.getElementById('nav').getBoundingClientRect();
  return { gap: innerHeight - r.bottom, pad: parseFloat(getComputedStyle(document.getElementById('view')).paddingBottom), h: r.height };
});
check('tab bar floats ≥14px above bottom', bar.gap >= 14, JSON.stringify(bar));
check('content padding clears tab bar', bar.pad >= bar.h + 48, JSON.stringify(bar));

// 2. The document scrolls; no sideways overflow on primary screens
for (const pg of ['dashboard', 'workout', 'progress', 'programs', 'settings']) {
  await go(pg);
  const m = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    iw: innerWidth,
    docScroll: document.scrollingElement.scrollHeight > innerHeight,
    view: getComputedStyle(document.getElementById('view')).overflowY,
    body: getComputedStyle(document.body).overflowY,
  }));
  check(`no sideways overflow · ${pg}`, m.sw <= m.iw + 1, `${m.sw} > ${m.iw}`);
  check(`document scrolls (no inner scroller) · ${pg}`, m.docScroll && m.view === 'visible' && m.body !== 'hidden', JSON.stringify(m));
}

// 2b. The document really scrolls (and instantly — no smooth-scroll animation)
check('programmatic scroll lands instantly', await page.evaluate(() => { window.scrollTo(0, 300); const y = window.scrollY; window.scrollTo(0, 0); return y >= 250; }));

// 3. Navigation by tapping: shell stays, new screen opens at top, no reload
await step('navigation by tapping', async () => {
  await go('dashboard');
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(200);
  await page.locator('#nb-progress').tap();
  await page.waitForTimeout(700);
  const nav = await page.evaluate(() => ({ y: scrollY, on: document.querySelector('#nav .nb.on')?.id, marker: window.__noReload }));
  check('tab tap keeps shell (no reload)', nav.on === 'nb-progress' && nav.marker === 1, JSON.stringify(nav));
  check('new screen opens at top', nav.y === 0, `scrollY ${nav.y}`);
});

// 4. Sheet keeps the page position (Progress → Log weight → close)
let smallInputs = -1;
await step('sheet flow', async () => {
  await go('progress');
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(200);
  const before = await page.evaluate(() => scrollY);
  await page.evaluate(() => window.showLogWeight());
  await page.locator('#_modal .modal-sheet').waitFor();
  await page.waitForTimeout(400);
  const locked = await page.evaluate(() => document.body.style.position);
  smallInputs = await page.evaluate(() =>
    [...document.querySelectorAll('#_modal input, #_modal select, #_modal textarea')]
      .filter((el) => el.offsetParent !== null && parseFloat(getComputedStyle(el).fontSize) < 16).length,
  );
  await page.locator('#_modal .modal-close').first().tap();
  await page.waitForTimeout(500);
  const after = await page.evaluate(() => scrollY);
  check('page locked behind sheet', locked === 'fixed', `body position "${locked}"`);
  check('sheet keeps scroll position', Math.abs(after - before) < 4, `before ${before} after ${after}`);
});
check('inputs ≥16px (no zoom-on-focus)', smallInputs === 0, `${smallInputs} small`);
check('no reload during session', (await page.evaluate(() => window.__noReload)) === 1);

// 5. Service worker never self-activates over a running app (skipWaiting only on the user's "Reload")
const sw = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
const autoSkip = sw.replace(/addEventListener\('message'[\s\S]*?\}\);/, '');
check('SW: skipWaiting only on user request', !/skipWaiting\(\)/.test(autoSkip));

await browser.close();
let fail = 0;
for (const r of results) {
  if (!r.ok) fail++;
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok || !r.detail ? '' : `  (${r.detail})`}`);
}
process.exit(fail ? 1 : 0);
