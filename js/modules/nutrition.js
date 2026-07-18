'use strict';
/* ── PulseCap v4 — Nutrition / Supplements / Water ── */

reg('nutrition', function() {
  const user = S.g('user') || {};
  const meals = S.g('meals') || [];
  const water = S.g('water') || [];
  const userSupps = S.g('supplements') || [];
  const logs = S.g('supplementLogs') || [];

  const todayCals = meals.filter(m=>m.date===today()).reduce((a,m)=>a+(m.calories||0),0);
  const calTarget = user.calorieTarget || 2200;
  const todayP = meals.filter(m=>m.date===today()).reduce((a,m)=>a+(m.protein||0),0);
  const todayC = meals.filter(m=>m.date===today()).reduce((a,m)=>a+(m.carbs||0),0);
  const todayF = meals.filter(m=>m.date===today()).reduce((a,m)=>a+(m.fat||0),0);
  const todayWater = water.filter(w=>w.date===today()).length;
  const waterTarget = user.waterTarget || 8;
  const dueSupps = SupplementEngine.getDueNow();

  return '<div class="topbar"><div class="topbar-title">Nutrition & Supplements</div></div>' +
    _calSection(todayCals, calTarget, todayP, todayC, todayF, user) +
    _mealPresets() +
    _foodSearch() +
    _nutritionStreak(meals) +
    _waterSection(todayWater, waterTarget) +
    _mealHistory(meals) +
    _dueSuppsSection(dueSupps) +
    _mySuppsSection(userSupps, logs) +
    _stackSuggestions(user) +
    '<div  class="spacer-bottom"></div>';
});

function _calSection(cals, target, p, c, f, user) {
  const pct = Math.min(Math.round((cals/target)*100), 100);
  const remain = Math.max(0, target - cals);
  const macros = TDEEEngine.macroSplit(user.goal||'hypertrophy', target);

  return sh('Today\'s Nutrition', '+ Log', 'showLogMeal()') +
    '<div class="card card-solid">' +
    '<div style="display:flex;align-items:center;gap:20px;margin-bottom:16px">' +
    '<div style="position:relative;width:80px;height:80px;flex-shrink:0">' +
    '<svg width="80" height="80" viewBox="0 0 80 80" style="transform:rotate(-90deg)">' +
    '<circle cx="40" cy="40" r="32" fill="none" stroke="var(--bg4)" stroke-width="8"/>' +
    '<circle cx="40" cy="40" r="32" fill="none" stroke="var(--c1)" stroke-width="8" stroke-linecap="round" stroke-dasharray="201" stroke-dashoffset="'+(201*(1-pct/100))+'"/>' +
    '</svg>' +
    '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center">' +
    '<div style="font-size:16px;font-weight:900;color:var(--txt);line-height:1">'+cals+'</div>' +
    '<div style="font-size:9px;font-weight:700;text-transform:uppercase;color:var(--txt3)">kcal</div>' +
    '</div></div>' +
    '<div  class="flex-1">' +
    '<div style="font-size:22px;font-weight:800;color:var(--c1)">'+remain+'<span style="font-size:13px;font-weight:500;color:var(--txt3)"> remaining</span></div>' +
    '<div  class="muted-12">Target: '+target+'kcal</div>' +
    '</div></div>' +
    '<div class="macro-bar-wrap">' +
    _macroBar('Protein', p, macros.protein, '#10B981', 'macro-protein') +
    _macroBar('Carbs', c, macros.carbs, '#3B82F6', 'macro-carbs') +
    _macroBar('Fat', f, macros.fat, '#f5c842', 'macro-fat') +
    '</div></div>';
}

function _macroBar(name, current, target, color, cls) {
  const pct = target > 0 ? Math.min(Math.round((current/target)*100), 100) : 0;
  return '<div class="macro-bar-wrap">' +
    '<div class="macro-bar-row">' +
    '<span class="macro-bar-name">'+esc(name)+'</span>' +
    '<span class="macro-bar-val">'+current+'/'+target+'g</span>' +
    '</div>' +
    '<div class="macro-bar">' +
    '<div class="macro-bar-fill '+cls+'" style="width:'+pct+'%"></div>' +
    '</div></div>';
}

function _waterSection(current, target) {
  const drops = Array.from({length: target}, (_, i) =>
    '<button type="button" class="water-drop'+(i<current?' filled':'')+'" aria-label="Glass '+(i+1)+'" onclick="logWater('+(i+1)+')"></button>'
  ).join('');
  return sh('Water Intake', current+'/'+target+' glasses') +
    '<div class="water-grid">'+drops+'</div>' +
    '<div style="padding:4px 16px 14px;font-size:13px;color:var(--txt3)">'+Math.round(current*0.25*10)/10+'L today · Target: '+Math.round(target*0.25*10)/10+'L</div>';
}

function _dueSuppsSection(due) {
  if (!due.length) return '';
  return sh('Due Now') +
    due.map(s =>
      '<div class="supp-card due">' +
      '<div class="supp-icon">'+icon('pill',22)+'</div>' +
      '<div class="supp-info">' +
      '<div class="supp-name">'+esc(s.name)+'</div>' +
      '<div class="supp-timing">'+esc(s.timing)+' · '+esc(s.dose||'')+'</div>' +
      '</div>' +
      '<button type="button" class="supp-mark" onclick="SupplementEngine.markTaken(\''+esc(s.id)+'\');go(\'nutrition\')">Done</button>' +
      '</div>'
    ).join('');
}

function _mySuppsSection(userSupps, logs) {
  if (!userSupps.length) return sh('My Stack') +
    emptyState(icon('pill',30),'No supplements','Add your stack in the onboarding or below','+ Add Supplement','showAddSuppModal()');

  return sh('My Stack', '+ Add', 'showAddSuppModal()') +
    userSupps.map(s => {
      const todayLogs = logs.filter(l=>l.suppId===s.id&&l.date===today());
      const taken = todayLogs.length > 0;
      const lastTime = todayLogs.length ? new Date(todayLogs[todayLogs.length-1].time).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}) : null;
      const dbEntry = SupplementDB.find(d=>d.id===s.id)||{};
      const cafWarn = dbEntry.caffeine ? SupplementEngine.checkCaffeineWarning(dbEntry,22) : null;
      return '<div class="supp-card'+(taken?' taken':'')+'">' +
        '<div class="supp-icon" style="color:'+(taken?'#30d158':'var(--c1)')+'">'+icon(taken?'check':'pill',22)+'</div>' +
        '<div class="supp-info">' +
        '<div class="supp-name">'+esc(s.name)+'</div>' +
        '<div class="supp-timing">'+esc(s.timing)+' · '+esc(s.dose||dbEntry.dose||'')+'</div>' +
        (taken&&lastTime?'<div class="supp-taken">Taken at '+lastTime+'</div>':'') +
        (cafWarn?'<div class="supp-warn" style="display:flex;align-items:center;gap:4px">'+icon('alert',13,'#f5c842')+esc(cafWarn)+'</div>':'') +
        '</div>' +
        (!taken?'<button type="button" class="supp-mark" onclick="SupplementEngine.markTaken(\''+esc(s.id)+'\');go(\'nutrition\')">Done</button>':'') +
        '</div>';
    }).join('');
}

function _stackSuggestions(user) {
  const goal = user.goal || 'hypertrophy';
  const stack = SupplementEngine.getStack(goal);
  const userSuppIds = (S.g('supplements')||[]).map(s=>s.id);
  const suggestions = stack.filter(s => !userSuppIds.includes(s.id));
  if (!suggestions.length) return '';
  return sh('Recommended for Your Goal') +
    suggestions.slice(0,4).map(s =>
      '<div class="supp-card">' +
      '<div class="supp-icon" style="color:var(--c5)">'+icon('sparkles',22)+'</div>' +
      '<div class="supp-info">' +
      '<div class="supp-name">'+esc(s.name)+'</div>' +
      '<div class="supp-timing">'+esc(s.dose)+' · '+esc(s.timing)+'</div>' +
      '<div  class="muted-12">'+esc(s.notes)+'</div>' +
      '</div>' +
      '<button type="button" class="supp-mark" onclick="addSuppToStack(\''+s.id+'\')">+ Add</button>' +
      '</div>'
    ).join('');
}

var MEAL_PRESETS = {
  breakfast: [
    { name: 'Oats & Banana', calories: 380, protein: 12, carbs: 62, fat: 8 },
    { name: 'Eggs & Toast', calories: 420, protein: 28, carbs: 32, fat: 18 },
    { name: 'Greek Yogurt Bowl', calories: 280, protein: 24, carbs: 28, fat: 6 }
  ],
  lunch: [
    { name: 'Chicken Rice Bowl', calories: 580, protein: 48, carbs: 58, fat: 12 },
    { name: 'Turkey Wrap', calories: 450, protein: 32, carbs: 42, fat: 14 },
    { name: 'Tuna Salad', calories: 390, protein: 36, carbs: 18, fat: 16 }
  ],
  dinner: [
    { name: 'Salmon & Veg', calories: 520, protein: 42, carbs: 24, fat: 22 },
    { name: 'Steak & Potato', calories: 640, protein: 46, carbs: 38, fat: 28 },
    { name: 'Stir Fry & Rice', calories: 490, protein: 34, carbs: 52, fat: 14 }
  ],
  snacks: [
    { name: 'Protein Shake', calories: 200, protein: 40, carbs: 8, fat: 3 },
    { name: 'Apple & PB', calories: 220, protein: 6, carbs: 24, fat: 12 },
    { name: 'Rice Cakes', calories: 140, protein: 4, carbs: 28, fat: 2 }
  ]
};

function _mealPresets() {
  var chips = [
    { key: 'breakfast', label: 'Breakfast', icon: 'sun' },
    { key: 'lunch', label: 'Lunch', icon: 'leaf' },
    { key: 'dinner', label: 'Dinner', icon: 'moon' },
    { key: 'snacks', label: 'Snacks', icon: 'apple' }
  ];
  return sh('Quick Add') +
    '<div  class="pad-x-16-b">' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px">' +
    chips.map(function(c) {
      return '<button type="button" onclick="showMealPresets(\'' + c.key + '\')" style="flex:1;min-width:72px;padding:10px 8px;background:var(--bg4);border:1px solid var(--border);border-radius:12px;color:var(--txt);font-size:12px;font-weight:700;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;justify-content:center;gap:6px">' +
        '<span style="color:var(--c1);display:inline-flex">' + icon(c.icon, 16) + '</span>' + esc(c.label) + '</button>';
    }).join('') +
    '</div>' +
    '<div  class="muted-11">Tap a meal slot, then pick a preset — or use + Log for custom entries.</div>' +
    '</div>';
}

function _foodSearch() {
  return sh('Food library (offline)') +
    '<div class="pad-x-16-b">' +
    '<input id="food-q" class="field" placeholder="Search chicken, oats, whey…" oninput="renderFoodHits(this.value)" style="margin-bottom:8px">' +
    '<div id="food-hits"></div>' +
    '<div class="muted-11">Local macros only — no barcode API. Serving = listed portion.</div>' +
    '</div>';
}

window.renderFoodHits = function(q) {
  var el = document.getElementById('food-hits');
  if (!el || typeof FoodEngine === 'undefined') return;
  var hits = FoodEngine.search(q);
  el.innerHTML = hits.map(function(f) {
    return '<button type="button" onclick="addFoodMeal(\'' + f.id + '\',1)" style="width:100%;text-align:left;padding:10px 12px;margin-bottom:6px;background:var(--bg3);border:1px solid var(--border);border-radius:12px;cursor:pointer;touch-action:manipulation">' +
      '<div style="font-size:13px;font-weight:700;color:var(--txt)">' + esc(f.name) + '</div>' +
      '<div class="muted-11">' + f.cal + ' kcal · P' + f.p + ' C' + f.c + ' F' + f.f + '</div></button>';
  }).join('') || '<div class="muted-12">No matches</div>';
};

window.addFoodMeal = function(id, servings) {
  var food = (FOODS_DB || []).find(function(f) { return f.id === id; });
  if (!food || typeof FoodEngine === 'undefined') return;
  S.push('meals', FoodEngine.toMeal(food, servings));
  toast('Added ' + food.name, 'ok');
  go('nutrition');
};

function _mealHistory(meals) {
  const todayMeals = meals.filter(m => m.date === today());
  if (!todayMeals.length) return '';
  return sh('Today\'s Meals', 'Clear', 'if(confirm(\'Clear today\\\'s meals?\'))' +
    '{S.set(\'meals\',(S.g(\'meals\')||[]).filter(function(m){return m.date!==today();}));go(\'nutrition\')}') +
    '<div  class="pad-x-16">' +
    todayMeals.map(m =>
      '<div class="list-divider-row">' +
      '<div><div  class="row-strong">'+esc(m.name||'Meal')+'</div>' +
      '<div  class="muted-12">'+esc(m.time?new Date(m.time).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}):'')+'</div></div>' +
      '<div class="ta-right">' +
      '<div style="font-size:14px;font-weight:700;color:var(--c1)">'+m.calories+'kcal</div>' +
      '<div  class="muted-11">P:'+m.protein+'g C:'+m.carbs+'g F:'+m.fat+'g</div>' +
      '</div></div>'
    ).join('') +
    '</div>';
}

function _nutritionStreak(meals) {
  let streak = 0;
  const d = new Date();
  while (true) {
    const ds = localISO(d);
    if (!(meals||[]).some(m => m.date === ds)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  if (streak < 2) return '';
  return '<div style="margin:0 16px 14px;padding:10px 14px;background:rgba(var(--c5-rgb,255,152,0),0.1);border:1px solid rgba(var(--c5-rgb,255,152,0),0.2);border-radius:12px;display:flex;align-items:center;gap:10px">' +
    '<div style="color:var(--c5);display:inline-flex">'+icon('flame',20)+'</div>' +
    '<div><div  class="row-title">'+streak+' day nutrition streak</div>' +
    '<div  class="muted-11">Keep logging meals daily</div></div>' +
    '</div>';
}

window.logWater = function(n) {
  const water = S.g('water') || [];
  const todayCount = water.filter(w=>w.date===today()).length;
  if (n <= todayCount) {
    const toRemove = water.filter(w=>w.date===today());
    if (toRemove.length > 0) {
      const all = water.filter(w=>w.date!==today());
      all.push(...toRemove.slice(0, n-1));
      S.set('water', all);
    }
  } else {
    for (let i=todayCount; i<n; i++) S.push('water', {date:today(), time:isoNow()});
  }
  go('nutrition');
};

window.addSuppToStack = function(id) {
  const db = SupplementDB.find(s=>s.id===id);
  if (!db) return;
  const supps = S.g('supplements') || [];
  if (!supps.find(s=>s.id===id)) {
    S.push('supplements', { id:db.id, name:db.name, timing:db.timing, dose:db.dose, active:true });
    toast(db.name + ' added to stack', 'ok');
    go('nutrition');
  }
};

window.showAddSuppModal = function() {
  const userSupps = S.g('supplements') || [];
  const existing = userSupps.map(s=>s.id);
  const list = SupplementDB.filter(s=>!existing.includes(s.id)).map(s =>
    '<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">' +
    '<div  class="flex-1"><div  class="row-strong">'+esc(s.name)+'</div>' +
    '<div  class="muted-12">'+esc(s.dose)+' · '+esc(s.timing)+'</div></div>' +
    '<button type="button" onclick="addSuppToStack(\''+s.id+'\');closeModal()" style="color:var(--c1);background:none;border:none;font-size:13px;font-weight:700;cursor:pointer;padding:8px;min-height:44px">+ Add</button>' +
    '</div>'
  ).join('');
  modal('Add Supplement', list||'<div style="color:var(--txt3);padding:16px">All supplements already in stack</div>');
};

window.showMealPresets = function(slot) {
  var presets = MEAL_PRESETS[slot] || [];
  if (!presets.length) return;
  var labels = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snacks: 'Snacks' };
  modal((labels[slot] || 'Meal') + ' Presets',
    presets.map(function(p, i) {
      return '<div class="list-divider-row">' +
        '<div><div  class="row-strong">' + esc(p.name) + '</div>' +
        '<div  class="muted-11">P:' + p.protein + 'g · C:' + p.carbs + 'g · F:' + p.fat + 'g</div></div>' +
        '<button type="button" onclick="quickAddMeal(' + i + ',\'' + slot + '\')" style="color:var(--c1);background:none;border:none;font-size:13px;font-weight:700;cursor:pointer;padding:8px;min-height:44px">+' + p.calories + '</button>' +
        '</div>';
    }).join('')
  );
};

window.quickAddMeal = function(idx, slot) {
  var p = (MEAL_PRESETS[slot] || [])[idx];
  if (!p) return;
  S.push('meals', { name: p.name, calories: p.calories, protein: p.protein, carbs: p.carbs, fat: p.fat, date: today(), time: isoNow() });
  closeModal();
  toast(p.name + ' logged (' + p.calories + ' kcal)', 'ok');
  go('nutrition');
};

window.showLogMeal = function() {
  modal('Log Meal',
    '<div class="field-wrap"><label class="field-label">Meal Name</label>' +
    '<input id="meal-name" class="field" type="text" placeholder="e.g. Chicken & Rice"></div>' +
    '<div class="field-row">' +
    '<div class="field-wrap"><label class="field-label">Calories</label><input id="meal-cal" class="field" type="number" placeholder="500"></div>' +
    '<div class="field-wrap"><label class="field-label">Protein (g)</label><input id="meal-p" class="field" type="number" placeholder="40"></div>' +
    '</div>' +
    '<div class="field-row">' +
    '<div class="field-wrap"><label class="field-label">Carbs (g)</label><input id="meal-c" class="field" type="number" placeholder="60"></div>' +
    '<div class="field-wrap"><label class="field-label">Fat (g)</label><input id="meal-f" class="field" type="number" placeholder="15"></div>' +
    '</div>',
    '<button type="button" class="btn btn-primary mt-12" onclick="saveMeal()">Save Meal</button>'
  );
};

window.saveMeal = function() {
  const name = document.getElementById('meal-name')?.value;
  const cal = parseFloat(document.getElementById('meal-cal')?.value)||0;
  const p = parseFloat(document.getElementById('meal-p')?.value)||0;
  const c = parseFloat(document.getElementById('meal-c')?.value)||0;
  const f = parseFloat(document.getElementById('meal-f')?.value)||0;
  if (!cal) { toast('Enter calories', 'warn'); return; }
  S.push('meals', { name:name||'Meal', calories:cal, protein:p, carbs:c, fat:f, date:today(), time:isoNow() });
  closeModal(); toast('Meal logged!', 'ok'); go('nutrition');
};
