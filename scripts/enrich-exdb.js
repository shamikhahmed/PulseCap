'use strict';
/* Enrich EXERCISE_DB: joints, patterns, substitutions, plyo reclass, sports, MET notes. */
const fs = require('fs');
const path = require('path');
const { emit } = require('./extract-exdb.js');

const DB_PATH = path.join(__dirname, '..', 'js/data/exercise-db.js');
const JOINTS = ['shoulder', 'elbow', 'knee', 'spine', 'hip', 'wrist', 'neck', 'ankle'];
const PATTERNS = [
  'horizontal_push', 'vertical_push', 'horizontal_pull', 'vertical_pull',
  'hinge', 'squat', 'lunge', 'carry', 'core', 'isolation', 'conditioning'
];

function load() {
  const src = fs.readFileSync(DB_PATH, 'utf8');
  const start = src.indexOf('[');
  const end = src.lastIndexOf(']');
  return Function('"use strict"; return ' + src.slice(start, end + 1))();
}

function write(rows) {
  fs.writeFileSync(DB_PATH, emit(rows));
}

function max(a, b) { return Math.max(Number(a) || 0, Number(b) || 0); }

function rateJoints(ex) {
  const n = String(ex.n || '').toLowerCase();
  const g = String(ex.grp || '').toLowerCase();
  const eq = (ex.eq || []).map(function(t) { return String(t).toLowerCase(); });
  const j = {
    shoulder: Number(ex.joint && ex.joint.shoulder) || 0,
    elbow: Number(ex.joint && ex.joint.elbow) || 0,
    knee: Number(ex.joint && ex.joint.knee) || 0,
    spine: Number(ex.joint && ex.joint.spine) || 0,
    hip: Number(ex.joint && ex.joint.hip) || 0,
    wrist: 0, neck: 0, ankle: 0
  };

  /* Wrist — conservative. Front squat, upright row, floor push-ups, heavy barbell pressing. */
  const floorPush = /push-up|push up/.test(n) && !/wall/.test(n);
  if (/wall push/.test(n)) {
    j.wrist = 1;
  } else if (/front squat|upright row|wrist curl|skull crusher|handstand|clean|snatch|jerk|sissy squat|planche/.test(n) || floorPush) {
    j.wrist = 3;
  } else if ((eq.indexOf('barbell') >= 0 && /press|curl|row|bench/.test(n)) || /close-grip|farmer|plate pinch|dip/.test(n)) {
    j.wrist = 2;
  } else if (/press|curl|row|pushdown|fly|raise|pulldown/.test(n)) {
    j.wrist = 1;
  }

  /* Neck — behind-neck and heavy shrugs load it. */
  if (/behind.?neck|upright row/.test(n)) {
    j.neck = 3;
  } else if (/shrug|overhead press|push press|military|ohp|face pull|neck/.test(n)) {
    j.neck = 2;
  } else if (/pulldown|pull-up|pull up|chin|row/.test(n)) {
    j.neck = 1;
  }

  /* Ankle — jumps, standing calves, lunges. */
  if (/box jump|depth jump|jump rope|skip|standing calf|running|sprint|lunge|bound|lateral bound|plyo/.test(n) || g === 'plyometrics') {
    j.ankle = 3;
  } else if (/squat|step-up|step up|deadlift|walk|carry|farmer|calf/.test(n)) {
    j.ankle = 2;
  } else if (g === 'legs' || g === 'cardio' || g === 'sports') {
    j.ankle = 1;
  }

  JOINTS.forEach(function(k) { if (j[k] == null) j[k] = 0; });
  return j;
}

function inferPattern(ex) {
  const n = String(ex.n || '').toLowerCase();
  const g = String(ex.grp || '');
  if (g === 'cardio' || g === 'sports' || g === 'plyometrics' || /bike|rowing machine|run|swim|jump rope|assault|stair|elliptical|skip/.test(n)) return 'conditioning';
  if (g === 'core' || /plank|crunch|pallof|dead bug|hollow|dragon flag|leg raise|russian twist|ab wheel/.test(n)) return 'core';
  if (/farmer|carry|suitcase|waiter|overhead carry/.test(n)) return 'carry';
  if (/lunge|split squat|step-up|step up|bulgarian|walking lunge/.test(n)) return 'lunge';
  if (/deadlift|rdl|romanian|good morning|hip thrust|glute bridge|hyperextension|swing|pull-through|back extension/.test(n)) return 'hinge';
  if (/squat|leg press|hack|sissy/.test(n)) return 'squat';
  if (/pulldown|pull-up|pull up|chin-up|chin up|pullover|straight-arm|lat pullover/.test(n)) return 'vertical_pull';
  if (/row|face pull|rear delt|meadows/.test(n)) return 'horizontal_pull';
  if (/overhead|shoulder press|push press|arnold|military|handstand|pike push|landmine press/.test(n) && !/bench/.test(n)) return 'vertical_push';
  if (/bench|push-up|push up|dip|chest press|fly|crossover|pec deck|svend/.test(n)) return 'horizontal_push';
  if (g === 'biceps' || g === 'triceps' || g === 'forearms' || g === 'warmup' || g === 'warmup_drills' || /curl|extension|raise|shrug|calf|wrist/.test(n)) return 'isolation';
  if (g === 'fullbody') return 'conditioning';
  return 'isolation';
}

function slug(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function resolveName(rows, byName, name) {
  if (!name) return null;
  if (byName[name]) return byName[name];
  const low = name.toLowerCase();
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].n.toLowerCase() === low) return rows[i];
  }
  return null;
}

function fillSubs(rows) {
  const byName = Object.create(null);
  rows.forEach(function(ex) { byName[ex.n] = ex; });
  const byPattern = Object.create(null);
  rows.forEach(function(ex) {
    const p = ex.pattern;
    if (!byPattern[p]) byPattern[p] = [];
    byPattern[p].push(ex);
  });

  rows.forEach(function(ex) {
    function exists(n) { return !!resolveName(rows, byName, n); }
    let regs = (ex.regressions || []).filter(exists);
    let progs = (ex.progressions || []).filter(exists);
    const pool = (byPattern[ex.pattern] || []).filter(function(o) { return o.n !== ex.n; });
    function add(list, candidate) {
      if (!candidate || candidate.n === ex.n) return;
      if (list.indexOf(candidate.n) >= 0) return;
      if (regs.indexOf(candidate.n) >= 0 || progs.indexOf(candidate.n) >= 0) return;
      list.push(candidate.n);
    }
    pool.sort(function(a, b) {
      const ae = JSON.stringify(a.eq) === JSON.stringify(ex.eq) ? 1 : 0;
      const be = JSON.stringify(b.eq) === JSON.stringify(ex.eq) ? 1 : 0;
      return ae - be;
    });
    for (let i = 0; i < pool.length && (regs.length + progs.length) < 2; i++) {
      if (regs.length <= progs.length) add(regs, pool[i]);
      else add(progs, pool[i]);
    }
    ex.regressions = regs;
    ex.progressions = progs;
  });
}

const SPORTS = [
  { n: 'Cricket — Batting', grp: 'sports', pri: 'Rotation / Core', sec: 'Shoulders, Forearms',
    cues: 'Stay side-on, watch the ball, rotate through the hips not the lumbar spine.',
    setup: 'Bat or stick, athletic stance. Educational session structure, not coaching certification.',
    breathing: 'Exhale through the swing', mistakes: 'Arm-only swing, collapsing front side',
    met: 4.8, metSource: 'CPA 2011 15200 cricket, batting', sessionNote: 'Nets 20–40 min. Shoulder-friendly if you skip behind-neck work the same day.',
    muscles: { primary: ['core'], secondary: ['shoulders', 'forearms'] }, eq: [], bw: true, pattern: 'conditioning',
    joint: { shoulder: 2, elbow: 1, knee: 1, spine: 2, hip: 1, wrist: 2, neck: 1, ankle: 1 }, cns: 2, diff: 1,
    regressions: ['Pallof Press'], progressions: ['Medicine Ball Rotational Throw'] },
  { n: 'Cricket — Bowling', grp: 'sports', pri: 'Shoulder / Core', sec: 'Hips, Spine',
    cues: 'Long bound, brace the front leg, keep the bowling shoulder stacked. Stop on sharp shoulder pain.',
    setup: 'Run-up space. Educational — not a bowling coach.',
    breathing: 'Brace at front-foot plant', mistakes: 'Collapsing front leg, throwing with the arm only',
    met: 5.0, metSource: 'CPA 2011 15210 cricket, bowling (estimate aligned to fielding/bowling codes)', sessionNote: 'Cap volume. Face pulls and band work after.',
    muscles: { primary: ['shoulders'], secondary: ['core', 'hips'] }, eq: [], bw: true, pattern: 'conditioning',
    joint: { shoulder: 3, elbow: 2, knee: 2, spine: 2, hip: 2, wrist: 1, neck: 2, ankle: 2 }, cns: 3, diff: 2,
    regressions: ['Band Pull-Aparts'], progressions: ['Medicine Ball Chest Pass'] },
  { n: 'Cricket — Fielding', grp: 'sports', pri: 'Conditioning', sec: 'Legs, Core',
    cues: 'Stay low, short steps, two hands to the ball when you can.',
    setup: 'Open ground or nets. Educational.',
    breathing: 'Steady', mistakes: 'Stiff knees on pick-up',
    met: 4.8, metSource: 'CPA 2011 15200 cricket', sessionNote: 'Mix catching and short sprints. Skip if ankle is flared.',
    muscles: { primary: ['full_body'], secondary: ['core'] }, eq: [], bw: true, pattern: 'conditioning',
    joint: { shoulder: 1, elbow: 0, knee: 2, spine: 1, hip: 1, wrist: 1, neck: 0, ankle: 2 }, cns: 2, diff: 1,
    regressions: ['Walking Lunge'], progressions: ['Lateral Bound'] },
  { n: 'Badminton', grp: 'sports', pri: 'Shoulders / Calves', sec: 'Core',
    cues: 'Split-step, racket up early, land softly.', setup: 'Court or backyard. Educational.',
    breathing: 'Exhale on smash', mistakes: 'Locked elbow on smash',
    met: 5.5, metSource: 'CPA 2011 15030 badminton, general', sessionNote: 'Singles is harder than doubles.',
    muscles: { primary: ['shoulders'], secondary: ['calves', 'core'] }, eq: [], bw: true, pattern: 'conditioning',
    joint: { shoulder: 2, elbow: 2, knee: 2, spine: 1, hip: 1, wrist: 2, neck: 1, ankle: 3 }, cns: 2, diff: 1,
    regressions: ['Shadow Badminton Footwork'], progressions: ['Box Jump'] },
  { n: 'Squash', grp: 'sports', pri: 'Conditioning', sec: 'Legs, Shoulders',
    cues: 'Short steps, racket preparation, do not over-extend the wrist.',
    setup: 'Court. Educational.', breathing: 'Steady between points', mistakes: 'Diving for every ball',
    met: 12.0, metSource: 'CPA 2011 15620 squash', sessionNote: 'Very hard. Treat as HIIT, not a warm-up.',
    muscles: { primary: ['full_body'], secondary: ['legs'] }, eq: [], bw: true, pattern: 'conditioning',
    joint: { shoulder: 2, elbow: 2, knee: 2, spine: 1, hip: 2, wrist: 3, neck: 1, ankle: 3 }, cns: 3, diff: 2,
    regressions: ['Badminton'], progressions: ['Interval Run'] },
  { n: 'Tennis', grp: 'sports', pri: 'Shoulders / Legs', sec: 'Core, Wrist',
    cues: 'Unit turn, wide base, stop on elbow pain (tennis elbow is common).',
    setup: 'Court. Educational.', breathing: 'Exhale on contact', mistakes: 'Wristy forehand',
    met: 7.3, metSource: 'CPA 2011 15675 tennis, general', sessionNote: 'Singles ~7–8 MET. Ice the elbow if it niggles.',
    muscles: { primary: ['shoulders'], secondary: ['legs', 'core'] }, eq: [], bw: true, pattern: 'conditioning',
    joint: { shoulder: 2, elbow: 3, knee: 2, spine: 1, hip: 1, wrist: 2, neck: 1, ankle: 2 }, cns: 2, diff: 1,
    regressions: ['Table Tennis'], progressions: ['Squash'] },
  { n: 'Table Tennis', grp: 'sports', pri: 'Forearms / Core', sec: 'Calves',
    cues: 'Stay on the balls of the feet, compact stroke.', setup: 'Table. Educational.',
    breathing: 'Steady', mistakes: 'Arming every ball',
    met: 4.0, metSource: 'CPA 2011 15660 table tennis', sessionNote: 'Low impact. Good active recovery.',
    muscles: { primary: ['forearms'], secondary: ['core'] }, eq: [], bw: true, pattern: 'conditioning',
    joint: { shoulder: 1, elbow: 1, knee: 1, spine: 0, hip: 0, wrist: 2, neck: 0, ankle: 1 }, cns: 1, diff: 1,
    regressions: ['Band Pull-Aparts'], progressions: ['Tennis'] },
  { n: 'Volleyball', grp: 'sports', pri: 'Shoulders / Legs', sec: 'Core',
    cues: 'Bend the knees before you jump. Land softly. No behind-neck hitting drills if the shoulder is sore.',
    setup: 'Court. Educational.', breathing: 'Exhale on contact', mistakes: 'Landing with locked knees',
    met: 4.0, metSource: 'CPA 2011 15710 volleyball, non-competitive', sessionNote: 'Competitive play is higher (~6–8 MET).',
    muscles: { primary: ['shoulders'], secondary: ['legs'] }, eq: [], bw: true, pattern: 'conditioning',
    joint: { shoulder: 3, elbow: 1, knee: 2, spine: 1, hip: 1, wrist: 2, neck: 1, ankle: 3 }, cns: 2, diff: 1,
    regressions: ['Wall Push-Up'], progressions: ['Box Jump'] },
  { n: 'Field Hockey', grp: 'sports', pri: 'Conditioning', sec: 'Hips, Core',
    cues: 'Stay low on the stick, short steps, watch the ball.', setup: 'Pitch. Educational.',
    breathing: 'Steady', mistakes: 'Rounded lumbar while dribbling',
    met: 8.0, metSource: 'CPA 2011 15300 field hockey', sessionNote: 'High running volume.',
    muscles: { primary: ['full_body'], secondary: ['hips'] }, eq: [], bw: true, pattern: 'conditioning',
    joint: { shoulder: 1, elbow: 1, knee: 2, spine: 2, hip: 2, wrist: 2, neck: 0, ankle: 2 }, cns: 2, diff: 1,
    regressions: ['Road Running'], progressions: ['Football/Soccer'] },
  { n: 'Road Running', grp: 'sports', pri: 'Conditioning', sec: 'Calves, Quads',
    cues: 'Easy conversational pace unless this is an interval day. Land quietly.',
    setup: 'Road or track. Educational.', breathing: 'Nasal if easy', mistakes: 'Heel slamming, too much too soon',
    met: 9.8, metSource: 'CPA 2011 12050 running, 6 mph (10 min/mile)', sessionNote: 'Estimate assumes ~10 min/mile. Walk breaks are fine.',
    muscles: { primary: ['calves'], secondary: ['quads', 'glutes'] }, eq: [], bw: true, pattern: 'conditioning',
    joint: { shoulder: 0, elbow: 0, knee: 2, spine: 1, hip: 1, wrist: 0, neck: 0, ankle: 3 }, cns: 2, diff: 1,
    regressions: ['Treadmill Incline Walk'], progressions: ['Trail Running'] },
  { n: 'Trail Running', grp: 'sports', pri: 'Conditioning', sec: 'Ankles, Hips',
    cues: 'Shorten the stride on descents. Eyes up.', setup: 'Trail. Educational.',
    breathing: 'Steady', mistakes: 'Overstriding downhill',
    met: 9.0, metSource: 'CPA 2011 12170 running, cross country', sessionNote: 'Uneven ground loads the ankle more than the road.',
    muscles: { primary: ['calves'], secondary: ['hips'] }, eq: [], bw: true, pattern: 'conditioning',
    joint: { shoulder: 0, elbow: 0, knee: 2, spine: 1, hip: 2, wrist: 0, neck: 0, ankle: 3 }, cns: 2, diff: 2,
    regressions: ['Road Running'], progressions: ['Hiking'] },
  { n: 'Outdoor Cycling', grp: 'sports', pri: 'Conditioning', sec: 'Quads, Calves',
    cues: 'Easy spin unless climbing. Keep a slight bend in the elbows.',
    setup: 'Bike, helmet. Educational.', breathing: 'Steady', mistakes: 'Mashing a huge gear',
    met: 8.0, metSource: 'CPA 2011 01015 bicycling, 12-13.9 mph, leisure', sessionNote: 'Estimate for a moderate road ride.',
    muscles: { primary: ['quads'], secondary: ['calves'] }, eq: [], bw: true, pattern: 'conditioning',
    joint: { shoulder: 1, elbow: 1, knee: 2, spine: 1, hip: 1, wrist: 2, neck: 1, ankle: 1 }, cns: 2, diff: 1,
    regressions: ['Stationary Bike'], progressions: ['Road Running'] },
  { n: 'Boxing', grp: 'sports', pri: 'Shoulders / Core', sec: 'Legs',
    cues: 'Hands up, chin tucked, rotate the hips. This is not sparring advice.',
    setup: 'Bag or shadow. Educational.', breathing: 'Exhale on punch', mistakes: 'Arm punches, dropping the rear hand',
    met: 12.8, metSource: 'CPA 2011 15190 boxing, in ring, general', sessionNote: 'Bag work is slightly lower (~9–12). Shoulder-limited users should skip.',
    muscles: { primary: ['shoulders'], secondary: ['core'] }, eq: [], bw: true, pattern: 'conditioning',
    joint: { shoulder: 3, elbow: 2, knee: 1, spine: 1, hip: 1, wrist: 3, neck: 2, ankle: 1 }, cns: 3, diff: 2,
    regressions: ['Shadow Boxing'], progressions: ['MMA / Martial Arts'] },
  { n: 'MMA / Martial Arts', grp: 'sports', pri: 'Full Body', sec: 'Hips, Core',
    cues: 'Technical drilling only here. No live sparring prescription. Stop on joint pain.',
    setup: 'Mat. Educational, not a fight camp.', breathing: 'Brace on takedown drills', mistakes: 'Training through a tweak',
    met: 10.3, metSource: 'CPA 2011 15430 martial arts, moderate pace', sessionNote: 'Hard sparring is higher. Keep this as skill + conditioning.',
    muscles: { primary: ['full_body'], secondary: ['hips'] }, eq: [], bw: true, pattern: 'conditioning',
    joint: { shoulder: 2, elbow: 2, knee: 2, spine: 2, hip: 2, wrist: 2, neck: 2, ankle: 2 }, cns: 3, diff: 2,
    regressions: ['Boxing'], progressions: ['Skipping Intervals'] },
  { n: 'Climbing', grp: 'sports', pri: 'Forearms / Back', sec: 'Shoulders, Core',
    cues: 'Straight arms when you can, hips in, no death-grip.', setup: 'Wall or gym. Educational.',
    breathing: 'Exhale on hard moves', mistakes: 'Locking off with a shrugging neck',
    met: 8.0, metSource: 'CPA 2011 15533 rock climbing, ascending rock', sessionNote: 'Indoor bouldering is bursty; rest the fingers.',
    muscles: { primary: ['forearms'], secondary: ['lats', 'core'] }, eq: ['bar'], bw: false, pattern: 'conditioning',
    joint: { shoulder: 2, elbow: 2, knee: 1, spine: 1, hip: 1, wrist: 2, neck: 1, ankle: 1 }, cns: 2, diff: 2,
    regressions: ['Dead Hang'], progressions: ['Pull-Ups'] },
  { n: 'Hiking', grp: 'sports', pri: 'Conditioning', sec: 'Calves, Glutes',
    cues: 'Shorter steps uphill. Poles if the knees complain.', setup: 'Trail. Educational.',
    breathing: 'Steady', mistakes: 'Huge downhill steps',
    met: 6.0, metSource: 'CPA 2011 17080 hiking, cross country', sessionNote: 'Pack weight raises MET.',
    muscles: { primary: ['calves'], secondary: ['glutes'] }, eq: [], bw: true, pattern: 'conditioning',
    joint: { shoulder: 1, elbow: 0, knee: 2, spine: 1, hip: 2, wrist: 0, neck: 0, ankle: 2 }, cns: 2, diff: 1,
    regressions: ['Treadmill Incline Walk'], progressions: ['Trail Running'] },
  { n: 'Dancing', grp: 'sports', pri: 'Conditioning', sec: 'Calves, Core',
    cues: 'Land softly. Stop on sharp ankle or knee pain.', setup: 'Floor with space. Educational.',
    breathing: 'Steady', mistakes: 'Locking the knees on jumps',
    met: 7.8, metSource: 'CPA 2011 03015 dancing, general', sessionNote: 'Varies widely by style.',
    muscles: { primary: ['full_body'], secondary: ['calves'] }, eq: [], bw: true, pattern: 'conditioning',
    joint: { shoulder: 1, elbow: 0, knee: 2, spine: 1, hip: 1, wrist: 0, neck: 0, ankle: 2 }, cns: 2, diff: 1,
    regressions: ['Walking Lunge'], progressions: ['Box Jump'] },
  { n: 'Golf', grp: 'sports', pri: 'Rotation / Core', sec: 'Shoulders',
    cues: 'Rotate through the hips. Do not hang on a sore back for extra yards.',
    setup: 'Range or course. Educational.', breathing: 'Exhale through the swing', mistakes: 'Reverse spine angle',
    met: 4.8, metSource: 'CPA 2011 15255 golf, walking and carrying clubs', sessionNote: 'Riding a cart is closer to 3.5 MET.',
    muscles: { primary: ['core'], secondary: ['shoulders'] }, eq: [], bw: true, pattern: 'conditioning',
    joint: { shoulder: 2, elbow: 1, knee: 1, spine: 2, hip: 2, wrist: 2, neck: 1, ankle: 1 }, cns: 1, diff: 1,
    regressions: ['Pallof Press'], progressions: ['Medicine Ball Rotational Throw'] },
  { n: 'Rowing (water)', grp: 'sports', pri: 'Back / Legs', sec: 'Core',
    cues: 'Legs-body-arms on the drive. Do not yank with the lumbar spine.',
    setup: 'Boat or erg. Educational.', breathing: 'Exhale on the drive', mistakes: 'Early arm pull, rounded low back',
    met: 6.0, metSource: 'CPA 2011 18100 canoeing, rowing, moderate', sessionNote: 'Race pace is much higher (~12).',
    muscles: { primary: ['lats'], secondary: ['quads', 'core'] }, eq: ['machine'], bw: false, pattern: 'conditioning',
    joint: { shoulder: 1, elbow: 1, knee: 2, spine: 2, hip: 2, wrist: 1, neck: 0, ankle: 1 }, cns: 2, diff: 1,
    regressions: ['Seated Cable Row'], progressions: ['Rowing Machine'] },
  { n: 'Swimming — Butterfly', grp: 'sports', pri: 'Shoulders / Core', sec: 'Lats',
    cues: 'Undulate from the hips. Stop if the shoulders bark.', setup: 'Pool. Educational.',
    breathing: 'Every 1–2 strokes', mistakes: 'Pressing the head down',
    met: 13.8, metSource: 'CPA 2011 18310 swimming, butterfly, general', sessionNote: 'Very high demand. Easy choice: freestyle.',
    muscles: { primary: ['shoulders'], secondary: ['lats', 'core'] }, eq: [], bw: true, pattern: 'conditioning',
    joint: { shoulder: 3, elbow: 1, knee: 0, spine: 1, hip: 1, wrist: 1, neck: 2, ankle: 1 }, cns: 3, diff: 3,
    regressions: ['Swimming Freestyle'], progressions: ['Swimming Freestyle'] },
  { n: 'Swimming — Backstroke', grp: 'sports', pri: 'Back / Shoulders', sec: 'Core',
    cues: 'Hips high, roll the shoulders. Neutral neck.', setup: 'Pool. Educational.',
    breathing: 'Free', mistakes: 'Sitting in the water',
    met: 7.0, metSource: 'CPA 2011 18320 swimming, backstroke, general', sessionNote: 'Often friendlier than fly or intense free.',
    muscles: { primary: ['lats'], secondary: ['shoulders'] }, eq: [], bw: true, pattern: 'conditioning',
    joint: { shoulder: 2, elbow: 1, knee: 0, spine: 1, hip: 0, wrist: 1, neck: 1, ankle: 1 }, cns: 2, diff: 1,
    regressions: ['Swimming Freestyle'], progressions: ['Swimming Butterfly'] },
  { n: 'Skipping Intervals', grp: 'sports', pri: 'Calves / Conditioning', sec: 'Shoulders',
    cues: 'Quiet landings, short intervals. Skip if the Achilles or ankle is sore.',
    setup: 'Rope, flat floor. Educational.', breathing: 'Exhale on jumps', mistakes: 'Huge jumps, locked knees',
    met: 12.3, metSource: 'CPA 2011 15552 rope skipping, general', sessionNote: 'Treat as HIIT. 20–40s on, walk off.',
    muscles: { primary: ['calves'], secondary: ['shoulders'] }, eq: [], bw: true, pattern: 'conditioning',
    joint: { shoulder: 1, elbow: 0, knee: 2, spine: 1, hip: 1, wrist: 1, neck: 0, ankle: 3 }, cns: 2, diff: 2,
    regressions: ['March in Place'], progressions: ['Box Jump'] }
];

function completeSport(s) {
  return Object.assign({
    diff: 1, bw: true, eq: [], cns: 2, tempoRec: 'steady',
    setup: 'Educational session — not coaching certification.',
    breathing: 'Steady', mistakes: 'Training through joint pain',
    cues: 'Stop on sharp pain.',
    custom: false
  }, s, {
    id: s.id || slug(s.n),
    joint: s.joint,
    muscles: s.muscles,
    regressions: s.regressions || [],
    progressions: s.progressions || []
  });
}

function metNote(ex) {
  const n = String(ex.n || '').toLowerCase();
  const g = String(ex.grp || '');
  if (ex.metSource) return;
  if (g === 'cardio' || g === 'sports' || g === 'plyometrics' || g === 'conditioning') {
    if (/run/.test(n)) { ex.met = 9.8; ex.metSource = 'CPA 2011 12050 running 6 mph'; return; }
    if (/row/.test(n)) { ex.met = 7.0; ex.metSource = 'CPA 2011 02070 rowing, stationary, 100 watts'; return; }
    if (/bike|cycle|assault/.test(n)) { ex.met = 7.0; ex.metSource = 'CPA 2011 02012 bicycling, stationary, 100 watts'; return; }
    if (/swim.*free/.test(n)) { ex.met = 5.8; ex.metSource = 'CPA 2011 18350 swimming, leisurely'; return; }
    if (/swim.*breast/.test(n)) { ex.met = 10.3; ex.metSource = 'CPA 2011 18330 swimming, breaststroke, general'; return; }
    if (/jump|box jump|bound/.test(n)) { ex.met = 8.0; ex.metSource = 'CPA 2011 02120 calisthenics, vigorous'; return; }
    if (/basketball/.test(n)) { ex.met = 6.5; ex.metSource = 'CPA 2011 15055 basketball, general'; return; }
    if (/football|soccer/.test(n)) { ex.met = 7.0; ex.metSource = 'CPA 2011 15610 soccer, casual'; return; }
    if (/padel/.test(n)) { ex.met = 6.0; ex.metSource = 'CPA 2011 15675 tennis-like racket sport (estimate)'; return; }
    if (/stair/.test(n)) { ex.met = 9.0; ex.metSource = 'CPA 2011 02065 stair-treadmill ergometer, general'; return; }
  }
  if (ex.cns >= 3 || (ex.diff || 1) >= 3) {
    ex.metSource = 'CPA 2011 02054 resistance training, vigorous (~6.0); stored value kept if in 3.5–8 range';
    if (ex.met < 3.5 || ex.met > 8) ex.met = 6.0;
  } else {
    ex.metSource = 'CPA 2011 02052 resistance training, moderate (~3.5–5.0); stored value kept if in 3–6.5 range';
    if (ex.met < 3 || ex.met > 6.5) ex.met = 5.0;
  }
}

function applyJoints(rows) {
  rows.forEach(function(ex) { ex.joint = rateJoints(ex); });
}

function applyPatterns(rows) {
  rows.forEach(function(ex) { ex.pattern = inferPattern(ex); });
}

function applyPlyo(rows) {
  const plyo = { 'Box Jump': 1, 'Depth Jump': 1, 'Medicine Ball Chest Pass': 1, 'Lateral Bound': 1 };
  rows.forEach(function(ex) {
    if (plyo[ex.n]) {
      ex.grp = 'plyometrics';
      ex.pattern = 'conditioning';
    }
  });
}

function applySports(rows) {
  const have = Object.create(null);
  rows.forEach(function(ex) { have[ex.n] = true; });
  SPORTS.map(completeSport).forEach(function(s) {
    if (!have[s.n]) rows.push(s);
  });
}

function applyMet(rows) {
  rows.forEach(metNote);
}

const SAFETY = [
  { n: 'Wall Push-Up', grp: 'chest', diff: 1, bw: true, eq: [], pri: 'Chest', sec: 'Triceps',
    cues: 'Hands on wall, body plank, control the bend. Easier on the wrist than floor push-ups.',
    setup: 'Wall at chest height, feet back.', breathing: 'Inhale in, exhale press', mistakes: 'Flaring elbows, sagging hips',
    joint: { shoulder: 1, elbow: 1, knee: 0, spine: 1, hip: 0, wrist: 1, neck: 0, ankle: 0 },
    cns: 1, muscles: { primary: ['chest'], secondary: ['triceps'] },
    regressions: ['Chest Squeeze'], progressions: ['Knee Push-Ups'], met: 3.5, tempoRec: '2-0-1-0', pattern: 'horizontal_push' },
  { n: 'Band Chest Press', grp: 'chest', diff: 1, bw: false, eq: ['bands'], pri: 'Chest', sec: 'Triceps',
    cues: 'Band behind the back or anchored, press forward, wrists neutral.',
    setup: 'Light band, standing or seated.', breathing: 'Exhale press', mistakes: 'Shrugging, bent wrists',
    joint: { shoulder: 1, elbow: 1, knee: 0, spine: 0, hip: 0, wrist: 1, neck: 0, ankle: 0 },
    cns: 1, muscles: { primary: ['chest'], secondary: ['triceps'] },
    regressions: ['Wall Push-Up'], progressions: ['Push-Ups'], met: 3.5, tempoRec: '2-0-1-0', pattern: 'horizontal_push' },
  { n: 'Band Row', grp: 'back', diff: 1, bw: false, eq: ['bands'], pri: 'Lats', sec: 'Rhomboids',
    cues: 'Anchor the band, row to the ribs, squeeze the shoulder blades.',
    setup: 'Band at chest height.', breathing: 'Exhale pull', mistakes: 'Shrugging the neck',
    joint: { shoulder: 1, elbow: 1, knee: 0, spine: 1, hip: 0, wrist: 1, neck: 1, ankle: 0 },
    cns: 1, muscles: { primary: ['lats'], secondary: ['rhomboids'] },
    regressions: ['Band Pull-Aparts'], progressions: ['Dumbbell Row'], met: 3.5, tempoRec: '2-1-2-0', pattern: 'horizontal_pull' }
];

function applySafety(rows) {
  const have = Object.create(null);
  rows.forEach(function(ex) { have[ex.n] = true; });
  SAFETY.forEach(function(s) {
    if (have[s.n]) return;
    s.id = slug(s.n);
    rows.push(s);
  });
}

const phase = process.argv[2] || 'all';
const rows = load();
if (phase === '17' || phase === 'all') { applySafety(rows); applyJoints(rows); }
if (phase === '18' || phase === 'all') { applyPatterns(rows); fillSubs(rows); }
if (phase === '19' || phase === 'all') { applyPlyo(rows); applySports(rows); applyMet(rows); applyJoints(rows); applyPatterns(rows); fillSubs(rows); }
write(rows);
const missing = rows.filter(function(ex) {
  return JOINTS.some(function(k) { return ex.joint == null || ex.joint[k] == null; });
});
const untagged = rows.filter(function(ex) { return PATTERNS.indexOf(ex.pattern) < 0; });
const thin = rows.filter(function(ex) { return ((ex.regressions || []).length + (ex.progressions || []).length) < 2; });
console.log('count', rows.length, 'missingJoints', missing.length, 'untagged', untagged.length, 'thinSubs', thin.length);
if (thin.length && thin.length < 20) console.log(thin.map(function(e) { return e.n; }));
