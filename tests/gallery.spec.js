// @ts-check
// Screen gallery — every screen, tab, and flow step, in dark + light,
// at mobile + desktop widths.
// Default `playwright test`: walk all states, assert render (no PNG churn).
// `npm run gallery` (CAPTURE_GALLERY=1): write viewport + scroll PNGs + manifest (VaultCap-style).
const { test, expect } = require('@playwright/test');
const { mkdirSync, writeFileSync, readFileSync } = require('node:fs');
const { join } = require('node:path');

const GALLERY_DIR = join(process.cwd(), 'docs', 'screenshots', 'gallery');
/** Min overflow (px) before capturing a bottom-of-scroll companion shot. */
const SCROLL_MIN = 80;

/* Every screen + sub-tab worth a shot. stateId keeps filenames stable/unique;
   go = the router call; section = gallery grouping. */
const SCREENS = [
  // Today
  { stateId: 'dashboard', label: 'Dashboard', section: 'Today', go: ['dashboard'] },

  // Train
  { stateId: 'workout', label: 'Workout Plan', section: 'Train', go: ['workout'] },
  { stateId: 'cardio', label: 'Cardio', section: 'Train', go: ['cardio'] },

  // Progress
  { stateId: 'progress', label: 'Progress', section: 'Progress', go: ['progress'] },
  { stateId: 'photos', label: 'Progress Photos', section: 'Progress', go: ['photos'] },

  // Programs
  { stateId: 'my-plan', label: 'My Plan', section: 'Programs', go: ['my-plan'] },
  { stateId: 'plan-import', label: 'Plan Import Review', section: 'Programs', go: ['plan-import'] },

  // Body (kept nested under Me for now; Phase 4–8 may fold)
  { stateId: 'nutrition', label: 'Nutrition', section: 'Me', go: ['nutrition'] },
  { stateId: 'recovery', label: 'Recovery Check-in', section: 'Me', go: ['recovery', { tab: 'checkin' }] },
  { stateId: 'rehab', label: 'Rehab', section: 'Me', go: ['rehab'] },

  // Me
  { stateId: 'settings-account', label: 'Settings · Account', section: 'Me', go: ['settings', { tab: 'account' }] },
  { stateId: 'settings-training', label: 'Settings · Training', section: 'Me', go: ['settings', { tab: 'training' }] },
  { stateId: 'settings-fuel', label: 'Settings · Fuel', section: 'Me', go: ['settings', { tab: 'fuel' }] },
  { stateId: 'settings-appearance', label: 'Settings · Appearance', section: 'Me', go: ['settings', { tab: 'appearance' }] },
  { stateId: 'settings-accessibility', label: 'Settings · Access', section: 'Me', go: ['settings', { tab: 'accessibility' }] },
  { stateId: 'settings-notifications', label: 'Settings · Alerts', section: 'Me', go: ['settings', { tab: 'notifications' }] },
  { stateId: 'settings-privacy', label: 'Settings · Privacy', section: 'Me', go: ['settings', { tab: 'privacy' }] },
  { stateId: 'settings-about', label: 'Settings · About', section: 'Me', go: ['settings', { tab: 'about' }] },
  { stateId: 'profiles', label: 'Profiles', section: 'Me', go: ['profiles'] },
  { stateId: 'equipment-setup', label: 'Equipment Setup', section: 'Me', go: ['equipment-setup'] },
  { stateId: 'split-builder', label: 'Split Builder', section: 'Me', go: ['split-builder'] },
];

/* First-run flow — intro slides + onboarding steps. Driven via __pcOnboardingState. */
const INTRO_COUNT = 1;
const OB_STEPS = 4;
const OB_SEED = {
  name: 'Alex', goal: 'hypertrophy', exp: 'intermediate', gender: 'male',
  age: 26, units: 'metric', height: 180, weight: 82, goalWeight: 78,
  targetBodyFat: 15, personality: 'maya',
};

const VIEWPORTS = {
  mobile: { width: 393, height: 852, dsf: 2 },
  desktop: { width: 1440, height: 900, dsf: 1 },
};
const THEMES = ['dark', 'light'];
const CAPTURE = process.env.CAPTURE_GALLERY === '1';

function appendManifest(shots) {
  const manifestPath = join(GALLERY_DIR, 'gallery-manifest.json');
  let existing = { shots: [] };
  try { existing = JSON.parse(readFileSync(manifestPath, 'utf8')); } catch { /* first writer */ }
  const merged = [...existing.shots.filter((s) => !shots.some((n) => n.file === s.file)), ...shots];
  merged.sort((a, b) => a.file.localeCompare(b.file));
  const version = JSON.parse(readFileSync(join(process.cwd(), 'VERSION.json'), 'utf8')).version;
  writeFileSync(
    manifestPath,
    JSON.stringify({ app: 'PulseCap', version, generated: new Date().toISOString(), shots: merged }, null, 2),
  );
}

async function bootDemo(page) {
  await page.goto('/?demo=1');
  await page.waitForFunction(
    () => typeof window.S !== 'undefined' && window.S.activeId && window.S.activeId() === 'demo',
    undefined,
    { timeout: 30_000 },
  );
  await page.waitForTimeout(500);
}

async function setTheme(page, theme) {
  await page.evaluate((t) => window.applyTheme(t, false), theme);
  await page.waitForTimeout(120);
}

async function waitReady(page) {
  await page.waitForFunction(() => {
    const scr = document.querySelector('#view .screen');
    if (!scr) return false;
    const t = (scr.textContent || '').trim();
    return t !== 'Loading…' && t !== 'Loading...';
  }, undefined, { timeout: 15000 });
  await page.waitForTimeout(300);
}

async function scrollViewTop(page) {
  await page.evaluate(() => {
    const v = document.getElementById('view');
    if (v) v.scrollTop = 0;
    window.scrollTo(0, 0);
  });
}

/** Find primary scroll container (#view) and overflow amount. */
async function findScrollTarget(page) {
  return page.evaluate(() => {
    const candidates = ['#view', '#view .screen', '.ob-body', '.modal-body', '#modal .body'];
    let best = null;
    for (let i = 0; i < candidates.length; i++) {
      const el = document.querySelector(candidates[i]);
      if (!el) continue;
      const overflow = el.scrollHeight - el.clientHeight;
      if (!best || overflow > best.overflow) best = { selector: candidates[i], overflow: overflow };
    }
    return best;
  });
}

async function scrollTargetToEnd(page, target) {
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) el.scrollTop = el.scrollHeight;
  }, target.selector);
}

/**
 * VaultCap-style: if content overflows, shoot bottom of scroll as companion PNG.
 * @returns {Promise<object|null>} manifest entry or null
 */
async function maybeScrollShot(page, baseFile, meta) {
  const target = await findScrollTarget(page);
  if (!target || target.overflow < SCROLL_MIN) return null;
  await scrollTargetToEnd(page, target);
  await page.waitForTimeout(220);
  const file = baseFile.replace(/\.png$/, '-scroll.png');
  await page.screenshot({ path: join(GALLERY_DIR, file), fullPage: false });
  await scrollViewTop(page);
  await page.waitForTimeout(80);
  return Object.assign({}, meta, { file: file, scroll: true, label: meta.label + ' (scroll)' });
}

/** Visual integrity — more than "element exists". */
async function assertVisualOk(page, label) {
  const report = await page.evaluate(() => {
    const view = document.querySelector('#view');
    const scr = document.querySelector('#view .screen');
    const t = (view && view.textContent) || '';
    const issues = [];
    if (!scr) issues.push('missing .screen');
    if (/Screen error:|Could not load screen/.test(t)) issues.push('fatal screen chrome');
    if ((scr && (scr.textContent || '').trim().length) < 8) issues.push('near-empty screen');
    // Icon-only / empty chrome buttons without accessible name
    const badBtns = [...document.querySelectorAll('#view button')].filter((b) => {
      const label = ((b.getAttribute('aria-label') || '') + (b.textContent || '')).trim();
      return !label && b.offsetParent !== null;
    }).length;
    if (badBtns > 0) issues.push(badBtns + ' unlabeled buttons');
    return { issues, len: (scr && scr.textContent || '').trim().length };
  });
  expect(report.issues, `${label}: ${report.issues.join('; ')}`).toEqual([]);
}

for (const [viewport, vp] of Object.entries(VIEWPORTS)) {
  test.describe(`Screen gallery — ${viewport}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.dsf });

    test.beforeAll(() => { mkdirSync(GALLERY_DIR, { recursive: true }); });

    test(`${CAPTURE ? 'capture' : 'walk'} ${viewport} screens (dark + light)`, async ({ page }) => {
      test.setTimeout(CAPTURE ? 900_000 : 180_000);
      await bootDemo(page);

      const shots = [];
      let n = 0;

      for (const theme of THEMES) {
        await setTheme(page, theme);

        // Registered screens + tabs
        for (const s of SCREENS) {
          const ok = await page.evaluate((g) => {
            try { window.go(g[0], g[1]); return true; } catch { return false; }
          }, s.go);
          expect(ok, `go('${s.stateId}') should not throw`).toBe(true);
          await waitReady(page);
          await assertVisualOk(page, `${theme}/${viewport}/${s.stateId}`);
          if (CAPTURE) {
            n += 1;
            await scrollViewTop(page);
            const file = `${theme}-${viewport}-${String(n).padStart(3, '0')}-${s.stateId}.png`;
            await page.screenshot({ path: join(GALLERY_DIR, file), fullPage: false });
            const meta = { file, theme, viewport, section: s.section, screenId: s.stateId, label: s.label, route: `go('${s.go[0]}'${s.go[1] ? ', ' + JSON.stringify(s.go[1]) : ''})`, scroll: false };
            shots.push(meta);
            const scrollShot = await maybeScrollShot(page, file, meta);
            if (scrollShot) shots.push(scrollShot);
          }
        }

        // First-run flow: intro slides
        for (let i = 0; i < INTRO_COUNT; i += 1) {
          await page.evaluate((idx) => { window.__pcOnboardingState({ intro: idx }); window.go('onboarding', { showIntro: true }); }, i);
          await waitReady(page);
          if (CAPTURE) {
            n += 1;
            await scrollViewTop(page);
            const file = `${theme}-${viewport}-${String(n).padStart(3, '0')}-intro-${i + 1}.png`;
            await page.screenshot({ path: join(GALLERY_DIR, file), fullPage: false });
            const meta = { file, theme, viewport, section: 'Onboarding', screenId: `intro-${i + 1}`, label: `Welcome ${i + 1}/${INTRO_COUNT}`, route: "go('onboarding',{showIntro:true})", scroll: false };
            shots.push(meta);
            const scrollShot = await maybeScrollShot(page, file, meta);
            if (scrollShot) shots.push(scrollShot);
          }
        }

        // First-run flow: onboarding steps
        for (let step = 1; step <= OB_STEPS; step += 1) {
          await page.evaluate((cfg) => { window.__pcOnboardingState({ step: cfg.step, data: cfg.seed }); window.go('onboarding'); }, { step, seed: OB_SEED });
          await waitReady(page);
          if (CAPTURE) {
            n += 1;
            await scrollViewTop(page);
            const file = `${theme}-${viewport}-${String(n).padStart(3, '0')}-onboarding-${step}.png`;
            await page.screenshot({ path: join(GALLERY_DIR, file), fullPage: false });
            const meta = { file, theme, viewport, section: 'Onboarding', screenId: `onboarding-${step}`, label: `Onboarding ${step}/${OB_STEPS}`, route: `onboarding step ${step}`, scroll: false };
            shots.push(meta);
            const scrollShot = await maybeScrollShot(page, file, meta);
            if (scrollShot) shots.push(scrollShot);
          }
        }

        // Active workout — live session
        const activeOk = await page.evaluate(() => {
          try {
            window.S.set('programWeightsConfirmed', true);
            if (window.S.g('activeWorkoutDraft')) window.discardWorkoutDraft();
            window.startWorkout();
            return !!document.getElementById('wkt-header');
          } catch { return false; }
        });
        expect(activeOk, 'active workout should render').toBe(true);
        await page.waitForTimeout(500);
        if (CAPTURE) {
          n += 1;
          await scrollViewTop(page);
          const activeFile = `${theme}-${viewport}-${String(n).padStart(3, '0')}-active.png`;
          await page.screenshot({ path: join(GALLERY_DIR, activeFile), fullPage: false });
          const meta = { file: activeFile, theme, viewport, section: 'Train', screenId: 'active', label: 'Active Workout', route: 'startWorkout()', scroll: false };
          shots.push(meta);
          const scrollShot = await maybeScrollShot(page, activeFile, meta);
          if (scrollShot) shots.push(scrollShot);
        }

        // Return to a clean screen before switching theme
        await page.evaluate(() => window.go('dashboard'));
        await waitReady(page);
      }

      if (CAPTURE) appendManifest(shots);
    });
  });
}
