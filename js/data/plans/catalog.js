'use strict';
/* Compact public templates + matcher for daysPerWeek × equipment. */

(function() {
  function alt(name) { return { name: name, cue: '' }; }
  function lift(name, group, sets, reps, startKg, alts) {
    return {
      name: name, group: group, sets: sets, reps: [reps, reps], tempo: '2-0-1',
      rpe: [7, 8], restSec: 75, startKg: startKg || 0, unit: startKg ? 'kg' : 'bodyweight',
      cue: '', alternatives: (alts || []).map(alt)
    };
  }
  function sess(id, name, muscles, exercises, warmup) {
    return {
      id: id, name: name, muscles: muscles, family: id.split('_')[0],
      warmup: warmup || ['5 min easy cardio'],
      cardio: { kind: 'walk or bike', minutes: 15 },
      exercises: exercises
    };
  }
  function plan(id, title, suits, rotation, rest, sessions, split) {
    return {
      schemaVersion: 1,
      id: id,
      title: title,
      suits: suits,
      active: false,
      acknowledgedSafety: false,
      source: { type: 'template', name: id },
      restWeekdays: rest,
      rotation: rotation,
      split: split,
      mesocycle: { weeks: 5, deloadWeek: 5 },
      progression: { type: 'double', targetRpe: 8, rpeNever: 10, incrementPct: 0.03, deloadLoadPct: 0.6, deloadDropSets: 1, deloadRpe: 6, missWeekDropPct: 0.1 },
      safety: {
        disclaimer: 'Educational training software — not medical clearance. Stop on sharp pain, clunk, or instability.',
        stopOn: ['clunk', 'shift', 'sharp'],
        romRules: []
      },
      notes: suits,
      sessions: sessions
    };
  }

  const WU = ['5 min easy cardio', 'Easy mobility'];

  const fullbody_3 = plan(
    'fullbody_3',
    'Full body 3×/week',
    'Beginners and 2–3 gym days. Compounds, short sessions.',
    ['fb_a', 'fb_b', 'fb_c'],
    ['sun', 'tue', 'thu', 'sat'],
    {
      fb_a: sess('fb_a', 'Full body A', ['quads', 'chest', 'back'], [
        lift('Goblet Squat', 'legs', 3, 10, 16, ['Leg Press']),
        lift('Dumbbell Bench Press', 'chest', 3, 10, 16, ['Push-Ups', 'Machine Chest Press']),
        lift('Seated Cable Row', 'back', 3, 12, 30, ['Dumbbell Row']),
        lift('Plank', 'core', 3, 30, 0, [])
      ], WU),
      fb_b: sess('fb_b', 'Full body B', ['hamstrings', 'shoulders', 'lats'], [
        lift('Romanian Deadlift', 'legs', 3, 10, 40, ['Leg Curl']),
        lift('Lat Pulldown', 'back', 3, 10, 35, ['Dumbbell Row']),
        lift('Dumbbell Shoulder Press', 'shoulders', 3, 10, 12, ['Shoulder Press Machine']),
        lift('Hammer Curl', 'biceps', 2, 12, 10, [])
      ], WU),
      fb_c: sess('fb_c', 'Full body C', ['glutes', 'chest', 'back'], [
        lift('Leg Press', 'legs', 3, 12, 60, ['Goblet Squat']),
        lift('Incline Dumbbell Press', 'chest', 3, 10, 14, ['Push-Ups']),
        lift('Lat Pulldown', 'back', 3, 10, 35, ['Seated Cable Row']),
        lift('Tricep Pushdown', 'triceps', 2, 12, 20, [])
      ], WU)
    },
    'fb'
  );

  const upper_lower_4 = plan(
    'upper_lower_4',
    'Upper / lower 4-day',
    'Four gym days. Balanced volume without a 6-day grind.',
    ['upper_a', 'lower_a', 'upper_b', 'lower_b'],
    ['sun', 'wed', 'sat'],
    {
      upper_a: sess('upper_a', 'Upper A', ['chest', 'back', 'shoulders'], [
        lift('Barbell Bench Press', 'chest', 4, 8, 40, ['Dumbbell Bench Press', 'Machine Chest Press']),
        lift('Barbell Row', 'back', 4, 8, 40, ['Seated Cable Row']),
        lift('Dumbbell Lateral Raise', 'shoulders', 3, 12, 8, ['Lateral Raise Machine']),
        lift('Tricep Pushdown', 'triceps', 3, 12, 20, [])
      ], WU),
      lower_a: sess('lower_a', 'Lower A', ['quads', 'glutes'], [
        lift('Back Squat', 'legs', 4, 8, 50, ['Goblet Squat', 'Leg Press']),
        lift('Romanian Deadlift', 'legs', 3, 10, 50, ['Leg Curl']),
        lift('Leg Extension', 'legs', 2, 12, 30, []),
        lift('Standing Calf Raise', 'calves', 3, 12, 40, [])
      ], WU),
      upper_b: sess('upper_b', 'Upper B', ['back', 'chest', 'biceps'], [
        lift('Lat Pulldown', 'back', 4, 10, 40, ['Seated Cable Row']),
        lift('Incline Dumbbell Press', 'chest', 3, 10, 16, ['Machine Chest Press']),
        lift('Face Pulls', 'shoulders', 3, 15, 15, []),
        lift('Barbell Curl', 'biceps', 3, 10, 20, ['Hammer Curl'])
      ], WU),
      lower_b: sess('lower_b', 'Lower B', ['hamstrings', 'glutes', 'quads'], [
        lift('Leg Press', 'legs', 4, 10, 80, ['Goblet Squat']),
        lift('Leg Curl', 'legs', 3, 12, 30, []),
        lift('Hip Thrust', 'glutes', 3, 10, 40, []),
        lift('Standing Calf Raise', 'calves', 3, 12, 40, [])
      ], WU)
    },
    'ul'
  );

  const ppl_6 = plan(
    'ppl_6',
    'Push / Pull / Legs 6-day',
    'Full gym, 5–6 days. Classic PPL A/B.',
    ['push_a', 'pull_a', 'legs_a', 'push_b', 'pull_b', 'legs_b'],
    ['sun'],
    {
      push_a: sess('push_a', 'Push A', ['chest', 'shoulders', 'triceps'], [
        lift('Barbell Bench Press', 'chest', 4, 8, 50, ['Dumbbell Bench Press']),
        lift('Overhead Press', 'shoulders', 3, 8, 30, ['Dumbbell Shoulder Press']),
        lift('Incline Dumbbell Press', 'chest', 3, 10, 16, []),
        lift('Tricep Pushdown', 'triceps', 3, 12, 25, [])
      ], WU),
      pull_a: sess('pull_a', 'Pull A', ['back', 'biceps'], [
        lift('Barbell Row', 'back', 4, 8, 50, ['Seated Cable Row']),
        lift('Lat Pulldown', 'back', 3, 10, 40, []),
        lift('Face Pulls', 'shoulders', 3, 15, 15, []),
        lift('Barbell Curl', 'biceps', 3, 10, 25, [])
      ], WU),
      legs_a: sess('legs_a', 'Legs A', ['quads', 'glutes'], [
        lift('Back Squat', 'legs', 4, 8, 60, ['Goblet Squat']),
        lift('Romanian Deadlift', 'legs', 3, 10, 60, []),
        lift('Leg Press', 'legs', 3, 12, 80, []),
        lift('Standing Calf Raise', 'calves', 3, 12, 40, [])
      ], WU),
      push_b: sess('push_b', 'Push B', ['chest', 'shoulders', 'triceps'], [
        lift('Incline Dumbbell Press', 'chest', 4, 10, 18, ['Machine Chest Press']),
        lift('Dumbbell Shoulder Press', 'shoulders', 3, 10, 14, []),
        lift('Dumbbell Lateral Raise', 'shoulders', 3, 15, 8, []),
        lift('Overhead Tricep Extension — Cable', 'triceps', 3, 12, 20, ['Tricep Pushdown'])
      ], WU),
      pull_b: sess('pull_b', 'Pull B', ['back', 'biceps'], [
        lift('Deadlift', 'back', 3, 5, 80, ['Romanian Deadlift']),
        lift('Seated Cable Row', 'back', 3, 10, 40, []),
        lift('Lat Pulldown', 'back', 3, 10, 40, []),
        lift('Hammer Curl', 'biceps', 3, 12, 12, [])
      ], WU),
      legs_b: sess('legs_b', 'Legs B', ['hamstrings', 'glutes', 'quads'], [
        lift('Leg Press', 'legs', 4, 10, 90, ['Goblet Squat']),
        lift('Leg Curl', 'legs', 3, 12, 35, []),
        lift('Hip Thrust', 'glutes', 3, 10, 50, []),
        lift('Standing Calf Raise', 'calves', 3, 12, 40, [])
      ], WU)
    },
    'ppl'
  );

  const machines_fb_3 = plan(
    'machines_fb_3',
    'Machines 3×/week',
    'Machines and cables only. Three short full-body sessions.',
    ['mfb_a', 'mfb_b', 'mfb_c'],
    ['sun', 'tue', 'thu', 'sat'],
    {
      mfb_a: sess('mfb_a', 'Machines A', ['quads', 'chest', 'back'], [
        lift('Leg Press', 'legs', 3, 12, 60, ['Goblet Squat']),
        lift('Machine Chest Press', 'chest', 3, 10, 35, ['Push-Ups']),
        lift('Seated Cable Row', 'back', 3, 12, 30, ['Lat Pulldown']),
        lift('Plank', 'core', 3, 30, 0, [])
      ], WU),
      mfb_b: sess('mfb_b', 'Machines B', ['hamstrings', 'shoulders', 'lats'], [
        lift('Leg Curl', 'legs', 3, 12, 30, ['Romanian Deadlift']),
        lift('Lat Pulldown', 'back', 3, 10, 35, ['Seated Cable Row']),
        lift('Shoulder Press Machine', 'shoulders', 3, 10, 25, ['Cable Lateral Raise']),
        lift('Face Pulls', 'shoulders', 3, 15, 15, [])
      ], WU),
      mfb_c: sess('mfb_c', 'Machines C', ['glutes', 'chest', 'triceps'], [
        lift('Glute Bridge', 'glutes', 3, 12, 0, ['Hip Thrust']),
        lift('Machine Chest Press', 'chest', 3, 10, 35, ['Push-Ups']),
        lift('Lat Pulldown', 'back', 3, 10, 35, ['Seated Cable Row']),
        lift('Tricep Pushdown', 'triceps', 2, 12, 20, [])
      ], WU)
    },
    'fb'
  );

  const home_bw = plan(
    'home_bw',
    'Home bodyweight',
    'No gym. Bands optional. 2–3 short sessions.',
    ['home_a', 'home_b'],
    ['sun', 'tue', 'thu', 'sat'],
    {
      home_a: sess('home_a', 'Home A — push + legs', ['chest', 'quads', 'core'], [
        lift('Push-Ups', 'chest', 3, 10, 0, ['Knee Push-Up']),
        lift('Bodyweight Squat', 'legs', 3, 12, 0, ['Split Squat']),
        lift('Glute Bridge', 'glutes', 3, 12, 0, []),
        lift('Plank', 'core', 3, 30, 0, [])
      ], ['March in place 3 min']),
      home_b: sess('home_b', 'Home B — pull + hinge', ['back', 'hamstrings', 'core'], [
        lift('Inverted Row', 'back', 3, 8, 0, ['Band Row']),
        lift('Reverse Lunge', 'legs', 3, 10, 0, ['Bodyweight Squat']),
        lift('Glute Bridge', 'glutes', 3, 12, 0, ['Hip Thrust']),
        lift('Dead Bug', 'core', 3, 10, 0, ['Plank'])
      ], ['March in place 3 min'])
    },
    'fb'
  );

  window.PLAN_TEMPLATES = window.PLAN_TEMPLATES || {};
  window.PLAN_TEMPLATES.fullbody_3 = fullbody_3;
  window.PLAN_TEMPLATES.upper_lower_4 = upper_lower_4;
  window.PLAN_TEMPLATES.ppl_6 = ppl_6;
  window.PLAN_TEMPLATES.ppl_5 = (function() {
    const p = JSON.parse(JSON.stringify(ppl_6));
    p.id = 'ppl_5';
    p.title = 'Push / Pull / Legs 5-day';
    p.suits = 'Full gym, 5 days. Classic PPL without the sixth session.';
    p.rotation = ['push_a', 'pull_a', 'legs_a', 'push_b', 'pull_b'];
    p.restWeekdays = ['sun', 'thu'];
    p.notes = p.suits;
    delete p.sessions.legs_b;
    return p;
  })();
  window.PLAN_TEMPLATES.machines_fb_3 = machines_fb_3;
  window.PLAN_TEMPLATES.home_bw = home_bw;

  window.PlanCatalog = {
    all: function() {
      const t = window.PLAN_TEMPLATES || {};
      return Object.keys(t).map(function(id) { return t[id]; });
    },
    match: function(user) {
      user = user || {};
      const days = Number(user.daysPerWeek || user.weeklyGoal) || 3;
      const kit = user.equipmentKit || 'full_gym';
      const lim = (user.limitations || []).map(function(l) {
        return String((typeof l === 'string' ? l : (l.joint || l.id || '')) || '').toLowerCase();
      });
      const shoulder = lim.some(function(j) { return j.indexOf('shoulder') >= 0; });
      if (kit === 'home_minimal') {
        return { id: 'home_bw', plan: home_bw, days: Math.min(3, Math.max(2, days)) };
      }
      if (shoulder) {
        const p = (window.PLAN_TEMPLATES || {}).machine_ppl_shoulder;
        if (p) return { id: 'machine_ppl_shoulder', plan: p, days: (p.rotation || []).length || 6 };
      }
      if (kit === 'machines_cables') {
        if (days <= 4) return { id: 'machines_fb_3', plan: machines_fb_3, days: 3 };
        const p = (window.PLAN_TEMPLATES || {}).machine_ppl_shoulder;
        if (p) return { id: 'machine_ppl_shoulder', plan: p, days: 6 };
      }
      if (days <= 3) return { id: 'fullbody_3', plan: fullbody_3, days: 3 };
      if (days === 4) return { id: 'upper_lower_4', plan: upper_lower_4, days: 4 };
      if (days === 5) return { id: 'ppl_5', plan: window.PLAN_TEMPLATES.ppl_5, days: 5 };
      return { id: 'ppl_6', plan: ppl_6, days: 6 };
    }
  };
})();
