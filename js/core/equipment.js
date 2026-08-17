'use strict';
/* Equipment + joint filters for library, plans, and Swap. */

const Equipment = {
  KITS: {
    full_gym: {
      id: 'full_gym',
      label: 'Full gym',
      tags: ['barbell', 'dumbbell', 'machine', 'cables', 'cable', 'smith', 'bar', 'bands', 'kettlebell', 'legpress']
    },
    machines_cables: {
      id: 'machines_cables',
      label: 'Machines + cables',
      tags: ['machine', 'cables', 'cable', 'smith', 'bar', 'bands']
    },
    dumbbells: {
      id: 'dumbbells',
      label: 'Dumbbells only',
      tags: ['dumbbell', 'bands']
    },
    home_minimal: {
      id: 'home_minimal',
      label: 'Home minimal',
      tags: ['bands']
    }
  },

  JOINTS: ['shoulder', 'knee', 'spine', 'wrist', 'elbow', 'hip', 'neck', 'ankle'],
  CAUTIONS: {
    shoulder: 'Shoulder caution: stop on sharp pain or clunk. Prefer listed alternatives.',
    knee: 'Knee caution: control depth. Do not grind through pain.',
    spine: 'Low-back caution: brace. Skip max-effort spinal loading.',
    low_back: 'Low-back caution: brace. Skip max-effort spinal loading.',
    wrist: 'Wrist caution: keep a neutral wrist. Skip loaded extension if it bites.',
    elbow: 'Elbow caution: ease off lockout and skull-crushers if it niggles.',
    hip: 'Hip caution: control depth. Stop on pinch or catch.',
    neck: 'Neck caution: no craning or behind-neck loading.',
    ankle: 'Ankle caution: skip jumps and loaded dorsiflexion if it pinches.'
  },
  cautionBanner: function(limitations) {
    const seen = {};
    const lines = [];
    (limitations || []).forEach(function(l) {
      let j = String((typeof l === 'string' ? l : (l.joint || l.id || '')) || '').toLowerCase().replace('low back', 'low_back');
      if (j === 'low_back') j = 'spine';
      if (!j || seen[j]) return;
      seen[j] = true;
      const msg = Equipment.CAUTIONS[j];
      if (msg) lines.push(msg);
    });
    if (!lines.length) return '';
    lines.push('A recurring or undiagnosed joint problem needs a doctor or physio. This is not a diagnosis.');
    return '<div class="banner banner--caution" style="margin:8px 16px">' + lines.map(function(t) {
      return '<div>' + (typeof esc === 'function' ? esc(t) : t) + '</div>';
    }).join('') + '</div>';
  },

  tagsForKit: function(kitId) {
    const kit = this.KITS[kitId] || this.KITS.full_gym;
    return kit.tags.slice();
  },

  _profile: function(profile) {
    if (profile && profile.user) return profile;
    if (profile && (profile.equipmentKit || profile.equipment || profile.limitations || profile.weight)) {
      return { user: profile, equipment: profile.equipment || [], limitations: profile.limitations || [] };
    }
    const user = (typeof S !== 'undefined' && S.g) ? (S.g('user') || {}) : {};
    return { user: user, equipment: user.equipment || [], limitations: user.limitations || user.injuries || [] };
  },

  canPerform: function(exercise, profile) {
    const ctx = this._profile(profile);
    const user = ctx.user || {};
    const kitId = user.equipmentKit || ctx.equipmentKit;
    const configured = !!(user.equipmentConfigured || kitId);
    if (!configured) return true;
    const tags = Array.isArray(user.equipment) && user.equipment.length
      ? user.equipment
      : this.tagsForKit(kitId || 'full_gym');
    const allow = {};
    tags.forEach(function(t) { allow[String(t).toLowerCase()] = true; });

    let ex = exercise;
    if (typeof exercise === 'string') {
      ex = (typeof ExDB !== 'undefined' && ExDB.byName) ? ExDB.byName(exercise) : null;
      if (!ex) {
        const n = exercise.toLowerCase();
        if (kitId === 'home_minimal') {
          if (/\bbarbell\b|\bdeadlift\b|bench press|overhead press|leg press|smith|lat pulldown|cable row|dumbbell|goblet/.test(n)) return false;
        }
        if (kitId === 'dumbbells') {
          if (/\bbarbell\b|\bdeadlift\b|leg press|smith|lat pulldown/.test(n) && !/dumbbell/.test(n)) return false;
        }
        if (kitId === 'machines_cables') {
          if (/\bbarbell row\b|\bdeadlift\b|overhead press|back squat|bench press/.test(n) && !/machine|smith|cable/.test(n)) return false;
        }
        return true;
      }
    }
    if (!ex) return true;
    if (ex.bw) return true;
    const eq = Array.isArray(ex.eq) ? ex.eq : [];
    if (!eq.length) return true;
    for (let i = 0; i < eq.length; i++) {
      if (allow[String(eq[i]).toLowerCase()]) return true;
    }
    return false;
  },

  jointOk: function(exercise, profile) {
    const ctx = this._profile(profile);
    const lims = ctx.limitations || (ctx.user && ctx.user.limitations) || [];
    const joints = {};
    (lims || []).forEach(function(l) {
      const j = String((typeof l === 'string' ? l : (l.joint || l.id || '')) || '').toLowerCase().replace('low_back', 'spine').replace('low back', 'spine');
      if (j) joints[j] = true;
      if (j === 'low_back') joints.spine = true;
    });
    if (!Object.keys(joints).length) return true;
    let ex = exercise;
    if (typeof exercise === 'string') {
      ex = (typeof ExDB !== 'undefined' && ExDB.byName) ? ExDB.byName(exercise) : null;
    }
    if (!ex || !ex.joint) return true;
    const stress = ex.joint;
    if (joints.shoulder && (stress.shoulder || 0) >= 3) return false;
    if (joints.knee && (stress.knee || 0) >= 3) return false;
    if ((joints.spine || joints.low_back) && (stress.spine || 0) >= 3) return false;
    if (joints.wrist && (stress.wrist || 0) >= 3) return false;
    if (joints.elbow && (stress.elbow || 0) >= 3) return false;
    if (joints.hip && (stress.hip || 0) >= 3) return false;
    if (joints.neck && (stress.neck || 0) >= 3) return false;
    if (joints.ankle && (stress.ankle || 0) >= 3) return false;
    return true;
  },

  availableExercises: function(profile) {
    const self = this;
    if (typeof ExDB === 'undefined' || !ExDB.db) return [];
    return ExDB.db.filter(function(ex) {
      return self.canPerform(ex, profile) && self.jointOk(ex, profile);
    });
  },

  applyKit: function(kitId) {
    const kit = this.KITS[kitId] || this.KITS.full_gym;
    if (typeof S === 'undefined' || !S.set) return kit;
    S.set('user.equipmentKit', kit.id);
    S.set('user.equipment', kit.tags.slice());
    S.set('user.equipmentConfigured', true);
    return kit;
  }
};
window.Equipment = Equipment;
window.availableExercises = function(p) { return Equipment.availableExercises(p); };
window.canPerform = function(ex, p) { return Equipment.canPerform(ex, p); };
