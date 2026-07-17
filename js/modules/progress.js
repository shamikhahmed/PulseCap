'use strict';
/* ── PulseCap v4 — Progress Screen ── */

reg('progress', function() {
  const ws = S.g('workouts') || [];
  const prs = S.g('prs') || [];
  const bodyStats = S.g('bodyStats') || [];
  const earned = S.g('achievements') || [];
  const streak = StreakEngine.get();
  const totalVol = StreakEngine.totalVolume();

  return '<div class="topbar"><div class="topbar-title">Progress</div></div>' +
    _periodizationBlock(ws) +
    _weeklySummary(ws, prs) +
    _monthlyReport(ws, prs, bodyStats) +
    _heroStats(ws, prs, streak, totalVol) +
    _strengthLineChart(ws) +
    _workoutCalendar(ws) +
    _workoutHistory(ws) +
    _volumeChart(ws) +
    _prBoard(prs) +
    _strengthCharts(ws, prs) +
    _bodyStatsChart(bodyStats, S.g('user')) +
    _achievementWall(earned) +
    '<div class="pad-x-16-b16"><button type="button" class="btn btn-secondary w-full" onclick="go(\'physique\')" >📊 Physique Analysis & Growth Simulator →</button></div>' +
    '<div  class="spacer-bottom"></div>';
});

function _monthlyReport(ws, prs, bodyStats) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const monthWs = ws.filter(w => (w.date || '') >= monthStart);
  const monthVol = monthWs.reduce((a, w) => a + (w.totalVol || 0), 0);
  const monthPRs = prs.filter(p => (p.date || '') >= monthStart).length;
  const monthName = now.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const weights = (bodyStats || []).filter(b => (b.date || '') >= monthStart && b.weight);
  const weightChange = weights.length >= 2 ? (weights[weights.length - 1].weight - weights[0].weight).toFixed(1) : null;
  return '<div style="margin:0 16px 14px;background:linear-gradient(135deg,rgba(123,95,255,0.1),rgba(0,213,255,0.06));border:1px solid rgba(123,95,255,0.18);border-radius:20px;padding:16px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--c2);margin-bottom:4px">Monthly Report</div>' +
    '<div style="font-size:15px;font-weight:800;color:var(--txt);margin-bottom:12px">'+esc(monthName)+'</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">' +
    _pStat(monthWs.length, 'Sessions', '📅') +
    _pStat(Math.round(monthVol / 1000) + 'k', 'Volume kg', '🏋️') +
    _pStat(monthPRs, 'PRs', '🏆') +
    '</div>' +
    (weightChange !== null ? '<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);font-size:12px;color:var(--txt3)">Weight this month: <span style="color:'+(parseFloat(weightChange)<=0?'var(--c3)':'var(--c5)')+';font-weight:700">'+(parseFloat(weightChange)>0?'+':'')+weightChange+' kg</span></div>' : '') +
    '</div>';
}

function _periodizationBlock(ws) {
  const blockStart = S.g('periodization.blockStart') || localISO(new Date());
  const start = new Date(blockStart + 'T12:00:00');
  const today = new Date();
  const dayMs = 86400000;
  const elapsed = Math.max(0, Math.floor((today - start) / dayMs));
  const week = Math.min(4, Math.floor(elapsed / 7) + 1);
  const weekStart = new Date(start.getTime() + (week - 1) * 7 * dayMs);
  const weekEnd = new Date(weekStart.getTime() + 6 * dayMs);
  const weekWs = ws.filter(function(w) {
    const d = w.date || '';
    return d >= localISO(weekStart) && d <= localISO(weekEnd);
  });
  const phases = ['Accumulation', 'Intensification', 'Peak', 'Deload'];
  const phase = phases[week - 1] || 'Deload';
  const labels = ['W1', 'W2', 'W3', 'W4'];
  return '<div  class="card-block">' +
    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">' +
    '<div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--c2);margin-bottom:4px">Training Block</div>' +
    '<div  class="row-title-16">Week ' + week + ' · ' + esc(phase) + '</div></div>' +
    '<div style="font-size:11px;color:var(--txt3);text-align:right">4-week mesocycle<br><span style="font-weight:700;color:var(--c1)">' + weekWs.length + ' sessions</span></div></div>' +
    '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">' +
    labels.map(function(l, i) {
      const on = i + 1 === week;
      return '<div style="text-align:center;padding:10px 6px;border-radius:12px;border:1px solid ' + (on ? 'var(--c1)' : 'var(--border)') + ';background:' + (on ? 'rgba(var(--c1-rgb),0.12)' : 'var(--bg4)') + '">' +
        '<div style="font-size:12px;font-weight:800;color:' + (on ? 'var(--c1)' : 'var(--txt3)') + '">' + l + '</div>' +
        '<div style="font-size:9px;color:var(--txt3);margin-top:4px;text-transform:uppercase">' + esc(phases[i]) + '</div></div>';
    }).join('') +
    '</div></div>';
}

function _weeklySummary(ws, prs) {
  const thisWeek = ws.filter(w => daysAgo(w.date) < 7);
  const lastWeek = ws.filter(w => daysAgo(w.date) >= 7 && daysAgo(w.date) < 14);
  const thisVol = thisWeek.reduce((a,w) => a+(w.totalVol||0), 0);
  const lastVol = lastWeek.reduce((a,w) => a+(w.totalVol||0), 0);
  const volChange = lastVol > 0 ? Math.round(((thisVol-lastVol)/lastVol)*100) : 0;
  const thisCount = thisWeek.length;
  const newPRs = prs.filter(p => daysAgo(p.date) < 7).length;
  return '<div  class="card-block">' +
    '<div  class="section-label">This Week</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px">' +
    _pStat(thisCount, 'Sessions', '📅') +
    _pStat(Math.round(thisVol)+'kg', 'Volume', '🏋️') +
    _pStat(newPRs, 'New PRs', '🏆') +
    '</div>' +
    (lastVol > 0 ? '<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);font-size:12px;color:var(--txt3)">vs last week: <span style="color:'+(volChange>=0?'var(--c3)':'var(--c4)')+';font-weight:700">'+(volChange>=0?'+':'')+volChange+'% volume</span></div>' : '') +
    '</div>';
}
function _pStat(val, label, icon) {
  return '<div style="text-align:center;background:var(--bg4);border-radius:12px;padding:10px">' +
    '<div style="font-size:16px;margin-bottom:4px">'+icon+'</div>' +
    '<div  class="row-title-16">'+esc(String(val))+'</div>' +
    '<div style="font-size:10px;color:var(--txt3);margin-top:2px">'+esc(label)+'</div>' +
    '</div>';
}

function _strengthLineChart(ws) {
  const exNames = [];
  const seen = {};
  ws.forEach(function(wo) {
    (wo.exercises || []).forEach(function(ex) {
      if (ex.name && !seen[ex.name]) { seen[ex.name] = true; exNames.push(ex.name); }
    });
  });

  const selectOpts = exNames.map(function(n) {
    return '<option value="'+esc(n)+'">'+esc(n)+'</option>';
  }).join('');

  const selectorHTML = '<div class="pad-x-16-b12">' +
    '<select id="strength-chart-select" onchange="changeExerciseChart(this.value)" ' +
    'style="width:100%;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:12px;color:var(--txt);font-size:14px;-webkit-appearance:none">' +
    (exNames.length ? selectOpts : '<option value="">No exercises logged yet</option>') +
    '</select></div>';

  const firstEx = exNames[0] || '';
  const chartHTML = '<div id="strength-chart-wrap"  class="pad-x-16">' +
    _renderStrengthChart(ws, firstEx) +
    '</div>';

  return sh('Strength Curve') + selectorHTML + chartHTML;
}

function _getExerciseSessions(ws, exName) {
  const sessionMap = {};
  ws.forEach(function(wo) {
    (wo.exercises || []).forEach(function(ex) {
      if (ex.name !== exName) return;
      var maxE1rm = 0;
      (ex.sets || []).forEach(function(s) {
        if (s.done && s.weight && s.reps) {
          var e = ProgEngine.epley(s.weight, s.reps);
          if (e > maxE1rm) maxE1rm = e;
        }
      });
      if (maxE1rm > 0) {
        var dateKey = (wo.date || '').slice(0, 10);
        if (!sessionMap[dateKey] || sessionMap[dateKey] < maxE1rm) {
          sessionMap[dateKey] = maxE1rm;
        }
      }
    });
  });
  var pts = Object.keys(sessionMap).sort().map(function(d) {
    return { date: d, e1rm: Math.round(sessionMap[d]) };
  });
  return pts.slice(-10);
}

function _renderStrengthChart(ws, exName) {
  if (!exName) return '<div style="text-align:center;padding:40px 0;color:var(--txt3);font-size:14px">Select an exercise above</div>';
  var pts = _getExerciseSessions(ws, exName);
  if (pts.length < 1) {
    return '<div style="text-align:center;padding:40px 20px;color:var(--txt3);font-size:13px">No data yet — log some '+esc(exName)+' sets to see your strength curve</div>';
  }

  var W = 320, H = 200, padL = 48, padB = 28, padT = 24, padR = 16;
  var chartW = W - padL - padR, chartH = H - padT - padB;
  var e1rms = pts.map(function(p) { return p.e1rm; });
  var minE = Math.max(0, Math.min.apply(null, e1rms) - 5);
  var maxE = Math.max.apply(null, e1rms) + 5;

  var toX = function(i) { return padL + (pts.length > 1 ? i / (pts.length - 1) : 0.5) * chartW; };
  var toY = function(v) { return padT + (1 - (v - minE) / (maxE - minE || 1)) * chartH; };

  var polyPts = pts.map(function(p, i) { return toX(i) + ',' + toY(p.e1rm); }).join(' ');

  var gradId = 'scg' + Date.now();
  var fillPts = pts.map(function(p, i) { return toX(i) + ',' + toY(p.e1rm); }).join(' ') +
    ' ' + toX(pts.length - 1) + ',' + (padT + chartH) + ' ' + padL + ',' + (padT + chartH);

  var guides = [minE + (maxE - minE) * 0.8, minE + (maxE - minE) * 0.5, minE + (maxE - minE) * 0.2];
  var guideLines = guides.map(function(v) {
    var gy = toY(v);
    return '<line x1="'+padL+'" y1="'+gy+'" x2="'+(W-padR)+'" y2="'+gy+'" stroke="rgba(255,255,255,0.07)" stroke-width="1"/>' +
      '<text x="'+(padL-4)+'" y="'+(gy+4)+'" font-size="9" fill="var(--txt3)" text-anchor="end">'+Math.round(v)+'</text>';
  }).join('');

  var dots = pts.map(function(p, i) {
    var isLast = i === pts.length - 1;
    var cx = toX(i), cy = toY(p.e1rm);
    if (isLast) return '<circle cx="'+cx+'" cy="'+cy+'" r="8" fill="white" stroke="#00d5ff" stroke-width="2"/>';
    return '<circle cx="'+cx+'" cy="'+cy+'" r="5" fill="#00d5ff"/>';
  }).join('');

  var xLabels = pts.map(function(p, i) {
    var cx = toX(i);
    var d = p.date.slice(5); // MM-DD
    var mmdd = d.replace('-', '/');
    return '<text x="'+cx+'" y="'+(H-6)+'" font-size="9" fill="var(--txt3)" text-anchor="middle">'+esc(mmdd)+'</text>';
  }).join('');

  var trendHTML = '';
  if (pts.length >= 2) {
    var first = pts[0].e1rm, last = pts[pts.length - 1].e1rm;
    var pctChange = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
    var trendColor = pctChange >= 0 ? '#10B981' : '#ef4444';
    var arrow = pctChange >= 0 ? '↑' : '↓';
    trendHTML = '<div style="position:absolute;top:'+padT+'px;right:'+padR+'px;font-size:11px;font-weight:700;color:'+trendColor+'">' +
      arrow + ' ' + Math.abs(pctChange) + '% this month</div>';
  } else {
    trendHTML = '<div style="position:absolute;top:'+padT+'px;right:'+padR+'px;font-size:11px;color:var(--txt3)">No trend yet</div>';
  }

  return '<div style="position:relative">' +
    trendHTML +
    '<svg width="100%" viewBox="0 0 '+W+' '+H+'" style="overflow:visible">' +
    '<defs><linearGradient id="'+gradId+'" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="#00d5ff" stop-opacity="0.3"/>' +
    '<stop offset="100%" stop-color="#00d5ff" stop-opacity="0"/>' +
    '</linearGradient></defs>' +
    guideLines +
    '<polygon points="'+fillPts+'" fill="url(#'+gradId+')" />' +
    '<polyline points="'+polyPts+'" fill="none" stroke="#00d5ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    dots +
    xLabels +
    '</svg>' +
    '<div style="text-align:center;font-size:11px;color:var(--txt3);margin-top:4px">e1RM (kg)</div>' +
    '</div>';
}

function _heroStats(ws, prs, streak, totalVol) {
  const volDisplay = totalVol > 1000 ? (Math.round(totalVol/100)/10) + 't' : totalVol + 'kg';
  return '<div class="stats-row">' +
    '<div class="stat stat-accent"><div class="stat-v">'+ws.length+'</div><div class="stat-l">Workouts</div></div>' +
    '<div class="stat"><div class="stat-v">'+esc(volDisplay)+'</div><div class="stat-l">Total Vol</div></div>' +
    '<div class="stat stat-accent"><div class="stat-v">'+streak+'🔥</div><div class="stat-l">Streak</div></div>' +
    '<div class="stat"><div class="stat-v">'+prs.length+'</div><div class="stat-l">PRs</div></div>' +
    '</div>';
}

function _workoutCalendar(ws) {
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const wktDates = new Set(ws.map(w => w.date.slice(0,10)));
  const monthStr = now.toLocaleDateString('en-GB',{month:'long',year:'numeric'});
  const dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  let cells = dayNames.map(d => '<div class="cal-day-name">'+d+'</div>').join('');
  for (let i=0; i<(firstDay||7)%7; i++) cells += '<div></div>';
  for (let d=1; d<=daysInMonth; d++) {
    const dateStr = year+'-'+(String(month+1).padStart(2,'0'))+'-'+(String(d).padStart(2,'0'));
    const isToday = d === now.getDate();
    const hasWkt = wktDates.has(dateStr);
    cells += '<div class="cal-day'+(isToday?' today':'')+(hasWkt?' wkt':'')+'" onclick="showDayWorkouts(\''+dateStr+'\')">'+d+'</div>';
  }

  return sh('Calendar') +
    '<div class="cal">' +
    '<div class="cal-header"><div class="cal-month">'+esc(monthStr)+'</div></div>' +
    '<div class="cal-grid">'+cells+'</div>' +
    '</div>';
}

function _workoutHistory(ws) {
  if (!ws.length) {
    return emptyState('💪', 'No workouts yet', 'Start your first session — your split is ready.', '▶ Start Workout', 'startWorkout&&startWorkout()');
  }
  const recent = ws.slice().reverse().slice(0, 20);
  return sh('Workout History') +
    '<div  class="pad-x-16">' +
    recent.map(function(w) {
      const exNames = (w.exercises||[]).slice(0,3).map(function(e){return e.name;}).join(', ');
      const more = (w.exercises||[]).length > 3 ? ' +'+((w.exercises||[]).length-3)+' more' : '';
      const vol = w.totalVol ? Math.round(w.totalVol)+'kg' : '';
      const dur = w.duration ? fmtMins(w.duration) : '';
      const prs = (w.exercises||[]).reduce(function(a,ex) {
        const prSets = (ex.sets||[]).filter(function(s){return s.isPR;});
        return a + prSets.length;
      }, 0);
      return '<div onclick="showDayWorkouts(\''+w.date.slice(0,10)+'\')" style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border);cursor:pointer;touch-action:manipulation">' +
        '<div  class="flex-1">' +
        '<div  class="row-title-14">'+esc(w.name||'Workout')+'</div>' +
        '<div  class="muted-12 mt-2">'+esc(exNames+more)+'</div>' +
        '</div>' +
        '<div style="text-align:right;flex-shrink:0">' +
        '<div  class="muted-12">'+esc(fmtDate(w.date))+'</div>' +
        '<div  class="muted-11 mt-2">'+[vol,dur].filter(Boolean).join(' · ')+(prs?' · 🏆'+prs+' PR':'')+'</div>' +
        '</div>' +
        '<div style="color:var(--txt3);font-size:16px;margin-left:8px">›</div>' +
        '</div>';
    }).join('') +
    '</div>';
}

function _volumeChart(ws) {
  if (!ws.length) return '';
  const weeks = [];
  for (let i=7; i>=0; i--) {
    const start = new Date(); start.setDate(start.getDate() - i*7);
    const end = new Date(); end.setDate(end.getDate() - (i-1)*7);
    const vol = ws.filter(w => { const d=new Date(w.date); return d>=start&&d<end; }).reduce((a,w)=>a+(w.totalVol||0),0);
    weeks.push({ label:i===0?'Now':'W-'+i, vol, isCur:i===0 });
  }
  const maxVol = Math.max(...weeks.map(w=>w.vol), 1);
  const bars = weeks.map(w =>
    '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">' +
    '<div style="flex:1;width:100%;display:flex;align-items:flex-end">' +
    '<div style="width:100%;background:'+(w.isCur?'var(--grad)':'var(--bg4)')+';border-radius:4px 4px 0 0;height:'+Math.max(4,Math.round((w.vol/maxVol)*80))+'px"></div>' +
    '</div><div  class="muted-10">'+esc(w.label)+'</div></div>'
  ).join('');

  return sh('Volume Trend') +
    '<div  class="pad-x-16">' +
    '<div style="display:flex;align-items:flex-end;height:100px;gap:6px">'+bars+'</div>' +
    '</div>';
}

function _prBoard(prs) {
  if (!prs.length) return sh('Personal Records') +
    '<div style="text-align:center;padding:40px 24px">' +
    '<div style="font-size:56px;margin-bottom:12px;animation:fadeUp 0.4s both">🏆</div>' +
    '<div style="font-size:19px;font-weight:900;color:var(--txt);margin-bottom:6px;animation:fadeUp 0.4s 0.08s both">No PRs yet</div>' +
    '<div style="font-size:13px;color:var(--txt3);line-height:1.6;max-width:220px;margin:0 auto 20px;animation:fadeUp 0.4s 0.16s both">Hit a heavy set in your next workout to set your first personal record.</div>' +
    '<button type="button" onclick="go(\'workout\')" class="btn btn-primary" style="animation:fadeUp 0.4s 0.24s both;animation-fill-mode:both">▶ Start Workout</button>' +
    '</div>';
  const sorted = [...prs].sort((a,b) => new Date(b.date)-new Date(a.date));
  return sh('Personal Records') +
    '<div  class="pad-x-16">' +
    sorted.slice(0,8).map(p =>
      '<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">' +
      '<div style="font-size:22px">🏆</div>' +
      '<div  class="flex-1"><div  class="row-title-14">'+esc(p.exercise)+'</div>' +
      '<div  class="muted-12">'+fmtDate(p.date)+'</div></div>' +
      '<div class="ta-right"><div style="font-size:15px;font-weight:800;color:var(--c1)">'+p.weight+'kg × '+p.reps+'</div>' +
      '<div  class="muted-11">e1RM: '+(p.e1rm||'—')+'kg</div></div></div>'
    ).join('') + '</div>';
}

function _strengthCharts(ws, prs) {
  if (!prs.length) return '';
  const charts = prs.slice(0,3).map(pr => {
    const history = [];
    ws.forEach(wo => (wo.exercises||[]).forEach(ex => {
      if (ex.name===pr.exercise) (ex.sets||[]).filter(s=>s.done&&s.weight&&s.reps).forEach(s => {
        history.push({ date:wo.date.slice(0,10), e1rm:ProgEngine.epley(s.weight,s.reps) });
      });
    }));
    if (history.length < 2) return '';
    const pts = history.slice(-8);
    const maxE = Math.max(...pts.map(p=>p.e1rm), 1);
    const W=280, H=60;
    const points = pts.map((p,i) => ((i/(pts.length-1||1))*W)+','+(H-((p.e1rm/maxE)*(H-8))-4)).join(' ');
    return '<div style="margin-bottom:16px">' +
      '<div style="font-size:13px;font-weight:700;color:var(--txt);margin-bottom:6px">'+esc(pr.exercise)+'</div>' +
      '<svg width="'+W+'" height="'+H+'" viewBox="0 0 '+W+' '+H+'" style="width:100%;overflow:visible">' +
      '<polyline points="'+points+'" fill="none" stroke="var(--c1)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
      pts.map((p,i) => { const x=(i/(pts.length-1||1))*W, y=H-((p.e1rm/maxE)*(H-8))-4; return '<circle cx="'+x+'" cy="'+y+'" r="3.5" fill="var(--c1)"/>'; }).join('') +
      '</svg>' +
      '<div  class="muted-12">Peak e1RM: '+Math.round(maxE)+'kg</div>' +
      '</div>';
  }).filter(Boolean).join('');
  if (!charts) return '';
  return sh('Strength Trends') + '<div  class="pad-x-16">'+charts+'</div>';
}

function _bodyStatsChart(bodyStats, user) {
  if (!bodyStats || !bodyStats.length) return sh('Weight Trend') +
    '<div style="text-align:center;padding:40px 24px">' +
    '<div style="font-size:56px;margin-bottom:12px;animation:fadeUp 0.4s both">⚖️</div>' +
    '<div style="font-size:19px;font-weight:900;color:var(--txt);margin-bottom:6px;animation:fadeUp 0.4s 0.08s both">No weight data</div>' +
    '<div style="font-size:13px;color:var(--txt3);line-height:1.6;max-width:220px;margin:0 auto 20px;animation:fadeUp 0.4s 0.16s both">Track your body weight to see trends and physique progress.</div>' +
    '<button type="button" onclick="go(\'bodymap\')" class="btn btn-secondary" style="animation:fadeUp 0.4s 0.24s both;animation-fill-mode:both">📍 Open Body Map</button>' +
    '</div>';
  var isImperial = (user||{}).units === 'imperial';
  var pts = bodyStats.slice(-12);

  var W = 320, H = 160, padL = 44, padB = 24, padT = 16, padR = 12;
  var chartW = W - padL - padR, chartH = H - padT - padB;
  var weights = pts.map(function(p){return p.weight;});
  var minW = Math.max(0, Math.min.apply(null,weights)-2);
  var maxW = Math.max.apply(null,weights)+2;

  var toX = function(i){return padL+(pts.length>1?i/(pts.length-1):0.5)*chartW;};
  var toY = function(v){return padT+(1-(v-minW)/(maxW-minW||1))*chartH;};

  var polyPts = pts.map(function(p,i){return toX(i)+','+toY(p.weight);}).join(' ');
  var fillPts = polyPts+' '+toX(pts.length-1)+','+(padT+chartH)+' '+padL+','+(padT+chartH);
  var gradId = 'bsg'+Date.now();

  var dots = pts.map(function(p,i){
    var cx=toX(i), cy=toY(p.weight), isLast=i===pts.length-1;
    var w = isImperial ? Math.round(p.weight*2.205*10)/10 : p.weight;
    var fasted = p.fasted !== false;
    var dotFill = isLast ? 'white' : (fasted ? '#ffd60a' : '#bf5af2');
    var dotStroke = fasted ? '#ffd60a' : '#bf5af2';
    return '<circle cx="'+cx+'" cy="'+cy+'" r="'+(isLast?7:4)+'" fill="'+dotFill+'" stroke="'+dotStroke+'" stroke-width="2"/>' +
      (isLast?'<text x="'+cx+'" y="'+(cy-12)+'" font-size="10" fill="var(--txt)" text-anchor="middle" font-weight="700">'+w+(isImperial?'lb':'kg')+'</text>':'');
  }).join('');

  var goalLine = (user && user.goalWeight) ?
    '<line x1="'+padL+'" y1="'+toY(user.goalWeight)+'" x2="'+(W-padR)+'" y2="'+toY(user.goalWeight)+'" stroke="#30d158" stroke-width="1.5" stroke-dasharray="4,3"/>' +
    '<text x="'+(W-padR-2)+'" y="'+(toY(user.goalWeight)-4)+'" font-size="9" fill="#30d158" text-anchor="end">Goal</text>' : '';

  return sh('Weight Trend', '+ Log', 'go(\'bodymap\')') +
    '<div  class="pad-x-16-b">' +
    '<svg width="100%" viewBox="0 0 '+W+' '+H+'" overflow="visible">' +
    '<defs><linearGradient id="'+gradId+'" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0%" stop-color="var(--c2)" stop-opacity="0.25"/>' +
    '<stop offset="100%" stop-color="var(--c2)" stop-opacity="0"/>' +
    '</linearGradient></defs>' +
    goalLine +
    '<polygon points="'+fillPts+'" fill="url(#'+gradId+')" />' +
    '<polyline points="'+polyPts+'" fill="none" stroke="var(--c2)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    dots +
    '</svg>' +
    '<div style="display:flex;gap:14px;justify-content:center;margin-top:8px;font-size:10px;color:var(--txt3)">' +
    '<span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#ffd60a;margin-right:4px;vertical-align:middle"></span>Fasted</span>' +
    '<span><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#bf5af2;margin-right:4px;vertical-align:middle"></span>Fed</span>' +
    '</div></div>';
}

function _achievementWall(earned) {
  return sh('Achievements', earned.length+'/'+AchEngine.all.length) +
    '<div class="achieve-grid">' +
    AchEngine.all.map(a => {
      const unlocked = earned.includes(a.id);
      return '<div class="achieve-card'+(unlocked?' unlocked':'')+'">' +
        '<div class="achieve-icon">'+a.i+'</div>' +
        '<div class="achieve-name">'+esc(a.n)+'</div>' +
        '<div class="achieve-desc">'+esc(a.d)+'</div></div>';
    }).join('') + '</div>';
}

window.changeExerciseChart = function(exName) {
  var wrap = document.getElementById('strength-chart-wrap');
  if (!wrap) return;
  var ws = S.g('workouts') || [];
  wrap.innerHTML = _renderStrengthChart(ws, exName);
};

window.showDayWorkouts = function(dateStr) {
  const ws = (S.g('workouts')||[]).filter(function(w){return w.date.slice(0,10)===dateStr;});
  if (!ws.length) { toast('No workout on '+fmtDate(dateStr),'info'); return; }
  const body = ws.map(function(w) {
    return '<div style="padding:12px 0;border-bottom:1px solid var(--border)">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
      '<div  class="row-title-15">'+esc(w.name||'Workout')+'</div>' +
      '<div  class="muted-12">'+fmtMins(w.duration||0)+' · '+Math.round(w.totalVol||0)+'kg</div>' +
      '</div>' +
      (w.exercises||[]).map(function(ex) {
        const doneSets = (ex.sets||[]).filter(function(s){return s.done;});
        if (!doneSets.length) return '';
        const bestSet = doneSets.slice().sort(function(a,b){return ProgEngine.epley(b.weight||0,b.reps||1)-ProgEngine.epley(a.weight||0,a.reps||1);})[0];
        return '<div style="padding:6px 0;display:flex;justify-content:space-between;align-items:center">' +
          '<div  class="body-13">'+esc(ex.name)+'</div>' +
          '<div  class="muted-12">'+doneSets.length+' sets · Best: '+(bestSet.weight||0)+'kg×'+(bestSet.reps||0)+(bestSet.isPR?'  🏆':'')+'</div>' +
          '</div>';
      }).join('') +
      '</div>';
  }).join('');
  modal(fmtDate(dateStr), body, '<button type="button" class="btn btn-ghost mt-12" onclick="closeModal()">Close</button>');
};
