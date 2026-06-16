'use strict';
const S = {
  _key: 'fos_profiles',
  _metaKey: 'fos_meta',
  _pid: null,
  d: {},

  /* ── Meta (profile list) ── */
  getMeta() {
    try { return JSON.parse(localStorage.getItem(this._metaKey)||'{}'); } catch(e) { return {}; }
  },
  saveMeta(meta) {
    localStorage.setItem(this._metaKey, JSON.stringify(meta));
  },

  /* ── Profile list ── */
  profiles() {
    const meta = this.getMeta();
    return meta.profiles || [];
  },
  activeId() {
    const meta = this.getMeta();
    return meta.activeId || null;
  },

  /* ── Init ── */
  init() {
    const meta = this.getMeta();
    /* Migration: carry over old single-profile data */
    const legacyKey = 'fos_v4';
    const legacyRaw = localStorage.getItem(legacyKey);
    if (legacyRaw && (!meta.profiles || !meta.profiles.length)) {
      const id = 'p_' + Date.now();
      const newMeta = {
        profiles: [{ id, name: 'My Profile', avatar: '💪', created: new Date().toISOString() }],
        activeId: id
      };
      this.saveMeta(newMeta);
      this._pid = id;
      try { this.d = JSON.parse(legacyRaw); } catch(e) { this.d = {}; }
      this._save();
      return;
    }
    /* First ever launch — create default profile */
    if (!meta.profiles || !meta.profiles.length) {
      const id = 'p_' + Date.now();
      const newMeta = {
        profiles: [{ id, name: 'My Profile', avatar: '💪', created: new Date().toISOString() }],
        activeId: id
      };
      this.saveMeta(newMeta);
      this._pid = id;
      this.d = {};
      this._save();
      return;
    }
    this._pid = meta.activeId || meta.profiles[0].id;
    this._load();
    this.applyGlobalCoach();
  },

  /* ── Switch profile ── */
  switchProfile(id) {
    const meta = this.getMeta();
    const found = (meta.profiles||[]).find(p => p.id === id);
    if (!found) return false;
    meta.activeId = id;
    this.saveMeta(meta);
    this._pid = id;
    this._load();
    this.applyGlobalCoach();
    return true;
  },

  _coachGlobalKey: 'fos_coach_global',

  getGlobalCoach() {
    try { return localStorage.getItem(this._coachGlobalKey) || null; } catch(e) { return null; }
  },

  setGlobalCoach(id) {
    if (id) localStorage.setItem(this._coachGlobalKey, id);
  },

  applyGlobalCoach() {
    const coach = this.getGlobalCoach();
    if (!coach) return;
    if (!this.d.user) this.d.user = {};
    this.d.user.coachPersonality = coach;
    this._save();
  },

  /* ── Create profile ── */
  createProfile(name, avatar) {
    const meta = this.getMeta();
    if (!meta.profiles) meta.profiles = [];
    const id = 'p_' + Date.now();
    meta.profiles.push({ id, name: name||'Athlete', avatar: avatar||'💪', created: new Date().toISOString() });
    meta.activeId = id;
    this.saveMeta(meta);
    this._pid = id;
    this.d = {};
    this._save();
    return id;
  },

  /* ── Delete profile ── */
  deleteProfile(id) {
    const meta = this.getMeta();
    meta.profiles = (meta.profiles||[]).filter(p => p.id !== id);
    localStorage.removeItem(this._key + '_' + id);
    if (meta.activeId === id) {
      meta.activeId = meta.profiles.length ? meta.profiles[0].id : null;
    }
    this.saveMeta(meta);
    if (meta.activeId) {
      this._pid = meta.activeId;
      this._load();
    } else {
      this.d = {};
    }
  },

  /* ── Update profile info ── */
  updateProfileInfo(id, name, avatar) {
    const meta = this.getMeta();
    const p = (meta.profiles||[]).find(p => p.id === id);
    if (p) {
      if (name) p.name = name;
      if (avatar) p.avatar = avatar;
      this.saveMeta(meta);
    }
  },

  hasRealUserData() {
    return (this.profiles() || []).some(p => {
      if (p.id === 'demo' || p.isDemo) return false;
      try {
        const raw = localStorage.getItem(this._key + '_' + p.id);
        if (!raw) return false;
        const d = JSON.parse(raw);
        return !!(d.onboarded || (d.workouts || []).length || (d.prs || []).length);
      } catch (e) { return false; }
    });
  },

  /* ── Demo profile ── */
  createDemo(forceReseed) {
    const meta = this.getMeta();
    if (!meta.profiles) meta.profiles = [];
    const existing = meta.profiles.find(p => p.id === 'demo');
    if (!existing) {
      meta.profiles.push({ id:'demo', name:'Demo Mode', avatar:'🤖', created: new Date().toISOString(), isDemo:true });
      this.saveMeta(meta);
    }
    const demoKey = this._key + '_demo';
    const hasDemoData = !!localStorage.getItem(demoKey);
    if (!forceReseed && hasDemoData) {
      meta.activeId = 'demo';
      this.saveMeta(meta);
      this._pid = 'demo';
      this._load();
      return;
    }
    /* Inject rich demo data */
    const demoData = {
      onboarded: true,
      user: {
        name: 'Alex Demo', goal: 'hypertrophy', exp: 'intermediate',
        gender: 'male', age: 26, units: 'metric', height: 180, weight: 82,
        goalWeight: 78, split: 'ppl', weeklyGoal: 4,
        equipment: ['barbell','dumbbell','cables','machine','bar'],
        coachPersonality: 'maya', theme: 'carbon', mode: 'dark',
        splitDay: 2, joinDate: new Date(Date.now()-60*864e5).toISOString(),
        calorieTarget: 2400, proteinTarget: 165, waterTarget: 8
      },
      recovery: {
        sleep: 7.5, soreness: 3, stress: 4, energy: 8, hydration: 2.5,
        date: new Date().toISOString().slice(0,10)
      },
      workouts: _demoWorkouts(),
      prs: [
        { exercise:'Barbell Bench Press', weight:100, reps:5, e1rm:111, date: new Date(Date.now()-7*864e5).toISOString() },
        { exercise:'Back Squat', weight:120, reps:5, e1rm:134, date: new Date(Date.now()-5*864e5).toISOString() },
        { exercise:'Deadlift', weight:150, reps:3, e1rm:158, date: new Date(Date.now()-3*864e5).toISOString() },
        { exercise:'Overhead Press', weight:70, reps:5, e1rm:78, date: new Date(Date.now()-2*864e5).toISOString() }
      ],
      bodyStats: [
        { date: new Date(Date.now()-30*864e5).toISOString().slice(0,10), weight:85 },
        { date: new Date(Date.now()-20*864e5).toISOString().slice(0,10), weight:83.5 },
        { date: new Date(Date.now()-10*864e5).toISOString().slice(0,10), weight:82 },
        { date: new Date().toISOString().slice(0,10), weight:82 }
      ],
      supplements: [
        { id:'creatine', name:'Creatine Monohydrate', timing:'anytime', dose:'5g', active:true },
        { id:'whey', name:'Whey Protein', timing:'post', dose:'1 scoop', active:true }
      ],
      achievements: ['first_workout','streak_3','workouts_10','pr_first'],
      recoveryHistory: (function() {
        var rh = [];
        for (var i=6; i>=0; i--) {
          var d = new Date(); d.setDate(d.getDate()-i);
          rh.push({ sleep:6.5+Math.random()*2, soreness:Math.floor(Math.random()*5)+1, stress:Math.floor(Math.random()*4)+2, energy:Math.floor(Math.random()*4)+5, hydration:1.5+Math.random()*2, date:d.toISOString().slice(0,10), time:d.toISOString() });
        }
        return rh;
      })(),
      bodyStats: (function() {
        var bs = []; var sw = 85;
        for (var i=29; i>=0; i--) {
          if (i%3===0) { var d2=new Date(); d2.setDate(d2.getDate()-i); sw=Math.round((sw-0.1+(Math.random()*0.4-0.2))*10)/10; bs.push({weight:sw,date:d2.toISOString().slice(0,10),time:d2.toISOString()}); }
        }
        return bs;
      })(),
      meals: (function() {
        var ml = [];
        var todayStr = new Date().toISOString().slice(0, 10);
        for (var i = 4; i >= 0; i--) {
          var d3 = new Date(); d3.setDate(d3.getDate() - i); var ds = d3.toISOString().slice(0, 10);
          var t1 = new Date(d3); t1.setHours(8, 15, 0, 0);
          var t2 = new Date(d3); t2.setHours(13, 0, 0, 0);
          var t3 = new Date(d3); t3.setHours(19, 30, 0, 0);
          ml.push({ name: 'Oats & Eggs', calories: 450, protein: 35, carbs: 45, fat: 12, date: ds, time: t1.toISOString() });
          ml.push({ name: 'Chicken Rice Bowl', calories: 600, protein: 50, carbs: 60, fat: 10, date: ds, time: t2.toISOString() });
          ml.push({ name: 'Protein Shake', calories: 200, protein: 40, carbs: 8, fat: 3, date: ds, time: t3.toISOString() });
          if (ds === todayStr) {
            ml.push({ name: 'Greek Yogurt & Berries', calories: 180, protein: 18, carbs: 22, fat: 4, date: ds, time: new Date().toISOString() });
          }
        }
        return ml;
      })(),
      water: (function() {
        var w = [];
        var ds = new Date().toISOString().slice(0, 10);
        for (var i = 0; i < 5; i++) {
          w.push({ date: ds, time: new Date(Date.now() - i * 3600000).toISOString() });
        }
        return w;
      })(),
      activeQuests: [{
        id: 'demo_quest_1',
        templateId: 'strength_foundation',
        title: 'Strength Foundation',
        icon: '🏋️',
        description: 'Build real strength on the big compound lifts',
        category: 'Strength',
        goals: [
          { type: 'sessions_total', target: 30, label: '30 strength sessions', progress: 0, completed: false },
          { type: 'sets_muscle', muscle: 'chest', target: 200, label: '200 chest sets', progress: 0, completed: false }
        ],
        reward: { xp: 800, badge: '💪 Strength Foundation', tip: 'PR frequency drops naturally — celebrate each one' },
        startDate: new Date(Date.now() - 14 * 864e5).toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 42 * 864e5).toISOString().slice(0, 10),
        status: 'active'
      }],
      supplementLogs: [
        { suppId:'creatine', date:new Date().toISOString().slice(0,10), time:new Date().toISOString() },
        { suppId:'whey', date:new Date().toISOString().slice(0,10), time:new Date().toISOString() }
      ]
    };
    localStorage.setItem(demoKey, JSON.stringify(demoData));
    meta.activeId = 'demo';
    this.saveMeta(meta);
    this._pid = 'demo';
    this._load();
  },

  openDemoProfile() {
    this.createDemo(false);
  },

  /* ── Core data ops ── */
  _load() {
    try {
      const raw = localStorage.getItem(this._key + '_' + this._pid);
      this.d = raw ? JSON.parse(raw) : {};
    } catch(e) { this.d = {}; }
  },
  _save() {
    if (!this._pid) return;
    localStorage.setItem(this._key + '_' + this._pid, JSON.stringify(this.d));
  },
  save() { this._save(); },

  g(path) {
    const keys = path.split('.');
    let v = this.d;
    for (const k of keys) { if (v == null) return null; v = v[k]; }
    return v === undefined ? null : v;
  },
  set(path, val) {
    const keys = path.split('.');
    let v = this.d;
    for (let i = 0; i < keys.length - 1; i++) {
      if (v[keys[i]] == null || typeof v[keys[i]] !== 'object') v[keys[i]] = {};
      v = v[keys[i]];
    }
    v[keys[keys.length-1]] = val;
    this._save();
  },
  push(path, item) {
    const arr = this.g(path) || [];
    arr.push(item);
    this.set(path, arr);
  },
  reset() {
    if (!this._pid) return;
    localStorage.removeItem(this._key + '_' + this._pid);
    this.d = {};
    toast('All data cleared', 'ok');
    location.reload();
  }
};
window.S = S;

/* Demo workout generator — called once during demo setup */
function _demoWorkouts() {
  const days = [1,3,5,7,10,12,14,17,19,21,24,26,28,31,33,35];
  const templates = [
    { name:'Push A — Upper Chest', exercises:[
      { name:'Barbell Bench Press', sets:[{weight:95,reps:8,done:true},{weight:97.5,reps:7,done:true},{weight:100,reps:6,done:true}], muscles:{primary:['chest']} },
      { name:'Overhead Press', sets:[{weight:65,reps:8,done:true},{weight:67.5,reps:7,done:true},{weight:70,reps:5,done:true}], muscles:{primary:['front_delts']} },
      { name:'Incline Dumbbell Press', sets:[{weight:32,reps:10,done:true},{weight:32,reps:9,done:true},{weight:30,reps:10,done:true}], muscles:{primary:['upper_chest']} }
    ]},
    { name:'Pull A — Lats & Biceps', exercises:[
      { name:'Deadlift', sets:[{weight:140,reps:5,done:true},{weight:145,reps:5,done:true},{weight:150,reps:3,done:true}], muscles:{primary:['lower_back']} },
      { name:'Barbell Row', sets:[{weight:80,reps:8,done:true},{weight:82.5,reps:7,done:true},{weight:85,reps:6,done:true}], muscles:{primary:['lats']} },
      { name:'Lat Pulldown', sets:[{weight:70,reps:10,done:true},{weight:72.5,reps:9,done:true},{weight:75,reps:8,done:true}], muscles:{primary:['lats']} }
    ]},
    { name:'Legs A — Quads & Calves', exercises:[
      { name:'Back Squat', sets:[{weight:110,reps:8,done:true},{weight:115,reps:6,done:true},{weight:120,reps:5,done:true}], muscles:{primary:['quads']} },
      { name:'Leg Press', sets:[{weight:160,reps:10,done:true},{weight:160,reps:10,done:true},{weight:160,reps:8,done:true}], muscles:{primary:['quads']} },
      { name:'Standing Calf Raise', sets:[{weight:60,reps:15,done:true},{weight:60,reps:14,done:true},{weight:60,reps:12,done:true}], muscles:{primary:['calves']} }
    ]}
  ];
  return days.map(function(daysAgo, i) {
    const t = templates[i % templates.length];
    const totalVol = t.exercises.reduce(function(sum,ex) {
      return sum + ex.sets.reduce(function(s2,st) { return s2+(st.weight*st.reps); }, 0);
    }, 0);
    return {
      id: 'demo_wkt_'+i,
      name: t.name,
      date: new Date(Date.now() - daysAgo*864e5).toISOString().slice(0,10),
      duration: 45 + Math.floor(Math.random()*30),
      totalVol: totalVol,
      exercises: t.exercises
    };
  });
}
