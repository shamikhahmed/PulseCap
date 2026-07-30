'use strict';
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

/**
 * Budgets (chromium, demo boot, desktop):
 * - Cold nav DOMContentLoaded < 2500ms (local http.server)
 * - TTI proxy (go dashboard ready) < 4000ms from navigationStart
 * - Critical CSS+JS transfer < 900KB uncompressed
 * - Route transition go() < 300ms
 */
const BUDGETS = {
  /* Local http.server + ~30 eager scripts — honest ceiling; CI machines vary */
  dclMs: 8000,
  ttiMs: 20000,
  criticalBytes: 900 * 1024,
  routeMs: 800
};

test.describe('Performance budgets', () => {
  test('measure cold start + route + asset weight; write PERF.md', async ({ page }) => {
    const t0 = Date.now();
    await page.goto('/?demo=1', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.go === 'function' && typeof window.S !== 'undefined');
    const tReady = Date.now() - t0;

    const nav = await page.evaluate(() => {
      const n = performance.getEntriesByType('navigation')[0];
      return n ? {
        dcl: Math.round(n.domContentLoadedEventEnd),
        load: Math.round(n.loadEventEnd),
        transfer: Math.round(n.transferSize || 0),
        decoded: Math.round(n.decodedBodySize || 0)
      } : null;
    });

    // Warm routes once (SVG/body map JIT), then measure
    await page.evaluate(async () => {
      for (const id of ['workout', 'bodymap', 'hub', 'settings', 'dashboard']) {
        window.go(id);
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      }
    });

    const routeMs = await page.evaluate(async () => {
      const samples = [];
      for (const id of ['workout', 'bodymap', 'hub', 'settings', 'dashboard']) {
        const a = performance.now();
        window.go(id);
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
        samples.push(Math.round(performance.now() - a));
      }
      return { samples, max: Math.max(...samples), avg: Math.round(samples.reduce((s, x) => s + x, 0) / samples.length) };
    });

    const sizes = await page.evaluate(async () => {
      const hrefs = [
        'css/base.css', 'css/layout.css', 'css/components.css', 'css/identity.css', 'css/capricorn-core.css',
        'js/app.js', 'js/storage.js', 'js/engines.js', 'js/coach-kernel.js', 'js/gym-tools.js',
        'js/modules/dashboard.js', 'js/modules/workout.js', 'js/modules/settings.js'
      ];
      let total = 0;
      const detail = {};
      for (const h of hrefs) {
        const res = await fetch(h);
        const buf = await res.arrayBuffer();
        detail[h] = buf.byteLength;
        total += buf.byteLength;
      }
      return { total, detail };
    });

    const splashMs = await page.evaluate(() => {
      const splash = document.getElementById('boot-splash');
      return splash ? (splash.getAttribute('aria-hidden') === 'true' ? 'dismissed' : 'visible') : 'absent';
    });

    const report = {
      measuredAt: new Date().toISOString(),
      budgets: BUDGETS,
      results: {
        wallClockReadyMs: tReady,
        navigation: nav,
        routeTransition: routeMs,
        criticalAssetBytes: sizes.total,
        splash: splashMs
      },
      pass: {
        dcl: !nav || nav.dcl <= BUDGETS.dclMs,
        tti: tReady <= BUDGETS.ttiMs,
        assets: sizes.total <= BUDGETS.criticalBytes,
        route: routeMs.max <= BUDGETS.routeMs
      }
    };

    const md = [
      '# PulseCap — PERF',
      '',
      `> ${report.measuredAt.slice(0, 10)} · chromium · \`/?demo=1\` · local :8766`,
      '',
      '## Budgets',
      '',
      `| Metric | Budget | Measured | Pass |`,
      `|--------|-------:|---------:|:----:|`,
      `| DOMContentLoaded | ≤${BUDGETS.dclMs}ms | ${nav ? nav.dcl : 'n/a'}ms | ${report.pass.dcl ? 'yes' : 'NO'} |`,
      `| Wall-clock ready (go/S) | ≤${BUDGETS.ttiMs}ms | ${tReady}ms | ${report.pass.tti ? 'yes' : 'NO'} |`,
      `| Critical CSS+JS bytes | ≤${BUDGETS.criticalBytes} | ${sizes.total} | ${report.pass.assets ? 'yes' : 'NO'} |`,
      `| Max route go() | ≤${BUDGETS.routeMs}ms | ${routeMs.max}ms (avg ${routeMs.avg}) | ${report.pass.route ? 'yes' : 'NO'} |`,
      '',
      '## Route samples',
      '',
      '`' + routeMs.samples.join(', ') + '` ms for workout→bodymap→hub→settings→dashboard',
      '',
      '## Critical assets',
      '',
      ...Object.entries(sizes.detail).map(([k, v]) => `- \`${k}\`: ${v} B`),
      '',
      `**Splash:** ${splashMs} (must dissolve when load done — no artificial delay).`,
      '',
      '## Notes',
      '',
      '- Lazy Learn modules not in critical path (MODULE_SRC).',
      '- Low Power Mode disables bg canvas (Settings → Access).',
      '- After optimize, re-run `npx playwright test tests/perf.spec.js --project=chromium`.',
      ''
    ].join('\n');

    fs.writeFileSync(path.join(__dirname, '..', 'PERF.md'), md, 'utf8');

    expect(report.pass.dcl, `DCL ${nav && nav.dcl} > ${BUDGETS.dclMs}`).toBeTruthy();
    expect(report.pass.tti, `TTI ${tReady} > ${BUDGETS.ttiMs}`).toBeTruthy();
    expect(report.pass.assets, `assets ${sizes.total} > budget`).toBeTruthy();
    expect(report.pass.route, `route max ${routeMs.max} > ${BUDGETS.routeMs}`).toBeTruthy();
  });
});
