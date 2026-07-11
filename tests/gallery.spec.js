// @ts-check
// Screen gallery capture — every registered module, mobile + desktop.
// Gated behind CAPTURE_GALLERY=1 (npm run gallery) so routine runs don't churn PNGs.
const { test, expect } = require('@playwright/test');
const { mkdirSync, writeFileSync, readFileSync } = require('node:fs');
const { join } = require('node:path');

const GALLERY_DIR = join(process.cwd(), 'docs', 'screenshots', 'gallery');

// Registered module ids (from reg() calls) worth a gallery shot.
// Excluded: 'active' (needs a live workout session), 'intro'/'onboarding' captured, others plain.
const MODULES = [
  'dashboard', 'hub', 'workout', 'quests', 'progress', 'nutrition', 'coach',
  'recovery', 'recovery-debt', 'anatomy', 'bodymap', 'encyclopedia', 'search',
  'calculators', 'calisthenics', 'cardio', 'academy', 'assistant', 'briefing',
  'body-intelligence', 'equipment-setup', 'injury-risk', 'physique',
  'physique-archetype', 'physique-timeline', 'profiles', 'rehab', 'settings',
  'training-intel', 'training-style', 'visualizations', 'onboarding',
];

const VIEWPORTS = {
  mobile: { width: 393, height: 852 },
  desktop: { width: 1280, height: 800 },
};

function appendManifest(shots) {
  const manifestPath = join(GALLERY_DIR, 'gallery-manifest.json');
  let existing = { shots: [] };
  try {
    existing = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch {
    /* first writer */
  }
  const merged = [...existing.shots.filter((s) => !shots.some((n) => n.file === s.file)), ...shots];
  merged.sort((a, b) => a.file.localeCompare(b.file));
  const version = JSON.parse(readFileSync(join(process.cwd(), 'VERSION.json'), 'utf8')).version;
  writeFileSync(
    manifestPath,
    JSON.stringify({ app: 'PulseCap', version, generated: new Date().toISOString(), shots: merged }, null, 2),
  );
}

for (const viewport of ['mobile', 'desktop']) {
  test.describe(`Screen gallery — ${viewport}`, () => {
    test.skip(!process.env.CAPTURE_GALLERY, 'Gallery capture runs via `npm run gallery` (CAPTURE_GALLERY=1)');
    test.use({ viewport: VIEWPORTS[viewport], deviceScaleFactor: 2 });

    test.beforeAll(() => {
      mkdirSync(GALLERY_DIR, { recursive: true });
    });

    test(`capture ${MODULES.length} ${viewport} module screens`, async ({ page }) => {
      test.setTimeout(240_000);
      await page.goto('/?demo=1');
      await page.waitForFunction(
        () => typeof window.S !== 'undefined' && window.S.activeId && window.S.activeId() === 'demo',
        undefined,
        { timeout: 30_000 },
      );
      await page.waitForTimeout(600);

      const shots = [];
      for (const [i, id] of MODULES.entries()) {
        const ok = await page.evaluate((mod) => {
          try {
            window.go(mod);
            return true;
          } catch {
            return false;
          }
        }, id);
        expect(ok, `go('${id}') should not throw`).toBe(true);
        await page.waitForTimeout(500);
        const file = `${viewport}-${String(i + 1).padStart(2, '0')}-${id}.png`;
        await page.screenshot({ path: join(GALLERY_DIR, file), fullPage: false });
        shots.push({ file, label: id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), route: `go('${id}')`, viewport });
      }
      appendManifest(shots);
    });
  });
}
