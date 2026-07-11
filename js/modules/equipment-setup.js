'use strict';
/* Equipment setup — home / gym / brand-specific machines */

let _eqFilter = 'all';
let _eqBrand = '';

reg('equipment-setup', function() {
  const user = S.g('user') || {};
  const selected = S.g('user.equipmentIds') || [];
  const env = user.trainingEnvironment || 'gym';
  const brands = EquipmentDB.brands;

  const envBtns = EquipmentDB.environments.map(e =>
    '<button type="button" class="btn btn-' + (env === e.id ? 'primary' : 'secondary') + ' btn-sm" style="flex:1" onclick="setTrainEnv(\'' + e.id + '\')">' + e.icon + ' ' + e.label + '</button>'
  ).join('');

  const brandOpts = '<option value="">All brands</option>' + brands.map(b =>
    '<option value="' + esc(b) + '"' + (_eqBrand === b ? ' selected' : '') + '>' + esc(b) + '</option>'
  ).join('');

  let items = EquipmentDB.items;
  if (_eqBrand) items = items.filter(i => !i.brand || i.brand === _eqBrand);
  if (_eqFilter !== 'all') items = items.filter(i => i.category === _eqFilter);

  const cats = ['all', 'free_weights', 'racks', 'benches', 'cables', 'machines', 'legs', 'cardio', 'bodyweight', 'accessory'];
  const catLabels = { all: 'All', free_weights: 'Free Weights', racks: 'Racks', benches: 'Benches', cables: 'Cables', machines: 'Machines', legs: 'Legs', cardio: 'Cardio', bodyweight: 'BW', accessory: 'Accessories' };

  const catTabs = '<div class="cap-tab-bar" role="tablist" aria-label="Equipment categories">' +
    cats.map(c => '<button type="button" class="cap-tab' + (_eqFilter === c ? ' on' : '') + '" role="tab" aria-selected="' + (_eqFilter === c) + '" onclick="_eqFilter=\'' + c + '\';go(\'equipment-setup\')">' + (catLabels[c] || c) + '</button>').join('') +
    '</div>';

  const brandColors = {
    'Life Fitness': '#c8102e',
    'Hammer Strength': '#f5c842',
    'Technogym': '#0066cc',
    'Precor': '#00843d',
    'Matrix': '#111111',
    'Cybex': '#005eb8'
  };

  const rows = items.map(item => {
    const on = selected.includes(item.id);
    const badge = item.brand ?
      '<span style="display:inline-block;font-size:9px;font-weight:800;padding:2px 7px;border-radius:6px;margin-top:5px;letter-spacing:0.04em;text-transform:uppercase;background:' + (brandColors[item.brand] || 'var(--c1)') + '22;color:' + (brandColors[item.brand] || 'var(--c1)') + ';border:1px solid ' + (brandColors[item.brand] || 'var(--c1)') + '44">' + esc(item.brand) + '</span>' : '';
    return '<div onclick="toggleEquipment(\'' + item.id + '\')" style="display:flex;align-items:center;gap:12px;padding:13px 16px;border-bottom:1px solid var(--border);cursor:pointer;touch-action:manipulation">' +
      '<div style="width:26px;height:26px;border-radius:8px;border:2px solid ' + (on ? 'var(--c1)' : 'var(--border)') + ';background:' + (on ? 'var(--c1)' : 'transparent') + ';display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700">' + (on ? '✓' : '') + '</div>' +
      '<div style="flex:1;min-width:0"><div style="font-size:14px;font-weight:600;color:var(--txt)">' + esc(item.name) + '</div>' +
      (badge || (item.category ? '<div style="font-size:11px;color:var(--txt3);margin-top:2px">' + esc(item.category.replace('_', ' ')) + '</div>' : '')) +
      '</div></div>';
  }).join('');

  return '<div class="topbar"><button type="button" onclick="go(\'settings\',{tab:\'training\'})" style="background:none;border:none;color:var(--c1);font-size:15px;cursor:pointer;padding:0 16px">← Back</button>' +
    '<div class="topbar-title">My Equipment</div></div>' +

    '<div style="padding:16px">' +
    '<div style="font-size:13px;color:var(--txt2);line-height:1.55;margin-bottom:12px">Select everything you have access to. Workouts will only suggest exercises you can actually do.</div>' +
    '<div style="display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap">' + envBtns + '</div>' +
    '<div class="field-wrap"><label class="field-label">Filter by brand</label>' +
    '<select class="field" onchange="_eqBrand=this.value;go(\'equipment-setup\')">' + brandOpts + '</select></div>' +
    '<div style="display:flex;gap:8px;margin-top:12px">' +
    '<button type="button" class="btn btn-secondary btn-sm" onclick="selectEquipmentPreset(\'gym_full\')">🏢 Full Gym</button>' +
    '<button type="button" class="btn btn-secondary btn-sm" onclick="selectEquipmentPreset(\'home_basic\')">🏠 Home Basics</button>' +
    '<button type="button" class="btn btn-secondary btn-sm" onclick="selectEquipmentPreset(\'bodyweight\')">🤸 Bodyweight</button>' +
    '</div></div>' +

    catTabs +
    '<div style="background:var(--bg3);border-top:1px solid var(--border)">' + rows + '</div>' +
    '<div style="padding:16px calc(16px + var(--safe))">' +
    '<div style="font-size:12px;color:var(--txt3);margin-bottom:10px;text-align:center">' + selected.length + ' items selected</div>' +
    '<button type="button" class="btn btn-primary" style="width:100%" onclick="saveEquipmentSetup()">Save Equipment</button></div>';
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
  toast('Equipment saved — workouts filtered to your setup', 'ok');
  go('settings', { tab: 'training' });
};
