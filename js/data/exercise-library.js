'use strict';
/* Offline exercise library — one-time fetch from wger.de, cached in localStorage */

const ExerciseLibrary = (() => {
  const CACHE_KEY = 'exerciseLibrary.wger';
  const MEDIA_KEY = 'exerciseLibrary.media';
  const CACHE_VER = 3; /* v3: inferred joint-stress on imported exercises */
  const MEDIA_VER = 1;
  const WGER_BASE = 'https://wger.de/api/v2';

  const CAT_GRP = {
    10: 'chest', 11: 'back', 12: 'legs', 13: 'shoulders',
    8: 'arms', 9: 'arms', 14: 'core', 15: 'cardio', 16: 'fullbody'
  };

  const EQ_MAP = {
    'barbell': 'barbell', 'dumbbell': 'dumbbell', 'kettlebell': 'kettlebell',
    'cable': 'cables', 'machine': 'machine', 'bench': 'machine',
    'pull-up bar': 'bar', 'resistance band': 'bands', 'gym mat': [],
    'none (bodyweight exercise)': [], 'sz barbell': 'barbell'
  };

  function _grpFromInfo(info) {
    const catId = info.category && info.category.id;
    if (catId && CAT_GRP[catId]) return CAT_GRP[catId];
    const m = (info.muscles && info.muscles[0] && info.muscles[0].name || '').toLowerCase();
    if (/chest|pectoral/.test(m)) return 'chest';
    if (/lat|back|trap|rhomboid/.test(m)) return 'back';
    if (/quad|hamstring|glute|calf|leg/.test(m)) return 'legs';
    if (/delt|shoulder/.test(m)) return 'shoulders';
    if (/bicep/.test(m)) return 'biceps';
    if (/tricep/.test(m)) return 'triceps';
    if (/ab|core|oblique/.test(m)) return 'core';
    return 'fullbody';
  }

  /* Imported exercises get joint stress inferred from name + muscle group,
     so injury filtering works on the whole library, not just the built-ins. */
  function _inferJoint(name, grp) {
    const n = (name || '').toLowerCase();
    const j = { shoulder: 0, elbow: 0, knee: 0, spine: 0, hip: 0 };
    if (/overhead|press behind|upright row|snatch|jerk|handstand/.test(n)) j.shoulder = 3;
    else if (/press|fly|dip|push|raise|pull-?up|pulldown|row/.test(n)) j.shoulder = 2;
    else if (grp === 'chest' || grp === 'shoulders' || grp === 'back') j.shoulder = 1;
    if (/curl|extension|skull|pushdown|close-?grip|dip/.test(n)) j.elbow = 2;
    else if (/press|row|pull/.test(n)) j.elbow = 1;
    if (/pistol|jump|lunge|sissy|deep squat/.test(n)) j.knee = 3;
    else if (/squat|leg press|leg extension|step-?up|split squat/.test(n)) j.knee = 2;
    else if (grp === 'legs' || /calf|hamstring|glute/.test(n)) j.knee = 1;
    if (/deadlift|good morning|hyperextension|clean|snatch|bent-?over/.test(n)) j.spine = 3;
    else if (/row|squat|carry|swing/.test(n)) j.spine = 2;
    else if (grp === 'back' || grp === 'core') j.spine = 1;
    if (/deadlift|squat|thrust|swing|lunge|sumo/.test(n)) j.hip = 2;
    else if (grp === 'legs') j.hip = 1;
    return j;
  }

  function _eqFromInfo(info) {
    const names = (info.equipment || []).map(e => (e.name || '').toLowerCase());
    const out = [];
    names.forEach(n => {
      Object.keys(EQ_MAP).forEach(k => {
        if (n.includes(k)) {
          const v = EQ_MAP[k];
          if (Array.isArray(v)) return;
          if (v && !out.includes(v)) out.push(v);
        }
      });
    });
    if (!names.length || names.some(n => n.includes('bodyweight'))) return [];
    return out.length ? out : ['dumbbell'];
  }

  function _toExDB(info, mediaMap) {
    const en = (info.translations || []).find(t => t.language === 2) ||
      (info.translations || []).find(t => t.language === 4) ||
      (info.translations || [])[0];
    if (!en || !en.name) return null;
    const grp = _grpFromInfo(info);
    const pri = (info.muscles && info.muscles[0] && info.muscles[0].name) || grp;
    const sec = (info.muscles_secondary || []).map(m => m.name).join(', ');
    const desc = (en.description || '').replace(/<[^>]+>/g, '').trim().slice(0, 280);
    const media = mediaMap && mediaMap[info.id] ? mediaMap[info.id] : null;
    return {
      n: en.name.trim(),
      em: grp === 'cardio' ? '🏃' : '🏋️',
      grp: grp,
      diff: 1,
      bw: !(info.equipment && info.equipment.length),
      eq: _eqFromInfo(info),
      pri: pri,
      sec: sec,
      cues: desc || 'Focus on controlled form through full range of motion.',
      setup: '',
      breathing: '',
      mistakes: '',
      joint: _inferJoint(en.name, grp),
      cns: 1,
      muscles: { primary: [grp], secondary: [] },
      regressions: [],
      progressions: [],
      met: 4.0,
      tempoRec: '2-0-1-0',
      source: 'wger',
      wgerId: info.id,
      thumb: media && media.thumb ? media.thumb : null,
      image: media && media.image ? media.image : null,
      video: media && media.video ? media.video : null
    };
  }

  function getCached() {
    const c = S.g(CACHE_KEY);
    if (!c || c.version !== CACHE_VER) return null;
    return c.exercises || [];
  }

  function getMediaMap() {
    const m = S.g(MEDIA_KEY);
    if (!m || m.version !== MEDIA_VER) return {};
    return m.byExercise || {};
  }

  function formGuideUrl(name) {
    const q = encodeURIComponent((name || '') + ' form tutorial');
    return 'https://www.youtube.com/results?search_query=' + q;
  }

  function getMedia(nameOrEx) {
    const ex = typeof nameOrEx === 'string' ? (typeof ExDB !== 'undefined' ? ExDB.byName(nameOrEx) : null) : nameOrEx;
    if (!ex) return { thumb: null, image: null, video: null, formUrl: formGuideUrl(typeof nameOrEx === 'string' ? nameOrEx : ex.n) };
    const map = getMediaMap();
    const cached = ex.wgerId && map[ex.wgerId] ? map[ex.wgerId] : {};
    return {
      thumb: ex.thumb || cached.thumb || null,
      image: ex.image || cached.image || null,
      video: ex.video || cached.video || null,
      formUrl: formGuideUrl(ex.n)
    };
  }

  function mediaHTML(nameOrEx, opts) {
    opts = opts || {};
    const ex = typeof nameOrEx === 'string' ? (typeof ExDB !== 'undefined' ? ExDB.byName(nameOrEx) : null) : nameOrEx;
    const name = ex ? ex.n : (typeof nameOrEx === 'string' ? nameOrEx : '');
    const media = getMedia(ex || name);
    const h = opts.height || 160;
    if (media.video) {
      return '<div style="margin-bottom:14px;border-radius:16px;overflow:hidden;background:#000;border:1px solid var(--border)">' +
        '<video src="' + esc(media.video) + '" poster="' + esc(media.thumb || '') + '" controls playsinline preload="metadata" style="width:100%;max-height:' + h + 'px;display:block;background:#000"></video></div>';
    }
    if (media.image || media.thumb) {
      const src = media.image || media.thumb;
      return '<div style="margin-bottom:14px;border-radius:16px;overflow:hidden;border:1px solid var(--border);background:var(--bg4)">' +
        '<img src="' + esc(src) + '" alt="' + esc(name) + '" loading="lazy" style="width:100%;max-height:' + h + 'px;object-fit:contain;display:block"/>' +
        (media.thumb && media.image && media.thumb !== media.image ?
          '<div style="font-size:10px;color:var(--txt3);padding:6px 10px;text-align:center">wger exercise image · cached offline</div>' : '') +
        '</div>';
    }
    if (typeof FormLoops !== 'undefined' && FormLoops.forExercise(name)) {
      return FormLoops.cardHTML(name, { height: h });
    }
    return '<div style="margin-bottom:14px;border-radius:16px;padding:14px;background:var(--bg4);border:1px solid var(--border);display:flex;align-items:center;gap:12px">' +
      '<div style="font-size:32px">🎬</div>' +
      '<div style="flex:1"><div style="font-size:13px;font-weight:700;color:var(--txt);margin-bottom:4px">Form guide</div>' +
      '<div style="font-size:12px;color:var(--txt3);line-height:1.45">No cached demo yet — open a curated YouTube search for proper form.</div></div>' +
      '<a href="' + esc(media.formUrl) + '" target="_blank" rel="noopener" onclick="haptic(15)" style="flex-shrink:0;padding:10px 14px;border-radius:12px;background:var(--grad);color:#fff;font-size:12px;font-weight:700;text-decoration:none">Watch</a></div>';
  }

  async function _fetchPaginated(path, onProgress) {
    const out = [];
    let offset = 0;
    const limit = 100;
    let total = 0;
    while (true) {
      const url = WGER_BASE + path + (path.includes('?') ? '&' : '?') + 'limit=' + limit + '&offset=' + offset;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) break;
      const data = await res.json();
      total = data.count || total;
      out.push.apply(out, data.results || []);
      if (onProgress) onProgress(out.length, total);
      if (!data.next) break;
      offset += limit;
      await new Promise(r => setTimeout(r, 80));
    }
    return out;
  }

  async function fetchMedia(onProgress) {
    const existing = S.g(MEDIA_KEY);
    if (existing && existing.version === MEDIA_VER && existing.byExercise) return existing.byExercise;

    const byExercise = {};
    const images = await _fetchPaginated('/exerciseimage/?is_main=True', onProgress);
    images.forEach(img => {
      const exId = img.exercise;
      if (!exId) return;
      if (!byExercise[exId]) byExercise[exId] = {};
      const imgUrl = img.image || '';
      if (imgUrl) {
        byExercise[exId].image = imgUrl.startsWith('http') ? imgUrl : 'https://wger.de' + imgUrl;
        byExercise[exId].thumb = byExercise[exId].image;
      }
    });

    try {
      const videos = await _fetchPaginated('/video/', onProgress);
      videos.forEach(v => {
        const exId = v.exercise;
        if (!exId || !v.video) return;
        if (!byExercise[exId]) byExercise[exId] = {};
        byExercise[exId].video = v.video.startsWith('http') ? v.video : 'https://wger.de' + v.video;
        if (v.thumbnail) {
          byExercise[exId].thumb = v.thumbnail.startsWith('http') ? v.thumbnail : 'https://wger.de' + v.thumbnail;
        }
      });
    } catch (e) { /* video endpoint optional */ }

    S.set(MEDIA_KEY, { version: MEDIA_VER, fetchedAt: Date.now(), byExercise: byExercise });
    return byExercise;
  }

  function mergeIntoExDB() {
    if (typeof ExDB === 'undefined') return 0;
    const cached = getCached() || [];
    const mediaMap = getMediaMap();
    let added = 0;
    cached.forEach(ex => {
      if (!ex || !ex.n) return;
      const existing = ExDB.byName(ex.n);
      if (existing) {
        if (ex.wgerId && mediaMap[ex.wgerId]) {
          const m = mediaMap[ex.wgerId];
          if (m.thumb) existing.thumb = m.thumb;
          if (m.image) existing.image = m.image;
          if (m.video) existing.video = m.video;
        }
        return;
      }
      ExDB.db.push(ex);
      added++;
    });
    return added;
  }

  async function fetchAll(onProgress, force) {
    const existing = getCached();
    if (existing && existing.length > 0 && !force) return existing.length;
    if (!navigator.onLine) {
      if (existing && existing.length) return existing.length;
      throw new Error('Offline — connect once to download the library');
    }

    if (onProgress) onProgress(0, 0, 'Fetching exercise media…');
    const mediaMap = await fetchMedia(onProgress);

    const all = [];
    let offset = 0;
    const limit = 50;
    let total = 0;

    while (true) {
      const url = WGER_BASE + '/exerciseinfo/?language=2&limit=' + limit + '&offset=' + offset;
      const res = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('wger API error ' + res.status);
      const data = await res.json();
      total = data.count || total;
      const batch = (data.results || []).map(info => _toExDB(info, mediaMap)).filter(Boolean);
      all.push.apply(all, batch);
      if (onProgress) onProgress(all.length, total, 'Exercises');
      if (!data.next) break;
      offset += limit;
      await new Promise(r => setTimeout(r, 120));
    }

    S.set(CACHE_KEY, { version: CACHE_VER, fetchedAt: Date.now(), count: all.length, exercises: all });
    return all.length;
  }

  async function sync(onProgress, force) {
    if (force) {
      S.set(CACHE_KEY, null);
      S.set(MEDIA_KEY, null);
    }
    const cached = getCached();
    if (cached && cached.length > 0 && !force) {
      const added = mergeIntoExDB();
      return { fetched: cached.length, added: added, fromCache: true };
    }
    if (!navigator.onLine && cached && cached.length > 0) {
      const added = mergeIntoExDB();
      return { fetched: cached.length, added: added, fromCache: true };
    }
    const n = await fetchAll(onProgress, force);
    const added = mergeIntoExDB();
    return { fetched: n, added: added, fromCache: false };
  }

  function status() {
    const c = S.g(CACHE_KEY);
    const m = S.g(MEDIA_KEY);
    if (!c) return { cached: false, count: 0, fetchedAt: null, mediaCount: 0 };
    return {
      cached: true,
      count: c.count || 0,
      fetchedAt: c.fetchedAt,
      mediaCount: m && m.byExercise ? Object.keys(m.byExercise).length : 0
    };
  }

  return { sync, mergeIntoExDB, getCached, getMedia, mediaHTML, formGuideUrl, status };
})();

window.ExerciseLibrary = ExerciseLibrary;

window.syncExerciseLibrary = async function(force) {
  const btn = document.getElementById('ex-lib-sync-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Downloading…'; }
  try {
    const r = await ExerciseLibrary.sync(function(done, total, phase) {
      if (btn) btn.textContent = (phase || 'Downloading') + '… ' + (total ? done + '/' + total : done);
    }, force);
    toast(r.fromCache ? 'Library loaded from phone (' + r.fetched + ' exercises)' : 'Downloaded ' + r.fetched + ' exercises (' + r.added + ' new)', 'ok', 4000);
    if (btn) btn.textContent = '✓ Library synced';
  } catch (e) {
    const raw = (e && e.message) ? String(e.message) : '';
    const offline = typeof navigator !== 'undefined' && navigator.onLine === false;
    const msg = offline
      ? 'You\'re offline — connect once to download the library'
      : (/load failed|failed to fetch|networkerror|network request failed/i.test(raw)
        ? 'Couldn\'t reach wger.de — check connection and try again'
        : (raw || 'Sync failed'));
    toast(msg, 'err', 4500);
    if (btn) { btn.disabled = false; btn.textContent = 'Download Exercise Library'; }
  }
};
