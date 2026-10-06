#!/usr/bin/env node
/* Rebuilds `regressions` (the "easier version" list) for every exercise in
   js/data/exercise-db.js, then validates them. Run after editing the DB:
     node scripts/build-regressions.mjs
   Rules: a regression must exist, be no harder, and train the same thing.
   Curated picks win; otherwise a same-muscle, strictly-easier fallback; a
   movement that is already beginner-level gets an honest empty list. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CURATED_STEPS as HAND_STEPS } from './exercise-steps.mjs';
import { growLibrary, ADDITION_STEPS, LIBRARY_CREDIT } from './exercise-import.mjs';
import { EASIER, HARDER } from './exercise-links.mjs';
const CURATED_STEPS = Object.assign({}, ADDITION_STEPS, HAND_STEPS);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FILE = path.join(ROOT, 'js/data/exercise-db.js');
const src = fs.readFileSync(FILE, 'utf8');
const OPEN = 'window.EXERCISE_DB = [';
const start = src.indexOf(OPEN);
const end = src.lastIndexOf('];');
if (start < 0 || end < 0) throw new Error('EXERCISE_DB array not found');
const CREDIT_LINE = '/* Includes exercise names + instruction text from ' + LIBRARY_CREDIT + '. `media` = id of a © Gym visual animation (shown under licence, not bundled). Notices: THIRD-PARTY-NOTICES.md */\n';
const head0 = src.slice(0, start + OPEN.length);
const head = head0.includes('Exercises Library') ? head0 : head0.replace(OPEN, CREDIT_LINE + OPEN);
const tail = src.slice(end);
const db = JSON.parse('[' + src.slice(start + OPEN.length, end).trim().replace(/,\s*$/, '') + ']');
const grown = growLibrary(db, ROOT);
const byName = new Map(db.map(e => [e.n, e]));
/* Imported rows (src 'el') are fine as options, but curated entries go first. */
const imported = e => (e.src === 'el' ? 1 : 0);

const CURATED = {
  // Library expansion
  'Wheel Pose': ['Bridge Pose', 'Camel Pose'],
  'Flying Sprints': ['Sprint Starts', 'A-Skips'],
  // Chest
  'Barbell Bench Press': ['Dumbbell Bench Press', 'Machine Chest Press', 'Push-Ups'],
  'Incline Barbell Bench Press': ['Incline Dumbbell Press', 'Machine Chest Press'],
  'Incline Barbell Press': ['Incline Dumbbell Press', 'Machine Chest Press'],
  'Decline Barbell Bench Press': ['Dumbbell Bench Press', 'Machine Chest Press'],
  'Decline Barbell Press': ['Dumbbell Bench Press', 'Machine Chest Press'],
  'Dumbbell Bench Press': ['Machine Chest Press', 'Push-Ups'],
  'Incline Dumbbell Press': ['Machine Chest Press', 'Push-Ups'],
  'Smith Machine Bench': ['Machine Chest Press'],
  'Floor Press': ['Machine Chest Press', 'Push-Ups'],
  'Single-Arm DB Press': ['Dumbbell Bench Press', 'Machine Chest Press'],
  'Guillotine Press': ['Incline Dumbbell Press', 'Machine Chest Press'],
  'Close-Grip Bench Press': ['Tricep Pushdown', 'Dumbbell Bench Press'],
  'Push-Ups': ['Wall Push-Up'],
  'Push-Up Variations': ['Push-Ups', 'Wall Push-Up'],
  'Plyometric Push-Up': ['Push-Ups'],
  'Push-Up to Renegade Row': ['Push-Ups', 'Dumbbell Row'],
  'Chest Dip': ['Tricep Dip — Machine', 'Bench Dip', 'Push-Ups'],
  'Chest Dip — Weighted': ['Chest Dip', 'Tricep Dip — Machine'],
  'Dumbbell Fly': ['Pec Deck', 'Cable Fly'],
  'Squeeze Press': ['Dumbbell Bench Press', 'Machine Chest Press'],
  'Hex Press': ['Dumbbell Bench Press', 'Machine Chest Press'],
  'Landmine Press': ['Machine Shoulder Press', 'Dumbbell Shoulder Press'],
  // Shoulders
  'Overhead Press': ['Dumbbell Shoulder Press', 'Machine Shoulder Press'],
  'Push Press': ['Dumbbell Shoulder Press', 'Machine Shoulder Press'],
  'Dumbbell Shoulder Press': ['Machine Shoulder Press'],
  'Seated DB Press': ['Machine Shoulder Press'],
  'Arnold Press': ['Dumbbell Shoulder Press', 'Machine Shoulder Press'],
  'Pike Push-Up': ['Dumbbell Shoulder Press', 'Push-Ups'],
  'Z Press': ['Seated DB Press', 'Machine Shoulder Press'],
  'Z-Press': ['Seated DB Press', 'Machine Shoulder Press'],
  'Single-Arm OHP': ['Dumbbell Shoulder Press', 'Machine Shoulder Press'],
  'Upright Row': ['Upright Row — Cable', 'Dumbbell Lateral Raise'],
  'Cuban Press': ['Band Pull-Aparts', 'Cable Face Pull'],
  'Dumbbell Lateral Raise': ['Lateral Raise Machine'],
  'Front Delt Raise': ['Cable Front Raise'],
  // Back / hinge
  'Deadlift': ['Trap Bar Deadlift', 'Romanian Deadlift — DB', 'Hip Thrust'],
  'Romanian Deadlift': ['Romanian Deadlift — DB', 'Cable Pull-Through', 'Glute Bridge'],
  'Good Morning': ['Romanian Deadlift — DB', 'Hyperextensions'],
  'Trap Bar Deadlift': ['Romanian Deadlift — DB', 'Cable Pull-Through'],
  'Rack Pull': ['Trap Bar Deadlift', 'Romanian Deadlift — DB'],
  'Sumo Deadlift': ['Sumo Squat', 'Cable Pull-Through'],
  'Single Leg RDL': ['Romanian Deadlift — DB'],
  'Hyperextensions': ['Superman Hold', 'Glute Bridge'],
  'Jefferson Curl': ['Cat-Cow', 'Superman Hold'],
  'KB Swing': ['Romanian Deadlift — DB', 'Glute Bridge'],
  'Barbell Row': ['Chest-Supported Row', 'Seated Cable Row', 'Dumbbell Row'],
  'Pendlay Row': ['Chest-Supported Row', 'Seated Cable Row'],
  'T-Bar Row': ['Chest-Supported T-Bar Row', 'Seated Cable Row'],
  'Meadows Row': ['Dumbbell Row', 'Seated Cable Row'],
  'Dumbbell Row': ['Chest-Supported Row', 'Seated Cable Row'],
  'Smith Machine Row': ['Seated Machine Row'],
  'Pull-Ups': ['Lat Pulldown', 'Machine Lat Pulldown', 'Inverted Row'],
  'Chin-Ups': ['Lat Pulldown', 'Machine Lat Pulldown', 'Inverted Row'],
  'Neutral-Grip Pull-Up': ['Lat Pulldown', 'Machine Lat Pulldown'],
  'Towel Pull-Up': ['Pull-Ups', 'Lat Pulldown'],
  'Inverted Row': ['Resistance Band Row', 'Seated Cable Row'],
  'Lat Pulldown': ['Machine Lat Pulldown'],
  'Face Pulls': ['Band Pull-Aparts'],
  'Cable Face Pull': ['Band Pull-Aparts'],
  'Rear Delt Fly': ['Rear Delt Machine', 'Band Pull-Aparts'],
  // Legs
  'Back Squat': ['Goblet Squat', 'Box Squat', 'Leg Press'],
  'Front Squat': ['Goblet Squat', 'Leg Press'],
  'Hack Squat': ['Leg Press', 'Goblet Squat'],
  'Smith Machine Squat': ['Leg Press', 'Goblet Squat'],
  'Pendulum Squat': ['Leg Press'],
  'Sissy Squat': ['Leg Extension', 'Wall Sit'],
  'Goblet Squat': ['Bodyweight Squat', 'Leg Press'],
  'Box Squat': ['Goblet Squat', 'Leg Press'],
  'Sandbag Squat': ['Goblet Squat'],
  'Bodyweight Squat': ['Wall Sit'],
  'Bulgarian Split Squat': ['Reverse Lunge', 'Step-Up'],
  'Walking Lunge': ['Reverse Lunge', 'Step-Up'],
  'Reverse Lunge': ['Step-Up'],
  'Curtsy Lunge': ['Reverse Lunge'],
  'Lateral Lunge': ['Sumo Squat'],
  'Single-Leg Leg Press': ['Leg Press'],
  'Nordic Curl': ['Lying Leg Curl', 'Seated Leg Curl'],
  'Glute-Ham Raise': ['Lying Leg Curl', 'Seated Leg Curl'],
  'Hip Thrust': ['Glute Bridge', 'Hip Thrust BW'],
  'Single-Leg Hip Thrust': ['Hip Thrust BW', 'Glute Bridge'],
  'Box Jump': ['Step-Up', 'Bodyweight Squat'],
  'Depth Jump': ['Box Jump', 'Step-Up'],
  'Lateral Bound': ['Lateral Lunge'],
  'Calf Raise — Single Leg': ['Standing Calf Raise'],
  // Core
  'Hanging Leg Raise': ['Leg Raises', 'Dead Bug'],
  'Toes-to-Bar': ['Hanging Leg Raise', 'Leg Raises'],
  'Ab Wheel Rollout': ['Plank', 'Dead Bug'],
  'Rollout — Ab Wheel': ['Plank', 'Dead Bug'],
  'Dragon Flag': ['Leg Raises', 'Dead Bug'],
  'L-Sit': ['Leg Raises', 'Plank'],
  'L-Sit Hold': ['Leg Raises', 'Plank'],
  'Hollow Hold': ['Dead Bug'],
  'Hollow Body Hold': ['Dead Bug'],
  'Mountain Climbers': ['Plank', 'Dead Bug'],
  'Stir The Pot': ['Plank'],
  'Side Plank': ['Pallof Press'],
  'Plank': ['Dead Bug'],
  'Russian Twist': ['Pallof Press', 'Dead Bug'],
  'Copenhagen Plank': ['Side Plank'],
  // Arms
  'Skull Crushers': ['Tricep Pushdown', 'Cable Overhead Extension'],
  'JM Press': ['Tricep Pushdown'],
  'Board Press': ['Tricep Pushdown'],
  'Tate Press': ['Tricep Kickback', 'Tricep Pushdown'],
  'Tricep Dip': ['Tricep Dip — Machine', 'Bench Dip'],
  'Diamond Push-Ups': ['Push-Ups', 'Bench Dip'],
  // Full body / conditioning
  'Burpees': ['Jumping Jacks', 'Bodyweight Squat'],
  'Thruster': ['Goblet Squat', 'Dumbbell Shoulder Press'],
  'Clean and Press': ['Hang Power Clean', 'Dumbbell Shoulder Press'],
  'Clean and Jerk': ['Hang Power Clean', 'Push Press'],
  'Power Clean': ['Hang Power Clean', 'KB Swing'],
  'Barbell Clean': ['Hang Power Clean', 'KB Swing'],
  'Snatch': ['KB Swing', 'Hang Power Clean'],
  'Hang Power Clean': ['KB Swing'],
  'Turkish Get-Up': ['Dead Bug', "Farmer's Walk"],
  'Overhead Carry': ["Farmer's Walk"],
  'Renegade Row': ['Dumbbell Row', 'Plank'],
  'Treadmill Run': ['Treadmill Incline Walk', 'Elliptical'],
  'Assault Bike': ['Stationary Bike'],
  'Ski Erg': ['Rowing Machine'],
  'Sled Push': ['Treadmill Incline Walk'],
  'Battle Ropes': ['Med Ball Slams'],
  'Stair Climber': ['Treadmill Incline Walk'],
  'Skip / Jump Rope': ['Jumping Jacks'],
  'Skipping Intervals': ['Jumping Jacks'],
  'Road Running': ['Hiking'],
  'Trail Running': ['Hiking'],
  'Squash': ['Badminton'],
  'Swimming — Butterfly': ['Swimming — Backstroke', 'Swimming — Freestyle']
};

/* Harder / next-step variations ("↑" in exercise detail) */
const CURATED_PROG = {
  'Band External Rotation': ['Face Pulls', 'Band Pull-Aparts'],
  'Band Internal Rotation': ['Band External Rotation', 'Face Pulls'],
  'Scapular Retraction': ['Band Pull-Aparts', 'Prone Y-T-W Raise'],
  'Wall Push-Up': ['Push-Ups', 'Push-Up Variations'],
  'Shrugs': ["Farmer's Walk", 'Upright Row'],
  'Copenhagen Plank': ['Stir The Pot'],
  'Push-Ups': ['Diamond Push-Ups', 'Plyometric Push-Up'],
  'Machine Chest Press': ['Dumbbell Bench Press', 'Barbell Bench Press'],
  'Dumbbell Bench Press': ['Barbell Bench Press', 'Incline Dumbbell Press'],
  'Barbell Bench Press': ['Incline Barbell Bench Press', 'Chest Dip'],
  'Lat Pulldown': ['Pull-Ups', 'Chin-Ups'],
  'Machine Lat Pulldown': ['Lat Pulldown', 'Pull-Ups'],
  'Inverted Row': ['Dumbbell Row', 'Pull-Ups'],
  'Seated Cable Row': ['Dumbbell Row', 'Barbell Row'],
  'Dumbbell Row': ['Barbell Row', 'Meadows Row'],
  'Bodyweight Squat': ['Goblet Squat', 'Bulgarian Split Squat'],
  'Goblet Squat': ['Bulgarian Split Squat', 'Back Squat'],
  'Leg Press': ['Hack Squat', 'Back Squat'],
  'Box Squat': ['Back Squat', 'Front Squat'],
  'Back Squat': ['Front Squat'],
  'Wall Sit': ['Bodyweight Squat', 'Goblet Squat'],
  'Step-Up': ['Reverse Lunge', 'Bulgarian Split Squat'],
  'Reverse Lunge': ['Walking Lunge', 'Bulgarian Split Squat'],
  'Glute Bridge': ['Hip Thrust', 'Single-Leg Hip Thrust'],
  'Hip Thrust BW': ['Hip Thrust', 'Single-Leg Hip Thrust'],
  'Romanian Deadlift — DB': ['Romanian Deadlift', 'Single Leg RDL'],
  'Romanian Deadlift': ['Deadlift', 'Good Morning'],
  'Trap Bar Deadlift': ['Deadlift'],
  'Machine Shoulder Press': ['Dumbbell Shoulder Press', 'Overhead Press'],
  'Dumbbell Shoulder Press': ['Overhead Press', 'Arnold Press'],
  'Dead Bug': ['Plank', 'Hollow Body Hold'],
  'Plank': ['Side Plank', 'Ab Wheel Rollout'],
  'Leg Raises': ['Hanging Leg Raise', 'Toes-to-Bar'],
  'Bench Dip': ['Tricep Dip', 'Diamond Push-Ups'],
  'Tricep Pushdown': ['Skull Crushers', 'Close-Grip Bench Press'],
  'Treadmill Incline Walk': ['Treadmill Run', 'Stair Climber'],
  'Stationary Bike': ['Assault Bike', 'Treadmill Run'],
  'Neck Flexion': ['Neck Extension', 'Shrugs'],
  'Neck Extension': ['Neck Flexion', 'Shrugs']
};

for (const [k, v] of Object.entries(EASIER)) if (!(k in CURATED)) CURATED[k] = v;
for (const [k, v] of Object.entries(HARDER)) if (!(k in CURATED_PROG)) CURATED_PROG[k] = v;

const prim = e => (e.muscles && e.muscles.primary && e.muscles.primary[0]) || e.grp;
const stability = e => {
  const eq = (e.eq || []).join(' ');
  if (/machine|smith/.test(eq)) return 3;
  if (/cable/.test(eq)) return 2.5;
  if (/band/.test(eq)) return 2;
  if (/dumbbell|kettlebell/.test(eq)) return 1.5;
  return 1;
};
const jointLoad = e => Object.values(e.joint || {}).reduce((a, b) => a + (b || 0), 0);
const NO_FALLBACK_GRPS = new Set(['sports', 'warmup_drills', 'neck', 'mobility']);

/* Same kind of thing: stretches pair with stretches, and a whole-body or
   conditioning move must share the movement pattern to count. */
const compatible = (c, e) => ((c.grp === 'mobility') === (e.grp === 'mobility')) &&
  (!['full_body', 'cardio', 'core'].includes(prim(e)) || c.pattern === e.pattern);
function fallback(e) {
  if (NO_FALLBACK_GRPS.has(e.grp) || (e.diff || 1) <= 1) return [];
  return db.filter(c => c.n !== e.n && prim(c) === prim(e) && compatible(c, e) && (c.diff || 1) < (e.diff || 1))
    .sort((a, b) => ((a.pattern !== e.pattern) - (b.pattern !== e.pattern)) || (imported(a) - imported(b)) || (a.diff - b.diff) || (stability(b) - stability(a)) || (jointLoad(a) - jointLoad(b)))
    .slice(0, 2).map(c => c.n);
}

let curated = 0, fell = 0, empty = 0;
const problems = [];
for (const e of db) {
  let regs = CURATED[e.n];
  if (regs) curated++;
  else { regs = fallback(e); regs.length ? fell++ : empty++; }
  regs = regs.filter(r => {
    const c = byName.get(r);
    if (!c) { problems.push(`${e.n} → ${r}: not in DB`); return false; }
    if ((c.diff || 1) > (e.diff || 1)) { problems.push(`${e.n} → ${r}: harder`); return false; }
    if (c.n === e.n) return false;
    return true;
  });
  e.regressions = regs;
}

/* Progressions: same target, never easier, not already a regression.
   Together with regressions every exercise ends up with 2+ real options. */
let progCurated = 0;
const RELAX_PATTERNS = new Set(['isolation', 'conditioning']);
function progFallback(e, need) {
  const regs = new Set(e.regressions || []);
  const ok = c => c.n !== e.n && !regs.has(c.n) && (c.diff || 1) >= (e.diff || 1) && compatible(c, e);
  const rank = (a, b) => ((a.pattern !== e.pattern) - (b.pattern !== e.pattern)) || (imported(a) - imported(b)) || ((a.diff || 1) - (b.diff || 1)) || (stability(a) - stability(b)) || a.n.localeCompare(b.n);
  const cond = ['sports', 'cardio', 'plyometrics', 'warmup_drills', 'mobility'].includes(e.grp);
  const tiers = cond ? [c => c.grp === e.grp && prim(c) === prim(e), c => c.grp === e.grp] : [
    c => prim(c) === prim(e),
    c => c.grp === e.grp && c.pattern === e.pattern && !RELAX_PATTERNS.has(e.pattern),
    c => c.grp === e.grp && (e.grp === 'sports' || e.grp === 'cardio' || e.grp === 'warmup_drills' || e.grp === 'plyometrics')
  ];
  const out = [];
  for (const t of tiers) {
    if (out.length >= need) break;
    db.filter(c => ok(c) && t(c) && !out.includes(c.n)).sort(rank).forEach(c => { if (out.length < need) out.push(c.n); });
  }
  return out;
}
for (const e of db) {
  let prog = CURATED_PROG[e.n];
  if (prog) progCurated++;
  else prog = progFallback(e, Math.max(1, 2 - (e.regressions || []).length));
  prog = prog.filter(r => {
    const c = byName.get(r);
    if (!c) { problems.push(`${e.n} ↑ ${r}: not in DB`); return false; }
    if ((c.diff || 1) < (e.diff || 1)) { problems.push(`${e.n} ↑ ${r}: easier, not a progression`); return false; }
    return c.n !== e.n && !(e.regressions || []).includes(r);
  });
  e.progressions = prog;
  const total = new Set([...(e.regressions || []), ...prog]).size;
  if (total < 2) problems.push(`${e.n}: only ${total} alternative(s)`);
}

/* "How to" steps — curated where written, otherwise built from the
   exercise's own setup / cues / breathing text. */
const WEAK = /^(educational\.?|set up as needed|focus on form)$/i;
const sentence = t => {
  t = String(t || '').trim().replace(/\s+/g, ' ');
  if (!t) return '';
  t = t.charAt(0).toUpperCase() + t.slice(1);
  return /[.!?]$/.test(t) ? t : t + '.';
};
let stepsCurated = 0;
for (const e of db) {
  if (CURATED_STEPS[e.n]) { e.steps = CURATED_STEPS[e.n].slice(); stepsCurated++; continue; }
  if (e.src === 'el' && (e.steps || []).length) continue;
  const steps = [];
  const conditioning = ['sports', 'cardio'].includes(e.grp) || e.pattern === 'conditioning';
  const setup = String(e.setup || '').replace(/\s*Educational\.?\s*$/i, '').trim();
  if (conditioning) steps.push('Warm up for 5–10 minutes at an easy pace.');
  if (setup && !WEAK.test(setup) && setup.length > 3) steps.push(sentence(setup.length < 30 && !/\s/.test(setup.replace(/[,.]/g, ' ').trim()) ? 'You need: ' + setup : setup));
  String(e.cues || '').split(/[,;]\s*|\.\s+/).map(c => c.trim()).filter(c => c.length > 3).slice(0, 4)
    .forEach(c => steps.push(sentence(c)));
  const br = String(e.breathing || '').trim();
  if (br && !/^free$/i.test(br) && br.length > 4) steps.push(sentence('Breathing: ' + br.charAt(0).toLowerCase() + br.slice(1)));
  if (conditioning) steps.push('Cool down for 5 minutes and stretch what feels tight.');
  e.steps = steps.length ? steps : ['Move with control through a pain-free range.', 'Stop the set when your form starts to slip.'];
}
if (stepsCurated !== Object.keys(CURATED_STEPS).length) {
  Object.keys(CURATED_STEPS).forEach(n => { if (!byName.has(n)) problems.push(`steps for unknown exercise: ${n}`); });
}

if (problems.length) {
  console.error('Regression problems:\n  ' + problems.join('\n  '));
  process.exit(1);
}
const body = '\n' + db.map(e => '  ' + JSON.stringify(e)).join(',\n') + '\n';
fs.writeFileSync(FILE, head + body + tail);
console.log(`library: +${grown.curated} hand-written, +${grown.imported} from Exercises Library, ${grown.skipped} already present or duplicate, +${grown.media} animations linked`);
console.log(`rebuilt ${db.length} exercises — easier: curated ${curated}, fallback ${fell}, already-easiest ${empty}; harder: curated ${progCurated}; steps: curated ${stepsCurated}, generated ${db.length - stepsCurated}`);
