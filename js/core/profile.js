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
  deriveContext: function() {
    const user = this.get('user') || {};
    const hasPlan = typeof TrainingPlanEngine !== 'undefined' && TrainingPlanEngine.hasActive();
    const plan = hasPlan ? TrainingPlanEngine.get() : null;
    let session = null;
    if (hasPlan && TrainingPlanEngine.todaySession) session = TrainingPlanEngine.todaySession();
    else if (typeof SplitEngine !== 'undefined' && SplitEngine.getSplitDay) session = SplitEngine.getSplitDay();
    const decision = (typeof DailyDecision !== 'undefined' && DailyDecision.decide) ? DailyDecision.decide() : null;
    const readiness = (typeof ReadinessEngine !== 'undefined' && ReadinessEngine.score) ? ReadinessEngine.score() : 70;
    const insight = (typeof CoachKernel !== 'undefined' && CoachKernel.oneThing) ? CoachKernel.oneThing() : null;
    const limitations = this.get('user.limitations') || this.get('user.injuries') || [];
    const equipment = this.get('user.equipment') || this.get('equipment') || [];
    return {
      user: user,
      onboarded: !!this.get('onboarded'),
      plan: plan,
      hasPlan: !!hasPlan,
      session: session,
      decision: decision,
      readiness: readiness,
      insight: insight,
      limitations: Array.isArray(limitations) ? limitations : [],
      equipment: Array.isArray(equipment) ? equipment : [],
      gymDays: user.gymDays || [],
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
