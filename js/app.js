'use strict';

/* Keep in sync with VERSION.json — settings/footer read this. */
window.APP_VERSION = '6.15.0';

/* ══════════════════════════════════════════════════════
   ROUTER
══════════════════════════════════════════════════════ */
const _screens = {};
let _currentScreen = null;
let _navigationSeq = 0;
const _routeCleanups = {};

function registerRouteCleanup(id, fn) {
  if (!id || typeof fn !== 'function') return;
  _routeCleanups[id] = fn;
}
function _runRouteCleanup(id) {
  const fn = id && _routeCleanups[id];
  if (!fn) return;
  try { fn(); } catch (e) { console.error('route cleanup (' + id + ')', e); }
}
window.registerRouteCleanup = registerRouteCleanup;

function upgradeInteractiveMarkup(root) {
  if (!root) return;
  root.querySelectorAll('[onclick]').forEach(function(el) {
    if (/^(BUTTON|A|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(el.tagName) || el.dataset.keyboardClick === 'true') return;
    if (!el.hasAttribute('role')) el.setAttribute('role', 'button');
    if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    el.dataset.keyboardClick = 'true';
    el.addEventListener('keydown', function(e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      el.click();
    });
  });
}
window.upgradeInteractiveMarkup = upgradeInteractiveMarkup;

/** Old go() ids → Ember survivors (quarantined screens redirect). */
const SCREEN_ALIASES = {
  today: 'dashboard',
  home: 'dashboard',
  me: 'settings',
  train: 'workout',
  log: 'workout',
  programs: 'my-plan',
  plan: 'my-plan',
  body: 'progress',
  bodymap: 'progress',
  explore: 'my-plan',
  learn: 'my-plan',
  hub: 'my-plan',
  academy: 'my-plan',
  encyclopedia: 'my-plan',
  search: 'workout',
  calculators: 'settings',
  visualizations: 'progress',
  assistant: 'dashboard',
  coach: 'dashboard',
  quests: 'dashboard',
  briefing: 'dashboard',
  calisthenics: 'workout',
  'training-intel': 'workout',
  'training-style': 'workout',
  physique: 'progress',
  'physique-archetype': 'progress',
  'physique-timeline': 'progress',
  anatomy: 'rehab',
  'injury-risk': 'rehab',
  'body-intelligence': 'recovery',
  'recovery-debt': { id: 'recovery', data: { tab: 'checkin' } },
  intro: { id: 'onboarding', data: { showIntro: true } }
};
window.SCREEN_ALIASES = SCREEN_ALIASES;

function resolveScreenAlias(id, data) {
  const a = SCREEN_ALIASES[id];
  if (!a) return { id: id, data: data };
  if (typeof a === 'string') return { id: a, data: data };
  return {
    id: a.id,
    data: Object.assign({}, data || {}, a.data || {})
  };
}
window.resolveScreenAlias = resolveScreenAlias;

/** Which bottom-nav tab stays lit for nested screens (Ember IA). */
const NAV_PARENT = {
  dashboard: 'dashboard', briefing: 'dashboard', quests: 'dashboard', assistant: 'dashboard', coach: 'dashboard',
  workout: 'workout', active: 'workout', cardio: 'workout', calisthenics: 'workout',
  'training-intel': 'workout', 'training-style': 'workout', search: 'workout',
  progress: 'progress', photos: 'progress', visualizations: 'progress', physique: 'progress',
  'physique-archetype': 'progress', 'physique-timeline': 'progress', bodymap: 'progress',
  programs: 'programs', 'my-plan': 'programs', 'plan-import': 'programs', hub: 'programs',
  encyclopedia: 'programs', academy: 'programs', learn: 'programs',
  settings: 'settings', profiles: 'settings', 'equipment-setup': 'settings', 'split-builder': 'settings',
  nutrition: 'settings', recovery: 'settings', 'recovery-debt': 'settings', rehab: 'settings',
  'injury-risk': 'settings', anatomy: 'settings', calculators: 'settings', 'body-intelligence': 'settings'
};
window.NAV_PARENT = NAV_PARENT;

function reg(id, fn) { _screens[id] = fn; }
window.reg = reg;
window.listScreens = function() {
  const set = {};
  Object.keys(_screens).forEach(function(k) { set[k] = 1; });
  Object.keys(MODULE_SRC || {}).forEach(function(k) { set[k] = 1; });
  return Object.keys(set).sort();
};
window.currentScreenId = function() { return _currentScreen; };

/* ── Icon system: minimalist stroke icons (SF-symbol flavor) ──
   Chrome/actions use these, not emoji. Emoji stays only in celebratory or
   content contexts. icon(name, size?, color?) → inline SVG string. */
const _ICONS = {
  scale:    'M12 3v3M6 6l-2 6a3 3 0 006 0L8 6m8 0l-2 6a3 3 0 006 0l-2-6M4 6h16M12 6v13m-4 2h8',
  pill:     'M10.5 3.5a5 5 0 017 7l-7 7a5 5 0 01-7-7zM7 7l7 7',
  dumbbell: 'M7 8v8M4 10v4M17 8v8M20 10v4M7 12h10',
  bandage:  'M8 5L5 8l11 11 3-3zM5 8l-1.5 1.5a2 2 0 000 3L8 17m8-14l1.5 1.5a2 2 0 010 3L16 9M11 11l.01.01M13 13l.01.01',
  leaf:     'M6 15C6 9 10 5 19 5c0 9-4 13-10 13-1.5 0-3-.5-3-3zM6 15l-2 4M6 15c2-1 5-3 7-6',
  calendar: 'M5 6h14a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1zM8 3v5M16 3v5M4 11h16',
  camera:   'M4 8h3l2-2h6l2 2h3a1 1 0 011 1v10a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1zM12 17a4 4 0 100-8 4 4 0 000 8z',
  heart:    'M12 20s-7-4.5-9-9c-1.2-2.8.5-6 3.5-6 2 0 3.5 1 4.5 3 1-2 2.5-3 4.5-3 3 0 4.7 3.2 3.5 6-2 4.5-7 9-7 9z',
  apple:    'M12 7c-3 0-6 2-6 6 0 3.5 2.5 7 5 7 .8 0 1.2-.4 2-.4s1.2.4 2 .4c2.5 0 5-3.5 5-7 0-4-3-6-6-6-.7 0-1.3.2-2 .2S12.7 7 12 7zM12 7c0-2 1-3.5 3-4',
  ruler:    'M3 17L17 3l4 4L7 21zM8 16l1.5 1.5M11 13l1.5 1.5M14 10l1.5 1.5M17 7l1.5 1.5',
  dna:      'M7 3c0 6 10 6 10 12M17 3c0 6-10 6-10 12M7 15c0 3 2 6 5 6M17 15c0 3-2 6-5 6M8 7h8M8 17h8',
  alert:    'M12 4l9 16H3zM12 10v5M12 18v.5',
  calc:     'M6 3h12a1 1 0 011 1v16a1 1 0 01-1 1H6a1 1 0 01-1-1V4a1 1 0 011-1zM8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01',
  search:   'M10.5 17a6.5 6.5 0 100-13 6.5 6.5 0 000 13zM15.5 15.5L21 21',
  chart:    'M4 20V10M10 20V4M16 20v-8M4 20h17',
  flame:    'M12 3c1 3 4 5 4 9a4 4 0 11-8 0c0-2 1-3 1-3s0 2 2 2c0-3-1-5 1-8z',
  sun:      'M12 17a5 5 0 100-10 5 5 0 000 10zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  sparkles: 'M12 4l1.5 4.5L18 10l-4.5 1.5L12 16l-1.5-4.5L6 10l4.5-1.5zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8zM5 16l.6 1.6L7 18l-1.4.6L5 20l-.6-1.4L3 18l1.4-.4z',
  play:     'M8 5l11 7-11 7z',
  bed:      'M3 7v11M3 14h18v4M3 11h8v3M13 11h6a2 2 0 012 2v1',
  walk:     'M13 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM13 7l-2 5 3 3v6M11 12l-3 2-1 5M13 7l3 2 3 1M11 12l2-5',
  trendDown:'M4 7l6 6 4-4 6 6M14 15h6v-6',
  refresh:  'M20 8A8 8 0 106.3 18.7M20 8V3M20 8h-5',
  run:      'M14 5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM4 21l5-4 1-5-2-3 5-2 2 3 4 1M10 7l-4 3M13 12l2 4 4 2',
  check:    'M5 13l4 4L19 7',
  moon:     'M20 14A8 8 0 1110 4a6.5 6.5 0 0010 10z',
  book:     'M5 4h6a2 2 0 012 2v14a2 2 0 00-2-2H5zM19 4h-6a2 2 0 00-2 2v14a2 2 0 012-2h6z',
  gradcap:  'M12 4L2 9l10 5 10-5zM6 11v5c0 1.5 2.7 3 6 3s6-1.5 6-3v-5M22 9v6',
  target:   'M12 21a9 9 0 100-18 9 9 0 000 18zM12 17a5 5 0 100-10 5 5 0 000 10zM12 13a1 1 0 100-2 1 1 0 000 2z',
  clock:    'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 3',
  star:     'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3-5.4 3 1.2-6-4.5-4.2 6.1-.7z',
  edit:     'M4 20h4L18.5 9.5l-4-4L4 16zM14 6l4 4'
};
function icon(name, size, color) {
  const d = _ICONS[name];
  if (!d) return '';
  return '<svg width="' + (size || 20) + '" height="' + (size || 20) + '" viewBox="0 0 24 24" fill="none" ' +
    'stroke="' + (color || 'currentColor') + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" ' +
    'aria-hidden="true" style="flex-shrink:0">' + '<path d="' + d + '"/></svg>';
}
window.icon = icon;
/* Icon in a tinted rounded square — the Apple "settings row" look */
window.iconTile = function(name, tint, size) {
  const s = size || 34;
  return '<div style="width:' + s + 'px;height:' + s + 'px;border-radius:' + Math.round(s * 0.3) + 'px;' +
    'background:rgba(var(--' + (tint || 'c1') + '-rgb),0.14);color:var(--' + (tint || 'c1') + ');' +
    'display:flex;align-items:center;justify-content:center;flex-shrink:0">' +
    icon(name, Math.round(s * 0.55)) + '</div>';
};

/* 'upper_chest' → 'Upper Chest' — raw data ids must never reach the UI */
function prettyMuscle(m) {
  return String(m || '').split('_').map(function(w) {
    return w.charAt(0).toUpperCase() + w.slice(1);
  }).join(' ');
}
window.prettyMuscle = prettyMuscle;
window.prettyMuscles = function(arr, max) {
  return (arr || []).slice(0, max || 99).map(prettyMuscle).join(' · ');
};

/* On-demand survivors only (quarantined modules redirected via SCREEN_ALIASES). */
const MODULE_SRC = {
  'equipment-setup': 'js/modules/equipment-setup.js',
  'my-plan': 'js/modules/my-plan.js',
  'plan-import': 'js/modules/my-plan.js'
};
window.MODULE_SRC = MODULE_SRC;

const _loadingScripts = {};
function loadScript(src) {
  if (!src) return Promise.resolve();
  if (_loadingScripts[src]) return _loadingScripts[src];
  _loadingScripts[src] = new Promise(function(resolve, reject) {
    const existing = document.querySelector('script[data-pc-mod="' + src + '"]');
    if (existing) { resolve(); return; }
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.setAttribute('data-pc-mod', src);
    s.onload = function() { resolve(); };
    s.onerror = function() { delete _loadingScripts[src]; reject(new Error('Failed to load ' + src)); };
    document.head.appendChild(s);
  });
  return _loadingScripts[src];
}
window.loadScript = loadScript;

function _renderScreen(id, data) {
  const sameScreen = id === _currentScreen;
  const SCROLL_PRESERVE_SCREENS = { bodymap: 1, recovery: 1 };
  const preserveScroll = sameScreen && (
    (data && data.preserveScroll) || (!data && SCROLL_PRESERVE_SCREENS[id])
  );
  if (!sameScreen) {
    _runRouteCleanup(_currentScreen);
    if (typeof haptic === 'function') haptic(10);
  }
  _currentScreen = id;
  document.title = (id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ')) + ' — PulseCap';
  const html = _screens[id](data) || '';
  const v = document.getElementById('view');
  if (!v) return;
  const scrollY = preserveScroll ? v.scrollTop : 0;
  const fastApp = document.body && document.body.getAttribute('data-cap-app') === '1';
  if (!v.querySelector('.screen')) v.innerHTML = '';
  const div = document.createElement('div');
  div.className = (sameScreen || fastApp) ? 'screen' : 'screen screen-enter';
  div.innerHTML = html;
  upgradeInteractiveMarkup(div);
  const prev = v.querySelector('.screen');
  if (prev) prev.remove();
  v.appendChild(div);
  if (sameScreen) {
    v.scrollTop = scrollY;
  } else {
    v.scrollTop = 0;
    if (!fastApp) {
      requestAnimationFrame(function() { div.classList.add('screen-enter-active'); });
    }
  }
  const nav = document.getElementById('nav');
  const noNav = ['onboarding', 'intro', 'briefing'];
  if (nav) nav.style.display = noNav.includes(id) ? 'none' : 'flex';
  const navId = NAV_PARENT[id] || id;
  document.querySelectorAll('.nb').forEach(b => b.classList.remove('on'));
  const nb = document.getElementById('nb-' + navId);
  if (nb) nb.classList.add('on');
  document.querySelectorAll('.cap-side-btn').forEach(b => b.classList.remove('on'));
  const sb = document.getElementById('cap-sb-' + navId);
  if (sb) sb.classList.add('on');
}

function go(id, data) {
  const navSeq = ++_navigationSeq;
  try {
    const resolved = resolveScreenAlias(id, data);
    id = resolved.id;
    data = resolved.data;
    if (!_screens[id]) {
      const src = MODULE_SRC[id];
      if (!src) throw new Error('Screen "' + id + '" not registered');
      const v = document.getElementById('view');
      if (v) {
        v.innerHTML = '<div class="screen pad" style="padding:var(--space-6,24px);color:var(--txt2);font-size:var(--type-body,14px)">Loading…</div>';
      }
      loadScript(src).then(function() {
        if (navSeq !== _navigationSeq) return;
        if (!_screens[id]) throw new Error('Screen "' + id + '" missing after load');
        _renderScreen(id, data);
      }).catch(function(e) {
        if (navSeq !== _navigationSeq) return;
        console.error('go(' + id + ') lazy', e);
        const view = document.getElementById('view');
        if (view) view.innerHTML = '<div class="screen pad" style="padding:var(--space-6,24px);color:#ff4444;font-size:14px;line-height:1.6">' +
          '<strong>Could not load screen</strong><br>' + esc(e.message) +
          '<br><br><button type="button" class="btn btn-secondary" onclick="go(\'dashboard\')">← Back to Home</button></div>';
      });
      return;
    }
    _renderScreen(id, data);
  } catch(e) {
    console.error('go(' + id + ')', e);
    const v = document.getElementById('view');
    if (v) v.innerHTML = '<div class="screen pad" style="padding:var(--space-6,24px);color:#ff4444;font-size:14px;line-height:1.6">' +
      '<strong>Screen error: ' + esc(id) + '</strong><br>' + esc(e.message) +
      '<br><br><button type="button" class="btn btn-secondary" onclick="go(\'dashboard\')">← Back to Home</button></div>';
  }
}
window.go = go;

/** ?demo=1 — silent demo profile with sample workout history (screenshots / walkthroughs). */
function bootDemoIfRequested() {
  try {
    var demo = new URLSearchParams(location.search).get('demo') === '1';
    if (demo && typeof S !== 'undefined' && S.createDemo) {
      S.createDemo(true);
      if (typeof CapDemo !== 'undefined') {
        CapDemo.markActive();
        CapDemo.showBanner('pulsecap', '<strong>Demo mode</strong> — Alex Khan sample athlete. Data stays on this device.');
      }
      return true;
    }
  } catch (e) { /* ignore */ }
  return false;
}
window.bootDemoIfRequested = bootDemoIfRequested;

/** Home-screen shortcuts / deep links: ?go=screen | ?action=start|today */
let _pendingDeepLink = null;
function bootDeepLink() {
  try {
    const q = new URLSearchParams(location.search);
    const action = q.get('action');
    const goTo = q.get('go') || q.get('tab');
    if (action === 'start' || goTo === 'log' || goTo === 'workout') {
      _pendingDeepLink = function() {
        if (typeof startWorkout === 'function' && S.g('onboarded')) startWorkout();
        else if (S.g('onboarded') && typeof go === 'function') go('workout');
        else if (typeof go === 'function') go('onboarding', { showIntro: true });
      };
      return true;
    }
    if (action === 'today' || goTo === 'today' || goTo === 'dashboard') {
      _pendingDeepLink = function() {
        if (typeof go === 'function') go(S.g('onboarded') ? 'dashboard' : 'onboarding', S.g('onboarded') ? undefined : { showIntro: true });
      };
      return true;
    }
    if (goTo === 'exercises' || goTo === 'encyclopedia') {
      _pendingDeepLink = function() {
        if (typeof go === 'function') go(S.g('onboarded') ? 'my-plan' : 'onboarding', S.g('onboarded') ? undefined : { showIntro: true });
      };
      return true;
    }
    if (goTo && typeof go === 'function') {
      _pendingDeepLink = function() {
        go(S.g('onboarded') ? goTo : 'onboarding', S.g('onboarded') ? undefined : { showIntro: true });
      };
      return true;
    }
  } catch (e) { /* ignore */ }
  return false;
}
function runPendingDeepLink() {
  const fn = _pendingDeepLink;
  _pendingDeepLink = null;
  if (fn) fn();
  return !!fn;
}
window.bootDeepLink = bootDeepLink;
window.runPendingDeepLink = runPendingDeepLink;

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function jsArg(value) {
  return esc(JSON.stringify(String(value == null ? '' : value)));
}
function isoNow() { return new Date().toISOString(); }
/* LOCAL calendar date — never toISOString (that's UTC and breaks evenings
   for anyone east of Greenwich: wrong "today", broken streaks, wrong weekday). */
function localISO(d) {
  d = d || new Date();
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}
window.localISO = localISO;
function today() { return localISO(new Date()); }
function fmtDate(d) { try { return new Date(d).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}); } catch(e){return d||'';} }
function fmtTime(secs) { const m=Math.floor(secs/60),s=secs%60; return (m<10?'0':'')+m+':'+(s<10?'0':'')+s; }
function fmtMins(mins) { return mins<60?mins+'m':Math.floor(mins/60)+'h '+(mins%60?mins%60+'m':''); }
function daysAgo(d) { return Math.floor((Date.now() - new Date(d)) / 864e5); }
function greet() { const h=new Date().getHours(); return h<12?'Good morning':h<17?'Good afternoon':'Good evening'; }
function round2(n) { return Math.round(n*100)/100; }
function usesImperial(user) {
  return ((user || (typeof S !== 'undefined' ? S.g('user') : null) || {}).units === 'imperial');
}
function weightFromKg(kg, user) {
  const value = Number(kg) || 0;
  return usesImperial(user) ? Math.round(value * 2.2046226218 * 10) / 10 : Math.round(value * 10) / 10;
}
function weightToKg(value, user) {
  const amount = Number(value) || 0;
  return usesImperial(user) ? Math.round(amount * 0.45359237 * 100) / 100 : Math.round(amount * 100) / 100;
}
function heightFromCm(cm, user) {
  const value = Number(cm) || 0;
  return usesImperial(user) ? Math.round(value / 2.54 * 10) / 10 : Math.round(value * 10) / 10;
}
function heightToCm(value, user) {
  const amount = Number(value) || 0;
  return usesImperial(user) ? Math.round(amount * 2.54 * 10) / 10 : Math.round(amount * 10) / 10;
}
function weightUnit(user) { return usesImperial(user) ? 'lb' : 'kg'; }
function formatWeight(kg, user) { return weightFromKg(kg, user) + ' ' + weightUnit(user); }
window.esc=esc;window.jsArg=jsArg;window.isoNow=isoNow;window.today=today;window.fmtDate=fmtDate;
window.fmtTime=fmtTime;window.fmtMins=fmtMins;window.daysAgo=daysAgo;window.greet=greet;
window.usesImperial=usesImperial;window.weightFromKg=weightFromKg;window.weightToKg=weightToKg;
window.heightFromCm=heightFromCm;window.heightToCm=heightToCm;window.weightUnit=weightUnit;window.formatWeight=formatWeight;

/* ══════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════ */
let _toastTimer = null;
function toast(msg, type, dur) {
  const t = document.getElementById('toast');
  if (!t) return;
  /* Stroke icons — no emoji in chrome */
  const iconMap = { ok: 'check', err: 'alert', pr: 'sparkles', achieve: 'sparkles', warn: 'alert', info: 'sparkles' };
  const ic = t.querySelector('.toast-icon');
  if (ic) {
    ic.textContent = '';
    ic.innerHTML = typeof icon === 'function' ? icon(iconMap[type || 'ok'] || 'check', 18) : '';
  }
  t.querySelector('.toast-msg').textContent = msg;
  t.className = 't-' + (type || 'ok') + ' show';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { t.className = ''; }, dur || 3200);
}
window.toast = toast;

function haptic(p) { if (navigator.vibrate) navigator.vibrate(p||25); }
window.haptic = haptic;

/* ══════════════════════════════════════════════════════
   PERFORMANCE CACHE
══════════════════════════════════════════════════════ */
window._cache = {};
window.cached = function(key, fn, ttlMs) {
  const now = Date.now();
  const ttl = ttlMs || 30000;
  if (_cache[key] && (now - _cache[key].t) < ttl) return _cache[key].v;
  try { _cache[key] = { v: fn(), t: now }; } catch(e) { return null; }
  return _cache[key].v;
};

/* ══════════════════════════════════════════════════════
   UI BUILDERS
══════════════════════════════════════════════════════ */
function sh(title, action, onclick) {
  return '<div class="sh"><div class="sh-t">' + esc(title) + '</div>' +
    (action?'<div class="sh-s tappable" onclick="'+onclick+'">'+esc(action)+'</div>':'') + '</div>';
}
function emptyState(icon, title, sub, btnLabel, btnCb) {
  return '<div class="cap-empty"><div class="cap-empty__icon">'+icon+'</div>' +
    '<div class="cap-empty__title">'+esc(title)+'</div>' +
    '<div class="cap-empty__body">'+esc(sub)+'</div>' +
    (btnLabel?'<div class="cap-empty__cta"><button type="button" class="btn btn-secondary btn-sm" onclick="'+btnCb+'">'+esc(btnLabel)+'</button></div>':'') + '</div>';
}

/** P4 module contract — shared topbar / spacing helpers (prefer classes over inline). */
function moduleTopbar(title, opts) {
  opts = opts || {};
  const back = opts.backScreen
    ? '<button type="button" class="topbar-icon press" onclick="go(\'' + opts.backScreen + '\')" aria-label="Back">←</button>'
    : (opts.left || '');
  const right = opts.right || '';
  return '<div class="topbar">' + back +
    '<div class="topbar-title">' + esc(title) + '</div>' +
    (right ? '<div class="topbar-right">' + right + '</div>' : '') +
    '</div>';
}
/** History-aware back chip — preferred for Learn deep-screens. */
function moduleBackTopbar(title, fallbackScreen) {
  const fb = fallbackScreen || 'hub';
  return '<div class="topbar"><button type="button" class="back-chip" onclick="history.length>1?history.back():go(\'' + fb + '\')" aria-label="Back" style="min-height:44px;min-width:44px">←</button>' +
    '<div class="topbar-title">' + esc(title) + '</div></div>';
}
function moduleLede(text) {
  return '<p class="mod-lede">' + esc(text) + '</p>';
}
function moduleChip(label, screen, on) {
  return '<button type="button" onclick="go(\'' + screen + '\')" class="press mod-chip' + (on ? ' on' : '') + '">' + esc(label) + '</button>';
}
/** Prefer these over raw style= chrome when building screens. */
function uiCard(innerHtml, cls) {
  return '<div class="' + (cls || 'card-block') + '">' + (innerHtml || '') + '</div>';
}
function uiSection(label) {
  return '<div class="section-label">' + esc(label) + '</div>';
}
function uiSpacer() {
  return '<div class="spacer-bottom" aria-hidden="true"></div>';
}
window.moduleTopbar = moduleTopbar;
window.moduleBackTopbar = moduleBackTopbar;
window.moduleLede = moduleLede;
window.moduleChip = moduleChip;
window.uiCard = uiCard;
window.uiSection = uiSection;
window.uiSpacer = uiSpacer;
function modal(title, bodyHtml, footerHtml, options) {
  closeModal();
  const d = document.createElement('div');
  d.className = 'modal-overlay'; d.id = '_modal';
  d._returnFocus = document.activeElement;
  d._onClose = options && typeof options.onClose === 'function' ? options.onClose : null;
  d.onclick = e => { if(e.target===d) closeModal(); };
  const titleId = '_modal_title';
  d.innerHTML = '<div class="modal-sheet" role="dialog" aria-modal="true" ' +
    (title ? 'aria-labelledby="' + titleId + '"' : 'aria-label="Dialog"') + ' tabindex="-1"><div class="modal-handle" aria-hidden="true"></div>' +
    '<button type="button" class="modal-close" aria-label="Close" onclick="closeModal()">✕</button>' +
    (title?'<div class="modal-title" id="' + titleId + '">'+esc(title)+'</div>':'') +
    bodyHtml + (footerHtml||'') + '</div>';
  d.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = Array.from(d.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'))
      .filter(function(el) { return el.offsetParent !== null; });
    if (!items.length) {
      e.preventDefault();
      d.querySelector('.modal-sheet').focus();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
  document.body.appendChild(d);
  /* Lock the page behind the sheet so iOS keyboard focus-scroll can't yank it */
  const v = document.getElementById('view');
  if (v) { d._viewScroll = v.scrollTop; v.style.overflow = 'hidden'; }
  const initialFocus = d.querySelector('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]');
  (initialFocus || d.querySelector('.modal-sheet')).focus();
}
function closeModal() {
  const m = document.getElementById('_modal');
  if (m) {
    const cleanup = m._onClose;
    const returnFocus = m._returnFocus;
    m._onClose = null;
    if (cleanup) {
      try { cleanup(); } catch (e) { console.error('modal cleanup', e); }
    }
    const v = document.getElementById('view');
    if (v) { v.style.overflow = ''; if (m._viewScroll != null) v.scrollTop = m._viewScroll; }
    m.remove();
    if (returnFocus && typeof returnFocus.focus === 'function' && document.contains(returnFocus)) returnFocus.focus();
  }
}
window.sh=sh;window.emptyState=emptyState;window.modal=modal;window.closeModal=closeModal;

/* ══════════════════════════════════════════════════════
   RING HTML HELPER
══════════════════════════════════════════════════════ */
function buildRing(pct, color, label, sublabel) {
  const r=30, circ=2*Math.PI*r, dash=circ*Math.min(pct,100)/100;
  return '<div class="ring-wrap">' +
    '<div class="ring-outer">' +
    '<svg class="ring-svg" width="76" height="76" viewBox="0 0 76 76">' +
    '<circle class="ring-track" cx="38" cy="38" r="'+r+'"/>' +
    '<circle class="ring-prog" cx="38" cy="38" r="'+r+'" stroke="'+color+'" stroke-dasharray="'+circ+'" stroke-dashoffset="'+(circ-dash)+'"/>' +
    '</svg>' +
    '<div class="ring-center"><div class="ring-pct">'+Math.round(pct)+'%</div>' +
    (sublabel?'<div class="ring-sub">'+esc(sublabel)+'</div>':'') + '</div></div>' +
    '<div class="ring-label">'+esc(label)+'</div></div>';
}
window.buildRing = buildRing;

/* ══════════════════════════════════════════════════════
   CANVAS — removed in Ember (no ambient orbs)
══════════════════════════════════════════════════════ */
function initCanvas() { /* no-op: bg-canvas removed */ }
window.initCanvas = initCanvas;

/* ══════════════════════════════════════════════════════
   THEME MANAGER
══════════════════════════════════════════════════════ */
function normalizePulseTheme(id) {
  return id === 'light' ? 'light' : 'dark';
}

function applyTheme(t, persist) {
  const theme = normalizePulseTheme(t);
  document.documentElement.setAttribute('data-theme', theme);
  /* Capricorn shared components (premium nav, glass surfaces) read their own
     attribute — keep both in sync or light mode ships a dark navbar. */
  document.documentElement.setAttribute('data-cap-theme', theme);
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  if (themeMeta) themeMeta.setAttribute('content', theme === 'light' ? '#f2f2f7' : '#0d0d0f');
  if (persist !== false) {
    S.set('user.theme', theme);
    S.set('user.mode', theme);
  }
  if (window._fitnessCanvas && window._fitnessCanvas.refresh) window._fitnessCanvas.refresh();
}
window.applyTheme = applyTheme;

/* No pinned theme → follow the device, live. */
function applySystemTheme() {
  const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)');
  applyTheme(mq && mq.matches ? 'light' : 'dark', false);
}
window.applySystemTheme = applySystemTheme;
window.clearThemePref = function() {
  S.set('user.theme', null);
  S.set('user.mode', null);
  applySystemTheme();
};
if (window.matchMedia) {
  try {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function() {
      if (!S.g('user.theme')) applySystemTheme();
    });
  } catch(e) {}
}

function applyMode(mode) {
  applyTheme(mode === 'light' ? 'light' : 'dark');
  toast((mode === 'light' ? '☀️ Light mode' : '🌙 Dark mode'), 'info');
}
window.applyMode = applyMode;

/* Engines live in js/engines.js (loaded right after this file). */


/* ══════════════════════════════════════════════════════
   NAV
══════════════════════════════════════════════════════ */
/* Ember IA: Today · Train · Progress · Programs · Me */
const CORE_NAV_DEFAULT = ['dashboard', 'workout', 'progress', 'programs', 'settings'];
const NAV_TAB_ORDER = ['dashboard', 'workout', 'progress', 'programs', 'settings'];

const DEFAULT_NAV_TABS = [
  { id:'dashboard', label:'Today', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
  { id:'workout',   label:'Train', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="5.5" cy="12" r="2.5"/><circle cx="18.5" cy="12" r="2.5"/><line x1="8" y1="12" x2="16" y2="12"/><circle cx="5.5" cy="7" r="1.5"/><circle cx="5.5" cy="17" r="1.5"/><circle cx="18.5" cy="7" r="1.5"/><circle cx="18.5" cy="17" r="1.5"/></svg>' },
  { id:'progress',  label:'Progress', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-8M4 20h17"/></svg>' },
  { id:'programs',  label:'Programs', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>' },
  { id:'settings',  label:'Me',    icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>' }
];
window.DEFAULT_NAV_TABS = DEFAULT_NAV_TABS;
window.CORE_NAV_DEFAULT = CORE_NAV_DEFAULT;
window.NAV_TAB_ORDER = NAV_TAB_ORDER;

function _normalizeNavTabs(ids) {
  /* Ember: force canonical 5 tabs; map legacy Body/Learn into Progress/Programs */
  const legacyMap = {
    coach: 'programs', assistant: 'programs', recovery: 'settings', search: 'workout',
    bodymap: 'progress', hub: 'programs', rehab: 'settings', anatomy: 'settings',
    calisthenics: 'workout', home: 'dashboard', today: 'dashboard', explore: 'programs',
    learn: 'programs', me: 'settings', train: 'workout', body: 'progress', log: 'workout',
    plan: 'programs', 'my-plan': 'programs'
  };
  let list = (ids || []).map(function(id) { return legacyMap[id] || id; });
  list = list.filter(function(id, i) {
    return list.indexOf(id) === i && DEFAULT_NAV_TABS.some(function(t) { return t.id === id; });
  });
  if (list.length !== 5 || JSON.stringify(list) !== JSON.stringify(CORE_NAV_DEFAULT)) {
    return CORE_NAV_DEFAULT.slice();
  }
  return list;
}

function _getNavTabIds() {
  const legacy = S.g('nav.tabs');
  if (legacy && !S.g('settings.navTabs')) {
    S.set('settings.navTabs', _normalizeNavTabs(legacy));
    S.set('nav.tabs', null);
  }
  const saved = S.g('settings.navTabs');
  if (saved && Array.isArray(saved) && saved.length >= 3) {
    const normalized = _normalizeNavTabs(saved);
    if (JSON.stringify(normalized) !== JSON.stringify(saved)) S.set('settings.navTabs', normalized);
    return normalized;
  }
  return CORE_NAV_DEFAULT.slice();
}
window._normalizeNavTabs = _normalizeNavTabs;
window._getNavTabIds = _getNavTabIds;

function buildNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  if (S.g('settings.navMigration') !== 5) {
    S.set('settings.navTabs', CORE_NAV_DEFAULT.slice());
    S.set('settings.navMigration', 5);
  }
  const ids = _getNavTabIds();
  const tabs = ids.map(function(id) { return DEFAULT_NAV_TABS.find(function(t) { return t.id === id; }); }).filter(Boolean);
  nav.innerHTML = tabs.map(function(t) {
    return '<button type="button" class="nb press" id="nb-'+t.id+'" onclick="go(\''+t.id+'\');haptic(12)">' +
      t.icon + '<span>'+t.label+'</span></button>';
  }).join('');
  const sidebar = document.getElementById('cap-nav-sidebar');
  if (sidebar) {
    sidebar.innerHTML = '<div class="cap-sidebar-brand">PulseCap</div>' + tabs.map(function(t) {
      return '<button type="button" class="cap-side-btn" id="cap-sb-'+t.id+'" onclick="go(\''+t.id+'\');haptic(12)">' +
        '<span>'+t.icon+'</span><span>'+t.label+'</span></button>';
    }).join('');
  }
}
window.buildNav = buildNav;

/* ══════════════════════════════════════════════════════
   CELEBRATION OVERLAY
══════════════════════════════════════════════════════ */
window.celebrate = function(icon, title, sub, duration) {
  var dur = duration || 2200;
  var existing = document.getElementById('celebration-overlay');
  if (existing) existing.remove();
  var el = document.createElement('div');
  el.id = 'celebration-overlay';
  el.innerHTML = '<div class="cel-icon">' + (icon || (typeof window.icon === 'function' ? window.icon('sparkles', 36) : '')) + '</div>' +
    '<div class="cel-title">' + (title || 'Achievement Unlocked!') + '</div>' +
    (sub ? '<div class="cel-sub">' + sub + '</div>' : '');
  document.body.appendChild(el);
  if (navigator.vibrate) navigator.vibrate([50, 30, 80]);
  setTimeout(function() {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.4s ease';
    setTimeout(function() { el.remove(); }, 400);
  }, dur);
};

