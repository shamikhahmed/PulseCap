// @ts-check
/** Shared device matrix for visual QA — Cap Fleet DEVICE MATRIX prompt */

/** @typedef {{ id: string, label: string, width: number, height: number, chrome: string, safeTop: number, safeBottom: number, family: 'iphone'|'ipad'|'browser' }} DeviceDef */

/** Shell BP: tabs &lt;700 · sidebar ≥700 (Cap fleet — iPad mini 744 → sidebar) */
const SHELL_BP = 700;

/** @type {DeviceDef[]} */
const IPHONE = [
  { id: 'iphone-se', label: 'iPhone SE (home button)', width: 375, height: 667, chrome: 'home-button', safeTop: 20, safeBottom: 0, family: 'iphone' },
  { id: 'iphone-13-mini', label: 'iPhone 13 mini (notch)', width: 375, height: 812, chrome: 'notch', safeTop: 50, safeBottom: 34, family: 'iphone' },
  { id: 'iphone-14', label: 'iPhone 14 (notch)', width: 390, height: 844, chrome: 'notch', safeTop: 47, safeBottom: 34, family: 'iphone' },
  { id: 'iphone-14-pro', label: 'iPhone 14/15 Pro (Dynamic Island)', width: 393, height: 852, chrome: 'dynamic-island', safeTop: 59, safeBottom: 34, family: 'iphone' },
  { id: 'iphone-15-pro-max', label: 'iPhone 15 Pro Max (Dynamic Island)', width: 430, height: 932, chrome: 'dynamic-island', safeTop: 59, safeBottom: 34, family: 'iphone' },
  { id: 'iphone-16-pro-max', label: 'iPhone 16 Pro Max (Dynamic Island)', width: 440, height: 956, chrome: 'dynamic-island', safeTop: 62, safeBottom: 34, family: 'iphone' },
];

/** @type {DeviceDef[]} */
const IPAD = [
  { id: 'ipad-mini', label: 'iPad mini', width: 744, height: 1133, chrome: 'tablet', safeTop: 24, safeBottom: 20, family: 'ipad' },
  { id: 'ipad-air-11', label: 'iPad Air 11"', width: 820, height: 1180, chrome: 'tablet', safeTop: 24, safeBottom: 20, family: 'ipad' },
  { id: 'ipad-pro-11', label: 'iPad Pro 11"', width: 834, height: 1194, chrome: 'tablet', safeTop: 24, safeBottom: 20, family: 'ipad' },
  { id: 'ipad-pro-13', label: 'iPad Pro 13" portrait', width: 1024, height: 1366, chrome: 'tablet', safeTop: 24, safeBottom: 20, family: 'ipad' },
  { id: 'ipad-pro-13-land', label: 'iPad Pro 13" landscape', width: 1366, height: 1024, chrome: 'tablet', safeTop: 24, safeBottom: 20, family: 'ipad' },
];

/** @type {DeviceDef[]} */
const BROWSER = [
  { id: 'browser-phone-360', label: 'Mobile browser 360', width: 360, height: 740, chrome: 'browser', safeTop: 0, safeBottom: 0, family: 'browser' },
  { id: 'browser-sm-laptop', label: 'Laptop 1280×800', width: 1280, height: 800, chrome: 'browser', safeTop: 0, safeBottom: 0, family: 'browser' },
  { id: 'browser-hd', label: 'Desktop 1440×900', width: 1440, height: 900, chrome: 'browser', safeTop: 0, safeBottom: 0, family: 'browser' },
  { id: 'browser-fhd', label: 'Desktop 1920×1080', width: 1920, height: 1080, chrome: 'browser', safeTop: 0, safeBottom: 0, family: 'browser' },
  { id: 'browser-ultrawide', label: 'Ultrawide 2560×1080', width: 2560, height: 1080, chrome: 'browser', safeTop: 0, safeBottom: 0, family: 'browser' },
];

/** @type {DeviceDef[]} */
const ALL_DEVICES = [...IPHONE, ...IPAD, ...BROWSER];

/** Major PulseCap screens for matrix QA */
const MAJOR_SCREENS = [
  { id: 'lock', label: 'Boot splash / intro', kind: 'lock' },
  { id: 'dashboard', label: 'Today', kind: 'page', route: 'dashboard' },
  { id: 'workout', label: 'Train hub (dense)', kind: 'page', route: 'workout' },
  { id: 'settings', label: 'Settings', kind: 'page', route: 'settings' },
  { id: 'hub', label: 'Learn hub', kind: 'page', route: 'hub' },
  { id: 'overlay', label: 'Modal overlay', kind: 'overlay' },
];

/**
 * Expected layout for device given Cap shell BP.
 * @param {DeviceDef} device
 */
function expectedLayout(device) {
  return device.width >= SHELL_BP ? 'sidebar' : 'mobile-tabs';
}

/**
 * Inject safe-area simulation for Chromium (env() is usually 0).
 * @param {import('@playwright/test').Page} page
 * @param {DeviceDef} device
 */
async function applyDeviceChrome(page, device) {
  await page.setViewportSize({ width: device.width, height: device.height });
  await page.evaluate(({ safeTop, safeBottom, chrome }) => {
    const root = document.documentElement;
    root.style.setProperty('--safe', `${safeBottom}px`);
    root.style.setProperty('--top-safe', `${safeTop}px`);
    root.style.setProperty('--cap-safe-t', `${safeTop}px`);
    root.style.setProperty('--cap-safe-b', `${safeBottom}px`);
    root.dataset.qaChrome = chrome;
    root.dataset.qaSafeTop = String(safeTop);
    root.dataset.qaSafeBottom = String(safeBottom);

    let tag = document.getElementById('qa-device-safe');
    if (!tag) {
      tag = document.createElement('style');
      tag.id = 'qa-device-safe';
      document.head.appendChild(tag);
    }
    tag.textContent = `
      :root {
        --safe: ${safeBottom}px !important;
        --top-safe: ${safeTop}px !important;
      }
      .topbar {
        padding-top: max(8px, ${safeTop}px) !important;
      }
      .dash-demo-banner {
        padding-top: calc(10px + ${safeTop}px) !important;
      }
      .pc-offline-banner {
        padding-top: calc(10px + ${safeTop}px) !important;
      }
      #nav.cap-premium-nav, #nav {
        padding-bottom: ${safeBottom}px !important;
      }
      body:has(#nav.cap-premium-nav) #view,
      #view {
        padding-bottom: calc(72px + max(12px, ${safeBottom}px)) !important;
      }
      body.cap-desktop-nav #view {
        padding-bottom: 24px !important;
      }
      #toast {
        top: calc(16px + ${safeTop}px) !important;
      }
      .modal-sheet, .modal-overlay .modal-sheet {
        padding-bottom: max(16px, ${safeBottom}px) !important;
      }
      #boot-splash, .clipboard-splash {
        padding-top: ${safeTop}px !important;
        padding-bottom: ${safeBottom}px !important;
        box-sizing: border-box;
      }
    `;
    if (typeof window.CapDesktopNav !== 'undefined' && window.CapDesktopNav.sync) {
      window.CapDesktopNav.sync();
    }
  }, { safeTop: device.safeTop, safeBottom: device.safeBottom, chrome: device.chrome });
  await page.waitForTimeout(100);
}

/**
 * @param {import('@playwright/test').Page} page
 */
async function probeLayout(page) {
  return page.evaluate(() => {
    const tabs = document.getElementById('nav');
    const sidebar = document.getElementById('cap-nav-sidebar');
    const tabsCs = tabs ? getComputedStyle(tabs) : null;
    const sideCs = sidebar ? getComputedStyle(sidebar) : null;
    const tabsVisible = !!(tabs && tabsCs && tabsCs.display !== 'none' && tabs.getBoundingClientRect().height > 8);
    const sideVisible = !!(sidebar && sideCs && sideCs.display !== 'none' && sidebar.getBoundingClientRect().width > 8);
    const overflow = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;
    const view = document.getElementById('view');
    const viewPad = view ? getComputedStyle(view).paddingBottom : '';
    const desktopClass = document.body.classList.contains('cap-desktop-nav');
    let layout = 'unknown';
    if (tabsVisible && !sideVisible) layout = 'mobile-tabs';
    else if (sideVisible && !tabsVisible) layout = 'sidebar';
    else if (sideVisible && tabsVisible) layout = 'hybrid-both';
    else layout = 'neither';
    const aboutVer = (document.body.innerText || '').match(/v?\d+\.\d+\.\d+/);
    const appVer = typeof window.APP_VERSION === 'string' ? window.APP_VERSION : null;
    return {
      layout,
      tabsVisible,
      sideVisible,
      desktopClass,
      overflow,
      viewPad,
      viewportW: window.innerWidth,
      viewportH: window.innerHeight,
      appVer,
      aboutHint: aboutVer ? aboutVer[0] : null,
    };
  });
}

/**
 * Dismiss modals / toasts before capture.
 * @param {import('@playwright/test').Page} page
 */
async function dismissOverlays(page) {
  await page.evaluate(() => {
    if (typeof window.closeModal === 'function') window.closeModal();
    const t = document.getElementById('toast');
    if (t) t.classList.remove('show');
    const splash = document.getElementById('boot-splash');
    if (splash) {
      splash.style.display = 'none';
      splash.setAttribute('aria-hidden', 'true');
    }
  });
  await page.waitForTimeout(60);
}

module.exports = {
  SHELL_BP,
  IPHONE,
  IPAD,
  BROWSER,
  ALL_DEVICES,
  MAJOR_SCREENS,
  expectedLayout,
  applyDeviceChrome,
  probeLayout,
  dismissOverlays,
};
