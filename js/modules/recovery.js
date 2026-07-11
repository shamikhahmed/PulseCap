'use strict';
/* ── PulseCap v4 — Recovery Screen ── */

function _recoveryTabBar(tab) {
  const tabs = [{ id: 'checkin', label: 'Check-in' }, { id: 'debt', label: 'Debt' }];
  return '<div style="display:flex;gap:6px;padding:8px 16px 12px">' +
    tabs.map(function(t) {
      const on = t.id === tab;
      return '<button type="button" onclick="go(\'recovery\',{tab:\'' + t.id + '\'})" class="press" style="flex-shrink:0;padding:8px 14px;border-radius:999px;border:1px solid ' +
        (on ? 'var(--c1)' : 'var(--border)') + ';background:' + (on ? 'rgba(var(--c1-rgb),0.15)' : 'var(--bg3)') +
        ';color:' + (on ? 'var(--c1)' : 'var(--txt2)') + ';font-size:12px;font-weight:700;cursor:pointer;touch-action:manipulation">' + esc(t.label) + '</button>';
    }).join('') + '</div>';
}

window.renderRecoveryUnified = function(data) {
  const tab = (data && data.tab) || 'checkin';
  const shell = '<div class="topbar"><button type="button" onclick="go(\'bodymap\')" style="background:none;border:none;color:var(--txt3);cursor:pointer;font-size:14px;padding:0 16px;touch-action:manipulation" aria-label="Back">←</button><div class="topbar-title">Recovery</div></div>' + _recoveryTabBar(tab);
  if (tab === 'debt') {
    return shell + (typeof window.renderRecoveryDebtBody === 'function' ? window.renderRecoveryDebtBody() : '');
  }
  const rec = S.g('recovery') || {};
  const loggedToday = rec.date === today();
  const score = ReadinessEngine.score();
  const rl = ReadinessEngine.label(score);
  return shell +
    _readinessSummary(score, rl) +
    (loggedToday ? _loggedView(rec) : _checkInForm(rec)) +
    _recoveryHistoryChart() +
    _sleepInsights() +
    _recoveryRecs(score) +
    '<div style="padding:0 16px 16px"><button type="button" class="btn btn-secondary" onclick="go(\'body-intelligence\')" style="width:100%">🧬 Body Intelligence →</button></div>' +
    '<div style="height:20px"></div>';
};

reg('recovery', function(data) {
  return window.renderRecoveryUnified(data);
});

window.migrateRecoveryMerge = function() {
  if (S.g('settings.migrations.recoveryMerge') === 1) return false;
  S.set('settings.migrations.recoveryMerge', 1);
  return true;
};

function _readinessSummary(score, rl) {
  return '<div class="readiness-card">' +
    '<div style="display:flex;align-items:center;gap:20px">' +
    '<div>' +
    '<div class="readiness-score">'+score+'</div>' +
    '<div class="readiness-label '+rl.cls+'">'+rl.l+'</div>' +
    '</div>' +
    '<div style="flex:1">' +
    '<div style="font-size:14px;color:var(--txt2);line-height:1.6">'+esc(ReadinessEngine.message(score))+'</div>' +
    '</div></div>' +
    '<div class="readiness-metrics">' +
    _rm('😴','Sleep') + _rm('💪','Soreness') + _rm('🧠','Stress') + _rm('⚡','Energy') +
    '</div></div>';
}

function _rm(icon, label) {
  const r = S.g('recovery') || {};
  const vals = { Sleep:r.sleep||'—', Soreness:r.soreness||'—', Stress:r.stress||'—', Energy:r.energy||'—' };
  return '<div class="readiness-metric">' +
    '<div class="readiness-metric-v">'+icon+' '+vals[label]+'</div>' +
    '<div class="readiness-metric-l">'+esc(label)+'</div></div>';
}

function _checkInForm(rec) {
  const sliders = [
    { key:'sleep', label:'Sleep Duration', min:0, max:12, step:0.5, unit:'hrs', icon:'😴', def:7.5 },
    { key:'soreness', label:'Muscle Soreness', min:0, max:10, step:1, unit:'/10', icon:'💪', def:3 },
    { key:'stress', label:'Stress Level', min:0, max:10, step:1, unit:'/10', icon:'🧠', def:4 },
    { key:'energy', label:'Energy Level', min:0, max:10, step:1, unit:'/10', icon:'⚡', def:7 },
    { key:'hydration', label:'Water Intake', min:0, max:5, step:0.5, unit:'L', icon:'💧', def:2.5 }
  ];

  const slidersHTML = sliders.map(s => {
    const val = rec[s.key] || s.def;
    return '<div class="slider-wrap">' +
      '<div class="slider-header">' +
      '<span style="font-size:18px">'+s.icon+'</span>' +
      '<span class="slider-name">'+esc(s.label)+'</span>' +
      '<span class="slider-val" id="sv-'+s.key+'">'+val+'</span>' +
      '<span class="slider-unit">'+esc(s.unit)+'</span>' +
      '</div>' +
      '<input type="range" min="'+s.min+'" max="'+s.max+'" step="'+s.step+'" value="'+val+'" ' +
        'oninput="document.getElementById(\'sv-'+s.key+'\').textContent=this.value;_recTmp.'+s.key+'=parseFloat(this.value)">' +
      '<div class="slider-labels">' +
      '<span>'+s.min+(s.unit==='hrs'?' hrs':'')+' </span>' +
      '<span>'+s.max+(s.unit==='hrs'?' hrs':'')+'</span>' +
      '</div></div>';
  }).join('');

  window._recTmp = { sleep: rec.sleep||7.5, soreness: rec.soreness||3, stress: rec.stress||4, energy: rec.energy||7, hydration: rec.hydration||2.5 };
  return sh('Daily Check-In') +
    '<div style="padding:0 16px">' +
    slidersHTML +
    '<button type="button" class="btn btn-primary" onclick="saveRecovery()">Log Recovery</button>' +
    '</div>';
}

function _loggedView(rec) {
  return sh('Today\'s Check-In', 'Edit', 'resetRecovery()') +
    '<div class="card card-solid">' +
    '<div style="display:flex;flex-wrap:wrap;gap:16px">' +
    _recStat('😴', rec.sleep||'—', 'hrs sleep') +
    _recStat('💪', rec.soreness||'—', '/10 sore') +
    _recStat('🧠', rec.stress||'—', '/10 stress') +
    _recStat('⚡', rec.energy||'—', '/10 energy') +
    _recStat('💧', rec.hydration||'—', 'L hydration') +
    '</div>' +
    '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border)">' +
    '<div style="font-size:13px;color:var(--txt3)">Breakdown:</div>' +
    '<div style="font-size:14px;color:var(--txt2);margin-top:4px;line-height:1.6">'+esc(_recoveryBreakdown(rec))+'</div>' +
    '</div></div>';
}

function _recStat(icon, val, label) {
  return '<div style="text-align:center;flex:1;min-width:60px">' +
    '<div style="font-size:22px">'+icon+'</div>' +
    '<div style="font-size:20px;font-weight:800;color:var(--c1)">'+esc(String(val))+'</div>' +
    '<div style="font-size:10px;color:var(--txt3)">'+esc(label)+'</div>' +
    '</div>';
}

function _recoveryBreakdown(rec) {
  const parts = [];
  if ((rec.sleep||7.5) < 6) parts.push('Sleep is limiting recovery — aim for 8+ hrs tonight');
  else if ((rec.sleep||7.5) >= 8) parts.push('Sleep quality is excellent');
  if ((rec.soreness||3) >= 7) parts.push('High muscle soreness — consider reducing intensity');
  if ((rec.energy||7) >= 8) parts.push('Energy levels are high');
  else if ((rec.energy||7) < 5) parts.push('Low energy — ensure adequate nutrition and rest');
  if ((rec.hydration||2.5) < 1.5) parts.push('Hydration is low — drink more water throughout the day');
  return parts.length ? parts.join('. ') + '.' : 'Recovery metrics look balanced. Train as planned.';
}

function _sleepInsights() {
  const ws = S.g('workouts') || [];
  const recs = S.g('recovery') ? [S.g('recovery')] : [];
  const avgSleep = recs.reduce ? (recs.reduce((a,r)=>a+(r.sleep||7.5),0)/Math.max(recs.length,1)).toFixed(1) : '7.5';
  return sh('Sleep Insights') +
    '<div class="card card-solid">' +
    '<div style="font-size:28px;font-weight:900;color:var(--c1)">'+avgSleep+'<span style="font-size:14px;color:var(--txt3);font-weight:500"> hrs avg</span></div>' +
    '<div style="font-size:13px;color:var(--txt2);margin-top:8px;line-height:1.6">' +
    (parseFloat(avgSleep) >= 8 ? '✅ Excellent sleep average — optimising recovery and performance.' :
     parseFloat(avgSleep) >= 7 ? '👍 Good sleep average. Aim for 8+ for optimal performance.' :
     '⚠️ Below recommended. Even 30 more minutes per night makes a significant difference.') +
    '</div></div>';
}

function _recoveryRecs(score) {
  const recs = [];
  if (score < 50) {
    recs.push({ icon:'🚿', text:'Take a cold shower (3 min cold) — reduces muscle soreness by up to 20%' });
    recs.push({ icon:'🧘', text:'20 min yoga or light mobility work — enhances circulation and recovery' });
    recs.push({ icon:'🚶', text:'Light 20 min walk at 5 km/h — active recovery without adding fatigue' });
  } else if (score < 70) {
    recs.push({ icon:'🫧', text:'Foam roll legs and back — 10 min thorough rolling session' });
    recs.push({ icon:'😴', text:'Aim for 8+ hrs tonight — get to bed 30 min earlier' });
    recs.push({ icon:'💧', text:'Drink 500ml water in the next 30 min' });
  } else {
    recs.push({ icon:'💪', text:'You\'re ready to train hard — execute your planned workout' });
    recs.push({ icon:'🥩', text:'Hit protein target post-workout for optimal muscle protein synthesis' });
    recs.push({ icon:'⚡', text:'Consider a 10 min dynamic warm-up to prime your CNS' });
  }
  return sh('Recommendations') +
    '<div style="padding:0 16px">' +
    recs.map(r =>
      '<div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">' +
      '<div style="font-size:24px;flex-shrink:0">'+r.icon+'</div>' +
      '<div style="font-size:14px;color:var(--txt2);line-height:1.5">'+esc(r.text)+'</div>' +
      '</div>'
    ).join('') + '</div>';
}

function _recoveryHistoryChart() {
  const hist = S.g('recoveryHistory') || [];
  if (hist.length < 2) return '';
  const last7 = hist.slice(-7);
  const scores = last7.map(h => {
    const sleepScore = Math.min(100, ((h.sleep||7.5)/9)*100);
    const energyScore = ((h.energy||7)/10)*100;
    const soreness = 100 - ((h.soreness||3)/10)*100;
    return Math.round((sleepScore + energyScore + soreness) / 3);
  });
  const maxS = Math.max(...scores, 1);
  const days = last7.map(h => {
    const d = new Date(h.date);
    return ['S','M','T','W','T','F','S'][d.getDay()];
  });
  return sh('Last 7 Days') +
    '<div style="padding:0 16px 14px">' +
    '<div style="display:flex;align-items:flex-end;gap:8px;height:60px;margin-bottom:8px">' +
    scores.map((s,i) => {
      const h = Math.max(4, Math.round((s/maxS)*56));
      const color = s >= 70 ? 'var(--c3)' : s >= 50 ? 'var(--c5)' : 'var(--c4)';
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">' +
        '<div style="width:100%;height:'+h+'px;background:'+color+';border-radius:4px 4px 0 0"></div>' +
        '<div style="font-size:9px;color:var(--txt3)">'+days[i]+'</div>' +
        '</div>';
    }).join('') +
    '</div>' +
    '<div style="font-size:12px;color:var(--txt3)">Average readiness: <span style="color:var(--txt);font-weight:700">'+Math.round(scores.reduce((a,s)=>a+s,0)/scores.length)+'</span></div>' +
    '</div>';
}

window.saveRecovery = function() {
  const tmp = window._recTmp || {};
  const recData = {
    sleep: tmp.sleep || 7.5,
    soreness: tmp.soreness || 3,
    stress: tmp.stress || 4,
    energy: tmp.energy || 7,
    hydration: tmp.hydration || 2.5,
    date: today()
  };
  S.set('recovery', recData);
  S.push('recoveryHistory', { ...recData, time: isoNow() });
  const hist = S.g('recoveryHistory') || [];
  S.set('recoveryHistory', hist.filter(h => daysAgo(h.date) <= 30));
  toast('Recovery logged!', 'ok');
  go('recovery');
};

window.resetRecovery = function() {
  S.set('recovery', { ...S.g('recovery'), date:'' });
  go('recovery');
};
