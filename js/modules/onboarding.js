'use strict';
/* ── PulseCap v4 — Onboarding (12 steps) ── */

/* ── Intro Slides ── */
let _introSlide = 0;

const INTRO_SLIDES = [
  {
    emoji: '⚡',
    grad: 'linear-gradient(135deg, #00d5ff, #6b5fff)',
    title: 'PulseCap',
    sub: 'A full performance system — training, recovery, and coaching — that lives on your phone.',
    bullets: [
      '💪 300+ exercises with full coaching cues',
      '📊 Daily readiness score based on your recovery',
      '🧠 Smart Coach adapts your plan to how you feel',
      '🔒 100% offline — your data never leaves your phone'
    ]
  },
  {
    emoji: '🏆',
    grad: 'linear-gradient(135deg, #6b5fff, #ff6bff)',
    title: 'Smarter than a tracker',
    sub: 'PulseCap doesn\'t just log reps — it helps you train better.',
    bullets: [
      '😴 Adjusts intensity when your sleep or stress is high',
      '🏆 Detects personal records on every single set',
      '⚠️ Injury guard filters exercises for your weak points',
      '📈 Auto-progression signals when to add weight'
    ]
  },
  {
    emoji: '🏋️',
    grad: 'linear-gradient(135deg, #00ff88, #00d5ff)',
    title: 'Elite Workout Logger',
    sub: 'The fastest gym logging experience. Built for one-handed iPhone use.',
    bullets: [
      '⚡ Today\'s Smart Coach workout ready in one tap',
      '⏱️ Rest timer with haptic vibration when done',
      '🔄 PPL, Upper/Lower, Bro Split and 4 more splits',
      '🎯 5 coach personalities from drill sergeant to zen master'
    ]
  },
  {
    emoji: '🎯',
    grad: 'linear-gradient(135deg, #ff6b6b, #ffb347)',
    title: 'Built For Your Goals',
    sub: 'Every feature personalised to your body, goals, and schedule.',
    bullets: [
      '📏 Body stats, measurements, and progress tracking',
      '💊 Supplement stack with timing reminders',
      '😴 Recovery hub with personalised readiness score',
      '🌙 Dark & light modes — switch anytime in Settings'
    ]
  }
];

function _renderIntro(idx) {
  const slide = INTRO_SLIDES[idx];
  const isLast = idx === INTRO_SLIDES.length - 1;
  const dots = INTRO_SLIDES.map(function(_, i) {
    return '<div style="width:' + (i===idx?'22':'8') + 'px;height:8px;border-radius:4px;' +
      'background:' + (i===idx?'var(--c1)':'rgba(255,255,255,0.2)') + ';' +
      'transition:all 0.3s var(--spring)"></div>';
  }).join('');

  return '<div style="min-height:100vh;min-height:100dvh;display:flex;flex-direction:column;' +
    'background:var(--bg);padding-top:calc(16px + var(--top-safe))">' +

    '<div style="display:flex;justify-content:flex-end;padding:8px 20px">' +
    (idx < INTRO_SLIDES.length - 1 ?
      '<button type="button" onclick="introQuickStart()" style="background:none;border:none;' +
      'color:rgba(255,255,255,0.4);font-size:14px;font-weight:600;cursor:pointer;' +
      'touch-action:manipulation;padding:8px 4px;min-height:44px">Skip setup</button>'
      : '<div style="height:44px"></div>') +
    '</div>' +

    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;' +
    'justify-content:center;padding:20px 32px;text-align:center">' +

    '<div style="width:96px;height:96px;border-radius:28px;' +
    'background:' + slide.grad + ';display:flex;align-items:center;' +
    'justify-content:center;font-size:46px;margin-bottom:28px;' +
    'box-shadow:0 20px 60px rgba(0,0,0,0.3);' +
    'animation:breathe 3s ease-in-out infinite">' + slide.emoji + '</div>' +

    '<div style="font-size:30px;font-weight:900;letter-spacing:-1.5px;' +
    'color:var(--txt);margin-bottom:12px;line-height:1.15">' + esc(slide.title) + '</div>' +

    '<div style="font-size:15px;color:var(--txt2);margin-bottom:32px;' +
    'line-height:1.65;max-width:300px">' + esc(slide.sub) + '</div>' +

    '<div style="width:100%;max-width:340px;text-align:left">' +
    slide.bullets.map(function(b) {
      return '<div style="display:flex;align-items:flex-start;gap:12px;padding:11px 14px;' +
        'background:rgba(255,255,255,0.05);border-radius:12px;margin-bottom:8px;' +
        'border:1px solid rgba(255,255,255,0.08)">' +
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

reg('intro', function() {
  return _renderIntro(_introSlide);
});

/* ── end intro slides ── */

let _obData = {};
let _obStep = 1;
const OB_TOTAL = 7;

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
    (step < OB_TOTAL ? 'Continue →' : 'Start Training 💪') +
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
      '<div class="ob-title">Hey there! 👋<br>What should we call you?</div>' +
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
      _opt('goal','hypertrophy','💪','Build Muscle','Gain lean muscle and improve body composition') +
      _opt('goal','fat_loss','🔥','Lose Fat','Reduce body fat while keeping muscle') +
      _opt('goal','weight_gain','📈','Gain Weight','Healthy mass gain — muscle and size') +
      _opt('goal','general_health','❤️','Get Healthier','Move more, feel better, live longer') +
      _opt('goal','recomp','⚡','Recomposition','Build muscle and lose fat together') +
      _opt('goal','strength','🏋️','Get Stronger','Maximise strength in the big lifts') +
      _opt('goal','athletic','🏃','Athletic','Speed, power, and sport performance') +
      _opt('goal','endurance','🏃‍♂️','Cardio & Endurance','Stamina, heart health, conditioning') +
      _opt('goal','mobility','🧘','Mobility','Flexibility, joint health, pain-free movement') +
      _opt('goal','maintenance','✅','Maintain','Stay fit with no dramatic changes') +
      '</div>' + _footer(2) + '</div>';
  },
  3() {
    return '<div class="ob-screen">' + _dots(3) +
      '<div class="ob-title">Training experience?</div>' +
      '<div class="ob-sub">Honest answers get better programs. No judgement here.</div>' +
      '<div class="ob-body">' +
      _opt('exp','beginner','🌱','Beginner','Less than 1 year of consistent training') +
      _opt('exp','intermediate','💪','Intermediate','1-3 years of consistent training') +
      _opt('exp','advanced','🔥','Advanced','3+ years with structured programming') +
      _opt('exp','athlete','🏆','Athlete','Competitive sport background or elite training') +
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
      '<div style="display:flex;gap:8px">' +
      '<button type="button" class="ob-opt'+((_obData.gender||'male')==='male'?' sel':'')+'" data-field="gender" data-val="male" onclick="obSelect(\'gender\',\'male\')" style="flex:1;padding:12px 8px;justify-content:center"><div class="ob-opt-title">♂ Male</div></button>' +
      '<button type="button" class="ob-opt'+((_obData.gender||'')==='female'?' sel':'')+'" data-field="gender" data-val="female" onclick="obSelect(\'gender\',\'female\')" style="flex:1;padding:12px 8px;justify-content:center"><div class="ob-opt-title">♀ Female</div></button>' +
      '</div></div>' +
      '<div class="field-wrap">' +
      '<label class="field-label">Age</label>' +
      '<input class="field" type="number" min="14" max="80" placeholder="25" value="'+(_obData.age||'')+'" oninput="_obData.age=this.value" style="font-size:18px">' +
      '</div></div>' +
      '<div style="margin-bottom:14px">' +
      '<label class="field-label">Units</label>' +
      '<div style="display:flex;gap:8px">' +
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
      '<input class="field" type="number" placeholder="'+(u?'70':'175')+'" value="'+(_obData.height||'')+'" oninput="_obData.height=this.value" style="font-size:18px"></div>' +
      '<div class="field-wrap"><label class="field-label">'+wLabel+'</label>' +
      '<input class="field" type="number" placeholder="'+(u?'165':'75')+'" value="'+(_obData.weight||'')+'" oninput="_obData.weight=this.value" style="font-size:18px"></div>' +
      '</div>' +
      '<div class="field-row">' +
      '<div class="field-wrap"><label class="field-label">'+gwLabel+'</label>' +
      '<input class="field" type="number" placeholder="'+(u?'155':'70')+'" value="'+(_obData.goalWeight||'')+'" oninput="_obData.goalWeight=this.value" style="font-size:18px"></div>' +
      '<div class="field-wrap"><label class="field-label">Body Fat % <span style="color:rgba(255,255,255,0.4);font-weight:400">(optional)</span></label>' +
      '<input class="field" type="number" placeholder="15" min="3" max="50" value="'+(_obData.targetBodyFat||'')+'" oninput="_obData.targetBodyFat=this.value" style="font-size:18px"></div>' +
      '</div>' +
      '</div>' + _footer(5) + '</div>';
  },
  6() {
    const coaches = [
      {v:'maya',e:'🧪',n:'Maya',role:'Sports Scientist',d:'Evidence-based, analytical'},
      {v:'alex',e:'🔥',n:'Alex',role:'Drill Sergeant',d:'Intense, no excuses'},
      {v:'sam',e:'⚡',n:'Sam',role:'Motivator',d:'Energetic, encouraging'},
      {v:'zen',e:'🧘',n:'Zen',role:'Mindful Coach',d:'Calm, technique-focused'},
      {v:'rex',e:'💪',n:'Rex',role:'Powerlifter',d:'Strength-focused, raw'}
    ];
    return '<div class="ob-screen">' + _dots(6) +
      '<div class="ob-title">Choose your coach</div>' +
      '<div class="ob-sub">Shapes motivation and daily guidance. Change anytime in Settings.</div>' +
      '<div class="ob-body">' +
      coaches.map(function(c) { return _opt('personality', c.v, c.e, c.n + ' · ' + c.role, c.d); }).join('') +
      '</div>' + _footer(6) + '</div>';
  },
  7() {
    const u = _obData;
    const name = (u.name || 'Athlete').trim();
    const coaches = { alex:'Alex', maya:'Maya', sam:'Sam', zen:'Zen', rex:'Rex' };
    const goals = { hypertrophy:'Build Muscle', fat_loss:'Lose Fat', weight_gain:'Gain Weight', general_health:'Get Healthier', recomp:'Recomposition', athletic:'Athletic', strength:'Strength', endurance:'Cardio', mobility:'Mobility', maintenance:'Maintain' };
    const cName = coaches[u.personality||'maya'] || 'Maya';
    const cEmoji = { alex:'🔥', maya:'🧪', sam:'⚡', zen:'🧘', rex:'💪' }[u.personality||'maya'] || '🧪';
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
      '<div style="font-size:64px;margin-bottom:16px">📋</div>' +
      '<div style="font-size:28px;font-weight:900;color:#fff;letter-spacing:-1px">Your Plan</div>' +
      '<div style="font-size:15px;color:rgba(255,255,255,0.65);margin-top:8px">Ready, '+esc(name)+' — here\'s your starting point.</div>' +
      '</div>' +
      '<div class="card card-solid" style="margin:0 0 14px">' +
      _summaryRow('🎯','Goal', goals[u.goal||'hypertrophy'] || '—') +
      _summaryRow('📅','Split', plan ? plan.split + ' (' + (draftUser.weeklyGoal || rec.daysPerWeek) + 'd/wk)' : rec.name) +
      _summaryRow('🔥','Calories', plan ? plan.calorieTarget + ' kcal/day' : '—') +
      _summaryRow('🥩','Protein', plan ? plan.protein + ' g/day' : '—') +
      _summaryRow('💡','Why', plan ? plan.splitReason : rec.reason) +
      _summaryRow('⚡','Coach', cName) +
      '</div>' +
      '<div class="ob-body">' +
      '<div class="ai-msg"><div class="ai-msg-header"><span>'+cEmoji+'</span><span class="ai-msg-label">'+cName+' says</span></div>' +
      '<div class="ai-msg-text">Set up your equipment and injuries anytime in Settings. I\'ll adapt every workout to what you actually have access to.</div></div>' +
      '</div>' +
      _footer(7) + '</div>';
  }
};

function _summaryRow(icon, label, val) {
  return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">' +
    '<div style="display:flex;align-items:center;gap:10px;color:var(--txt3);font-size:13px">'+icon+' <span>'+esc(label)+'</span></div>' +
    '<div style="font-size:14px;font-weight:600;color:var(--txt)">'+esc(val)+'</div>' +
    '</div>';
}

reg('onboarding', function() {
  return OB_STEPS[_obStep] ? OB_STEPS[_obStep]() : OB_STEPS[1]();
});
