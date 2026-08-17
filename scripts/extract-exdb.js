'use strict';
/* One-shot extractor: parse ExDB.db from workout.js (or EXERCISE_DB file). */
const fs = require('fs');
const path = require('path');

function extractArray(src, marker) {
  const start = src.indexOf(marker);
  if (start < 0) throw new Error('marker not found: ' + marker);
  const i0 = src.indexOf('[', start);
  let depth = 0;
  let inStr = false;
  let quote = '';
  let esc = false;
  for (let i = i0; i < src.length; i++) {
    const ch = src[i];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (ch === '\\') { esc = true; continue; }
      if (ch === quote) inStr = false;
      continue;
    }
    if (ch === "'" || ch === '"') { inStr = true; quote = ch; continue; }
    if (ch === '[') depth++;
    else if (ch === ']') {
      depth--;
      if (depth === 0) return src.slice(i0, i + 1);
    }
  }
  throw new Error('unclosed array');
}

function loadExercises() {
  const dbPath = path.join(__dirname, '..', 'js/data/exercise-db.js');
  if (fs.existsSync(dbPath)) {
    const src = fs.readFileSync(dbPath, 'utf8');
    const arr = extractArray(src, 'EXERCISE_DB');
    return Function('"use strict"; return ' + arr)();
  }
  const src = fs.readFileSync(path.join(__dirname, '..', 'js/modules/workout.js'), 'utf8');
  const arr = extractArray(src, '\n  db: [');
  return Function('"use strict"; return ' + arr)();
}

function slug(name) {
  return String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function richness(ex) {
  return (ex.cues || '').length
    + (ex.setup || '').length
    + (ex.mistakes || '').length
    + (ex.sec || '').length
    + ((ex.regressions || []).length + (ex.progressions || []).length) * 24;
}

function union(a, b) {
  const out = [];
  const seen = Object.create(null);
  (a || []).concat(b || []).forEach(function(x) {
    const k = String(x || '').trim();
    if (!k || seen[k]) return;
    seen[k] = true;
    out.push(k);
  });
  return out;
}

function maxJoint(a, b) {
  const keys = ['shoulder', 'elbow', 'knee', 'spine', 'hip', 'wrist', 'neck', 'ankle'];
  const out = {};
  keys.forEach(function(k) {
    const va = a && a[k];
    const vb = b && b[k];
    if (va == null && vb == null) return;
    out[k] = Math.max(Number(va) || 0, Number(vb) || 0);
  });
  return out;
}

function mergePair(keep, extra) {
  const richer = richness(extra) > richness(keep) ? extra : keep;
  const other = richer === extra ? keep : extra;
  const merged = Object.assign({}, other, richer);
  merged.n = keep.n;
  merged.regressions = union(keep.regressions, extra.regressions);
  merged.progressions = union(keep.progressions, extra.progressions);
  merged.joint = maxJoint(keep.joint, extra.joint);
  merged.cns = Math.max(Number(keep.cns) || 0, Number(extra.cns) || 0);
  if (keep.met != null && extra.met != null) merged.met = Math.min(Number(keep.met), Number(extra.met));
  if ((extra.sec || '').length > (keep.sec || '').length) merged.sec = extra.sec;
  return merged;
}

function dedupe(rows) {
  const byName = Object.create(null);
  const order = [];
  rows.forEach(function(ex) {
    const n = ex.n;
    if (!byName[n]) {
      byName[n] = ex;
      order.push(n);
    } else {
      byName[n] = mergePair(byName[n], ex);
    }
  });
  return order.map(function(n) { return byName[n]; });
}

function assignIds(rows) {
  const used = Object.create(null);
  return rows.map(function(ex) {
    let id = slug(ex.n);
    if (!id) id = 'exercise';
    if (used[id]) {
      let i = 2;
      while (used[id + '-' + i]) i++;
      id = id + '-' + i;
    }
    used[id] = true;
    ex.id = id;
    return ex;
  });
}

function emit(rows) {
  const body = rows.map(function(ex) {
    return '  ' + JSON.stringify(ex);
  }).join(',\n');
  return "'use strict';\n"
    + '/* Canonical exercise library. Logged sets key by `id` (slug of `n`); `n` stays the display name. */\n'
    + 'window.EXERCISE_DB = [\n'
    + body
    + '\n];\n';
}

module.exports = { loadExercises, slug, dedupe, assignIds, emit, extractArray };

if (require.main === module) {
  const raw = loadExercises();
  const names = raw.map(function(e) { return e.n; });
  const dupes = names.filter(function(n, i) { return names.indexOf(n) !== i; })
    .filter(function(n, i, a) { return a.indexOf(n) === i; });
  console.log('raw', raw.length, 'duplicate names', dupes.length);
  const unique = assignIds(dedupe(raw));
  console.log('unique', unique.length);
  const out = path.join(__dirname, '..', 'js/data/exercise-db.js');
  fs.writeFileSync(out, emit(unique));
  console.log('wrote', out);
}
