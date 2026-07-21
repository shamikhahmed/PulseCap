'use strict';
/* ── PulseCap v4 — Coach Screen ── */

const COACH_META = {
  alex: { name:'Alex', ic:'flame', title:'Drill Sergeant', color:'#ff4444' },
  maya: { name:'Maya', ic:'dna', title:'Sports Scientist', color:'var(--c1)' },
  sam:  { name:'Sam',  ic:'sparkles', title:'The Motivator',   color:'#f5c842' },
  zen:  { name:'Zen',  ic:'leaf', title:'Mindful Coach',   color:'#10B981' },
  rex:  { name:'Rex',  ic:'dumbbell', title:'The Powerlifter', color:'var(--c2)' }
};

reg('briefing', function() {
  const user = S.g('user') || {};
  const score = ReadinessEngine.score();
  const rl = ReadinessEngine.label(score);
  const splitDay = SplitEngine.getSplitDay();
  const insights = CoachEngine.insights();
  const personality = user.coachPersonality || 'maya';
  const cm = COACH_META[personality] || COACH_META.maya;
  const dueSupps = SupplementEngine.getDueNow();
  const streak = StreakEngine.get();
  const injuries = (S.g('user.injuries') || []).filter(function(i) {
    return typeof i === 'string' ? true : !i.recovered;
  });

  const hr = new Date().getHours();
  const timeGreeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const name = (user.name || 'Athlete').split(' ')[0];

  const scoreColor = score >= 80 ? '#30d158' : score >= 60 ? 'var(--c1)' : score >= 40 ? '#ff9f0a' : '#ff453a';

  const coachMsg = ReadinessEngine.coachQuote(score, personality);

  const injuryAlert = injuries.length ?
    '<div style="background:rgba(255,69,58,0.1);border:1px solid rgba(255,69,58,0.2);border-radius:14px;padding:14px;margin:0 16px 14px;display:flex;gap:12px">' +
    '<span style="flex-shrink:0;color:#ff453a">' + icon('alert', 20) + '</span>' +
    '<div><div style="font-size:13px;font-weight:700;color:#ff453a;margin-bottom:4px">'+injuries.length+' Active Injur'+(injuries.length>1?'ies':'y')+'</div>' +
    '<div class="body-12-lh">Some exercises have been flagged. Check coach screen for modifications.</div>' +
    '<button type="button" onclick="go(\'settings\',{tab:\'profile\'})" style="margin-top:8px;font-size:12px;color:var(--c1);font-weight:600;background:none;border:none;cursor:pointer;touch-action:manipulation">Manage injuries →</button>' +
    '</div></div>' : '';

  return '<div style="min-height:100vh;min-height:100dvh;background:var(--bg)">' +
    '<div style="padding:calc(20px + var(--top-safe)) 20px 24px;text-align:center;' +
    'background:linear-gradient(180deg,rgba(var(--c1-rgb),0.08) 0%,transparent 100%)">' +
    '<div style="font-size:14px;color:var(--txt3);margin-bottom:4px">'+esc(timeGreeting)+', '+esc(name)+'</div>' +
    '<div style="font-size:64px;font-weight:900;color:'+scoreColor+';letter-spacing:-3px;line-height:1;margin-bottom:6px">'+score+'</div>' +
    '<div style="display:inline-block;padding:5px 14px;border-radius:20px;font-size:13px;font-weight:700;' +
    'text-transform:uppercase;letter-spacing:0.06em;background:rgba(var(--c1-rgb),0.12);color:var(--c1);margin-bottom:10px">'+rl.l+'</div>' +
    '<div style="font-size:14px;color:var(--txt2);line-height:1.6;max-width:300px;margin:0 auto">'+esc(coachMsg)+'</div>' +
    '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:14px">' +
    '<div class="flex-row">' + iconTile(cm.ic || 'sparkles', 'c1', 28) + '</div>' +
    '<div  class="muted-13"><strong class="c-txt">'+esc(cm.name)+'</strong> · '+esc(cm.title)+'</div>' +
    '</div></div>' +

    sh('Today\'s Plan') +
    '<div class="card card-grad-border mx-card" >' +
    '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">' +
    '<div class="flex-row">' + iconTile('dumbbell', 'c1', 36) + '</div>' +
    '<div><div  class="row-title-16">'+esc(splitDay.n||'Rest Day')+'</div>' +
    '<div  class="muted-12 mt-2">'+esc(prettyMuscles(splitDay.muscles))+'</div></div>' +
    '</div>' +
    '<div style="display:flex;gap:10px">' +
    '<button type="button" class="btn btn-primary flex-1"  onclick="startWorkout&&startWorkout()">▶ Start Workout</button>' +
    '<button type="button" class="btn btn-secondary flex-1"  onclick="go(\'coach\')">Full Plan</button>' +
    '</div></div>' +

    injuryAlert +

    (function() {
      const lastWkt = (S.g('workouts')||[]).slice(-1)[0];
      return lastWkt ? '<div style="margin:0 16px 14px;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:12px;font-size:13px;color:var(--txt3)">Last session: <strong class="c-txt">'+esc(lastWkt.name||'Workout')+'</strong> · '+fmtDate(lastWkt.date)+' · '+Math.round(lastWkt.totalVol||0)+'kg volume</div>' : '';
    })() +

    sh('Today') +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;padding:0 16px 14px">' +
    '<div style="background:var(--bg3);border-radius:14px;padding:12px;text-align:center;border:1px solid var(--border)">' +
    '<div style="font-size:22px;font-weight:800;color:var(--c1)">'+streak+'</div>' +
    '<div  class="micro-label type-caption-mt">Streak</div>' +
    '</div>' +
    '<div style="background:var(--bg3);border-radius:14px;padding:12px;text-align:center;border:1px solid var(--border)">' +
    '<div style="font-size:22px;font-weight:800;color:var(--txt)">'+(S.g('workouts')||[]).length+'</div>' +
    '<div  class="micro-label type-caption-mt">Sessions</div>' +
    '</div>' +
    '<div style="background:var(--bg3);border-radius:14px;padding:12px;text-align:center;border:1px solid var(--border)">' +
    '<div style="font-size:22px;font-weight:800;color:#ffd60a">'+(S.g('prs')||[]).length+'</div>' +
    '<div  class="micro-label type-caption-mt">PRs</div>' +
    '</div></div>' +

    (insights.length ? sh('Coach Insights') +
    '<div  class="pad-x-16">' +
    insights.slice(0,2).map(function(ins) {
      const col = ins.c || 'var(--c1)';
      return '<div style="border-left:3px solid '+col+';background:rgba(0,0,0,0.15);padding:12px 14px;border-radius:0 10px 10px 0;margin-bottom:10px">' +
        '<div style="font-size:12px;font-weight:700;color:'+col+';text-transform:uppercase;letter-spacing:0.07em;margin-bottom:4px">'+esc(ins.t)+'</div>' +
        '<div style="font-size:13px;color:var(--txt2);line-height:1.55">'+esc(ins.m)+'</div>' +
        '</div>';
    }).join('') + '</div>' : '') +

    (dueSupps.length ?
      sh('Due Now') +
      dueSupps.slice(0,2).map(function(s) {
        return '<div class="supp-card due"><div class="supp-icon">' + icon('pill', 22) + '</div>' +
          '<div class="supp-info"><div class="supp-name">'+esc(s.name)+'</div><div class="supp-timing">'+esc(s.timing)+'</div></div>' +
          '<button type="button" class="supp-mark" onclick="SupplementEngine.markTaken(\''+s.id+'\');go(\'briefing\')">Done</button></div>';
      }).join('') : '') +

    '<div style="padding:16px 16px calc(16px + var(--safe))">' +
    '<button type="button" class="btn btn-secondary" onclick="go(\'dashboard\')">← Back to Home</button>' +
    '</div></div>';
});

/* Route deleted — SCREEN_ALIASES maps coach → assistant. */

function _readinessBlock(score, rl, rec) {
  return sh('Readiness Assessment') +
    '<div  class="pad-x-16-b">' +
    '<div class="readiness-card" style="margin:0">' +
    '<div style="display:flex;align-items:center;gap:20px">' +
    '<div>' +
    '<div class="readiness-score">'+score+'</div>' +
    '<div class="readiness-label '+rl.cls+'">'+rl.l+'</div>' +
    '</div>' +
    '<div  class="flex-1">' +
    '<div style="font-size:16px;font-weight:700;color:var(--txt);margin-bottom:4px">Today\'s recommendation:</div>' +
    '<div style="font-size:14px;color:var(--c1);font-weight:600;text-transform:capitalize">'+esc(rec)+'</div>' +
    '<div style="font-size:13px;color:var(--txt2);margin-top:6px">'+esc(ReadinessEngine.message(score))+'</div>' +
    '</div></div></div></div>';
}

/* ── IMPROVEMENT 1: Smart Split Day Suggestion ── */
function _splitSuggestionBlock(splitDay, cardioRec, score, user) {
  const streak = StreakEngine.get();
  const muscleStatus = MuscleEngine.status();
  const statusMap = {};
  muscleStatus.forEach(m => { statusMap[m.name.toLowerCase()] = m.pct; });

  /* maps ExDB muscle names → MuscleEngine lowercase group keys */
  const MMAP = {
    chest:'chest', upper_chest:'chest', lower_chest:'chest',
    lats:'back', upper_back:'back', lower_back:'back', rhomboids:'back', traps:'back',
    front_delts:'shoulders', side_delts:'shoulders', rear_delts:'shoulders', shoulders:'shoulders',
    quads:'quads', hamstrings:'hamstrings', glutes:'glutes',
    biceps:'biceps', triceps:'triceps', core:'core', calves:'calves'
  };

  const deloadBanner = streak >= 5 ?
    '<div class="ai-msg" style="border-left-color:#f5c842;margin:0 16px 12px">' +
    '<div class="ai-msg-header"><span class="c-warn">' + icon('alert', 16) + '</span><span class="ai-msg-label c-warn">Deload Week Advised</span></div>' +
    '<div class="ai-msg-text">'+streak+' consecutive training days detected. Keep the schedule but cut volume 50% — your CNS and connective tissue need systemic recovery.</div></div>' : '';

  if (score < 50) {
    const lightOpts = [
      '15-20 min light walk or mobility flow',
      '10 min foam rolling — focus on sore areas',
      'Yoga or full-body stretch (30 min)',
      'Rest completely and prioritise 8+ hours sleep tonight'
    ];
    return sh('Today\'s Program') + deloadBanner +
      '<div class="card card-solid" style="margin:0 16px 14px;border-left:3px solid #ff6b35">' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">' +
      '<div class="flex-row">' + iconTile('bed', 'c4', 40) + '</div>' +
      '<div><div  class="row-title-16">Rest or Light Session</div>' +
      '<div  class="body-13">Readiness '+score+'/100 — body needs recovery</div></div></div>' +
      lightOpts.map(r=>'<div style="padding:6px 0;font-size:13px;color:var(--txt2);border-bottom:1px solid var(--border)">' + esc(r) + '</div>').join('') +
      '</div>' +
      '<div  class="pad-x-16-b"><button type="button" class="btn btn-secondary" onclick="go(\'workout\')">Log Light Session</button></div>';
  }

  const warmupItems = (splitDay.warmup||[]).map(w =>
    '<div style="padding:6px 0;font-size:13px;color:var(--txt2);border-bottom:1px solid var(--border)">' + esc(w) + '</div>'
  ).join('');

  const mainExercises = (splitDay.exercises||[]).map(name => {
    const ex = ExDB.byName(name);
    const suggest = WeightEngine.suggest(name, user);
    const progNote = WeightEngine.progressionNote(name);
    const sets = user.goal === 'strength' ? '5 × 3-5' : user.goal === 'fat_loss' ? '3 × 12-15' : '4 × 8-12';
    const injWarn = MuscleEngine.injuryWarning(name);

    const exMuscles = ex ? (ex.muscles && ex.muscles.primary ? ex.muscles.primary : []) : [];
    const fatiguedMuscle = exMuscles.find(m => {
      const key = MMAP[m] || m;
      const pct = statusMap[key];
      return pct !== undefined && pct < 80;
    });
    const fatiguePct = fatiguedMuscle ? Math.round(statusMap[MMAP[fatiguedMuscle]||fatiguedMuscle]||0) : null;

    return '<div style="padding:12px 0;border-bottom:1px solid var(--border)">' +
      '<div style="display:flex;align-items:flex-start;gap:10px">' +
      '<div style="width:32px;display:flex;justify-content:center;color:var(--c1)">'+(typeof exChromeIcon==='function'?exChromeIcon(ex||name,22):'')+'</div>' +
      '<div  class="flex-1">' +
      '<div  class="row-title-14">' +
        (fatiguedMuscle?'<span style="color:#f5c842;font-weight:700">Fatigue · </span>':'') +
        (injWarn?'<span style="color:#ff4444;font-weight:700">Caution · </span>':'') +
        esc(name)+'</div>' +
      '<div  class="muted-12">'+sets+(suggest?' · Try '+(suggest||'—')+'kg':'')+'</div>' +
      (fatiguedMuscle?'<div style="font-size:11px;color:#f5c842;margin-top:2px">'+fatiguePct+'% recovery — consider reduced volume</div>':'') +
      (injWarn?'<div style="font-size:11px;color:#ff4444;margin-top:2px">Injury caution: '+esc(injWarn)+'</div>':'') +
      (!fatiguedMuscle&&!injWarn&&progNote?'<div style="font-size:11px;color:#10B981;margin-top:2px">'+esc(progNote)+'</div>':'') +
      '</div></div></div>';
  }).join('');

  const cooldownItems = ['Quad stretch 30s each','Hip flexor stretch 30s each','Chest doorway stretch 30s','Child\'s pose 60s','Spinal twist 30s each side'].map(s=>
    '<div style="padding:6px 0;font-size:13px;color:var(--txt2);border-bottom:1px solid var(--border)">' + esc(s) + '</div>'
  ).join('');

  return sh('Today\'s Program') + deloadBanner +
    '<div class="warmup-card"><div class="warmup-title">Warm-Up Protocol</div>'+warmupItems+'</div>' +
    '<div class="card card-solid mb-14" >' +
    '<div style="font-size:16px;font-weight:800;color:var(--txt);margin-bottom:4px">'+esc(splitDay.n||'Rest Day')+'</div>' +
    '<div style="font-size:12px;color:var(--txt3);margin-bottom:12px">'+esc(prettyMuscles(splitDay.muscles))+'</div>' +
    mainExercises + '</div>' +
    '<div class="warmup-card">' +
    '<div class="warmup-title">Cardio Recommendation</div>' +
    '<div style="font-size:16px;font-weight:700;color:var(--c1);margin-bottom:4px">'+esc(cardioRec.machine)+'</div>' +
    '<div style="font-size:13px;color:var(--txt2);margin-bottom:4px">'+esc(cardioRec.duration)+'</div>' +
    '<div style="font-size:13px;color:var(--txt3);margin-bottom:12px">'+esc(cardioRec.details)+'</div>' +
    '<button type="button" class="btn btn-secondary w-full" onclick="showLogCardio()" >Log Cardio</button>' +
    '</div>' +
    '<div class="warmup-card"><div class="warmup-title">Cooldown Stretches</div>'+cooldownItems+'</div>' +
    '<div  class="pad-x-16-b"><button type="button" class="btn btn-primary" onclick="go(\'workout\')">Start Workout</button></div>';
}

/* ── IMPROVEMENT 2: Progression Analysis per Exercise ── */
function _progressionAnalysisBlock() {
  const ws = S.g('workouts') || [];
  if (!ws.length) return '';

  const recentExNames = [];
  const seen = {};
  ws.slice(-5).reverse().forEach(wo => {
    (wo.exercises||[]).forEach(ex => {
      if (!seen[ex.name] && (ex.sets||[]).some(s=>s.done&&(s.weight||0)>0)) {
        seen[ex.name] = true;
        recentExNames.push(ex.name);
      }
    });
  });

  if (!recentExNames.length) return '';

  const u = S.g('user.units') === 'imperial' ? 'lb' : 'kg';
  const cards = [];
  recentExNames.slice(0,6).forEach(name => {
    const prog = CoachEngine.exerciseProgression(name);
    if (prog) cards.push(prog);
  });

  if (!cards.length) return '';

  const cardHtml = cards.map(prog => {
    const changeColor = !prog.pctChange ? 'var(--txt3)' : prog.pctChange > 0 ? '#10B981' : '#ff6b35';
    const changeLabel = !prog.pctChange ? 'No 4-wk data' : (prog.pctChange > 0 ? '↑' : '↓') + Math.abs(prog.pctChange) + '% vs 4wks';
    return '<div style="padding:14px 0;border-bottom:1px solid var(--border)">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
      '<div  class="row-title-14">'+esc(prog.name)+'</div>' +
      '<div style="font-size:12px;color:'+changeColor+';font-weight:600">'+esc(changeLabel)+'</div>' +
      '</div>' +
      '<div style="display:flex;gap:10px;margin-bottom:6px">' +
      '<div  class="flex-1">' +
      '<div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.05em">Best set</div>' +
      '<div style="font-size:14px;font-weight:700;color:var(--c1)">'+prog.currentWeight+u+' × '+prog.currentReps+'</div>' +
      '</div>' +
      '<div  class="flex-1">' +
      '<div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.05em">Est. 1RM</div>' +
      '<div  class="row-title-14">'+prog.currentE1RM+u+'</div>' +
      '</div>' +
      '<div  class="flex-1">' +
      '<div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.05em">Next target</div>' +
      '<div style="font-size:14px;font-weight:700;color:'+(prog.plateau?'#f5c842':'#10B981')+'">'+prog.suggestedWeight+u+'</div>' +
      '</div>' +
      '</div>' +
      (prog.plateau ? '<div style="font-size:12px;color:#f5c842;background:rgba(245,200,66,0.1);padding:6px 8px;border-radius:8px">Plateau — '+prog.sessions+' sessions, 1RM unchanged. Try technique variation or a planned deload.</div>' : '') +
      '</div>';
  }).join('');

  return sh('Progression Analysis', 'All PRs', 'go(\'progress\')') +
    '<div class="card card-solid mx-card" >'+cardHtml+'</div>';
}

/* ── IMPROVEMENT 3: Weekly Summary Card ── */
function _weeklySummaryBlock(report) {
  if (!report) return '';
  const volLabel = report.thisVol > 1000 ? Math.round(report.thisVol/100)/10+'t' : report.thisVol+'kg';
  const changeColor = report.change > 0 ? '#10B981' : report.change < 0 ? '#ff6b35' : 'var(--txt3)';
  const changeLabel = report.change !== 0 ? (report.change>0?'↑':'↓')+Math.abs(report.change)+'% vs last week' : 'Same as last week';
  const completionPct = Math.round((report.weekWorkouts / Math.max(report.weeklyGoal,1)) * 100);

  return sh('Weekly Summary', 'Full history', 'go(\'progress\')') +
    '<div class="card card-solid mx-card" >' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">' +
    '<div class="tile-12">' +
    '<div  class="micro-label mb-6">Volume</div>' +
    '<div style="font-size:22px;font-weight:900;color:var(--c1)">'+esc(volLabel)+'</div>' +
    '<div style="font-size:12px;color:'+changeColor+';margin-top:2px">'+esc(changeLabel)+'</div>' +
    '</div>' +
    '<div class="tile-12">' +
    '<div  class="micro-label mb-6">Workouts</div>' +
    '<div style="font-size:22px;font-weight:900;color:var(--txt)">'+report.weekWorkouts+'/'+report.weeklyGoal+'</div>' +
    '<div style="font-size:12px;color:'+(completionPct>=100?'#10B981':'var(--txt3)')+';margin-top:2px">'+(completionPct>=100?'Goal hit':completionPct+'% of goal')+'</div>' +
    '</div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">' +
    (report.bestMuscle ?
      '<div class="tile-12">' +
      '<div  class="micro-label mb-6">Best Recovered</div>' +
      '<div style="font-size:15px;font-weight:800;color:#10B981">'+esc(report.bestMuscle)+'</div>' +
      '<div  class="muted-12 mt-2">'+Math.round(report.bestMuscleScore)+'% ready</div>' +
      '</div>' : '<div></div>') +
    (report.mostImproved ?
      '<div class="tile-12">' +
      '<div  class="micro-label mb-6">Most Improved</div>' +
      '<div style="font-size:14px;font-weight:800;color:var(--c1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(report.mostImproved.name)+'</div>' +
      '<div style="font-size:12px;color:#10B981;margin-top:2px">+'+report.mostImproved.gain+'% 1RM</div>' +
      '</div>' : '<div></div>') +
    '</div>' +
    '<div class="tile-12">' +
    '<div  class="micro-label mb-6">Current Readiness</div>' +
    '<div style="display:flex;align-items:center;gap:8px">' +
    '<div style="font-size:22px;font-weight:900;color:'+(report.currentReadiness>=70?'#10B981':report.currentReadiness>=50?'#f5c842':'#ff6b35')+'">'+report.currentReadiness+'</div>' +
    '<div  class="muted-13">/ 100 — '+ReadinessEngine.label(report.currentReadiness).l+'</div>' +
    '</div></div>' +
    '</div>';
}

function _weeklyInsightsBlock(insights) {
  const insightCards = insights.map(ins =>
    '<div class="insight-card"><div class="insight-icon">'+ins.i+'</div>' +
    '<div class="insight-label" style="color:'+ins.c+'">'+esc(ins.t)+'</div>' +
    '<div class="insight-text">'+esc(ins.m)+'</div></div>'
  ).join('');
  return sh('Coach Insights') + insightCards;
}

function _suppTimingBlock(userSupps, user) {
  if (!userSupps.length) return '';
  const timingOrder = ['morning','pre','intra','post','with_meal','night','anytime'];
  const timingLabels = { morning:'Morning',pre:'Pre-Workout',intra:'During',post:'Post-Workout',with_meal:'With Meal',night:'Before Bed',anytime:'Any Time' };
  const grouped = {};
  userSupps.forEach(s => {
    const t = s.timing || 'anytime';
    if (!grouped[t]) grouped[t] = [];
    grouped[t].push(s);
  });

  const timeline = timingOrder.filter(t => grouped[t]&&grouped[t].length).map(t => {
    const items = grouped[t].map(s => {
      const dbEntry = SupplementDB.find(d => d.id === s.id) || {};
      const cafWarn = user.caffeineWarning && dbEntry.caffeine ?
        SupplementEngine.checkCaffeineWarning(dbEntry, 22) : null;
      return '<div class="supp-time-item">' +
        '<div style="width:32px;display:flex;justify-content:center">' + icon('pill', 22) + '</div>' +
        '<div  class="flex-1">' +
        '<div  class="row-strong">'+esc(s.name)+'</div>' +
        '<div  class="muted-12">'+esc(s.dose||dbEntry.dose||'')+'</div>' +
        (dbEntry.notes?'<div  class="muted-12 mt-2">'+esc(dbEntry.notes)+'</div>':'') +
        (cafWarn?'<div style="font-size:12px;color:#f5c842;margin-top:4px">'+esc(cafWarn)+'</div>':'') +
        '</div></div>';
    }).join('');
    return '<div class="supp-time-group">' +
      '<div class="supp-time-label">'+esc(timingLabels[t]||t)+'</div>' +
      items + '</div>';
  }).join('');

  return sh('Supplement Schedule') + '<div class="supp-timeline">'+timeline+'</div>';
}

function _deloadBlock(user) {
  const ws = S.g('workouts') || [];
  const needsDeload = WeightEngine.deloadCheck(user, ws);
  if (!needsDeload) return '';
  return sh('Recovery Alert') +
    '<div class="ai-msg" style="border-left-color:#f5c842">' +
    '<div class="ai-msg-header"><span class="c-warn">' + icon('alert', 16) + '</span><span class="ai-msg-label c-warn">Deload Recommended</span></div>' +
    '<div class="ai-msg-text">5+ weeks of progressive training detected. A lower-volume week may reduce accumulated fatigue. Adjust based on performance, soreness, and recovery.</div></div>';
}

window.showLogCardio = function() {
  const rec = CoachEngine.cardioRec(SplitEngine.getSplitDay());
  modal('Log Cardio',
    '<div class="field-wrap"><label class="field-label">Type</label>' +
    '<input id="cardio-type" class="field" type="text" value="'+esc(rec.machine||'')+'"></div>' +
    '<div class="field-row">' +
    '<div class="field-wrap"><label class="field-label">Duration (min)</label><input id="cardio-dur" class="field" type="number" value="20"></div>' +
    '<div class="field-wrap"><label class="field-label">Calories</label><input id="cardio-cal" class="field" type="number" placeholder="200"></div>' +
    '</div>' +
    '<div class="field-wrap"><label class="field-label">Notes</label><input id="cardio-notes" class="field" type="text" placeholder="e.g. Zone 2, felt good"></div>',
    '<button type="button" class="btn btn-primary" onclick="saveCardioLog()">Save</button>'
  );
};

window.saveCardioLog = function() {
  const type = document.getElementById('cardio-type')?.value || 'Cardio';
  const dur = parseInt(document.getElementById('cardio-dur')?.value) || 0;
  const cal = parseInt(document.getElementById('cardio-cal')?.value) || 0;
  const notes = document.getElementById('cardio-notes')?.value || '';
  S.push('cardioLogs', { type, duration: dur, calories: cal, notes, date: today(), time: isoNow() });
  closeModal();
  toast('Cardio logged', 'ok');
};
