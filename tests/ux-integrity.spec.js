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
