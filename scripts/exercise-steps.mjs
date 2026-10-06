/* Hand-written "How to" steps for the lifts people do most. Plain language,
   one action per step. Everything else gets steps generated from the
   exercise's setup / cues / breathing in build-regressions.mjs. */
export const CURATED_STEPS = {
  // ── Chest ──
  'Barbell Bench Press': [
    'Lie on the bench with your eyes under the bar and feet flat on the floor.',
    'Grip a little wider than shoulder-width. Squeeze your shoulder blades together and down.',
    'Unrack and hold the bar over your shoulders with straight arms.',
    'Lower it to your mid-chest, elbows about 45° from your body.',
    'Touch lightly — no bounce — then press up and slightly back over your shoulders.',
    'Keep your hips on the bench and feet planted the whole set.'
  ],
  'Dumbbell Bench Press': [
    'Sit on the bench with the dumbbells on your thighs, then lie back and kick them up.',
    'Start with the dumbbells over your chest, palms facing your feet.',
    'Lower them to the sides of your chest until you feel a stretch.',
    'Press up until your arms are straight; the dumbbells move slightly together.',
    'Keep your shoulder blades pinched and feet on the floor.'
  ],
  'Incline Dumbbell Press': [
    'Set the bench to 30–45°.',
    'Sit back with the dumbbells at shoulder height, elbows slightly in.',
    'Press up over your upper chest until your arms are straight.',
    'Lower slowly until you feel a stretch across the top of your chest.',
    'Pause a moment at the bottom, then press again.'
  ],
  'Machine Chest Press': [
    'Adjust the seat so the handles line up with the middle of your chest.',
    'Sit tall with your back on the pad and feet flat.',
    'Press the handles forward until your arms are almost straight.',
    'Return slowly until you feel a stretch in your chest — don’t let the stack slam.'
  ],
  'Push-Ups': [
    'Hands just wider than your shoulders, body in a straight line from head to heels.',
    'Squeeze your glutes and brace your stomach so your hips don’t sag.',
    'Lower your chest toward the floor with elbows about 45° from your body.',
    'Push the floor away until your arms are straight.',
    'Too hard? Put your hands on a bench or wall. Too easy? Slow the way down to 3 seconds.'
  ],
  'Wall Push-Up': [
    'Stand an arm’s length from a wall and place your hands on it at chest height.',
    'Keep your body straight and step your feet back a little.',
    'Bend your elbows to bring your chest toward the wall.',
    'Push back to the start. Step further back to make it harder.'
  ],
  'Chest Dip': [
    'Grip the parallel bars and lift yourself to straight arms.',
    'Lean your chest forward slightly and bend your knees.',
    'Lower until your upper arms are about parallel to the floor — stop earlier if shoulders complain.',
    'Push back up to straight arms.'
  ],
  'Cable Fly': [
    'Set both pulleys to chest height and grab a handle in each hand.',
    'Step forward into a split stance with a slight lean.',
    'With a soft bend in your elbows, bring your hands together in front of your chest in a hugging arc.',
    'Squeeze for a moment, then open slowly until you feel the stretch.'
  ],
  'Dumbbell Fly': [
    'Lie on a flat bench with dumbbells over your chest, palms facing each other.',
    'Keep a soft bend in your elbows and open your arms wide in an arc.',
    'Stop when you feel a good stretch across your chest — not deeper.',
    'Bring the dumbbells back up along the same arc, like hugging a tree.'
  ],
  // ── Shoulders ──
  'Overhead Press': [
    'Stand with feet hip-width; hold the bar on your upper chest, hands just outside your shoulders.',
    'Brace your stomach and squeeze your glutes.',
    'Press the bar straight up, moving your head back slightly to clear it.',
    'Lock out overhead with the bar over the middle of your feet, then lower to your chest.'
  ],
  'Dumbbell Shoulder Press': [
    'Sit or stand with the dumbbells at shoulder height, palms forward.',
    'Brace your stomach so your lower back doesn’t arch.',
    'Press up until your arms are straight, dumbbells close but not clanking.',
    'Lower back to shoulder height with control.'
  ],
  'Machine Shoulder Press': [
    'Set the seat so the handles start at shoulder height.',
    'Sit tall with your back on the pad.',
    'Press up until your arms are almost straight.',
    'Lower slowly back to shoulder height.'
  ],
  'Dumbbell Lateral Raise': [
    'Stand tall with light dumbbells at your sides, a slight bend in your elbows.',
    'Raise your arms out to the sides, leading with your elbows.',
    'Stop at shoulder height — pinkies roughly level with thumbs.',
    'Lower slowly. No swinging; go lighter if you have to lean.'
  ],
  'Cable Lateral Raise': [
    'Set the pulley low. Stand side-on and hold the handle in your far hand.',
    'With a soft elbow, raise your arm out to the side up to shoulder height.',
    'Pause, then lower slowly against the cable.'
  ],
  'Rear Delt Fly': [
    'Hinge forward at the hips with a flat back, dumbbells hanging under your chest.',
    'With a slight elbow bend, raise your arms out to the sides.',
    'Squeeze between your shoulder blades at the top.',
    'Lower slowly. Keep it light — this is a small muscle.'
  ],
  'Face Pulls': [
    'Set a rope on the cable at face height.',
    'Hold the rope ends with thumbs pointing back, and step back so the cable is tight.',
    'Pull the rope toward your face, splitting the ends apart beside your ears.',
    'Finish with elbows high and knuckles pointing back, then return slowly.'
  ],
  // ── Back / hinge ──
  'Deadlift': [
    'Stand with the bar over the middle of your feet, feet hip-width.',
    'Hinge down and grip the bar just outside your legs.',
    'Shins to the bar, chest up, back flat. Take a big breath and brace.',
    'Push the floor away and stand up, keeping the bar against your legs.',
    'Lock out by squeezing your glutes — don’t lean back.',
    'Lower by pushing your hips back first, then bending your knees.'
  ],
  'Romanian Deadlift': [
    'Stand tall holding the bar at your thighs, knees slightly bent.',
    'Push your hips back and slide the bar down your thighs with a flat back.',
    'Stop when you feel a strong hamstring stretch — usually just below the knees.',
    'Drive your hips forward to stand back up and squeeze your glutes.'
  ],
  'Romanian Deadlift — DB': [
    'Hold dumbbells in front of your thighs, knees slightly bent.',
    'Push your hips back and let the dumbbells slide down the front of your legs.',
    'Keep your back flat; stop when your hamstrings are fully stretched.',
    'Drive your hips forward to stand and squeeze your glutes.'
  ],
  'Trap Bar Deadlift': [
    'Step into the middle of the hex bar, feet hip-width.',
    'Sit down and grip the handles at your sides, chest up.',
    'Brace, then push through the floor to stand up tall.',
    'Lower with control by sitting back down.'
  ],
  'Hip Thrust': [
    'Sit with your upper back against a bench and the bar over your hips (use a pad).',
    'Feet flat, about hip-width, knees bent.',
    'Tuck your chin and drive through your heels to lift your hips until your body is flat.',
    'Squeeze your glutes hard for a second, then lower with control.'
  ],
  'Glute Bridge': [
    'Lie on your back, knees bent, feet flat and hip-width.',
    'Press through your heels and lift your hips until your body is straight from knees to shoulders.',
    'Squeeze your glutes at the top for a second.',
    'Lower slowly. Feel it in your glutes, not your lower back.'
  ],
  'Barbell Row': [
    'Hold the bar with an overhand grip, hinge forward to about 45°, back flat.',
    'Let the bar hang under your shoulders with straight arms.',
    'Pull it to your lower chest by driving your elbows back.',
    'Squeeze your shoulder blades together, then lower with control.'
  ],
  'Dumbbell Row': [
    'Put one hand and the same-side knee on a bench, back flat.',
    'Hold the dumbbell with your other arm hanging straight down.',
    'Pull the dumbbell toward your hip, elbow close to your body.',
    'Lower slowly until your arm is straight. Do all reps, then switch sides.'
  ],
  'Seated Cable Row': [
    'Sit with your feet on the platform and knees slightly bent.',
    'Hold the handle with straight arms and sit tall.',
    'Pull the handle to your stomach, squeezing your shoulder blades together.',
    'Let your arms stretch forward slowly without rounding your back.'
  ],
  'Chest-Supported Row': [
    'Set an incline bench and lie face-down on it with dumbbells hanging.',
    'Pull both dumbbells toward your hips.',
    'Squeeze your shoulder blades at the top.',
    'Lower with control. The bench takes your lower back out of it.'
  ],
  'Lat Pulldown': [
    'Sit with your thighs under the pad and grab the bar a little wider than shoulders.',
    'Lean back slightly and lift your chest.',
    'Pull the bar to your upper chest by driving your elbows down.',
    'Let it rise slowly until your arms are straight.'
  ],
  'Machine Lat Pulldown': [
    'Adjust the thigh pad so you stay seated.',
    'Grab the handles, sit tall, chest up.',
    'Pull down until your hands reach your upper chest.',
    'Return slowly to a full stretch.'
  ],
  'Pull-Ups': [
    'Hang from the bar with hands just wider than your shoulders, palms facing away.',
    'Pull your shoulders down and back first.',
    'Pull up by driving your elbows toward the floor until your chin clears the bar.',
    'Lower all the way to straight arms.',
    'Can’t do one yet? Use the lat pulldown or jump up and lower slowly.'
  ],
  'Chin-Ups': [
    'Hang from the bar with palms facing you, shoulder-width.',
    'Pull your chest toward the bar by driving your elbows down.',
    'Chin over the bar, then lower slowly to straight arms.'
  ],
  'Inverted Row': [
    'Set a bar at waist height and lie under it.',
    'Grip it, body straight from heels to head.',
    'Pull your chest to the bar.',
    'Lower slowly. Bend your knees to make it easier.'
  ],
  // ── Legs ──
  'Back Squat': [
    'Set the bar on your upper back (not your neck); hands just outside your shoulders.',
    'Stand with feet about shoulder-width, toes turned out slightly.',
    'Big breath, brace, then sit down and back between your heels.',
    'Knees follow your toes. Go as deep as you can with a flat back.',
    'Drive up through your whole foot to stand tall.'
  ],
  'Goblet Squat': [
    'Hold one dumbbell or kettlebell vertically against your chest.',
    'Feet shoulder-width, toes turned out slightly.',
    'Sit down between your heels, elbows inside your knees.',
    'Keep your chest up, then stand back up through your whole foot.'
  ],
  'Bodyweight Squat': [
    'Stand with feet shoulder-width, arms out in front for balance.',
    'Sit back and down as if onto a chair.',
    'Go as low as feels comfortable with your heels down.',
    'Stand back up and squeeze your glutes. Use a chair behind you to guide depth.'
  ],
  'Leg Press': [
    'Sit with your back flat on the pad and feet shoulder-width on the platform.',
    'Release the safeties and lower the platform until your knees are about 90°.',
    'Press back up without locking your knees.',
    'Keep your lower back on the pad the whole time.'
  ],
  'Bulgarian Split Squat': [
    'Stand a big step in front of a bench and put the top of your back foot on it.',
    'Lower straight down until your back knee nearly touches the floor.',
    'Keep most of your weight on the front foot.',
    'Push through the front heel to stand. Do all reps, then switch legs.'
  ],
  'Reverse Lunge': [
    'Stand tall, feet together.',
    'Step one foot back and lower until both knees are about 90°.',
    'Push through your front foot to return to standing.',
    'Alternate legs or finish one side first.'
  ],
  'Walking Lunge': [
    'Hold dumbbells at your sides and stand tall.',
    'Step forward and lower until your back knee nearly touches the floor.',
    'Push off the front foot and step straight into the next lunge.',
    'Keep your torso upright and steps long enough that the front knee stays over the foot.'
  ],
  'Step-Ups': [
    'Stand facing a sturdy box or bench, dumbbells at your sides.',
    'Put one whole foot on the box.',
    'Push through that heel to stand up on the box — don’t push off the back foot.',
    'Step down slowly. Do all reps on one leg, then switch.'
  ],
  'Step-Up': [
    'Stand facing a low step, holding a rail if you need one.',
    'Place one whole foot on the step.',
    'Push through that heel to stand up tall.',
    'Step down slowly with the same leg. Switch sides.'
  ],
  'Leg Extension': [
    'Adjust the seat so your knees line up with the machine’s pivot.',
    'Pad on the front of your ankles.',
    'Straighten your legs, pause at the top.',
    'Lower slowly.'
  ],
  'Lying Leg Curl': [
    'Lie face-down with the pad just above your heels.',
    'Curl your heels toward your glutes.',
    'Squeeze, then lower slowly. Keep your hips on the pad.'
  ],
  'Seated Leg Curl': [
    'Sit with the pad behind your ankles and the thigh pad snug.',
    'Curl your heels down and back under the seat.',
    'Pause, then let your legs return slowly.'
  ],
  'Standing Calf Raise': [
    'Stand with the balls of your feet on the edge of a step or platform.',
    'Lower your heels for a deep stretch.',
    'Rise up as high as you can onto your toes.',
    'Pause at the top, then lower slowly.'
  ],
  // ── Arms ──
  'Dumbbell Curl': [
    'Stand with dumbbells at your sides, palms forward.',
    'Keep your elbows by your ribs and curl the weights up.',
    'Squeeze at the top, then lower all the way down slowly.',
    'No swinging — go lighter if your body moves.'
  ],
  'Hammer Curl': [
    'Hold dumbbells at your sides with palms facing each other.',
    'Curl them up without turning your wrists.',
    'Lower slowly to straight arms.'
  ],
  'Barbell Curl': [
    'Hold the bar with palms forward, hands shoulder-width.',
    'Elbows at your sides, curl the bar up to your shoulders.',
    'Lower slowly to straight arms without leaning back.'
  ],
  'EZ Bar Curl': [
    'Hold the EZ bar on the angled grips, palms up.',
    'Curl the bar up keeping elbows by your sides.',
    'Lower slowly to full stretch.'
  ],
  'Tricep Pushdown': [
    'Attach a bar or rope high on the cable. Stand close, elbows tucked at your sides.',
    'Push the handle down until your arms are straight.',
    'Squeeze, then let it rise slowly to about chest height. Elbows don’t move.'
  ],
  'Overhead Tricep Extension': [
    'Hold one dumbbell with both hands overhead.',
    'Keep your elbows pointing forward and lower the weight behind your head.',
    'Straighten your arms back overhead.'
  ],
  'Skull Crushers': [
    'Lie on a bench holding an EZ bar over your chest with straight arms.',
    'Bend only at the elbows to lower the bar toward your forehead.',
    'Straighten your arms back up. Elbows point at the ceiling throughout.'
  ],
  'Tricep Kickback': [
    'Hinge forward with a flat back, upper arm tucked by your side.',
    'Straighten your arm behind you.',
    'Pause, then lower slowly. Upper arm stays still.'
  ],
  'Bench Dip': [
    'Sit on the edge of a bench, hands beside your hips.',
    'Slide off the bench and bend your elbows to lower your body.',
    'Push back up to straight arms. Bend your knees to make it easier.'
  ],
  // ── Core ──
  'Plank': [
    'Forearms on the floor, elbows under your shoulders.',
    'Lift your body so it’s straight from head to heels.',
    'Squeeze your glutes and pull your belly button in.',
    'Breathe normally and hold. Drop to your knees if your lower back sags.'
  ],
  'Side Plank': [
    'Lie on your side, elbow under your shoulder, legs stacked.',
    'Lift your hips so your body is straight.',
    'Hold, breathing normally. Bend your bottom knee to make it easier.'
  ],
  'Dead Bug': [
    'Lie on your back, arms up, knees bent at 90° over your hips.',
    'Press your lower back into the floor.',
    'Slowly lower the opposite arm and leg toward the floor.',
    'Return and switch sides. Keep your back flat the whole time.'
  ],
  'Leg Raises': [
    'Lie on your back with your hands under your hips.',
    'Keep your legs straight (or knees bent to make it easier).',
    'Lift your legs to vertical, then lower slowly without your back arching.'
  ],
  'Hanging Leg Raise': [
    'Hang from a bar with straight arms.',
    'Without swinging, lift your knees (easier) or straight legs toward your chest.',
    'Lower slowly. Pause at the bottom to kill any swing.'
  ],
  'Pallof Press': [
    'Stand side-on to a cable or band at chest height, hands at your chest.',
    'Press your hands straight out in front.',
    'Hold for a second without letting it twist you, then bring them back. Switch sides.'
  ],
  'Cable Crunch': [
    'Kneel facing the cable with a rope held beside your head.',
    'Crunch down by curling your ribs toward your hips.',
    'Return slowly. Your hips stay still — the abs do the work.'
  ],
  'Mountain Climbers': [
    'Start in a push-up position.',
    'Drive one knee toward your chest, then switch legs quickly.',
    'Keep your hips low and your back flat.'
  ],
  'Burpees': [
    'Stand, then squat down and place your hands on the floor.',
    'Jump or step your feet back to a push-up position.',
    'Jump or step your feet back in.',
    'Stand up and jump (or just stand up to make it easier).'
  ],
  // ── Cardio ──
  'Treadmill Incline Walk': [
    'Start at a flat, easy pace for 2–3 minutes to warm up.',
    'Raise the incline to 5–12% at a pace you could still talk at.',
    'Don’t hold the handrails — let your arms swing.',
    'Lower the incline for the last few minutes to cool down.'
  ],
  'Stationary Bike': [
    'Set the seat so your knee is slightly bent at the bottom of the pedal stroke.',
    'Warm up for 3 minutes at easy resistance.',
    'Ride at a steady effort you could hold a conversation at.',
    'Ease off for the last 2–3 minutes.'
  ],
  'Rowing Machine': [
    'Strap your feet in and grip the handle.',
    'Drive with your legs first, then lean back slightly, then pull with your arms.',
    'Return in reverse: arms, body, then legs.',
    'Smooth and steady beats fast and jerky.'
  ]
};
