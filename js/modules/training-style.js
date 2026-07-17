'use strict';
/* ── PulseCap Phase 3 — Training Style Detector + Smart Exercise Rotation ── */

/* ══════════════════════════════════════════════════════
   TRAINING STYLE DETECTOR
   Identifies style from actual behavior, not questionnaire.
══════════════════════════════════════════════════════ */
const TrainingStyleDetector = {

  detect: function() {
    var ws = S.g('workouts') || [];
    var user = S.g('user') || {};

    if (ws.length < 5) return { style: 'unknown', label: 'Needs more data', confidence: 0, icon: '🌱', color: 'var(--txt3)', desc: 'Log more workouts for style detection.', avgReps: 0, avgSets: 0, variety: 0 };

    var recent = ws.slice(-20);

    var signals = { bodybuilder: 0, strength: 0, hybrid: 0, functional: 0, endurance: 0 };

    var avgSets = recent.reduce(function(a, w) {
      return a + (w.exercises || []).reduce(function(b, ex) {
        return b + (ex.sets || []).filter(function(s) { return s.done; }).length;
      }, 0);
    }, 0) / recent.length;

    var totalReps = 0, totalSets = 0;
    recent.forEach(function(w) {
      (w.exercises || []).forEach(function(ex) {
        (ex.sets || []).filter(function(s) { return s.done; }).forEach(function(s) {
          if (s.reps) { totalReps += s.reps; totalSets++; }
        });
      });
    });
    var avgReps = totalSets ? totalReps / totalSets : 10;

    var exerciseNames = new Set();
    recent.forEach(function(w) {
      (w.exercises || []).forEach(function(ex) { if (ex.name) exerciseNames.add(ex.name); });
    });
    var variety = exerciseNames.size;

    var COMPOUNDS = ['Squat','Deadlift','Bench Press','Overhead Press','Barbell Row','Pull-Ups'];
    var compoundCount = 0;
    recent.forEach(function(w) {
      (w.exercises || []).forEach(function(ex) {
        if (COMPOUNDS.some(function(c) { return (ex.name || '').includes(c); })) compoundCount++;
      });
    });

    var cardioLogs = S.g('cardioLogs') || [];
    var recentCardio = cardioLogs.filter(function(c) { return daysAgo(c.date) < 28; }).length;

    if (avgReps <= 5) signals.strength += 30;
    if (avgReps <= 8) signals.strength += 15;
    if (avgReps >= 8 && avgReps <= 12) signals.bodybuilder += 25;
    if (avgReps >= 12) signals.bodybuilder += 15;
    if (avgReps >= 15) signals.endurance += 20;

    if (avgSets >= 20) signals.bodybuilder += 20;
    if (avgSets <= 12) signals.strength += 15;

    if (compoundCount >= 8) { signals.strength += 20; signals.hybrid += 10; }
    if (compoundCount <= 4) signals.bodybuilder += 15;

    if (variety >= 20) signals.bodybuilder += 15;
    if (variety <= 10) signals.strength += 10;

    if (recentCardio >= 8) { signals.endurance += 25; signals.functional += 15; }
    if (recentCardio >= 4) signals.hybrid += 15;

    var skills = S.g('calisthenicsProgress') || {};
    var skillCount = Object.values(skills).filter(function(v) { return v >= 2; }).length;
    if (skillCount >= 3) signals.functional += 25;

    if (user.goal === 'strength') signals.strength += 20;
    if (user.goal === 'hypertrophy') signals.bodybuilder += 20;
    if (user.goal === 'athletic') signals.functional += 20;

    var sorted = Object.entries(signals).sort(function(a, b) { return b[1] - a[1]; });
    var top = sorted[0];
    var second = sorted[1];
    var confidence = Math.min(95, Math.round((top[1] / (top[1] + second[1])) * 100));

    var style = (top[1] - second[1] < 10) ? 'hybrid' : top[0];

    var STYLE_META = {
      bodybuilder: { label: 'Bodybuilder', icon: '💪', color: '#f5c842', desc: 'High volume, moderate rep ranges, isolation work. You train for muscle size and aesthetics.' },
      strength: { label: 'Strength Athlete', icon: '🏋️', color: '#ff453a', desc: 'Heavy compounds, low reps, strength-focused. You train to move maximum weight.' },
      hybrid: { label: 'Hybrid Athlete', icon: '⚡', color: 'var(--c1)', desc: 'Balanced blend of strength and hypertrophy. Versatile, well-rounded training approach.' },
      functional: { label: 'Functional Athlete', icon: '🎯', color: '#30d158', desc: 'Movement quality, skills, conditioning. You train to perform, not just look good.' },
      endurance: { label: 'Endurance Athlete', icon: '🏃', color: '#00c7ff', desc: 'High rep work, conditioning, cardio emphasis. You train for capacity and stamina.' },
      unknown: { label: 'Style Emerging', icon: '🌱', color: 'var(--txt3)', desc: 'Log more workouts for style detection.' },
    };

    var meta = STYLE_META[style] || STYLE_META.unknown;
    return Object.assign({ style: style, confidence: confidence, signals: signals, avgReps: Math.round(avgReps), avgSets: Math.round(avgSets), variety: variety }, meta);
  }
};
window.TrainingStyleDetector = TrainingStyleDetector;

/* ══════════════════════════════════════════════════════
   SMART EXERCISE ROTATION ENGINE
══════════════════════════════════════════════════════ */
const SmartRotation = {

  ALTERNATIVES: {
    'Barbell Bench Press': [
      { name: 'Dumbbell Bench Press', reason: 'Greater ROM, reduced shoulder stress, bilateral independence', fatigueReduction: 2 },
      { name: 'Incline Dumbbell Press', reason: 'Upper chest emphasis, joint-friendly alternative', fatigueReduction: 2 },
      { name: 'Cable Chest Press', reason: 'Constant tension, lowest joint stress', fatigueReduction: 3 },
    ],
    'Barbell Row': [
      { name: 'Chest Supported Row', reason: 'Same back stimulus, eliminates lower back loading', fatigueReduction: 3 },
      { name: 'Dumbbell Row', reason: 'Unilateral, more ROM, lower spinal compression', fatigueReduction: 2 },
      { name: 'Seated Cable Row', reason: 'Constant tension, supported position', fatigueReduction: 2 },
    ],
    'Back Squat': [
      { name: 'Leg Press', reason: 'Same quad stimulus, removes spinal loading when lower back fatigued', fatigueReduction: 3 },
      { name: 'Hack Squat', reason: 'Machine-supported, high quad activation, reduced core demand', fatigueReduction: 2 },
      { name: 'Goblet Squat', reason: 'Technique reset, lower absolute load, joint-friendly', fatigueReduction: 3 },
    ],
    'Deadlift': [
      { name: 'Rack Pull', reason: 'Reduced ROM, same upper back and trap stimulus', fatigueReduction: 3 },
      { name: 'Romanian Deadlift', reason: 'Hamstring emphasis, lower CNS cost', fatigueReduction: 3 },
      { name: 'Trap Bar Deadlift', reason: 'More upright position, lower back friendly', fatigueReduction: 2 },
    ],
    'Overhead Press': [
      { name: 'Dumbbell Shoulder Press', reason: 'More natural arc, less shoulder impingement risk', fatigueReduction: 2 },
      { name: 'Landmine Press', reason: 'Arc movement pattern, minimal shoulder impingement', fatigueReduction: 3 },
      { name: 'Machine Shoulder Press', reason: 'Supported, guided path, recovery session option', fatigueReduction: 3 },
    ],
    'Pull-Ups': [
      { name: 'Lat Pulldown', reason: 'Same lat pattern, adjustable load, reduced joint stress', fatigueReduction: 2 },
      { name: 'Assisted Pull-Up', reason: 'Same movement, reduced bodyweight demand', fatigueReduction: 2 },
    ],
    'Barbell Curl': [
      { name: 'Dumbbell Curl', reason: 'Natural supination arc, reduced wrist stress', fatigueReduction: 1 },
      { name: 'Cable Curl', reason: 'Constant tension throughout ROM, elbow-friendly', fatigueReduction: 2 },
      { name: 'EZ Bar Curl', reason: 'Neutral grip reduces wrist and elbow stress', fatigueReduction: 2 },
    ],
    'Skull Crusher': [
      { name: 'Tricep Pushdown', reason: 'No elbow flexion at stretch — much lower elbow stress', fatigueReduction: 3 },
      { name: 'Overhead Tricep Extension', reason: 'Long-head emphasis, alternative loading pattern', fatigueReduction: 1 },
    ],
    'Leg Extension': [
      { name: 'Hack Squat', reason: 'Compound quad work, less patellar stress', fatigueReduction: 0 },
      { name: 'Bulgarian Split Squat', reason: 'Unilateral, natural movement, addresses imbalances', fatigueReduction: -1 },
    ],
    'Incline Bench Press': [
      { name: 'Incline Dumbbell Press', reason: 'Shoulder-friendly arc, greater pec stretch', fatigueReduction: 2 },
      { name: 'Low Cable Fly', reason: 'Constant tension on upper chest, zero joint stress', fatigueReduction: 3 },
    ],
    'Romanian Deadlift': [
      { name: 'Leg Curl', reason: 'Pure hamstring isolation, removes lower back demand', fatigueReduction: 3 },
      { name: 'Nordic Curl', reason: 'Eccentric hamstring emphasis, injury prevention', fatigueReduction: 1 },
    ],
  },

  _exerciseAnalysis: function(exerciseName) {
    var ws = S.g('workouts') || [];
    var recent = ws.filter(function(w) { return daysAgo(w.date) < 28; });
    var instances = [];

    recent.forEach(function(w) {
      (w.exercises || []).forEach(function(ex) {
        if ((ex.name || '').toLowerCase() === exerciseName.toLowerCase()) {
          var best = (ex.sets || []).filter(function(s) { return s.done && s.weight > 0; })
            .reduce(function(max, s) {
              var e1rm = s.weight * (1 + (s.reps || 1) / 30);
              return e1rm > max ? e1rm : max;
            }, 0);
          instances.push({ date: w.date, e1rm: best });
        }
      });
    });

    if (instances.length < 2) return { stagnant: false, sessions: instances.length };

    instances.sort(function(a, b) { return new Date(a.date) - new Date(b.date); });
    var first = instances[0].e1rm;
    var last = instances[instances.length - 1].e1rm;
    var gainPct = ((last - first) / Math.max(first, 1)) * 100;

    return {
      stagnant: gainPct < 3 && instances.length >= 3,
      sessions: instances.length,
      gainPct: Math.round(gainPct),
      lastE1RM: Math.round(last),
    };
  },

  _jointStress: function(exerciseName) {
    var EXERCISE_JOINTS = {
      'Barbell Bench Press': 'shoulder', 'Incline Bench Press': 'shoulder',
      'Barbell Row': 'lower_back', 'Deadlift': 'lower_back',
      'Back Squat': 'knee', 'Overhead Press': 'shoulder',
      'Pull-Ups': 'shoulder', 'Barbell Curl': 'elbow',
      'Skull Crusher': 'elbow', 'Leg Extension': 'knee',
    };
    var joint = EXERCISE_JOINTS[exerciseName];
    if (!joint) return 100;
    var score = (typeof JointHealthEngine !== 'undefined') ? JointHealthEngine.score(joint).score : 100;
    return score;
  },

  suggestionsForDay: function(exercises) {
    var self = this;
    var suggestions = [];
    (exercises || []).forEach(function(ex) {
      var alts = self.ALTERNATIVES[ex.name];
      if (!alts) return;

      var analysis = self._exerciseAnalysis(ex.name);
      var jointStress = self._jointStress(ex.name);

      var reasons = [];
      if (analysis.stagnant) reasons.push('No strength progress in 4 weeks (' + analysis.gainPct + '%)');
      if (jointStress < 60) reasons.push('Joint health below optimal (' + jointStress + '/100)');
      if (analysis.sessions >= 8) reasons.push('High familiarity — stimulus adaptation may have occurred');

      if (reasons.length === 0) return;

      var bestAlt = alts.slice().sort(function(a, b) { return b.fatigueReduction - a.fatigueReduction; })[0];

      suggestions.push({
        from: ex.name,
        to: bestAlt.name,
        altReason: bestAlt.reason,
        triggerReasons: reasons,
        fatigueReduction: bestAlt.fatigueReduction,
        allAlternatives: alts,
      });
    });
    return suggestions;
  },

  globalSuggestions: function() {
    var self = this;
    var ws = S.g('workouts') || [];
    var trainedExercises = new Set();
    ws.slice(-10).forEach(function(w) {
      (w.exercises || []).forEach(function(ex) { if (ex.name) trainedExercises.add(ex.name); });
    });

    var suggestions = [];
    trainedExercises.forEach(function(name) {
      var alts = self.ALTERNATIVES[name];
      if (!alts) return;
      var analysis = self._exerciseAnalysis(name);
      var jointStress = self._jointStress(name);
      if (analysis.stagnant || jointStress < 55) {
        var bestAlt = alts[0];
        suggestions.push({
          from: name, to: bestAlt.name,
          altReason: bestAlt.reason,
          triggerReasons: analysis.stagnant ? ['Stagnant for 4 weeks'] : ['Joint stress elevated'],
          fatigueReduction: bestAlt.fatigueReduction,
          allAlternatives: alts,
        });
      }
    });
    return suggestions.slice(0, 5);
  }
};
window.SmartRotation = SmartRotation;

/* ══════════════════════════════════════════════════════
   TRAINING INTELLIGENCE COMBINED SCREEN
══════════════════════════════════════════════════════ */
window.renderTrainingStyleBody = function() {
  var style = TrainingStyleDetector.detect();
  var rotation = SmartRotation.globalSuggestions();
  var proportion = (typeof ProportionAnalyzer !== 'undefined') ? ProportionAnalyzer.analyze() : null;

  return '' +

    '<div style="margin:0 16px 14px;background:linear-gradient(135deg,rgba(var(--c1-rgb),0.1),rgba(0,0,0,0.2));border:1px solid rgba(var(--c1-rgb),0.2);border-radius:20px;padding:18px">' +
    '<div  class="section-label">Detected Training Style</div>' +
    '<div style="display:flex;align-items:center;gap:16px;margin-bottom:14px">' +
    '<div style="font-size:52px">' + style.icon + '</div>' +
    '<div  class="flex-1">' +
    '<div style="font-size:20px;font-weight:900;color:' + style.color + ';margin-bottom:4px">' + esc(style.label) + '</div>' +
    '<div class="body-12-lh">' + esc(style.desc) + '</div>' +
    '</div></div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">' +
    '<div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:10px;text-align:center"><div style="font-size:18px;font-weight:800;color:' + style.color + '">' + style.avgReps + '</div><div  class="muted-10">avg reps</div></div>' +
    '<div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:10px;text-align:center"><div style="font-size:18px;font-weight:800;color:' + style.color + '">' + style.avgSets + '</div><div  class="muted-10">avg sets</div></div>' +
    '<div style="background:rgba(255,255,255,0.05);border-radius:10px;padding:10px;text-align:center"><div style="font-size:18px;font-weight:800;color:' + style.color + '">' + style.confidence + '%</div><div  class="muted-10">confidence</div></div>' +
    '</div></div>' +

    '<div  class="card-block">' +
    '<div  class="section-label">🔄 Smart Exercise Rotation</div>' +
    (rotation.length === 0 ?
      '<div style="text-align:center;padding:20px 0;color:var(--txt3)"><div style="font-size:32px;margin-bottom:8px">✅</div><div style="font-size:13px">All exercises showing good progress<br>No rotations needed right now</div></div>' :
      rotation.map(function(s) {
        return '<div style="background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:10px">' +
          '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#ff9f0a;margin-bottom:8px">Rotation Suggestion</div>' +
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
          '<div style="flex:1;background:rgba(255,69,58,0.08);border:1px solid rgba(255,69,58,0.2);border-radius:10px;padding:10px;text-align:center">' +
          '<div style="font-size:11px;color:var(--txt3);margin-bottom:3px">Current</div>' +
          '<div  class="row-title">' + esc(s.from) + '</div>' +
          '</div>' +
          '<div class="fs-20">→</div>' +
          '<div style="flex:1;background:rgba(48,209,88,0.08);border:1px solid rgba(48,209,88,0.2);border-radius:10px;padding:10px;text-align:center">' +
          '<div style="font-size:11px;color:var(--txt3);margin-bottom:3px">Suggested</div>' +
          '<div style="font-size:13px;font-weight:700;color:#30d158">' + esc(s.to) + '</div>' +
          '</div></div>' +
          '<div style="font-size:12px;color:var(--txt2);margin-bottom:8px">📋 ' + esc(s.altReason) + '</div>' +
          s.triggerReasons.map(function(r) { return '<div style="font-size:11px;color:#ff9f0a;margin-bottom:3px">⚠️ ' + esc(r) + '</div>'; }).join('') +
          '<div style="display:flex;gap:8px;margin-top:10px">' +
          '<button type="button" onclick="this.parentElement.parentElement.style.display=\'none\'" style="flex:1;padding:10px;background:rgba(48,209,88,0.15);border:1px solid rgba(48,209,88,0.3);border-radius:10px;color:#30d158;font-size:13px;font-weight:700;cursor:pointer;touch-action:manipulation">✓ Accept</button>' +
          '<button type="button" onclick="this.parentElement.parentElement.style.opacity=\'0.4\'" style="flex:1;padding:10px;background:rgba(255,255,255,0.05);border:1px solid var(--border);border-radius:10px;color:var(--txt3);font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation">✗ Ignore</button>' +
          '</div></div>';
      }).join('')
    ) +
    '</div>' +

    (proportion && proportion.weakPoints.length ?
      '<div style="margin:0 16px 14px;background:rgba(255,159,10,0.06);border:1px solid rgba(255,159,10,0.2);border-radius:16px;padding:14px">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#ff9f0a;margin-bottom:8px">📐 Proportion Weak Points</div>' +
      proportion.weakPoints.map(function(w) { return '<div style="font-size:12px;color:var(--txt2);padding:4px 0">⚠️ ' + esc(w) + '</div>'; }).join('') +
      '<button type="button" onclick="go(\'physique\',{tab:\'archetype\'})" style="margin-top:10px;width:100%;padding:10px;background:rgba(var(--c1-rgb),0.1);border:1px solid rgba(var(--c1-rgb),0.2);border-radius:10px;color:var(--c1);font-size:13px;font-weight:600;cursor:pointer">View Physique Archetype →</button>' +
      '</div>' : '') +

    '<div  class="spacer-bottom"></div>';

};

reg('training-style', function() {
  return window.renderTrainingIntelUnified({ tab: 'style' });
});
