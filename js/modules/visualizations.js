'use strict';
/* ── PulseCap — Advanced Visualizations ── */

/* ══════════════════════════════════════════════════════
   MUSCLE RECOVERY HEATMAP
══════════════════════════════════════════════════════ */
function _muscleHeatmap() {
  const muscles = typeof MuscleEngine !== 'undefined' ? MuscleEngine.status() : [];
  if (!muscles.length) return '<div style="padding:20px;text-align:center;color:var(--txt3)">Log workouts to see muscle recovery heatmap</div>';

  const ORDER = ['chest','back','shoulders','biceps','triceps','core','quads','hamstrings','glutes','calves'];
  const muscleMap = {};
  muscles.forEach(m => { muscleMap[m.name.toLowerCase()] = m; });

  const keys = ORDER.filter(k => muscleMap[k]);
  muscles.forEach(m => { if (!keys.includes(m.name.toLowerCase())) keys.push(m.name.toLowerCase()); });

  const tiles = keys.map(key => {
    const m = muscleMap[key];
    const pct = Math.round(m ? m.pct : 100);
    const color = pct >= 90 ? '#30d158' : pct >= 70 ? '#f5c842' : pct >= 50 ? '#ff9f0a' : '#ff453a';
    const label = prettyMuscle(m ? m.name : key);
    return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:12px 10px;' +
      'display:flex;flex-direction:column;gap:8px">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px">' +
      '<span style="font-size:12px;font-weight:600;color:var(--txt2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(label) + '</span>' +
      '<span style="font-size:14px;font-weight:800;font-variant-numeric:tabular-nums;color:' + color + '">' + pct + '%</span>' +
      '</div>' +
      '<div style="height:6px;border-radius:3px;background:rgba(128,128,128,0.16);overflow:hidden">' +
      '<div style="width:' + pct + '%;height:100%;border-radius:3px;background:' + color + '"></div>' +
      '</div></div>';
  }).join('');

  const legend = '<div style="display:flex;gap:14px;justify-content:center;margin-top:14px;flex-wrap:wrap">' +
    [['#30d158','90-100% Ready'],['#f5c842','70-89% Recovering'],['#ff9f0a','50-69% Fatigued'],['#ff453a','< 50% Rest']].map(([c, l]) =>
      '<div style="display:flex;align-items:center;gap:6px"><div style="width:10px;height:10px;border-radius:50%;background:' + c + '"></div><div  class="muted-11">' + l + '</div></div>'
    ).join('') +
    '</div>';

  return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px">' +
    tiles + '</div>' + legend;
}

/* ══════════════════════════════════════════════════════
   FATIGUE MAP (7-day timeline per muscle)
══════════════════════════════════════════════════════ */
function _fatigueMap() {
  const ws = S.g('workouts') || [];
  const TRACKED_MUSCLES = ['Chest','Back','Shoulders','Biceps','Triceps','Quads','Hamstrings','Glutes','Calves','Core'];
  const MUSCLE_KEYWORDS = {
    Chest:      ['bench','fly','push-up','chest','dip','pec'],
    Back:       ['pull','row','lat','deadlift','back'],
    Shoulders:  ['press','lateral','delt','shoulder','face pull','upright'],
    Biceps:     ['curl','bicep'],
    Triceps:    ['tricep','pushdown','skull','close grip','overhead ext'],
    Quads:      ['squat','leg press','extension','hack','lunge'],
    Hamstrings: ['deadlift','leg curl','nordic','good morning','rdl'],
    Glutes:     ['hip thrust','glute','bridge','kickback'],
    Calves:     ['calf raise','calf'],
    Core:       ['plank','ab','crunch','core','dead bug','bird','rollout']
  };

  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = localISO(d);
    const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Yday' : d.toLocaleDateString('en', { weekday: 'short' });
    const dayWs = ws.filter(w => w.date === ds);
    const muscleLoad = {};
    TRACKED_MUSCLES.forEach(m => { muscleLoad[m] = 0; });
    dayWs.forEach(w => {
      (w.exercises || []).forEach(ex => {
        const name = (ex.name || '').toLowerCase();
        const doneSets = (ex.sets || []).filter(s => s.done).length;
        TRACKED_MUSCLES.forEach(muscle => {
          if ((MUSCLE_KEYWORDS[muscle] || []).some(kw => name.includes(kw))) {
            muscleLoad[muscle] += doneSets;
          }
        });
      });
    });
    last7.push({ ds, dayLabel, muscleLoad });
  }

  const headers = '<div style="display:grid;grid-template-columns:64px repeat(7,1fr);gap:3px;margin-bottom:4px">' +
    '<div></div>' +
    last7.map(d => '<div style="text-align:center;font-size:9px;color:var(--txt3);font-weight:600">' + esc(d.dayLabel) + '</div>').join('') +
    '</div>';

  const rows = TRACKED_MUSCLES.map(muscle => {
    const cells = last7.map(d => {
      const load = d.muscleLoad[muscle];
      const intensity = load === 0 ? 0 : Math.min(1, load / 8);
      const color = load === 0 ? 'rgba(255,255,255,0.04)' :
        intensity < 0.3 ? 'rgba(48,209,88,0.4)' :
        intensity < 0.6 ? 'rgba(245,200,66,0.6)' : 'rgba(255,69,58,0.8)';
      return '<div style="height:22px;border-radius:4px;background:' + color + ';display:flex;align-items:center;justify-content:center">' +
        (load > 0 ? '<span style="font-size:8px;font-weight:700;color:#fff">' + load + '</span>' : '') +
        '</div>';
    }).join('');
    return '<div style="display:grid;grid-template-columns:64px repeat(7,1fr);gap:3px;margin-bottom:3px">' +
      '<div style="font-size:9px;color:var(--txt2);display:flex;align-items:center;font-weight:600;padding-right:4px">' + muscle + '</div>' +
      cells +
      '</div>';
  }).join('');

  return headers + rows +
    '<div style="display:flex;gap:12px;margin-top:10px;flex-wrap:wrap">' +
    [['rgba(48,209,88,0.4)','Light'],['rgba(245,200,66,0.6)','Moderate'],['rgba(255,69,58,0.8)','Heavy'],['rgba(255,255,255,0.04)','Rest']].map(([c, l]) =>
      '<div style="display:flex;align-items:center;gap:5px"><div style="width:12px;height:12px;border-radius:2px;background:' + c + '"></div><span  class="muted-10">' + l + '</span></div>'
    ).join('') +
    '</div>';
}

/* ══════════════════════════════════════════════════════
   PROGRESSION RADAR CHART (per muscle group)
══════════════════════════════════════════════════════ */
function _progressionRadar() {
  const muscles = typeof MuscleEngine !== 'undefined' ? MuscleEngine.status() : [];
  if (muscles.length < 3) return '<div style="padding:20px;text-align:center;color:var(--txt3)">Log more workouts to see progression radar</div>';

  const n = Math.min(muscles.length, 8);
  const display = muscles.slice(0, n);
  const cx = 110, cy = 110, maxR = 80;
  const angleStep = (2 * Math.PI) / n;
  const getXY = (i, r) => ({
    x: cx + r * Math.sin(i * angleStep),
    y: cy - r * Math.cos(i * angleStep)
  });

  const grid = [25, 50, 75, 100].map(v => {
    const r = (v / 100) * maxR;
    const pts = display.map((_, i) => { const p = getXY(i, r); return p.x + ',' + p.y; }).join(' ');
    return '<polygon points="' + pts + '" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>';
  }).join('');

  const scorePts = display.map((m, i) => { const p = getXY(i, (m.pct / 100) * maxR); return p.x + ',' + p.y; }).join(' ');
  const scorePolygon = '<polygon points="' + scorePts + '" fill="rgba(0,200,255,0.15)" stroke="var(--c1)" stroke-width="2"/>';

  const labels = display.map((m, i) => {
    const p = getXY(i, maxR + 16);
    const color = m.pct >= 90 ? '#30d158' : m.pct >= 70 ? '#f5c842' : '#ff9f0a';
    return '<text x="' + p.x + '" y="' + p.y + '" text-anchor="middle" font-size="9" font-weight="700" fill="' + color + '" dominant-baseline="middle">' + esc(m.name) + '</text>';
  }).join('');

  const dots = display.map((m, i) => {
    const p = getXY(i, (m.pct / 100) * maxR);
    const color = m.pct >= 90 ? '#30d158' : m.pct >= 70 ? '#f5c842' : '#ff9f0a';
    return '<circle cx="' + p.x + '" cy="' + p.y + '" r="4" fill="' + color + '"/>';
  }).join('');

  return '<svg width="220" height="220" viewBox="0 0 220 220" style="display:block;margin:0 auto">' +
    grid + scorePolygon + labels + dots +
    '</svg>';
}

/* ══════════════════════════════════════════════════════
   WEAKNESS MAP
══════════════════════════════════════════════════════ */
function _weaknessMap() {
  const muscles = typeof MuscleEngine !== 'undefined' ? MuscleEngine.status() : [];
  const volRecs = typeof VolumeAllocationEngine !== 'undefined' ? VolumeAllocationEngine.recommendations() : [];

  const weak = muscles.filter(m => m.pct < 70).sort((a, b) => a.pct - b.pct);
  const undertrained = volRecs.filter(r => r.status === 'undertrained' || r.status === 'neglected');

  if (!weak.length && !undertrained.length) {
    return '<div style="padding:16px;display:flex;align-items:center;justify-content:center;gap:8px;color:#30d158;font-weight:700">' + icon('check', 18, '#30d158') + 'No significant weaknesses detected</div>';
  }

  let html = '';

  if (weak.length) {
    html += '<div  class="mb-12"><div style="font-size:11px;font-weight:700;color:#ff453a;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px">Fatigued / Recovering</div>' +
      weak.map(m => '<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--border)">' +
        '<div style="font-size:13px;font-weight:600;color:var(--txt);flex:1">' + esc(m.name) + '</div>' +
        '<div style="width:80px;height:6px;background:rgba(255,255,255,0.06);border-radius:3px"><div style="width:' + m.pct + '%;height:6px;border-radius:3px;background:' + (m.pct < 50 ? '#ff453a' : '#ff9f0a') + '"></div></div>' +
        '<div style="font-size:12px;font-weight:700;color:' + (m.pct < 50 ? '#ff453a' : '#ff9f0a') + ';width:36px;text-align:right">' + Math.round(m.pct) + '%</div>' +
        '</div>').join('') + '</div>';
  }

  if (undertrained.length) {
    html += '<div><div style="font-size:11px;font-weight:700;color:#ff9f0a;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px">Undertrained This Month</div>' +
      undertrained.map(r => '<div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--border)">' +
        '<div  class="flex-1"><div  class="row-title">' + esc(r.muscle) + '</div>' +
        '<div style="font-size:11px;color:' + r.color + '">' + esc(r.action) + '</div></div>' +
        '<div style="font-size:12px;font-weight:700;color:' + r.color + '">' + r.current + ' sets/wk</div>' +
        '</div>').join('') + '</div>';
  }

  return html;
}

/* ══════════════════════════════════════════════════════
   VISUALIZATIONS SCREEN
══════════════════════════════════════════════════════ */
reg('visualizations', function() {
  return moduleBackTopbar('Analytics & Visualizations') +

    '<div  class="card-block">' +
    '<div class="viz-head"><span class="viz-ic">' + icon('heart', 18) + '</span>Muscle Recovery Heatmap</div>' +
    _muscleHeatmap() +
    '</div>' +

    '<div  class="card-block">' +
    '<div class="viz-head"><span class="viz-ic">' + icon('target', 18) + '</span>Muscle Readiness Radar</div>' +
    _progressionRadar() +
    '</div>' +

    '<div  class="card-block">' +
    '<div class="viz-head"><span class="viz-ic">' + icon('calendar', 18) + '</span>7-Day Training Heatmap</div>' +
    _fatigueMap() +
    '</div>' +

    '<div  class="card-block">' +
    '<div class="viz-head"><span class="viz-ic">' + icon('alert', 18) + '</span>Weakness Map</div>' +
    _weaknessMap() +
    '</div>' +

    '<div  class="spacer-bottom"></div>';
});
