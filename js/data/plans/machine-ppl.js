'use strict';
/* Machine-only PPL — shoulder-safe 6-day rotation, 4 build weeks + week-5 deload.
   Starting loads come from a verified logged session. Machine numbers are not
   comparable across stations — only session to session on the same machine. */

(function() {
  function alt(name, cue) { return { name: name, cue: cue || '' }; }
  function ex(o) { return o; }

  const ROM = [
    { movement: 'Any chest press', stop: 'Stop 3–4 inches short of the chest. Never let the bar or handles touch you. Set Smith safeties if available.' },
    { movement: 'Pec deck / fly / cable crossover', stop: 'Stop when elbows reach the torso line. Never let them travel behind it.' },
    { movement: 'Machine shoulder press', stop: 'Stop below ear level. No full overhead lockout.' },
    { movement: 'Lateral raise', stop: 'Stop at shoulder height. Never above.' },
    { movement: 'Overhead tricep extension', stop: 'Elbows stay pointed forward and fixed. Any pull in the shoulder joint means stop the set.' },
    { movement: 'Lat pulldown', stop: 'Pull to upper chest. Never behind the neck.' },
    { movement: 'Any row', stop: 'Pull elbows back to the torso. Do not force them past it.' },
    { movement: 'Dumbbell floor press', stop: 'The floor is the stop.' }
  ];

  const PREHAB = [
    { name: 'Band Pull-Aparts', sets: 3, reps: 15, restSec: 30 },
    { name: 'Cable External Rotation', sets: 3, reps: 15, restSec: 30 }
  ];

  const DISCLAIMER = 'Pain-free is not the same as cleared. This machine-only structure exists because of shoulder history. It is not a medical assessment. Stop on clunk, shift, or sharp pain and see a clinician before pushing harder.';

  function session(id, name, muscles, family, cardio, exercises, warmup) {
    return {
      id: id, name: name, muscles: muscles, family: family, prehab: family !== 'legs',
      warmup: warmup, cardio: cardio, exercises: exercises
    };
  }

  const PUSH_WU = ['5–7 min light cardio', 'Arm circles', 'Bodyweight squats'];
  const PULL_WU = ['5–7 min light cardio', 'Arm circles', 'Thoracic rotations'];
  const LEG_WU = ['Bodyweight squats', 'Leg swings', '5 min easy bike'];
  const CARDIO_STD = { kind: 'incline walk or bike', minutes: 22, hr: '126–140 bpm', note: 'After lifting. Extend to 40+ min combo 2–3×/week, not consecutive.' };
  const CARDIO_LEGS = { kind: 'light walk', minutes: 12, hr: 'under 120 bpm', note: 'Legs already loaded — skip the long combo.' };

  const plan = {
    schemaVersion: 1,
    id: 'machine_ppl_shoulder',
    title: 'Machine-only PPL (shoulder-safe)',
    active: true,
    acknowledgedSafety: false,
    source: { type: 'template', name: 'machine_ppl_shoulder' },
    restWeekdays: ['sun'],
    rotation: ['push_a', 'pull_a', 'legs_a', 'push_b', 'pull_b', 'legs_b'],
    mesocycle: { weeks: 5, deloadWeek: 5 },
    progression: { type: 'double', targetRpe: 8, rpeNever: 10, incrementPct: 0.03, deloadLoadPct: 0.6, deloadDropSets: 1, deloadRpe: 6, missWeekDropPct: 0.1 },
    safety: {
      medicalClearance: false,
      painLogAfter: ['push', 'pull'],
      stopOn: ['clunk', 'shift', 'sharp'],
      romRules: ROM,
      disclaimer: DISCLAIMER
    },
    prehab: PREHAB,
    cardioRules: { afterLifting: true, steps: [8000, 10000] },
    notes: 'Machines and cables only. No free-weight pressing or barbell rows. Light dumbbell wrist curls are the one exception. Cardio after lifting. Sunday full rest. Plate markings are not comparable between machines.',
    sessions: {
      push_a: session('push_a', 'Push A — Chest / Shoulders / Triceps', ['chest', 'shoulders', 'triceps'], 'push', CARDIO_STD, [
        ex({ name: 'Smith Incline Press', aliases: ['Incline chest press machine', 'Smith incline press', 'Incline Barbell Bench Press'], group: 'chest', role: 'primary', sets: 4, reps: [10, 12], tempo: '3-1-1', rpe: [8, 8], restSec: 75, startKg: 10, unit: 'kg_per_side', startDisplay: '10–12.5kg (22–28 lb)/side', week4GoalKg: 16, cue: 'Handles or bar level with upper chest. Press up and slightly forward, stop short of locking elbows.', rom: 'On Smith, never let the bar touch your chest.', why: 'Upper chest is the angle most people undertrain.', alternatives: [alt('Incline Machine Chest Press', 'Seat so handles are level with upper chest.'), alt('Low-to-High Cable Press', 'Cables low, press up and forward ~30°.')] }),
        ex({ name: 'Smith Flat Press', aliases: ['Flat chest press machine', 'Smith flat press', 'Barbell Bench Press'], group: 'chest', role: 'primary', sets: 3, reps: [10, 12], tempo: '3-1-1', rpe: [8, 8], restSec: 75, startKg: 15, unit: 'kg_per_side', startDisplay: '15–17.5kg (33–39 lb)/side', week4GoalKg: 21, cue: 'Handles level with mid-chest. Don’t let the pad pull your shoulder further back than comfortable.', rom: 'Stop 3–4 inches short of the chest.', why: 'Main mass-builder for overall chest size.', alternatives: [alt('Machine Chest Press', 'Press to near-full extension without locking elbows.'), alt('Cable Chest Press', 'Mid-height, return over 2–3 seconds.')] }),
        ex({ name: 'Pec Deck', aliases: ['Fly machine', 'Pec deck', 'Pec Deck Machine'], group: 'chest', sets: 3, reps: [15, 15], tempo: '2-1-2', rpe: [7, 8], restSec: 60, startKg: 34, unit: 'kg', startDisplay: '32–36kg (70–80 lb) — logged 75 lb', week4GoalKg: 40, cue: 'Stop the stretch before elbows pass the torso line.', rom: 'Highest-risk position in this program even when the weight feels easy.', why: 'Squeeze work that pressing alone does not hit.', alternatives: [alt('Cable Crossover', 'Short ROM — elbows never behind torso.'), alt('Machine Chest Press', 'Safer substitute if the fly is taken.')] }),
        ex({ name: 'Machine Shoulder Press', aliases: ['Shoulder press', 'Shoulder Press Machine'], group: 'shoulders', sets: 3, setsMin: 2, reps: [12, 12], tempo: '2-1-2', rpe: [7, 7], restSec: 60, startKg: 20, unit: 'kg', startDisplay: '20–23kg (45–50 lb)', week4GoalKg: 26, cue: 'Partial range, stop well below ear level. If it pulls at all, drop the weight or skip.', rom: 'No full overhead lockout.', why: 'Shoulder size without overhead barbell risk.', skipOk: true, alternatives: [alt('Cable Front Raise', 'Raise to shoulder height only. Stop if you feel any pull.'), alt('Skip Machine Shoulder Press', 'Front delts get volume from pressing.')] }),
        ex({ name: 'Lateral Raise Machine', aliases: ['Lateral raise machine', 'Dumbbell Lateral Raise'], group: 'shoulders', sets: 3, reps: [15, 15], tempo: '2-0-2', rpe: [7, 8], restSec: 45, startKg: 10, unit: 'kg', startDisplay: '9–12kg (20–27 lb)', week4GoalKg: 15, cue: 'Lead with elbows, not hands. Stop at shoulder height, don’t shrug.', rom: 'Never above shoulder height.', why: 'Side delts create width.', alternatives: [alt('Cable Lateral Raise', 'Low pulley across the body, lead with elbow.'), alt('Band Lateral Raise', 'Same pattern, stop at shoulder height.')] }),
        ex({ name: 'Tricep Pushdown', aliases: ['Tricep pushdown', 'Cable pushdown'], group: 'triceps', sets: 3, reps: [12, 12], tempo: '2-1-2', rpe: [8, 8], restSec: 45, startKg: 32, unit: 'kg', startDisplay: '30–34kg (65–75 lb) — logged 70 lb', week4GoalKg: 38, cue: 'Elbows pinned to your sides. Only forearms move.', why: 'Arm size and definition.', alternatives: [alt('Rope Pushdown', 'Spread the rope at the bottom.'), alt('Overhead Cable Extension', 'Light. Stop immediately if it pulls at the shoulder.')] }),
        ex({ name: 'Overhead Tricep Extension Machine', aliases: ['Overhead tricep extension', 'Overhead Tricep Extension — Cable'], group: 'triceps', sets: 3, reps: [12, 12], tempo: '2-1-2', rpe: [7, 8], restSec: 45, startKg: 22, unit: 'kg', startDisplay: '20–25kg (45–55 lb)', week4GoalKg: 30, cue: 'Only if this feels completely neutral on the shoulder.', rom: 'Stop immediately if not.', why: 'Long head is the biggest tricep head.', alternatives: [alt('Rope Pushdown', ''), alt('Overhead Cable Extension', 'Elbows forward and fixed.')] }),
        ex({ name: 'Dumbbell Wrist Curl', aliases: ['Wrist Curl', 'DB wrist curl'], group: 'forearms', sets: 2, reps: [15, 20], tempo: '2-1-2', rpe: [8, 8], restSec: 40, startKg: 4, unit: 'kg_per_side', startDisplay: '3–5kg (7–11 lb)/side', week4GoalKg: 7, cue: 'Forearm braced flat. Only the wrist moves.', why: 'Zero shoulder involvement.', alternatives: [alt('Cable Wrist Curl', ''), alt('Hand Gripper', '')] }),
        ex({ name: 'Ab Crunch Machine', aliases: ['Ab crunch machine', 'Cable Crunch'], group: 'core', sets: 3, reps: [15, 15], tempo: '2-1-2', rpe: [7, 8], restSec: 40, startKg: 27, unit: 'kg', startDisplay: '25–30kg (55–65 lb)', week4GoalKg: 37, cue: 'Curl ribs toward hips. Don’t pull with your neck.', why: 'Direct core work.', alternatives: [alt('Cable Crunch', ''), alt('Plank', '')] })
      ], PUSH_WU),

      pull_a: session('pull_a', 'Pull A — Back / Biceps / Forearms', ['back', 'biceps', 'forearms'], 'pull', CARDIO_STD, [
        ex({ name: 'Lat Pulldown', aliases: ['Lat pulldown, wide grip', 'Wide grip pulldown'], group: 'back', role: 'primary', sets: 4, reps: [12, 12], tempo: '3-1-1', rpe: [8, 8], restSec: 75, startKg: 47, unit: 'kg', startDisplay: '45–50kg (100–110 lb)', week4GoalKg: 58, cue: 'Pull to upper chest, lead with elbows down and back.', rom: 'Never behind the neck.', why: 'Main width-builder.', alternatives: [alt('Assisted Pull-Up', ''), alt('Straight-Arm Pulldown', '')] }),
        ex({ name: 'Close-Grip Lat Pulldown', aliases: ['Lat pulldown, close/neutral grip', 'Neutral grip pulldown'], group: 'back', sets: 3, reps: [12, 12], tempo: '3-1-1', rpe: [8, 8], restSec: 75, startKg: 47, unit: 'kg', startDisplay: '45–50kg (100–110 lb)', week4GoalKg: 58, cue: 'More upright torso. Pull to lower chest.', why: 'Hits lower lat fibers the wide grip misses.', alternatives: [alt('Assisted Pull-Up', ''), alt('Straight-Arm Pulldown', '')] }),
        ex({ name: 'Seated Row Wide Grip', aliases: ['Seated row machine, wide grip', 'Seated Cable Row'], group: 'back', role: 'primary', sets: 4, reps: [12, 12], tempo: '3-1-1', rpe: [8, 8], restSec: 75, startKg: 47, unit: 'kg', startDisplay: '45–50kg (100–110 lb)', week4GoalKg: 58, cue: 'Chest up, pull elbows back to your torso, squeeze shoulder blades.', rom: 'Do not force elbows past the torso.', why: 'Thickness and density.', alternatives: [alt('Chest-Supported Row', ''), alt('Single-Arm Cable Row', '')] }),
        ex({ name: 'Seated Row Close Grip', aliases: ['Seated row machine, close grip'], group: 'back', sets: 3, reps: [12, 12], tempo: '3-1-1', rpe: [8, 8], restSec: 60, startKg: 47, unit: 'kg', startDisplay: '45–50kg (100–110 lb)', week4GoalKg: 58, cue: 'Narrower grip shifts emphasis lower.', why: 'Second thickness angle.', alternatives: [alt('Chest-Supported Row', ''), alt('Single-Arm Cable Row', '')] }),
        ex({ name: 'Back Extension Machine', aliases: ['Back extension', 'Hyperextension'], group: 'back', sets: 3, reps: [15, 15], tempo: '2-1-2', rpe: [7, 7], restSec: 60, startKg: 15, unit: 'kg', startDisplay: 'Bodyweight, or add 15kg (33 lb)', week4GoalKg: 25, cue: 'Stop level with your torso. Don’t hyperextend.', why: 'Protects the spine on everything else.', alternatives: [alt('Cable Pull-Through', ''), alt('Bodyweight Back Extension', '')] }),
        ex({ name: 'Face Pulls', aliases: ['Face pulls (cable)'], group: 'shoulders', sets: 3, reps: [15, 15], tempo: '2-1-2', rpe: [7, 8], restSec: 45, startKg: 17, unit: 'kg', startDisplay: '15–20kg (35–45 lb)', week4GoalKg: 25, cue: 'Pull to eye level, rotate so knuckles finish behind you.', why: 'Rear delts plus shoulder-health maintenance.', alternatives: [alt('Face Pulls', ''), alt('Rear Delt Fly', '')] }),
        ex({ name: 'Bicep Curl Machine', aliases: ['Bicep curl machine', 'EZ Bar Curl'], group: 'biceps', sets: 3, reps: [12, 12], tempo: '2-1-2', rpe: [8, 8], restSec: 45, startKg: 17, unit: 'kg', startDisplay: '15–20kg (35–45 lb)', week4GoalKg: 25, cue: 'Elbows pinned. No swinging.', why: 'Arm size.', alternatives: [alt('Cable Curl', ''), alt('Preacher Curl', '')] }),
        ex({ name: 'Dumbbell Wrist Curl', aliases: ['Wrist Curl'], group: 'forearms', sets: 2, reps: [15, 20], tempo: '2-1-2', rpe: [8, 8], restSec: 40, startKg: 4, unit: 'kg_per_side', startDisplay: '3–5kg/side', week4GoalKg: 7, cue: 'Forearm braced flat.', alternatives: [alt('Cable Wrist Curl', ''), alt('Hand Gripper', '')] }),
        ex({ name: 'Cable Crunch', aliases: ['Cable crunch or leg raise machine'], group: 'core', sets: 3, reps: [15, 15], tempo: '2-1-2', rpe: [7, 8], restSec: 40, startKg: 27, unit: 'kg', startDisplay: '25–30kg', week4GoalKg: 37, cue: 'Controlled, no swinging.', alternatives: [alt('Cable Crunch', ''), alt('Plank', '')] })
      ], PULL_WU),

      legs_a: session('legs_a', 'Legs A — Quads / Hamstrings / Glutes / Calves', ['quads', 'hamstrings', 'glutes', 'calves'], 'legs', CARDIO_LEGS, [
        ex({ name: 'Leg Press', aliases: ['Leg press, standard foot position'], group: 'quads', role: 'primary', sets: 4, reps: [10, 12], tempo: '3-1-1', rpe: [8, 8], restSec: 90, startKg: 150, unit: 'kg', startDisplay: '150–160kg (331–353 lb) — logged 150kg', week4GoalKg: 182, cue: 'Feet shoulder-width, mid-platform. Lower to roughly 90° at the knee.', rom: 'Don’t let the lower back round off the pad.', why: 'Main leg mass-builder.', alternatives: [alt('Hack Squat', ''), alt('Leg Press — Narrow Stance', '')] }),
        ex({ name: 'Leg Extension', aliases: ['Leg extension machine'], group: 'quads', sets: 3, reps: [15, 15], tempo: '2-1-2', rpe: [8, 8], restSec: 60, startKg: 40, unit: 'kg', startDisplay: '35–45kg', week4GoalKg: 55, cue: 'Pause at the top squeeze, control the negative.', alternatives: [alt('Hack Squat', ''), alt('Leg Press — Narrow Stance', '')] }),
        ex({ name: 'Leg Press — Wide Stance', aliases: ['Leg press, high foot position'], group: 'glutes', sets: 3, reps: [10, 10], tempo: '3-1-1', rpe: [8, 8], restSec: 90, startKg: 135, unit: 'kg', startDisplay: '130–140kg', week4GoalKg: 157, cue: 'Feet higher and wider shifts load to the posterior chain.', why: 'Same machine, different angle.', alternatives: [alt('Leg Curl', ''), alt('Single-Leg Cable Curl', '')] }),
        ex({ name: 'Seated Leg Curl', aliases: ['Seated leg curl machine', 'Leg Curl'], group: 'hamstrings', sets: 3, reps: [12, 12], tempo: '2-1-2', rpe: [8, 8], restSec: 60, startKg: 35, unit: 'kg', startDisplay: '30–40kg', week4GoalKg: 50, cue: 'Full stretch, squeeze hard at full contraction.', alternatives: [alt('Lying Leg Curl', ''), alt('Single-Leg Cable Curl', '')] }),
        ex({ name: 'Glute Kickback Machine', aliases: ['Glute kickback machine or hip thrust', 'Hip Thrust'], group: 'glutes', sets: 3, reps: [12, 12], tempo: '2-1-2', rpe: [7, 8], restSec: 60, startKg: 35, unit: 'kg', startDisplay: '30–40kg', week4GoalKg: 50, cue: 'Squeeze the glute at the top. Don’t overarch the lower back.', alternatives: [alt('Hip Thrust', ''), alt('Cable Glute Kickback', '')] }),
        ex({ name: 'Standing Calf Raise', aliases: ['Standing calf raise machine'], group: 'calves', sets: 4, reps: [15, 15], tempo: '2-1-2', rpe: [8, 8], restSec: 45, startKg: 70, unit: 'kg', startDisplay: '60–80kg', week4GoalKg: 100, cue: 'Full stretch at the bottom, pause, drive onto toes.', alternatives: [alt('Leg Press Calf Raise', ''), alt('Bodyweight Calf Raise', '')] }),
        ex({ name: 'Seated Calf Raise', aliases: ['Seated calf raise machine'], group: 'calves', sets: 3, reps: [15, 15], tempo: '2-1-2', rpe: [8, 8], restSec: 45, startKg: 47, unit: 'kg', startDisplay: '40–55kg', week4GoalKg: 67, cue: 'Bent knee changes which calf muscle is emphasized.', alternatives: [alt('Leg Press Calf Raise', ''), alt('Bodyweight Calf Raise', '')] }),
        ex({ name: 'Dumbbell Wrist Curl', aliases: ['Wrist Curl'], group: 'forearms', sets: 2, reps: [15, 20], tempo: '2-1-2', rpe: [8, 8], restSec: 40, startKg: 4, unit: 'kg_per_side', startDisplay: '3–5kg/side', week4GoalKg: 7, cue: 'Forearm braced.', alternatives: [alt('Cable Wrist Curl', ''), alt('Hand Gripper', '')] }),
        ex({ name: 'Leg Raise Machine', aliases: ['Leg raise machine or ab crunch machine', 'Hanging Leg Raise'], group: 'core', sets: 3, reps: [15, 15], tempo: '2-1-2', rpe: [7, 8], restSec: 40, startKg: 27, unit: 'kg', startDisplay: '25–30kg', week4GoalKg: 37, cue: 'Controlled, no momentum.', alternatives: [alt('Cable Crunch', ''), alt('Plank', '')] })
      ], LEG_WU),

      push_b: session('push_b', 'Push B — Chest / Shoulders / Triceps', ['chest', 'shoulders', 'triceps'], 'push', CARDIO_STD, [
        ex({ name: 'Cable Chest Press', aliases: ['Cable chest press, standing mid-height'], group: 'chest', role: 'primary', sets: 4, reps: [10, 12], tempo: '3-1-1', rpe: [8, 8], restSec: 75, startKg: 22, unit: 'kg_per_side', startDisplay: '20–25kg (44–55 lb)/side', week4GoalKg: 30, cue: 'Split stance, press both handles forward and slightly together.', why: 'Different resistance curve than machine or Smith.', alternatives: [alt('Smith Flat Press', 'Never let the bar touch your chest.'), alt('Cable Chest Press', '')] }),
        ex({ name: 'Dumbbell Floor Press', aliases: ['Dumbbell floor press, light'], group: 'chest', sets: 3, reps: [10, 12], tempo: '3-1-1', rpe: [7, 8], restSec: 75, startKg: 13, unit: 'kg_per_side', startDisplay: '12–15kg/side', week4GoalKg: 18, cue: 'The floor caps how far elbows can drop.', why: 'Free-weight stimulus without the risky bottom of a bench press.', alternatives: [alt('Smith Flat Press', ''), alt('Cable Chest Press', '')] }),
        ex({ name: 'Pec Deck', aliases: ['Pec deck / fly, low-to-high angle'], group: 'chest', sets: 3, reps: [15, 15], tempo: '2-1-2', rpe: [7, 8], restSec: 60, startKg: 34, unit: 'kg', startDisplay: '32–36kg', week4GoalKg: 40, cue: 'Same short-ROM rule as Push A. Light weight is not a reason to extend range.', alternatives: [alt('Cable Crossover', ''), alt('Machine Chest Press', '')] }),
        ex({ name: 'Machine Shoulder Press', aliases: ['Shoulder press'], group: 'shoulders', sets: 3, setsMin: 2, reps: [12, 12], tempo: '2-1-2', rpe: [7, 7], restSec: 60, startKg: 20, unit: 'kg', startDisplay: '20–23kg', week4GoalKg: 26, cue: 'Same cues as Push A.', skipOk: true, alternatives: [alt('Cable Front Raise', ''), alt('Skip Machine Shoulder Press', '')] }),
        ex({ name: 'Cable Lateral Raise', aliases: ['Cable lateral raise'], group: 'shoulders', sets: 3, reps: [15, 15], tempo: '2-0-2', rpe: [7, 8], restSec: 45, startKg: 7, unit: 'kg', startDisplay: '6–9kg', week4GoalKg: 11, cue: 'Cable keeps tension through the bottom.', rom: 'Stop at shoulder height.', alternatives: [alt('Cable Lateral Raise', ''), alt('Band Lateral Raise', '')] }),
        ex({ name: 'Dumbbell Kickback', aliases: ['Dumbbell kickback, light', 'Tricep Kickback'], group: 'triceps', sets: 3, reps: [12, 12], tempo: '2-1-2', rpe: [8, 8], restSec: 45, startKg: 7, unit: 'kg', startDisplay: '6–8kg', week4GoalKg: 10, cue: 'Upper arm fixed and parallel to the floor.', alternatives: [alt('Rope Pushdown', ''), alt('Overhead Cable Extension', '')] }),
        ex({ name: 'Rope Pushdown', aliases: ['Tricep pushdown, rope', 'Tricep Pushdown'], group: 'triceps', sets: 3, reps: [12, 12], tempo: '2-1-2', rpe: [8, 8], restSec: 45, startKg: 32, unit: 'kg', startDisplay: '30–34kg', week4GoalKg: 38, cue: 'Spread the rope apart at the bottom.', alternatives: [alt('Tricep Pushdown', ''), alt('Overhead Cable Extension', '')] }),
        ex({ name: 'Dumbbell Reverse Wrist Curl', aliases: ['Reverse wrist curl'], group: 'forearms', sets: 2, reps: [15, 20], tempo: '2-1-2', rpe: [8, 8], restSec: 40, startKg: 3.5, unit: 'kg_per_side', startDisplay: '3–4kg/side', week4GoalKg: 5.5, cue: 'Palm facing down.', alternatives: [alt('Cable Wrist Curl', ''), alt('Hand Gripper', '')] }),
        ex({ name: 'Cable Crunch', aliases: ['Cable crunch'], group: 'core', sets: 3, reps: [15, 15], tempo: '2-1-2', rpe: [7, 8], restSec: 40, startKg: 27, unit: 'kg', startDisplay: '25–30kg', week4GoalKg: 37, cue: 'Kneel, round spine toward hips, hips still.', alternatives: [alt('Cable Crunch', ''), alt('Plank', '')] })
      ], PUSH_WU),

      pull_b: session('pull_b', 'Pull B — Back / Biceps / Forearms', ['back', 'biceps', 'forearms'], 'pull', CARDIO_STD, [
        ex({ name: 'Chest-Supported Row', aliases: ['Chest-supported row machine'], group: 'back', role: 'primary', sets: 4, reps: [12, 12], tempo: '3-1-1', rpe: [8, 8], restSec: 75, startKg: 42, unit: 'kg', startDisplay: '40–45kg', week4GoalKg: 53, cue: 'Chest pinned to the pad the whole set.', why: 'Zero spinal loading row.', alternatives: [alt('Chest-Supported Row', ''), alt('Single-Arm Cable Row', '')] }),
        ex({ name: 'Straight-Arm Pulldown', aliases: ['Straight-arm pulldown'], group: 'back', sets: 3, reps: [12, 12], tempo: '3-1-1', rpe: [7, 8], restSec: 60, startKg: 27, unit: 'kg', startDisplay: '25–30kg', week4GoalKg: 34, cue: 'Arms nearly straight, pull in an arc. Feel it in the lats, not the arms.', alternatives: [alt('Assisted Pull-Up', ''), alt('Straight-Arm Pulldown', '')] }),
        ex({ name: 'Single-Arm Cable Row', aliases: ['Single-arm cable row'], group: 'back', sets: 3, reps: [10, 10], tempo: '3-1-1', rpe: [8, 8], restSec: 60, startKg: 22, unit: 'kg', startDisplay: '20–25kg', week4GoalKg: 30, cue: 'Full stretch forward, drive the elbow back, resist rotating.', why: 'Evens left-right imbalance.', alternatives: [alt('Chest-Supported Row', ''), alt('Seated Cable Row', '')] }),
        ex({ name: 'Lat Pulldown', aliases: ['Lat pulldown, wide grip'], group: 'back', sets: 3, reps: [12, 12], tempo: '3-1-1', rpe: [8, 8], restSec: 75, startKg: 47, unit: 'kg', startDisplay: '45–50kg', week4GoalKg: 58, cue: 'Same cues as Pull A.', rom: 'Never behind the neck.', alternatives: [alt('Assisted Pull-Up', ''), alt('Straight-Arm Pulldown', '')] }),
        ex({ name: 'Back Extension Machine', aliases: ['Back extension'], group: 'back', sets: 3, reps: [15, 15], tempo: '2-1-2', rpe: [7, 7], restSec: 60, startKg: 15, unit: 'kg', startDisplay: 'Bodyweight or +15kg', week4GoalKg: 25, cue: 'Don’t hyperextend.', alternatives: [alt('Cable Pull-Through', ''), alt('Bodyweight Back Extension', '')] }),
        ex({ name: 'Rear Delt Fly Machine', aliases: ['Rear delt fly machine', 'Rear Delt Fly'], group: 'shoulders', sets: 3, reps: [15, 15], tempo: '2-1-2', rpe: [7, 8], restSec: 45, startKg: 17, unit: 'kg', startDisplay: '15–20kg', week4GoalKg: 25, cue: 'Squeeze shoulder blades. Keep it light.', alternatives: [alt('Face Pulls', ''), alt('Rear Delt Fly', '')] }),
        ex({ name: 'Cable Hammer Curl', aliases: ['Cable curl, rope/hammer grip', 'Hammer Curl'], group: 'biceps', sets: 3, reps: [12, 12], tempo: '2-1-2', rpe: [8, 8], restSec: 45, startKg: 17, unit: 'kg', startDisplay: '15–20kg', week4GoalKg: 25, cue: 'Neutral grip shifts emphasis to the brachialis.', alternatives: [alt('Cable Curl', ''), alt('Preacher Curl', '')] }),
        ex({ name: 'Dumbbell Reverse Wrist Curl', aliases: ['Reverse wrist curl'], group: 'forearms', sets: 2, reps: [15, 20], tempo: '2-1-2', rpe: [8, 8], restSec: 40, startKg: 3.5, unit: 'kg_per_side', startDisplay: '3–4kg/side', week4GoalKg: 5.5, cue: 'Palm down.', alternatives: [alt('Cable Wrist Curl', ''), alt('Hand Gripper', '')] }),
        ex({ name: 'Hanging Knee Raise', aliases: ['Hanging knee raise or leg raise machine', 'Hanging Leg Raise'], group: 'core', sets: 3, reps: [12, 12], tempo: '2-1-2', rpe: [7, 8], restSec: 40, startKg: 0, unit: 'bodyweight', startDisplay: 'Bodyweight, or 25–30kg', week4GoalKg: 37, cue: 'Curl hips toward ribs. Don’t swing the legs.', alternatives: [alt('Cable Crunch', ''), alt('Plank', '')] })
      ], PULL_WU),

      legs_b: session('legs_b', 'Legs B — Quads / Hamstrings / Glutes / Calves', ['quads', 'hamstrings', 'glutes', 'calves'], 'legs', CARDIO_LEGS, [
        ex({ name: 'Hack Squat', aliases: ['Hack squat machine'], group: 'quads', role: 'primary', sets: 4, reps: [10, 10], tempo: '3-1-1', rpe: [8, 8], restSec: 90, startKg: 70, unit: 'kg', startDisplay: '60–80kg', week4GoalKg: 100, cue: 'Back flat against the pad. Don’t let knees cave inward.', alternatives: [alt('Hack Squat', ''), alt('Leg Press — Narrow Stance', '')] }),
        ex({ name: 'Leg Extension', aliases: ['Leg extension machine'], group: 'quads', sets: 3, reps: [15, 15], tempo: '2-1-2', rpe: [8, 8], restSec: 60, startKg: 40, unit: 'kg', startDisplay: '35–45kg', week4GoalKg: 55, cue: 'Same cues as Legs A.', alternatives: [alt('Hack Squat', ''), alt('Leg Press — Narrow Stance', '')] }),
        ex({ name: 'Hip Thrust', aliases: ['Hip thrust machine'], group: 'glutes', role: 'primary', sets: 4, reps: [12, 12], tempo: '2-1-2', rpe: [8, 8], restSec: 75, startKg: 45, unit: 'kg', startDisplay: '40–50kg', week4GoalKg: 67, cue: 'Full lockout, chin tucked. Don’t hyperextend the lower back.', alternatives: [alt('Hip Thrust', ''), alt('Cable Glute Kickback', '')] }),
        ex({ name: 'Lying Leg Curl', aliases: ['Lying leg curl machine', 'Leg Curl'], group: 'hamstrings', sets: 3, reps: [12, 12], tempo: '2-1-2', rpe: [8, 8], restSec: 60, startKg: 35, unit: 'kg', startDisplay: '30–40kg', week4GoalKg: 50, cue: 'Hips pinned to the pad.', alternatives: [alt('Leg Curl', ''), alt('Single-Leg Cable Curl', '')] }),
        ex({ name: 'Hip Abductor Machine', aliases: ['Hip adductor/abductor machine'], group: 'glutes', sets: 2, reps: [15, 15], tempo: '2-1-2', rpe: [7, 7], restSec: 45, startKg: 30, unit: 'kg', startDisplay: '25–35kg each', week4GoalKg: 45, cue: 'Controlled both directions.', skipOk: true, why: 'Lowest-priority accessory — fine to drop if the machine is busy.', alternatives: [alt('Cable Hip Abduction', ''), alt('Skip Hip Abductor', '')] }),
        ex({ name: 'Standing Calf Raise', aliases: ['Standing calf raise machine'], group: 'calves', sets: 4, reps: [15, 15], tempo: '2-1-2', rpe: [8, 8], restSec: 45, startKg: 70, unit: 'kg', startDisplay: '60–80kg', week4GoalKg: 100, cue: 'Same cues as Legs A.', alternatives: [alt('Leg Press Calf Raise', ''), alt('Bodyweight Calf Raise', '')] }),
        ex({ name: 'Seated Calf Raise', aliases: ['Seated calf raise machine'], group: 'calves', sets: 3, reps: [15, 15], tempo: '2-1-2', rpe: [8, 8], restSec: 45, startKg: 47, unit: 'kg', startDisplay: '40–55kg', week4GoalKg: 67, cue: 'Same cues as Legs A.', alternatives: [alt('Leg Press Calf Raise', ''), alt('Bodyweight Calf Raise', '')] }),
        ex({ name: 'Dumbbell Reverse Wrist Curl', aliases: ['Reverse wrist curl'], group: 'forearms', sets: 2, reps: [15, 20], tempo: '2-1-2', rpe: [8, 8], restSec: 40, startKg: 3.5, unit: 'kg_per_side', startDisplay: '3–4kg/side', week4GoalKg: 5.5, cue: 'Palm down.', alternatives: [alt('Cable Wrist Curl', ''), alt('Hand Gripper', '')] }),
        ex({ name: 'Cable Crunch', aliases: ['Cable crunch'], group: 'core', sets: 3, reps: [15, 15], tempo: '2-1-2', rpe: [7, 8], restSec: 40, startKg: 27, unit: 'kg', startDisplay: '25–30kg', week4GoalKg: 37, cue: 'Same cues as Push B.', alternatives: [alt('Cable Crunch', ''), alt('Plank', '')] })
      ], LEG_WU)
    }
  };

  window.PLAN_TEMPLATES = window.PLAN_TEMPLATES || {};
  window.PLAN_TEMPLATES.machine_ppl_shoulder = plan;
})();
