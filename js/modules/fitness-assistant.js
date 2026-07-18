'use strict';
/* ── PulseCap Phase 3 — Offline Fitness Assistant (Chat) ── */

/* ══════════════════════════════════════════════════════
   INTENT DETECTION ENGINE
   Layer 1: keyword match
   Layer 2: intent classification
   Layer 3: context engine (uses live data)
══════════════════════════════════════════════════════ */
const FitnessAssistant = {

  INTENTS: {
    pain: { keywords: ['pain','hurt','hurting','sore','aching','ache','injury','injured','inflamed','strain','sprain'], handler: 'handlePain' },
    plateau: { keywords: ['plateau','stuck','no progress','not progressing','same weight','stagnant','not improving','not getting stronger'], handler: 'handlePlateau' },
    best_exercise: { keywords: ['best exercise','best for','what exercise','what should i do','top exercise','most effective'], handler: 'handleBestExercise' },
    soreness: { keywords: ['why am i sore','doms','delayed onset','sore after','sore muscles','muscle soreness'], handler: 'handleSoreness' },
    recovery: { keywords: ['recover','recovery','rest day','when can i train','how long to recover','how long rest','ready to train'], handler: 'handleRecovery' },
    volume: { keywords: ['how many sets','sets per week','volume','too much volume','enough volume','how much should i train'], handler: 'handleVolume' },
    nutrition: { keywords: ['protein','calories','eat','diet','nutrition','macros','carbs','fat','food','meal'], handler: 'handleNutrition' },
    supplement: { keywords: ['supplement','creatine','protein powder','pre workout','bcaa','whey','vitamin'], handler: 'handleSupplements' },
    deload: { keywords: ['deload','take a break','week off','rest week','overtraining','overtrained','burnout'], handler: 'handleDeload' },
    frequency: { keywords: ['how often','how many times','frequency','how many days','train per week','sessions per week'], handler: 'handleFrequency' },
    beginner: { keywords: ['beginner','just started','new to gym','starting out','first time','novice'], handler: 'handleBeginner' },
    muscle_group: { keywords: ['chest','back','shoulders','legs','arms','biceps','triceps','quads','hamstrings','glutes','calves','abs','core'], handler: 'handleMuscleGroup' },
    warm_up: { keywords: ['warm up','warmup','warm-up','before workout','before training','activation'], handler: 'handleWarmup' },
    stretch: { keywords: ['stretch','stretching','flexibility','tight','stiff','mobility'], handler: 'handleStretch' },
    weight: { keywords: ['how much weight','what weight','increase weight','add weight','too heavy','too light','progression'], handler: 'handleWeight' },
    form: { keywords: ['form','technique','how to','cues','tips for','proper form'], handler: 'handleForm' },
    today: { keywords: ['what today','today','what should i do today','one thing','focus'], handler: 'handleToday' },
    rpe: { keywords: ['rpe','rate of perceived','how hard','effort','autoreg'], handler: 'handleRpe' },
    mesocycle: { keywords: ['mesocycle','block','deload week','training block','periodization','periodisation'], handler: 'handleMeso' },
    joints: { keywords: ['joint budget','joint load','shoulders overloaded','elbows','knee volume'], handler: 'handleJoints' },
    pushpull: { keywords: ['push pull','push:pull','push to pull','ratio','imbalance'], handler: 'handlePushPull' },
    volume_status: { keywords: ['am i behind','volume status','sets this week','on track volume'], handler: 'handleVolumeStatus' },
    status: { keywords: ['status','how am i','overview','summary','report','check in with me'], handler: 'handleStatus' },
  },

  detectIntent: function(message) {
    var self = this;
    var lower = message.toLowerCase();
    var bestIntent = null;
    var bestScore = 0;

    Object.entries(this.INTENTS).forEach(function(entry) {
      var intent = entry[0];
      var config = entry[1];
      var score = config.keywords.filter(function(k) { return lower.includes(k); }).length;
      if (score > bestScore) { bestScore = score; bestIntent = intent; }
    });

    var BODY_PARTS = ['shoulder','elbow','knee','back','wrist','hip','ankle','chest','bicep','tricep','quad','hamstring','glute','calf','neck','forearm'];
    var detectedPart = BODY_PARTS.find(function(p) { return lower.includes(p); });

    return { intent: bestIntent, score: bestScore, bodyPart: detectedPart, raw: message };
  },

  respond: function(message) {
    var detected = this.detectIntent(message);
    var intent = detected.intent;
    var bodyPart = detected.bodyPart;
    var score = detected.score;

    if (!intent || score === 0) return this.handleUnknown(message);

    var handler = this.INTENTS[intent].handler;
    if (this[handler]) return this[handler](message, bodyPart);
    return this.handleUnknown(message);
  },

  handlePain: function(message, bodyPart) {
    var part = bodyPart || 'that area';
    var jointScore = (bodyPart && typeof JointHealthEngine !== 'undefined')
      ? JointHealthEngine.score(bodyPart.replace(' ', '_'))
      : null;

    var recs = [];
    if (jointScore && jointScore.score < 60) {
      recs = recs.concat(jointScore.risks || []).concat(jointScore.warnings || []);
    }

    var volumeNote = '';
    if (bodyPart && typeof InjuryRiskEngine !== 'undefined' && InjuryRiskEngine._jointFrequency) {
      var freq = InjuryRiskEngine._jointFrequency(bodyPart, 14);
      if (freq > 20) volumeNote = ' Over the last 14 days, this area received ' + freq + ' sets of loading.';
    }

    return {
      type: 'warning',
      icon: 'alert',
      title: bodyPart ? (bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)) + ' Pain Analysis' : 'Pain Assessment',
      response: 'Pain during or after training in the ' + part + ' should not be ignored.' + volumeNote + (recs.length ? ' Analysis shows: ' + recs.slice(0, 2).join('. ') + '.' : '') + '\n\nFor acute joint pain: stop the exercise immediately. For muscle soreness (DOMS): light movement accelerates recovery. Never train through sharp or joint pain.',
      actions: ['View Joint Health Monitor', 'View Rehab Protocols'],
      actionTargets: ['injury-risk', 'rehab'],
    };
  },

  handlePlateau: function(message, bodyPart) {
    var ws = S.g('workouts') || [];
    var debt = (typeof RecoveryDebtEngine !== 'undefined') ? RecoveryDebtEngine.calculate() : 50;
    var age = (typeof TrainingAgeEngine !== 'undefined') ? TrainingAgeEngine.calculate() : { tier: 'intermediate', label: 'Intermediate' };

    var causes = [];
    if (debt >= 50) causes.push('High recovery debt (' + debt + '/100) — accumulated fatigue masks strength gains');
    if (ws.length > 0) causes.push('Neural adaptation — your nervous system has adapted to current exercise selection');
    if (age.tier === 'intermediate' || age.tier === 'advanced') causes.push('Training age plateau is normal at ' + age.label + ' level — requires periodization');

    return {
      type: 'analysis',
      icon: 'chart',
      title: 'Plateau Analysis',
      response: 'Strength plateaus have specific causes. ' + (causes.length ? 'Based on your data: ' + causes[0] + '.' : 'Common causes include: insufficient recovery, neural adaptation, poor nutrition timing, or need for program variation.') + '\n\nBreaking a plateau requires changing the stimulus: deload first (50% volume for 1 week), then return with a rep range change, exercise variation, or intensity technique (pause reps, drop sets).',
      actions: ['View Training Intelligence', 'View Recovery Debt'],
      actionTargets: ['training-intel', 'recovery-debt'],
    };
  },

  handleBestExercise: function(message, bodyPart) {
    var part = bodyPart || 'chest';
    var GROUP_MAP = {
      chest: 'Chest', back: 'Back', shoulder: 'Shoulders', bicep: 'Biceps',
      tricep: 'Triceps', quad: 'Quads', hamstring: 'Hamstrings', glute: 'Glutes', calf: 'Calves'
    };
    var group = GROUP_MAP[part] || 'Chest';
    var dna = (typeof ExerciseDNA !== 'undefined' && ExerciseDNA.bestFor) ? ExerciseDNA.bestFor(group) : [];

    var personalNote = '';
    if (dna.length > 0) {
      personalNote = ' Based on YOUR personal data, your best ' + part + ' exercises are: ' + dna.map(function(e, i) { return (i+1) + '. ' + e.name + ' (score: ' + e.score + ')'; }).join(', ') + '.';
    }

    var GENERIC_BEST = {
      chest: 'Incline Dumbbell Press and Barbell Bench Press produce the most hypertrophy for most people. Add Cable Fly for isolation.',
      back: 'Pull-Ups and Barbell Row are the gold standard. Straight-Arm Pulldown for lat isolation.',
      shoulder: 'Overhead Press for mass. Lateral Raise for width. Face Pulls for rear delt health.',
      bicep: 'Incline Dumbbell Curl (maximum stretch) and Barbell Curl. Add Hammer Curl for brachialis.',
      tricep: 'Close Grip Bench Press for mass. Overhead Extension for long head. Pushdown for isolation.',
      quad: 'Back Squat is king. Leg Press for safer high-volume. Hack Squat for quad isolation.',
      hamstring: 'Romanian Deadlift for mass and strength. Nordic Curl for injury prevention. Leg Curl for isolation.',
      glute: 'Hip Thrust is the #1 glute builder. Romanian Deadlift for stretch stimulus. Bulgarian Split Squat for unilateral.',
      calf: 'Standing Calf Raise (gastrocnemius). Seated Calf Raise (soleus). Single-leg with 4-second eccentric.',
    };

    return {
      type: 'recommendation',
      icon: 'gradcap',
      title: 'Best ' + (part.charAt(0).toUpperCase() + part.slice(1)) + ' Exercises',
      response: (GENERIC_BEST[part] || 'Compound movements first, isolation second. Progressive overload on all movements.') + personalNote,
      actions: ['View Exercise DNA Profile', 'Start Workout'],
      actionTargets: ['training-intel', 'workout'],
    };
  },

  handleSoreness: function(message, bodyPart) {
    var part = bodyPart || 'muscles';
    var timeline = (typeof MuscleRecoveryTimeline !== 'undefined') ? MuscleRecoveryTimeline.fullTimeline() : [];
    var soreMuscle = bodyPart ? timeline.find(function(m) { return m.muscle.includes(bodyPart); }) : null;

    return {
      type: 'education',
      icon: 'sparkles',
      title: 'Understanding Muscle Soreness',
      response: 'DOMS (Delayed Onset Muscle Soreness) peaks 24-72 hours after training and is caused by micro-tears in muscle fibers and inflammatory response — not lactic acid.' + (soreMuscle ? ' Your ' + part + ' is currently at ' + soreMuscle.pct + '% recovery.' : '') + '\n\nDOMS is reduced by: light movement (increases blood flow), protein intake (muscle repair), sleep, massage, and contrast showers. It does NOT indicate a better workout.',
      actions: ['View Muscle Recovery Timeline', 'View Body Intelligence'],
      actionTargets: ['body-intelligence', 'body-intelligence'],
    };
  },

  handleRecovery: function(message, bodyPart) {
    var timeline = (typeof MuscleRecoveryTimeline !== 'undefined') ? MuscleRecoveryTimeline.fullTimeline() : [];
    var ready = timeline.filter(function(m) { return m.canTrain; });
    var resting = timeline.filter(function(m) { return !m.canTrain && m.hoursSince !== null; });

    return {
      type: 'data',
      icon: 'clock',
      title: 'Your Current Recovery Status',
      response: (ready.length ? 'Ready to train: ' + ready.map(function(m) { return m.label; }).join(', ') + '. ' : 'No muscle groups fully recovered yet. ') + (resting.length ? 'Still recovering: ' + resting.map(function(m) { return m.label + ' (' + m.pct + '%)'; }).join(', ') + '.' : ''),
      actions: ['View Full Recovery Timeline', 'View Recovery Debt'],
      actionTargets: ['body-intelligence', 'recovery-debt'],
    };
  },

  handleVolume: function(message, bodyPart) {
    var volRecs = (typeof VolumeAllocationEngine !== 'undefined') ? VolumeAllocationEngine.recommendations() : [];
    var part = bodyPart;
    var specific = part ? volRecs.find(function(r) { return r.muscle.toLowerCase().includes(part); }) : null;

    return {
      type: 'education',
      icon: 'chart',
      title: 'Training Volume Guidelines',
      response: specific
        ? part + ': Currently ' + specific.current + ' sets/week. ' + specific.action + '.'
        : 'The research-backed optimal range is 10-20 sets per muscle per week. Below 10 = insufficient stimulus. Above 25 = junk volume. Your personal sweet spot is identified in the Volume Allocation Analysis.',
      actions: ['View Volume Analysis', 'View Training Intelligence'],
      actionTargets: ['training-intel', 'training-intel'],
    };
  },

  handleNutrition: function(message, bodyPart) {
    var stats = S.g('bodyStats') || [];
    var lastStat = stats.length ? stats[stats.length - 1] : null;
    var weight = (lastStat && lastStat.weight) ? lastStat.weight : 80;
    var protein = Math.round(weight * 2.0);

    return {
      type: 'education',
      icon: 'apple',
      title: 'Nutrition for Performance',
      response: 'For muscle building: target ' + protein + 'g protein daily (' + weight + 'kg × 2.0g/kg). Calories: +200-300 surplus for lean bulk. \n\nProtein timing: within 2 hours post-workout for muscle protein synthesis. Creatine monohydrate 5g/day is the most evidence-backed supplement. Carbohydrates fuel training performance — don\'t fear them.',
      actions: ['View Nutrition Tracker'],
      actionTargets: ['nutrition'],
    };
  },

  handleSupplements: function(message, bodyPart) {
    return {
      type: 'education',
      icon: 'pill',
      title: 'Supplement Guide',
      response: 'Evidence-based supplements (in order of impact): 1. Creatine Monohydrate 5g/day — increases strength 5-15%, well-researched. 2. Protein Powder — convenient protein source, no magic. 3. Caffeine 200-400mg pre-workout — performance enhancer. 4. Vitamin D3 if deficient. \n\nEverything else (BCAAs, fat burners, mass gainers) has weak evidence. Whole foods first, supplements fill gaps.',
      actions: ['View Supplement Tracker'],
      actionTargets: ['nutrition'],
    };
  },

  handleDeload: function(message, bodyPart) {
    var debt = (typeof RecoveryDebtEngine !== 'undefined') ? RecoveryDebtEngine.calculate() : 50;
    var ws = S.g('workouts') || [];
    var weekCount = ws.filter(function(w) { return daysAgo(w.date) < 42; }).length;

    return {
      type: 'recommendation',
      icon: 'trendDown',
      title: 'Deload Protocol',
      response: 'Your recovery debt is currently ' + debt + '/100 with ' + weekCount + ' sessions in the last 6 weeks.' + (debt >= 60 ? ' A deload is recommended.' : ' A deload may be beneficial if you feel run down.') + '\n\nProper deload: Keep FREQUENCY the same. Reduce VOLUME by 40-50%. Reduce INTENSITY to 60-70% of normal. Duration: 1 week. Do NOT skip training entirely — this causes more disruption than benefit.',
      actions: ['View Recovery Debt', 'View Recovery'],
      actionTargets: ['recovery-debt', 'recovery'],
    };
  },

  handleFrequency: function(message, bodyPart) {
    var age = (typeof TrainingAgeEngine !== 'undefined') ? TrainingAgeEngine.calculate() : { tier: 'intermediate', label: 'Intermediate' };
    var FREQ_BY_AGE = {
      novice: '3-4 days/week full body or upper/lower split',
      beginner: '4 days/week upper/lower split',
      intermediate: '4-5 days/week PPL or body part split',
      advanced: '5-6 days/week with planned deloads',
      elite: '5-6 days/week with periodized programming',
    };
    return {
      type: 'recommendation',
      icon: 'calendar',
      title: 'Training Frequency for ' + (age.label || 'You'),
      response: 'Based on your training age (' + (age.label || 'intermediate') + '): ' + (FREQ_BY_AGE[age.tier] || '4-5 days/week') + '. Each muscle group should be trained 2x/week minimum for optimal hypertrophy. More frequency works if volume per session is managed.',
      actions: ['View Training Age'],
      actionTargets: ['training-intel'],
    };
  },

  handleBeginner: function(message, bodyPart) {
    return {
      type: 'recommendation',
      icon: 'leaf',
      title: 'Getting Started Right',
      response: 'As a beginner, you have the most to gain. Focus on: 1. Master the big 5: Squat, Deadlift, Bench Press, Overhead Press, Pull-Ups. 2. Progressive overload — add weight when you hit the top of your rep range. 3. 3-4 sessions/week full body or upper/lower. 4. Sleep 8 hours — this is where growth happens. 5. Eat 1.8-2g protein per kg bodyweight. \n\nAvoid: Program hopping. Excessive isolation work. Skipping legs.',
      actions: ['Start a Workout', 'View Coach'],
      actionTargets: ['workout', 'coach'],
    };
  },

  handleMuscleGroup: function(message, bodyPart) {
    var part = bodyPart || 'chest';
    var GROUP_TIPS = {
      chest: 'Priority exercises: Incline Bench for upper chest, Flat Bench for mass, Cable Fly for isolation. 2-3x/week, 12-18 sets.',
      back: 'Two planes: vertical (pull-ups for width) and horizontal (rows for thickness). 2-3x/week, 14-20 sets.',
      shoulder: 'Three heads: press for anterior/medial, lateral raises for width, face pulls for rear. 2-3x/week.',
      bicep: 'Emphasise the stretch position: incline curls, spider curls. 2-3x/week, 10-14 sets.',
      tricep: 'Long head (overhead work) is largest portion. Close grip bench + overhead extension + pushdown. 2-3x/week.',
      quad: 'Knee-dominant movements: squat, hack squat, leg press. Full ROM essential. 1-2x/week, 12-18 sets.',
      hamstring: 'Hip hinge (RDL) and knee flexion (leg curl). Train at long muscle length for max hypertrophy. 1-2x/week.',
      glute: 'Hip thrust is irreplaceable. Add RDL and split squat. 2-3x/week, 16-20 sets.',
      calf: 'High frequency (4-5x/week), full ROM, slow eccentric. Needs more volume than most muscles.',
      core: 'Stability first (plank, dead bug), then dynamic (cable crunch, leg raise). Train 3-4x/week.',
    };
    return {
      type: 'recommendation',
      icon: 'dumbbell',
      title: (part.charAt(0).toUpperCase() + part.slice(1)) + ' Training Guide',
      response: GROUP_TIPS[part] || 'Train this muscle group 2-3x/week with 10-20 sets. Progressive overload on compounds, isolation for detail.',
      actions: ['View Encyclopedia', 'Start Workout'],
      actionTargets: ['encyclopedia', 'workout'],
    };
  },

  handleWarmup: function(message, bodyPart) {
    return {
      type: 'education',
      icon: 'flame',
      title: 'Warmup Protocol',
      response: 'A proper warmup has 3 phases: 1. General warmup (3-5 min cardio to elevate core temperature). 2. Joint mobility (specific to today\'s session). 3. Specific warmup sets (40-50% × 5, 60-70% × 3, then to working weight). \n\nSkipping warmup increases injury risk and reduces performance. The specific warmup also "primes" the neural pathway for your main lifts.',
      actions: ['View Warmup Protocols'],
      actionTargets: ['encyclopedia'],
    };
  },

  handleStretch: function(message, bodyPart) {
    var part = bodyPart || 'muscle';
    return {
      type: 'education',
      icon: 'leaf',
      title: 'Stretching & Mobility',
      response: 'Static stretching AFTER training (not before — reduces strength 5-8% if done pre-workout). Dynamic mobility BEFORE training. PNF stretching (contract-relax) is most effective for increasing range of motion. Hold static stretches 30-60s minimum. The ' + part + ' requires consistent daily work to improve significantly.',
      actions: ['View Stretching Encyclopedia', 'View Mobility Guide'],
      actionTargets: ['encyclopedia', 'encyclopedia'],
    };
  },

  handleWeight: function(message, bodyPart) {
    return {
      type: 'education',
      icon: 'scale',
      title: 'Weight Selection & Progression',
      response: 'Select weight where you reach failure at the TOP of your rep range (e.g., for 8-12 reps, choose weight where rep 12 is very hard). When you can complete all reps with good form, add 2.5kg next session (upper body) or 5kg (lower body). \n\nIf you cannot complete the minimum reps, the weight is too heavy. Ego lifting destroys progress and causes injury.',
      actions: ['Start Workout', 'View Coach'],
      actionTargets: ['workout', 'coach'],
    };
  },

  handleForm: function(message, bodyPart) {
    return {
      type: 'education',
      icon: 'ruler',
      title: 'Form & Technique',
      response: 'Good form prioritises: muscle stretch at the bottom (full ROM), controlled eccentric (2–4s down), full contraction at top, neutral spine on compounds.\n\nLog RPE honestly. Open exercise info in Train for cues/setup/mistakes. Sharp joint pain = stop — open Rehab.',
      actions: ['Train', 'Rehab'],
      actionTargets: ['workout', 'rehab'],
    };
  },

  handleToday: function() {
    var one = (typeof CoachKernel !== 'undefined') ? CoachKernel.oneThing() : null;
    var snap = (typeof CoachKernel !== 'undefined') ? CoachKernel.snapshot() : null;
    return {
      type: 'analysis',
      icon: 'sparkles',
      title: one ? one.title : 'Today',
      response: (one ? one.body : 'Open Today for your daily decision.') +
        (snap ? '\n\nReadiness ' + snap.readiness + '/100 · ' + (snap.meso && snap.meso.label ? snap.meso.label : '') : ''),
      actions: ['Go', 'Ask Smart Coach later'],
      actionTargets: [one && one.go ? one.go : 'dashboard', 'assistant'],
    };
  },

  handleRpe: function() {
    return {
      type: 'info',
      icon: 'chart',
      title: 'RPE & autoreg',
      response: 'Log RPE (5–10) on working sets in the active logger. PulseCap averages recent RPE per lift and adjusts next-session weight suggestions:\n• ≥9.5 → cut 2.5kg\n• ~8.5 → hold\n• ≤6.5 → add 2.5kg\n\nRPE 10 = nothing left. RPE 7 = ~3 reps in reserve.',
      actions: ['Start workout'],
      actionTargets: ['workout'],
    };
  },

  handleMeso: function() {
    var m = (typeof MesocycleEngine !== 'undefined') ? MesocycleEngine.summary() : null;
    return {
      type: 'analysis',
      icon: 'calendar',
      title: 'Training block',
      response: m
        ? (m.label + '\nVolume multiplier ≈ ' + m.multiplier + '×. Deload week cuts volume ~50% while you keep some intensity. Reset the block from Today if you want a fresh 4 weeks.')
        : '4-week mesocycle tracks automatically once you train.',
      actions: ['Today'],
      actionTargets: ['dashboard'],
    };
  },

  handleJoints: function() {
    var rows = (typeof JointBudget !== 'undefined') ? JointBudget.report() : [];
    var lines = rows.map(function(r) {
      return r.joint + ': ' + r.used + '/' + r.cap + ' (' + r.status + ')';
    });
    return {
      type: 'warning',
      icon: 'alert',
      title: 'Joint budget (7 days)',
      response: lines.length
        ? lines.join('\n') + '\n\nOver budget → prefer cables/machines, shorten ROM, or rest that joint.'
        : 'No joint load data yet — keep logging sets.',
      actions: ['Injury risk', 'Rehab'],
      actionTargets: ['injury-risk', 'rehab'],
    };
  },

  handlePushPull: function() {
    var a = (typeof PushPullEngine !== 'undefined') ? PushPullEngine.advice() : { text: 'Need more sessions logged.' };
    return {
      type: 'analysis',
      icon: 'dumbbell',
      title: 'Push : Pull',
      response: a.text + '\nAim near 1:1 weekly for shoulder health. Face pulls and rows fix most desk-worker imbalances.',
      actions: ['Train'],
      actionTargets: ['workout'],
    };
  },

  handleVolumeStatus: function() {
    var r = (typeof VolumeLander !== 'undefined') ? VolumeLander.report() : null;
    if (!r) {
      return { type: 'info', icon: 'chart', title: 'Volume', response: 'Volume lander unavailable.', actions: [], actionTargets: [] };
    }
    var low = r.low.map(function(x) { return x.muscle + ' ' + x.actual + '/' + x.target; }).join(', ') || 'none';
    var high = r.high.map(function(x) { return x.muscle + ' ' + x.actual + '/' + x.target; }).join(', ') || 'none';
    return {
      type: 'analysis',
      icon: 'chart',
      title: 'Weekly volume vs target (' + r.exp + ')',
      response: 'Behind: ' + low + '\nHigh: ' + high + '\n\nTargets scale with experience level in Settings → Profile.',
      actions: ['Train', 'Progress'],
      actionTargets: ['workout', 'progress'],
    };
  },

  handleStatus: function() {
    var s = (typeof CoachKernel !== 'undefined') ? CoachKernel.snapshot() : null;
    if (!s) {
      return { type: 'info', icon: 'sparkles', title: 'Status', response: 'Open Today — engines still loading.', actions: ['Today'], actionTargets: ['dashboard'] };
    }
    var one = CoachKernel.oneThing();
    return {
      type: 'analysis',
      icon: 'sparkles',
      title: 'Full status',
      response: 'Readiness ' + s.readiness + '/100 (raw ' + s.readinessRaw + ')\n' +
        'Decision: ' + (s.decision.title || s.decision.decision) + '\n' +
        s.meso.label + '\n' +
        s.pushPull.text + '\n' +
        'Focus: ' + one.title + ' — ' + one.body,
      actions: ['Today', 'Recovery', 'Train'],
      actionTargets: ['dashboard', 'recovery', 'workout'],
    };
  },

  handleUnknown: function(message) {
    var one = (typeof CoachKernel !== 'undefined') ? CoachKernel.oneThing() : null;
    return {
      type: 'unknown',
      icon: 'sparkles',
      title: 'Try another angle',
      response: (one ? 'Meanwhile — focus: ' + one.title + '. ' + one.body + '\n\n' : '') +
        'I am an offline Smart Coach (rules + your logs — not cloud AI). Try:\n' +
        '• "What should I do today?"\n' +
        '• "Status" / "Am I behind on volume?"\n' +
        '• "Push pull ratio" / "Joint budget"\n' +
        '• "Should I deload?" / "Why is my shoulder hurting?"\n' +
        '• "How much protein do I need?" / "RPE"',
      actions: one ? ['Do that', 'Today'] : ['Today'],
      actionTargets: one ? [one.go || 'dashboard', 'dashboard'] : ['dashboard'],
    };
  },
};
window.FitnessAssistant = FitnessAssistant;

/* ══════════════════════════════════════════════════════
   FITNESS ASSISTANT CHAT SCREEN
══════════════════════════════════════════════════════ */
reg('assistant', function() {
  var history = S.g('assistantHistory') || [];

  var SUGGESTIONS = [
    'What should I do today?',
    'Status',
    'Am I behind on volume?',
    'Push pull ratio',
    'Joint budget',
    'Should I deload?',
    'Why is my shoulder hurting?',
    'How much protein do I need?',
    'Explain RPE',
  ];

  var historyHtml = history.map(function(h) {
    var isUser = h.role === 'user';
    return '<div style="display:flex;' + (isUser ? 'justify-content:flex-end' : 'justify-content:flex-start') + ';margin-bottom:12px;padding:0 16px">' +
      '<div style="max-width:85%;' +
      (isUser
        ? 'background:rgba(var(--c1-rgb),0.2);border:1px solid rgba(var(--c1-rgb),0.3);border-radius:18px 18px 4px 18px;padding:12px 14px'
        : 'background:var(--bg3);border:1px solid var(--border);border-radius:18px 18px 18px 4px;padding:12px 14px') +
      '">' +
      (isUser ? '' : '<div style="color:var(--c1);margin-bottom:6px">' + icon('sparkles', 18) + '</div>') +
      (!isUser && h.title ? '<div style="font-size:12px;font-weight:800;color:var(--c1);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em">' + esc(h.title) + '</div>' : '') +
      '<div style="font-size:13px;color:var(--txt);line-height:1.6;white-space:pre-line">' + esc(h.content) + '</div>' +
      (h.actions && h.actions.length ?
        '<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">' +
        h.actions.map(function(a, i) {
          return '<button type="button" onclick="go(\'' + (h.actionTargets[i] || 'dashboard') + '\')" style="font-size:11px;font-weight:600;color:var(--c1);background:rgba(var(--c1-rgb),0.1);border:1px solid rgba(var(--c1-rgb),0.25);padding:5px 10px;border-radius:8px;cursor:pointer;touch-action:manipulation">' + esc(a) + '</button>';
        }).join('') +
        '</div>' : '') +
      '</div></div>';
  }).join('');

  return '<div class="topbar">' +
    '<div class="topbar-title" style="display:flex;align-items:center;gap:8px"><span style="color:var(--c1);display:inline-flex">' + icon('sparkles', 20) + '</span>Fitness Assistant</div>' +
    '<button type="button" onclick="S.set(\'assistantHistory\',[]);go(\'assistant\')" style="background:none;border:none;color:var(--txt3);font-size:12px;cursor:pointer;padding:0 16px">Clear</button>' +
    '</div>' +

    '<div id="chat-history" style="min-height:300px;padding-bottom:20px">' +
    (history.length === 0 ?
      '<div style="padding:30px 20px;text-align:center">' +
      '<div style="width:72px;height:72px;border-radius:20px;margin:0 auto 14px;display:flex;align-items:center;justify-content:center;background:rgba(var(--c1-rgb),0.12);color:var(--c1)">' + icon('sparkles', 34) + '</div>' +
      '<div style="font-size:16px;font-weight:800;color:var(--txt);margin-bottom:8px">Fitness Assistant</div>' +
      '<div style="font-size:13px;color:var(--txt2);line-height:1.7;max-width:280px;margin:0 auto">Offline Smart Coach — rules + <em>your</em> logs. No cloud AI. Ask about today, volume, joints, pain, protein, RPE, deloads.</div>' +
      '</div>' : historyHtml) +

    (history.length === 0 ?
      '<div style="padding:0 16px;margin-bottom:16px">' +
      '<div style="font-size:11px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:10px">Suggested Questions</div>' +
      '<div style="display:flex;flex-direction:column;gap:6px">' +
      SUGGESTIONS.map(function(s) {
        return '<button type="button" onclick="window.askAssistant(\'' + s.replace(/'/g, "\\'") + '\')" style="text-align:left;padding:10px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:12px;color:var(--txt2);font-size:13px;cursor:pointer;touch-action:manipulation">' + esc(s) + '</button>';
      }).join('') +
      '</div></div>' : '') +
    '</div>' +

    '<div style="position:sticky;bottom:var(--safe);background:var(--bg);border-top:1px solid var(--border);padding:12px 16px;display:flex;gap:10px">' +
    '<input id="assistant-input" class="field" placeholder="Ask your fitness coach..." style="flex:1;font-size:14px" ' +
    'onkeydown="if(event.key===\'Enter\'&&this.value.trim())window.askAssistant(this.value)" />' +
    '<button type="button" onclick="var i=document.getElementById(\'assistant-input\');if(i&&i.value.trim())window.askAssistant(i.value)" ' +
    'style="padding:12px 16px;background:var(--c1);border:none;border-radius:12px;color:#fff;font-size:14px;font-weight:700;cursor:pointer;touch-action:manipulation">→</button>' +
    '</div>';
});

window.askAssistant = function(message) {
  if (!message || !message.trim()) return;
  var history = S.g('assistantHistory') || [];

  history.push({ role: 'user', content: message });

  var response = FitnessAssistant.respond(message);

  history.push({
    role: 'assistant',
    icon: response.icon,
    title: response.title,
    content: response.response,
    actions: response.actions || [],
    actionTargets: response.actionTargets || [],
    type: response.type
  });

  while (history.length > 20) history.shift();
  S.set('assistantHistory', history);

  go('assistant');

  setTimeout(function() {
    var input = document.getElementById('assistant-input');
    if (input) input.value = '';
    var hist = document.getElementById('chat-history');
    if (hist) hist.scrollTop = hist.scrollHeight;
  }, 50);
};
