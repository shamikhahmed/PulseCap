'use strict';
/* Equipment setup — type-first picker. Brand is an optional filter. */

let _eqFilter = 'all';
let _eqBrand = '';
let _eqQuery = '';

reg('equipment-setup', function() {
  const user = S.g('user') || {};
  const selected = S.g('user.equipmentIds') || [];
  const env = user.trainingEnvironment || 'gym';
  const brands = EquipmentDB.brands;
  const q = String(_eqQuery || '').trim().toLowerCase();

  const envBtns = EquipmentDB.environments.map(e =>
    '<button type="button" class="btn btn-' + (env === e.id ? 'primary' : 'secondary') + ' btn-sm flex-1" style="display:flex;align-items:center;justify-content:center;gap:6px" onclick="setTrainEnv(\'' + e.id + '\')">' +
    (typeof icon === 'function' ? icon(e.icon || 'dumbbell', 14) : '') + ' ' + esc(e.label) + '</button>'
  ).join('');

  const brandOpts = '<option value="">All brands (optional)</option>' + brands.map(b =>
    '<option value="' + esc(b) + '"' + (_eqBrand === b ? ' selected' : '') + '>' + esc(b) + '</option>'
  ).join('');

  let items = EquipmentDB.items;
  if (_eqBrand && _eqBrand !== 'No brand / Generic') items = items.filter(i => !i.brand || i.brand === _eqBrand);
  else if (_eqBrand === 'No brand / Generic') items = items.filter(i => !i.brand);
  if (_eqFilter !== 'all') items = items.filter(i => i.category === _eqFilter);
  if (q) {
    items = items.filter(function(i) {
      return (i.name || '').toLowerCase().indexOf(q) >= 0 ||
        (i.brand || '').toLowerCase().indexOf(q) >= 0 ||
        (i.type || '').toLowerCase().indexOf(q) >= 0 ||
        (i.category || '').replace('_', ' ').indexOf(q) >= 0;
    });
  }

  const cats = ['all', 'free_weights', 'racks', 'benches', 'cables', 'machines', 'legs', 'cardio', 'bodyweight', 'accessory'];
  const catLabels = { all: 'All', free_weights: 'Free Weights', racks: 'Racks', benches: 'Benches', cables: 'Cables', machines: 'Machines', legs: 'Legs', cardio: 'Cardio', bodyweight: 'BW', accessory: 'Accessories' };

  const catTabs = '<div class="cap-tab-bar" data-full-bleed="1" role="tablist" aria-label="Equipment categories">' +
    cats.map(c => '<button type="button" class="cap-tab' + (_eqFilter === c ? ' on' : '') + '" role="tab" aria-selected="' + (_eqFilter === c) + '" onclick="_eqFilter=\'' + c + '\';go(\'equipment-setup\')">' + (catLabels[c] || c) + '</button>').join('') +
    '</div>';

  const brandColors = {
    'Life Fitness': '#c8102e',
    'Hammer Strength': '#f5c842',
    'Technogym': '#0066cc',
    'Precor': '#00843d',
    'Matrix': '#111111',
    'Cybex': '#005eb8',
    'Rogue': '#c41e3a',
    'Eleiko': '#e30613',
    'Atlantis': '#1a365d',
    'Gym80': '#111111',
    'Prime': '#4a1c8c'
  };

  const mine = selected.map(function(id) { return EquipmentDB.byId(id); }).filter(Boolean);
  const summary = mine.length
    ? '<div class="screen-pad" style="padding-bottom:8px"><div class="settings-section-title" style="margin-top:0">My gym</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
      mine.map(function(item) {
        return '<button type="button" data-focus-key="eq-mine-' + esc(item.id) + '" onclick="toggleEquipment(\'' + item.id + '\')" style="min-height:44px;padding:8px 12px;border-radius:999px;border:1px solid var(--c1);background:rgba(var(--c1-rgb),0.12);color:var(--c1);font-size:12px;font-weight:700">' +
          esc(item.name) + ' ×</button>';
      }).join('') +
      '</div></div>'
    : '';

  const rows = items.map(item => {
    const on = selected.includes(item.id);
    const badge = item.brand ?
      '<span style="display:inline-block;font-size:10px;font-weight:800;padding:2px 7px;border-radius:6px;margin-top:5px;letter-spacing:0.04em;text-transform:uppercase;background:' + (brandColors[item.brand] || 'var(--c1)') + '22;color:' + (brandColors[item.brand] || 'var(--c1)') + ';border:1px solid ' + (brandColors[item.brand] || 'var(--c1)') + '44">' + esc(item.brand) + '</span>' : '';
    const typeBit = item.type ? '<div class="muted-11 mt-2">' + esc(String(item.type).replace(/_/g, ' ')) + (item.category ? ' · ' + esc(item.category.replace('_', ' ')) : '') + '</div>' : (item.category ? '<div class="muted-11 mt-2">' + esc(item.category.replace('_', ' ')) + '</div>' : '');
    return '<div onclick="toggleEquipment(\'' + item.id + '\')" style="display:flex;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid var(--border);cursor:pointer;touch-action:manipulation">' +
      '<div style="width:26px;height:26px;border-radius:8px;border:2px solid ' + (on ? 'var(--c1)' : 'var(--border)') + ';background:' + (on ? 'var(--c1)' : 'transparent') + ';display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700">' + (on ? '✓' : '') + '</div>' +
      '<div class="flex-1"><div class="row-strong">' + esc(item.name) + '</div>' +
      (badge || typeBit) +
      '</div></div>';
  }).join('');

  return moduleTopbar('My Equipment', {
    left: '<button type="button" class="topbar-icon press" onclick="go(\'settings\',{tab:\'training\'})" aria-label="Back">←</button>'
  }) +

    '<div class="screen-pad">' +
    '<p class="mod-lede" style="padding:0;margin-bottom:12px">Pick machine <strong>types</strong> you can use. Brand is optional — a Life Fitness leg press and a generic leg press both count as a leg press. Plate numbers are not comparable across brands.</p>' +
    '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">' + envBtns + '</div>' +
    '<div class="field-wrap"><label class="field-label" for="eq-search">Search</label>' +
    '<input id="eq-search" class="field" type="search" placeholder="leg press, cables, Rogue…" value="' + esc(_eqQuery) + '" oninput="_eqQuery=this.value;go(\'equipment-setup\')"></div>' +
    '<div class="field-wrap"><label class="field-label">Filter by brand (optional)</label>' +
    '<select class="field" onchange="_eqBrand=this.value;go(\'equipment-setup\')">' + brandOpts + '</select></div>' +
    '<div style="display:flex;gap:8px;margin-top:4px;flex-wrap:wrap">' +
    '<button type="button" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:6px" onclick="selectEquipmentPreset(\'gym_full\')">' + icon('dumbbell', 14) + ' Full Gym</button>' +
    '<button type="button" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:6px" onclick="selectEquipmentPreset(\'home_basic\')">' + icon('bed', 14) + ' Home Basics</button>' +
    '<button type="button" class="btn btn-secondary btn-sm" style="display:inline-flex;align-items:center;gap:6px" onclick="selectEquipmentPreset(\'bodyweight\')">' + icon('walk', 14) + ' Bodyweight</button>' +
    '<button type="button" class="btn btn-secondary btn-sm" onclick="selectVisibleEquipment()">Select all in view</button>' +
    '</div></div>' +

    summary +
    catTabs +
    '<div style="background:var(--bg3);border-top:1px solid var(--border)">' + (rows || '<div class="screen-pad muted-12">No matches. Clear search or brand.</div>') + '</div>' +
    '<div style="padding:16px calc(16px + var(--safe))">' +
    '<div style="font-size:12px;color:var(--txt3);margin-bottom:10px;text-align:center">' + selected.length + ' items · ' + EquipmentDB.items.length + ' in catalogue</div>' +
    '<button type="button" class="btn btn-primary w-full" onclick="saveEquipmentSetup()">Save Equipment</button></div>';
});

window.setTrainEnv = function(env) {
  S.set('user.trainingEnvironment', env);
  go('equipment-setup');
};

window.toggleEquipment = function(id) {
  haptic(12);
  const cur = (S.g('user.equipmentIds') || []).slice();
  const idx = cur.indexOf(id);
  if (id === 'none') {
    S.set('user.equipmentIds', idx >= 0 ? [] : ['none']);
  } else {
    const noneIdx = cur.indexOf('none');
    if (noneIdx >= 0) cur.splice(noneIdx, 1);
    if (idx >= 0) cur.splice(idx, 1);
    else cur.push(id);
    S.set('user.equipmentIds', cur);
  }
  go('equipment-setup');
};

window.selectVisibleEquipment = function() {
  const q = String(_eqQuery || '').trim().toLowerCase();
  let items = EquipmentDB.items.slice();
  if (_eqBrand && _eqBrand !== 'No brand / Generic') items = items.filter(i => !i.brand || i.brand === _eqBrand);
  else if (_eqBrand === 'No brand / Generic') items = items.filter(i => !i.brand);
  if (_eqFilter !== 'all') items = items.filter(i => i.category === _eqFilter);
  if (q) {
    items = items.filter(function(i) {
      return (i.name || '').toLowerCase().indexOf(q) >= 0 ||
        (i.brand || '').toLowerCase().indexOf(q) >= 0 ||
        (i.type || '').toLowerCase().indexOf(q) >= 0;
    });
  }
  const cur = (S.g('user.equipmentIds') || []).slice();
  const noneIdx = cur.indexOf('none');
  if (noneIdx >= 0) cur.splice(noneIdx, 1);
  items.forEach(function(item) {
    if (cur.indexOf(item.id) < 0) cur.push(item.id);
  });
  S.set('user.equipmentIds', cur);
  toast('Added ' + items.length + ' in view', 'ok');
  go('equipment-setup');
};

window.selectEquipmentPreset = function(preset) {
  const presets = {
    gym_full: ['barbell','dumbbell','power_rack','bench_flat','bench_incline','cable_station','lat_pulldown','leg_press','leg_extension','leg_curl','chest_press_machine','pullup_bar','smith'],
    home_basic: ['dumbbell','bands','bench_flat','pullup_bar','kettlebell'],
    bodyweight: ['none','pullup_bar']
  };
  S.set('user.equipmentIds', presets[preset] || []);
  go('equipment-setup');
};

window.saveEquipmentSetup = function() {
  haptic(40);
  S.set('user.equipmentConfigured', true);
  S.set('settings.equipmentSetupPending', false);
  const ids = S.g('user.equipmentIds') || [];
  let kit = 'full_gym';
  if (ids.includes('none') && ids.length <= 2) kit = 'home_minimal';
  else if (ids.indexOf('barbell') < 0 && ids.indexOf('dumbbell') >= 0) kit = 'dumbbells';
  else if (ids.indexOf('barbell') < 0 && (ids.indexOf('cable_station') >= 0 || ids.indexOf('leg_press') >= 0)) kit = 'machines_cables';
  if (typeof Equipment !== 'undefined' && Equipment.applyKit) Equipment.applyKit(kit);
  S.set('user.equipmentIds', ids);
  toast('Equipment saved — workouts filtered to your setup', 'ok');
  go('settings', { tab: 'training' });
};
