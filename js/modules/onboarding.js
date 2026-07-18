'use strict';
/* ── PulseCap — Onboarding (7 steps + 4 intro slides) ── */

/* ── Intro Slides ── */
let _introSlide = 0;

const INTRO_SLIDES = [
  {
    mark: true,
    grad: 'linear-gradient(135deg, #00d5ff, #6b5fff)',
    title: 'PulseCap',
    sub: 'Your coach. In your pocket.',
    bullets: [
      'A plan for every day — built around your week, not someone else\'s',
      'It watches your recovery and adjusts before you overdo it',
      'Everything stays on your phone. No account, no cloud, no ads'
    ]
  },
  {
    ic: 'sparkles',
    grad: 'linear-gradient(135deg, #6b5fff, #ff6bff)',
    title: 'It thinks like a trainer',
    sub: 'Not a logbook. A coach that makes calls.',
    bullets: [
      'Slept badly? It lightens the day before you burn out',
      'Tweaked a shoulder? It swaps the risky lifts automatically',
      'Miss a day? It reshuffles your week — nothing gets lost',
      'Hit a real PR and it\'ll be the first to tell you'
    ]
  },
  {
    ic: 'dumbbell',
    grad: 'linear-gradient(135deg, #00ff88, #00d5ff)',
    title: 'Logging that keeps up',
    sub: 'Made for one hand, mid-set, between breaths.',
    bullets: [
      'Today\'s workout is one tap away, every morning',
      'Rest timer runs itself — with a buzz when you\'re up',
      '18 proven splits, from PPL to 5/3/1, scheduled to your week',
      '300+ exercises with real form cues, not filler text'
    ]
  },
  {
    ic: 'target',
    grad: 'linear-gradient(135deg, #ff6b6b, #ffb347)',
    title: 'Cutting, bulking, or both',
    sub: 'Tell it the goal. It handles the math.',
    bullets: [
      'Calories, protein, BMI, TDEE — worked out for your body',
      'Weigh-ins get a straight answer: on track or fix this',
      'Measurements, photos, and PRs in one progress timeline',
      'Supplement stack with reminders that actually show up'
    ]
  }
];

function _renderIntro(idx) {
  const slide = INTRO_SLIDES[idx];
  const isLast = idx === INTRO_SLIDES.length - 1;
  const dots = INTRO_SLIDES.map(function(_, i) {
    return '<div style="width:' + (i===idx?'22':'8') + 'px;height:8px;border-radius:4px;' +
      'background:' + (i===idx?'var(--c1)':'var(--border2)') + ';' +
      'transition:all 0.3s var(--spring)"></div>';
  }).join('');

  return '<div style="min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;' +
    'background:var(--bg);padding-top:calc(16px + var(--top-safe))">' +

    '<div style="display:flex;justify-content:flex-end;padding:8px 20px">' +
    (idx < INTRO_SLIDES.length - 1 ?
      '<button type="button" onclick="introQuickStart()" style="background:none;border:none;' +
      'color:var(--txt3);font-size:14px;font-weight:600;cursor:pointer;' +
      'touch-action:manipulation;padding:8px 4px;min-height:44px">Skip — explore first</button>'
      : '<div style="height:44px"></div>') +
    '</div>' +

    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;' +
    'justify-content:center;padding:20px 32px;text-align:center">' +

    '<div style="width:96px;height:96px;border-radius:28px;' +
    'background:' + slide.grad + ';display:flex;align-items:center;' +
    'justify-content:center;font-size:46px;margin-bottom:28px;' +
    'box-shadow:0 20px 60px rgba(0,0,0,0.3);' +
    'animation:breathe 3s ease-in-out infinite">' +
    (slide.mark ?
      '<svg width="52" height="52" viewBox="0 0 512 512" fill="none" aria-hidden="true">' +
      '<path d="M96 256 H176 L208 208 L256 304 L304 176 L352 256 H416" stroke="#fff" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<circle cx="256" cy="256" r="18" fill="#fff"/></svg>'
      : (slide.ic ? icon(slide.ic, 46, '#fff') : '')) + '</div>' +

    '<div style="font-size:30px;font-weight:900;letter-spacing:-1.5px;' +
    'color:var(--txt);margin-bottom:12px;line-height:1.15">' + esc(slide.title) + '</div>' +

    '<div style="font-size:15px;color:var(--txt2);margin-bottom:32px;' +
    'line-height:1.65;max-width:300px">' + esc(slide.sub) + '</div>' +

    '<div style="width:100%;max-width:340px;text-align:left">' +
    slide.bullets.map(function(b) {
      return '<div style="display:flex;align-items:flex-start;gap:12px;padding:11px 14px;' +
        'background:var(--bg3);border-radius:12px;margin-bottom:8px;' +
        'border:1px solid var(--border)">' +
        '<div style="font-size:14px;color:var(--txt);font-weight:500;line-height:1.45">' +
        esc(b) + '</div></div>';
    }).join('') +
    '</div></div>' +

    '<div style="padding:20px 24px calc(40px + var(--safe));' +
    'display:flex;flex-direction:column;align-items:center;gap:16px">' +

    '<div style="display:flex;gap:8px;align-items:center">' + dots + '</div>' +

    '<button type="button" onclick="' + (isLast ? 'go(\'onboarding\')' : '_introNext()') + '" ' +
    'style="width:100%;max-width:320px;padding:18px;border-radius:16px;' +
    'background:' + (isLast ? 'var(--grad)' : 'var(--bg3)') + ';' +
    'color:' + (isLast ? '#fff' : 'var(--c1)') + ';' +
    'border:' + (isLast ? 'none' : '1.5px solid rgba(var(--c1-rgb),0.25)') + ';' +
    'font-size:17px;font-weight:700;cursor:pointer;' +
    'touch-action:manipulation;-webkit-appearance:none;' +
    'box-shadow:' + (isLast ? '0 4px 20px rgba(var(--c1-rgb),0.3)' : 'none') + '">' +
    (isLast ? 'Get Started →' : 'Next →') +
    '</button>' +

    '</div></div>';
}

window.introQuickStart = function() {
  _obData = { name: 'Athlete', goal: 'hypertrophy', split: 'ppl', weeklyGoal: 4 };
  _finishOnboarding();
};

window._introNext = function() {
  _introSlide++;
  if (_introSlide >= INTRO_SLIDES.length) {
    go('onboarding');
    return;
  }
  go('intro');
};

/* Route deleted — SCREEN_ALIASES maps intro → onboarding?showIntro=true. */

/* ── end intro slides ── */

let _obData = {};
let _obStep = 1;
const OB_TOTAL = 7;

/* Gallery/QA hook — drive intro slide + onboarding step without user input.
   Inert in normal use (only called by the screenshot harness). */
window.__pcOnboardingState = function(o) {
  o = o || {};
  if (typeof o.step === 'number') _obStep = Math.min(Math.max(o.step, 1), OB_TOTAL);
  if (typeof o.intro === 'number') _introSlide = Math.min(Math.max(o.intro, 0), INTRO_SLIDES.length - 1);
  if (o.data) Object.assign(_obData, o.data);
  return { step: _obStep, intro: _introSlide };
};

const SPLIT_WEEKLY = (typeof SplitsDB !== 'undefined'
  ? Object.fromEntries(SplitsDB.splits.map(function(s) { return [s.id, s.days || 4]; }))
  : { ppl:6, ul:4, fb:3, bro:5, str:4, home:4, custom:4 });

window.obSelect = function(field, val) {
  _obData[field] = val;
  if (field === 'split') _obData.weeklyGoal = SPLIT_WEEKLY[val] || 4;
  document.querySelectorAll('[data-field="' + field + '"]').forEach(el => el.classList.remove('sel'));
  const t = document.querySelector('[data-field="' + field + '"][data-val="' + val + '"]');
  if (t) t.classList.add('sel');
};

window.obToggle = function(field, val) {
  if (!_obData[field]) _obData[field] = [];
  const idx = _obData[field].indexOf(val);
  if (idx >= 0) _obData[field].splice(idx, 1);
  else _obData[field].push(val);
  const el = document.querySelector('[data-field="' + field + '"][data-val="' + val + '"]');
  if (el) el.classList.toggle('sel', _obData[field].includes(val));
};

window.obBack = function() {
  if (_obStep > 1) { _obStep--; go('onboarding'); }
};

window.obContinue = function() {
  haptic(30);
  if (!_validateStep(_obStep)) return;
  if (_obStep < OB_TOTAL) { _obStep++; go('onboarding'); }
  else _finishOnboarding();
};

function _validateStep(step) {
  if (step === 1 && !(_obData.name && _obData.name.trim())) {
    const inp = document.getElementById('ob-name-inp');
    if (inp) { inp.style.borderColor='#ff4444'; inp.focus(); }
    toast('Enter your name to continue', 'warn');
    return false;
  }
  return true;
}

function _finishOnboarding() {
  const u = S.g('user') || {};
  Object.assign(u, {
    name: (_obData.name||'Athlete').trim(),
    goal: _obData.goal || 'hypertrophy',
    exp: _obData.exp || 'intermediate',
    gender: _obData.gender || 'male',
    age: parseInt(_obData.age) || 25,
    units: _obData.units || 'metric',
    height: parseFloat(_obData.height) || 175,
    weight: parseFloat(_obData.weight) || 75,
    goalWeight: parseFloat(_obData.goalWeight) || 70,
    targetBodyFat: parseFloat(_obData.targetBodyFat) || 15,
    split: (typeof SplitsDB !== 'undefined' ? SplitsDB.recommend({ goal: _obData.goal, exp: _obData.exp, weeklyGoal: 4 }).id : 'ppl'),
    weeklyGoal: (typeof SplitsDB !== 'undefined' ? SplitsDB.recommend({ goal: _obData.goal, exp: _obData.exp }).daysPerWeek : 4),
    equipment: [],
    equipmentIds: [],
    equipmentConfigured: false,
    gymBrands: [],
    gymDays: [],
    injuries: [],
    trainingPersonality: _obData.trainingPersonality || 'balanced',
    physiqueArchetype: _obData.physiqueArchetype || 'classic',
    trainingEnvironments: _obData.trainingEnvironments || ['gym'],
    sessionLength: parseInt(_obData.sessionLength) || 60,
    coachPersonality: _obData.personality || 'maya',
    joinDate: today()
  });
  const selSupps = (_obData.supplements || []).map(id => {
    const db = SupplementDB.find(s=>s.id===id);
    return db ? { id:db.id, name:db.name, timing:_obData['suppTiming_'+id]||db.timing, dose:db.dose, active:true } : null;
  }).filter(Boolean);
  S.set('user', u);
  S.set('supplements', selSupps);
  S.set('onboarded', true);
  S.set('settings.equipmentSetupPending', true);
  if (typeof SplitsDB !== 'undefined') {
    const rec = SplitsDB.recommend(u);
    S.set('settings.suggestedSplit', rec);
  }
  toast('Welcome, ' + u.name + '! Your plan is ready.', 'ok', 4000);
  go('dashboard');
}

function _dots(step) {
  let h = '<div class="ob-progress-wrap">';
  for (let i=1; i<=OB_TOTAL; i++) h += '<div class="ob-dot'+(i===step?' on':'')+'"></div>';
  return h + '</div>';
}

function _footer(step) {
  return '<div class="ob-footer">' +
    '<button type="button" class="btn btn-primary" onclick="obContinue()">' +
    (step < OB_TOTAL ? 'Continue →' : 'Start Training') +
    '</button>' +
    (step > 1 ? '<button type="button" class="btn btn-ghost" onclick="obBack()">← Back</button>' : '') +
    '</div>';
}

function _gridCard(field, val, icon, title, sub) {
  const isOn = _obData[field] === val;
  return '<button type="button" class="ob-opt'+(isOn?' sel':'')+'" data-field="'+field+'" data-val="'+val+'" onclick="obSelect(\''+field+'\',\''+val+'\')" style="flex-direction:column;align-items:center;text-align:center;padding:18px 10px;gap:8px;min-height:100px">' +
    '<div style="font-size:28px;line-height:1">'+icon+'</div>' +
    '<div class="ob-opt-title" style="font-size:13px;font-weight:700">'+esc(title)+'</div>' +
    '<div class="ob-opt-sub" style="font-size:11px;line-height:1.3">'+esc(sub)+'</div>' +
    '</button>';
}

function _opt(field, val, icon, title, sub, multi) {
  const fn = multi ? 'obToggle' : 'obSelect';
  const isOn = multi
    ? (_obData[field]||[]).includes(val)
    : _obData[field]===val;
  return '<button type="button" class="ob-opt'+(isOn?' sel':'')+'" data-field="'+field+'" data-val="'+val+'" onclick="'+fn+'(\''+field+'\',\''+val+'\')">' +
    (icon?'<div class="ob-opt-icon">'+icon+'</div>':'') +
    '<div class="ob-opt-info">' +
    '<div class="ob-opt-title">'+esc(title)+'</div>' +
    (sub?'<div class="ob-opt-sub">'+esc(sub)+'</div>':'') +
    '</div>' +
    '<div class="ob-opt-check">'+(isOn?'✓':'')+'</div>' +
    '</button>';
}

const OB_STEPS = {
  1() {
    return '<div class="ob-screen">' + _dots(1) +
      '<div class="ob-title">Hey there.<br>What should we call you?</div>' +
      '<div class="ob-sub">This is your personal training OS. Let\'s make it yours.</div>' +
      '<div class="ob-body">' +
      '<div class="field-wrap">' +
      '<label class="field-label">Your Name</label>' +
      '<input id="ob-name-inp" class="field" type="text" placeholder="Enter your name" value="'+esc(_obData.name||'')+'" oninput="_obData.name=this.value" style="font-size:22px;font-weight:700;padding:18px 16px" autocomplete="name" autofocus>' +
      '</div></div>' + _footer(1) + '</div>';
  },
  2() {
    return '<div class="ob-screen">' + _dots(2) +
      '<div class="ob-title">What\'s your primary goal?</div>' +
      '<div class="ob-sub">Your Smart Coach will build everything around this.</div>' +
      '<div class="ob-body">' +
      _opt('goal','hypertrophy',_obIcon('dumbbell'),'Build Muscle','Gain lean muscle and improve body composition') +
      _opt('goal','fat_loss',_obIcon('flame'),'Lose Fat','Reduce body fat while keeping muscle') +
      _opt('goal','weight_gain',_obIcon('chart'),'Gain Weight','Healthy mass gain — muscle and size') +
      _opt('goal','general_health',_obIcon('heart'),'Get Healthier','Move more, feel better, live longer') +
      _opt('goal','recomp',_obIcon('sparkles'),'Recomposition','Build muscle and lose fat together') +
      _opt('goal','strength',_obIcon('dumbbell'),'Get Stronger','Maximise strength in the big lifts') +
      _opt('goal','athletic',_obIcon('run'),'Athletic','Speed, power, and sport performance') +
      _opt('goal','endurance',_obIcon('walk'),'Cardio & Endurance','Stamina, heart health, conditioning') +
      _opt('goal','mobility',_obIcon('leaf'),'Mobility','Flexibility, joint health, pain-free movement') +
      _opt('goal','maintenance',_obIcon('check'),'Maintain','Stay fit with no dramatic changes') +
      '</div>' + _footer(2) + '</div>';
  },
  3() {
    return '<div class="ob-screen">' + _dots(3) +
      '<div class="ob-title">Training experience?</div>' +
      '<div class="ob-sub">Honest answers get better programs. No judgement here.</div>' +
      '<div class="ob-body">' +
      _opt('exp','beginner',_obIcon('leaf'),'Beginner','Less than 1 year of consistent training') +
      _opt('exp','intermediate',_obIcon('dumbbell'),'Intermediate','1-3 years of consistent training') +
      _opt('exp','advanced',_obIcon('flame'),'Advanced','3+ years with structured programming') +
      _opt('exp','athlete',_obIcon('target'),'Athlete','Competitive sport background or elite training') +
      '</div>' + _footer(3) + '</div>';
  },
  4() {
    const units = _obData.units || 'metric';
    return '<div class="ob-screen">' + _dots(4) +
      '<div class="ob-title">About you</div>' +
      '<div class="ob-sub">Used for accurate calorie and strength calculations.</div>' +
      '<div class="ob-body">' +
      '<div class="field-row">' +
      '<div class="field-wrap">' +
      '<label class="field-label">Gender</label>' +
      '<div  class="flex-gap-8">' +
      '<button type="button" class="ob-opt'+((_obData.gender||'male')==='male'?' sel':'')+'" data-field="gender" data-val="male" onclick="obSelect(\'gender\',\'male\')" style="flex:1;padding:14px 12px;justify-content:center;gap:10px;align-items:center;min-height:52px">' +
      '<span aria-hidden="true" style="font-size:20px;line-height:1;flex-shrink:0;opacity:0.9">♂</span><span class="ob-opt-title" style="letter-spacing:0.02em">Male</span></button>' +
      '<button type="button" class="ob-opt'+((_obData.gender||'')==='female'?' sel':'')+'" data-field="gender" data-val="female" onclick="obSelect(\'gender\',\'female\')" style="flex:1;padding:14px 12px;justify-content:center;gap:10px;align-items:center;min-height:52px">' +
      '<span aria-hidden="true" style="font-size:20px;line-height:1;flex-shrink:0;opacity:0.9">♀</span><span class="ob-opt-title" style="letter-spacing:0.02em">Female</span></button>' +
      '</div></div>' +
      '<div class="field-wrap">' +
      '<label class="field-label">Age</label>' +
      '<input class="field fs-18" type="number" min="14" max="80" placeholder="25" value="'+(_obData.age||'')+'" oninput="_obData.age=this.value">' +
      '</div></div>' +
      '<div  class="mb-14">' +
      '<label class="field-label">Units</label>' +
      '<div  class="flex-gap-8">' +
      '<button type="button" class="ob-opt'+(units==='metric'?' sel':'')+'" data-field="units" data-val="metric" onclick="obSelect(\'units\',\'metric\');obSelect(\'heightUnit\',\'cm\');obSelect(\'weightUnit\',\'kg\');go(\'onboarding\')" style="flex:1;padding:12px;justify-content:center"><div class="ob-opt-title">Metric (kg/cm)</div></button>' +
      '<button type="button" class="ob-opt'+(units==='imperial'?' sel':'')+'" data-field="units" data-val="imperial" onclick="obSelect(\'units\',\'imperial\');obSelect(\'heightUnit\',\'in\');obSelect(\'weightUnit\',\'lb\');go(\'onboarding\')" style="flex:1;padding:12px;justify-content:center"><div class="ob-opt-title">Imperial (lb/in)</div></button>' +
      '</div></div>' +
      '</div>' + _footer(4) + '</div>';
  },
  5() {
    const u = _obData.units === 'imperial';
    const hLabel = u ? 'Height (in)' : 'Height (cm)';
    const wLabel = u ? 'Weight (lb)' : 'Weight (kg)';
    const gwLabel = u ? 'Goal Weight (lb)' : 'Goal Weight (kg)';
    return '<div class="ob-screen">' + _dots(5) +
      '<div class="ob-title">Body stats</div>' +
      '<div class="ob-sub">Used to calculate your TDEE, macros, and progress projections.</div>' +
      '<div class="ob-body">' +
      '<div class="field-row">' +
      '<div class="field-wrap"><label class="field-label">'+hLabel+'</label>' +
      '<input class="field fs-18" type="number" placeholder="'+(u?'70':'175')+'" value="'+(_obData.height||'')+'" oninput="_obData.height=this.value"></div>' +
      '<div class="field-wrap"><label class="field-label">'+wLabel+'</label>' +
      '<input class="field fs-18" type="number" placeholder="'+(u?'165':'75')+'" value="'+(_obData.weight||'')+'" oninput="_obData.weight=this.value"></div>' +
      '</div>' +
      '<div class="field-row">' +
      '<div class="field-wrap"><label class="field-label">'+gwLabel+'</label>' +
      '<input class="field fs-18" type="number" placeholder="'+(u?'155':'70')+'" value="'+(_obData.goalWeight||'')+'" oninput="_obData.goalWeight=this.value"></div>' +
      '<div class="field-wrap"><label class="field-label">Body Fat % <span style="color:var(--txt3);font-weight:400">(optional)</span></label>' +
      '<input class="field fs-18" type="number" placeholder="15" min="3" max="50" value="'+(_obData.targetBodyFat||'')+'" oninput="_obData.targetBodyFat=this.value"></div>' +
      '</div>' +
      '</div>' + _footer(5) + '</div>';
  },
  6() {
    const coaches = [
      {v:'maya',e:'chart',n:'Maya',role:'Sports Scientist',d:'Evidence-based, analytical'},
      {v:'alex',e:'flame',n:'Alex',role:'Drill Sergeant',d:'Intense, no excuses'},
      {v:'sam',e:'sparkles',n:'Sam',role:'Motivator',d:'Energetic, encouraging'},
      {v:'zen',e:'leaf',n:'Zen',role:'Mindful Coach',d:'Calm, technique-focused'},
      {v:'rex',e:'dumbbell',n:'Rex',role:'Powerlifter',d:'Strength-focused, raw'}
    ];
    return '<div class="ob-screen">' + _dots(6) +
      '<div class="ob-title">Choose your coach</div>' +
      '<div class="ob-sub">Shapes motivation and daily guidance. Change anytime in Settings.</div>' +
      '<div class="ob-body">' +
      coaches.map(function(c) { return _opt('personality', c.v, _obIcon(c.e), c.n + ' · ' + c.role, c.d); }).join('') +
      '</div>' + _footer(6) + '</div>';
  },
  7() {
    const u = _obData;
    const name = (u.name || 'Athlete').trim();
    const coaches = { alex:'Alex', maya:'Maya', sam:'Sam', zen:'Zen', rex:'Rex' };
    const goals = { hypertrophy:'Build Muscle', fat_loss:'Lose Fat', weight_gain:'Gain Weight', general_health:'Get Healthier', recomp:'Recomposition', athletic:'Athletic', strength:'Strength', endurance:'Cardio', mobility:'Mobility', maintenance:'Maintain' };
    const cName = coaches[u.personality||'maya'] || 'Maya';
    const cIcon = { alex:'flame', maya:'chart', sam:'sparkles', zen:'leaf', rex:'dumbbell' }[u.personality||'maya'] || 'chart';
    const draftUser = {
      name: name, goal: u.goal || 'hypertrophy', exp: u.exp || 'intermediate',
      gender: u.gender || 'male', age: parseInt(u.age) || 25, height: parseFloat(u.height) || 175,
      weight: parseFloat(u.weight) || 75, goalWeight: parseFloat(u.goalWeight) || 70,
      activityLevel: 'moderate', equipmentConfigured: false
    };
    const plan = typeof PlanEngine !== 'undefined' ? PlanEngine.build(draftUser) : null;
    const rec = typeof SplitsDB !== 'undefined' ? SplitsDB.recommend(draftUser) : { name: 'Push Pull Legs', reason: 'Balanced hypertrophy split', daysPerWeek: 4 };
    return '<div class="ob-screen">' + _dots(7) +
      '<div style="text-align:center;padding:24px 0 20px">' +
      '<div style="width:72px;height:72px;border-radius:20px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;background:var(--grad);color:#fff;box-shadow:0 12px 32px rgba(var(--c1-rgb),0.3)">'+icon('check',36,'#fff')+'</div>' +
      '<div style="font-size:28px;font-weight:900;color:var(--txt);letter-spacing:-1px">Your Plan</div>' +
      '<div style="font-size:15px;color:var(--txt2);margin-top:8px">Ready, '+esc(name)+' — here\'s your starting point.</div>' +
      '</div>' +
      '<div class="card card-solid" style="margin:0 0 14px">' +
      _summaryRow('target','Goal', goals[u.goal||'hypertrophy'] || '—') +
      _summaryRow('calendar','Split', plan ? plan.split + ' (' + (draftUser.weeklyGoal || rec.daysPerWeek) + 'd/wk)' : rec.name) +
      _summaryRow('flame','Calories', plan ? plan.calorieTarget + ' kcal/day' : '—') +
      _summaryRow('apple','Protein', plan ? plan.protein + ' g/day' : '—') +
      _summaryRow('sparkles','Why', plan ? plan.splitReason : rec.reason) +
      _summaryRow('chart','Coach', cName) +
      '</div>' +
      '<div class="ob-body">' +
      '<div class="ai-msg"><div class="ai-msg-header"><span style="color:var(--c1);display:inline-flex">'+icon(cIcon,16)+'</span><span class="ai-msg-label">'+cName+' says</span></div>' +
      '<div class="ai-msg-text">Set up your equipment and injuries anytime in Settings. I\'ll adapt every workout to what you actually have access to.</div></div>' +
      '</div>' +
      _footer(7) + '</div>';
  }
};

function _obIcon(name) {
  return '<span style="color:var(--c1);display:inline-flex">' + icon(name, 22) + '</span>';
}

function _summaryRow(iconName, label, val) {
  return '<div class="list-divider-row">' +
    '<div style="display:flex;align-items:center;gap:10px;color:var(--txt3);font-size:13px"><span style="color:var(--c1);display:inline-flex">'+icon(iconName,16)+'</span><span>'+esc(label)+'</span></div>' +
    '<div  class="row-strong">'+esc(val)+'</div>' +
    '</div>';
}

reg('onboarding', function(data) {
  if (data && data.showIntro) {
    return _renderIntro(_introSlide);
  }
  return OB_STEPS[_obStep] ? OB_STEPS[_obStep]() : OB_STEPS[1]();
});

window.migrateCoachIntroMerge = function() {
  if (S.g('settings.migrations.coachIntroMerge') === 1) return false;
  S.set('settings.migrations.coachIntroMerge', 1);
  return true;
};
