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
            type: 'exercise', icon: 'dumbbell', title: name,
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
            type: 'muscle', icon: 'dna', title: m.name,
            sub: m.region + ' · ' + m.group,
            action: "go('anatomy')",
            tags: [m.region, m.group],
            relevance: 2
          });
        }
        if ((m.exercises || []).some(e => this.fuzzyMatch(e, q))) {
          results.push({
            type: 'muscle', icon: 'dna', title: m.name + ' (worked by ' + q + ')',
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
            type: 'rehab', icon: 'bandage', title: inj.name,
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
            type: 'mobility', icon: 'walk', title: joint.name + ' Mobility',
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
            type: 'stretch', icon: 'leaf', title: group.name + ' Stretches',
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
            type: 'history', icon: 'chart', title: ex.name,
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
            type: 'skill', icon: 'run', title: skill.name,
            sub: 'Calisthenics · ' + (skill.category || ''),
            action: "go('calisthenics')",
            tags: ['calisthenics', 'skill'],
            relevance: 2
          });
        }
      });
    }

    // 9. App screens + tools (unified IA directory)
    const SCREENS = [
      { title: 'Today', sub: 'Dashboard · daily decision', action: "go('dashboard')", tags: ['home', 'today'] },
      { title: 'Train', sub: 'Workout logger', action: "go('workout')", tags: ['train', 'workout'] },
      { title: 'Body Map', sub: 'Measurements · recovery map', action: "go('bodymap')", tags: ['body'] },
      { title: 'Learn', sub: 'Module directory', action: "go('hub')", tags: ['learn', 'hub'] },
      { title: 'Smart Coach', sub: 'Offline Q&A', action: "go('assistant')", tags: ['coach', 'chat'] },
      { title: 'Search', sub: 'Global search', action: "go('search')", tags: ['search'] },
      { title: 'Calculators', sub: '1RM · BMI · macros · FFMI', action: "go('calculators')", tags: ['calculator', 'bmi', '1rm', 'ffmi', 'macros'] },
      { title: 'Encyclopedia', sub: 'Mobility · warmups · sports', action: "go('encyclopedia')", tags: ['encyclopedia'] },
      { title: 'Anatomy', sub: 'Muscle database', action: "go('anatomy')", tags: ['anatomy'] },
      { title: 'Recovery', sub: 'Check-in · debt forecast', action: "go('recovery')", tags: ['recovery', 'sleep'] },
      { title: 'Physique', sub: 'Scores · archetype · timeline', action: "go('physique')", tags: ['physique', 'aesthetic'] },
      { title: 'Nutrition', sub: 'Meals · water · macros', action: "go('nutrition')", tags: ['nutrition', 'food'] },
      { title: 'Progress', sub: 'PRs · charts · volume', action: "go('progress')", tags: ['progress', 'pr'] },
      { title: 'Rehab', sub: 'Injury protocols', action: "go('rehab')", tags: ['rehab'] },
      { title: 'Settings', sub: 'Profile · theme · goals', action: "go('settings')", tags: ['settings', 'me'] }
    ];
    SCREENS.forEach(function(s) {
      const hay = s.title + ' ' + s.sub + ' ' + (s.tags || []).join(' ');
      if (FitnessSearch.fuzzyMatch(hay, q)) {
        results.push({
          type: 'screen', icon: 'book', title: s.title, sub: s.sub,
          action: s.action, tags: s.tags, relevance: 3
        });
      }
    });

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
    '<button type="button" onclick="history.length>1?history.back():go(\'dashboard\')" style="width:34px;height:34px;border-radius:50%;background:var(--bg3);border:1px solid var(--border);color:var(--txt);font-size:18px;cursor:pointer;touch-action:manipulation;flex-shrink:0">←</button>' +
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
        '<button type="button" onclick="S.s(\'recentSearches\',[]);go(\'search\')" style="font-size:12px;color:var(--txt3);background:none;border:none;cursor:pointer;touch-action:manipulation;padding:4px 8px">Clear</button>' +
        '</div>' +
        recents.slice(0, 5).map(function(r, i) {
          return '<button type="button" class="list-row" onclick="_searchRun(_srRecents[' + i + '])" aria-label="Search ' + esc(r) + '">' +
            '<span class="list-row__icon" aria-hidden="true">◷</span>' +
            '<span class="list-row__body"><span class="list-row__title">' + esc(r) + '</span></span>' +
            '<span class="list-row__chev" aria-hidden="true">›</span>' +
            '</button>';
        }).join('');
    } else {
      content =
        '<div style="padding:48px 20px 20px;text-align:center">' +
        '<div style="margin-bottom:16px;display:flex;justify-content:center;color:var(--c1)">' + icon('search', 52) + '</div>' +
        '<div style="font-size:17px;font-weight:800;color:var(--txt);margin-bottom:8px">Search Everything</div>' +
        '<div style="font-size:13px;color:var(--txt3);line-height:1.8;margin-bottom:24px">Exercises · Muscles · Injuries<br>Mobility · Sports · Your History</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">' +
        ['Bench Press', 'Shoulder', 'Hamstring', 'Cricket', 'Lower Back', 'Hip Flexor', 'Squat', 'Push-Ups'].map(function(s) {
          return '<button type="button" onclick="_searchRun(\'' + s + '\')" style="padding:7px 14px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:var(--bg3);color:var(--txt2)">' + s + '</button>';
        }).join('') +
        '</div></div>';
    }
  } else if (results.length === 0) {
    content =
      '<div style="padding:48px 20px;text-align:center">' +
      '<div style="margin-bottom:14px;display:flex;justify-content:center;color:var(--txt3)">' + icon('search', 48) + '</div>' +
      '<div style="font-size:16px;font-weight:700;color:var(--txt);margin-bottom:6px">No results for "' + qEsc + '"</div>' +
      '<div style="font-size:13px;color:var(--txt3);margin-bottom:20px">Try a different word or filter</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px;max-width:280px;margin:0 auto">' +
      ['Bench Press', 'Shoulder pain', 'Hamstring stretch', 'Cricket training', 'Lower back'].map(function(s) {
        return '<button type="button" onclick="_searchRun(\'' + s + '\')" style="padding:11px 16px;border-radius:14px;font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation;border:1px solid var(--border);background:var(--bg3);color:var(--txt2);text-align:left;display:flex;align-items:center;gap:8px">' + icon('search', 14) + ' ' + s + '</button>';
      }).join('') +
      '</div></div>';
  } else {
    content =
      '<div style="font-size:12px;color:var(--txt3);padding:8px 16px 10px">' +
      results.length + ' result' + (results.length !== 1 ? 's' : '') + ' for "' + qEsc + '"</div>' +
      results.map(function(r, idx) {
        const badgeColor = TYPE_COLORS[r.type] || 'var(--txt3)';
        const badgeLabel = TYPE_BADGE[r.type] || r.type;
        return '<button type="button" class="list-row" onclick="_doSearchResult(' + idx + ')" aria-label="' + esc(r.title) + '">' +
          '<span class="list-row__icon" aria-hidden="true">' + icon(r.icon, 20) + '</span>' +
          '<span class="list-row__body">' +
          '<span class="list-row__title">' + esc(r.title) + '</span>' +
          '<span class="list-row__sub">' + esc(r.sub) + '</span>' +
          '</span>' +
          '<span class="list-row__badge" style="color:' + badgeColor + ';background:' + badgeColor + '22">' + badgeLabel + '</span>' +
          '<span class="list-row__chev" aria-hidden="true">›</span>' +
          '</button>';
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
  var m = String(r.action || '').match(/^go\('([^']+)'(?:,\{section:'([^']+)'\})?\)$/);
  if (!m) return;
  go(m[1], m[2] ? { section: m[2] } : undefined);
};
