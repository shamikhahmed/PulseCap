'use strict';

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
  'training-style': { id: 'training-intel', data: { tab: 'style' } }
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
  'body-intelligence': 'bodymap',
  hub: 'hub', search: 'hub', encyclopedia: 'hub', anatomy: 'hub', academy: 'hub',
  calculators: 'hub', visualizations: 'hub', assistant: 'hub', coach: 'hub',
  settings: 'settings', profiles: 'settings', 'equipment-setup': 'settings'
};
window.NAV_PARENT = NAV_PARENT;

function reg(id, fn) { _screens[id] = fn; }
window.reg = reg;
window.listScreens = function() { return Object.keys(_screens).sort(); };

function go(id, data) {
  try {
    const resolved = resolveScreenAlias(id, data);
    id = resolved.id;
    data = resolved.data;
    if (!_screens[id]) throw new Error('Screen "' + id + '" not registered');
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
    /* Boot splash in index.html has no .screen class — clear it on first navigation */
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
  } catch(e) {
    console.error('go(' + id + ')', e);
    const v = document.getElementById('view');
    if (v) v.innerHTML = '<div style="padding:28px 20px;color:#ff4444;font-size:14px;line-height:1.6">' +
      '<div style="font-size:32px;margin-bottom:12px">⚠️</div>' +
      '<strong>Screen error: ' + id + '</strong><br>' + e.message +
      '<br><br><button type="button" onclick="go(\'dashboard\')" style="background:var(--bg3);border:1px solid var(--border);color:var(--txt);padding:10px 20px;border-radius:12px;font-size:14px;cursor:pointer">← Back to Home</button>' +
      '</div>';
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

/* ══════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════ */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function isoNow() { return new Date().toISOString(); }
function today() { return new Date().toISOString().slice(0,10); }
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
  const icons = { ok:'✅', err:'❌', pr:'🏆', achieve:'🎖️', warn:'⚠️', info:'ℹ️' };
  t.querySelector('.toast-icon').textContent = icons[type||'ok']||'✅';
  t.querySelector('.toast-msg').textContent = msg;
  t.className = 't-' + (type||'ok') + ' show';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { t.className = ''; }, dur||3200);
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
function modal(title, bodyHtml, footerHtml) {
  closeModal();
  const d = document.createElement('div');
  d.className = 'modal-overlay'; d.id = '_modal';
  d.onclick = e => { if(e.target===d) closeModal(); };
  d.innerHTML = '<div class="modal-sheet"><div class="modal-handle"></div>' +
    (title?'<div class="modal-title">'+esc(title)+'</div>':'') +
    bodyHtml + (footerHtml||'') + '</div>';
  document.body.appendChild(d);
}
function closeModal() { const m = document.getElementById('_modal'); if(m) m.remove(); }
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

function applyTheme(t) {
  const theme = normalizePulseTheme(t);
  document.documentElement.setAttribute('data-theme', theme);
  S.set('user.theme', theme);
  S.set('user.mode', theme);
  if (window._fitnessCanvas && window._fitnessCanvas.refresh) window._fitnessCanvas.refresh();
}
window.applyTheme = applyTheme;

function applyMode(mode) {
  applyTheme(mode === 'light' ? 'light' : 'dark');
  toast((mode === 'light' ? '☀️ Light mode' : '🌙 Dark mode'), 'info');
}
window.applyMode = applyMode;

/* ══════════════════════════════════════════════════════
   ENGINE — READINESS
══════════════════════════════════════════════════════ */
const ReadinessEngine = {
  score() {
    try {
      const r = S.g('recovery') || {};
      const ws = S.g('workouts') || [];
      let score = 100;
      const sleep = r.sleep || 7.5;
      if (sleep < 5) score -= 35;
      else if (sleep < 6) score -= 22;
      else if (sleep < 7) score -= 12;
      else if (sleep >= 8) score += 5;
      const soreness = r.soreness || 3;
      score -= soreness * 4;
      const stress = r.stress || 4;
      score -= stress * 2.5;
      const energy = r.energy || 7;
      score += (energy - 5) * 3;
      const hydration = r.hydration || 2.5;
      if (hydration < 1.5) score -= 8;
      else if (hydration >= 3) score += 3;
      const recentTraining = ws.filter(w => daysAgo(w.date) < 3).length;
      if (recentTraining >= 3) score -= 15;
      else if (recentTraining >= 2) score -= 5;
      const streak = StreakEngine.get();
      const r_check = S.g('recovery') || {};
      const recentSoreness = r_check.soreness || 3;
      if (streak >= 7 && recentSoreness >= 5) score -= 15;
      else if (streak >= 7) score -= 8;
      else if (streak >= 5 && recentSoreness >= 6) score -= 8;
      const injuries = S.g('user.injuries') || [];
      const activeInjuries = injuries.filter(function(i) {
        return typeof i === 'string' ? true : !i.recovered;
      }).length;
      if (activeInjuries >= 3) score -= 15;
      else if (activeInjuries >= 1) score -= 5;
      return Math.max(0, Math.min(100, Math.round(score)));
    } catch(e) { return 70; }
  },
  label(s) {
    if (s >= 85) return { l:'Peak', cls:'rl-peak' };
    if (s >= 70) return { l:'Ready', cls:'rl-ready' };
    if (s >= 50) return { l:'Moderate', cls:'rl-moderate' };
    return { l:'Rest Day', cls:'rl-rest' };
  },
  message(score) {
    if (score >= 85) return 'All systems optimal. Chase PRs and push hard today — your body is primed.';
    if (score >= 70) return 'Ready to train. Stick to your planned weights and listen to your body.';
    if (score >= 50) return 'Moderate readiness. Reduce intensity 10-15% and focus on quality over quantity.';
    return 'Recovery is low. Consider rest or a light mobility session today.';
  },
  recommendation(score) {
    if (score >= 85) return 'train heavy';
    if (score >= 70) return 'train normal';
    if (score >= 50) return 'train light';
    return 'rest or mobility';
  },
  coachQuote(score, personality) {
    const p = personality || S.g('user.coachPersonality') || 'maya';
    const quotes = {
      alex: [
        score >= 85 ? 'Peak condition. No excuses — max weights today. Let\'s go.' : '',
        score >= 70 ? 'Enough sleep to grind. Weak is a choice. Not yours.' : '',
        score >= 50 ? 'Moderate today. Still hit the gym. Pain is just data.' : '',
        'Rest is strategic retreat. Come back stronger tomorrow.'
      ],
      maya: [
        score >= 85 ? 'Recovery metrics are optimal. Your neuromuscular system is primed for high-intensity output.' : '',
        score >= 70 ? 'Recovery data shows readiness for standard training. Execute the plan precisely.' : '',
        score >= 50 ? 'Reduced HRV indicators suggest lowering intensity. Quality beats volume today.' : '',
        'Physiological data supports active recovery. Mobility and sleep optimisation recommended.'
      ],
      sam: [
        score >= 85 ? 'Oh yeah! You are FIRED UP today! Every single rep is going to count. Let\'s crush it!' : '',
        score >= 70 ? 'You\'ve got this! Your body is ready — now let your mind follow. Make it count!' : '',
        score >= 50 ? 'Hey, showing up is already a win. Do what you can — even 60% effort builds momentum!' : '',
        'Rest days are part of the journey too. You\'re still being a champion by choosing recovery!'
      ],
      zen: [
        score >= 85 ? 'Your body and mind are in harmony today. Move with intention, breathe with purpose.' : '',
        score >= 70 ? 'Listen to your body as you train today. It will tell you exactly what it needs.' : '',
        score >= 50 ? 'Honour where you are, not where you wish you were. Gentle movement today serves you.' : '',
        'True strength includes knowing when to rest. This is wisdom, not weakness.'
      ],
      rex: [
        score >= 85 ? 'Bar is loaded. You\'re ready. Strength is built on days like this.' : '',
        score >= 70 ? 'Strong enough to train. Weak enough to be careful. Hit the numbers, nothing fancy.' : '',
        score >= 50 ? 'Under-recovered athletes get hurt. Reduce the load, keep the frequency.' : '',
        'Even powerlifters take deload weeks. Rest is programming, not laziness.'
      ]
    };
    const arr = quotes[p] || quotes.maya;
    if (score >= 85) return arr[0] || arr[arr.length-1];
    if (score >= 70) return arr[1] || arr[arr.length-1];
    if (score >= 50) return arr[2] || arr[arr.length-1];
    return arr[3] || arr[arr.length-1];
  }
};
window.ReadinessEngine = ReadinessEngine;

/* ══════════════════════════════════════════════════════
   ENGINE — STREAK
══════════════════════════════════════════════════════ */
const StreakEngine = {
  get() {
    try {
      const ws = S.g('workouts') || [];
      if (!ws.length) return 0;
      const dates = [...new Set(ws.map(w => w.date.slice(0,10)))].sort().reverse();
      let streak = 0;
      for (let i=0; i<dates.length; i++) {
        const diff = Math.round((Date.now() - new Date(dates[i])) / 864e5);
        if (diff === i || diff === i+1) streak++;
        else break;
      }
      return streak;
    } catch(e) { return 0; }
  },
  weekWorkouts() {
    const ws = S.g('workouts') || [];
    const cutoff = Date.now() - 7*864e5;
    return ws.filter(w => new Date(w.date) > cutoff);
  },
  totalVolume() { return (S.g('workouts')||[]).reduce((a,w)=>a+(w.totalVol||0),0); },
  weekVolume() { return this.weekWorkouts().reduce((a,w)=>a+(w.totalVol||0),0); }
};
window.StreakEngine = StreakEngine;

/* ══════════════════════════════════════════════════════
   ENGINE — PROGRESSION
══════════════════════════════════════════════════════ */
const ProgEngine = {
  epley(w, r) { if(!w||!r) return 0; return r===1 ? w : Math.round(w*(1+r/30)); },
  checkPR(name, weight, reps) {
    const ws = S.g('workouts') || [];
    let best = 0;
    ws.forEach(wo => (wo.exercises||[]).forEach(ex => {
      if (ex.name===name) (ex.sets||[]).forEach(s => {
        if (s.done) best = Math.max(best, this.epley(s.weight||0, s.reps||0));
      });
    }));
    return this.epley(weight,reps) > best && best > 0;
  },
  savePR(name, weight, reps, date) {
    const prs = S.g('prs') || [];
    const idx = prs.findIndex(p => p.exercise===name);
    const entry = { exercise:name, weight, reps, e1rm:this.epley(weight,reps), date };
    if (idx>=0) prs[idx]=entry; else prs.push(entry);
    S.set('prs', prs);
  },
  suggest(name, goal) {
    const ws = S.g('workouts') || [];
    for (let i=ws.length-1; i>=0; i--) {
      const ex = (ws[i].exercises||[]).find(e=>e.name===name);
      if (ex && ex.sets && ex.sets.length) {
        const allDone = ex.sets.filter(s=>s.reps).every(s=>s.done);
        const w = ex.sets[0].weight || 0;
        if (allDone) {
          const inc = goal==='strength'?2.5:goal==='hypertrophy'?1.25:1.25;
          return round2(w + inc);
        }
        return w;
      }
    }
    return null;
  },
  prevString(name) {
    const ws = S.g('workouts') || [];
    for (let i=ws.length-1; i>=0; i--) {
      const ex = (ws[i].exercises||[]).find(e=>e.name===name);
      if (ex && ex.sets && ex.sets.length) {
        const s = ex.sets[0];
        const u = S.g('user.units')==='imperial'?'lb':'kg';
        return 'Last: '+(s.weight||0)+u+' × '+(s.reps||0)+' reps';
      }
    }
    return null;
  },
  doubleProgression(name, goal) {
    const ws = S.g('workouts') || [];
    let lastEx = null;
    for (let i=ws.length-1; i>=0; i--) {
      const ex = (ws[i].exercises||[]).find(e=>e.name===name);
      if (ex) { lastEx=ex; break; }
    }
    if (!lastEx || !lastEx.sets || !lastEx.sets.length) return null;
    const reps = lastEx.sets.map(s=>s.reps||0);
    const goalReps = goal==='strength' ? 5 : 12;
    const allHit = reps.every(r=>r>=goalReps);
    const w = lastEx.sets[0].weight || 0;
    if (allHit) {
      const inc = goal==='strength'?2.5:1.25;
      return { weight:round2(w+inc), reps:goalReps, note:'Add '+(goal==='strength'?'2.5':'1.25')+'kg — you hit all reps last session!' };
    }
    return { weight:w, reps:goalReps, note:'Hit all '+goalReps+' reps on every set before adding weight.' };
  }
};
window.ProgEngine = ProgEngine;

/* ══════════════════════════════════════════════════════
   ENGINE — SPLIT
══════════════════════════════════════════════════════ */
const SplitEngine = {
  _ppl: [
    { n:'Push A — Upper Chest & Front Delts', muscles:['upper_chest','front_delts'],
      exercises:['Incline Barbell Bench Press','Overhead Press','Cable Lateral Raise','Incline Dumbbell Fly','Front Delt Raise'],
      warmup:['5 min treadmill walk (incline 2%)','Arm Circles — 10 forward, 10 backward','Band Pull-Aparts — 3×15','Wall Slides — 2×10','Light DB Lateral Raise — 2×15 at 20% working weight','Push-Up — 2×10 bodyweight','Shoulder CARs (Controlled Articular Rotations) — 5 each direction'] },
    { n:'Pull A — Lats & Bicep Thickness', muscles:['lats','biceps'],
      exercises:['Barbell Row','Lat Pulldown','Cable Row','EZ Bar Curl','Deadlift'],
      warmup:['5 min rowing machine (easy pace)','Dead Hang — 3×20 seconds','Band Pull-Aparts — 3×15','Cat-Cow — 10 reps','Scapular Pull-Ups — 2×8','Light Face Pulls — 2×15 at 20% working weight'] },
    { n:'Legs A — Quads & Calves', muscles:['quads','calves'],
      exercises:['Back Squat','Leg Press','Leg Extension','Standing Calf Raise','Goblet Squat'],
      warmup:['5 min stationary bike','Hip Circles — 10 each direction','Leg Swings — 15 each direction (front-back + side-side)','Glute Bridge BW — 2×15','Bodyweight Squat — 2×15 (focus on depth)','Lateral Band Walk — 2×15 steps each way','Ankle Rolls — 10 each foot'] },
    { n:'Push B — Chest & Side Delts', muscles:['lower_chest','side_delts','triceps'],
      exercises:['Flat Barbell Bench Press','Dumbbell Lateral Raise','Machine Chest Press','Tricep Pushdown','Overhead Tricep Extension'],
      warmup:['5 min treadmill walk (incline 2%)','Arm Circles — 10 forward, 10 backward','Band Pull-Aparts — 3×15','Wall Slides — 2×10','Light DB Lateral Raise — 2×15 at 20% working weight','Push-Up — 2×10 bodyweight','Shoulder CARs (Controlled Articular Rotations) — 5 each direction'] },
    { n:'Pull B — Upper Back & Rear Delts', muscles:['upper_back','rear_delts','biceps'],
      exercises:['Seated Cable Row','Face Pulls','Rear Delt Fly','Hammer Curl','Incline Dumbbell Curl'],
      warmup:['5 min rowing machine (easy pace)','Dead Hang — 3×20 seconds','Band Pull-Aparts — 3×15','Cat-Cow — 10 reps','Scapular Pull-Ups — 2×8','Light Face Pulls — 2×15 at 20% working weight'] },
    { n:'Legs B — Hamstrings & Glutes', muscles:['hamstrings','glutes','calves'],
      exercises:['Romanian Deadlift','Leg Curl','Hip Thrust','Seated Calf Raise','Cable Pull-Through'],
      warmup:['5 min stationary bike','Hip Circles — 10 each direction','Leg Swings — 15 each direction (front-back + side-side)','Glute Bridge BW — 2×15','Bodyweight Squat — 2×15 (focus on depth)','Lateral Band Walk — 2×15 steps each way','Ankle Rolls — 10 each foot'] }
  ],
  _ul: [
    { n:'Upper A — Chest & Back', muscles:['chest','back','biceps','triceps'],
      exercises:['Barbell Bench Press','Barbell Row','Overhead Press','Lat Pulldown','Dumbbell Curl','Tricep Pushdown'],
      warmup:['5 min light cardio','Arm Circles — 10 each direction','Band Pull-Aparts — 3×15','Thoracic Rotation — 8 each side','Wall Slides — 2×10','Light DB Press — 10 reps at 30% weight'] },
    { n:'Lower A — Quads Focus', muscles:['quads','hamstrings','calves'],
      exercises:['Back Squat','Romanian Deadlift','Leg Press','Leg Curl','Calf Raise'],
      warmup:['5 min stationary bike','Hip Flexor Stretch — 30s each side','Glute Bridge BW — 2×20','Bodyweight Squat — 2×15','Leg Swings — 15 each direction','Calf Raises BW — 2×20'] },
    { n:'Upper B — Shoulders & Arms', muscles:['shoulders','biceps','triceps'],
      exercises:['Overhead Press','Dumbbell Lateral Raise','Face Pulls','EZ Bar Curl','Skull Crushers','Cable Curl'],
      warmup:['5 min light cardio','Arm Circles — 10 each direction','Band Pull-Aparts — 3×15','Thoracic Rotation — 8 each side','Wall Slides — 2×10','Light DB Press — 10 reps at 30% weight'] },
    { n:'Lower B — Posterior Chain', muscles:['glutes','hamstrings','calves'],
      exercises:['Deadlift','Hip Thrust','Leg Curl','Good Morning','Seated Calf Raise'],
      warmup:['5 min stationary bike','Hip Flexor Stretch — 30s each side','Glute Bridge BW — 2×20','Bodyweight Squat — 2×15','Leg Swings — 15 each direction','Calf Raises BW — 2×20'] }
  ],
  _fb: [
    { n:'Full Body A', muscles:['chest','back','legs','shoulders'],
      exercises:['Back Squat','Barbell Row','Barbell Bench Press','Overhead Press','Dumbbell Curl','Tricep Pushdown'],
      warmup:['5 min treadmill walk','Full Body Joint Circles (ankles→knees→hips→shoulders)','Jumping Jacks — 30 reps','Inchworm — 8 reps','World\'s Greatest Stretch — 5 each side','Bodyweight Squat — 15 reps','Push-Up — 10 reps'] },
    { n:'Full Body B', muscles:['legs','back','chest','core'],
      exercises:['Deadlift','Lat Pulldown','Incline Dumbbell Press','Dumbbell Lateral Raise','Face Pulls','Plank 60s'],
      warmup:['5 min treadmill walk','Full Body Joint Circles (ankles→knees→hips→shoulders)','Jumping Jacks — 30 reps','Inchworm — 8 reps','World\'s Greatest Stretch — 5 each side','Bodyweight Squat — 15 reps','Push-Up — 10 reps'] },
    { n:'Full Body C', muscles:['legs','chest','shoulders','arms'],
      exercises:['Leg Press','Dumbbell Bench Press','Arnold Press','Cable Row','EZ Bar Curl','Overhead Tricep Extension'],
      warmup:['5 min treadmill walk','Full Body Joint Circles (ankles→knees→hips→shoulders)','Jumping Jacks — 30 reps','Inchworm — 8 reps','World\'s Greatest Stretch — 5 each side','Bodyweight Squat — 15 reps','Push-Up — 10 reps'] }
  ],
  _bro: [
    { n:'Chest Day', muscles:['chest'], exercises:['Barbell Bench Press','Incline Barbell Bench Press','Cable Fly','Dumbbell Fly','Chest Dip'],
      warmup:['5 min light cardio','Arm Circles — 10 each direction','Band Pull-Aparts — 2×15','Wall Slides — 2×10','Push-Up — 2×15 BW','Light DB Fly — 2×12 at 20% weight'] },
    { n:'Back Day', muscles:['back'], exercises:['Deadlift','Barbell Row','Lat Pulldown','Seated Cable Row','Face Pulls'],
      warmup:['5 min rowing machine','Dead Hang — 3×20s','Cat-Cow — 10 reps','Band Pull-Aparts — 3×15','Scapular Pull-Ups — 2×8'] },
    { n:'Shoulders Day', muscles:['shoulders'], exercises:['Overhead Press','Dumbbell Lateral Raise','Front Delt Raise','Rear Delt Fly','Upright Row'],
      warmup:['5 min light cardio','Shoulder Rolls — 15 forward + backward','Arm Circles — 10 each','Band Pull-Aparts — 3×15','Cuban Press — 2×10 light','Wall Slides — 2×10'] },
    { n:'Arms Day', muscles:['biceps','triceps'], exercises:['Barbell Curl','Hammer Curl','Incline Dumbbell Curl','Tricep Pushdown','Skull Crushers','Overhead Tricep Extension'],
      warmup:['5 min treadmill walk','Wrist Circles — 10 each direction','Arm Circles — 10','Band Pull-Aparts — 2×15','Light Hammer Curl — 2×12 BW equivalent'] },
    { n:'Legs Day', muscles:['legs'], exercises:['Back Squat','Leg Press','Romanian Deadlift','Leg Curl','Leg Extension','Calf Raise'],
      warmup:['5 min stationary bike','Hip Circles — 10 each','Leg Swings — 15 each direction','Glute Bridge BW — 2×20','Bodyweight Squat — 2×15','Lateral Band Walk — 2×10 each way'] }
  ],
  _str: [
    { n:'Squat Day', muscles:['quads','glutes','core'], exercises:['Back Squat','Front Squat','Leg Press','Leg Extension','Core Work'],
      warmup:['10 min treadmill walk','Hip Circles — 10 each','Ankle Mobility — 10 reps each','Glute Bridge BW — 2×20','Box Squat BW — 2×10','Goblet Squat — 2×10 light','Hip Flexor Stretch — 45s each side'] },
    { n:'Press Day', muscles:['chest','shoulders','triceps'], exercises:['Barbell Bench Press','Overhead Press','Tricep Pushdown','Dumbbell Lateral Raise'],
      warmup:['5 min light cardio','Shoulder CARs — 5 each direction','Band Pull-Aparts — 3×15','Wall Slides — 2×10','Rotator Cuff Internal/External Rotation — 2×15','Push-Up — 2×10'] },
    { n:'Pull Day', muscles:['back','biceps'], exercises:['Deadlift','Barbell Row','Lat Pulldown','EZ Bar Curl','Face Pulls'],
      warmup:['5 min rowing machine','Dead Hang — 3×20s','Thoracic Extension over foam roller — 8 reps','Cat-Cow — 10 reps','Scapular Pull-Ups — 2×8','Light RDL — 2×10 empty bar'] },
    { n:'Accessory Day', muscles:['shoulders','arms','core'], exercises:['Overhead Press','Hammer Curl','Tricep Pushdown','Face Pulls','Plank'],
      warmup:['5 min treadmill walk','Full body mobility flow — 5 mins','Joint circles top to bottom'] }
  ],
  _home: [
    { n:'Push Day', muscles:['chest','shoulders','triceps'], exercises:['Push-Ups','Pike Push-Ups','Dumbbell Press','Dumbbell Lateral Raise','Tricep Dip'],
      warmup:['5 min jumping jacks','Arm Circles — 10 each','Hip Circles — 10 each','Inchworm — 8 reps','World\'s Greatest Stretch — 5 each side','Jumping Jacks — 20 reps'] },
    { n:'Pull Day', muscles:['back','biceps'], exercises:['Resistance Band Row','Band Pull-Aparts','Dumbbell Row','Dumbbell Curl'],
      warmup:['5 min jumping jacks','Arm Circles — 10 each','Hip Circles — 10 each','Inchworm — 8 reps','World\'s Greatest Stretch — 5 each side','Jumping Jacks — 20 reps'] },
    { n:'Legs Day', muscles:['legs','glutes'], exercises:['Bodyweight Squat','Bulgarian Split Squat','Hip Thrust BW','Single Leg RDL','Calf Raise'],
      warmup:['5 min jumping jacks','Arm Circles — 10 each','Hip Circles — 10 each','Inchworm — 8 reps','World\'s Greatest Stretch — 5 each side','Jumping Jacks — 20 reps'] },
    { n:'Core & Cardio', muscles:['core','full_body'], exercises:['Plank','Mountain Climbers','Russian Twists','Burpees','Dead Bug'],
      warmup:['5 min jumping jacks','Arm Circles — 10 each','Hip Circles — 10 each','Inchworm — 8 reps','World\'s Greatest Stretch — 5 each side','Jumping Jacks — 20 reps'] }
  ],
  _arnold: [
    { n:'Chest & Back A', muscles:['chest','back'], exercises:['Barbell Bench Press','Incline Dumbbell Press','Barbell Row','Lat Pulldown','Cable Fly','Face Pulls'],
      warmup:['5 min light cardio','Band Pull-Aparts — 3×15','Scapular Pull-Ups — 2×8','Light DB Press — 2×12'] },
    { n:'Shoulders & Arms A', muscles:['shoulders','biceps','triceps'], exercises:['Overhead Press','Dumbbell Lateral Raise','Barbell Curl','Tricep Pushdown','Hammer Curl','Skull Crushers'],
      warmup:['5 min light cardio','Shoulder CARs — 5 each','Arm Circles — 10 each','Light Lateral Raise — 2×15'] },
    { n:'Legs A', muscles:['quads','hamstrings','calves'], exercises:['Back Squat','Leg Press','Leg Extension','Leg Curl','Standing Calf Raise'],
      warmup:['5 min bike','Hip Circles — 10 each','Bodyweight Squat — 2×15','Glute Bridge — 2×20'] },
    { n:'Chest & Back B', muscles:['chest','back'], exercises:['Incline Barbell Bench Press','Dumbbell Bench Press','Seated Cable Row','Pull-Up','Dumbbell Fly','Rear Delt Fly'],
      warmup:['5 min light cardio','Band Pull-Aparts — 3×15','Dead Hang — 3×20s','Light Row — 2×12'] },
    { n:'Shoulders & Arms B', muscles:['shoulders','biceps','triceps'], exercises:['Arnold Press','Cable Lateral Raise','EZ Bar Curl','Overhead Tricep Extension','Incline Dumbbell Curl','Cable Curl'],
      warmup:['5 min light cardio','Shoulder CARs — 5 each','Wall Slides — 2×10','Light Curl — 2×12'] },
    { n:'Legs B', muscles:['glutes','hamstrings','calves'], exercises:['Romanian Deadlift','Hip Thrust','Leg Curl','Goblet Squat','Seated Calf Raise'],
      warmup:['5 min bike','Hip Circles — 10 each','Leg Swings — 15 each','Glute Bridge — 2×20'] }
  ],
  _phul: [
    { n:'Power Upper', muscles:['chest','back','shoulders'], exercises:['Barbell Bench Press','Barbell Row','Overhead Press','Weighted Pull-Up'],
      warmup:['5 min light cardio','Band Pull-Aparts — 3×15','Arm Circles — 10 each','Ramp-up sets to working weight'] },
    { n:'Power Lower', muscles:['quads','hamstrings','glutes'], exercises:['Back Squat','Romanian Deadlift','Leg Press'],
      warmup:['5 min bike','Hip Circles — 10 each','Bodyweight Squat — 2×15','Ramp-up sets to working weight'] },
    { n:'Hypertrophy Upper', muscles:['chest','back','arms'], exercises:['Incline Dumbbell Press','Lat Pulldown','Dumbbell Lateral Raise','EZ Bar Curl','Tricep Pushdown','Face Pulls'],
      warmup:['5 min light cardio','Band Pull-Aparts — 3×15','Thoracic Rotation — 8 each side'] },
    { n:'Hypertrophy Lower', muscles:['quads','hamstrings','calves'], exercises:['Leg Press','Leg Curl','Leg Extension','Hip Thrust','Calf Raise'],
      warmup:['5 min bike','Hip Flexor Stretch — 30s each','Glute Bridge — 2×20'] }
  ],
  _phat: [
    { n:'Power Upper', muscles:['chest','back'], exercises:['Barbell Bench Press','Barbell Row','Overhead Press','Lat Pulldown'],
      warmup:['5 min light cardio','Band Pull-Aparts — 3×15','Ramp-up sets to working weight'] },
    { n:'Power Lower', muscles:['quads','hamstrings'], exercises:['Back Squat','Romanian Deadlift','Leg Press'],
      warmup:['5 min bike','Hip Circles — 10 each','Ramp-up sets to working weight'] },
    { n:'Back & Shoulders Hypertrophy', muscles:['back','shoulders'], exercises:['Seated Cable Row','Face Pulls','Dumbbell Lateral Raise','Rear Delt Fly','Hammer Curl'],
      warmup:['5 min rowing','Dead Hang — 3×20s','Band Pull-Aparts — 3×15'] },
    { n:'Lower Hypertrophy', muscles:['quads','glutes','hamstrings'], exercises:['Leg Press','Leg Extension','Leg Curl','Hip Thrust','Calf Raise'],
      warmup:['5 min bike','Leg Swings — 15 each','Glute Bridge — 2×20'] },
    { n:'Chest & Arms Hypertrophy', muscles:['chest','biceps','triceps'], exercises:['Incline Dumbbell Press','Cable Fly','EZ Bar Curl','Tricep Pushdown','Incline Dumbbell Curl','Skull Crushers'],
      warmup:['5 min light cardio','Arm Circles — 10 each','Push-Up — 2×10'] }
  ],
  _push_pull: [
    { n:'Push A — Chest & Quads', muscles:['chest','shoulders','triceps','quads'], exercises:['Barbell Bench Press','Overhead Press','Tricep Pushdown','Back Squat','Leg Extension'],
      warmup:['5 min treadmill walk','Arm Circles — 10 each','Band Pull-Aparts — 3×15','Bodyweight Squat — 2×15'] },
    { n:'Pull A — Back & Hamstrings', muscles:['back','biceps','hamstrings'], exercises:['Deadlift','Barbell Row','Lat Pulldown','EZ Bar Curl','Leg Curl'],
      warmup:['5 min rowing','Dead Hang — 3×20s','Cat-Cow — 10 reps','Light RDL — 2×10'] },
    { n:'Push B — Delts & Glutes', muscles:['shoulders','chest','triceps','glutes'], exercises:['Incline Dumbbell Press','Dumbbell Lateral Raise','Hip Thrust','Romanian Deadlift','Cable Fly'],
      warmup:['5 min light cardio','Shoulder CARs — 5 each','Glute Bridge — 2×20'] },
    { n:'Pull B — Lats & Arms', muscles:['lats','rear_delts','biceps'], exercises:['Seated Cable Row','Face Pulls','Hammer Curl','Rear Delt Fly','Incline Dumbbell Curl'],
      warmup:['5 min rowing','Band Pull-Aparts — 3×15','Scapular Pull-Ups — 2×8'] }
  ],
  _powerbuilding: [
    { n:'Heavy Squat', muscles:['quads','glutes','core'], exercises:['Back Squat','Front Squat','Leg Press','Leg Extension'],
      warmup:['10 min walk','Hip Circles — 10 each','Ramp-up sets to top set'] },
    { n:'Heavy Bench', muscles:['chest','triceps'], exercises:['Barbell Bench Press','Close-Grip Bench','Dumbbell Fly','Tricep Pushdown'],
      warmup:['5 min light cardio','Band Pull-Aparts — 3×15','Ramp-up sets to top set'] },
    { n:'Heavy Deadlift', muscles:['back','hamstrings'], exercises:['Deadlift','Barbell Row','Lat Pulldown','Face Pulls'],
      warmup:['5 min rowing','Dead Hang — 3×20s','Ramp-up sets to top set'] },
    { n:'Hypertrophy Upper', muscles:['chest','back','shoulders'], exercises:['Incline Dumbbell Press','Cable Row','Dumbbell Lateral Raise','EZ Bar Curl','Overhead Tricep Extension'],
      warmup:['5 min light cardio','Arm Circles — 10 each','Band Pull-Aparts — 3×15'] },
    { n:'Hypertrophy Lower', muscles:['quads','hamstrings','glutes'], exercises:['Leg Press','Romanian Deadlift','Leg Curl','Hip Thrust','Calf Raise'],
      warmup:['5 min bike','Hip Circles — 10 each','Glute Bridge — 2×20'] }
  ],
  _cardio_strength: [
    { n:'Upper Strength', muscles:['chest','back','shoulders'], exercises:['Barbell Bench Press','Barbell Row','Overhead Press','Lat Pulldown','Face Pulls'],
      warmup:['5 min light cardio','Band Pull-Aparts — 3×15','Arm Circles — 10 each'] },
    { n:'Lower Strength', muscles:['quads','hamstrings','glutes'], exercises:['Back Squat','Romanian Deadlift','Leg Press','Hip Thrust'],
      warmup:['5 min bike','Hip Circles — 10 each','Bodyweight Squat — 2×15'] },
    { n:'Cardio — LISS', muscles:['cardio','full_body'], exercises:['Incline Walk 30min','Steady Bike 25min','Rowing Machine 20min'],
      warmup:['3 min easy pace','Dynamic stretches — 5 min'] },
    { n:'Cardio — Conditioning', muscles:['cardio','core'], exercises:['Burpees','Mountain Climbers','Jump Rope','Plank','Russian Twists'],
      warmup:['5 min easy cardio','Joint circles head to toe'] }
  ],
  _starting_strength: [
    { n:'Workout A', muscles:['legs','chest','back'], exercises:['Back Squat','Barbell Bench Press','Deadlift'],
      warmup:['5 min walk','Hip Circles — 10 each','Empty bar warm-up sets'] },
    { n:'Workout B', muscles:['legs','shoulders','back'], exercises:['Back Squat','Overhead Press','Barbell Row'],
      warmup:['5 min walk','Shoulder CARs — 5 each','Empty bar warm-up sets'] },
    { n:'Workout A (repeat)', muscles:['legs','chest','back'], exercises:['Back Squat','Barbell Bench Press','Deadlift'],
      warmup:['5 min walk','Hip Circles — 10 each','Empty bar warm-up sets'] }
  ],
  _stronglifts: [
    { n:'Workout A', muscles:['legs','chest','back'], exercises:['Back Squat','Barbell Bench Press','Barbell Row'],
      warmup:['5 min walk','Hip Circles — 10 each','Ramp-up sets: 50%, 70%, 90% of working weight'] },
    { n:'Workout B', muscles:['legs','shoulders','back'], exercises:['Back Squat','Overhead Press','Deadlift'],
      warmup:['5 min walk','Shoulder CARs — 5 each','Ramp-up sets: 50%, 70%, 90% of working weight'] },
    { n:'Workout A (repeat)', muscles:['legs','chest','back'], exercises:['Back Squat','Barbell Bench Press','Barbell Row'],
      warmup:['5 min walk','Hip Circles — 10 each','Ramp-up sets: 50%, 70%, 90% of working weight'] }
  ],
  _531: [
    { n:'Squat Day', muscles:['quads','glutes'], exercises:['Back Squat','Leg Press','Leg Curl','Plank'],
      warmup:['5 min walk','Hip Circles — 10 each','Ramp-up sets per 5/3/1 protocol'] },
    { n:'Bench Day', muscles:['chest','triceps'], exercises:['Barbell Bench Press','Dumbbell Bench Press','Tricep Pushdown','Face Pulls'],
      warmup:['5 min light cardio','Band Pull-Aparts — 3×15','Ramp-up sets per 5/3/1 protocol'] },
    { n:'Deadlift Day', muscles:['back','hamstrings'], exercises:['Deadlift','Barbell Row','Lat Pulldown','Hip Thrust'],
      warmup:['5 min rowing','Dead Hang — 3×20s','Ramp-up sets per 5/3/1 protocol'] },
    { n:'OHP Day', muscles:['shoulders','triceps'], exercises:['Overhead Press','Dumbbell Lateral Raise','EZ Bar Curl','Rear Delt Fly'],
      warmup:['5 min light cardio','Shoulder CARs — 5 each','Ramp-up sets per 5/3/1 protocol'] }
  ],
  _upper_lower_fb: [
    { n:'Upper A', muscles:['chest','back','shoulders'], exercises:['Barbell Bench Press','Barbell Row','Overhead Press','Lat Pulldown','Face Pulls'],
      warmup:['5 min light cardio','Band Pull-Aparts — 3×15','Arm Circles — 10 each'] },
    { n:'Lower A', muscles:['quads','hamstrings'], exercises:['Back Squat','Romanian Deadlift','Leg Press','Calf Raise'],
      warmup:['5 min bike','Hip Circles — 10 each','Glute Bridge — 2×20'] },
    { n:'Full Body', muscles:['full_body'], exercises:['Deadlift','Incline Dumbbell Press','Dumbbell Lateral Raise','Leg Curl','EZ Bar Curl'],
      warmup:['5 min treadmill walk','Full Body Joint Circles','Bodyweight Squat — 15 reps'] },
    { n:'Upper B', muscles:['chest','back','arms'], exercises:['Incline Barbell Bench Press','Seated Cable Row','Dumbbell Lateral Raise','Hammer Curl','Tricep Pushdown'],
      warmup:['5 min light cardio','Band Pull-Aparts — 3×15','Thoracic Rotation — 8 each'] },
    { n:'Lower B', muscles:['glutes','hamstrings','calves'], exercises:['Hip Thrust','Leg Curl','Goblet Squat','Seated Calf Raise','Plank'],
      warmup:['5 min bike','Leg Swings — 15 each','Glute Bridge — 2×20'] }
  ],
  _custom: [
    { n:'Flexible Day — Choose Your Focus', muscles:['full_body'], exercises:['Back Squat','Barbell Bench Press','Barbell Row','Overhead Press','Plank'],
      warmup:['5 min light cardio','Joint circles head to toe','Pick exercises that match how you feel today'] }
  ],
  _exerciseAvailable(name) {
    if (typeof ExDB === 'undefined' || typeof EquipmentDB === 'undefined') return true;
    const ex = ExDB.byName(name);
    if (!ex) return true;
    return EquipmentDB.exerciseMatches(ex);
  },
  _isAvoided(name) {
    return typeof InjuriesDB !== 'undefined' && InjuriesDB.shouldAvoidExercise(name).avoid;
  },
  resolveExercise(name) {
    const result = { original: name, name: name, swapped: false, reason: null };
    if (typeof InjuriesDB !== 'undefined') {
      const check = InjuriesDB.shouldAvoidExercise(name);
      if (check.avoid) {
        const subs = this.getSubstitutes(name, check.reason || '');
        for (let i = 0; i < subs.length; i++) {
          if (!this._isAvoided(subs[i]) && this._exerciseAvailable(subs[i])) {
            return { original: name, name: subs[i], swapped: true, reason: check.modify || check.reason, injury: check.injury };
          }
        }
        return { original: name, name: null, skipped: true, reason: check.modify || check.reason, injury: check.injury };
      }
    }
    if (!this._exerciseAvailable(name)) {
      const subs = this.getSubstitutes(name, 'equipment');
      for (let i = 0; i < subs.length; i++) {
        if (!this._isAvoided(subs[i]) && this._exerciseAvailable(subs[i])) {
          return { original: name, name: subs[i], swapped: true, reason: 'Substituted — equipment not available' };
        }
      }
      return { original: name, name: null, skipped: true, reason: 'No equipment match' };
    }
    return result;
  },
  resolveExercises(names) {
    const exercises = [];
    const swaps = [];
    (names || []).forEach(function(name) {
      const r = SplitEngine.resolveExercise(name);
      if (r.name) {
        exercises.push(r.name);
        if (r.swapped) swaps.push(r);
      }
    });
    return { exercises: exercises, swaps: swaps };
  },
  _resolveDay(day) {
    if (!day) return day;
    const resolved = this.resolveExercises(day.exercises || []);
    return Object.assign({}, day, { exercises: resolved.exercises, _swaps: resolved.swaps });
  },
  listSplitDays(split) {
    const user = S.g('user') || {};
    return this._getSplitDays(split || user.split || 'ppl');
  },
  setSplitDay(dayNum) {
    const days = this.listSplitDays();
    const n = Math.max(1, Math.min(days.length, parseInt(dayNum, 10) || 1));
    S.set('user.splitDay', n);
    return n;
  },
  isScheduledRestDay() {
    const user = S.g('user') || {};
    const gymDays = user.gymDays;
    if (!gymDays || !gymDays.length) return false;
    const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return !gymDays.includes(dayNames[new Date().getDay()]);
  },
  getSplitDay() {
    try {
      const user = S.g('user') || {};
      const split = user.split || 'ppl';
      const dayIdx = ((user.splitDay || 1) - 1);
      const days = this._getSplitDays(split);
      return this._resolveDay(days[dayIdx % days.length] || days[0]);
    } catch(e) { return { n:'Rest Day', muscles:[], exercises:[], warmup:[] }; }
  },
  getNextDay() {
    try {
      const user = S.g('user') || {};
      const split = user.split || 'ppl';
      const dayIdx = user.splitDay || 1;
      const days = this._getSplitDays(split);
      return this._resolveDay(days[dayIdx % days.length] || days[0]);
    } catch(e) { return null; }
  },
  _getSplitDays(split) {
    const m = {
      ppl: this._ppl, ppl_5: this._ppl.slice(0, 5),
      ul: this._ul, ul_3: this._ul.slice(0, 3),
      fb: this._fb, fb_2: this._fb.slice(0, 2),
      bro: this._bro, str: this._str, home: this._home,
      arnold: this._arnold, phul: this._phul, phat: this._phat,
      push_pull: this._push_pull, powerbuilding: this._powerbuilding,
      cardio_strength: this._cardio_strength,
      starting_strength: this._starting_strength, stronglifts: this._stronglifts,
      '531': this._531, upper_lower_fb: this._upper_lower_fb,
      custom: this._custom
    };
    return m[split] || this._ppl;
  },
  nextDay() {
    const user = S.g('user') || {};
    const split = user.split || 'ppl';
    const days = this._getSplitDays(split);
    const next = ((user.splitDay || 1) % days.length) + 1;
    S.set('user.splitDay', next);
    return next;
  },
  getSubstitutes(exerciseName, reason) {
    if (typeof ExDB === 'undefined') return [];
    const ex = ExDB.byName(exerciseName);
    if (!ex) return [];
    const self = this;
    return ExDB.db.filter(function(e) {
      return e.n !== exerciseName &&
        (e.grp === ex.grp || (ex.pri && e.pri === ex.pri)) &&
        (!reason || !reason.includes('shoulder') || (e.joint && (e.joint.shoulder || 0) < 2)) &&
        self._exerciseAvailable(e.n) &&
        !self._isAvoided(e.n);
    }).slice(0, 5).map(function(e) { return e.n; });
  }
};
window.SplitEngine = SplitEngine;

window.pickSplitDay = function(dayNum) {
  SplitEngine.setSplitDay(dayNum);
  if (typeof toast === 'function') toast('Session updated', 'ok');
  const page = (typeof S !== 'undefined' && S.currentPage) ? S.currentPage : 'workout';
  if (typeof go === 'function') go(page === 'dashboard' ? 'dashboard' : 'workout');
};

window.toggleGymDay = function(day) {
  const user = S.g('user') || {};
  const gymDays = (user.gymDays || []).slice();
  const idx = gymDays.indexOf(day);
  if (idx >= 0) gymDays.splice(idx, 1);
  else gymDays.push(day);
  S.set('user.gymDays', gymDays);
  if (typeof toast === 'function') toast('Training days updated', 'ok');
  if (typeof go === 'function') go('settings', { tab: 'training' });
};

window.renderSplitDayPicker = function(opts) {
  opts = opts || {};
  const user = S.g('user') || {};
  const days = SplitEngine.listSplitDays();
  const active = user.splitDay || 1;
  const compact = !!opts.compact;
  const chips = days.map(function(d, i) {
    const num = i + 1;
    const on = num === active;
    const label = compact ? String(num) : (d.n.split('—')[0].split(' - ')[0].trim().slice(0, 14));
    return '<button type="button" onclick="pickSplitDay(' + num + ')" style="flex-shrink:0;padding:' + (compact ? '8px 12px' : '10px 14px') + ';border-radius:12px;border:1.5px solid ' + (on ? 'var(--c1)' : 'var(--border)') + ';background:' + (on ? 'rgba(0,213,255,0.12)' : 'var(--bg3)') + ';color:' + (on ? 'var(--c1)' : 'var(--txt2)') + ';font-size:' + (compact ? '12px' : '11px') + ';font-weight:700;cursor:pointer;touch-action:manipulation;white-space:nowrap">' + esc(label) + '</button>';
  }).join('');
  const restNote = SplitEngine.isScheduledRestDay()
    ? '<div style="font-size:12px;color:var(--c5);margin-bottom:10px;line-height:1.45">📅 Not a scheduled gym day — pick any session below or train anyway.</div>'
    : '';
  return '<div style="margin-bottom:14px">' +
    '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:8px">Choose today\'s session</div>' +
    restNote +
    '<div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none;-webkit-overflow-scrolling:touch">' + chips + '</div>' +
    '</div>';
};

/* ══════════════════════════════════════════════════════
   ENGINE — WEIGHT SUGGESTIONS
══════════════════════════════════════════════════════ */
const WeightEngine = {
  suggest(exerciseName, user) {
    const prev = ProgEngine.suggest(exerciseName, user.goal);
    if (prev !== null) return prev;
    const bw = user.weight || 75;
    const isMale = user.gender !== 'female';
    const ratios = {
      'Back Squat': isMale?[0.6,0.8,1.1,1.4]:[0.45,0.6,0.85,1.1],
      'Barbell Bench Press': isMale?[0.45,0.6,0.9,1.2]:[0.3,0.45,0.65,0.85],
      'Deadlift': isMale?[0.7,1.0,1.5,2.0]:[0.5,0.75,1.1,1.5],
      'Overhead Press': isMale?[0.3,0.4,0.6,0.8]:[0.2,0.3,0.45,0.6],
      'Barbell Row': isMale?[0.4,0.55,0.75,1.0]:[0.3,0.4,0.6,0.8]
    };
    const expMap = { beginner:0, intermediate:1, advanced:2, athlete:3 };
    const expIdx = expMap[user.exp || 'intermediate'] || 1;
    if (ratios[exerciseName]) return Math.round(bw * ratios[exerciseName][expIdx] / 2.5) * 2.5;
    return isMale ? Math.round(bw * 0.4) : Math.round(bw * 0.25);
  },
  warmupSets(workingWeight) {
    const w = parseFloat(workingWeight) || 20;
    return [
      { pct:40, weight:Math.round(w*0.4/2.5)*2.5, reps:8, label:'Warm-up 1' },
      { pct:60, weight:Math.round(w*0.6/2.5)*2.5, reps:5, label:'Warm-up 2' },
      { pct:80, weight:Math.round(w*0.8/2.5)*2.5, reps:3, label:'Feeler' }
    ];
  },
  progressionNote(exerciseName, workouts) {
    const ws = workouts || S.g('workouts') || [];
    let consecutive = 0;
    for (let i=ws.length-1; i>=0; i--) {
      const ex = (ws[i].exercises||[]).find(e=>e.name===exerciseName);
      if (ex && ex.sets && ex.sets.every(s=>s.done)) consecutive++;
      else break;
    }
    if (consecutive >= 2) return '🔥 Add weight — you\'ve hit all reps ' + consecutive + ' sessions in a row';
    if (consecutive === 1) return '✅ 1 more clean session → add weight next time';
    return null;
  },
  deloadCheck(user, workouts) {
    const ws = workouts || S.g('workouts') || [];
    if (ws.length < 5) return false;
    const last5 = ws.slice(-5);
    const weeksTraining = Math.floor(daysAgo(ws[0].date) / 7);
    return weeksTraining >= 5 && last5.every(w => (w.totalVol||0) < (ws[0].totalVol||0));
  }
};
window.WeightEngine = WeightEngine;

/* ══════════════════════════════════════════════════════
   ENGINE — BODY CALCULATIONS
══════════════════════════════════════════════════════ */
const BodyEngine = {
  bmi(weight, height) {
    const h = height / 100;
    const bmi = round2(weight / (h*h));
    let cat = 'Normal';
    if (bmi < 18.5) cat='Underweight';
    else if (bmi < 25) cat='Normal';
    else if (bmi < 30) cat='Overweight';
    else cat='Obese';
    return { bmi, cat };
  },
  bmr(user) {
    const w=user.weight||75, h=user.height||175, a=user.age||25, g=user.gender||'male';
    return Math.round(g==='male' ? (10*w)+(6.25*h)-(5*a)+5 : (10*w)+(6.25*h)-(5*a)-161);
  },
  tdee(user) {
    const m = { sedentary:1.2, light:1.375, moderate:1.55, active:1.725, veryActive:1.9 };
    return Math.round(this.bmr(user) * (m[user.activityLevel||'moderate']||1.55));
  },
  healthyWeightRange(height, gender) {
    const h = height/100;
    return { min:Math.round(18.5*h*h), max:Math.round(24.9*h*h) };
  },
  fatLossProjection(user) {
    const weeks = [];
    let w = user.weight || 75;
    const target = user.goalWeight || (w - 5);
    for (let i=1; i<=12; i++) {
      w = round2(Math.max(target, w - 0.5));
      weeks.push({ week:i, weight:w, totalLost:round2((user.weight||75)-w) });
    }
    return weeks;
  },
  muscleBuildProjection(user) {
    const gainPerMonth = { beginner:1.5, intermediate:0.75, advanced:0.375, athlete:0.25 };
    return gainPerMonth[user.exp||'intermediate'] || 0.75;
  },
  timeToGoal(user) {
    const diff = Math.abs((user.weight||75) - (user.goalWeight||70));
    const rate = (user.goal==='hypertrophy'||user.goal==='strength') ? 0.75 : 0.5;
    return Math.ceil(diff / (rate * 4.33)) + ' months';
  },
  _latestMeas() {
    const m = S.g('measurements') || [];
    return m.length ? m[m.length - 1] : null;
  },
  bodyFatNavy(user) {
    const meas = this._latestMeas();
    const heightCm = user.height || 175;
    const gender = user.gender || 'male';
    const neck = meas && meas.neck;
    const waist = meas && meas.waist;
    const hips = meas && meas.hips;
    if (!neck || !waist) return { pct: null, status: 'needs_data', label: 'Add neck & waist measurements' };
    const hIn = heightCm / 2.54;
    const neckIn = neck / 2.54;
    const waistIn = waist / 2.54;
    let pct;
    if (gender === 'female') {
      if (!hips) return { pct: null, status: 'needs_data', label: 'Add hip measurement (female)' };
      const hipIn = hips / 2.54;
      pct = 163.205 * Math.log10(waistIn + hipIn - neckIn) - 97.684 * Math.log10(hIn) - 78.387;
    } else {
      pct = 86.010 * Math.log10(waistIn - neckIn) - 70.041 * Math.log10(hIn) + 36.76;
    }
    pct = round2(Math.max(3, Math.min(50, pct)));
    let status = 'healthy', label = 'Healthy range';
    if (gender === 'female') {
      if (pct < 14) { status = 'low'; label = 'Essential fat range'; }
      else if (pct < 21) { status = 'athletic'; label = 'Athletic'; }
      else if (pct < 25) { status = 'healthy'; label = 'Fitness'; }
      else if (pct < 32) { status = 'elevated'; label = 'Average'; }
      else { status = 'high'; label = 'Above average'; }
    } else {
      if (pct < 6) { status = 'low'; label = 'Essential fat range'; }
      else if (pct < 14) { status = 'athletic'; label = 'Athletic'; }
      else if (pct < 18) { status = 'healthy'; label = 'Fitness'; }
      else if (pct < 25) { status = 'elevated'; label = 'Average'; }
      else { status = 'high'; label = 'Above average'; }
    }
    return { pct, status, label };
  },
  leanMass(user) {
    const w = user.weight || 75;
    const bf = this.bodyFatNavy(user);
    const pct = bf.pct != null ? bf.pct : (user.targetBodyFat || 15);
    return round2(w * (1 - pct / 100));
  },
  fatMass(user) {
    const w = user.weight || 75;
    const bf = this.bodyFatNavy(user);
    const pct = bf.pct != null ? bf.pct : (user.targetBodyFat || 15);
    return round2(w * pct / 100);
  },
  ffmi(user) {
    const ffm = this.leanMass(user);
    const hM = (user.height || 175) / 100;
    const raw = round2(ffm / (hM * hM));
    const norm = round2(raw + 6.1 * (1.8 - hM));
    let status = 'average', label = 'Average';
    if (norm < 18) { status = 'low'; label = 'Below average'; }
    else if (norm < 20) { status = 'healthy'; label = 'Average'; }
    else if (norm < 22) { status = 'athletic'; label = 'Above average'; }
    else if (norm < 25) { status = 'elite'; label = 'Excellent'; }
    else { status = 'high'; label = 'Elite range'; }
    return { raw, normalized: norm, status, label };
  },
  waistToHeight(user) {
    const meas = this._latestMeas();
    const waist = meas && meas.waist;
    const height = user.height || 175;
    if (!waist) return { ratio: null, status: 'needs_data', label: 'Add waist measurement' };
    const ratio = round2(waist / height);
    let status = 'healthy', label = 'Low risk';
    if (ratio >= 0.6) { status = 'high'; label = 'High risk'; }
    else if (ratio >= 0.5) { status = 'elevated'; label = 'Elevated risk'; }
    return { ratio, status, label };
  },
  proteinTarget(user) {
    const kg = user.weight || 75;
    const goal = user.goal || 'hypertrophy';
    const mult = {
      fat_loss: 2.2, hypertrophy: 2.0, strength: 2.0, weight_gain: 1.8,
      recomp: 2.1, athletic: 1.9, maintenance: 1.6, general_health: 1.6,
      endurance: 1.6, mobility: 1.5
    };
    const gPerKg = mult[goal] || 1.8;
    return Math.round(kg * gPerKg);
  },
  waterIntake(user) {
    const kg = user.weight || 75;
    return Math.round(kg * 35);
  },
  calorieTarget(user) {
    const tdee = this.tdee(user);
    const goal = user.goal || 'hypertrophy';
    if (goal === 'fat_loss') return TDEEEngine.deficitPlan(user).calories;
    if (['hypertrophy', 'strength', 'weight_gain', 'athletic'].includes(goal)) return TDEEEngine.surplusPlan(user).calories;
    if (goal === 'recomp') return tdee - 200;
    return tdee;
  },
  oneRm(weight, reps) {
    return ProgEngine.epley(weight, reps);
  }
};
window.BodyEngine = BodyEngine;

/* ══════════════════════════════════════════════════════
   ENGINE — MUSCLE RECOVERY
══════════════════════════════════════════════════════ */
const MuscleEngine = {
  _groups: ['Chest','Back','Shoulders','Quads','Hamstrings','Glutes','Biceps','Triceps','Core','Calves'],
  status() {
    try {
      const ws = S.g('workouts') || [];
      const now = Date.now();
      const lastTrained = {};
      ws.slice(-20).forEach(wo => {
        const hrs = (now - new Date(wo.date)) / 36e5;
        (wo.exercises||[]).forEach(ex => {
          if (!ex.muscles) return;
          (ex.muscles.primary||[]).forEach(m => {
            const key = m.charAt(0).toUpperCase()+m.slice(1);
            if (!lastTrained[key] || hrs < lastTrained[key]) lastTrained[key] = hrs;
          });
        });
      });
      return this._groups.map(name => {
        const hrs = lastTrained[name] || null;
        if (!hrs) return { name, status:'fresh', label:'Ready', pct:100, hrs:null, color:'var(--c1)' };
        if (hrs < 24) return { name, status:'sore', label:'Recovering', pct:Math.round(hrs/48*100), hrs:Math.round(hrs), color:'#ff6b35' };
        if (hrs < 48) return { name, status:'recovering', label:'Moderate', pct:Math.round(hrs/48*100), hrs:Math.round(hrs), color:'#f5c842' };
        return { name, status:'fresh', label:'Ready', pct:100, hrs:Math.round(hrs), color:'#10B981' };
      });
    } catch(e) { return []; }
  },
  injuryWarning(exerciseName) {
    const injuries = S.g('user.injuries') || [];
    if (!injuries.length || typeof ExDB === 'undefined') return null;
    const ex = ExDB.byName(exerciseName);
    if (!ex || !ex.joint) return null;
    for (const inj of injuries) {
      const bodyPart = typeof inj === 'string' ? inj : (inj.bodyPart || '');
      const recovered = typeof inj === 'object' ? inj.recovered : false;
      if (recovered) continue;
      const j = ex.joint;
      if (/shoulder/i.test(bodyPart) && (j.shoulder||0) >= 2) return bodyPart;
      if (/knee/i.test(bodyPart) && (j.knee||0) >= 2) return bodyPart;
      if (/back/i.test(bodyPart) && (j.spine||0) >= 2) return bodyPart;
      if (/elbow/i.test(bodyPart) && (j.elbow||0) >= 2) return bodyPart;
      if (/hip/i.test(bodyPart) && (j.hip||0) >= 2) return bodyPart;
      if (/wrist/i.test(bodyPart) && (j.elbow||0) >= 1) return bodyPart;
      if (/neck/i.test(bodyPart) && (j.spine||0) >= 1) return bodyPart;
    }
    return null;
  },
  hasActiveInjuries() {
    const injuries = S.g('user.injuries') || [];
    return injuries.filter(function(i) {
      return typeof i === 'string' ? true : !i.recovered;
    }).length > 0;
  },
  safeExercises(exerciseList) {
    return exerciseList.filter(function(name) {
      return !MuscleEngine.injuryWarning(name);
    });
  },
  bodyMapColors() {
    const st = this.status();
    const map = {};
    st.forEach(m => { map[m.name.toLowerCase()] = m.color; });
    return map;
  }
};
window.MuscleEngine = MuscleEngine;

/* ══════════════════════════════════════════════════════
   ENGINE — SUPPLEMENT
══════════════════════════════════════════════════════ */
const SupplementDB = [
  { id:'creatine', name:'Creatine Monohydrate', cat:'Performance', timing:'anytime', dose:'5g', notes:'Daily consistency matters most. Time is irrelevant.', caffeine:false, halfLife:0 },
  { id:'whey', name:'Whey Protein', cat:'Protein', timing:'post', dose:'1 scoop (25-30g protein)', notes:'Take within 60 min post-workout.', caffeine:false, halfLife:0 },
  { id:'iso100', name:'ISO 100 Dymatize', cat:'Protein', timing:'post', dose:'1 scoop', notes:'Take within 30 min for optimal muscle protein synthesis.', caffeine:false, halfLife:0 },
  { id:'c4', name:'Pre-Workout C4', cat:'Pre-Workout', timing:'pre', dose:'1 scoop', notes:'Take 20-30 min before training. Avoid after 2pm if sleeping by 10pm.', caffeine:true, halfLife:5 },
  { id:'ghost', name:'Pre-Workout Ghost', cat:'Pre-Workout', timing:'pre', dose:'1 scoop', notes:'Take 20-30 min before. Contains caffeine.', caffeine:true, halfLife:5 },
  { id:'casein', name:'Casein Protein', cat:'Protein', timing:'night', dose:'1 scoop', notes:'Before bed — slow-digesting for overnight recovery.', caffeine:false, halfLife:0 },
  { id:'mass', name:'Mass Gainer', cat:'Protein', timing:'post', dose:'2 scoops', notes:'Post-workout or between meals for caloric surplus.', caffeine:false, halfLife:0 },
  { id:'bcaa', name:'BCAAs', cat:'Recovery', timing:'intra', dose:'5-10g', notes:'During training or post-workout.', caffeine:false, halfLife:0 },
  { id:'glutamine', name:'Glutamine', cat:'Recovery', timing:'post', dose:'5g', notes:'Post-workout to support recovery.', caffeine:false, halfLife:0 },
  { id:'omega3', name:'Omega-3 Fish Oil', cat:'Health', timing:'with_meal', dose:'2-3g', notes:'Take with meals to reduce GI issues.', caffeine:false, halfLife:0 },
  { id:'vitd', name:'Vitamin D3 + K2', cat:'Health', timing:'morning', dose:'2000-4000 IU', notes:'Morning with food for best absorption.', caffeine:false, halfLife:0 },
  { id:'zinc', name:'Zinc', cat:'Health', timing:'night', dose:'25-30mg', notes:'Before bed — enhances testosterone and sleep quality.', caffeine:false, halfLife:0 },
  { id:'magnesium', name:'Magnesium Glycinate', cat:'Recovery', timing:'night', dose:'300-400mg', notes:'Before bed — improves sleep quality and recovery.', caffeine:false, halfLife:0 },
  { id:'multi', name:'Multivitamin', cat:'Health', timing:'morning', dose:'1 serving', notes:'Morning with breakfast.', caffeine:false, halfLife:0 },
  { id:'collagen', name:'Collagen Peptides', cat:'Recovery', timing:'morning', dose:'10-15g', notes:'Morning with vitamin C for absorption.', caffeine:false, halfLife:0 },
  { id:'ashwa', name:'Ashwagandha', cat:'Adaptogen', timing:'night', dose:'300-600mg', notes:'Before bed — reduces cortisol, improves stress resilience.', caffeine:false, halfLife:0 },
  { id:'beta', name:'Beta-Alanine', cat:'Performance', timing:'pre', dose:'3.2g', notes:'Pre-workout. May cause harmless tingling.', caffeine:false, halfLife:0 },
  { id:'citrulline', name:'Citrulline Malate', cat:'Performance', timing:'pre', dose:'6-8g', notes:'Pre-workout for pump and endurance.', caffeine:false, halfLife:0 },
  { id:'caffeine', name:'Caffeine Pills', cat:'Stimulant', timing:'pre', dose:'100-200mg', notes:'Pre-workout. Limit after 2pm. Max 400mg/day.', caffeine:true, halfLife:5 },
  { id:'melatonin', name:'Melatonin', cat:'Sleep', timing:'night', dose:'0.5-3mg', notes:'30 min before bed. Start with lowest dose.', caffeine:false, halfLife:0 }
];
window.SupplementDB = SupplementDB;

const SupplementEngine = {
  getDueNow() {
    const userSupps = S.g('supplements') || [];
    const logs = S.g('supplementLogs') || [];
    const now = new Date();
    const h = now.getHours();
    return userSupps.filter(s => {
      const todayLogs = logs.filter(l => l.suppId===s.id && l.date===today());
      if (todayLogs.length > 0) return false;
      const timing = s.timing || '';
      if (timing==='morning' && h>=6 && h<10) return true;
      if (timing==='pre' && h>=7 && h<21) return true;
      if (timing==='post' && h>=7 && h<22) return true;
      if (timing==='night' && h>=19) return true;
      if (timing==='anytime' && h>=7 && h<22 && h%4===0) return true;
      return false;
    });
  },
  checkCaffeineWarning(supp, sleepHour) {
    if (!supp.caffeine) return null;
    const now = new Date().getHours();
    const cutoff = (sleepHour||22) - (supp.halfLife||5);
    if (now >= cutoff) return 'Caffeine now may affect sleep at ' + (sleepHour||22) + ':00. Consider half dose or skip.';
    return null;
  },
  getStack(goal) {
    const stacks = {
      hypertrophy: ['creatine','whey','bcaa','vitd','magnesium','zinc'],
      strength: ['creatine','c4','casein','omega3','vitd','zinc'],
      fat_loss: ['c4','bcaa','omega3','vitd','magnesium','multi'],
      recovery: ['glutamine','magnesium','omega3','vitd','ashwa','melatonin'],
      athletic: ['creatine','beta','citrulline','whey','omega3','vitd']
    };
    return (stacks[goal]||stacks.hypertrophy).map(id => SupplementDB.find(s=>s.id===id)).filter(Boolean);
  },
  markTaken(suppId) {
    S.push('supplementLogs', { suppId, date:today(), time:isoNow() });
    toast('Supplement logged ✅', 'ok');
  }
};
window.SupplementEngine = SupplementEngine;

/* ══════════════════════════════════════════════════════
   ENGINE — SMART COACH
══════════════════════════════════════════════════════ */
const CoachEngine = {
  insights() {
    try {
      const r = S.g('recovery') || {};
      const score = ReadinessEngine.score();
      const streak = StreakEngine.get();
      const weeklyGoal = S.g('user.weeklyGoal') || 4;
      const weekWkts = StreakEngine.weekWorkouts();
      const tone = S.g('settings.coachTone') || 'motivational';
      const goal = S.g('user.goal') || 'hypertrophy';
      const user = S.g('user') || {};
      const ws = S.g('workouts') || [];
      const injuries = (S.g('user.injuries') || []).filter(function(i) {
        return typeof i === 'string' ? true : !i.recovered;
      });
      const msgs = [];
      function m3(mot, sci, hrd) { return tone==='scientific'?sci:tone==='hardcore'?hrd:mot; }

      if (injuries.length) {
        msgs.push({t:'Injury Management',
          m: m3(
            injuries.length+' active injur'+(injuries.length>1?'ies':'y')+' detected. Flagged exercises are modified in your plan. Listen to your body.',
            'Biomechanical load restriction active for '+injuries.length+' region'+(injuries.length>1?'s':'')+'. Exercise selection algorithm has filtered high-risk movements.',
            injuries.length+' injuries. Work around them — not through them. Modified plan is active.'
          ),
          i:'⚠️',c:'#ff453a'});
      }

      const sleep = r.sleep || 7.5;
      if (sleep < 6) msgs.push({t:'Critical Sleep Debt',
        m:m3('Under 6 hours hurts muscle protein synthesis and performance. 8+ hours tonight is the priority.',
             'Sub-6h sleep: MPS reduced ~18%, cortisol elevated, CNS recovery incomplete. Sleep is the primary intervention tonight.',
             'Under 6 hours. Weak. Fix it — sleep is where you grow.'),
        i:'😴',c:'#ff453a'});
      else if (sleep >= 8) msgs.push({t:'Optimal Recovery',
        m:m3('8+ hours logged — your body is primed. Peak output is available today.',
             '8h+ sleep: full GH release window, complete MPS cycle, optimal CNS state.',
             '8 hours. Now perform. No excuses today.'),
        i:'⚡',c:'#30d158'});

      if (goal === 'fat_loss') {
        const calories = S.g('nutrition.todayCalories') || 0;
        const target = user.calorieTarget || 2000;
        if (calories > target * 0.95) msgs.push({t:'Calorie Target',
          m:m3('You\'re at or above your calorie target. Keep activity high and consider a short cardio session after training.',
               'Caloric intake approaching target threshold. Post-training LISS recommended for additional deficit.',
               'At your calories. Don\'t blow it. Hit the cardio after training.'),
          i:'🔥',c:'#ff9f0a'});
      }

      if (goal === 'strength') {
        const lastWkt = ws[ws.length-1];
        if (lastWkt && daysAgo(lastWkt.date) >= 2) msgs.push({t:'Strength Window',
          m:m3('CNS is recovered after 2+ rest days. Today is an excellent day to attempt heavy singles or PRs.',
               '48h+ post-training: phosphocreatine resynthesis complete, neural drive optimal. Ideal for maximal effort.',
               'Rested. Load the bar heavy. Today\'s the day for big numbers.'),
          i:'💪',c:'#30d158'});
      }

      if (goal === 'hypertrophy') {
        const soreness = r.soreness || 3;
        if (soreness <= 2 && score >= 70) msgs.push({t:'Hypertrophy Window',
          m:m3('Low soreness and high readiness — perfect conditions for progressive overload. Push your working weights up today.',
               'Minimal DOMS with high readiness index. Anabolic conditions optimal. Increase working weights 2-5%.',
               'Zero soreness, high readiness. Go heavier. No settling for the same weights.'),
          i:'📈',c:'var(--c1)'});
      }

      if (streak >= 5) msgs.push({t:'Deload Signal',
        m:m3(streak+' days straight. Schedule deload this week — same frequency, 50% volume.',
             streak+'-day consecutive training. Cumulative fatigue index elevated. Deload protocol: maintain frequency, reduce intensity 40-50%.',
             streak+' days. CNS is cooked. Deload week — same schedule, half volume. Non-negotiable.'),
        i:'⚠️',c:'#f5c842'});

      const rem = weeklyGoal - weekWkts.length;
      if (rem > 0 && rem <= 2 && new Date().getDay() >= 4) msgs.push({t:'Weekly Goal',
        m:m3(weekWkts.length+'/'+weeklyGoal+' sessions done. '+rem+' to go — finish strong this week.',
             'Training frequency: '+weekWkts.length+'/'+weeklyGoal+'. '+rem+' sessions required to meet weekly volume prescription.',
             weekWkts.length+'/'+weeklyGoal+' done. '+rem+' left. Finish what you started.'),
        i:'🎯',c:'var(--c1)'});

      const hydration = r.hydration || 2.5;
      if (hydration < 1.5) msgs.push({t:'Hydration Alert',
        m:m3('Low hydration reduces strength by up to 20%. Drink 500ml immediately before training.',
             'Fluid deficit detected. Hypohydration at 2% body mass loss reduces strength output 19%. Hydrate now.',
             'Under 1.5L. Drink 500ml now. Dehydration is a performance killer.'),
        i:'💧',c:'var(--c1)'});

      if (!msgs.length) msgs.push({t:'All Systems Go',
        m:m3('Recovery metrics solid. Execute the plan, track every set, keep the streak alive.',
             'All recovery indices nominal. Execute planned progressive overload protocol.',
             'Metrics solid. No excuses. Train hard, track everything.'),
        i:'✅',c:'#30d158'});

      return msgs.slice(0,4);
    } catch(e) { return []; }
  },
  cardioRec(splitDay, readiness) {
    const score = readiness || ReadinessEngine.score();
    const muscles = (splitDay && splitDay.muscles) || [];
    const isLegDay = muscles.some(m=>/quad|hamstring|leg/i.test(m));
    const protocols = {
      high: { machine:'Treadmill', duration:'25 min', details:'Speed 10-11 km/h, Incline 1%, Zone 3 cardio post-workout' },
      normal: { machine:'Stationary Bike', duration:'20 min', details:'Resistance 8-10, 80-90 RPM, steady state' },
      low: { machine:'Treadmill Walking', duration:'30 min', details:'5.5 km/h, Incline 2%, brisk walk — active recovery' },
      legDay: { machine:'Rowing Machine', duration:'15 min', details:'2:00/500m pace — upper body emphasis, minimal leg fatigue' }
    };
    if (isLegDay) return protocols.legDay;
    if (score >= 80) return protocols.high;
    if (score >= 60) return protocols.normal;
    return protocols.low;
  },
  motivationalQuote() {
    const quotes = [
      '"The pain you feel today will be the strength you feel tomorrow."',
      '"Success is the sum of small efforts, repeated day in and day out."',
      '"The only bad workout is the one that didn\'t happen."',
      '"Your body can stand almost anything. It\'s your mind you have to convince."',
      '"What seems impossible today will one day become your warm-up."',
      '"Strive for progress, not perfection."',
      '"The clock is ticking. Are you becoming the person you want to be?"',
      '"Champions aren\'t made in the gyms. Champions are made from something they have deep inside."',
      '"It never gets easier, you just get better."',
      '"Train hard, recover harder."'
    ];
    return quotes[new Date().getDate() % quotes.length];
  },
  weeklyReport() {
    try {
      const ws = S.g('workouts') || [];
      if (ws.length < 2) return null;
      const thisVol = StreakEngine.weekVolume();
      const lastVol = ws.filter(w => { const d=daysAgo(w.date); return d>=7&&d<14; }).reduce((a,w)=>a+(w.totalVol||0),0);
      const change = lastVol > 0 ? Math.round(((thisVol-lastVol)/lastVol)*100) : 0;
      const weekWkts = StreakEngine.weekWorkouts();
      const weeklyGoal = S.g('user.weeklyGoal') || 4;
      const muscleStatus = MuscleEngine.status();
      let bestMuscle = null, bestMuscleScore = 0;
      muscleStatus.forEach(m => { if (m.pct > bestMuscleScore) { bestMuscleScore = m.pct; bestMuscle = m.name; } });
      let mostImproved = null, bestGain = 0;
      const recentE1RM = {}, olderE1RM = {};
      ws.forEach(wo => {
        const d = daysAgo(wo.date);
        (wo.exercises||[]).forEach(ex => {
          const done = (ex.sets||[]).filter(s=>s.done&&(s.weight||0)>0);
          if (!done.length) return;
          const best = done.reduce((mx,s)=>Math.max(mx,ProgEngine.epley(s.weight||0,s.reps||1)),0);
          if (!isFinite(best)||best<=0) return;
          if (d<7) { if (!recentE1RM[ex.name]||best>recentE1RM[ex.name]) recentE1RM[ex.name]=best; }
          if (d>=7&&d<14) { if (!olderE1RM[ex.name]||best>olderE1RM[ex.name]) olderE1RM[ex.name]=best; }
        });
      });
      Object.keys(recentE1RM).forEach(name => {
        if (olderE1RM[name]&&olderE1RM[name]>0) {
          const gain = Math.round(((recentE1RM[name]-olderE1RM[name])/olderE1RM[name])*100);
          if (gain>bestGain) { bestGain=gain; mostImproved={name,gain}; }
        }
      });
      return { thisVol, lastVol, change, weekWorkouts:weekWkts.length, weeklyGoal, bestMuscle, bestMuscleScore, mostImproved, currentReadiness:ReadinessEngine.score() };
    } catch(e) { return null; }
  },
  exerciseProgression(name) {
    try {
      const ws = S.g('workouts') || [];
      const sessions = [];
      ws.forEach(wo => {
        const ex = (wo.exercises||[]).find(e=>e.name===name);
        if (!ex) return;
        const done = (ex.sets||[]).filter(s=>s.done&&(s.weight||0)>0);
        if (!done.length) return;
        const best = done.reduce((mx,s)=>Math.max(mx,ProgEngine.epley(s.weight||0,s.reps||1)),0);
        if (best<=0) return;
        const topSet = done.slice().sort((a,b)=>ProgEngine.epley(b.weight||0,b.reps||1)-ProgEngine.epley(a.weight||0,a.reps||1))[0];
        sessions.push({date:wo.date,e1rm:best,weight:topSet.weight||0,reps:topSet.reps||0});
      });
      if (!sessions.length) return null;
      const current = sessions[sessions.length-1];
      const oldSessions = sessions.filter(s=>daysAgo(s.date)>=28);
      const oldBest = oldSessions.length ? oldSessions[oldSessions.length-1].e1rm : null;
      const pctChange = (oldBest&&oldBest>0) ? Math.round(((current.e1rm-oldBest)/oldBest)*100) : null;
      const last3 = sessions.slice(-3);
      const plateau = last3.length>=3 && last3.every(s=>s.e1rm<=last3[0].e1rm);
      const suggestedWeight = plateau ? current.weight : round2(current.weight+2.5);
      return {name,currentE1RM:current.e1rm,currentWeight:current.weight,currentReps:current.reps,oldE1RM:oldBest,pctChange,plateau,sessions:sessions.length,suggestedWeight};
    } catch(e) { return null; }
  }
};
window.CoachEngine = CoachEngine;

/* ══════════════════════════════════════════════════════
   ENGINE — ACHIEVEMENTS
══════════════════════════════════════════════════════ */
const AchEngine = {
  all: [
    {id:'first_workout',n:'First Rep',d:'Complete your first workout',i:'🎯'},
    {id:'streak_3',n:'Hat Trick',d:'3-day workout streak',i:'🔥'},
    {id:'streak_7',n:'Week Warrior',d:'7-day streak',i:'⚡'},
    {id:'streak_14',n:'Fortnight Fighter',d:'14-day streak',i:'💥'},
    {id:'streak_30',n:'Iron Will',d:'30-day streak',i:'🏆'},
    {id:'workouts_10',n:'Getting Consistent',d:'10 workouts completed',i:'💪'},
    {id:'workouts_25',n:'On a Roll',d:'25 workouts completed',i:'🎱'},
    {id:'workouts_50',n:'Dedicated',d:'50 workouts completed',i:'🥇'},
    {id:'workouts_100',n:'Century Club',d:'100 workouts completed',i:'👑'},
    {id:'pr_first',n:'Record Breaker',d:'Set your first PR',i:'🏅'},
    {id:'pr_10',n:'PR Machine',d:'10 PRs set',i:'🎖️'},
    {id:'pr_25',n:'Elite Lifter',d:'25 PRs set',i:'💎'},
    {id:'vol_10k',n:'Volume Starter',d:'10,000kg total lifted',i:'🏋️'},
    {id:'vol_50k',n:'Volume Builder',d:'50,000kg total lifted',i:'🦍'},
    {id:'vol_100k',n:'Volume King',d:'100,000kg total lifted',i:'🦁'},
    {id:'early_bird',n:'Early Bird',d:'Complete a workout before 7am',i:'🌅'},
    {id:'night_owl',n:'Night Owl',d:'Complete a workout after 9pm',i:'🦉'},
    {id:'supp_7',n:'Supplement Consistent',d:'Log supplements 7 days in a row',i:'💊'},
    {id:'full_split',n:'Full Cycle',d:'Complete a full training split cycle',i:'♻️'},
    {id:'recovery_5',n:'Recovery Focused',d:'Log recovery check-in 5 times',i:'🧘'},
    {id:'bodymap',n:'Body Aware',d:'Track muscle recovery in Body Map',i:'🫀'},
  ],
  check() {
    try {
      const earned = S.g('achievements') || [];
      const ws = S.g('workouts') || [];
      const prs = S.g('prs') || [];
      const streak = StreakEngine.get();
      const totalVol = StreakEngine.totalVolume();
      const checks = {
        first_workout: ws.length>=1, streak_3:streak>=3, streak_7:streak>=7,
        streak_14:streak>=14, streak_30:streak>=30,
        workouts_10:ws.length>=10, workouts_25:ws.length>=25,
        workouts_50:ws.length>=50, workouts_100:ws.length>=100,
        pr_first:prs.length>=1, pr_10:prs.length>=10, pr_25:prs.length>=25,
        vol_10k:totalVol>=10000, vol_50k:totalVol>=50000, vol_100k:totalVol>=100000,
        early_bird:ws.some(w=>new Date(w.date).getHours()<7),
        night_owl:ws.some(w=>new Date(w.date).getHours()>=21),
      };
      this.all.forEach(a => {
        if (!earned.includes(a.id) && checks[a.id]) {
          earned.push(a.id);
          setTimeout(() => toast('🎖️ Achievement: '+a.n+'!', 'achieve', 5000), 800);
          setTimeout(() => haptic([50,30,50,30,100]), 800);
        }
      });
      S.set('achievements', earned);
    } catch(e) { console.warn('AchEngine.check', e); }
  }
};
window.AchEngine = AchEngine;

/* ══════════════════════════════════════════════════════
   ENGINE — TDEE
══════════════════════════════════════════════════════ */
const TDEEEngine = {
  calculate(user) {
    const bmr = BodyEngine.bmr(user);
    const tdee = BodyEngine.tdee(user);
    return { bmr, tdee, maintenance:tdee };
  },
  macroSplit(goal, tdee) {
    const splits = {
      hypertrophy: { p:0.3, c:0.45, f:0.25 },
      strength:    { p:0.35, c:0.4, f:0.25 },
      fat_loss:    { p:0.4, c:0.35, f:0.25 },
      maintenance: { p:0.3, c:0.4, f:0.3 },
      athletic:    { p:0.3, c:0.5, f:0.2 }
    };
    const s = splits[goal] || splits.maintenance;
    return {
      protein: Math.round((tdee * s.p) / 4),
      carbs:   Math.round((tdee * s.c) / 4),
      fat:     Math.round((tdee * s.f) / 9)
    };
  },
  deficitPlan(user) {
    const tdee = BodyEngine.tdee(user);
    const deficit = 500;
    const calories = tdee - deficit;
    return { calories, deficit, weeklyLoss:0.5, weeks:Math.ceil(((user.weight||75)-(user.goalWeight||70))/0.5) };
  },
  surplusPlan(user) {
    const tdee = BodyEngine.tdee(user);
    const surplus = 250;
    const monthlyGain = BodyEngine.muscleBuildProjection(user);
    return { calories:tdee+surplus, surplus, monthlyGain };
  }
};
window.TDEEEngine = TDEEEngine;

/* ══════════════════════════════════════════════════════
   ENGINE — PERSONALIZED PLAN
══════════════════════════════════════════════════════ */
const PlanEngine = {
  build(user) {
    user = user || S.g('user') || {};
    const rec = typeof SplitsDB !== 'undefined' ? SplitsDB.recommend(user) : { id: 'ppl', name: 'Push Pull Legs', reason: 'Balanced split', daysPerWeek: 4 };
    const split = user.split || rec.id;
    const splitInfo = typeof SplitsDB !== 'undefined' ? SplitsDB.byId(split) : null;
    const splitName = splitInfo ? splitInfo.name : rec.name;
    const splitReason = splitInfo ? splitInfo.desc : rec.reason;
    const calories = BodyEngine.calorieTarget(user);
    const protein = BodyEngine.proteinTarget(user);
    const macros = TDEEEngine.macroSplit(user.goal || 'hypertrophy', calories);
    const todayWorkout = SplitEngine.getSplitDay();
    const readiness = ReadinessEngine.score();
    const weekWkts = StreakEngine.weekWorkouts();
    const weeklyGoal = user.weeklyGoal || rec.daysPerWeek || 4;
    const weeklyFocus = [];
    if (weekWkts.length < weeklyGoal) weeklyFocus.push((weeklyGoal - weekWkts.length) + ' more session' + (weeklyGoal - weekWkts.length > 1 ? 's' : '') + ' to hit weekly goal');
    const soreMuscles = MuscleEngine.status().filter(m => m.status === 'sore').map(m => m.name);
    if (soreMuscles.length) weeklyFocus.push('Let ' + soreMuscles.slice(0, 2).join(' & ') + ' recover');
    if (!weeklyFocus.length) weeklyFocus.push('Stay consistent — you\'re on track this week');
    const bodyStats = S.g('bodyStats') || [];
    let bodyProgress = 'Log weight in Body tab to track progress';
    if (bodyStats.length >= 2) {
      const diff = round2(bodyStats[bodyStats.length - 1].weight - bodyStats[bodyStats.length - 2].weight);
      const dir = diff > 0 ? '+' : '';
      bodyProgress = dir + diff + 'kg since last weigh-in';
    } else if (bodyStats.length === 1) {
      bodyProgress = 'First weigh-in logged — keep tracking weekly';
    }
    const injuryAssess = typeof InjuriesDB !== 'undefined' ? InjuriesDB.assessActive() : { messages: [], shouldRest: false, count: 0 };
    let injuryAdvisory = injuryAssess.count ? injuryAssess.messages.join('. ') : 'No active injury restrictions';
    if (injuryAssess.shouldRest) injuryAdvisory = '⚠️ Rest recommended — ' + injuryAdvisory;
    const equipmentConfigured = !!user.equipmentConfigured;
    let readinessNote = readiness >= 80 ? 'High readiness — push intensity today' :
      readiness >= 60 ? 'Moderate readiness — train as planned' :
      readiness >= 40 ? 'Low readiness — consider lighter volume' : 'Recovery day recommended';
    if (injuryAssess.shouldRest) readinessNote = 'Prioritize recovery over intensity';
    const goalLabels = { hypertrophy: 'muscle gain', fat_loss: 'fat loss', strength: 'strength', weight_gain: 'mass gain', recomp: 'recomposition', maintenance: 'maintenance', athletic: 'performance', general_health: 'health' };
    const message = this.heroMessage(user, { readiness, todayWorkout, splitName, calories, protein, injuryAssess });
    return {
      split: splitName,
      splitId: split,
      splitReason,
      calorieTarget: calories,
      protein,
      carbs: macros.carbs,
      fat: macros.fat,
      todayWorkout,
      weeklyFocus,
      bodyProgress,
      injuryAdvisory,
      equipmentConfigured,
      readinessNote,
      readiness,
      message,
      goalLabel: goalLabels[user.goal] || user.goal || 'training'
    };
  },
  heroMessage(user, ctx) {
    ctx = ctx || {};
    const name = (user.name || 'Athlete').split(' ')[0];
    const workout = ctx.todayWorkout || SplitEngine.getSplitDay();
    const readiness = ctx.readiness != null ? ctx.readiness : ReadinessEngine.score();
    if (ctx.injuryAssess && ctx.injuryAssess.shouldRest) {
      return name + ', your body needs recovery today. Light mobility or rest — injuries take priority.';
    }
    if (readiness < 40) {
      return name + ', readiness is low (' + readiness + '/100). Active recovery or a light session beats forcing it.';
    }
    const session = workout.n || 'today\'s session';
    const muscles = (workout.muscles || []).slice(0, 2).join(' & ');
    const cal = ctx.calories || BodyEngine.calorieTarget(user);
    const prot = ctx.protein || BodyEngine.proteinTarget(user);
    if (readiness >= 80) {
      return name + ', you\'re primed for ' + session + (muscles ? ' (' + muscles + ')' : '') + '. Target ' + cal + ' kcal · ' + prot + 'g protein.';
    }
    return name + ', ' + session + ' is on deck' + (muscles ? ' — focus ' + muscles : '') + '. ' + (ctx.splitName || '') + ' · ' + cal + ' kcal/day.';
  }
};
window.PlanEngine = PlanEngine;

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
  el.innerHTML = '<div class="cel-icon">' + (icon || '🎉') + '</div>' +
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

