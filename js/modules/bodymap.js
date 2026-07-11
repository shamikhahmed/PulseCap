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

  return '<div class="topbar">' +
    '<div><div class="topbar-title">Body</div>' +
    '<div class="topbar-date">Map · recovery · measurements</div></div>' +
    '</div>' +

    '<div style="padding:12px 16px 8px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px">' +
    '<button type="button" onclick="go(\'recovery\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:10px 4px;font-size:11px;font-weight:700;color:var(--txt2);cursor:pointer;touch-action:manipulation">💚 Recover</button>' +
    '<button type="button" onclick="go(\'nutrition\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:10px 4px;font-size:11px;font-weight:700;color:var(--txt2);cursor:pointer;touch-action:manipulation">🍎 Fuel</button>' +
    '<button type="button" onclick="go(\'physique\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:10px 4px;font-size:11px;font-weight:700;color:var(--txt2);cursor:pointer;touch-action:manipulation">📐 Physique</button>' +
    '<button type="button" onclick="go(\'rehab\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:10px 4px;font-size:11px;font-weight:700;color:var(--txt2);cursor:pointer;touch-action:manipulation">🩹 Rehab</button>' +
    '</div>' +
    '<div style="padding:0 16px 14px;display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
    '<button type="button" onclick="go(\'body-intelligence\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:10px 8px;font-size:11px;font-weight:700;color:var(--txt2);cursor:pointer;touch-action:manipulation;text-align:left">🧬 Body Intel</button>' +
    '<button type="button" onclick="go(\'injury-risk\')" class="press" style="background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:10px 8px;font-size:11px;font-weight:700;color:var(--txt2);cursor:pointer;touch-action:manipulation;text-align:left">⚠️ Injury Risk</button>' +
    '</div>' +

    _bodyMapSection(muscleColors) +
    _muscleStatusGrid(muscleStatus) +
    _measurementsSection(latestMeas, prevMeas, user) +
    _bodyStatsSection(user) +
    '<div style="height:20px"></div>';
});

/* ════════════════════════════════════
   BODY MAP SVG — FIXED FRONT + BACK
════════════════════════════════════ */
function _bodyMapSection(colors) {
  var c = function(key) { return colors[key.toLowerCase()] || 'rgba(255,255,255,0.06)'; };

  var frontSVG = '<svg viewBox="0 0 200 420" width="160" height="336" xmlns="http://www.w3.org/2000/svg">' +
    '<!-- Head -->' +
    '<ellipse cx="100" cy="32" rx="22" ry="26" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>' +
    '<!-- Neck -->' +
    '<rect x="90" y="56" width="20" height="16" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>' +
    '<!-- Traps -->' +
    '<path d="M68 70 Q100 65 132 70 L136 88 Q100 85 64 88 Z" fill="'+c('Back')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Traps\')" style="cursor:pointer"/>' +
    '<!-- Chest left -->' +
    '<path d="M72 88 L100 90 L100 118 Q80 120 68 112 Z" fill="'+c('Chest')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Chest\')" style="cursor:pointer"/>' +
    '<!-- Chest right -->' +
    '<path d="M128 88 L100 90 L100 118 Q120 120 132 112 Z" fill="'+c('Chest')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Chest\')" style="cursor:pointer"/>' +
    '<!-- Front delt left -->' +
    '<ellipse cx="58" cy="96" rx="12" ry="16" fill="'+c('Shoulders')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Shoulders\')" style="cursor:pointer"/>' +
    '<!-- Front delt right -->' +
    '<ellipse cx="142" cy="96" rx="12" ry="16" fill="'+c('Shoulders')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Shoulders\')" style="cursor:pointer"/>' +
    '<!-- Bicep left -->' +
    '<path d="M46 112 Q38 128 40 148 L54 148 Q56 128 62 112 Z" fill="'+c('Biceps')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Biceps\')" style="cursor:pointer"/>' +
    '<!-- Bicep right -->' +
    '<path d="M154 112 Q162 128 160 148 L146 148 Q144 128 138 112 Z" fill="'+c('Biceps')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Biceps\')" style="cursor:pointer"/>' +
    '<!-- Forearm left -->' +
    '<path d="M40 148 Q36 168 40 184 L52 184 Q56 168 54 148 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>' +
    '<!-- Forearm right -->' +
    '<path d="M160 148 Q164 168 160 184 L148 184 Q144 168 146 148 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>' +
    '<!-- Abs top -->' +
    '<path d="M80 118 L100 120 L120 118 L118 142 L100 144 L82 142 Z" fill="'+c('Core')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Core\')" style="cursor:pointer"/>' +
    '<!-- Abs bottom -->' +
    '<path d="M82 142 L100 144 L118 142 L116 165 L100 167 L84 165 Z" fill="'+c('Core')+'" stroke="rgba(255,255,255,0.08)" stroke-width="1" onclick="showMuscleInfo(\'Core\')" style="cursor:pointer"/>' +
    '<!-- Oblique left -->' +
    '<path d="M80 118 L82 165 L68 160 L66 120 Z" fill="'+c('Core')+'" stroke="rgba(255,255,255,0.08)" stroke-width="1" onclick="showMuscleInfo(\'Core\')" style="cursor:pointer"/>' +
    '<!-- Oblique right -->' +
    '<path d="M120 118 L118 165 L132 160 L134 120 Z" fill="'+c('Core')+'" stroke="rgba(255,255,255,0.08)" stroke-width="1" onclick="showMuscleInfo(\'Core\')" style="cursor:pointer"/>' +
    '<!-- Quad left -->' +
    '<path d="M78 170 L100 172 L100 248 L76 246 Z" fill="'+c('Quads')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Quads\')" style="cursor:pointer"/>' +
    '<!-- Quad right -->' +
    '<path d="M100 172 L122 170 L124 246 L100 248 Z" fill="'+c('Quads')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Quads\')" style="cursor:pointer"/>' +
    '<!-- Knee area -->' +
    '<ellipse cx="88" cy="256" rx="10" ry="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
    '<ellipse cx="112" cy="256" rx="10" ry="8" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>' +
    '<!-- Calves left -->' +
    '<path d="M76 265 Q72 288 76 315 L90 315 Q94 288 98 265 Z" fill="'+c('Calves')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Calves\')" style="cursor:pointer"/>' +
    '<!-- Calves right -->' +
    '<path d="M102 265 Q106 288 110 315 L124 315 Q128 288 124 265 Z" fill="'+c('Calves')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Calves\')" style="cursor:pointer"/>' +
    '</svg>';

  var backSVG = '<svg viewBox="0 0 200 420" width="160" height="336" xmlns="http://www.w3.org/2000/svg">' +
    '<!-- Head -->' +
    '<ellipse cx="100" cy="32" rx="22" ry="26" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" stroke-width="1.5"/>' +
    '<!-- Neck -->' +
    '<rect x="90" y="56" width="20" height="16" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>' +
    '<!-- Traps -->' +
    '<path d="M68 70 Q100 64 132 70 L136 90 Q100 86 64 90 Z" fill="'+c('Back')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Traps\')" style="cursor:pointer"/>' +
    '<!-- Rear delt left -->' +
    '<ellipse cx="57" cy="96" rx="12" ry="16" fill="'+c('Shoulders')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Shoulders\')" style="cursor:pointer"/>' +
    '<!-- Rear delt right -->' +
    '<ellipse cx="143" cy="96" rx="12" ry="16" fill="'+c('Shoulders')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Shoulders\')" style="cursor:pointer"/>' +
    '<!-- Upper back / rhomboids -->' +
    '<path d="M70 88 L100 90 L130 88 L128 118 L100 120 L72 118 Z" fill="'+c('Back')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Back\')" style="cursor:pointer"/>' +
    '<!-- Lats left -->' +
    '<path d="M64 108 L78 108 L76 165 L60 160 Z" fill="'+c('Back')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Back\')" style="cursor:pointer"/>' +
    '<!-- Lats right -->' +
    '<path d="M122 108 L136 108 L140 160 L124 165 Z" fill="'+c('Back')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Back\')" style="cursor:pointer"/>' +
    '<!-- Tricep left -->' +
    '<path d="M46 112 Q38 130 40 150 L54 150 Q56 130 62 112 Z" fill="'+c('Triceps')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Triceps\')" style="cursor:pointer"/>' +
    '<!-- Tricep right -->' +
    '<path d="M154 112 Q162 130 160 150 L146 150 Q144 130 138 112 Z" fill="'+c('Triceps')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Triceps\')" style="cursor:pointer"/>' +
    '<!-- Lower back -->' +
    '<path d="M80 120 L120 120 L118 162 L100 165 L82 162 Z" fill="'+c('Back')+'" stroke="rgba(255,255,255,0.08)" stroke-width="1" onclick="showMuscleInfo(\'Back\')" style="cursor:pointer"/>' +
    '<!-- Glutes left -->' +
    '<path d="M78 165 L100 167 L100 210 L76 208 Z" fill="'+c('Glutes')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Glutes\')" style="cursor:pointer"/>' +
    '<!-- Glutes right -->' +
    '<path d="M100 167 L122 165 L124 208 L100 210 Z" fill="'+c('Glutes')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Glutes\')" style="cursor:pointer"/>' +
    '<!-- Hamstring left -->' +
    '<path d="M76 210 L100 212 L100 248 L76 246 Z" fill="'+c('Hamstrings')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Hamstrings\')" style="cursor:pointer"/>' +
    '<!-- Hamstring right -->' +
    '<path d="M100 212 L124 210 L124 246 L100 248 Z" fill="'+c('Hamstrings')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Hamstrings\')" style="cursor:pointer"/>' +
    '<!-- Calves left -->' +
    '<path d="M76 265 Q72 288 76 315 L90 315 Q94 288 98 265 Z" fill="'+c('Calves')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Calves\')" style="cursor:pointer"/>' +
    '<!-- Calves right -->' +
    '<path d="M102 265 Q106 288 110 315 L124 315 Q128 288 124 265 Z" fill="'+c('Calves')+'" stroke="rgba(255,255,255,0.1)" stroke-width="1" onclick="showMuscleInfo(\'Calves\')" style="cursor:pointer"/>' +
    '</svg>';

  var isBack = _bodyView === 'back';

  return '<div style="padding:14px 16px 0">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3)">Body Map</div>' +
    '<div style="display:flex;gap:6px">' +
    '<button type="button" onclick="_bodyView=\'front\';go(\'bodymap\')" style="padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid '+(!isBack?'var(--c1)':'var(--border)')+';background:'+(!isBack?'var(--c1)':'transparent')+';color:'+(!isBack?'#fff':'var(--txt3)')+'">Front</button>' +
    '<button type="button" onclick="_bodyView=\'back\';go(\'bodymap\')" style="padding:6px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid '+(isBack?'var(--c1)':'var(--border)')+';background:'+(isBack?'var(--c1)':'transparent')+';color:'+(isBack?'#fff':'var(--txt3)')+'">Back</button>' +
    '</div></div></div>' +
    '<div style="background:var(--bg3);border-radius:20px;margin:0 16px 14px;padding:16px;border:1px solid var(--border)">' +
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">' +
    '<div style="font-size:12px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:0.08em">' +
    (isBack ? 'Posterior (Back)' : 'Anterior (Front)') + '</div>' +
    '<div style="display:flex;gap:6px;align-items:center">' +
    '<div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:#30d158"></div><div style="font-size:10px;color:var(--txt3)">Ready</div></div>' +
    '<div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:#ff9f0a"></div><div style="font-size:10px;color:var(--txt3)">Recovering</div></div>' +
    '<div style="display:flex;align-items:center;gap:4px"><div style="width:10px;height:10px;border-radius:50%;background:#ff453a"></div><div style="font-size:10px;color:var(--txt3)">Sore</div></div>' +
    '</div></div>' +
    '<div style="display:flex;justify-content:center">' +
    (isBack ? backSVG : frontSVG) +
    '</div>' +
    '<div style="font-size:12px;color:var(--txt3);text-align:center;margin-top:10px">Tap any muscle to see recovery status</div>' +
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
    '<div style="font-size:48px;margin-bottom:10px">💪</div>' +
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
    '<button type="button" class="btn btn-secondary" onclick="closeModal()" style="margin-top:14px">Close</button>'
  );
};

/* ════════════════════════════════════
   MUSCLE STATUS GRID
════════════════════════════════════ */
function _muscleStatusGrid(muscleStatus) {
  var chips = muscleStatus.map(function(m) {
    return '<div onclick="showMuscleInfo(\''+esc(m.name)+'\')" ' +
      'style="background:var(--bg4);border-radius:12px;padding:10px;text-align:center;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);transition:transform 0.12s" ' +
      'onmousedown="this.style.transform=\'scale(0.95)\'" onmouseup="this.style.transform=\'scale(1)\'">' +
      '<div style="font-size:18px;font-weight:800;color:'+m.color+'">'+m.pct+'%</div>' +
      '<div style="font-size:10px;color:var(--txt3);margin-top:3px;font-weight:600">'+esc(m.name)+'</div>' +
      '<div style="margin-top:4px;height:3px;background:var(--bg3);border-radius:2px;overflow:hidden">' +
      '<div style="width:'+m.pct+'%;height:100%;background:'+m.color+';transition:width 0.6s ease"></div>' +
      '</div></div>';
  }).join('');

  return sh('Muscle Recovery') +
    '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:0 16px 14px">' +
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
    if (d === 0) return '<span style="color:var(--txt3)"> (=)</span>';
    var col = d > 0 ? '#ff9f0a' : '#30d158';
    return '<span style="color:'+col+'"> ('+(d>0?'+':'')+d+(isImperial?'"':'cm')+')</span>';
  }

  var fields = [
    { key:'neck',       label:'Neck',         icon:'🦒' },
    { key:'shoulders',  label:'Shoulders',    icon:'💪' },
    { key:'chest',      label:'Chest',        icon:'🫀' },
    { key:'leftBicep',  label:'L Bicep',      icon:'💪' },
    { key:'rightBicep', label:'R Bicep',      icon:'💪' },
    { key:'waist',      label:'Waist',        icon:'📏' },
    { key:'hips',       label:'Hips',         icon:'🍑' },
    { key:'leftThigh',  label:'L Thigh',      icon:'🦵' },
    { key:'rightThigh', label:'R Thigh',      icon:'🦵' },
    { key:'leftCalf',   label:'L Calf',       icon:'🦶' },
    { key:'rightCalf',  label:'R Calf',       icon:'🦶' }
  ];

  var rows = fields.map(function(f) {
    var val = latest ? latest[f.key] : null;
    var pval = prev ? prev[f.key] : null;
    return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border)">' +
      '<div style="display:flex;align-items:center;gap:10px">' +
      '<span style="font-size:16px;width:24px;text-align:center">'+f.icon+'</span>' +
      '<div style="font-size:14px;font-weight:600;color:var(--txt)">'+esc(f.label)+'</div>' +
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
    '<div class="card card-solid" style="margin:0 16px 14px">' +
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
    '<button type="button" class="btn btn-primary" onclick="saveMeasurements()" style="margin-top:14px">Save Measurements</button>'
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
  toast('Measurements saved! 📏', 'ok');
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
    '<div class="card card-solid" style="margin:0 16px 14px">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">' +
    _bStat('⚖️','Weight',weightDisplay+(changeStr||''),'Current') +
    _bStat('📏','Height',heightDisplay,'') +
    _bStat('🧮','BMI','<span style="color:'+bmiColor+'">'+bmiData.bmi+'</span>',bmiData.cat) +
    _bStat('🔥','BMR',bmr+' kcal','At rest') +
    _bStat('⚡','TDEE',tdee+' kcal','Daily need') +
    _bStat('🎯','Healthy',healthyRange.min+'–'+healthyRange.max+'kg','Range') +
    '</div>' +
    '<div style="border-top:1px solid var(--border);padding-top:12px">' +
    '<div style="font-size:11px;color:var(--txt3);font-weight:700;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Height Display</div>' +
    '<div style="display:flex;gap:6px">' + heightBtns + '</div>' +
    '</div></div>';
}

function _bStat(icon, label, val, sub) {
  return '<div style="background:var(--bg4);border-radius:12px;padding:12px">' +
    '<div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">'+icon+' '+esc(label)+'</div>' +
    '<div style="font-size:16px;font-weight:800;color:var(--txt)">'+val+'</div>' +
    (sub ? '<div style="font-size:11px;color:var(--txt3);margin-top:2px">'+esc(sub)+'</div>' : '') +
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
    '<div style="margin-top:14px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--txt3);margin-bottom:8px">Measured</div>' +
    '<div style="display:flex;gap:8px">' +
    '<button type="button" id="wt-fasted" class="btn btn-primary btn-sm" style="flex:1" onclick="setWeightFasted(true)">🌅 Fasted</button>' +
    '<button type="button" id="wt-fed" class="btn btn-secondary btn-sm" style="flex:1" onclick="setWeightFasted(false)">🍽 After eating</button>' +
    '</div></div>' +
    '<div style="font-size:12px;color:var(--txt3);text-align:center;margin-top:12px;line-height:1.45">' +
    'Fasted morning weight is most consistent for tracking.<br>Goal: '+(isImperial ? Math.round(goalKg*2.205)+' lb' : goalKg+' kg') +
    '</div>',
    '<button type="button" class="btn btn-primary" onclick="saveWeight()" style="margin-top:12px">Save Weight</button>'
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
  S.set('user.weight', kg);
  S.push('bodyStats', { date: today(), weight: kg, fasted: fasted });
  closeModal();
  toast('Weight logged: '+kg+'kg'+(fasted?' (fasted)':' (fed)'), 'ok');
  go('bodymap');
};
