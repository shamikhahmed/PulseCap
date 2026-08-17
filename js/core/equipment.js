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
      let j;
      if (typeof InjuriesDB !== 'undefined' && InjuriesDB.jointFrom) {
        j = InjuriesDB.jointFrom(l);
      } else {
        j = String((typeof l === 'string' ? l : (l.joint || l.id || '')) || '').toLowerCase().replace('low back', 'low_back');
        if (j === 'low_back') j = 'spine';
      }
      if (!j || seen[j]) return;
      seen[j] = true;
      const msg = Equipment.CAUTIONS[j] || Equipment.CAUTIONS[j === 'spine' ? 'low_back' : j];
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

  /* Machine *type* is the key. Brand is a label, never a hard blocker. */
  typeFromName: function(name) {
    const n = String(name || '').toLowerCase();
    if (/leg press/.test(n) && !/calf/.test(n)) return 'leg_press';
    if (/lat pulldown|lat pull-down|lat machine/.test(n)) return 'lat_pulldown';
    if (/pec deck|pec-deck/.test(n)) return 'pec_deck';
    if (/hack squat/.test(n)) return 'hack_squat';
    if (/chest press/.test(n)) return 'chest_press';
    if (/incline press/.test(n) && /machine|hammer|strength/.test(n)) return 'incline_press';
    if (/decline press/.test(n) && /machine|hammer|strength/.test(n)) return 'decline_press';
    if (/shoulder press/.test(n) && /machine|hammer|life|techno|cybex/.test(n)) return 'shoulder_press';
    if (/leg extension/.test(n)) return 'leg_extension';
    if (/leg curl/.test(n)) return 'leg_curl';
    if (/seated row|low row|row machine/.test(n)) return 'seated_row';
    if (/\bsmith\b/.test(n)) return 'smith';
    if (/cable crossover|cable cross-over|functional trainer|dual adjustable|cable column|cable station/.test(n)) return 'cable_station';
    if (/assisted (pull|chin|dip)|assist dip/.test(n)) return 'assisted_pullup';
    if (/hip thrust|glute drive/.test(n) && /machine/.test(n)) return 'hip_thrust';
    if (/calf/.test(n) && /machine/.test(n)) return 'calf_raise';
    if (/preacher/.test(n)) return 'preacher_curl';
    if (/lateral raise machine/.test(n)) return 'lateral_raise';
    if (/rear delt machine/.test(n)) return 'rear_delt';
    if (/trap bar|hex bar/.test(n)) return 'trap_bar';
    if (/\bghd\b|back extension bench/.test(n)) return 'ghd';
    return null;
  },

  needTypes: function(ex) {
    if (ex && ex.machineType) return [].concat(ex.machineType);
    const n = String((ex && ex.n) || '').toLowerCase();
    const t = this.typeFromName(n);
    if (t === 'lat_pulldown') return ['lat_pulldown', 'cable_station'];
    if (t === 'seated_row') return ['seated_row', 'cable_station'];
    if (t) return [t];
    if (/cable (fly|crossover|cross-over)/.test(n)) return ['cable_crossover', 'cable_station'];
    if (/seated cable row|cable row/.test(n)) return ['seated_row', 'cable_station'];
    if (/straight-arm pulldown|straight arm pulldown/.test(n)) return ['lat_pulldown', 'cable_station'];
    if (/machine chest press|chest press machine/.test(n)) return ['chest_press'];
    if (/machine shoulder press|shoulder press machine/.test(n)) return ['shoulder_press'];
    if (/cable fly/.test(n)) return ['cable_station', 'cable_crossover'];
    return null;
  },

  _specificIds: function(user) {
    const ids = (user && user.equipmentIds) || [];
    return Array.isArray(ids) ? ids.filter(Boolean) : [];
  },

  usesSpecificKit: function(profile) {
    const ctx = this._profile(profile);
    return this._specificIds(ctx.user).length > 0;
  },

  selectedSet: function(profile) {
    const ctx = this._profile(profile);
    const ids = this._specificIds(ctx.user);
    const types = {};
    const tags = {};
    let bwOnly = false;
    const self = this;
    ids.forEach(function(id) {
      if (id === 'none') { bwOnly = true; return; }
      const item = (typeof EquipmentDB !== 'undefined' && EquipmentDB.byId) ? EquipmentDB.byId(id) : null;
      if (!item) {
        types[id] = true;
        return;
      }
      if (item.bwOnly) { bwOnly = true; return; }
      const t = item.type || self.typeFromName(item.name) || item.id;
      if (t) types[t] = true;
      (item.eqTags || []).forEach(function(tag) { tags[String(tag).toLowerCase()] = true; });
    });
    if (bwOnly && ids.filter(function(id) { return id !== 'none'; }).length === 0) {
      return { types: types, tags: tags, bwOnly: true, ids: ids };
    }
    return { types: types, tags: tags, bwOnly: false, ids: ids };
  },

  loadedGaps: function(profile) {
    const open = this.availableExercises(profile).filter(function(ex) { return !ex.bw; });
    const groups = [
      { id: 'chest', match: function(e) { return e.grp === 'chest'; } },
      { id: 'back', match: function(e) { return e.grp === 'back'; } },
      { id: 'legs', match: function(e) { return e.grp === 'legs' || e.grp === 'glutes'; } },
      { id: 'shoulders', match: function(e) { return e.grp === 'shoulders'; } },
      { id: 'arms', match: function(e) { return e.grp === 'biceps' || e.grp === 'triceps'; } }
    ];
    return groups.filter(function(g) { return !open.some(g.match); }).map(function(g) { return g.id; });
  },

  gapBanner: function(profile) {
    if (!this.usesSpecificKit(profile)) return '';
    const gaps = this.loadedGaps(profile);
    if (!gaps.length) return '';
    const labels = { chest: 'chest', back: 'back', legs: 'legs', shoulders: 'shoulders', arms: 'arms' };
    const list = gaps.map(function(g) { return labels[g] || g; }).join(', ');
    const msg = 'Your selected machines do not cover loaded ' + list +
      ' work. Bodyweight moves stay available. Add a matching machine or free weights, or use the closest alternatives shown in the session.';
    return '<div class="banner banner--caution" style="margin:8px 16px">' +
      (typeof esc === 'function' ? esc(msg) : msg) + '</div>';
  },

  alternativesForDay: function(day, profile) {
    const muscles = (day && day.muscles) || [];
    const open = this.availableExercises(profile);
    const picked = [];
    const seen = {};
    open.forEach(function(ex) {
      if (picked.length >= 6) return;
      const grp = ex.grp || '';
      const hit = !muscles.length || muscles.indexOf(grp) >= 0 || muscles.indexOf('full_body') >= 0 ||
        (grp === 'glutes' && muscles.indexOf('legs') >= 0);
      if (!hit || seen[ex.n]) return;
      seen[ex.n] = true;
      picked.push(ex.n);
    });
    return picked;
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

    let ex = exercise;
    if (typeof exercise === 'string') {
      ex = (typeof ExDB !== 'undefined' && ExDB.byName) ? ExDB.byName(exercise) : null;
    }

    if (this.usesSpecificKit(ctx)) {
      const sel = this.selectedSet(ctx);
      if (sel.bwOnly) {
        if (!ex) {
          const n = String(exercise || '').toLowerCase();
          return !(/\bbarbell\b|dumbbell|machine|cable|smith|leg press|lat pulldown/.test(n));
        }
        return !!ex.bw;
      }
      if (!ex) {
        const n = String(exercise || '').toLowerCase();
        const t = this.typeFromName(n);
        if (t) return !!sel.types[t];
        if (/\bbarbell\b/.test(n)) return !!sel.tags.barbell;
        if (/dumbbell/.test(n)) return !!sel.tags.dumbbell;
        return true;
      }
      if (ex.bw) return true;
      const needs = this.needTypes(ex);
      if (needs && needs.length) {
        for (let i = 0; i < needs.length; i++) {
          if (sel.types[needs[i]]) return true;
        }
        return false;
      }
      const eq = Array.isArray(ex.eq) ? ex.eq : [];
      if (!eq.length) return true;
      if (eq.indexOf('machine') >= 0 || eq.indexOf('cables') >= 0 || eq.indexOf('cable') >= 0 || eq.indexOf('smith') >= 0 || eq.indexOf('legpress') >= 0) {
        return false;
      }
      for (let j = 0; j < eq.length; j++) {
        if (sel.tags[String(eq[j]).toLowerCase()]) return true;
      }
      return false;
    }

    const configured = !!(user.equipmentConfigured || kitId);
    if (!configured) return true;
    const tags = Array.isArray(user.equipment) && user.equipment.length
      ? user.equipment
      : this.tagsForKit(kitId || 'full_gym');
    const allow = {};
    tags.forEach(function(t) { allow[String(t).toLowerCase()] = true; });

    if (typeof exercise === 'string' && !ex) {
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
    const user = ctx.user || {};
    const joints = {};
    const add = function(raw) {
      if (raw == null) return;
      if (typeof raw === 'object' && raw.recovered) return;
      let j;
      if (typeof InjuriesDB !== 'undefined' && InjuriesDB.jointFrom) {
        j = InjuriesDB.jointFrom(raw);
      } else {
        j = String((typeof raw === 'string' ? raw : (raw.joint || raw.id || '')) || '').toLowerCase()
          .replace('low_back', 'spine').replace('low back', 'spine');
      }
      if (j) joints[j] = true;
    };
    (ctx.limitations || []).forEach(add);
    (user.limitations || []).forEach(add);
    (user.injuries || []).forEach(add);
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
    S.set('user.equipmentIds', []);
    return kit;
  }
};
window.Equipment = Equipment;
window.availableExercises = function(p) { return Equipment.availableExercises(p); };
window.canPerform = function(ex, p) { return Equipment.canPerform(ex, p); };
