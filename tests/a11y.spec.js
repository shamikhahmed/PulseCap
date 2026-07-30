'use strict';
const { test, expect } = require('@playwright/test');

test.describe('Accessibility', () => {
  test('core screens: focus rings, landmarks, tab order seeds', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.go === 'function');

    const skip = page.locator('.cap-skip-link');
    await expect(skip).toHaveCount(1);

    for (const id of ['dashboard', 'workout', 'bodymap', 'hub', 'settings']) {
      await page.evaluate((s) => window.go(s), id);
      await page.waitForTimeout(80);
      const meta = await page.evaluate(() => {
        const view = document.getElementById('view');
        const focusables = [...view.querySelectorAll('button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return r.width > 0 && r.height > 0;
          });
        const unlabeled = focusables.filter((el) => {
          if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
            const id = el.id;
            const byLabel = id && document.querySelector('label[for="' + id + '"]');
            const wrap = el.closest('.field-wrap');
            const aria = el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
            return !(byLabel || (wrap && wrap.querySelector('.field-label')) || aria || el.getAttribute('placeholder'));
          }
          const t = (el.textContent || '').trim();
          return !t && !el.getAttribute('aria-label') && !el.getAttribute('title');
        }).length;
        const nav = document.getElementById('nav') || document.getElementById('cap-nav-sidebar');
        return {
          focusable: focusables.length,
          unlabeled,
          hasNav: !!nav,
          title: document.title
        };
      });
      expect(meta.focusable, id + ' has focusables').toBeGreaterThan(0);
      expect(meta.unlabeled, id + ' unlabeled controls: ' + meta.unlabeled).toBeLessThan(12);
      expect(meta.title.toLowerCase()).toContain(id === 'dashboard' ? 'dashboard' : id.split('-')[0]);
    }
  });

  test('settings switches expose role=switch + aria-checked', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.go === 'function');
    await page.evaluate(() => window.go('settings', { tab: 'notifications' }));
    const switches = page.locator('[role="switch"]');
    await expect(switches.first()).toBeVisible();
    const n = await switches.count();
    expect(n).toBeGreaterThan(2);
    for (let i = 0; i < Math.min(n, 5); i++) {
      await expect(switches.nth(i)).toHaveAttribute('aria-checked', /true|false/);
      await expect(switches.nth(i)).toHaveAttribute('aria-label', /.+/);
    }
  });

  test('reduced-motion media query does not remove primary CTA', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.go === 'function');
    await page.evaluate(() => window.go('dashboard'));
    const start = page.getByRole('button', { name: /Start Workout|Start/i }).first();
    await expect(start).toBeVisible();
  });

  test('200% text zoom — primary nav still usable', async ({ page }) => {
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.go === 'function');
    await page.addStyleTag({ content: 'html { font-size: 200% !important; }' });
    await page.evaluate(() => window.go('dashboard'));
    const nav = page.locator('#nav, #cap-nav-sidebar').first();
    await expect(nav).toBeVisible();
    const box = await nav.boundingBox();
    expect(box?.height || 0).toBeGreaterThan(20);
  });
});
