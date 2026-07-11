'use strict';
/* ── PulseCap Phase 3 — Physique Archetype + Proportion Analyzer ── */

/* ══════════════════════════════════════════════════════
   PHYSIQUE ARCHETYPE SYSTEM
══════════════════════════════════════════════════════ */
const PhysiqueArchetypes = {

  ARCHETYPES: {
    classic_bodybuilder: {
      id: 'classic_bodybuilder', name: 'Classic Bodybuilder', icon: '🏆',
      description: 'Balanced mass with classic proportions. Chest, shoulders, arms, and legs all developed. Waist kept tight.',
      color: '#f5c842',
      targets: {
        shoulderToWaist: 1.618,
        chestToWaist: 1.35,
        armToWaist: 0.51,
        thighToCalf: 1.75,
        neckToWaist: 0.43,
      },
      targetMeasurements: {
        arms: { formula: function(h) { return h * 0.36; }, label: 'Arms' },
        chest: { formula: function(h) { return h * 0.64; }, label: 'Chest' },
        waist: { formula: function(h) { return h * 0.45; }, label: 'Waist' },
        thighs: { formula: function(h) { return h * 0.53; }, label: 'Thighs' },
        calves: { formula: function(h) { return h * 0.34; }, label: 'Calves' },
        shoulders: { formula: function(h) { return h * 0.76; }, label: 'Shoulders' },
      },
      training_focus: ['Balanced volume across all muscle groups', 'Classic compounds: bench, squat, deadlift, OHP', '12-20 sets per muscle per week', 'Moderate-high volume hypertrophy'],
      weak_point_priority: ['rear delts', 'calves', 'upper chest'],
    },
    mens_physique: {
      id: 'mens_physique', name: "Men's Physique", icon: '🌊',
      description: 'Upper body dominant. Wide shoulders, narrow waist, capped delts. Less emphasis on leg mass.',
      color: '#00c7ff',
      targets: {
        shoulderToWaist: 1.7,
        chestToWaist: 1.4,
        armToWaist: 0.54,
        thighToCalf: 1.65,
      },
      targetMeasurements: {
        arms: { formula: function(h) { return h * 0.38; }, label: 'Arms' },
        chest: { formula: function(h) { return h * 0.66; }, label: 'Chest' },
        waist: { formula: function(h) { return h * 0.43; }, label: 'Waist' },
        thighs: { formula: function(h) { return h * 0.50; }, label: 'Thighs' },
        shoulders: { formula: function(h) { return h * 0.78; }, label: 'Shoulders' },
      },
      training_focus: ["High shoulder volume — lateral raises daily", "V-taper prioritization", "Minimal direct leg hypertrophy", "Core and conditioning emphasis"],
      weak_point_priority: ['side delts', 'rear delts', 'upper chest', 'serratus'],
    },
    athletic: {
      id: 'athletic', name: 'Athletic / Functional', icon: '⚡',
      description: 'Performance-based physique. Strong, explosive, capable. Think sprinter or NBA player body.',
      color: '#30d158',
      targets: {
        shoulderToWaist: 1.55,
        chestToWaist: 1.28,
        armToWaist: 0.47,
        thighToCalf: 1.80,
      },
      targetMeasurements: {
        arms: { formula: function(h) { return h * 0.34; }, label: 'Arms' },
        chest: { formula: function(h) { return h * 0.60; }, label: 'Chest' },
        waist: { formula: function(h) { return h * 0.46; }, label: 'Waist' },
        thighs: { formula: function(h) { return h * 0.55; }, label: 'Thighs' },
        calves: { formula: function(h) { return h * 0.36; }, label: 'Calves' },
        shoulders: { formula: function(h) { return h * 0.72; }, label: 'Shoulders' },
      },
      training_focus: ['Compound-dominant programming', 'Explosive movements: power clean, jump squat', 'Posterior chain priority', 'Conditioning alongside lifting'],
      weak_point_priority: ['glutes', 'hamstrings', 'calves', 'rotator cuff'],
    },
    v_taper: {
      id: 'v_taper', name: 'V-Taper', icon: '🔱',
      description: 'Maximum width-to-waist contrast. Wide lats, capped shoulders, tiny waist. The ultimate taper.',
      color: '#af52de',
      targets: {
        shoulderToWaist: 1.75,
        chestToWaist: 1.42,
        armToWaist: 0.52,
        thighToCalf: 1.70,
      },
      targetMeasurements: {
        arms: { formula: function(h) { return h * 0.37; }, label: 'Arms' },
        chest: { formula: function(h) { return h * 0.65; }, label: 'Chest' },
        waist: { formula: function(h) { return h * 0.42; }, label: 'Waist' },
        thighs: { formula: function(h) { return h * 0.51; }, label: 'Thighs' },
        shoulders: { formula: function(h) { return h * 0.80; }, label: 'Shoulders' },
      },
      training_focus: ['Lat width: wide-grip pull-ups, straight-arm pulldown', 'Lateral delt emphasis: 20+ sets/week', 'No direct oblique work', 'Waist-conscious nutrition'],
      weak_point_priority: ['lats', 'side delts', 'serratus anterior'],
    },
    strength_athlete: {
      id: 'strength_athlete', name: 'Strength Athlete', icon: '🏋️',
      description: 'Raw strength and power. Think powerlifter. Functional mass, not aesthetic focus.',
      color: '#ff453a',
      targets: {
        shoulderToWaist: 1.42,
        chestToWaist: 1.20,
        armToWaist: 0.45,
        thighToCalf: 1.85,
      },
      targetMeasurements: {
        arms: { formula: function(h) { return h * 0.40; }, label: 'Arms' },
        chest: { formula: function(h) { return h * 0.68; }, label: 'Chest' },
        waist: { formula: function(h) { return h * 0.54; }, label: 'Waist' },
        thighs: { formula: function(h) { return h * 0.58; }, label: 'Thighs' },
        calves: { formula: function(h) { return h * 0.38; }, label: 'Calves' },
      },
      training_focus: ['Squat, bench, deadlift as primary movements', 'Linear or undulating periodization', 'Strength in 1-5 rep range', 'Accessories only to improve main lifts'],
      weak_point_priority: ['posterior chain', 'upper back', 'core'],
    },
    lean_functional: {
      id: 'lean_functional', name: 'Lean & Functional', icon: '🎯',
      description: 'Low body fat, visible abs, capable. Crossfit/triathlete aesthetic.',
      color: '#ff9f0a',
      targets: {
        shoulderToWaist: 1.50,
        chestToWaist: 1.25,
        armToWaist: 0.46,
        thighToCalf: 1.72,
      },
      targetMeasurements: {
        arms: { formula: function(h) { return h * 0.32; }, label: 'Arms' },
        chest: { formula: function(h) { return h * 0.57; }, label: 'Chest' },
        waist: { formula: function(h) { return h * 0.43; }, label: 'Waist' },
        thighs: { formula: function(h) { return h * 0.52; }, label: 'Thighs' },
        calves: { formula: function(h) { return h * 0.34; }, label: 'Calves' },
      },
      training_focus: ['Conditioning + strength balance', 'Calisthenics skills', 'HIIT and zone 2 cardio', 'Moderate volume, higher frequency'],
      weak_point_priority: ['upper chest', 'shoulders', 'arms'],
    },
  },

  getUserArchetype: function() {
    var user = S.g('user') || {};
    return user.physiqueArchetype || null;
  },

  setUserArchetype: function(id) {
    var user = S.g('user') || {};
    user.physiqueArchetype = id;
    S.set('user', user);
  },

  comparison: function(archetypeId) {
    var archetype = this.ARCHETYPES[archetypeId];
    if (!archetype) return null;

    var stats = S.g('bodyStats') || [];
    var m = stats.length ? stats[stats.length - 1] : null;
    var user = S.g('user') || {};
    var height = user.height || 175;

    var targets = archetype.targetMeasurements;
    var result = [];

    Object.entries(targets).forEach(function(entry) {
      var key = entry[0];
      var target = entry[1];
      var targetVal = Math.round(target.formula(height));
      var currentVal = m ? (m[key] || m[key + 's'] || null) : null;
      var diff = currentVal ? currentVal - targetVal : null;
      var pct = currentVal ? Math.min(100, Math.round((currentVal / targetVal) * 100)) : 0;

      result.push({
        label: target.label,
        key: key,
        target: targetVal,
        current: currentVal,
        diff: diff,
        pct: pct,
        status: !currentVal ? 'no_data' : Math.abs(diff) <= 1.5 ? 'on_target' : diff < 0 ? 'below' : 'above',
      });
    });

    var ratios = [];
    if (m && m.shoulders && m.waist) {
      var swCurrent = m.shoulders / m.waist;
      var swTarget = archetype.targets.shoulderToWaist;
      var swPct = Math.min(100, Math.round((swCurrent / swTarget) * 100));
      ratios.push({ label: 'Shoulder-to-Waist', current: swCurrent.toFixed(2), target: swTarget.toFixed(2), pct: swPct, color: swPct >= 90 ? '#30d158' : swPct >= 75 ? '#f5c842' : '#ff9f0a' });
    }
    if (m && m.chest && m.waist) {
      var cwCurrent = m.chest / m.waist;
      var cwTarget = archetype.targets.chestToWaist;
      var cwPct = Math.min(100, Math.round((cwCurrent / cwTarget) * 100));
      ratios.push({ label: 'Chest-to-Waist', current: cwCurrent.toFixed(2), target: cwTarget.toFixed(2), pct: cwPct, color: cwPct >= 90 ? '#30d158' : cwPct >= 75 ? '#f5c842' : '#ff9f0a' });
    }

    var withData = result.filter(function(r) { return r.current; });
    var overallPct = withData.length
      ? Math.round(withData.reduce(function(a, r) { return a + r.pct; }, 0) / withData.length)
      : 0;

    return { measurements: result, ratios: ratios, overallPct: overallPct, archetype: archetype };
  }
};
window.PhysiqueArchetypes = PhysiqueArchetypes;

/* ══════════════════════════════════════════════════════
   PROPORTION ANALYZER
══════════════════════════════════════════════════════ */
const ProportionAnalyzer = {

  analyze: function() {
    var stats = S.g('bodyStats') || [];
    var m = stats.length ? stats[stats.length - 1] : null;
    if (!m) return null;

    var user = S.g('user') || {};
    var height = user.height || 175;
    var ratios = [];
    var weakPoints = [];
    var strengths = [];

    if (m.shoulders && m.waist) {
      var r = m.shoulders / m.waist;
      var target = 1.618;
      var pct = Math.min(100, Math.round((r / target) * 100));
      var status = r >= 1.6 ? 'excellent' : r >= 1.5 ? 'good' : r >= 1.4 ? 'average' : 'below';
      ratios.push({ name: 'Shoulder-to-Waist', value: r.toFixed(2), target: target.toFixed(2), pct: pct, status: status, icon: '📐', tip: r < 1.5 ? 'Increase lateral delt work and/or tighten waist through nutrition' : 'Golden ratio achieved ✓' });
      if (r < 1.45) weakPoints.push('V-taper underdeveloped — prioritise side delts and lat width');
      if (r >= 1.6) strengths.push('Excellent shoulder-to-waist ratio');
    }

    if (m.arms) {
      var armToHeight = (m.arms / height) * 100;
      var armTarget = 36;
      var armPct = Math.min(100, Math.round((armToHeight / armTarget) * 100));
      ratios.push({ name: 'Arm Development', value: m.arms + 'cm', target: Math.round(height * 0.36) + 'cm', pct: armPct, status: armToHeight >= 36 ? 'excellent' : armToHeight >= 33 ? 'good' : 'developing', icon: '💪', tip: armToHeight < 33 ? 'Direct arm work 2-3x/week: curls + tricep extensions' : 'Good arm development' });
      if (armToHeight < 32) weakPoints.push('Arms underdeveloped relative to height — add arm specialization');
      if (armToHeight >= 36) strengths.push('Strong arm development for height');
    }

    if (m.chest && m.waist) {
      var cr = m.chest / m.waist;
      var cPct = Math.min(100, Math.round((cr / 1.35) * 100));
      ratios.push({ name: 'Chest-to-Waist', value: cr.toFixed(2), target: '1.35', pct: cPct, status: cr >= 1.33 ? 'excellent' : cr >= 1.25 ? 'good' : 'developing', icon: '🫁', tip: cr < 1.25 ? 'Increase chest volume or reduce waist circumference' : 'Good chest proportion' });
    }

    if (m.thighs && m.calves) {
      var tr = m.thighs / m.calves;
      var tTarget = 1.75;
      var tPct = Math.min(100, Math.round(100 - Math.abs(tr - tTarget) / tTarget * 100));
      ratios.push({ name: 'Thigh-to-Calf', value: tr.toFixed(2), target: tTarget.toFixed(2), pct: tPct, status: Math.abs(tr - tTarget) < 0.15 ? 'excellent' : Math.abs(tr - tTarget) < 0.3 ? 'good' : 'developing', icon: '🦵', tip: tr > 2.0 ? 'Calves lagging — add calf specialization block' : tr < 1.5 ? 'Thighs underdeveloped relative to calves' : 'Good lower body proportion' });
      if (tr > 2.1) weakPoints.push('Calves significantly lagging — classic proportion weakness');
    }

    if (m.leftArm && m.rightArm) {
      var diff = Math.abs(m.leftArm - m.rightArm);
      if (diff > 1.0) weakPoints.push('Arm asymmetry ' + diff.toFixed(1) + 'cm — add unilateral dumbbell work');
      if (diff <= 0.5) strengths.push('Good bilateral arm symmetry');
    }

    return { ratios: ratios, weakPoints: weakPoints, strengths: strengths, hasMeasurements: ratios.length > 0 };
  }
};
window.ProportionAnalyzer = ProportionAnalyzer;

/* ══════════════════════════════════════════════════════
   PHYSIQUE PREVIEW — measurement-driven SVG body
══════════════════════════════════════════════════════ */
const PhysiquePreview = {

  _scale(current, target, neutral) {
    if (!current || !target) return neutral || 1;
    var ratio = current / target;
    return Math.max(0.82, Math.min(1.18, 0.7 + ratio * 0.3));
  },

  scalesFromMeasurements(m, height, archetype) {
    height = height || 175;
    var targets = archetype && archetype.targetMeasurements ? archetype.targetMeasurements : {};
    var t = function(key) {
      var def = targets[key];
      return def && def.formula ? def.formula(height) : null;
    };
    return {
      shoulders: this._scale(m && m.shoulders, t('shoulders'), 1),
      chest: this._scale(m && m.chest, t('chest'), 1),
      waist: m && m.waist ? Math.max(0.78, Math.min(1.12, (t('waist') || m.waist) / m.waist)) : 1,
      arms: this._scale(m && (m.arms || m.leftArm), t('arms'), 1),
      thighs: this._scale(m && m.thighs, t('thighs'), 1),
      calves: this._scale(m && m.calves, t('calves'), 1),
      neck: this._scale(m && m.neck, t('neck'), 1)
    };
  },

  bodySVG(scales, opts) {
    opts = opts || {};
    var color = opts.color || 'rgba(0,213,255,0.55)';
    var stroke = opts.stroke || 'rgba(255,255,255,0.22)';
    var uid = 'pp' + Math.random().toString(36).slice(2, 8);
    var s = scales || { shoulders: 1, chest: 1, waist: 1, arms: 1, thighs: 1, calves: 1, neck: 1 };
    var shW = 24 * s.shoulders;
    var chW = 14 * s.chest;
    var wW = 18 / s.waist;
    var armW = 10 * s.arms;
    var thW = 11 * s.thighs;
    var caW = 9 * s.calves;

    return '<svg viewBox="0 0 200 420" width="100%" height="auto" xmlns="http://www.w3.org/2000/svg" style="display:block;max-height:280px">' +
      '<defs>' +
      '<linearGradient id="' + uid + 'skin" x1="0%" y1="0%" x2="100%" y2="100%">' +
      '<stop offset="0%" stop-color="rgba(255,255,255,0.14)"/><stop offset="100%" stop-color="rgba(255,255,255,0.04)"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + uid + 'mus" x1="50%" y1="0%" x2="50%" y2="100%">' +
      '<stop offset="0%" stop-color="' + color + '"/><stop offset="100%" stop-color="rgba(0,0,0,0.15)"/>' +
      '</linearGradient>' +
      '<filter id="' + uid + 'sh"><feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.35"/></filter>' +
      '</defs>' +
      '<ellipse cx="100" cy="32" rx="22" ry="26" fill="url(#' + uid + 'skin)" stroke="' + stroke + '" stroke-width="1.2"/>' +
      '<rect x="' + (100 - 8 * s.neck) + '" y="56" width="' + (16 * s.neck) + '" height="16" rx="4" fill="url(#' + uid + 'skin)" stroke="' + stroke + '" stroke-width="0.8"/>' +
      '<path d="M' + (100 - shW) + ' 72 Q100 66 ' + (100 + shW) + ' 72 L' + (100 + shW + 4) + ' 92 Q100 88 ' + (100 - shW - 4) + ' 92 Z" fill="url(#' + uid + 'mus)" stroke="' + stroke + '" filter="url(#' + uid + 'sh)"/>' +
      '<path d="M' + (100 - chW) + ' 88 L100 90 L100 118 Q' + (100 - chW - 6) + ' 120 ' + (100 - chW - 8) + ' 112 Z" fill="url(#' + uid + 'mus)" stroke="' + stroke + '"/>' +
      '<path d="M' + (100 + chW) + ' 88 L100 90 L100 118 Q' + (100 + chW + 6) + ' 120 ' + (100 + chW + 8) + ' 112 Z" fill="url(#' + uid + 'mus)" stroke="' + stroke + '"/>' +
      '<ellipse cx="' + (100 - shW - 6) + '" cy="96" rx="' + (8 + s.shoulders * 2) + '" ry="15" fill="url(#' + uid + 'mus)" stroke="' + stroke + '"/>' +
      '<ellipse cx="' + (100 + shW + 6) + '" cy="96" rx="' + (8 + s.shoulders * 2) + '" ry="15" fill="url(#' + uid + 'mus)" stroke="' + stroke + '"/>' +
      '<path d="M' + (46 - armW * 0.2) + ' 112 Q' + (38 - armW * 0.3) + ' 128 ' + (40 - armW * 0.2) + ' 148 L' + (54 + armW * 0.1) + ' 148 Q' + (56 + armW * 0.1) + ' 128 ' + (62 + armW * 0.2) + ' 112 Z" fill="url(#' + uid + 'mus)" stroke="' + stroke + '"/>' +
      '<path d="M' + (154 + armW * 0.2) + ' 112 Q' + (162 + armW * 0.3) + ' 128 ' + (160 + armW * 0.2) + ' 148 L' + (146 - armW * 0.1) + ' 148 Q' + (144 - armW * 0.1) + ' 128 ' + (138 - armW * 0.2) + ' 112 Z" fill="url(#' + uid + 'mus)" stroke="' + stroke + '"/>' +
      '<path d="M' + (100 - wW) + ' 118 L100 120 L' + (100 + wW) + ' 118 L' + (100 + wW - 2) + ' 165 L100 167 L' + (100 - wW + 2) + ' 165 Z" fill="url(#' + uid + 'skin)" stroke="' + stroke + '"/>' +
      '<path d="M' + (100 - thW) + ' 170 L100 172 L100 248 L' + (100 - thW - 2) + ' 246 Z" fill="url(#' + uid + 'mus)" stroke="' + stroke + '"/>' +
      '<path d="M' + (100 + thW) + ' 170 L100 172 L100 248 L' + (100 + thW + 2) + ' 246 Z" fill="url(#' + uid + 'mus)" stroke="' + stroke + '"/>' +
      '<path d="M' + (76 - caW * 0.1) + ' 265 Q' + (72 - caW * 0.15) + ' 288 ' + (76 - caW * 0.1) + ' 315 L' + (90 + caW * 0.05) + ' 315 Q' + (94 + caW * 0.05) + ' 288 ' + (98 + caW * 0.1) + ' 265 Z" fill="url(#' + uid + 'mus)" stroke="' + stroke + '"/>' +
      '<path d="M' + (102 - caW * 0.1) + ' 265 Q' + (106 - caW * 0.15) + ' 288 ' + (110 - caW * 0.1) + ' 315 L' + (124 + caW * 0.05) + ' 315 Q' + (128 + caW * 0.05) + ' 288 ' + (124 + caW * 0.1) + ' 265 Z" fill="url(#' + uid + 'mus)" stroke="' + stroke + '"/>' +
      (opts.label ? '<text x="100" y="408" text-anchor="middle" font-size="11" font-weight="700" fill="var(--txt3)">' + esc(opts.label) + '</text>' : '') +
      '</svg>';
  },

  lerpScales(a, b, t) {
    var out = {};
    Object.keys(a).forEach(function(k) {
      out[k] = a[k] + (b[k] - a[k]) * t;
    });
    return out;
  },

  comparisonPanel(archetypeId) {
    var archetype = PhysiqueArchetypes.ARCHETYPES[archetypeId];
    if (!archetype) return '';
    var stats = S.g('bodyStats') || [];
    var m = stats.length ? stats[stats.length - 1] : null;
    var user = S.g('user') || {};
    var height = user.height || 175;
    var current = this.scalesFromMeasurements(m, height, null);
    var target = this.scalesFromMeasurements(
      Object.fromEntries(Object.entries(archetype.targetMeasurements || {}).map(function(e) {
        return [e[0], e[1].formula(height)];
      })),
      height,
      archetype
    );
    var photo = S.g('physiqueProgressPhoto');
    var photoHtml = photo ?
      '<div style="width:72px;height:96px;border-radius:12px;overflow:hidden;border:1px solid var(--border);flex-shrink:0"><img src="' + photo + '" alt="Progress" style="width:100%;height:100%;object-fit:cover"/></div>' :
      '<button type="button" onclick="PhysiquePreview.uploadPhoto()" style="width:72px;height:96px;border-radius:12px;border:1px dashed var(--border2);background:var(--bg4);color:var(--txt3);font-size:10px;font-weight:600;cursor:pointer;touch-action:manipulation">📷 Add photo</button>';

    return '<div style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:16px;box-shadow:var(--ds1)">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3)">🪞 Physique Preview</div>' +
      '<div style="font-size:10px;color:var(--txt3)">' + (m ? 'From Body Map data' : 'Add measurements for accuracy') + '</div></div>' +
      '<div style="display:flex;gap:12px;margin-bottom:14px;align-items:flex-start">' + photoHtml +
      '<div style="flex:1;font-size:12px;color:var(--txt2);line-height:1.55">' +
      (m ? 'Proportions derived from your latest measurements. Drag the slider to morph toward your <strong style="color:' + archetype.color + '">' + esc(archetype.name) + '</strong> target.' :
        'Log neck, chest, waist, arms & legs in the <button type="button" onclick="go(\'bodymap\')" style="background:none;border:none;color:var(--c1);font-weight:700;cursor:pointer;font-size:12px;padding:0">Body tab</button> for a personalised preview.') +
      '</div></div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
      '<div style="background:rgba(0,0,0,0.2);border-radius:14px;padding:8px;border:1px solid var(--border)">' +
      this.bodySVG(current, { color: 'rgba(255,255,255,0.35)', label: 'Current' }) + '</div>' +
      '<div style="background:rgba(0,0,0,0.2);border-radius:14px;padding:8px;border:1px solid ' + archetype.color + '33">' +
      this.bodySVG(target, { color: archetype.color, label: 'Target' }) + '</div></div>' +
      '<div id="physique-morph-wrap" style="background:rgba(0,0,0,0.25);border-radius:14px;padding:10px;border:1px solid var(--border);margin-bottom:10px">' +
      this.bodySVG(current, { color: archetype.color, label: 'Morph preview' }) + '</div>' +
      '<input type="range" min="0" max="100" value="0" style="width:100%;accent-color:' + archetype.color + '" ' +
      'oninput="PhysiquePreview.updateMorph(' + JSON.stringify(current) + ',' + JSON.stringify(target) + ',\'' + archetype.color + '\',this.value/100)">' +
      '<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--txt3);margin-top:4px"><span>Current</span><span>Morph</span><span>Target</span></div>' +
      '</div>';
  },

  updateMorph(current, target, color, t) {
    var wrap = document.getElementById('physique-morph-wrap');
    if (!wrap) return;
    var morphed = this.lerpScales(current, target, t);
    wrap.innerHTML = this.bodySVG(morphed, { color: color, label: t < 0.05 ? 'Current' : t > 0.95 ? 'Target' : Math.round(t * 100) + '% toward target' });
    if (t > 0 && t < 1 && typeof haptic === 'function') haptic(8);
  },

  uploadPhoto() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = function() {
      var file = input.files && input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function() {
        try {
          S.set('physiqueProgressPhoto', reader.result);
          haptic(30);
          toast('Progress photo saved — offline on your device', 'ok');
          go('physique-archetype', { id: PhysiqueArchetypes.getUserArchetype() });
        } catch (e) { toast('Photo too large — try a smaller image', 'err'); }
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }
};
window.PhysiquePreview = PhysiquePreview;

/* ══════════════════════════════════════════════════════
   PHYSIQUE ARCHETYPE SCREEN
══════════════════════════════════════════════════════ */
reg('physique-archetype', function(data) {
  var selected = (data && data.id) || PhysiqueArchetypes.getUserArchetype();
  var archetypes = PhysiqueArchetypes.ARCHETYPES;
  var proportion = ProportionAnalyzer.analyze();

  if (selected && archetypes[selected]) {
    var arch = archetypes[selected];
    var comp = PhysiqueArchetypes.comparison(selected);

    return '<div class="topbar">' +
      '<button type="button" onclick="PhysiqueArchetypes.setUserArchetype(null);go(\'physique-archetype\')" style="background:none;border:none;color:var(--txt3);cursor:pointer;font-size:14px;padding:0 16px">←</button>' +
      '<div class="topbar-title">' + arch.icon + ' ' + esc(arch.name) + '</div>' +
      '</div>' +

      '<div style="padding:20px 16px 14px;text-align:center;background:linear-gradient(180deg,rgba(0,0,0,0.3),transparent)">' +
      '<div style="font-size:56px;margin-bottom:8px">' + arch.icon + '</div>' +
      '<div style="font-size:20px;font-weight:900;color:' + arch.color + ';margin-bottom:6px">' + esc(arch.name) + '</div>' +
      '<div style="font-size:13px;color:var(--txt2);max-width:280px;margin:0 auto;line-height:1.6">' + esc(arch.description) + '</div>' +
      (comp ? '<div style="margin-top:14px;display:inline-block;background:rgba(255,255,255,0.08);border-radius:16px;padding:8px 20px">' +
        '<div style="font-size:28px;font-weight:900;color:' + arch.color + '">' + comp.overallPct + '%</div>' +
        '<div style="font-size:11px;color:var(--txt3)">toward target</div></div>' : '') +
      '</div>' +

      PhysiquePreview.comparisonPanel(selected) +

      (comp && comp.measurements.some(function(m) { return m.current; }) ?
        '<div style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:20px;padding:16px">' +
        '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:12px">📏 Current vs Target</div>' +
        comp.measurements.map(function(m) {
          return '<div style="padding:10px 0;border-bottom:1px solid var(--border)">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">' +
            '<div style="font-size:13px;font-weight:700;color:var(--txt)">' + esc(m.label) + '</div>' +
            '<div style="font-size:12px;color:var(--txt3)">' +
            (m.current ? m.current + 'cm → <span style="color:' + arch.color + ';font-weight:700">' + m.target + 'cm target</span>' : '<span style="color:var(--txt3)">No data — add in Settings</span>') +
            '</div></div>' +
            (m.current ? '<div style="width:100%;height:6px;background:rgba(255,255,255,0.06);border-radius:3px"><div style="width:' + Math.min(m.pct, 100) + '%;height:6px;border-radius:3px;background:' + arch.color + '"></div></div>' +
            '<div style="font-size:11px;margin-top:4px;color:' + (m.status === 'on_target' ? '#30d158' : m.status === 'below' ? '#ff9f0a' : '#af52de') + '">' +
            (m.status === 'on_target' ? '✓ On target' : m.status === 'below' ? '↑ ' + Math.abs(m.diff).toFixed(1) + 'cm below target' : '↓ ' + Math.abs(m.diff).toFixed(1) + 'cm above target') +
            '</div>' : '') +
            '</div>';
        }).join('') +
        '</div>' : '') +

      (comp && comp.ratios.length ?
        '<div style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:20px;padding:16px">' +
        '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:12px">📐 Key Ratios</div>' +
        comp.ratios.map(function(r) {
          return '<div style="padding:8px 0;border-bottom:1px solid var(--border)">' +
            '<div style="display:flex;justify-content:space-between;margin-bottom:6px">' +
            '<div style="font-size:13px;font-weight:600;color:var(--txt)">' + esc(r.label) + '</div>' +
            '<div style="font-size:12px"><span style="color:var(--txt3)">' + r.current + '</span> → <span style="color:' + r.color + ';font-weight:700">' + r.target + '</span></div>' +
            '</div>' +
            '<div style="width:100%;height:5px;background:rgba(255,255,255,0.06);border-radius:3px"><div style="width:' + r.pct + '%;height:5px;border-radius:3px;background:' + r.color + '"></div></div>' +
            '</div>';
        }).join('') +
        '</div>' : '') +

      '<div style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:20px;padding:16px">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:10px">🎯 Training Focus</div>' +
      arch.training_focus.map(function(f) {
        return '<div style="font-size:13px;color:var(--txt2);padding:6px 0;border-bottom:1px solid var(--border);display:flex;gap:8px"><span style="color:' + arch.color + '">→</span>' + esc(f) + '</div>';
      }).join('') +
      '</div>' +

      '<div style="padding:0 16px 16px"><button type="button" onclick="PhysiqueArchetypes.setUserArchetype(null);go(\'physique-archetype\')" style="width:100%;padding:12px;background:rgba(255,255,255,0.06);border:1px solid var(--border);border-radius:14px;color:var(--txt3);font-size:13px;cursor:pointer">← Choose Different Archetype</button></div>' +
      '<div style="height:20px"></div>';
  }

  return '<div class="topbar"><button type="button" onclick="history.length>1?history.back():go(\'hub\')" style="background:none;border:none;color:var(--txt3);cursor:pointer;font-size:14px;padding:0 16px;touch-action:manipulation" aria-label="Back">←</button><div class="topbar-title">Physique Archetype</div></div>' +

    '<div style="padding:16px 16px 8px">' +
    '<div style="font-size:14px;color:var(--txt2);line-height:1.6;margin-bottom:4px">Choose your physique goal. PulseCap will show your current measurements vs target proportions and guide your training.</div>' +
    '</div>' +

    (proportion && proportion.hasMeasurements ?
      '<div style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px;box-shadow:var(--ds1)">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:10px">📐 Your Current Proportions</div>' +
      proportion.ratios.map(function(r) {
        return '<div style="display:flex;align-items:center;gap:10px;padding:6px 0;border-bottom:1px solid var(--border)">' +
          '<div style="font-size:16px">' + r.icon + '</div>' +
          '<div style="flex:1"><div style="font-size:12px;font-weight:600;color:var(--txt)">' + esc(r.name) + '</div>' +
          '<div style="font-size:11px;color:var(--txt3)">' + esc(r.tip) + '</div></div>' +
          '<div style="font-size:13px;font-weight:700;color:' + (r.status === 'excellent' ? '#30d158' : r.status === 'good' ? 'var(--c1)' : '#f5c842') + '">' + r.value + '</div>' +
          '</div>';
      }).join('') +
      (proportion.weakPoints.length ? '<div style="margin-top:10px">' + proportion.weakPoints.map(function(w) { return '<div style="font-size:11px;color:#ff9f0a;padding:3px 0">⚠️ ' + esc(w) + '</div>'; }).join('') + '</div>' : '') +
      '</div>' : '') +

    Object.values(archetypes).map(function(a) {
      return '<div onclick="PhysiqueArchetypes.setUserArchetype(\'' + a.id + '\');go(\'physique-archetype\',{id:\'' + a.id + '\'})" style="margin:0 16px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:16px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:14px">' +
        '<div style="font-size:36px;flex-shrink:0">' + a.icon + '</div>' +
        '<div style="flex:1">' +
        '<div style="font-size:15px;font-weight:800;color:' + a.color + ';margin-bottom:4px">' + esc(a.name) + '</div>' +
        '<div style="font-size:12px;color:var(--txt2);line-height:1.5">' + esc(a.description) + '</div>' +
        '</div><div style="font-size:18px;color:var(--txt3)">›</div>' +
        '</div>';
    }).join('') +
    '<div style="height:20px"></div>';
});
