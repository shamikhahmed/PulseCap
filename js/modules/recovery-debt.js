'use strict';
/* ── PulseCap — Recovery Debt Engine + Fatigue Forecasting + Daily Coach Decision ── */

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
      if (ws.some(w => w.date === localISO(d))) consecutive++;
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
    if (debt >= 80) return { text: 'Critical', color: '#ff453a', action: 'Full rest day required' };
    if (debt >= 60) return { text: 'High', color: '#ff9f0a', action: 'Light session only or rest' };
    if (debt >= 40) return { text: 'Moderate', color: '#f5c842', action: 'Reduce volume 20-30%' };
    if (debt >= 20) return { text: 'Low', color: '#30d158', action: 'Train normally' };
    return { text: 'Minimal', color: '#00c7ff', action: 'Peak performance window' };
  },

  history() {
    const ws = S.g('workouts') || [];
    const result = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = localISO(d);
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
        date: localISO(d),
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
      if (ws.some(w => w.date === localISO(d))) consecutive++;
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
   DAILY COACH DECISION ENGINE
══════════════════════════════════════════════════════ */
const DailyDecision = {

  decide() {
    const debt = RecoveryDebtEngine.calculate();
    const readiness = typeof ReadinessEngine !== 'undefined' ? ReadinessEngine.score() : 70;
    const streak = typeof StreakEngine !== 'undefined' ? StreakEngine.get() : 0;
    const plateauRisk = FatigueForecast.plateauRisk();

    /* Severe injury outranks everything — lifting waits, walking doesn't */
    const injury = typeof InjuriesDB !== 'undefined' ? InjuriesDB.assessActive() : { shouldRest: false, messages: [], count: 0 };
    if (injury.shouldRest) return {
      decision: 'rest', title: 'Injury Recovery', ic: 'bandage', tint: 'c4', color: '#ff453a',
      reason: (injury.messages[0] || 'A severe injury is flagged') + '. Skip lifting today — a 20-30 min walk keeps blood flowing without loading the injury.',
      actions: ['Walk 20-30 min at easy pace','Follow your rehab protocol (Body → Rehab)','Ice/elevate if swollen, heat if stiff','Log pain level changes in Rehab'],
      confidence: 96
    };

    /* Day skipped by the user — engine already rescheduled */
    const skips = S.g('skippedDays') || [];
    const lastSkip = skips[skips.length - 1];
    if (lastSkip && lastSkip.date === today()) return {
      decision: 'rest', allowTrain: true, title: 'Day Skipped', ic: 'calendar', tint: 'c2', color: '#8e8e93',
      reason: lastSkip.shifted
        ? lastSkip.name + ' moved to your next gym day. The week shifts with you — nothing lost.'
        : 'Schedule holds. A short walk today keeps the habit alive.',
      actions: ['Walk 15-20 min if you can','Hit your protein target anyway','Back at it next gym day'],
      confidence: 90
    };

    /* Scheduled rest day (gym days in Settings → Training) */
    if (typeof SplitEngine !== 'undefined' && SplitEngine.isScheduledRestDay()) return {
      decision: 'rest', allowTrain: true, title: 'Scheduled Rest Day', ic: 'leaf', tint: 'c3', color: '#30d158',
      reason: 'Today isn\'t one of your gym days. Active recovery beats the couch — but the gym is open if you feel great.',
      actions: ['20-30 min walk or easy cycle','10 min stretching or mobility','Hit your protein target anyway','Sleep 8+ hours tonight'],
      confidence: 90
    };

    if (debt >= 80 || readiness < 30) return {
      decision: 'rest', title: 'Take the Day', ic: 'bed', tint: 'c4', color: '#ff453a',
      reason: 'Your body\'s deep in the red (' + debt + '/100 debt). Training through this buys nothing. Rest is the workout today.',
      actions: ['Sleep 8+ hours tonight','A short walk is fine — nothing more','Eat properly, drink water','Foam roll if you\'re restless'],
      confidence: 95
    };

    if (debt >= 60 || readiness < 45) return {
      decision: 'light', title: 'Go Light Today', ic: 'walk', tint: 'c5', color: '#ff9f0a',
      reason: 'Recovery\'s behind (' + debt + '/100). Show up, move well, leave wanting more.',
      actions: ['Drop weights 30-40%','Cut a set from everything','Slow reps, perfect form','Nothing to failure today'],
      confidence: 88
    };

    if (RecoveryDebtEngine.deloadRecommended() || streak >= 21) return {
      decision: 'deload', title: 'Deload Week', ic: 'trendDown', tint: 'c5', color: '#f5c842',
      reason: 'You\'ve stacked serious training stress. Back off now and you\'ll come back stronger — that\'s how it works.',
      actions: ['Same days, same lifts','Half the volume','60-70% of your usual weight','Make every rep look perfect'],
      confidence: 82
    };

    if (plateauRisk >= 70) return {
      decision: 'variation', title: 'Shake It Up', ic: 'refresh', tint: 'c2', color: '#af52de',
      reason: 'Progress is flattening (' + plateauRisk + '% plateau risk). Same stimulus, same body. Change something.',
      actions: ['Swap one or two main lifts','Change rep range — try 3-5 heavy','Add a superset or drop set','Hit your weak point first'],
      confidence: 76
    };

    if (readiness >= 85 && debt < 20) return {
      decision: 'push', title: 'Green Light — Send It', ic: 'flame', tint: 'c3', color: '#30d158',
      reason: 'Readiness ' + readiness + '/100 and fully recovered. Days like this are for PRs.',
      actions: ['Go for the PR on your main lift','Take sets 1-2 reps from failure','One extra set if you\'ve got it','Warm up properly first'],
      confidence: 91
    };

    if (debt < 30 && readiness >= 70) return {
      decision: 'cardio', title: 'Good Day for Cardio', ic: 'run', tint: 'c1', color: '#00c7ff',
      reason: 'You\'re recovered and fresh. Some easy cardio today pays off in every session this week.',
      actions: ['20-30 min at conversation pace','Heart rate 130-150','Bike, incline walk, or row','Stretch after while you\'re warm'],
      confidence: 65
    };

    return {
      decision: 'train', title: 'Train As Planned', ic: 'dumbbell', tint: 'c1', color: 'var(--c1)',
      reason: 'Readiness ' + readiness + '/100, recovery on track. Normal day — go do the work.',
      actions: ['Run your split as written','Add weight where last week felt easy','Finish every planned set','Log it all — the data is the coach'],
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
window.renderRecoveryDebtBody = function() {
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
      '<div class="muted-9">' + new Date(f.date + 'T12:00').toLocaleDateString('en', { weekday: 'short' }) + '</div>' +
      '<div style="font-size:8px;color:' + f.color + ';font-weight:700">' + f.debt + '</div>' +
      '</div>';
  }).join('');

  // 14-day history dots
  const histDots = history.map(h =>
    '<div style="width:10px;height:10px;border-radius:50%;background:' + (h.trained ? 'var(--c1)' : 'rgba(255,255,255,0.1)') + '" title="' + h.date + '"></div>'
  ).join('');

  const riskColor = (v) => v >= 70 ? '#ff453a' : v >= 40 ? '#f5c842' : '#30d158';

  return '' +

    // Hero
    '<div style="padding:20px 16px;text-align:center">' +
    '<div style="display:flex;align-items:center;justify-content:center;gap:24px;margin-bottom:4px">' +
    debtCircle +
    '<div style="text-align:left">' +
    '<div style="font-size:13px;font-weight:700;color:var(--txt);margin-bottom:6px">Recovery Status</div>' +
    '<div style="font-size:22px;font-weight:900;color:' + debtColor + ';margin-bottom:4px">' + esc(label.text) + '</div>' +
    '<div style="font-size:12px;color:var(--txt2);line-height:1.5;max-width:160px">' + esc(label.action) + '</div>' +
    (RecoveryDebtEngine.deloadRecommended() ? '<div style="margin-top:8px;font-size:11px;color:#f5c842;font-weight:700">Deload Recommended</div>' : '') +
    '</div></div></div>' +

    // Coach Decision card
    '<div style="margin:0 16px 14px;background:linear-gradient(135deg,rgba(var(--c1-rgb),0.1),rgba(0,0,0,0.2));border:1px solid rgba(var(--c1-rgb),0.2);border-radius:20px;padding:18px">' +
    '<div  class="section-label-sm">Today\'s Coach Recommendation</div>' +
    '<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">' +
    '<div class="flex-row">' + (typeof iconTile === 'function' ? iconTile(decision.ic || 'dumbbell', decision.tint || 'c1', 44) : '') + '</div>' +
    '<div>' +
    '<div style="font-size:18px;font-weight:800;color:' + decision.color + '">' + esc(decision.title) + '</div>' +
    '<div  class="muted-12 mt-2">Confidence: ' + decision.confidence + '%</div>' +
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
    '<div  class="card-block">' +
    '<div  class="section-label">7-Day Fatigue Forecast</div>' +
    '<div style="display:flex;gap:6px;align-items:flex-end">' + forecastBars + '</div>' +
    '<div style="font-size:11px;color:var(--txt3);margin-top:10px;text-align:center">Projected recovery debt · Higher = more fatigue</div>' +
    '</div>' +

    // 14-day outlook
    '<div  class="card-block">' +
    '<div  class="section-label">14-Day Outlook</div>' +
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
    '<div class="card-block-sm">' +
    '<div  class="section-label-sm">Training History (14 days)</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap">' + histDots + '</div>' +
    '<div style="font-size:10px;color:var(--txt3);margin-top:8px">● Trained &nbsp; ○ Rest</div>' +
    '</div>' +

    '<div  class="spacer-bottom"></div>';

};

reg('recovery-debt', function() {
  return window.renderRecoveryUnified({ tab: 'debt' });
});
