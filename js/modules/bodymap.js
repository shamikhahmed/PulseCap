'use strict';
/* ── PulseCap v4 — Body Map & Measurements ── */

let _bodyView = 'front';
let _measUnit = 'cm';

reg('bodymap', function() {
  const user = S.g('user') || {};
  const muscleColors = MuscleEngine.bodyMapColors();
  const muscleStatus = MuscleEngine.status();
  const measurements = S.g('measurements') || [];
  const latestMeas = measurements.length ? measurements[measurements.length-1] : null;
  const prevMeas = measurements.length > 1 ? measurements[measurements.length-2] : null;
  _measUnit = user.measureUnit || 'cm';

  var tool = function(screen, ic, label, tint) {
    return '<button type="button" onclick="go(\'' + screen + '\')" class="press" ' +
      'style="background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:12px 6px;cursor:pointer;touch-action:manipulation;display:flex;flex-direction:column;align-items:center;gap:5px">' +
      '<span style="color:var(--' + (tint || 'c1') + ');display:flex">' + icon(ic, 20) + '</span>' +
      '<span style="font-size:10px;font-weight:700;color:var(--txt2);letter-spacing:0.02em">' + label + '</span></button>';
  };

  return '<div class="topbar">' +
    '<div><div class="topbar-title">Body</div>' +
    '<div class="topbar-date">Recovery · measurements · rehab</div></div>' +
    '</div>' +

    _bodyMapSection(muscleColors, user) +
    _muscleStatusGrid(muscleStatus) +

    sh('Tools') +
    '<div style="padding:0 16px 14px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px">' +
    tool('recovery', 'heart', 'Recover', 'c3') +
    tool('nutrition', 'apple', 'Fuel', 'c3') +
    tool('rehab', 'bandage', 'Rehab', 'c4') +
    tool('photos', 'camera', 'Photos', 'c2') +
    tool('physique', 'ruler', 'Physique', 'c1') +
    tool('body-intelligence', 'dna', 'Body Intel', 'c2') +
    tool('injury-risk', 'alert', 'Injury Risk', 'c5') +
    tool('calculators', 'calc', 'Calculators', 'c1') +
    '</div>' +

    _measurementsSection(latestMeas, prevMeas, user) +
    _bodyStatsSection(user) +
    '<div  class="spacer-bottom"></div>';
});

/* ════════════════════════════════════
   BODY MAP SVG — FIXED FRONT + BACK
════════════════════════════════════ */
function _bodyMapSection(colors, user) {
  user = user || S.g('user') || {};
  var c = function(key) { return colors[key.toLowerCase()] || 'rgba(255,255,255,0.06)'; };

  /* Figure proportions from the user's profile — the map is THEIR body.
     Factors are clamped tight so muscles always stay inside the silhouette. */
  function _bodyFactors(user) {
    var h = user.height || 175, w = user.weight || 75;
    var female = user.gender === 'female';
    var bmi = w / Math.pow(h / 100, 2);
    var bf = parseFloat(user.bodyFat);
    if (isNaN(bf)) bf = female ? 28 : 20;
    var ffmi = (w * (1 - bf / 100)) / Math.pow(h / 100, 2);
    var muscle = Math.max(-0.06, Math.min(0.12, (ffmi - (female ? 15 : 19)) * 0.02));
    var fat = Math.max(-0.08, Math.min(0.18, (bmi - 22) * 0.022 + (bf - (female ? 28 : 20)) * 0.004));
    var shoulder = Math.max(0.86, Math.min(1.16, (female ? 0.92 : 1.02) + muscle + fat * 0.3));
    var waist = Math.max(0.88, Math.min(1.22, 1 + fat));
    var hip = Math.max(0.90, Math.min(1.20, (female ? 1.08 : 0.98) + fat * 0.8 + muscle * 0.3));
    var body = shoulder * 0.4 + waist * 0.3 + hip * 0.3;
    var rel = function(f) { return Math.max(0.94, Math.min(1.06, f / body)); };
    return {
      body: body,
      height: Math.max(0.94, Math.min(1.06, h / 175)),
      shoulderRel: rel(shoulder), waistRel: rel(waist), hipRel: rel(hip),
      caption: h + 'cm · ' + w + 'kg · ' + (female ? '♀' : '♂') + ' · ~' + Math.round(bf) + '% BF'
    };
  }

  /* HD anatomical map: bezier muscle shapes, one side authored, mirrored
     with an SVG transform; decor lines add definition without capturing taps. */
  function mus(d, grp) {
    return '<path d="' + d + '" fill="' + c(grp) + '" fill-opacity="0.92" ' +
      'stroke="rgba(0,0,0,0.30)" stroke-width="0.8" stroke-linejoin="round" ' +
      'onclick="showMuscleInfo(\'' + grp + '\')" style="cursor:pointer"/>';
  }
  function dec(d) {
    return '<path d="' + d + '" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="0.8" pointer-events="none" stroke-linecap="round"/>';
  }
  function neutral(d) {
    return '<path d="' + d + '" fill="var(--bg5)" stroke="var(--border2)" stroke-width="0.8"/>';
  }
  var silhouette =
    '<path d="M100,4 C89,4 82,13 82,27 C82,37 85,45 91,50 L91,60 C73,64 58,71 50,84 ' +
    'C42,97 38,114 36,134 C34,154 32,172 34,192 C35,201 38,207 44,208 C50,207 53,200 54,192 ' +
    'C56,175 57,158 60,144 L62,150 C60,172 62,188 66,200 C70,216 72,234 70,254 ' +
    'C68,276 70,300 74,320 C76,332 77,344 77,356 C77,364 82,368 89,368 C95,368 98,363 98,356 ' +
    'L98,262 L100,258 L102,262 L102,356 C102,363 105,368 111,368 C118,368 123,364 123,356 ' +
    'C123,344 124,332 126,320 C130,300 132,276 130,254 C128,234 130,216 134,200 ' +
    'C138,188 140,172 138,150 L140,144 C143,158 144,175 146,192 C147,200 150,207 156,208 ' +
    'C162,207 165,201 166,192 C168,172 166,154 164,134 C162,114 158,97 150,84 ' +
    'C142,71 127,64 109,60 L109,50 C115,45 118,37 118,27 C118,13 111,4 100,4 Z" ' +
    'fill="var(--bg4)" stroke="var(--border2)" stroke-width="1.2"/>';

  /* ── FRONT: left-side muscles by body band (mirrored for right) ── */
  var fUpperSide =
    mus('M72,82 C63,84 55,90 51,100 C48,108 50,115 56,117 C63,114 68,105 71,95 C72,90 73,85 72,82 Z', 'Shoulders') +   /* front delt */
    mus('M74,86 C86,86 96,88 97,92 L97,124 C88,128 76,126 69,117 C64,108 66,94 74,86 Z', 'Chest') +                     /* pec */
    mus('M52,118 C47,128 44,140 44,152 C44,158 48,161 53,159 C58,152 61,138 61,126 C61,120 57,117 52,118 Z', 'Biceps') + /* bicep */
    neutral('M45,160 C41,172 40,184 42,194 C45,199 50,198 53,193 C56,182 57,170 56,161 C52,158 48,158 45,160 Z') +       /* forearm */
    neutral('M42,196 C40,204 41,210 45,213 C49,215 53,212 53,206 C53,200 51,196 48,195 Z') +                             /* hand */
    dec('M97,92 L97,122');                                                                                               /* pec centerline */
  var fCoreSide =
    mus('M76,126 C71,142 71,160 75,176 L83,179 C80,162 81,142 84,127 C81,125 78,125 76,126 Z', 'Core');                  /* oblique */
  var fLowerSide =
    mus('M79,198 C73,220 72,244 76,262 C81,268 89,268 93,262 C96,244 97,220 96,202 C91,197 84,196 79,198 Z', 'Quads') +  /* quad */
    dec('M84,240 C86,230 86,215 85,205') +                                                                               /* quad separation */
    neutral('M80,264 C78,270 80,275 86,276 C92,275 94,270 92,264 C88,262 83,262 80,264 Z') +                             /* knee */
    mus('M80,280 C76,298 76,314 80,330 C84,335 90,334 92,329 C94,312 93,296 90,281 C87,278 83,278 80,280 Z', 'Calves') + /* calf/tib */
    neutral('M79,338 C77,348 78,354 84,356 C91,357 95,353 94,346 L92,338 C88,335 82,335 79,338 Z');                      /* foot */

  var fUpperCtr = mus('M83,74 C94,70 106,70 117,74 L121,83 C107,79 93,79 79,83 Z', 'Back');                               /* traps */
  var fCoreCtr =
    mus('M86,126 L114,126 C116,143 116,161 113,178 C109,183 91,183 87,178 C84,161 84,143 86,126 Z', 'Core') +             /* rectus */
    dec('M100,128 L100,178') + dec('M87,142 L113,142') + dec('M87,157 L113,157');                                         /* six-pack lines */
  var fLowerCtr = neutral('M87,182 C95,188 105,188 113,182 L110,198 C104,203 96,203 90,198 Z');                           /* pelvis */

  /* ── BACK: left-side muscles by band ── */
  var bUpperSide =
    mus('M71,82 C62,84 54,90 50,100 C47,108 50,115 56,117 C63,113 68,104 71,94 Z', 'Shoulders') +                        /* rear delt */
    mus('M52,118 C47,130 45,142 45,154 C46,160 50,162 54,159 C59,150 61,136 60,124 C58,118 55,116 52,118 Z', 'Triceps') + /* tricep */
    neutral('M46,161 C42,172 41,184 43,194 C46,199 51,198 54,193 C57,182 57,170 56,162 C52,159 49,159 46,161 Z') +
    neutral('M43,196 C41,204 42,210 46,213 C50,215 54,212 54,206 C54,200 52,196 49,195 Z') +
    mus('M63,106 C61,124 62,146 68,166 L80,172 C76,150 76,126 78,110 C73,106 67,105 63,106 Z', 'Back');                   /* lat wing */
  var bCoreSide = '';
  var bLowerSide =
    mus('M77,168 C71,178 69,192 71,206 C77,213 88,214 95,208 C97,196 97,182 95,172 C89,167 82,166 77,168 Z', 'Glutes') +  /* glute */
    mus('M74,212 C71,230 71,248 75,262 C80,267 88,267 92,262 C95,246 95,228 93,214 C86,209 79,209 74,212 Z', 'Hamstrings') +
    neutral('M79,264 C77,270 79,275 85,276 C91,275 93,270 91,264 C87,262 82,262 79,264 Z') +
    mus('M79,280 C75,296 75,312 79,328 C83,334 90,333 92,328 C95,311 94,295 91,281 C87,277 82,277 79,280 Z', 'Calves') +
    dec('M85,282 C85,292 85,300 85,306') +                                                                                /* gastroc split */
    neutral('M78,338 C76,348 77,354 83,356 C90,357 94,353 93,346 L91,338 C87,335 81,335 78,338 Z');

  var bUpperCtr =
    mus('M80,72 C93,66 107,66 120,72 C124,84 118,100 100,112 C82,100 76,84 80,72 Z', 'Back') +                            /* trap diamond */
    mus('M84,108 L116,108 C118,120 117,132 114,140 L86,140 C83,132 82,120 84,108 Z', 'Back') +                            /* rhomboids */
    dec('M100,72 L100,110');
  var bCoreCtr =
    mus('M90,142 L110,142 C112,156 112,170 110,180 C104,184 96,184 90,180 C88,170 88,156 90,142 Z', 'Back') +             /* erectors */
    dec('M100,144 L100,180');
  var bLowerCtr = dec('M100,186 L100,206');                                                                               /* glute split */

  var F = _bodyFactors(user);
  function mirror(s) { return '<g transform="translate(200,0) scale(-1,1)">' + s + '</g>'; }
  function band(content, f) {
    return '<g transform="translate(100,0) scale(' + f.toFixed(3) + ',1) translate(-100,0)">' + content + '</g>';
  }
  function bodySVG(upSide, upCtr, coreSide, coreCtr, lowSide, lowCtr) {
    var up = '<g>' + upSide + '</g>' + mirror(upSide) + upCtr;
    var core = (coreSide ? '<g>' + coreSide + '</g>' + mirror(coreSide) : '') + coreCtr;
    var low = '<g>' + lowSide + '</g>' + mirror(lowSide) + lowCtr;
    /* Soft top-light sheen re-uses the silhouette path for depth */
    var sheen = silhouette.replace(
      'fill="var(--bg4)" stroke="var(--border2)" stroke-width="1.2"',
      'fill="url(#bodySheen)" stroke="none" pointer-events="none"');
    return '<svg viewBox="0 0 200 420" width="220" height="462" xmlns="http://www.w3.org/2000/svg" style="max-width:64vw;height:auto">' +
      '<defs>' +
      '<linearGradient id="bodySheen" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="#ffffff" stop-opacity="0.16"/>' +
      '<stop offset="35%" stop-color="#ffffff" stop-opacity="0.05"/>' +
      '<stop offset="100%" stop-color="#000000" stop-opacity="0.10"/>' +
      '</linearGradient>' +
      '<radialGradient id="bodyGlow" cx="0.5" cy="0.35" r="0.65">' +
      '<stop offset="0%" stop-color="rgba(0,213,255,0.10)"/>' +
      '<stop offset="100%" stop-color="rgba(0,213,255,0)"/>' +
      '</radialGradient>' +
      '</defs>' +
      '<rect x="0" y="0" width="200" height="420" fill="url(#bodyGlow)"/>' +
      /* whole figure scales to body mass + height; bands add shoulder/waist/hip shape */
      '<g transform="translate(100,210) scale(' + F.body.toFixed(3) + ',' + F.height.toFixed(3) + ') translate(-100,-210)">' +
      silhouette +
      band(up, F.shoulderRel) +
      band(core, F.waistRel) +
      band(low, F.hipRel) +
      sheen +
      '</g></svg>';
  }

  var frontSVG = bodySVG(fUpperSide, fUpperCtr, fCoreSide, fCoreCtr, fLowerSide, fLowerCtr);
  var backSVG = bodySVG(bUpperSide, bUpperCtr, bCoreSide, bCoreCtr, bLowerSide, bLowerCtr);

  var isBack = _bodyView === 'back';

  return '<div style="padding:14px 16px 0">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3)">Body Map</div>' +
    '<div style="display:flex;gap:6px">' +
    '<button type="button" onclick="_bodyView=\'front\';go(\'bodymap\')" style="padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid '+(!isBack?'var(--c1)':'var(--border)')+';background:'+(!isBack?'var(--c1)':'transparent')+';color:'+(!isBack?'#fff':'var(--txt3)')+'">Front</button>' +
    '<button type="button" onclick="_bodyView=\'back\';go(\'bodymap\')" style="padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid '+(isBack?'var(--c1)':'var(--border)')+';background:'+(isBack?'var(--c1)':'transparent')+';color:'+(isBack?'#fff':'var(--txt3)')+'">Back</button>' +
    '</div></div></div>' +
    '<div style="background:var(--bg3);border-radius:20px;margin:0 16px 14px;padding:16px;border:1px solid var(--border)">' +
    '<div class="row-between mb-12">' +
    '<div style="font-size:12px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:0.08em">' +
    (isBack ? 'Posterior (Back)' : 'Anterior (Front)') + '</div>' +
    '<div style="display:flex;gap:6px;align-items:center">' +
    '<div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:#30d158"></div><div  class="muted-10">Ready</div></div>' +
    '<div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:#ff9f0a"></div><div  class="muted-10">Recovering</div></div>' +
    '<div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:#ff453a"></div><div  class="muted-10">Sore</div></div>' +
    '</div></div>' +
    '<div style="display:flex;justify-content:center">' +
    (isBack ? backSVG : frontSVG) +
    '</div>' +
    '<div style="font-size:12px;color:var(--txt3);text-align:center;margin-top:10px">Tap any muscle to see recovery status</div>' +
    '<div style="font-size:11px;color:var(--txt3);text-align:center;margin-top:4px;opacity:0.8">Scaled to you: ' + esc(F.caption) + '</div>' +
    '</div>';
}

window.toggleBodyView = function() {
  _bodyView = _bodyView === 'front' ? 'back' : 'front';
  go('bodymap');
};

window.showMuscleInfo = function(groupName) {
  var status = MuscleEngine.status();
  var group = status.find(function(m) { return m.name.toLowerCase() === groupName.toLowerCase(); });
  if (!group) return;

  var statusColor = group.status === 'fresh' ? '#30d158' : group.status === 'recovering' ? '#ff9f0a' : '#ff453a';
  var statusText = group.status === 'fresh' ? 'Ready to train' : group.status === 'recovering' ? 'Recovering — moderate volume' : 'Sore — consider rest or light session';
  var pctText = group.hrs ? Math.round(group.hrs) + 'h since last trained' : 'Not trained recently';

  modal(groupName + ' Status',
    '<div style="text-align:center;padding:8px 0 16px">' +
    '<div style="display:flex;justify-content:center;margin-bottom:10px;color:var(--c1)">' + icon('dumbbell', 48) + '</div>' +
    '<div style="font-size:40px;font-weight:900;color:'+statusColor+';margin-bottom:4px">'+group.pct+'%</div>' +
    '<div style="font-size:14px;font-weight:700;color:'+statusColor+';margin-bottom:4px">'+group.label+'</div>' +
    '<div style="font-size:13px;color:var(--txt3);margin-bottom:8px">'+pctText+'</div>' +
    '<div style="font-size:13px;color:var(--txt2);line-height:1.6">'+statusText+'</div>' +
    '</div>' +
    '<div style="background:var(--bg3);border-radius:12px;padding:12px;margin-top:8px">' +
    '<div class="prog-bar-wrap" style="margin-bottom:6px"><div class="prog-bar" style="width:'+group.pct+'%;background:'+statusColor+'"></div></div>' +
    '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--txt3)">' +
    '<span>0% Depleted</span><span>100% Ready</span></div>' +
    '</div>',
    '<button type="button" class="btn btn-secondary mt-14" onclick="closeModal()">Close</button>'
  );
};

/* ════════════════════════════════════
   MUSCLE STATUS GRID
════════════════════════════════════ */
function _muscleStatusGrid(muscleStatus) {
  var injured = muscleStatus.filter(function(m) { return m.status === 'injured'; });

  var banner = injured.length ?
    '<button type="button" onclick="go(\'rehab\')" class="list-row" style="margin:0 16px 10px;width:calc(100% - 32px);border:1px solid rgba(255,69,58,0.25);border-radius:14px;background:rgba(255,69,58,0.08);border-bottom:1px solid rgba(255,69,58,0.25)" aria-label="Open rehab for injured muscles">' +
    '<span class="list-row__icon" style="color:#ff453a;display:flex;justify-content:center">' + icon('bandage', 20) + '</span>' +
    '<span class="list-row__body"><span class="list-row__title" style="color:#ff453a">' +
    injured.map(function(m){ return esc(m.name); }).join(', ') + ' held back by injury</span>' +
    '<span class="list-row__sub">Recovery here follows your rehab, not the clock · Rehab →</span></span>' +
    '<span class="list-row__chev" style="color:#ff453a" aria-hidden="true">›</span></button>' : '';

  var chips = muscleStatus.map(function(m) {
    var isInjured = m.status === 'injured';
    var big = isInjured ? icon('bandage', 16) : m.pct + '%';
    return '<button type="button" onclick="' + (isInjured ? 'go(\'rehab\')' : 'showMuscleInfo(\''+esc(m.name)+'\')') + '" class="press" ' +
      'aria-label="' + esc(m.name) + ' recovery" ' +
      'style="background:var(--bg3);border-radius:14px;padding:12px;cursor:pointer;touch-action:manipulation;border:1px solid ' + (isInjured ? 'rgba(255,69,58,0.35)' : 'var(--border)') + ';text-align:left;width:100%;font:inherit;color:inherit">' +
      '<div style="display:flex;align-items:baseline;justify-content:space-between;gap:6px">' +
      '<div  class="row-title">'+esc(m.name)+'</div>' +
      '<div style="font-size:15px;font-weight:800;color:'+m.color+'">'+big+'</div>' +
      '</div>' +
      '<div style="font-size:10px;color:'+(isInjured ? m.color : 'var(--txt3)')+';margin-top:2px;font-weight:600">'+esc(m.label)+(m.hrs ? ' · '+m.hrs+'h ago' : '')+'</div>' +
      '<div style="margin-top:8px;height:4px;background:var(--bg4);border-radius:2px;overflow:hidden">' +
      '<div style="width:'+m.pct+'%;height:100%;background:'+m.color+';transition:width 0.6s ease"></div>' +
      '</div></button>';
  }).join('');

  return sh('Muscle Recovery') + banner +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:0 16px 14px">' +
    chips + '</div>';
}

/* ════════════════════════════════════
   MEASUREMENTS SECTION
════════════════════════════════════ */
function _measurementsSection(latest, prev, user) {
  var unit = _measUnit;
  var isImperial = unit === 'in';

  function cvt(val) {
    if (!val) return '—';
    return isImperial ? Math.round(val * 0.3937 * 10) / 10 + '"' : val + 'cm';
  }
  function diff(cur, prv) {
    if (!cur || !prv) return '';
    var d = Math.round((cur - prv) * 10) / 10;
    if (d === 0) return '<span class="c-muted"> (=)</span>';
    var col = d > 0 ? '#ff9f0a' : '#30d158';
    return '<span style="color:'+col+'"> ('+(d>0?'+':'')+d+(isImperial?'"':'cm')+')</span>';
  }

  var fields = [
    { key:'neck',       label:'Neck',         ic:'target' },
    { key:'shoulders',  label:'Shoulders',    ic:'dumbbell' },
    { key:'chest',      label:'Chest',        ic:'heart' },
    { key:'leftBicep',  label:'L Bicep',      ic:'dumbbell' },
    { key:'rightBicep', label:'R Bicep',      ic:'dumbbell' },
    { key:'waist',      label:'Waist',        ic:'ruler' },
    { key:'hips',       label:'Hips',         ic:'walk' },
    { key:'leftThigh',  label:'L Thigh',      ic:'walk' },
    { key:'rightThigh', label:'R Thigh',      ic:'walk' },
    { key:'leftCalf',   label:'L Calf',       ic:'run' },
    { key:'rightCalf',  label:'R Calf',       ic:'run' }
  ];

  var rows = fields.map(function(f) {
    var val = latest ? latest[f.key] : null;
    var pval = prev ? prev[f.key] : null;
    return '<div class="list-divider-row">' +
      '<div style="display:flex;align-items:center;gap:10px">' +
      '<span style="width:24px;display:flex;align-items:center;justify-content:center;color:var(--c1)">'+icon(f.ic, 16)+'</span>' +
      '<div  class="row-strong">'+esc(f.label)+'</div>' +
      '</div>' +
      '<div style="font-size:14px;font-weight:700;color:var(--c1)">'+cvt(val)+diff(val,pval)+'</div>' +
      '</div>';
  }).join('');

  var unitBtns = ['cm','in'].map(function(u) {
    return '<button type="button" onclick="setMeasUnit(\''+u+'\')" style="flex:1;padding:8px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:'+(unit===u?'var(--grad)':'var(--bg4)')+';color:'+(unit===u?'#fff':'var(--txt3)')+'">'+u+'</button>';
  }).join('');

  var allMeas = S.g('measurements') || [];
  var waistPts = allMeas.filter(m => m.waist).slice(-12);
  var miniChart = '';
  if (waistPts.length >= 2) {
    var vals = waistPts.map(m => m.waist);
    var minV = Math.min.apply(null, vals), maxV = Math.max.apply(null, vals);
    var W = 280, H = 48, pad = 4;
    var pts = waistPts.map(function(m, i) {
      var x = pad + (waistPts.length > 1 ? i / (waistPts.length - 1) : 0.5) * (W - pad * 2);
      var y = pad + (1 - (m.waist - minV) / (maxV - minV || 1)) * (H - pad * 2);
      return x + ',' + y;
    }).join(' ');
    miniChart = '<div style="margin-bottom:14px;padding-top:8px;border-top:1px solid var(--border)">' +
      '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--txt3);margin-bottom:6px">Waist trend</div>' +
      '<svg width="100%" viewBox="0 0 '+W+' '+H+'" style="display:block"><polyline fill="none" stroke="var(--c1)" stroke-width="2.5" stroke-linecap="round" points="'+pts+'"/></svg></div>';
  }

  return sh('Measurements', '+ Log', 'showLogMeasurements()') +
    '<div class="card card-solid mx-card" >' +
    '<div style="display:flex;gap:6px;margin-bottom:14px">'+unitBtns+'</div>' +
    (latest ? '<div style="font-size:12px;color:var(--txt3);margin-bottom:10px">Last logged: '+esc(latest.date || '—')+(prev ? ' · Previous: '+esc(prev.date||'—') : '')+'</div>' : '') +
    miniChart + rows +
    '</div>';
}

window.setMeasUnit = function(unit) {
  _measUnit = unit;
  S.set('user.measureUnit', unit);
  go('bodymap');
};

window.showLogMeasurements = function() {
  var last = (S.g('measurements') || []).slice(-1)[0] || {};
  var unit = _measUnit;
  var isImperial = unit === 'in';
  var placeholder = isImperial ? '0.0"' : '0';
  var unitLabel = isImperial ? 'inches' : 'cm';

  var fields = [
    { key:'neck',       label:'Neck' },
    { key:'shoulders',  label:'Shoulders' },
    { key:'chest',      label:'Chest' },
    { key:'leftBicep',  label:'Left Bicep' },
    { key:'rightBicep', label:'Right Bicep' },
    { key:'waist',      label:'Waist' },
    { key:'hips',       label:'Hips' },
    { key:'leftThigh',  label:'Left Thigh' },
    { key:'rightThigh', label:'Right Thigh' },
    { key:'leftCalf',   label:'Left Calf' },
    { key:'rightCalf',  label:'Right Calf' }
  ];

  function lastVal(key) {
    if (!last[key]) return '';
    return isImperial ? Math.round(last[key] * 0.3937 * 10) / 10 : last[key];
  }

  var formFields = fields.map(function(f) {
    return '<div class="field-wrap">' +
      '<label class="field-label">'+esc(f.label)+' ('+unitLabel+')</label>' +
      '<input class="field" type="number" step="0.1" id="meas-'+f.key+'" ' +
      'placeholder="'+placeholder+'" value="'+lastVal(f.key)+'" inputmode="decimal">' +
      '</div>';
  }).join('');

  modal('Log Measurements',
    '<div style="font-size:13px;color:var(--txt3);margin-bottom:14px">All measurements in '+unitLabel+'. Enter only what you have.</div>' +
    formFields,
    '<button type="button" class="btn btn-primary mt-14" onclick="saveMeasurements()">Save Measurements</button>'
  );
};

window.saveMeasurements = function() {
  var isImperial = _measUnit === 'in';
  var fields = ['neck','shoulders','chest','leftBicep','rightBicep','waist','hips','leftThigh','rightThigh','leftCalf','rightCalf'];
  var entry = { date: today(), unit: _measUnit };
  fields.forEach(function(key) {
    var el = document.getElementById('meas-'+key);
    if (!el || !el.value) return;
    var val = parseFloat(el.value);
    if (!isNaN(val)) {
      entry[key] = isImperial ? Math.round(val / 0.3937 * 10) / 10 : val;
    }
  });
  S.push('measurements', entry);
  closeModal();
  toast('Measurements saved', 'ok');
  go('bodymap');
};

/* ════════════════════════════════════
   BODY STATS PANEL
════════════════════════════════════ */
function _bodyStatsSection(user) {
  var bmiData = BodyEngine.bmi(user.weight||75, user.height||175);
  var bmr = BodyEngine.bmr(user);
  var tdee = BodyEngine.tdee(user);
  var healthyRange = BodyEngine.healthyWeightRange(user.height||175, user.gender||'male');
  var units = user.units || 'metric';
  var isImperial = units === 'imperial';

  var heightDisplay;
  var curHeightMode = user.heightDisplay || (isImperial ? 'in' : 'cm');
  if (curHeightMode === 'ft') {
    var totalIn = Math.round((user.height||175) / 2.54);
    var ft = Math.floor(totalIn / 12);
    var inches = totalIn % 12;
    heightDisplay = ft + '\'' + inches + '"';
  } else if (curHeightMode === 'in') {
    heightDisplay = Math.round((user.height||175) / 2.54 * 10) / 10 + ' in';
  } else {
    heightDisplay = (user.height||175) + ' cm';
  }

  var weightDisplay = isImperial ?
    Math.round((user.weight||75) * 2.205 * 10) / 10 + ' lb' :
    (user.weight||75) + ' kg';

  var bodyStats = S.g('bodyStats') || [];
  var changeStr = '';
  if (bodyStats.length >= 2) {
    var wDiff = Math.round((bodyStats[bodyStats.length-1].weight - bodyStats[bodyStats.length-2].weight) * 10) / 10;
    var wCol = (wDiff <= 0 && user.goal === 'fat_loss') || (wDiff >= 0 && user.goal !== 'fat_loss') ? '#30d158' : '#ff9f0a';
    changeStr = '<span style="color:'+wCol+'"> ('+(wDiff>0?'+':'')+wDiff+'kg)</span>';
  }

  var bmiColor = bmiData.bmi < 18.5 ? '#ff9f0a' : bmiData.bmi < 25 ? '#30d158' : bmiData.bmi < 30 ? '#ff9f0a' : '#ff453a';

  var heightBtns = ['cm','in','ft'].map(function(u) {
    return '<button type="button" onclick="setHeightDisplay(\''+u+'\')" style="flex:1;padding:8px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:'+(curHeightMode===u?'var(--grad)':'var(--bg4)')+';color:'+(curHeightMode===u?'#fff':'var(--txt3)')+'">'+u+'</button>';
  }).join('');

  return sh('Body Stats', '+ Log Weight', 'showLogWeight()') +
    '<div class="card card-solid mx-card" >' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
    _bStat('scale','Weight',weightDisplay+(changeStr||''),'Current') +
    _bStat('ruler','Height',heightDisplay,'') +
    _bStat('calc','BMI','<span style="color:'+bmiColor+'">'+bmiData.bmi+'</span>',bmiData.cat) +
    _bStat('flame','BMR',bmr+' kcal','At rest') +
    _bStat('sparkles','TDEE',tdee+' kcal','Daily need') +
    _bStat('target','Healthy',healthyRange.min+'–'+healthyRange.max+'kg','Range') +
    '</div>' +
    '<div style="border-top:1px solid var(--border);padding-top:12px">' +
    '<div style="font-size:11px;color:var(--txt3);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Height Display</div>' +
    '<div style="display:flex;gap:6px">' + heightBtns + '</div>' +
    '</div></div>';
}

function _bStat(ic, label, val, sub) {
  return '<div style="background:var(--bg4);border-radius:12px;padding:12px">' +
    '<div class="micro-label mb-6" style="display:flex;align-items:center;gap:6px">'+icon(ic, 14)+esc(label)+'</div>' +
    '<div  class="row-title-16">'+val+'</div>' +
    (sub ? '<div  class="muted-11 mt-2">'+esc(sub)+'</div>' : '') +
    '</div>';
}

window.setHeightDisplay = function(mode) {
  S.set('user.heightDisplay', mode);
  go('bodymap');
};

window.showLogWeight = function() {
  var user = S.g('user') || {};
  var isImperial = user.units === 'imperial';
  var goalKg = user.goalWeight || 70;
  var curKg = user.weight || 75;
  modal('What do you weigh today?',
    '<div class="field-wrap">' +
    '<label class="field-label">Weight ('+(isImperial?'lb':'kg')+')</label>' +
    '<input id="wt-inp" class="field" type="number" step="0.1" inputmode="decimal" ' +
    'placeholder="'+(isImperial ? Math.round(curKg*2.205) : curKg)+'" ' +
    'style="font-size:26px;font-weight:800;text-align:center">' +
    '</div>' +
    '<div class="mt-14">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--txt3);margin-bottom:8px">Measured</div>' +
    '<div  class="flex-gap-8">' +
    '<button type="button" id="wt-fasted" class="btn btn-primary btn-sm flex-1" style="display:flex;align-items:center;justify-content:center;gap:6px" onclick="setWeightFasted(true)">'+icon('sun', 14)+' Fasted</button>' +
    '<button type="button" id="wt-fed" class="btn btn-secondary btn-sm flex-1" style="display:flex;align-items:center;justify-content:center;gap:6px" onclick="setWeightFasted(false)">'+icon('apple', 14)+' After eating</button>' +
    '</div></div>' +
    '<div style="font-size:12px;color:var(--txt3);text-align:center;margin-top:12px;line-height:1.45">' +
    'Fasted morning weight is most consistent for tracking.<br>Goal: '+(isImperial ? Math.round(goalKg*2.205)+' lb' : goalKg+' kg') +
    '</div>',
    '<button type="button" class="btn btn-primary mt-12" onclick="saveWeight()">Save Weight</button>'
  );
  window._weightFasted = true;
};

window.setWeightFasted = function(fasted) {
  window._weightFasted = fasted;
  var f = document.getElementById('wt-fasted');
  var e = document.getElementById('wt-fed');
  if (f) { f.className = 'btn btn-' + (fasted ? 'primary' : 'secondary') + ' btn-sm'; f.style.flex = '1'; }
  if (e) { e.className = 'btn btn-' + (fasted ? 'secondary' : 'primary') + ' btn-sm'; e.style.flex = '1'; }
};

window.saveWeight = function() {
  var user = S.g('user') || {};
  var isImperial = user.units === 'imperial';
  var el = document.getElementById('wt-inp');
  var raw = parseFloat(el ? el.value : '');
  if (!raw) { toast('Enter a weight', 'warn'); return; }
  var kg = isImperial ? Math.round(raw / 2.205 * 10) / 10 : raw;
  var fasted = window._weightFasted !== false;
  var stats = S.g('bodyStats') || [];
  var prev = stats.length ? stats[stats.length - 1] : null;
  S.set('user.weight', kg);
  S.push('bodyStats', { date: today(), weight: kg, fasted: fasted });
  closeModal();
  /* Coach reaction — goal-aware, not just a receipt */
  var react = _weighInReaction(kg, prev, user);
  if (react) toast(react.msg, react.tone, 5500);
  else toast('Logged: ' + kg + 'kg', 'ok');
  /* Callable from dashboard/settings too — re-render whichever screen is open */
  go((typeof currentScreenId === 'function' && currentScreenId()) || 'bodymap');
};

/* What a decent coach would actually say after a weigh-in. */
function _weighInReaction(kg, prevEntry, user) {
  if (!prevEntry || !prevEntry.weight) {
    return { msg: 'Baseline set: ' + kg + 'kg. Weigh in weekly — trends beat single days.', tone: 'ok' };
  }
  var delta = Math.round((kg - prevEntry.weight) * 10) / 10;
  var goal = user.goal || 'hypertrophy';
  var wantsLoss = goal === 'fat_loss';
  var wantsGain = goal === 'hypertrophy' || goal === 'strength' || goal === 'athletic';
  var goalW = user.goalWeight;

  /* Crossed the goal line */
  if (goalW && prevEntry.weight !== kg) {
    var crossedDown = prevEntry.weight > goalW && kg <= goalW;
    var crossedUp = prevEntry.weight < goalW && kg >= goalW;
    if (crossedDown || crossedUp) {
      if (typeof celebrate === 'function') celebrate('🏁', 'Goal weight', kg + 'kg — you did the boring work. It paid.', 2600);
      return { msg: 'Goal weight hit: ' + kg + 'kg. Time to set the next target in Settings.', tone: 'pr' };
    }
  }

  if (Math.abs(delta) < 0.2) {
    if (wantsGain) return { msg: 'Scale\'s flat. Add ~200 kcal/day, keep protein high, give it a week.', tone: 'info' };
    if (wantsLoss) return { msg: 'Holding steady. If this repeats next week, trim ~200 kcal or add a walk.', tone: 'info' };
    return { msg: 'Steady at ' + kg + 'kg. That\'s maintenance done right.', tone: 'ok' };
  }
  if (delta < 0) {
    if (wantsLoss) return { msg: 'Down ' + Math.abs(delta) + 'kg. That\'s the pace that sticks — keep doing exactly this.', tone: 'pr' };
    if (wantsGain) return { msg: 'Down ' + Math.abs(delta) + 'kg while trying to build — eat more. Protein first, then carbs around training.', tone: 'warn' };
    return { msg: 'Down ' + Math.abs(delta) + 'kg.', tone: 'info' };
  }
  /* delta > 0 */
  if (wantsGain) return { msg: 'Up ' + delta + 'kg. Good gaining — if it\'s over ~0.5kg/week, ease the surplus so it stays muscle.', tone: 'pr' };
  if (wantsLoss) return { msg: 'Up ' + delta + 'kg. One weigh-in means nothing — but watch the weekend calories and check again in 3 days.', tone: 'warn' };
  return { msg: 'Up ' + delta + 'kg.', tone: 'info' };
}
