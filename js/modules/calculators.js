'use strict';
/* ── PulseCap v4.4 — Body Calculators ── */

const _CAL_STATUS_COLORS = {
  /* var(--c1)/var(--c2) so light theme gets its darker accessible accents */
  healthy: 'var(--success)', athletic: 'var(--c1)', elite: 'var(--c2)',
  average: '#f5c842', elevated: 'var(--warn)', high: 'var(--danger)',
  low: 'var(--warn)', needs_data: 'var(--txt3)'
};

function _calMetric(label, value, sub, status) {
  const col = _CAL_STATUS_COLORS[status] || 'var(--txt)';
  return '<div class="mod-metric">' +
    '<div class="mod-metric__label">' + esc(label) + '</div>' +
    '<div class="mod-metric__value" style="color:' + col + '">' + value + '</div>' +
    (sub ? '<div class="mod-metric__sub">' + esc(sub) + '</div>' : '') +
    '</div>';
}

function _calcData() {
  const user = S.g('user') || {};
  const bmi = BodyEngine.bmi(user.weight || 75, user.height || 175);
  const bf = BodyEngine.bodyFatNavy(user);
  const ffm = BodyEngine.ffmi(user);
  const wth = BodyEngine.waistToHeight(user);
  const lean = BodyEngine.leanMass(user);
  const fat = BodyEngine.fatMass(user);
  const bmr = BodyEngine.bmr(user);
  const tdee = BodyEngine.tdee(user);
  const cals = BodyEngine.calorieTarget(user);
  const protein = BodyEngine.proteinTarget(user);
  const water = BodyEngine.waterIntake(user);
  const macros = TDEEEngine.macroSplit(user.goal || 'hypertrophy', cals);
  const prs = S.g('prs') || [];
  const topPr = prs.length ? prs.slice().sort(function(a, b) { return (b.e1rm || 0) - (a.e1rm || 0); })[0] : null;
  const healthyWt = BodyEngine.healthyWeightRange(user.height || 175, user.gender || 'male');
  return { user, bmi, bf, ffm, wth, lean, fat, bmr, tdee, cals, protein, water, macros, topPr, healthyWt };
}

reg('calculators', function() {
  const d = _calcData();
  const u = d.user;
  const units = u.units === 'imperial' ? 'lb' : 'kg';

  const bfVal = d.bf.pct != null ? d.bf.pct + '%' : '—';
  const wthVal = d.wth.ratio != null ? d.wth.ratio : '—';

  const strengthSection = d.topPr ?
    _calMetric('Top 1RM', d.topPr.e1rm + ' ' + units, d.topPr.exercise + ' · ' + d.topPr.weight + units + '×' + d.topPr.reps, 'athletic') +
    _calMetric('Epley Formula', 'w × (1 + r/30)', 'Same as workout PR engine', 'average') :
    _calMetric('Top 1RM', '—', 'Log workouts to see estimates', 'needs_data') +
    _calMetric('Epley', BodyEngine.oneRm(100, 5) + ' kg', 'Example: 100kg × 5 reps', 'average');

  return moduleTopbar('Calculators', {
    backScreen: 'hub',
    right: '<button type="button" class="topbar-icon press" onclick="go(\'bodymap\')" aria-label="Body">' + (typeof icon==='function'?icon('heart',20):'') + '</button>'
  }) +

    '<div  class="pad-x-16-b">' +
    '<div style="background:linear-gradient(135deg,rgba(255,69,58,0.1),rgba(255,69,58,0.08));border:1px solid rgba(255,69,58,0.2);border-radius:18px;padding:16px;margin-bottom:14px">' +
    '<div style="font-size:13px;color:var(--txt2);line-height:1.55;margin-bottom:12px">Metrics use your profile, latest measurements, and training goal. Tap recalculate after logging new data.</div>' +
    '<button type="button" class="btn btn-primary btn-sm w-full" onclick="recalcCalculators()" >↻ Recalculate</button>' +
    '</div></div>' +

    sh('Body Composition') +
    '<div class="grid-2 pad-x-16-b">' +
    _calMetric('Body Fat (Navy)', bfVal, d.bf.label, d.bf.status) +
    _calMetric('Lean Mass', d.lean + ' kg', 'Fat-free mass estimate', d.bf.status === 'needs_data' ? 'needs_data' : 'healthy') +
    _calMetric('Fat Mass', d.fat + ' kg', 'From body fat %', d.bf.status === 'needs_data' ? 'needs_data' : 'average') +
    _calMetric('FFMI', d.ffm.normalized, 'Normalized · ' + d.ffm.label, d.ffm.status) +
    _calMetric('Waist-to-Height', wthVal, d.wth.label, d.wth.status) +
    _calMetric('BMI', d.bmi.bmi, d.bmi.cat, d.bmi.bmi < 18.5 ? 'low' : d.bmi.bmi < 25 ? 'healthy' : d.bmi.bmi < 30 ? 'elevated' : 'high') +
    _calMetric('Healthy Weight', d.healthyWt.min + '–' + d.healthyWt.max + ' kg', 'For your height', 'healthy') +
    '</div>' +

    sh('Energy') +
    '<div class="grid-2 pad-x-16-b">' +
    _calMetric('BMR', d.bmr + ' kcal', 'At rest', 'average') +
    _calMetric('TDEE', d.tdee + ' kcal', 'Maintenance', 'healthy') +
    _calMetric('Calorie Target', d.cals + ' kcal', (u.goal || 'hypertrophy').replace(/_/g, ' '), 'athletic') +
    _calMetric('Time to Goal', BodyEngine.timeToGoal(u), 'Estimated', 'average') +
    '</div>' +

    sh('Nutrition') +
    '<div class="grid-2 pad-x-16-b">' +
    _calMetric('Protein', d.protein + ' g/day', '1.6–2.2 g/kg by goal', 'healthy') +
    _calMetric('Carbs', d.macros.carbs + ' g/day', 'Macro split', 'average') +
    _calMetric('Fat', d.macros.fat + ' g/day', 'Macro split', 'average') +
    _calMetric('Water', (d.water / 1000).toFixed(1) + ' L/day', '~35 ml/kg', 'healthy') +
    '</div>' +

    sh('Strength') +
    '<div class="grid-2 pad-x-16-b">' +
    strengthSection +
    '</div>' +

    '<div  class="pad-x-16-b">' +
    '<button type="button" class="btn btn-secondary w-full" onclick="go(\'bodymap\')" style="display:flex;align-items:center;justify-content:center;gap:8px">' + (typeof icon==='function'?icon('ruler',18):'') + 'Log Measurements in Body Tab</button>' +
    '</div>' +
    '<div  class="spacer-bottom"></div>';
});

window.recalcCalculators = function() {
  if (window._cache) delete window._cache['plan'];
  toast('Metrics recalculated', 'ok');
  go('calculators');
};
