'use strict';
/* ── PulseCap — Fitness Encyclopedia ── */

/* ══════════════════════════════════════════════════════
   MOBILITY ENCYCLOPEDIA
══════════════════════════════════════════════════════ */
const MobilityDB = {
  ankle: {
    name: 'Ankle', icon: 'walk',
    assessment: 'Wall ankle test: stand 10cm from wall, touch knee to wall without heel lifting. Normal = pass. Fail = restricted dorsiflexion.',
    restrictions: ['Limited dorsiflexion affects squat depth','Tight calves compensate with heel rise','Hip internal rotation compensates for ankle restriction'],
    drills: [
      { name: 'Ankle Circles', sets: '2x10 each direction', cue: 'Full ROM slow circles, pause at end range' },
      { name: 'Wall Ankle Stretch', sets: '3x30s each', cue: 'Lean into wall, keep heel flat, move knee toward wall' },
      { name: 'Banded Ankle Mobilization', sets: '2x15 each', cue: 'Band around ankle, drive knee forward over toes' },
      { name: 'Heel Raises', sets: '3x15', cue: 'Full ROM — all the way up and all the way down' },
      { name: 'Calf Foam Roll', sets: '60s each leg', cue: 'Apply pressure, find tender spots, hold 10s' },
    ],
    progressions: ['ATG Split Squat for full ankle ROM', 'Slant board squats', 'Olympic squat depth test'],
    frequency: 'Daily for restriction. 3x/week for maintenance.'
  },
  hip: {
    name: 'Hip', icon: 'walk',
    assessment: 'FABER test: lie on back, cross ankle over opposite knee, let knee fall open. Tight = hip external rotation restriction. Hip 90-90 test for internal/external rotation.',
    restrictions: ['Hip flexor tightness from sitting','Limited internal rotation causes lumbar compensation','Anterior pelvic tilt from weak glutes + tight hip flexors'],
    drills: [
      { name: 'Hip 90-90 Stretch', sets: '2x60s each side', cue: 'Front and rear leg at 90 degrees, sit tall, lean forward gently' },
      { name: 'Pigeon Pose', sets: '2x60s each side', cue: 'Front shin parallel to mat ideally, square hips, breathe into hip' },
      { name: 'Hip Flexor Lunge Stretch', sets: '3x45s each', cue: 'Posterior pelvic tilt, reach arm up and back, feel stretch in front of hip' },
      { name: 'Cossack Squat', sets: '2x10 each side', cue: 'Wide stance, shift weight to one side, other leg straight, heel flat' },
      { name: 'Hip CARs (Controlled Articular Rotations)', sets: '2x5 each direction', cue: 'Active full ROM circles of hip joint, slow and controlled' },
      { name: 'Frog Stretch', sets: '2x45s', cue: 'Knees wide, feet in line with knees, rock forward and back' },
    ],
    progressions: ['Full ATG squat','Pistol squat hip mobility','Pancake stretch'],
    frequency: 'Daily for athletes. 3-4x/week minimum.'
  },
  shoulder: {
    name: 'Shoulder', icon: 'bandage',
    assessment: 'Overhead reach: arms straight overhead against wall. Good = no rib flare, full overhead. Sleeper stretch test for internal rotation. Apley scratch test for combined ROM.',
    restrictions: ['Lat and pec tightness limit overhead ROM','Posterior capsule tightness limits internal rotation','Thoracic kyphosis limits true shoulder flexion'],
    drills: [
      { name: 'Wall Slides', sets: '3x10', cue: 'Forearms and back of hands on wall, slide up maintaining contact, no rib flare' },
      { name: 'Overhead Distraction', sets: '2x60s each arm', cue: 'Band around wrist overhead, distraction force, reach tall' },
      { name: 'Sleeper Stretch', sets: '2x45s each', cue: 'Side lying, arm at 90 degrees, push forearm toward floor gently' },
      { name: 'Band Pull-Aparts', sets: '3x20', cue: 'Arms straight, pull band to chest, squeeze rear delts, control return' },
      { name: 'Doorway Chest Stretch', sets: '3x30s each angle', cue: 'High, mid, and low positions. Feel stretch in chest and anterior shoulder' },
      { name: 'Thoracic Rotation on Foam Roller', sets: '2x10 each side', cue: 'Foam roller across mid-back, arms crossed, rotate to each side' },
    ],
    progressions: ['Overhead squat mobility','Skin the cat on rings','Handstand shoulder prep'],
    frequency: '4-5x/week for overhead athletes. Daily for desk workers.'
  },
  spine: {
    name: 'Thoracic Spine', icon: 'dna',
    assessment: 'Seated rotation test: sit cross-legged, arms across chest, rotate. Normal = 45+ degrees each side. Limited = thoracic restriction.',
    restrictions: ['Desk work causes thoracic kyphosis','Limits overhead pressing and rowing','Causes compensatory lumbar extension under load'],
    drills: [
      { name: 'Thoracic Extension over Foam Roller', sets: '2x10 per segment', cue: 'Position foam roller at different thoracic segments, extend gently' },
      { name: 'Cat-Cow', sets: '3x10', cue: 'Full spinal flexion and extension, move vertebra by vertebra' },
      { name: 'Thread the Needle', sets: '2x10 each side', cue: 'Quadruped, reach arm under body, feel rotation through thoracic' },
      { name: 'Thoracic Rotation Stretch (seated)', sets: '2x10 each side', cue: 'Sit upright, rotate only from thoracic, not lumbar' },
      { name: 'Open Book Stretch', sets: '2x30s each side', cue: 'Side-lying, top arm opens across body, follow with eyes, feel thoracic rotation' },
    ],
    progressions: ['Overhead squat full depth','Snatch grip overhead hold','Jefferson curl (advanced)'],
    frequency: 'Daily. Especially before pressing and rowing sessions.'
  },
  knee: {
    name: 'Knee', icon: 'walk',
    assessment: 'Knee tracking test: squat single-leg, observe knee tracking. Should track over 2nd toe. Inward collapse = valgus, hip weakness. Outward = varus, limited ankle/hip mobility.',
    restrictions: ['Quad tightness limits flexion ROM','IT band tightness causes lateral pain','Knee valgus from hip weakness not knee problem'],
    drills: [
      { name: 'Quad Foam Roll', sets: '60s each', cue: 'Slow roll, pause on tender spots 10s, move distal to proximal' },
      { name: 'Kneeling Hip Flexor Stretch', sets: '3x45s each', cue: 'Posterior pelvic tilt, squeeze rear glute, reach arm up' },
      { name: 'IT Band Foam Roll', sets: '60s each', cue: 'Outer thigh, roll from hip to knee, find tender spots' },
      { name: 'ATG Split Squat (bodyweight)', sets: '2x10 each', cue: 'Drive knee forward over toes maximally, heel flat, control descent' },
      { name: 'Calf/Soleus Stretch', sets: '2x30s each', cue: 'Bent knee version targets soleus — critical for squat depth' },
    ],
    progressions: ['ATG split squat loaded','Sissy squat','Full squat knees-over-toes'],
    frequency: '3-4x/week. Always before leg sessions.'
  },
  wrist: {
    name: 'Wrist', icon: 'ruler',
    assessment: 'Wrist extension test: hands flat on floor (table-top position), fingers forward. Normal = 90 degrees without pain. Front rack test for front squat grip.',
    restrictions: ['Limits front squat rack position','Causes pain in push-ups and overhead press','Desk work causes flexor tightness'],
    drills: [
      { name: 'Wrist Circles', sets: '2x10 each direction', cue: 'Full controlled ROM, slow and deliberate' },
      { name: 'Wrist Extension Stretch', sets: '3x30s each', cue: 'Palm down, gently apply pressure into extension, feel forearm stretch' },
      { name: 'Wrist Flexion Stretch', sets: '2x30s each', cue: 'Palm up, pull fingers back, feel inner forearm stretch' },
      { name: 'Prayer Stretch', sets: '2x30s', cue: 'Palms together, press down keeping palms together' },
      { name: 'Knuckle Push-Ups', sets: '2x10', cue: 'Alternative to flat palm — reduces wrist extension demand' },
    ],
    progressions: ['Loaded wrist CARs','Front squat with proper rack position','Handstand wrist conditioning'],
    frequency: 'Daily for desk workers and barbell athletes.'
  }
};
window.MobilityDB = MobilityDB;

/* ══════════════════════════════════════════════════════
   STRETCHING ENCYCLOPEDIA
══════════════════════════════════════════════════════ */
const StretchDB = {
  chest: {
    name: 'Chest', icon: 'heart',
    stretches: [
      { name: 'Doorway Chest Stretch', duration: '30-45s each arm', type: 'static', cue: 'Three positions: arm low (lower chest), arm mid (sternum), arm high (clavicular head). Feel tension across chest.', contraindications: ['Shoulder dislocation (acute)','Pec major tear (acute)'] },
      { name: 'Foam Roller Chest Opener', duration: '60s', type: 'passive', cue: 'Foam roller along spine vertically. Arms out to sides, let gravity open chest. Deep breathing enhances stretch.' },
      { name: 'PNF Chest Stretch', duration: '6s contract + 30s relax', type: 'pnf', cue: 'Doorway position. Push arm into door 6s, relax and increase range 30s. Repeat 3 times per side.' },
    ]
  },
  lats: {
    name: 'Lats / Back', icon: 'dumbbell',
    stretches: [
      { name: 'Doorway Lat Stretch', duration: '45s each side', type: 'static', cue: 'Hold door frame at hip height, sit back into stretch, feel lat stretch from armpit to hip.' },
      { name: "Child's Pose (Lat Focus)", duration: '60s', type: 'static', cue: 'Arms extended forward, walk hands to one side for unilateral lat stretch. Breathe into stretch.' },
      { name: 'Hanging Lat Stretch', duration: '20-30s', type: 'static', cue: 'Dead hang from pull-up bar. Add slight rotation by shifting hips to each side.' },
      { name: 'Overhead Lat Stretch (seated)', duration: '30s each', type: 'static', cue: 'Arm overhead, lean to opposite side, feel stretch from hip to armpit.' },
    ]
  },
  hip_flexors: {
    name: 'Hip Flexors', icon: 'walk',
    stretches: [
      { name: 'Kneeling Hip Flexor Stretch', duration: '45-60s each', type: 'static', cue: 'Back knee down, front foot forward. Posterior pelvic tilt (tuck pelvis), reach arm up. Feel front of rear hip.' },
      { name: 'Standing Hip Flexor Stretch', duration: '30s each', type: 'static', cue: 'Stand upright, pull one ankle to glute, keep knees together, push hip forward gently.' },
      { name: 'PNF Hip Flexor Stretch', duration: '6s contract + 30s', type: 'pnf', cue: 'Kneeling position. Push rear knee into floor for 6s, relax and deepen stretch.' },
      { name: 'Couch Stretch', duration: '60s each side', type: 'static', cue: 'Rear foot elevated against wall, kneel. Intense rectus femoris stretch. Progress to upright.' },
    ]
  },
  hamstrings: {
    name: 'Hamstrings', icon: 'walk',
    stretches: [
      { name: 'Standing Hamstring Stretch', duration: '30-45s each', type: 'static', cue: 'Foot up on bench, hinge from hip (not round back), reach toward foot.' },
      { name: 'Seated Forward Fold', duration: '60s', type: 'static', cue: 'Legs straight, hinge from hips. Keep spine long. Strap or towel around feet if needed.' },
      { name: 'PNF Hamstring Stretch', duration: '6s contract + 30s', type: 'pnf', cue: 'Lying: push heel into floor or partner for 6s, relax, deepen stretch. 2-3 cycles.' },
      { name: 'Dynamic Leg Swings', duration: '15 each leg', type: 'dynamic', cue: 'Front-to-back leg swings, progressively increasing ROM. Warmup stretch.' },
    ]
  },
  quads: {
    name: 'Quadriceps', icon: 'walk',
    stretches: [
      { name: 'Standing Quad Stretch', duration: '30-45s each', type: 'static', cue: 'Pull ankle to glute, keep knees together, stand tall. Use wall for balance.' },
      { name: 'Lying Quad Stretch', duration: '45s each', type: 'static', cue: 'Side lying, pull ankle to glute. Add posterior pelvic tilt to increase rectus femoris stretch.' },
      { name: 'Couch Stretch (Quad focus)', duration: '60s each', type: 'static', cue: 'Elevated rear foot, upright torso. Most intense quad and hip flexor stretch.' },
      { name: 'Foam Roll Quads', duration: '60s each', type: 'myofascial', cue: 'Roll from hip to knee. Find tender spots, hold 10-15s, flex and extend knee.' },
    ]
  },
  calves: {
    name: 'Calves', icon: 'walk',
    stretches: [
      { name: 'Wall Calf Stretch (Gastrocnemius)', duration: '30-45s each', type: 'static', cue: 'Leg straight, heel down, lean into wall. Straight knee targets gastrocnemius.' },
      { name: 'Bent Knee Calf Stretch (Soleus)', duration: '30-45s each', type: 'static', cue: 'Knee bent version of calf stretch. Bent knee targets soleus. Critical for squat depth.' },
      { name: 'Downward Dog Calf Stretch', duration: '30s + 10 heel pumps', type: 'static', cue: 'Yoga downward dog position. Alternate pressing heels down. Dynamic finish.' },
      { name: 'Achilles Stretch', duration: '30s each', type: 'static', cue: 'Step forward, rear heel down, slightly bend rear knee. Feel stretch at Achilles insertion.' },
    ]
  },
  shoulders: {
    name: 'Shoulders', icon: 'bandage',
    stretches: [
      { name: 'Cross-Body Shoulder Stretch', duration: '30s each', type: 'static', cue: 'Pull arm across chest at shoulder height. Feel posterior shoulder and rear delt.' },
      { name: 'Overhead Shoulder Stretch', duration: '30s each', type: 'static', cue: 'Arm overhead, bend elbow, pull with other hand. Feel tricep and shoulder.' },
      { name: 'Posterior Capsule Stretch (Sleeper)', duration: '45s each', type: 'static', cue: 'Side lying on stretching arm, shoulder at 90 degrees, push forearm toward floor gently. Critical for throwers.' },
      { name: 'Band Shoulder Distraction', duration: '45s each', type: 'assisted', cue: 'Resistance band around wrist, slight distraction, actively reach and rotate shoulder.' },
    ]
  },
  glutes: {
    name: 'Glutes', icon: 'walk',
    stretches: [
      { name: 'Pigeon Pose', duration: '60s each side', type: 'static', cue: 'Front shin parallel to mat. Square hips. Breathe into the glute. Most effective glute stretch.' },
      { name: 'Seated Glute Stretch (Figure-4)', duration: '45s each', type: 'static', cue: 'Seated, ankle over opposite knee, lean forward gently. Chair-friendly version of pigeon.' },
      { name: 'Hip 90-90 Stretch', duration: '60s each configuration', type: 'static', cue: 'Both legs at 90 degrees. Target front and rear hip. Transition between sides.' },
      { name: 'Lying Glute Stretch', duration: '45s each', type: 'static', cue: 'On back, pull knee to opposite shoulder. Gentle effective glute stretch.' },
    ]
  },
  lower_back: {
    name: 'Lower Back', icon: 'alert',
    stretches: [
      { name: "Child's Pose", duration: '60-90s', type: 'static', cue: 'Arms extended forward, sit back toward heels, breathe deeply. Most gentle lower back stretch.' },
      { name: 'Knee-to-Chest Stretch', duration: '30s each + both together', type: 'static', cue: 'Lying on back, pull one knee to chest. Then both knees. Gentle lumbar decompression.' },
      { name: 'Spinal Twist', duration: '45s each side', type: 'static', cue: 'Lying on back, knee crosses to opposite side, arm out. Feel thoracolumbar rotation.' },
      { name: 'Cat-Cow', duration: '10-15 reps', type: 'dynamic', cue: 'Quadruped. Alternate full flexion and extension. Segmental spinal mobility.' },
    ]
  }
};
window.StretchDB = StretchDB;

/* ══════════════════════════════════════════════════════
   WARMUP DATABASE
══════════════════════════════════════════════════════ */
const WarmupDB = {
  squat: {
    name: 'Squat Day Warmup', duration: '8-12 min',
    steps: [
      '3 min light cardio (bike, row, or jump rope)',
      'Ankle mobility: wall ankle drill 2x10 each',
      'Hip circles: 2x10 each direction',
      'Goblet squat with pause at bottom: 2x10 (BW then light KB)',
      'Hip flexor stretch: 30s each side',
      'Glute activation: clamshells 2x15 or banded walks 2x20 steps',
      'Empty bar squat: 2x8 focusing on depth and bracing',
      'Work up sets: 40% x5, 60% x3, 75% x1'
    ]
  },
  deadlift: {
    name: 'Deadlift Day Warmup', duration: '8-10 min',
    steps: [
      '3 min light cardio',
      'Hip hinge with dowel: 2x10 (dowel touching head, upper back, and glutes)',
      'Cat-cow: 2x10',
      'Glute bridge: 2x15',
      'Single-leg RDL bodyweight: 2x8 each for hip hinge patterning',
      'Light RDL: 2x10 with empty bar or light weight',
      'Work up sets: 40% x5, 60% x3, 75% x1-2'
    ]
  },
  upper_push: {
    name: 'Upper Push Day Warmup', duration: '6-8 min',
    steps: [
      'Band pull-aparts: 3x20',
      'Shoulder circles: 2x10 each direction',
      'Chest doorway stretch: 30s each angle',
      'Scapular push-ups: 2x10',
      'Light dumbbell flies: 1x12 (very light)',
      'Light bench press: empty bar x10',
      'Work up sets: 50% x5, 70% x3'
    ]
  },
  upper_pull: {
    name: 'Upper Pull Day Warmup', duration: '6-8 min',
    steps: [
      'Band pull-aparts: 3x20',
      'Dead hang: 2x20s',
      'Active scapular pulls in hang: 2x10',
      'Face pulls light: 2x15',
      'Light lat pulldown: 2x12 focusing on lat activation',
      'Work up sets to working weight'
    ]
  },
  legs: {
    name: 'General Leg Day Warmup', duration: '10-12 min',
    steps: [
      '5 min light bike or treadmill',
      'Leg swings (front-back, side-side): 2x15 each',
      'Hip circles: 2x10 each',
      'Ankle mobility: 2x10 each',
      'Bodyweight squat: 2x10 with pause at bottom',
      'Reverse lunge: 2x8 each',
      'Glute bridge: 2x15',
      'Light leg press or squat to work in'
    ]
  },
  full_body: {
    name: 'Full Body Warmup', duration: '10 min',
    steps: [
      '3-5 min light cardio',
      'Joint rotations: neck, shoulders, hips, knees, ankles — 10 each',
      'Cat-cow: 2x10',
      'Hip flexor stretch: 30s each',
      'Band pull-aparts: 2x20',
      'Goblet squat: 2x10',
      'Push-ups: 2x8',
      'Bodyweight row or band row: 2x10'
    ]
  }
};
window.WarmupDB = WarmupDB;

/* ══════════════════════════════════════════════════════
   COOLDOWN DATABASE
══════════════════════════════════════════════════════ */
const CooldownDB = {
  upper_body: {
    name: 'Upper Body Cooldown', duration: '8-10 min',
    steps: [
      'Doorway chest stretch: 45s each angle (3 positions)',
      'Cross-body shoulder stretch: 30s each arm',
      'Overhead tricep stretch: 30s each',
      'Lat doorway stretch: 45s each side',
      'Wrist circles and wrist flexor stretch: 30s each',
      "Child's pose: 60s",
      'Deep diaphragmatic breathing: 2 min (4s in, hold 4s, out 6s)'
    ]
  },
  lower_body: {
    name: 'Lower Body Cooldown', duration: '10-12 min',
    steps: [
      'Standing quad stretch: 45s each',
      'Hip flexor lunge stretch: 60s each',
      'Standing hamstring stretch: 45s each',
      'Pigeon pose: 90s each side',
      'Calf wall stretch (straight + bent knee): 30s each variant each leg',
      'Lying glute stretch: 45s each',
      'Spinal twist: 45s each side',
      "Child's pose: 60s"
    ]
  },
  full_body: {
    name: 'Full Body Cooldown', duration: '12-15 min',
    steps: [
      'Light walk: 3-5 min',
      'Quad stretch: 30s each',
      'Hip flexor stretch: 45s each',
      'Hamstring stretch: 45s each',
      'Chest doorway stretch: 30s each angle',
      'Lat stretch: 45s each side',
      'Shoulder cross-body: 30s each',
      'Pigeon pose: 60s each',
      'Spinal twist: 30s each side',
      'Savasana breathing: 2 min'
    ]
  },
  core: {
    name: 'Core Session Cooldown', duration: '6-8 min',
    steps: [
      'Cobra pose: 30s',
      "Child's pose: 60s",
      'Cat-cow: 2x10',
      'Spinal twist: 45s each side',
      'Hip flexor stretch: 45s each',
      'Deep breathing: 2 min'
    ]
  }
};
window.CooldownDB = CooldownDB;

/* ══════════════════════════════════════════════════════
   SPORTS PERFORMANCE DATABASE
══════════════════════════════════════════════════════ */
const SportsDB = {
  cricket: {
    name: 'Cricket', icon: 'run', positions: ['Batsman','Bowler','Wicketkeeper','All-Rounder'],
    key_demands: ['Rotational power for batting','Shoulder endurance for bowling','Explosive acceleration for running between wickets','Core stability for bowling action'],
    strength_training: {
      frequency: '3-4x per week in off-season, 2x in season',
      primary_lifts: ['Romanian Deadlift (posterior chain for bowling)','Rotational Med Ball Slam','Cable Woodchop','Overhead Press','Pull-Ups','Hip Thrust (acceleration)'],
      avoid: ['Heavy pressing volume in season (bowler shoulder overuse)','Heavy squatting close to match day'],
    },
    conditioning: '200-400m intervals for running fitness. Agility ladder for fielding. Sprint training 20-40m for running between wickets.',
    mobility_priority: ['Thoracic rotation (batting and bowling)','Hip mobility (bowling action)','Shoulder external rotation (throwing)','Ankle mobility (fast bowling)'],
    injury_risks: ['Bowling: stress fractures (lumbar)','Batting: shoulder from repetitive swings','Wicketkeeper: knee from squatting'],
    periodization: 'Peak for season. Build base in off-season. Deload 2 weeks before season start.'
  },
  football: {
    name: 'Football / Soccer', icon: 'run', positions: ['Striker','Midfielder','Defender','Goalkeeper'],
    key_demands: ['Speed and acceleration','Jumping ability','90-minute aerobic endurance','Kicking power and accuracy','Change of direction'],
    strength_training: {
      frequency: '2-3x in season, 3-4x off-season',
      primary_lifts: ['Back Squat (power and speed)','Romanian Deadlift (hamstring injury prevention)','Nordic Curl (critical for hamstring injury prevention)','Single-Leg Press','Box Jump','Hip Thrust (sprint power)'],
      avoid: ['Heavy volume close to match','Upper body mass building (not sport-specific)'],
    },
    conditioning: 'VO2max training: 4x4 intervals. Repeated sprint ability. Small-sided games in season.',
    mobility_priority: ['Hip flexor (sprinting stride length)','Adductor mobility (change of direction)','Ankle dorsiflexion (plant foot mechanics)','Thoracic rotation'],
    injury_risks: ['Hamstring strains (most common)','ACL injuries','Groin strains','Ankle sprains'],
    periodization: 'Pre-season: 6-8 weeks strength + conditioning base. In-season: maintain 2x/week. Post-season: recovery 2-3 weeks then strength rebuild.'
  },
  mma: {
    name: 'MMA / Combat Sports', icon: 'bandage', positions: ['Striker','Grappler','All-Rounder'],
    key_demands: ['Explosive power for strikes','Grappling strength (grip, neck, core)','Anaerobic capacity for rounds','Injury resilience'],
    strength_training: {
      frequency: '3-4x per week, periodized around camp',
      primary_lifts: ['Deadlift (total body strength)','Overhead Press (punching power transfer)','Pull-Ups (clinch strength)','Farmer Carry (grip and core)','Med Ball Rotational Throw','Neck Training'],
      avoid: ['Bodybuilding splits — functional strength only','High volume isolation work in camp'],
    },
    conditioning: 'Circuit training matching fight rounds (3x5 min or 5x5 min). Bag work. Sprawl-and-brawl conditioning. Zone 2 base building off-camp.',
    mobility_priority: ['Hip mobility (guard position, high kicks)','Shoulder external rotation (armbar defense)','Thoracic rotation','Ankle mobility (stances)'],
    injury_risks: ['Cauliflower ear','Shoulder subluxations','Knee ligament injuries','Neck strain'],
    periodization: '12-week fight camp. Weeks 1-4: strength base. Weeks 5-8: power + conditioning. Weeks 9-12: sport-specific + taper.'
  },
  basketball: {
    name: 'Basketball', icon: 'run', positions: ['Point Guard','Shooting Guard','Small Forward','Power Forward','Center'],
    key_demands: ['Vertical jump height','Lateral quickness','Anaerobic conditioning (repeated sprints)','Upper body strength for physicality'],
    strength_training: {
      frequency: '2-3x in season, 3-4x off-season',
      primary_lifts: ['Back Squat (vertical jump)','Box Jump (plyometric)','Romanian Deadlift','Overhead Press (shooting and rebounding)','Single-Leg Squat','Lateral Lunges'],
      avoid: ['Heavy lower body day before game day'],
    },
    conditioning: 'Interval sprints 20-40m. Lateral shuffle training. Vertical jump plyometric program (jump squat, depth jump).',
    mobility_priority: ['Hip flexor (jumping and lateral speed)','Ankle dorsiflexion (landing mechanics)','Thoracic for shooting mechanics'],
    injury_risks: ['Ankle sprains (most common)','Knee patellar tendinopathy','ACL injuries','Lower back from repetitive jumping'],
    periodization: 'Off-season: 16-week strength and power block. Pre-season: conditioning. In-season: maintain.'
  },
  sprinting: {
    name: 'Track & Sprinting', icon: 'run', positions: ['Sprinter','Middle Distance','Jumper'],
    key_demands: ['Max velocity sprinting mechanics','Explosive start power','Stride frequency and length','Posterior chain power'],
    strength_training: {
      frequency: '3-4x off-season, 2-3x in season',
      primary_lifts: ['Power Clean (triple extension)','Back Squat (force production)','Romanian Deadlift (hamstring power)','Hip Thrust (glute drive)','Nordic Curl (hamstring injury prevention)','Sled Push/Pull'],
      avoid: ['Upper body hypertrophy (excess mass slows sprinters)'],
    },
    conditioning: 'Short sprints: 20-60m. Resisted sprints with sled. Flying sprints. Block work for sprinters. Plyometrics: bounds, hurdle jumps.',
    mobility_priority: ['Hip flexor (stride length)','Hamstring flexibility (straight-leg running)','Ankle plantarflexion (toe-off power)'],
    injury_risks: ['Hamstring strains (highest risk in sport)','Achilles tendinopathy','Quad strains','Groin injuries'],
    periodization: 'General prep (strength): 12-16 weeks. Specific prep (speed): 8-12 weeks. Competition: maintain.'
  },
  tennis: {
    name: 'Tennis', icon: 'run', positions: ['Baseline Player','Serve-Volley','All-Court'],
    key_demands: ['Rotational power for groundstrokes','Shoulder endurance for serving','Lateral agility and change of direction','Wrist and forearm strength'],
    strength_training: {
      frequency: '2-3x in season, 3x off-season',
      primary_lifts: ['Rotational Med Ball Throw (groundstroke power)','Cable Woodchop','Overhead Press','External Rotation (rotator cuff health)','Single-Leg Squat (court coverage)','Romanian Deadlift'],
      avoid: ['Heavy chest pressing volume (anterior shoulder dominance leads to injury)'],
    },
    conditioning: 'On-court sprint and recovery drills. Lateral shuffle. 15-30s high intensity with 15-30s rest intervals.',
    mobility_priority: ['Shoulder internal and external rotation','Thoracic rotation (stroke mechanics)','Hip mobility (split step position)','Wrist mobility'],
    injury_risks: ['Tennis elbow (lateral epicondylitis)','Rotator cuff strain','Ankle sprains','Knee pain from lateral loading'],
    periodization: 'Match play: prioritize recovery and maintenance. Off-season: 8-12 weeks strength and conditioning block.'
  },
  rugby: {
    name: 'Rugby', icon: 'run', positions: ['Forward','Back','Scrum-Half'],
    key_demands: ['High-impact collision strength','Tackling and scrummaging power','Aerobic and anaerobic capacity','Neck and upper body strength'],
    strength_training: {
      frequency: '3-4x in pre-season, 2-3x in season',
      primary_lifts: ['Deadlift (total body collision strength)','Back Squat','Bench Press (rucking and scrummaging)','Barbell Row','Farmer Carry','Neck Training (critical — injury prevention)','Power Clean'],
      avoid: ['Isolation bodybuilding work — need functional strength only'],
    },
    conditioning: '400-800m repeat intervals. Field circuit conditioning. Sprint work 40-60m for backs.',
    mobility_priority: ['Neck mobility (tackling safety)','Hip mobility (low body position in scrum)','Thoracic extension','Shoulder strength and stability'],
    injury_risks: ['Concussion (highest risk)','Shoulder dislocation','Knee ligament injuries','Neck injuries','Hamstring strains'],
    periodization: 'Pre-season 10-12 weeks: strength + conditioning. In-season: 2x maintenance. Post-season: recovery + rebuild.'
  }
};
window.SportsDB = SportsDB;

/* ══════════════════════════════════════════════════════
   ENCYCLOPEDIA SCREEN + SEARCH
══════════════════════════════════════════════════════ */
reg('encyclopedia', function(data) {
  const section = (data && data.section) || 'home';

  if (section === 'mobility') return _mobilityScreen();
  if (section === 'stretching') return _stretchingScreen();
  if (section === 'warmup') return _warmupScreen();
  if (section === 'cooldown') return _cooldownScreen();
  if (section === 'sports') return _sportsScreen();
  if (section === 'search') return _encyclopediaSearch(data && data.query);

  return '<div class="topbar"><div class="topbar-title">Encyclopedia</div>' +
    '<button type="button" onclick="go(\'encyclopedia\',{section:\'search\'})" aria-label="Search encyclopedia" style="background:none;border:none;color:var(--txt3);font-size:14px;cursor:pointer;padding:0 16px;display:flex;align-items:center">' + icon('search', 18) + '</button>' +
    '</div>' +

    '<div  class="pad-16">' +
    '<div style="margin-bottom:16px;position:relative">' +
    '<span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--txt3);display:flex;pointer-events:none">' + icon('search', 16) + '</span>' +
    '<input id="enc-search" class="field" placeholder="Search encyclopedia..." oninput="if(this.value.length>1)go(\'encyclopedia\',{section:\'search\',query:this.value})" style="width:100%;box-sizing:border-box;padding-left:38px">' +
    '</div>' +

    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">' +
    [
      { section:'mobility', icon:'walk', title:'Mobility', sub:'6 joints · Drills & assessments' },
      { section:'stretching', icon:'leaf', title:'Stretching', sub:'9 muscle groups · Static & PNF' },
      { section:'warmup', icon:'flame', title:'Warmups', sub:'6 workout types · Step-by-step' },
      { section:'cooldown', icon:'moon', title:'Cooldowns', sub:'4 types · Full protocols' },
      { section:'sports', icon:'run', title:'Sports Performance', sub:'7 sports · Training systems' },
    ].map(s => '<div onclick="go(\'encyclopedia\',{section:\'' + s.section + '\'})" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:16px;cursor:pointer;touch-action:manipulation">' +
      '<div style="margin-bottom:8px;display:flex;color:var(--c1)">' + icon(s.icon, 32) + '</div>' +
      '<div style="font-size:14px;font-weight:700;color:var(--txt);margin-bottom:4px">' + esc(s.title) + '</div>' +
      '<div  class="muted-11">' + esc(s.sub) + '</div>' +
      '</div>'
    ).join('') +
    '</div></div>' +
    '<div  class="spacer-bottom"></div>';
});

function _mobilityScreen() {
  return '<div class="topbar"><button type="button" onclick="go(\'encyclopedia\')"  class="back-chip">←</button><div class="topbar-title">Mobility Encyclopedia</div></div>' +
    Object.values(MobilityDB).map(joint =>
      '<div  class="card-block">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
      '<div style="display:flex;color:var(--c1)">' + icon(joint.icon, 28) + '</div>' +
      '<div><div  class="row-title-16">' + esc(joint.name) + '</div>' +
      '<div  class="muted-11">' + esc(joint.frequency) + '</div></div>' +
      '</div>' +
      '<div style="font-size:12px;color:var(--txt2);line-height:1.6;margin-bottom:10px;background:rgba(var(--c1-rgb),0.06);padding:10px;border-radius:10px"><strong>Assessment:</strong> ' + esc(joint.assessment) + '</div>' +
      '<div style="font-size:11px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px">Drills</div>' +
      joint.drills.map(d => '<div style="padding:8px 0;border-bottom:1px solid var(--border)">' +
        '<div  class="row-title">' + esc(d.name) + ' <span style="font-size:11px;color:var(--c1);font-weight:400">' + esc(d.sets) + '</span></div>' +
        '<div  class="muted-11 mt-2">' + esc(d.cue) + '</div>' +
        '</div>').join('') +
      '</div>'
    ).join('') +
    '<div  class="spacer-bottom"></div>';
}

function _stretchingScreen() {
  return '<div class="topbar"><button type="button" onclick="go(\'encyclopedia\')"  class="back-chip">←</button><div class="topbar-title">Stretching Encyclopedia</div></div>' +
    Object.values(StretchDB).map(group =>
      '<div  class="card-block">' +
      '<div style="font-size:16px;font-weight:800;color:var(--txt);margin-bottom:12px;display:flex;align-items:center;gap:8px">' + icon(group.icon, 20) + ' ' + esc(group.name) + '</div>' +
      group.stretches.map(s => '<div style="padding:10px 0;border-bottom:1px solid var(--border)">' +
        '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">' +
        '<div  class="row-title">' + esc(s.name) + '</div>' +
        '<span style="font-size:10px;background:rgba(var(--c1-rgb),0.15);color:var(--c1);padding:2px 8px;border-radius:10px;font-weight:600;flex-shrink:0;margin-left:8px">' + esc(s.type) + '</span>' +
        '</div>' +
        '<div style="font-size:11px;color:var(--c1);margin-bottom:4px">' + esc(s.duration) + '</div>' +
        '<div  class="muted-11">' + esc(s.cue) + '</div>' +
        (s.contraindications ? '<div style="font-size:10px;color:#ff9f0a;margin-top:4px;display:flex;align-items:flex-start;gap:4px"><span style="display:flex;flex-shrink:0;margin-top:1px">' + icon('alert', 12, '#ff9f0a') + '</span>Avoid if: ' + s.contraindications.join(', ') + '</div>' : '') +
        '</div>').join('') +
      '</div>'
    ).join('') +
    '<div  class="spacer-bottom"></div>';
}

function _warmupScreen() {
  return '<div class="topbar"><button type="button" onclick="go(\'encyclopedia\')"  class="back-chip">←</button><div class="topbar-title">Warmup Protocols</div></div>' +
    Object.values(WarmupDB).map(w =>
      '<div  class="card-block">' +
      '<div class="row-between mb-12">' +
      '<div  class="row-title-16" style="display:flex;align-items:center;gap:8px">' + icon('flame', 18, 'var(--c5)') + ' ' + esc(w.name) + '</div>' +
      '<span style="font-size:11px;color:var(--c1);font-weight:600">' + esc(w.duration) + '</span>' +
      '</div>' +
      w.steps.map((step, i) => '<div style="display:flex;gap:10px;padding:7px 0;border-bottom:1px solid var(--border)">' +
        '<div style="font-size:12px;font-weight:800;color:var(--c1);width:20px;flex-shrink:0">' + (i + 1) + '</div>' +
        '<div  class="body-12">' + esc(step) + '</div>' +
        '</div>').join('') +
      '</div>'
    ).join('') +
    '<div  class="spacer-bottom"></div>';
}

function _cooldownScreen() {
  return '<div class="topbar"><button type="button" onclick="go(\'encyclopedia\')"  class="back-chip">←</button><div class="topbar-title">Cooldown Protocols</div></div>' +
    Object.values(CooldownDB).map(c =>
      '<div  class="card-block">' +
      '<div class="row-between mb-12">' +
      '<div  class="row-title-16" style="display:flex;align-items:center;gap:8px">' + icon('moon', 18) + ' ' + esc(c.name) + '</div>' +
      '<span style="font-size:11px;color:var(--c1);font-weight:600">' + esc(c.duration) + '</span>' +
      '</div>' +
      c.steps.map((step, i) => '<div style="display:flex;gap:10px;padding:7px 0;border-bottom:1px solid var(--border)">' +
        '<div style="font-size:12px;font-weight:800;color:var(--c1);width:20px;flex-shrink:0">' + (i + 1) + '</div>' +
        '<div  class="body-12">' + esc(step) + '</div>' +
        '</div>').join('') +
      '</div>'
    ).join('') +
    '<div  class="spacer-bottom"></div>';
}

function _sportsScreen() {
  return '<div class="topbar"><button type="button" onclick="go(\'encyclopedia\')"  class="back-chip">←</button><div class="topbar-title">Sports Performance</div></div>' +
    Object.values(SportsDB).map(sport =>
      '<div  class="card-block">' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">' +
      '<div style="display:flex;color:var(--c1)">' + icon(sport.icon, 32) + '</div>' +
      '<div><div  class="row-title-16">' + esc(sport.name) + '</div>' +
      '<div  class="muted-11">' + esc(sport.positions.join(' · ')) + '</div></div>' +
      '</div>' +
      '<div style="font-size:11px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px">Key Demands</div>' +
      sport.key_demands.map(d => '<div style="font-size:12px;color:var(--txt2);padding:3px 0">• ' + esc(d) + '</div>').join('') +
      '<div style="font-size:11px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:0.06em;margin:10px 0 6px">Primary Lifts</div>' +
      sport.strength_training.primary_lifts.map(l => '<span style="display:inline-block;background:rgba(var(--c1-rgb),0.12);color:var(--c1);padding:3px 8px;border-radius:8px;font-size:11px;font-weight:600;margin:2px">' + esc(l) + '</span>').join('') +
      '<div style="font-size:11px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:0.06em;margin:10px 0 6px">Conditioning</div>' +
      '<div  class="body-12">' + esc(sport.conditioning) + '</div>' +
      '<div style="font-size:11px;font-weight:700;color:#ff453a;text-transform:uppercase;letter-spacing:0.06em;margin:10px 0 6px">Injury Risks</div>' +
      sport.injury_risks.map(r => '<div style="font-size:12px;color:#ff9f0a;padding:2px 0;display:flex;align-items:flex-start;gap:4px"><span style="display:flex;flex-shrink:0;margin-top:1px">' + icon('alert', 12, '#ff9f0a') + '</span>' + esc(r) + '</div>').join('') +
      '</div>'
    ).join('') +
    '<div  class="spacer-bottom"></div>';
}

function _encyclopediaSearch(query) {
  const q = (query || '').toLowerCase().trim();
  const results = [];

  if (q.length < 2) {
    return '<div class="topbar"><button type="button" onclick="go(\'encyclopedia\')"  class="back-chip">←</button><div class="topbar-title">Search Encyclopedia</div></div>' +
      '<div  class="pad-16"><input class="field" placeholder="Type to search..." oninput="if(this.value.length>1)go(\'encyclopedia\',{section:\'search\',query:this.value})" autofocus style="width:100%;box-sizing:border-box"></div>';
  }

  Object.entries(MobilityDB).forEach(([key, joint]) => {
    if (joint.name.toLowerCase().includes(q) || joint.drills.some(d => d.name.toLowerCase().includes(q))) {
      results.push({ type: 'Mobility', icon: joint.icon, title: joint.name + ' Mobility', sub: joint.drills.length + ' drills', action: "go('encyclopedia',{section:'mobility'})" });
    }
  });

  Object.entries(StretchDB).forEach(([key, group]) => {
    if (group.name.toLowerCase().includes(q) || group.stretches.some(s => s.name.toLowerCase().includes(q))) {
      results.push({ type: 'Stretching', icon: group.icon, title: group.name + ' Stretches', sub: group.stretches.length + ' stretches', action: "go('encyclopedia',{section:'stretching'})" });
    }
  });

  Object.entries(SportsDB).forEach(([key, sport]) => {
    if (sport.name.toLowerCase().includes(q) || sport.key_demands.some(d => d.toLowerCase().includes(q)) || sport.strength_training.primary_lifts.some(l => l.toLowerCase().includes(q))) {
      results.push({ type: 'Sports', icon: sport.icon, title: sport.name, sub: sport.key_demands[0], action: "go('encyclopedia',{section:'sports'})" });
    }
  });

  Object.entries(WarmupDB).forEach(([key, w]) => {
    if (w.name.toLowerCase().includes(q) || w.steps.some(s => s.toLowerCase().includes(q))) {
      results.push({ type: 'Warmup', icon: 'flame', title: w.name, sub: w.duration, action: "go('encyclopedia',{section:'warmup'})" });
    }
  });

  return '<div class="topbar"><button type="button" onclick="go(\'encyclopedia\')"  class="back-chip">←</button><div class="topbar-title">Search Results</div></div>' +
    '<div style="padding:16px 16px 8px"><input class="field" value="' + esc(query) + '" placeholder="Search..." oninput="if(this.value.length>1)go(\'encyclopedia\',{section:\'search\',query:this.value})" style="width:100%;box-sizing:border-box"></div>' +
    (!results.length ? '<div style="padding:40px 20px;text-align:center;color:var(--txt3)">No results for "' + esc(query) + '"<br><span style="font-size:12px">Try: shoulder, cricket, hamstring, warmup</span></div>' :
      '<div style="font-size:12px;color:var(--txt3);padding:0 16px 10px">' + results.length + ' results</div>' +
      results.map(r => '<div onclick="' + r.action + '" style="margin:0 16px 10px;background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:14px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:12px">' +
        '<div style="display:flex;color:var(--c1)">' + icon(r.icon, 28) + '</div>' +
        '<div  class="flex-1"><div  class="row-title">' + esc(r.title) + '</div>' +
        '<div  class="muted-11">' + esc(r.type) + ' · ' + esc(r.sub) + '</div></div>' +
        '<div style="font-size:16px;color:var(--txt3)">›</div>' +
        '</div>').join('')
    ) +
    '<div  class="spacer-bottom"></div>';
}
