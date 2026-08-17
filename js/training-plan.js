'use strict';
/* TrainingPlanEngine — opt-in program OS. Does not replace SplitEngine unless a plan is active. */

const TrainingPlanEngine = {
  _nowDate: null,

  todayISO: function() {
    if (this._nowDate) return this._nowDate;
    return typeof today === 'function' ? today() : new Date().toISOString().slice(0, 10);
  },
  weekdayId: function(iso) {
    const d = new Date((iso || this.todayISO()) + 'T12:00:00');
    return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][d.getDay()];
  },

  raw: function() {
    return (typeof S !== 'undefined' && S.g) ? S.g('trainingPlan') : null;
  },
  hasActive: function() {
    const p = this.raw();
    return !!(p && p.active && p.acknowledgedSafety && p.sessions);
  },
  get: function() {
    if (!this.hasActive()) return null;
    try { return validateTrainingPlan(this.raw()); } catch (e) { return null; }
  },

  save: function(plan) {
    const clean = validateTrainingPlan(plan);
    S.set('trainingPlan', clean);
    return clean;
  },

  installTemplate: function(id, opts) {
    opts = opts || {};
    const src = (window.PLAN_TEMPLATES || {})[id];
    if (!src) throw new Error('Unknown plan template');
    const copy = JSON.parse(JSON.stringify(src));
    copy.active = true;
    copy.acknowledgedSafety = !!opts.acknowledgedSafety;
    copy.startDate = opts.startDate || this.todayISO();
    copy.source = { type: 'template', name: id, importedAt: this.todayISO() };
    copy.cursor = { rotationIndex: opts.rotationIndex || 0, lastSessionKey: '', lastDate: '', lastWorkoutId: '' };
    const exp = (typeof Profile !== 'undefined' && Profile.experienceGuide)
      ? Profile.experienceGuide((typeof S !== 'undefined' && S.g) ? S.g('user.exp') : 'intermediate')
      : null;
    if (exp && copy.progression) {
      copy.progression.incrementPct = exp.incrementPct;
      copy.progression.targetRpe = exp.targetRpe;
    }
    copy.workingLoads = {};
    Object.keys(copy.sessions || {}).forEach(function(sid) {
      (copy.sessions[sid].exercises || []).forEach(function(ex) {
        copy.workingLoads[ex.name] = { kg: Number(ex.startKg) || 0, unit: ex.unit || 'kg', stalls: 0 };
      });
    });
    if (opts.gymDays !== false && S.g) {
      const rest = copy.restWeekdays || ['sun'];
      const all = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      S.set('user.gymDays', all.filter(function(d) { return rest.indexOf(d) === -1; }));
    }
    return this.save(copy);
  },

  installPlan: function(plan, opts) {
    opts = opts || {};
    const copy = validateTrainingPlan(plan);
    copy.active = true;
    copy.acknowledgedSafety = !!opts.acknowledgedSafety;
    copy.startDate = copy.startDate || opts.startDate || this.todayISO();
    copy.source = copy.source || {};
    copy.source.importedAt = copy.source.importedAt || this.todayISO();
    if (!copy.workingLoads || !Object.keys(copy.workingLoads).length) {
      copy.workingLoads = {};
      Object.keys(copy.sessions).forEach(function(sid) {
        copy.sessions[sid].exercises.forEach(function(ex) {
          copy.workingLoads[ex.name] = { kg: Number(ex.startKg) || 0, unit: ex.unit || 'kg', stalls: 0 };
        });
      });
    }
    if (opts.gymDays !== false && S.g) {
      const rest = copy.restWeekdays || ['sun'];
      const all = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
      S.set('user.gymDays', all.filter(function(d) { return rest.indexOf(d) === -1; }));
    }
    return this.save(copy);
  },

  removePlan: function() {
    S.set('trainingPlan', null);
    return true;
  },

  weekIndex: function(iso) {
    const p = this.get();
    if (!p || !p.startDate) return 1;
    const start = new Date(p.startDate + 'T12:00:00');
    const now = new Date((iso || this.todayISO()) + 'T12:00:00');
    const days = Math.floor((now - start) / 86400000);
    if (days < 0) return 1;
    const w = Math.floor(days / 7) + 1;
    const cycle = p.mesocycle.weeks || 5;
    return ((w - 1) % cycle) + 1;
  },
  isDeload: function(iso) {
    const p = this.get();
    if (!p) return false;
    return this.weekIndex(iso) === (p.mesocycle.deloadWeek || 5);
  },
  isRestToday: function(iso) {
    const p = this.get();
    if (!p) return false;
    return (p.restWeekdays || ['sun']).indexOf(this.weekdayId(iso)) !== -1;
  },

  daysSinceLastSession: function() {
    const p = this.get();
    if (!p || !p.cursor.lastDate) return 0;
    const last = new Date(p.cursor.lastDate + 'T12:00:00');
    const now = new Date(this.todayISO() + 'T12:00:00');
    return Math.max(0, Math.floor((now - last) / 86400000));
  },

  todaySessionKey: function(iso) {
    const p = this.get();
    if (!p) return null;
    if (this.isRestToday(iso)) return null;
    const idx = p.cursor.rotationIndex || 0;
    return p.rotation[idx % p.rotation.length];
  },

  todaySession: function(iso) {
    const p = this.get();
    if (!p) return null;
    if (this.isRestToday(iso)) {
      return { rest: true, name: 'Full rest', reason: 'Plan rest day — this is what makes the other days sustainable.' };
    }
    const key = this.todaySessionKey(iso);
    const sess = p.sessions[key];
    if (!sess) return { rest: true, name: 'Rest', reason: 'No session mapped.' };
    return Object.assign({ rest: false, key: key }, sess);
  },

  asSplitDay: function(iso) {
    const sess = this.todaySession(iso);
    if (!sess) return { n: 'Rest Day', muscles: [], exercises: [], warmup: [] };
    if (sess.rest) return { n: sess.name || 'Rest Day', muscles: [], exercises: [], warmup: [], _planRest: true, reason: sess.reason };
    return {
      n: sess.name,
      muscles: sess.muscles || [],
      exercises: (sess.exercises || []).map(function(e) { return e.name; }),
      warmup: sess.warmup || [],
      _planKey: sess.key || sess.id,
      _planSession: sess
    };
  },

  listSessions: function() {
    const p = this.get();
    if (!p) return [];
    return p.rotation.map(function(id) { return p.sessions[id]; }).filter(Boolean);
  },

  loadFor: function(name, fallbackKg) {
    const p = this.get();
    if (!p) return { kg: fallbackKg || 0, unit: 'kg', stalls: 0 };
    const row = p.workingLoads[name];
    if (row) return row;
    return { kg: fallbackKg || 0, unit: 'kg', stalls: 0 };
  },

  _roundLoad: function(kg) {
    if (!(kg > 0)) return 0;
    if (kg < 20) return Math.round(kg * 2) / 2;
    return Math.round(kg / 2.5) * 2.5;
  },

  nextLoadAdvice: function(ex) {
    const p = this.get();
    if (!p || !ex) return { kg: 0, reason: 'No plan.' };
    const load = this.loadFor(ex.name, ex.startKg);
    const deload = this.isDeload();
    if (deload) {
      const kg = this._roundLoad(load.kg * (p.progression.deloadLoadPct || 0.6));
      return { kg: kg, reason: 'Deload week — ~60% load, stop at RPE 5–6.', deload: true };
    }
    const gap = this.daysSinceLastSession();
    if (gap >= 7) {
      const kg = this._roundLoad(load.kg * (1 - (p.progression.missWeekDropPct || 0.1)));
      return { kg: kg, reason: 'Missed a week — drop ~10% and rebuild over two sessions.' };
    }
    if (load.stalls >= 2) {
      return { kg: load.kg, reason: 'Stalled two sessions — check sleep and food before adding load. Repeating a weight is normal.' };
    }
    return { kg: load.kg, reason: 'Hit the top of the rep range at RPE 8 with clean form and zero shoulder pain before adding ~3%.' };
  },

  lowEnergy: function() {
    const rec = (typeof S !== 'undefined' && S.g) ? S.g('recovery') : null;
    if (!rec) return false;
    const recDate = rec.date || rec.time;
    const todayStr = this.todayISO();
    if (recDate && String(recDate).slice(0, 10) !== todayStr) return false;
    return Number(rec.energy) > 0 && Number(rec.energy) <= 3;
  },

  prescribeSession: function(opts) {
    opts = opts || {};
    const p = this.get();
    if (!p) return null;
    const sess = this.todaySession(opts.iso);
    if (!sess || sess.rest) return null;
    const self = this;
    const deload = this.isDeload(opts.iso);
    const low = this.lowEnergy();
    const painBlock = this._activePainBlock();
    const exercises = [];
    const swaps = [];

    if (sess.prehab && p.prehab && p.prehab.length) {
      p.prehab.forEach(function(pr) {
        const sets = [];
        for (let i = 0; i < (pr.sets || 3); i++) {
          sets.push({ weight: 0, reps: pr.reps || 15, done: false, rpe: 7, _prehab: true });
        }
        exercises.push({
          name: pr.name, sets: sets, _prehab: true, rxNote: 'Prehab — keep this even on deload',
          muscles: { primary: ['rear_delts'] }
        });
      });
    }

    (sess.exercises || []).forEach(function(ex, idx) {
      let resolved = { name: ex.name, swapped: false };
      if (typeof InjuriesDB !== 'undefined') {
        const check = InjuriesDB.shouldAvoidExercise(ex.name);
        const canon = (typeof ExDB !== 'undefined' && ExDB.byName) ? ExDB.byName(ex.name) : null;
        const check2 = (!check.avoid && canon) ? InjuriesDB.shouldAvoidExercise(canon.n) : { avoid: false };
        if (check.avoid || check2.avoid) {
          const reason = check.modify || check.reason || check2.reason || 'Injury-aware swap';
          let used = null;
          (ex.alternatives || []).some(function(a) {
            const avoidAlt = InjuriesDB.shouldAvoidExercise(a.name);
            if (!avoidAlt.avoid) { used = a.name; return true; }
            return false;
          });
          if (used) {
            resolved = { name: used, swapped: true, reason: reason };
            swaps.push(resolved);
          } else if (ex.skipOk) {
            return;
          }
        }
      }
      if (painBlock && (sess.family === 'push' || sess.family === 'pull') && /press|fly|pec|overhead/i.test(ex.name)) {
        if (ex.alternatives && ex.alternatives[0]) {
          resolved = { name: ex.alternatives[0].name, swapped: true, reason: 'Shoulder flag — use the listed alternative' };
          swaps.push(resolved);
        }
      }
      const advice = self.nextLoadAdvice(ex);
      let kg = advice.kg;
      let setsN = ex.sets;
      if (deload) setsN = Math.max(1, setsN - (p.progression.deloadDropSets || 1));
      if (ex.setsMin && setsN < ex.setsMin) setsN = ex.setsMin;
      const topReps = ex.reps[1] || ex.reps[0] || 10;
      const botReps = ex.reps[0] || 10;
      let targetRpe = deload ? (p.progression.deloadRpe || 6) : (ex.rpe[0] || 8);
      if (low) { targetRpe = 6; kg = self._roundLoad(kg * 0.9); }
      const sets = [];
      if (idx < 2 && !deload && kg > 0) {
        (p.warmupProtocol.firstTwo || []).forEach(function(w) {
          sets.push({
            weight: self._roundLoad(kg * w.pct),
            reps: w.reps,
            done: false,
            rpe: 7,
            _warmup: true
          });
        });
      }
      for (let i = 0; i < setsN; i++) {
        sets.push({
          weight: kg,
          reps: botReps,
          done: false,
          rpe: targetRpe,
          _targetRepsTop: topReps,
          _targetRpe: targetRpe
        });
      }
      const meta = (typeof ExDB !== 'undefined' && ExDB.byName) ? ExDB.byName(resolved.name) : null;
      exercises.push({
        name: resolved.name,
        planName: ex.name,
        sets: sets,
        muscles: meta ? meta.muscles : { primary: [ex.group || ''], secondary: [] },
        rxNote: (deload ? 'Deload · ' : low ? 'Low-energy · RPE 6 · ' : '') +
          (ex.sets + '×' + botReps + (botReps !== topReps ? '–' + topReps : '')) +
          ' @ RPE ' + targetRpe + ' · ' + (ex.tempo || '') +
          (ex.startDisplay ? ' · ' + ex.startDisplay : ''),
        _plan: {
          tempo: ex.tempo, rom: ex.rom, cue: ex.cue, why: ex.why,
          restSec: ex.restSec, alternatives: ex.alternatives || [],
          unit: ex.unit, skipOk: !!ex.skipOk, family: sess.family
        }
      });
    });

    return {
      name: sess.name,
      planKey: sess.key || sess.id,
      family: sess.family,
      warmup: sess.warmup || [],
      cardio: sess.cardio,
      deload: deload,
      lowEnergy: low,
      swaps: swaps,
      exercises: exercises,
      safety: p.safety,
      painLog: (p.safety.painLogAfter || []).indexOf(sess.family) !== -1
    };
  },

  _activePainBlock: function() {
    const flags = (typeof S !== 'undefined' && S.g) ? (S.g('painFlags') || []) : [];
    const cutoff = Date.now() - 36 * 3600000;
    return flags.some(function(f) {
      if (!f) return false;
      const part = String(f.part || '').toLowerCase();
      if (part !== 'shoulder') return false;
      const t = new Date(f.time || f.date || 0).getTime();
      return t >= cutoff;
    });
  },

  onFinish: function(workout) {
    const p = this.get();
    if (!p || !workout) return [];
    const msgs = [];
    const deload = this.isDeload();
    const self = this;
    const sessionPain = Number(workout.shoulderPain);
    const sharp = !!(workout.stopFlag);
    if (sharp || sessionPain >= 7) {
      msgs.push('Shoulder flagged — no load increases. Use listed alternatives next time and get the joint assessed.');
    }
    (workout.exercises || []).forEach(function(ex) {
      if (ex._prehab) return;
      const work = (ex.sets || []).filter(function(s) { return s.done && !s._warmup && !s._prehab; });
      if (!work.length) return;
      const planEx = self._findPlanExercise(p, ex.planName || ex.name);
      const key = (planEx && planEx.name) || ex.name;
      const load = p.workingLoads[key] || { kg: work[0].weight || 0, unit: 'kg', stalls: 0 };
      if (deload || sharp || sessionPain >= 4) {
        p.workingLoads[key] = load;
        return;
      }
      const top = (planEx && planEx.reps[1]) || work[0]._targetRepsTop || 12;
      const targetRpe = (planEx && planEx.rpe[0]) || 8;
      const allTop = work.every(function(s) { return (s.reps || 0) >= top; });
      const rpes = work.map(function(s) { return Number(s.rpe); }).filter(function(r) { return r >= 5; });
      const avgRpe = rpes.length ? rpes.reduce(function(a, b) { return a + b; }, 0) / rpes.length : targetRpe;
      const rpeOk = avgRpe > 0 && avgRpe <= targetRpe + 0.25;
      const rpeTooHard = avgRpe >= 9.5;
      if (rpeTooHard) {
        load.kg = self._roundLoad(Math.max(0, load.kg - 2.5));
        load.stalls = 0;
        msgs.push(ex.name + ' — RPE too high, cut load next time.');
      } else if (allTop && rpeOk) {
        const prev = Number(load.kg) || 0;
        load.kg = self._roundLoad(prev * (1 + (p.progression.incrementPct || 0.03)));
        if (load.kg <= prev) load.kg = self._roundLoad(prev + (prev < 20 ? 0.5 : 2.5));
        load.stalls = 0;
        msgs.push(ex.name + ' → ' + load.kg + ' next session.');
      } else {
        load.stalls = (load.stalls || 0) + 1;
        msgs.push(ex.name + ' holds ' + load.kg + ' — repeat until the top of the range at RPE ' + targetRpe + '.');
      }
      p.workingLoads[key] = load;
    });
    p.cursor.lastDate = workout.date || this.todayISO();
    p.cursor.lastWorkoutId = workout.id || '';
    p.cursor.lastSessionKey = workout.planKey || p.cursor.lastSessionKey;
    this.save(p);
    return msgs;
  },

  advanceCursor: function() {
    const p = this.get();
    if (!p) return;
    if (this.isRestToday()) return;
    p.cursor.rotationIndex = ((p.cursor.rotationIndex || 0) + 1) % p.rotation.length;
    this.save(p);
  },

  setTodaySession: function(key) {
    const p = this.get();
    if (!p) return;
    const idx = p.rotation.indexOf(key);
    if (idx < 0) return;
    p.cursor.rotationIndex = idx;
    this.save(p);
  },

  _findPlanExercise: function(p, name) {
    const n = String(name || '').toLowerCase();
    let found = null;
    Object.keys(p.sessions).some(function(sid) {
      return (p.sessions[sid].exercises || []).some(function(ex) {
        if (ex.name.toLowerCase() === n) { found = ex; return true; }
        if ((ex.aliases || []).some(function(a) { return String(a).toLowerCase() === n; })) { found = ex; return true; }
        return false;
      });
    });
    return found;
  },

  review: function() {
    const p = this.get();
    if (!p) return null;
    const lines = [];
    const w = this.weekIndex();
    lines.push(this.isDeload()
      ? 'Deload week ' + w + '/' + p.mesocycle.weeks + ' — keep the rotation, cut load ~60%, drop a set, stop at RPE 5–6. Prehab stays in full.'
      : 'Mesocycle week ' + w + '/' + p.mesocycle.weeks + ' · double progression at RPE 8.');
    const stalls = Object.keys(p.workingLoads).filter(function(k) { return (p.workingLoads[k].stalls || 0) >= 2; });
    if (stalls.length) lines.push('Stalled: ' + stalls.slice(0, 3).join(', ') + '. Check sleep and food first, then cut cardio, then volume.');
    const ws = (S.g('workouts') || []).filter(function(x) {
      return x.planKey && (Date.now() - new Date(x.date).getTime()) < 8 * 86400000;
    });
    lines.push(ws.length + ' plan sessions logged in the last 8 days.');
    const stats = S.g('bodyStats') || [];
    const weekStats = stats.filter(function(s) {
      return (Date.now() - new Date(s.date).getTime()) < 8 * 86400000;
    });
    if (weekStats.length >= 2) {
      const avg = weekStats.reduce(function(a, s) { return a + Number(s.weight || 0); }, 0) / weekStats.length;
      lines.push('Weekly weight average ' + avg.toFixed(1) + 'kg from ' + weekStats.length + ' weigh-ins — track the average, not a single reading.');
    }
    if (this._activePainBlock()) lines.push('Recent shoulder pain flag — do not add load on pressing or flies.');
    return { week: w, deload: this.isDeload(), lines: lines, stalls: stalls };
  },

  safetyBanner: function() {
    const p = this.get();
    if (!p) return '';
    return p.safety.disclaimer;
  }
};
window.TrainingPlanEngine = TrainingPlanEngine;

window.CoachProvider = {
  id: 'localRules',
  enabled: function() { return false; },
  suggestPlan: function() {
    return Promise.resolve({
      ok: false,
      reason: 'Smart Coach is on-device rules only. Cloud assist is not enabled and no plan data leaves this device.'
    });
  }
};

(function patchSplitEngine() {
  if (typeof SplitEngine === 'undefined') return;
  const _get = SplitEngine.getSplitDay.bind(SplitEngine);
  const _rest = SplitEngine.isScheduledRestDay.bind(SplitEngine);
  const _next = SplitEngine.nextDay.bind(SplitEngine);
  const _list = SplitEngine.listSplitDays.bind(SplitEngine);
  SplitEngine.getSplitDay = function() {
    if (TrainingPlanEngine.hasActive()) return TrainingPlanEngine.asSplitDay();
    return _get();
  };
  SplitEngine.isScheduledRestDay = function() {
    if (TrainingPlanEngine.hasActive()) return TrainingPlanEngine.isRestToday();
    return _rest();
  };
  SplitEngine.nextDay = function() {
    if (TrainingPlanEngine.hasActive()) {
      TrainingPlanEngine.advanceCursor();
      return (TrainingPlanEngine.get().cursor.rotationIndex || 0) + 1;
    }
    return _next();
  };
  SplitEngine.listSplitDays = function(split) {
    if (TrainingPlanEngine.hasActive()) {
      return TrainingPlanEngine.listSessions().map(function(s) {
        return { n: s.name, muscles: s.muscles, exercises: (s.exercises || []).map(function(e) { return e.name; }), warmup: s.warmup || [] };
      });
    }
    return _list(split);
  };
})();

(function patchMeso() {
  if (typeof MesocycleEngine === 'undefined') return;
  const _week = MesocycleEngine.weekIndex.bind(MesocycleEngine);
  const _deload = MesocycleEngine.isDeload.bind(MesocycleEngine);
  const _sum = MesocycleEngine.summary.bind(MesocycleEngine);
  MesocycleEngine.weekIndex = function() {
    if (TrainingPlanEngine.hasActive()) return TrainingPlanEngine.weekIndex();
    return _week();
  };
  MesocycleEngine.isDeload = function() {
    if (TrainingPlanEngine.hasActive()) return TrainingPlanEngine.isDeload();
    return _deload();
  };
  MesocycleEngine.summary = function() {
    if (TrainingPlanEngine.hasActive()) {
      const p = TrainingPlanEngine.get();
      const w = TrainingPlanEngine.weekIndex();
      const deload = TrainingPlanEngine.isDeload();
      return {
        week: w,
        weeks: p.mesocycle.weeks,
        focus: p.title,
        deload: deload,
        multiplier: deload ? 0.6 : 1,
        label: deload
          ? 'Plan deload week — ~60% load, drop a set, RPE 5–6'
          : 'Plan week ' + w + '/' + p.mesocycle.weeks + ' · ' + p.title
      };
    }
    return _sum();
  };
})();

(function patchCoachKernel() {
  if (typeof CoachKernel === 'undefined') return;
  const _one = CoachKernel.oneThing.bind(CoachKernel);
  CoachKernel.oneThing = function() {
    if (TrainingPlanEngine.hasActive()) {
      const sess = TrainingPlanEngine.todaySession();
      if (sess && sess.rest) {
        return { title: 'Rest today', body: sess.reason || 'Plan rest day.', go: 'my-plan' };
      }
      if (TrainingPlanEngine.isDeload()) {
        return { title: 'Deload — ' + (sess && sess.name || 'Train'), body: 'Same rotation, lighter load. Prehab stays. Cardio stays easy.', go: 'workout' };
      }
      const review = TrainingPlanEngine.review();
      if (review && review.stalls && review.stalls.length) {
        return { title: sess.name, body: 'Stalled lifts: hold load. ' + (sess.exercises ? sess.exercises.length + ' exercises prescribed.' : ''), go: 'my-plan' };
      }
      return {
        title: (sess && sess.name) || 'Train',
        body: 'Prescribed session is ready. Log RPE and shoulder score after pushing or pulling.',
        go: 'workout'
      };
    }
    return _one();
  };
})();
