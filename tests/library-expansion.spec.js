// @ts-check
const { test, expect } = require('@playwright/test');

/* v6.44 library expansion: ~1,870 exercises across every training style,
   the Apple-style exercise sheet, the all-exercises browser and the
   Training Guide (methods, splits, goals). */

async function boot(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1');
  await page.waitForFunction(() => typeof window.ensureWorkoutReady === 'function');
  await page.evaluate(() => window.ensureWorkoutReady());
  await page.waitForFunction(() => window.ExDB && window.ExDB.db.length > 1000 && typeof window.showExerciseDetail === 'function');
  return errors;
}

/* One or more names per category of the requested taxonomy. */
const TAXONOMY = [
  'Barbell Bench Press', 'Zercher Squat', 'Overhead Squat', 'Pause Squat', 'Yates Row', 'Deficit Deadlift',
  'Dumbbell Bench Press', 'Dumbbell Hip Thrust', "Devil's Press", 'Leg Press', 'Belt Squat', 'Reverse Pec Deck',
  'Cable Woodchop', 'Straight-Bar Pushdown', 'Push-Ups', 'Archer Push-Up', 'Pull-Ups', 'Muscle Up', 'L-Sit',
  'Front Lever', 'Back Lever', 'Human Flag', 'Tuck Planche', 'Handstand Push-Up', 'Pistol Squat', 'Nordic Hamstring Curl',
  'Turkish Get-Up', 'Kettlebell Snatch', 'American Kettlebell Swing', 'Band Pull-Aparts', 'Band Pallof Press',
  'TRX Row', 'TRX Pike', 'Box Jump', 'Broad Jump', 'Depth Jump', 'Power Clean', 'Squat Snatch', 'Split Jerk',
  'Snatch Balance', 'Box Squat', 'Board Press', 'Atlas Stone Lift', 'Log Press', 'Yoke Walk', 'Wall Ball',
  'Double-Unders', 'Bar Muscle-Up', 'GHD Sit-Up', 'Easy Run', 'Sprint Intervals', 'Rowing Machine', 'Swimming — Freestyle',
  'Shadowboxing', 'Muay Thai', 'Brazilian Jiu-Jitsu', 'Couch Stretch', 'Pigeon Stretch', 'Downward Dog', 'Warrior II',
  'Sun Salutation A', 'The Hundred', 'Pilates Teaser', 'Side Plank', 'Ab Wheel Rollout', "Farmer's Walk", 'Suitcase Carry',
  'Sled Push', 'Sled Drag', 'Plate Pinch', 'Wrist Roller', 'Clamshell', 'Terminal Knee Extension', 'Chin Tucks',
  'Water Aerobics', 'Bouldering', 'Kayaking', 'Rucking', "Fireman's Carry", 'Agility Ladder Drills', 'T-Drill',
  'Badminton', 'Cricket — Batting', 'Rugby', 'Pickleball'
];

test.describe('Exercise library expansion', () => {
  test('every requested category resolves to a real, complete exercise', async ({ page }) => {
    const errors = await boot(page);
    const out = await page.evaluate((names) => {
      const PATTERNS = ['horizontal_push', 'vertical_push', 'horizontal_pull', 'vertical_pull', 'hinge', 'squat', 'lunge', 'carry', 'core', 'isolation', 'conditioning'];
      const missing = names.filter(n => !window.ExDB.byName(n));
      const bad = window.ExDB.db.filter(e => {
        const j = e.joint || {};
        return Object.keys(j).length !== 8 || PATTERNS.indexOf(e.pattern) < 0 || !e.metSource || !(e.steps || []).length;
      }).map(e => e.n);
      /* Imported library rows carry text only — never third-party media. */
      const media = window.ExDB.db.filter(e => e.src === 'el' && (e.gif_url || e.image || e.media_id)).map(e => e.n);
      const groups = {};
      window.ExDB.db.forEach(e => { groups[e.grp] = (groups[e.grp] || 0) + 1; });
      return { missing, bad: bad.slice(0, 10), media, count: window.ExDB.db.length, groups };
    }, TAXONOMY);
    expect(out.missing).toEqual([]);
    expect(out.bad).toEqual([]);
    expect(out.media).toEqual([]);
    expect(out.count).toBeGreaterThanOrEqual(1800);
    ['mobility', 'sports', 'cardio', 'plyometrics', 'fullbody'].forEach(g => expect(out.groups[g] || 0).toBeGreaterThan(10));
    expect(errors).toEqual([]);
  });

  test('new gear is gated by kit; stored kit snapshots pick up new gear', async ({ page }) => {
    await boot(page);
    const out = await page.evaluate(() => {
      const user = (kit, equipment) => ({ equipmentConfigured: true, equipmentKit: kit, equipment: equipment || [] });
      const can = (n, u) => window.Equipment.canPerform(window.ExDB.byName(n), u);
      return {
        ringHome: can('Ring Row', user('home_minimal')),
        ringGym: can('Ring Row', user('full_gym')),
        pushHome: can('Push-Ups', user('home_minimal')),
        /* snapshot from before rings/TRX were part of the full-gym kit */
        trxOldSnapshot: can('TRX Row', user('full_gym', ['barbell', 'dumbbell', 'machine', 'cables', 'bar', 'bands'])),
        ballDumbbells: can('Crunch (On Stability Ball)', user('dumbbells'))
      };
    });
    expect(out).toEqual({ ringHome: false, ringGym: true, pushHome: true, trxOldSnapshot: true, ballDumbbells: false });
  });

  test('new splits resolve every day to real exercises', async ({ page }) => {
    await boot(page);
    const out = await page.evaluate(() => {
      const ids = ['torso_limbs', 'pplul', 'ppl_3', 'fb_4', 'ul_6', 'arnold_3', 'seven_day'];
      return ids.map(id => {
        const s = window.SplitsDB.byId(id);
        const days = window.SplitEngine._getSplitDays(id);
        const unknown = [];
        days.forEach(d => (d.exercises || []).forEach(n => { if (!window.ExDB.byName(n)) unknown.push(n); }));
        return { id, ok: !!s, days: days.length, want: s && s.days, unknown };
      });
    });
    out.forEach(r => {
      expect(r.ok, r.id).toBe(true);
      expect(r.days, r.id).toBe(r.want);
      expect(r.unknown, r.id).toEqual([]);
    });
  });
});

test.describe('Exercise sheet (iOS page sheet)', () => {
  test('tab switch updates in place, push/back works, Done dismisses', async ({ page }) => {
    const errors = await boot(page);
    await page.evaluate(() => window.showExerciseDetail('Barbell Bench Press'));
    const sheet = page.locator('#_modal .ex-sheet');
    await expect(sheet).toBeVisible();
    await page.evaluate(() => { window.__sheet = document.querySelector('#_modal .ex-sheet'); });
    await page.getByRole('tab', { name: 'History' }).click();
    await expect(page.getByRole('tab', { name: 'History' })).toHaveAttribute('aria-selected', 'true');
    const same = await page.evaluate(() => window.__sheet === document.querySelector('#_modal .ex-sheet') &&
      document.querySelectorAll('.modal-overlay').length === 1);
    expect(same).toBe(true);
    await expect(page.locator('.ios-seg')).toHaveAttribute('style', /--i:\s*1/);
    await page.getByRole('tab', { name: 'Records' }).click();
    await expect(page.locator('#ex-panel')).toHaveAttribute('aria-labelledby', 'ex-tab-records');

    await page.getByRole('tab', { name: 'How to' }).click();
    await page.locator('.ios-row--link').first().click();
    await expect(page.locator('.ex-nav__back')).toBeVisible();
    await expect(page.locator('.ex-hero__t')).not.toHaveText('Barbell Bench Press');
    await page.locator('.ex-nav__back').click();
    await expect(page.locator('.ex-hero__t')).toHaveText('Barbell Bench Press');

    await page.getByRole('button', { name: 'Done' }).click();
    await expect(page.locator('.modal-overlay')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
});

test.describe('Exercise browser', () => {
  test('shows every exercise, filters by equipment, keeps the keyboard up while typing', async ({ page }) => {
    const errors = await boot(page);
    await page.evaluate(() => window.go('workout'));
    await page.getByRole('button', { name: /Browse all [\d,]+ exercises/ }).click();
    const count = page.locator('#ex-browse-count');
    await expect(count).toHaveText(/1,8\d\d exercises/);
    const input = page.locator('#ex-browse-q');
    await input.click();
    await page.keyboard.type('squat', { delay: 30 });
    expect(await page.evaluate(() => document.activeElement && document.activeElement.id)).toBe('ex-browse-q');
    await expect(page.locator('#ex-browse-list .row-title-14').first()).toHaveText('Back Squat');
    await page.locator('#ex-browse-eq [data-eq="bodyweight"]').click();
    const bw = await page.evaluate(() => [...document.querySelectorAll('#ex-browse-list .row-title-14')].map(x => x.textContent));
    expect(bw.length).toBeGreaterThan(3);
    expect(bw).not.toContain('Back Squat');
    await page.locator('#ex-browse-eq [data-eq="all"]').click();
    await input.fill('');
    await page.evaluate(() => window._browseType(''));
    const before = await page.locator('#ex-browse-list .row-title-14').count();
    await page.getByRole('button', { name: /^Show \d+ more/ }).click();
    expect(await page.locator('#ex-browse-list .row-title-14').count()).toBeGreaterThan(before);
    expect(errors).toEqual([]);
  });
});

test.describe('Training Guide', () => {
  test('methods, splits and goals open as sheets; Use this split saves', async ({ page }) => {
    const errors = await boot(page);
    await page.evaluate(() => window.go('guide'));
    await expect(page.locator('.topbar-title')).toHaveText('Training Guide');
    expect(await page.locator('#guide-list .ios-row').count()).toBeGreaterThanOrEqual(40);

    await page.getByRole('tab', { name: 'Splits' }).click();
    await expect(page.locator('#guide-list')).toContainText('7 days a week');
    await page.locator('#guide-list .ios-row', { hasText: 'Torso / Limbs' }).click();
    await expect(page.locator('.ex-sheet .ex-hero__t')).toHaveText('Torso / Limbs');
    await page.getByRole('button', { name: 'Use this split' }).click();
    expect(await page.evaluate(() => window.S.g('user.split'))).toBe('torso_limbs');

    await page.getByRole('tab', { name: 'Goals' }).click();
    await page.locator('#guide-list .ios-row', { hasText: 'Muscle growth' }).click();
    await page.locator('.ex-sheet .ios-row--link').first().click();
    await expect(page.locator('.ex-nav__back')).toBeVisible();
    await page.locator('.ex-nav__back').click();
    await expect(page.locator('.ex-sheet .ex-hero__t')).toContainText('Muscle growth');
    expect(errors).toEqual([]);
  });
});

test.describe('Exercise animations (© Gym visual, shown under licence)', () => {
  test('sheet shows a credited 180px animation; browser shows credited thumbnails', async ({ page }) => {
    /* Never depend on the CDN in tests — serve a 1×1 GIF for every media request. */
    const GIF = Buffer.from('R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');
    await page.route('https://cdn.jsdelivr.net/**', route => route.fulfill({ status: 200, contentType: 'image/gif', body: GIF }));
    const errors = await boot(page);
    const counts = await page.evaluate(() => ({
      withMedia: window.ExDB.db.filter(e => e.media).length,
      badUrl: window.ExDB.db.filter(e => e.media && !/^https:\/\/cdn\.jsdelivr\.net\/gh\/plataformafitness\/exercises-library@[0-9a-f]{40}\/videos\/\d{4}-[A-Za-z0-9]+\.gif$/.test(window.exMediaUrl(e))).length
    }));
    expect(counts.withMedia).toBeGreaterThan(1200);
    expect(counts.badUrl).toBe(0);

    await page.evaluate(() => window.showExerciseDetail('Barbell Bench Press'));
    const fig = page.locator('#_modal .ex-sheet .ios-anim');
    await expect(fig).toBeVisible();
    await expect(fig.locator('figcaption')).toHaveText('© Gym visual — gymvisual.com');
    await expect(fig.locator('img')).toHaveClass(/\bon\b/);
    const box = await fig.locator('img').boundingBox();
    expect(box && box.width).toBeLessThanOrEqual(180);
    await page.getByRole('button', { name: 'Done' }).click();
    await page.evaluate(() => window.showExerciseDetail('Savasana'));
    await expect(page.locator('#_modal .ex-sheet .ex-hero__t')).toHaveText('Savasana');
    await expect(page.locator('#_modal .ex-sheet .ios-anim')).toHaveCount(0);
    await page.getByRole('button', { name: 'Done' }).click();

    await page.evaluate(() => window.go('workout'));
    await page.getByRole('button', { name: /Browse all [\d,]+ exercises/ }).click();
    const thumb = page.locator('.browse-ic img').first();
    await expect(thumb).toHaveAttribute('title', '© Gym visual — gymvisual.com');
    await expect(page.getByText(/Exercise images and animations © Gym visual/)).toBeVisible();
    expect(errors).toEqual([]);
  });
});
