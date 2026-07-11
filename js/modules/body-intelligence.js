'use strict';
/* ── PulseCap Phase 3 — Body Intelligence Layer ── */

/* ══════════════════════════════════════════════════════
   1. BODY RESPONSE MODEL
══════════════════════════════════════════════════════ */
const BodyResponseModel = {

  MIN_SESSIONS: 25,

  _volumeResponse(muscleGroup) {
    const ws = S.g('workouts') || [];
    const prs = S.g('prs') || [];
    if (ws.length < this.MIN_SESSIONS) return null;

    const MUSCLE_KEYWORDS = {
      chest: ['bench','fly','push-up','chest','dip','pec','press'],
      back: ['pull','row','lat','deadlift'],
      shoulders: ['press','lateral','delt','shoulder','face pull'],
      biceps: ['curl','bicep'],
      triceps: ['tricep','pushdown','skull','close grip'],
      quads: ['squat','leg press','extension','hack'],
      hamstrings: ['deadlift','leg curl','nordic','rdl'],
      glutes: ['hip thrust','glute','bridge'],
      calves: ['calf'],
    };

    const keywords = MUSCLE_KEYWORDS[muscleGroup] || [];

    const blocks = [];
    for (let week = 0; week < Math.floor(ws.length / 4); week++) {
      const blockWs = ws.slice(week * 4, (week + 1) * 4);
      let sets = 0;
      blockWs.forEach(w => {
        (w.exercises || []).forEach(ex => {
          if (keywords.some(k => (ex.name || '').toLowerCase().includes(k))) {
            sets += (ex.sets || []).filter(s => s.done).length;
          }
        });
      });
      const blockDates = blockWs.map(w => w.date);
      const blockPRs = prs.filter(p => {
        const ex = (p.exercise || '').toLowerCase();
        return keywords.some(k => ex.includes(k)) && blockDates.includes(p.date);
      }).length;
      blocks.push({ sets, prs: blockPRs });
    }

    if (blocks.length < 3) return null;

    const avgSets = blocks.reduce((a, b) => a + b.sets, 0) / blocks.length;
    const highVol = blocks.filter(b => b.sets > avgSets);
    const lowVol = blocks.filter(b => b.sets <= avgSets);
    const highPRRate = highVol.reduce((a, b) => a + b.prs, 0) / Math.max(highVol.length, 1);
    const lowPRRate = lowVol.reduce((a, b) => a + b.prs, 0) / Math.max(lowVol.length, 1);

    if (highPRRate > lowPRRate * 1.3) return 'high_volume';
    if (lowPRRate > highPRRate * 1.3) return 'low_volume';
    return 'moderate_volume';
  },

  _recoverySpeed(muscleGroup) {
    const ws = S.g('workouts') || [];
    const MUSCLE_KEYWORDS = {
      chest: ['bench','fly','chest','dip','pec'],
      back: ['pull','row','lat','deadlift'],
      legs: ['squat','leg press','deadlift','leg curl'],
      shoulders: ['press','lateral','delt'],
      arms: ['curl','tricep','pushdown'],
    };
    const keywords = MUSCLE_KEYWORDS[muscleGroup] || MUSCLE_KEYWORDS.chest;
    const muscleSessions = ws.filter(w =>
      (w.exercises || []).some(ex => keywords.some(k => (ex.name || '').toLowerCase().includes(k)))
    ).map(w => w.date).sort();

    if (muscleSessions.length < 4) return 'average';

    const gaps = [];
    for (let i = 1; i < muscleSessions.length; i++) {
      const gap = Math.round((new Date(muscleSessions[i]) - new Date(muscleSessions[i-1])) / 86400000);
      if (gap > 0 && gap < 14) gaps.push(gap);
    }

    if (!gaps.length) return 'average';
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    if (avgGap <= 2.5) return 'fast';
    if (avgGap >= 5) return 'slow';
    return 'average';
  },

  profile() {
    const ws = S.g('workouts') || [];
    if (ws.length < this.MIN_SESSIONS) {
      return { ready: false, sessionsNeeded: this.MIN_SESSIONS - ws.length };
    }

    const muscles = ['chest','back','shoulders','biceps','triceps','quads','hamstrings','glutes','calves'];
    const learned = muscles.map(m => {
      const volResponse = this._volumeResponse(m);
      const recovery = this._recoverySpeed(m);
      return { muscle: m, volResponse, recovery };
    }).filter(r => r.volResponse);

    const highVolCount = learned.filter(l => l.volResponse === 'high_volume').length;
    const lowVolCount = learned.filter(l => l.volResponse === 'low_volume').length;
    const overallVolPref = highVolCount > lowVolCount ? 'high' : lowVolCount > highVolCount ? 'low' : 'moderate';

    const slowRecovery = learned.filter(l => l.recovery === 'slow').map(l => l.muscle);
    const fastRecovery = learned.filter(l => l.recovery === 'fast').map(l => l.muscle);

    return {
      ready: true,
      sessions: ws.length,
      overallVolPref,
      slowRecovery,
      fastRecovery,
      muscleProfiles: learned,
      insights: this._generateInsights(learned, overallVolPref, slowRecovery, fastRecovery)
    };
  },

  _generateInsights(learned, volPref, slowRecovery, fastRecovery) {
    const insights = [];
    if (volPref === 'high') insights.push({ icon: '📈', text: 'You respond best to higher training volume — aim for 16-20+ sets per muscle per week', type: 'positive' });
    if (volPref === 'low') insights.push({ icon: '📉', text: 'You respond well to lower volume with higher intensity — quality over quantity', type: 'positive' });
    if (volPref === 'moderate') insights.push({ icon: '⚖️', text: 'You show balanced response — 12-16 sets per muscle per week is your sweet spot', type: 'positive' });
    if (slowRecovery.length) insights.push({ icon: '⏱️', text: slowRecovery.join(', ') + ' recover slower than average — train these muscle groups less frequently', type: 'warning' });
    if (fastRecovery.length) insights.push({ icon: '⚡', text: fastRecovery.join(', ') + ' recover faster than average — you can train these more frequently', type: 'positive' });

    const bestMuscles = learned.filter(l => l.volResponse === (volPref === 'high' ? 'high_volume' : volPref === 'low' ? 'low_volume' : 'moderate_volume')).map(l => l.muscle);
    if (bestMuscles.length >= 2) {
      insights.push({ icon: '🏆', text: 'Strongest adaptation response: ' + bestMuscles.slice(0,3).join(', '), type: 'positive' });
    }

    return insights;
  }
};
window.BodyResponseModel = BodyResponseModel;

/* ══════════════════════════════════════════════════════
   2. EXERCISE DNA PROFILE
══════════════════════════════════════════════════════ */
const ExerciseDNA = {

  MIN_SESSIONS: 3,

  _score(exerciseName) {
    const ws = S.g('workouts') || [];
    const prs = S.g('prs') || [];

    const instances = [];
    ws.forEach(w => {
      (w.exercises || []).forEach(ex => {
        if ((ex.name || '').toLowerCase() === exerciseName.toLowerCase()) {
          const best = (ex.sets || [])
            .filter(s => s.done && (s.weight || 0) > 0 && (s.reps || 0) > 0)
            .reduce((max, s) => {
              const e1rm = (s.weight || 0) * (1 + (s.reps || 1) / 30);
              return e1rm > max.e1rm ? { e1rm, weight: s.weight, reps: s.reps } : max;
            }, { e1rm: 0, weight: 0, reps: 0 });
          if (best.e1rm > 0) instances.push({ date: w.date, ...best });
        }
      });
    });

    if (instances.length < this.MIN_SESSIONS) return null;
    instances.sort((a, b) => new Date(a.date) - new Date(b.date));

    const first = instances[0].e1rm;
    const last = instances[instances.length - 1].e1rm;
    const gainPct = ((last - first) / first) * 100;
    const exPRs = prs.filter(p => (p.exercise || '').toLowerCase() === exerciseName.toLowerCase()).length;
    const weeks = Math.max(1, Math.round((new Date(instances[instances.length-1].date) - new Date(instances[0].date)) / (7 * 86400000)));
    const weeklyGain = gainPct / weeks;

    let score = 40;
    score += Math.min(gainPct * 0.8, 35);
    score += Math.min(exPRs * 5, 15);
    score += Math.min(instances.length * 1.5, 10);
    score = Math.max(0, Math.min(100, Math.round(score)));

    return {
      score,
      gainPct: Math.round(gainPct * 10) / 10,
      weeklyGain: Math.round(weeklyGain * 100) / 100,
      sessions: instances.length,
      prCount: exPRs,
      currentE1RM: Math.round(last),
      trend: gainPct > 15 ? 'excellent' : gainPct > 5 ? 'good' : gainPct > -2 ? 'stagnant' : 'declining',
      color: score >= 75 ? '#30d158' : score >= 55 ? 'var(--c1)' : score >= 40 ? '#f5c842' : '#ff453a'
    };
  },

  dnaProfile() {
    const ws = S.g('workouts') || [];
    const MUSCLE_GROUPS = {
      'Chest': ['Barbell Bench Press','Incline Bench Press','Dumbbell Bench Press','Incline Dumbbell Press','Push-Ups','Cable Fly','Dips','Pec Deck','Chest Press','Smith Machine Bench'],
      'Back': ['Pull-Ups','Lat Pulldown','Barbell Row','Dumbbell Row','Seated Cable Row','T-Bar Row','Chest Supported Row','Face Pulls'],
      'Shoulders': ['Overhead Press','Dumbbell Shoulder Press','Lateral Raise','Arnold Press','Cable Lateral Raise','Face Pulls','Rear Delt Fly'],
      'Biceps': ['Barbell Curl','Dumbbell Curl','Hammer Curl','Preacher Curl','Cable Curl','Concentration Curl','Incline Dumbbell Curl'],
      'Triceps': ['Tricep Pushdown','Skull Crusher','Close Grip Bench Press','Overhead Tricep Extension','Dips'],
      'Quads': ['Back Squat','Front Squat','Leg Press','Leg Extension','Hack Squat','Bulgarian Split Squat','Goblet Squat'],
      'Hamstrings': ['Romanian Deadlift','Leg Curl','Deadlift','Nordic Curl','Good Morning'],
      'Glutes': ['Hip Thrust','Glute Bridge','Bulgarian Split Squat','Cable Glute Kickback'],
      'Calves': ['Calf Raise','Seated Calf Raise','Single-Leg Calf Raise'],
    };

    const trainedExercises = new Set();
    ws.forEach(w => (w.exercises || []).forEach(ex => { if (ex.name) trainedExercises.add(ex.name); }));

    const result = {};
    Object.entries(MUSCLE_GROUPS).forEach(([group, exercises]) => {
      const ranked = [];
      exercises.forEach(ex => {
        if (trainedExercises.has(ex)) {
          const score = this._score(ex);
          if (score) ranked.push({ name: ex, ...score });
        }
      });

      if (ranked.length >= 1) {
        result[group] = ranked.sort((a, b) => b.score - a.score);
      }
    });

    return result;
  },

  bestFor(muscleGroup) {
    const profile = this.dnaProfile();
    const group = profile[muscleGroup] || [];
    return group.slice(0, 3);
  },

  worstFor(muscleGroup) {
    const profile = this.dnaProfile();
    const group = profile[muscleGroup] || [];
    return group.slice(-3).reverse();
  }
};
window.ExerciseDNA = ExerciseDNA;

/* ══════════════════════════════════════════════════════
   3. MUSCLE RECOVERY TIMELINE
══════════════════════════════════════════════════════ */
const MuscleRecoveryTimeline = {

  RECOVERY_HOURS: {
    chest: 72, back: 72, shoulders: 48, biceps: 48, triceps: 48,
    quads: 96, hamstrings: 96, glutes: 72, calves: 48, core: 24,
    'lower back': 96, forearms: 36, neck: 24
  },

  MUSCLE_KEYWORDS: {
    chest: ['bench','fly','push-up','chest','dip','pec','press'],
    back: ['pull','row','lat','deadlift','back'],
    shoulders: ['press','lateral','delt','shoulder','face pull','upright'],
    biceps: ['curl','bicep','hammer'],
    triceps: ['tricep','pushdown','skull','close grip','overhead ext'],
    quads: ['squat','leg press','extension','hack','lunge'],
    hamstrings: ['deadlift','leg curl','nordic','rdl','good morning'],
    glutes: ['hip thrust','glute','bridge','kickback'],
    calves: ['calf raise','calf'],
    core: ['plank','ab','crunch','dead bug','bird','rollout','core'],
  },

  _hoursSinceTraining(muscleGroup) {
    const ws = S.g('workouts') || [];
    const keywords = this.MUSCLE_KEYWORDS[muscleGroup] || [];
    const sessions = ws.filter(w =>
      (w.exercises || []).some(ex => keywords.some(k => (ex.name || '').toLowerCase().includes(k)))
    ).map(w => w.date).sort();

    if (!sessions.length) return 9999;
    const lastDate = new Date(sessions[sessions.length - 1] + 'T12:00:00');
    return Math.round((Date.now() - lastDate.getTime()) / 3600000);
  },

  recoveryPct(muscleGroup) {
    const hours = this._hoursSinceTraining(muscleGroup);
    const needed = this.RECOVERY_HOURS[muscleGroup] || 72;
    if (hours >= needed) return 100;
    return Math.round((hours / needed) * 100);
  },

  status(pct) {
    if (pct >= 95) return { label: 'Ready', color: '#30d158', emoji: '✅', canTrain: true };
    if (pct >= 80) return { label: 'Almost Ready', color: '#30d158', emoji: '🟢', canTrain: true };
    if (pct >= 60) return { label: 'Recovering', color: '#f5c842', emoji: '🟡', canTrain: false };
    if (pct >= 40) return { label: 'Fatigued', color: '#ff9f0a', emoji: '🟠', canTrain: false };
    return { label: 'Rest', color: '#ff453a', emoji: '🔴', canTrain: false };
  },

  fullTimeline() {
    const muscles = Object.keys(this.MUSCLE_KEYWORDS);
    const MUSCLE_LABELS = {
      chest:'Chest', back:'Back', shoulders:'Shoulders', biceps:'Biceps',
      triceps:'Triceps', quads:'Quads', hamstrings:'Hamstrings',
      glutes:'Glutes', calves:'Calves', core:'Core'
    };
    const MUSCLE_ICONS = {
      chest:'🫁', back:'🔵', shoulders:'⭐', biceps:'💪', triceps:'💪',
      quads:'🦵', hamstrings:'🦵', glutes:'🍑', calves:'🦵', core:'⚡'
    };

    return muscles.map(m => {
      const pct = this.recoveryPct(m);
      const hours = this._hoursSinceTraining(m);
      const needed = this.RECOVERY_HOURS[m] || 72;
      const hoursLeft = Math.max(0, needed - hours);
      const status = this.status(pct);
      return {
        muscle: m,
        label: MUSCLE_LABELS[m] || m,
        icon: MUSCLE_ICONS[m] || '💪',
        pct,
        hoursLeft,
        hoursSince: hours === 9999 ? null : hours,
        ...status
      };
    });
  },

  readyToTrain() {
    return this.fullTimeline().filter(m => m.canTrain);
  },

  needsRest() {
    return this.fullTimeline().filter(m => !m.canTrain && m.hoursSince !== null);
  }
};
window.MuscleRecoveryTimeline = MuscleRecoveryTimeline;

/* ══════════════════════════════════════════════════════
   4. JOINT HEALTH ENGINE
══════════════════════════════════════════════════════ */
const JointHealthEngine = {

  JOINTS: ['shoulder','elbow','knee','lower_back','hip','wrist','ankle'],

  JOINT_META: {
    shoulder: { label: 'Shoulders', icon: '🦾', type: 'push_pull' },
    elbow: { label: 'Elbows', icon: '💪', type: 'push_pull' },
    knee: { label: 'Knees', icon: '🦵', type: 'quad_ham' },
    lower_back: { label: 'Lower Back', icon: '🔩', type: 'volume' },
    hip: { label: 'Hips', icon: '🦴', type: 'volume' },
    wrist: { label: 'Wrists', icon: '✋', type: 'volume' },
    ankle: { label: 'Ankles', icon: '🦶', type: 'volume' },
  },

  JOINT_EXERCISES: {
    shoulder: ['Barbell Bench Press','Incline Bench Press','Overhead Press','Dumbbell Shoulder Press','Lateral Raise','Dips','Pull-Ups','Barbell Row','Cable Fly','Push-Ups','Skull Crusher','Upright Row'],
    elbow: ['Barbell Curl','Skull Crusher','Tricep Pushdown','Overhead Tricep Extension','Dips','Close Grip Bench Press','Preacher Curl'],
    knee: ['Back Squat','Front Squat','Leg Press','Bulgarian Split Squat','Leg Extension','Jump Squat','Box Jump','Lunges'],
    lower_back: ['Deadlift','Romanian Deadlift','Barbell Row','Good Morning','Back Extension','Squat'],
    hip: ['Back Squat','Front Squat','Romanian Deadlift','Hip Thrust','Bulgarian Split Squat','Deadlift'],
    wrist: ['Barbell Curl','Barbell Bench Press','Front Squat','Push-Ups','Overhead Press'],
    ankle: ['Back Squat','Box Jump','Running','Jump Squat','Bulgarian Split Squat'],
  },

  PUSH_EXERCISES: ['Barbell Bench Press','Incline Bench Press','Dumbbell Bench Press','Push-Ups','Dips','Cable Fly','Overhead Press','Dumbbell Shoulder Press'],
  PULL_EXERCISES: ['Pull-Ups','Lat Pulldown','Barbell Row','Dumbbell Row','Seated Cable Row','Face Pulls','Rear Delt Fly'],
  QUAD_EXERCISES: ['Back Squat','Leg Press','Hack Squat','Leg Extension'],
  HAM_EXERCISES: ['Romanian Deadlift','Leg Curl','Nordic Curl','Good Morning'],

  _setsForJoint(joint, days) {
    const ws = S.g('workouts') || [];
    const recent = ws.filter(w => daysAgo(w.date) < days);
    const exercises = this.JOINT_EXERCISES[joint] || [];
    let count = 0;
    recent.forEach(w => {
      (w.exercises || []).forEach(ex => {
        if (exercises.some(e => (ex.name || '').toLowerCase().includes(e.toLowerCase().split(' ')[0]))) {
          count += (ex.sets || []).filter(s => s.done).length;
        }
      });
    });
    return count;
  },

  _ratio(listA, listB, days) {
    const ws = S.g('workouts') || [];
    const recent = ws.filter(w => daysAgo(w.date) < days);
    let setsA = 0, setsB = 0;
    recent.forEach(w => {
      (w.exercises || []).forEach(ex => {
        const name = (ex.name || '').toLowerCase();
        const done = (ex.sets || []).filter(s => s.done).length;
        if (listA.some(e => name.includes(e.toLowerCase().split(' ')[0]))) setsA += done;
        if (listB.some(e => name.includes(e.toLowerCase().split(' ')[0]))) setsB += done;
      });
    });
    return setsA / Math.max(setsB, 1);
  },

  score(joint) {
    const meta = this.JOINT_META[joint] || {};
    const userInjuries = S.g('user.injuries') || [];
    const hasInjury = userInjuries.some(i => (typeof i === 'string' ? i : i.name || '').toLowerCase().includes(joint.replace('_',' ')));

    let score = 100;
    const warnings = [], risks = [];

    if (hasInjury) { score -= 30; risks.push('Active injury recorded'); }

    const weekSets = this._setsForJoint(joint, 7);
    if (weekSets > 28) { score -= 20; risks.push('Very high weekly load: ' + weekSets + ' sets'); }
    else if (weekSets > 18) { score -= 10; warnings.push('High weekly load: ' + weekSets + ' sets'); }

    if (joint === 'shoulder') {
      const ratio = this._ratio(this.PUSH_EXERCISES, this.PULL_EXERCISES, 21);
      if (ratio > 2.5) { score -= 22; risks.push('Push:pull ratio ' + ratio.toFixed(1) + ':1 — severe imbalance'); }
      else if (ratio > 1.7) { score -= 10; warnings.push('Push:pull ratio ' + ratio.toFixed(1) + ':1 — add more pulling'); }
    }
    if (joint === 'elbow') {
      const recent48 = this._setsForJoint(joint, 2);
      if (recent48 > 12) { score -= 15; warnings.push('Heavy elbow load in last 48h'); }
    }
    if (joint === 'knee') {
      const ratio = this._ratio(this.QUAD_EXERCISES, this.HAM_EXERCISES, 21);
      if (ratio > 3) { score -= 20; risks.push('Quad dominance ' + ratio.toFixed(1) + ':1 — ACL risk'); }
      else if (ratio > 2) { score -= 8; warnings.push('Quad-dominant — add hamstring work'); }
    }
    if (joint === 'lower_back') {
      const recent48 = this._setsForJoint('lower_back', 2);
      if (recent48 > 10) { score -= 18; warnings.push('Heavy spinal loading in last 48h'); }
    }

    score = Math.max(0, Math.min(100, score));
    const label = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 55 ? 'Moderate' : score >= 40 ? 'Elevated Risk' : 'High Risk';
    const color = score >= 70 ? '#30d158' : score >= 55 ? '#f5c842' : score >= 40 ? '#ff9f0a' : '#ff453a';
    const emoji = score >= 70 ? '🟢' : score >= 55 ? '🟡' : score >= 40 ? '🟠' : '🔴';

    return { joint, score, label, color, emoji, warnings, risks, weekSets, meta };
  },

  allScores() {
    return this.JOINTS.map(j => ({ ...this.score(j), ...this.JOINT_META[j] }));
  },

  overallHealth() {
    const scores = this.allScores().map(j => j.score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const min = Math.min(...scores);
    return Math.round(avg * 0.6 + min * 0.4);
  },

  trend(joint) {
    const thisWeek = this._setsForJoint(joint, 7);
    const lastWeek = this._setsForJoint(joint, 14) - thisWeek;
    if (thisWeek > lastWeek * 1.3) return { dir: 'up', label: 'Increasing load', color: '#ff9f0a' };
    if (thisWeek < lastWeek * 0.7) return { dir: 'down', label: 'Decreasing load', color: '#30d158' };
    return { dir: 'stable', label: 'Stable', color: 'var(--c1)' };
  }
};
window.JointHealthEngine = JointHealthEngine;

/* ══════════════════════════════════════════════════════
   5. RECOVERY RECOMMENDATION ENGINE
══════════════════════════════════════════════════════ */
const RecoveryRecommendations = {

  generate() {
    const debt = typeof RecoveryDebtEngine !== 'undefined' ? RecoveryDebtEngine.calculate() : 50;
    const readiness = typeof ReadinessEngine !== 'undefined' ? ReadinessEngine.score() : 70;
    const rec = S.g('recovery') || {};
    const muscles = MuscleRecoveryTimeline.fullTimeline();
    const joints = JointHealthEngine.allScores();

    const recs = [];

    const sleep = parseInt(rec.sleep) || 5;
    if (sleep < 4) recs.push({ priority: 'critical', icon: '😴', category: 'Sleep', title: 'Critical Sleep Deficit', detail: 'You rated sleep ' + sleep + '/10. Sleep is when muscle protein synthesis peaks. Aim for 8 hours tonight.', action: 'Sleep 8+ hours tonight' });
    else if (sleep < 6) recs.push({ priority: 'high', icon: '😴', category: 'Sleep', title: 'Insufficient Sleep', detail: 'Sleep rated ' + sleep + '/10. You need 7-9 hours for optimal recovery and testosterone production.', action: 'Target 7-9 hours' });

    if (readiness < 60) recs.push({ priority: 'high', icon: '🥩', category: 'Nutrition', title: 'Prioritise Protein Today', detail: 'Low readiness suggests under-recovery. Ensure 1.8-2.2g protein per kg bodyweight today. Focus on leucine-rich sources (chicken, eggs, whey).', action: 'Hit protein target today' });

    recs.push({ priority: 'low', icon: '💧', category: 'Hydration', title: 'Pre-Training Hydration', detail: 'Drink 500ml water 60-90 min before training. Even 2% dehydration reduces strength output by 5-8%.', action: 'Drink 500ml before training' });

    joints.filter(j => j.score < 60).forEach(j => {
      recs.push({ priority: j.score < 40 ? 'critical' : 'high', icon: j.emoji, category: 'Joint Health', title: j.label + ' Recovery Protocol', detail: j.risks.concat(j.warnings).slice(0, 2).join('. ') || 'Elevated joint stress detected.', action: j.score < 40 ? 'Rest this joint today' : 'Reduce ' + j.label.toLowerCase() + ' loading by 30%' });
    });

    const veryFatigued = muscles.filter(m => m.pct < 40 && m.hoursSince !== null);
    if (veryFatigued.length >= 3) recs.push({ priority: 'high', icon: '💪', category: 'Muscle Recovery', title: 'Multiple Muscles Still Recovering', detail: veryFatigued.map(m => m.label).join(', ') + ' are below 40% recovery. Today\'s session should avoid these muscle groups.', action: 'Train different muscle groups today' });

    if (debt >= 70) recs.push({ priority: 'critical', icon: '🔴', category: 'Recovery Debt', title: 'High Cumulative Fatigue', detail: 'Recovery debt at ' + debt + '/100. Accumulated fatigue from training, sleep, and stress. Risk of performance plateau and injury increases significantly above 70.', action: 'Full rest day or deload week' });
    else if (debt >= 50) recs.push({ priority: 'high', icon: '🟠', category: 'Recovery Debt', title: 'Moderate Recovery Debt', detail: 'Recovery debt at ' + debt + '/100. Consider reducing volume by 25% today and prioritise 8 hours sleep.', action: 'Reduce today\'s volume by 25%' });

    if (debt >= 40 || readiness < 65) {
      recs.push({ priority: 'medium', icon: '🧘', category: 'Active Recovery', title: 'Active Recovery Session', detail: 'Light movement enhances blood flow and reduces DOMS faster than complete rest. Options: 20-min walk, yoga, foam rolling, light cycling.', action: '20 min light activity + mobility work' });
    }

    if (recs.filter(r => r.priority === 'critical' || r.priority === 'high').length === 0) {
      recs.push({ priority: 'positive', icon: '✅', category: 'Status', title: 'Recovery Status Optimal', detail: 'All systems within normal range. You\'re primed for a strong training session. Focus on progressive overload and full effort sets.', action: 'Train with maximum intensity today' });
    }

    return recs.sort((a, b) => {
      const order = { critical: 0, high: 1, medium: 2, low: 3, positive: 4 };
      return (order[a.priority] || 3) - (order[b.priority] || 3);
    });
  }
};
window.RecoveryRecommendations = RecoveryRecommendations;

/* ══════════════════════════════════════════════════════
   BODY INTELLIGENCE SCREEN
══════════════════════════════════════════════════════ */
reg('body-intelligence', function() {
  const profile = BodyResponseModel.profile();
  const timeline = MuscleRecoveryTimeline.fullTimeline();
  const joints = JointHealthEngine.allScores();
  const jointHealth = JointHealthEngine.overallHealth();
  const recs = RecoveryRecommendations.generate();
  const dna = ExerciseDNA.dnaProfile();

  const jColor = jointHealth >= 80 ? '#30d158' : jointHealth >= 60 ? '#f5c842' : '#ff453a';

  function miniGauge(score, color) {
    return '<div style="width:100%;height:6px;background:rgba(255,255,255,0.06);border-radius:3px"><div style="width:' + score + '%;height:6px;border-radius:3px;background:' + color + '"></div></div>';
  }

  return '<div class="topbar"><button type="button" onclick="history.length>1?history.back():go(\'hub\')" style="background:none;border:none;color:var(--txt3);cursor:pointer;font-size:14px;padding:0 16px;touch-action:manipulation" aria-label="Back">←</button><div class="topbar-title">Body Intelligence</div></div>' +

    '<div style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:20px;padding:16px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:12px">🎯 Today\'s Recovery Plan</div>' +
    recs.slice(0, 4).map(r => {
      const bg = r.priority === 'critical' ? 'rgba(255,69,58,0.08)' : r.priority === 'high' ? 'rgba(255,159,10,0.08)' : r.priority === 'positive' ? 'rgba(48,209,88,0.08)' : 'rgba(255,255,255,0.03)';
      const border = r.priority === 'critical' ? 'rgba(255,69,58,0.3)' : r.priority === 'high' ? 'rgba(255,159,10,0.3)' : r.priority === 'positive' ? 'rgba(48,209,88,0.3)' : 'var(--border)';
      return '<div style="background:' + bg + ';border:1px solid ' + border + ';border-radius:14px;padding:12px;margin-bottom:8px">' +
        '<div style="display:flex;align-items:flex-start;gap:10px">' +
        '<div style="font-size:22px;flex-shrink:0">' + r.icon + '</div>' +
        '<div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--txt);margin-bottom:3px">' + esc(r.title) + '</div>' +
        '<div style="font-size:11px;color:var(--txt2);line-height:1.5;margin-bottom:6px">' + esc(r.detail) + '</div>' +
        '<div style="font-size:11px;font-weight:700;color:var(--c1)">→ ' + esc(r.action) + '</div>' +
        '</div></div></div>';
    }).join('') +
    '</div>' +

    '<div style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:20px;padding:16px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:12px">⏱️ Muscle Recovery Timeline</div>' +
    timeline.map(m => '<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--border)">' +
      '<div style="font-size:16px;width:22px;text-align:center">' + m.icon + '</div>' +
      '<div style="flex:1;min-width:0">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">' +
      '<div style="font-size:12px;font-weight:700;color:var(--txt)">' + esc(m.label) + '</div>' +
      '<div style="font-size:11px;font-weight:700;color:' + m.color + '">' + m.emoji + ' ' + m.pct + '%</div>' +
      '</div>' +
      '<div style="width:100%;height:5px;background:rgba(255,255,255,0.06);border-radius:3px"><div style="width:' + m.pct + '%;height:5px;border-radius:3px;background:' + m.color + ';transition:width 0.6s ease"></div></div>' +
      (m.hoursLeft > 0 ? '<div style="font-size:10px;color:var(--txt3);margin-top:3px">' + Math.round(m.hoursLeft) + 'h until ready</div>' : '<div style="font-size:10px;color:#30d158;margin-top:3px">Ready to train ✓</div>') +
      '</div></div>'
    ).join('') +
    '</div>' +

    '<div style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:20px;padding:16px">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3)">🦴 Joint Health</div>' +
    '<div style="font-size:22px;font-weight:900;color:' + jColor + '">' + jointHealth + '/100</div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
    joints.map(j => '<div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:10px">' +
      '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">' +
      '<span style="font-size:16px">' + j.icon + '</span>' +
      '<span style="font-size:12px;font-weight:700;color:var(--txt)">' + esc(j.label) + '</span>' +
      '<span style="font-size:12px;margin-left:auto">' + j.emoji + '</span>' +
      '</div>' +
      miniGauge(j.score, j.color) +
      '<div style="display:flex;justify-content:space-between;margin-top:4px">' +
      '<span style="font-size:10px;color:' + j.color + ';font-weight:600">' + j.score + '</span>' +
      '<span style="font-size:10px;color:var(--txt3)">' + esc(j.label) + '</span>' +
      '</div>' +
      (j.warnings && j.warnings.length ? '<div style="font-size:9px;color:#ff9f0a;margin-top:4px">⚠ ' + esc(j.warnings[0]) + '</div>' : '') +
      '</div>'
    ).join('') +
    '</div>' +
    '<button type="button" onclick="go(\'injury-risk\')" style="width:100%;margin-top:12px;padding:10px;background:rgba(var(--c1-rgb),0.1);border:1px solid rgba(var(--c1-rgb),0.2);border-radius:12px;color:var(--c1);font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation">Full Joint Report →</button>' +
    '</div>' +

    '<div style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:20px;padding:16px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:12px">🧬 Body Response Model</div>' +
    (!profile.ready ?
      '<div style="text-align:center;padding:20px 0">' +
      '<div style="font-size:40px;margin-bottom:10px">🧬</div>' +
      '<div style="font-size:14px;font-weight:700;color:var(--txt);margin-bottom:6px">Learning Your Body</div>' +
      '<div style="font-size:12px;color:var(--txt3);line-height:1.6">Complete ' + (profile.sessionsNeeded || 25) + ' more workouts for personalized insights</div>' +
      '<div style="margin-top:14px;width:100%;height:6px;background:rgba(255,255,255,0.06);border-radius:3px">' +
      '<div style="width:' + Math.round(((25 - (profile.sessionsNeeded || 25)) / 25) * 100) + '%;height:6px;border-radius:3px;background:var(--c1)"></div></div>' +
      '</div>' :
      '<div style="margin-bottom:12px"><div style="font-size:12px;color:var(--txt3);margin-bottom:8px">Based on ' + profile.sessions + ' training sessions</div>' +
      (profile.insights || []).map(ins => '<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">' +
        '<div style="font-size:18px;flex-shrink:0">' + ins.icon + '</div>' +
        '<div style="font-size:12px;color:var(--txt2);line-height:1.5">' + esc(ins.text) + '</div>' +
        '</div>').join('') +
      '</div>'
    ) +
    '</div>' +

    (Object.keys(dna).length > 0 ?
      '<div style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:20px;padding:16px">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:12px">🧬 Exercise DNA Profile</div>' +
      Object.entries(dna).slice(0, 4).map(([group, exercises]) => '<div style="margin-bottom:12px">' +
        '<div style="font-size:12px;font-weight:700;color:var(--txt);margin-bottom:6px">' + esc(group) + '</div>' +
        exercises.slice(0, 3).map((ex, i) => '<div style="display:flex;align-items:center;gap:8px;padding:5px 0">' +
          '<div style="font-size:13px;font-weight:800;color:' + ex.color + ';width:20px">' + (i+1) + '</div>' +
          '<div style="flex:1;font-size:12px;color:var(--txt2)">' + esc(ex.name) + '</div>' +
          '<div style="font-size:11px;font-weight:700;color:' + ex.color + '">' + ex.score + '</div>' +
          '</div>').join('') +
        '</div>'
      ).join('') +
      '<button type="button" onclick="go(\'training-intel\')" style="width:100%;padding:10px;background:rgba(var(--c1-rgb),0.1);border:1px solid rgba(var(--c1-rgb),0.2);border-radius:12px;color:var(--c1);font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation">Full DNA Profile →</button>' +
      '</div>' : '') +

    '<div style="height:20px"></div>';
});
