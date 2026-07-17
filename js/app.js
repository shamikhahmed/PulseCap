'use strict';

/* Keep in sync with VERSION.json — settings/footer read this. */
window.APP_VERSION = '5.6.4';

/* ══════════════════════════════════════════════════════
   ROUTER
══════════════════════════════════════════════════════ */
const _screens = {};
let _currentScreen = null;

/** Old go() ids → canonical screen. Keep registered screens until later delete phase. */
const SCREEN_ALIASES = {
  today: 'dashboard',
  home: 'dashboard',
  explore: 'hub',
  learn: 'hub',
  me: 'settings',
  train: 'workout',
  body: 'bodymap',
  'physique-archetype': { id: 'physique', data: { tab: 'archetype' } },
  'physique-timeline': { id: 'physique', data: { tab: 'timeline' } },
  'recovery-debt': { id: 'recovery', data: { tab: 'debt' } },
  'training-style': { id: 'training-intel', data: { tab: 'style' } },
  coach: 'assistant',
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

/** Which bottom-nav tab stays lit for nested screens (P2 IA). */
const NAV_PARENT = {
  dashboard: 'dashboard', briefing: 'dashboard', quests: 'dashboard',
  workout: 'workout', active: 'workout', cardio: 'workout', progress: 'workout',
  calisthenics: 'workout', 'training-intel': 'workout', 'training-style': 'workout',
  bodymap: 'bodymap', physique: 'bodymap', 'physique-archetype': 'bodymap',
  'physique-timeline': 'bodymap', recovery: 'bodymap', 'recovery-debt': 'bodymap',
  nutrition: 'bodymap', rehab: 'bodymap', 'injury-risk': 'bodymap',
  'body-intelligence': 'bodymap', photos: 'bodymap',
  hub: 'hub', search: 'hub', encyclopedia: 'hub', anatomy: 'hub', academy: 'hub',
  calculators: 'hub', visualizations: 'hub', assistant: 'hub', coach: 'hub',
  settings: 'settings', profiles: 'settings', 'equipment-setup': 'settings', 'split-builder': 'settings'
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
  clock:    'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 3'
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

/* Lazy Learn screens — not in boot HTML. SW still precaches these for offline. */
const MODULE_SRC = {
  anatomy: 'js/modules/anatomy.js',
  encyclopedia: 'js/modules/encyclopedia.js',
  visualizations: 'js/modules/visualizations.js',
  calculators: 'js/modules/calculators.js',
  calisthenics: 'js/modules/calisthenics.js',
  search: 'js/modules/advanced-search.js',
  'injury-risk': 'js/modules/injury-risk.js',
  'body-intelligence': 'js/modules/body-intelligence.js',
  'physique-archetype': 'js/modules/physique-archetype.js',
  'training-style': 'js/modules/training-style.js',
  quests: 'js/modules/quests.js',
  academy: 'js/modules/quests.js',
  'physique-timeline': 'js/modules/quests.js',
  assistant: 'js/modules/fitness-assistant.js',
  'equipment-setup': 'js/modules/equipment-setup.js'
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
  if (!sameScreen && typeof haptic === 'function') haptic(10);
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
        if (!_screens[id]) throw new Error('Screen "' + id + '" missing after load');
        _renderScreen(id, data);
      }).catch(function(e) {
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
function bootDeepLink() {
  try {
    const q = new URLSearchParams(location.search);
    const action = q.get('action');
    const goTo = q.get('go') || q.get('tab');
    if (action === 'start' || goTo === 'log' || goTo === 'workout') {
      setTimeout(function() {
        if (typeof startWorkout === 'function' && S.g('onboarded')) startWorkout();
        else if (typeof go === 'function') go('workout');
      }, 80);
      return true;
    }
    if (action === 'today' || goTo === 'today' || goTo === 'dashboard') {
      setTimeout(function() { if (typeof go === 'function') go('dashboard'); }, 40);
      return true;
    }
    if (goTo === 'exercises' || goTo === 'encyclopedia') {
      setTimeout(function() { if (typeof go === 'function') go('encyclopedia'); }, 40);
      return true;
    }
    if (goTo && typeof go === 'function') {
      setTimeout(function() { go(goTo); }, 40);
      return true;
    }
  } catch (e) { /* ignore */ }
  return false;
}
window.bootDeepLink = bootDeepLink;

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
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
window.esc=esc;window.isoNow=isoNow;window.today=today;window.fmtDate=fmtDate;
window.fmtTime=fmtTime;window.fmtMins=fmtMins;window.daysAgo=daysAgo;window.greet=greet;

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
  return '<div class="topbar"><button type="button" class="back-chip" onclick="history.length>1?history.back():go(\'' + fb + '\')" aria-label="Back">←</button>' +
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
function modal(title, bodyHtml, footerHtml) {
  closeModal();
  const d = document.createElement('div');
  d.className = 'modal-overlay'; d.id = '_modal';
  d.onclick = e => { if(e.target===d) closeModal(); };
  d.innerHTML = '<div class="modal-sheet"><div class="modal-handle"></div>' +
    '<button type="button" class="modal-close" aria-label="Close" onclick="closeModal()">✕</button>' +
    (title?'<div class="modal-title">'+esc(title)+'</div>':'') +
    bodyHtml + (footerHtml||'') + '</div>';
  document.body.appendChild(d);
  /* Lock the page behind the sheet so iOS keyboard focus-scroll can't yank it */
  const v = document.getElementById('view');
  if (v) { d._viewScroll = v.scrollTop; v.style.overflow = 'hidden'; }
}
function closeModal() {
  const m = document.getElementById('_modal');
  if (m) {
    const v = document.getElementById('view');
    if (v) { v.style.overflow = ''; if (m._viewScroll != null) v.scrollTop = m._viewScroll; }
    m.remove();
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
   CANVAS ANIMATION
══════════════════════════════════════════════════════ */
let _canvasRunning = false;

function initCanvas() {
  const c = document.getElementById('bg-canvas');
  if (!c) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    c.style.display = 'none';
    return;
  }
  if (S.g('settings.lowPower') === true) {
    c.style.display = 'none';
    return;
  }

  const ctx = c.getContext('2d', { alpha: true });
  let W, H, lastFrame = 0;
  const orbs = [];
  let rgb1 = [0, 213, 255], rgb2 = [123, 95, 255];
  const isMobile = window.innerWidth < 500;
  const frameInterval = isMobile ? 48 : 32;

  function cacheAccentRGB() {
    const s = getComputedStyle(document.documentElement);
    function parse(primary) {
      const v = s.getPropertyValue(primary ? '--orb1' : '--orb2').trim().replace('#', '');
      if (v.length === 6) {
        return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
      }
      return primary ? [0, 213, 255] : [123, 95, 255];
    }
    rgb1 = parse(true);
    rgb2 = parse(false);
  }

  function resize() {
    W = c.width = window.innerWidth;
    H = c.height = window.innerHeight;
  }

  function initOrbs() {
    orbs.length = 0;
    const count = isMobile ? 2 : 3;
    for (let i = 0; i < count; i++) {
      orbs.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: (isMobile ? 140 : 180) + Math.random() * 80,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        primary: i === 0,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  function draw(ts) {
    if (!_canvasRunning) return;
    if (ts - lastFrame < frameInterval) {
      requestAnimationFrame(draw);
      return;
    }
    lastFrame = ts;
    ctx.clearRect(0, 0, W, H);
    orbs.forEach(function(o) {
      const pulse = 1 + Math.sin((ts * 0.0006) + o.phase) * 0.08;
      const r = o.r * pulse;
      const rgb = o.primary ? rgb1 : rgb2;
      const alpha = o.primary ? (isMobile ? 0.04 : 0.05) : (isMobile ? 0.028 : 0.034);
      const grad = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, r);
      grad.addColorStop(0, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + alpha + ')');
      grad.addColorStop(1, 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(o.x, o.y, r, 0, Math.PI * 2);
      ctx.fill();
      o.x += o.vx;
      o.y += o.vy;
      if (o.x < -r || o.x > W + r) o.vx *= -1;
      if (o.y < -r || o.y > H + r) o.vy *= -1;
    });
    requestAnimationFrame(draw);
  }

  function start() {
    if (_canvasRunning) return;
    _canvasRunning = true;
    c.style.display = '';
    cacheAccentRGB();
    resize();
    initOrbs();
    requestAnimationFrame(draw);
  }

  function stop() {
    _canvasRunning = false;
    ctx.clearRect(0, 0, c.width, c.height);
  }

  window._fitnessCanvas = { start: start, stop: stop, refresh: cacheAccentRGB };
  start();
  window.addEventListener('resize', function() { resize(); initOrbs(); });
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) stop();
    else start();
  });
}

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
/* P2 IA: Today · Train · Body · Learn · Me (fixed 5; customization retired) */
const CORE_NAV_DEFAULT = ['dashboard', 'workout', 'bodymap', 'hub', 'settings'];
const NAV_TAB_ORDER = ['dashboard', 'workout', 'bodymap', 'hub', 'settings'];

const DEFAULT_NAV_TABS = [
  { id:'dashboard', label:'Today', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>' },
  { id:'workout',   label:'Train', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="5.5" cy="12" r="2.5"/><circle cx="18.5" cy="12" r="2.5"/><line x1="8" y1="12" x2="16" y2="12"/><circle cx="5.5" cy="7" r="1.5"/><circle cx="5.5" cy="17" r="1.5"/><circle cx="18.5" cy="7" r="1.5"/><circle cx="18.5" cy="17" r="1.5"/></svg>' },
  { id:'bodymap',   label:'Body',  icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="5" r="2"/><path d="M12 7v5m-4 2l4-2 4 2m-8 0l-2 6m10-6l2 6M8 13l-1 6m10-6l1 6"/></svg>' },
  { id:'hub',       label:'Learn', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>' },
  { id:'settings',  label:'Me',    icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>' }
];
window.DEFAULT_NAV_TABS = DEFAULT_NAV_TABS;
window.CORE_NAV_DEFAULT = CORE_NAV_DEFAULT;
window.NAV_TAB_ORDER = NAV_TAB_ORDER;

function _normalizeNavTabs(ids) {
  /* P2: force canonical 5 tabs; map legacy ids into closest slot */
  const legacyMap = {
    coach: 'hub', assistant: 'hub', recovery: 'bodymap', search: 'hub',
    progress: 'workout', rehab: 'bodymap', anatomy: 'hub', calisthenics: 'workout',
    home: 'dashboard', today: 'dashboard', explore: 'hub', learn: 'hub', me: 'settings',
    train: 'workout', body: 'bodymap'
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
  if (S.g('settings.navMigration') !== 4) {
    S.set('settings.navTabs', CORE_NAV_DEFAULT.slice());
    S.set('settings.navMigration', 4);
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

