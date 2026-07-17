'use strict';
/* Injury database — severity, rest guidance, exercise modifications */

window.InjuriesDB = {
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

  /* Resolve any logged injury (Rehab conditions carry a `joint`, legacy
     entries carry a body-part id) to an avoid/modify entry. */
  resolve(inj) {
    if (!inj || typeof inj !== 'object') return null;
    return this.byId(inj.id || inj.bodyPart) ||
      (inj.joint ? this.injuries.find(i => i.joint === inj.joint) : null);
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
    const list = S.g('user.injuries') || [];
    for (let i = 0; i < list.length; i++) {
      const inj = list[i];
      if (typeof inj !== 'object' || inj.recovered) continue;
      const db = this.resolve(inj);
      if (!db) continue;
      const sev = inj.severity || 1;
      if (sev >= 2 && db.avoid.some(a => exName.toLowerCase().includes(a.toLowerCase().split(' ')[0]))) {
        return { avoid: true, reason: db.modify, injury: inj.bodyPart || db.name };
      }
      /* Joint-stress check: the exercise library rates each movement 0-3 per
         joint — high stress on an injured joint gets swapped out too. */
      if (sev >= 2 && typeof ExDB !== 'undefined') {
        const ex = ExDB.byName(exName);
        const joint = db.joint || inj.joint;
        const stress = ex && ex.joint && joint ? (ex.joint[joint] || 0) : 0;
        if (stress >= 3 || (sev >= 3 && stress >= 2)) {
          return { avoid: true, reason: db.modify || ('High ' + joint + ' stress'), injury: inj.bodyPart || db.name };
        }
      }
    }
    return { avoid: false };
  }
};
