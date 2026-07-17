'use strict';
/* ── PulseCap — Calisthenics Skill Progressions ── */

var CALIS_SKILLS = {
  pullup: {
    id:'pullup', name:'Pull-Up', icon:'dumbbell',
    description:'The foundation of upper body pulling strength. Progress from zero to 20 reps through a systematic dead hang, assisted, and loaded progression.',
    prerequisites:'None. Start from scratch with dead hangs.',
    muscles:['Latissimus dorsi','Biceps brachii','Posterior deltoid','Rhomboids','Teres major'],
    tip:'Grip the bar with thumbs wrapped (monkey grip ok early on). Think about pulling elbows to hips — not arms to bar.',
    levels:[
      { name:'Dead Hang', description:'10-30 second dead hang — builds grip, shoulder stability, and lat activation' },
      { name:'Scapular Pull-Up', description:'3x8 scapular pull-ups — depress shoulders while hanging to initiate lat activation' },
      { name:'Band-Assisted Pull-Up (Heavy)', description:'3x8 with heavy resistance band — develop full range motion with support' },
      { name:'Negative Pull-Up', description:'3x5 negative pull-ups with 5-second controlled descent — eccentric strength is key' },
      { name:'First Pull-Up (1-3 reps)', description:'Milestone achieved — complete pull-up from dead hang to chin over bar' },
      { name:'5 Strict Pull-Ups', description:'3 sets of 5 strict pull-ups — no kipping, full dead hang each rep' },
      { name:'10 Pull-Ups', description:'3 sets of 10 strict pull-ups — solid pulling base established' },
      { name:'15 Pull-Ups', description:'15 consecutive pull-ups or weighted/archer variations for continued progression' },
      { name:'20 Pull-Ups', description:'Elite level — 20 consecutive strict pull-ups or advanced variations' }
    ]
  },
  muscleup: {
    id:'muscleup', name:'Muscle-Up', icon:'run',
    description:'The muscle-up combines a pull-up with a dip transition above the bar. Requires explosive pulling strength and precise technique. One of calisthenics most coveted skills.',
    prerequisites:'10+ strict pull-ups, 10+ parallel bar dips.',
    muscles:['Latissimus dorsi','Biceps brachii','Triceps brachii','Anterior deltoid','Core stabilisers'],
    tip:'The transition (false grip or hip whip) is the crux. Master the pull-to-chest phase before attempting the transition.',
    levels:[
      { name:'10 Pull-Ups Required', description:'Prerequisite: 10 strict pull-ups and 10 dips with good form before beginning muscle-up progression' },
      { name:'Explosive Pull-Up (to chest)', description:'3x5 explosive pull-ups pulling to nipple line — build the power for transition' },
      { name:'Chest-to-Bar Pull-Up', description:'3x5 chest-to-bar pull-ups where bar touches sternum — maximal range pull' },
      { name:'Muscle-Up Negative', description:'3x3 muscle-up negatives — start in support position above bar, slow descent through transition' },
      { name:'Jumping Muscle-Up', description:'3x5 jumping muscle-ups — use legs to assist through the transition phase' },
      { name:'First Kipping Muscle-Up', description:'Achieve first muscle-up using hip drive for momentum — technique milestone' },
      { name:'First Strict Muscle-Up', description:'Milestone — strict muscle-up from dead hang with no momentum, controlled transition' },
      { name:'5 Strict Muscle-Ups', description:'5 consecutive strict muscle-ups — elite pulling strength and technique' }
    ]
  },
  handstand: {
    id:'handstand', name:'Handstand', icon:'target',
    description:'The handstand develops total body pressing strength, balance, and spatial awareness. Progress from wall-supported holds to freestanding balance.',
    prerequisites:'Good wrist mobility and shoulder stability. Wrist conditioning essential before starting.',
    muscles:['Anterior deltoid','Triceps brachii','Serratus anterior','Core (transverse abdominis)','Wrist extensors'],
    tip:'Spread fingers wide and grip the floor for balance. Push the floor away — active shoulders are essential. Stack joints: wrists, elbows, shoulders, hips, ankles.',
    levels:[
      { name:'Wrist Conditioning', description:'Wrist circles, compression, prayer stretches — 5 minutes daily before any handstand work' },
      { name:'Pike Push-Up Hold (30s)', description:'Hold the top of a pike push-up position — builds shoulder pressing strength base' },
      { name:'Wall Handstand Kick-Up (10-20s)', description:'Kick up to wall handstand facing wall, hold 10-20 seconds — begins inversion adaptation' },
      { name:'Wall Handstand Hold (30-60s)', description:'Solid wall handstand hold 30-60 seconds facing wall with hollow body' },
      { name:'Wall Handstand Shoulder Taps', description:'60s wall hold plus shoulder taps — begins weight shift and single-arm loading' },
      { name:'Free Balance Attempts (5s)', description:'First freestanding kick-up attempts — 5 seconds of free balance counts as a win' },
      { name:'Freestanding Handstand (10s)', description:'Milestone — 10 second freestanding handstand with consistent kicks-up success' },
      { name:'Freestanding Handstand (30s)', description:'30 second freestanding handstand — controlled balance with minimal wall touching' },
      { name:'Freestanding Handstand (60s)', description:'Elite level — 60 seconds freestanding, full control and consistent balance' }
    ]
  },
  lsit: {
    id:'lsit', name:'L-Sit', icon:'ruler',
    description:'The L-sit builds extraordinary hip flexor strength and compression. Performed on parallettes, rings, or floor. Develops the core and hip flexors needed for more advanced skills.',
    prerequisites:'Hip flexor and core strength. Begin with seated leg raises to build compression strength.',
    muscles:['Psoas major','Iliacus','Rectus femoris','Rectus abdominis','Transverse abdominis','Triceps (for support)'],
    tip:'Press hands actively into the surface. Lean forward slightly to create space. Squeeze quads hard and point toes. Hip flexor strength is the limiting factor — train it directly.',
    levels:[
      { name:'Seated Leg Raises', description:'3x10 seated leg raises — builds hip flexor and compression strength baseline' },
      { name:'Tuck L-Sit (5s)', description:'5 second tuck L-sit on floor with both knees bent to chest — first compression hold' },
      { name:'Tuck L-Sit on Parallettes (10s)', description:'10 second tuck L-sit on parallettes or dip bars — clears hips off ground' },
      { name:'One-Leg Extended L-Sit (10s)', description:'10 seconds each side with one leg extended, one tucked — progressive hip flexor load' },
      { name:'Full L-Sit (5s)', description:'Milestone — 5 second full L-sit with both legs parallel to floor, fully extended' },
      { name:'Full L-Sit (10s)', description:'10 second full L-sit — solid compression hold with active shoulders' },
      { name:'Full L-Sit (30s)', description:'Elite level — 30 second full L-sit, controlled and consistent' }
    ]
  },
  front_lever: {
    id:'front_lever', name:'Front Lever', icon:'dna',
    description:'The front lever is a horizontal hold from a bar with body completely straight and parallel to the floor. Demands exceptional lat and core strength. A true calisthenics elite skill.',
    prerequisites:'12+ pull-ups and good straight-arm strength required. Not recommended for beginners.',
    muscles:['Latissimus dorsi','Teres major','Serratus anterior','Core (rectus abdominis)','Posterior deltoid'],
    tip:'Think about depressing and retracting your scapulae while actively pushing the bar toward your hips. Core must be rigidly braced. Begin every progression with maximum scapular depression.',
    levels:[
      { name:'Dead Hang with Scapular Depression', description:'3x10 scapular depressions from dead hang — teaches lat activation in straight-arm position' },
      { name:'Tuck Front Lever (10s)', description:'10 second tuck front lever — both knees fully tucked to chest, body horizontal' },
      { name:'Advanced Tuck Front Lever (10s)', description:'10 seconds — hips at 90 degrees, slightly below horizontal, back flat' },
      { name:'One-Leg Front Lever (10s)', description:'10 seconds each side with one leg extended horizontally, one tucked' },
      { name:'Straddle Front Lever (10s)', description:'10 second straddle front lever with legs wide apart — reduced lever from full' },
      { name:'Full Front Lever (5s)', description:'Milestone — 5 second full front lever, body perfectly horizontal and straight' },
      { name:'Full Front Lever (10s)', description:'Elite level — 10 second full front lever with solid control' }
    ]
  },
  planche: {
    id:'planche', name:'Planche', icon:'target',
    description:'The planche is a horizontal push hold where the body is parallel to the floor supported by straight arms only. The hardest static pushing skill in calisthenics. Requires years of training.',
    prerequisites:'Strong pushing base (20+ push-ups, dips), extensive wrist conditioning, serratus anterior strength.',
    muscles:['Anterior deltoid','Serratus anterior','Transverse abdominis','Wrist flexors','Pectoralis major','Triceps'],
    tip:'Wrist conditioning is non-negotiable — dedicate weeks to it before loading. The lean is everything: shift shoulders forward over wrists until toes lift. Protract scapulae maximally.',
    levels:[
      { name:'Wrist Conditioning & Pseudo-Planche Lean', description:'Daily wrist prep + pseudo-planche lean 3x10s — hands rotated out, lean forward until toes barely touch floor' },
      { name:'Tuck Planche (5s)', description:'5 second tuck planche — both knees on chest, fully lifted off ground, protracted scapulae' },
      { name:'Advanced Tuck Planche (10s)', description:'10 seconds — hips slightly below body line, back flat, maximum scapular protraction' },
      { name:'Straddle Planche (5s)', description:'5 second straddle planche with legs wide — reduces moment arm from full planche' },
      { name:'Full Planche (3s)', description:'Milestone — 3 second full planche, body horizontal, legs together, completely straight' },
      { name:'Full Planche (10s)', description:'Elite level — 10 second full planche, controlled entry and hold' }
    ]
  },
  pistol_squat: {
    id:'pistol_squat', name:'Pistol Squat', icon:'walk',
    description:'A single-leg squat to full depth with the non-working leg held straight forward. Tests unilateral quad strength, ankle mobility, hip flexor flexibility, and balance simultaneously.',
    prerequisites:'Good ankle dorsiflexion, hip flexor flexibility, and single-leg balance. Address mobility before strength.',
    muscles:['Quadriceps (all heads)','Gluteus maximus','Gluteus medius','Tibialis anterior','Hip flexors (for free leg)'],
    tip:'Ankle mobility is often the limiting factor — work on dorsiflexion daily. Box pistols remove the balance element initially. Drive the knee out to prevent cave. Counterbalance with arms forward.',
    levels:[
      { name:'Single-Leg Box Squat', description:'3x8 single-leg box squats — sit to a high box and stand on one leg' },
      { name:'Assisted Pistol Squat', description:'3x8 holding a band or post for balance — full range of motion with support' },
      { name:'Partial Pistol Squat', description:'3x5 pistols to half depth — builds strength through increasing range progressively' },
      { name:'Full Pistol Squat (1 rep)', description:'Milestone — 1 complete pistol squat each side to full depth and back up' },
      { name:'5 Pistol Squats Each Side', description:'5 consecutive pistol squats per leg — strength and balance established' },
      { name:'Weighted Pistol Squat', description:'Pistol squat with added load (dumbbell goblet or vest) — advanced strength development' }
    ]
  },
  human_flag: {
    id:'human_flag', name:'Human Flag', icon:'bandage',
    description:'A lateral hold where the body is horizontal against a vertical pole. Requires extraordinary lateral core, oblique, and lat strength. A true crowd-stopper skill.',
    prerequisites:'Very strong lateral core, obliques, and lat strength. Side planks and lateral carries essential.',
    muscles:['External oblique','Internal oblique','Latissimus dorsi','Quadratus lumborum','Gluteus medius','Serratus anterior'],
    tip:'The top arm pushes — the bottom arm pulls. Think of it as a lateral side plank in the air. Build side plank duration to 3+ minutes before attempting. Use a thick vertical pole or gymnastics post.',
    levels:[
      { name:'Vertical Pole Side Plank', description:'Side plank on a vertical pole (feet on floor) — 3x30s each side, builds the movement pattern' },
      { name:'Tuck Human Flag Attempt (2s)', description:'First tuck human flag attempt — knees tucked to chest, hold 2 seconds off the ground' },
      { name:'Tuck Human Flag (5s)', description:'5 second tuck human flag — comfortable tucked position with consistent entry' },
      { name:'Straddle Human Flag (3s)', description:'3 second straddle human flag — legs wide apart, significant achievement' },
      { name:'Full Human Flag (2s)', description:'Milestone — 2 second full human flag, legs together, body completely horizontal' },
      { name:'Full Human Flag (5s)', description:'Elite level — 5 second full human flag with controlled entry and exit' }
    ]
  }
};

/* ── CALISTHENICS SCREEN ── */
reg('calisthenics', function() {
  var userSkills = S.g('calisthenics') || {};

  return '<div class="topbar"><div class="topbar-title">Calisthenics Skills</div></div>' +
    sh('Skill Progressions') +
    '<div  class="pad-x-16">' +
    Object.values(CALIS_SKILLS).map(function(skill) {
      var userLevel = userSkills[skill.id] || 0;
      var totalLevels = skill.levels.length - 1;
      var pct = Math.round((userLevel / totalLevels) * 100);
      var currentLevel = skill.levels[userLevel] || skill.levels[0];
      var nextLevel = skill.levels[userLevel + 1];

      return '<div onclick="showSkillDetail(\'' + skill.id + '\')" style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px;margin-bottom:10px;cursor:pointer;touch-action:manipulation">' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">' +
        '<div style="display:flex;color:var(--c1)">' + icon(skill.icon, 28) + '</div>' +
        '<div  class="flex-1">' +
        '<div  class="row-title-15">' + skill.name + '</div>' +
        '<div  class="muted-12">Level ' + userLevel + '/' + totalLevels + ' · ' + pct + '% complete</div>' +
        '</div>' +
        (pct === 100 ? '<div style="display:flex;color:var(--c1)">' + icon('gradcap', 20) + '</div>' : '<div style="color:var(--txt3);font-size:18px">›</div>') +
        '</div>' +
        '<div style="height:4px;background:var(--bg4);border-radius:2px;margin-bottom:8px;overflow:hidden">' +
        '<div style="width:' + pct + '%;height:100%;background:var(--grad);border-radius:2px;transition:width 0.8s ease"></div>' +
        '</div>' +
        '<div style="font-size:12px;color:var(--c1);font-weight:600">Current: ' + currentLevel.name + '</div>' +
        (nextLevel ? '<div  class="muted-11 mt-2">Next: ' + nextLevel.name + '</div>' : '') +
        '</div>';
    }).join('') +
    '</div><div  class="spacer-bottom"></div>';
});

window.showSkillDetail = function(skillId) {
  var skill = CALIS_SKILLS[skillId];
  if (!skill) return;
  var userSkills = S.g('calisthenics') || {};
  var userLevel = userSkills[skillId] || 0;

  modal('<span style="display:inline-flex;align-items:center;gap:8px">' + icon(skill.icon, 20) + ' ' + esc(skill.name) + '</span>',
    '<div style="font-size:13px;color:var(--txt2);line-height:1.6;margin-bottom:12px">' + skill.description + '</div>' +
    '<div  class="type-caption type-caption-mb-xs">Prerequisites</div>' +
    '<div style="font-size:12px;color:var(--txt2);margin-bottom:12px">' + skill.prerequisites + '</div>' +
    '<div  class="type-caption type-caption-mb-xs">Key Muscles</div>' +
    '<div style="font-size:12px;color:var(--txt2);margin-bottom:12px">' + skill.muscles.join(', ') + '</div>' +
    '<div style="font-size:10px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">Progression Levels</div>' +
    skill.levels.map(function(lvl, i) {
      var isDone = i < userLevel;
      var isCurrent = i === userLevel;
      return '<div style="display:flex;gap:10px;padding:8px 0;border-bottom:1px solid var(--border);opacity:' + (i > userLevel + 1 ? '0.4' : '1') + '">' +
        '<div style="width:24px;height:24px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;background:' + (isDone ? '#30d158' : isCurrent ? 'var(--c1)' : 'var(--bg4)') + ';color:' + (isDone || isCurrent ? '#000' : 'var(--txt3)') + '">' +
        (isDone ? '✓' : (i + 1)) + '</div>' +
        '<div  class="flex-1">' +
        '<div style="font-size:13px;font-weight:' + (isCurrent ? '700' : '500') + ';color:' + (isCurrent ? 'var(--txt)' : 'var(--txt2)') + '">' + lvl.name + '</div>' +
        '<div  class="muted-11">' + lvl.description + '</div>' +
        (isCurrent ? '<div style="margin-top:4px;font-size:11px;color:var(--c1);font-weight:600">← Current level</div>' : '') +
        '</div></div>';
    }).join('') +
    '<div style="margin-top:14px;font-size:10px;color:var(--txt3);font-style:italic">Training tip: ' + skill.tip + '</div>',
    '<div  class="flex-gap-8">' +
    (userLevel < skill.levels.length - 1 ?
      '<button type="button" class="btn btn-primary flex-1"  onclick="levelUpSkill(\'' + skillId + '\');closeModal()" style="display:flex;align-items:center;justify-content:center;gap:6px">' + icon('check', 16) + ' Level ' + userLevel + ' Complete</button>' :
      '<button type="button" class="btn btn-primary flex-1"  disabled style="display:flex;align-items:center;justify-content:center;gap:6px">' + icon('gradcap', 16) + ' Mastered!</button>') +
    '<button type="button" class="btn btn-ghost" onclick="closeModal()">Close</button>' +
    '</div>'
  );
};

window.levelUpSkill = function(skillId) {
  var skill = CALIS_SKILLS[skillId];
  if (!skill) return;
  var userSkills = S.g('calisthenics') || {};
  var current = userSkills[skillId] || 0;
  if (current >= skill.levels.length - 1) return;
  userSkills[skillId] = current + 1;
  S.set('calisthenics', userSkills);
  var nextLevel = skill.levels[current + 1];
  toast('Level up! Now: ' + nextLevel.name, 'ok');
  if (current + 1 >= skill.levels.length - 1) {
    setTimeout(function() { toast(skill.name + ' mastered!', 'ok'); }, 1000);
  }
  go('calisthenics');
};
