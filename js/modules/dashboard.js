'use strict';
/* ── PulseCap — Dashboard ── */

const THEMES = ['carbon','aurora','sunset','midnight','electric','stealth','forest','light'];
function _nextTheme(t) { const i = THEMES.indexOf(t); return THEMES[(i+1)%THEMES.length]; }

reg('dashboard', function() {
  try {
    const user = S.g('user') || {};
    const ws = S.g('workouts') || [];
    const prs = S.g('prs') || [];
    const score = ReadinessEngine.score();
    const streak = StreakEngine.get();
    const weekWkts = StreakEngine.weekWorkouts();
    const splitDay = SplitEngine.getSplitDay();
    const muscles = MuscleEngine.status();
    const name = (user.name || 'Athlete').split(' ')[0];
    const hr = new Date().getHours();
    const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    const todayStr = new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long' });
    const isDemoMode = S.activeId() === 'demo';
    const scoreColor = score >= 80 ? 'var(--c3)' : score >= 60 ? 'var(--c1)' : score >= 40 ? 'var(--c5)' : 'var(--c4)';

    /* ── DEMO BANNER ── */
    const demoBanner = isDemoMode ?
      '<div style="background:linear-gradient(135deg,rgba(123,95,255,0.15),rgba(0,213,255,0.08));border-bottom:1px solid rgba(123,95,255,0.2);padding:10px 16px;display:flex;align-items:center;justify-content:space-between">' +
      '<div style="font-size:13px;color:var(--c2);font-weight:600;display:flex;align-items:center;gap:6px"><span style="display:inline-flex;color:var(--c2)">' + icon('sparkles', 14) + '</span>Demo Mode</div>' +
      '<button type="button" onclick="go(\'profiles\')" style="font-size:12px;color:var(--c1);font-weight:600;background:none;border:none;cursor:pointer;touch-action:manipulation">Switch →</button>' +
      '</div>' : '';

    /* ── TOPBAR ── */
    const avatarLetter = (user.name || 'A').charAt(0).toUpperCase();
    const topbar = '<div class="topbar">' +
      '<div class="topbar-left">' +
      '<div><div  class="row-title">' + esc(greeting) + ', ' + esc(name) + '</div>' +
      '<div  class="muted-11">' + esc(todayStr) + '</div></div>' +
      '</div>' +
      '<div class="topbar-right">' +
      '<button type="button" class="topbar-icon press" onclick="go(\'search\')" aria-label="Search" style="display:flex;align-items:center;justify-content:center">' + icon('search', 18) + '</button>' +
      '<div onclick="go(\'profiles\')" style="width:32px;height:32px;border-radius:50%;background:var(--grad);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:800;color:#fff;cursor:pointer;touch-action:manipulation;flex-shrink:0">' + avatarLetter + '</div>' +
      '</div></div>';

    /* ── HERO CARD ── */
    const plan = typeof PlanEngine !== 'undefined' ? PlanEngine.build(user) : null;
    const dd = typeof DailyDecision !== 'undefined' ? DailyDecision.decide() : null;
    const debtVal = (function() {
      try { return typeof RecoveryDebtEngine !== 'undefined' ? RecoveryDebtEngine.calculate() : 0; } catch(e) { return 0; }
    })();
    const heroGrad = (function() {
      if (!dd) return 'linear-gradient(135deg,rgba(123,95,255,0.15),rgba(0,213,255,0.08))';
      const t = (dd.type || dd.title || '').toLowerCase();
      if (t.includes('rest') || t.includes('light') || t.includes('recover')) {
        return 'linear-gradient(135deg,rgba(255,69,58,0.12),rgba(255,159,10,0.06))';
      } else if (t.includes('deload') || t.includes('easy')) {
        return 'linear-gradient(135deg,rgba(245,200,66,0.12),rgba(175,82,222,0.06))';
      }
      return 'linear-gradient(135deg,rgba(123,95,255,0.15),rgba(0,213,255,0.08))';
    })();
    const radius = 22;
    const circ = 2 * Math.PI * radius;
    const arcLen = (score / 100) * circ;
    const scoreArc = '<svg width="52" height="52" viewBox="0 0 52 52" style="flex-shrink:0">' +
      '<circle cx="26" cy="26" r="' + radius + '" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="4"/>' +
      '<circle cx="26" cy="26" r="' + radius + '" fill="none" stroke="' + scoreColor + '" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + arcLen.toFixed(1) + ' ' + circ.toFixed(1) + '" transform="rotate(-90 26 26)"/>' +
      '<text x="26" y="30" text-anchor="middle" font-size="12" font-weight="800" fill="' + scoreColor + '">' + score + '</text>' +
      '</svg>';
    const heroTap = (dd && (dd.type || dd.title || '').toLowerCase().match(/rest|recover|light/)) ? 'recovery-debt' : 'body-intelligence';
    const sessionDecision = dd ? dd.decision : 'train';
    const isRestDay = sessionDecision === 'rest';
    const isLightDay = sessionDecision === 'light';
    const sessionHeader = isRestDay ? "Today's Guidance" : isLightDay ? 'Light Session' : "Today's Session";
    const sessionTitle = isRestDay
      ? esc(dd.title || 'Recovery Priority')
      : esc(splitDay.n || (isLightDay ? 'Modified Split' : 'Rest & Recover'));
    const sessionSub = isRestDay
      ? esc((dd && dd.reason) || 'Focus on recovery — optional light movement only.')
      : isLightDay
        ? esc((dd && dd.reason) || 'Reduce volume and intensity today.')
        : esc(prettyMuscles(splitDay.muscles, 3)) +
          (splitDay.exercises && splitDay.exercises.length ? ' · ' + splitDay.exercises.length + ' exercises' : '');
    const sessionBtn = isRestDay
      ? '<button type="button" onclick="go(\'recovery-debt\')" style="width:100%;padding:11px;border-radius:12px;background:rgba(255,255,255,0.2);border:1.5px solid rgba(255,255,255,0.3);color:#fff;font-size:14px;font-weight:700;cursor:pointer;touch-action:manipulation;margin-top:8px">View Recovery Plan</button>' +
        (dd && dd.allowTrain ? '<button type="button" onclick="startWorkout&&startWorkout()" style="width:100%;padding:9px;border-radius:12px;background:transparent;border:1px solid rgba(255,255,255,0.25);color:rgba(255,255,255,0.85);font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation;margin-top:8px">Train anyway</button>' : '')
      : isLightDay
        ? '<button type="button" onclick="startWorkout&&startWorkout()" style="width:100%;padding:11px;border-radius:12px;background:rgba(255,255,255,0.2);border:1.5px solid rgba(255,255,255,0.3);color:#fff;font-size:14px;font-weight:700;cursor:pointer;touch-action:manipulation;margin-top:8px">Light Session</button>'
        : '<button type="button" onclick="startWorkout&&startWorkout()" style="width:100%;padding:11px;border-radius:12px;background:rgba(255,255,255,0.2);border:1.5px solid rgba(255,255,255,0.3);color:#fff;font-size:14px;font-weight:700;cursor:pointer;touch-action:manipulation;margin-top:8px">Start Workout</button>' +
          '<button type="button" onclick="confirmSkipToday()" style="width:100%;padding:8px;border-radius:12px;background:transparent;border:none;color:rgba(255,255,255,0.65);font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;margin-top:6px">Can\'t train today?</button>';
    const startQuickAction = isRestDay
      ? '<button type="button" onclick="go(\'recovery-debt\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px 8px;text-align:center;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:6px;width:100%">' +
        '<span style="color:var(--c4);display:flex">' + icon('bed', 26) + '</span>' +
        '<span class="micro-label">Recovery</span>' +
        '</button>'
      : '<button type="button" onclick="startWorkout&&startWorkout()" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px 8px;text-align:center;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:6px;width:100%">' +
        '<span style="color:var(--c1);display:flex">' + icon('dumbbell', 26) + '</span>' +
        '<span class="micro-label">Start</span>' +
        '</button>';
    const heroCard = '<div onclick="go(\'' + heroTap + '\')" class="card-press" style="margin:0 16px 20px;border-radius:16px;background:' + heroGrad + ';border:1px solid var(--border);padding:22px 20px;cursor:pointer;touch-action:manipulation;box-shadow:var(--ds2)">' +
      '<div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:16px">' +
      ((dd && dd.ic) ? iconTile(dd.ic, dd.tint || 'c1', 56) : (typeof iconTile === 'function' ? iconTile('dumbbell', 'c1', 56) : '')) +
      '<div  class="flex-1">' +
      '<div style="font-size:22px;font-weight:800;color:var(--txt);line-height:1.25;letter-spacing:-0.4px">' + esc(dd ? dd.title : (plan ? splitDay.n || 'Ready to Train' : 'Ready to Train')) + '</div>' +
      '<div style="font-size:13px;color:var(--txt2);margin-top:8px;line-height:1.5">' + esc(plan ? plan.message : (dd ? (dd.reason || (dd.actions && dd.actions[0]) || '') : 'Tap to see your recommendation')) + '</div>' +
      '</div>' +
      scoreArc +
      '</div>' +
      '<div style="display:flex;gap:10px">' +
      '<div style="flex:1;background:rgba(255,255,255,0.06);border-radius:16px;padding:10px;text-align:center">' +
      '<div style="font-size:14px;font-weight:800;color:' + scoreColor + '">' + score + '/100</div>' +
      '<div style="font-size:9px;color:var(--txt3);font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-top:3px">Readiness</div>' +
      '</div>' +
      '<div style="flex:1;background:rgba(255,255,255,0.06);border-radius:16px;padding:10px;text-align:center">' +
      '<div style="font-size:14px;font-weight:800;color:var(--c4)">' + debtVal + '</div>' +
      '<div style="font-size:9px;color:var(--txt3);font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-top:3px">Debt</div>' +
      '</div>' +
      '<div style="flex:1;background:rgba(255,255,255,0.06);border-radius:16px;padding:10px;text-align:center">' +
      '<div style="font-size:14px;font-weight:800;color:var(--c5);display:flex;align-items:center;justify-content:center;gap:4px">' + icon('flame', 14, 'var(--c5)') + ' ' + streak + '</div>' +
      '<div style="font-size:9px;color:var(--txt3);font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-top:3px">Streak</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    /* ── QUICK ACTIONS ── */
    const quickActions = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:0 16px;margin-bottom:20px">' +
      startQuickAction +
      '<button type="button" onclick="go(\'recovery\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px 8px;text-align:center;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:6px;width:100%">' +
      '<span style="color:var(--c3);display:flex">' + icon('chart', 26) + '</span>' +
      '<span class="micro-label">Check In</span>' +
      '</button>' +
      '<button type="button" onclick="go(\'assistant\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px 8px;text-align:center;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:6px;width:100%">' +
      '<span style="color:var(--c2);display:flex">' + icon('sparkles', 26) + '</span>' +
      '<span class="micro-label">Smart Coach</span>' +
      '</button>' +
      '<button type="button" onclick="go(\'search\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px 8px;text-align:center;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:6px;width:100%">' +
      '<span style="color:var(--txt2);display:flex">' + icon('search', 26) + '</span>' +
      '<span class="micro-label">Search</span>' +
      '</button>' +
      '</div>';

    /* ── TODAY'S WORKOUT ── */
    const todayWorkout = '<div style="margin:0 16px 20px;border-radius:16px;background:var(--grad);padding:18px 20px;position:relative;overflow:hidden;box-shadow:var(--ds2)">' +
      '<div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.06)"></div>' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.7);margin-bottom:4px">' + sessionHeader + '</div>' +
      '<div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:2px">' + sessionTitle + '</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:12px">' + sessionSub + '</div>' +
      (function() {
        const injSwaps = (splitDay._swaps || []).filter(function(s){ return s.injury; });
        if (!injSwaps.length || isRestDay) return '';
        const parts = injSwaps.map(function(s){ return s.injury; }).filter(function(v,i,a){ return a.indexOf(v)===i; });
        return '<div style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:10px;padding:5px 10px;margin-bottom:12px;font-size:11px;font-weight:700;color:#fff">🩹 Modified for ' + esc(parts.join(', ')) + '</div>';
      })() +
      (typeof renderSplitDayPicker === 'function' && !isRestDay ? renderSplitDayPicker({ compact: true }).replace(/var\(--txt3\)/g, 'rgba(255,255,255,0.55)').replace(/var\(--border\)/g, 'rgba(255,255,255,0.25)').replace(/var\(--bg3\)/g, 'rgba(255,255,255,0.08)').replace(/var\(--c1\)/g, '#fff').replace(/rgba\(0,213,255,0\.12\)/g, 'rgba(255,255,255,0.2)') : '') +
      sessionBtn +
      '</div>';

    /* Recovery stats now live in hero card — skip duplicate grid */

    /* ── MUSCLE RECOVERY MINI ── */
    const trainedMuscles = muscles
      .filter(function(m) { return m.hrs !== null && m.hrs !== undefined && m.pct < 100; })
      .sort(function(a, b) { return a.pct - b.pct; })
      .slice(0, 5);
    const muscleRecoveryMini = trainedMuscles.length ?
      '<div  class="mb-14">' +
      '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);padding:0 16px;margin-bottom:8px">Muscle Recovery</div>' +
      '<div style="display:flex;gap:8px;padding:0 16px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch">' +
      trainedMuscles.map(function(m) {
        const c = m.pct >= 80 ? 'var(--c3)' : m.pct >= 50 ? 'var(--c5)' : 'var(--c4)';
        return '<div onclick="go(\'body-intelligence\')" style="flex-shrink:0;background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:10px 12px;cursor:pointer;touch-action:manipulation;min-width:84px">' +
          '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">' +
          '<div style="width:8px;height:8px;border-radius:50%;background:' + c + ';flex-shrink:0"></div>' +
          '<div style="font-size:11px;color:var(--txt);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:58px">' + esc(m.name) + '</div>' +
          '</div>' +
          '<div style="height:3px;background:var(--bg4);border-radius:2px;overflow:hidden;margin-bottom:4px">' +
          '<div style="width:' + m.pct + '%;height:3px;background:' + c + ';border-radius:2px"></div>' +
          '</div>' +
          '<div style="font-size:11px;font-weight:700;color:' + c + '">' + m.pct + '%</div>' +
          '</div>';
      }).join('') +
      '</div></div>' : '';

    /* ── ACTIVE QUEST CARD ── */
    if (typeof AchievementEngine2 !== 'undefined') { try { AchievementEngine2.checkAll(); } catch(e) {} }
    const activeQuestCard = (function() {
      try {
        const noCTA = '<div onclick="go(\'quests\')" style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:12px 16px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;justify-content:space-between">' +
          '<div  class="body-13">⚔️ Start a Quest</div>' +
          '<div  class="muted-12">→</div></div>';
        if (typeof QuestEngine === 'undefined') return noCTA;
        QuestEngine.updateProgress();
        const active = QuestEngine.getActive();
        if (!active.length) return noCTA;
        const q = active[0];
        const pct = QuestEngine.questProgress(q);
        return '<div onclick="go(\'quests\')" style="margin:0 16px 14px;background:linear-gradient(135deg,rgba(123,95,255,0.1),rgba(0,213,255,0.06));border:1px solid rgba(123,95,255,0.25);border-radius:16px;padding:14px 16px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:12px">' +
          '<div class="fs-28">' + q.icon + '</div>' +
          '<div  class="flex-1">' +
          '<div  class="row-title">' + esc(q.title) + '</div>' +
          '<div style="width:100%;height:4px;background:rgba(255,255,255,0.06);border-radius:2px;margin-top:6px"><div style="width:' + pct + '%;height:4px;border-radius:2px;background:var(--c1)"></div></div>' +
          '<div style="font-size:10px;color:var(--txt3);margin-top:3px">' + pct + '% complete</div>' +
          '</div><div  class="muted-12">›</div></div>';
      } catch(e) { return ''; }
    })();

    /* ── PROGRESS SNAPSHOT ── */
    const now = new Date();
    const thisMonthPRs = prs.filter(function(p) {
      const d = new Date(p.date || 0);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    }).length;
    const weekVol = ws.filter(function(w) {
      return (now - new Date(w.date || 0)) < 7 * 24 * 60 * 60 * 1000;
    }).reduce(function(a, w) { return a + (w.totalVol || 0); }, 0);
    const progressSnapshot = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0 16px;margin-bottom:14px">' +
      '<div onclick="go(\'progress\')" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px;text-align:center;cursor:pointer;touch-action:manipulation">' +
      '<div class="dash-stat-n" style="font-size:22px;font-weight:900;color:var(--c1);line-height:1">' + weekWkts.length + '/' + (user.weeklyGoal || 4) + '</div>' +
      '<div style="font-size:9px;color:var(--txt3);margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Sessions</div>' +
      '</div>' +
      '<div onclick="go(\'progress\')" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px;text-align:center;cursor:pointer;touch-action:manipulation">' +
      '<div class="dash-stat-n" style="font-size:22px;font-weight:900;color:var(--c2);line-height:1">' + Math.round(weekVol) + '</div>' +
      '<div style="font-size:9px;color:var(--txt3);margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">Vol (kg)</div>' +
      '</div>' +
      '<div onclick="go(\'progress\')" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px;text-align:center;cursor:pointer;touch-action:manipulation">' +
      '<div class="dash-stat-n" style="font-size:22px;font-weight:900;color:var(--c3);line-height:1">' + thisMonthPRs + '</div>' +
      '<div style="font-size:9px;color:var(--txt3);margin-top:4px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em">PRs / mo</div>' +
      '</div>' +
      '</div>';

    /* ── LAST WORKOUT ── */
    const lastWkt = ws[ws.length - 1];
    const lastWktCard = lastWkt ?
      '<div  class="mx-card">' +
      '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:8px">Last Session</div>' +
      '<div onclick="go(\'progress\')" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px 16px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;justify-content:space-between">' +
      '<div>' +
      '<div style="font-size:14px;font-weight:700;color:var(--txt);margin-bottom:2px">' + esc(lastWkt.name || 'Workout') + '</div>' +
      '<div  class="muted-12">' +
      esc(lastWkt.date || '') +
      (lastWkt.duration ? ' · ' + lastWkt.duration + 'min' : '') +
      (lastWkt.totalVol ? ' · ' + Math.round(lastWkt.totalVol) + 'kg' : '') +
      '</div>' +
      '</div>' +
      '<div style="color:var(--txt3);font-size:18px">›</div>' +
      '</div></div>' : '';

    /* ── Morning briefing (optional card, not full-screen intercept) ── */
    const briefingCard = (function() {
      if (S.g('settings.dailyBriefing') === false) return '';
      const todayStr = localISO(new Date());
      if (S.g('settings.lastBriefingDate') === todayStr) return '';
      const coachMsg = ReadinessEngine.coachQuote(score, user.coachPersonality || 'maya');
      return '<div style="margin:0 16px 14px;border-radius:18px;padding:14px 16px;' +
        'background:linear-gradient(135deg,rgba(0,213,255,0.1),rgba(123,95,255,0.08));' +
        'border:1px solid rgba(0,213,255,0.2);display:flex;align-items:center;gap:12px">' +
        '<div style="font-size:28px;flex-shrink:0">' + iconTile('sun', 'c5', 36) + '</div>' +
        '<div  class="flex-1">' +
        '<div style="font-size:13px;font-weight:700;color:var(--txt);margin-bottom:3px">Morning Briefing</div>' +
        '<div style="font-size:11px;color:var(--txt3);line-height:1.45;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">' + esc(coachMsg) + '</div>' +
        '</div>' +
        '<button type="button" onclick="openMorningBriefing()" style="flex-shrink:0;padding:8px 12px;border-radius:10px;' +
        'background:var(--grad);border:none;color:#fff;font-size:11px;font-weight:700;cursor:pointer;touch-action:manipulation">Open</button>' +
        '</div>';
    })();

    const firstWorkoutEmpty = !ws.length ?
      emptyState(icon('dumbbell', 40), 'Day one', 'Your plan\'s built. The first session is the hardest button you\'ll ever press.', 'Start Workout', 'startWorkout&&startWorkout()') : '';

    const moreRow = '<div  class="mx-card">' +
      '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:8px">Browse</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
      '<button type="button" onclick="go(\'hub\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:12px 10px;font-size:12px;font-weight:700;color:var(--txt2);cursor:pointer;touch-action:manipulation;text-align:left;display:flex;align-items:center;gap:8px">' + icon('book', 16) + ' Learn</button>' +
      '<button type="button" onclick="go(\'search\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:12px 10px;font-size:12px;font-weight:700;color:var(--txt2);cursor:pointer;touch-action:manipulation;text-align:left;display:flex;align-items:center;gap:8px">' + icon('search', 16) + ' Search</button>' +
      '</div></div>';

    const todayWt = (S.g('bodyStats') || []).find(b => b.date === localISO(new Date()));
    const weightPrompt = !todayWt ?
      '<div style="margin:0 16px 14px;border-radius:16px;padding:14px 16px;background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:10px">' +
      iconTile('scale', 'c1') +
      '<div  class="flex-1"><div  class="row-title">Step on the scale?</div>' +
      '<div  class="muted-11 mt-2">Morning, before breakfast — that\'s the honest number</div></div>' +
      '<button type="button" class="btn btn-primary btn-sm" style="width:auto;padding:10px 16px;min-height:auto" onclick="showLogWeight()">Log</button></div>' : '';

    /* Weekly recap — Sunday evening through Monday */
    const recap = (typeof RecapEngine !== 'undefined' && RecapEngine.shouldShow()) ? RecapEngine.weekStats() : null;
    const recapCard = recap ?
      '<div style="margin:0 16px 14px;border-radius:16px;padding:18px;background:linear-gradient(135deg,rgba(0,213,255,0.14),rgba(48,209,88,0.08));border:1px solid rgba(0,213,255,0.28);position:relative">' +
      '<button type="button" onclick="dismissRecap()" aria-label="Dismiss" style="position:absolute;top:10px;right:12px;background:none;border:none;color:var(--txt3);font-size:16px;cursor:pointer;padding:4px;touch-action:manipulation">✕</button>' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--c1);margin-bottom:6px">Weekly coach report</div>' +
      '<div style="font-size:17px;font-weight:800;color:var(--txt);margin-bottom:12px">' +
      (recap.sessions === 0 ? 'Quiet week. This one\'s a fresh start.'
        : recap.sessions >= 4 ? recap.sessions + ' sessions. That\'s a real week of work.'
        : recap.sessions + ' session' + (recap.sessions > 1 ? 's' : '') + ' banked.') + '</div>' +
      '<div style="display:flex;gap:8px;margin-bottom:12px">' +
      '<div class="stat-flex"><div  class="row-title-16">' + (Math.round(recap.volume / 100) / 10) + 't</div><div class="micro-label-9">Volume</div></div>' +
      '<div class="stat-flex"><div style="font-size:15px;font-weight:800;color:var(--c5)">' + recap.prs + '</div><div class="micro-label-9">PRs</div></div>' +
      '<div class="stat-flex"><div style="font-size:15px;font-weight:800;color:var(--c1)">' + recap.streak + '</div><div class="micro-label-9">Streak</div></div>' +
      (recap.weightDelta !== null ? '<div class="stat-flex"><div  class="row-title-16">' + (recap.weightDelta > 0 ? '+' : '') + recap.weightDelta + '</div><div class="micro-label-9">kg</div></div>' : '') +
      '</div>' +
      (recap.coach && recap.coach.weak && recap.coach.weak.length ?
        '<div  class="mb-10">' +
        recap.coach.weak.slice(0, 3).map(function(r) {
          const label = typeof prettyMuscle === 'function' ? prettyMuscle(r.muscle) : r.muscle;
          const col = r.flag === 'missed' ? '#ff453a' : '#ff9f0a';
          return '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 10px;border-radius:10px;background:var(--bg3);margin-bottom:6px">' +
            '<div class="row-title-12">' + esc(label) + '</div>' +
            '<div style="font-size:11px;font-weight:700;color:' + col + '">' + r.sets + '/' + r.target + ' sets</div></div>';
        }).join('') + '</div>' : '') +
      (recap.coach && recap.coach.advice && recap.coach.advice.length ?
        '<div style="font-size:13px;line-height:1.45;color:var(--txt2);border-top:1px solid var(--border);padding-top:10px">' +
        esc(recap.coach.advice[0]) + '</div>' : '') +
      '</div>' : '';

    /* Morning check-in ritual — 30 seconds, feeds readiness */
    const checkedInToday = (function() {
      try { const r = S.g('recovery') || {}; return r.date === localISO(new Date()); } catch(e) { return false; }
    })();
    const checkinCard = (!checkedInToday && hr < 12) ?
      '<button type="button" onclick="go(\'recovery\')" class="dash-prompt" style="margin:0 16px 14px;width:calc(100% - 32px);border-radius:16px;padding:14px 16px;background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;touch-action:manipulation;text-align:left">' +
      iconTile('sun', 'c5') +
      '<div  class="flex-1"><div  class="row-title">30-second check-in</div>' +
      '<div  class="muted-11 mt-2">Sleep, soreness, mood — then I\'ll shape your day around it</div></div>' +
      '<span style="color:var(--c1);font-size:18px" aria-hidden="true">›</span></button>' : '';

    const dueSupps = typeof SupplementEngine !== 'undefined' ? SupplementEngine.getDueNow() : [];
    const suppPrompt = dueSupps.length ?
      '<button type="button" onclick="go(\'nutrition\')" class="dash-prompt" style="margin:0 16px 14px;width:calc(100% - 32px);border-radius:16px;padding:14px 16px;background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:10px;cursor:pointer;touch-action:manipulation;text-align:left">' +
      iconTile('pill', 'c2') +
      '<div  class="flex-1"><div  class="row-title">' + dueSupps.length + ' supplement' + (dueSupps.length > 1 ? 's' : '') + ' due</div>' +
      '<div  class="muted-11 mt-2">' + esc(dueSupps.slice(0, 3).map(function(s){ return s.name; }).join(', ')) + '</div></div>' +
      '<span style="color:var(--c1);font-size:18px" aria-hidden="true">›</span></button>' : '';

    const setupBanner = (S.g('settings.equipmentSetupPending') || !S.g('user.equipmentConfigured')) ?
      '<button type="button" onclick="go(\'equipment-setup\')" class="dash-prompt" style="margin:0 16px 14px;width:calc(100% - 32px);border-radius:16px;padding:14px 16px;background:rgba(0,213,255,0.08);border:1px solid rgba(0,213,255,0.2);display:flex;align-items:center;justify-content:space-between;gap:12px;cursor:pointer;touch-action:manipulation;text-align:left">' +
      iconTile('dumbbell', 'c1') +
      '<div  class="flex-1"><div style="font-size:13px;font-weight:700;color:var(--c1)">Set up your equipment</div>' +
      '<div  class="muted-11 mt-2">Home, gym, Life Fitness machines — get matched workouts</div></div>' +
      '<span style="color:var(--c1);font-size:18px" aria-hidden="true">›</span></button>' : '';

    const injuryAssess = typeof InjuriesDB !== 'undefined' ? InjuriesDB.assessActive() : { shouldRest: false, messages: [], count: 0 };
    const injuryBanner = injuryAssess.count > 0 && (injuryAssess.shouldRest || injuryAssess.messages.length) ?
      '<button type="button" onclick="go(\'rehab\')" class="dash-prompt" style="margin:0 16px 14px;width:calc(100% - 32px);border-radius:16px;padding:14px 16px;background:rgba(255,69,58,0.08);border:1px solid rgba(255,69,58,0.2);cursor:pointer;touch-action:manipulation;text-align:left">' +
      '<div style="font-size:13px;font-weight:700;color:#ff453a;margin-bottom:4px">' +
      (injuryAssess.shouldRest ? 'Consider a rest day' : 'Injury modifications active') +
      '</div>' +
      '<div style="font-size:11px;color:var(--txt3);line-height:1.45">' +
      esc(injuryAssess.messages.slice(0, 2).join(' · ') || 'Active injuries may swap exercises in today\'s workout') +
      '</div></button>' : '';

    const splitRec = S.g('settings.suggestedSplit');
    const splitBanner = splitRec && !S.g('user.splitConfirmed') ?
      '<div style="margin:0 16px 14px;border-radius:16px;padding:14px 16px;background:var(--bg3);border:1px solid var(--border)">' +
      '<div style="font-size:12px;font-weight:700;color:var(--txt3);margin-bottom:4px">SUGGESTED SPLIT</div>' +
      '<div  class="row-title-16">'+esc(splitRec.name)+'</div>' +
      '<div style="font-size:11px;color:var(--txt3);margin:6px 0 10px">'+esc(splitRec.reason)+'</div>' +
      '<button type="button" class="btn btn-primary btn-sm" onclick="applySuggestedSplit()">Use this split</button> ' +
      '<button type="button" class="btn btn-ghost btn-sm" onclick="go(\'settings\',{tab:\'training\'})">Choose another</button></div>' : '';

    /* ── ONE THING + SESSION RECAP (CoachKernel) ── */
    const oneThing = (typeof CoachKernel !== 'undefined' && CoachKernel.oneThing) ? CoachKernel.oneThing() : null;
    const oneThingCard = oneThing ?
      '<button type="button" onclick="go(\'' + esc(oneThing.go || 'workout') + '\')" class="dash-prompt" style="margin:0 16px 12px;width:calc(100% - 32px);border-radius:16px;padding:14px 16px;background:rgba(var(--c1-rgb),0.08);border:1px solid rgba(var(--c1-rgb),0.25);cursor:pointer;touch-action:manipulation;text-align:left">' +
      '<div style="font-size:11px;font-weight:700;color:var(--c1);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:4px">Focus today</div>' +
      '<div style="font-size:15px;font-weight:800;color:var(--txt);margin-bottom:4px">' + esc(oneThing.title) + '</div>' +
      '<div style="font-size:12px;color:var(--txt2);line-height:1.45">' + esc(oneThing.body) + '</div></button>' : '';

    const lastRecap = (typeof SessionRecap !== 'undefined' && SessionRecap.consumeCard) ? SessionRecap.consumeCard() : null;
    const recapSessionCard = lastRecap ?
      '<div style="margin:0 16px 12px;border-radius:16px;padding:14px 16px;background:var(--bg3);border:1px solid var(--border)">' +
      '<div style="font-size:11px;font-weight:700;color:var(--txt3);letter-spacing:0.06em;text-transform:uppercase;margin-bottom:6px">Last session</div>' +
      '<div style="font-size:14px;font-weight:800;color:var(--txt);margin-bottom:6px">' + esc(lastRecap.title || 'Session saved') + '</div>' +
      (lastRecap.lines || []).slice(0, 4).map(function(l) {
        return '<div style="font-size:12px;color:var(--txt2);line-height:1.45;margin-bottom:2px">' + esc(l) + '</div>';
      }).join('') +
      (lastRecap.nextHint ? '<div style="font-size:12px;color:var(--c1);font-weight:700;margin-top:8px">' + esc(lastRecap.nextHint) + '</div>' : '') +
      '</div>' : '';

    const meso = (typeof MesocycleEngine !== 'undefined') ? MesocycleEngine.summary() : null;
    const mesoChip = meso && !(typeof BeginnerMode !== 'undefined' && BeginnerMode.on()) ?
      '<div style="margin:0 16px 12px;font-size:12px;color:var(--txt3)">' + esc(meso.label) +
      ' · <button type="button" onclick="MesocycleEngine.reset();go(\'dashboard\')" style="background:none;border:none;color:var(--c1);font-size:12px;font-weight:700;cursor:pointer;padding:0">Reset block</button></div>' : '';

    /* Priority queue: show max 2 prompts on first paint; rest behind More */
    const promptQueue = [];
    if (oneThingCard) promptQueue.push({ pri: -1, html: oneThingCard });
    if (recapSessionCard) promptQueue.push({ pri: -0.5, html: recapSessionCard });
    if (recapCard) promptQueue.push({ pri: 0, html: recapCard });
    if (injuryBanner) promptQueue.push({ pri: 1, html: injuryBanner });
    if (checkinCard) promptQueue.push({ pri: 2, html: checkinCard });
    if (weightPrompt) promptQueue.push({ pri: 3, html: weightPrompt });
    if (suppPrompt) promptQueue.push({ pri: 4, html: suppPrompt });
    if (setupBanner) promptQueue.push({ pri: 5, html: setupBanner });
    if (splitBanner) promptQueue.push({ pri: 6, html: splitBanner });
    promptQueue.sort(function(a, b) { return a.pri - b.pri; });
    const topPrompts = promptQueue.slice(0, 2).map(function(p) { return p.html; }).join('');
    const overflowPrompts = promptQueue.slice(2).map(function(p) { return p.html; }).join('');

    const moreDisclosure = '<details style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:4px 0">' +
      '<summary style="padding:12px 16px;font-size:13px;font-weight:700;color:var(--txt2);cursor:pointer;touch-action:manipulation;list-style:none">More for today' +
      (overflowPrompts ? ' · ' + promptQueue.slice(2).length + ' more' : '') + '</summary>' +
      '<div style="padding:0 0 8px">' +
      overflowPrompts +
      (briefingCard || '') +
      (activeQuestCard || '') +
      (lastWktCard || '') +
      moreRow +
      '</div></details>';

    /* P5 first paint: hero + session + ≤2 prompts. Rest behind disclosure. */
    return demoBanner + topbar +
      topPrompts +
      mesoChip +
      heroCard +
      todayWorkout +
      (firstWorkoutEmpty || '') +
      moreDisclosure +
      '<div style="height:24px"></div>';

  } catch(e) {
    console.error('dashboard', e);
    return '<div style="padding:28px 20px;color:var(--txt);line-height:1.6">' +
      '<div style="font-size:32px;margin-bottom:12px">' + icon('alert', 32, '#ff453a') + '</div>' +
      '<strong>Dashboard error</strong><br><span style="color:var(--txt3);font-size:13px">' + esc(e.message) + '</span>' +
      '<br><br><button type="button" class="btn btn-secondary" onclick="go(\'dashboard\')">Retry</button></div>';
  }
});

window._nextTheme = _nextTheme;
window.openMorningBriefing = function() {
  S.set('settings.lastBriefingDate', localISO(new Date()));
  go('briefing');
};

window.applySuggestedSplit = function() {
  haptic(40);
  const rec = S.g('settings.suggestedSplit');
  if (!rec) return;
  S.set('user.split', rec.id);
  S.set('user.weeklyGoal', rec.daysPerWeek || 4);
  S.set('user.splitConfirmed', true);
  toast('Split set to ' + rec.name, 'ok');
  go('dashboard');
};
