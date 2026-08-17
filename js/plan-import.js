'use strict';
/* Local plan import: JSON first, text/PDF best-effort. Nothing uploaded. Review required. */

const PLAN_IMPORT_MAX_BYTES = 1.5 * 1024 * 1024;

function _piBytesToLatin1(bytes) {
  let out = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    out += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return out;
}

function _piExtractPdfStrings(raw) {
  const texts = [];
  raw.replace(/(\\\(|\\\)|\\n|\\r|\\t|\\\\|\((?:\\.|[^\\)])*\))/g, function(tok) {
    if (tok.charAt(0) !== '(') return tok;
    let s = tok.slice(1, -1)
      .replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t')
      .replace(/\\\(/g, '(').replace(/\\\)/g, ')').replace(/\\\\/g, '\\');
    s = s.replace(/[^\S\n]+/g, ' ').trim();
    if (s.length > 1) texts.push(s);
    return tok;
  });
  return texts.join('\n');
}

function _piFindStreams(bytes) {
  const ascii = _piBytesToLatin1(bytes);
  const streams = [];
  const re = /stream\r?\n/g;
  let m;
  while ((m = re.exec(ascii))) {
    const start = m.index + m[0].length;
    const end = ascii.indexOf('endstream', start);
    if (end < 0) break;
    const dictStart = ascii.lastIndexOf('<<', m.index);
    const dict = dictStart >= 0 ? ascii.slice(dictStart, m.index) : '';
    streams.push({ dict: dict, bytes: bytes.subarray(start, end) });
    re.lastIndex = end + 9;
  }
  return streams;
}

function _piInflate(bytes) {
  if (typeof DecompressionStream === 'undefined') return Promise.resolve(null);
  function tryFmt(fmt) {
    try {
      const ds = new DecompressionStream(fmt);
      const stream = new Blob([bytes]).stream().pipeThrough(ds);
      return new Response(stream).arrayBuffer().then(function(buf) { return new Uint8Array(buf); })
        .catch(function() { return null; });
    } catch (e) { return Promise.resolve(null); }
  }
  return tryFmt('deflate').then(function(a) {
    if (a && a.length) return a;
    return tryFmt('deflate-raw');
  });
}

window.extractPdfText = function(arrayBuffer) {
  const bytes = arrayBuffer instanceof Uint8Array ? arrayBuffer : new Uint8Array(arrayBuffer);
  const streams = _piFindStreams(bytes);
  const jobs = streams.map(function(s) {
    const flate = /\/FlateDecode/.test(s.dict);
    if (!flate) return Promise.resolve(_piExtractPdfStrings(_piBytesToLatin1(s.bytes)));
    return _piInflate(s.bytes).then(function(out) {
      if (!out) return '';
      return _piExtractPdfStrings(_piBytesToLatin1(out));
    });
  });
  return Promise.all(jobs).then(function(parts) {
    const fromStreams = parts.filter(Boolean).join('\n');
    const loose = _piExtractPdfStrings(_piBytesToLatin1(bytes));
    const text = (fromStreams.length > loose.length ? fromStreams : loose).replace(/\n{3,}/g, '\n\n').trim();
    const letters = (text.match(/[A-Za-z]/g) || []).length;
    return { text: text, scanned: letters < 24 };
  });
};

function _piNormName(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function _piMatchExercise(name) {
  const n = _piNormName(name);
  if (!n) return { name: name, matched: false, confidence: 0 };
  if (typeof ExDB !== 'undefined') {
    const exact = ExDB.byName(name);
    if (exact) return { name: exact.n, matched: true, confidence: 1, via: 'exact' };
    const aliasHit = Object.keys(ExDB.ALIASES || {}).find(function(k) { return _piNormName(k) === n; });
    if (aliasHit) return { name: ExDB.ALIASES[aliasHit], matched: true, confidence: 0.95, via: 'alias' };
    const hits = ExDB.search(name.split(/[\/,—-]/)[0].trim()).slice(0, 3);
    if (hits.length && _piNormName(hits[0].n).indexOf(n.slice(0, 8)) !== -1) {
      return { name: hits[0].n, matched: true, confidence: 0.7, via: 'search', candidates: hits.map(function(h) { return h.n; }) };
    }
  }
  const templates = window.PLAN_TEMPLATES || {};
  let found = null;
  Object.keys(templates).some(function(tid) {
    const plan = templates[tid];
    return Object.keys(plan.sessions || {}).some(function(sid) {
      return (plan.sessions[sid].exercises || []).some(function(ex) {
        if (_piNormName(ex.name) === n) { found = ex.name; return true; }
        return (ex.aliases || []).some(function(a) {
          if (_piNormName(a) === n || n.indexOf(_piNormName(a).slice(0, 12)) !== -1) { found = ex.name; return true; }
          return false;
        });
      });
    });
  });
  if (found) return { name: found, matched: true, confidence: 0.85, via: 'template' };
  return { name: name, matched: false, confidence: 0.2, via: 'unmatched' };
}

function _piParseSets(line) {
  const m = String(line).match(/(\d+)\s*[x×]\s*(\d+)(?:\s*[-–]\s*(\d+))?/i);
  if (!m) return null;
  return { sets: Number(m[1]), reps: [Number(m[2]), Number(m[3] || m[2])] };
}

function _piParseSessionBlocks(text) {
  const src = String(text || '');
  const headers = [];
  const re = /(PUSH A|PUSH B|PULL A|PULL B|LEGS A|LEGS B|PUSH\s*[—-]|PULL\s*[—-]|LEGS\s*[—-])[^\n]{0,60}/gi;
  let m;
  while ((m = re.exec(src))) headers.push({ title: m[0].trim(), index: m.index });
  if (!headers.length) return [];
  const blocks = headers.map(function(h, i) {
    const end = i + 1 < headers.length ? headers[i + 1].index : src.length;
    return { title: h.title, body: src.slice(h.index, end) };
  });
  return blocks;
}

function _piSessionId(title) {
  const t = title.toLowerCase();
  if (/push\s*a/.test(t)) return 'push_a';
  if (/push\s*b/.test(t)) return 'push_b';
  if (/pull\s*a/.test(t)) return 'pull_a';
  if (/pull\s*b/.test(t)) return 'pull_b';
  if (/legs?\s*a/.test(t)) return 'legs_a';
  if (/legs?\s*b/.test(t)) return 'legs_b';
  if (/push/.test(t)) return 'push_a';
  if (/pull/.test(t)) return 'pull_a';
  if (/leg/.test(t)) return 'legs_a';
  return 'day_' + _piNormName(title).replace(/\s+/g, '_').slice(0, 20);
}

window.parsePlanText = function(text) {
  const warnings = [];
  const src = String(text || '');
  if (src.replace(/\s/g, '').length < 40) {
    return { ok: false, error: 'Not enough text to parse. Scanned PDFs need a PulseCap JSON plan or pasted text.' };
  }
  const tmpl = (window.PLAN_TEMPLATES && window.PLAN_TEMPLATES.machine_ppl_shoulder)
    ? JSON.parse(JSON.stringify(window.PLAN_TEMPLATES.machine_ppl_shoulder))
    : null;
  const looksLikeMachinePpl = /machine-only ppl|push a|pull a|legs a/i.test(src) && /rpe/i.test(src);
  if (tmpl && looksLikeMachinePpl) {
    warnings.push('Matched the machine-only PPL structure. Review names and starting loads before saving.');
    tmpl.source = { type: 'pdf', name: 'Imported plan', importedAt: (typeof today === 'function' ? today() : '') };
    tmpl.id = 'imported_' + Date.now();
    tmpl.title = 'Imported machine-only PPL';
    tmpl.acknowledgedSafety = false;
    tmpl.active = false;
    const unmatched = [];
    Object.keys(tmpl.sessions).forEach(function(sid) {
      tmpl.sessions[sid].exercises.forEach(function(ex) {
        const hit = _piMatchExercise(ex.name);
        if (!hit.matched) unmatched.push({ from: ex.name, session: sid, confidence: hit.confidence, candidates: hit.candidates || [] });
        else ex.name = hit.name;
      });
    });
    return { ok: true, draft: tmpl, unmatched: unmatched, warnings: warnings, confidence: unmatched.length ? 0.75 : 0.92 };
  }

  const blocks = _piParseSessionBlocks(src);
  if (!blocks.length) {
    return { ok: false, error: 'Could not find session headings (Push / Pull / Legs). Paste the plan text or use PulseCap JSON.' };
  }
  const sessions = {};
  const rotation = [];
  const unmatched = [];
  blocks.forEach(function(b) {
    const id = _piSessionId(b.title);
    const lines = b.body.split(/\n+/).map(function(l) { return l.trim(); }).filter(Boolean);
    const exercises = [];
    lines.forEach(function(line) {
      if (/^(sets|tempo|rpe|rest|cue|if unavailable|watch demo|warmup|cardio|shoulder prehab)/i.test(line)) return;
      if (line.length < 4 || line.length > 90) return;
      if (!/[a-z]/i.test(line)) return;
      const rx = _piParseSets(line);
      const nameGuess = line.split(/—| - |\s{2,}/)[0].replace(/\d+x\d+.*/, '').trim();
      if (nameGuess.length < 4) return;
      const hit = _piMatchExercise(nameGuess);
      if (!hit.matched) unmatched.push({ from: nameGuess, session: id, confidence: hit.confidence, candidates: hit.candidates || [] });
      exercises.push({
        name: hit.name,
        sets: rx ? rx.sets : 3,
        reps: rx ? rx.reps : [10, 12],
        tempo: '2-1-2',
        rpe: [8, 8],
        restSec: 60,
        startKg: 0,
        unit: 'kg',
        alternatives: []
      });
    });
    if (!exercises.length) return;
    sessions[id] = {
      id: id,
      name: b.title.slice(0, 80),
      muscles: [],
      warmup: [],
      prehab: /push|pull/i.test(id),
      family: /push/.test(id) ? 'push' : /pull/.test(id) ? 'pull' : /leg/.test(id) ? 'legs' : '',
      exercises: exercises.slice(0, 16)
    };
    if (rotation.indexOf(id) === -1) rotation.push(id);
  });
  if (!rotation.length) return { ok: false, error: 'No exercises could be read from those sessions.' };
  const draft = {
    schemaVersion: 1,
    id: 'imported_' + Date.now(),
    title: 'Imported plan',
    active: false,
    acknowledgedSafety: false,
    source: { type: 'pdf', name: 'Imported plan' },
    restWeekdays: ['sun'],
    rotation: rotation,
    sessions: sessions,
    safety: {
      medicalClearance: false,
      stopOn: ['clunk', 'shift', 'sharp'],
      romRules: [],
      disclaimer: 'Imported plans are not medical advice. Review every exercise before training.'
    }
  };
  warnings.push('Heuristic extract — confirm every exercise, load, and rest day before using.');
  return { ok: true, draft: draft, unmatched: unmatched, warnings: warnings, confidence: 0.55 };
};

window.parsePlanJson = function(obj) {
  try {
    if (obj && obj.trainingPlan) obj = obj.trainingPlan;
    const clean = validateTrainingPlan(obj);
    const unmatched = [];
    Object.keys(clean.sessions).forEach(function(sid) {
      clean.sessions[sid].exercises.forEach(function(ex) {
        const hit = _piMatchExercise(ex.name);
        if (!hit.matched) unmatched.push({ from: ex.name, session: sid, confidence: hit.confidence, candidates: hit.candidates || [] });
      });
    });
    return { ok: true, draft: clean, unmatched: unmatched, warnings: unmatched.length ? ['Some exercises are not in the library — map them before saving.'] : [], confidence: unmatched.length ? 0.8 : 1 };
  } catch (e) {
    return { ok: false, error: (e && e.message) || 'Invalid plan JSON' };
  }
};

window.PlanImport = {
  readFile: function(file) {
    if (!file) return Promise.reject(new Error('No file selected'));
    if (file.size > PLAN_IMPORT_MAX_BYTES) return Promise.reject(new Error('File is too large. Maximum size is 1.5 MB.'));
    const name = String(file.name || '').toLowerCase();
    const type = String(file.type || '');
    if (name.endsWith('.json') || type.indexOf('json') !== -1) {
      return file.text().then(function(txt) {
        let obj;
        try { obj = JSON.parse(txt); } catch (e) { throw new Error('Invalid JSON'); }
        return parsePlanJson(obj);
      });
    }
    if (name.endsWith('.pdf') || type === 'application/pdf') {
      return file.arrayBuffer().then(function(buf) {
        return extractPdfText(buf).then(function(res) {
          if (res.scanned) {
            return { ok: false, error: 'This looks like a scanned PDF. PulseCap reads text PDFs on-device. Export PulseCap JSON or paste the plan text.' };
          }
          const parsed = parsePlanText(res.text);
          if (parsed.ok) parsed.sourceTextLength = res.text.length;
          return parsed;
        });
      });
    }
    return file.text().then(function(txt) { return parsePlanText(txt); });
  }
};
