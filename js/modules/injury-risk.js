'use strict';
/* ── PulseCap — Injury Risk Forecasting Engine ── */

const InjuryRiskEngine = {

  JOINT_EXERCISES: {
    shoulder: ['Barbell Bench Press','Incline Bench Press','Overhead Press','Dumbbell Shoulder Press','Lateral Raise','Dips','Pull-Ups','Barbell Row','Cable Fly','Push-Ups','Skull Crusher','Behind Neck Press','Upright Row'],
    elbow: ['Barbell Curl','Skull Crusher','Tricep Pushdown','Overhead Tricep Extension','Dips','Close Grip Bench Press','Preacher Curl','Hammer Curl'],
    knee: ['Back Squat','Front Squat','Leg Press','Bulgarian Split Squat','Leg Extension','Jump Squat','Box Jump','Running','Lunges','Step-Up'],
    lower_back: ['Deadlift','Romanian Deadlift','Barbell Row','Good Morning','Back Extension','Hyperextension','Squat','T-Bar Row'],
    wrist: ['Barbell Curl','Barbell Bench Press','Front Squat','Wrist Curl','Push-Ups','Overhead Press'],
    hip: ['Back Squat','Front Squat','Romanian Deadlift','Hip Thrust','Bulgarian Split Squat','Deadlift','Leg Press'],
  },

  ANTAGONIST_PAIRS: [
    { push: ['Barbell Bench Press','Incline Bench Press','Dumbbell Bench Press','Push-Ups','Dips','Cable Fly','Overhead Press'], pull: ['Pull-Ups','Lat Pulldown','Barbell Row','Dumbbell Row','Seated Cable Row','Face Pulls'], joint: 'shoulder', label: 'Push/Pull' },
    { push: ['Barbell Curl','Dumbbell Curl','Hammer Curl','Preacher Curl'], pull: ['Tricep Pushdown','Skull Crusher','Overhead Tricep Extension','Close Grip Bench Press'], joint: 'elbow', label: 'Bicep/Tricep' },
    { push: ['Back Squat','Leg Press','Hack Squat','Leg Extension'], pull: ['Romanian Deadlift','Leg Curl','Nordic Curl','Good Morning'], joint: 'knee', label: 'Quad/Hamstring' },
  ],

  _jointFrequency: function(joint, days) {
    var ws = S.g('workouts') || [];
    var recent = ws.filter(function(w) { return daysAgo(w.date) < days; });
    var exercises = this.JOINT_EXERCISES[joint] || [];
    var count = 0;
    recent.forEach(function(w) {
      (w.exercises || []).forEach(function(ex) {
        if (exercises.some(function(e) { return (ex.name || '').toLowerCase().includes(e.toLowerCase()); })) {
          count += (ex.sets || []).filter(function(s) { return s.done; }).length;
        }
      });
    });
    return count;
  },

  _pushPullRatio: function(joint) {
    var ws = S.g('workouts') || [];
    var recent = ws.filter(function(w) { return daysAgo(w.date) < 21; });
    var pair = this.ANTAGONIST_PAIRS.find(function(p) { return p.joint === joint; });
    if (!pair) return 1;

    var pushSets = 0, pullSets = 0;
    recent.forEach(function(w) {
      (w.exercises || []).forEach(function(ex) {
        var name = (ex.name || '').toLowerCase();
        var doneSets = (ex.sets || []).filter(function(s) { return s.done; }).length;
        if (pair.push.some(function(e) { return name.includes(e.toLowerCase()); })) pushSets += doneSets;
        if (pair.pull.some(function(e) { return name.includes(e.toLowerCase()); })) pullSets += doneSets;
      });
    });

    return pushSets / Math.max(pullSets, 1);
  },

  jointScore: function(joint) {
    var freq7 = this._jointFrequency(joint, 7);
    var userInjuries = S.g('user.injuries') || [];
    var hasActiveInjury = userInjuries.some(function(i) {
      var iStr = typeof i === 'string' ? i : (i.name || '');
      return iStr.toLowerCase().includes(joint.replace('_', ' '));
    });

    var score = 100;
    var risks = [];
    var warnings = [];

    if (hasActiveInjury) {
      score -= 35;
      risks.push('Active injury reported');
    }

    var weeklyFreq = freq7;
    if (weeklyFreq > 30) { score -= 25; risks.push('Very high weekly load (' + weeklyFreq + ' sets)'); }
    else if (weeklyFreq > 20) { score -= 12; warnings.push('High weekly load (' + weeklyFreq + ' sets)'); }

    if (joint === 'shoulder' || joint === 'elbow') {
      var ratio = this._pushPullRatio(joint);
      if (ratio > 2.5) { score -= 20; risks.push('Push/pull imbalance ' + ratio.toFixed(1) + ':1 — rear delt and pull work severely lacking'); }
      else if (ratio > 1.8) { score -= 10; warnings.push('Push/pull imbalance ' + ratio.toFixed(1) + ':1 — add more pulling exercises'); }
    }

    if (joint === 'knee') {
      var kneeRatio = this._pushPullRatio('knee');
      if (kneeRatio > 3) { score -= 18; risks.push('Quad dominance ' + kneeRatio.toFixed(1) + ':1 — hamstring weakness increases ACL risk'); }
      else if (kneeRatio > 2) { score -= 8; warnings.push('Quad-dominant ' + kneeRatio.toFixed(1) + ':1 — add more hamstring work'); }
    }

    var freq48 = this._jointFrequency(joint, 2);
    if (freq48 > 15) { score -= 15; warnings.push('Heavy loading in last 48h — rest this joint'); }

    score = Math.max(0, Math.min(100, score));
    var level = score >= 80 ? 'Low Risk' : score >= 60 ? 'Moderate Risk' : score >= 40 ? 'Elevated Risk' : 'High Risk';
    var color = score >= 80 ? '#30d158' : score >= 60 ? '#f5c842' : score >= 40 ? '#ff9f0a' : '#ff453a';

    return { joint: joint, score: score, level: level, color: color, risks: risks, warnings: warnings, weeklyLoad: weeklyFreq };
  },

  allJoints: function() {
    var labels = { shoulder:'Shoulders', elbow:'Elbows', knee:'Knees', lower_back:'Lower Back', wrist:'Wrists', hip:'Hips' };
    var icons = { shoulder:'bandage', elbow:'dumbbell', knee:'walk', lower_back:'alert', wrist:'ruler', hip:'walk' };
    var self = this;
    return ['shoulder','elbow','knee','lower_back','wrist','hip'].map(function(j) {
      return Object.assign({}, self.jointScore(j), { label: labels[j], icon: icons[j] });
    });
  },

  criticalWarnings: function() {
    return this.allJoints().filter(function(j) { return j.score < 50; });
  },

  overallRisk: function() {
    var joints = this.allJoints();
    var avg = joints.reduce(function(a, j) { return a + j.score; }, 0) / joints.length;
    var minScore = Math.min.apply(null, joints.map(function(j) { return j.score; }));
    var overall = Math.round(avg * 0.6 + minScore * 0.4);
    return { score: overall, label: overall >= 80 ? 'Low' : overall >= 60 ? 'Moderate' : overall >= 40 ? 'Elevated' : 'High' };
  }
};
window.InjuryRiskEngine = InjuryRiskEngine;

reg('injury-risk', function() {
  var joints = InjuryRiskEngine.allJoints();
  var overall = InjuryRiskEngine.overallRisk();
  var critical = InjuryRiskEngine.criticalWarnings();
  var overallColor = overall.score >= 80 ? '#30d158' : overall.score >= 60 ? '#f5c842' : overall.score >= 40 ? '#ff9f0a' : '#ff453a';

  return moduleTopbar('Injury Risk', { backScreen: 'bodymap' }) +

    '<div style="padding:20px 16px 14px;text-align:center">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:8px">Overall Joint Health</div>' +
    '<div style="font-size:72px;font-weight:900;color:' + overallColor + ';line-height:1;letter-spacing:-3px">' + overall.score + '</div>' +
    '<div style="font-size:16px;font-weight:700;color:' + overallColor + ';margin-top:4px">' + esc(overall.label) + ' Risk</div>' +
    '</div>' +

    (critical.length ? '<div style="margin:0 16px 14px;background:rgba(255,69,58,0.08);border:1px solid rgba(255,69,58,0.25);border-radius:16px;padding:14px">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#ff453a;margin-bottom:10px;display:flex;align-items:center;gap:6px">' + icon('alert', 14) + ' Critical Warnings</div>' +
      critical.map(function(j) {
        return '<div class="mb-8"><div class="row-title-14" style="display:flex;align-items:center;gap:6px">' + icon(j.icon, 16) + esc(j.label) + ' — ' + j.score + '/100</div>' +
          j.risks.map(function(r) { return '<div style="font-size:12px;color:#ff453a;margin-top:3px">• ' + esc(r) + '</div>'; }).join('') +
          j.warnings.map(function(w) { return '<div style="font-size:12px;color:#ff9f0a;margin-top:3px">• ' + esc(w) + '</div>'; }).join('') +
          '</div>';
      }).join('') +
      '</div>' : '') +

    '<div style="margin:0 16px 14px;display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
    joints.map(function(j) {
      return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px">' +
        '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">' +
        '<span style="color:var(--c1);display:flex">' + icon(j.icon, 20) + '</span>' +
        '<div class="row-title">' + esc(j.label) + '</div>' +
        '<span style="margin-left:auto;width:10px;height:10px;border-radius:50%;background:' + j.color + ';flex-shrink:0"></span>' +
        '</div>' +
        '<div style="font-size:26px;font-weight:900;color:' + j.color + '">' + j.score + '</div>' +
        '<div style="font-size:11px;color:' + j.color + ';font-weight:600;margin-bottom:6px">' + esc(j.level) + '</div>' +
        '<div style="width:100%;height:4px;background:rgba(255,255,255,0.06);border-radius:2px"><div style="width:' + j.score + '%;height:4px;border-radius:2px;background:' + j.color + '"></div></div>' +
        '<div style="font-size:10px;color:var(--txt3);margin-top:6px">' + j.weeklyLoad + ' sets/wk this joint</div>' +
        (j.warnings.length ? '<div style="font-size:10px;color:#ff9f0a;margin-top:4px;display:flex;align-items:flex-start;gap:4px"><span style="display:flex;flex-shrink:0;margin-top:1px">' + icon('alert', 12) + '</span>' + esc(j.warnings[0]) + '</div>' : '') +
        '</div>';
    }).join('') +
    '</div>' +

    '<div class="card-block-sm">' +
    '<div  class="section-label-sm">Prevention Principles</div>' +
    ['Maintain 1:1 push-to-pull ratio for shoulder health',
     'Train hamstrings at least 60% the volume of quads',
     'Never skip warm-up sets on compound lifts',
     'Take a deload every 4-6 weeks to reduce joint stress',
     'Address pain immediately — do not train through sharp pain',
     'Prioritise rear delt and rotator cuff work weekly'
    ].map(function(tip) {
      return '<div style="font-size:12px;color:var(--txt2);padding:6px 0;border-bottom:1px solid var(--border);display:flex;gap:8px;align-items:flex-start"><span style="color:var(--c3);display:flex;flex-shrink:0;margin-top:1px">' + icon('check', 14) + '</span>' + esc(tip) + '</div>';
    }).join('') +
    '</div>' +

    '<div class="pad-x-16-b16"><button type="button" class="btn btn-secondary w-full" style="display:flex;align-items:center;justify-content:center;gap:8px" onclick="go(\'rehab\')" >' + icon('bandage', 16) + ' View Rehab Protocols →</button></div>' +
    '<div  class="spacer-bottom"></div>';
});
