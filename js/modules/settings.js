'use strict';
/* ── PulseCap — Settings (mature IA groups) ── */

let _activeSettingsTab = 'account';

/** Old tab ids → canonical (deep links / tests / bookmarks). */
const SETTINGS_TAB_ALIASES = {
  profile: 'account',
  supplements: 'fuel',
  nutrition: 'fuel',
  data: 'privacy',
  style: 'appearance',
  alerts: 'notifications',
  access: 'accessibility'
};
function resolveSettingsTab(tab) {
  const raw = tab || 'account';
  return SETTINGS_TAB_ALIASES[raw] || raw;
}
window.resolveSettingsTab = resolveSettingsTab;

reg('settings', function(opts) {
  const _settingsTab = resolveSettingsTab(opts && opts.tab);
  _activeSettingsTab = _settingsTab;
  const user = S.g('user') || {};

  const tabContent = {
    account: _tabAccount(user),
    training: _tabTraining(user),
    fuel: _tabFuel(user),
    appearance: _tabAppearance(user),
    accessibility: _tabAccessibility(user),
    notifications: _tabNotifications(user),
    privacy: _tabPrivacy(),
    about: _tabAbout()
  };

  const tabList = ['account','training','fuel','appearance','accessibility','notifications','privacy','about'];
  const labels = {
    account: 'Account',
    training: 'Training',
    fuel: 'Fuel',
    appearance: 'Appearance',
    accessibility: 'Access',
    notifications: 'Alerts',
    privacy: 'Privacy',
    about: 'About'
  };

  const tabBar = '<div class="cap-tab-bar" role="tablist" aria-label="Settings">' +
    tabList.map(function(t) {
      const active = _settingsTab === t;
      return '<button type="button" class="cap-tab' + (active ? ' on' : '') + '" role="tab" aria-selected="' + active + '" aria-controls="settings-panel" id="settings-tab-' + t + '" onclick="go(\'settings\',{tab:\''+t+'\'})">' +
        (labels[t]||t) + '</button>';
    }).join('') + '</div>';

  return '<div class="topbar"><div class="topbar-title">Settings</div></div>' +
    tabBar +
    '<div id="settings-panel" role="tabpanel" aria-labelledby="settings-tab-' + _settingsTab + '">' +
    (tabContent[_settingsTab] || _tabAccount(user)) +
    '</div>' +
    '<div class="spacer-bottom"></div>';
});

function _tabAccount(u) {
  const imperial = (u.units || 'metric') === 'imperial';
  const hLabel = imperial ? 'Height (in)' : 'Height (cm)';
  const wLabel = imperial ? 'Weight (lb)' : 'Weight (kg)';
  const gwLabel = imperial ? 'Goal Weight (lb)' : 'Goal Weight (kg)';
  const wtUnit = imperial ? 'lb' : 'kg';
  const bmi = BodyEngine.bmi(u.weight||75, u.height||175);
  const tdee = BodyEngine.tdee(u);
  const bmr = BodyEngine.bmr(u);
  const healthyRange = BodyEngine.healthyWeightRange(u.height||175, u.gender||'male');
  const heightValue = heightFromCm(u.height || 175, u);
  const weightValue = weightFromKg(u.weight || 75, u);
  const goalWeightValue = weightFromKg(u.goalWeight || 70, u);
  const healthyMin = weightFromKg(healthyRange.min, u);
  const healthyMax = weightFromKg(healthyRange.max, u);

  return '<div class="pad-16">' +
    _sectionTitle('Identity') +
    _fieldWrap('Name', '<input class="field" type="text" name="name" autocomplete="name" value="'+esc(u.name||'')+'" oninput="_setSetting(\'user.name\',this.value)" placeholder="Your name">') +
    '<div class="field-row">' +
    _fieldWrap('Age', '<input class="field" type="number" inputmode="numeric" value="'+(u.age||25)+'" oninput="_setSetting(\'user.age\',parseInt(this.value))" min="14" max="80">') +
    _fieldWrap('Gender', '<div class="select-wrap"><select class="field" aria-label="Gender" onchange="_setSetting(\'user.gender\',this.value)"><option value="male"'+(u.gender==='male'?' selected':'')+'>Male</option><option value="female"'+(u.gender==='female'?' selected':'')+'>Female</option></select></div>') +
    '</div>' +
    '<div class="field-row">' +
    _fieldWrap(hLabel, '<input class="field" type="number" inputmode="decimal" value="'+heightValue+'" min="'+(imperial?36:90)+'" max="'+(imperial?96:245)+'" step="0.1" oninput="_setCanonicalBodySetting(\'user.height\',this.value,\'height\')">') +
    _fieldWrap(wLabel, '<input class="field" type="number" inputmode="decimal" value="'+weightValue+'" min="'+(imperial?55:25)+'" max="'+(imperial?1100:500)+'" step="0.1" oninput="_setCanonicalBodySetting(\'user.weight\',this.value,\'weight\')">') +
    '</div>' +
    '<div class="field-row">' +
    _fieldWrap(gwLabel, '<input class="field" type="number" inputmode="decimal" value="'+goalWeightValue+'" min="'+(imperial?55:25)+'" max="'+(imperial?1100:500)+'" step="0.1" oninput="_setCanonicalBodySetting(\'user.goalWeight\',this.value,\'weight\')">') +
    _fieldWrap('Body Fat %', '<input class="field" type="number" inputmode="decimal" value="'+(u.targetBodyFat||15)+'" oninput="_setSetting(\'user.targetBodyFat\',parseFloat(this.value))">') +
    '</div>' +

    _sectionTitle('Goal') +
    _selectWrap('Primary Goal', 'user.goal', u.goal||'hypertrophy', [
      {v:'hypertrophy',l:'Build Muscle'},{v:'fat_loss',l:'Lose Fat'},{v:'weight_gain',l:'Gain Weight'},
      {v:'general_health',l:'Get Healthier'},{v:'recomp',l:'Recomposition'},{v:'strength',l:'Strength'},
      {v:'athletic',l:'Athletic'},{v:'endurance',l:'Cardio & Endurance'},{v:'mobility',l:'Mobility'},
      {v:'maintenance',l:'Maintain'}
    ]) +
    _selectWrap('Experience', 'user.exp', u.exp||'intermediate', [
      {v:'beginner',l:'Beginner'},{v:'intermediate',l:'Intermediate'},{v:'advanced',l:'Advanced'},{v:'athlete',l:'Athlete'}
    ]) +
    _selectWrap('Activity Level', 'user.activityLevel', u.activityLevel||'moderate', [
      {v:'sedentary',l:'Sedentary'},{v:'light',l:'Light Active'},{v:'moderate',l:'Moderately Active'},{v:'active',l:'Very Active'},{v:'veryActive',l:'Extremely Active'}
    ]) +

    _sectionTitle('Your Plan') +
    (function() {
      const plan = typeof PlanEngine !== 'undefined' ? PlanEngine.build(u) : null;
      if (!plan) return '';
      return '<div class="card card-solid mb-14" style="border-color:rgba(var(--c1-rgb),0.22)">' +
        '<div class="settings-section-title" style="margin-top:0">Plan snapshot</div>' +
        '<div style="font-size:14px;font-weight:700;color:var(--txt);margin-bottom:6px">' + esc(plan.split) + '</div>' +
        '<div style="font-size:12px;color:var(--txt3);line-height:1.5;margin-bottom:10px">' + esc(plan.readinessNote) + '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
        _infoStat('Calories', plan.calorieTarget + '', 'kcal/day') +
        _infoStat('Protein', plan.protein + '', 'g/day') +
        _infoStat('Readiness', plan.readiness + '', '/100') +
        '</div>' +
        '</div>';
    })() +

    _sectionTitle('Calculated Metrics') +
    '<div class="card card-solid mt-8">' +
    '<div style="display:flex;flex-wrap:wrap;gap:12px">' +
    _infoStat('BMI', bmi.bmi+'', bmi.cat) +
    _infoStat('BMR', bmr+' kcal', 'At rest') +
    _infoStat('TDEE', tdee+' kcal', 'Total daily') +
    _infoStat('Healthy wt', healthyMin+'–'+healthyMax+wtUnit, 'For your height') +
    '</div>' +
    '<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">' +
    '<button type="button" class="btn btn-secondary btn-sm" onclick="showLogWeight()" style="display:inline-flex;align-items:center;gap:6px">' + icon('scale', 14) + ' Log Weight Today</button>' +
    '</div></div>' +

    _sectionTitle('Injuries & Pain') +
    '<div class="mb-14">' +
    (function() {
      const injuries = (S.g('user.injuries') || []).filter(function(i){ return i && typeof i === 'object'; });
      const active = injuries.filter(function(i){ return !i.recovered; });
      const assess = typeof InjuriesDB !== 'undefined' ? InjuriesDB.assessActive() : { messages: [], shouldRest: false };
      let html = '';
      if (assess.shouldRest) html += '<div role="status" style="background:rgba(var(--c1-rgb),0.1);border:1px solid rgba(var(--c1-rgb),0.22);border-radius:12px;padding:12px;margin-bottom:12px;font-size:13px;color:var(--c1);font-weight:600">Consider a rest day — severe injury flagged</div>';
      html += active.length
        ? '<div style="font-size:13px;color:var(--txt2);margin-bottom:10px;line-height:1.5">' + active.length + ' active ' + (active.length === 1 ? 'injury' : 'injuries') + ': ' + esc(active.map(function(i){ return i.bodyPart || i.id; }).join(', ')) + '</div>'
        : '<div style="font-size:13px;color:var(--txt3);margin-bottom:10px">No active injuries — workouts unrestricted.</div>';
      html += '<button type="button" class="btn btn-secondary btn-sm w-full" onclick="go(\'rehab\')" style="display:inline-flex;align-items:center;justify-content:center;gap:6px">' + icon('bandage', 14) + ' Manage injuries in Rehab</button>';
      return html;
    })() +
    '</div>' +
    '</div>';
}

function _tabTraining(u) {
  const rec = typeof SplitsDB !== 'undefined' ? SplitsDB.recommend(u) : null;
  const splitOpts = (typeof SplitsDB !== 'undefined' ? SplitsDB.splits : [
    {id:'ppl',name:'Push Pull Legs',days:6},{id:'ul',name:'Upper Lower',days:4},{id:'fb',name:'Full Body',days:3}
  ]).map(s => ({ v: s.id, l: s.name + (s.days ? ' ('+s.days+'d)' : '') }));

  const eqCount = (S.g('user.equipmentIds') || []).length;
  const eqLabel = S.g('user.equipmentConfigured') ? eqCount + ' items configured' : 'Not set up yet — tap to configure';

  return '<div class="pad-16">' +
    (rec ? '<div class="card card-solid mb-14" style="border-color:rgba(var(--c1-rgb),0.22)">' +
      '<div class="settings-section-title" style="margin-top:0">Recommended for you</div>' +
      '<div class="row-title-15">'+esc(rec.name)+'</div>' +
      '<div style="font-size:12px;color:var(--txt3);margin-top:4px;line-height:1.45">'+esc(rec.reason)+'</div>' +
      '<button type="button" class="btn btn-secondary btn-sm" style="margin-top:10px" onclick="_setSetting(\'user.split\',\''+rec.id+'\');toast(\'Split updated\',\'ok\');go(\'settings\',{tab:\'training\'})">Apply suggestion</button></div>' : '') +

    _sectionTitle('Training Split') +
    _selectWrap('Active Split', 'user.split', u.split||'ppl', splitOpts) +

    '<button type="button" class="btn btn-primary btn-sm" style="width:100%;margin-bottom:10px;min-height:44px" onclick="go(\'my-plan\')">Programs — templates, PDF import, gym floor</button>' +

    (u.split === 'custom' || (S.g('user.customSplit') || []).length ?
      '<button type="button" class="btn btn-secondary btn-sm" style="width:100%;margin-bottom:14px" onclick="go(\'split-builder\')">Edit your custom split →</button>' :
      '<button type="button" class="btn btn-secondary btn-sm" style="width:100%;margin-bottom:14px" onclick="go(\'split-builder\')">Build your own split →</button>') +

    _sectionTitle('Today\'s Session') +
    (typeof renderSplitDayPicker === 'function' ? renderSplitDayPicker() : '') +

    _sectionTitle('Gym Days') +
    '<div style="font-size:12px;color:var(--txt3);margin-bottom:10px;line-height:1.45">Pick the days you usually train. Other days show as optional rest — you can still choose any workout.</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">' +
    [{id:'mon',l:'Mon'},{id:'tue',l:'Tue'},{id:'wed',l:'Wed'},{id:'thu',l:'Thu'},{id:'fri',l:'Fri'},{id:'sat',l:'Sat'},{id:'sun',l:'Sun'}].map(function(d) {
      const on = (u.gymDays || []).includes(d.id);
      return '<button type="button" onclick="toggleGymDay(\''+d.id+'\')" aria-pressed="'+(on?'true':'false')+'" style="min-width:44px;min-height:44px;padding:10px 12px;border-radius:12px;border:1.5px solid '+(on?'var(--c1)':'var(--border)')+';background:'+(on?'rgba(var(--c1-rgb),0.12)':'var(--bg3)')+';color:'+(on?'var(--c1)':'var(--txt3)')+';font-size:13px;font-weight:700;cursor:pointer;touch-action:manipulation">'+d.l+'</button>';
    }).join('') +
    '</div>' +

    _sectionTitle('Weekly Schedule') +
    _renderWeekSchedule(u) +

    _sectionTitle('My Equipment') +
    '<button type="button" class="btn btn-primary" onclick="go(\'equipment-setup\')" style="width:100%;margin-bottom:8px;display:inline-flex;align-items:center;justify-content:center;gap:8px">' + icon('dumbbell', 16) + ' Configure Equipment</button>' +
    '<div style="font-size:12px;color:var(--txt3);text-align:center;margin-bottom:14px">'+esc(eqLabel)+' — Life Fitness, Technogym, home, bodyweight & more</div>' +

    _sectionTitle('Limitations') +
    '<div style="font-size:12px;color:var(--txt3);margin-bottom:10px;line-height:1.45">Optional cautions for Today, Log, and Programs. Educational — not a diagnosis.</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px">' +
    [{id:'shoulder',l:'Shoulder'},{id:'knee',l:'Knee'},{id:'low_back',l:'Low back'}].map(function(d) {
      const on = _hasLimitation(u, d.id);
      return '<button type="button" onclick="toggleLimitation(\''+d.id+'\')" aria-pressed="'+(on?'true':'false')+'" style="min-height:44px;padding:10px 14px;border-radius:12px;border:1.5px solid '+(on?'var(--c1)':'var(--border)')+';background:'+(on?'rgba(var(--c1-rgb),0.12)':'var(--bg3)')+';color:'+(on?'var(--c1)':'var(--txt3)')+';font-size:13px;font-weight:700;cursor:pointer;touch-action:manipulation">'+d.l+'</button>';
    }).join('') +
    '</div>' +

    _sectionTitle('Rest Timer') +
    _fieldWrap('Default Rest (seconds)', '<input class="field" type="number" value="'+(u.restSecs||120)+'" min="30" max="600" step="15" oninput="_setSetting(\'user.restSecs\',parseInt(this.value))">') +

    _sectionTitle('Toggles') +
    _toggle('Auto Progression', 'user.autoProgression', u.autoProgression!==false) +
    _toggle('Show Warmup Protocol', 'user.warmupEnabled', u.warmupEnabled!==false) +
    _toggle('Cardio Recommendations', 'user.cardioEnabled', u.cardioEnabled!==false) +
    _toggle('Deload Reminders', 'user.deloadReminder', u.deloadReminder!==false) +
    _toggle('Gym Floor Mode', 'user.gymFloorMode', !!u.gymFloorMode) +
    '<div style="font-size:12px;color:var(--txt3);margin:-6px 0 10px;padding:0 2px">Bigger tap targets + keep-awake friendly logger chrome.</div>' +
    _toggle('Beginner Mode', 'user.beginnerMode', !!u.beginnerMode) +
    '<div style="font-size:12px;color:var(--txt3);margin:-6px 0 14px;padding:0 2px">Simplifies Today. Soft cues for first-year lifters.</div>' +
    _sectionTitle('Manual vitals (optional)') +
    _fieldWrap('Resting HR (bpm)', '<input class="field" type="number" value="'+(u.restingHr||'')+'" min="35" max="120" placeholder="e.g. 58" oninput="_setSetting(\'user.restingHr\',parseInt(this.value)||null)">') +
    _fieldWrap('HRV (ms, morning)', '<input class="field" type="number" value="'+(u.hrvMs||'')+'" min="10" max="200" placeholder="e.g. 55" oninput="_setSetting(\'user.hrvMs\',parseInt(this.value)||null)">') +
    '<div style="font-size:12px;color:var(--txt3);margin:-6px 0 14px;padding:0 2px">No HealthKit — type values from your watch if you want readiness bias.</div>' +
    '</div>';
}

function _renderWeekSchedule(u) {
  const gymDays = u.gymDays || [];
  if (!gymDays.length) {
    return '<div style="font-size:12px;color:var(--txt3);margin-bottom:14px;line-height:1.45">Pick your gym days above first — then each weekday gets a split day automatically, and you can change any of them here.</div>';
  }
  const map = SplitEngine.weekdayAssignments() || {};
  const splitDays = SplitEngine.listSplitDays();
  const labels = { mon:'Monday', tue:'Tuesday', wed:'Wednesday', thu:'Thursday', fri:'Friday', sat:'Saturday', sun:'Sunday' };
  const order = ['mon','tue','wed','thu','fri','sat','sun'];
  const todayId = SplitEngine.todayWeekdayId();
  let html = '<div style="font-size:12px;color:var(--txt3);margin-bottom:10px;line-height:1.45">Which workout lands on which day. Today\'s pick on the dashboard overrides this for one day only.</div>';
  html += order.map(function(d) {
    const isGym = gymDays.includes(d);
    const isToday = d === todayId;
    const rowStyle = 'display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 12px;border-radius:12px;margin-bottom:6px;border:1px solid ' + (isToday ? 'var(--c1)' : 'var(--border)') + ';background:var(--bg3)';
    if (!isGym) {
      return '<div style="' + rowStyle + ';opacity:0.55">' +
        '<div style="font-size:13px;font-weight:700;color:var(--txt3)">' + labels[d] + (isToday ? ' · today' : '') + '</div>' +
        '<div class="muted-12">Rest</div></div>';
    }
    const sel = '<select class="field" style="width:auto;min-width:150px;padding:8px 10px;font-size:13px" onchange="setDayAssignment(\'' + d + '\', parseInt(this.value))">' +
      splitDays.map(function(sd, i) {
        const num = i + 1;
        return '<option value="' + num + '"' + (map[d] === num ? ' selected' : '') + '>' + esc(sd.n || ('Day ' + num)) + '</option>';
      }).join('') + '</select>';
    return '<div style="' + rowStyle + '">' +
      '<div  class="row-title">' + labels[d] + (isToday ? ' · today' : '') + '</div>' + sel + '</div>';
  }).join('');
  html += '<button type="button" class="btn btn-secondary btn-sm" style="width:100%;margin:4px 0 14px" onclick="resetDayAssignments()">↺ Reset to automatic order</button>';
  return html;
}

window.setDayAssignment = function(weekday, dayNum) {
  const map = Object.assign({}, SplitEngine.weekdayAssignments() || {});
  map[weekday] = dayNum;
  S.set('user.dayAssignments', map);
  toast('Schedule updated', 'ok');
  go('settings', { tab: 'training' });
};

window.resetDayAssignments = function() {
  S.set('user.dayAssignments', null);
  S.set('user.splitDayOverride', null);
  toast('Schedule reset to automatic', 'ok');
  go('settings', { tab: 'training' });
};

function _tabFuel(u) {
  const tdee = BodyEngine.tdee(u);
  const userSupps = S.g('supplements') || [];
  return '<div class="pad-16">' +
    _sectionTitle('Daily Targets') +
    _fieldWrap('Calories (kcal)', '<input class="field" type="number" inputmode="numeric" value="'+(u.calorieTarget||2200)+'" oninput="_setSetting(\'user.calorieTarget\',parseInt(this.value))">') +
    '<div class="field-row">' +
    _fieldWrap('Protein (g)', '<input class="field" type="number" inputmode="numeric" value="'+(u.proteinTarget||165)+'" oninput="_setSetting(\'user.proteinTarget\',parseInt(this.value))">') +
    _fieldWrap('Carbs (g)', '<input class="field" type="number" inputmode="numeric" value="'+(u.carbTarget||220)+'" oninput="_setSetting(\'user.carbTarget\',parseInt(this.value))">') +
    '</div>' +
    '<div class="field-row">' +
    _fieldWrap('Fat (g)', '<input class="field" type="number" inputmode="numeric" value="'+(u.fatTarget||70)+'" oninput="_setSetting(\'user.fatTarget\',parseInt(this.value))">') +
    _fieldWrap('Water (glasses)', '<input class="field" type="number" inputmode="numeric" value="'+(u.waterTarget||8)+'" min="4" max="20" oninput="_setSetting(\'user.waterTarget\',parseInt(this.value))">') +
    '</div>' +
    _sectionTitle('Macro Presets') +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:4px">' +
    [['hypertrophy','Muscle'],['fat_loss','Fat loss'],['strength','Strength'],['maintenance','Maintain'],['athletic','Athletic']].map(g =>
      '<button type="button" class="btn btn-secondary btn-sm" onclick="applyMacroPreset(\''+g[0]+'\')" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:11px 8px;min-height:44px">'+g[1]+'</button>'
    ).join('') + '</div>' +
    '<div style="padding:12px 0;font-size:13px;color:var(--txt3)">Calculated TDEE: '+tdee+' kcal/day</div>' +

    _sectionTitle('Supplement Stack') +
    (userSupps.length ? userSupps.map(s =>
      '<div class="toggle-row">' +
      '<div class="toggle-info"><div class="toggle-label">'+esc(s.name)+'</div>' +
      '<div class="toggle-sub">'+esc(s.timing)+' · '+esc(s.dose||'')+'</div></div>' +
      '<button type="button" onclick="removeSupp('+jsArg(s.id)+')" style="color:var(--c1);background:none;border:none;cursor:pointer;padding:8px;font-size:13px;font-weight:600;min-height:44px">Remove</button>' +
      '</div>'
    ).join('') : '<div style="color:var(--txt3);padding:12px 0;font-size:14px">No supplements in stack.</div>') +
    '<button type="button" class="btn btn-secondary btn-sm w-full" onclick="go(\'nutrition\')">Open Nutrition log</button>' +
    '</div>';
}

function _tabAppearance(u) {
  const coaches = [
    {id:'alex',e:'flame',n:'Alex — Drill Sergeant'},
    {id:'maya',e:'chart',n:'Maya — Sports Scientist'},
    {id:'sam',e:'sparkles',n:'Sam — The Motivator'},
    {id:'zen',e:'leaf',n:'Zen — Mindful Coach'},
    {id:'rex',e:'dumbbell',n:'Rex — The Powerlifter'}
  ];
  const pinned = u.theme || u.mode;
  const cur = pinned ? (pinned === 'light' ? 'light' : 'dark') : 'auto';
  const curCoach = u.coachPersonality || 'maya';

  const seg = function(id, ic, label, onclick) {
    const on = cur === id;
    return '<button type="button" onclick="' + onclick + '" aria-pressed="' + on + '" ' +
      'style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 6px;min-height:48px;border-radius:12px;cursor:pointer;touch-action:manipulation;' +
      'border:1.5px solid ' + (on ? 'var(--c1)' : 'var(--border)') + ';' +
      'background:' + (on ? 'rgba(var(--c1-rgb),0.10)' : 'var(--bg3)') + ';color:' + (on ? 'var(--c1)' : 'var(--txt2)') + '">' +
      '<span style="display:inline-flex">' + icon(ic, 20) + '</span>' +
      '<span style="font-size:12px;font-weight:700">' + label + '</span>' +
      '</button>';
  };

  return '<div class="pad-16">' +
    _sectionTitle('Theme') +
    '<div style="display:flex;gap:8px;margin-bottom:8px" role="group" aria-label="Theme">' +
    seg('auto', 'refresh', 'Auto', 'clearThemePref();go(\'settings\',{tab:\'appearance\'})') +
    seg('dark', 'moon', 'Dark', 'applyTheme(\'dark\');go(\'settings\',{tab:\'appearance\'})') +
    seg('light', 'sun', 'Light', 'applyTheme(\'light\');go(\'settings\',{tab:\'appearance\'})') +
    '</div>' +
    '<div style="font-size:12px;color:var(--txt3);margin:0 0 16px">' + (cur==='auto' ? 'Follows your phone\'s setting.' : 'Pinned — ignores your phone\'s setting.') + '</div>' +

    _sectionTitle('Coach Personality') +
    coaches.map(c =>
      '<button type="button" onclick="_setSetting(\'user.coachPersonality\',\''+c.id+'\');go(\'settings\',{tab:\'appearance\'})" ' +
      'aria-pressed="'+(curCoach===c.id)+'" ' +
      'style="display:flex;width:100%;align-items:center;gap:12px;padding:12px 14px;border-radius:14px;margin-bottom:8px;cursor:pointer;touch-action:manipulation;text-align:left;' +
      'background:var(--bg3);border:1.5px solid ' + (curCoach===c.id ? 'var(--c1)' : 'var(--border)') + ';color:inherit">' +
      '<div style="width:38px;height:38px;border-radius:50%;background:var(--bg4);display:flex;align-items:center;justify-content:center;color:var(--c1);flex-shrink:0">'+icon(c.e,18)+'</div>' +
      '<div style="flex:1;font-size:14px;font-weight:600;color:var(--txt)">'+esc(c.n)+'</div>' +
      '<div aria-hidden="true" style="width:20px;height:20px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;' +
      'border:2px solid ' + (curCoach===c.id ? 'var(--c1)' : 'var(--border2)') + ';background:' + (curCoach===c.id ? 'var(--c1)' : 'transparent') + '">' +
      (curCoach===c.id ? '<span style="color:#fff;font-size:11px;font-weight:800">✓</span>' : '') +
      '</div></button>'
    ).join('') +

    _sectionTitle('Coach Tone') +
    (function() {
      const curTone = S.g('settings.coachTone') || 'motivational';
      const tones = [{v:'motivational',ic:'flame',l:'Motivational'},{v:'scientific',ic:'chart',l:'Scientific'},{v:'hardcore',ic:'dumbbell',l:'Hardcore'}];
      const examples = {
        motivational:'"You\'re crushing it — shoulders are 92% recovered!"',
        scientific:'"Deltoid recovery index: 92%. Optimal training window active."',
        hardcore:'"Shoulders are ready. No excuses. Get in there."'
      };
      return '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:8px" role="group" aria-label="Coach tone">' +
        tones.map(t => {
          const on = curTone === t.v;
          return '<button type="button" onclick="_setSetting(\'settings.coachTone\',\''+t.v+'\');go(\'settings\',{tab:\'appearance\'})" aria-pressed="'+on+'" ' +
            'style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:11px 4px;min-height:48px;border-radius:12px;cursor:pointer;touch-action:manipulation;color:'+(on?'var(--c1)':'var(--txt2)')+';' +
            'border:1.5px solid '+(on?'var(--c1)':'var(--border)')+';background:'+(on?'rgba(var(--c1-rgb),0.10)':'var(--bg3)')+'">' +
            '<span style="display:inline-flex">'+icon(t.ic,18)+'</span>' +
            '<span style="font-size:11px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%">'+t.l+'</span>' +
            '</button>';
        }).join('') +
        '</div>' +
        '<div style="font-size:13px;color:var(--txt3);font-style:italic;padding:10px 12px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;margin-bottom:4px">'+esc(examples[curTone]||examples.motivational)+'</div>';
    })() +
    '</div>';
}

function _tabAccessibility(u) {
  const units = u.units || 'metric';
  return '<div class="pad-16">' +
    _sectionTitle('Units') +
    '<div style="display:flex;gap:8px;margin-bottom:14px" role="group" aria-label="Measurement units">' +
    ['metric','imperial'].map(unit =>
      '<button type="button" class="btn btn-'+(units===unit?'primary':'secondary')+' btn-sm flex-1" style="min-height:44px" aria-pressed="'+(units===unit)+'" onclick="_setSetting(\'user.units\',\''+unit+'\');go(\'settings\',{tab:\'accessibility\'})">'+unit.charAt(0).toUpperCase()+unit.slice(1)+'</button>'
    ).join('') + '</div>' +
    '<div style="font-size:12px;color:var(--txt3);margin:-6px 0 16px;line-height:1.45">Affects weight, height, and plate displays. Stored values stay metric internally.</div>' +

    _sectionTitle('Motion & performance') +
    _toggle('Low Power Mode', 'settings.lowPower', S.g('settings.lowPower') === true) +
    '<div style="font-size:12px;color:var(--txt3);margin:-6px 0 14px;padding:0 2px">Disables animated background for smoother scrolling on older phones.</div>' +
    '<div class="card card-solid mb-14">' +
    '<div style="font-size:13px;color:var(--txt2);line-height:1.55">System <strong class="c-txt">Reduce Motion</strong> is honored automatically (OS setting). Screen transitions and background motion quiet down when it is on.</div>' +
    '</div>' +

    _sectionTitle('Touch & focus') +
    '<div style="font-size:13px;color:var(--txt2);line-height:1.55;margin-bottom:10px">Gym Floor Mode (larger targets) lives under Training. Beginner Mode simplifies Today and Learn — also under Training.</div>' +
    '<button type="button" class="btn btn-secondary w-full" style="min-height:44px" onclick="go(\'settings\',{tab:\'training\'})">Open Training toggles</button>' +
    '</div>';
}

function _tabNotifications(u) {
  return '<div class="pad-16">' +
    _sectionTitle('Alerts') +
    _toggle('Supplement Reminders', 'user.suppReminders', u.suppReminders!==false) +
    _toggle('Rest Day Reminders', 'user.restDayReminders', u.restDayReminders!==false) +
    _toggle('Streak Alerts', 'user.streakAlerts', u.streakAlerts!==false) +
    _toggle('Caffeine Warning', 'user.caffeineWarning', u.caffeineWarning!==false) +
    _toggle('Daily Morning Briefing', 'settings.dailyBriefing', S.g('settings.dailyBriefing') !== false) +
    _sectionTitle('Rest timer') +
    '<div style="font-size:13px;color:var(--txt2);margin-bottom:10px;line-height:1.45">Background rest banners need PulseCap <strong>installed to Home Screen</strong> (iOS 16.4+). Enable here once — never mid-workout.</div>' +
    '<button type="button" class="btn btn-secondary" onclick="_enableRestNotify()" style="width:100%;margin-bottom:14px;min-height:44px">Enable rest notifications</button>' +
    _sectionTitle('Coach Update Frequency') +
    '<div style="display:flex;gap:8px;margin-bottom:4px" role="group" aria-label="Coach update frequency">' +
    ['daily','weekly'].map(function(freq) {
      const cur = S.g('settings.coachFrequency') || 'daily';
      const active = cur === freq;
      return '<button type="button" onclick="_setSetting(\'settings.coachFrequency\',\''+freq+'\');go(\'settings\',{tab:\'notifications\'})" aria-pressed="'+active+'" style="flex:1;padding:10px;min-height:44px;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:'+(active?'var(--grad)':'var(--bg3)')+';color:'+(active?'#fff':'var(--txt3)')+'">'+freq.charAt(0).toUpperCase()+freq.slice(1)+'</button>';
    }).join('') +
    '</div>' +
    '<div style="font-size:12px;color:var(--txt3);margin-top:4px;padding:0 2px">Daily shows briefing every morning. Weekly shows full review on Mondays.</div>' +
    '</div>';
}

function _tabPrivacy() {
  const ws = S.g('workouts') || [];
  const joinDate = S.g('user.joinDate');
  return '<div class="pad-16">' +
    _sectionTitle('On this device') +
    '<div class="card card-solid mb-14">' +
    '<div style="display:flex;flex-wrap:wrap;gap:12px">' +
    _infoStat('Workouts', String(ws.length), 'logged') +
    _infoStat('Member since', joinDate ? new Date(joinDate).toLocaleDateString('en-GB',{month:'short',year:'numeric'}) : '—', '') +
    '</div>' +
    '<div style="font-size:12px;color:var(--txt3);margin-top:12px;line-height:1.5">All training data stays in this browser profile. No cloud account.</div>' +
    '</div>' +

    _sectionTitle('Profiles') +
    '<button type="button" class="btn btn-secondary mb-10" style="min-height:44px" onclick="go(\'profiles\')">Manage Profiles</button>' +

    _sectionTitle('Exercise Library') +
    (function() {
      const st = typeof ExerciseLibrary !== 'undefined' ? ExerciseLibrary.status() : { cached: false, count: 0 };
      const exCount = typeof ExDB !== 'undefined' ? ExDB.db.length : 0;
      return '<div class="card card-solid mb-14">' +
        '<div style="font-size:13px;color:var(--txt2);line-height:1.55;margin-bottom:12px">' +
        'Built-in: <strong class="c-txt">' + exCount + '</strong> exercises. ' +
        (st.cached ? 'wger metadata cache: <strong class="c-txt">' + st.count + '</strong>' + (st.mediaCount ? ' · ' + st.mediaCount + ' remote media links' : '') + '. Images and videos still need network access unless your browser has cached them.' : 'Optional sync from wger.de while online. Exercise metadata is cached on this device; remote images and videos are not guaranteed offline. Built-in FormLoops cues always work offline.') +
        '</div>' +
        '<button type="button" id="ex-lib-sync-btn" class="btn btn-secondary w-full" style="min-height:44px" onclick="syncExerciseLibrary(' + (st.cached ? 'true' : 'false') + ')">' +
        (st.cached ? 'Re-sync wger library' : 'Sync wger library') +
        '</button>' +
        (st.cached && st.fetchedAt ? '<div class="muted-11" style="margin-top:8px">Last sync: ' + esc(new Date(st.fetchedAt).toLocaleString()) + '</div>' : '') +
        '</div>';
    })() +

    _sectionTitle('Export & Import') +
    '<button type="button" class="btn btn-secondary mb-10" style="min-height:44px" onclick="go(\'my-plan\')">Import workout plan (PDF / JSON)</button>' +
    '<button type="button" class="btn btn-secondary mb-10" style="min-height:44px" onclick="exportData()">Export Backup (JSON)</button>' +
    '<div class="field-wrap">' +
    '<label class="field-label">Import Backup</label>' +
    '<input class="field" type="file" accept=".json" onchange="importData(this)" style="font-size:14px">' +
    '</div>' +

    _sectionTitle('Danger Zone') +
    '<button type="button" class="btn btn-danger mb-10" style="min-height:44px" onclick="confirmClearData()">Reset this profile</button>' +
    '<button type="button" class="btn btn-danger" style="min-height:44px" onclick="confirmClearData()">Clear all data</button>' +
    '</div>';
}

function _tabAbout() {
  const ver = esc(window.APP_VERSION || '6.4.0');
  return '<div class="pad-16">' +
    _sectionTitle('PulseCap') +
    '<div class="card card-solid mb-14">' +
    '<div style="font-size:18px;font-weight:800;color:var(--txt);margin-bottom:4px">v' + ver + '</div>' +
    '<div style="font-size:13px;color:var(--txt2);line-height:1.55">Offline-first Smart Coach fitness OS. Rule-based coaching — not cloud AI.</div>' +
    '</div>' +

    _sectionTitle('Navigation') +
    '<div class="card card-solid mb-14">' +
    '<div style="font-size:13px;color:var(--txt);line-height:1.55;font-weight:600;margin-bottom:6px">Today · Train · Progress · Programs · Me</div>' +
    '<div style="font-size:12px;color:var(--txt3);line-height:1.45">Fixed tabs. Nested screens light the parent tab.</div>' +
    '</div>' +

    _sectionTitle('Legal') +
    '<button type="button" class="btn btn-secondary mb-10" style="min-height:44px" onclick="window.open(\'privacy.html\',\'_blank\')">Privacy</button>' +
    '<button type="button" class="btn btn-secondary mb-10" style="min-height:44px" onclick="window.open(\'LICENSE\',\'_blank\')">License</button>' +
    '<div style="margin-top:24px;text-align:center;color:var(--txt3);font-size:13px">PulseCap v' + ver + ' · by <strong>Shamikh Ahmed</strong></div>' +
    '</div>';
}

/* ── Helpers ── */
function _sectionTitle(t) {
  return '<div class="settings-section-title">'+esc(t)+'</div>';
}
function _fieldWrap(label, inputHTML) {
  return '<div class="field-wrap"><label class="field-label">'+esc(label)+'</label>'+inputHTML+'</div>';
}
function _selectWrap(label, key, current, opts) {
  return _fieldWrap(label,
    '<div class="select-wrap"><select class="field" onchange="_setSetting(\''+key+'\',this.value)">' +
    opts.map(o=>'<option value="'+o.v+'"'+(current===o.v?' selected':'')+'>'+esc(o.l)+'</option>').join('') +
    '</select></div>'
  );
}
function _toggle(label, key, current) {
  return '<div class="toggle-row">' +
    '<div class="toggle-info"><div class="toggle-label">'+esc(label)+'</div></div>' +
    '<button type="button" class="toggle'+(current?' on':'')+'" role="switch" aria-checked="'+(current?'true':'false')+'" aria-label="'+esc(label)+'" onclick="toggleSetting(\''+key+'\')"></button>' +
    '</div>';
}
function _infoStat(label, val, sub) {
  return '<div style="flex:1;min-width:80px">' +
    '<div style="font-size:18px;font-weight:800;color:var(--c1)">'+esc(val)+'</div>' +
    '<div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--txt3)">'+esc(label)+'</div>' +
    (sub?'<div  class="muted-12">'+esc(sub)+'</div>':'') +
    '</div>';
}

/* ── Actions ── */
window._enableRestNotify = function() {
  if (typeof RestNotify === 'undefined') return;
  RestNotify.ensurePermission().then(function(p) {
    if (p === 'granted') toast('Rest notifications on', 'ok');
    else if (p === 'not-installed') toast('Add PulseCap to Home Screen first (Share → Add to Home Screen)', 'warn', 5000);
    else if (p === 'unsupported') toast('Notifications not supported in this browser', 'warn');
    else toast('Permission ' + (p || 'denied'), 'warn');
  });
};
window._setSetting = function(key, val) {
  S.set(key, val);
  if (key === 'user.split') {
    /* New split — old weekday map points at day numbers that no longer match */
    S.set('user.dayAssignments', null);
    S.set('user.splitDayOverride', null);
  }
  if (key === 'user.coachPersonality') {
    S.setGlobalCoach(val);
  }
  if (key === 'settings.lowPower' && window._fitnessCanvas) {
    if (val) window._fitnessCanvas.stop();
    else window._fitnessCanvas.start();
    const c = document.getElementById('bg-canvas');
    if (c) c.style.display = val ? 'none' : '';
  }
};
window._setCanonicalBodySetting = function(key, raw, kind) {
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return;
  const user = S.g('user') || {};
  S.set(key, kind === 'height' ? heightToCm(value, user) : weightToKg(value, user));
};

function _hasLimitation(u, id) {
  const list = (u && u.limitations) || S.g('user.limitations') || [];
  return list.some(function(l) {
    const key = typeof l === 'string' ? l : (l && (l.id || l.joint));
    return String(key || '').toLowerCase() === id;
  });
}

window.toggleLimitation = function(id) {
  const list = (S.g('user.limitations') || []).slice();
  const idx = list.findIndex(function(l) {
    const key = typeof l === 'string' ? l : (l && (l.id || l.joint));
    return String(key || '').toLowerCase() === id;
  });
  if (idx >= 0) list.splice(idx, 1);
  else list.push({ id: id, joint: id, note: 'Stop on sharp pain. Educational caution only.' });
  S.set('user.limitations', list);
  S.set('user.injuries', list.map(function(l) {
    const joint = typeof l === 'string' ? l : (l.joint || l.id);
    return { id: joint, joint: joint, bodyPart: joint, severity: 1, recovered: false };
  }));
  toast('Limitations updated', 'ok');
  go('settings', { tab: 'training' });
};

window.toggleInjuryRecovered = function(idx) {
  const injuries = S.g('user.injuries') || [];
  const inj = injuries[idx];
  if (typeof inj === 'string') {
    injuries[idx] = { id: inj, bodyPart: inj, severity: 1, recovered: true };
  } else {
    injuries[idx] = Object.assign({}, inj, { recovered: !inj.recovered });
  }
  S.set('user.injuries', injuries);
  const curScr = typeof currentScreenId === 'function' && currentScreenId();
  if (curScr === 'settings') go('settings', { tab: 'account' });
  else go(curScr || 'rehab');
};

window.setInjurySeverity = function(idx, severity) {
  const injuries = (S.g('user.injuries') || []).slice();
  const inj = injuries[idx];
  if (!inj) return;
  injuries[idx] = Object.assign({}, typeof inj === 'string' ? { id: inj, bodyPart: inj } : inj, { severity: severity, recovered: false });
  S.set('user.injuries', injuries);
  /* Callable from Rehab or Settings — stay where the user is */
  const cur = typeof currentScreenId === 'function' && currentScreenId();
  if (cur === 'settings') go('settings', { tab: 'account' });
  else go(cur || 'rehab');
};

/* ── Custom split builder ── */
let _sbDays = null;

reg('split-builder', function() {
  if (!_sbDays) {
    const saved = S.g('user.customSplit');
    _sbDays = saved && saved.length ? JSON.parse(JSON.stringify(saved)) : [{ n: 'Day 1', muscles: [], exercises: [] }];
  }
  const days = _sbDays.map(function(d, di) {
    const exRows = (d.exercises || []).map(function(name, ei) {
      const ex = ExDB.byName(name);
      return '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)">' +
        '<div  class="flex-1"><div style="font-size:13px;font-weight:600;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(name) + '</div>' +
        (ex ? '<div  class="muted-11">' + esc(ex.pri || ex.grp || '') + '</div>' : '') + '</div>' +
        '<button type="button" onclick="sbRemove(' + di + ',' + ei + ')" aria-label="Remove" style="background:var(--bg4);border:1px solid var(--border);border-radius:8px;color:var(--txt3);font-size:12px;padding:5px 9px;cursor:pointer;touch-action:manipulation">✕</button></div>';
    }).join('');
    return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px;margin:0 16px 12px">' +
      '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">' +
      '<input class="field" value="' + esc(d.n || '') + '" placeholder="Day name (e.g. Push)" style="flex:1;font-size:14px;font-weight:700;padding:9px 12px" oninput="sbRename(' + di + ', this.value)">' +
      (_sbDays.length > 1 ? '<button type="button" onclick="sbDelDay(' + di + ')" style="background:rgba(255,69,58,0.1);border:1px solid rgba(255,69,58,0.25);border-radius:10px;color:var(--danger);font-size:12px;font-weight:600;padding:9px 12px;cursor:pointer;touch-action:manipulation">Delete</button>' : '') +
      '</div>' +
      exRows +
      ((d.exercises || []).length === 0 ? '<div style="font-size:12px;color:var(--txt3);padding:8px 0">No exercises yet — search below.</div>' : '') +
      '<input class="field" placeholder="Search 300+ exercises…" style="margin-top:10px;font-size:13px;padding:10px 12px" oninput="sbSearch(this, ' + di + ')">' +
      '<div id="sb-sug-' + di + '"></div>' +
      '</div>';
  }).join('');

  return moduleTopbar('Custom Split', 'Your plan, your days', { backScreen: 'settings' }) +
    days +
    '<div style="padding:0 16px 8px;display:flex;gap:8px">' +
    '<button type="button" class="btn btn-secondary flex-1"  onclick="sbAddDay()">+ Add day</button>' +
    '<button type="button" class="btn btn-primary flex-1"  onclick="sbSave()">Save split</button>' +
    '</div>' +
    '<div style="font-size:12px;color:var(--txt3);text-align:center;padding:0 24px 20px">Saving makes this your active split. It plugs into the weekly schedule, injuries, and equipment filtering like any other.</div>';
});

window.sbAddDay = function() { _sbDays.push({ n: 'Day ' + (_sbDays.length + 1), muscles: [], exercises: [] }); go('split-builder'); };
window.sbDelDay = function(i) { _sbDays.splice(i, 1); go('split-builder'); };
window.sbRename = function(i, v) { if (_sbDays[i]) _sbDays[i].n = v; };
window.sbRemove = function(i, ei) { _sbDays[i].exercises.splice(ei, 1); go('split-builder'); };
window.sbSearch = function(inp, di) {
  const box = document.getElementById('sb-sug-' + di);
  if (!box) return;
  const q = (inp.value || '').trim();
  if (q.length < 2) { box.innerHTML = ''; return; }
  const hits = ExDB.search(q).slice(0, 6);
  box.innerHTML = hits.map(function(e) {
    return '<div onclick="sbAdd(' + di + ',' + jsArg(e.n) + ')" style="display:flex;justify-content:space-between;align-items:center;padding:9px 12px;border-radius:10px;background:var(--bg4);border:1px solid var(--border);margin-top:6px;cursor:pointer;touch-action:manipulation">' +
      '<div  class="row-title">' + esc(e.n) + '</div>' +
      '<div style="font-size:11px;color:var(--c1);font-weight:700">+ Add</div></div>';
  }).join('') || '<div style="font-size:12px;color:var(--txt3);padding:8px 4px">Nothing matches.</div>';
};
window.sbAdd = function(di, name) {
  if (_sbDays[di].exercises.indexOf(name) === -1) _sbDays[di].exercises.push(name);
  go('split-builder');
};
window.sbSave = function() {
  const days = _sbDays.filter(function(d) { return (d.exercises || []).length; });
  if (!days.length) { toast('Add at least one exercise first', 'warn'); return; }
  days.forEach(function(d) {
    if (!d.n || !d.n.trim()) d.n = 'Training Day';
    const prim = {};
    d.exercises.forEach(function(n) {
      const ex = ExDB.byName(n);
      ((ex && ex.muscles && ex.muscles.primary) || []).forEach(function(m) { prim[m] = 1; });
    });
    d.muscles = Object.keys(prim);
    d.warmup = d.warmup || ['5 min light cardio', 'Joint circles head to toe', '2 warm-up sets on your first lift'];
  });
  S.set('user.customSplit', days);
  S.set('user.split', 'custom');
  S.set('user.dayAssignments', null);
  S.set('user.splitDayOverride', null);
  _sbDays = null;
  toast('Custom split saved — it\'s live', 'ok');
  go('settings', { tab: 'training' });
};

/* Injury logging moved to Rehab (js/modules/rehab.js) — single source of truth. */

window.toggleSetting = function(key) {
  const cur = S.g(key);
  S.set(key, !cur);
  if (key === 'user.gymFloorMode' && typeof GymFloor !== 'undefined') {
    GymFloor.apply();
    if (!cur && typeof WakeLock !== 'undefined') WakeLock.request();
    if (cur && typeof WakeLock !== 'undefined') WakeLock.release();
  }
  go('settings', { tab: _activeSettingsTab });
};

window.removeSupp = function(id) {
  const supps = (S.g('supplements')||[]).filter(s=>s.id!==id);
  S.set('supplements', supps);
  go('settings', { tab: 'fuel' });
};

window.applyMacroPreset = function(goal) {
  const tdee = BodyEngine.tdee(S.g('user')||{});
  const macros = TDEEEngine.macroSplit(goal, tdee);
  S.set('user.calorieTarget', tdee);
  S.set('user.proteinTarget', macros.protein);
  S.set('user.carbTarget', macros.carbs);
  S.set('user.fatTarget', macros.fat);
  toast('Macro preset applied for '+goal.replace('_',' '), 'ok');
  go('settings', { tab: 'fuel' });
};

/* showLogWeight / saveWeight live in bodymap.js — settings.js loads later,
   so redefining them here would clobber the unit- and fasted-aware versions. */

window.exportData = function() {
  const data = JSON.stringify(S.d, null, 2);
  const blob = new Blob([data], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'PulseCap-backup-'+today()+'.json';
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
  toast('Backup exported!', 'ok');
};

function _validateBackupValue(value, depth, state) {
  if (depth > 12 || state.nodes++ > 50000) throw new Error('Backup is too complex');
  if (value == null || typeof value === 'boolean') return;
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || Math.abs(value) > 1e12) throw new Error('Backup contains invalid numbers');
    return;
  }
  if (typeof value === 'string') {
    if (value.length > 20000) throw new Error('Backup contains oversized text');
    return;
  }
  if (Array.isArray(value)) {
    if (value.length > 20000) throw new Error('Backup contains oversized lists');
    value.forEach(function(item) { _validateBackupValue(item, depth + 1, state); });
    return;
  }
  if (typeof value !== 'object' || Object.getPrototypeOf(value) !== Object.prototype) throw new Error('Backup contains unsupported data');
  Object.keys(value).forEach(function(key) {
    if (key === '__proto__' || key === 'prototype' || key === 'constructor' || key.length > 100) throw new Error('Backup contains unsafe keys');
    _validateBackupValue(value[key], depth + 1, state);
  });
}
function _validateBackup(data) {
  if (!data || Array.isArray(data) || typeof data !== 'object') throw new Error('Backup root must be an object');
  if (Number(data._schemaVersion) > S.SCHEMA_VERSION) throw new Error('Backup comes from a newer PulseCap version');
  _validateBackupValue(data, 0, { nodes: 0 });
  if (data.user != null && (Array.isArray(data.user) || typeof data.user !== 'object')) throw new Error('Invalid user profile');
  ['workouts','prs','bodyStats','meals','customExercises'].forEach(function(key) {
    if (data[key] != null && !Array.isArray(data[key])) throw new Error('Invalid ' + key + ' data');
  });
  if (data.trainingPlan != null) {
    if (typeof data.trainingPlan !== 'object' || Array.isArray(data.trainingPlan)) throw new Error('Invalid training plan');
    if (typeof validateTrainingPlan === 'function') validateTrainingPlan(data.trainingPlan);
  }
  (data.customExercises || []).forEach(function(ex) {
    if (!ex || typeof ex !== 'object' || typeof ex.n !== 'string' || !ex.n.trim() || ex.n.length > 80) {
      throw new Error('Invalid custom exercise');
    }
  });
  return data;
}
window._validateBackup = _validateBackup;

window.importData = function(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    toast('Backup is too large. Maximum size is 2 MB.', 'err');
    input.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = _validateBackup(JSON.parse(e.target.result));
      window._pendingPulseImport = data;
      modal('Replace this profile?',
        '<div class="body-13">Validated backup contains ' + ((data.workouts || []).length) + ' workouts and ' + ((data.bodyStats || []).length) + ' body entries. Current profile data will be replaced. Progress photos are not included.</div>',
        '<button type="button" class="btn btn-danger mt-14" onclick="applyImportedData()">Replace profile</button>' +
        '<button type="button" class="btn btn-secondary mt-8" onclick="closeModal()">Cancel</button>');
    } catch(err) {
      toast(err && err.message ? err.message : 'Invalid backup file', 'err', 5000);
    }
    input.value = '';
  };
  reader.onerror = function() { toast('Could not read backup file', 'err'); };
  reader.readAsText(file);
};
window.applyImportedData = function() {
  const data = window._pendingPulseImport;
  if (!data) return;
  const previous = S.d;
  try {
    localStorage.setItem(S._key + '_' + S.activeId() + '_pre_import_' + Date.now(), JSON.stringify(previous));
  } catch (e) {
    toast('Not enough storage to create rollback copy. Import cancelled.', 'err', 6000);
    return;
  }
  S.d = data;
  S._migrate();
  if (S.save() === false) {
    S.d = previous;
    S.save();
    toast('Import failed; previous profile restored', 'err', 6000);
    return;
  }
  window._pendingPulseImport = null;
  toast('Backup imported', 'ok');
  location.reload();
};

window.confirmClearData = function() {
  modal('Reset Profile?',
    '<div style="text-align:center;padding:16px 0">' +
    '<div style="font-size:16px;font-weight:700;color:var(--txt);margin-bottom:8px">This will delete all your data</div>' +
    '<div style="font-size:14px;color:var(--txt3);line-height:1.6">Workouts, PRs, measurements, supplements and settings for this profile will be permanently deleted. This cannot be undone.</div>' +
    '</div>',
    '<button type="button" class="btn btn-danger mt-8" onclick="S.reset()">Yes, Reset Everything</button>' +
    '<button type="button" class="btn btn-secondary mt-8" onclick="closeModal()">Cancel</button>'
  );
};
