/* Library growth for js/data/exercise-db.js. Two sources, applied in order:
   1. ADDITIONS (scripts/exercise-additions.mjs) — hand-written rows.
   2. Exercises Library by Hasan Emir Yıldırım (MIT; vendored English subset in
      scripts/vendor/). Names, targets, equipment and instruction text only —
      its images/GIFs are © Gym visual and are NOT used.
   Anything that already exists (same name, or same movement with the same kind
   of equipment) is skipped, so the curated entry always wins and the build is
   idempotent. Joint loads, MET, mistakes and breathing come from the movement
   pattern; build-regressions.mjs then adds easier/harder links. */
import fs from 'node:fs';
import path from 'node:path';
import { ADDITIONS } from './exercise-additions.mjs';

export const LIBRARY_CREDIT = 'Exercises Library © 2026 Hasan Emir Yıldırım (MIT) — github.com/plataformafitness/exercises-library';

const slug = n => String(n || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const pretty = m => String(m || '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
const cap = s => { s = String(s || '').trim(); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; };
const sentence = t => { t = cap(String(t || '').replace(/\s+/g, ' ').trim()); return !t || /[.!?]$/.test(t) ? t : t + '.'; };
const clip = (t, max) => {
  t = String(t || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t.replace(/\.$/, '');
  return t.slice(0, t.lastIndexOf(' ', max)).replace(/[,;:]$/, '') + '…';
};

/* ── Dedupe keys ── */
const TOKEN_MAP = { db: 'dumbbell', bb: 'barbell', kb: 'kettlebell', lever: 'machine', pushup: 'push up', pullup: 'pull up',
  chinup: 'chin up', situp: 'sit up', bicep: 'biceps', tricep: 'triceps', ups: 'up', cables: 'cable', bands: 'band',
  dumbbells: 'dumbbell', 'press-up': 'push up', pressup: 'push up', alternate: 'alternating' };
const EQUIP_WORDS = new Set(['barbell', 'dumbbell', 'cable', 'machine', 'smith', 'band', 'kettlebell', 'bodyweight', 'weighted', 'resistance', 'standing']);
function tokens(name) {
  return String(name || '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim().split(' ')
    .flatMap(t => (TOKEN_MAP[t] || t).split(' '))
    .map(t => (t.length > 3 && t.endsWith('s') && !t.endsWith('ss') ? t.slice(0, -1) : t))
    .filter(Boolean);
}
const keyOf = n => tokens(n).join(' ');
const looseOf = n => tokens(n).filter(t => !EQUIP_WORDS.has(t)).join(' ');
const FAMILIES = ['barbell', 'dumbbell', 'cables', 'smith', 'machine', 'bands', 'kettlebell'];
function family(e) {
  const eq = (e.eq || []).map(t => (t === 'cable' ? 'cables' : t));
  return FAMILIES.find(f => eq.includes(f)) || (e.bw ? 'bw' : (eq[0] || 'bw'));
}

/* ── Movement defaults ── */
const J = (o) => Object.assign({ shoulder: 0, elbow: 0, knee: 0, spine: 0, hip: 0, wrist: 0, neck: 0, ankle: 0 }, o);
function jointsFor(pattern, grp, prim, n, eqFam, diff) {
  const heavy = eqFam === 'barbell' || diff >= 3 ? 1 : 0;
  switch (pattern) {
    case 'horizontal_push': return J({ shoulder: 2, elbow: 1, wrist: 1 + (eqFam === 'barbell' ? 1 : 0) });
    case 'vertical_push': return J({ shoulder: 2 + heavy, elbow: 1, wrist: 1, spine: 1 });
    case 'horizontal_pull': return J({ shoulder: 1, elbow: 1, spine: eqFam === 'barbell' || /bent|pendlay|yates/i.test(n) ? 2 : 1 });
    case 'vertical_pull': return J({ shoulder: 2, elbow: 1 + heavy, wrist: 1 });
    case 'hinge': return J({ spine: 1 + heavy + (/deadlift|good morning|clean|snatch/i.test(n) ? 1 : 0), hip: 2, knee: 1 });
    case 'squat': return J({ knee: 2, hip: 2, spine: 1 + (eqFam === 'barbell' ? 1 : 0), ankle: 1 });
    case 'lunge': return J({ knee: 2, hip: 1, ankle: 1 });
    case 'carry': return J({ spine: 1, wrist: 1, shoulder: 1, hip: 1 });
    case 'core': return J({ spine: 1, hip: 1, neck: /crunch|sit-up|sit up|v-up/i.test(n) ? 1 : 0 });
    case 'conditioning':
      return /jump|hop|bound|plyo|burpee|sprint|skater|depth|tuck/i.test(n) ? J({ knee: 2, ankle: 2, hip: 1 }) : J({ knee: 1, ankle: 1, hip: 1 });
    default: {
      if (grp === 'mobility') return J({});
      if (grp === 'biceps' || grp === 'triceps') return J({ elbow: 1 + (grp === 'triceps' && /skull|lying|overhead|french/i.test(n) ? 1 : 0), wrist: 1 });
      if (grp === 'forearms') return J({ wrist: 1, elbow: 1 });
      if (grp === 'shoulders' || grp === 'chest' || grp === 'back') return J({ shoulder: 1, elbow: grp === 'chest' ? 1 : 0 });
      if (grp === 'neck') return J({ neck: 1 });
      if (prim === 'calves') return J({ ankle: 1 });
      if (prim === 'quads') return J({ knee: 2 });
      if (prim === 'hamstrings') return J({ knee: 1, hip: 1 });
      if (grp === 'glutes' || prim === 'adductors') return J({ hip: 1 });
      return J({});
    }
  }
}
const MISTAKES = {
  horizontal_push: 'Flaring the elbows, bouncing, cutting the range short',
  vertical_push: 'Arching the lower back, pressing forward instead of up',
  horizontal_pull: 'Jerking the weight, shrugging, skipping the squeeze',
  vertical_pull: 'Swinging, half reps, pulling with the arms only',
  hinge: 'Rounding the lower back, turning it into a squat',
  squat: 'Knees caving in, heels lifting, losing a neutral back',
  lunge: 'Front knee caving, short stride, pushing off the back foot',
  carry: 'Leaning to one side, shrugging, rushing the steps',
  core: 'Arching the lower back, holding your breath, rushing reps',
  isolation: 'Swinging the weight, partial reps, going too heavy',
  conditioning: 'Going too hard too soon, sloppy landings, no warm-up',
  stretch: 'Bouncing, forcing into pain, holding your breath'
};
const BREATHING = {
  core: 'Breathe steadily — don’t hold your breath',
  conditioning: 'Find a steady rhythm; slow down if you can’t talk in short phrases',
  carry: 'Short breaths behind a braced trunk',
  stretch: 'Slow breaths; relax a little deeper on each exhale',
  lift: 'Breathe in before the hard part, out as you finish it'
};
const MET = {
  isolation: [3.5, 'CPA 2011 02054 resistance training, multiple exercises, 8–15 reps (category estimate)'],
  compound: [5, 'CPA 2011 02052 resistance training, squats / compound lifts (category estimate)'],
  heavy: [6, 'CPA 2011 02050 resistance training, power lifting / vigorous (category estimate)'],
  calisthenics: [3.8, 'CPA 2011 02022 calisthenics, moderate effort (category estimate)'],
  vigorous: [8, 'CPA 2011 02020 calisthenics, vigorous effort (category estimate)'],
  circuit: [8, 'CPA 2011 02040 circuit training incl. kettlebells, vigorous (category estimate)'],
  stretch: [2.3, 'CPA 2011 02101 stretching, mild (category estimate)'],
  yoga: [2.5, 'CPA 2011 02150 yoga, Hatha (category estimate)'],
  pilates: [3, 'CPA 2011 02105 Pilates, general (category estimate)'],
  cardio: [7, 'CPA 2011 02010 conditioning exercise, general (category estimate)'],
  walking: [3.5, 'CPA 2011 17200 walking, 2.8–3.2 mph (category estimate)']
};
function metFor(pattern, grp, eqFam, bw, diff, n, style) {
  if (style === 'yoga') return MET.yoga;
  if (style === 'pilates') return MET.pilates;
  if (grp === 'mobility' || /stretch/i.test(n)) return MET.stretch;
  if (/walk/i.test(n) && pattern === 'conditioning') return MET.walking;
  if (grp === 'cardio') return MET.cardio;
  if (pattern === 'conditioning') return eqFam === 'kettlebell' ? MET.circuit : MET.vigorous;
  if (bw) return diff >= 3 ? MET.vigorous : MET.calisthenics;
  if (pattern === 'isolation') return MET.isolation;
  if (eqFam === 'barbell' && (pattern === 'squat' || pattern === 'hinge') && diff >= 2) return MET.heavy;
  return pattern === 'core' ? MET.isolation : MET.compound;
}

/* Apparatus a bodyweight move still needs (the rest are gated by kit tags). */
function apparatusFromName(n) {
  if (/\brings?\b/i.test(n)) return ['rings'];
  if (/\btrx\b|suspen/i.test(n)) return ['trx'];
  if (/pull[- ]?ups?\b|chin[- ]?ups?\b|muscle[- ]?up|hanging|dead hang|toes[- ]to[- ]bar|front lever|back lever|parallel bars|\bdips?\b(?!.*bench)|dip-pull-up|l-sit pull|on dip|skin the cat|towel pull|monkey bar/i.test(n)) return ['bar'];
  if (/stability ball|exercise ball|swiss ball/i.test(n)) return ['stability_ball'];
  if (/bosu/i.test(n)) return ['bosu'];
  if (/medicine ball|med ball|wall ball/i.test(n)) return ['medball'];
  if (/foam roll|\broller\b(?!.*wheel)/i.test(n) && !/wheel|rollout|rollerout/i.test(n)) return ['foam_roller'];
  if (/ab wheel|wheel roll|rollerout/i.test(n)) return ['ab_wheel'];
  if (/box jump|box step|depth jump|\bbox\b/i.test(n)) return ['box'];
  return [];
}

/* ── Hand-written rows → DB entries ── */
function fromAddition(r) {
  const o = r.opts || {};
  const eqList = r.eq ? r.eq.split('+') : [];
  const bw = o.bw != null ? !!o.bw : !eqList.length;
  const fam = family({ eq: eqList, bw });
  const prim = r.prim;
  const isStretch = r.grp === 'mobility' && o.style !== 'drill';
  const [met, src] = o.met ? [o.met, o.src || 'CPA 2011 (category estimate)'] : metFor(r.pattern, r.grp, fam, bw, r.diff, r.n, o.style);
  const e = {
    n: r.n, grp: r.grp, diff: r.diff, bw, eq: eqList,
    pri: r.pri, sec: r.sec || '',
    cues: r.cues, setup: r.setup,
    breathing: o.breathing || (isStretch ? BREATHING.stretch : BREATHING[r.pattern] || BREATHING.lift),
    mistakes: o.mistakes || (isStretch ? MISTAKES.stretch : MISTAKES[r.pattern]),
    joint: Object.assign(jointsFor(r.pattern, r.grp, prim, r.n, fam, r.diff), o.j || {}),
    cns: o.cns || (r.pattern === 'isolation' || r.grp === 'mobility' ? 1 : r.diff >= 3 ? 3 : 2),
    muscles: { primary: [prim], secondary: String(r.sec || '').split(',').map(s => s.trim().toLowerCase().replace(/\s+/g, '_')).filter(Boolean) },
    regressions: [], progressions: [],
    met, metSource: src,
    id: slug(r.n), pattern: r.pattern
  };
  if (o.style) e.style = o.style;
  if (o.steps) e.steps = o.steps.slice();
  if (o.machineType) e.machineType = o.machineType;
  if (!['conditioning'].includes(r.pattern) && r.grp !== 'mobility') e.tempoRec = r.pattern === 'isolation' ? '2-0-1-1' : '2-0-1-0';
  return e;
}

/* ── Exercises Library rows → DB entries ── */
const SMALL = new Set(['and', 'or', 'of', 'on', 'with', 'to', 'the', 'a', 'in', 'at', 'for', 'from', 'into']);
const SPECIAL = { ez: 'EZ', trx: 'TRX', 'v-bar': 'V-Bar', 'sz-bar': 'SZ-Bar', rdl: 'RDL', pov: 'POV', 'ez-bar': 'EZ-Bar', 'v-up': 'V-Up', 'v-sit': 'V-Sit', 'l-sit': 'L-Sit' };
function titleCase(s) {
  return s.split(' ').map((w, i) => {
    const lw = w.toLowerCase();
    const bare = lw.replace(/[()]/g, '');
    if (SPECIAL[bare]) return w.replace(bare, SPECIAL[bare]);
    if (i > 0 && SMALL.has(bare) && !/^\(/.test(w)) return lw;
    return lw.split('-').map(p => p.replace(/^(\(?)([a-z])/, (m, a, b) => a + b.toUpperCase())).join('-');
  }).join(' ');
}
function cleanName(raw) {
  let s = String(raw || '').replace(/в°/g, '°').replace(/\s+/g, ' ').trim();
  s = s.replace(/\s*\((male|female|back pov|side pov)\)/gi, '').replace(/\s+(male|female)$/i, '').replace(/\s+v\.\s*\d+$/i, '').replace(/\s+-\s+\(/g, ' (');
  s = s.replace(/rollerer/g, 'roller').replace(/rollerout/g, 'rollout').replace(/\bsitted\b/g, 'seated').replace(/\bstraigth\b/g, 'straight');
  s = s.replace(/^lever /i, 'machine ').replace(/^smith /i, 'smith machine ').replace(/\bez[- ]barbell\b|\bez[- ]bar\b/gi, 'ez bar');
  return titleCase(s.trim());
}
const TARGET = {
  abs: ['core', 'abs'], pectorals: ['chest', 'chest'], biceps: ['biceps', 'biceps'], glutes: ['glutes', 'glutes'],
  delts: ['shoulders', 'front_delts'], triceps: ['triceps', 'triceps'], 'upper back': ['back', 'upper_back'],
  lats: ['back', 'lats'], traps: ['back', 'traps'], calves: ['legs', 'calves'], quads: ['legs', 'quads'],
  hamstrings: ['legs', 'hamstrings'], adductors: ['legs', 'adductors'], abductors: ['glutes', 'glutes'],
  forearms: ['forearms', 'forearms'], 'cardiovascular system': ['cardio', 'cardio'], spine: ['back', 'lower_back'],
  'serratus anterior': ['chest', 'serratus'], 'levator scapulae': ['neck', 'neck']
};
const SEC = {
  'hip flexors': 'hip_flexors', 'lower back': 'lower_back', shoulders: 'shoulders', forearms: 'forearms', biceps: 'biceps',
  triceps: 'triceps', hamstrings: 'hamstrings', quadriceps: 'quads', glutes: 'glutes', obliques: 'obliques', chest: 'chest',
  trapezius: 'traps', traps: 'traps', deltoids: 'shoulders', calves: 'calves', ankles: 'calves', core: 'core',
  'rotator cuff': 'rotator_cuff', soleus: 'calves', rhomboids: 'rhomboids', 'wrist flexors': 'forearms',
  'wrist extensors': 'forearms', 'latissimus dorsi': 'lats', lats: 'lats', abdominals: 'abs', 'upper back': 'upper_back',
  wrists: 'forearms', hands: 'forearms', 'ankle stabilizers': 'calves', quads: 'quads'
};
function eqFromLibrary(equipment, n) {
  const s = String(equipment || '').toLowerCase();
  if (STRETCH.test(n)) return { bw: true, eq: apparatusFromName(n).filter(t => t !== 'bar') };
  switch (s) {
    case 'body weight': case 'assisted': {
      if (s === 'assisted' && /pull[- ]?up|chin|dip/i.test(n) && !/partner|kneeling|band/i.test(n)) return { bw: false, eq: ['machine'] };
      return { bw: true, eq: apparatusFromName(n) };
    }
    case 'dumbbell': return { bw: false, eq: ['dumbbell'] };
    case 'cable': return { bw: false, eq: ['cables'] };
    case 'rope':
      if (/battl/i.test(n)) return { bw: false, eq: ['battle_rope'] };
      if (/climb|london bridge/i.test(n)) return { bw: true, eq: ['rope'] };
      return { bw: true, eq: [] };
    case 'barbell': case 'olympic barbell': case 'ez barbell': case 'trap bar': return { bw: false, eq: ['barbell'] };
    case 'leverage machine': case 'sled machine': return { bw: false, eq: ['machine'] };
    case 'smith machine': return { bw: false, eq: ['smith'] };
    case 'band': case 'resistance band': return { bw: false, eq: ['bands'] };
    case 'kettlebell': return { bw: false, eq: ['kettlebell'] };
    case 'weighted': return { bw: false, eq: /pull|chin|dip/i.test(n) ? ['plate', 'bar'] : ['plate', 'dumbbell'] };
    case 'stability ball': return { bw: true, eq: ['stability_ball'] };
    case 'medicine ball': return { bw: false, eq: ['medball'] };
    case 'roller': return { bw: true, eq: ['foam_roller'] };
    case 'wheel roller': return { bw: true, eq: ['ab_wheel'] };
    case 'bosu ball': return { bw: true, eq: ['bosu'] };
    case 'hammer': case 'tire': return { bw: false, eq: ['strongman'] };
    case 'upper body ergometer': case 'skierg machine': case 'stationary bike': case 'elliptical machine': case 'stepmill machine':
      return { bw: true, eq: [{ 'upper body ergometer': 'machine', 'skierg machine': 'ski_erg', 'stationary bike': 'bike', 'elliptical machine': 'elliptical', 'stepmill machine': 'machine' }[s]] };
    default: return { bw: true, eq: apparatusFromName(n) };
  }
}
function patternFor(n, target) {
  const s = n.toLowerCase();
  if (target === 'cardiovascular system') return 'conditioning';
  if (STRETCH.test(s)) return 'isolation';
  if (/calf|calves/.test(s)) return 'isolation';
  if (/curl\b|curls\b/.test(s) && !/leg curl.*deadlift/.test(s)) return 'isolation';
  if (/(hip|back) extension|hyperextension|reverse hyper/.test(s)) return 'hinge';
  if (/extension|kickback|kick back|pushdown|push down|fly\b|flye|crossover|cross-over|raise|shrug|pullover|pull-over|wrist|adduct|abduct|iron cross|squeeze|rotation/.test(s)) {
    if (/leg raise|knee raise|hip raise|toe raise|leg lift/.test(s)) return 'core';
    return 'isolation';
  }
  if (/jump|hop|burpee|skater|bound|jack\b|jacks\b|sprint|\brun\b|skip|climber|plyo|clap|tuck jump|scissor|battl|sledge|tire flip|slam/.test(s)) return 'conditioning';
  if (/lunge|split squat|step[- ]?up|bulgarian/.test(s)) return 'lunge';
  if (/deadlift|good morning|hip thrust|glute bridge|\bbridge\b|swing|pull[- ]through|romanian|\brdl\b|clean|snatch|hip lift/.test(s)) return 'hinge';
  if (/squat|leg press|hack|thruster|wall sit|sissy/.test(s)) return 'squat';
  if (/carry|farmer|suitcase walk|overhead walk/.test(s)) return 'carry';
  if (/pulldown|pull-down|pull[- ]?ups?\b|chin[- ]?ups?\b|muscle[- ]up|lever\b/.test(s)) return 'vertical_pull';
  if (/\brows?\b|face pull|pull[- ]apart|reverse fly|rear delt|high pull|inverted row/.test(s)) return 'horizontal_pull';
  if (/overhead press|shoulder press|military|push press|jerk|arnold|pike push|handstand|landmine press|z press|behind (the )?neck press|bradford/.test(s)) return 'vertical_push';
  if (/french press|jm press|tate press/.test(s)) return 'isolation';
  if (target === 'delts' && /press/.test(s) && !/bench press|chest press|push[- ]?up/.test(s)) return 'vertical_push';
  if (/press|push[- ]?ups?\b|dips?\b/.test(s)) return 'horizontal_push';
  if (['abs', 'spine'].includes(target) || /crunch|sit[- ]?up|plank|twist|rollout|roll-out|v-up|hollow|dead bug|woodchop|side bend|flutter|bicycle|leg raise/.test(s)) return 'core';
  return 'isolation';
}
function primFor(target, n) {
  const s = n.toLowerCase();
  const t = TARGET[target] || ['core', 'core'];
  let prim = t[1];
  if (target === 'abs' && /twist|oblique|side bend|russian|woodchop|windshield|side plank|side crunch/.test(s)) prim = 'obliques';
  if (target === 'pectorals' && /incline/.test(s)) prim = 'upper_chest';
  if (target === 'pectorals' && /decline/.test(s)) prim = 'lower_chest';
  if (target === 'biceps' && /hammer|reverse|zottman/.test(s)) prim = 'brachialis';
  if (target === 'delts' && /lateral|side|upright|y-raise/.test(s)) prim = 'side_delts';
  if (target === 'delts' && /rear|reverse fly|face pull|bent over lateral|bent-over lateral/.test(s)) prim = 'rear_delts';
  return prim;
}
const STRETCH = /stretch|\bpose\b/i;
const CARDIO_MACHINE = /ergometer|elliptical|stepmill|treadmill|\bbike\b(?!.*crunch)/i;
/* Library rows that duplicate an existing entry under another name, or need a clearer one. */
const SKIP = new Set(['jump rope', 'run (equipment)', 'stationary bike run v. 3', 'walk elliptical cross trainer', 'walking on stepmill', 'ski ergometer']);
const RENAME = { 'air bike': 'bicycle crunch', 'hands bike': 'arm ergometer (hand bike)', 'wrist rollerer': 'wrist roller' };
const ADVANCED = /muscle[- ]?up|planche|front lever|back lever|maltese|iron cross|human flag|one arm (chin|pull)|single arm (chin|pull)|handstand|pistol|dragon flag|snatch|clean and jerk|power clean|hang clean|\bjerk\b|archer|typewriter|l-sit|v-sit|clap|360|explosive|plyo|depth jump/i;
function diffFor(n, eqFam, pattern, bw) {
  if (STRETCH.test(n)) return 1;
  if (ADVANCED.test(n)) return 3;
  if (/stretch|wall push|kneeling push|knee push|assisted|incline push|band assisted|on knees|seated calf/i.test(n)) return 1;
  if (pattern === 'isolation' || pattern === 'core') return /one arm|single arm|weighted|hanging/i.test(n) ? 2 : 1;
  if (bw) return /one leg|single leg|one arm|decline push|diamond|dip|pull|chin|hanging/i.test(n) ? 2 : 1;
  if (eqFam === 'barbell' || eqFam === 'kettlebell') return 2;
  if (pattern === 'conditioning') return 2;
  return eqFam === 'dumbbell' && /deadlift|clean|squat|lunge/i.test(n) ? 2 : 1;
}
function fromLibrary(x) {
  const raw = String(x.name || '').toLowerCase().trim();
  if (SKIP.has(raw)) return null;
  const n = cleanName(RENAME[raw] || x.name);
  const steps = (x.steps || []).map(sentence)
    .filter(t => t.length > 3 && !/^repeat (for|the exercise for) (the )?desired/i.test(t)).slice(0, 8);
  if (!steps.length) return null;
  const isStretch = STRETCH.test(n);
  const machineCardio = CARDIO_MACHINE.test(n);
  const pattern = machineCardio ? 'conditioning' : patternFor(n, x.target);
  let grp = isStretch ? 'mobility' : (TARGET[x.target] || ['core'])[0];
  if (!isStretch && ((pattern === 'conditioning' && x.target === 'cardiovascular system') || machineCardio)) grp = 'cardio';
  const prim = machineCardio ? 'cardio' : primFor(x.target, n);
  const { bw, eq } = eqFromLibrary(x.equipment, n);
  const fam = family({ eq, bw });
  const diff = diffFor(n, fam, pattern, bw);
  const sec = [...new Set([...(x.secondary || []), x.muscle_group].map(m => SEC[String(m || '').toLowerCase()]).filter(m => m && m !== prim))].slice(0, 4);
  const cueStep = steps.slice(1).find(t => /keep|engage|squeeze|brace|control|avoid|make sure|maintain|slowly/i.test(t)) || steps[1] || steps[0];
  const [met, metSource] = metFor(pattern, grp, fam, bw, diff, n);
  const e = {
    n, grp, diff, bw, eq,
    pri: pretty(prim), sec: sec.map(pretty).join(', '),
    cues: clip(cueStep, 120), setup: clip(steps[0], 140),
    breathing: isStretch ? BREATHING.stretch : (BREATHING[pattern] || BREATHING.lift),
    mistakes: isStretch ? MISTAKES.stretch : MISTAKES[pattern],
    joint: jointsFor(pattern, grp, prim, n, fam, diff),
    cns: pattern === 'isolation' || isStretch ? 1 : diff >= 3 ? 3 : 2,
    muscles: { primary: [prim], secondary: sec },
    regressions: [], progressions: [],
    met, metSource,
    id: slug(n), pattern, steps, src: 'el', media: x.media || undefined
  };
  if (/yoga|\bpose\b/i.test(n)) { e.style = 'yoga'; [e.met, e.metSource] = MET.yoga; }
  if (/battl/i.test(n)) e.grp = 'cardio';
  if (!isStretch && pattern !== 'conditioning') e.tempoRec = pattern === 'isolation' ? '2-0-1-1' : '2-0-1-0';
  return e;
}

/* Hand-written step lists, so the build keeps them instead of regenerating. */
export const ADDITION_STEPS = Object.fromEntries(ADDITIONS.filter(r => r.opts && r.opts.steps).map(r => [r.n, r.opts.steps.slice()]));

/* Appends new entries to `db` in place; returns counts for the build log. */
/* Library rows skipped as duplicates of an existing entry — their animation
   still belongs to that entry. */
const MEDIA_ALIAS = { 'jump rope': 'Skip / Jump Rope', 'run (equipment)': 'Treadmill Run', 'stationary bike run v. 3': 'Stationary Bike',
  'walk elliptical cross trainer': 'Elliptical', 'walking on stepmill': 'Stair Climber', 'ski ergometer': 'Ski Erg' };

/* Popular curated lifts the library names differently: exercise → library row. */
const MEDIA_MAP = {
  'Back Squat': 'barbell full squat', 'Incline Barbell Bench Press': 'barbell incline bench press', 'Incline Barbell Press': 'barbell incline bench press',
  'Incline Dumbbell Press': 'dumbbell incline bench press', 'Decline Barbell Bench Press': 'barbell decline bench press', 'Decline Barbell Press': 'barbell decline bench press',
  'Cable Fly': 'cable middle fly', 'Cable Chest Fly': 'cable middle fly', 'Cable Crossover': 'cable cross-over variation', 'Low-to-High Cable Fly': 'cable low fly',
  'Incline Cable Fly': 'cable incline fly', 'Pec Deck': 'lever seated fly', 'Pec Deck Machine': 'lever seated fly', 'Front Delt Raise': 'dumbbell front raise',
  'Plate Front Raise': 'weighted front raise', 'Barbell Row': 'barbell bent over row', 'Dumbbell Row': 'dumbbell bent over row', 'T-Bar Row': 'lever t bar row',
  'Smith Machine Row': 'smith bent over row', 'Lat Pulldown': 'cable pulldown', 'Machine Lat Pulldown': 'cable pulldown',
  'Close-Grip Lat Pulldown': 'cable lateral pulldown with v-bar', 'Wide-Grip Lat Pulldown': 'cable bar lateral pulldown', 'Single-Arm Lat Pulldown': 'cable one arm pulldown',
  'Seated Cable Row': 'cable seated row', 'Seated Machine Row': 'lever seated row', 'High Cable Row': 'cable seated high row (v-bar)',
  'Rear Delt Fly': 'dumbbell rear delt raise', 'Lat Pullover': 'dumbbell pullover', 'Leg Press': 'sled 45в° leg press', 'Leg Curl': 'lever lying leg curl',
  'Seated Leg Curl': 'lever seated leg curl', 'Glute Bridge': 'low glute bridge on floor', 'Glute Bridge BW': 'low glute bridge on floor',
  'Bulgarian Split Squat': 'dumbbell single leg split squat', 'Reverse Lunge': 'dumbbell rear lunge', 'Step-Ups': 'dumbbell step-up', 'Step-Up': 'dumbbell step-up',
  'Standing Calf Raise': 'barbell standing calf raise', 'Hack Squat': 'sled hack squat', 'Cable Pull-Through': 'cable pull through (with rope)',
  'Leg Press Calf Raise': 'sled calf press on leg press', 'Overhead Press': 'barbell standing close grip military press',
  'Dumbbell Shoulder Press': 'dumbbell seated shoulder press', 'Seated DB Press': 'dumbbell seated shoulder press', 'Machine Shoulder Press': 'lever shoulder press',
  'Shoulder Press Machine': 'lever shoulder press', 'Cable Lateral Raise': 'cable lateral raise', 'Seated DB Lateral Raise': 'dumbbell seated lateral raise',
  'Dumbbell Curl': 'dumbbell biceps curl', 'Alternating Dumbbell Curl': 'dumbbell alternate biceps curl', 'Hammer Curl': 'dumbbell hammer curl',
  'Incline Dumbbell Curl': 'dumbbell incline curl', 'Incline DB Curl': 'dumbbell incline curl', 'Spider Curl': 'ez barbell spider curl',
  'Tricep Pushdown': 'cable pushdown', 'Cable Tricep Pushdown — Rope': 'cable pushdown (with rope attachment)',
  'Overhead Tricep Extension': 'cable overhead triceps extension (rope attachment)', 'Overhead Tricep Extension — Cable': 'cable overhead triceps extension (rope attachment)',
  'Cable Overhead Extension': 'cable overhead triceps extension (rope attachment)', 'Skull Crushers': 'barbell lying triceps extension skull crusher',
  'Tricep Kickback': 'dumbbell kickback', 'Bench Dip': 'bench dip (knees bent)', 'Tricep Dip — Machine': 'lever overhand triceps dip',
  'Cable Crunch': 'cable kneeling crunch', 'Pallof Press': 'band horizontal pallof press', 'Leg Raises': 'lying leg raise flat bench',
  'Single Leg RDL': 'dumbbell single leg deadlift', 'Reverse Hyperextension': 'lever reverse hyperextension',
  'Turkish Get-Up': 'kettlebell turkish get up (squat style)', "Farmer's Walk": 'farmers walk', 'Farmer Carry': 'farmers walk',
  'Treadmill Incline Walk': 'walking on incline treadmill', 'Med Ball Slams': 'medicine ball overhead slam', 'Renegade Row': 'kettlebell alternating renegade row',
  'Overhead Carry': 'dumbbell single arm overhead carry', 'Wall Push-Up': 'push-up (wall)', 'Neutral-Grip Pull-Up': 'pull up (neutral grip)',
  'Romanian Deadlift — DB': 'dumbbell romanian deadlift', 'Romanian Deadlift': 'barbell romanian deadlift', 'Behind-the-Neck Press': 'standing behind neck press',
  'Pin Press': 'barbell pin presses', 'Incline Machine Chest Press': 'lever incline chest press', 'Decline Machine Chest Press': 'lever decline chest press',
  'Hip Adduction Machine': 'lever seated hip adduction', 'Neutral-Grip Dumbbell Press': 'dumbbell neutral grip bench press', 'Incline Dumbbell Fly': 'dumbbell incline fly',
  'Smith Machine Bench': 'smith bench press', 'Resistance Band Row': 'resistance band seated straight back row', 'Band Chest Press': 'resistance band seated chest press',
  'Upright Row': 'barbell upright row', 'Shrugs': 'barbell shrug', 'Wrist Curl': 'barbell wrist curl', 'Burpees': 'burpee', 'Mountain Climbers': 'mountain climber',
  'Jumping Jacks': 'jack jump (male)', 'Thruster': 'barbell thruster', 'Barbell Clean': 'power clean', 'Hanging Leg Raise': 'hanging leg raise',
  'EZ Bar Curl': 'ez barbell curl', 'Barbell Curl': 'barbell curl', 'Preacher Curl': 'barbell preacher curl', 'Good Morning': 'barbell good morning',
  'Sumo Deadlift': 'barbell sumo deadlift', 'Front Squat': 'barbell front squat', 'Deadlift': 'barbell deadlift', 'Chin-Ups': 'chin-up'
};

export function growLibrary(db, rootDir) {
  const byName = new Map(db.map(e => [e.n, e]));
  const byId = new Map(db.map(e => [e.id, e]));
  const keys = new Map(db.map(e => [keyOf(e.n), e]));
  /* The existing entry this one duplicates, if any. */
  const matchOf = (e) => {
    const direct = byName.get(e.n) || byId.get(e.id) || keys.get(keyOf(e.n));
    if (direct) return direct;
    const hit = keys.get(looseOf(e.n));
    return hit && family(hit) === family(e) ? hit : null;
  };
  const add = (e) => { db.push(e); byName.set(e.n, e); byId.set(e.id, e); keys.set(keyOf(e.n), e); };
  let curated = 0, imported = 0, skipped = 0, media = 0;
  for (const r of ADDITIONS) {
    const e = fromAddition(r);
    if (matchOf(e)) { skipped++; continue; }
    add(e); curated++;
  }
  const file = path.join(rootDir, 'scripts/vendor/exercises-library.en.json');
  if (fs.existsSync(file)) {
    for (const x of JSON.parse(fs.readFileSync(file, 'utf8'))) {
      const e = fromLibrary(x);
      const hit = e ? matchOf(e) : byName.get(MEDIA_ALIAS[String(x.name || '').toLowerCase().trim()]);
      if (hit) {
        if (x.media && !hit.media) { hit.media = x.media; media++; }
        skipped++;
        continue;
      }
      if (!e) { skipped++; continue; }
      add(e); imported++;
    }
  }
  if (fs.existsSync(file)) {
    const rows = new Map(JSON.parse(fs.readFileSync(file, 'utf8')).map(x => [String(x.name || '').toLowerCase().trim(), x]));
    for (const [n, raw] of Object.entries(MEDIA_MAP)) {
      const e = byName.get(n), x = rows.get(raw);
      if (e && x && x.media && !e.media) { e.media = x.media; media++; }
      if (e && !x) console.warn('MEDIA_MAP: no library row "' + raw + '" for ' + n);
    }
  }
  db.forEach(e => { if (e.media === undefined) delete e.media; });
  return { curated, imported, skipped, media };
}
