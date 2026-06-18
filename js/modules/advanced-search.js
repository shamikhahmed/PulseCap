'use strict';
/* ── PulseCap — Advanced Offline Search Engine ── */

const FitnessSearch = {

  fuzzyMatch(str, query) {
    if (!str || !query) return false;
    const s = str.toLowerCase();
    const q = query.toLowerCase();
    if (s.includes(q)) return true;
    if (q.length >= 4) {
      for (let i = 0; i < q.length; i++) {
        const variant = q.slice(0, i) + q.slice(i + 1);
        if (s.includes(variant)) return true;
      }
    }
    return false;
  },

  search(query) {
    if (!query || query.trim().length < 2) return [];
    const q = query.trim();
    const results = [];

    // 1. Exercise Knowledge Graph
    if (typeof EKG !== 'undefined') {
      EKG.all().forEach(name => {
        if (this.fuzzyMatch(name, q)) {
          const node = EKG.get(name);
          results.push({
            type: 'exercise', icon: '💪', title: name,
            sub: node ? 'Pattern: ' + node.pattern + ' · Fatigue: ' + node.fatigueScore + '/10' : 'Exercise',
            action: "go('workout')",
            tags: node ? [...(node.muscles.primary || []), node.pattern] : [],
            relevance: name.toLowerCase().startsWith(q.toLowerCase()) ? 3 : 2
          });
        }
      });
    }

    // 2. Muscle Anatomy
    if (typeof MUSCLE_DB !== 'undefined') {
      Object.values(MUSCLE_DB).forEach(m => {
        if (this.fuzzyMatch(m.name, q) || this.fuzzyMatch(m.region, q) || this.fuzzyMatch(m.group, q)) {
          results.push({
            type: 'muscle', icon: '🔬', title: m.name,
            sub: m.region + ' · ' + m.group,
            action: "go('anatomy')",
            tags: [m.region, m.group],
            relevance: 2
          });
        }
        if ((m.exercises || []).some(e => this.fuzzyMatch(e, q))) {
          results.push({
            type: 'muscle', icon: '🔬', title: m.name + ' (worked by ' + q + ')',
            sub: 'Anatomy · ' + m.region,
            action: "go('anatomy')",
            tags: [m.region],
            relevance: 1
          });
        }
      });
    }

    // 3. Injury Rehab
    if (typeof INJURY_DB !== 'undefined') {
      Object.values(INJURY_DB).forEach(inj => {
        if (this.fuzzyMatch(inj.name, q) || this.fuzzyMatch(inj.anatomy || '', q) || this.fuzzyMatch(inj.mechanism || '', q)) {
          results.push({
            type: 'rehab', icon: '🩹', title: inj.name,
            sub: 'Severity: ' + inj.severity + ' · Return: ' + inj.return_to_gym_weeks.typical + ' weeks',
            action: "go('rehab')",
            tags: ['injury', 'rehab', inj.severity],
            relevance: 2
          });
        }
      });
    }

    // 4. Mobility DB
    if (typeof MobilityDB !== 'undefined') {
      Object.values(MobilityDB).forEach(joint => {
        if (this.fuzzyMatch(joint.name, q) || joint.drills.some(d => this.fuzzyMatch(d.name, q))) {
          results.push({
            type: 'mobility', icon: '🦶', title: joint.name + ' Mobility',
            sub: joint.drills.length + ' drills · ' + joint.frequency,
            action: "go('encyclopedia',{section:'mobility'})",
            tags: ['mobility', 'flexibility'],
            relevance: 2
          });
        }
      });
    }

    // 5. Stretching DB
    if (typeof StretchDB !== 'undefined') {
      Object.values(StretchDB).forEach(group => {
        if (this.fuzzyMatch(group.name, q) || group.stretches.some(s => this.fuzzyMatch(s.name, q))) {
          results.push({
            type: 'stretch', icon: '🧘', title: group.name + ' Stretches',
            sub: group.stretches.length + ' stretches',
            action: "go('encyclopedia',{section:'stretching'})",
            tags: ['stretch', 'flexibility', 'cooldown'],
            relevance: 2
          });
        }
      });
    }

    // 6. Sports DB
    if (typeof SportsDB !== 'undefined') {
      Object.values(SportsDB).forEach(sport => {
        if (this.fuzzyMatch(sport.name, q) ||
            sport.key_demands.some(d => this.fuzzyMatch(d, q)) ||
            sport.strength_training.primary_lifts.some(l => this.fuzzyMatch(l, q))) {
          results.push({
            type: 'sport', icon: sport.icon, title: sport.name + ' Training',
            sub: sport.key_demands[0],
            action: "go('encyclopedia',{section:'sports'})",
            tags: ['sport', 'performance'],
            relevance: 2
          });
        }
      });
    }

    // 7. User workout history
    const ws = S.g('workouts') || [];
    const seenEx = new Set();
    ws.slice(-30).forEach(w => {
      (w.exercises || []).forEach(ex => {
        if (!seenEx.has(ex.name) && this.fuzzyMatch(ex.name || '', q)) {
          seenEx.add(ex.name);
          const best = (ex.sets || []).filter(s => s.done && s.weight > 0).reduce((m, s) => Math.max(m, s.weight || 0), 0);
          results.push({
            type: 'history', icon: '📋', title: ex.name,
            sub: 'In your history' + (best ? ' · Best: ' + best + 'kg' : ''),
            action: "go('progress')",
            tags: ['history', 'logged'],
            relevance: best ? 3 : 2
          });
        }
      });
    });

    // 8. Calisthenics skills
    if (typeof CALISTHENICS_SKILLS !== 'undefined') {
      (CALISTHENICS_SKILLS || []).forEach(skill => {
        if (this.fuzzyMatch(skill.name || '', q) || this.fuzzyMatch(skill.category || '', q)) {
          results.push({
            type: 'skill', icon: '🤸', title: skill.name,
            sub: 'Calisthenics · ' + (skill.category || ''),
            action: "go('calisthenics')",
            tags: ['calisthenics', 'skill'],
            relevance: 2
          });
        }
      });
    }

    // Deduplicate by title + type
    const seen = new Set();
    const unique = results.filter(r => {
      const key = r.type + ':' + r.title;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return unique.sort((a, b) => b.relevance - a.relevance).slice(0, 25);
  },

  searchExercises(query) { return this.search(query).filter(r => r.type === 'exercise'); },
  searchInjuries(query) { return this.search(query).filter(r => r.type === 'rehab'); },
  searchMobility(query) { return this.search(query).filter(r => r.type === 'mobility' || r.type === 'stretch'); }
};
window.FitnessSearch = FitnessSearch;

/* ══════════════════════════════════════════════════════
   ADVANCED SEARCH SCREEN
══════════════════════════════════════════════════════ */
reg('search', function(data) {
  const query = (data && data.q) || '';
  const filter = (data && data.filter) || 'all';
  const allResults = query.length >= 2 ? FitnessSearch.search(query) : [];

  const FILTER_MAP = {
    exercises: ['exercise'],
    muscles: ['muscle'],
    injuries: ['rehab'],
    mobility: ['mobility', 'stretch'],
    sports: ['sport'],
    academy: ['skill'],
    history: ['history']
  };

  const results = filter === 'all' ? allResults :
    allResults.filter(function(r) { return (FILTER_MAP[filter] || []).indexOf(r.type) !== -1; });

  window._srItems = results;

  const TYPE_COLORS = {
    exercise: '#007aff', muscle: '#af52de', rehab: '#ff453a',
    mobility: '#30d158', stretch: '#30d158', sport: '#f5c842',
    history: '#00c7ff', skill: '#ff9f0a'
  };
  const TYPE_BADGE = {
    exercise: 'Exercise', muscle: 'Muscle', rehab: 'Rehab',
    mobility: 'Mobility', stretch: 'Stretch', sport: 'Sport',
    history: 'History', skill: 'Skill'
  };
  const CHIPS = [
    { id: 'all', label: 'All' }, { id: 'exercises', label: 'Exercises' },
    { id: 'muscles', label: 'Muscles' }, { id: 'injuries', label: 'Injuries' },
    { id: 'mobility', label: 'Mobility' }, { id: 'sports', label: 'Sports' },
    { id: 'academy', label: 'Academy' }, { id: 'history', label: 'My History' }
  ];

  const recents = S.g('recentSearches') || [];
  const qEsc = esc(query);
  const fEsc = esc(filter);

  const topbar =
    '<div style="display:flex;align-items:center;gap:10px;padding:10px 16px 0;background:var(--bg);position:sticky;top:0;z-index:20">' +
    '<button onclick="history.length>1?history.back():go(\'dashboard\')" style="width:34px;height:34px;border-radius:50%;background:var(--bg3);border:1px solid var(--border);color:var(--txt);font-size:18px;cursor:pointer;touch-action:manipulation;flex-shrink:0">←</button>' +
    '<input id="fit-search" type="search" placeholder="Exercises, muscles, injuries, sports..." ' +
    'value="' + qEsc + '" ' +
    'oninput="clearTimeout(window._st);window._st=setTimeout(function(){go(\'search\',{q:document.getElementById(\'fit-search\').value,filter:\'' + fEsc + '\'})},280)" ' +
    'autofocus style="flex:1;background:var(--bg3);border:1.5px solid var(--border);border-radius:12px;color:var(--txt);padding:11px 14px;font-size:16px;outline:none;min-width:0;-webkit-appearance:none">' +
    '</div>';

  const chips =
    '<div class="cap-tab-bar" role="tablist" aria-label="Search filters">' +
    CHIPS.map(function(chip) {
      const active = filter === chip.id;
      return '<button type="button" class="cap-tab' + (active ? ' on' : '') + '" role="tab" aria-selected="' + active + '" onclick="go(\'search\',{q:\'' + qEsc + '\',filter:\'' + chip.id + '\'})">' + chip.label + '</button>';
    }).join('') +
    '</div>';

  let content = '';

  if (query.length < 2) {
    if (recents.length > 0) {
      window._srRecents = recents;
      content =
        '<div style="padding:12px 16px 6px;display:flex;align-items:center;justify-content:space-between">' +
        '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3)">Recent</div>' +
        '<button onclick="S.s(\'recentSearches\',[]);go(\'search\')" style="font-size:12px;color:var(--txt3);background:none;border:none;cursor:pointer;touch-action:manipulation;padding:4px 8px">Clear</button>' +
        '</div>' +
        recents.slice(0, 5).map(function(r, i) {
          return '<div onclick="_searchRun(_srRecents[' + i + '])" style="display:flex;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid var(--border);cursor:pointer;touch-action:manipulation">' +
            '<div style="font-size:16px;color:var(--txt3)">🕐</div>' +
            '<div style="flex:1;font-size:14px;color:var(--txt)">' + esc(r) + '</div>' +
            '<div style="font-size:16px;color:var(--txt3)">›</div>' +
            '</div>';
        }).join('');
    } else {
      content =
        '<div style="padding:48px 20px 20px;text-align:center">' +
        '<div style="font-size:52px;margin-bottom:16px">🔍</div>' +
        '<div style="font-size:17px;font-weight:800;color:var(--txt);margin-bottom:8px">Search Everything</div>' +
        '<div style="font-size:13px;color:var(--txt3);line-height:1.8;margin-bottom:24px">Exercises · Muscles · Injuries<br>Mobility · Sports · Your History</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">' +
        ['Bench Press', 'Shoulder', 'Hamstring', 'Cricket', 'Lower Back', 'Hip Flexor', 'Squat', 'Push-Ups'].map(function(s) {
          return '<button onclick="_searchRun(\'' + s + '\')" style="padding:7px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:var(--bg3);color:var(--txt2)">' + s + '</button>';
        }).join('') +
        '</div></div>';
    }
  } else if (results.length === 0) {
    content =
      '<div style="padding:48px 20px;text-align:center">' +
      '<div style="font-size:48px;margin-bottom:14px">😕</div>' +
      '<div style="font-size:16px;font-weight:700;color:var(--txt);margin-bottom:6px">No results for "' + qEsc + '"</div>' +
      '<div style="font-size:13px;color:var(--txt3);margin-bottom:20px">Try a different word or filter</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;max-width:280px;margin:0 auto">' +
      ['Bench Press', 'Shoulder pain', 'Hamstring stretch', 'Cricket training', 'Lower back'].map(function(s) {
        return '<button onclick="_searchRun(\'' + s + '\')" style="padding:11px 16px;border-radius:14px;font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:var(--bg3);color:var(--txt2);text-align:left">🔍 ' + s + '</button>';
      }).join('') +
      '</div></div>';
  } else {
    content =
      '<div style="font-size:12px;color:var(--txt3);padding:8px 16px 10px">' +
      results.length + ' result' + (results.length !== 1 ? 's' : '') + ' for "' + qEsc + '"</div>' +
      results.map(function(r, idx) {
        const badgeColor = TYPE_COLORS[r.type] || 'var(--txt3)';
        const badgeLabel = TYPE_BADGE[r.type] || r.type;
        return '<div onclick="_doSearchResult(' + idx + ')" style="display:flex;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid var(--border);cursor:pointer;touch-action:manipulation">' +
          '<div style="font-size:26px;flex-shrink:0;width:36px;text-align:center">' + r.icon + '</div>' +
          '<div style="flex:1;min-width:0">' +
          '<div style="font-size:14px;font-weight:700;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(r.title) + '</div>' +
          '<div style="font-size:11px;color:var(--txt3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(r.sub) + '</div>' +
          '</div>' +
          '<span style="flex-shrink:0;font-size:10px;font-weight:700;color:' + badgeColor + ';background:' + badgeColor + '22;padding:3px 8px;border-radius:10px;white-space:nowrap">' + badgeLabel + '</span>' +
          '<div style="font-size:16px;color:var(--txt3);flex-shrink:0;margin-left:4px">›</div>' +
          '</div>';
      }).join('');
  }

  return topbar + chips + content + '<div style="height:32px"></div>';
});

window._saveSearch = function(q) {
  if (!q || q.trim().length < 2) return;
  var recents = S.g('recentSearches') || [];
  q = q.trim();
  recents = [q].concat(recents.filter(function(r) { return r !== q; })).slice(0, 8);
  S.s('recentSearches', recents);
};

window._searchRun = function(q) {
  if (q) go('search', { q: q, filter: 'all' });
};

window._doSearchResult = function(idx) {
  var r = (window._srItems || [])[idx];
  if (!r) return;
  var inp = document.getElementById('fit-search');
  if (inp) _saveSearch(inp.value);
  eval(r.action);
};
