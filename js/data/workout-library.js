'use strict';
/* Ready-to-run workouts — start any of them any day, separate from the
   weekly split. `kit` = setups the workout fits as written; anything else is
   matched to the user's equipment and limitations when it starts.
   reps: number (or "8-10" range); `time: true` means the number is seconds
   (or minutes when `unit: 'min'`) — logged in the reps box. */
window.WORKOUT_LIBRARY = [
  /* ── Full body ── */
  { id: 'beginner_full_body', name: 'Beginner Full Body', cat: 'full', minutes: 45, level: 'beginner', kit: ['full_gym'], goals: ['hypertrophy', 'fat_loss', 'general_health', 'weight_gain'],
    about: 'Every major muscle, simple lifts, nothing technical. The best first month in a gym.',
    guidance: ['Pick weights you could lift 3–4 more times. Today is about learning the moves.', 'Rest about 90 seconds between sets.', 'Same workout 2–3 times a week; add a rep or a little weight each time.'],
    exercises: [
      { n: 'Goblet Squat', sets: 3, reps: '10', rest: 90, note: 'Hold one dumbbell at your chest, sit between your heels.' },
      { n: 'Machine Chest Press', sets: 3, reps: '10', rest: 90 },
      { n: 'Lat Pulldown', sets: 3, reps: '10', rest: 90, note: 'Pull to your upper chest, not behind your neck.' },
      { n: 'Romanian Deadlift — DB', sets: 3, reps: '10', rest: 90, note: 'Push your hips back; feel the stretch in your hamstrings.' },
      { n: 'Dumbbell Shoulder Press', sets: 2, reps: '10', rest: 75 },
      { n: 'Plank', sets: 3, reps: '30', time: true, rest: 45 }
    ] },
  { id: 'machine_full_body', name: 'Machine Full Body', cat: 'full', minutes: 40, level: 'beginner', kit: ['full_gym', 'machines_cables'], goals: ['general_health', 'fat_loss', 'hypertrophy'],
    about: 'Machines guide the path, so you can push hard safely without a spotter.',
    guidance: ['Set each seat so the handles line up with the working joint.', 'Slow on the way back — 2–3 seconds.', 'Write down seat numbers in the exercise note.'],
    exercises: [
      { n: 'Leg Press', sets: 3, reps: '10-12', rest: 90 },
      { n: 'Machine Chest Press', sets: 3, reps: '10', rest: 90 },
      { n: 'Machine Lat Pulldown', sets: 3, reps: '10', rest: 90 },
      { n: 'Seated Machine Row', sets: 3, reps: '10', rest: 90 },
      { n: 'Machine Shoulder Press', sets: 2, reps: '10', rest: 75 },
      { n: 'Seated Leg Curl', sets: 2, reps: '12', rest: 60 },
      { n: 'Cable Crunch', sets: 2, reps: '15', rest: 45 }
    ] },
  { id: 'dumbbell_full_body', name: 'Dumbbell Full Body', cat: 'full', minutes: 45, level: 'all', kit: ['full_gym', 'dumbbells'], goals: ['hypertrophy', 'fat_loss', 'general_health'],
    about: 'A complete session with one pair of dumbbells and a bench.',
    guidance: ['Use the same pair for most lifts if that’s all you have — slow the tempo to make it harder.', 'Rest 60–90 seconds.'],
    exercises: [
      { n: 'Goblet Squat', sets: 3, reps: '10-12', rest: 90 },
      { n: 'Dumbbell Bench Press', sets: 3, reps: '8-12', rest: 90 },
      { n: 'Dumbbell Row', sets: 3, reps: '10', rest: 75, note: 'Each arm.' },
      { n: 'Romanian Deadlift — DB', sets: 3, reps: '10', rest: 90 },
      { n: 'Dumbbell Shoulder Press', sets: 2, reps: '10', rest: 75 },
      { n: 'Dumbbell Curl', sets: 2, reps: '12', rest: 60 }
    ] },
  { id: 'home_full_body', name: 'Home Full Body — No Equipment', cat: 'full', minutes: 30, level: 'beginner', kit: ['full_gym', 'machines_cables', 'dumbbells', 'home_minimal'], goals: ['general_health', 'fat_loss'],
    about: 'Living room, hotel, park. Just you and the floor.',
    guidance: ['Push-ups too hard? Do them against a wall or a table edge.', 'Rest 45–60 seconds. Keep moving between sets.'],
    exercises: [
      { n: 'Bodyweight Squat', sets: 3, reps: '15', rest: 60 },
      { n: 'Push-Ups', sets: 3, reps: '8-12', rest: 60 },
      { n: 'Reverse Lunge', sets: 3, reps: '10', rest: 60, note: 'Each leg.' },
      { n: 'Glute Bridge', sets: 3, reps: '15', rest: 45 },
      { n: 'Superman Hold', sets: 3, reps: '20', time: true, rest: 45 },
      { n: 'Plank', sets: 3, reps: '30', time: true, rest: 45 }
    ] },
  { id: 'express_20', name: '20-Minute Express', cat: 'full', minutes: 20, level: 'all', kit: ['full_gym', 'dumbbells'], goals: ['fat_loss', 'general_health'],
    about: 'Short on time. Four moves back to back, rest after the round.',
    guidance: ['Do one set of each move in a row, then rest 90 seconds. Three rounds.', 'Moderate weight — you should be breathing hard, not failing reps.'],
    exercises: [
      { n: 'Goblet Squat', sets: 3, reps: '12', rest: 15 },
      { n: 'Push-Ups', sets: 3, reps: '10', rest: 15 },
      { n: 'Dumbbell Row', sets: 3, reps: '12', rest: 15 },
      { n: 'Romanian Deadlift — DB', sets: 3, reps: '12', rest: 90 }
    ] },

  /* ── Upper ── */
  { id: 'push_day', name: 'Push Day', cat: 'upper', minutes: 55, level: 'intermediate', kit: ['full_gym'], goals: ['hypertrophy', 'strength'],
    about: 'Chest, shoulders and triceps — the classic “push”.',
    guidance: ['Heaviest lift first while you’re fresh.', 'Stop most sets with 1–2 reps left.', 'Shoulders feel pinchy? Tap Easier on the press.'],
    exercises: [
      { n: 'Barbell Bench Press', sets: 4, reps: '6-8', rest: 150 },
      { n: 'Incline Dumbbell Press', sets: 3, reps: '8-10', rest: 120 },
      { n: 'Dumbbell Shoulder Press', sets: 3, reps: '8-10', rest: 120 },
      { n: 'Cable Lateral Raise', sets: 3, reps: '12-15', rest: 60 },
      { n: 'Tricep Pushdown', sets: 3, reps: '10-12', rest: 60 },
      { n: 'Overhead Tricep Extension', sets: 2, reps: '12', rest: 60 }
    ] },
  { id: 'pull_day', name: 'Pull Day', cat: 'upper', minutes: 50, level: 'intermediate', kit: ['full_gym'], goals: ['hypertrophy', 'strength'],
    about: 'Back and biceps — the posture and “wide back” day.',
    guidance: ['Lead every pull with your elbows, not your hands.', 'Squeeze the shoulder blades together at the end of each row.'],
    exercises: [
      { n: 'Lat Pulldown', sets: 4, reps: '8-10', rest: 120 },
      { n: 'Barbell Row', sets: 3, reps: '8', rest: 120 },
      { n: 'Seated Cable Row', sets: 3, reps: '10', rest: 90 },
      { n: 'Face Pulls', sets: 3, reps: '15', rest: 60 },
      { n: 'Dumbbell Curl', sets: 3, reps: '10-12', rest: 60 },
      { n: 'Hammer Curl', sets: 2, reps: '12', rest: 60 }
    ] },
  { id: 'upper_gym', name: 'Upper Body', cat: 'upper', minutes: 55, level: 'all', kit: ['full_gym'], goals: ['hypertrophy', 'strength', 'general_health'],
    about: 'Push and pull in one session — pairs with Lower Body for a 4-day week.',
    guidance: ['Alternate a push and a pull to keep shoulders balanced.', 'Rest 2 minutes on the first three lifts.'],
    exercises: [
      { n: 'Barbell Bench Press', sets: 3, reps: '8', rest: 120 },
      { n: 'Barbell Row', sets: 3, reps: '8', rest: 120 },
      { n: 'Overhead Press', sets: 3, reps: '8', rest: 120 },
      { n: 'Lat Pulldown', sets: 3, reps: '10', rest: 90 },
      { n: 'Dumbbell Lateral Raise', sets: 3, reps: '12-15', rest: 60 },
      { n: 'EZ Bar Curl', sets: 2, reps: '12', rest: 60 },
      { n: 'Tricep Pushdown', sets: 2, reps: '12', rest: 60 }
    ] },
  { id: 'chest_triceps', name: 'Chest & Triceps', cat: 'upper', minutes: 50, level: 'intermediate', kit: ['full_gym'], goals: ['hypertrophy'],
    about: 'A focused chest day with the arm muscle that helps every press.',
    guidance: ['Control the bar down to your chest — no bouncing.', 'On flys, think “hug a tree”, not “press”.'],
    exercises: [
      { n: 'Barbell Bench Press', sets: 4, reps: '8', rest: 150 },
      { n: 'Incline Dumbbell Press', sets: 3, reps: '10', rest: 120 },
      { n: 'Cable Fly', sets: 3, reps: '12', rest: 60 },
      { n: 'Chest Dip', sets: 3, reps: '8-12', rest: 90, note: 'Lean forward slightly to keep it on the chest.' },
      { n: 'Skull Crushers', sets: 3, reps: '10', rest: 75 },
      { n: 'Tricep Pushdown', sets: 3, reps: '12', rest: 60 }
    ] },
  { id: 'back_biceps', name: 'Back & Biceps', cat: 'upper', minutes: 50, level: 'intermediate', kit: ['full_gym'], goals: ['hypertrophy', 'strength'],
    about: 'Thickness and width for the back, plus arm work to finish.',
    guidance: ['Deadlift first and keep it crisp — stop the set if your back rounds.', 'Pull-ups too hard? Easier swaps to the pulldown.'],
    exercises: [
      { n: 'Deadlift', sets: 3, reps: '5', rest: 180 },
      { n: 'Pull-Ups', sets: 3, reps: '6-10', rest: 120 },
      { n: 'Dumbbell Row', sets: 3, reps: '10', rest: 90 },
      { n: 'Face Pulls', sets: 3, reps: '15', rest: 60 },
      { n: 'Barbell Curl', sets: 3, reps: '10', rest: 60 },
      { n: 'Incline Dumbbell Curl', sets: 2, reps: '12', rest: 60 }
    ] },
  { id: 'shoulders_arms', name: 'Shoulders & Arms', cat: 'upper', minutes: 50, level: 'intermediate', kit: ['full_gym'], goals: ['hypertrophy'],
    about: 'Rounder shoulders and fuller sleeves.',
    guidance: ['Lateral raises: lead with the elbows, stop at shoulder height.', 'Light weight, strict reps — arms grow from tension, not swinging.'],
    exercises: [
      { n: 'Overhead Press', sets: 4, reps: '6-8', rest: 150 },
      { n: 'Dumbbell Lateral Raise', sets: 4, reps: '12-15', rest: 60 },
      { n: 'Rear Delt Fly', sets: 3, reps: '15', rest: 60 },
      { n: 'EZ Bar Curl', sets: 3, reps: '10', rest: 60 },
      { n: 'Skull Crushers', sets: 3, reps: '10', rest: 60 },
      { n: 'Hammer Curl', sets: 2, reps: '12', rest: 60 },
      { n: 'Cable Overhead Extension', sets: 2, reps: '12', rest: 60 }
    ] },
  { id: 'dumbbell_upper', name: 'Dumbbell Upper Body', cat: 'upper', minutes: 45, level: 'all', kit: ['full_gym', 'dumbbells'], goals: ['hypertrophy', 'general_health'],
    about: 'Chest, back, shoulders and arms with just dumbbells.',
    guidance: ['On rows, pull the dumbbell to your hip, not your chest.', 'Rest 60–90 seconds.'],
    exercises: [
      { n: 'Dumbbell Bench Press', sets: 3, reps: '10', rest: 90 },
      { n: 'Dumbbell Row', sets: 3, reps: '10', rest: 75 },
      { n: 'Dumbbell Shoulder Press', sets: 3, reps: '10', rest: 90 },
      { n: 'Dumbbell Lateral Raise', sets: 3, reps: '15', rest: 60 },
      { n: 'Rear Delt Fly', sets: 2, reps: '15', rest: 60 },
      { n: 'Hammer Curl', sets: 2, reps: '12', rest: 60 },
      { n: 'Tricep Kickback', sets: 2, reps: '12', rest: 60 }
    ] },
  { id: 'band_upper', name: 'Band Upper Body', cat: 'upper', minutes: 30, level: 'beginner', kit: ['full_gym', 'machines_cables', 'dumbbells', 'home_minimal'], goals: ['general_health', 'fat_loss'],
    about: 'A resistance band and a door anchor are enough.',
    guidance: ['Step further from the anchor to make it harder.', 'Control the band on the way back — don’t let it snap you.'],
    exercises: [
      { n: 'Band Chest Press', sets: 3, reps: '12', rest: 60 },
      { n: 'Resistance Band Row', sets: 3, reps: '12', rest: 60 },
      { n: 'Band Pull-Aparts', sets: 3, reps: '15', rest: 45 },
      { n: 'Push-Ups', sets: 3, reps: '10', rest: 60 },
      { n: 'Band Tricep Pushdown', sets: 2, reps: '15', rest: 45 }
    ] },

  /* ── Lower ── */
  { id: 'leg_day', name: 'Leg Day', cat: 'lower', minutes: 55, level: 'intermediate', kit: ['full_gym'], goals: ['hypertrophy', 'strength'],
    about: 'Quads, hamstrings, glutes and calves — the full lower body.',
    guidance: ['Warm up the squat with 2–3 lighter sets first.', 'Knees track over your toes; heels stay down.'],
    exercises: [
      { n: 'Back Squat', sets: 4, reps: '6-8', rest: 180 },
      { n: 'Romanian Deadlift', sets: 3, reps: '8-10', rest: 120 },
      { n: 'Leg Press', sets: 3, reps: '10-12', rest: 120 },
      { n: 'Lying Leg Curl', sets: 3, reps: '12', rest: 60 },
      { n: 'Standing Calf Raise', sets: 4, reps: '12-15', rest: 45 },
      { n: 'Hanging Leg Raise', sets: 3, reps: '10', rest: 60 }
    ] },
  { id: 'lower_gym', name: 'Lower Body', cat: 'lower', minutes: 50, level: 'all', kit: ['full_gym'], goals: ['hypertrophy', 'strength', 'general_health'],
    about: 'Pairs with Upper Body for a balanced 4-day week.',
    guidance: ['Hinge (hips back) on the deadlift, squat (knees forward) on the squat — different moves.', 'Rest 2 minutes on the first two lifts.'],
    exercises: [
      { n: 'Back Squat', sets: 3, reps: '8', rest: 150 },
      { n: 'Romanian Deadlift', sets: 3, reps: '8', rest: 120 },
      { n: 'Walking Lunge', sets: 3, reps: '10', rest: 90, note: 'Each leg.' },
      { n: 'Leg Extension', sets: 2, reps: '12', rest: 60 },
      { n: 'Seated Leg Curl', sets: 2, reps: '12', rest: 60 },
      { n: 'Standing Calf Raise', sets: 3, reps: '15', rest: 45 }
    ] },
  { id: 'glutes_focus', name: 'Glutes Focus', cat: 'lower', minutes: 45, level: 'all', kit: ['full_gym'], goals: ['hypertrophy', 'general_health'],
    about: 'Hip thrusts and friends — the glute-building staples.',
    guidance: ['On thrusts, tuck your chin and finish with a hard squeeze for one second.', 'Feel it in the glutes, not the lower back.'],
    exercises: [
      { n: 'Hip Thrust', sets: 4, reps: '8-12', rest: 120 },
      { n: 'Romanian Deadlift — DB', sets: 3, reps: '10', rest: 90 },
      { n: 'Bulgarian Split Squat', sets: 3, reps: '10', rest: 90, note: 'Each leg. Lean forward slightly for more glute.' },
      { n: 'Cable Kickback', sets: 3, reps: '15', rest: 45 },
      { n: 'Seated Hip Abduction', sets: 3, reps: '15', rest: 45 },
      { n: 'Glute Bridge', sets: 2, reps: '20', rest: 45 }
    ] },
  { id: 'dumbbell_lower', name: 'Dumbbell Lower Body', cat: 'lower', minutes: 40, level: 'all', kit: ['full_gym', 'dumbbells'], goals: ['hypertrophy', 'fat_loss', 'general_health'],
    about: 'Legs and glutes with dumbbells only.',
    guidance: ['Single-leg moves do a lot with light weight — go slow.', 'Hold onto something for balance if you need to.'],
    exercises: [
      { n: 'Goblet Squat', sets: 4, reps: '10', rest: 90 },
      { n: 'Romanian Deadlift — DB', sets: 3, reps: '10', rest: 90 },
      { n: 'Bulgarian Split Squat', sets: 3, reps: '10', rest: 90, note: 'Each leg.' },
      { n: 'Step-Ups', sets: 3, reps: '10', rest: 75, note: 'Each leg.' },
      { n: 'Calf Raise — Single Leg', sets: 3, reps: '15', rest: 45 }
    ] },
  { id: 'home_legs', name: 'Home Legs & Glutes', cat: 'lower', minutes: 30, level: 'beginner', kit: ['full_gym', 'machines_cables', 'dumbbells', 'home_minimal'], goals: ['general_health', 'fat_loss', 'hypertrophy'],
    about: 'No equipment, still a proper leg workout.',
    guidance: ['Slow the lowering to 3 seconds to make bodyweight harder.', 'Knees sore? Shorten the depth until it’s comfortable.'],
    exercises: [
      { n: 'Bodyweight Squat', sets: 4, reps: '15', rest: 60 },
      { n: 'Reverse Lunge', sets: 3, reps: '12', rest: 60, note: 'Each leg.' },
      { n: 'Glute Bridge', sets: 3, reps: '20', rest: 45 },
      { n: 'Lateral Lunge', sets: 3, reps: '10', rest: 60, note: 'Each side.' },
      { n: 'Wall Sit', sets: 3, reps: '30', time: true, rest: 45 },
      { n: 'Calf Raise — Single Leg', sets: 3, reps: '15', rest: 45 }
    ] },
  { id: 'knee_friendly_legs', name: 'Knee-Friendly Legs', cat: 'lower', minutes: 40, level: 'all', kit: ['full_gym', 'machines_cables'], goals: ['general_health', 'hypertrophy'],
    about: 'Hips do the work, knees stay comfortable. Good with a knee limitation.',
    guidance: ['Stay in a pain-free range — partial depth is fine.', 'Stop on sharp pain or a clunk.'],
    exercises: [
      { n: 'Hip Thrust', sets: 3, reps: '10-12', rest: 90 },
      { n: 'Cable Pull-Through', sets: 3, reps: '12', rest: 75 },
      { n: 'Lying Leg Curl', sets: 3, reps: '12', rest: 60 },
      { n: 'Leg Press', sets: 3, reps: '12', rest: 90, note: 'Feet high on the platform; stop above where the knee complains.' },
      { n: 'Seated Hip Abduction', sets: 2, reps: '15', rest: 45 },
      { n: 'Seated Calf Raise', sets: 3, reps: '15', rest: 45 }
    ] },

  /* ── Strength ── */
  { id: 'strength_5x5_a', name: 'Strength 5×5 — A', cat: 'strength', minutes: 50, level: 'all', kit: ['full_gym'], goals: ['strength', 'weight_gain'],
    about: 'Three big barbell lifts, five heavy sets each. Alternate with B.',
    guidance: ['Warm up each lift with lighter ramp sets.', 'Rest 3 minutes between heavy sets.', 'Finished all 25 reps cleanly? Add 2.5 kg next time.'],
    exercises: [
      { n: 'Back Squat', sets: 5, reps: '5', rest: 180 },
      { n: 'Barbell Bench Press', sets: 5, reps: '5', rest: 180 },
      { n: 'Barbell Row', sets: 5, reps: '5', rest: 150 }
    ] },
  { id: 'strength_5x5_b', name: 'Strength 5×5 — B', cat: 'strength', minutes: 45, level: 'all', kit: ['full_gym'], goals: ['strength', 'weight_gain'],
    about: 'Squat again, press overhead, one heavy deadlift set.',
    guidance: ['Deadlift is one set of five — make every rep perfect.', 'Brace before every rep: big breath into your belly, then lift.'],
    exercises: [
      { n: 'Back Squat', sets: 5, reps: '5', rest: 180 },
      { n: 'Overhead Press', sets: 5, reps: '5', rest: 180 },
      { n: 'Deadlift', sets: 1, reps: '5', rest: 180 }
    ] },

  /* ── Core ── */
  { id: 'abs_10', name: 'Abs in 10 Minutes', cat: 'core', minutes: 10, level: 'all', kit: ['full_gym', 'machines_cables', 'dumbbells', 'home_minimal'], goals: ['general_health', 'fat_loss', 'hypertrophy'],
    about: 'Quick core finisher — tack it on after any session.',
    guidance: ['Press your lower back into the floor on dead bugs and leg raises.', 'Quality over speed — slow reps work better.'],
    exercises: [
      { n: 'Dead Bug', sets: 3, reps: '10', rest: 30 },
      { n: 'Plank', sets: 3, reps: '30', time: true, rest: 30 },
      { n: 'Leg Raises', sets: 3, reps: '12', rest: 30 },
      { n: 'Side Plank', sets: 2, reps: '20', time: true, rest: 30, note: 'Each side.' },
      { n: 'Bicycle Crunch', sets: 2, reps: '20', rest: 30 }
    ] },
  { id: 'back_friendly_core', name: 'Back-Friendly Core', cat: 'core', minutes: 15, level: 'beginner', kit: ['full_gym', 'machines_cables', 'dumbbells', 'home_minimal'], goals: ['general_health'],
    about: 'Core strength that protects the lower back instead of bending it.',
    guidance: ['No crunching or twisting under load — these moves resist motion.', 'Breathe normally while you brace.'],
    exercises: [
      { n: 'Dead Bug', sets: 3, reps: '10', rest: 30 },
      { n: 'Side Plank', sets: 3, reps: '20', time: true, rest: 30, note: 'Each side.' },
      { n: 'Pallof Press', sets: 3, reps: '10', rest: 30, note: 'Each side.' },
      { n: 'Glute Bridge', sets: 3, reps: '12', rest: 30 },
      { n: 'Cat-Cow', sets: 2, reps: '10', rest: 20 }
    ] },

  /* ── Conditioning ── */
  { id: 'fat_burn_circuit', name: 'Fat-Burn Circuit', cat: 'cardio', minutes: 30, level: 'all', kit: ['full_gym', 'dumbbells'], goals: ['fat_loss', 'general_health'],
    about: 'Strength moves done as a circuit to keep your heart rate up.',
    guidance: ['Go straight from one move to the next; rest 90 seconds after each round.', 'Pick weights you can move with good form while breathing hard.'],
    exercises: [
      { n: 'Goblet Squat', sets: 3, reps: '15', rest: 15 },
      { n: 'Push-Ups', sets: 3, reps: '10', rest: 15 },
      { n: 'Dumbbell Row', sets: 3, reps: '12', rest: 15 },
      { n: 'Mountain Climbers', sets: 3, reps: '20', rest: 15 },
      { n: 'Romanian Deadlift — DB', sets: 3, reps: '12', rest: 15 },
      { n: 'Jumping Jacks', sets: 3, reps: '30', time: true, rest: 90 }
    ] },
  { id: 'bodyweight_hiit', name: 'Bodyweight HIIT 15', cat: 'cardio', minutes: 15, level: 'intermediate', kit: ['full_gym', 'machines_cables', 'dumbbells', 'home_minimal'], goals: ['fat_loss'],
    about: 'Short, hard intervals. No equipment.',
    guidance: ['Work hard for the set, then walk around for the rest.', 'Joints complaining? Swap burpees for squats via Easier.'],
    exercises: [
      { n: 'Jumping Jacks', sets: 4, reps: '30', time: true, rest: 20 },
      { n: 'Bodyweight Squat', sets: 4, reps: '15', rest: 20 },
      { n: 'Mountain Climbers', sets: 4, reps: '20', rest: 20 },
      { n: 'Push-Ups', sets: 4, reps: '8', rest: 20 },
      { n: 'Burpees', sets: 4, reps: '6', rest: 60 }
    ] },
  { id: 'low_impact_cardio', name: 'Low-Impact Cardio', cat: 'cardio', minutes: 30, level: 'beginner', kit: ['full_gym', 'machines_cables'], goals: ['fat_loss', 'general_health'],
    about: 'Easy on knees and back. Steady effort you could hold a conversation at.',
    guidance: ['You should be able to talk in short sentences the whole time.', 'Incline walking beats running for most beginners.'],
    exercises: [
      { n: 'Treadmill Incline Walk', sets: 1, reps: '20', time: true, unit: 'min', rest: 60 },
      { n: 'Stationary Bike', sets: 1, reps: '10', time: true, unit: 'min', rest: 0 }
    ] },
  { id: 'zone2_30', name: 'Zone 2 — 30 Minutes', cat: 'cardio', minutes: 30, level: 'all', kit: ['full_gym', 'machines_cables'], goals: ['general_health', 'fat_loss'],
    about: 'Steady easy cardio — builds the engine, helps recovery.',
    guidance: ['Nose-breathing pace. If you can’t talk, slow down.', '2–3 of these a week alongside lifting.'],
    exercises: [
      { n: 'Stationary Bike', sets: 1, reps: '30', time: true, unit: 'min', rest: 0 }
    ] },

  /* ── Mobility / recovery ── */
  { id: 'mobility_10', name: '10-Minute Mobility Reset', cat: 'mobility', minutes: 10, level: 'all', kit: ['full_gym', 'machines_cables', 'dumbbells', 'home_minimal'], goals: ['general_health'],
    about: 'Loosens hips, back and shoulders. Before a session or on a rest day.',
    guidance: ['Move slowly into each position — no bouncing.', 'Stop short of pain.'],
    exercises: [
      { n: 'Cat-Cow', sets: 2, reps: '8', rest: 0 },
      { n: "World's Greatest Stretch", sets: 2, reps: '5', rest: 0, note: 'Each side.' },
      { n: 'Hip 90/90 Switch', sets: 2, reps: '8', rest: 0 },
      { n: 'Thoracic Rotation', sets: 2, reps: '8', rest: 0, note: 'Each side.' },
      { n: 'Hip Flexor Stretch', sets: 2, reps: '30', time: true, rest: 0, note: 'Each side.' },
      { n: 'Arm Circles', sets: 2, reps: '10', rest: 0 }
    ] },
  { id: 'desk_worker_fix', name: 'Desk Worker Fix', cat: 'mobility', minutes: 12, level: 'all', kit: ['full_gym', 'machines_cables', 'dumbbells', 'home_minimal'], goals: ['general_health'],
    about: 'Undo a day of sitting: open the hips, wake up the upper back.',
    guidance: ['Do it any time you’ve been sitting for hours.', 'Pull-aparts work without a band too — just squeeze the shoulder blades.'],
    exercises: [
      { n: 'Thoracic Rotation', sets: 2, reps: '10', rest: 0, note: 'Each side.' },
      { n: 'Hip Flexor Stretch', sets: 2, reps: '30', time: true, rest: 0, note: 'Each side.' },
      { n: 'Band Pull-Aparts', sets: 3, reps: '15', rest: 30 },
      { n: 'Glute Bridge', sets: 2, reps: '15', rest: 30 },
      { n: 'Cat-Cow', sets: 2, reps: '10', rest: 0 },
      { n: 'Shoulder Rolls', sets: 2, reps: '10', rest: 0 }
    ] },
  { id: 'senior_strength_balance', name: 'Strength & Balance (60+)', cat: 'full', minutes: 35, level: 'beginner', kit: ['full_gym', 'machines_cables', 'dumbbells', 'home_minimal'], goals: ['general_health'],
    about: 'Leg strength, grip and balance — the things that keep you independent.',
    guidance: ['Squat to a chair and stand back up — touch, don’t flop.', 'Keep a wall or rail within reach for balance moves.', 'Check with your doctor if you have heart, blood-pressure or joint conditions.'],
    exercises: [
      { n: 'Bodyweight Squat', sets: 3, reps: '10', rest: 75, note: 'Sit to a chair, stand back up.' },
      { n: 'Wall Push-Up', sets: 3, reps: '10', rest: 60 },
      { n: 'Resistance Band Row', sets: 3, reps: '12', rest: 60 },
      { n: 'Step-Up', sets: 2, reps: '8', rest: 60, note: 'Each leg. Low step, hold a rail.' },
      { n: "Farmer's Walk", sets: 3, reps: '30', time: true, rest: 60 },
      { n: 'Dead Bug', sets: 2, reps: '8', rest: 45 }
    ] }
];

window.WorkoutLibrary = {
  CATS: [
    { id: 'all', label: 'All' }, { id: 'full', label: 'Full body' }, { id: 'upper', label: 'Upper' },
    { id: 'lower', label: 'Lower' }, { id: 'strength', label: 'Strength' }, { id: 'core', label: 'Core' },
    { id: 'cardio', label: 'Cardio' }, { id: 'mobility', label: 'Mobility' }
  ],
  all: function() { return window.WORKOUT_LIBRARY || []; },
  byId: function(id) { return this.all().find(function(w) { return w.id === id; }) || null; },
  parseReps: function(r) { const m = String(r || '').match(/\d+/); return m ? parseInt(m[0], 10) : 10; },
  _fits: function(n) {
    if (typeof Equipment === 'undefined' || !Equipment.canPerform) return true;
    return Equipment.canPerform(n) && (!Equipment.jointOk || Equipment.jointOk(n));
  },
  /* Map each written exercise to what THIS user can do: as written, an
     easier variation, then the ranked substitute — else dropped. */
  resolve: function(w) {
    const self = this;
    const out = [];
    (w.exercises || []).forEach(function(item) {
      let name = item.n, swapped = false;
      if (!self._fits(name)) {
        const row = (typeof ExDB !== 'undefined' && ExDB.byName) ? ExDB.byName(name) : null;
        let alt = row ? (row.regressions || []).find(function(r) { return self._fits(r); }) : null;
        if (!alt && typeof SplitEngine !== 'undefined' && SplitEngine.rankSubstitutes) {
          const r = SplitEngine.rankSubstitutes(name, '').find(function(s) { return self._fits(s.name); });
          alt = r && r.name;
        }
        if (!alt) return;
        name = alt; swapped = true;
      }
      if (out.some(function(o) { return o.name === name; })) return;
      out.push({ name: name, original: item.n, swapped: swapped, item: item });
    });
    return out;
  },
  fitsAsWritten: function(w, user) {
    user = user || (typeof S !== 'undefined' && S.g('user')) || {};
    return (w.kit || []).indexOf(user.equipmentKit || 'full_gym') >= 0;
  }
};
