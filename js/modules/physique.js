'use strict';
/* ── PulseCap — Physique Scoring + Muscle Growth Simulator ── */

/* ══════════════════════════════════════════════════════
   PHYSIQUE SCORING ENGINE
══════════════════════════════════════════════════════ */
const PhysiqueEngine = {

  _latest() {
    const stats = S.g('bodyStats') || [];
    if (!stats.length) return null;
    return stats[stats.length - 1];
  },

  vTaperScore(m) {
    if (!m || !m.shoulders || !m.waist) return null;
    const ratio = m.shoulders / m.waist;
    if (ratio >= 1.618) return { score: 95, grade: 'Elite', color: '#30d158' };
    if (ratio >= 1.55)  return { score: Math.round(75 + (ratio - 1.55) / 0.07 * 20), grade: 'Excellent', color: '#30d158' };
    if (ratio >= 1.45)  return { score: Math.round(55 + (ratio - 1.45) / 0.1 * 20), grade: 'Good', color: 'var(--c1)' };
    if (ratio >= 1.35)  return { score: Math.round(35 + (ratio - 1.35) / 0.1 * 20), grade: 'Average', color: '#f5c842' };
    return { score: Math.max(10, Math.round((ratio / 1.35) * 35)), grade: 'Below Average', color: '#ff9f0a' };
  },

  symmetryScore(m) {
    if (!m) return null;
    let score = 70;
    let reasons = [];

    if (m.chest && m.thighs) {
      const ratio = m.chest / m.thighs;
      if (ratio >= 1.1 && ratio <= 1.4) score += 10;
      else { score -= 5; reasons.push(ratio < 1.1 ? 'Upper body underdeveloped relative to legs' : 'Lower body underdeveloped relative to upper body'); }
    }

    if (m.leftArm && m.rightArm) {
      const diff = Math.abs(m.leftArm - m.rightArm);
      if (diff <= 0.5) score += 10;
      else if (diff <= 1.0) { score += 3; reasons.push('Minor arm imbalance (' + diff.toFixed(1) + 'cm)'); }
      else { score -= 8; reasons.push('Significant arm imbalance (' + diff.toFixed(1) + 'cm) — address with unilateral work'); }
    }

    if (m.calves && m.arms) {
      const diff = Math.abs(m.calves - m.arms);
      if (diff <= 2) score += 8;
      else if (diff <= 4) score += 2;
      else { score -= 5; reasons.push('Calf-arm disproportion (' + diff.toFixed(0) + 'cm gap) — ' + (m.calves < m.arms ? 'calves lagging' : 'calves overdeveloped relative to arms')); }
    }

    if (m.waist && m.hips) {
      const whr = m.waist / m.hips;
      if (whr <= 0.85) score += 10;
      else if (whr <= 0.92) score += 4;
      else { score -= 4; reasons.push('Waist-hip ratio could improve'); }
    }

    score = Math.max(10, Math.min(100, score));
    const grade = score >= 85 ? 'Elite Symmetry' : score >= 70 ? 'Good Symmetry' : score >= 55 ? 'Moderate' : 'Needs Work';
    const color = score >= 85 ? '#30d158' : score >= 70 ? 'var(--c1)' : score >= 55 ? '#f5c842' : '#ff9f0a';
    return { score, grade, color, reasons };
  },

  muscularityScore(m, user) {
    if (!m || !user) return null;
    const height = user.height || 175;
    let score = 50;

    if (m.weight && m.bodyFat) {
      const lbm = m.weight * (1 - m.bodyFat / 100);
      const ffmi = lbm / ((height / 100) ** 2);
      if (ffmi >= 25) score = 95;
      else if (ffmi >= 23) score = Math.round(75 + (ffmi - 23) / 2 * 20);
      else if (ffmi >= 20) score = Math.round(50 + (ffmi - 20) / 3 * 25);
      else if (ffmi >= 18) score = Math.round(30 + (ffmi - 18) / 2 * 20);
      else score = Math.max(10, Math.round(ffmi / 18 * 30));
    } else if (m.arms) {
      const armHeightRatio = (m.arms / height) * 100;
      if (armHeightRatio >= 18) score = 85;
      else if (armHeightRatio >= 16) score = 70;
      else if (armHeightRatio >= 14) score = 55;
      else score = 40;
    }

    const grade = score >= 85 ? 'Highly Muscular' : score >= 70 ? 'Muscular' : score >= 55 ? 'Moderately Muscular' : score >= 40 ? 'Average Build' : 'Developing';
    const color = score >= 80 ? '#30d158' : score >= 65 ? 'var(--c1)' : score >= 50 ? '#f5c842' : '#ff9f0a';
    return { score, grade, color };
  },

  conditioningScore(m) {
    if (!m || !m.bodyFat) return null;
    const bf = m.bodyFat;
    let score;
    if (bf <= 8)  score = 98;
    else if (bf <= 10) score = Math.round(88 + (10 - bf) / 2 * 10);
    else if (bf <= 14) score = Math.round(68 + (14 - bf) / 4 * 20);
    else if (bf <= 18) score = Math.round(48 + (18 - bf) / 4 * 20);
    else if (bf <= 25) score = Math.round(25 + (25 - bf) / 7 * 23);
    else score = Math.max(5, Math.round(25 - (bf - 25) * 1.5));

    const grade = score >= 90 ? 'Competition Ready' : score >= 75 ? 'Lean & Athletic' : score >= 60 ? 'Fit' : score >= 45 ? 'Average' : 'Bulk Phase';
    const color = score >= 80 ? '#30d158' : score >= 65 ? 'var(--c1)' : score >= 50 ? '#f5c842' : '#ff9f0a';
    return { score, grade, color, bf };
  },

  athleticismScore() {
    const ws = S.g('workouts') || [];
    const prs = S.g('prs') || [];
    const streak = typeof StreakEngine !== 'undefined' ? StreakEngine.get() : 0;
    let score = 40;

    if (ws.length >= 50) score += 15;
    else if (ws.length >= 20) score += 8;
    else if (ws.length >= 10) score += 4;

    if (prs.length >= 20) score += 15;
    else if (prs.length >= 10) score += 8;
    else if (prs.length >= 5) score += 4;

    if (streak >= 7) score += 15;
    else if (streak >= 4) score += 8;
    else if (streak >= 2) score += 4;

    const skills = S.g('calisthenicsProgress') || {};
    const unlockedSkills = Object.values(skills).filter(v => v >= 3).length;
    score += Math.min(unlockedSkills * 3, 15);

    score = Math.max(10, Math.min(100, score));
    const grade = score >= 85 ? 'Elite Athlete' : score >= 70 ? 'Advanced' : score >= 55 ? 'Intermediate' : score >= 40 ? 'Beginner-Intermediate' : 'Beginner';
    const color = score >= 80 ? '#30d158' : score >= 65 ? 'var(--c1)' : score >= 50 ? '#f5c842' : '#ff9f0a';
    return { score, grade, color };
  },

  aestheticScore(vTaper, symmetry, muscularity, conditioning) {
    const scores = [];
    if (vTaper) scores.push({ s: vTaper.score, w: 0.30 });
    if (symmetry) scores.push({ s: symmetry.score, w: 0.25 });
    if (muscularity) scores.push({ s: muscularity.score, w: 0.25 });
    if (conditioning) scores.push({ s: conditioning.score, w: 0.20 });
    if (!scores.length) return null;

    const totalWeight = scores.reduce((a, x) => a + x.w, 0);
    const weighted = scores.reduce((a, x) => a + x.s * x.w, 0) / totalWeight;
    const score = Math.round(weighted);
    const grade = score >= 88 ? 'World Class' : score >= 78 ? 'Elite' : score >= 68 ? 'Excellent' : score >= 55 ? 'Good' : score >= 42 ? 'Average' : 'Developing';
    const color = score >= 80 ? '#30d158' : score >= 65 ? 'var(--c1)' : score >= 50 ? '#f5c842' : '#ff9f0a';
    return { score, grade, color };
  },

  report() {
    const m = this._latest();
    const user = S.g('user') || {};
    const vTaper = this.vTaperScore(m);
    const symmetry = this.symmetryScore(m);
    const muscularity = this.muscularityScore(m, user);
    const conditioning = this.conditioningScore(m);
    const athleticism = this.athleticismScore();
    const aesthetic = this.aestheticScore(vTaper, symmetry, muscularity, conditioning);
    return { m, vTaper, symmetry, muscularity, conditioning, athleticism, aesthetic };
  },

  weakestArea(report) {
    const areas = [
      { name: 'V-Taper', data: report.vTaper },
      { name: 'Symmetry', data: report.symmetry },
      { name: 'Muscularity', data: report.muscularity },
      { name: 'Conditioning', data: report.conditioning },
    ].filter(a => a.data);
    if (!areas.length) return null;
    return areas.reduce((min, a) => a.data.score < min.data.score ? a : min, areas[0]);
  }
};
window.PhysiqueEngine = PhysiqueEngine;

/* ══════════════════════════════════════════════════════
   MUSCLE GROWTH SIMULATOR
══════════════════════════════════════════════════════ */
const GrowthSimulator = {

  weeklyVolume(muscleGroup) {
    const ws = S.g('workouts') || [];
    const last4weeks = ws.filter(w => daysAgo(w.date) < 28);
    let totalSets = 0;

    const MUSCLE_EXERCISES = {
      chest: ['Barbell Bench Press','Incline Bench Press','Dumbbell Bench Press','Push-Ups','Cable Fly','Dips','Chest Press','Incline Dumbbell Press','Pec Deck','Cable Crossover'],
      back: ['Pull-Ups','Lat Pulldown','Barbell Row','Dumbbell Row','Seated Cable Row','T-Bar Row','Chest Supported Row','Face Pulls','Rack Pull'],
      shoulders: ['Overhead Press','Dumbbell Shoulder Press','Lateral Raise','Face Pulls','Rear Delt Fly','Arnold Press','Cable Lateral Raise','Upright Row'],
      biceps: ['Barbell Curl','Dumbbell Curl','Hammer Curl','Preacher Curl','Cable Curl','Concentration Curl','EZ Bar Curl'],
      triceps: ['Tricep Pushdown','Skull Crusher','Overhead Tricep Extension','Close Grip Bench Press','Dips','Cable Overhead Extension'],
      quads: ['Back Squat','Front Squat','Leg Press','Leg Extension','Hack Squat','Bulgarian Split Squat','Goblet Squat'],
      hamstrings: ['Romanian Deadlift','Leg Curl','Nordic Curl','Deadlift','Good Morning','Stiff Leg Deadlift'],
      glutes: ['Hip Thrust','Glute Bridge','Bulgarian Split Squat','Cable Glute Kickback','Romanian Deadlift','Squat'],
      calves: ['Calf Raise','Seated Calf Raise','Single-Leg Calf Raise','Donkey Calf Raise','Leg Press Calf Raise'],
      core: ['Plank','Ab Wheel Rollout','Cable Crunch','Hanging Leg Raise','Russian Twist','Dead Bug','Bird-Dog'],
    };

    const exercises = MUSCLE_EXERCISES[muscleGroup] || [];
    last4weeks.forEach(w => {
      (w.exercises || []).forEach(ex => {
        if (exercises.some(e => (ex.name || '').toLowerCase().includes(e.toLowerCase()) || e.toLowerCase().includes((ex.name || '').toLowerCase()))) {
          totalSets += (ex.sets || []).filter(s => s.done).length;
        }
      });
    });

    return Math.round(totalSets / 4);
  },

  growthVelocity(muscleGroup, weeklyVol) {
    const ws = S.g('workouts') || [];
    const trainingAgeWeeks = Math.round(ws.length / ((S.g('user') || {}).weeklyGoal || 4));

    const ageMultiplier = trainingAgeWeeks < 26 ? 1.8 : trainingAgeWeeks < 78 ? 1.3 : 1.0;

    let volMultiplier;
    if (weeklyVol < 5) volMultiplier = 0.3;
    else if (weeklyVol < 10) volMultiplier = 0.7;
    else if (weeklyVol <= 20) volMultiplier = 1.0;
    else if (weeklyVol <= 25) volMultiplier = 0.85;
    else volMultiplier = 0.6;

    const BASE_GROWTH = {
      chest: 0.8, back: 1.0, shoulders: 0.6, biceps: 0.5, triceps: 0.5,
      quads: 1.2, hamstrings: 0.8, glutes: 1.0, calves: 0.4, core: 0.3
    };

    const base = BASE_GROWTH[muscleGroup] || 0.5;
    const velocity = base * ageMultiplier * volMultiplier;
    return Math.round(velocity * 10) / 10;
  },

  projections() {
    const MUSCLES = ['chest','back','shoulders','biceps','triceps','quads','hamstrings','glutes','calves','core'];
    const MUSCLE_ICONS = { chest:'🫁', back:'🔵', shoulders:'⭐', biceps:'💪', triceps:'💪', quads:'🦵', hamstrings:'🦵', glutes:'🍑', calves:'🦵', core:'⚡' };
    const MUSCLE_LABELS = { chest:'Chest', back:'Back / Lats', shoulders:'Shoulders', biceps:'Biceps', triceps:'Triceps', quads:'Quads', hamstrings:'Hamstrings', glutes:'Glutes', calves:'Calves', core:'Core' };

    return MUSCLES.map(muscle => {
      const weeklyVol = this.weeklyVolume(muscle);
      const velocity = this.growthVelocity(muscle, weeklyVol);
      const status = weeklyVol < 6 ? 'undertrained' : weeklyVol > 22 ? 'overtrained' : 'optimal';
      const statusColor = status === 'optimal' ? '#30d158' : status === 'undertrained' ? '#ff9f0a' : '#af52de';

      return {
        muscle,
        icon: MUSCLE_ICONS[muscle] || '💪',
        label: MUSCLE_LABELS[muscle] || muscle,
        weeklyVol,
        velocity,
        projected8wks: velocity,
        projected12wks: Math.round(velocity * 1.5 * 10) / 10,
        status,
        statusColor,
        recommendation: status === 'undertrained'
          ? 'Add ' + Math.max(1, 10 - weeklyVol) + ' more sets/week'
          : status === 'overtrained'
          ? 'Reduce by ' + (weeklyVol - 20) + ' sets/week — junk volume'
          : 'Optimal volume range ✓'
      };
    });
  },

  laggingMuscles() {
    const proj = this.projections();
    return proj
      .filter(p => p.weeklyVol > 0)
      .sort((a, b) => a.velocity - b.velocity)
      .slice(0, 3);
  },

  strongestMuscles() {
    const proj = this.projections();
    return proj
      .filter(p => p.weeklyVol > 0)
      .sort((a, b) => b.velocity - a.velocity)
      .slice(0, 2);
  }
};
window.GrowthSimulator = GrowthSimulator;

/* ══════════════════════════════════════════════════════
   PHYSIQUE SCREEN
══════════════════════════════════════════════════════ */
reg('physique', function() {
  const report = PhysiqueEngine.report();
  const { m, vTaper, symmetry, muscularity, conditioning, athleticism, aesthetic } = report;
  const projections = GrowthSimulator.projections();
  const lagging = GrowthSimulator.laggingMuscles();
  const weak = PhysiqueEngine.weakestArea(report);

  function scoreCard(label, data, emoji) {
    if (!data) return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px;text-align:center"><div style="font-size:20px;margin-bottom:6px">' + emoji + '</div><div style="font-size:11px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">' + label + '</div><div style="font-size:13px;color:var(--txt3)">No data yet</div></div>';
    return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px;text-align:center">' +
      '<div style="font-size:20px;margin-bottom:4px">' + emoji + '</div>' +
      '<div style="font-size:11px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">' + label + '</div>' +
      '<div style="font-size:28px;font-weight:900;color:' + data.color + '">' + data.score + '</div>' +
      '<div style="font-size:11px;color:' + data.color + ';font-weight:600;margin-top:2px">' + esc(data.grade) + '</div>' +
      '<div style="width:100%;height:4px;background:rgba(255,255,255,0.06);border-radius:2px;margin-top:8px"><div style="width:' + data.score + '%;height:4px;border-radius:2px;background:' + data.color + '"></div></div>' +
      '</div>';
  }

  function radarChart() {
    const scores = [
      { label: 'V-Taper', val: vTaper ? vTaper.score : 0 },
      { label: 'Symmetry', val: symmetry ? symmetry.score : 0 },
      { label: 'Muscularity', val: muscularity ? muscularity.score : 0 },
      { label: 'Conditioning', val: conditioning ? conditioning.score : 0 },
      { label: 'Athleticism', val: athleticism ? athleticism.score : 0 },
    ];
    const n = scores.length;
    const cx = 120, cy = 120, maxR = 90;
    const angleStep = (2 * Math.PI) / n;
    const getXY = (i, r) => ({
      x: cx + r * Math.sin(i * angleStep),
      y: cy - r * Math.cos(i * angleStep)
    });

    const gridSVG = [20, 40, 60, 80, 100].map(v => {
      const r = (v / 100) * maxR;
      const pts = scores.map((_, i) => { const p = getXY(i, r); return p.x + ',' + p.y; }).join(' ');
      return '<polygon points="' + pts + '" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>';
    }).join('');

    const scorePts = scores.map((s, i) => { const p = getXY(i, (s.val / 100) * maxR); return p.x + ',' + p.y; }).join(' ');
    const scorePolygon = '<polygon points="' + scorePts + '" fill="rgba(var(--c1-rgb),0.2)" stroke="var(--c1)" stroke-width="2"/>';

    const labels = scores.map((s, i) => {
      const p = getXY(i, maxR + 18);
      return '<text x="' + p.x + '" y="' + p.y + '" text-anchor="middle" font-size="10" font-weight="700" fill="var(--txt3)" dominant-baseline="middle">' + s.label + '</text>';
    }).join('');

    const dots = scores.map((s, i) => {
      const p = getXY(i, (s.val / 100) * maxR);
      return '<circle cx="' + p.x + '" cy="' + p.y + '" r="4" fill="var(--c1)"/>';
    }).join('');

    return '<svg width="240" height="240" viewBox="0 0 240 240" style="display:block;margin:0 auto">' + gridSVG + scorePolygon + labels + dots + '</svg>';
  }

  const noDataMsg = !m ? '<div style="margin:0 16px 14px;background:rgba(255,159,10,0.08);border:1px solid rgba(255,159,10,0.2);border-radius:14px;padding:14px;font-size:13px;color:var(--txt2);line-height:1.6">📊 Add body measurements in <button type="button" onclick="go(\'bodymap\')" style="background:none;border:none;color:var(--c1);font-weight:700;cursor:pointer;font-size:13px;padding:0">Body tab</button> to unlock physique scoring.</div>' : '';

  return '<div class="topbar"><button type="button" onclick="history.length>1?history.back():go(\'hub\')" style="background:none;border:none;color:var(--txt3);cursor:pointer;font-size:14px;padding:0 16px;touch-action:manipulation" aria-label="Back">←</button><div class="topbar-title">Physique Analysis</div></div>' +

    noDataMsg +

    (aesthetic ? '<div style="padding:20px 16px 14px;text-align:center">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:8px">Aesthetic Score</div>' +
      '<div style="font-size:72px;font-weight:900;color:' + aesthetic.color + ';line-height:1;letter-spacing:-3px">' + aesthetic.score + '</div>' +
      '<div style="font-size:16px;font-weight:700;color:' + aesthetic.color + ';margin-top:4px">' + esc(aesthetic.grade) + '</div>' +
      radarChart() +
      '</div>' : '<div style="padding:20px 16px;text-align:center"><div style="font-size:48px;margin-bottom:10px">📊</div><div style="font-size:15px;color:var(--txt2)">Add measurements to see scores</div></div>') +

    '<div style="margin:0 16px 14px;display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
    scoreCard('V-Taper', vTaper, '📐') +
    scoreCard('Symmetry', symmetry, '⚖️') +
    scoreCard('Muscularity', muscularity, '💪') +
    scoreCard('Conditioning', conditioning, '🏃') +
    '</div>' +
    '<div style="margin:0 16px 14px">' +
    scoreCard('Athleticism', athleticism, '⚡') +
    '</div>' +

    (symmetry && symmetry.reasons && symmetry.reasons.length ? '<div style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:10px">Symmetry Issues</div>' +
      symmetry.reasons.map(r => '<div style="font-size:13px;color:var(--txt2);padding:6px 0;border-bottom:1px solid var(--border);display:flex;gap:8px"><span style="color:#f5c842">⚠️</span>' + esc(r) + '</div>').join('') +
      '</div>' : '') +

    (weak ? '<div style="margin:0 16px 14px;background:linear-gradient(135deg,rgba(var(--c1-rgb),0.1),rgba(0,0,0,0.2));border:1px solid rgba(var(--c1-rgb),0.2);border-radius:16px;padding:14px">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:8px">Priority Focus</div>' +
      '<div style="font-size:14px;font-weight:700;color:var(--c1);margin-bottom:4px">🎯 ' + esc(weak.name) + ' needs most attention</div>' +
      '<div style="font-size:12px;color:var(--txt2)">Score: ' + weak.data.score + '/100 · ' + esc(weak.data.grade) + '</div>' +
      '</div>' : '') +

    '<div style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:20px;padding:16px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:14px">📉 Muscle Growth Simulator</div>' +

    (lagging.length ? '<div style="margin-bottom:12px"><div style="font-size:12px;font-weight:700;color:#ff9f0a;margin-bottom:8px">⚠️ Lagging Muscles</div>' +
      lagging.map(p => '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">' +
        '<div style="font-size:20px;width:28px;text-align:center">' + p.icon + '</div>' +
        '<div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--txt)">' + esc(p.label) + '</div>' +
        '<div style="font-size:11px;color:var(--txt3)">' + p.weeklyVol + ' sets/wk · ' + esc(p.recommendation) + '</div></div>' +
        '<div style="text-align:right"><div style="font-size:12px;font-weight:700;color:#ff9f0a">+' + p.projected8wks + 'cm</div>' +
        '<div style="font-size:10px;color:var(--txt3)">8 weeks</div></div>' +
        '</div>').join('') +
      '</div>' : '') +

    '<div style="font-size:12px;font-weight:700;color:var(--txt);margin-bottom:10px">All Muscle Groups — 8-Week Projections</div>' +
    projections.map(p => '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">' +
      '<div style="font-size:18px;width:24px;text-align:center">' + p.icon + '</div>' +
      '<div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--txt)">' + esc(p.label) + '</div>' +
      '<div style="font-size:10px;color:' + p.statusColor + '">' + p.weeklyVol + ' sets/wk · ' + esc(p.status) + '</div></div>' +
      '<div style="text-align:right">' +
      '<div style="font-size:13px;font-weight:700;color:' + (p.velocity > 0 ? '#30d158' : 'var(--txt3)') + '">' + (p.velocity > 0 ? '+' + p.projected8wks + 'cm' : 'No data') + '</div>' +
      '<div style="font-size:10px;color:var(--txt3)">' + (p.velocity > 0 ? p.projected12wks + 'cm / 12wk' : '') + '</div>' +
      '</div></div>'
    ).join('') +
    '</div>' +

    '<div style="height:20px"></div>';
});
