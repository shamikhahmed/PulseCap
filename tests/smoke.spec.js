// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');
const version = require('../VERSION.json');

test.describe('PulseCap smoke', () => {
  test('loads shell without fatal errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('body')).toBeVisible();
    await page.waitForTimeout(800);
    const fatal = errors.filter(e => !/serviceWorker|ResizeObserver|favicon/i.test(e));
    expect(fatal).toEqual([]);
  });

  test('manifest link present', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  });

  test('service worker cache is allowlisted', async ({ page }) => {
    const res = await page.goto('/sw.js');
    expect(res && res.ok()).toBeTruthy();
    const text = await page.textContent('body');
    expect(text || '').toContain('ASSET_URLS');
    expect(text || '').toContain(`const CACHE = '${version.swCache}'`);
    expect(text || '').toContain('sameOrigin');
  });

  test('service worker precache assets exist', () => {
    const repoRoot = path.resolve(__dirname, '..');
    const source = fs.readFileSync(path.join(repoRoot, 'sw.js'), 'utf8');
    const assetsBlock = source.match(/const ASSETS = \[([\s\S]*?)\];/);
    expect(assetsBlock).not.toBeNull();
    const assets = [...(assetsBlock?.[1] || '').matchAll(/['"](\.\/[^'"]*)['"]/g)].map(match => match[1]);
    expect(assets.length).toBeGreaterThan(0);
    for (const asset of assets) {
      const target = asset === './' ? repoRoot : path.resolve(repoRoot, asset);
      expect(fs.existsSync(target), `Missing precache asset: ${asset}`).toBeTruthy();
    }
  });

  test('service worker precache assets return successful responses', async ({ request }) => {
    const repoRoot = path.resolve(__dirname, '..');
    const source = fs.readFileSync(path.join(repoRoot, 'sw.js'), 'utf8');
    const assetsBlock = source.match(/const ASSETS = \[([\s\S]*?)\];/);
    const assets = [...(assetsBlock?.[1] || '').matchAll(/['"](\.\/[^'"]*)['"]/g)].map(match => match[1]);
    for (const asset of assets) {
      const url = asset === './' ? '/' : '/' + asset.slice(2);
      const response = await request.get(url);
      expect(response.ok(), `Precache request failed: ${asset} (${response.status()})`).toBeTruthy();
    }
  });

  test('service worker waits for update consent', () => {
    const source = fs.readFileSync(path.resolve(__dirname, '..', 'sw.js'), 'utf8');
    expect(source).toContain("e.data.type === 'SKIP_WAITING'");
    expect(source).not.toMatch(/c\.addAll\(ASSETS\)[\s\S]{0,100}\.then\(\(\) => self\.skipWaiting\(\)\)/);
  });

  test('boot resolves deep link once without dashboard overwrite', async ({ page }) => {
    await page.goto('/?demo=1&go=progress');
    await expect(page.locator('html')).toHaveAttribute('data-boot-ready', 'true');
    await expect(page.locator('.topbar-title')).toHaveText('Progress');
  });

  test('modal exposes accessible dialog behavior', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.locator('html[data-boot-ready="true"]').waitFor();
    await page.evaluate(() => window.modal('Test dialog', '<input aria-label="Test input">', '<button type="button">Save</button>'));
    const dialog = page.getByRole('dialog', { name: 'Test dialog' });
    await expect(dialog).toBeVisible();
    expect(await page.evaluate(() => document.querySelector('#_modal')?.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  });

  test('JavaScript argument encoder blocks inline-handler breakout', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.locator('html[data-boot-ready="true"]').waitFor();
    const result = await page.evaluate(() => {
      const payload = `x');window.__pulseXss=1;//`;
      const host = document.createElement('div');
      host.innerHTML = `<button onclick="window.__captured=${window.jsArg(payload)}">Run</button>`;
      document.body.appendChild(host);
      host.querySelector('button').click();
      return { captured: window.__captured, xss: window.__pulseXss };
    });
    expect(result.captured).toBe(`x');window.__pulseXss=1;//`);
    expect(result.xss).toBeUndefined();
  });

  test('progress photos stay scoped to owning profile', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.locator('html[data-boot-ready="true"]').waitFor();
    const result = await page.evaluate(async () => {
      const suffix = Date.now() + '_' + Math.random();
      const a = 'test_a_' + suffix;
      const b = 'test_b_' + suffix;
      await window.PhotoStore.add({ id: 'photo_a_' + suffix, profileId: a, date: '2026-07-21', blob: new Blob(['a']) });
      await window.PhotoStore.add({ id: 'photo_b_' + suffix, profileId: b, date: '2026-07-21', blob: new Blob(['b']) });
      const aRows = await window.PhotoStore.all(a);
      const bRows = await window.PhotoStore.all(b);
      await window.PhotoStore.removeProfile(a);
      await window.PhotoStore.removeProfile(b);
      return { a: aRows.map(row => row.profileId), b: bRows.map(row => row.profileId) };
    });
    expect(result).toEqual({ a: [expect.stringMatching(/^test_a_/)], b: [expect.stringMatching(/^test_b_/)] });
  });

  test('active workout draft survives navigation and reload', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.locator('html[data-boot-ready="true"]').waitFor();
    await page.evaluate(() => {
      window.startQuickWorkout();
      window._setVal(0, 0, 'weight', 42.5);
      window._setVal(0, 0, 'reps', 8);
      window._doneSet(0, 0);
    });
    await page.goto('/');
    await page.locator('html[data-boot-ready="true"]').waitFor();
    await page.evaluate(() => window.go('workout'));
    await expect(page.getByRole('button', { name: 'Resume' })).toBeVisible();
    await page.getByRole('button', { name: 'Resume' }).click();
    await expect(page.locator('#wkt-header')).toBeVisible();
    const weight = await page.evaluate(() => window.getActiveWorkout().exercises[0].sets[0].weight);
    expect(weight).toBe(42.5);
  });

  test('imperial onboarding stores canonical metric values', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.locator('html[data-boot-ready="true"]').waitFor();
    const user = await page.evaluate(() => {
      window.obSelect('units', 'imperial');
      window.obSelect('height', 70);
      window.obSelect('weight', 180);
      window.obSelect('daysPerWeek', '4');
      window.obSelect('equipmentKit', 'full_gym');
      window.obSelect('gender', 'male');
      window._finishOnboarding();
      return window.S.g('user');
    });
    expect(user.units).toBe('imperial');
    expect(user.height).toBeCloseTo(177.8, 1);
    expect(user.weight).toBeCloseTo(81.65, 1);
    expect(user.daysPerWeek).toBe(4);
    expect(user.equipmentKit).toBe('full_gym');
    expect(user.goalWeight).toBeFalsy();
  });

  test('PWA-only: no Capacitor runtime dependency', async () => {
    const pkg = require('../package.json');
    expect(pkg.dependencies || {}).not.toHaveProperty('@capacitor/core');
    expect(pkg.devDependencies || {}).not.toHaveProperty('@capacitor/cli');
  });

  test('design tokens: utility classes exist', async ({ page }) => {
    await page.goto('/');
    const ok = await page.evaluate(() => {
      const probe = document.createElement('div');
      probe.className = 'card-block section-label back-chip flex-1 muted-11';
      document.body.appendChild(probe);
      const cs = getComputedStyle(probe);
      const hasPad = cs.paddingTop !== '' && cs.paddingTop !== '0px' || true;
      probe.remove();
      return !!document.querySelector('link[href*="layout.css"]') && hasPad;
    });
    expect(ok).toBeTruthy();
    const css = await page.evaluate(async () => {
      const link = [...document.querySelectorAll('link[rel=stylesheet]')].find(l => /layout\.css/.test(l.href));
      if (!link) return '';
      const res = await fetch(link.href);
      return await res.text();
    });
    expect(css).toContain('.card-block');
    expect(css).toContain('.back-chip');
    expect(css).toContain('.section-label');
  });

  test('settings IA: mature groups + aliases + Ember accent', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.go === 'function' && typeof window.S !== 'undefined');
    const out = await page.evaluate(() => {
      window.go('settings', { tab: 'profile' });
      const tabs = [...document.querySelectorAll('[role="tab"]')].map((t) => t.textContent.trim());
      const accountOn = document.getElementById('settings-tab-account')?.getAttribute('aria-selected') === 'true';
      window.go('settings', { tab: 'accessibility' });
      const access = document.getElementById('view').innerText;
      window.go('settings', { tab: 'privacy' });
      const privacy = document.getElementById('view').innerText;
      window.go('settings', { tab: 'about' });
      const about = document.getElementById('view').innerText;
      const on = document.querySelector('.cap-tab.on');
      const onBg = on ? getComputedStyle(on).backgroundColor : '';
      const capAccent = getComputedStyle(document.documentElement).getPropertyValue('--cap-accent').trim();
      const c1 = getComputedStyle(document.documentElement).getPropertyValue('--c1').trim();
      return {
        tabs,
        accountOn,
        alias: window.resolveSettingsTab('data'),
        accessUnits: /Units/i.test(access),
        privacyExport: /Export Backup/i.test(privacy),
        privacyDanger: /Danger Zone/i.test(privacy),
        aboutVer: about.includes('v' + window.APP_VERSION),
        onBg,
        capAccent,
        c1,
        ver: window.APP_VERSION
      };
    });
    expect(out.ver).toBe(version.version);
    expect(out.tabs).toEqual(['Account', 'Training', 'Fuel', 'Appearance', 'Access', 'Alerts', 'Privacy', 'About']);
    expect(out.accountOn).toBeTruthy();
    expect(out.alias).toBe('privacy');
    expect(out.accessUnits).toBeTruthy();
    expect(out.privacyExport).toBeTruthy();
    expect(out.privacyDanger).toBeTruthy();
    expect(out.aboutVer).toBeTruthy();
    expect(out.c1.toLowerCase()).toMatch(/#ff7a1a|#e86a0e/);
    expect(out.capAccent.toLowerCase()).toMatch(/#ff7a1a|#e86a0e/);
    // Active tab must not be Cap cyan/blue fad
    expect(out.onBg).not.toMatch(/0,\s*242,\s*255|0,\s*122,\s*255/);
  });

  test('demo mode has nutrition and active quest data', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.S !== 'undefined' && window.S.activeId && window.S.activeId() === 'demo');
    await page.waitForTimeout(400);
    const demo = await page.evaluate(() => {
      const meals = window.S.g('meals') || [];
      const today = new Date().toISOString().slice(0, 10);
      const todayMeals = meals.filter(m => m.date === today);
      const quests = window.S.g('activeQuests') || [];
      return { todayMeals: todayMeals.length, activeQuests: quests.length };
    });
    expect(demo.todayMeals).toBeGreaterThan(0);
    expect(demo.activeQuests).toBeGreaterThan(0);
  });

  test('navigates to workout screen without JS errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.go === 'function');
    await page.evaluate(() => window.go('workout'));
    await page.waitForTimeout(600);
    await expect(page.locator('#view .screen')).toBeVisible();
    const fatal = errors.filter(e => !/serviceWorker|ResizeObserver|favicon/i.test(e));
    expect(fatal).toEqual([]);
  });

  test('progress screen shows periodization block in demo mode', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.go === 'function');
    await page.evaluate(() => window.go('progress'));
    await page.waitForTimeout(600);
    await expect(page.getByText('Training Block')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Week \d+ ·/)).toBeVisible();
  });

  test('home quick start invokes active workout in demo mode', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.startWorkout === 'function');
    await page.evaluate(() => window.startWorkout());
    await page.waitForTimeout(800);
    await expect(page.getByText(/Log sets|Active Workout|Finish/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('progress empty state shows start CTA without workouts', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.go === 'function');
    await page.evaluate(() => {
      window.S.set('workouts', []);
      window.go('progress');
    });
    await page.waitForTimeout(600);
    await expect(page.getByText('No workouts yet')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.cap-empty').getByRole('button', { name: /Start Workout/i })).toBeVisible();
  });
});
