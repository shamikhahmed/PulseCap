'use strict';
/* PulseCap v6 — Coach Kernel
   Offline, rule-based engines that link logger ↔ Today ↔ Assistant ↔ recovery.
   No network. No LLM. Free forever. */

/* ── Autoreg from RPE (set-level) ── */
const AutoregEngine = {
  /* Suggest next session load delta from recent RPE on an exercise */
  nextWeightDelta: function(exName) {
    const ws = (typeof S !== 'undefined' && S.g('workouts')) || [];
    const rpes = [];
    for (let i = ws.length - 1; i >= 0 && rpes.length < 6; i--) {
      const ex = (ws[i].exercises || []).find(function(e) {
        return (e.name || '').toLowerCase() === String(exName || '').toLowerCase();
      });
      if (!ex) continue;
      (ex.sets || []).forEach(function(s) {
        if (s._warmup || !s.done) return;
        const r = Number(s.rpe);
        if (r >= 5 && r <= 10) rpes.push(r);
      });
    }
    if (!rpes.length) return { deltaKg: 0, reason: 'No RPE logged yet — add RPE after hard sets.' };
    const avg = rpes.reduce(function(a, b) { return a + b; }, 0) / rpes.length;
    if (avg >= 9.5) return { deltaKg: -2.5, reason: 'Recent RPE ~' + avg.toFixed(1) + ' — cut 2.5kg and own the reps.' };
    if (avg >= 8.5) return { deltaKg: 0, reason: 'Recent RPE ~' + avg.toFixed(1) + ' — hold weight, chase clean reps.' };
    if (avg <= 6.5) return { deltaKg: 2.5, reason: 'Recent RPE ~' + avg.toFixed(1) + ' — room to add 2.5kg.' };
    return { deltaKg: 1.25, reason: 'Recent RPE ~' + avg.toFixed(1) + ' — small bump OK.' };
  },
  sessionAvgRpe: function(exercises) {
    const vals = [];
    (exercises || []).forEach(function(ex) {
      (ex.sets || []).forEach(function(s) {
        if (s._warmup || !s.done) return;
        const r = Number(s.rpe);
        if (r >= 5 && r <= 10) vals.push(r);
      });
    });
    if (!vals.length) return null;
    return Math.round((vals.reduce(function(a, b) { return a + b; }, 0) / vals.length) * 10) / 10;
  },
  suggestFromLastSet: function(set) {
    const r = Number(set && set.rpe);
    if (!(r >= 5)) return null;
    if (r >= 9.5) return 'Next: −2.5kg or fewer reps';
    if (r >= 8.5) return 'Next: hold load';
    if (r <= 6.5) return 'Next: +2.5kg if form clean';
    return 'Next: micro-load OK';
  }
};
window.AutoregEngine = AutoregEngine;

/* ── Weekly volume lander vs goals ── */
const VolumeLander = {
  TARGETS: {
    beginner: { chest: 8, back: 10, shoulders: 8, quads: 8, hamstrings: 6, glutes: 6, biceps: 4, triceps: 4, calves: 4, core: 4 },
    intermediate: { chest: 12, back: 14, shoulders: 10, quads: 12, hamstrings: 10, glutes: 8, biceps: 6, triceps: 6, calves: 6, core: 6 },
    advanced: { chest: 16, back: 18, shoulders: 14, quads: 16, hamstrings: 12, glutes: 10, biceps: 8, triceps: 8, calves: 8, core: 8 }
  },
  weekSets: function() {
    if (typeof RecapEngine !== 'undefined' && RecapEngine.volumeByMuscle) {
      return RecapEngine.volumeByMuscle() || {};
    }
    const out = {};
    const ws = (S.g('workouts') || []).filter(function(w) {
      const d = new Date(w.date);
      const now = new Date();
      return (now - d) < 7 * 86400000;
    });
    ws.forEach(function(w) {
      (w.exercises || []).forEach(function(ex) {
        const n = (ex.sets || []).filter(function(s) { return s.done && !s._warmup; }).length;
        const key = String((ex.group || ex.pri || 'other')).toLowerCase();
        out[key] = (out[key] || 0) + n;
      });
    });
    return out;
  },
  report: function() {
    const exp = (S.g('user.exp') || 'intermediate').toLowerCase();
    const targets = this.TARGETS[exp] || this.TARGETS.intermediate;
    const actual = this.weekSets();
    const rows = Object.keys(targets).map(function(m) {
      const t = targets[m];
      const a = actual[m] || actual[m.replace(/s$/, '')] || 0;
      const pct = t ? Math.round((a / t) * 100) : 0;
      let status = 'ok';
      if (pct < 70) status = 'low';
      else if (pct > 130) status = 'high';
      return { muscle: m, actual: a, target: t, pct: pct, status: status };
    });
    const low = rows.filter(function(r) { return r.status === 'low'; });
    const high = rows.filter(function(r) { return r.status === 'high'; });
    return { rows: rows, low: low, high: high, exp: exp };
  }
};
window.VolumeLander = VolumeLander;

/* ── Joint weekly stress budget ── */
const JointBudget = {
  CAPS: { shoulder: 28, elbow: 24, knee: 30, spine: 22, wrist: 18, hip: 28 },
  weekLoad: function() {
    const load = { shoulder: 0, elbow: 0, knee: 0, spine: 0, wrist: 0, hip: 0 };
    const ws = (S.g('workouts') || []).filter(function(w) {
      return (Date.now() - new Date(w.date).getTime()) < 7 * 86400000;
    });
    const db = (typeof ExDB !== 'undefined' && ExDB.all) ? ExDB.all() : [];
    ws.forEach(function(w) {
      (w.exercises || []).forEach(function(ex) {
        const sets = (ex.sets || []).filter(function(s) { return s.done && !s._warmup; }).length;
        const meta = db.find(function(e) { return e.n === ex.name; });
        const j = (meta && meta.joint) || {};
        Object.keys(load).forEach(function(k) {
          load[k] += sets * (Number(j[k]) || 0);
        });
      });
    });
    return load;
  },
  report: function() {
    const load = this.weekLoad();
    const self = this;
    return Object.keys(this.CAPS).map(function(k) {
      const cap = self.CAPS[k];
      const used = load[k] || 0;
      const pct = Math.round((used / cap) * 100);
      return {
        joint: k,
        used: used,
        cap: cap,
        pct: pct,
        status: pct >= 100 ? 'over' : pct >= 80 ? 'warn' : 'ok'
      };
    });
  },
  overBudget: function() {
    return this.report().filter(function(r) { return r.status !== 'ok'; });
  }
};
window.JointBudget = JointBudget;

/* ── Simple 4-week mesocycle state ── */
const MesocycleEngine = {
  ensure: function() {
    let m = S.g('mesocycle');
    if (m && m.start) return m;
    m = {
      start: (typeof localISO === 'function' ? localISO() : new Date().toISOString().slice(0, 10)),
      weeks: 4,
      focus: S.g('user.goal') || 'hypertrophy',
      deloadWeek: 4
    };
    S.set('mesocycle', m);
    return m;
  },
  weekIndex: function() {
    const m = this.ensure();
    const start = new Date(m.start + 'T12:00:00');
    const now = new Date();
    const days = Math.floor((now - start) / 86400000);
    const w = Math.floor(days / 7) + 1;
    return Math.min(Math.max(w, 1), m.weeks || 4);
  },
  isDeload: function() {
    const m = this.ensure();
    return this.weekIndex() === (m.deloadWeek || 4);
  },
  volumeMultiplier: function() {
    if (this.isDeload()) return 0.5;
    const w = this.weekIndex();
    return 0.85 + (w - 1) * 0.05; /* week1 0.85 → week3 0.95 */
  },
  summary: function() {
    const m = this.ensure();
    const w = this.weekIndex();
    return {
      week: w,
      weeks: m.weeks,
      focus: m.focus,
      deload: this.isDeload(),
      multiplier: this.volumeMultiplier(),
      label: this.isDeload()
        ? 'Deload week — cut volume ~50%, keep some intensity'
        : 'Mesocycle week ' + w + '/' + m.weeks + ' · focus ' + m.focus
    };
  },
  reset: function() {
    S.set('mesocycle', null);
    return this.ensure();
  }
};
window.MesocycleEngine = MesocycleEngine;

/* ── Push:pull weekly ratio ── */
const PushPullEngine = {
  classify: function(name) {
    const n = String(name || '').toLowerCase();
    if (/row|pull|lat|face.?pull|chin|pull-?up|pulldown|rear.?delt|shrug/.test(n)) return 'pull';
    if (/press|bench|push.?up|dip|fly|raise|overhead|pushdown|extension/.test(n)) return 'push';
    return 'other';
  },
  weekCounts: function() {
    let push = 0, pull = 0;
    const self = this;
    (S.g('workouts') || []).forEach(function(w) {
      if ((Date.now() - new Date(w.date).getTime()) >= 7 * 86400000) return;
      (w.exercises || []).forEach(function(ex) {
        const sets = (ex.sets || []).filter(function(s) { return s.done && !s._warmup; }).length;
        const c = self.classify(ex.name);
        if (c === 'push') push += sets;
        if (c === 'pull') pull += sets;
      });
    });
    return { push: push, pull: pull, ratio: pull ? (push / pull) : (push ? 99 : 1) };
  },
  advice: function() {
    const c = this.weekCounts();
    if (c.push + c.pull < 6) return { ok: true, text: 'Not enough push/pull volume yet this week to judge ratio.', counts: c };
    if (c.ratio > 1.3) return { ok: false, text: 'Push-heavy this week (' + c.push + ':' + c.pull + '). Add rows / face pulls.', counts: c };
    if (c.ratio < 0.75) return { ok: false, text: 'Pull-heavy (' + c.push + ':' + c.pull + '). Fine for posture — keep pressing progressing.', counts: c };
    return { ok: true, text: 'Push:pull near balanced (' + c.push + ':' + c.pull + ').', counts: c };
  }
};
window.PushPullEngine = PushPullEngine;

/* ── Session recap after save ── */
const SessionRecap = {
  build: function(workout) {
    const vol = workout.totalVol || 0;
    const avgRpe = AutoregEngine.sessionAvgRpe(workout.exercises);
    const meso = MesocycleEngine.summary();
    const lander = VolumeLander.report();
    const joints = JointBudget.overBudget();
    const pp = PushPullEngine.advice();
    const lines = [];
    lines.push('Volume ' + Math.round(vol) + ' kg' + (avgRpe != null ? ' · avg RPE ' + avgRpe : ''));
    lines.push(meso.label);
    if (lander.low.length) lines.push('Behind on: ' + lander.low.slice(0, 3).map(function(r) { return r.muscle; }).join(', '));
    if (joints.length) lines.push('Joint load high: ' + joints.map(function(j) { return j.joint; }).join(', '));
    lines.push(pp.text);
    const nextDay = (typeof SplitEngine !== 'undefined' && SplitEngine.getSplitDay)
      ? (SplitEngine.getSplitDay().n || 'Next session')
      : 'Next session';
    return {
      title: 'Session saved',
      lines: lines,
      nextHint: 'Up next: ' + nextDay,
      avgRpe: avgRpe
    };
  },
  store: function(recap) {
    S.set('lastSessionRecap', Object.assign({ at: Date.now() }, recap));
  },
  consumeCard: function() {
    const r = S.g('lastSessionRecap');
    if (!r || !r.at) return null;
    if (Date.now() - r.at > 36 * 3600000) return null;
    return r;
  }
};
window.SessionRecap = SessionRecap;

/* ── Readiness calibration from outcomes (local) ── */
const ReadinessCalibrator = {
  /* Store optional resting HR / HRV (manual — no HealthKit) */
  vitals: function() {
    return {
      rhr: Number(S.g('user.restingHr')) || null,
      hrv: Number(S.g('user.hrvMs')) || null
    };
  },
  adjustScore: function(base) {
    let s = Number(base) || 0;
    const v = this.vitals();
    const baseRhr = Number(S.g('user.baselineRhr')) || v.rhr;
    if (v.rhr && baseRhr && v.rhr > baseRhr + 8) s -= 8;
    if (v.hrv && Number(S.g('user.baselineHrv'))) {
      if (v.hrv < Number(S.g('user.baselineHrv')) * 0.85) s -= 6;
    }
    /* If last session avg RPE ≥ 9 and readiness claimed high — dampen */
    const last = (S.g('workouts') || []).slice().sort(function(a, b) {
      return new Date(a.endedAt || a.startedAt || a.date || 0) - new Date(b.endedAt || b.startedAt || b.date || 0);
    }).pop();
    if (last) {
      const ar = AutoregEngine.sessionAvgRpe(last.exercises);
      if (ar != null && ar >= 9 && s >= 75) s -= 10;
    }
    return Math.max(0, Math.min(100, Math.round(s)));
  }
};
window.ReadinessCalibrator = ReadinessCalibrator;

/* ── Unified coach context for Assistant + Today ── */
const CoachKernel = {
  snapshot: function() {
    const readinessRaw = (typeof ReadinessEngine !== 'undefined') ? ReadinessEngine.score() : 70;
    const readiness = readinessRaw;
    const decision = (typeof DailyDecision !== 'undefined' && DailyDecision.decide)
      ? DailyDecision.decide()
      : { decision: 'train', title: 'Train', reason: '' };
    const meso = MesocycleEngine.summary();
    const volume = VolumeLander.report();
    const joints = JointBudget.report();
    const pp = PushPullEngine.advice();
    const debt = (typeof RecoveryDebtEngine !== 'undefined') ? RecoveryDebtEngine.calculate() : null;
    const today = (typeof SplitEngine !== 'undefined') ? SplitEngine.getSplitDay() : { n: 'Workout' };
    const gymFloor = !!S.g('user.gymFloorMode');
    const beginner = !!S.g('user.beginnerMode') || (S.g('user.exp') === 'beginner');
    return {
      readiness: readiness,
      readinessRaw: readinessRaw,
      decision: decision,
      meso: meso,
      volume: volume,
      joints: joints,
      pushPull: pp,
      debt: debt,
      today: today,
      gymFloor: gymFloor,
      beginner: beginner,
      vitals: ReadinessCalibrator.vitals()
    };
  },
  oneThing: function() {
    const s = this.snapshot();
    if (s.decision && s.decision.decision === 'rest') {
      return { title: 'Rest today', body: s.decision.reason || 'Recovery takes priority.', go: 'recovery' };
    }
    if (s.meso.deload) {
      return { title: 'Deload week', body: 'Cut volume ~50%. Keep technique sharp.', go: 'workout' };
    }
    const over = (s.joints || []).filter(function(j) { return j.status === 'over'; });
    if (over.length) {
      return { title: 'Protect ' + over[0].joint, body: 'Weekly joint budget blown — prefer machine / cable variants.', go: 'injury-risk' };
    }
    if (s.volume.low && s.volume.low[0]) {
      const m = s.volume.low[0];
      return { title: 'Add ' + m.muscle + ' volume', body: m.actual + '/' + m.target + ' sets this week.', go: 'workout' };
    }
    if (!s.pushPull.ok) {
      return { title: 'Balance push/pull', body: s.pushPull.text, go: 'workout' };
    }
    return {
      title: s.today.n || 'Train',
      body: 'Readiness ' + s.readiness + '/100. ' + (s.decision.reason || 'Execute the plan.'),
      go: 'workout'
    };
  }
};
window.CoachKernel = CoachKernel;

/* ── Gym floor helpers ── */
const GymFloor = {
  apply: function() {
    if (typeof document === 'undefined') return;
    const on = !!S.g('user.gymFloorMode');
    document.body.classList.toggle('gym-floor', on);
  },
  enabled: function() { return !!S.g('user.gymFloorMode'); }
};
window.GymFloor = GymFloor;

/* Exercise chrome icon from muscle group — replaces legacy emoji `em` field */
window.exChromeIcon = function(exOrName, size) {
  var ex = typeof exOrName === 'string'
    ? ((typeof ExDB !== 'undefined' && ExDB.byName) ? ExDB.byName(exOrName) : null)
    : exOrName;
  var grp = (ex && (ex.grp || ex.group)) || 'fullbody';
  var map = {
    chest: 'heart', back: 'trendDown', legs: 'run', shoulders: 'target',
    biceps: 'dumbbell', triceps: 'dumbbell', core: 'flame', glutes: 'run',
    fullbody: 'dumbbell', cardio: 'run', calves: 'run'
  };
  var name = map[String(grp).toLowerCase()] || 'dumbbell';
  return typeof icon === 'function' ? icon(name, size || 22) : '';
};

/* ── Beginner mode helpers ── */
const BeginnerMode = {
  on: function() {
    return !!S.g('user.beginnerMode') || S.g('user.exp') === 'beginner';
  },
  hideAdvancedLearn: function() {
    return this.on();
  }
};
window.BeginnerMode = BeginnerMode;
