'use strict';
/* Offline form loops — top-50 compound patterns as SVG cue cards.
   Prefer these over remote wger thumbnails when offline / never synced. */

const FormLoops = (function() {
  const PATTERNS = {
    squat: { cue: 'Brace → sit between hips → drive mid-foot', path: 'M40 20 L40 55 M28 55 Q40 70 52 55 M34 90 L40 55 L46 90' },
    hinge: { cue: 'Soft knees → hips back → bar close → snap hips', path: 'M50 18 L50 48 M36 48 L50 48 L58 70 M42 90 L50 48' },
    press: { cue: 'Ribs down → lock out overhead → elbows stack', path: 'M40 85 L40 50 M28 50 L52 50 M40 50 L40 22 M32 28 L40 18 L48 28' },
    pull: { cue: 'Chest up → elbows drive → squeeze mid-back', path: 'M40 22 L40 70 M28 40 L40 48 L52 40 M34 85 L40 70 L46 85' },
    row: { cue: 'Hinge → pull to hip → pause squeeze', path: 'M55 25 L40 55 L48 90 M28 48 L40 55 L52 42' },
    raise: { cue: 'Slight lean → lead with elbows → control down', path: 'M40 80 L40 50 M40 50 L22 38 M40 50 L58 38' },
    curl: { cue: 'Elbows pinned → full squeeze → no swing', path: 'M40 85 L40 55 M28 55 L40 55 L40 30 L52 28' },
    core: { cue: 'Ribs to pelvis → breathe behind the brace', path: 'M28 40 Q40 55 52 40 M28 55 Q40 70 52 55 M40 30 L40 75' }
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

  function svgFor(patternId) {
    const p = PATTERNS[patternId] || PATTERNS.squat;
    return '<svg viewBox="0 0 80 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      '<rect width="80" height="100" rx="12" fill="rgba(0,213,255,0.06)"/>' +
      '<path d="' + p.path + '" fill="none" stroke="var(--c1,#00d5ff)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">' +
      '<animate attributeName="stroke-opacity" values="0.45;1;0.45" dur="2.4s" repeatCount="indefinite"/>' +
      '</path></svg>';
  }

  function forExercise(name) {
    const id = TOP50[name];
    if (!id) return null;
    const p = PATTERNS[id];
    return {
      pattern: id,
      cue: p.cue,
      svg: svgFor(id),
      offline: true
    };
  }

  function mediaPatch(nameOrEx, media) {
    const name = typeof nameOrEx === 'string' ? nameOrEx : (nameOrEx && nameOrEx.n);
    const loop = forExercise(name);
    if (!loop) return media;
    if (!media.thumb && !media.video) {
      return Object.assign({}, media, {
        thumb: null,
        formLoop: loop,
        formUrl: media.formUrl
      });
    }
    return Object.assign({}, media, { formLoop: loop });
  }

  function cardHTML(nameOrEx, opts) {
    opts = opts || {};
    const name = typeof nameOrEx === 'string' ? nameOrEx : (nameOrEx && nameOrEx.n);
    const loop = forExercise(name);
    if (!loop) return '';
    const h = opts.height || 140;
    return '<div style="border-radius:14px;overflow:hidden;border:1px solid var(--border);background:var(--bg3);margin-bottom:12px">' +
      '<div style="height:' + h + 'px;padding:12px">' + loop.svg + '</div>' +
      '<div style="padding:8px 12px 12px;font-size:12px;color:var(--txt2);line-height:1.4">' +
      '<span style="font-size:10px;font-weight:700;color:var(--c1);text-transform:uppercase;letter-spacing:0.06em">Form loop · offline</span><br>' +
      esc(loop.cue) + '</div></div>';
  }

  return { TOP50: TOP50, forExercise: forExercise, mediaPatch: mediaPatch, cardHTML: cardHTML, count: Object.keys(TOP50).length };
})();
window.FormLoops = FormLoops;
