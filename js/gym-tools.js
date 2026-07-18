'use strict';
/* PulseCap gym floor helpers — wake lock, voice log, barcode, mobility, pain.
   Offline only. No network. Attached to window. */

/* ── Screen Wake Lock ── */
var _wakeSentinel = null;
window.WakeLock = {
  request: function() {
    if (!navigator.wakeLock || !navigator.wakeLock.request) return Promise.resolve(false);
    return navigator.wakeLock.request('screen').then(function(s) {
      _wakeSentinel = s;
      s.addEventListener('release', function() { _wakeSentinel = null; });
      return true;
    }).catch(function() { return false; });
  },
  release: function() {
    if (!_wakeSentinel) return Promise.resolve();
    var s = _wakeSentinel;
    _wakeSentinel = null;
    return s.release().catch(function() {});
  },
  isActive: function() { return !!_wakeSentinel; }
};

/* ── Voice set logger (Web Speech) ── */
var _WORDS = {
  zero:0, one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8, nine:9,
  ten:10, eleven:11, twelve:12, thirteen:13, fourteen:14, fifteen:15,
  sixteen:16, seventeen:17, eighteen:18, nineteen:19, twenty:20,
  thirty:30, forty:40, fifty:50, sixty:60, seventy:70, eighty:80, ninety:90,
  hundred:100
};
var _recog = null;

function _wordsToNum(str) {
  var parts = String(str || '').toLowerCase().replace(/-/g, ' ').split(/\s+/).filter(Boolean);
  if (!parts.length) return null;
  if (/^\d+(\.\d+)?$/.test(parts[0]) && parts.length === 1) return Number(parts[0]);
  var vals = [], i, w, v;
  for (i = 0; i < parts.length; i++) {
    v = _WORDS[parts[i]];
    if (v == null) return null;
    vals.push(v);
  }
  /* "one thirty five" gym slang → 135 (no "hundred") */
  if (vals.length >= 2 && vals[0] >= 1 && vals[0] <= 9 && vals[1] >= 20 && vals[1] <= 90) {
    var n = vals[0] * 100 + vals[1];
    if (vals[2] != null && vals[2] < 10) n += vals[2];
    return n;
  }
  var total = 0, cur = 0;
  for (i = 0; i < vals.length; i++) {
    v = vals[i];
    if (v === 100) { cur = (cur || 1) * 100; }
    else { cur += v; }
  }
  total += cur;
  return total || null;
}

function _numToken(s) {
  s = String(s || '').trim().toLowerCase();
  if (/^\d+(\.\d+)?$/.test(s)) return Number(s);
  return _wordsToNum(s);
}

window.VoiceLogger = {
  supported: function() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  },
  start: function(onResult, onError) {
    var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { if (onError) onError(new Error('unsupported')); return; }
    this.stop();
    _recog = new SR();
    _recog.continuous = false;
    _recog.interimResults = false;
    _recog.lang = 'en-US';
    _recog.onresult = function(ev) {
      var t = (ev.results[0] && ev.results[0][0] && ev.results[0][0].transcript) || '';
      if (onResult) onResult(t, VoiceLogger.parseUtterance(t));
    };
    _recog.onerror = function(e) { if (onError) onError(e); };
    try { _recog.start(); } catch (e) { if (onError) onError(e); }
  },
  stop: function() {
    if (!_recog) return;
    try { _recog.stop(); } catch (e) {}
    _recog = null;
  },
  parseUtterance: function(text) {
    var raw = String(text || '').trim();
    var out = { raw: raw };
    var t = raw.toLowerCase().replace(/,/g, '');
    var m;
    m = t.match(/\brpe\s*(\d+(?:\.\d+)?)\b/);
    if (m) out.rpe = Number(m[1]);
    m = t.match(/(\d+(?:\.\d+)?)\s*(?:for|by|x|×)\s*(\d+)/);
    if (m) { out.weight = Number(m[1]); out.reps = Number(m[2]); return out; }
    m = t.match(/(\d+)\s*reps?\s*(?:at|@)\s*(\d+(?:\.\d+)?)/);
    if (m) { out.reps = Number(m[1]); out.weight = Number(m[2]); return out; }
    /* word forms: "one thirty five for eight" */
    m = t.match(/([a-z\s-]+?)\s+(?:for|by|x)\s+([a-z\s-]+?)(?:\s|$)/);
    if (m) {
      var w = _numToken(m[1]), r = _numToken(m[2]);
      if (w != null) out.weight = w;
      if (r != null) out.reps = r;
    }
    return out;
  }
};

/* ── Offline barcode → meal ── */
var BARCODE_MAP = {
  '0000001': 'chicken_breast',
  '0000002': 'whey',
  '0000003': 'greek_yogurt',
  '0000004': 'oats',
  '0000005': 'banana',
  '0000006': 'rice',
  '0000007': 'egg',
  '0000008': 'tuna',
  '0000009': 'milk',
  '0000010': 'peanut_butter',
  '0000011': 'bread',
  '0000012': 'salmon',
  '0000013': 'cottage',
  '0000014': 'almonds',
  '0000015': 'whey',
  '0000016': 'turkey',
  '0000017': 'beef_lean',
  '0000018': 'tofu',
  '0000019': 'lentils',
  '0000020': 'beans',
  '0000021': 'pasta',
  '0000022': 'potato',
  '0000023': 'sweet_potato',
  '0000024': 'apple',
  '0000025': 'berries',
  '0000026': 'broccoli',
  '0000027': 'spinach',
  '0000028': 'avocado',
  '0000029': 'olive_oil',
  '0000030': 'cheese',
  '0000031': 'egg_white',
  '0000032': 'brown_rice',
  '0000033': 'rice_cake',
  '0000034': 'honey',
  '0000035': 'creatine_food',
  /* Demo retail stubs (offline only — not real product DB) */
  '0123456789012': 'whey',
  '0123456789013': 'chicken_breast',
  '0123456789014': 'greek_yogurt',
  '0123456789015': 'oats',
  '0123456789016': 'banana',
  '0123456789017': 'peanut_butter',
  '0123456789018': 'salmon',
  '0123456789019': 'milk',
  '0123456789020': 'bread'
};

window.BarcodeFood = {
  supported: function() {
    return typeof window.BarcodeDetector === 'function';
  },
  scanFromVideo: function(videoEl) {
    if (!this.supported()) return Promise.reject(new Error('BarcodeDetector unsupported'));
    var det = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'] });
    return det.detect(videoEl).then(function(codes) {
      if (!codes || !codes.length) return null;
      return { rawValue: codes[0].rawValue };
    });
  },
  lookupLocal: function(barcode) {
    var key = String(barcode || '').trim();
    var hint = BARCODE_MAP[key];
    if (!hint) return null;
    var foods = (typeof FOODS_DB !== 'undefined' && FOODS_DB) || [];
    var q = hint.toLowerCase();
    var food = null;
    for (var i = 0; i < foods.length; i++) {
      var f = foods[i];
      if (f.id === q || (f.name && f.name.toLowerCase().indexOf(q.replace(/_/g, ' ')) !== -1)) {
        food = f;
        break;
      }
    }
    if (food && typeof FoodEngine !== 'undefined' && FoodEngine.toMeal) return FoodEngine.toMeal(food, 1);
    if (food) {
      return {
        name: food.name, calories: food.cal, protein: food.p, carbs: food.c, fat: food.f,
        date: (typeof today === 'function' ? today() : new Date().toISOString().slice(0, 10)),
        time: (typeof isoNow === 'function' ? isoNow() : new Date().toISOString()),
        foodId: food.id, barcode: key
      };
    }
    return {
      name: hint, calories: 0, protein: 0, carbs: 0, fat: 0,
      date: (typeof today === 'function' ? today() : new Date().toISOString().slice(0, 10)),
      time: (typeof isoNow === 'function' ? isoNow() : new Date().toISOString()),
      barcode: key
    };
  }
};

/* ── Mobility presets ── */
window.MobilityFlow = {
  PRESETS: [
    {
      id: 'shoulders', name: 'Shoulders', durationMin: 5, steps: [
        { name: 'Arm circles', secs: 45, cue: 'Slow big circles, both directions.' },
        { name: 'Band pull-aparts', secs: 60, cue: 'Squeeze scapulae; keep elbows soft.' },
        { name: 'Wall slides', secs: 60, cue: 'Ribs down, wrists/elbows on wall.' },
        { name: 'Thread the needle', secs: 45, cue: 'Reach under, open chest to ceiling.' },
        { name: 'Doorway stretch', secs: 50, cue: 'Gentle pec open; breathe.' }
      ]
    },
    {
      id: 'hips', name: 'Hips', durationMin: 6, steps: [
        { name: 'World\'s greatest stretch', secs: 60, cue: 'Lunge + twist; switch sides.' },
        { name: '90/90 hip switches', secs: 60, cue: 'Tall torso; slow transitions.' },
        { name: 'Couch stretch', secs: 50, cue: 'Glute squeeze; keep ribs stacked.' },
        { name: 'Frog rock', secs: 50, cue: 'Knees wide; rock gently.' },
        { name: 'Figure-4 stretch', secs: 50, cue: 'Ankle over knee; pull hip back.' }
      ]
    },
    {
      id: 'spine', name: 'Spine', durationMin: 5, steps: [
        { name: 'Cat-cow', secs: 45, cue: 'Segment through each vertebra.' },
        { name: 'Open books', secs: 60, cue: 'Knees stacked; rotate upper back.' },
        { name: 'Child\'s pose + reach', secs: 45, cue: 'Walk hands left/right.' },
        { name: 'Dead bug', secs: 50, cue: 'Press low back into floor.' },
        { name: 'Seated twist', secs: 40, cue: 'Long spine; exhale into rotation.' }
      ]
    },
    {
      id: 'full', name: 'Full body', durationMin: 8, steps: [
        { name: 'Jumping jacks / march', secs: 45, cue: 'Easy pulse to warm up.' },
        { name: 'Cat-cow', secs: 40, cue: 'Wake the spine.' },
        { name: 'World\'s greatest stretch', secs: 60, cue: 'Hips + T-spine combo.' },
        { name: 'Wall slides', secs: 45, cue: 'Shoulders before pressing.' },
        { name: 'Bodyweight squat hold', secs: 40, cue: 'Knees track toes; breathe.' },
        { name: 'Down dog → plank', secs: 50, cue: 'Slow transitions; long heels.' }
      ]
    },
    {
      id: 'ankles', name: 'Ankles & calves', durationMin: 4, steps: [
        { name: 'Ankle circles', secs: 40, cue: 'Both directions; keep knee quiet.' },
        { name: 'Knee-to-wall dorsiflexion', secs: 50, cue: 'Heel down; touch wall with knee.' },
        { name: 'Calf stretch (straight + bent)', secs: 50, cue: 'Gastroc then soleus.' },
        { name: 'Single-leg balance', secs: 40, cue: 'Soft knee; eyes forward.' }
      ]
    },
    {
      id: 'wrists', name: 'Wrists & elbows', durationMin: 4, steps: [
        { name: 'Wrist circles', secs: 40, cue: 'Slow, both directions.' },
        { name: 'Prayer stretch', secs: 40, cue: 'Elbows down; gentle pressure.' },
        { name: 'Reverse prayer / finger pull', secs: 40, cue: 'Open forearms; no pain.' },
        { name: 'Band wrist extension', secs: 45, cue: 'Light band; control eccentric.' }
      ]
    }
  ],
  get: function(id) {
    for (var i = 0; i < this.PRESETS.length; i++) {
      if (this.PRESETS[i].id === id) return this.PRESETS[i];
    }
    return null;
  },
  list: function() { return this.PRESETS.slice(); }
};

/* ── Pain flag → rehab ── */
window.PainFlag = {
  flagPain: function(part) {
    var entry = {
      part: String(part || 'unknown'),
      date: (typeof today === 'function' ? today() : new Date().toISOString().slice(0, 10)),
      time: (typeof isoNow === 'function' ? isoNow() : new Date().toISOString())
    };
    if (typeof S !== 'undefined' && S.push) S.push('painFlags', entry);
    return {
      advice: 'Noted ' + entry.part + ' pain. Ease load, keep range pain-free, and open Rehab for joint-safe options.',
      go: 'rehab'
    };
  }
};
