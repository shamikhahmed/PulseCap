// @ts-check
// Screen gallery — every screen, tab, and flow step, in dark + light,
// at mobile + desktop widths.
// Default `playwright test`: walk all states, assert render (no PNG churn).
// `npm run gallery` (CAPTURE_GALLERY=1): write 200 PNGs + manifest.
const { test, expect } = require('@playwright/test');
const { mkdirSync, writeFileSync, readFileSync } = require('node:fs');
const { join } = require('node:path');

const GALLERY_DIR = join(process.cwd(), 'docs', 'screenshots', 'gallery');

/* Every screen + sub-tab worth a shot. stateId keeps filenames stable/unique;
   go = the router call; section = gallery grouping. */
const SCREENS = [
  // Today
  { stateId: 'dashboard', label: 'Dashboard', section: 'Today', go: ['dashboard'] },
  { stateId: 'briefing', label: 'Morning Briefing', section: 'Today', go: ['briefing'] },
  { stateId: 'quests', label: 'Quests', section: 'Today', go: ['quests'] },

  // Train
  { stateId: 'workout', label: 'Workout Plan', section: 'Train', go: ['workout'] },
  { stateId: 'cardio', label: 'Cardio', section: 'Train', go: ['cardio'] },
  { stateId: 'calisthenics', label: 'Calisthenics', section: 'Train', go: ['calisthenics'] },
  { stateId: 'progress', label: 'Progress', section: 'Train', go: ['progress'] },
  { stateId: 'training-intel', label: 'Training Intel', section: 'Train', go: ['training-intel', { tab: 'intel' }] },
  { stateId: 'training-style', label: 'Training Style', section: 'Train', go: ['training-intel', { tab: 'style' }] },

  // Body
  { stateId: 'bodymap', label: 'Body Map', section: 'Body', go: ['bodymap'] },
  { stateId: 'nutrition', label: 'Nutrition', section: 'Body', go: ['nutrition'] },
  { stateId: 'recovery', label: 'Recovery Check-in', section: 'Body', go: ['recovery', { tab: 'checkin' }] },
  { stateId: 'recovery-debt', label: 'Recovery Debt', section: 'Body', go: ['recovery', { tab: 'debt' }] },
  { stateId: 'rehab', label: 'Rehab', section: 'Body', go: ['rehab'] },
  { stateId: 'injury-risk', label: 'Injury Risk', section: 'Body', go: ['injury-risk'] },
  { stateId: 'body-intelligence', label: 'Body Intelligence', section: 'Body', go: ['body-intelligence'] },
  { stateId: 'anatomy', label: 'Anatomy', section: 'Body', go: ['anatomy'] },
  { stateId: 'photos', label: 'Progress Photos', section: 'Body', go: ['photos'] },
  { stateId: 'physique', label: 'Physique Score', section: 'Body', go: ['physique', { tab: 'score' }] },
  { stateId: 'physique-archetype', label: 'Physique Archetype', section: 'Body', go: ['physique', { tab: 'archetype' }] },
  { stateId: 'physique-timeline', label: 'Physique Timeline', section: 'Body', go: ['physique', { tab: 'timeline' }] },

  // Learn
  { stateId: 'hub', label: 'Learn Hub', section: 'Learn', go: ['hub'] },
  { stateId: 'encyclopedia', label: 'Encyclopedia', section: 'Learn', go: ['encyclopedia'] },
  { stateId: 'search', label: 'Search', section: 'Learn', go: ['search'] },
  { stateId: 'calculators', label: 'Calculators', section: 'Learn', go: ['calculators'] },
  { stateId: 'visualizations', label: 'Visualizations', section: 'Learn', go: ['visualizations'] },
  { stateId: 'assistant', label: 'Fitness Assistant', section: 'Learn', go: ['assistant'] },
  { stateId: 'academy', label: 'Academy', section: 'Learn', go: ['academy'] },

  // Me
  { stateId: 'settings-profile', label: 'Settings · Profile', section: 'Me', go: ['settings', { tab: 'profile' }] },
  { stateId: 'settings-training', label: 'Settings · Training', section: 'Me', go: ['settings', { tab: 'training' }] },
  { stateId: 'settings-supplements', label: 'Settings · Supps', section: 'Me', go: ['settings', { tab: 'supplements' }] },
  { stateId: 'settings-nutrition', label: 'Settings · Nutrition', section: 'Me', go: ['settings', { tab: 'nutrition' }] },
  { stateId: 'settings-appearance', label: 'Settings · Style', section: 'Me', go: ['settings', { tab: 'appearance' }] },
  { stateId: 'settings-notifications', label: 'Settings · Alerts', section: 'Me', go: ['settings', { tab: 'notifications' }] },
  { stateId: 'settings-data', label: 'Settings · Data', section: 'Me', go: ['settings', { tab: 'data' }] },
  { stateId: 'profiles', label: 'Profiles', section: 'Me', go: ['profiles'] },
  { stateId: 'equipment-setup', label: 'Equipment Setup', section: 'Me', go: ['equipment-setup'] },
  { stateId: 'split-builder', label: 'Split Builder', section: 'Me', go: ['split-builder'] },
];

/* First-run flow — intro slides + onboarding steps. Driven via __pcOnboardingState. */
const INTRO_COUNT = 4;
const OB_STEPS = 7;
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

for (const [viewport, vp] of Object.entries(VIEWPORTS)) {
  test.describe(`Screen gallery — ${viewport}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.dsf });

    test.beforeAll(() => { mkdirSync(GALLERY_DIR, { recursive: true }); });

    test(`${CAPTURE ? 'capture' : 'walk'} ${viewport} screens (dark + light)`, async ({ page }) => {
      test.setTimeout(CAPTURE ? 600_000 : 180_000);
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
          const hasScreen = await page.locator('#view .screen').count();
          expect(hasScreen, `${s.stateId} should render .screen`).toBeGreaterThan(0);
          if (CAPTURE) {
            n += 1;
            const file = `${theme}-${viewport}-${String(n).padStart(3, '0')}-${s.stateId}.png`;
            await page.screenshot({ path: join(GALLERY_DIR, file), fullPage: false });
            shots.push({ file, theme, viewport, section: s.section, screenId: s.stateId, label: s.label, route: `go('${s.go[0]}'${s.go[1] ? ', ' + JSON.stringify(s.go[1]) : ''})` });
          }
        }

        // First-run flow: intro slides
        for (let i = 0; i < INTRO_COUNT; i += 1) {
          await page.evaluate((idx) => { window.__pcOnboardingState({ intro: idx }); window.go('onboarding', { showIntro: true }); }, i);
          await waitReady(page);
          if (CAPTURE) {
            n += 1;
            const file = `${theme}-${viewport}-${String(n).padStart(3, '0')}-intro-${i + 1}.png`;
            await page.screenshot({ path: join(GALLERY_DIR, file), fullPage: false });
            shots.push({ file, theme, viewport, section: 'Onboarding', screenId: `intro-${i + 1}`, label: `Welcome ${i + 1}/${INTRO_COUNT}`, route: "go('onboarding',{showIntro:true})" });
          }
        }

        // First-run flow: onboarding steps
        for (let step = 1; step <= OB_STEPS; step += 1) {
          await page.evaluate((cfg) => { window.__pcOnboardingState({ step: cfg.step, data: cfg.seed }); window.go('onboarding'); }, { step, seed: OB_SEED });
          await waitReady(page);
          if (CAPTURE) {
            n += 1;
            const file = `${theme}-${viewport}-${String(n).padStart(3, '0')}-onboarding-${step}.png`;
            await page.screenshot({ path: join(GALLERY_DIR, file), fullPage: false });
            shots.push({ file, theme, viewport, section: 'Onboarding', screenId: `onboarding-${step}`, label: `Onboarding ${step}/${OB_STEPS}`, route: `onboarding step ${step}` });
          }
        }

        // Active workout — live session
        const activeOk = await page.evaluate(() => {
          try {
            window.S.set('programWeightsConfirmed', true);
            window.startWorkout();
            return !!document.getElementById('wkt-header');
          } catch { return false; }
        });
        expect(activeOk, 'active workout should render').toBe(true);
        await page.waitForTimeout(500);
        if (CAPTURE) {
          n += 1;
          const activeFile = `${theme}-${viewport}-${String(n).padStart(3, '0')}-active.png`;
          await page.screenshot({ path: join(GALLERY_DIR, activeFile), fullPage: false });
          shots.push({ file: activeFile, theme, viewport, section: 'Train', screenId: 'active', label: 'Active Workout', route: 'startWorkout()' });
        }

        // Return to a clean screen before switching theme
        await page.evaluate(() => window.go('dashboard'));
        await waitReady(page);
      }

      if (CAPTURE) appendManifest(shots);
    });
  });
}
