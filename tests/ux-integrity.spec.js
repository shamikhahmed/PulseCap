// @ts-check
const { test, expect } = require('@playwright/test');

async function boot(page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1');
  await page.waitForFunction(() => typeof window.go === 'function' && document.getElementById('view'));
  await page.addStyleTag({ content: '#view { padding-bottom: 2000px !important; }' });
}

async function goScreen(page, id, data) {
  await page.evaluate(({ id, data }) => window.go(id, data || undefined), { id, data });
  await page.waitForFunction((want) => window.currentScreenId && window.currentScreenId() === want, id, { timeout: 8000 });
}

async function padAndScroll(page, y) {
  return page.evaluate((y) => {
    const v = document.getElementById('view');
    if (v) v.scrollTop = y;
    return v ? v.scrollTop : -1;
  }, y);
}

test.describe('UX integrity — re-render contract', () => {
  test('Settings gym-day toggle keeps scroll and focus', async ({ page }) => {
    await boot(page);
    await goScreen(page, 'settings', { tab: 'training' });
    const before = await padAndScroll(page, 400);
    expect(before).toBeGreaterThan(300);

    const out = await page.evaluate(() => {
      const btn = document.querySelector('[data-focus-key="gym-day-mon"]');
      if (!btn) return { missing: true };
      btn.focus({ preventScroll: true });
      btn.click();
      const v = document.getElementById('view');
      const ae = document.activeElement;
      return {
        missing: false,
        after: v ? v.scrollTop : -1,
        key: ae && ae.getAttribute && ae.getAttribute('data-focus-key'),
        tag: ae && ae.tagName,
        dumped: ae === document.body
      };
    });
    expect(out.missing).toBeFalsy();
    expect(out.after).toBeGreaterThan(300);
    expect(Math.abs(out.after - before)).toBeLessThan(40);
    expect(out.dumped).toBeFalsy();
    expect(out.key).toBe('gym-day-mon');
  });

  test('Settings accessibility toggle keeps scroll and focus', async ({ page }) => {
    await boot(page);
    await goScreen(page, 'settings', { tab: 'accessibility' });
    const before = await padAndScroll(page, 400);
    expect(before).toBeGreaterThan(300);
    const out = await page.evaluate(async () => {
      const btn = document.querySelector('[data-focus-key="toggle-settings.lowPower"]');
      if (!btn) return { missing: true };
      btn.focus({ preventScroll: true });
      btn.click();
      await new Promise(function(r) { requestAnimationFrame(function() { requestAnimationFrame(r); }); });
      const v = document.getElementById('view');
      const ae = document.activeElement;
      return {
        missing: false,
        after: v ? v.scrollTop : -1,
        key: ae && ae.getAttribute && ae.getAttribute('data-focus-key'),
        dumped: ae === document.body,
        meta: window.__pcRenderMeta || null
      };
    });
    expect(out.missing).toBeFalsy();
    expect(out.meta, JSON.stringify(out.meta)).toMatchObject({ sameScreen: true, preserveScroll: true });
    expect(out.after).toBeGreaterThan(300);
    expect(Math.abs(out.after - before)).toBeLessThan(40);
    expect(out.dumped).toBeFalsy();
    expect(out.key).toBe('toggle-settings.lowPower');
  });

  test('weekly schedule select keeps focus after change', async ({ page }) => {
    await boot(page);
    await goScreen(page, 'settings', { tab: 'training' });
    await padAndScroll(page, 400);
    const out = await page.evaluate(() => {
      const sel = document.querySelector('#settings-panel select.field');
      if (!sel) return { missing: true };
      sel.focus();
      const keyBefore = sel.getAttribute('data-focus-key');
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      const ae = document.activeElement;
      return {
        missing: false,
        keyBefore: keyBefore,
        keyAfter: ae && ae.getAttribute && ae.getAttribute('data-focus-key'),
        dumped: ae === document.body,
        tag: ae && ae.tagName
      };
    });
    expect(out.missing).toBeFalsy();
    expect(out.dumped).toBeFalsy();
    expect(out.tag).toBe('SELECT');
    expect(out.keyAfter).toBe(out.keyBefore);
  });

  const sites = [
    { name: 'settings-account', go: ['settings', { tab: 'account' }], click: '[data-focus-key="settings-tab-training"]' },
    { name: 'my-plan', go: ['my-plan'], click: 'button' },
    { name: 'workout', go: ['workout'], click: 'button' },
    { name: 'nutrition', go: ['nutrition'], click: 'button' },
    { name: 'photos', go: ['photos'], click: 'button' },
    { name: 'equipment-setup', go: ['equipment-setup'], click: 'button' },
    { name: 'profiles', go: ['profiles'], click: 'button' },
    { name: 'rehab', go: ['rehab'], click: 'button' }
  ];

  for (const site of sites) {
    test(site.name + ' same-screen re-render preserves scroll', async ({ page }) => {
      await boot(page);
      await goScreen(page, site.go[0], site.go[1]);
      const before = await padAndScroll(page, 400);
      expect(before).toBeGreaterThan(50);
      const after = await page.evaluate(() => {
        const id = window.currentScreenId && window.currentScreenId();
        window.go(id);
        const v = document.getElementById('view');
        return {
          scroll: v ? v.scrollTop : -1,
          meta: window.__pcRenderMeta || null,
          max: v ? (v.scrollHeight - v.clientHeight) : 0
        };
      });
      expect(after.meta && after.meta.preserveScroll).toBeTruthy();
      expect(after.meta && after.meta.sameScreen).toBeTruthy();
      if (after.max >= 350) {
        expect(after.scroll).toBeGreaterThan(250);
        expect(Math.abs(after.scroll - before)).toBeLessThan(40);
      }
    });
  }

  test('real navigation still resets scroll', async ({ page }) => {
    await boot(page);
    await goScreen(page, 'settings', { tab: 'training' });
    await padAndScroll(page, 400);
    await page.evaluate(() => window.go('dashboard'));
    const after = await page.evaluate(() => document.getElementById('view').scrollTop);
    expect(after).toBeLessThan(20);
  });
});

test.describe('UX integrity — vertical composition', () => {
  test('Today fills the viewport with real blocks, not a void', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.go === 'function');
    await page.evaluate(() => window.go('dashboard'));
    const fill = await page.evaluate(() => {
      const v = document.getElementById('view');
      const nodes = v.querySelectorAll('.dash-session, .dash-meta, .banner, .btn');
      let bottom = 0;
      nodes.forEach(function(el) {
        bottom = Math.max(bottom, el.getBoundingClientRect().bottom);
      });
      const box = v.getBoundingClientRect();
      return (bottom - box.top) / box.height;
    });
    expect(fill).toBeGreaterThan(0.55);
  });
});

test.describe('UX integrity — gutters and tab bar', () => {
  test('Settings tab bar is one row at 390px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.go === 'function');
    await page.evaluate(() => window.go('settings', { tab: 'account' }));
    const bar = await page.evaluate(() => {
      const el = document.querySelector('.cap-tab-bar');
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { h: el.getBoundingClientRect().height, wrap: cs.flexWrap, overflow: cs.overflowX };
    });
    expect(bar).toBeTruthy();
    expect(bar.wrap).toBe('nowrap');
    expect(bar.h).toBeLessThan(68);
  });

  test('no interactive control hugs the 390px edge unless marked full-bleed', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.go === 'function');
    const screens = [
      ['dashboard'],
      ['workout'],
      ['progress'],
      ['my-plan'],
      ['settings', { tab: 'account' }],
      ['settings', { tab: 'training' }],
      ['settings', { tab: 'fuel' }],
      ['settings', { tab: 'appearance' }],
      ['settings', { tab: 'accessibility' }],
      ['settings', { tab: 'notifications' }],
      ['settings', { tab: 'privacy' }],
      ['settings', { tab: 'about' }]
    ];
    const allBad = [];
    for (const args of screens) {
      await page.evaluate((a) => window.go(a[0], a[1]), args);
      await page.waitForTimeout(40);
      const bad = await page.evaluate(() => {
        const vw = window.innerWidth;
        const hits = [];
        const nodes = document.querySelectorAll('#view button, #view a, #view input, #view select, #view textarea, #view [role="button"], #view [role="switch"]');
        nodes.forEach(function(el) {
          if (!el.getClientRects().length) return;
          if (el.closest('[data-full-bleed]')) return;
          if (el.closest('#nav')) return;
          let p = el.parentElement;
          while (p && p !== document.body) {
            const ox = getComputedStyle(p).overflowX;
            if (ox === 'auto' || ox === 'scroll') return;
            p = p.parentElement;
          }
          const r = el.getBoundingClientRect();
          if (r.width < 8 || r.height < 8) return;
          if (r.left < 11.5) hits.push({ tag: el.tagName, left: Math.round(r.left), name: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40) });
          if (r.right > vw - 11.5) hits.push({ tag: el.tagName, right: Math.round(r.right), name: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40) });
        });
        return { screen: window.currentScreenId(), hits: hits };
      });
      if (bad.hits.length) allBad.push(bad);
    }
    expect(allBad).toEqual([]);
  });
});

test.describe('Phase 27 — QA sweep', () => {
  function contrast(bg, fg) {
    function parse(c) {
      c = String(c || '').trim();
      let m = c.match(/^#([0-9a-f]{6})$/i);
      if (m) return [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)];
      m = c.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
      if (m) return [Number(m[1]), Number(m[2]), Number(m[3])];
      return null;
    }
    function lin(v) {
      v = v / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    }
    const a = parse(bg);
    const b = parse(fg);
    if (!a || !b) return 0;
    const L1 = 0.2126 * lin(a[0]) + 0.7152 * lin(a[1]) + 0.0722 * lin(a[2]);
    const L2 = 0.2126 * lin(b[0]) + 0.7152 * lin(b[1]) + 0.0722 * lin(b[2]);
    const hi = Math.max(L1, L2);
    const lo = Math.min(L1, L2);
    return (hi + 0.05) / (lo + 0.05);
  }

  test('375 / 390 / 430 — no overflow, both themes, main tabs + Settings', async ({ page }) => {
    const widths = [375, 390, 430];
    const themes = ['dark', 'light'];
    const screens = [
      ['dashboard'],
      ['workout'],
      ['progress'],
      ['my-plan'],
      ['settings', { tab: 'account' }],
      ['settings', { tab: 'training' }],
      ['settings', { tab: 'fuel' }],
      ['settings', { tab: 'appearance' }],
      ['settings', { tab: 'accessibility' }],
      ['settings', { tab: 'notifications' }],
      ['settings', { tab: 'privacy' }],
      ['settings', { tab: 'about' }]
    ];
    const fails = [];
    for (const w of widths) {
      await page.setViewportSize({ width: w, height: 844 });
      await page.goto('/?demo=1');
      await page.waitForFunction(() => typeof window.go === 'function');
      for (const theme of themes) {
        await page.evaluate((t) => window.applyTheme(t, false), theme);
        for (const args of screens) {
          await page.evaluate((a) => window.go(a[0], a[1]), args);
          const hit = await page.evaluate(() => {
            const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;
            const bar = document.querySelector('.cap-tab-bar');
            const wrap = bar && getComputedStyle(bar).flexWrap === 'wrap' && bar.getBoundingClientRect().height > 70;
            return { overflow: overflow, wrap: !!wrap, screen: window.currentScreenId() };
          });
          if (hit.overflow || hit.wrap) fails.push({ w: w, theme: theme, screen: hit.screen, overflow: hit.overflow, wrap: hit.wrap });
        }
      }
    }
    expect(fails).toEqual([]);
  });

  test('body text tokens meet WCAG AA 4.5:1 in both themes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.applyTheme === 'function');
    const report = [];
    for (const theme of ['dark', 'light']) {
      await page.evaluate((t) => window.applyTheme(t, false), theme);
      const tokens = await page.evaluate(() => {
        const cs = getComputedStyle(document.documentElement);
        return {
          bg: cs.getPropertyValue('--bg').trim() || cs.getPropertyValue('--bg0').trim(),
          text: cs.getPropertyValue('--text').trim() || cs.getPropertyValue('--txt').trim(),
          text2: cs.getPropertyValue('--text-2').trim() || cs.getPropertyValue('--txt2').trim()
        };
      });
      report.push({
        theme: theme,
        body: contrast(tokens.bg, tokens.text),
        secondary: contrast(tokens.bg, tokens.text2),
        tokens: tokens
      });
    }
    report.forEach(function(row) {
      expect(row.body, row.theme + ' --text vs --bg ' + JSON.stringify(row.tokens)).toBeGreaterThanOrEqual(4.5);
      expect(row.secondary, row.theme + ' --text-2 vs --bg (AA for 14px+ body) ' + JSON.stringify(row.tokens)).toBeGreaterThanOrEqual(4.5);
    });
  });

  test('fresh user reaches intro with no page error', async ({ page }) => {
    const errors = [];
    page.on('pageerror', function(err) { errors.push(String(err)); });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForFunction(() => typeof window.go === 'function');
    const state = await page.evaluate(() => ({
      onboarded: !!(window.S && window.S.g && window.S.g('onboarded')),
      screen: window.currentScreenId && window.currentScreenId(),
      hasView: !!document.getElementById('view')
    }));
    expect(state.hasView).toBeTruthy();
    if (!state.onboarded) {
      expect(state.screen === 'onboarding' || /welcome|goal|pulse/i.test(await page.locator('#view').innerText())).toBeTruthy();
    }
    expect(errors).toEqual([]);
  });

  test('one session and 500 sessions do not overflow Progress', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.S !== 'undefined' && typeof window.go === 'function');
    const sample = {
      name: 'Bench',
      date: '2026-01-01',
      duration: 40,
      totalVol: 1200,
      exercises: [{ name: 'Barbell Bench Press', exId: 'barbell-bench-press', sets: [{ weight: 60, reps: 8, done: true }] }]
    };
    for (const n of [1, 500]) {
      await page.evaluate(({ n, sample }) => {
        const list = [];
        for (let i = 0; i < n; i++) {
          list.push(Object.assign({}, sample, { id: 'wkt_' + i, date: '2025-01-01' }));
        }
        window.S.set('workouts', list);
        window.go('progress');
      }, { n, sample });
      await page.waitForTimeout(n === 500 ? 400 : 80);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
      expect(overflow, n + ' sessions overflowed').toBeFalsy();
    }
  });

  test('longest exercise and food names stay inside the viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.go === 'function' && window.EXERCISE_DB);
    const names = await page.evaluate(() => {
      function longest(arr, key) {
        let best = '';
        (arr || []).forEach(function(row) {
          const n = String(row[key] || '');
          if (n.length > best.length) best = n;
        });
        return best;
      }
      return { ex: longest(window.EXERCISE_DB, 'n'), food: longest(window.FOODS_DB || [], 'name') };
    });
    expect(names.ex.length).toBeGreaterThan(8);
    await page.evaluate((name) => {
      window.S.set('user', Object.assign({}, window.S.g('user') || {}, { name: 'Alexandrina-Maximiliana von Somethinglong' }));
      window.go('workout');
      const search = document.querySelector('#view input[type="search"], #view input[type="text"]');
      if (search) {
        search.value = name;
        search.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, names.ex);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2)).toBeFalsy();
    await page.evaluate((name) => {
      window.go('nutrition');
      const search = document.querySelector('#view input[type="search"], #view input[type="text"]');
      if (search) {
        search.value = name;
        search.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }, names.food);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2)).toBeFalsy();
  });

  test('Settings tabs: tap a control, no console error, scroll holds', async ({ page }) => {
    const errors = [];
    page.on('pageerror', function(err) { errors.push(String(err)); });
    await boot(page);
    const tabs = ['account', 'training', 'fuel', 'appearance', 'accessibility', 'notifications', 'about'];
    for (const tab of tabs) {
      await goScreen(page, 'settings', { tab: tab, resetScroll: true });
      await padAndScroll(page, 120);
      const after = await page.evaluate(() => {
        const btn = document.querySelector('#settings-panel [role="switch"], #settings-panel [data-focus-key^="toggle-"], #settings-panel button.seg, #settings-panel .toggle');
        const before = document.getElementById('view').scrollTop;
        if (btn) {
          btn.focus({ preventScroll: true });
          btn.click();
        } else {
          window.go(window.currentScreenId());
        }
        return {
          before: before,
          after: document.getElementById('view').scrollTop
        };
      });
      expect(Math.abs(after.after - after.before), tab).toBeLessThan(50);
    }
    expect(errors).toEqual([]);
  });
});

