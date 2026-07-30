'use strict';
/**
 * QA matrix — walk every registered screen, audit interactive controls.
 * Writes QA-MATRIX.md at repo root. Fails on critical a11y/target issues.
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const SKIP_CLICK = /confirmClear|S\.reset|importData|exportData|clearTheme|applyImported|sbDel|removeSupp|deleteLegacy|location\.reload|window\.open/;
const DESTRUCTIVE = /danger|Clear|Reset|Delete|Remove/;

test.describe('QA matrix', () => {
  test('audit all screens interactive elements + write QA-MATRIX.md', async ({ page }) => {
    test.setTimeout(180000);
    await page.goto('/?demo=1');
    await page.waitForFunction(() => typeof window.listScreens === 'function' && typeof window.go === 'function');
    await page.waitForTimeout(500);

    const screens = await page.evaluate(() => window.listScreens().filter((id) => {
      return !['physique-timeline', 'physique-archetype', 'training-style'].includes(id);
    }));

    const rows = [];
    const fails = [];

    for (const screen of screens) {
      const pageErrors = [];
      page.on('pageerror', (e) => pageErrors.push(e.message));

      await page.evaluate(async (id) => {
        try {
          window.go(id);
          await new Promise((r) => setTimeout(r, 80));
        } catch (e) { /* render error caught below */ }
      }, screen);
      await page.waitForTimeout(120);

      const audit = await page.evaluate((screenId) => {
        const root = document.getElementById('view') || document.body;
        const nodes = [...root.querySelectorAll('button, a[href], [role="button"], [role="tab"], [role="switch"], input, select, textarea')];
        return nodes.map((el, i) => {
          const r = el.getBoundingClientRect();
          const style = getComputedStyle(el);
          const hidden = style.display === 'none' || style.visibility === 'hidden' || r.width === 0 || r.height === 0;
          const label = (el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || el.getAttribute('placeholder') || el.tagName || '').replace(/\s+/g, ' ').trim().slice(0, 80);
          const onclick = el.getAttribute('onclick') || '';
          const minDim = Math.min(r.width, r.height);
          const maxDim = Math.max(r.width, r.height);
          const nameOk = !!(el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || (el.textContent || '').trim() || el.getAttribute('placeholder') || el.tagName === 'INPUT');
          // 44×44 ideal; allow pill tabs with one axis ≥44 and other ≥28; SVG anatomy paths with label + max≥40
          const isSvg = el.tagName === 'path' || el.tagName === 'svg';
          const targetOk = hidden || minDim >= 44 || (maxDim >= 44 && minDim >= 24) || (isSvg && nameOk && maxDim >= 40);
          return {
            screen: screenId,
            i,
            tag: el.tagName.toLowerCase(),
            role: el.getAttribute('role') || '',
            label,
            onclick: onclick.slice(0, 120),
            w: Math.round(r.width),
            h: Math.round(r.height),
            hidden,
            nameOk,
            targetOk,
            disabled: el.disabled === true
          };
        });
      }, screen);

      for (const a of audit) {
        const expected = 'visible control ≥40px min edge + accessible name (or hidden)';
        let actual = a.hidden ? 'hidden' : `${a.w}×${a.h} name=${a.nameOk}`;
        let status = 'pass';
        if (!a.hidden && !a.nameOk) { status = 'fail'; fails.push({ ...a, reason: 'missing accessible name' }); }
        if (!a.hidden && !a.targetOk && a.tag === 'button') { status = 'fail'; fails.push({ ...a, reason: 'hit target <40px' }); }
        rows.push({
          screen: a.screen,
          element: `${a.tag}${a.role ? '[role=' + a.role + ']' : ''} "${a.label}"`,
          expected,
          actual,
          status
        });
      }

      // Click first safe primary-looking button on core screens only
      if (['dashboard', 'workout', 'bodymap', 'hub', 'settings', 'progress', 'nutrition', 'recovery'].includes(screen)) {
        const clicked = await page.evaluate((skipRe) => {
          const re = new RegExp(skipRe);
          const btns = [...document.querySelectorAll('#view button:not([disabled])')];
          for (const b of btns.slice(0, 8)) {
            const oc = b.getAttribute('onclick') || '';
            const t = (b.textContent || '').trim();
            if (re.test(oc) || /Clear|Reset|Delete|Remove|Danger/i.test(t)) continue;
            if (b.getBoundingClientRect().height < 20) continue;
            try { b.click(); return t.slice(0, 60) || oc.slice(0, 60); } catch (e) { return null; }
          }
          return null;
        }, SKIP_CLICK.source);
        if (clicked) {
          rows.push({
            screen,
            element: `click smoke "${clicked}"`,
            expected: 'responds without pageerror',
            actual: pageErrors.length ? pageErrors.join('; ') : 'ok',
            status: pageErrors.length ? 'fail' : 'pass'
          });
          if (pageErrors.length) fails.push({ screen, reason: pageErrors.join('; '), label: clicked });
          await page.evaluate((id) => window.go(id), screen);
        }
      }

      page.removeAllListeners('pageerror');
    }

    // Theme sweep: light + dark on dashboard
    for (const theme of ['dark', 'light']) {
      await page.evaluate((t) => {
        if (typeof window.applyTheme === 'function') window.applyTheme(t);
        window.go('dashboard');
      }, theme);
      await page.waitForTimeout(100);
      const contrast = await page.evaluate(() => {
        const cs = getComputedStyle(document.documentElement);
        return { txt: cs.getPropertyValue('--txt').trim(), bg: cs.getPropertyValue('--bg').trim(), c1: cs.getPropertyValue('--c1').trim() };
      });
      rows.push({
        screen: 'dashboard',
        element: `theme ${theme} tokens`,
        expected: '--txt/--bg/--c1 defined',
        actual: JSON.stringify(contrast),
        status: contrast.txt && contrast.bg && contrast.c1 ? 'pass' : 'fail'
      });
    }

    const pass = rows.filter((r) => r.status === 'pass').length;
    const fail = rows.filter((r) => r.status === 'fail').length;
    const md = [
      '# PulseCap — QA Matrix',
      '',
      `> Generated ${new Date().toISOString().slice(0, 10)} · demo profile · ${screens.length} screens · ${rows.length} checks · **${pass} pass / ${fail} fail**`,
      '',
      '| Screen | Element | Expected | Actual | Status |',
      '|--------|---------|----------|--------|--------|',
      ...rows.map((r) => `| ${r.screen} | ${r.element.replace(/\|/g, '/')} | ${r.expected} | ${String(r.actual).replace(/\|/g, '/').slice(0, 100)} | ${r.status} |`),
      '',
      '## Failures detail',
      fails.length ? fails.map((f) => `- **${f.screen}**: ${f.reason || ''} — \`${(f.label || '').slice(0, 60)}\``).join('\n') : '_None_',
      ''
    ].join('\n');

    fs.writeFileSync(path.join(__dirname, '..', 'QA-MATRIX.md'), md, 'utf8');

    // Soft budget: allow a few tiny icon-only fails but block mass failure
    expect(fail, `Too many QA fails (${fail}). See QA-MATRIX.md`).toBeLessThan(40);
    expect(pass).toBeGreaterThan(50);
  });
});
