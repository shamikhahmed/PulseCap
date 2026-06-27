'use strict';
/* ── PulseCap — Recovery Debt Engine + Fatigue Forecasting + Daily AI Decision ── */

/* ══════════════════════════════════════════════════════
   RECOVERY DEBT ENGINE
══════════════════════════════════════════════════════ */
const RecoveryDebtEngine = {

  calculate() {
    const ws = S.g('workouts') || [];
    const rec = S.g('recovery') || {};
    const user = S.g('user') || {};
    let debt = 0;

    // Volume debt vs recovery capacity
    const last7 = ws.filter(w => daysAgo(w.date) < 7);
    const weeklyVol = last7.reduce((a, w) => a + (w.totalVol || 0), 0);
    const expectedRecoveryVol = (user.weeklyGoal || 4) * 8000;
    debt += Math.min((weeklyVol / Math.max(expectedRecoveryVol, 1)) * 20, 20);

    // Consecutive training days
    let consecutive = 0;
    for (let i = 0; i < 14; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      if (ws.some(w => w.date === d.toISOString().slice(0, 10))) consecutive++;
      else break;
    }
    debt += Math.min(consecutive * 5, 25);

    // Sleep debt
    const sleepVal = parseFloat(rec.sleep) || 7.5;
    debt += Math.min(Math.max(0, 8 - sleepVal) * 3, 15);

    // Soreness
    const sorenessVal = parseFloat(rec.soreness) || 3;
    debt += Math.min((sorenessVal / 10) * 15, 15);

    // Stress
    const stressVal = parseFloat(rec.stress) || 3;
    debt += Math.min((stressVal / 10) * 10, 10);

    // High-fatigue exercises in last 48h
    const last48h = ws.filter(w => daysAgo(w.date) < 2);
    let highFatigueCount = 0;
    last48h.forEach(w => {
      (w.exercises || []).forEach(ex => {
        if ((typeof EKG !== 'undefined' ? EKG.getFatigueScore(ex.name) : 5) >= 8) highFatigueCount++;
      });
    });
    debt += Math.min(highFatigueCount * 3, 15);

    return Math.round(Math.min(debt, 100));
  },

  label(debt) {
    if (debt >= 80) return { text: 'Critical', color: '#ff453a', emoji: '🔴', action: 'Full rest day required' };
    if (debt >= 60) return { text: 'High', color: '#ff9f0a', emoji: '🟠', action: 'Light session only or rest' };
    if (debt >= 40) return { text: 'Moderate', color: '#f5c842', emoji: '🟡', action: 'Reduce volume 20-30%' };
    if (debt >= 20) return { text: 'Low', color: '#30d158', emoji: '🟢', action: 'Train normally' };
    return { text: 'Minimal', color: '#00c7ff', emoji: '🔵', action: 'Peak performance window' };
  },

  history() {
    const ws = S.g('workouts') || [];
    const result = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const dayWs = ws.filter(w => w.date === ds);
      result.push({ date: ds, vol: dayWs.reduce((a, w) => a + (w.totalVol || 0), 0), trained: dayWs.length > 0 });
    }
    return result;
  },

  deloadRecommended() {
    const debt = this.calculate();
    const ws = S.g('workouts') || [];
    return debt >= 60 || ws.filter(w => daysAgo(w.date) < 42).length >= 20;
  }
};
window.RecoveryDebtEngine = RecoveryDebtEngine;

/* ══════════════════════════════════════════════════════
   FATIGUE FORECASTING ENGINE
══════════════════════════════════════════════════════ */
const FatigueForecast = {

  forecast(days) {
    let projectedDebt = RecoveryDebtEngine.calculate();
    const result = [];
    for (let i = 1; i <= days; i++) {
      const d = new Date(); d.setDate(d.getDate() + i);
      const dayOfWeek = d.getDay();
      const isTrainingDay = dayOfWeek !== 0 && dayOfWeek !== 6;
      projectedDebt = Math.max(0, Math.min(100, projectedDebt + (isTrainingDay ? 8 : -12)));
      const label = RecoveryDebtEngine.label(projectedDebt);
      result.push({
        date: d.toISOString().slice(0, 10),
        day: i,
        debt: Math.round(projectedDebt),
        readiness: Math.round(Math.max(20, Math.min(100, 100 - projectedDebt * 0.7))),
        label: label.text,
        color: label.color,
        isTraining: isTrainingDay,
        risk: projectedDebt >= 70 ? 'overtraining' : projectedDebt >= 50 ? 'accumulation' : 'optimal'
      });
    }
    return result;
  },

  plateauRisk() {
    const debt = RecoveryDebtEngine.calculate();
    const ws = S.g('workouts') || [];
    const recentPRs = (S.g('prs') || []).filter(p => daysAgo(p.date) < 21).length;
    const weekCount = ws.filter(w => daysAgo(w.date) < 28).length;
    let risk = 0;
    if (debt >= 60) risk += 40;
    else if (debt >= 40) risk += 20;
    if (recentPRs === 0 && weekCount >= 8) risk += 25;
    if (weekCount >= 16) risk += 15;
    return Math.min(risk, 100);
  },

  overtrainingRisk() {
    const debt = RecoveryDebtEngine.calculate();
    const ws = S.g('workouts') || [];
    let consecutive = 0;
    for (let i = 0; i < 14; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      if (ws.some(w => w.date === d.toISOString().slice(0, 10))) consecutive++;
      else break;
    }
    let risk = 0;
    if (consecutive >= 6) risk += 40;
    else if (consecutive >= 4) risk += 20;
    if (debt >= 70) risk += 40;
    else if (debt >= 50) risk += 20;
    return Math.min(risk, 100);
  }
};
window.FatigueForecast = FatigueForecast;

/* ══════════════════════════════════════════════════════
   DAILY AI DECISION ENGINE
══════════════════════════════════════════════════════ */
const DailyDecision = {

  decide() {
    const debt = RecoveryDebtEngine.calculate();
    const readiness = typeof ReadinessEngine !== 'undefined' ? ReadinessEngine.score() : 70;
    const streak = typeof StreakEngine !== 'undefined' ? StreakEngine.get() : 0;
    const plateauRisk = FatigueForecast.plateauRisk();

    if (debt >= 80 || readiness < 30) return {
      decision: 'rest', title: 'Recovery Priority', emoji: '🛌', color: '#ff453a',
      reason: 'Recovery debt critical (' + debt + '/100). Favor rest or very light movement today — you can still open a session if you choose.',
      actions: ['Sleep 8+ hours tonight','Light walk only (20 min max)','Prioritise nutrition and hydration','Foam roll or gentle stretching'],
      confidence: 95
    };

    if (debt >= 60 || readiness < 45) return {
      decision: 'light', title: 'Light Session Only', emoji: '🚶', color: '#ff9f0a',
      reason: 'High recovery debt (' + debt + '/100). A light session will maintain momentum without digging deeper.',
      actions: ['Reduce all weights by 30-40%','Cut sets by 30%','Focus on technique and mind-muscle','No failure sets today'],
      confidence: 88
    };

    if (RecoveryDebtEngine.deloadRecommended() || streak >= 21) return {
      decision: 'deload', title: 'Deload Week', emoji: '📉', color: '#f5c842',
      reason: 'Accumulated training stress detected. A planned deload will supercompensate and drive next phase of gains.',
      actions: ['Keep frequency the same','Reduce volume by 40-50%','Keep intensity at 60-70% of max','Focus on movement quality'],
      confidence: 82
    };

    if (plateauRisk >= 70) return {
      decision: 'variation', title: 'Introduce Variation', emoji: '🔄', color: '#af52de',
      reason: 'Plateau risk elevated (' + plateauRisk + '%). Time to change exercises, rep ranges, or training approach.',
      actions: ['Swap 1-2 primary exercises for alternatives','Change rep range (e.g. strength block 3-5 reps)','Try superset or drop set techniques','Add weak-point accessory work'],
      confidence: 76
    };

    if (readiness >= 85 && debt < 20) return {
      decision: 'push', title: 'Peak Performance Day', emoji: '🚀', color: '#30d158',
      reason: 'Readiness ' + readiness + '/100. Recovery debt minimal. Ideal day for PRs and maximum effort.',
      actions: ['Attempt PR on main compound lift','Push all sets to 1-2 reps from failure','Add an extra set per exercise','Maximum focus and intensity'],
      confidence: 91
    };

    if (debt < 30 && readiness >= 70) return {
      decision: 'cardio', title: 'Consider Cardio Focus', emoji: '🏃', color: '#00c7ff',
      reason: 'Good recovery status. Today could benefit from zone 2 cardio or conditioning work.',
      actions: ['20-30 min zone 2 cardio','Low intensity steady state','Maintain heart rate 130-150 bpm','Pair with mobility work'],
      confidence: 65
    };

    return {
      decision: 'train', title: 'Train Normally', emoji: '💪', color: 'var(--c1)',
      reason: 'Readiness ' + readiness + '/100. Recovery debt ' + debt + '/100. Solid training day.',
      actions: ['Follow your planned split','Progressive overload where possible','Complete all planned sets','Log weights for progression tracking'],
      confidence: 84
    };
  },

  cardioToday() {
    const debt = RecoveryDebtEngine.calculate();
    const readiness = typeof ReadinessEngine !== 'undefined' ? ReadinessEngine.score() : 70;
    if (debt >= 70) return { type: 'none', reason: 'Too fatigued for additional cardio load' };
    if (debt >= 50) return { type: 'walk', duration: 20, intensity: 'low', reason: 'Light walk only' };
    if (readiness >= 80 && debt < 30) return { type: 'hiit', duration: 15, intensity: 'high', reason: 'High readiness — short HIIT is fine' };
    return { type: 'zone2', duration: 25, intensity: 'moderate', reason: 'Zone 2 cardio optimal today' };
  }
};
window.DailyDecision = DailyDecision;

/* ══════════════════════════════════════════════════════
   RECOVERY DEBT SCREEN
══════════════════════════════════════════════════════ */
reg('recovery-debt', function() {
  const debt = RecoveryDebtEngine.calculate();
  const label = RecoveryDebtEngine.label(debt);
  const decision = DailyDecision.decide();
  const forecast7 = FatigueForecast.forecast(7);
  const forecast14 = FatigueForecast.forecast(14);
  const plateauRisk = FatigueForecast.plateauRisk();
  const overtrainingRisk = FatigueForecast.overtrainingRisk();
  const history = RecoveryDebtEngine.history();
  const debtColor = label.color;

  // Circular arc SVG
  const r = 54, circ = 2 * Math.PI * r;
  const dash = (debt / 100) * circ;
  const debtCircle =
    '<svg width="140" height="140" viewBox="0 0 140 140">' +
    '<circle cx="70" cy="70" r="' + r + '" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="12"/>' +
    '<circle cx="70" cy="70" r="' + r + '" fill="none" stroke="' + debtColor + '" stroke-width="12" ' +
    'stroke-dasharray="' + dash.toFixed(1) + ' ' + circ.toFixed(1) + '" stroke-dashoffset="' + (circ * 0.25).toFixed(1) + '" ' +
    'stroke-linecap="round" style="transition:stroke-dasharray .6s ease"/>' +
    '<text x="70" y="62" text-anchor="middle" font-size="28" font-weight="900" fill="' + debtColor + '">' + debt + '</text>' +
    '<text x="70" y="80" text-anchor="middle" font-size="11" fill="var(--txt3)">/ 100</text>' +
    '<text x="70" y="96" text-anchor="middle" font-size="10" font-weight="700" fill="' + debtColor + '">' + label.text.toUpperCase() + '</text>' +
    '</svg>';

  // 7-day forecast bars
  const forecastBars = forecast7.map(f => {
    const h = Math.max(4, Math.round((f.debt / 100) * 60));
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:4px;flex:1">' +
      '<div style="width:100%;background:rgba(255,255,255,0.06);border-radius:4px;height:64px;display:flex;align-items:flex-end;justify-content:center">' +
      '<div style="width:70%;border-radius:4px 4px 0 0;background:' + f.color + ';height:' + h + 'px;min-height:4px"></div></div>' +
      '<div style="font-size:9px;color:var(--txt3)">' + new Date(f.date + 'T12:00').toLocaleDateString('en', { weekday: 'short' }) + '</div>' +
      '<div style="font-size:8px;color:' + f.color + ';font-weight:700">' + f.debt + '</div>' +
      '</div>';
  }).join('');

  // 14-day history dots
  const histDots = history.map(h =>
    '<div style="width:10px;height:10px;border-radius:50%;background:' + (h.trained ? 'var(--c1)' : 'rgba(255,255,255,0.1)') + '" title="' + h.date + '"></div>'
  ).join('');

  const riskColor = (v) => v >= 70 ? '#ff453a' : v >= 40 ? '#f5c842' : '#30d158';

  return '<div class="topbar">' +
    '<button class="topbar-icon press" onclick="go(\'dashboard\')" style="font-size:20px">‹</button>' +
    '<div class="topbar-title">Recovery Debt</div>' +
    '</div>' +

    // Hero
    '<div style="padding:20px 16px;text-align:center">' +
    '<div style="display:flex;align-items:center;justify-content:center;gap:24px;margin-bottom:4px">' +
    debtCircle +
    '<div style="text-align:left">' +
    '<div style="font-size:13px;font-weight:700;color:var(--txt);margin-bottom:6px">Recovery Status</div>' +
    '<div style="font-size:22px;font-weight:900;color:' + debtColor + ';margin-bottom:4px">' + label.emoji + ' ' + esc(label.text) + '</div>' +
    '<div style="font-size:12px;color:var(--txt2);line-height:1.5;max-width:160px">' + esc(label.action) + '</div>' +
    (RecoveryDebtEngine.deloadRecommended() ? '<div style="margin-top:8px;font-size:11px;color:#f5c842;font-weight:700">⚠️ Deload Recommended</div>' : '') +
    '</div></div></div>' +

    // AI Decision card
    '<div style="margin:0 16px 14px;background:linear-gradient(135deg,rgba(var(--c1-rgb),0.1),rgba(0,0,0,0.2));border:1px solid rgba(var(--c1-rgb),0.2);border-radius:20px;padding:18px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:10px">Today\'s AI Recommendation</div>' +
    '<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">' +
    '<div style="font-size:40px">' + decision.emoji + '</div>' +
    '<div>' +
    '<div style="font-size:18px;font-weight:800;color:' + decision.color + '">' + esc(decision.title) + '</div>' +
    '<div style="font-size:12px;color:var(--txt3);margin-top:2px">Confidence: ' + decision.confidence + '%</div>' +
    '</div></div>' +
    '<div style="font-size:13px;color:var(--txt2);line-height:1.6;margin-bottom:12px">' + esc(decision.reason) + '</div>' +
    '<div style="display:flex;flex-direction:column;gap:6px">' +
    decision.actions.map(a => '<div style="font-size:12px;color:var(--txt2);padding:6px 10px;background:rgba(255,255,255,0.04);border-radius:8px;border-left:2px solid ' + decision.color + '">→ ' + esc(a) + '</div>').join('') +
    '</div></div>' +

    // Risk indicators
    '<div style="margin:0 16px 14px;display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
    '<div style="background:var(--bg3);border-radius:16px;padding:14px;border:1px solid var(--border)">' +
    '<div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px">Plateau Risk</div>' +
    '<div style="font-size:24px;font-weight:900;color:' + riskColor(plateauRisk) + '">' + plateauRisk + '%</div>' +
    '<div style="width:100%;height:4px;background:rgba(255,255,255,0.06);border-radius:2px;margin-top:6px"><div style="width:' + plateauRisk + '%;height:4px;border-radius:2px;background:' + riskColor(plateauRisk) + '"></div></div>' +
    '</div>' +
    '<div style="background:var(--bg3);border-radius:16px;padding:14px;border:1px solid var(--border)">' +
    '<div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px">Overtraining Risk</div>' +
    '<div style="font-size:24px;font-weight:900;color:' + riskColor(overtrainingRisk) + '">' + overtrainingRisk + '%</div>' +
    '<div style="width:100%;height:4px;background:rgba(255,255,255,0.06);border-radius:2px;margin-top:6px"><div style="width:' + overtrainingRisk + '%;height:4px;border-radius:2px;background:' + riskColor(overtrainingRisk) + '"></div></div>' +
    '</div></div>' +

    // 7-day forecast chart
    '<div style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:20px;padding:16px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:12px">7-Day Fatigue Forecast</div>' +
    '<div style="display:flex;gap:6px;align-items:flex-end">' + forecastBars + '</div>' +
    '<div style="font-size:11px;color:var(--txt3);margin-top:10px;text-align:center">Projected recovery debt · Higher = more fatigue</div>' +
    '</div>' +

    // 14-day outlook
    '<div style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:20px;padding:16px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:12px">14-Day Outlook</div>' +
    '<div style="display:flex;flex-direction:column;gap:8px">' +
    forecast14.filter((_, i) => i % 2 === 0).map(f =>
      '<div style="display:flex;align-items:center;gap:12px">' +
      '<div style="font-size:12px;color:var(--txt3);width:36px">' + new Date(f.date + 'T12:00').toLocaleDateString('en', { weekday: 'short' }) + '</div>' +
      '<div style="flex:1;height:6px;background:rgba(255,255,255,0.06);border-radius:3px"><div style="width:' + f.debt + '%;height:6px;border-radius:3px;background:' + f.color + '"></div></div>' +
      '<div style="font-size:11px;font-weight:700;color:' + f.color + ';width:24px;text-align:right">' + f.debt + '</div>' +
      '<div style="font-size:11px;color:var(--txt3);width:60px">' + esc(f.label) + '</div>' +
      '</div>'
    ).join('') +
    '</div></div>' +

    // 14-day training history dots
    '<div style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:10px">Training History (14 days)</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' + histDots + '</div>' +
    '<div style="font-size:10px;color:var(--txt3);margin-top:8px">● Trained &nbsp; ○ Rest</div>' +
    '</div>' +

    '<div style="height:20px"></div>';
});
