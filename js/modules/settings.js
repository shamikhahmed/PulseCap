'use strict';
/* ── PulseCap v4 — Settings (7 sub-tabs) ── */

let _activeSettingsTab = 'profile';

reg('settings', function(opts) {
  const _settingsTab = (opts && opts.tab) ? opts.tab : 'profile';
  _activeSettingsTab = _settingsTab;
  const user = S.g('user') || {};

  const tabContent = {
    profile: _tabProfile(user),
    training: _tabTraining(user),
    supplements: _tabSupplements(),
    nutrition: _tabNutrition(user),
    appearance: _tabAppearance(user),
    notifications: _tabNotifications(user),
    data: _tabData()
  };

  const tabList = ['profile','training','supplements','nutrition','appearance','notifications','data'];

  const tabBar = '<div style="display:flex;overflow-x:auto;gap:8px;padding:12px 16px 4px;-webkit-overflow-scrolling:touch;scrollbar-width:none">' +
    tabList.map(function(t) {
      const active = _settingsTab === t;
      const labels = {profile:'👤 Profile',training:'🏋️ Training',supplements:'💊 Supps',nutrition:'🥗 Nutrition',appearance:'🎨 Style',notifications:'🔔 Alerts',data:'💾 Data'};
      return '<button onclick="go(\'settings\',{tab:\''+t+'\'})" style="flex-shrink:0;padding:8px 16px;border-radius:20px;font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation;white-space:nowrap;border:1px solid '+(active?'var(--c1)':'var(--border)')+';background:'+(active?'var(--c1)':'transparent')+';color:'+(active?'#fff':'var(--txt3)')+'">'+
        (labels[t]||t) + '</button>';
    }).join('') + '</div>';

  return '<div class="topbar"><div class="topbar-title">Settings</div></div>' +
    tabBar +
    (tabContent[_settingsTab] || _tabProfile(user)) +
    '<div style="height:20px"></div>';
});

function _tabProfile(u) {
  const bmi = BodyEngine.bmi(u.weight||75, u.height||175);
  const tdee = BodyEngine.tdee(u);
  const bmr = BodyEngine.bmr(u);
  const healthyRange = BodyEngine.healthyWeightRange(u.height||175, u.gender||'male');

  return '<div style="padding:16px">' +
    _sectionTitle('Personal Info') +
    _fieldWrap('Name', '<input class="field" type="text" value="'+esc(u.name||'')+'" oninput="_setSetting(\'user.name\',this.value)" placeholder="Your name">') +
    '<div class="field-row">' +
    _fieldWrap('Age', '<input class="field" type="number" value="'+(u.age||25)+'" oninput="_setSetting(\'user.age\',parseInt(this.value))" min="14" max="80">') +
    _fieldWrap('Gender', '<div class="select-wrap"><select class="field" onchange="_setSetting(\'user.gender\',this.value)"><option value="male"'+(u.gender==='male'?' selected':'')+'>Male</option><option value="female"'+(u.gender==='female'?' selected':'')+'>Female</option></select></div>') +
    '</div>' +
    '<div class="field-row">' +
    _fieldWrap('Height (cm)', '<input class="field" type="number" value="'+(u.height||175)+'" oninput="_setSetting(\'user.height\',parseFloat(this.value))">') +
    _fieldWrap('Weight (kg)', '<input class="field" type="number" value="'+(u.weight||75)+'" step="0.1" oninput="_setSetting(\'user.weight\',parseFloat(this.value))">') +
    '</div>' +
    '<div class="field-row">' +
    _fieldWrap('Goal Weight (kg)', '<input class="field" type="number" value="'+(u.goalWeight||70)+'" step="0.1" oninput="_setSetting(\'user.goalWeight\',parseFloat(this.value))">') +
    _fieldWrap('Body Fat %', '<input class="field" type="number" value="'+(u.targetBodyFat||15)+'" oninput="_setSetting(\'user.targetBodyFat\',parseFloat(this.value))">') +
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
      return '<div style="background:linear-gradient(135deg,rgba(0,213,255,0.08),rgba(123,95,255,0.06));border:1px solid rgba(0,213,255,0.15);border-radius:14px;padding:14px;margin-bottom:16px">' +
        '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--c1);margin-bottom:8px">📋 Plan Snapshot</div>' +
        '<div style="font-size:14px;font-weight:700;color:var(--txt);margin-bottom:6px">' + esc(plan.split) + '</div>' +
        '<div style="font-size:12px;color:var(--txt3);line-height:1.5;margin-bottom:10px">' + esc(plan.readinessNote) + '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
        _infoStat('Calories', plan.calorieTarget + '', 'kcal/day') +
        _infoStat('Protein', plan.protein + '', 'g/day') +
        _infoStat('Readiness', plan.readiness + '', '/100') +
        '</div>' +
        '<button class="btn btn-secondary btn-sm" onclick="go(\'calculators\')" style="width:100%;margin-top:10px">📊 Full Calculators</button>' +
        '</div>';
    })() +

    _sectionTitle('Calculated Metrics') +
    '<div class="card card-solid" style="margin-top:8px">' +
    '<div style="display:flex;flex-wrap:wrap;gap:12px">' +
    _infoStat('BMI', bmi.bmi+'', bmi.cat) +
    _infoStat('BMR', bmr+' kcal', 'At rest') +
    _infoStat('TDEE', tdee+' kcal', 'Total daily') +
    _infoStat('Healthy wt', healthyRange.min+'–'+healthyRange.max+'kg', 'For your height') +
    '</div>' +
    '<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)">' +
    '<button class="btn btn-secondary btn-sm" onclick="showLogWeight()">📊 Log Weight Today</button>' +
    '</div></div>' +

    _sectionTitle('Injuries & Pain') +
    '<div style="margin-bottom:14px">' +
    '<div style="font-size:13px;color:var(--txt2);margin-bottom:10px;line-height:1.5">Add injuries anytime. Severity affects rest suggestions and exercise filtering.</div>' +
    (function() {
      const injuries = S.g('user.injuries') || [];
      const assess = typeof InjuriesDB !== 'undefined' ? InjuriesDB.assessActive() : { messages: [], shouldRest: false };
      let html = '';
      if (assess.shouldRest) html += '<div style="background:rgba(255,69,58,0.1);border:1px solid rgba(255,69,58,0.2);border-radius:12px;padding:12px;margin-bottom:12px;font-size:13px;color:#ff453a">⚠️ Consider a rest day — severe injury flagged</div>';
      if (!injuries.length) html += '<div style="font-size:14px;color:var(--txt3);padding:10px 0">No injuries logged.</div>';
      html += injuries.map(function(inj, i) {
        if (typeof inj === 'string') inj = { id: inj, severity: 1, recovered: false };
        const db = typeof InjuriesDB !== 'undefined' ? InjuriesDB.byId(inj.id || inj.bodyPart) : null;
        const name = db ? db.name : (inj.bodyPart || inj.id || 'Unknown').replace(/_/g,' ');
        const sev = inj.severity || 1;
        const sevLabel = typeof InjuriesDB !== 'undefined' ? (InjuriesDB.severities.find(s=>s.id===sev)||{}).label : 'Mild';
        const recovered = inj.recovered;
        return '<div style="padding:12px 0;border-bottom:1px solid var(--border)">' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
          '<div><div style="font-size:14px;font-weight:600;color:var(--txt)">'+esc(name)+(recovered?' ✓':'')+'</div>' +
          '<div style="font-size:12px;color:var(--txt3)">'+(recovered?'Recovered':sevLabel+' — '+(db?db.modify:''))+'</div></div>' +
          '<button onclick="toggleInjuryRecovered('+i+')" style="padding:6px 12px;border-radius:20px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid var(--border);background:var(--bg4);color:var(--txt3)">'+(recovered?'Re-activate':'Recovered')+'</button></div>' +
          (recovered ? '' : '<div style="display:flex;gap:6px">'+[1,2,3].map(s=>'<button onclick="setInjurySeverity('+i+','+s+')" style="flex:1;padding:6px;border-radius:8px;font-size:11px;font-weight:600;border:1px solid '+(sev===s?'var(--c1)':'var(--border)')+';background:'+(sev===s?'rgba(var(--c1-rgb),0.15)':'transparent')+';color:var(--txt);cursor:pointer">'+(typeof InjuriesDB!=='undefined'?InjuriesDB.severities.find(x=>x.id===s).label:s)+'</button>').join('')+'</div>') +
          '</div>';
      }).join('');
      html += '<button class="btn btn-secondary btn-sm" onclick="showAddInjury()" style="width:100%;margin-top:10px">+ Add Injury</button>';
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

  return '<div style="padding:16px">' +
    (rec ? '<div style="background:linear-gradient(135deg,rgba(0,213,255,0.08),rgba(123,95,255,0.06));border:1px solid rgba(0,213,255,0.15);border-radius:14px;padding:14px;margin-bottom:16px">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--c1);margin-bottom:6px">✨ Recommended for you</div>' +
      '<div style="font-size:15px;font-weight:700;color:var(--txt)">'+esc(rec.name)+'</div>' +
      '<div style="font-size:12px;color:var(--txt3);margin-top:4px;line-height:1.45">'+esc(rec.reason)+'</div>' +
      '<button class="btn btn-secondary btn-sm" style="margin-top:10px" onclick="_setSetting(\'user.split\',\''+rec.id+'\');toast(\'Split updated\',\'ok\');go(\'settings\',{tab:\'training\'})">Apply suggestion</button></div>' : '') +

    _sectionTitle('Training Split') +
    _selectWrap('Active Split', 'user.split', u.split||'ppl', splitOpts) +

    _sectionTitle('My Equipment') +
    '<button class="btn btn-primary" onclick="go(\'equipment-setup\')" style="width:100%;margin-bottom:8px">🏋️ Configure Equipment</button>' +
    '<div style="font-size:12px;color:var(--txt3);text-align:center;margin-bottom:14px">'+esc(eqLabel)+' — Life Fitness, Technogym, home, bodyweight & more</div>' +

    _sectionTitle('Rest Timer') +
    _fieldWrap('Default Rest (seconds)', '<input class="field" type="number" value="'+(u.restSecs||120)+'" min="30" max="600" step="15" oninput="_setSetting(\'user.restSecs\',parseInt(this.value))">') +

    _sectionTitle('Toggles') +
    _toggle('Auto Progression', 'user.autoProgression', u.autoProgression!==false) +
    _toggle('Show Warmup Protocol', 'user.warmupEnabled', u.warmupEnabled!==false) +
    _toggle('Cardio Recommendations', 'user.cardioEnabled', u.cardioEnabled!==false) +
    _toggle('Deload Reminders', 'user.deloadReminder', u.deloadReminder!==false) +
    '</div>';
}

function _tabSupplements() {
  const userSupps = S.g('supplements') || [];
  return '<div style="padding:16px">' +
    _sectionTitle('My Stack') +
    (userSupps.length ? userSupps.map(s =>
      '<div class="toggle-row">' +
      '<div class="toggle-info"><div class="toggle-label">'+esc(s.name)+'</div>' +
      '<div class="toggle-sub">'+esc(s.timing)+' · '+esc(s.dose||'')+'</div></div>' +
      '<button onclick="removeSupp(\''+esc(s.id)+'\')" style="color:#ff4444;background:none;border:none;cursor:pointer;padding:8px;font-size:13px;font-weight:600;min-height:44px">Remove</button>' +
      '</div>'
    ).join('') : '<div style="color:var(--txt3);padding:12px 0;font-size:14px">No supplements in stack. Add them via Nutrition.</div>') +
    '<div class="spacer-sm"></div>' +
    '<button class="btn btn-secondary btn-sm" onclick="go(\'nutrition\')" style="width:100%">Manage in Nutrition →</button>' +
    '</div>';
}

function _tabNutrition(u) {
  const tdee = BodyEngine.tdee(u);
  const macros = TDEEEngine.macroSplit(u.goal||'hypertrophy', tdee);
  return '<div style="padding:16px">' +
    _sectionTitle('Daily Targets') +
    _fieldWrap('Calories (kcal)', '<input class="field" type="number" value="'+(u.calorieTarget||2200)+'" oninput="_setSetting(\'user.calorieTarget\',parseInt(this.value))">') +
    '<div class="field-row">' +
    _fieldWrap('Protein (g)', '<input class="field" type="number" value="'+(u.proteinTarget||165)+'" oninput="_setSetting(\'user.proteinTarget\',parseInt(this.value))">') +
    _fieldWrap('Carbs (g)', '<input class="field" type="number" value="'+(u.carbTarget||220)+'" oninput="_setSetting(\'user.carbTarget\',parseInt(this.value))">') +
    '</div>' +
    '<div class="field-row">' +
    _fieldWrap('Fat (g)', '<input class="field" type="number" value="'+(u.fatTarget||70)+'" oninput="_setSetting(\'user.fatTarget\',parseInt(this.value))">') +
    _fieldWrap('Water (glasses)', '<input class="field" type="number" value="'+(u.waterTarget||8)+'" min="4" max="20" oninput="_setSetting(\'user.waterTarget\',parseInt(this.value))">') +
    '</div>' +
    _sectionTitle('Macro Presets') +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px">' +
    ['hypertrophy','fat_loss','strength','maintenance','athletic'].map(g =>
      '<button class="btn btn-secondary btn-sm" onclick="applyMacroPreset(\''+g+'\')" style="flex:1;min-width:100px">'+esc(g.replace('_',' '))+'</button>'
    ).join('') + '</div>' +
    '<div style="padding:12px 0;font-size:13px;color:var(--txt3)">Calculated TDEE: '+tdee+' kcal/day</div>' +
    '</div>';
}

function _tabAppearance(u) {
  const themes = [
    {id:'carbon',label:'Carbon',grad:'linear-gradient(135deg,#00d5ff,#6b5fff)'},
    {id:'stealth',label:'Stealth',grad:'linear-gradient(135deg,#f5c842,#e8a020)'},
    {id:'forest',label:'Forest',grad:'linear-gradient(135deg,#10B981,#059669)'},
    {id:'arctic',label:'Arctic',grad:'linear-gradient(135deg,#007AFF,#5856D6)'},
    {id:'electric',label:'Electric',grad:'linear-gradient(135deg,#00f0ff,#0080ff)'},
    {id:'sunset',label:'Sunset',grad:'linear-gradient(135deg,#ff6b35,#f7931e)'},
    {id:'aurora',label:'Aurora',grad:'linear-gradient(135deg,#a855f7,#22d3ee)'},
    {id:'midnight',label:'Midnight',grad:'linear-gradient(135deg,#1e3a5f,#0f172a)'},
    {id:'light',label:'Light',grad:'linear-gradient(135deg,#f2f2f7,#e5e5ea)'}
  ];
  const coaches = [
    {id:'alex',e:'🔥',n:'Alex — Drill Sergeant'},
    {id:'maya',e:'🧪',n:'Maya — Sports Scientist'},
    {id:'sam',e:'⚡',n:'Sam — The Motivator'},
    {id:'zen',e:'🧘',n:'Zen — Mindful Coach'},
    {id:'rex',e:'💪',n:'Rex — The Powerlifter'}
  ];
  const cur = u.theme || 'carbon';
  const curCoach = u.coachPersonality || 'maya';

  return '<div style="padding:16px">' +
    _sectionTitle('Theme') +
    '<div class="theme-swatches">' +
    themes.map(t =>
      '<div class="theme-item" onclick="applyTheme(\''+t.id+'\');_setSetting(\'user.theme\',\''+t.id+'\');go(\'settings\',{tab:\'appearance\'})">' +
      '<div class="theme-swatch'+(cur===t.id?' on':'')+'" style="background:'+t.grad+'"></div>' +
      '<div class="theme-label">'+esc(t.label)+'</div>' +
      '</div>'
    ).join('') + '</div>' +

    _sectionTitle('Coach Personality') +
    coaches.map(c =>
      '<div class="toggle-row card-tap" onclick="_setSetting(\'user.coachPersonality\',\''+c.id+'\');go(\'settings\',{tab:\'appearance\'})" style="cursor:pointer">' +
      '<div class="toggle-info">' +
      '<div style="font-size:18px;margin-bottom:2px">'+c.e+'</div>' +
      '<div class="toggle-label">'+esc(c.n)+'</div>' +
      '</div>' +
      '<div style="font-size:18px">'+(curCoach===c.id?'✅':'○')+'</div>' +
      '</div>'
    ).join('') +

    _sectionTitle('Coach Tone') +
    (function() {
      const curTone = S.g('settings.coachTone') || 'motivational';
      const tones = [{v:'motivational',l:'🔥 Motivational'},{v:'scientific',l:'🧪 Scientific'},{v:'hardcore',l:'💪 Hardcore'}];
      const examples = {
        motivational:'"🔥 You\'re crushing it — shoulders are 92% recovered!"',
        scientific:'"Deltoid recovery index: 92%. Optimal training window active."',
        hardcore:'"Shoulders are ready. No excuses. Get in there."'
      };
      return '<div style="display:flex;gap:8px;margin-bottom:8px">' +
        tones.map(t=>'<button class="btn btn-'+(curTone===t.v?'primary':'secondary')+' btn-sm" style="flex:1" onclick="_setSetting(\'settings.coachTone\',\''+t.v+'\');go(\'settings\',{tab:\'appearance\'})">'+esc(t.l)+'</button>').join('') +
        '</div>' +
        '<div style="font-size:13px;color:var(--txt3);font-style:italic;padding:8px 12px;background:var(--bg3);border-radius:8px;margin-bottom:4px">'+esc(examples[curTone]||examples.motivational)+'</div>';
    })() +

    _sectionTitle('Units') +
    '<div style="display:flex;gap:8px;margin-bottom:14px">' +
    ['metric','imperial'].map(unit =>
      '<button class="btn btn-'+(u.units===unit?'primary':'secondary')+' btn-sm" style="flex:1" onclick="_setSetting(\'user.units\',\''+unit+'\');go(\'settings\',{tab:\'appearance\'})">'+unit.charAt(0).toUpperCase()+unit.slice(1)+'</button>'
    ).join('') + '</div>' +

    _sectionTitle('Performance') +
    _toggle('Low Power Mode', 'settings.lowPower', S.g('settings.lowPower') === true) +
    '<div style="font-size:12px;color:var(--txt3);margin:-6px 0 14px;padding:0 2px">Disables animated background for smoother scrolling on older phones.</div>' +

    _sectionTitle('Navigation Tabs') +
    '<div style="font-size:13px;color:var(--txt2);margin-bottom:10px;line-height:1.5">Home is always first. Tap to toggle tabs (3–5). Default: Home · Train · Coach · Recover · Me.</div>' +
    (function() {
      const allTabs = ['dashboard','workout','assistant','recovery','bodymap','progress','rehab','anatomy','calisthenics','search','settings'];
      const tabIcons = {dashboard:'🏠',workout:'💪',bodymap:'🫀',settings:'⚙️',recovery:'😴',coach:'🤖',progress:'📈',rehab:'🩹',anatomy:'🔬',calisthenics:'🤸',search:'🔎',assistant:'💬'};
      const tabLabels = {dashboard:'Home',workout:'Train',assistant:'Smart Coach',coach:'Smart Coach',recovery:'Recover',bodymap:'Body',settings:'Me',progress:'Stats',rehab:'Rehab',anatomy:'Anatomy',calisthenics:'Skills',search:'Search'};
      const cur = (typeof _getNavTabIds === 'function' ? _getNavTabIds() : (S.g('settings.navTabs') || CORE_NAV_DEFAULT));
      return allTabs.map(function(t) {
        const active = cur.includes(t);
        return '<div onclick="toggleNavTab(\''+t+'\')" style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border);cursor:pointer;touch-action:manipulation">' +
          '<div style="display:flex;align-items:center;gap:12px">' +
          '<span style="font-size:20px">'+tabIcons[t]+'</span>' +
          '<span style="font-size:14px;font-weight:600;color:var(--txt)">'+(tabLabels[t]||t)+'</span>' +
          '</div>' +
          '<div style="width:24px;height:24px;border-radius:50%;border:2px solid '+(active?'var(--c1)':'var(--border)')+';background:'+(active?'var(--c1)':'transparent')+';display:flex;align-items:center;justify-content:center;font-size:12px;color:#fff">'+(active?'✓':'')+'</div>' +
          '</div>';
      }).join('');
    })() +

    '</div>';
}

function _tabNotifications(u) {
  return '<div style="padding:16px">' +
    _sectionTitle('Alerts') +
    _toggle('Supplement Reminders', 'user.suppReminders', u.suppReminders!==false) +
    _toggle('Rest Day Reminders', 'user.restDayReminders', u.restDayReminders!==false) +
    _toggle('Streak Alerts', 'user.streakAlerts', u.streakAlerts!==false) +
    _toggle('Caffeine Warning', 'user.caffeineWarning', u.caffeineWarning!==false) +
    _toggle('Daily Morning Briefing', 'settings.dailyBriefing', S.g('settings.dailyBriefing') !== false) +
    _sectionTitle('Coach Update Frequency') +
    '<div style="display:flex;gap:8px;margin-bottom:4px">' +
    ['daily','weekly'].map(function(freq) {
      const cur = S.g('settings.coachFrequency') || 'daily';
      const active = cur === freq;
      return '<button onclick="_setSetting(\'settings.coachFrequency\',\''+freq+'\');go(\'settings\',{tab:\'notifications\'})" style="flex:1;padding:10px;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:'+(active?'var(--grad)':'var(--bg3)')+';color:'+(active?'#fff':'var(--txt3)')+'">'+freq.charAt(0).toUpperCase()+freq.slice(1)+'</button>';
    }).join('') +
    '</div>' +
    '<div style="font-size:12px;color:var(--txt3);margin-top:4px;padding:0 2px">Daily shows briefing every morning. Weekly shows full review on Mondays.</div>' +
    '</div>';
}

function _tabData() {
  const ws = S.g('workouts') || [];
  const joinDate = S.g('user.joinDate');
  return '<div style="padding:16px">' +
    _sectionTitle('My Data') +
    '<div class="card card-solid" style="margin-bottom:14px">' +
    '<div style="display:flex;flex-wrap:wrap;gap:12px">' +
    _infoStat('Workouts', String(ws.length), 'logged') +
    _infoStat('Member since', joinDate ? new Date(joinDate).toLocaleDateString('en-GB',{month:'short',year:'numeric'}) : '—', '') +
    _infoStat('Version', 'v4.5.1', 'PulseCap') +
    '</div></div>' +

    _sectionTitle('Profiles') +
    '<button class="btn btn-secondary" onclick="go(\'profiles\')" style="margin-bottom:10px">👤 Manage Profiles</button>' +
    '<button class="btn btn-danger" onclick="confirmClearData()" style="margin-bottom:10px">🗑️ Reset This Profile</button>' +

    _sectionTitle('Exercise Library') +
    (function() {
      const st = typeof ExerciseLibrary !== 'undefined' ? ExerciseLibrary.status() : { cached: false, count: 0 };
      const exCount = typeof ExDB !== 'undefined' ? ExDB.db.length : 0;
      return '<div class="card card-solid" style="margin-bottom:14px">' +
        '<div style="font-size:13px;color:var(--txt2);line-height:1.55;margin-bottom:12px">' +
        'Built-in: <strong style="color:var(--txt)">' + exCount + '</strong> exercises. ' +
        (st.cached ? 'wger cache: <strong style="color:var(--txt)">' + st.count + '</strong>' + (st.mediaCount ? ' · ' + st.mediaCount + ' with images/videos' : '') + ' (offline).' : 'Download wger.de library once while online — exercises, thumbnails & form videos stay on your phone.') +
        '</div>' +
        '<button id="ex-lib-sync-btn" class="btn btn-secondary" onclick="syncExerciseLibrary(' + (st.cached ? 'true' : 'false') + ')" style="width:100%">' +
        (st.cached ? '↻ Re-sync Exercise Library' : '↓ Download Exercise Library (wger)') +
        '</button></div>';
    })() +

    _sectionTitle('Export & Import') +
    '<button class="btn btn-secondary" onclick="exportData()" style="margin-bottom:10px">📤 Export Backup (JSON)</button>' +
    '<div class="field-wrap">' +
    '<label class="field-label">Import Backup</label>' +
    '<input class="field" type="file" accept=".json" onchange="importData(this)" style="font-size:14px">' +
    '</div>' +

    _sectionTitle('Danger Zone') +
    '<button class="btn btn-danger" onclick="confirmClearData()">🗑️ Clear All Data</button>' +

    '<div style="margin-top:32px;text-align:center;color:var(--txt3);font-size:13px">PulseCap v4 · by <strong>Shamikh Ahmed</strong></div>' +
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
    '<button class="toggle'+(current?' on':'')+'" onclick="toggleSetting(\''+key+'\')"></button>' +
    '</div>';
}
function _infoStat(label, val, sub) {
  return '<div style="flex:1;min-width:80px">' +
    '<div style="font-size:18px;font-weight:800;color:var(--c1)">'+esc(val)+'</div>' +
    '<div style="font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:var(--txt3)">'+esc(label)+'</div>' +
    (sub?'<div style="font-size:12px;color:var(--txt3)">'+esc(sub)+'</div>':'') +
    '</div>';
}

/* ── Actions ── */
window._setSetting = function(key, val) {
  S.set(key, val);
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

window.toggleInjuryRecovered = function(idx) {
  const injuries = S.g('user.injuries') || [];
  const inj = injuries[idx];
  if (typeof inj === 'string') {
    injuries[idx] = { id: inj, bodyPart: inj, severity: 1, recovered: true };
  } else {
    injuries[idx] = Object.assign({}, inj, { recovered: !inj.recovered });
  }
  S.set('user.injuries', injuries);
  go('settings', { tab: 'profile' });
};

window.setInjurySeverity = function(idx, severity) {
  const injuries = (S.g('user.injuries') || []).slice();
  const inj = injuries[idx];
  if (!inj) return;
  injuries[idx] = Object.assign({}, typeof inj === 'string' ? { id: inj, bodyPart: inj } : inj, { severity: severity, recovered: false });
  S.set('user.injuries', injuries);
  go('settings', { tab: 'profile' });
};

window.showAddInjury = function() {
  if (typeof InjuriesDB === 'undefined') return;
  const opts = InjuriesDB.injuries.map(i =>
    '<button class="btn btn-secondary btn-sm" style="width:100%;margin-bottom:6px;text-align:left" onclick="addInjury(\''+i.id+'\')">'+esc(i.name)+'</button>'
  ).join('');
  modal('Add Injury', '<div style="max-height:50vh;overflow-y:auto">'+opts+'</div>', '');
};

window.addInjury = function(id) {
  const injuries = S.g('user.injuries') || [];
  if (injuries.some(i => (typeof i === 'object' ? i.id : i) === id)) {
    toast('Already logged', 'warn'); closeModal(); return;
  }
  injuries.push({ id: id, bodyPart: id, severity: 1, recovered: false, addedAt: today() });
  S.set('user.injuries', injuries);
  closeModal();
  toast('Injury added — exercises will adapt', 'ok');
  go('settings', { tab: 'profile' });
};

window.toggleSetting = function(key) {
  const cur = S.g(key);
  S.set(key, !cur);
  go('settings', { tab: _activeSettingsTab });
};

window.removeSupp = function(id) {
  const supps = (S.g('supplements')||[]).filter(s=>s.id!==id);
  S.set('supplements', supps);
  go('settings', { tab: 'supplements' });
};

window.applyMacroPreset = function(goal) {
  const tdee = BodyEngine.tdee(S.g('user')||{});
  const macros = TDEEEngine.macroSplit(goal, tdee);
  S.set('user.calorieTarget', tdee);
  S.set('user.proteinTarget', macros.protein);
  S.set('user.carbTarget', macros.carbs);
  S.set('user.fatTarget', macros.fat);
  toast('Macro preset applied for '+goal.replace('_',' '), 'ok');
  go('settings', { tab: 'nutrition' });
};

window.showLogWeight = function() {
  modal('Log Weight',
    '<div class="field-wrap"><label class="field-label">Weight (kg)</label>' +
    '<input id="wt-inp" class="field" type="number" step="0.1" placeholder="'+(S.g('user.weight')||75)+'" style="font-size:22px;font-weight:700"></div>',
    '<button class="btn btn-primary" onclick="saveWeight()" style="margin-top:12px">Save</button>'
  );
};

window.saveWeight = function() {
  const w = parseFloat(document.getElementById('wt-inp')?.value);
  if (!w) { toast('Enter a weight', 'warn'); return; }
  S.set('user.weight', w);
  S.push('bodyStats', { date: today(), weight: w });
  closeModal();
  toast('Weight logged: '+w+'kg', 'ok');
};

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

window.importData = function(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      Object.assign(S.d, data); S.save();
      toast('Data imported!', 'ok');
      location.reload();
    } catch(err) { toast('Invalid backup file', 'err'); }
  };
  reader.readAsText(file);
};

window.confirmClearData = function() {
  modal('Reset Profile?',
    '<div style="text-align:center;padding:16px 0">' +
    '<div style="font-size:48px;margin-bottom:12px">⚠️</div>' +
    '<div style="font-size:16px;font-weight:700;color:var(--txt);margin-bottom:8px">This will delete all your data</div>' +
    '<div style="font-size:14px;color:var(--txt3);line-height:1.6">Workouts, PRs, measurements, supplements and settings for this profile will be permanently deleted.</div>' +
    '</div>',
    '<button class="btn btn-danger" onclick="S.reset()" style="margin-top:8px">Yes, Reset Everything</button>' +
    '<button class="btn btn-secondary" onclick="closeModal()" style="margin-top:8px">Cancel</button>'
  );
};

window.toggleNavTab = function(tab) {
  const key = tab === 'coach' ? 'assistant' : tab;
  const cur = (typeof _getNavTabIds === 'function' ? _getNavTabIds() : (S.g('settings.navTabs') || CORE_NAV_DEFAULT)).slice();
  const idx = cur.indexOf(key);
  if (idx >= 0) {
    if (cur.length <= 3) { toast('Minimum 3 tabs required', 'warn'); return; }
    cur.splice(idx, 1);
  } else {
    if (cur.length >= 5) { toast('Maximum 5 tabs in nav', 'warn'); return; }
    cur.push(key);
  }
  const normalized = typeof _normalizeNavTabs === 'function' ? _normalizeNavTabs(cur) : cur;
  S.set('settings.navTabs', normalized);
  buildNav();
  go('settings', { tab: 'appearance' });
};
