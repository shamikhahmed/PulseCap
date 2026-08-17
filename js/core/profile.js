'use strict';
/* Ember profile spine — one get/set + deriveContext for every personalization arrow.
   Wraps S; does not replace localStorage. */

const Profile = {
  get: function(path) {
    return typeof S !== 'undefined' && S.g ? S.g(path) : null;
  },
  set: function(path, val) {
    if (typeof S === 'undefined' || !S.set) return false;
    return S.set(path, val);
  },
  snapshot: function() {
    try { return JSON.parse(JSON.stringify((S && S.d) || {})); } catch (e) { return {}; }
  },
  exportJSON: function() {
    return JSON.stringify((S && S.d) || {}, null, 2);
  },
  importObject: function(data) {
    if (!S) throw new Error('Storage not ready');
    const clean = (typeof window._validateBackup === 'function') ? window._validateBackup(data) : data;
    S.d = JSON.parse(JSON.stringify(clean));
    if (typeof S._migrate === 'function') S._migrate();
    return S.save();
  },
  wipeProfile: function() {
    if (!S) return false;
    S.d = { _schemaVersion: S.SCHEMA_VERSION };
    return S.save();
  },

  /* Every screen should read this — not scatter S.g('user.*') forks. */
  experienceGuide: function(exp) {
    const e = exp || 'intermediate';
    const map = {
      beginner: { id: 'beginner', reps: [10, 15], incrementPct: 0.05, targetRpe: 7, rpeCap: 8, note: 'Higher reps, bigger jumps, stay 2–3 reps in reserve.' },
      intermediate: { id: 'intermediate', reps: [8, 12], incrementPct: 0.03, targetRpe: 8, rpeCap: 9, note: 'Double progression around RPE 8.' },
      advanced: { id: 'advanced', reps: [6, 10], incrementPct: 0.025, targetRpe: 8, rpeCap: 9, note: 'Tighter ranges, smaller jumps.' },
      athlete: { id: 'athlete', reps: [5, 8], incrementPct: 0.02, targetRpe: 8, rpeCap: 9, note: 'Small jumps. Tight ranges.' }
    };
    return map[e] || map.intermediate;
  },

  syncNutrition: function() {
    const user = this.get('user') || {};
    if (user.macrosPinned) return typeof NutritionMath !== 'undefined' ? NutritionMath.fromUser(user) : null;
    if (typeof NutritionMath === 'undefined' || !NutritionMath.applyToUser) return null;
    const n = NutritionMath.applyToUser(user);
    this.set('user', user);
    return n;
  },

  deriveContext: function() {
    const user = this.get('user') || {};
    const nutrition = (typeof NutritionMath !== 'undefined' && NutritionMath.fromUser)
      ? NutritionMath.fromUser(user)
      : { calories: user.calorieTarget || 0, protein: user.proteinTarget || 0, line: '' };
    const experience = this.experienceGuide(user.exp);
    const templateMatch = (typeof PlanCatalog !== 'undefined' && PlanCatalog.match) ? PlanCatalog.match(user) : null;
    const hasPlan = typeof TrainingPlanEngine !== 'undefined' && TrainingPlanEngine.hasActive();
    const plan = hasPlan ? TrainingPlanEngine.get() : null;
    let session = null;
    if (hasPlan && TrainingPlanEngine.todaySession) session = TrainingPlanEngine.todaySession();
    else if (typeof SplitEngine !== 'undefined' && SplitEngine.getSplitDay) session = SplitEngine.getSplitDay();
    const decision = (typeof DailyDecision !== 'undefined' && DailyDecision.decide) ? DailyDecision.decide() : null;
    const readinessRaw = (typeof ReadinessEngine !== 'undefined' && ReadinessEngine.score) ? ReadinessEngine.score() : 70;
    const workouts = this.get('workouts') || [];
    const readinessDisplay = (typeof ReadinessEngine !== 'undefined' && ReadinessEngine.display)
      ? ReadinessEngine.display()
      : { word: workouts.length >= 3 ? 'Ready' : 'Ready', hideScore: workouts.length < 3, score: readinessRaw };
    const insight = (typeof CoachKernel !== 'undefined' && CoachKernel.oneThing) ? CoachKernel.oneThing() : null;
    const limitations = this.get('user.limitations') || this.get('user.injuries') || [];
    const equipment = Array.isArray(user.equipment) && user.equipment.length
      ? user.equipment
      : ((typeof Equipment !== 'undefined' && Equipment.tagsForKit) ? Equipment.tagsForKit(user.equipmentKit || 'full_gym') : []);
    return {
      user: user,
      onboarded: !!this.get('onboarded'),
      plan: plan,
      hasPlan: !!hasPlan,
      session: session,
      decision: decision,
      readiness: readinessRaw,
      readinessDisplay: readinessDisplay,
      insight: insight,
      limitations: Array.isArray(limitations) ? limitations : [],
      equipment: Array.isArray(equipment) ? equipment : [],
      equipmentKit: user.equipmentKit || null,
      nutrition: nutrition,
      calories: nutrition.calories,
      protein: nutrition.protein,
      experience: experience,
      templateMatch: templateMatch,
      gymDays: user.gymDays || [],
      daysPerWeek: Number(user.daysPerWeek || user.weeklyGoal) || 0,
      ownerSeed: !!this.get('settings.ownerSeed'),
      gymFloor: !!user.gymFloorMode
    };
  }
};
window.Profile = Profile;

/** ?owner=1 — install machine-only PPL + shoulder cautions (also a public template). */
function bootOwnerSeed() {
  try {
    const q = new URLSearchParams(location.search);
    if (q.get('owner') !== '1') return false;
    if (Profile.get('settings.ownerSeed') && typeof TrainingPlanEngine !== 'undefined' && TrainingPlanEngine.hasActive()) {
      return true;
    }
    Profile.set('onboarded', true);
    const name = Profile.get('user.name');
    if (!name) Profile.set('user.name', 'Owner');
    Profile.set('user.gymFloorMode', true);
    Profile.set('user.equipmentKit', 'machines_cables');
    Profile.set('user.equipmentConfigured', true);
    Profile.set('user.daysPerWeek', 6);
    Profile.set('user.weeklyGoal', 6);
    if (typeof Equipment !== 'undefined' && Equipment.tagsForKit) {
      Profile.set('user.equipment', Equipment.tagsForKit('machines_cables'));
    }
    Profile.set('user.limitations', [{
      id: 'shoulder',
      joint: 'shoulder',
      note: 'Shoulder-safe: machines, cables, Smith. No overhead barbell. Stop on sharp pain or clunk.'
    }]);
    Profile.set('user.injuries', [{
      id: 'shoulder',
      joint: 'shoulder',
      bodyPart: 'shoulder',
      severity: 1,
      recovered: false
    }]);
    if (typeof TrainingPlanEngine !== 'undefined' && !TrainingPlanEngine.hasActive()) {
      TrainingPlanEngine.installTemplate('machine_ppl_shoulder', { acknowledgedSafety: true });
    }
    Profile.set('settings.ownerSeed', true);
    return true;
  } catch (e) {
    console.error('owner seed', e);
    return false;
  }
}
window.bootOwnerSeed = bootOwnerSeed;
