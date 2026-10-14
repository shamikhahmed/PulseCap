#!/usr/bin/env node
/** Live-URL gallery v3 — primary tabs × light/dark × iphone/ipad/mac (PLS-V3-3). */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync, existsSync, unlinkSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const GALLERY_DIR = join(ROOT, 'docs', 'screenshots', 'gallery');
const MANIFEST = join(GALLERY_DIR, 'gallery-manifest.json');
const BASE = process.env.GALLERY_BASE_URL || 'https://shamikhahmed.github.io/PulseCap/?demo=1';
const ACCENT = '#FF453A';
const CAPTURED_AT = new Date().toISOString();
const CLOCK_MS = Date.parse('2026-10-14T12:00:00.000Z');

const pwRoot =
  process.env.PW_CORE || join(ROOT, '..', 'MasteryCap', 'node_modules', 'playwright-core');
const { chromium } = createRequire(import.meta.url)(pwRoot);

const VIEWPORTS = {
  iphone: { width: 390, height: 844, deviceScaleFactor: 3 },
  ipad: { width: 1180, height: 820, deviceScaleFactor: 2 },
  mac: { width: 1440, height: 900, deviceScaleFactor: 2 },
};

const SCREENS = [
  { nav: 'dashboard', group: 'Today', screen: 'Today', caption: 'Today’s session, readiness and Smart Coach at a glance.' },
  { nav: 'workout', group: 'Train', screen: 'Workout', caption: 'Log a set in two taps — rest timer included.' },
  { nav: 'library', group: 'Train', screen: 'Exercise library', caption: '1,872 exercises with muscles, cues and equipment.' },
  { nav: 'my-plan', group: 'Plan', screen: 'My plan', caption: 'Your program, week by week.' },
  { nav: 'plan-import', group: 'Plan', screen: 'Import a plan', caption: 'Paste text or JSON, or pick a PDF — you review it before it’s saved.' },
  { nav: 'split-builder', group: 'Plan', screen: 'Split builder', caption: 'Build your own training split.' },
  { nav: 'progress', group: 'Progress', screen: 'Progress', caption: 'PRs, volume and trends.' },
  { nav: 'recovery', group: 'Progress', screen: 'Recovery', caption: 'Recovery readiness without a wearable.' },
  { nav: 'photos', group: 'Progress', screen: 'Photos', caption: 'Progress photos that stay on your phone.' },
  { nav: 'rehab', group: 'Health', screen: 'Rehab', caption: 'Mobility and rehab work — general guidance, not medical advice.' },
  { nav: 'nutrition', group: 'Health', screen: 'Nutrition', caption: 'Meals and macros, offline.' },
  { nav: 'profiles', group: 'You', screen: 'Profiles', caption: 'A profile for everyone who trains on this device.' },
  { nav: 'equipment-setup', group: 'You', screen: 'Equipment', caption: 'Tell PulseCap what your gym has.' },
  { nav: 'settings', group: 'You', screen: 'Settings', caption: 'Units, theme, data and privacy.' },
];

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function shotPath(theme, device, group, screen) {
  return `${theme}/${device}/${slug(group)}--${slug(screen)}--demo.webp`;
}

function pngToWebp(pngPath, webpPath) {
  mkdirSync(dirname(webpPath), { recursive: true });
  if (spawnSync('cwebp', ['-q', '82', pngPath, '-o', webpPath]).status === 0 && existsSync(webpPath)) {
    try {
      unlinkSync(pngPath);
    } catch {
      /* keep */
    }
    return;
  }
  spawnSync('cp', [pngPath, webpPath]);
}

function wipeLegacyGallery() {
  mkdirSync(GALLERY_DIR, { recursive: true });
  for (const f of readdirSync(GALLERY_DIR)) {
    if (/\.(png|webp)$/i.test(f)) {
      try {
        unlinkSync(join(GALLERY_DIR, f));
      } catch {
        /* dir walk below */
      }
    }
  }
  for (const theme of ['light', 'dark']) {
    for (const device of ['iphone', 'ipad', 'mac']) {
      const sub = join(GALLERY_DIR, theme, device);
      if (!existsSync(sub)) continue;
      for (const f of readdirSync(sub)) {
        if (f.endsWith('.webp') || f.endsWith('.png')) unlinkSync(join(sub, f));
      }
    }
  }
}

async function waitReady(page) {
  await page.waitForFunction(
    () => {
      const scr = document.querySelector('#view .screen');
      if (!scr) return false;
      const t = (scr.textContent || '').trim();
      return t !== 'Loading…' && t !== 'Loading...';
    },
    null,
    { timeout: 25000 },
  );
  await page.waitForTimeout(350);
}

async function bootDemo(page) {
  await page.waitForFunction(
    () => typeof window.go === 'function' && window.__APP_READY__ === true,
    null,
    { timeout: 45000 },
  );
  await page.evaluate(() => {
    if (typeof CapDemo !== 'undefined') CapDemo.dismissBanner('pulsecap');
    const el = document.getElementById('cap-demo-banner');
    if (el) el.hidden = true;
  });
  await page.waitForTimeout(400);
}

async function setTheme(page, theme) {
  await page.emulateMedia({ colorScheme: theme });
  await page.evaluate((t) => window.applyTheme(t, true), theme);
  await page.waitForTimeout(180);
}

async function goNav(page, scr) {
  await page.evaluate(
    ({ nav, data }) => {
      window.go(nav, data);
    },
    { nav: scr.nav, data: scr.data },
  );
  await waitReady(page);
  const navTab = scr.nav === 'my-plan' ? 'programs' : scr.nav;
  await page.waitForFunction(
    (id) => document.getElementById('nb-' + id)?.classList.contains('on'),
    navTab,
    { timeout: 15000 },
  ).catch(() => {});
}

async function main() {
  wipeLegacyGallery();
  const shots = [];
  const browser = await chromium.launch({ headless: true });
  try {
    for (const [device, vp] of Object.entries(VIEWPORTS)) {
      for (const theme of ['light', 'dark']) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          deviceScaleFactor: vp.deviceScaleFactor,
          colorScheme: theme,
          isMobile: device !== 'mac',
          hasTouch: device !== 'mac',
        });
        await context.addInitScript((ms) => {
          const RealDate = Date;
          class FakeDate extends RealDate {
            constructor(...args) {
              if (args.length === 0) super(ms);
              else super(...args);
            }
            static now() {
              return ms;
            }
          }
          FakeDate.prototype = RealDate.prototype;
          window.Date = FakeDate;
        }, CLOCK_MS);
        const page = await context.newPage();
        await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await bootDemo(page);
        await setTheme(page, theme);

        for (const scr of SCREENS) {
          try {
            await goNav(page, scr);
          } catch (err) {
            process.stdout.write(`skip ${theme}/${device} ${scr.nav || scr.path}: unreachable — skipped\n`);
            continue;
          }
          await setTheme(page, theme);
          const rel = shotPath(theme, device, scr.group, scr.screen);
          const webpPath = join(GALLERY_DIR, rel);
          const pngPath = webpPath.replace(/\.webp$/, '.png');
          mkdirSync(dirname(pngPath), { recursive: true });
          await page.screenshot({ path: pngPath, animations: 'disabled' });
          pngToWebp(pngPath, webpPath);
          shots.push({
            id: `${slug(scr.group)}--${slug(scr.screen)}--demo`,
            group: scr.group,
            screen: scr.screen,
            state: 'demo',
            theme,
            device,
            file: rel,
            route: `#/${scr.nav}`,
            caption: scr.caption,
            w: vp.width * vp.deviceScaleFactor,
            h: vp.height * vp.deviceScaleFactor,
          });
          process.stdout.write(`✓ ${theme}/${device}/${scr.nav}\n`);
        }
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }

  const version = JSON.parse(readFileSync(join(ROOT, 'VERSION.json'), 'utf8')).version;
  writeFileSync(
    MANIFEST,
    JSON.stringify({ app: 'PulseCap', version, capturedAt: CAPTURED_AT, accent: ACCENT, schema: 2, shots }, null, 2),
  );
  console.log(`\nPulseCap gallery v3: ${shots.length} shots → ${MANIFEST}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
