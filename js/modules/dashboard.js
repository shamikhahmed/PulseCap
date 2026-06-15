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
      '<div style="font-size:13px;color:var(--c2);font-weight:600">🤖 Demo Mode</div>' +
      '<button onclick="go(\'profiles\')" style="font-size:12px;color:var(--c1);font-weight:600;background:none;border:none;cursor:pointer;touch-action:manipulation">Switch →</button>' +
      '</div>' : '';

    /* ── TOPBAR ── */
    const avatarLetter = (user.name || 'A').charAt(0).toUpperCase();
    const topbar = '<div class="topbar">' +
      '<div class="topbar-left">' +
      '<div><div style="font-size:13px;font-weight:700;color:var(--txt)">' + esc(greeting) + ', ' + esc(name) + '</div>' +
      '<div style="font-size:11px;color:var(--txt3)">' + esc(todayStr) + '</div></div>' +
      '</div>' +
      '<div class="topbar-right">' +
      '<button class="topbar-icon press" onclick="go(\'search\')" aria-label="Search">🔍</button>' +
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
    const heroCard = '<div onclick="go(\'' + heroTap + '\')" class="card-press" style="margin:0 16px 20px;border-radius:16px;background:' + heroGrad + ';border:1px solid var(--border);padding:22px 20px;cursor:pointer;touch-action:manipulation;box-shadow:var(--ds2)">' +
      '<div style="display:flex;align-items:flex-start;gap:14px;margin-bottom:16px">' +
      '<div style="font-size:52px;line-height:1;flex-shrink:0">' + (dd ? dd.emoji : '💪') + '</div>' +
      '<div style="flex:1;min-width:0">' +
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
      '<div style="font-size:14px;font-weight:800;color:var(--c5)">' + streak + ' 🔥</div>' +
      '<div style="font-size:9px;color:var(--txt3);font-weight:600;text-transform:uppercase;letter-spacing:0.06em;margin-top:3px">Streak</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    /* ── QUICK ACTIONS ── */
    const quickActions = '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:0 16px;margin-bottom:20px">' +
      '<button onclick="startWorkout&&startWorkout()" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px 8px;text-align:center;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:6px;width:100%">' +
      '<span style="font-size:26px">💪</span>' +
      '<span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--txt3)">Start</span>' +
      '</button>' +
      '<button onclick="go(\'recovery\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px 8px;text-align:center;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:6px;width:100%">' +
      '<span style="font-size:26px">📊</span>' +
      '<span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--txt3)">Check In</span>' +
      '</button>' +
      '<button onclick="go(\'assistant\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px 8px;text-align:center;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:6px;width:100%">' +
      '<span style="font-size:26px">🤖</span>' +
      '<span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--txt3)">Ask AI</span>' +
      '</button>' +
      '<button onclick="go(\'search\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px 8px;text-align:center;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:6px;width:100%">' +
      '<span style="font-size:26px">🔍</span>' +
      '<span style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--txt3)">Search</span>' +
      '</button>' +
      '</div>';

    /* ── TODAY'S WORKOUT ── */
    const todayWorkout = '<div style="margin:0 16px 20px;border-radius:16px;background:var(--grad);padding:18px 20px;position:relative;overflow:hidden;box-shadow:var(--ds2)">' +
      '<div style="position:absolute;top:-20px;right:-20px;width:100px;height:100px;border-radius:50%;background:rgba(255,255,255,0.06)"></div>' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.7);margin-bottom:4px">Today\'s Session</div>' +
      '<div style="font-size:18px;font-weight:800;color:#fff;margin-bottom:2px">' + esc(splitDay.n || 'Rest & Recover') + '</div>' +
      '<div style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:12px">' +
      esc((splitDay.muscles || []).slice(0, 3).join(' · ')) +
      (splitDay.exercises && splitDay.exercises.length ? ' · ' + splitDay.exercises.length + ' exercises' : '') +
      '</div>' +
      '<button onclick="startWorkout&&startWorkout()" style="width:100%;padding:11px;border-radius:12px;background:rgba(255,255,255,0.2);border:1.5px solid rgba(255,255,255,0.3);color:#fff;font-size:14px;font-weight:700;cursor:pointer;touch-action:manipulation">▶ Start Workout</button>' +
      '</div>';

    /* Recovery stats now live in hero card — skip duplicate grid */

    /* ── MUSCLE RECOVERY MINI ── */
    const trainedMuscles = muscles
      .filter(function(m) { return m.hrs !== null && m.hrs !== undefined && m.pct < 100; })
      .sort(function(a, b) { return a.pct - b.pct; })
      .slice(0, 5);
    const muscleRecoveryMini = trainedMuscles.length ?
      '<div style="margin-bottom:14px">' +
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
          '<div style="font-size:13px;color:var(--txt2)">⚔️ Start a Quest</div>' +
          '<div style="font-size:12px;color:var(--txt3)">→</div></div>';
        if (typeof QuestEngine === 'undefined') return noCTA;
        QuestEngine.updateProgress();
        const active = QuestEngine.getActive();
        if (!active.length) return noCTA;
        const q = active[0];
        const pct = QuestEngine.questProgress(q);
        return '<div onclick="go(\'quests\')" style="margin:0 16px 14px;background:linear-gradient(135deg,rgba(123,95,255,0.1),rgba(0,213,255,0.06));border:1px solid rgba(123,95,255,0.25);border-radius:16px;padding:14px 16px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:12px">' +
          '<div style="font-size:28px">' + q.icon + '</div>' +
          '<div style="flex:1">' +
          '<div style="font-size:13px;font-weight:700;color:var(--txt)">' + esc(q.title) + '</div>' +
          '<div style="width:100%;height:4px;background:rgba(255,255,255,0.06);border-radius:2px;margin-top:6px"><div style="width:' + pct + '%;height:4px;border-radius:2px;background:var(--c1)"></div></div>' +
          '<div style="font-size:10px;color:var(--txt3);margin-top:3px">' + pct + '% complete</div>' +
          '</div><div style="font-size:12px;color:var(--txt3)">›</div></div>';
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
      '<div style="margin:0 16px 14px">' +
      '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:8px">Last Session</div>' +
      '<div onclick="go(\'progress\')" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px 16px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;justify-content:space-between">' +
      '<div>' +
      '<div style="font-size:14px;font-weight:700;color:var(--txt);margin-bottom:2px">' + esc(lastWkt.name || 'Workout') + '</div>' +
      '<div style="font-size:12px;color:var(--txt3)">' +
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
      const todayStr = new Date().toISOString().slice(0, 10);
      if (S.g('settings.lastBriefingDate') === todayStr) return '';
      const coachMsg = ReadinessEngine.coachQuote(score, user.coachPersonality || 'maya');
      return '<div style="margin:0 16px 14px;border-radius:18px;padding:14px 16px;' +
        'background:linear-gradient(135deg,rgba(0,213,255,0.1),rgba(123,95,255,0.08));' +
        'border:1px solid rgba(0,213,255,0.2);display:flex;align-items:center;gap:12px">' +
        '<div style="font-size:28px;flex-shrink:0">☀️</div>' +
        '<div style="flex:1;min-width:0">' +
        '<div style="font-size:13px;font-weight:700;color:var(--txt);margin-bottom:3px">Morning Briefing</div>' +
        '<div style="font-size:11px;color:var(--txt3);line-height:1.45;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">' + esc(coachMsg) + '</div>' +
        '</div>' +
        '<button onclick="openMorningBriefing()" style="flex-shrink:0;padding:8px 12px;border-radius:10px;' +
        'background:var(--grad);border:none;color:#fff;font-size:11px;font-weight:700;cursor:pointer;touch-action:manipulation">Open</button>' +
        '</div>';
    })();

    const firstWorkoutEmpty = !ws.length ?
      emptyState('💪', 'First workout', 'Your split is ready — one tap to start logging sets.', '▶ Start Workout', 'startWorkout&&startWorkout()') : '';

    const moreRow = '<div style="margin:0 16px 14px">' +
      '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:8px">More</div>' +
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">' +
      '<button onclick="go(\'search\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:12px 6px;font-size:11px;font-weight:700;color:var(--txt2);cursor:pointer;touch-action:manipulation">🔍 Search</button>' +
      '<button onclick="go(\'academy\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:12px 6px;font-size:11px;font-weight:700;color:var(--txt2);cursor:pointer;touch-action:manipulation">🎓 Academy</button>' +
      '<button onclick="go(\'rehab\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:12px 6px;font-size:11px;font-weight:700;color:var(--txt2);cursor:pointer;touch-action:manipulation">🩹 Rehab</button>' +
      '<button onclick="go(\'anatomy\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:12px 6px;font-size:11px;font-weight:700;color:var(--txt2);cursor:pointer;touch-action:manipulation">🔬 Anatomy</button>' +
      '</div></div>';

    const todayWt = (S.g('bodyStats') || []).find(b => b.date === new Date().toISOString().slice(0, 10));
    const weightPrompt = !todayWt ?
      '<div style="margin:0 16px 14px;border-radius:16px;padding:14px 16px;background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:10px">' +
      '<div><div style="font-size:13px;font-weight:700;color:var(--txt)">⚖️ Weigh in today?</div>' +
      '<div style="font-size:11px;color:var(--txt3);margin-top:2px">Fasted morning weight tracks best</div></div>' +
      '<button class="btn btn-primary btn-sm" style="width:auto;padding:10px 16px;min-height:auto" onclick="showLogWeight()">Log</button></div>' : '';

    const setupBanner = (S.g('settings.equipmentSetupPending') || !S.g('user.equipmentConfigured')) ?
      '<div onclick="go(\'equipment-setup\')" style="margin:0 16px 14px;border-radius:16px;padding:14px 16px;background:rgba(0,213,255,0.08);border:1px solid rgba(0,213,255,0.2);display:flex;align-items:center;justify-content:space-between;cursor:pointer;touch-action:manipulation">' +
      '<div><div style="font-size:13px;font-weight:700;color:var(--c1)">🏋️ Set up your equipment</div>' +
      '<div style="font-size:11px;color:var(--txt3);margin-top:2px">Home, gym, Life Fitness machines — get matched workouts</div></div>' +
      '<span style="color:var(--c1);font-size:18px">›</span></div>' : '';

    const injuryAssess = typeof InjuriesDB !== 'undefined' ? InjuriesDB.assessActive() : { shouldRest: false, messages: [], count: 0 };
    const injuryBanner = injuryAssess.count > 0 && (injuryAssess.shouldRest || injuryAssess.messages.length) ?
      '<div onclick="go(\'settings\',{tab:\'profile\'})" style="margin:0 16px 14px;border-radius:16px;padding:14px 16px;background:rgba(255,69,58,0.08);border:1px solid rgba(255,69,58,0.2);cursor:pointer;touch-action:manipulation">' +
      '<div style="font-size:13px;font-weight:700;color:#ff453a;margin-bottom:4px">' +
      (injuryAssess.shouldRest ? '⚠️ Consider a rest day' : '🩹 Injury modifications active') +
      '</div>' +
      '<div style="font-size:11px;color:var(--txt3);line-height:1.45">' +
      esc(injuryAssess.messages.slice(0, 2).join(' · ') || 'Active injuries may swap exercises in today\'s workout') +
      '</div></div>' : '';

    const splitRec = S.g('settings.suggestedSplit');
    const splitBanner = splitRec && !S.g('user.splitConfirmed') ?
      '<div style="margin:0 16px 14px;border-radius:16px;padding:14px 16px;background:var(--bg3);border:1px solid var(--border)">' +
      '<div style="font-size:12px;font-weight:700;color:var(--txt3);margin-bottom:4px">SUGGESTED SPLIT</div>' +
      '<div style="font-size:15px;font-weight:800;color:var(--txt)">'+esc(splitRec.name)+'</div>' +
      '<div style="font-size:11px;color:var(--txt3);margin:6px 0 10px">'+esc(splitRec.reason)+'</div>' +
      '<button class="btn btn-primary btn-sm" onclick="applySuggestedSplit()">Use this split</button> ' +
      '<button class="btn btn-ghost btn-sm" onclick="go(\'settings\',{tab:\'training\'})">Choose another</button></div>' : '';

    return demoBanner + topbar + weightPrompt + injuryBanner + setupBanner + splitBanner + briefingCard + heroCard + quickActions + todayWorkout +
      firstWorkoutEmpty + activeQuestCard + lastWktCard + moreRow +
      '<div style="height:24px"></div>';

  } catch(e) {
    console.error('dashboard', e);
    return '<div style="padding:28px 20px;color:var(--txt);line-height:1.6">' +
      '<div style="font-size:32px;margin-bottom:12px">⚠️</div>' +
      '<strong>Dashboard error</strong><br><span style="color:var(--txt3);font-size:13px">' + esc(e.message) + '</span>' +
      '<br><br><button class="btn btn-secondary" onclick="go(\'dashboard\')">Retry</button></div>';
  }
});

window._nextTheme = _nextTheme;
window.openMorningBriefing = function() {
  S.set('settings.lastBriefingDate', new Date().toISOString().slice(0, 10));
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
