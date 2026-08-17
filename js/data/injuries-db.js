'use strict';
/* Canonical limitation model = 8 joints (same as Equipment.JOINTS).
   Named rows (tennis_elbow, left_shoulder, rotator_cuff, …) map onto those
   eight. Left/right is educational copy only — the filter is bilateral.
   Rehab encyclopedia (INJURY_DB) also maps here via jointFrom. */

window.InjuriesDB = {
  CANONICAL: ['shoulder', 'knee', 'spine', 'wrist', 'elbow', 'hip', 'neck', 'ankle'],
  ALIAS: {
    left_shoulder: 'shoulder', right_shoulder: 'shoulder', rotator_cuff: 'shoulder',
    rotator_cuff_tear: 'shoulder', shoulder_dislocation: 'shoulder', shoulder_impingement: 'shoulder',
    left_knee: 'knee', right_knee: 'knee', runners_knee: 'knee', patellar_tendinitis: 'knee',
    acl_tear: 'knee', meniscus_tear: 'knee', quad_strain: 'knee',
    lower_back: 'spine', upper_back: 'spine', herniated_disc: 'spine', lower_back_strain: 'spine',
    low_back: 'spine', lowback: 'spine',
    left_wrist: 'wrist', right_wrist: 'wrist', wrist_sprain: 'wrist',
    left_elbow: 'elbow', right_elbow: 'elbow', tennis_elbow: 'elbow', golfers_elbow: 'elbow',
    bicep_tendon_tear: 'elbow',
    left_hip: 'hip', right_hip: 'hip', hamstring_strain: 'hip', hip_flexor_strain: 'hip', groin_strain: 'hip',
    left_ankle: 'ankle', right_ankle: 'ankle', plantar_fasciitis: 'ankle',
    ankle_sprain_mild: 'ankle', ankle_sprain_severe: 'ankle', achilles_tendinopathy: 'ankle', shin_splints: 'ankle'
  },

  jointFrom: function(raw) {
    if (raw == null) return null;
    let id = '';
    let joint = '';
    if (typeof raw === 'string') {
      id = raw.toLowerCase();
    } else {
      joint = String(raw.joint || '').toLowerCase();
      id = String(raw.id || raw.bodyPart || '').toLowerCase();
    }
    const strip = function(s) {
      return String(s || '').toLowerCase()
        .replace(/^left[_ -]?/, '').replace(/^right[_ -]?/, '')
        .replace(/\s+/g, '_').replace('low_back', 'spine').replace('lowback', 'spine');
    };
    const cand = [joint, id, strip(joint), strip(id)];
    for (let i = 0; i < cand.length; i++) {
      const k = cand[i];
      if (!k) continue;
      if (InjuriesDB.CANONICAL.indexOf(k) >= 0) return k;
      if (InjuriesDB.ALIAS[k]) return InjuriesDB.ALIAS[k];
    }
    return null;
  },

  flags: function() {
    const map = {};
    const push = function(raw, severity) {
      const j = InjuriesDB.jointFrom(raw);
      if (!j) return;
      const sev = severity || 2;
      if (!map[j] || sev > map[j].severity) map[j] = { joint: j, severity: sev, raw: raw };
    };
    try {
      (S.g('user.limitations') || []).forEach(function(l) { push(l, 2); });
      (S.g('user.injuries') || []).forEach(function(inj) {
        if (typeof inj === 'object' && inj.recovered) return;
        push(inj, (typeof inj === 'object' && inj.severity) || 2);
      });
    } catch (e) {}
    return Object.keys(map).map(function(k) { return map[k]; });
  },

  severities: [
    { id: 1, label: 'Mild', desc: 'Occasional discomfort. Can train with modifications.', restDays: 0, volumeReduce: 0.2 },
    { id: 2, label: 'Moderate', desc: 'Pain during some movements. Reduce load significantly.', restDays: 1, volumeReduce: 0.5 },
    { id: 3, label: 'Severe', desc: 'Sharp pain or instability. Rest this area.', restDays: 3, volumeReduce: 1.0 }
  ],

  injuries: [
    { id: 'left_shoulder', name: 'Left Shoulder', joint: 'shoulder', avoid: ['Overhead Press','Upright Row','Behind Neck Press'], modify: 'Reduce pressing volume. Favor neutral-grip movements.' },
    { id: 'right_shoulder', name: 'Right Shoulder', joint: 'shoulder', avoid: ['Overhead Press','Upright Row'], modify: 'Use cables and dumbbells. Avoid extreme ROM.' },
    { id: 'lower_back', name: 'Lower Back', joint: 'spine', avoid: ['Deadlift','Good Morning','Back Squat'], modify: 'Swap for leg press, RDL with light load, McGill core work.' },
    { id: 'upper_back', name: 'Upper Back / Traps', joint: 'spine', avoid: ['Heavy Shrugs','Barbell Row'], modify: 'Light rows, face pulls, mobility work.' },
    { id: 'left_knee', name: 'Left Knee', joint: 'knee', avoid: ['Back Squat','Walking Lunge','Box Jump'], modify: 'Leg press, RDL, step-ups with control.' },
    { id: 'right_knee', name: 'Right Knee', joint: 'knee', avoid: ['Back Squat','Bulgarian Split Squat'], modify: 'Reduce knee flexion depth. Strengthen VMO.' },
    { id: 'left_elbow', name: 'Left Elbow', joint: 'elbow', avoid: ['Skull Crusher','Close-Grip Bench'], modify: 'Neutral grip pressing. Avoid full extension under load.' },
    { id: 'right_elbow', name: 'Right Elbow', joint: 'elbow', avoid: ['Skull Crusher','Preacher Curl heavy'], modify: 'Hammer curls, cables, reduce direct tricep work.' },
    { id: 'left_wrist', name: 'Left Wrist', joint: 'wrist', avoid: ['Barbell Curl','Front Squat'], modify: 'Use straps, dumbbells, neutral grips.' },
    { id: 'right_wrist', name: 'Right Wrist', joint: 'wrist', avoid: ['Barbell Curl','Push-Ups on flat hand'], modify: 'Push-up handles, neutral grip pressing.' },
    { id: 'neck', name: 'Neck', joint: 'neck', avoid: ['Heavy Shrugs','Behind Neck Press'], modify: 'Avoid loaded cervical flexion. Light mobility only.' },
    { id: 'left_hip', name: 'Left Hip', joint: 'hip', avoid: ['Sumo Deadlift','Deep Squat'], modify: 'Box squats, hip thrusts, banded mobility.' },
    { id: 'right_hip', name: 'Right Hip', joint: 'hip', avoid: ['Sumo Deadlift','Deep Lunge'], modify: 'Single-leg work with limited depth.' },
    { id: 'left_ankle', name: 'Left Ankle', joint: 'ankle', avoid: ['Box Jump','Running sprints'], modify: 'Low-impact cardio. Calf raises controlled.' },
    { id: 'right_ankle', name: 'Right Ankle', joint: 'ankle', avoid: ['Box Jump','Jump Rope'], modify: 'Bike or rower for cardio.' },
    { id: 'rotator_cuff', name: 'Rotator Cuff', joint: 'shoulder', avoid: ['Upright Row','Heavy Bench'], modify: 'Face pulls, external rotation, light pressing.' },
    { id: 'herniated_disc', name: 'Herniated Disc / Sciatica', joint: 'spine', avoid: ['Deadlift','Good Morning','Sit-Up'], modify: 'See rehab protocols. McGill Big 3. Avoid flexion under load.' },
    { id: 'plantar_fasciitis', name: 'Plantar Fasciitis', joint: 'ankle', avoid: ['Running','Jump Rope'], modify: 'Calf stretching, rolling, low-impact cardio.' },
    { id: 'tennis_elbow', name: 'Tennis Elbow (Lateral)', joint: 'elbow', avoid: ['Reverse Curl heavy','Pull-Ups'], modify: 'Eccentric wrist extension rehab. Reduce grip-intensive work.' },
    { id: 'runners_knee', name: "Runner's Knee", joint: 'knee', avoid: ['Running downhill','Deep lunges'], modify: 'Strengthen quads and glutes. Reduce running volume.' }
  ],

  byId(id) { return this.injuries.find(i => i.id === id); },

  resolve(inj) {
    if (inj == null) return null;
    if (typeof inj === 'string') inj = { id: inj };
    const hit = this.byId(inj.id || inj.bodyPart);
    if (hit) return hit;
    const j = this.jointFrom(inj);
    if (!j) return null;
    return this.injuries.find(i => i.joint === j) || {
      id: j, name: j, joint: j, avoid: [],
      modify: 'Reduce load on this joint. Stop on sharp pain.'
    };
  },

  assessActive() {
    const list = S.g('user.injuries') || [];
    let shouldRest = false;
    let maxRest = 0;
    let messages = [];

    list.forEach(inj => {
      if (typeof inj === 'string') return;
      if (inj.recovered) return;
      const db = this.resolve(inj);
      const sev = inj.severity || 1;
      const sevData = this.severities.find(s => s.id === sev) || this.severities[0];
      if (sev >= 3) shouldRest = true;
      maxRest = Math.max(maxRest, sevData.restDays);
      const name = inj.bodyPart || (db ? db.name : 'Injury');
      if (sev >= 2) {
        messages.push(name + ': ' + (sev >= 3 ? 'Consider rest day for this area' : 'Train light, avoid aggravating movements'));
      }
    });

    return { shouldRest, suggestedRestDays: maxRest, messages, count: list.filter(i => typeof i === 'object' && !i.recovered).length };
  },

  shouldAvoidExercise(exName) {
    const flags = this.flags();
    const ex = (typeof ExDB !== 'undefined' && ExDB.byName) ? ExDB.byName(exName) : null;
    for (let i = 0; i < flags.length; i++) {
      const f = flags[i];
      const db = this.resolve(f.raw) || { joint: f.joint, avoid: [], modify: 'Reduce load on this joint. Stop on sharp pain.', name: f.joint };
      const sev = f.severity || 2;
      if (sev >= 2 && db.avoid && db.avoid.some(a => exName.toLowerCase().includes(a.toLowerCase().split(' ')[0]))) {
        return { avoid: true, reason: db.modify, injury: db.name || f.joint };
      }
      if (sev >= 2 && ex && ex.joint) {
        const joint = f.joint;
        const stress = ex.joint[joint] || 0;
        if (stress >= 3 || (sev >= 3 && stress >= 2)) {
          return { avoid: true, reason: db.modify || ('High ' + joint + ' stress'), injury: db.name || f.joint };
        }
      }
    }
    return { avoid: false };
  }
};
