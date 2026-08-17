'use strict';
/* PulseCap training-plan schema v1 — local, opt-in, not a customSplit. */

const TRAINING_PLAN_SCHEMA = 1;
const TRAINING_PLAN_MAX_SESSIONS = 14;
const TRAINING_PLAN_MAX_EXERCISES = 24;
const TRAINING_PLAN_MAX_ALTS = 4;

function _tpStr(v, max) {
  if (typeof v !== 'string') return '';
  const s = v.trim();
  return s.length > max ? s.slice(0, max) : s;
}
function _tpNum(v, min, max, fallback) {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}
function _tpArr(v) {
  return Array.isArray(v) ? v : [];
}

function _tpAlt(raw) {
  if (!raw) return null;
  if (typeof raw === 'string') {
    const name = _tpStr(raw, 80);
    return name ? { name: name, cue: '' } : null;
  }
  if (typeof raw !== 'object') return null;
  const name = _tpStr(raw.name, 80);
  if (!name) return null;
  return { name: name, cue: _tpStr(raw.cue, 240) };
}

function _tpExercise(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const name = _tpStr(raw.name, 80);
  if (!name) return null;
  const reps = _tpArr(raw.reps).map(function(n) { return _tpNum(n, 1, 50, 10); });
  const rpe = _tpArr(raw.rpe).map(function(n) { return _tpNum(n, 5, 10, 8); });
  const alts = _tpArr(raw.alternatives).map(_tpAlt).filter(Boolean).slice(0, TRAINING_PLAN_MAX_ALTS);
  return {
    name: name,
    aliases: _tpArr(raw.aliases).map(function(a) { return _tpStr(a, 80); }).filter(Boolean).slice(0, 8),
    role: _tpStr(raw.role, 24) || 'work',
    group: _tpStr(raw.group, 32),
    sets: _tpNum(raw.sets, 1, 8, 3),
    setsMin: raw.setsMin != null ? _tpNum(raw.setsMin, 1, 8, raw.sets) : null,
    reps: reps.length ? [reps[0], reps[reps.length - 1]] : [10, 12],
    tempo: _tpStr(raw.tempo, 16) || '2-1-2',
    rpe: rpe.length ? [rpe[0], rpe[rpe.length - 1]] : [8, 8],
    restSec: _tpNum(raw.restSec, 15, 300, 60),
    startKg: _tpNum(raw.startKg, 0, 600, 0),
    week4GoalKg: _tpNum(raw.week4GoalKg, 0, 600, 0),
    unit: /kg_per_side|lb|bodyweight/.test(String(raw.unit || '')) ? raw.unit : 'kg',
    startDisplay: _tpStr(raw.startDisplay, 80),
    cue: _tpStr(raw.cue, 320),
    rom: _tpStr(raw.rom, 320),
    why: _tpStr(raw.why, 240),
    skipOk: !!raw.skipOk,
    alternatives: alts
  };
}

function _tpSession(raw, idFallback) {
  if (!raw || typeof raw !== 'object') return null;
  const id = _tpStr(raw.id, 32) || idFallback;
  if (!id) return null;
  const exercises = _tpArr(raw.exercises).map(_tpExercise).filter(Boolean).slice(0, TRAINING_PLAN_MAX_EXERCISES);
  if (!exercises.length) return null;
  const cardio = raw.cardio && typeof raw.cardio === 'object' ? {
    kind: _tpStr(raw.cardio.kind, 40) || 'steady',
    minutes: _tpNum(raw.cardio.minutes, 0, 90, 20),
    hr: _tpStr(raw.cardio.hr, 32),
    note: _tpStr(raw.cardio.note, 200)
  } : null;
  return {
    id: id,
    name: _tpStr(raw.name, 80) || id,
    muscles: _tpArr(raw.muscles).map(function(m) { return _tpStr(m, 32); }).filter(Boolean).slice(0, 8),
    warmup: _tpArr(raw.warmup).map(function(w) { return _tpStr(w, 120); }).filter(Boolean).slice(0, 8),
    prehab: raw.prehab !== false,
    cardio: cardio,
    family: _tpStr(raw.family, 16) || '',
    exercises: exercises
  };
}

function _tpRomRule(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const movement = _tpStr(raw.movement, 80);
  const stop = _tpStr(raw.stop, 280);
  if (!movement || !stop) return null;
  return { movement: movement, stop: stop };
}

function validateTrainingPlan(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('Plan must be an object');
  }
  if (raw.__proto__ || Object.getPrototypeOf(raw) !== Object.prototype) {
    /* parsed JSON is always plain object; still reject dangerous keys */
  }
  Object.keys(raw).forEach(function(k) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') throw new Error('Unsafe plan key');
  });
  const sessionsIn = raw.sessions && typeof raw.sessions === 'object' && !Array.isArray(raw.sessions)
    ? raw.sessions
    : {};
  const sessionIds = Object.keys(sessionsIn).slice(0, TRAINING_PLAN_MAX_SESSIONS);
  const sessions = {};
  sessionIds.forEach(function(id) {
    const s = _tpSession(sessionsIn[id], id);
    if (s) sessions[s.id] = s;
  });
  if (!Object.keys(sessions).length) throw new Error('Plan has no sessions');
  let rotation = _tpArr(raw.rotation).map(function(id) { return _tpStr(id, 32); }).filter(function(id) {
    return !!sessions[id];
  });
  if (!rotation.length) rotation = Object.keys(sessions);
  const restWeekdays = _tpArr(raw.restWeekdays).map(function(d) { return String(d).slice(0, 3).toLowerCase(); })
    .filter(function(d) { return ['sun','mon','tue','wed','thu','fri','sat'].indexOf(d) !== -1; });
  const source = raw.source && typeof raw.source === 'object' ? raw.source : {};
  const meso = raw.mesocycle && typeof raw.mesocycle === 'object' ? raw.mesocycle : {};
  const prog = raw.progression && typeof raw.progression === 'object' ? raw.progression : {};
  const safety = raw.safety && typeof raw.safety === 'object' ? raw.safety : {};
  const cursor = raw.cursor && typeof raw.cursor === 'object' ? raw.cursor : {};
  const loadsIn = raw.workingLoads && typeof raw.workingLoads === 'object' ? raw.workingLoads : {};
  const workingLoads = {};
  Object.keys(loadsIn).slice(0, 80).forEach(function(k) {
    const row = loadsIn[k];
    if (!row || typeof row !== 'object') return;
    workingLoads[_tpStr(k, 80)] = {
      kg: _tpNum(row.kg, 0, 600, 0),
      unit: _tpStr(row.unit, 16) || 'kg',
      stalls: _tpNum(row.stalls, 0, 20, 0)
    };
  });
  const prehab = _tpArr(raw.prehab).map(function(p) {
    if (!p || typeof p !== 'object') return null;
    const name = _tpStr(p.name, 80);
    if (!name) return null;
    return { name: name, sets: _tpNum(p.sets, 1, 5, 3), reps: _tpNum(p.reps, 5, 30, 15), restSec: _tpNum(p.restSec, 15, 90, 30) };
  }).filter(Boolean).slice(0, 6);

  return {
    schemaVersion: TRAINING_PLAN_SCHEMA,
    id: _tpStr(raw.id, 40) || ('plan_' + Date.now()),
    title: _tpStr(raw.title, 80) || 'Training plan',
    active: raw.active !== false,
    acknowledgedSafety: !!raw.acknowledgedSafety,
    startDate: /^\d{4}-\d{2}-\d{2}$/.test(String(raw.startDate || '')) ? raw.startDate : null,
    source: {
      type: /template|pdf|json|paste/.test(String(source.type || '')) ? source.type : 'template',
      name: _tpStr(source.name, 80),
      importedAt: _tpStr(source.importedAt, 40)
    },
    restWeekdays: restWeekdays.length ? restWeekdays : ['sun'],
    rotation: rotation,
    cursor: {
      rotationIndex: _tpNum(cursor.rotationIndex, 0, 20, 0),
      lastSessionKey: _tpStr(cursor.lastSessionKey, 32),
      lastDate: _tpStr(cursor.lastDate, 16),
      lastWorkoutId: _tpStr(cursor.lastWorkoutId, 40)
    },
    mesocycle: {
      weeks: _tpNum(meso.weeks, 3, 12, 5),
      deloadWeek: _tpNum(meso.deloadWeek, 3, 12, 5)
    },
    progression: {
      type: 'double',
      targetRpe: _tpNum(prog.targetRpe, 6, 9, 8),
      rpeNever: _tpNum(prog.rpeNever, 9, 10, 10),
      incrementPct: _tpNum(prog.incrementPct, 0.01, 0.1, 0.03),
      deloadLoadPct: _tpNum(prog.deloadLoadPct, 0.4, 0.8, 0.6),
      deloadDropSets: _tpNum(prog.deloadDropSets, 0, 2, 1),
      deloadRpe: _tpNum(prog.deloadRpe, 5, 7, 6),
      missWeekDropPct: _tpNum(prog.missWeekDropPct, 0.05, 0.2, 0.1)
    },
    safety: {
      medicalClearance: !!safety.medicalClearance,
      painLogAfter: _tpArr(safety.painLogAfter).map(function(s) { return _tpStr(s, 16); }).filter(Boolean).slice(0, 6),
      stopOn: _tpArr(safety.stopOn).map(function(s) { return _tpStr(s, 24); }).filter(Boolean),
      romRules: _tpArr(safety.romRules).map(_tpRomRule).filter(Boolean).slice(0, 16),
      disclaimer: _tpStr(safety.disclaimer, 400) ||
        'This is a training template, not medical clearance. Stop on sharp pain, clunk, or instability and see a clinician.'
    },
    prehab: prehab,
    warmupProtocol: {
      firstTwo: [{ pct: 0.5, reps: 10 }, { pct: 0.7, reps: 5 }]
    },
    cardioRules: raw.cardioRules && typeof raw.cardioRules === 'object' ? {
      afterLifting: raw.cardioRules.afterLifting !== false,
      steps: [_tpNum((raw.cardioRules.steps || [])[0], 1000, 20000, 8000), _tpNum((raw.cardioRules.steps || [])[1], 1000, 20000, 10000)]
    } : { afterLifting: true, steps: [8000, 10000] },
    sessions: sessions,
    workingLoads: workingLoads,
    notes: _tpStr(raw.notes, 800)
  };
}

window.TRAINING_PLAN_SCHEMA = TRAINING_PLAN_SCHEMA;
window.validateTrainingPlan = validateTrainingPlan;
