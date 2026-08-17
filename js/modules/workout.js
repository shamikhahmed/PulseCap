'use strict';
/* ── PulseCap v4 — Workout Logger + Exercise Database ── */

/* ── Guidance System ── */
const GUIDANCE = {
  setsReps(goal, exp) {
    const map = {
      hypertrophy: { sets:'3-4', reps:'8-12', rest:'60-90s', tempo:'2-0-1-0', note:'Last 2 reps should be hard' },
      fat_loss:    { sets:'3-4', reps:'12-15', rest:'45-60s', tempo:'2-0-1-0', note:'Keep rest short, heart rate up' },
      strength:    { sets:'4-5', reps:'3-6',   rest:'2-4min', tempo:'1-0-X-0', note:'Focus on moving weight fast' },
      recomp:      { sets:'3',   reps:'10-12', rest:'60-75s', tempo:'2-1-1-0', note:'Controlled throughout' },
      athletic:    { sets:'3-4', reps:'6-10',  rest:'90-120s',tempo:'1-0-X-0', note:'Explosive concentric' },
      maintenance: { sets:'3',   reps:'10-12', rest:'60s',    tempo:'2-0-1-0', note:'Consistent effort' }
    };
    const base = map[goal] || map.hypertrophy;
    const e = exp || ((typeof S !== 'undefined' && S.g) ? (S.g('user') || {}).exp : '') || 'intermediate';
    if (e === 'beginner') {
      return Object.assign({}, base, { reps: '10-15', rest: '75-90s', note: 'Leave 2–3 reps in reserve. Bigger jumps are OK.' });
    }
    if (e === 'advanced' || e === 'athlete') {
      return Object.assign({}, base, { reps: '6-10', note: 'Small jumps. Stay around RPE 8.' });
    }
    return base;
  },
  techniques(goal) {
    const t = {
      hypertrophy: ['Drop sets on last set','Rest-pause technique','Mechanical drop sets','2-3 forced reps with spotter'],
      fat_loss:    ['Giant sets (4 exercises back to back)','Supersets with opposing muscles','AMRAP last set','No rest between supersets'],
      strength:    ['Cluster sets (2-2-2 with 20s pause)','Heavy singles at 90-95%','Pause reps at bottom','Speed work at 60% 1RM'],
      recomp:      ['Supersets','Time under tension sets (3s eccentric)','Slow eccentrics','Mind-muscle connection focus'],
      athletic:    ['Contrast training (heavy + explosive)','Plyometric supersets','Velocity-based training'],
      maintenance: ['Straight sets','Occasional drop sets','Deload every 6th week']
    };
    return t[goal] || t.hypertrophy;
  },
  supersets: {
    chest:     ['Back — Barbell Row', 'Triceps — Tricep Pushdown'],
    back:      ['Chest — Push-Ups', 'Biceps — Barbell Curl'],
    shoulders: ['Core — Plank', 'Triceps — Overhead Tricep Extension'],
    biceps:    ['Triceps — Tricep Pushdown', 'Back — Lat Pulldown'],
    triceps:   ['Biceps — Barbell Curl', 'Chest — Cable Fly'],
    quads:     ['Hamstrings — Leg Curl', 'Glutes — Hip Thrust'],
    hamstrings:['Quads — Leg Extension', 'Glutes — Cable Glute Kickback'],
    glutes:    ['Quads — Back Squat', 'Hamstrings — Romanian Deadlift'],
    core:      ['Shoulders — Overhead Press', 'Back — Deadlift'],
    calves:    ['Quads — Leg Press', 'Hamstrings — Romanian Deadlift']
  },
  warmupSets(workingWeight) {
    const w = parseFloat(workingWeight) || 60;
    return [
      { pct:40, w:Math.round(w*0.4/2.5)*2.5, reps:10, label:'Activation' },
      { pct:60, w:Math.round(w*0.6/2.5)*2.5, reps:6,  label:'Warm-Up' },
      { pct:80, w:Math.round(w*0.8/2.5)*2.5, reps:3,  label:'Feeler' }
    ];
  },
  needsSpotter(exerciseName) {
    const spotted = ['Barbell Bench Press','Incline Barbell Bench Press','Decline Barbell Bench Press',
      'Back Squat','Front Squat','Close-Grip Bench Press','Skull Crushers','JM Press'];
    return spotted.includes(exerciseName);
  },
  diffLabel(diff) {
    return diff >= 3 ? { l:'Advanced', c:'var(--danger)' } :
           diff === 2 ? { l:'Intermediate', c:'var(--warn)' } :
                        { l:'Beginner', c:'var(--success)' };
  }
};
window.GUIDANCE = GUIDANCE;

/* ── Exercise Database ── */
const ExDB = {
  db: (typeof EXERCISE_DB !== "undefined" ? EXERCISE_DB : []),
  /* Split plans use a few shorthand names — resolve them to real DB entries
     so cues, joint stress, injury filtering and media always work. */
  ALIASES: {
    'Cable Row': 'Seated Cable Row',
    'Calf Raise': 'Standing Calf Raise',
    'Close-Grip Bench': 'Close-Grip Bench Press',
    'Core Work': 'Plank',
    'Dumbbell Press': 'Dumbbell Bench Press',
    'Flat Barbell Bench Press': 'Barbell Bench Press',
    'Incline Dumbbell Fly': 'Dumbbell Fly',
    'Incline Walk 30min': 'Treadmill Incline Walk',
    'Jump Rope': 'Skip / Jump Rope',
    'Pike Push-Ups': 'Push-Ups',
    'Plank 60s': 'Plank',
    'Pull-Up': 'Pull-Ups',
    'Rowing Machine 20min': 'Rowing Machine',
    'Russian Twists': 'Russian Twist',
    'Steady Bike 25min': 'Stationary Bike',
    'Weighted Pull-Up': 'Pull-Ups',
    'Smith Incline Press': 'Incline Barbell Bench Press',
    'Smith Flat Press': 'Barbell Bench Press',
    'Incline Machine Chest Press': 'Machine Chest Press',
    'Machine Shoulder Press': 'Shoulder Press Machine',
    'Lateral Raise Machine': 'Dumbbell Lateral Raise',
    'Overhead Tricep Extension Machine': 'Overhead Tricep Extension — Cable',
    'Dumbbell Wrist Curl': 'Wrist Curl',
    'Ab Crunch Machine': 'Cable Crunch',
    'Close-Grip Lat Pulldown': 'Lat Pulldown',
    'Seated Row Wide Grip': 'Seated Cable Row',
    'Seated Row Close Grip': 'Seated Cable Row',
    'Back Extension Machine': 'Back Extension',
    'Bicep Curl Machine': 'EZ Bar Curl',
    'Seated Leg Curl': 'Leg Curl',
    'Glute Kickback Machine': 'Hip Thrust',
    'Leg Raise Machine': 'Hanging Leg Raise',
    'Cable Chest Press': 'Cable Fly',
    'Dumbbell Floor Press': 'Dumbbell Bench Press',
    'Dumbbell Kickback': 'Tricep Kickback',
    'Rope Pushdown': 'Tricep Pushdown',
    'Dumbbell Reverse Wrist Curl': 'Wrist Curl',
    'Chest-Supported Row': 'Seated Cable Row',
    'Single-Arm Cable Row': 'Seated Cable Row',
    'Rear Delt Fly Machine': 'Rear Delt Fly',
    'Cable Hammer Curl': 'Hammer Curl',
    'Hanging Knee Raise': 'Hanging Leg Raise',
    'Lying Leg Curl': 'Leg Curl',
    'Hip Abductor Machine': 'Cable Hip Abduction',
    'Band Pull-Aparts': 'Face Pulls',
    'Cable External Rotation': 'Face Pulls',
    'Low-to-High Cable Press': 'Cable Fly',
    'Cable Crossover': 'Cable Fly',
    'Cable Front Raise': 'Front Delt Raise',
    'Cable Wrist Curl': 'Wrist Curl',
    'Assisted Pull-Up': 'Pull-Ups',
    'Preacher Curl': 'EZ Bar Curl',
    'Cable Glute Kickback': 'Hip Thrust',
    'Bodyweight Calf Raise': 'Standing Calf Raise',
    'Skip Machine Shoulder Press': 'Face Pulls',
    'Skip Hip Abductor': 'Hip Thrust',
    'Hand Gripper': 'Wrist Curl',
    'Bodyweight Back Extension': 'Back Extension',
    'Single-Leg Cable Curl': 'Leg Curl'
  },
  _index: null,
  _byId: null,
  invalidateIndex() { this._index = null; this._byId = null; },
  slug(name) {
    return (typeof exerciseSlug === 'function') ? exerciseSlug(name) : String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  },
  _ensureIndex() {
    if (this._index) return;
    const map = Object.create(null);
    const byId = Object.create(null);
    for (let i = 0; i < this.db.length; i++) {
      const row = this.db[i];
      if (!row) continue;
      if (row.n && !map[row.n]) map[row.n] = row;
      if (!row.id) row.id = this.slug(row.n);
      if (row.id && !byId[row.id]) byId[row.id] = row;
    }
    this._index = map;
    this._byId = byId;
  },
  byName(name) {
    this._ensureIndex();
    if (this._index[name]) return this._index[name];
    const alias = this.ALIASES[name];
    return alias ? (this._index[alias] || null) : null;
  },
  byId(id) {
    this._ensureIndex();
    return (id && this._byId[id]) || null;
  },
  idFor(name) {
    const row = this.byName(name);
    return (row && row.id) || this.slug(name);
  },
  sameLift(logged, name) {
    if (!logged) return false;
    if (logged.name === name) return true;
    const id = this.idFor(name);
    return !!(logged.exId && id && logged.exId === id);
  },
  stamp(logged) {
    if (!logged) return logged;
    if (!logged.exId) logged.exId = this.idFor(logged.name);
    return logged;
  },
  byGroup(grp) { return this.db.filter(e => e.grp === grp); },
  search(q) { const s = q.toLowerCase(); return this.db.filter(e => e.n.toLowerCase().includes(s) || (e.pri||'').toLowerCase().includes(s)); }
};
window.ExDB = ExDB;

/* ── Cardio Protocols ── */
const CARDIO_PROTOCOLS = {
  hiit: {
    name: 'HIIT',
    full: 'High-Intensity Interval Training',
    icon: 'sparkles',
    color: 'var(--danger)',
    tagline: 'Maximum burn in minimum time',
    duration: '20–30 min total',
    difficulty: 3,
    goal: ['fat_loss','athletic','recomp'],
    science: 'HIIT triggers EPOC (Excess Post-exercise Oxygen Consumption), elevating metabolism 6–24h post-session. Preserves muscle mass better than LISS when combined with resistance training.',
    protocols: [
      {
        name: 'Classic 20/10 Tabata',
        rounds: 8,
        work: 20,
        rest: 10,
        sets: 4,
        totalTime: '16 min',
        exercises: ['Jump Squats','Push-Ups','Burpees','Mountain Climbers'],
        intensity: '90–100% max HR',
        equipment: 'None — bodyweight',
        notes: 'Developed by Dr. Izumi Tabata. 8 rounds × 20s on / 10s off per exercise. 2 min rest between exercises.'
      },
      {
        name: '30/30 Intervals',
        rounds: 10,
        work: 30,
        rest: 30,
        sets: 1,
        totalTime: '20 min',
        exercises: ['Sprint or Assault Bike','Active rest (walk)'],
        intensity: '85–95% max HR',
        equipment: 'Treadmill, Assault Bike, or open space',
        notes: 'Sprint hard for 30s, active recovery for 30s. 10 rounds. Warm up 5 min, cool down 5 min.'
      },
      {
        name: '1:2 Work-Rest Pyramid',
        rounds: 6,
        work: 40,
        rest: 80,
        sets: 1,
        totalTime: '25 min',
        exercises: ['Rowing Machine','Rest'],
        intensity: '80–90% max HR',
        equipment: 'Rower or Bike',
        notes: 'Pyramid: 20s/40s → 30s/60s → 40s/80s → 40s/80s → 30s/60s → 20s/40s. Great for beginners.'
      }
    ],
    warmup: ['5 min easy jog or bike','Dynamic leg swings × 15','Arm circles × 10','High knees × 20'],
    cooldown: ['5 min walk','Quad stretch 30s each','Hip flexor stretch 30s each','Deep breathing 2 min'],
    warnings: ['Not suitable on consecutive days','Skip if readiness < 50','Stop if chest pain occurs','Beginners: start with 4 rounds, not 8']
  },

  liss: {
    name: 'LISS',
    full: 'Low-Intensity Steady-State',
    icon: 'walk',
    color: 'var(--success)',
    tagline: 'Fat burning without muscle loss',
    duration: '30–60 min',
    difficulty: 1,
    goal: ['fat_loss','maintenance','recomp'],
    science: 'LISS primarily burns fat as fuel (65–75% fat oxidation at low intensity). Minimal cortisol response means muscle mass is preserved. Ideal on rest days or after weight training.',
    protocols: [
      {
        name: 'Incline Treadmill Walk',
        work: 45,
        totalTime: '45 min',
        exercises: ['Treadmill walk — 5–6 km/h, 10–15% incline'],
        intensity: '60–70% max HR',
        equipment: 'Treadmill',
        notes: 'The "Norwegian Method." Do NOT hold handrails — forces the glutes to work. Burns ~400–500 kcal/session.'
      },
      {
        name: 'Outdoor Fasted Walk',
        work: 45,
        totalTime: '45 min',
        exercises: ['Brisk outdoor walk — 5–6 km/h','Optional: weighted vest 5–10kg'],
        intensity: '55–65% max HR',
        equipment: 'None / weighted vest optional',
        notes: 'Best done fasted in the morning. Natural light also regulates cortisol. Low-impact, joint-friendly.'
      },
      {
        name: 'Steady Bike Ride',
        work: 40,
        totalTime: '40 min',
        exercises: ['Stationary bike — resistance 8–12','Maintain 70–80 RPM'],
        intensity: '60–70% max HR',
        equipment: 'Stationary Bike or Outdoor Bike',
        notes: 'Zero joint impact. Excellent active recovery. Pair with a podcast or audiobook.'
      }
    ],
    warmup: ['2 min easy pace to start','Gradual incline increase over 3 min'],
    cooldown: ['2 min easy pace','Calf stretch 30s each','Hip flexor stretch 30s each'],
    warnings: ['More than 60 min may increase cortisol','Pair with protein intake post-session','Can be done 5–6 days/week']
  },

  miss: {
    name: 'MISS',
    full: 'Moderate-Intensity Steady-State',
    icon: 'run',
    color: 'var(--warn)',
    tagline: 'The middle ground — aerobic base building',
    duration: '20–40 min',
    difficulty: 2,
    goal: ['athletic','maintenance','hypertrophy'],
    science: 'MISS targets aerobic capacity and VO2 max. Operates at 70–80% max HR — above fat-burning zone but sustainable. Builds cardiovascular base that improves lifting performance.',
    protocols: [
      {
        name: 'Tempo Run',
        work: 25,
        totalTime: '25 min',
        exercises: ['Run at 75–80% max HR','Conversational pace — you can speak in sentences'],
        intensity: '70–80% max HR',
        equipment: 'Treadmill or outdoor',
        notes: 'Controlled discomfort. If you cannot speak in sentences, slow down. 5 min warm-up jog, 20 min tempo, 5 min cool-down.'
      },
      {
        name: 'Rowing Machine MISS',
        work: 30,
        totalTime: '30 min',
        exercises: ['Row at 2:10–2:20 /500m pace','Damper setting 4–6'],
        intensity: '70–80% max HR',
        equipment: 'Rowing Machine',
        notes: 'Full body cardio. Maintain 22–24 strokes per minute. Check damper — too high increases injury risk.'
      },
      {
        name: 'Stair Climber MISS',
        work: 25,
        totalTime: '25 min',
        exercises: ['Stair climber — 60–70 steps/min','Arms free, no rail holding'],
        intensity: '70–80% max HR',
        equipment: 'Stair Climber',
        notes: 'Exceptional glute and cardiovascular stimulus. Step fully — no toe-stepping. Burns ~350 kcal/25 min.'
      }
    ],
    warmup: ['5 min easy jog or walk','Gradual pace increase to working pace'],
    cooldown: ['5 min easy pace','Full body stretch 5 min'],
    warnings: ['Best 3–4 days/week','Allow 1 day between MISS sessions']
  },

  sit: {
    name: 'SIT',
    full: 'Sprint Interval Training',
    icon: 'flame',
    color: 'var(--danger)',
    tagline: 'All-out sprints. Maximum adaptation.',
    duration: '15–20 min total (short but brutal)',
    difficulty: 3,
    goal: ['athletic','fat_loss'],
    science: 'SIT uses 4–6 all-out supramaximal sprints (>100% VO2 max). Superior to HIIT for improving insulin sensitivity, VO2 max, and mitochondrial density. Sessions are short but extremely taxing on CNS.',
    protocols: [
      {
        name: '6×30s Wingate Protocol',
        rounds: 6,
        work: 30,
        rest: 270,
        totalTime: '30 min incl warm-up',
        exercises: ['All-out sprint — 30s','Complete rest — 4.5 min'],
        intensity: '100% max effort',
        equipment: 'Assault Bike, Rowing Machine, or Sprint track',
        notes: 'The original Wingate sprint test protocol. 6 rounds of absolute maximum effort. Between rounds: catch your breath, do not move around.'
      },
      {
        name: '4×20s Hill Sprints',
        rounds: 4,
        work: 20,
        rest: 180,
        totalTime: '20 min incl warm-up',
        exercises: ['Hill sprint — 20s absolute max','Walk down — 3 min recovery'],
        intensity: '100% max effort',
        equipment: 'Outdoor hill or treadmill at 8–10% incline',
        notes: 'Hill reduces impact force vs flat sprints. Drive knees high, lean into hill. Excellent for glute and hamstring development alongside cardio.'
      }
    ],
    warmup: ['10 min progressive warm-up (crucial)','3–4 strides at 70–80% before first sprint','Dynamic stretches'],
    cooldown: ['10 min easy walk','Full lower body stretch','Nutrition: protein + carbs within 30 min'],
    warnings: ['Maximum 2×/week','Never on consecutive days','Requires 48h+ recovery','NOT for beginners — build aerobic base first','Stop if any sharp pain']
  },

  fartlek: {
    name: 'Fartlek',
    full: 'Fartlek Training (Speed Play)',
    icon: 'target',
    color: 'var(--c1)',
    tagline: 'Unstructured speed play — listen to your body',
    duration: '20–45 min',
    difficulty: 2,
    goal: ['athletic','maintenance','hypertrophy'],
    science: 'Swedish for "speed play." Mixes intensities freely based on feel. Develops both aerobic and anaerobic systems simultaneously. The unstructured nature reduces mental fatigue and increases enjoyment — important for long-term adherence.',
    protocols: [
      {
        name: 'Classic Street Fartlek',
        work: 30,
        totalTime: '30 min',
        exercises: ['Easy jog baseline pace','Sprint to next lamppost/corner','Recovery jog to catch breath','Repeat at will'],
        intensity: 'Variable 60–100% max HR',
        equipment: 'Outdoor space or treadmill',
        notes: 'No structure — that is the point. Sprint when you feel good. Recover when you need. Use landmarks as sprint targets. Total time 30 min.'
      },
      {
        name: 'Music-Driven Fartlek',
        work: 25,
        totalTime: '25 min',
        exercises: ['Run easy during verses','Sprint during chorus','Recover during bridges'],
        intensity: 'Music-driven effort',
        equipment: 'Treadmill or outdoor. Good playlist essential.',
        notes: 'Sprint during every chorus, recover during verse. Makes cardio engaging. High-energy playlist recommended.'
      }
    ],
    warmup: ['5 min easy jog','Light dynamic warm-up'],
    cooldown: ['5 min easy jog','5 min stretching'],
    warnings: ['Great for beginners — intensity is self-regulated','Can replace one HIIT session per week']
  },

  circuit: {
    name: 'Circuit Training',
    full: 'Circuit Training',
    icon: 'refresh',
    color: '#bf5af2',
    tagline: 'Resistance + cardio combined — maximum efficiency',
    duration: '30–45 min',
    difficulty: 2,
    goal: ['fat_loss','recomp','maintenance','athletic'],
    science: 'Circuit training keeps heart rate elevated (65–80% max HR) throughout resistance exercises. Combines metabolic conditioning with strength stimulus. Produces significant EPOC while building functional strength.',
    protocols: [
      {
        name: 'Push-Pull-Legs Circuit',
        work: 40,
        rest: 15,
        rounds: 3,
        totalTime: '35 min',
        exercises: ['Push-Ups × 15','Dumbbell Row × 12 each','Goblet Squat × 15','Mountain Climbers × 20','Dumbbell Shoulder Press × 12','Hip Thrust BW × 20','Plank 30s'],
        intensity: '70–80% max HR',
        equipment: 'Dumbbells + bodyweight',
        notes: 'Move directly between exercises with no rest. 15s rest between rounds. 3 rounds total. Adjust DB weight to allow completion without breaking form.'
      },
      {
        name: 'Barbell Complex',
        work: 45,
        rest: 90,
        rounds: 5,
        totalTime: '30 min',
        exercises: ['Barbell Deadlift × 6','Barbell Row × 6','Barbell Hang Clean × 6','Barbell Front Squat × 6','Barbell Push Press × 6'],
        intensity: 'Moderate load — never set bar down',
        equipment: 'Barbell',
        notes: 'Never set the bar down during a round. Use a weight you can do all 5 movements with (typically 30–40% of your weakest lift). 90s rest between rounds.'
      },
      {
        name: 'AMRAP Circuit',
        work: 1200,
        rest: 0,
        rounds: 1,
        totalTime: '20 min AMRAP',
        exercises: ['10 × Push-Ups','15 × Air Squats','10 × DB Rows each side','20 × Jump Rope (or jumping jacks)','10 × Dips or Tricep Push-Ups'],
        intensity: 'Self-paced, continuous movement',
        equipment: 'Minimal — DB, jump rope optional',
        notes: 'As Many Rounds As Possible in 20 minutes. Log your rounds. Beat your score next session. Log rest only when absolutely needed.'
      }
    ],
    warmup: ['5 min light cardio','Joint circles head to toe','Light warm-up set of each movement'],
    cooldown: ['5 min easy movement','Full body stretch 5 min','Protein shake within 30 min'],
    warnings: ['Not ideal day before heavy leg day','Reduce weights vs normal training','Keep log of rounds/reps for progression']
  }
};
window.CARDIO_PROTOCOLS = CARDIO_PROTOCOLS;

/* ── Active Workout State ── */
let _wkt = null;
let _wktTimer = null;
let _wktElapsed = 0;
let _restTimer = null;
let _restRemaining = 0;
let _restEndsAt = 0;
let _restDuration = 0;
let _restInterval = null;
let _wktNotes = {};
let _supersetMode = false;
let _quickMode = false;
let _focusMode = false;
let _lastDraftCheckpoint = 0;

function _workoutDraft() {
  return S.g('activeWorkoutDraft');
}
function _checkpointWorkout(force) {
  if (!_wkt) return;
  const now = Date.now();
  if (!force && now - _lastDraftCheckpoint < 1000) return;
  _lastDraftCheckpoint = now;
  S.set('activeWorkoutDraft', {
    version: 1,
    workout: _wkt,
    notes: _wktNotes,
    supersetMode: _supersetMode,
    quickMode: _quickMode,
    focusMode: _focusMode,
    savedAt: now
  });
}
function _hydrateWorkoutDraft() {
  const draft = _workoutDraft();
  if (!draft || draft.version !== 1 || !draft.workout || !Array.isArray(draft.workout.exercises)) return false;
  _wkt = draft.workout;
  _wktNotes = draft.notes || {};
  _supersetMode = !!draft.supersetMode;
  _quickMode = !!draft.quickMode;
  _focusMode = !!draft.focusMode;
  _startWktTimer();
  return true;
}
window.resumeWorkoutDraft = function() {
  if (!_hydrateWorkoutDraft()) {
    toast('Workout draft could not be restored', 'warn');
    return;
  }
  if (typeof WakeLock !== 'undefined') WakeLock.request();
  go('active');
};
window.discardWorkoutDraft = function() {
  S.set('activeWorkoutDraft', null);
  _wkt = null;
  _wktNotes = {};
  clearInterval(_wktTimer);
  go('workout');
  toast('Workout draft discarded', 'info');
};

function _fillTrainInsight() {
  const slot = document.getElementById('train-insight-slot');
  if (!slot || (typeof currentScreenId === 'function' && currentScreenId() !== 'workout')) return;
  try {
    const suggestion = CoachEngine.insights()[0];
    if (!suggestion) { slot.innerHTML = ''; return; }
    slot.innerHTML = '<div class="ai-msg"><div class="ai-msg-header"><span class="ai-msg-label">Coach Insight</span></div><div class="ai-msg-text">'+esc(suggestion.m)+'</div></div>';
  } catch (e) { slot.innerHTML = ''; }
}

function _logMoreMenu() {
  const mic = (typeof VoiceLogger !== 'undefined' && VoiceLogger.supported())
    ? '<button type="button" onclick="_closeLogMore();voiceLogCurrentSet()">Voice log</button>' : '';
  return '<details class="log-more">' +
    '<summary aria-label="More session actions">⋯</summary>' +
    '<div class="log-more__menu">' +
    '<button type="button" class="log-more__pain" onclick="_closeLogMore();flagPainDuringWorkout()">Flag pain</button>' +
    '<button type="button" onclick="_closeLogMore();toggleSupersetMode()" aria-pressed="'+(_supersetMode?'true':'false')+'">'+(_supersetMode?'Superset on':'Superset')+'</button>' +
    '<button type="button" onclick="_closeLogMore();toggleFocusMode()" aria-pressed="'+(_focusMode?'true':'false')+'">'+(_focusMode?'Exit focus':'Focus')+'</button>' +
    mic +
    '</div></details>';
}
window._closeLogMore = function() {
  document.querySelectorAll('.log-more[open]').forEach(function(el) { el.removeAttribute('open'); });
};

function _weightDisplayForSet(ex, set, user) {
  const perSide = !!(ex._plan && ex._plan.unit === 'kg_per_side');
  if (perSide) {
    const side = set._editSide === 'R' ? 'R' : 'L';
    const kg = side === 'R'
      ? (set.weightR != null ? set.weightR : set.weight)
      : (set.weightL != null ? set.weightL : set.weight);
    return kg ? weightFromKg(kg, user) : '';
  }
  return set.weight ? weightFromKg(set.weight, user) : '';
}

function _setRowHTML(ex, exIdx, set, sIdx, suggestKg) {
  const user = S.g('user') || {};
  const goal = user.goal || 'hypertrophy';
  const rec = GUIDANCE.setsReps(goal);
  const perSide = !!(ex._plan && ex._plan.unit === 'kg_per_side');
  const isDone = !!set.done;
  const isPR = !!set._isPR;
  const suggest = suggestKg != null ? suggestKg : WeightEngine.suggest(ex.name, user);
  const displaySuggest = suggest ? weightFromKg(suggest, user) : 0;
  const displayWeight = _weightDisplayForSet(ex, set, user);
  const side = set._editSide === 'R' ? 'R' : 'L';
  const sideToggle = perSide
    ? '<div class="set-step__side" role="group" aria-label="Per-side load">' +
      '<button type="button" data-side="L" aria-pressed="'+(side==='L'?'true':'false')+'" onclick="_toggleEditSide('+exIdx+','+sIdx+',\'L\')">L</button>' +
      '<button type="button" data-side="R" aria-pressed="'+(side==='R'?'true':'false')+'" onclick="_toggleEditSide('+exIdx+','+sIdx+',\'R\')">R</button>' +
      '</div>'
    : '';
  return '<div class="set-row' + (isDone?' done':'') + (isPR?' pr':'') + '" id="set-'+exIdx+'-'+sIdx+'">' +
    '<div class="set-num">'+(sIdx+1)+'</div>' +
    '<div class="set-step'+(perSide?' set-step--side':'')+'">' +
    sideToggle +
    '<button type="button" class="set-step__btn" onclick="_stepVal('+exIdx+','+sIdx+',\'weight\',-1)" aria-label="Decrease weight">−</button>' +
    '<input type="number" class="set-step__inp" data-field="weight" aria-label="'+(perSide?(side==='R'?'Right':'Left')+' side load':'Weight')+'" placeholder="'+displaySuggest+'" value="'+displayWeight+'" inputmode="decimal" onchange="_onWeightInput('+exIdx+','+sIdx+',this.value)">' +
    '<button type="button" class="set-step__btn" onclick="_stepVal('+exIdx+','+sIdx+',\'weight\',1)" aria-label="Increase weight">+</button>' +
    '</div>' +
    '<div class="set-x">×</div>' +
    '<div class="set-step">' +
    '<button type="button" class="set-step__btn" onclick="_stepVal('+exIdx+','+sIdx+',\'reps\',-1)" aria-label="Decrease reps">−</button>' +
    '<input type="number" class="set-step__inp" data-field="reps" aria-label="Reps" placeholder="'+(rec.reps.split('-')[0])+'" value="'+(set.reps||'')+'" inputmode="numeric" onchange="_setVal('+exIdx+','+sIdx+',\'reps\',parseInt(this.value,10)||0)">' +
    '<button type="button" class="set-step__btn" onclick="_stepVal('+exIdx+','+sIdx+',\'reps\',1)" aria-label="Increase reps">+</button>' +
    '</div>' +
    '<div class="set-at">@</div>' +
    '<input type="number" class="set-rpe" data-field="rpe" aria-label="RPE" placeholder="8" value="'+(set.rpe||'')+'" min="5" max="10" step="0.5" inputmode="decimal" onchange="_setVal('+exIdx+','+sIdx+',\'rpe\',parseFloat(this.value)||0)">' +
    '<button type="button" class="set-check'+(isDone?' done':'')+'" onclick="_doneSet('+exIdx+','+sIdx+')" aria-label="'+(isDone?'Set done':'Mark set done')+'">' +
    (isDone ? (typeof icon === 'function' ? icon('check', 16, isPR ? '#fff' : 'currentColor') : '✓') : '') +
    '</button>' +
    (isPR ? '<div class="set-pr-flag">PR</div>' : '') +
    '</div>';
}

window._onWeightInput = function(exIdx, sIdx, raw) {
  if (!_wkt || !_wkt.exercises[exIdx] || !_wkt.exercises[exIdx].sets[sIdx]) return;
  const ex = _wkt.exercises[exIdx];
  const set = ex.sets[sIdx];
  if (ex._plan && ex._plan.unit === 'kg_per_side') {
    _setSide(exIdx, sIdx, set._editSide === 'R' ? 'R' : 'L', raw);
  } else {
    _setVal(exIdx, sIdx, 'weight', weightToKg(parseFloat(raw) || 0));
  }
};

window._toggleEditSide = function(exIdx, sIdx, side) {
  if (!_wkt || !_wkt.exercises[exIdx] || !_wkt.exercises[exIdx].sets[sIdx]) return;
  _wkt.exercises[exIdx].sets[sIdx]._editSide = side === 'R' ? 'R' : 'L';
  _syncSetInputs(exIdx, sIdx);
};

window._stepVal = function(exIdx, sIdx, field, dir) {
  if (!_wkt || !_wkt.exercises[exIdx] || !_wkt.exercises[exIdx].sets[sIdx]) return;
  const ex = _wkt.exercises[exIdx];
  const set = ex.sets[sIdx];
  const user = S.g('user') || {};
  const stepW = usesImperial(user) ? 5 : 2.5;
  if (field === 'weight' && ex._plan && ex._plan.unit === 'kg_per_side') {
    const side = set._editSide === 'R' ? 'R' : 'L';
    const kg = side === 'R'
      ? (set.weightR != null ? set.weightR : set.weight || 0)
      : (set.weightL != null ? set.weightL : set.weight || 0);
    const next = Math.max(0, Math.round((weightFromKg(kg, user) + dir * stepW) * 10) / 10);
    _setSide(exIdx, sIdx, side, String(next));
    _syncSetInputs(exIdx, sIdx);
    return;
  }
  if (field === 'weight') {
    const next = Math.max(0, Math.round((weightFromKg(set.weight || 0, user) + dir * stepW) * 10) / 10);
    set.weight = weightToKg(next, user);
  } else if (field === 'reps') {
    set.reps = Math.max(0, (parseInt(set.reps, 10) || 0) + dir);
  } else if (field === 'rpe') {
    set.rpe = Math.max(5, Math.min(10, (parseFloat(set.rpe) || 8) + dir * 0.5));
  }
  _checkpointWorkout();
  _syncSetInputs(exIdx, sIdx);
};

function _syncSetInputs(exIdx, sIdx) {
  const row = document.getElementById('set-' + exIdx + '-' + sIdx);
  if (!row || !_wkt) return;
  const ex = _wkt.exercises[exIdx];
  const set = ex.sets[sIdx];
  const user = S.g('user') || {};
  const wInp = row.querySelector('[data-field="weight"]');
  const rInp = row.querySelector('[data-field="reps"]');
  const pInp = row.querySelector('[data-field="rpe"]');
  if (wInp) wInp.value = _weightDisplayForSet(ex, set, user);
  if (rInp) rInp.value = set.reps || '';
  if (pInp) pInp.value = set.rpe || '';
  const side = set._editSide === 'R' ? 'R' : 'L';
  row.querySelectorAll('[data-side]').forEach(function(btn) {
    btn.setAttribute('aria-pressed', btn.getAttribute('data-side') === side ? 'true' : 'false');
  });
  if (wInp && ex._plan && ex._plan.unit === 'kg_per_side') {
    wInp.setAttribute('aria-label', (side === 'R' ? 'Right' : 'Left') + ' side load');
  }
}

/* ── WORKOUT HOME SCREEN ── */
reg('workout', function() {
  const user = S.g('user') || {};
  const splitDay = SplitEngine.getSplitDay();
  const score = ReadinessEngine.score();
  const cardioRec = CoachEngine.cardioRec(splitDay, score);
  const readiness = ReadinessEngine.label(score);
  const draft = _workoutDraft();
  setTimeout(_fillTrainInsight, 0);
  const draftBanner = draft && draft.workout
    ? '<div class="card-block"><div class="section-label">Workout in progress</div>' +
      '<div class="body-13">' + esc(draft.workout.name || 'Workout') + ' · saved ' + esc(fmtDate(new Date(draft.savedAt || Date.now()))) + '</div>' +
      '<div class="flex-gap-8 mt-14"><button type="button" class="btn btn-primary btn-sm" onclick="resumeWorkoutDraft()">Resume</button>' +
      '<button type="button" class="btn btn-secondary btn-sm" onclick="discardWorkoutDraft()">Discard</button></div></div>'
    : '';

  const warmupItems = (splitDay.warmup || []).map(w =>
    '<div class="warmup-item"><span class="warmup-item-icon" style="color:var(--c5);display:inline-flex">'+icon('flame',14)+'</span>'+esc(w)+'</div>'
  ).join('');

  const swapMap = {};
  (splitDay._swaps || []).forEach(function(s) { swapMap[s.name] = s; });

  const exPreviews = (splitDay.exercises || []).slice(0,5).map(name => {
    const ex = ExDB.byName(name);
    const prev = ProgEngine.prevString(name);
    const diff = ex ? GUIDANCE.diffLabel(ex.diff) : null;
    const needsSpot = GUIDANCE.needsSpotter(name);
    const swap = swapMap[name];
    return '<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">' +
      '<div style="width:38px;height:38px;border-radius:11px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:rgba(var(--c1-rgb),0.12);color:var(--c1)">'+icon('dumbbell',18)+'</div>' +
      '<div  class="flex-1">' +
      '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">' +
      '<div  class="row-title-14">'+esc(name)+'</div>' +
      (swap ? '<span style="font-size:10px;font-weight:700;color:var(--c5);background:rgba(255,159,10,0.12);border-radius:4px;padding:2px 6px">↔ '+esc(swap.original)+'</span>' : '') +
      (diff ? '<span style="font-size:10px;font-weight:700;color:'+diff.c+';text-transform:uppercase;letter-spacing:0.06em">'+diff.l+'</span>' : '') +
      (needsSpot ? '<span style="font-size:10px;color:var(--danger);font-weight:700;display:inline-flex;align-items:center;gap:3px">'+icon('alert',11,'var(--danger)')+'SPOTTER</span>' : '') +
      '</div>' +
      (ex?'<div  class="muted-12 mt-2">'+esc(ex.pri)+(ex.sec?', '+ex.sec:'')+'</div>':'') +
      (prev?'<div class="log-last" style="margin-top:2px">'+esc(prev)+'</div>':'') +
      '</div>' +
      '<button type="button" onclick="showExerciseDetail('+jsArg(name)+')" aria-label="Details for '+esc(name)+'" ' +
      'style="min-width:48px;min-height:48px;width:48px;height:48px;border-radius:50%;background:var(--bg4);border:1px solid var(--border);color:var(--txt2);' +
      'display:flex;align-items:center;justify-content:center;cursor:pointer;touch-action:manipulation;flex-shrink:0">'+icon('book',15)+'</button>' +
      '</div>';
  }).join('');

  return '<div class="topbar">' +
    '<div><div class="topbar-title">Train</div><div class="topbar-date">'+esc(new Date().toLocaleDateString('en-GB',{weekday:'long',month:'short',day:'numeric'}))+'</div></div>' +
    '<div class="topbar-right"><button type="button" class="topbar-icon" onclick="go(\'workout\',{search:true})" aria-label="Exercise search" style="display:flex;align-items:center;justify-content:center">' + icon('search', 18) + '</button></div></div>' +
    draftBanner +

    '<div  class="pad-x-16-b">' +
    '<div class="readiness-label '+readiness.cls+' mb-12" >Readiness: '+score+' — '+readiness.l+'</div>' +
    '</div>' +

    sh('Today\'s Plan') +
    '<div class="screen-pad" style="padding-top:0;padding-bottom:0">' +
    (typeof renderSplitDayPicker === 'function' ? renderSplitDayPicker({ mode: 'train' }) : '') +
    '</div>' +
    '<div class="card card-solid">' +
    '<div style="font-size:18px;font-weight:800;color:var(--txt);margin-bottom:4px">'+esc(splitDay.n||'Rest Day')+'</div>' +
    '<div style="font-size:13px;color:var(--txt3);margin-bottom:16px">'+esc(prettyMuscles(splitDay.muscles))+'</div>' +
    (function() {
      const injSwaps = (splitDay._swaps || []).filter(function(s){ return s.injury; });
      if (!injSwaps.length) return '';
      const parts = injSwaps.map(function(s){ return s.injury; }).filter(function(v,i,a){ return a.indexOf(v)===i; });
      return '<div onclick="go(\'rehab\')" style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,159,10,0.12);border:1px solid rgba(255,159,10,0.3);border-radius:10px;padding:6px 12px;margin-bottom:14px;font-size:12px;font-weight:700;color:var(--c5);cursor:pointer;touch-action:manipulation">' + icon('bandage',13) + ' Modified for ' + esc(parts.join(', ')) + ' · Rehab →</div>';
    })() +
    exPreviews + '</div>' +

    (splitDay.warmup&&splitDay.warmup.length?
      '<details class="warmup-fold"><summary>Warm-up</summary><div class="warmup-fold__body">'+warmupItems+'</div></details>' : '') +

    '<div class="warmup-card">' +
    '<div class="warmup-title">Cardio Recommendation</div>' +
    '<div style="font-size:15px;font-weight:700;color:var(--c1);margin-bottom:4px">'+esc(cardioRec.machine)+'</div>' +
    '<div  class="body-13">'+esc(cardioRec.duration)+' — '+esc(cardioRec.details)+'</div>' +
    '<div style="font-size:12px;color:var(--txt3);margin-top:6px">Best performed after your lifting session</div>' +
    '</div>' +

    '<div id="train-insight-slot"></div>' +

    '<div style="padding:16px 16px 0">' +
    '<button type="button" class="btn btn-primary" onclick="startWorkout()">Start Workout</button>' +
    '<button type="button" class="btn btn-secondary" style="margin-top:10px" onclick="startQuickWorkout()">Quick Workout (20 min)</button>' +
    '<button type="button" class="btn btn-secondary" style="margin-top:10px;display:flex;align-items:center;justify-content:center;gap:8px" onclick="showBrowseExercises()">' + icon('search', 16) + ' Browse All Exercises</button>' +
    '<button type="button" class="btn" style="margin-top:10px;background:rgba(255,69,58,0.1);border:1px solid rgba(255,69,58,0.2);color:var(--danger);font-weight:700" onclick="go(\'cardio\')">Cardio Protocols</button>' +
    '<button type="button" class="btn" style="margin-top:10px;background:rgba(var(--c1-rgb),0.1);border:1px solid rgba(var(--c1-rgb),0.2);color:var(--c1)" onclick="showAddCustomExercise()">+ Add Custom Exercise</button>' +
    '</div>' +
    '<div  class="spacer-bottom"></div>';
});

/* ── CARDIO HOME SCREEN ── */
reg('cardio', function() {
  const user = S.g('user') || {};
  const goal = user.goal || 'hypertrophy';
  const score = ReadinessEngine.score();

  function isRecommended(p) {
    if (score < 50 && p.difficulty >= 3) return false;
    return p.goal.includes(goal) || p.difficulty === 1;
  }

  const protocols = Object.values(CARDIO_PROTOCOLS);
  const keys = Object.keys(CARDIO_PROTOCOLS);

  const cards = protocols.map(function(p, idx) {
    const key = keys[idx];
    const rec = isRecommended(p);
    const diffLabel = p.difficulty >= 3 ? 'Advanced' : p.difficulty === 2 ? 'Intermediate' : 'Beginner';
    const diffColor = p.difficulty >= 3 ? 'var(--danger)' : p.difficulty === 2 ? 'var(--warn)' : 'var(--success)';
    return '<div onclick="showCardioProtocol(\''+key+'\')" ' +
      'style="background:var(--bg3);border:1.5px solid '+(rec?p.color:'var(--border)')+';border-radius:18px;padding:16px;margin-bottom:12px;cursor:pointer;touch-action:manipulation;position:relative">' +
      (rec ? '<div style="position:absolute;top:14px;right:14px;background:rgba(var(--c1-rgb),0.15);border-radius:20px;padding:3px 10px;font-size:10px;font-weight:700;color:var(--c1)">RECOMMENDED</div>' : '') +
      '<div style="display:flex;align-items:center;gap:14px;margin-bottom:10px">' +
      '<div style="width:44px;height:44px;border-radius:12px;background:rgba(var(--c1-rgb),0.12);display:flex;align-items:center;justify-content:center;color:'+p.color+'">'+icon(p.icon||'run',26,p.color)+'</div>' +
      '<div>' +
      '<div style="font-size:18px;font-weight:800;color:var(--txt)">'+esc(p.name)+'</div>' +
      '<div  class="muted-12 mt-2">'+esc(p.full)+'</div>' +
      '</div></div>' +
      '<div style="font-size:13px;color:var(--txt2);line-height:1.5;margin-bottom:10px">'+esc(p.tagline)+'</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap">' +
      '<span style="font-size:11px;font-weight:600;color:'+diffColor+';background:rgba(0,0,0,0.2);padding:3px 10px;border-radius:20px">'+diffLabel+'</span>' +
      '<span style="font-size:11px;color:var(--txt3);background:rgba(0,0,0,0.15);padding:3px 10px;border-radius:20px">'+esc(p.duration)+'</span>' +
      '<span style="font-size:11px;color:var(--txt3);background:rgba(0,0,0,0.15);padding:3px 10px;border-radius:20px">'+p.protocols.length+' protocols</span>' +
      '</div></div>';
  }).join('');

  return '<div class="topbar">' +
    '<button type="button" class="topbar-icon press" onclick="go(\'workout\')" style="margin-right:8px">←</button>' +
    '<div><div class="topbar-title">Cardio</div>' +
    '<div class="topbar-date">Choose your protocol</div></div></div>' +

    '<div style="padding:12px 16px;background:rgba(var(--c1-rgb),0.06);border-bottom:1px solid var(--border)">' +
    '<div  class="body-13">Readiness score: <strong style="color:var(--c1)">'+score+'</strong> · ' +
    'Goal: <strong style="color:var(--c1)">'+esc(goal.replace('_',' '))+'</strong></div>' +
    '</div>' +

    '<div style="padding:14px 16px">' + cards + '</div>' +
    '<div  class="spacer-bottom"></div>';
});

/* ── ACTIVE WORKOUT SCREEN ── */
reg('active', function() {
  if (!_wkt && !_hydrateWorkoutDraft()) { go('workout'); return ''; }
  const user = S.g('user') || {};
  const displayUnit = weightUnit(user).toUpperCase();
  const restSecs = user.restSecs || 120;
  const ctx = (typeof Profile !== 'undefined' && Profile.deriveContext) ? Profile.deriveContext() : { limitations: user.limitations || [] };
  const lim = (ctx.limitations || []).map(function(l) {
    return String((typeof l === 'string' ? l : (l.joint || l.id || '')) || '').toLowerCase();
  });
  const caution = (typeof Equipment !== 'undefined' && Equipment.cautionBanner)
    ? Equipment.cautionBanner(ctx.limitations || user.limitations || [])
    : (lim.indexOf('shoulder') >= 0
      ? '<div class="banner banner--caution" style="margin:8px 16px">Shoulder caution: stop on sharp pain or clunk. Prefer listed alternatives.</div>'
      : '');
  const firstNew = (_wkt.exercises || []).find(function(ex) {
    const prev = typeof ProgEngine !== 'undefined' && ProgEngine.prevString ? ProgEngine.prevString(ex.name) : '';
    const cal = (S.g('user.calibrations') || {})[ex.name];
    return !prev && !cal;
  });
  const calBanner = firstNew
    ? '<div class="banner" style="margin:8px 16px">First time on ' + esc(firstNew.name) + ': start light, hit 8 reps, then add 10–15% until a set leaves 2–3 in reserve. That load is saved for next time.</div>'
    : '';
  const totalSets = _wkt.exercises.reduce(function(a,ex){return a+(ex.sets||[]).length;},0);
  const doneSets = _wkt.exercises.reduce(function(a,ex){return a+(ex.sets||[]).filter(function(s){return s.done;}).length;},0);
  const progress = totalSets > 0 ? Math.round((doneSets/totalSets)*100) : 0;

  const header =
    '<div class="wkt-header" id="wkt-header">' +
    '<div class="wkt-progress-bar-wrap"><div class="wkt-progress-bar" id="wkt-pb" style="width:'+progress+'%"></div></div>' +
    '<div class="wkt-bar">' +
    '<div class="wkt-bar__meta">' +
    '<div class="wkt-bar__name">'+esc(_wkt.name)+'</div>' +
    '<div class="wkt-bar__timer" id="wkt-timer-display">'+fmtTime(_wktElapsed)+'</div>' +
    '</div>' +
    '<span id="wkt-count" class="log-sr">'+doneSets+'/'+totalSets+'</span>' +
    '<div class="wkt-bar__actions">' +
    _logMoreMenu() +
    '<button type="button" class="wkt-bar__finish" onclick="confirmFinishWorkout()">Finish</button>' +
    '</div></div></div>';

  const cards = _wkt.exercises.map(function(ex, exIdx) {
    const exData = ExDB.byName(ex.name);
    const prev = ProgEngine.prevString(ex.name);
    const suggest = WeightEngine.suggest(ex.name, user);
    const diff = exData ? GUIDANCE.diffLabel(exData.diff) : null;
    const needsSpot = GUIDANCE.needsSpotter(ex.name);
    const allDone = (ex.sets||[]).length > 0 && (ex.sets||[]).every(function(s){return s.done;});
    const barbell = typeof isBarbellExercise === 'function' ? isBarbellExercise(ex.name) : false;

    const setsHTML = (ex.sets||[]).map(function(set, sIdx) {
      return _setRowHTML(ex, exIdx, set, sIdx, suggest);
    }).join('');

    const noteVal = _wktNotes[ex.name] || '';
    const workW = (ex.sets && ex.sets[0] && ex.sets[0].weight) || suggest || 0;
    const warmups = (barbell && workW >= 40 && typeof WeightEngine !== 'undefined') ? WeightEngine.warmupSets(workW) : [];
    const warmupHTML = (!_focusMode && warmups.length) ?
      '<details class="warmup-fold" style="margin:4px 8px 8px">' +
      '<summary>Warm-up ramp</summary>' +
      '<div class="warmup-fold__body">' +
      '<button type="button" class="log-plates" style="margin-bottom:8px" onclick="insertWarmupSets('+exIdx+')">Add to logger</button>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
      warmups.map(function(w) {
        return '<span style="padding:6px 10px;border-radius:10px;background:var(--bg4);border:1px solid var(--border);font-size:12px;color:var(--txt2)">' +
          esc(w.label) + ' · <strong class="c-txt">' + weightFromKg(w.weight, user) + displayUnit.toLowerCase() + ' × ' + w.reps + '</strong></span>';
      }).join('') + '</div></div></details>' : '';

    const mediaThumb = (typeof ExerciseLibrary !== 'undefined' ? ExerciseLibrary.getMedia(exData || ex.name).thumb : null);
    const doneMark = allDone ? (typeof icon === 'function' ? icon('check', 22, 'var(--c1)') : '✓') : '';

    return '<div class="ex-card' + (allDone?' done':'') + '" id="ex-card-'+exIdx+'">' +
      '<div class="ex-card-header">' +
      (mediaThumb && !_focusMode ?
        '<div style="width:44px;height:44px;border-radius:12px;overflow:hidden;border:1px solid var(--border);flex-shrink:0;background:var(--bg4)"><img src="'+esc(mediaThumb)+'" alt="" style="width:100%;height:100%;object-fit:cover"/></div>' :
        '<div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;flex-shrink:0">'+(allDone ? doneMark : (typeof iconTile === 'function' ? iconTile('dumbbell', 'c1', 36) : ''))+'</div>') +
      '<div  class="flex-1">' +
      '<div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">' +
      '<div  class="row-title-15">'+esc(ex.name)+'</div>' +
      (diff ? '<span style="font-size:9px;font-weight:700;color:'+diff.c+';text-transform:uppercase">'+diff.l+'</span>' : '') +
      (needsSpot ? '<span style="font-size:9px;color:var(--danger);font-weight:700">SPOTTER</span>' : '') +
      '</div>' +
      (prev ? '<div class="log-last" style="margin-top:2px">'+esc(prev)+'</div>' : '') +
      (barbell && !_focusMode ? '<button type="button" class="log-plates" onclick="showPlateCalc('+weightFromKg((ex.sets && ex.sets[0] && ex.sets[0].weight) || suggest || 0, user)+')">plates</button>' : '') +
      (typeof AutoregEngine !== 'undefined' && AutoregEngine.nextWeightDelta ?
        (function(){ var ar = AutoregEngine.nextWeightDelta(ex.name); return ar && ar.reason ? '<div style="font-size:11px;color:var(--txt3);margin-top:2px">'+esc(ar.reason)+'</div>' : ''; })() : '') +
      (exData && !_focusMode ? '<div style="font-size:11px;color:var(--txt3);margin-top:1px">'+esc(exData.cues.slice(0,60))+'...</div>' : '') +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:5px;flex-shrink:0;align-items:flex-end">' +
      '<button type="button" onclick="showExerciseDetail('+jsArg(ex.name)+')" aria-label="Details for '+esc(ex.name)+'" style="min-width:48px;min-height:48px;width:48px;height:48px;border-radius:50%;background:var(--bg4);border:1px solid var(--border);color:var(--txt2);display:flex;align-items:center;justify-content:center;cursor:pointer;touch-action:manipulation">'+icon('book',15)+'</button>' +
      (!_focusMode ? '<button type="button" onclick="swapExercise('+exIdx+')" style="padding:4px 7px;border-radius:8px;background:var(--bg4);border:1px solid var(--border);font-size:10px;font-weight:700;color:var(--txt3);cursor:pointer;touch-action:manipulation;white-space:nowrap">⇄ Swap</button>' : '') +
      '</div>' +
      '</div>' +
      (ex.rxNote ? '<div style="padding:2px 16px 8px"><span style="font-size:11px;font-weight:700;background:rgba(var(--c1-rgb),0.12);color:var(--c1);padding:4px 10px;border-radius:10px">'+esc(ex.rxNote)+'</span></div>' :
       (suggest && !_focusMode ? '<div style="padding:2px 16px 8px"><span style="font-size:11px;font-weight:700;background:rgba(48,209,88,0.12);color:var(--success);padding:4px 10px;border-radius:10px">Try '+suggest+'kg ↑</span></div>' : '')) +
      (ex._plan && !_focusMode ? '<div style="padding:0 16px 10px;font-size:12px;color:var(--txt2);line-height:1.45">' +
        (ex._plan.rom ? '<div style="margin-bottom:6px;color:var(--danger)"><strong>Stop:</strong> '+esc(ex._plan.rom)+'</div>' : '') +
        (ex._plan.cue ? '<div style="margin-bottom:6px">'+esc(ex._plan.cue)+'</div>' : '') +
        ((ex._plan.alternatives || []).length ? '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
          ex._plan.alternatives.map(function(a) {
            return '<button type="button" class="btn btn-ghost btn-sm" style="min-height:40px" onclick="applyPlanAlternative('+exIdx+','+jsArg(a.name)+')">Alt: '+esc(a.name)+'</button>';
          }).join('') + '</div>' : '') +
        '</div>' : '') +
      warmupHTML +
      '<div class="sets-list">'+setsHTML+'</div>' +
      '<div style="padding:10px 16px;display:flex;gap:8px;border-top:1px solid var(--border)">' +
      '<button type="button" onclick="_addSet('+exIdx+')" style="flex:1;padding:10px;border-radius:10px;background:var(--bg4);border:1px solid var(--border);color:var(--txt2);font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation">+ Set</button>' +
      (!_focusMode ? '<button type="button" onclick="_toggleNote('+exIdx+')" style="padding:10px 14px;border-radius:10px;background:var(--bg4);border:1px solid var(--border);color:var(--txt2);font-size:13px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center" aria-label="Add note">' + (typeof icon==='function'?icon('edit',18):'📝') + '</button>' : '') +
      '</div>' +
      '<div id="note-'+exIdx+'" style="display:'+(_focusMode?'none':(noteVal?'block':'none'))+';padding:0 16px 12px">' +
      '<textarea class="field" placeholder="How did this feel? Form notes, energy level..." ' +
      'style="height:72px;resize:none;font-size:16px" ' +
      'oninput="_setWktNote('+exIdx+',this.value)">'+esc(noteVal)+'</textarea>' +
      '</div>' +
      '</div>';
  }).join('');

  const planStrip = (!_focusMode && _wkt.planWarmup && _wkt.planWarmup.length) ?
    '<details class="warmup-fold"><summary>Session warm-up</summary><div class="warmup-fold__body">' + esc(_wkt.planWarmup.join(' · ')) + '</div></details>' : '';
  const cardioStrip = (!_focusMode && _wkt.cardio) ?
    '<div class="card-solid" style="margin:0 16px 12px;padding:12px 14px">' +
    '<div class="muted-11" style="margin-bottom:6px">Cardio after lifting</div>' +
    '<div class="body-13">' + esc((_wkt.cardio.minutes || 20) + ' min ' + (_wkt.cardio.kind || 'steady') + (_wkt.cardio.hr ? ' · ' + _wkt.cardio.hr : '')) + '</div>' +
    (_wkt.cardio.note ? '<div class="muted-12" style="margin-top:6px">' + esc(_wkt.cardio.note) + '</div>' : '') +
    '</div>' : '';

  const restBar =
    '<div id="rest-sheet" style="position:fixed;bottom:0;left:0;right:0;z-index:400;' +
    'background:var(--bg2);border-radius:24px 24px 0 0;border-top:1px solid var(--border);' +
    'padding:16px 24px calc(20px + var(--safe));transform:translateY(100%);' +
    'transition:transform 0.4s var(--ease);will-change:transform">' +
    '<div style="width:36px;height:4px;background:var(--border2);border-radius:2px;margin:0 auto 16px"></div>' +
    '<div style="text-align:center;margin-bottom:14px">' +
    '<div style="font-size:13px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px">Rest Timer</div>' +
    '<div style="position:relative;width:100px;height:100px;margin:0 auto">' +
    '<svg width="100" height="100" viewBox="0 0 100 100">' +
    '<circle cx="50" cy="50" r="44" fill="none" stroke="var(--bg4)" stroke-width="8"/>' +
    '<circle id="rest-ring" cx="50" cy="50" r="44" fill="none" stroke="var(--c1)" stroke-width="8" ' +
    'stroke-dasharray="276.5" stroke-dashoffset="0" stroke-linecap="round" transform="rotate(-90 50 50)"/>' +
    '</svg>' +
    '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
    '<div style="font-size:28px;font-weight:900;color:var(--txt);font-variant-numeric:tabular-nums" id="rest-countdown">'+fmtTime(restSecs)+'</div>' +
    '<div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.06em">seconds</div>' +
    '</div></div></div>' +
    '<div style="display:flex;gap:10px">' +
    '<button type="button" onclick="skipRest()" style="flex:1;padding:14px;border-radius:14px;background:var(--bg4);border:1px solid var(--border);color:var(--txt2);font-size:15px;font-weight:600;cursor:pointer;touch-action:manipulation">Skip</button>' +
    '<button type="button" onclick="addRestTime(30)" style="flex:1;padding:14px;border-radius:14px;background:rgba(var(--c1-rgb),0.1);border:1px solid rgba(var(--c1-rgb),0.2);color:var(--c1);font-size:15px;font-weight:600;cursor:pointer;touch-action:manipulation">+30s</button>' +
    '</div></div>';

  return header + caution + calBanner + planStrip + '<div style="padding:12px 16px 4px">' + cards + '</div>' + cardioStrip + restBar + '<div style="height:32px"></div>';
});

/* ── Workout control functions ── */
window.getActiveWorkout = function() { return _wkt; };
window._setVal = function(exIdx, sIdx, field, val) {
  if (!_wkt || !_wkt.exercises[exIdx]) return;
  if (!_wkt.exercises[exIdx].sets[sIdx]) return;
  _wkt.exercises[exIdx].sets[sIdx][field] = val;
  _checkpointWorkout();
};
window._setSide = function(exIdx, sIdx, side, raw) {
  if (!_wkt || !_wkt.exercises[exIdx] || !_wkt.exercises[exIdx].sets[sIdx]) return;
  const set = _wkt.exercises[exIdx].sets[sIdx];
  const kg = weightToKg(parseFloat(raw) || 0);
  if (side === 'L') set.weightL = kg;
  else set.weightR = kg;
  const l = set.weightL != null ? set.weightL : kg;
  const r = set.weightR != null ? set.weightR : kg;
  set.weight = Math.round(((l + r) / 2) * 10) / 10;
  _checkpointWorkout();
};
window._setWktNote = function(exIdx, value) {
  if (!_wkt || !_wkt.exercises[exIdx]) return;
  _wktNotes[_wkt.exercises[exIdx].name] = value;
  _checkpointWorkout();
};

window._doneSet = function(exIdx, sIdx) {
  if (!_wkt) return;
  const ex = _wkt.exercises[exIdx];
  if (!ex || !ex.sets[sIdx]) return;
  const set = ex.sets[sIdx];
  const w = set.weight || 0;
  const r = set.reps || 0;

  set.done = !set.done;

  if (set.done && w > 0 && r > 0) {
    const isPR = ProgEngine.checkPR(ex.name, w, r);
    set._isPR = isPR;
    if (isPR) {
      ProgEngine.savePR(ex.name, w, r, today());
      toast('New PR on ' + ex.name + '!', 'pr', 5000);
      haptic([50, 50, 100]);
      if (typeof celebrate === 'function') celebrate(icon('star',28), 'New PR!', ex.name + ' · ' + formatWeight(w) + ' × ' + r, 2200);
    } else {
      haptic(25);
    }
    const cals = Object.assign({}, S.g('user.calibrations') || {});
    if (!cals[ex.name] && Number(w) > 0) {
      cals[ex.name] = { kg: Number(w), reps: Number(r) || 8, date: today() };
      S.set('user.calibrations', cals);
    }

    const nextSet = ex.sets[sIdx + 1];
    if (nextSet && !nextSet.done && !nextSet.weight) {
      nextSet.weight = w;
      nextSet.reps = r;
    }

    const restSecs = (ex._plan && ex._plan.restSec) || (S.g('user.restSecs') || 120);
    if (restSecs > 0) startRestTimer(restSecs);
  } else {
    set._isPR = false;
    haptic(15);
  }

  _updateSetRow(exIdx, sIdx, set);
  _updateProgress();
  _checkpointWorkout(true);
  const runAch = function() { try { AchEngine.check(); } catch (e) {} };
  if (typeof requestIdleCallback === 'function') requestIdleCallback(runAch);
  else setTimeout(runAch, 0);
};

function _updateSetRow(exIdx, sIdx, set) {
  const row = document.getElementById('set-'+exIdx+'-'+sIdx);
  if (!row) { go('active'); return; }
  row.className = 'set-row' + (set.done?' done':'') + (set._isPR?' pr':'');
  const btn = row.querySelector('.set-check');
  if (btn) {
    btn.className = 'set-check' + (set.done?' done':'');
    btn.innerHTML = set.done
      ? (typeof icon === 'function' ? icon('check', 16, set._isPR ? '#fff' : 'currentColor') : '✓')
      : '';
  }
  const exCard = document.getElementById('ex-card-'+exIdx);
  if (exCard && _wkt.exercises[exIdx]) {
    const ex = _wkt.exercises[exIdx];
    const allDone = ex.sets.length > 0 && ex.sets.every(function(s){return s.done;});
    exCard.className = 'ex-card' + (allDone?' done':'');
    const emojiEl = exCard.querySelector('.ex-card-header > div:first-child');
    const exData = ExDB.byName(ex.name);
    if (emojiEl) {
      emojiEl.innerHTML = allDone
        ? (typeof icon === 'function' ? icon('check', 22, 'var(--c1)') : '✓')
        : (typeof exChromeIcon === 'function' ? exChromeIcon(exData || ex.name, 22) : '');
    }
  }
}

function _updateProgress() {
  const totalSets = _wkt.exercises.reduce(function(a,ex){return a+(ex.sets||[]).length;},0);
  const doneSets = _wkt.exercises.reduce(function(a,ex){return a+(ex.sets||[]).filter(function(s){return s.done;}).length;},0);
  const pct = totalSets > 0 ? Math.round((doneSets/totalSets)*100) : 0;
  const pb = document.getElementById('wkt-pb');
  if (pb) pb.style.width = pct + '%';
  const count = document.getElementById('wkt-count');
  if (count) count.textContent = doneSets + '/' + totalSets;
}

window._addSet = function(exIdx) {
  if (!_wkt || !_wkt.exercises[exIdx]) return;
  const ex = _wkt.exercises[exIdx];
  const lastSet = ex.sets[ex.sets.length - 1] || {};
  const next = { weight: lastSet.weight || 0, reps: lastSet.reps || 0, done: false };
  if (ex._plan && ex._plan.unit === 'kg_per_side') {
    next.weightL = lastSet.weightL;
    next.weightR = lastSet.weightR;
    next._editSide = lastSet._editSide || 'L';
  }
  ex.sets.push(next);
  _checkpointWorkout(true);
  const list = document.querySelector('#ex-card-' + exIdx + ' .sets-list');
  if (list) {
    list.insertAdjacentHTML('beforeend', _setRowHTML(ex, exIdx, next, ex.sets.length - 1, next.weight));
    _updateProgress();
    return;
  }
  go('active');
};

window._toggleNote = function(exIdx) {
  const el = document.getElementById('note-' + exIdx);
  if (!el) return;
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
  if (el.style.display === 'block') {
    const ta = el.querySelector('textarea');
    if (ta) setTimeout(function(){ta.focus();}, 100);
  }
};

window.toggleSupersetMode = function() {
  _supersetMode = !_supersetMode;
  _checkpointWorkout(true);
  toast(_supersetMode ? 'Superset on' : 'Superset off', 'info');
  const btn = document.querySelector('[onclick*="toggleSupersetMode()"]');
  if (btn) btn.setAttribute('aria-pressed', _supersetMode ? 'true' : 'false');
};

window.toggleFocusMode = function() {
  _focusMode = !_focusMode;
  _checkpointWorkout(true);
  go('active');
  toast(_focusMode ? '🎯 Focus Mode — distractions hidden' : 'Focus Mode off', 'info');
};

window.swapExercise = function(exIdx) {
  if (!_wkt || !_wkt.exercises[exIdx]) return;
  const name = _wkt.exercises[exIdx].name;
  const lim = ((S.g('user.limitations') || []).concat(S.g('user.injuries') || [])).map(function(l) {
    return String((typeof l === 'string' ? l : (l.joint || l.id || '')) || '').toLowerCase();
  });
  const reason = lim.some(function(j) { return j.indexOf('shoulder') >= 0; }) ? 'shoulder' : '';
  const subs = SplitEngine.rankSubstitutes(name, reason).filter(function(s) {
    return typeof Equipment === 'undefined' || (Equipment.canPerform(s.name) && Equipment.jointOk(s.name));
  });
  if (!subs.length) { toast('No good substitute for this one — machine or bodyweight options may need equipment setup', 'warn'); return; }
  const body =
    '<div style="font-size:12px;color:var(--txt3);margin-bottom:12px">Ranked by how closely each one matches ' + esc(name) + ' — muscles hit, difficulty, and your injuries.</div>' +
    subs.map(function(s) {
      const barColor = s.pct >= 80 ? 'var(--c3)' : s.pct >= 60 ? 'var(--c1)' : 'var(--c5)';
      return '<div onclick="_doSwapExercise(' + exIdx + ',' + jsArg(s.name) + ')" ' +
        'style="padding:12px 14px;border-radius:14px;margin-bottom:8px;cursor:pointer;touch-action:manipulation;' +
        'background:var(--bg3);border:1.5px solid ' + (s.best ? 'var(--c1)' : 'var(--border)') + '">' +
        '<div style="display:flex;align-items:center;gap:8px">' +
        '<div style="display:flex;color:var(--c1)">' + (typeof exChromeIcon === 'function' ? exChromeIcon(s.name, 18) : '') + '</div>' +
        '<div style="flex:1;font-size:14px;font-weight:700;color:var(--txt)">' + esc(s.name) + '</div>' +
        (s.best ? '<span style="font-size:10px;font-weight:800;background:rgba(var(--c1-rgb),0.15);color:var(--c1);padding:3px 8px;border-radius:8px;letter-spacing:0.04em">BEST SWAP</span>' : '') +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:10px;margin-top:8px">' +
        '<div style="flex:1;height:5px;background:var(--bg4);border-radius:3px;overflow:hidden">' +
        '<div style="width:' + s.pct + '%;height:100%;background:' + barColor + '"></div></div>' +
        '<div style="font-size:12px;font-weight:800;color:' + barColor + ';min-width:56px;text-align:right">' + s.pct + '% match</div>' +
        '</div>' +
        (s.why.length ? '<div style="font-size:11px;color:var(--txt3);margin-top:5px">' + esc(s.why.join(' · ')) + '</div>' : '') +
        '</div>';
    }).join('');
  modal('Swap: ' + name, body, '<button type="button" class="btn btn-ghost mt-8" onclick="closeModal()" >Keep original</button>');
};

window._doSwapExercise = function(exIdx, newName) {
  if (!_wkt || !_wkt.exercises[exIdx]) return;
  _wkt.exercises[exIdx].name = newName;
  if (typeof ExDB !== 'undefined' && ExDB.stamp) ExDB.stamp(_wkt.exercises[exIdx]);
  _checkpointWorkout(true);
  closeModal();
  toast('Swapped in ' + newName, 'ok');
  go('active');
};

window.confirmFinishWorkout = function() {
  const user = S.g('user') || {};
  const totalSets = _wkt.exercises.reduce(function(a,ex){return a+(ex.sets||[]).filter(function(s){return s.done;}).length;},0);
  const prs = _wkt.exercises.reduce(function(a,ex){
    return a + (ex.sets||[]).filter(function(s){return s._isPR;}).length;
  },0);
  const totalVol = _wkt.exercises.reduce(function(a,ex){
    return a + (ex.sets||[]).filter(function(s){return s.done;}).reduce(function(b,s){return b+((s.weight||0)*(s.reps||0));},0);
  },0);

  modal('Finish Workout?',
    '<div style="text-align:center;padding:8px 0 20px">' +
    '<div style="width:56px;height:56px;margin:0 auto 12px;border-radius:16px;background:rgba(var(--c1-rgb),0.12);display:flex;align-items:center;justify-content:center">'+icon('dumbbell',28)+'</div>' +
    '<div style="font-size:20px;font-weight:800;color:var(--txt);margin-bottom:4px">'+esc(_wkt.name)+'</div>' +
    '<div  class="muted-13">'+fmtMins(Math.round(_wktElapsed/60))+' · '+totalSets+' sets</div>' +
    '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px">' +
    '<div style="background:var(--bg3);border-radius:12px;padding:12px;text-align:center">' +
    '<div style="font-size:20px;font-weight:800;color:var(--c1)">'+totalSets+'</div>' +
    '<div  class="micro-label type-caption-mt">Sets</div></div>' +
    '<div style="background:var(--bg3);border-radius:12px;padding:12px;text-align:center">' +
    '<div style="font-size:20px;font-weight:800;color:var(--txt)">'+(usesImperial(user)?Math.round(totalVol*2.2046226218)+'lb':(totalVol>1000?round2(totalVol/1000)+'t':totalVol+'kg'))+'</div>' +
    '<div  class="micro-label type-caption-mt">Volume</div></div>' +
    '<div style="background:var(--bg3);border-radius:12px;padding:12px;text-align:center">' +
    '<div style="font-size:20px;font-weight:800;color:#ffd60a">'+prs+'</div>' +
    '<div  class="micro-label type-caption-mt">PRs</div></div>' +
    '</div>' +
    '<div class="field-wrap mb-8">' +
    '<label class="field-label">Workout Notes</label>' +
    '<textarea id="wkt-final-note" class="field" placeholder="Overall feeling, energy, anything to remember..." style="height:80px;resize:none;font-size:14px"></textarea>' +
    '</div>' +
    (_wkt.painLog ? '<div class="field-wrap mb-8"><label class="field-label">Shoulder 0–10 (push/pull early warning)</label>' +
      '<input id="wkt-shoulder" class="field" type="number" min="0" max="10" step="1" inputmode="numeric" value="0" style="font-size:18px;font-weight:700">' +
      '<div class="muted-12" style="margin-top:6px">0 is none. 7+ means stop that lift and use an alternative next time.</div></div>' : ''),
    '<button type="button" class="btn btn-primary" onclick="saveWorkout()" style="margin-top:4px">💾 Save Workout</button>' +
    '<button type="button" class="btn btn-secondary mt-8" onclick="closeModal()" >Keep Training</button>'
  );
};

window.saveWorkout = function() {
  haptic([50, 50, 100]);
  clearInterval(_wktTimer);
  clearInterval(_restInterval);
  const finalNote = (document.getElementById('wkt-final-note')||{}).value || '';
  const shoulderEl = document.getElementById('wkt-shoulder');
  if (shoulderEl) _wkt.shoulderPain = Number(shoulderEl.value) || 0;
  const totalVol = _wkt.exercises.reduce(function(a,ex){
    return a + (ex.sets||[]).filter(function(s){return s.done;}).reduce(function(b,s){return b+((s.weight||0)*(s.reps||0));},0);
  },0);
  const workout = {
    id: _wkt.id || ('wkt_' + Date.now()),
    name: _wkt.name,
    date: today(),
    startedAt: new Date(_wkt.startTime || Date.now()).toISOString(),
    endedAt: new Date().toISOString(),
    duration: Math.round(_wktElapsed / 60),
    totalVol: totalVol,
    exercises: _wkt.exercises,
    notes: finalNote,
    exerciseNotes: Object.assign({}, _wktNotes),
    splitDay: SplitEngine.todayDayNumber(),
    planKey: _wkt.planKey || null,
    shoulderPain: _wkt.shoulderPain,
    stopFlag: !!_wkt.stopFlag
  };
  const workouts = S.g('workouts') || [];
  if (!workouts.some(function(w) { return w.id === workout.id; })) workouts.push(workout);
  if (S.set('workouts', workouts) === false) return;
  S.set('activeWorkoutDraft', null);
  if (typeof TrainingPlanEngine !== 'undefined' && TrainingPlanEngine.hasActive()) {
    const planMsgs = TrainingPlanEngine.onFinish(workout);
    if (planMsgs && planMsgs.length) {
      setTimeout(function() { toast(planMsgs[0], 'ok', 5000); }, 1800);
    }
  }
  /* Strength programs: advance working weights / training max */
  const progMsgs = (typeof TrainingPlanEngine === 'undefined' || !TrainingPlanEngine.hasActive()) && typeof ProgramEngine !== 'undefined' ? ProgramEngine.onFinish(workout) : null;
  if (progMsgs && progMsgs.length) {
    setTimeout(function() { toast(progMsgs[0], 'ok', 5000); }, 1800);
  }
  if (typeof SessionRecap !== 'undefined') {
    const recap = SessionRecap.build(workout);
    SessionRecap.store(recap);
  }
  if (typeof WakeLock !== 'undefined') WakeLock.release();
  if (typeof VoiceLogger !== 'undefined') VoiceLogger.stop();
  SplitEngine.nextDay();
  AchEngine.check();
  _wkt = null;
  _wktElapsed = 0;
  _wktNotes = {};
  _focusMode = false;
  closeModal();
  const prCount = workout.exercises.reduce(function(a,ex){
    return a + (ex.sets||[]).filter(function(s){return s._isPR;}).length;
  },0);
  toast('In the books.' + (prCount>0?' '+prCount+' PR'+(prCount>1?'s':''):'') , 'ok', 4000);
  /* Streak milestone? */
  const streakNow = StreakEngine.get();
  if (StreakEngine.MILESTONES.indexOf(streakNow) !== -1 && typeof celebrate === 'function') {
    setTimeout(function() {
      celebrate('🔥', streakNow + '-day streak', 'Most people quit by now. You didn\'t.', 2600);
    }, 900);
  }
  go('dashboard');
};

function _startWktTimer() {
  clearInterval(_wktTimer);
  if (_wkt && !_wkt.startTime) _wkt.startTime = Date.now() - (_wktElapsed * 1000);
  _wktElapsed = _wkt && _wkt.startTime ? Math.max(0, Math.floor((Date.now() - _wkt.startTime) / 1000)) : 0;
  _wktTimer = setInterval(function() {
    _wktElapsed = _wkt && _wkt.startTime ? Math.max(0, Math.floor((Date.now() - _wkt.startTime) / 1000)) : _wktElapsed + 1;
    const el = document.getElementById('wkt-timer-display');
    if (el) el.textContent = fmtTime(_wktElapsed);
    if (_wktElapsed % 30 === 0) _checkpointWorkout(true);
  }, 1000);
}

window.startWorkout = function(templateName) {
  haptic(50);
  if (_workoutDraft()) {
    modal('Workout already in progress',
      '<div class="body-13">Resume or discard the saved workout before starting another.</div>',
      '<button type="button" class="btn btn-primary mt-14" onclick="closeModal();resumeWorkoutDraft()">Resume workout</button>' +
      '<button type="button" class="btn btn-secondary mt-8" onclick="closeModal()">Cancel</button>');
    return;
  }
  const planActive = typeof TrainingPlanEngine !== 'undefined' && TrainingPlanEngine.hasActive();
  if (!planActive && typeof ProgramEngine !== 'undefined' && ProgramEngine.needsWeightConfirm && ProgramEngine.needsWeightConfirm()) {
    showProgramWeightSetup();
    return;
  }
  const user = S.g('user') || {};
  const goal = user.goal || 'hypertrophy';
  const rec = GUIDANCE.setsReps(goal);
  const defaultSets = goal === 'strength' ? 5 : 4;
  let splitDay = SplitEngine.getSplitDay();
  let exercises;
  let planMeta = null;

  if (planActive) {
    planMeta = TrainingPlanEngine.prescribeSession();
    if (!planMeta) {
      toast((TrainingPlanEngine.todaySession() || {}).reason || 'Rest day on this plan', 'ok', 4000);
      go('my-plan');
      return;
    }
    splitDay = { n: planMeta.name, exercises: (planMeta.exercises || []).map(function(e) { return e.name; }), warmup: planMeta.warmup || [] };
    exercises = planMeta.exercises;
  } else {
    exercises = (splitDay.exercises || []).map(function(name) {
      const ex = ExDB.byName(name);
      const rx = typeof ProgramEngine !== 'undefined' ? ProgramEngine.prescribe(name, user) : null;
      if (rx) return ExDB.stamp({ name: name, sets: rx.sets, rxNote: rx.note, muscles: ex ? ex.muscles : { primary:[], secondary:[] } });
      const sets = [];
      for (var i = 0; i < defaultSets; i++) {
        const suggest = WeightEngine.suggest(name, user);
        sets.push({ weight: suggest || 0, reps: parseInt(rec.reps.split('-')[0]) || 8, done: false });
      }
      return ExDB.stamp({ name: name, sets: sets, muscles: ex ? ex.muscles : { primary:[], secondary:[] } });
    });
  }
  (exercises || []).forEach(function(ex) { ExDB.stamp(ex); });

  _wkt = {
    id: 'wkt_' + Date.now(),
    name: splitDay.n || 'Workout',
    exercises: exercises,
    startTime: Date.now(),
    planKey: planMeta ? planMeta.planKey : null,
    painLog: !!(planMeta && planMeta.painLog),
    cardio: planMeta ? planMeta.cardio : null,
    planWarmup: planMeta ? planMeta.warmup : (splitDay.warmup || [])
  };
  _wktNotes = {};
  _supersetMode = false;
  _quickMode = false;
  _focusMode = false;
  _startWktTimer();
  _checkpointWorkout(true);
  if (typeof WakeLock !== 'undefined') WakeLock.request();
  if (typeof GymFloor !== 'undefined') GymFloor.apply();
  go('active');
};

window.startQuickWorkout = function() {
  haptic(50);
  if (typeof TrainingPlanEngine !== 'undefined' && TrainingPlanEngine.hasActive()) {
    startWorkout();
    return;
  }
  if (_workoutDraft()) {
    toast('Resume or discard the current workout first', 'warn');
    go('workout');
    return;
  }
  const splitDay = SplitEngine.getSplitDay();
  const user = S.g('user') || {};
  const goal = user.goal || 'hypertrophy';
  const rec = GUIDANCE.setsReps(goal);
  const exercises = (splitDay.exercises || []).slice(0, 4).map(function(name) {
    const sets = [];
    for (var i = 0; i < 3; i++) {
      const suggest = WeightEngine.suggest(name, user);
      sets.push({ weight: suggest || 0, reps: parseInt(rec.reps.split('-')[0]) || 8, done: false });
    }
    return { name: name, sets: sets, muscles: {} };
  });
  exercises.forEach(function(ex) { ExDB.stamp(ex); });
  _wkt = { id: 'wkt_' + Date.now(), name: 'Quick — ' + (splitDay.n || 'Workout'), exercises: exercises, startTime: Date.now() };
  _wktNotes = {};
  _quickMode = true;
  _startWktTimer();
  _checkpointWorkout(true);
  if (typeof WakeLock !== 'undefined') WakeLock.request();
  go('active');
};

if (typeof registerRouteCleanup === 'function') {
  registerRouteCleanup('active', function() {
    clearInterval(_wktTimer);
    clearInterval(_restInterval);
    if (typeof RestNotify !== 'undefined') RestNotify.stop();
    if (typeof WakeLock !== 'undefined') WakeLock.release();
    if (typeof VoiceLogger !== 'undefined') VoiceLogger.stop();
    _checkpointWorkout(true);
  });
}

/* ── Rest Timer ── */
window.startRestTimer = function(secs) {
  clearInterval(_restInterval);
  _restDuration = Number(secs) || 0;
  _restEndsAt = Date.now() + _restDuration * 1000;
  _restRemaining = _restDuration;
  const sheet = document.getElementById('rest-sheet');
  if (sheet) sheet.style.transform = 'translateY(0)';
  if (typeof RestNotify !== 'undefined') RestNotify.start(secs);
  function tick() {
    const remaining = Math.max(0, Math.ceil((_restEndsAt - Date.now()) / 1000));
    _restRemaining = remaining;
    const cd = document.getElementById('rest-countdown');
    if (cd) cd.textContent = fmtTime(remaining);
    const ring = document.getElementById('rest-ring');
    if (ring && _restDuration > 0) {
      const circ = 276.5;
      const pct = Math.max(0, remaining / _restDuration);
      ring.style.strokeDashoffset = circ * (1 - pct);
    }
    if (remaining <= 0) {
      clearInterval(_restInterval);
      _restInterval = null;
      haptic([100, 50, 100, 50, 200]);
      const sheet2 = document.getElementById('rest-sheet');
      if (sheet2) setTimeout(function(){sheet2.style.transform='translateY(100%)';},1200);
    }
  }
  tick();
  _restInterval = setInterval(tick, 250);
  document.addEventListener('visibilitychange', window._restOnVisible);
};
window._restOnVisible = function() {
  if (!document.hidden && _restEndsAt) {
    const remaining = Math.max(0, Math.ceil((_restEndsAt - Date.now()) / 1000));
    _restRemaining = remaining;
    const cd = document.getElementById('rest-countdown');
    if (cd) cd.textContent = fmtTime(remaining);
  }
};
window._restTimerState = function() {
  return {
    endsAt: _restEndsAt,
    remaining: Math.max(0, Math.ceil((_restEndsAt - Date.now()) / 1000)),
    duration: _restDuration
  };
};
window._restTimerShift = function(ms) {
  _restEndsAt -= ms;
  if (typeof window._restOnVisible === 'function') window._restOnVisible();
};

window.skipRest = function() {
  clearInterval(_restInterval);
  _restEndsAt = 0;
  if (typeof RestNotify !== 'undefined') RestNotify.stop();
  const sheet = document.getElementById('rest-sheet');
  if (sheet) sheet.style.transform = 'translateY(100%)';
};

window.addRestTime = function(secs) {
  _restEndsAt += secs * 1000;
  _restDuration += secs;
  _restRemaining = Math.max(0, Math.ceil((_restEndsAt - Date.now()) / 1000));
  const cd = document.getElementById('rest-countdown');
  if (cd) cd.textContent = fmtTime(_restRemaining);
};

window.stopRestTimer = function() {
  clearInterval(_restInterval);
  _restInterval = null;
  _restEndsAt = 0;
  if (typeof RestNotify !== 'undefined') RestNotify.stop();
};

window.insertWarmupSets = function(exIdx) {
  if (!_wkt || !_wkt.exercises[exIdx]) return;
  const ex = _wkt.exercises[exIdx];
  if (typeof isBarbellExercise === 'function' && !isBarbellExercise(ex.name)) {
    toast('Warm-up ramp is for barbell compounds', 'info');
    return;
  }
  const workW = (ex.sets && ex.sets[0] && ex.sets[0].weight) || WeightEngine.suggest(ex.name, S.g('user') || {}) || 60;
  const warmups = WeightEngine.warmupSets(workW);
  if (ex._warmupsInserted) { toast('Warm-ups already added', 'info'); return; }
  const wuSets = warmups.map(function(w) {
    return { weight: w.weight, reps: w.reps, done: false, _warmup: true };
  });
  ex.sets = wuSets.concat(ex.sets || []);
  ex._warmupsInserted = true;
  _checkpointWorkout(true);
  toast('Warm-up ramp loaded', 'ok');
  go('active');
};

window.toggleExInfo = function(exIdx) {
  const el = document.getElementById('ex-info-'+exIdx);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

/* ── Exercise Picker ── */
window.showExercisePicker = function(grp) {
  const groups = ['chest','back','legs','shoulders','biceps','triceps','core','glutes','fullbody','sports','plyometrics'];
  const curGrp = grp || 'chest';
  let exercises = ExDB.byGroup(curGrp);
  if (typeof Equipment !== 'undefined') {
    exercises = exercises.filter(function(ex) {
      return Equipment.canPerform(ex) && Equipment.jointOk(ex);
    });
  }
  window._exercisePickerItems = exercises;
  const tabs = groups.map(g =>
    '<button type="button" class="cap-tab pill'+(g===curGrp?' on':'')+'" role="tab" aria-selected="'+(g===curGrp)+'" onclick="showExercisePicker(\''+g+'\')">'+g.charAt(0).toUpperCase()+g.slice(1)+'</button>'
  ).join('');
  const list = exercises.map(function(ex, idx) { return (
    '<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid var(--border)">' +
    '<div style="display:flex;color:var(--c1)">'+(typeof exChromeIcon==='function'?exChromeIcon(ex,24):'')+'</div>' +
    '<div  class="flex-1"><div  class="row-title-14">'+esc(ex.n)+'</div>' +
    '<div  class="muted-12">'+esc(ex.pri)+(ex.sec?', '+ex.sec:'')+'</div></div>' +
    '<button type="button" style="font-size:12px;color:var(--c1);background:none;border:none;cursor:pointer;padding:8px;font-weight:700" onclick="addExerciseToWorkoutByIndex('+idx+')">+ Add</button>' +
    '</div>'
  ); }).join('');
  modal('Exercise Library',
    '<div class="cap-tab-bar cap-tab-bar--flush" role="tablist" aria-label="Muscle groups" style="margin-bottom:4px">'+tabs+'</div>' + list);
};
window.addExerciseToWorkoutByIndex = function(idx) {
  const ex = (window._exercisePickerItems || [])[Number(idx)];
  if (ex && ex.n) addExerciseToWorkout(ex.n);
};

window.addExerciseToWorkout = function(name) {
  if (!_wkt) {
    closeModal();
    toast('Start a workout first', 'warn');
    return;
  }
  const user = S.g('user') || {};
  const suggested = WeightEngine.suggest(name, user);
  const sets = Array.from({length:4}, (_, i) => ({ setNum:i+1, weight:suggested||'', reps:'', done:false }));
  _wkt.exercises.push(ExDB.stamp({ name: name, sets: sets, muscles: (ExDB.byName(name) || {}).muscles || {} }));
  _checkpointWorkout(true);
  closeModal();
  go('active');
};

window.svgCheck = function() {
  return '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
};

/* ── Exercise Detail Modal ── */
function showExerciseDetail(name) {
  const ex = ExDB.byName(name);
  if (!ex) return;
  const goal = S.g('user.goal') || 'hypertrophy';
  const rec = GUIDANCE.setsReps(goal);
  const diff = GUIDANCE.diffLabel(ex.diff);
  const needsSpotter = GUIDANCE.needsSpotter(name);
  const supersetWith = GUIDANCE.supersets[ex.grp] || [];
  const techs = GUIDANCE.techniques(goal);

  const html =
    (typeof ExerciseLibrary !== 'undefined' ? ExerciseLibrary.mediaHTML(ex, { height: 180 }) : '') +

    '<div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">' +
    '<div style="display:flex;color:var(--c1)">'+(typeof exChromeIcon==='function'?exChromeIcon(ex,40):'')+'</div>' +
    '<div>' +
    '<div style="font-size:19px;font-weight:800;color:var(--txt)">'+esc(ex.n)+'</div>' +
    '<div style="font-size:12px;color:'+diff.c+';font-weight:700;text-transform:uppercase;letter-spacing:0.06em;margin-top:4px">'+diff.l+'</div>' +
    '<div  class="muted-12 mt-2">'+esc(ex.pri)+(ex.sec?' · '+ex.sec:'')+'</div>' +
    '</div></div>' +

    (needsSpotter || ex.assistanceRequired ?
      '<div style="background:rgba(255,69,58,0.1);border:1px solid rgba(255,69,58,0.25);border-radius:12px;padding:12px;margin-bottom:14px;display:flex;gap:10px">' +
      '<span style="display:flex;color:var(--danger)">'+(typeof icon==='function'?icon('alert',18,'var(--danger)'):'!')+'</span>' +
      '<div style="font-size:13px;color:var(--danger);line-height:1.5">' +
      (needsSpotter ? '<strong>Spotter recommended</strong> for this exercise. Do not attempt heavy sets alone.' :
        '<strong>Assistance required.</strong> Ensure proper coaching before loading.') +
      '</div></div>' : '') +

    '<div style="background:rgba(var(--c1-rgb),0.06);border:1px solid rgba(var(--c1-rgb),0.15);border-radius:14px;padding:14px;margin-bottom:14px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--c1);margin-bottom:10px">Coach Recommendation for '+esc(goal.replace('_',' '))+'</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">' +
    _recStat2('📦','Sets',rec.sets) +
    _recStat2('🔁','Reps',rec.reps) +
    _recStat2('⏱️','Rest',rec.rest) +
    _recStat2('🎵','Tempo',rec.tempo) +
    '</div>' +
    '<div style="font-size:12px;color:var(--txt2);margin-top:10px;font-style:italic">💡 '+esc(rec.note)+'</div>' +
    '</div>' +

    '<div  class="mb-14">' +
    '<div  class="type-caption type-caption-mb-xs">Setup</div>' +
    '<div class="body-14">'+esc(ex.setup)+'</div>' +
    '</div>' +

    '<div  class="mb-14">' +
    '<div  class="type-caption type-caption-mb-xs">Coaching Cues</div>' +
    '<div class="body-14">'+esc(ex.cues)+'</div>' +
    '</div>' +
    (ex.met ? '<div class="banner" style="margin-bottom:14px">Effort ~' + esc(String(ex.met)) + ' MET — Compendium estimate' + (ex.metSource ? ' (' + esc(ex.metSource) + ')' : '') + '. Not a calorie total. Assumes a typical pace.</div>' : '') +
    (ex.sessionNote ? '<div class="muted-12" style="margin-bottom:14px">' + esc(ex.sessionNote) + '</div>' : '') +

    '<div  class="mb-14">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--warn);margin-bottom:6px">Common Mistakes</div>' +
    '<div class="body-14">'+esc(ex.mistakes)+'</div>' +
    '</div>' +

    '<div  class="mb-14">' +
    '<div  class="type-caption type-caption-mb-xs">Breathing</div>' +
    '<div style="font-size:14px;color:var(--txt2)">'+esc(ex.breathing)+'</div>' +
    '</div>' +

    '<div  class="mb-14">' +
    '<div  class="type-caption type-caption-mb-xs">Intensity Techniques</div>' +
    techs.slice(0,2).map(function(t) {
      return '<div style="font-size:13px;color:var(--txt2);padding:6px 0;border-bottom:1px solid var(--border)">⚡ '+esc(t)+'</div>';
    }).join('') +
    '</div>' +

    (supersetWith.length ?
      '<div  class="mb-14">' +
      '<div  class="type-caption type-caption-mb-xs">Superset With</div>' +
      supersetWith.slice(0,2).map(function(s) {
        return '<div style="font-size:13px;color:var(--c1);padding:6px 0;border-bottom:1px solid var(--border)">🔗 '+esc(s)+'</div>';
      }).join('') +
      '</div>' : '') +

    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">' +
    '<div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--success);margin-bottom:6px">Progressions</div>' +
    (ex.progressions||[]).map(function(p){return '<div style="font-size:12px;color:var(--txt2);padding:3px 0">↑ '+esc(p)+'</div>';}).join('') +
    '</div>' +
    '<div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--warn);margin-bottom:6px">Regressions</div>' +
    (ex.regressions||[]).map(function(r){return '<div style="font-size:12px;color:var(--txt2);padding:3px 0">↓ '+esc(r)+'</div>';}).join('') +
    '</div></div>' +

    '<div style="margin-bottom:4px">' +
    '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--txt3);margin-bottom:8px">Joint Stress</div>' +
    '<div style="display:flex;flex-wrap:wrap;gap:6px">' +
    Object.entries(ex.joint||{}).filter(function(e){return e[1]>0;}).map(function(e){
      const j = e[0], v = e[1];
      const c = v >= 3 ? 'var(--danger)' : v >= 2 ? 'var(--warn)' : 'var(--success)';
      return '<div style="background:rgba(0,0,0,0.2);border:1px solid '+c+';border-radius:8px;padding:4px 10px;font-size:11px;font-weight:600;color:'+c+'">' +
        j.charAt(0).toUpperCase()+j.slice(1)+' ●'.repeat(v)+'</div>';
    }).join('') +
    '</div></div>';

  modal(ex.n, html,
    '<div style="display:flex;gap:10px;margin-top:16px">' +
    '<button type="button" class="btn btn-primary flex-1" onclick="closeModal()" >Got it</button>' +
    '</div>'
  );
}
window.showExerciseDetail = showExerciseDetail;

function _recStat2(icon, label, val) {
  return '<div style="background:rgba(255,255,255,0.04);border-radius:10px;padding:10px;text-align:center">' +
    '<div class="fs-18">'+icon+'</div>' +
    '<div style="font-size:14px;font-weight:700;color:var(--c1);margin-top:4px">'+esc(val)+'</div>' +
    '<div style="font-size:10px;color:var(--txt3);margin-top:2px;text-transform:uppercase;letter-spacing:0.06em">'+esc(label)+'</div>' +
    '</div>';
}

/* ── Custom Exercise Adding ── */
function showAddCustomExercise() {
  const groups = ['chest','back','legs','shoulders','biceps','triceps','core','glutes','forearms','cardio','fullbody'];
  modal('Add Custom Exercise',
    '<div class="field-wrap"><label class="field-label">Exercise Name *</label>' +
    '<input id="cx-name" class="field" type="text" maxlength="80" placeholder="e.g. Smith Machine Row"></div>' +

    '<div class="field-wrap"><label class="field-label">Muscle Group *</label>' +
    '<div class="select-wrap"><select id="cx-grp" class="field">' +
    groups.map(function(g){return '<option value="'+g+'">'+g.charAt(0).toUpperCase()+g.slice(1)+'</option>';}).join('') +
    '</select></div></div>' +

    '<div class="field-wrap"><label class="field-label">Primary Muscle</label>' +
    '<input id="cx-pri" class="field" type="text" maxlength="80" placeholder="e.g. Lats"></div>' +

    '<div class="field-wrap"><label class="field-label">Coaching Cues</label>' +
    '<input id="cx-cues" class="field" type="text" maxlength="500" placeholder="Key technique points"></div>' +

    '<div class="field-wrap"><label class="field-label">Equipment</label>' +
    '<div class="select-wrap"><select id="cx-eq" class="field">' +
    '<option value="barbell">Barbell</option><option value="dumbbell">Dumbbell</option>' +
    '<option value="cables">Cables</option><option value="machine">Machine</option>' +
    '<option value="bands">Bands</option><option value="">Bodyweight</option>' +
    '</select></div></div>' +

    '<div class="field-wrap"><label class="field-label">Difficulty</label>' +
    '<div  class="flex-gap-8">' +
    '<button type="button" class="btn btn-secondary btn-sm cx-diff-btn" onclick="setCxDiff(1,this)">Beginner</button>' +
    '<button type="button" class="btn btn-secondary btn-sm cx-diff-btn" onclick="setCxDiff(2,this)">Intermediate</button>' +
    '<button type="button" class="btn btn-secondary btn-sm cx-diff-btn" onclick="setCxDiff(3,this)">Advanced</button>' +
    '</div></div>',

    '<button type="button" class="btn btn-primary mt-14" onclick="saveCustomExercise()">Add Exercise</button>'
  );
  window._cxDiff = 1;
}
window.showAddCustomExercise = showAddCustomExercise;

window.setCxDiff = function(d, btn) {
  window._cxDiff = d;
  document.querySelectorAll('.cx-diff-btn').forEach(function(b){b.style.background='var(--bg4)';b.style.color='var(--txt)';});
  if (btn) { btn.style.background='var(--grad)'; btn.style.color='#fff'; }
};

window.saveCustomExercise = function() {
  const name = (document.getElementById('cx-name')||{}).value||'';
  const grp  = (document.getElementById('cx-grp')||{}).value||'chest';
  const pri  = (document.getElementById('cx-pri')||{}).value||'Custom';
  const cues = (document.getElementById('cx-cues')||{}).value||'Focus on form';
  const eq   = (document.getElementById('cx-eq')||{}).value||'';
  const allowedGroups = ['chest','back','legs','shoulders','biceps','triceps','core','glutes','forearms','cardio','fullbody'];
  const allowedEquipment = ['barbell','dumbbell','cables','machine','bands',''];
  const cleanName = name.trim().slice(0, 80);
  if (!cleanName) { toast('Enter exercise name','warn'); return; }
  if (!allowedGroups.includes(grp) || !allowedEquipment.includes(eq)) { toast('Choose valid exercise options','warn'); return; }
  if (ExDB.byName(cleanName)) { toast('Exercise already exists','warn'); return; }
  const custom = {
    n:cleanName, grp:grp, diff:[1,2,3].includes(window._cxDiff) ? window._cxDiff : 1,
    bw:!eq, eq:eq?[eq]:[],
    pri:(pri||'Custom').trim().slice(0,80), sec:'',
    cues:(cues||'Focus on form').trim().slice(0,500), setup:'Set up as needed', breathing:'Exhale exertion',
    mistakes:'Maintain form', joint:{shoulder:0,elbow:0,knee:0,spine:0,hip:0},
    cns:1, muscles:{primary:[grp],secondary:[]},
    regressions:[], progressions:[], met:4.0, tempoRec:'2-0-1-0',
    custom:true, id: ExDB.slug(cleanName)
  };
  const saved = (S.g('customExercises') || []).slice();
  saved.push(custom);
  if (S.set('customExercises', saved) === false) return;
  ExDB.db.push(custom);
  if (typeof ExDB.invalidateIndex === 'function') ExDB.invalidateIndex();
  closeModal();
  toast(cleanName+' added', 'ok');
};

function loadCustomExercises() {
  const saved = S.g('customExercises') || [];
  saved.forEach(function(ex) {
    if (ex && typeof ex.n === 'string' && ex.n.length <= 80 && !ExDB.byName(ex.n)) {
      if (!ex.id) ex.id = ExDB.slug(ex.n);
      ExDB.db.push(ex);
      ExDB.invalidateIndex();
    }
  });
}
window.loadCustomExercises = loadCustomExercises;

/* ── Browse Exercises Screen ── */
function showBrowseExercises(filterGrp, filterQuery) {
  const grp = filterGrp || '';
  const query = filterQuery || '';
  const groups = ['all','chest','back','legs','shoulders','biceps','triceps','core','glutes','cardio','sports','plyometrics','fullbody','forearms'];

  let exercises = typeof EquipmentDB !== 'undefined' ? EquipmentDB.filterExercises(ExDB.db) : ExDB.db;
  if (grp && grp !== 'all') exercises = exercises.filter(function(e){return e.grp===grp;});
  if (query) exercises = exercises.filter(function(e){
    return e.n.toLowerCase().includes(query.toLowerCase()) || (e.pri||'').toLowerCase().includes(query.toLowerCase());
  });
  if (typeof InjuriesDB !== 'undefined') {
    exercises = exercises.filter(function(e) { return !InjuriesDB.shouldAvoidExercise(e.n).avoid; });
  }

  const filterTabs = '<div class="cap-tab-bar" role="tablist" aria-label="Exercise groups">' +
    groups.map(function(g) {
      const active = (grp||'all') === g;
      return '<button type="button" class="cap-tab' + (active ? ' on' : '') + '" role="tab" aria-selected="' + active + '" onclick="showBrowseExercises('+jsArg(g)+','+jsArg(query)+')">' +
        g.charAt(0).toUpperCase()+g.slice(1)+'</button>';
    }).join('') + '</div>';

  const searchBar = '<div class="pad-x-16-b12">' +
    '<input class="field" type="text" placeholder="Search exercises..." value="'+esc(query)+'" ' +
    'oninput="showBrowseExercises(\''+esc(grp||'all')+'\',this.value)" ' +
    'style="padding:12px 16px"></div>';

  const exList = exercises.slice(0,80).map(function(ex) {
    const diff = GUIDANCE.diffLabel(ex.diff);
    const needsSpot = GUIDANCE.needsSpotter(ex.n);
    return '<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-bottom:1px solid var(--border);cursor:pointer;touch-action:manipulation" onclick="showExerciseDetail('+jsArg(ex.n)+')">' +
      '<div style="width:36px;display:flex;justify-content:center;color:var(--c1)">'+(typeof exChromeIcon==='function'?exChromeIcon(ex,22):'')+'</div>' +
      '<div  class="flex-1">' +
      '<div style="display:flex;align-items:center;gap:6px">' +
      '<div  class="row-title-14">'+esc(ex.n)+'</div>' +
      (ex.custom ? '<span style="font-size:10px;background:rgba(var(--c1-rgb),0.15);color:var(--c1);border-radius:4px;padding:2px 6px;font-weight:700">CUSTOM</span>' : '') +
      '</div>' +
      '<div style="font-size:12px;margin-top:2px">' +
      '<span style="color:'+diff.c+';font-weight:600">'+diff.l+'</span>' +
      '<span class="c-muted"> · '+esc(ex.pri)+'</span>' +
      (needsSpot ? '<span style="color:var(--danger);font-weight:700"> · Spotter</span>' : '') +
      '</div></div>' +
      '<div style="color:var(--txt3);font-size:16px">›</div>' +
      '</div>';
  }).join('');

  const v = document.getElementById('view');
  if (!v) return;
  v.scrollTop = 0;
  const div = document.createElement('div');
  div.className = 'screen';
  div.innerHTML =
    '<div class="topbar"><div class="topbar-title">Exercise Library</div>' +
    '<div class="topbar-right"><button type="button" class="topbar-icon press" onclick="go(\'workout\')">✕</button></div></div>' +
    filterTabs + searchBar +
    '<div style="font-size:12px;color:var(--txt3);padding:0 16px 8px">'+exercises.length+' exercises</div>' +
    exList +
    '<div  class="pad-16"><button type="button" class="btn btn-secondary" onclick="showAddCustomExercise()">+ Add Custom Exercise</button></div>' +
    '<div  class="spacer-bottom"></div>';
  v.innerHTML = '';
  v.appendChild(div);
  if (typeof upgradeInteractiveMarkup === 'function') upgradeInteractiveMarkup(div);

  const nav = document.getElementById('nav');
  if (nav) nav.style.display = 'flex';
}
window.showBrowseExercises = showBrowseExercises;

/* ── Cardio stat tile helper ── */
function _cStat(_ignored, label, val) {
  return '<div style="background:rgba(0,0,0,0.2);border-radius:10px;padding:8px;text-align:center">' +
    '<div  class="row-title">'+val+'</div>' +
    '<div style="font-size:10px;color:var(--txt3);margin-top:1px;text-transform:uppercase;letter-spacing:0.06em">'+label+'</div>' +
    '</div>';
}

/* ── Cardio Protocol Detail ── */
window.showCardioProtocol = function(key) {
  const p = CARDIO_PROTOCOLS[key];
  if (!p) return;

  const diffLabel = p.difficulty >= 3 ? 'Advanced' : p.difficulty === 2 ? 'Intermediate' : 'Beginner';
  const diffColor = p.difficulty >= 3 ? 'var(--danger)' : p.difficulty === 2 ? 'var(--warn)' : 'var(--success)';

  const protocolCards = p.protocols.map(function(pr, i) {
    return '<div style="background:var(--bg4);border-radius:14px;padding:14px;margin-bottom:12px;border:1px solid var(--border)">' +
      '<div style="font-size:15px;font-weight:800;color:var(--txt);margin-bottom:8px">'+esc(pr.name)+'</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:10px">' +
      (pr.work && pr.rest ? _cStat('','Intervals',fmtTime(pr.work)+' / '+fmtTime(pr.rest)) : '') +
      (pr.rounds ? _cStat('','Rounds',pr.rounds+'×') : '') +
      _cStat('','Total',esc(pr.totalTime)) +
      _cStat('','Intensity',esc(pr.intensity)) +
      '</div>' +
      '<div class="mb-8">' +
      '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--txt3);margin-bottom:4px">Exercises</div>' +
      pr.exercises.map(function(e){return '<div style="font-size:13px;color:var(--txt2);padding:3px 0;border-bottom:1px solid var(--border)">• '+esc(e)+'</div>';}).join('') +
      '</div>' +
      '<div class="mb-8">' +
      '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:var(--txt3);margin-bottom:4px">Equipment</div>' +
      '<div  class="body-13">'+esc(pr.equipment)+'</div>' +
      '</div>' +
      '<div style="background:rgba(var(--c1-rgb),0.06);border-radius:10px;padding:10px">' +
      '<div style="font-size:12px;color:var(--txt2);line-height:1.6">💡 '+esc(pr.notes)+'</div>' +
      '</div>' +
      '<button type="button" onclick="startCardioSession(\''+key+'\','+i+')" style="width:100%;margin-top:12px;padding:12px;border-radius:12px;background:'+p.color+';color:#fff;font-size:14px;font-weight:700;border:none;cursor:pointer;touch-action:manipulation">▶ Start This Protocol</button>' +
      '</div>';
  }).join('');

  const v = document.getElementById('view');
  if (!v) return;
  v.scrollTop = 0;
  const div = document.createElement('div');
  div.className = 'screen';
  div.innerHTML =
    '<div class="topbar">' +
    '<button type="button" class="topbar-icon press" onclick="go(\'cardio\')" style="margin-right:8px">←</button>' +
    '<div><div class="topbar-title">'+esc(p.name)+'</div>' +
    '<div class="topbar-date">'+esc(p.full)+'</div></div></div>' +

    '<div style="padding:16px;background:linear-gradient(180deg,rgba(0,0,0,0.3),transparent)">' +
    '<div style="display:flex;align-items:center;gap:14px;margin-bottom:12px">' +
    '<div style="width:56px;height:56px;border-radius:16px;background:rgba(var(--c1-rgb),0.12);display:flex;align-items:center;justify-content:center">'+icon(p.icon||'run',32,p.color)+'</div>' +
    '<div>' +
    '<div style="font-size:22px;font-weight:900;color:'+p.color+'">'+esc(p.name)+'</div>' +
    '<div  class="muted-13">'+esc(p.tagline)+'</div>' +
    '<div style="display:flex;gap:8px;margin-top:6px">' +
    '<span style="font-size:11px;font-weight:600;color:'+diffColor+';background:rgba(0,0,0,0.3);padding:3px 10px;border-radius:20px">'+diffLabel+'</span>' +
    '<span style="font-size:11px;color:var(--txt3);background:rgba(0,0,0,0.2);padding:3px 10px;border-radius:20px">'+esc(p.duration)+'</span>' +
    '</div></div></div>' +

    '<div style="font-size:13px;color:var(--txt2);line-height:1.65;background:rgba(0,0,0,0.2);border-radius:12px;padding:12px;margin-bottom:14px">' +
    esc(p.science)+'</div>' +

    sh('Protocols') +
    '<div  class="pad-x-16">'+protocolCards+'</div>' +

    sh('Warm-Up') +
    '<div class="pad-x-16-b12">' +
    p.warmup.map(function(w){return '<div style="font-size:13px;color:var(--txt2);padding:6px 0;border-bottom:1px solid var(--border)">'+esc(w)+'</div>';}).join('') +
    '</div>' +

    sh('Cool-Down') +
    '<div class="pad-x-16-b12">' +
    p.cooldown.map(function(c){return '<div style="font-size:13px;color:var(--txt2);padding:6px 0;border-bottom:1px solid var(--border)">'+esc(c)+'</div>';}).join('') +
    '</div>' +

    sh('Warnings') +
    '<div  class="pad-x-16-b">' +
    p.warnings.map(function(w){return '<div style="font-size:13px;color:var(--warn);padding:6px 0;border-bottom:1px solid var(--border)">'+esc(w)+'</div>';}).join('') +
    '</div>' +

    '</div>' +
    '<div  class="spacer-bottom"></div>';

  v.innerHTML = '';
  v.appendChild(div);
  const nav = document.getElementById('nav');
  if (nav) nav.style.display = 'flex';
};

/* ── Cardio Session Starter ── */
window.startCardioSession = function(key, protocolIdx) {
  const p = CARDIO_PROTOCOLS[key];
  if (!p) return;
  const pr = p.protocols[protocolIdx];
  if (!pr) return;

  const session = {
    id: 'cardio_' + Date.now(),
    type: key,
    name: p.name + ' — ' + pr.name,
    date: today(),
    duration: pr.work || 30,
    protocol: pr.name,
    intensity: pr.intensity
  };
  S.push('cardio', session);

  const workSecs = pr.work || 30;
  const restSecs = pr.rest || 60;
  const rounds = pr.rounds || 1;

  modal(esc(pr.name),
    '<div style="text-align:center;padding:16px 0">' +
    '<div style="width:56px;height:56px;margin:0 auto 10px;border-radius:16px;background:rgba(var(--c1-rgb),0.12);display:flex;align-items:center;justify-content:center">'+icon(p.icon||'run',32,p.color)+'</div>' +
    '<div style="font-size:14px;color:var(--txt3);margin-bottom:16px">Session logged. Use timer below.</div>' +
    '<div style="background:var(--bg3);border-radius:14px;padding:16px;margin-bottom:12px">' +
    '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">' +
    _cStat('','Work',fmtTime(workSecs)) +
    _cStat('','Rest',fmtTime(restSecs)) +
    _cStat('','Rounds',rounds+'×') +
    '</div></div>' +
    '<div style="font-size:13px;color:var(--txt2);line-height:1.6;margin-bottom:14px">'+esc(pr.notes)+'</div>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center">' +
    pr.exercises.map(function(e){return '<span style="font-size:12px;background:rgba(var(--c1-rgb),0.1);color:var(--c1);border-radius:20px;padding:4px 12px;font-weight:600">'+esc(e)+'</span>';}).join('') +
    '</div></div>',
    '<button type="button" class="btn btn-primary" onclick="closeModal();go(\'cardio\')">Done ✓</button>' +
    '<button type="button" class="btn btn-secondary mt-8" onclick="closeModal()" >Keep Viewing</button>'
  );
  toast(p.name+' session logged!', 'ok', 4000);
};

/* ── Voice log + pain flag (gym-tools) ── */
window.voiceLogCurrentSet = function() {
  if (typeof VoiceLogger === 'undefined' || !VoiceLogger.supported()) {
    toast('Voice not supported in this browser', 'warn');
    return;
  }
  if (!S.g('settings.voiceDisclosureAccepted')) {
    modal('Voice processing',
      '<div class="body-13">Voice logging uses your browser’s SpeechRecognition service. Depending on browser and device, audio or transcripts may be processed by the browser vendor and may require network access.</div>',
      '<button type="button" class="btn btn-primary mt-14" onclick="S.set(\'settings.voiceDisclosureAccepted\',true);closeModal();voiceLogCurrentSet()">Continue</button>' +
      '<button type="button" class="btn btn-secondary mt-8" onclick="closeModal()">Cancel</button>');
    return;
  }
  toast('Listening… say “135 for 8” or “RPE 8”', 'ok', 2500);
  VoiceLogger.start(function(text) {
    var parsed = VoiceLogger.parseUtterance(text);
    if (!_wkt) return;
    var exIdx = 0, sIdx = 0, found = false;
    for (var i = 0; i < _wkt.exercises.length && !found; i++) {
      var sets = _wkt.exercises[i].sets || [];
      for (var j = 0; j < sets.length; j++) {
        if (!sets[j].done) { exIdx = i; sIdx = j; found = true; break; }
      }
    }
    var set = _wkt.exercises[exIdx].sets[sIdx];
    if (parsed.weight != null) set.weight = weightToKg(parsed.weight);
    if (parsed.reps != null) set.reps = parsed.reps;
    if (parsed.rpe != null) set.rpe = parsed.rpe;
    _checkpointWorkout(true);
    toast('Logged: ' + (set.weight ? formatWeight(set.weight) : '?') + ' × ' + (parsed.reps || set.reps || '?') + (parsed.rpe ? ' @' + parsed.rpe : ''), 'ok');
    _syncSetInputs(exIdx, sIdx);
  }, function() { toast('Couldn’t hear that — try again', 'warn'); });
};

window.applyPlanAlternative = function(exIdx, name) {
  if (!_wkt || !_wkt.exercises[exIdx] || !name) return;
  _wkt.exercises[exIdx].name = name;
  const meta = typeof ExDB !== 'undefined' ? ExDB.byName(name) : null;
  if (meta && meta.muscles) _wkt.exercises[exIdx].muscles = meta.muscles;
  if (typeof ExDB !== 'undefined' && ExDB.stamp) ExDB.stamp(_wkt.exercises[exIdx]);
  _checkpointWorkout(true);
  toast('Swapped to ' + name, 'ok');
  go('active');
};

window.flagPainDuringWorkout = function() {
  var parts = ['shoulder','elbow','knee','spine','wrist','hip','ankle','neck'];
  var body = '<div style="font-size:13px;color:var(--txt2);margin-bottom:12px">Flag sharp pain — we log it and open Rehab. Don’t train through joint pain.</div>' +
    parts.map(function(p) {
      return '<button type="button" class="btn btn-secondary" style="width:100%;margin-bottom:8px" onclick="closeModal();_applyPainFlag(\'' + p + '\')">' + p.charAt(0).toUpperCase() + p.slice(1) + '</button>';
    }).join('');
  modal('Pain flag', body, '<button type="button" class="btn btn-ghost" onclick="closeModal()">Cancel</button>');
};

window._applyPainFlag = function(part) {
  var r = (typeof PainFlag !== 'undefined') ? PainFlag.flagPain(part) : { advice: 'Rest that joint.', go: 'rehab' };
  if (_wkt && String(part) === 'shoulder') {
    _wkt.stopFlag = true;
    _wkt.shoulderPain = Math.max(_wkt.shoulderPain || 0, 7);
  }
  toast(r.advice || 'Logged', 'warn', 4000);
  go(r.go || 'rehab');
};
