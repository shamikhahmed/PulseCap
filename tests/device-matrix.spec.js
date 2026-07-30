// @ts-check
/**
 * Device matrix visual QA — set DEVICE_MATRIX=1 to capture.
 * Out: qa/device-matrix/{family}/{device-id}/{screen}.png + meta.json
 * PNGs gitignored; keep REPORT.md.
 */
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const {
  ALL_DEVICES,
  MAJOR_SCREENS,
  SHELL_BP,
  expectedLayout,
  applyDeviceChrome,
  probeLayout,
  dismissOverlays,
} = require('./device-matrix');

const OUT = path.join(__dirname, '..', 'qa', 'device-matrix');
const RUN = process.env.DEVICE_MATRIX === '1';

test.describe('Device matrix visual QA', () => {
  test.skip(!RUN, 'Set DEVICE_MATRIX=1 to capture');

  test('capture major screens across iPhone / iPad / browser', async ({ page }) => {
    test.setTimeout(45 * 60 * 1000);
    fs.mkdirSync(OUT, { recursive: true });
    /** @type {object[]} */
    const meta = [];

    await page.goto('/?demo=1');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForFunction(() => typeof window.go === 'function' && typeof window.S !== 'undefined');
    await page.waitForFunction(
      () => window.S.activeId && window.S.activeId() === 'demo',
      undefined,
      { timeout: 30000 },
    );
    await page.evaluate(() => {
      if (typeof window.applyTheme === 'function') window.applyTheme('dark', false);
      const splash = document.getElementById('boot-splash');
      if (splash) {
        splash.style.display = 'none';
        splash.setAttribute('aria-hidden', 'true');
      }
    });
    await page.waitForTimeout(400);

    for (const device of ALL_DEVICES) {
      const dir = path.join(OUT, device.family, device.id);
      fs.mkdirSync(dir, { recursive: true });
      await applyDeviceChrome(page, device);
      await page.waitForTimeout(120);

      for (const screen of MAJOR_SCREENS) {
        await dismissOverlays(page);
        await applyDeviceChrome(page, device);

        if (screen.kind === 'lock') {
          await page.evaluate(({ safeTop, safeBottom }) => {
            let splash = document.getElementById('boot-splash');
            if (!splash) {
              splash = document.createElement('div');
              splash.id = 'boot-splash';
              splash.className = 'screen clipboard-splash';
              splash.innerHTML =
                '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:24px">' +
                '<div style="font-size:32px;font-weight:900;letter-spacing:-0.03em;color:#fff;font-family:var(--font-display,sans-serif)">PulseCap</div>' +
                '<div style="font-size:14px;color:rgba(255,255,255,0.65);max-width:240px;line-height:1.4">Gym-floor clipboard — Smart Coach, offline.</div>' +
                '</div>';
              document.body.appendChild(splash);
            }
            splash.classList.remove('clipboard-splash--out');
            splash.style.cssText = [
              'display:flex!important',
              'opacity:1!important',
              'visibility:visible!important',
              'position:fixed',
              'inset:0',
              'z-index:9998',
              'width:100%',
              'height:100%',
              'min-height:100dvh',
              'padding-top:' + safeTop + 'px',
              'padding-bottom:' + safeBottom + 'px',
              'box-sizing:border-box',
            ].join(';');
            splash.setAttribute('aria-hidden', 'false');
            const t = document.getElementById('toast');
            if (t) t.classList.remove('show');
            const nav = document.getElementById('nav');
            if (nav) nav.style.visibility = 'hidden';
            const side = document.getElementById('cap-nav-sidebar');
            if (side) side.style.visibility = 'hidden';
          }, { safeTop: device.safeTop, safeBottom: device.safeBottom });
          await page.waitForTimeout(220);
        } else if (screen.kind === 'overlay') {
          await page.evaluate(() => {
            if (typeof window.go === 'function') window.go('dashboard');
          });
          await page.waitForTimeout(220);
          await page.evaluate(() => {
            if (typeof window.showLogWeight === 'function') window.showLogWeight();
            else if (typeof window.modal === 'function') {
              window.modal('QA Overlay', '<p class="body-13">Sheet Save/Cancel reachability check</p>',
                '<button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>' +
                '<button type="button" class="btn btn-primary" onclick="closeModal()">Save</button>');
            }
          });
          await page.waitForTimeout(280);
        } else {
          await page.evaluate((route) => {
            if (typeof window.go === 'function') window.go(route);
          }, screen.route);
          await page.waitForTimeout(320);
          if (screen.route === 'settings') {
            await page.evaluate(() => {
              if (typeof window.go === 'function') window.go('settings', { tab: 'about' });
            });
            await page.waitForTimeout(200);
          }
        }

        await page.waitForFunction(() => {
          const scr = document.querySelector('#view .screen, #boot-splash');
          if (!scr) return false;
          const t = (scr.textContent || '').trim();
          return t.length > 4 && t !== 'Loading…' && t !== 'Loading...';
        }, undefined, { timeout: 15000 }).catch(() => {});

        const probe = await probeLayout(page);
        const expectLayout = expectedLayout(device);
        const file = path.join(dir, `${screen.id}.png`);
        await page.screenshot({ path: file, fullPage: false });

        meta.push({
          family: device.family,
          deviceId: device.id,
          label: device.label,
          width: device.width,
          height: device.height,
          chrome: device.chrome,
          safeTop: device.safeTop,
          safeBottom: device.safeBottom,
          screen: screen.id,
          screenLabel: screen.label,
          expectLayout,
          layoutOk: probe.layout === expectLayout,
          shellBp: SHELL_BP,
          ...probe,
          file: path.relative(path.join(__dirname, '..'), file),
        });

        if (screen.kind === 'lock') {
          await page.evaluate(() => {
            const splash = document.getElementById('boot-splash');
            if (splash) {
              if (splash.parentElement === document.body) splash.remove();
              else {
                splash.style.cssText = '';
                splash.style.display = 'none';
                splash.setAttribute('aria-hidden', 'true');
              }
            }
            const nav = document.getElementById('nav');
            if (nav) nav.style.visibility = '';
            const side = document.getElementById('cap-nav-sidebar');
            if (side) side.style.visibility = '';
          });
        }
        if (screen.kind === 'overlay') {
          await dismissOverlays(page);
        }
      }
    }

    fs.writeFileSync(path.join(OUT, 'meta.json'), JSON.stringify(meta, null, 2));

    const layoutFails = meta.filter((m) => m.screen === 'dashboard' && !m.layoutOk);
    const overflowFails = meta.filter((m) => m.overflow);
    fs.writeFileSync(
      path.join(OUT, 'probe-summary.json'),
      JSON.stringify({
        shellBp: SHELL_BP,
        layoutFails: layoutFails.map((m) => ({ device: m.deviceId, got: m.layout, expect: m.expectLayout })),
        overflowFails: overflowFails.map((m) => ({ device: m.deviceId, screen: m.screen })),
        appVer: meta.find((m) => m.appVer)?.appVer || null,
      }, null, 2),
    );

    for (const d of ALL_DEVICES) {
      expect(fs.existsSync(path.join(OUT, d.family, d.id, 'dashboard.png'))).toBe(true);
    }
  });
});
