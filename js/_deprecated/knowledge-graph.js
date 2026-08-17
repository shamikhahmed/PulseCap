'use strict';
/* ── PulseCap — Exercise Knowledge Graph (EKG) ── */

const EKG = {
  _db: {
    // ── PUSH — CHEST ───────────────────────────────────────────────────────
    'Barbell Bench Press': {
      muscles: { primary: ['pec_major_sternal','pec_major_clavicular'], secondary: ['anterior_deltoid','triceps_brachii'], stabilizers: ['rotator_cuff','serratus_anterior'] },
      pattern: 'push', equipment: ['barbell','bench'], fatigueScore: 8, recoveryHrs: 72, difficulty: 3,
      injuries: ['shoulder_impingement','pec_major_tear','anterior_shoulder_pain'],
      progressions: ['Board Press','Spoto Press','Close Grip Bench'],
      regressions: ['Dumbbell Bench Press','Machine Chest Press','Push-Ups','Landmine Press'],
      alternatives: ['Dumbbell Bench Press','Smith Machine Bench Press','Cable Chest Press'],
      warmups: ['Band pull-aparts x20','Shoulder rotation x10 each','Light DB flies x15','Empty bar x10'],
      cooldowns: ['Doorway chest stretch 30s','Shoulder cross-body stretch 30s','Chest foam roll'],
      ageRecommended: 'all',
      movementCues: ['Retract and depress scapula','Drive feet into floor','Bar to lower chest','Elbows 45-75 degrees from torso']
    },
    'Incline Bench Press': {
      muscles: { primary: ['pec_major_clavicular'], secondary: ['anterior_deltoid','triceps_brachii'], stabilizers: ['rotator_cuff','serratus_anterior'] },
      pattern: 'push', equipment: ['barbell','incline bench'], fatigueScore: 7, recoveryHrs: 72, difficulty: 3,
      injuries: ['shoulder_impingement','anterior_shoulder_pain'],
      progressions: ['Incline Close Grip Press','Incline Pin Press'],
      regressions: ['Incline Dumbbell Press','Cable Incline Fly','Push-Ups (feet elevated)'],
      alternatives: ['Incline Dumbbell Press','Cable Incline Press','Hammer Strength Incline'],
      warmups: ['Band pull-aparts x20','Shoulder circles x10','Light incline DB x15'],
      cooldowns: ['Doorway chest stretch (high position)','Shoulder flexion stretch'],
      ageRecommended: 'all',
      movementCues: ['30-45 degree incline only','Elbows slightly tucked','Full ROM — touch upper chest']
    },
    'Dumbbell Bench Press': {
      muscles: { primary: ['pec_major_sternal','pec_major_clavicular'], secondary: ['anterior_deltoid','triceps_brachii'], stabilizers: ['rotator_cuff','serratus_anterior','biceps_brachii'] },
      pattern: 'push', equipment: ['dumbbells','bench'], fatigueScore: 7, recoveryHrs: 72, difficulty: 2,
      injuries: ['anterior_shoulder_pain','wrist_strain'],
      progressions: ['Barbell Bench Press','Dumbbell Bench Press (paused)','Dumbbell Squeeze Press'],
      regressions: ['Machine Chest Press','Cable Chest Press','Push-Ups'],
      alternatives: ['Barbell Bench Press','Cable Chest Press','Machine Chest Press'],
      warmups: ['Arm circles x10','Band pull-aparts x20','Light fly x12'],
      cooldowns: ['Doorway chest stretch','Tricep overhead stretch'],
      ageRecommended: 'all',
      movementCues: ['Neutral to pronated grip arc','Full ROM at bottom','Squeeze at top']
    },
    'Push-Ups': {
      muscles: { primary: ['pec_major_sternal'], secondary: ['anterior_deltoid','triceps_brachii'], stabilizers: ['serratus_anterior','core','rotator_cuff'] },
      pattern: 'push', equipment: [], fatigueScore: 4, recoveryHrs: 48, difficulty: 1,
      injuries: ['wrist_pain'],
      progressions: ['Weighted Push-Ups','Archer Push-Ups','Diamond Push-Ups','Decline Push-Ups'],
      regressions: ['Knee Push-Ups','Wall Push-Ups','Incline Push-Ups'],
      alternatives: ['Machine Chest Press','Cable Chest Press'],
      warmups: ['Wrist circles x10','Shoulder warmup','Scapular push-ups x10'],
      cooldowns: ['Doorway chest stretch','Wrist flexor stretch'],
      ageRecommended: 'all',
      movementCues: ['Straight body plank position','Elbows 45 degrees','Full lockout at top']
    },
    'Cable Fly': {
      muscles: { primary: ['pec_major_sternal','pec_major_clavicular'], secondary: ['anterior_deltoid'], stabilizers: ['biceps_brachii','rotator_cuff'] },
      pattern: 'push', equipment: ['cable machine'], fatigueScore: 5, recoveryHrs: 48, difficulty: 2,
      injuries: ['anterior_shoulder_pain','bicep_tendon_strain'],
      progressions: ['Single-Arm Cable Fly','Cable Fly with Pause'],
      regressions: ['Pec Deck','Dumbbell Fly'],
      alternatives: ['Dumbbell Fly','Pec Deck','Resistance Band Fly'],
      warmups: ['Arm circles','Light cable press x12'],
      cooldowns: ['Doorway chest stretch','Pec minor stretch'],
      ageRecommended: 'all',
      movementCues: ['Slight bend in elbows throughout','Squeeze at peak contraction','Control the negative']
    },
    'Dips': {
      muscles: { primary: ['pec_major_sternal','triceps_brachii'], secondary: ['anterior_deltoid'], stabilizers: ['rotator_cuff','serratus_anterior'] },
      pattern: 'push', equipment: ['dip bars'], fatigueScore: 7, recoveryHrs: 72, difficulty: 3,
      injuries: ['shoulder_impingement','pec_major_tear','anterior_shoulder_pain'],
      progressions: ['Weighted Dips','Ring Dips'],
      regressions: ['Assisted Dips','Bench Dips','Close Grip Push-Ups'],
      alternatives: ['Close Grip Bench Press','Machine Dip'],
      warmups: ['Shoulder circles','Band pull-aparts x20','Scapular depression x10'],
      cooldowns: ['Doorway chest stretch','Tricep stretch'],
      ageRecommended: 'all',
      movementCues: ['Lean forward for chest emphasis','Lower until shoulders below elbows','Keep elbows from flaring too wide']
    },

    // ── PUSH — SHOULDERS ───────────────────────────────────────────────────
    'Overhead Press': {
      muscles: { primary: ['medial_deltoid','anterior_deltoid'], secondary: ['triceps_brachii','upper_trapezius'], stabilizers: ['rotator_cuff','serratus_anterior','core'] },
      pattern: 'push', equipment: ['barbell'], fatigueScore: 8, recoveryHrs: 72, difficulty: 4,
      injuries: ['shoulder_impingement','rotator_cuff_strain','anterior_shoulder_pain'],
      progressions: ['Push Press','Strict Press (from below chin)','Z-Press'],
      regressions: ['Dumbbell Shoulder Press','Arnold Press','Landmine Press'],
      alternatives: ['Dumbbell Shoulder Press','Smith Machine Press','Machine Shoulder Press'],
      warmups: ['Band pull-aparts x20','Wall slides x10','Light lateral raise x12','Overhead reach'],
      cooldowns: ['Overhead tricep stretch','Cross-body shoulder stretch','Wall shoulder stretch'],
      ageRecommended: 'all',
      movementCues: ['Bar path straight up, head moves back briefly','Full lockout overhead','Core braced, no lumbar hyperextension']
    },
    'Dumbbell Shoulder Press': {
      muscles: { primary: ['medial_deltoid','anterior_deltoid'], secondary: ['triceps_brachii','upper_trapezius'], stabilizers: ['rotator_cuff','serratus_anterior'] },
      pattern: 'push', equipment: ['dumbbells'], fatigueScore: 7, recoveryHrs: 72, difficulty: 3,
      injuries: ['shoulder_impingement','rotator_cuff_strain'],
      progressions: ['Overhead Press','Arnold Press','Single-Arm Dumbbell Press'],
      regressions: ['Seated Dumbbell Press (supported)','Machine Shoulder Press','Landmine Press'],
      alternatives: ['Overhead Press','Machine Shoulder Press','Cable Shoulder Press'],
      warmups: ['Arm circles x10','Band pull-aparts x20','Light lateral raise x12'],
      cooldowns: ['Cross-body shoulder stretch','Overhead tricep stretch'],
      ageRecommended: 'all',
      movementCues: ['Start at ear height','Neutral or pronated grip','Full overhead lockout']
    },
    'Lateral Raise': {
      muscles: { primary: ['medial_deltoid'], secondary: ['supraspinatus','upper_trapezius'], stabilizers: ['rotator_cuff'] },
      pattern: 'isolation', equipment: ['dumbbells'], fatigueScore: 4, recoveryHrs: 48, difficulty: 2,
      injuries: ['shoulder_impingement','supraspinatus_tendinopathy'],
      progressions: ['Cable Lateral Raise','Leaning Lateral Raise','Lateral Raise with Pause'],
      regressions: ['Band Lateral Raise','Machine Lateral Raise'],
      alternatives: ['Cable Lateral Raise','Machine Lateral Raise','Band Lateral Raise'],
      warmups: ['Arm circles','Band pull-aparts','Very light lateral raise x15'],
      cooldowns: ['Cross-body shoulder stretch','Overhead shoulder stretch'],
      ageRecommended: 'all',
      movementCues: ['Slight forward lean','Pinky slightly higher than thumb at top','Stop at shoulder height','Slight bend in elbow']
    },
    'Face Pulls': {
      muscles: { primary: ['posterior_deltoid','middle_trapezius','rhomboid_major'], secondary: ['rotator_cuff','medial_deltoid'], stabilizers: ['serratus_anterior'] },
      pattern: 'pull', equipment: ['cable machine'], fatigueScore: 4, recoveryHrs: 48, difficulty: 2,
      injuries: [],
      progressions: ['Band Face Pull with External Rotation','TRX Face Pull'],
      regressions: ['Band Pull-Apart','Prone Y-Raise'],
      alternatives: ['Band Pull-Apart','Rear Delt Fly','Prone Y-Raise'],
      warmups: ['Arm circles','Light face pull x15 (warmup)'],
      cooldowns: ['Cross-body stretch','Posterior shoulder stretch'],
      ageRecommended: 'all',
      movementCues: ['Pull to forehead, not chin','External rotation at end range','Elbows high and wide','Squeeze rear delts']
    },

    // ── PULL — BACK ────────────────────────────────────────────────────────
    'Pull-Ups': {
      muscles: { primary: ['latissimus_dorsi'], secondary: ['biceps_brachii','middle_trapezius','rhomboid_major'], stabilizers: ['rotator_cuff','serratus_anterior','core'] },
      pattern: 'pull', equipment: ['pull-up bar'], fatigueScore: 8, recoveryHrs: 72, difficulty: 4,
      injuries: ['shoulder_impingement','bicep_tendon_strain','elbow_pain'],
      progressions: ['Weighted Pull-Ups','L-Sit Pull-Ups','One-Arm Assisted Pull-Up'],
      regressions: ['Assisted Pull-Ups','Lat Pulldown','Ring Row','Negative Pull-Ups'],
      alternatives: ['Lat Pulldown','Assisted Pull-Up Machine','Cable Pulldown'],
      warmups: ['Dead hang 20s','Scapular pulls x10','Band pull-aparts x20','Active shoulder rotation'],
      cooldowns: ['Lat stretch — hanging','Child\'s pose','Doorway lat stretch'],
      ageRecommended: 'all',
      movementCues: ['Initiate with scapular depression','Drive elbows toward hips','Chin over bar','Full dead hang at bottom']
    },
    'Lat Pulldown': {
      muscles: { primary: ['latissimus_dorsi'], secondary: ['biceps_brachii','middle_trapezius','rhomboid_major'], stabilizers: ['rotator_cuff'] },
      pattern: 'pull', equipment: ['cable machine'], fatigueScore: 6, recoveryHrs: 72, difficulty: 2,
      injuries: ['shoulder_impingement','bicep_tendon_strain'],
      progressions: ['Pull-Ups','Weighted Pull-Ups','Close Grip Pulldown'],
      regressions: ['Assisted Pull-Ups','Band Pulldown','Straight-Arm Pulldown'],
      alternatives: ['Pull-Ups','Assisted Pull-Up Machine','Cable Pulldown'],
      warmups: ['Active shoulder rotation','Band pull-aparts x20','Light pulldown x15'],
      cooldowns: ['Doorway lat stretch','Child\'s pose','Overhead lat stretch'],
      ageRecommended: 'all',
      movementCues: ['Lean back slightly','Initiate with shoulder depression','Pull to upper chest','Fully extend arms at top']
    },
    'Barbell Row': {
      muscles: { primary: ['latissimus_dorsi','middle_trapezius','rhomboid_major'], secondary: ['biceps_brachii','posterior_deltoid'], stabilizers: ['erector_spinae','core'] },
      pattern: 'pull', equipment: ['barbell'], fatigueScore: 8, recoveryHrs: 72, difficulty: 4,
      injuries: ['lower_back_strain','bicep_tendon_strain'],
      progressions: ['Pendlay Row','Dead Row','Yates Row'],
      regressions: ['Dumbbell Row','Seated Cable Row','Machine Row'],
      alternatives: ['Dumbbell Row','Cable Row','T-Bar Row','Chest Supported Row'],
      warmups: ['Hip hinge mobility x10','Band pull-aparts x20','Light RDL x10','Light DB row x12'],
      cooldowns: ['Child\'s pose','Cat-cow x10','Lat stretch'],
      ageRecommended: 'all',
      movementCues: ['Hinge at hips — spine neutral','Pull to lower abdomen (overhand) or belly button (underhand)','Lead with elbows','Squeeze scapula at top']
    },
    'Dumbbell Row': {
      muscles: { primary: ['latissimus_dorsi','middle_trapezius'], secondary: ['biceps_brachii','posterior_deltoid','rhomboid_major'], stabilizers: ['erector_spinae','core'] },
      pattern: 'pull', equipment: ['dumbbells'], fatigueScore: 6, recoveryHrs: 72, difficulty: 2,
      injuries: ['lower_back_strain','wrist_strain'],
      progressions: ['Barbell Row','Meadows Row','Pendlay Row'],
      regressions: ['Cable Row','Machine Row','Chest Supported Row'],
      alternatives: ['Cable Row','T-Bar Row','Chest Supported Row'],
      warmups: ['Hip hinge x10','Light DB row x12 (warmup weight)','Band pull-aparts'],
      cooldowns: ['Child\'s pose','Lat stretch','Cat-cow'],
      ageRecommended: 'all',
      movementCues: ['Keep spine parallel to floor','Pull elbow to hip — not shoulder','Full stretch at bottom']
    },
    'Seated Cable Row': {
      muscles: { primary: ['middle_trapezius','rhomboid_major','latissimus_dorsi'], secondary: ['biceps_brachii','posterior_deltoid'], stabilizers: ['erector_spinae','core'] },
      pattern: 'pull', equipment: ['cable machine'], fatigueScore: 6, recoveryHrs: 72, difficulty: 2,
      injuries: ['lower_back_strain'],
      progressions: ['Barbell Row','Single-Arm Cable Row'],
      regressions: ['Machine Row','Band Row'],
      alternatives: ['Machine Row','Chest Supported Row','T-Bar Row'],
      warmups: ['Light cable row x15','Band pull-aparts x20','Scapular retraction'],
      cooldowns: ['Child\'s pose','Seated forward fold','Lat stretch'],
      ageRecommended: 'all',
      movementCues: ['Sit tall — no rounding','Pull to abdomen','Elbows stay close to torso','Full stretch at arms extended']
    },

    // ── HINGE ──────────────────────────────────────────────────────────────
    'Deadlift': {
      muscles: { primary: ['erector_spinae','gluteus_maximus','hamstrings'], secondary: ['latissimus_dorsi','middle_trapezius','quadriceps'], stabilizers: ['core','multifidus','quadratus_lumborum'] },
      pattern: 'hinge', equipment: ['barbell'], fatigueScore: 10, recoveryHrs: 96, difficulty: 5,
      injuries: ['lower_back_strain','hamstring_strain','disc_herniation'],
      progressions: ['Sumo Deadlift','Deficit Deadlift'],
      regressions: ['Romanian Deadlift','Trap Bar Deadlift','Cable Pull-Through','Hip Thrust'],
      alternatives: ['Trap Bar Deadlift','Romanian Deadlift','Rack Pull'],
      warmups: ['Hip circles x10','Hip hinge with dowel x10','Light RDL x10','45% work weight x5','70% x3','85% x1'],
      cooldowns: ['Standing hip flexor stretch 30s','Lying hamstring stretch 30s','Child\'s pose 60s','Pigeon stretch 30s each'],
      ageRecommended: 'all',
      movementCues: ['Bar over mid-foot','Hip hinge — push floor away','Neutral spine throughout','Lock hips and knees simultaneously at top']
    },
    'Romanian Deadlift': {
      muscles: { primary: ['hamstrings','gluteus_maximus'], secondary: ['erector_spinae','adductor_magnus'], stabilizers: ['core','multifidus'] },
      pattern: 'hinge', equipment: ['barbell'], fatigueScore: 7, recoveryHrs: 72, difficulty: 3,
      injuries: ['hamstring_strain','lower_back_strain'],
      progressions: ['Deadlift','Single-Leg RDL','Good Morning'],
      regressions: ['Single-Leg RDL (bodyweight)','Cable Pull-Through','Hip Thrust'],
      alternatives: ['Dumbbell RDL','Single-Leg RDL','Nordic Curl','Good Morning'],
      warmups: ['Hip hinge x10','Leg swings x10 each','Light RDL x12','Glute activation'],
      cooldowns: ['Standing hamstring stretch 30s','Lying hamstring stretch','Seated forward fold'],
      ageRecommended: 'all',
      movementCues: ['Soft bend in knees throughout','Bar stays close to legs — drag it down','Hinge until hamstring tension','Squeeze glutes to stand']
    },
    'Hip Thrust': {
      muscles: { primary: ['gluteus_maximus'], secondary: ['hamstrings','quadriceps'], stabilizers: ['core','erector_spinae','adductors'] },
      pattern: 'hinge', equipment: ['barbell','bench'], fatigueScore: 6, recoveryHrs: 72, difficulty: 2,
      injuries: ['lower_back_strain'],
      progressions: ['Banded Hip Thrust','Single-Leg Hip Thrust','B-Stance Hip Thrust'],
      regressions: ['Glute Bridge','Bodyweight Hip Thrust','Cable Pull-Through'],
      alternatives: ['Glute Bridge','Cable Pull-Through','Machine Hip Thrust'],
      warmups: ['Glute bridge x15','Clamshells x15','Hip circles x10'],
      cooldowns: ['Hip flexor stretch 30s each','Pigeon stretch 30s','Lying glute stretch'],
      ageRecommended: 'all',
      movementCues: ['Upper back on bench edge','Drive through heels','Posterior pelvic tilt at top','Full hip extension — no lower back hyperextension']
    },

    // ── SQUAT ──────────────────────────────────────────────────────────────
    'Back Squat': {
      muscles: { primary: ['quadriceps','gluteus_maximus'], secondary: ['hamstrings','adductors'], stabilizers: ['erector_spinae','core','calves'] },
      pattern: 'squat', equipment: ['barbell','squat rack'], fatigueScore: 9, recoveryHrs: 96, difficulty: 5,
      injuries: ['knee_pain','lower_back_strain','hip_impingement'],
      progressions: ['Pause Squat','Box Squat','High Bar Squat','Olympic Squat'],
      regressions: ['Goblet Squat','Front Squat','Leg Press','Box Squat'],
      alternatives: ['Front Squat','Hack Squat','Leg Press','Smith Machine Squat'],
      warmups: ['Ankle circles x10','Goblet squat x10','Hip circles x10','Bodyweight squat x10','45% bar x8','70% x5','85% x2'],
      cooldowns: ['Quad stretch 30s each','Hip flexor stretch 30s each','Pigeon stretch 30s each','Child\'s pose 60s'],
      ageRecommended: 'all',
      movementCues: ['Brace core — 360 degree tension','Knees track over toes','Break at hips and knees simultaneously','Drive up through heels and mid-foot']
    },
    'Front Squat': {
      muscles: { primary: ['quadriceps'], secondary: ['gluteus_maximus','core'], stabilizers: ['erector_spinae','upper_back','core'] },
      pattern: 'squat', equipment: ['barbell','squat rack'], fatigueScore: 8, recoveryHrs: 96, difficulty: 5,
      injuries: ['knee_pain','wrist_pain'],
      progressions: ['Olympic Squat','Pause Front Squat'],
      regressions: ['Goblet Squat','Back Squat','Hack Squat'],
      alternatives: ['Goblet Squat','Back Squat','Hack Squat'],
      warmups: ['Wrist mobility','Ankle mobility','Goblet squat x10','Empty bar front squat x8'],
      cooldowns: ['Quad stretch','Hip flexor stretch','Wrist flexor stretch'],
      ageRecommended: 'all',
      movementCues: ['Elbows high and forward','Upright torso — more than back squat','Full depth if mobility allows']
    },
    'Goblet Squat': {
      muscles: { primary: ['quadriceps','gluteus_maximus'], secondary: ['hamstrings','adductors','core'], stabilizers: ['erector_spinae','upper_back'] },
      pattern: 'squat', equipment: ['dumbbell','kettlebell'], fatigueScore: 5, recoveryHrs: 48, difficulty: 1,
      injuries: ['knee_pain'],
      progressions: ['Front Squat','Back Squat','Bulgarian Split Squat'],
      regressions: ['Bodyweight Squat','TRX Squat','Seated Leg Press'],
      alternatives: ['Front Squat','Bodyweight Squat','Dumbbell Squat'],
      warmups: ['Ankle circles','Hip circles','Hip hinge x8','Bodyweight squat x10'],
      cooldowns: ['Quad stretch','Hip flexor stretch','Ankle mobility'],
      ageRecommended: 'all',
      movementCues: ['Hold weight at sternum','Elbows inside knees at bottom','Chest up throughout','Full depth']
    },
    'Leg Press': {
      muscles: { primary: ['quadriceps','gluteus_maximus'], secondary: ['hamstrings','adductors'], stabilizers: ['core'] },
      pattern: 'squat', equipment: ['leg press machine'], fatigueScore: 6, recoveryHrs: 72, difficulty: 1,
      injuries: ['knee_pain','lower_back_strain'],
      progressions: ['Back Squat','Hack Squat','Bulgarian Split Squat'],
      regressions: ['Goblet Squat','Bodyweight Squat'],
      alternatives: ['Back Squat','Hack Squat','Goblet Squat'],
      warmups: ['Light leg press x15','Leg swings x10','Hip circles'],
      cooldowns: ['Quad stretch','Hip flexor stretch','Seated hamstring stretch'],
      ageRecommended: 'all',
      movementCues: ['Do not lock knees fully at top','Feet hip-width or shoulder-width','Control the descent','Keep lower back pressed to pad']
    },
    'Bulgarian Split Squat': {
      muscles: { primary: ['quadriceps','gluteus_maximus'], secondary: ['hamstrings','adductors'], stabilizers: ['core','calves'] },
      pattern: 'squat', equipment: ['dumbbells','bench'], fatigueScore: 7, recoveryHrs: 72, difficulty: 4,
      injuries: ['knee_pain','hip_flexor_strain'],
      progressions: ['Weighted Bulgarian Split Squat','Deficit BSS'],
      regressions: ['Reverse Lunge','Forward Lunge','Split Squat'],
      alternatives: ['Reverse Lunge','Step-Up','Single-Leg Press'],
      warmups: ['Hip flexor stretch 30s each','Bodyweight split squat x10 each','Hip circles'],
      cooldowns: ['Hip flexor stretch 60s each','Quad stretch','Pigeon pose'],
      ageRecommended: 'all',
      movementCues: ['Rear foot elevated on bench','Front shin stays relatively vertical','Lower until rear knee near floor','Drive through front heel']
    },

    // ── PULL — ARMS ────────────────────────────────────────────────────────
    'Barbell Curl': {
      muscles: { primary: ['biceps_brachii'], secondary: ['brachialis','brachioradialis'], stabilizers: ['anterior_deltoid','core'] },
      pattern: 'pull', equipment: ['barbell'], fatigueScore: 5, recoveryHrs: 48, difficulty: 2,
      injuries: ['bicep_tendon_strain','elbow_pain'],
      progressions: ['Cheat Curl','Drag Curl','21s'],
      regressions: ['Dumbbell Curl','Cable Curl','Band Curl'],
      alternatives: ['Dumbbell Curl','Cable Curl','EZ Bar Curl'],
      warmups: ['Light cable curl x15','Wrist circles x10','Band curl x12'],
      cooldowns: ['Bicep stretch against wall','Wrist extensor stretch'],
      ageRecommended: 'all',
      movementCues: ['Elbows fixed at sides','Full supination at top','Control the negative — 2-3 seconds','No swinging']
    },
    'Dumbbell Curl': {
      muscles: { primary: ['biceps_brachii'], secondary: ['brachialis','brachioradialis'], stabilizers: ['anterior_deltoid'] },
      pattern: 'pull', equipment: ['dumbbells'], fatigueScore: 4, recoveryHrs: 48, difficulty: 1,
      injuries: ['bicep_tendon_strain','wrist_strain'],
      progressions: ['Barbell Curl','Incline Dumbbell Curl','Concentration Curl'],
      regressions: ['Cable Curl','Band Curl'],
      alternatives: ['Barbell Curl','Cable Curl','EZ Bar Curl','Hammer Curl'],
      warmups: ['Band curl x12','Wrist circles','Light weight x15'],
      cooldowns: ['Bicep wall stretch','Wrist flexor stretch'],
      ageRecommended: 'all',
      movementCues: ['Supinate as you curl','Squeeze at top','Elbows fixed','Alternate or simultaneous']
    },
    'Tricep Pushdown': {
      muscles: { primary: ['triceps_brachii'], secondary: ['anconeus'], stabilizers: ['anterior_deltoid'] },
      pattern: 'push', equipment: ['cable machine'], fatigueScore: 4, recoveryHrs: 48, difficulty: 1,
      injuries: ['elbow_pain','wrist_pain'],
      progressions: ['Overhead Cable Tricep Extension','Close Grip Bench Press','Weighted Dips'],
      regressions: ['Band Pushdown','Machine Tricep Extension'],
      alternatives: ['Overhead Tricep Extension','Close Grip Bench','Skull Crusher'],
      warmups: ['Light pushdown x15','Elbow circles x10'],
      cooldowns: ['Overhead tricep stretch 30s','Cross-body tricep stretch'],
      ageRecommended: 'all',
      movementCues: ['Elbows fixed at sides','Full extension at bottom','Squeeze triceps','Control eccentric']
    },
    'Skull Crusher': {
      muscles: { primary: ['triceps_brachii'], secondary: ['anconeus'], stabilizers: [] },
      pattern: 'push', equipment: ['barbell','bench'], fatigueScore: 5, recoveryHrs: 48, difficulty: 3,
      injuries: ['elbow_pain','elbow_tendinopathy'],
      progressions: ['Close Grip Bench Press','Weighted Dips'],
      regressions: ['Tricep Pushdown','Overhead Tricep Extension','Band Pushdown'],
      alternatives: ['Overhead Tricep Extension','Tricep Pushdown','Machine Tricep Extension'],
      warmups: ['Light tricep pushdown x15','Elbow circles','Band pushdown x12'],
      cooldowns: ['Overhead tricep stretch','Cross-body stretch'],
      ageRecommended: 'all',
      movementCues: ['Bar to forehead level — not neck','Elbows point forward and stay still','Full extension at top','Control the descent']
    },

    // ── LEGS ───────────────────────────────────────────────────────────────
    'Leg Curl': {
      muscles: { primary: ['hamstrings'], secondary: ['gastrocnemius'], stabilizers: ['core'] },
      pattern: 'isolation', equipment: ['leg curl machine'], fatigueScore: 5, recoveryHrs: 72, difficulty: 1,
      injuries: ['hamstring_strain'],
      progressions: ['Nordic Curl','Romanian Deadlift','Single-Leg Curl'],
      regressions: ['Band Leg Curl'],
      alternatives: ['Nordic Curl','Romanian Deadlift','Swiss Ball Curl'],
      warmups: ['Light leg curl x15','Hip flexor stretch','Hamstring stretch'],
      cooldowns: ['Standing hamstring stretch 30s each','Lying hamstring stretch','Seated forward fold'],
      ageRecommended: 'all',
      movementCues: ['Keep hips pressed down','Full curl — heels to glutes','Control eccentric 3 seconds','Point toes for more bicep femoris']
    },
    'Leg Extension': {
      muscles: { primary: ['quadriceps'], secondary: [], stabilizers: [] },
      pattern: 'isolation', equipment: ['leg extension machine'], fatigueScore: 4, recoveryHrs: 72, difficulty: 1,
      injuries: ['knee_pain','patellofemoral_syndrome'],
      progressions: ['Front Squat','Hack Squat'],
      regressions: ['Wall Sit'],
      alternatives: ['Goblet Squat','Hack Squat','Leg Press'],
      warmups: ['Light leg extension x15','Quad stretch','Knee circles'],
      cooldowns: ['Quad stretch 30s each','Lying quad stretch'],
      ageRecommended: 'all',
      movementCues: ['Full extension — squeeze at top','Control the descent','Avoid snapping at lockout','Adjust pad to just above ankle']
    },
    'Calf Raise': {
      muscles: { primary: ['gastrocnemius','soleus'], secondary: [], stabilizers: [] },
      pattern: 'isolation', equipment: ['calf raise machine'], fatigueScore: 4, recoveryHrs: 48, difficulty: 1,
      injuries: ['achilles_tendinopathy','plantar_fasciitis'],
      progressions: ['Single-Leg Calf Raise','Seated Calf Raise','Donkey Calf Raise'],
      regressions: ['Bodyweight Calf Raise'],
      alternatives: ['Seated Calf Raise','Donkey Calf Raise','Leg Press Calf Raise'],
      warmups: ['Ankle circles x10 each','Calf stretch 20s','Light raises x20'],
      cooldowns: ['Calf stretch against wall 30s each','Achilles stretch 30s each','Plantar fascia stretch'],
      ageRecommended: 'all',
      movementCues: ['Full ROM — full stretch at bottom','Pause at top — squeeze','Slow eccentric 3-4 seconds']
    },

    // ── CORE ───────────────────────────────────────────────────────────────
    'Plank': {
      muscles: { primary: ['transverse_abdominis','rectus_abdominis'], secondary: ['obliques','serratus_anterior'], stabilizers: ['erector_spinae','glutes'] },
      pattern: 'carry', equipment: [], fatigueScore: 3, recoveryHrs: 24, difficulty: 1,
      injuries: ['lower_back_pain'],
      progressions: ['RKC Plank','Plank with Reach','Ab Wheel Rollout','Dragon Flag'],
      regressions: ['Knee Plank','Incline Plank'],
      alternatives: ['Dead Bug','Bird-Dog','Hollow Body Hold'],
      warmups: ['Scapular push-ups','Deep breathing','Hip mobility'],
      cooldowns: ['Cobra stretch','Child\'s pose','Hip flexor stretch'],
      ageRecommended: 'all',
      movementCues: ['Straight line head to heels','Posterior pelvic tilt','Squeeze glutes and abs simultaneously','Breathe normally']
    },
    'Ab Wheel Rollout': {
      muscles: { primary: ['transverse_abdominis','rectus_abdominis'], secondary: ['obliques','latissimus_dorsi'], stabilizers: ['erector_spinae'] },
      pattern: 'carry', equipment: ['ab wheel'], fatigueScore: 6, recoveryHrs: 48, difficulty: 4,
      injuries: ['lower_back_strain','shoulder_strain'],
      progressions: ['Standing Ab Wheel Rollout','Dragon Flag'],
      regressions: ['Knee Ab Wheel Rollout','Plank','Dead Bug'],
      alternatives: ['TRX Fallout','Barbell Rollout','Cable Crunch'],
      warmups: ['Plank 30s','Dead bug x10','Hollow body hold'],
      cooldowns: ['Cobra stretch','Child\'s pose','Cat-cow'],
      ageRecommended: 'all',
      movementCues: ['Brace core before rolling','Hips hinge — do not let lower back arch','Return under control','Start with limited ROM']
    }
  },

  // ── Public API ────────────────────────────────────────────────────────────
  get(name) { return this._db[name] || null; },

  getAlternatives(name, equipmentList) {
    const node = this._db[name];
    if (!node) return [];
    if (!equipmentList || !equipmentList.length) return node.alternatives || [];
    return (node.alternatives || []).filter(alt => {
      const altNode = this._db[alt];
      if (!altNode) return true;
      return altNode.equipment.every(eq => equipmentList.includes(eq) || !eq);
    });
  },

  getProgressions(name) { return this._db[name]?.progressions || []; },
  getRegressions(name) { return this._db[name]?.regressions || []; },
  getWarmup(name) { return this._db[name]?.warmups || []; },
  getCooldown(name) { return this._db[name]?.cooldowns || []; },
  getInjuryRisks(name) { return this._db[name]?.injuries || []; },
  getFatigueScore(name) { return this._db[name]?.fatigueScore || 5; },
  getRecoveryHrs(name) { return this._db[name]?.recoveryHrs || 72; },
  getCues(name) { return this._db[name]?.movementCues || []; },
  all() { return Object.keys(this._db); },

  byMuscle(muscleId) {
    return Object.entries(this._db)
      .filter(([, n]) => (n.muscles.primary || []).includes(muscleId) || (n.muscles.secondary || []).includes(muscleId))
      .map(([name]) => name);
  },

  byPattern(pattern) {
    return Object.entries(this._db).filter(([, n]) => n.pattern === pattern).map(([name]) => name);
  },

  workoutFatigue(exerciseNames) {
    return exerciseNames.reduce((sum, name) => sum + this.getFatigueScore(name), 0);
  },

  injuryContraindicated(injuryId) {
    return Object.entries(this._db)
      .filter(([, n]) => (n.injuries || []).includes(injuryId))
      .map(([name]) => name);
  }
};
window.EKG = EKG;
