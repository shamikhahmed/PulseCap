'use strict';
/* Ember onboarding — one intro + 4 steps (<90s) + educational disclaimer. */

let _introSlide = 0;
const INTRO_SLIDES = [
  {
    mark: true,
    title: 'PulseCap',
    sub: 'Run today’s session. Log in two taps. See honest progress — vs last time, on this device.',
    bullets: [
      'Offline gym logging. No account, no cloud, no ads.',
      'Miss a day and the rotation waits — it does not skip you.',
      'Smart Coach is rules on your phone, not an AI doctor.'
    ]
  }
];

function _renderIntro(idx) {
  const slide = INTRO_SLIDES[Math.min(idx, INTRO_SLIDES.length - 1)];
  return '<div class="ob-screen" style="min-height:100dvh;display:flex;flex-direction:column;padding:calc(16px + var(--top-safe)) 24px calc(24px + var(--safe))">' +
    '<div style="display:flex;justify-content:flex-end"><button type="button" class="btn btn-ghost btn-sm" onclick="introQuickStart()">Skip</button></div>' +
    '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;text-align:center">' +
    '<div style="width:88px;height:88px;border-radius:24px;margin:0 auto 24px;background:var(--grad);display:flex;align-items:center;justify-content:center">' +
    '<svg width="48" height="48" viewBox="0 0 512 512" fill="none" aria-hidden="true"><path d="M96 256 H176 L208 208 L256 304 L304 176 L352 256 H416" stroke="#fff" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/><circle cx="256" cy="256" r="18" fill="#fff"/></svg>' +
    '</div>' +
    '<div class="ob-title" style="font-size:28px">' + esc(slide.title) + '</div>' +
    '<div class="ob-sub" style="max-width:320px;margin:8px auto 24px">' + esc(slide.sub) + '</div>' +
    '<div style="text-align:left;max-width:340px;margin:0 auto">' +
    slide.bullets.map(function(b) {
      return '<div class="card" style="margin-bottom:8px;padding:12px 14px;font-size:14px;color:var(--txt)">' + esc(b) + '</div>';
    }).join('') +
    '</div></div>' +
    '<button type="button" class="btn btn-primary" style="width:100%;max-width:320px;margin:0 auto" onclick="go(\'onboarding\')">Get started</button>' +
    '</div>';
}

window.introQuickStart = function() {
  _obData = { name: 'Athlete', goal: 'hypertrophy', split: 'ppl', weeklyGoal: 4, daysPerWeek: 4, equipmentKit: 'full_gym', gender: 'unspecified', disclaimerAck: true };
  window._obData = _obData;
  _finishOnboarding();
};

window._introNext = function() {
  _introSlide++;
  if (_introSlide >= INTRO_SLIDES.length) { go('onboarding'); return; }
  go('intro');
};

let _obData = {};
let _obStep = 1;
const OB_TOTAL = 4;
window._obData = _obData;

window.__pcOnboardingState = function(o) {
  o = o || {};
  if (typeof o.step === 'number') _obStep = Math.min(Math.max(o.step, 1), OB_TOTAL);
  if (typeof o.intro === 'number') _introSlide = Math.min(Math.max(o.intro, 0), INTRO_SLIDES.length - 1);
  if (o.data) Object.assign(_obData, o.data);
  return { step: _obStep, intro: _introSlide, total: OB_TOTAL };
};

window.obSelect = function(field, val) {
  _obData[field] = val;
  document.querySelectorAll('[data-field="' + field + '"]').forEach(function(el) { el.classList.remove('sel'); });
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
  if (typeof haptic === 'function') haptic(30);
  if (!_validateStep(_obStep)) return;
  if (_obStep < OB_TOTAL) { _obStep++; go('onboarding'); }
  else _finishOnboarding();
};

function _validateStep(step) {
  if (step === 1 && !(_obData.name && String(_obData.name).trim())) {
    const inp = document.getElementById('ob-name-inp');
    if (inp) { inp.style.borderColor = 'var(--danger)'; inp.focus(); }
    toast('Enter your name to continue', 'warn');
    return false;
  }
  if (step === 2) {
    const age = Number(_obData.age);
    if (_obData.age && (!Number.isFinite(age) || age < 14 || age > 100)) {
      toast('Enter an age from 14 to 100', 'warn');
      return false;
    }
    const imperial = _obData.units === 'imperial';
    const height = Number(_obData.height);
    const weight = Number(_obData.weight);
    if (height) {
      const validHeight = imperial ? height >= 36 && height <= 96 : height >= 90 && height <= 245;
      if (!validHeight) { toast('Check height before continuing', 'warn'); return false; }
    }
    if (weight) {
      const validWeight = imperial ? weight >= 55 && weight <= 1100 : weight >= 25 && weight <= 500;
      if (!validWeight) { toast('Check weight before continuing', 'warn'); return false; }
    }
  }
  if (step === 3 && !_obData.disclaimerAck) {
    toast('Tick the educational disclaimer to continue', 'warn');
    return false;
  }
  return true;
}

function _finishOnboarding() {
  const u = S.g('user') || {};
  const selectedUnits = _obData.units || 'metric';
  const unitContext = { units: selectedUnits };
  const rawHeight = parseFloat(_obData.height);
  const rawWeight = parseFloat(_obData.weight);
  const days = parseInt(_obData.daysPerWeek, 10) || parseInt(_obData.weeklyGoal, 10) || 4;
  const kit = _obData.equipmentKit || 'full_gym';
  const limitations = (_obData.limitations || []).map(function(id) {
    return { id: id, joint: id === 'low_back' ? 'spine' : id, note: id === 'shoulder' ? 'Prefer machines/cables. Stop on sharp pain.' : 'Train around this — stop on sharp pain.' };
  });
  const gender = _obData.gender || 'unspecified';
  Object.assign(u, {
    name: (_obData.name || 'Athlete').trim(),
    goal: _obData.goal || 'hypertrophy',
    exp: _obData.exp || 'intermediate',
    gender: gender,
    sex: gender,
    age: parseInt(_obData.age, 10) || 25,
    units: selectedUnits,
    height: rawHeight > 0 ? heightToCm(rawHeight, unitContext) : 175,
    weight: rawWeight > 0 ? weightToKg(rawWeight, unitContext) : 75,
    split: (typeof SplitsDB !== 'undefined' ? SplitsDB.recommend({ goal: _obData.goal, exp: _obData.exp, weeklyGoal: days }).id : 'ppl'),
    weeklyGoal: days,
    daysPerWeek: days,
    equipmentKit: kit,
    equipment: (typeof Equipment !== 'undefined' && Equipment.tagsForKit) ? Equipment.tagsForKit(kit) : [],
    equipmentIds: [],
    equipmentConfigured: true,
    macrosPinned: false,
    gymDays: [],
    injuries: _obData.limitations || [],
    limitations: limitations,
    coachPersonality: _obData.personality || 'maya',
    joinDate: today(),
    disclaimerAck: true
  });
  delete u.goalWeight;
  if (typeof NutritionMath !== 'undefined' && NutritionMath.applyToUser) NutritionMath.applyToUser(u);
  S.set('user', u);
  S.set('onboarded', true);
  const match = (typeof PlanCatalog !== 'undefined' && PlanCatalog.match) ? PlanCatalog.match(u) : null;
  const seedId = _obData.seedPlanId || (match && match.id) || null;
  if (_obData.seedPlan && seedId && typeof TrainingPlanEngine !== 'undefined' && !TrainingPlanEngine.hasActive()) {
    try {
      TrainingPlanEngine.installTemplate(seedId, { acknowledgedSafety: true });
    } catch (e) { /* template optional */ }
  }
  if (typeof SplitsDB !== 'undefined') {
    S.set('settings.suggestedSplit', SplitsDB.recommend(u));
  }
  toast('Welcome, ' + u.name + '. Today’s session is ready.', 'ok', 3500);
  go('dashboard');
}
window._finishOnboarding = _finishOnboarding;

function _dots(step) {
  let h = '<div class="ob-progress-wrap" aria-label="Step ' + step + ' of ' + OB_TOTAL + '">';
  for (let i = 1; i <= OB_TOTAL; i++) h += '<div class="ob-dot' + (i === step ? ' on' : '') + '"></div>';
  return h + '</div>';
}

function _footer(step) {
  return '<div class="ob-footer">' +
    '<button type="button" class="btn btn-primary" onclick="obContinue()">' +
    (step < OB_TOTAL ? 'Continue' : 'Start training') +
    '</button>' +
    (step > 1 ? '<button type="button" class="btn btn-ghost" onclick="obBack()">Back</button>' : '') +
    '</div>';
}

function _opt(field, val, title, sub) {
  const isOn = _obData[field] === val;
  return '<button type="button" class="ob-opt' + (isOn ? ' sel' : '') + '" data-field="' + field + '" data-val="' + val + '" onclick="obSelect(\'' + field + '\',\'' + val + '\')">' +
    '<div class="ob-opt-info"><div class="ob-opt-title">' + esc(title) + '</div>' +
    (sub ? '<div class="ob-opt-sub">' + esc(sub) + '</div>' : '') + '</div>' +
    '<div class="ob-opt-check">' + (isOn ? '✓' : '') + '</div></button>';
}

const OB_JOINTS = [
  { id: 'shoulder', title: 'Shoulder', sub: 'Machines/cables first. Stop on sharp pain.' },
  { id: 'knee', title: 'Knee', sub: 'Control depth. No grinding through pain.' },
  { id: 'low_back', title: 'Low back', sub: 'Brace. Skip max-effort spinal loading.' },
  { id: 'wrist', title: 'Wrist', sub: 'Neutral wrists. Skip loaded extension if it bites.' },
  { id: 'elbow', title: 'Elbow', sub: 'Ease off lockout and skull-crushers if it niggles.' },
  { id: 'hip', title: 'Hip', sub: 'Control depth. Stop on pinch or catch.' },
  { id: 'neck', title: 'Neck', sub: 'No craning. Skip loaded shrugs if it radiates.' },
  { id: 'ankle', title: 'Ankle', sub: 'Limit loaded dorsiflexion if it pinches.' }
];

const OB_STEPS = {
  1: function() {
    return '<div class="ob-screen">' + _dots(1) +
      '<div class="ob-title">What should we call you?</div>' +
      '<div class="ob-sub">Then pick one goal. You can change this in Me.</div>' +
      '<div class="ob-body">' +
      '<div class="field-wrap"><label class="field-label" for="ob-name-inp">Name</label>' +
      '<input id="ob-name-inp" class="field" type="text" placeholder="Your name" value="' + esc(_obData.name || '') + '" oninput="_obData.name=this.value" autocomplete="name" autofocus></div>' +
      _opt('goal', 'hypertrophy', 'Build muscle', 'Log progressive sets') +
      _opt('goal', 'fat_loss', 'Lose fat', 'Keep protein and sessions honest') +
      _opt('goal', 'strength', 'Get stronger', 'Same lifts, better logs') +
      _opt('goal', 'weight_gain', 'Gain weight', 'A real surplus, not a guess') +
      _opt('goal', 'general_health', 'Stay consistent', 'Show up more than you skip') +
      '<div class="field-label" style="margin-top:16px">Sex — used only for the calorie formula</div>' +
      _opt('gender', 'female', 'Female', 'Mifflin-St Jeor female formula') +
      _opt('gender', 'male', 'Male', 'Mifflin-St Jeor male formula') +
      _opt('gender', 'unspecified', 'Prefer not to say', 'Average of both formulas — labelled as an estimate') +
      '</div>' + _footer(1) + '</div>';
  },
  2: function() {
    const units = _obData.units || 'metric';
    const u = units === 'imperial';
    const days = String(_obData.daysPerWeek || _obData.weeklyGoal || '');
    return '<div class="ob-screen">' + _dots(2) +
      '<div class="ob-title">Gym and starting size</div>' +
      '<div class="ob-sub">Experience, days you can train, and what you have. Skip any size field you do not know.</div>' +
      '<div class="ob-body">' +
      _opt('exp', 'beginner', 'Beginner', 'Under 1 year consistent') +
      _opt('exp', 'intermediate', 'Intermediate', '1–3 years') +
      _opt('exp', 'advanced', 'Advanced', '3+ years structured') +
      '<div class="field-label" style="margin-top:12px">Days per week</div>' +
      '<div class="segmented" style="margin-bottom:12px">' +
      [2, 3, 4, 5, 6].map(function(d) {
        const on = days === String(d);
        return '<button type="button" class="' + (on ? 'on' : '') + '" data-field="daysPerWeek" data-val="' + d + '" onclick="obSelect(\'daysPerWeek\',\'' + d + '\');go(\'onboarding\')">'+ d + '</button>';
      }).join('') +
      '</div>' +
      '<div class="field-label">Equipment</div>' +
      _opt('equipmentKit', 'full_gym', 'Full gym', 'Barbell, dumbbells, machines, cables') +
      _opt('equipmentKit', 'machines_cables', 'Machines + cables', 'No free barbell work') +
      _opt('equipmentKit', 'dumbbells', 'Dumbbells only', 'DB + bands') +
      _opt('equipmentKit', 'home_minimal', 'Home minimal', 'Bodyweight and bands') +
      '<div class="field-row" style="margin-top:12px">' +
      '<div class="field-wrap"><label class="field-label">Age</label>' +
      '<input class="field" type="number" min="14" max="100" inputmode="numeric" placeholder="25" value="' + esc(_obData.age || '') + '" oninput="_obData.age=this.value"></div>' +
      '<div class="field-wrap"><label class="field-label">Units</label>' +
      '<div class="segmented">' +
      '<button type="button" class="' + (units === 'metric' ? 'on' : '') + '" data-field="units" data-val="metric" onclick="obSelect(\'units\',\'metric\');go(\'onboarding\')">kg/cm</button>' +
      '<button type="button" class="' + (units === 'imperial' ? 'on' : '') + '" data-field="units" data-val="imperial" onclick="obSelect(\'units\',\'imperial\');go(\'onboarding\')">lb/in</button>' +
      '</div></div></div>' +
      '<div class="field-row">' +
      '<div class="field-wrap"><label class="field-label">' + (u ? 'Height (in)' : 'Height (cm)') + '</label>' +
      '<input class="field" type="number" inputmode="decimal" placeholder="' + (u ? '70' : '175') + '" value="' + esc(_obData.height || '') + '" oninput="_obData.height=this.value"></div>' +
      '<div class="field-wrap"><label class="field-label">' + (u ? 'Weight (lb)' : 'Weight (kg)') + '</label>' +
      '<input class="field" type="number" inputmode="decimal" placeholder="' + (u ? '165' : '75') + '" value="' + esc(_obData.weight || '') + '" oninput="_obData.weight=this.value"></div>' +
      '</div>' +
      '</div>' + _footer(2) + '</div>';
  },
  3: function() {
    const ack = !!_obData.disclaimerAck;
    return '<div class="ob-screen">' + _dots(3) +
      '<div class="ob-title">Limitations</div>' +
      '<div class="ob-sub">Optional. Used to caution lifts — this is not a diagnosis.</div>' +
      '<div class="ob-body">' +
      OB_JOINTS.map(function(j) {
        const on = (_obData.limitations || []).indexOf(j.id) >= 0;
        return '<button type="button" class="ob-opt' + (on ? ' sel' : '') + '" data-field="limitations" data-val="' + j.id + '" onclick="obToggle(\'limitations\',\'' + j.id + '\')"><div class="ob-opt-info"><div class="ob-opt-title">' + esc(j.title) + '</div><div class="ob-opt-sub">' + esc(j.sub) + '</div></div></button>';
      }).join('') +
      '<div class="banner banner--caution" style="margin-top:16px">PulseCap is educational training software. It is not medical advice or clearance. Stop on sharp pain, clunk, or instability and see a clinician.</div>' +
      '<label class="card" style="display:flex;gap:12px;align-items:flex-start;margin-top:12px;min-height:44px">' +
      '<input id="ob-ack" type="checkbox" style="width:22px;height:22px;margin-top:2px"' + (ack ? ' checked' : '') + ' onchange="_obData.disclaimerAck=this.checked">' +
      '<span class="body-13">I understand this is educational, not medical clearance.</span></label>' +
      '</div>' + _footer(3) + '</div>';
  },
  4: function() {
    const name = (_obData.name || 'Athlete').trim();
    const goals = { hypertrophy: 'Build muscle', fat_loss: 'Lose fat', strength: 'Get stronger', weight_gain: 'Gain weight', general_health: 'Stay consistent' };
    const preview = {
      goal: _obData.goal || 'hypertrophy',
      exp: _obData.exp || 'intermediate',
      daysPerWeek: Number(_obData.daysPerWeek || _obData.weeklyGoal) || 4,
      equipmentKit: _obData.equipmentKit || 'full_gym',
      limitations: (_obData.limitations || []).map(function(id) { return { id: id, joint: id }; })
    };
    const match = (typeof PlanCatalog !== 'undefined' && PlanCatalog.match) ? PlanCatalog.match(preview) : null;
    const seedOn = !!_obData.seedPlan;
    const title = (match && match.plan && match.plan.title) || 'Machine-only PPL';
    const suits = (match && match.plan && (match.plan.suits || match.plan.notes)) || 'Shoulder-safe public template. Optional.';
    if (match && match.id) _obData.seedPlanId = match.id;
    return '<div class="ob-screen">' + _dots(4) +
      '<div class="ob-title">You\'re set, ' + esc(name) + '</div>' +
      '<div class="ob-sub">Goal: ' + esc(goals[_obData.goal || 'hypertrophy'] || 'Train') + '. Install a matched template now or pick one later in Programs.</div>' +
      '<div class="ob-body">' +
      '<button type="button" class="ob-opt' + (seedOn ? ' sel' : '') + '" onclick="_obData.seedPlan=!_obData.seedPlan;go(\'onboarding\')">' +
      '<div class="ob-opt-info"><div class="ob-opt-title">' + esc(title) + '</div><div class="ob-opt-sub">' + esc(suits) + '</div></div>' +
      '<div class="ob-opt-check">' + (seedOn ? '✓' : '') + '</div></button>' +
      '<div class="banner" style="margin-top:12px">Today will show one session and one insight. First time on a lift, Log will walk a light → 8 reps calibration. Logging stays on this phone.</div>' +
      '</div>' + _footer(4) + '</div>';
  }
};

reg('onboarding', function(data) {
  if (data && data.showIntro) return _renderIntro(_introSlide);
  return OB_STEPS[_obStep] ? OB_STEPS[_obStep]() : OB_STEPS[1]();
});

window.migrateCoachIntroMerge = function() {
  if (S.g('settings.migrations.coachIntroMerge') === 1) return false;
  S.set('settings.migrations.coachIntroMerge', 1);
  return true;
};
