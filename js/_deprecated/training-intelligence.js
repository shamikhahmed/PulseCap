'use strict';
/* ── PulseCap — Training Intelligence Suite ── */

/* ══════════════════════════════════════════════════════
   TRAINING AGE ENGINE
══════════════════════════════════════════════════════ */
var TrainingAgeEngine = {

  calculate: function() {
    var ws = S.g('workouts') || [];
    var prs = S.g('prs') || [];
    var user = S.g('user') || {};

    if (!ws.length) return { years: 0, label: 'No training history', tier: 'novice', multiplier: 1.8, description: 'Start logging workouts to track your training age.', totalSessions: 0, prCount: 0 };

    var weeklyGoal = user.weeklyGoal || 4;
    var consistencyScore = ws.length / weeklyGoal;
    var years = consistencyScore / 52;

    var last12wks = ws.filter(function(w) { return daysAgo(w.date) < 84; });
    var consistencyPct = last12wks.length / (weeklyGoal * 12);
    years *= (0.7 + consistencyPct * 0.3);

    var prDensity = prs.length / Math.max(ws.length, 1);
    if (prDensity > 0.3) years *= 1.1;

    var skills = S.g('calisthenicsProgress') || {};
    var advancedSkills = Object.values(skills).filter(function(v) { return v >= 4; }).length;
    years += advancedSkills * 0.15;

    years = Math.round(years * 10) / 10;

    var tier, label, multiplier, description;
    if (years < 0.5) {
      tier = 'novice'; label = 'Novice'; multiplier = 1.8;
      description = 'Rapid strength gains expected. Focus on technique and consistency over intensity.';
    } else if (years < 1.5) {
      tier = 'beginner'; label = 'Early Intermediate'; multiplier = 1.4;
      description = 'Linear progression still effective. Begin periodization. Strong gains ahead.';
    } else if (years < 3) {
      tier = 'intermediate'; label = 'Intermediate'; multiplier = 1.15;
      description = 'Monthly progression. Need periodization, volume cycling, and weak-point work.';
    } else if (years < 6) {
      tier = 'advanced'; label = 'Advanced'; multiplier = 1.05;
      description = 'Yearly gains. Specialization blocks, advanced techniques, and precise programming needed.';
    } else {
      tier = 'elite'; label = 'Elite'; multiplier = 1.01;
      description = 'Marginal gains. Elite-level programming, periodization blocks, and recovery optimization.';
    }

    return { years: years, tier: tier, label: label, multiplier: multiplier, description: description, totalSessions: ws.length, prCount: prs.length };
  },

  strengthForecast: function(exerciseName, weeks) {
    var ws = S.g('workouts') || [];
    var prs = S.g('prs') || [];
    var age = this.calculate();

    var currentMax = 0;
    prs.forEach(function(p) {
      if ((p.exercise || '').toLowerCase().includes((exerciseName || '').toLowerCase())) {
        currentMax = Math.max(currentMax, p.weight || 0);
      }
    });

    if (!currentMax) {
      ws.slice(-20).forEach(function(w) {
        (w.exercises || []).forEach(function(ex) {
          if ((ex.name || '').toLowerCase().includes((exerciseName || '').toLowerCase())) {
            (ex.sets || []).forEach(function(s) {
              if (s.done) currentMax = Math.max(currentMax, s.weight || 0);
            });
          }
        });
      });
    }

    if (!currentMax) return null;

    var isCompound = ['Bench','Squat','Deadlift','Press','Row'].some(function(c) { return exerciseName.includes(c); });
    var baseGainKg = isCompound ? 0.5 : 0.25;
    var gainRate = baseGainKg * age.multiplier;
    var projected = Math.round((currentMax + gainRate * weeks) * 10) / 10;

    return { current: currentMax, projected: projected, gainRate: Math.round(gainRate * 10) / 10, weeks: weeks };
  }
};
window.TrainingAgeEngine = TrainingAgeEngine;

/* ══════════════════════════════════════════════════════
   ADAPTIVE VOLUME ALLOCATION ENGINE
══════════════════════════════════════════════════════ */
var VolumeAllocationEngine = {

  MUSCLE_EXERCISES: {
    Chest: ['Barbell Bench Press','Incline Bench Press','Dumbbell Bench Press','Push-Ups','Cable Fly','Dips','Pec Deck','Chest Press'],
    Back: ['Pull-Ups','Lat Pulldown','Barbell Row','Dumbbell Row','Seated Cable Row','T-Bar Row','Face Pulls'],
    Shoulders: ['Overhead Press','Dumbbell Shoulder Press','Lateral Raise','Arnold Press','Face Pulls','Upright Row'],
    Biceps: ['Barbell Curl','Dumbbell Curl','Hammer Curl','Preacher Curl','Cable Curl','EZ Bar Curl'],
    Triceps: ['Tricep Pushdown','Skull Crusher','Close Grip Bench Press','Dips','Overhead Tricep Extension'],
    Quads: ['Back Squat','Front Squat','Leg Press','Leg Extension','Hack Squat','Bulgarian Split Squat'],
    Hamstrings: ['Romanian Deadlift','Leg Curl','Nordic Curl','Deadlift','Good Morning'],
    Glutes: ['Hip Thrust','Glute Bridge','Bulgarian Split Squat','Romanian Deadlift','Cable Kickback'],
    Calves: ['Calf Raise','Seated Calf Raise','Single-Leg Calf Raise'],
    'Rear Delts': ['Face Pulls','Rear Delt Fly','Reverse Pec Deck','Band Pull-Apart','Cable Rear Delt Fly'],
  },

  currentVolume: function() {
    var ws = S.g('workouts') || [];
    var last4wks = ws.filter(function(w) { return daysAgo(w.date) < 28; });
    var result = {};
    var self = this;

    Object.keys(self.MUSCLE_EXERCISES).forEach(function(muscle) {
      var exercises = self.MUSCLE_EXERCISES[muscle];
      var sets = 0;
      last4wks.forEach(function(w) {
        (w.exercises || []).forEach(function(ex) {
          if (exercises.some(function(e) { return (ex.name || '').toLowerCase().includes(e.toLowerCase()); })) {
            sets += (ex.sets || []).filter(function(s) { return s.done; }).length;
          }
        });
      });
      result[muscle] = Math.round(sets / 4);
    });

    return result;
  },

  recommendations: function() {
    var current = this.currentVolume();
    var min = 10, max = 20;
    var recs = [];

    Object.keys(current).forEach(function(muscle) {
      var sets = current[muscle];
      if (sets === 0) {
        recs.push({ muscle: muscle, current: sets, status: 'neglected', priority: 'critical', action: 'Start training — add 10-12 sets/week minimum', addSets: 10, color: 'var(--danger)' });
      } else if (sets < min) {
        var add = min - sets;
        recs.push({ muscle: muscle, current: sets, status: 'undertrained', priority: 'high', action: 'Add ' + add + ' sets/week to reach minimum effective volume', addSets: add, color: 'var(--warn)' });
      } else if (sets > max + 5) {
        var reduce = sets - max;
        recs.push({ muscle: muscle, current: sets, status: 'excessive', priority: 'medium', action: 'Reduce by ' + reduce + ' sets/week — diminishing returns zone', addSets: -reduce, color: 'var(--c2)' });
      } else {
        recs.push({ muscle: muscle, current: sets, status: 'optimal', priority: 'low', action: 'Volume in optimal range', addSets: 0, color: 'var(--success)' });
      }
    });

    var priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return recs.sort(function(a, b) { return priorityOrder[a.priority] - priorityOrder[b.priority]; });
  },

  imbalances: function() {
    var recs = this.recommendations();
    return {
      undertrained: recs.filter(function(r) { return r.status === 'undertrained' || r.status === 'neglected'; }),
      overtrained: recs.filter(function(r) { return r.status === 'excessive'; })
    };
  }
};
window.VolumeAllocationEngine = VolumeAllocationEngine;

/* ══════════════════════════════════════════════════════
   EXERCISE RESPONSE LEARNING ENGINE
══════════════════════════════════════════════════════ */
var ExerciseResponseEngine = {

  effectiveness: function(exerciseName) {
    var ws = S.g('workouts') || [];
    var prs = S.g('prs') || [];
    var instances = [];

    ws.forEach(function(w) {
      (w.exercises || []).forEach(function(ex) {
        if ((ex.name || '').toLowerCase() === exerciseName.toLowerCase()) {
          var best = (ex.sets || []).filter(function(s) { return s.done && s.weight > 0; })
            .reduce(function(mx, s) { return Math.max(mx, s.weight * (1 + (s.reps || 1) / 30)); }, 0);
          if (best > 0) instances.push({ date: w.date, e1rm: best });
        }
      });
    });

    if (instances.length < 2) return { score: null, trend: 'insufficient_data', sessions: instances.length };

    instances.sort(function(a, b) { return new Date(a.date) - new Date(b.date); });

    var first = instances[0].e1rm;
    var last = instances[instances.length - 1].e1rm;
    var gainPct = ((last - first) / first) * 100;

    var exPRs = prs.filter(function(p) { return (p.exercise || '').toLowerCase() === exerciseName.toLowerCase(); }).length;

    var score = 50;
    if (gainPct > 30) score += 30;
    else if (gainPct > 15) score += 20;
    else if (gainPct > 5) score += 10;
    else if (gainPct < 0) score -= 15;

    if (exPRs >= 3) score += 15;
    else if (exPRs >= 1) score += 8;

    score += Math.min(instances.length / 10, 1) * 15;
    score = Math.max(0, Math.min(100, Math.round(score)));

    var trend = gainPct > 10 ? 'excellent' : gainPct > 3 ? 'good' : gainPct > -3 ? 'stagnant' : 'declining';
    var color = score >= 75 ? 'var(--success)' : score >= 55 ? 'var(--c1)' : score >= 40 ? '#f5c842' : 'var(--warn)';

    return { score: score, trend: trend, color: color, sessions: instances.length, gainPct: Math.round(gainPct), currentE1RM: Math.round(last), startE1RM: Math.round(first), prCount: exPRs };
  },

  rankings: function() {
    var ws = S.g('workouts') || [];
    var trained = {};
    var self = this;

    ws.forEach(function(w) {
      (w.exercises || []).forEach(function(ex) {
        if (ex.name && (ex.sets || []).some(function(s) { return s.done && s.weight > 0; })) {
          trained[ex.name] = true;
        }
      });
    });

    var results = [];
    Object.keys(trained).forEach(function(name) {
      var eff = self.effectiveness(name);
      if (eff.score !== null) results.push(Object.assign({ name: name }, eff));
    });

    return results.sort(function(a, b) { return b.score - a.score; });
  },

  topExercises: function(n) { return this.rankings().slice(0, n || 5); },
  lowEffectiveness: function(n) { return this.rankings().filter(function(e) { return e.score < 45; }).slice(0, n || 3); }
};
window.ExerciseResponseEngine = ExerciseResponseEngine;

/* ══════════════════════════════════════════════════════
   SPECIALIZATION BLOCK GENERATOR
══════════════════════════════════════════════════════ */
var SpecializationEngine = {

  BLOCKS: {
    chest: {
      name: 'Upper Chest Specialization', duration: '6 weeks', target: 'pec_major_clavicular',
      focus: 'Incline pressing, upper chest isolation, cable crossovers from below',
      exercises: ['Incline Barbell Press','Incline Dumbbell Press','Low Cable Fly','Incline Dumbbell Fly','Landmine Press'],
      volume: '20-24 sets/week chest (16-18 incline)',
      frequency: '2-3x per week chest',
      deload_week: 'Week 4 — reduce to 10 sets at 60% intensity',
      expected_gain: '+0.5-1.0cm upper chest girth in 6 weeks',
      rationale: 'Upper chest is often undertrained due to flat pressing dominance. Incline press at 30-45° maximally recruits clavicular head.'
    },
    back: {
      name: 'Lat Width Block', duration: '6 weeks', target: 'latissimus_dorsi',
      focus: 'Vertical pulling, wide grip, full ROM, straight-arm work',
      exercises: ['Wide Grip Pull-Ups','Wide Grip Lat Pulldown','Straight-Arm Pulldown','Single-Arm Pulldown','Cable Pullover'],
      volume: '20-24 sets/week back',
      frequency: '2-3x per week back',
      deload_week: 'Week 4 — 50% volume, focus on lat stretch and mind-muscle',
      expected_gain: '+1-2cm lat width projection in 6 weeks',
      rationale: 'Lat width is driven by full ROM vertical pulling. Most people row too much and pull too little.'
    },
    shoulders: {
      name: 'Rear Delt Specialization', duration: '4 weeks', target: 'posterior_deltoid',
      focus: 'Horizontal pulling, face pulls, rear isolation, external rotation',
      exercises: ['Face Pulls','Rear Delt Fly','Reverse Pec Deck','Band Pull-Apart','Cable Rear Delt Row','Prone Y-Raise'],
      volume: '20+ sets/week rear delts and upper back',
      frequency: '3-4x per week (light enough for daily)',
      deload_week: 'Week 3 — reduce by 40%',
      expected_gain: 'Improved posture, shoulder health, and visible rear delt development',
      rationale: 'Rear delts are universally undertrained. Push-heavy programs create shoulder impingement risk. This block corrects the imbalance.'
    },
    arms: {
      name: 'Arm Specialization Block', duration: '6 weeks', target: 'biceps_brachii',
      focus: 'Arm frequency (3x/week), peak contraction emphasis, stretch position work',
      exercises: ['Incline Dumbbell Curl','Preacher Curl','Cable Curl','Hammer Curl','Skull Crusher','Overhead Tricep Extension','Close Grip Bench Press'],
      volume: '16-20 sets/week arms (8-10 biceps, 8-10 triceps)',
      frequency: '3x per week dedicated arm work',
      deload_week: 'Week 4 — one arm session only',
      expected_gain: '+0.3-0.6cm arm circumference in 6 weeks',
      rationale: 'Arms respond well to increased frequency and direct work. Emphasis on stretch-position exercises (incline curl) produces superior hypertrophy.'
    },
    calves: {
      name: 'Calf Specialization Block', duration: '8 weeks', target: 'gastrocnemius',
      focus: 'High frequency, full ROM, slow eccentrics, both standing and seated',
      exercises: ['Standing Calf Raise','Seated Calf Raise','Single-Leg Calf Raise','Donkey Calf Raise','Leg Press Calf Raise'],
      volume: '24-30 sets/week calves (high frequency required)',
      frequency: '4-5x per week (calves recover fast)',
      deload_week: 'Week 5 — drop to 12 sets',
      expected_gain: '+0.5-1.0cm calf girth in 8 weeks (genetics-dependent)',
      rationale: 'Calves contain mainly slow-twitch fibers and require high frequency and volume. Full ROM and 4-second eccentrics are critical.'
    },
    glutes: {
      name: 'Glute Specialization Block', duration: '6 weeks', target: 'gluteus_maximus',
      focus: 'Hip thrust emphasis, hip extension ROM, banded activation, high hip flexor mobility',
      exercises: ['Barbell Hip Thrust','B-Stance Hip Thrust','Single-Leg Hip Thrust','Cable Glute Kickback','Romanian Deadlift','Bulgarian Split Squat'],
      volume: '20-24 sets/week glutes',
      frequency: '2-3x per week',
      deload_week: 'Week 4',
      expected_gain: '+1-2cm hip girth, improved glute-ham tie-in',
      rationale: 'Glutes respond best to hip thrust variations with peak contraction at full extension. Combine with RDL for stretch-position stimulus.'
    },
    quads: {
      name: 'Quad Dominance Block', duration: '6 weeks', target: 'quadriceps',
      focus: 'High-bar squat, leg press, leg extension, knee-over-toe emphasis',
      exercises: ['High-Bar Back Squat','Front Squat','Leg Press (narrow stance)','Leg Extension','Hack Squat','Bulgarian Split Squat'],
      volume: '20-24 sets/week quads',
      frequency: '2-3x per week',
      deload_week: 'Week 4',
      expected_gain: '+1-2cm thigh girth',
      rationale: 'Quads require knee-dominant movements with full ROM. High-bar squat and front squat maximally target rectus femoris.'
    },
  },

  recommend: function() {
    var volRecs = VolumeAllocationEngine.recommendations();
    var muscleToBlock = {
      'Chest': 'chest', 'Back': 'back', 'Shoulders': 'shoulders',
      'Biceps': 'arms', 'Triceps': 'arms', 'Calves': 'calves',
      'Glutes': 'glutes', 'Quads': 'quads', 'Rear Delts': 'shoulders'
    };
    var self = this;

    var critical = volRecs.filter(function(r) { return r.status === 'undertrained' || r.status === 'neglected'; });
    for (var i = 0; i < critical.length; i++) {
      var rec = critical[i];
      var blockKey = muscleToBlock[rec.muscle];
      if (blockKey && self.BLOCKS[blockKey]) {
        return { block: self.BLOCKS[blockKey], reason: rec.muscle + ' severely undertrained (' + rec.current + ' sets/wk)', muscle: rec.muscle };
      }
    }

    if (typeof GrowthSimulator !== 'undefined') {
      var lagging = GrowthSimulator.laggingMuscles ? GrowthSimulator.laggingMuscles() : [];
      for (var j = 0; j < lagging.length; j++) {
        var lag = lagging[j];
        var lagKey = muscleToBlock[lag.label] || lag.muscle;
        if (self.BLOCKS[lagKey]) {
          return { block: self.BLOCKS[lagKey], reason: lag.label + ' showing slowest growth velocity (' + lag.velocity + 'cm/8wk)', muscle: lag.label };
        }
      }
    }

    return { block: this.BLOCKS.shoulders, reason: 'Rear delts are universally undertrained — excellent starting point', muscle: 'Rear Delts' };
  },

  allBlocks: function() { return Object.values(this.BLOCKS); }
};
window.SpecializationEngine = SpecializationEngine;

/* ══════════════════════════════════════════════════════
   TRAINING INTELLIGENCE SCREEN
══════════════════════════════════════════════════════ */

function _trainingIntelTabBar(tab) {
  var tabs = [{ id: 'intel', label: 'Intel' }, { id: 'style', label: 'Style' }];
  return '<div style="display:flex;gap:6px;padding:8px 16px 12px">' +
    tabs.map(function(t) {
      var on = t.id === tab;
      return '<button type="button" onclick="go(\'training-intel\',{tab:\'' + t.id + '\'})" class="press" style="flex-shrink:0;padding:8px 14px;border-radius:999px;border:1px solid ' +
        (on ? 'var(--c1)' : 'var(--border)') + ';background:' + (on ? 'rgba(var(--c1-rgb),0.15)' : 'var(--bg3)') +
        ';color:' + (on ? 'var(--c1)' : 'var(--txt2)') + ';font-size:12px;font-weight:700;cursor:pointer;touch-action:manipulation">' + esc(t.label) + '</button>';
    }).join('') + '</div>';
}

window.renderTrainingIntelBody = function() {

  var age = TrainingAgeEngine.calculate();
  var volRecs = VolumeAllocationEngine.recommendations();
  var topEx = ExerciseResponseEngine.topExercises(5);
  var lowEx = ExerciseResponseEngine.lowEffectiveness(3);
  var specRec = SpecializationEngine.recommend();
  var imb = VolumeAllocationEngine.imbalances();
  var undertrained = imb.undertrained;

  var ageColor = age.tier === 'elite' ? 'var(--success)' : age.tier === 'advanced' ? 'var(--c1)' : age.tier === 'intermediate' ? '#f5c842' : 'var(--warn)';

  var forecastExercises = ['Barbell Bench Press','Back Squat','Deadlift'];
  var forecasts = forecastExercises.map(function(ex) {
    var f = TrainingAgeEngine.strengthForecast(ex, 12);
    return f ? Object.assign({ name: ex }, f) : null;
  }).filter(Boolean);

  return '' +

    '<div style="padding:20px 16px 14px">' +
    '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:20px;padding:18px">' +
    '<div  class="section-label">Training Age</div>' +
    '<div style="display:flex;align-items:center;gap:16px">' +
    '<div style="text-align:center">' +
    '<div style="font-size:48px;font-weight:900;color:' + ageColor + ';line-height:1">' + age.years + '</div>' +
    '<div  class="muted-11">years effective</div>' +
    '</div>' +
    '<div  class="flex-1">' +
    '<div style="font-size:16px;font-weight:800;color:' + ageColor + ';margin-bottom:4px">' + esc(age.label) + '</div>' +
    '<div style="font-size:12px;color:var(--txt2);line-height:1.5;margin-bottom:8px">' + esc(age.description) + '</div>' +
    '<div  class="muted-11">' + age.totalSessions + ' sessions · ' + age.prCount + ' PRs logged</div>' +
    '</div></div></div></div>' +

    (forecasts.length ? '<div  class="card-block">' +
      '<div  class="section-label">12-Week Strength Forecast</div>' +
      forecasts.map(function(f) {
        return '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">' +
          '<div  class="flex-1"><div  class="row-title">' + esc(f.name) + '</div>' +
          '<div  class="muted-11">+' + f.gainRate + 'kg/wk projected</div></div>' +
          '<div class="ta-right">' +
          '<div  class="muted-13">' + f.current + 'kg</div>' +
          '<div  class="muted-12">→</div>' +
          '<div style="font-size:15px;font-weight:800;color:var(--success)">' + f.projected + 'kg</div>' +
          '</div></div>';
      }).join('') +
      '</div>' : '') +

    '<div  class="card-block">' +
    '<div  class="section-label">Volume Allocation Analysis</div>' +
    (undertrained.length ? '<div  class="mb-10"><div style="font-size:12px;font-weight:700;color:var(--warn);margin-bottom:6px">Undertrained Muscles</div>' +
      undertrained.map(function(r) {
        return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border)">' +
          '<div><div  class="row-title">' + esc(r.muscle) + '</div>' +
          '<div style="font-size:11px;color:' + r.color + '">' + esc(r.action) + '</div></div>' +
          '<div style="font-size:13px;font-weight:700;color:' + r.color + '">' + r.current + ' sets</div>' +
          '</div>';
      }).join('') + '</div>' : '') +
    volRecs.filter(function(r) { return r.status === 'optimal'; }).map(function(r) {
      return '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border)">' +
        '<div style="font-size:13px;color:var(--txt)">' + esc(r.muscle) + '</div>' +
        '<div style="font-size:11px;color:var(--success);display:flex;align-items:center;gap:4px">' + icon('check', 12, 'var(--success)') + ' ' + r.current + ' sets/wk</div></div>';
    }).join('') +
    '</div>' +

    (topEx.length ? '<div  class="card-block">' +
      '<div  class="section-label" style="display:flex;align-items:center;gap:6px">' + icon('gradcap', 14) + ' Your Best Exercises</div>' +
      topEx.map(function(ex, i) {
        return '<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border)">' +
          '<div style="font-size:16px;font-weight:900;color:' + ex.color + ';width:24px">' + (i + 1) + '</div>' +
          '<div  class="flex-1"><div  class="row-title">' + esc(ex.name) + '</div>' +
          '<div  class="muted-11">' + ex.sessions + ' sessions · +' + ex.gainPct + '% strength gain · ' + ex.prCount + ' PRs</div></div>' +
          '<div style="font-size:18px;font-weight:800;color:' + ex.color + '">' + ex.score + '</div>' +
          '</div>';
      }).join('') +
      '</div>' : '') +

    (lowEx.length ? '<div style="margin:0 16px 14px;background:rgba(255,159,10,0.06);border:1px solid rgba(255,159,10,0.2);border-radius:20px;padding:16px">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--warn);margin-bottom:12px;display:flex;align-items:center;gap:6px">' + icon('alert', 14, 'var(--warn)') + ' Consider Replacing</div>' +
      lowEx.map(function(ex) {
        return '<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border)">' +
          '<div  class="flex-1"><div  class="row-title">' + esc(ex.name) + '</div>' +
          '<div style="font-size:11px;color:var(--warn)">Effectiveness: ' + ex.score + '/100 · ' + esc(ex.trend) + '</div></div>' +
          '<button type="button" onclick="go(\'workout\')" style="font-size:11px;color:var(--c1);background:none;border:none;cursor:pointer;font-weight:600">Swap →</button>' +
          '</div>';
      }).join('') +
      '</div>' : '') +

    '<div style="margin:0 16px 14px;background:linear-gradient(135deg,rgba(10,132,255,0.1),rgba(0,0,0,0.2));border:1px solid rgba(10,132,255,0.2);border-radius:20px;padding:16px">' +
    '<div  class="section-label-sm" style="display:flex;align-items:center;gap:6px">' + icon('target', 14) + ' Recommended Specialization Block</div>' +
    '<div style="font-size:16px;font-weight:800;color:var(--c1);margin-bottom:4px">' + esc(specRec.block.name) + '</div>' +
    '<div style="font-size:12px;color:var(--txt3);margin-bottom:8px">Why: ' + esc(specRec.reason) + '</div>' +
    '<div style="display:flex;flex-direction:column;gap:6px;margin-bottom:12px">' +
    [{ icon: 'clock', text: 'Duration: ' + specRec.block.duration }, { icon: 'book', text: 'Volume: ' + specRec.block.volume }, { icon: 'refresh', text: 'Frequency: ' + specRec.block.frequency }, { icon: 'chart', text: 'Expected: ' + specRec.block.expected_gain }].map(function(item) {
      return '<div  class="body-12" style="display:flex;align-items:center;gap:6px"><span style="display:flex;color:var(--c1)">' + icon(item.icon, 14) + '</span>' + esc(item.text) + '</div>';
    }).join('') +
    '</div>' +
    '<div style="font-size:12px;color:var(--txt3);font-style:italic;margin-bottom:12px">' + esc(specRec.block.rationale) + '</div>' +
    '<div style="font-size:11px;font-weight:700;color:var(--txt3);margin-bottom:6px">Key Exercises:</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
    specRec.block.exercises.map(function(e) {
      return '<span style="background:rgba(10,132,255,0.15);color:var(--c1);padding:4px 10px;border-radius:20px;font-size:11px;font-weight:600">' + esc(e) + '</span>';
    }).join('') +
    '</div></div>' +

    '<div  class="card-block">' +
    '<div  class="section-label">All Specialization Blocks</div>' +
    SpecializationEngine.allBlocks().map(function(b) {
      return '<div style="padding:10px 0;border-bottom:1px solid var(--border)">' +
        '<div  class="row-title">' + esc(b.name) + '</div>' +
        '<div  class="muted-11">' + esc(b.duration) + ' · ' + esc(b.expected_gain) + '</div>' +
        '</div>';
    }).join('') +
    '</div>' +

    '<div  class="spacer-bottom"></div>';

};

var _trainingIntelActiveTab = 'intel';
var _trainingStyleLoadState = 'idle';

function _trainingStyleStatusBody() {
  if (_trainingStyleLoadState === 'error') {
    return '<div style="padding:24px;color:var(--danger)"><strong>Could not load Training Style.</strong><br><button type="button" class="btn btn-secondary" onclick="_retryTrainingStyle()" style="margin-top:14px">Retry</button></div>';
  }
  return '<div style="padding:24px;color:var(--txt3)">Loading Training Style…</div>';
}

function _loadTrainingStyle() {
  if (typeof window.renderTrainingStyleBody === 'function') {
    _trainingStyleLoadState = 'ready';
    return;
  }
  if (typeof loadScript !== 'function') {
    _trainingStyleLoadState = 'error';
    return;
  }
  _trainingStyleLoadState = 'loading';
  loadScript((window.MODULE_SRC && window.MODULE_SRC['training-style']) || 'js/modules/training-style.js').then(function() {
    if (typeof window.renderTrainingStyleBody !== 'function') throw new Error('Training Style renderer missing after load');
    _trainingStyleLoadState = 'ready';
    if (typeof currentScreenId === 'function' && currentScreenId() === 'training-intel' && _trainingIntelActiveTab === 'style') {
      go('training-intel', { tab: 'style' });
    }
  }).catch(function(e) {
    _trainingStyleLoadState = 'error';
    console.error('training-intel style lazy', e);
    if (typeof currentScreenId === 'function' && currentScreenId() === 'training-intel' && _trainingIntelActiveTab === 'style') {
      go('training-intel', { tab: 'style' });
    }
  });
}

window._retryTrainingStyle = function() {
  _trainingStyleLoadState = 'idle';
  if (typeof currentScreenId === 'function' && currentScreenId() === 'training-intel' && _trainingIntelActiveTab === 'style') {
    go('training-intel', { tab: 'style' });
  }
};

window.renderTrainingIntelUnified = function(data) {
  var tab = (data && data.tab) || 'intel';
  _trainingIntelActiveTab = tab;
  var shell = '<div class="topbar"><button type="button" onclick="go(\'workout\')"  class="back-chip" aria-label="Back">←</button><div class="topbar-title">Training Intel</div></div>' + _trainingIntelTabBar(tab);
  if (tab === 'style') {
    return shell + (typeof window.renderTrainingStyleBody === 'function' ? window.renderTrainingStyleBody() : _trainingStyleStatusBody());
  }
  return shell + window.renderTrainingIntelBody();
};

reg('training-intel', function(data) {
  var tab = (data && data.tab) || 'intel';
  if (tab === 'style' && typeof window.renderTrainingStyleBody !== 'function' && _trainingStyleLoadState === 'idle') {
    _loadTrainingStyle();
  }
  return window.renderTrainingIntelUnified(data);
});

window.migrateTrainingIntelMerge = function() {
  if (S.g('settings.migrations.trainingIntelMerge') === 1) return false;
  S.set('settings.migrations.trainingIntelMerge', 1);
  return true;
};
