'use strict';
/* Global equipment & machine database — bundled offline, user picks what they have */

window.EquipmentDB = {
  brands: [
    'Life Fitness', 'Technogym', 'Hammer Strength', 'Precor', 'Matrix', 'Cybex',
    'Nautilus', 'Hoist', 'Star Trac', 'Body-Solid', 'Rogue', 'Eleiko', 'No brand / Generic'
  ],

  environments: [
    { id: 'gym', label: 'Commercial Gym', icon: 'dumbbell' },
    { id: 'home', label: 'Home Gym', icon: 'bed' },
    { id: 'outdoor', label: 'Outdoors / Park', icon: 'leaf' },
    { id: 'travel', label: 'Travel / Hotel', icon: 'walk' }
  ],

  /* eqTags map to ExDB.eq values for workout filtering */
  items: [
    { id: 'none', name: 'No Equipment (Bodyweight only)', category: 'bodyweight', eqTags: [], bwOnly: true, env: ['home','outdoor','travel','gym'] },
    { id: 'bands', name: 'Resistance Bands', category: 'accessory', eqTags: ['bands'], env: ['home','travel','gym','outdoor'] },
    { id: 'barbell', name: 'Barbell & Plates', category: 'free_weights', eqTags: ['barbell'], env: ['gym','home'] },
    { id: 'dumbbell', name: 'Dumbbells', category: 'free_weights', eqTags: ['dumbbell'], env: ['gym','home','travel'] },
    { id: 'kettlebell', name: 'Kettlebells', category: 'free_weights', eqTags: ['kettlebell'], env: ['gym','home','outdoor'] },
    { id: 'ez_bar', name: 'EZ Curl Bar', category: 'free_weights', eqTags: ['barbell'], env: ['gym','home'] },
    { id: 'trap_bar', name: 'Trap / Hex Bar', category: 'free_weights', eqTags: ['barbell','machine'], env: ['gym'] },
    { id: 'power_rack', name: 'Power Rack / Squat Rack', category: 'racks', eqTags: ['barbell'], env: ['gym','home'] },
    { id: 'smith', name: 'Smith Machine', category: 'racks', eqTags: ['smith','barbell','machine'], env: ['gym'] },
    { id: 'bench_flat', name: 'Flat Bench', category: 'benches', eqTags: ['barbell','dumbbell'], env: ['gym','home'] },
    { id: 'bench_incline', name: 'Incline / Adjustable Bench', category: 'benches', eqTags: ['barbell','dumbbell'], env: ['gym','home'] },
    { id: 'pullup_bar', name: 'Pull-up / Chin-up Bar', category: 'bodyweight', eqTags: ['bar'], env: ['gym','home','outdoor'] },
    { id: 'dip_station', name: 'Dip Station / Parallel Bars', category: 'bodyweight', eqTags: ['bar'], env: ['gym','outdoor'] },
    { id: 'cable_station', name: 'Cable Machine / Functional Trainer', category: 'cables', eqTags: ['cables'], env: ['gym'] },
    { id: 'lat_pulldown', name: 'Lat Pulldown Machine', category: 'cables', eqTags: ['cables','machine'], env: ['gym'] },
    { id: 'crossover', name: 'Cable Crossover', category: 'cables', eqTags: ['cables'], env: ['gym'] },
    { id: 'leg_press', name: 'Leg Press', category: 'legs', eqTags: ['legpress','machine'], env: ['gym'] },
    { id: 'hack_squat', name: 'Hack Squat Machine', category: 'legs', eqTags: ['machine'], env: ['gym'] },
    { id: 'leg_extension', name: 'Leg Extension', category: 'legs', eqTags: ['machine'], env: ['gym'] },
    { id: 'leg_curl', name: 'Leg Curl (Lying / Seated)', category: 'legs', eqTags: ['machine'], env: ['gym'] },
    { id: 'hip_thrust_machine', name: 'Hip Thrust / Glute Drive Machine', category: 'legs', eqTags: ['machine','barbell'], env: ['gym'] },
    { id: 'calf_machine', name: 'Calf Raise Machine', category: 'legs', eqTags: ['machine'], env: ['gym'] },
    { id: 'chest_press_machine', name: 'Chest Press Machine', category: 'machines', eqTags: ['machine'], env: ['gym'] },
    { id: 'shoulder_press_machine', name: 'Shoulder Press Machine', category: 'machines', eqTags: ['machine'], env: ['gym'] },
    { id: 'pec_deck', name: 'Pec Deck / Fly Machine', category: 'machines', eqTags: ['machine'], env: ['gym'] },
    { id: 'row_machine', name: 'Seated Row Machine', category: 'machines', eqTags: ['machine','cables'], env: ['gym'] },
    { id: 'treadmill', name: 'Treadmill', category: 'cardio', eqTags: [], cardio: true, env: ['gym','home'] },
    { id: 'bike', name: 'Exercise Bike / Spin Bike', category: 'cardio', eqTags: [], cardio: true, env: ['gym','home'] },
    { id: 'rower', name: 'Rowing Machine', category: 'cardio', eqTags: [], cardio: true, env: ['gym'] },
    { id: 'elliptical', name: 'Elliptical', category: 'cardio', eqTags: [], cardio: true, env: ['gym'] },
    { id: 'trx', name: 'TRX / Suspension Trainer', category: 'accessory', eqTags: ['bands','bar'], env: ['gym','home','travel'] },
    { id: 'ghd', name: 'GHD / Back Extension Bench', category: 'accessory', eqTags: [], bwOnly: false, env: ['gym'] },

    /* Life Fitness */
    { id: 'lf_leg_press', name: 'Life Fitness Leg Press', brand: 'Life Fitness', category: 'legs', eqTags: ['legpress','machine'], env: ['gym'] },
    { id: 'lf_chest_press', name: 'Life Fitness Chest Press', brand: 'Life Fitness', category: 'machines', eqTags: ['machine'], env: ['gym'] },
    { id: 'lf_lat_pulldown', name: 'Life Fitness Lat Pulldown', brand: 'Life Fitness', category: 'cables', eqTags: ['cables','machine'], env: ['gym'] },
    { id: 'lf_cable_column', name: 'Life Fitness Dual Cable Column', brand: 'Life Fitness', category: 'cables', eqTags: ['cables'], env: ['gym'] },
    { id: 'lf_leg_ext', name: 'Life Fitness Leg Extension', brand: 'Life Fitness', category: 'legs', eqTags: ['machine'], env: ['gym'] },
    { id: 'lf_leg_curl', name: 'Life Fitness Leg Curl', brand: 'Life Fitness', category: 'legs', eqTags: ['machine'], env: ['gym'] },
    { id: 'lf_shoulder_press', name: 'Life Fitness Shoulder Press', brand: 'Life Fitness', category: 'machines', eqTags: ['machine'], env: ['gym'] },
    { id: 'lf_row', name: 'Life Fitness Seated Row', brand: 'Life Fitness', category: 'machines', eqTags: ['machine','cables'], env: ['gym'] },
    { id: 'lf_pec_deck', name: 'Life Fitness Pec Deck', brand: 'Life Fitness', category: 'machines', eqTags: ['machine'], env: ['gym'] },
    { id: 'lf_hack_squat', name: 'Life Fitness Hack Squat', brand: 'Life Fitness', category: 'legs', eqTags: ['machine'], env: ['gym'] },
    { id: 'lf_assist_dip', name: 'Life Fitness Assist Dip/Chin', brand: 'Life Fitness', category: 'bodyweight', eqTags: ['bar','machine'], env: ['gym'] },
    { id: 'lf_smith', name: 'Life Fitness Smith Machine', brand: 'Life Fitness', category: 'racks', eqTags: ['smith','barbell','machine'], env: ['gym'] },
    { id: 'lf_treadmill', name: 'Life Fitness Treadmill', brand: 'Life Fitness', category: 'cardio', eqTags: [], cardio: true, env: ['gym'] },

    /* Hammer Strength */
    { id: 'hs_chest_press', name: 'Hammer Strength Chest Press', brand: 'Hammer Strength', category: 'machines', eqTags: ['machine'], env: ['gym'] },
    { id: 'hs_incline_press', name: 'Hammer Strength Incline Press', brand: 'Hammer Strength', category: 'machines', eqTags: ['machine'], env: ['gym'] },
    { id: 'hs_row', name: 'Hammer Strength Row', brand: 'Hammer Strength', category: 'machines', eqTags: ['machine'], env: ['gym'] },
    { id: 'hs_leg_press', name: 'Hammer Strength Plate-Loaded Leg Press', brand: 'Hammer Strength', category: 'legs', eqTags: ['legpress','machine'], env: ['gym'] },
    { id: 'hs_decline_press', name: 'Hammer Strength Decline Press', brand: 'Hammer Strength', category: 'machines', eqTags: ['machine'], env: ['gym'] },
    { id: 'hs_shoulder_press', name: 'Hammer Strength Shoulder Press', brand: 'Hammer Strength', category: 'machines', eqTags: ['machine'], env: ['gym'] },
    { id: 'hs_lat_pulldown', name: 'Hammer Strength Lat Pulldown', brand: 'Hammer Strength', category: 'cables', eqTags: ['cables','machine'], env: ['gym'] },
    { id: 'hs_leg_ext', name: 'Hammer Strength Leg Extension', brand: 'Hammer Strength', category: 'legs', eqTags: ['machine'], env: ['gym'] },
    { id: 'hs_leg_curl', name: 'Hammer Strength Lying Leg Curl', brand: 'Hammer Strength', category: 'legs', eqTags: ['machine'], env: ['gym'] },
    { id: 'hs_glute_drive', name: 'Hammer Strength Glute Drive', brand: 'Hammer Strength', category: 'legs', eqTags: ['machine'], env: ['gym'] },

    /* Technogym */
    { id: 'tg_chest_press', name: 'Technogym Chest Press', brand: 'Technogym', category: 'machines', eqTags: ['machine'], env: ['gym'] },
    { id: 'tg_lat_machine', name: 'Technogym Lat Machine', brand: 'Technogym', category: 'cables', eqTags: ['cables','machine'], env: ['gym'] },
    { id: 'tg_leg_press', name: 'Technogym Leg Press', brand: 'Technogym', category: 'legs', eqTags: ['legpress','machine'], env: ['gym'] },
    { id: 'tg_shoulder_press', name: 'Technogym Shoulder Press', brand: 'Technogym', category: 'machines', eqTags: ['machine'], env: ['gym'] },
    { id: 'tg_row', name: 'Technogym Low Row', brand: 'Technogym', category: 'machines', eqTags: ['machine','cables'], env: ['gym'] },
    { id: 'tg_leg_ext', name: 'Technogym Leg Extension', brand: 'Technogym', category: 'legs', eqTags: ['machine'], env: ['gym'] },
    { id: 'tg_leg_curl', name: 'Technogym Leg Curl', brand: 'Technogym', category: 'legs', eqTags: ['machine'], env: ['gym'] },
    { id: 'tg_cable_station', name: 'Technogym Dual Adjustable Pulley', brand: 'Technogym', category: 'cables', eqTags: ['cables'], env: ['gym'] },
    { id: 'tg_smith', name: 'Technogym Smith Machine', brand: 'Technogym', category: 'racks', eqTags: ['smith','barbell','machine'], env: ['gym'] },
    { id: 'tg_bike', name: 'Technogym Bike', brand: 'Technogym', category: 'cardio', eqTags: [], cardio: true, env: ['gym'] },

    /* Precor / Matrix / Cybex generics */
    { id: 'precor_elliptical', name: 'Precor Elliptical', brand: 'Precor', category: 'cardio', eqTags: [], cardio: true, env: ['gym'] },
    { id: 'matrix_treadmill', name: 'Matrix Treadmill', brand: 'Matrix', category: 'cardio', eqTags: [], cardio: true, env: ['gym'] },
    { id: 'cybex_leg_press', name: 'Cybex Leg Press', brand: 'Cybex', category: 'legs', eqTags: ['legpress','machine'], env: ['gym'] }
  ],

  byId(id) { return this.items.find(i => i.id === id); },

  byBrand(brand) {
    if (!brand || brand === 'No brand / Generic') return this.items.filter(i => !i.brand);
    return this.items.filter(i => i.brand === brand);
  },

  byCategory(cat) {
    const cats = {};
    this.items.forEach(i => {
      if (!cats[i.category]) cats[i.category] = [];
      cats[i.category].push(i);
    });
    return cat ? (cats[cat] || []) : cats;
  },

  getUserEqTags() {
    const ids = S.g('user.equipmentIds') || [];
    const tags = new Set();
    ids.forEach(id => {
      const item = this.byId(id);
      if (!item) return;
      if (item.bwOnly) return;
      (item.eqTags || []).forEach(t => tags.add(t));
    });
    if (ids.includes('none')) return { bwOnly: true, tags: [] };
    return { bwOnly: false, tags: [...tags] };
  },

  exerciseMatches(ex) {
    if (typeof Equipment !== 'undefined' && Equipment.canPerform) return Equipment.canPerform(ex);
    const ids = S.g('user.equipmentIds') || [];
    if (!S.g('user.equipmentConfigured') || !ids.length) return true;
    if (ids.includes('none')) return !!ex.bw;
    const { tags, bwOnly } = this.getUserEqTags();
    if (ex.bw) return true;
    if (!ex.eq || !ex.eq.length) return true;
    return ex.eq.some(e => tags.has(e));
  },

  filterExercises(list) {
    return (list || []).filter(ex => this.exerciseMatches(ex));
  }
};
