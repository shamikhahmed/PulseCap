'use strict';
/* Ember engine facade — rotation / progression / stall / deload / readiness / volume.
   Delegates to TrainingPlanEngine + coach-kernel + engines.js. No 1RM. */

const EmberEngine = {
  context: function() {
    return (typeof Profile !== 'undefined') ? Profile.deriveContext() : {};
  },

  todaySession: function() {
    const ctx = this.context();
    return ctx.session || null;
  },

  insight: function() {
    const ctx = this.context();
    return ctx.insight || { title: 'Train as planned', body: 'Log the session. Progress is vs last time on the same lift.' };
  },

  suggestLoad: function(exName) {
    if (typeof AutoregEngine !== 'undefined' && AutoregEngine.nextWeightDelta) {
      return AutoregEngine.nextWeightDelta(exName);
    }
    return { deltaKg: 0, reason: 'Log RPE on working sets to get a next-load suggestion.' };
  },

  skipToday: function() {
    if (typeof SplitEngine !== 'undefined' && SplitEngine.skipToday) return SplitEngine.skipToday();
    return { shifted: false, msg: 'Could not skip — split engine offline.' };
  },

  readiness: function() {
    if (typeof ReadinessEngine !== 'undefined' && ReadinessEngine.score) return ReadinessEngine.score();
    return 70;
  },

  volume: function() {
    if (typeof VolumeLander !== 'undefined' && VolumeLander.report) return VolumeLander.report();
    return { low: [], high: [] };
  },

  isDeload: function() {
    if (typeof TrainingPlanEngine !== 'undefined' && TrainingPlanEngine.isDeloadWeek) {
      if (TrainingPlanEngine.hasActive()) return !!TrainingPlanEngine.isDeloadWeek();
    }
    if (typeof MesocycleEngine !== 'undefined' && MesocycleEngine.summary) {
      return !!MesocycleEngine.summary().deload;
    }
    return false;
  }
};
window.EmberEngine = EmberEngine;
window.Engine = EmberEngine;
