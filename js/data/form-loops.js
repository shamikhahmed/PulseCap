'use strict';
/* Form cues — honest offline coaching cards for top compounds.
   Pattern diagrams + text cues (NOT video demos). Prefer ExDB cues when present.
   Real form video still comes from wger cache when user downloads the library. */

const FormLoops = (function() {
  const PATTERNS = {
    squat: { label: 'Squat pattern', cue: 'Brace → sit between hips → drive mid-foot' },
    hinge: { label: 'Hinge pattern', cue: 'Soft knees → hips back → bar close → snap hips' },
    press: { label: 'Press pattern', cue: 'Ribs down → lock out → elbows stack' },
    pull:  { label: 'Vertical pull', cue: 'Chest up → elbows drive → squeeze mid-back' },
    row:   { label: 'Horizontal pull', cue: 'Hinge → pull to hip → pause squeeze' },
    raise: { label: 'Raise pattern', cue: 'Slight lean → lead with elbows → control down' },
    curl:  { label: 'Arm isolation', cue: 'Elbows pinned → full squeeze → no swing' },
    core:  { label: 'Core brace', cue: 'Ribs to pelvis → breathe behind the brace' }
  };

  const TOP50 = {
    'Back Squat': 'squat', 'Front Squat': 'squat', 'Goblet Squat': 'squat', 'Hack Squat': 'squat',
    'Bulgarian Split Squat': 'squat', 'Leg Press': 'squat', 'Walking Lunge': 'squat',
    'Deadlift': 'hinge', 'Romanian Deadlift': 'hinge', 'Stiff Leg Deadlift': 'hinge',
    'Good Morning': 'hinge', 'Hip Thrust': 'hinge', 'Glute Bridge': 'hinge',
    'Barbell Bench Press': 'press', 'Incline Bench Press': 'press', 'Dumbbell Bench Press': 'press',
    'Overhead Press': 'press', 'Dumbbell Shoulder Press': 'press', 'Push-Ups': 'press',
    'Dips': 'press', 'Close Grip Bench Press': 'press',
    'Pull-Ups': 'pull', 'Chin-Ups': 'pull', 'Lat Pulldown': 'pull', 'Assisted Pull-Up': 'pull',
    'Barbell Row': 'row', 'Pendlay Row': 'row', 'Dumbbell Row': 'row', 'Seated Cable Row': 'row',
    'T-Bar Row': 'row', 'Chest Supported Row': 'row',
    'Lateral Raise': 'raise', 'Cable Lateral Raise': 'raise', 'Face Pulls': 'raise',
    'Rear Delt Fly': 'raise', 'Dumbbell Fly': 'raise', 'Cable Fly': 'raise',
    'Barbell Curl': 'curl', 'Dumbbell Curl': 'curl', 'Hammer Curl': 'curl', 'EZ Bar Curl': 'curl',
    'Tricep Pushdown': 'curl', 'Skull Crusher': 'curl', 'Overhead Tricep Extension': 'curl',
    'Plank': 'core', 'Hanging Leg Raise': 'core', 'Ab Wheel Rollout': 'core',
    'Cable Crunch': 'core', 'Calf Raise': 'squat', 'Seated Calf Raise': 'squat'
  };

  /* Barbell compounds that get plate calc + warm-up ramp */
  const BARBELL = {
    'Back Squat':1, 'Front Squat':1, 'Deadlift':1, 'Romanian Deadlift':1,
    'Barbell Bench Press':1, 'Incline Bench Press':1, 'Close Grip Bench Press':1,
    'Overhead Press':1, 'Barbell Row':1, 'Pendlay Row':1, 'Good Morning':1,
    'Stiff Leg Deadlift':1, 'Squat':1, 'Bench Press':1, 'Flat Barbell Bench Press':1
  };

  function forExercise(name) {
    const id = TOP50[name];
    if (!id) return null;
    const p = PATTERNS[id];
    const ex = typeof ExDB !== 'undefined' ? ExDB.byName(name) : null;
    return {
      pattern: id,
      label: p.label,
      cue: (ex && ex.cues) ? ex.cues : p.cue,
      setup: ex && ex.setup ? ex.setup : '',
      mistakes: ex && ex.mistakes ? ex.mistakes : '',
      offline: true
    };
  }

  function isBarbell(name) {
    if (BARBELL[name]) return true;
    const ex = typeof ExDB !== 'undefined' ? ExDB.byName(name) : null;
    if (ex && ex.eq && ex.eq.indexOf('barbell') >= 0) return true;
    return /barbell|deadlift|squat|bench press|overhead press|pendlay/i.test(name || '') &&
      !/hack|leg press|goblet|dumbbell|cable|machine|smith/i.test(name || '');
  }

  function cardHTML(nameOrEx, opts) {
    opts = opts || {};
    const name = typeof nameOrEx === 'string' ? nameOrEx : (nameOrEx && nameOrEx.n);
    const loop = forExercise(name);
    if (!loop) return '';
    const escFn = typeof esc === 'function' ? esc : function(s) { return String(s || ''); };
    return '<div style="border-radius:14px;overflow:hidden;border:1px solid var(--border);background:var(--bg3);margin-bottom:12px;padding:14px 16px">' +
      '<div style="font-size:10px;font-weight:700;color:var(--c1);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px">' +
      escFn(loop.label) + ' · form cues</div>' +
      '<div style="font-size:14px;font-weight:700;color:var(--txt);line-height:1.4;margin-bottom:8px">' + escFn(loop.cue) + '</div>' +
      (loop.setup ? '<div style="font-size:12px;color:var(--txt2);line-height:1.45;margin-bottom:6px"><strong class="c-muted">Setup</strong> — ' + escFn(loop.setup) + '</div>' : '') +
      (loop.mistakes ? '<div style="font-size:12px;color:var(--txt2);line-height:1.45"><strong class="c-muted">Avoid</strong> — ' + escFn(loop.mistakes) + '</div>' : '') +
      '<div style="font-size:11px;color:var(--txt3);margin-top:10px;line-height:1.4">Offline coaching card — not a video. Download the exercise library once for form clips.</div>' +
      '</div>';
  }

  return {
    TOP50: TOP50,
    forExercise: forExercise,
    cardHTML: cardHTML,
    isBarbell: isBarbell,
    count: Object.keys(TOP50).length
  };
})();
window.FormLoops = FormLoops;
window.isBarbellExercise = function(name) {
  return typeof FormLoops !== 'undefined' && FormLoops.isBarbell(name);
};
