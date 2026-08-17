'use strict';
/* Mifflin-St Jeor energy + g/kg macros. Pure functions — no localStorage. */

const NutritionMath = {
  activityFactor: function(daysPerWeek) {
    const d = Number(daysPerWeek);
    const n = Number.isFinite(d) ? Math.max(0, Math.min(7, d)) : 3;
    if (n <= 1) return 1.2;
    if (n === 2) return 1.375;
    if (n === 3) return 1.46;
    if (n === 4) return 1.55;
    if (n === 5) return 1.635;
    return 1.725;
  },

  _sex: function(user) {
    const g = String((user && (user.gender || user.sex)) || '').toLowerCase();
    if (g === 'male' || g === 'm') return 'male';
    if (g === 'female' || g === 'f') return 'female';
    return 'unspecified';
  },

  bmr: function(user) {
    user = user || {};
    const kg = Number(user.weight) > 0 ? Number(user.weight) : 75;
    const cm = Number(user.height) > 0 ? Number(user.height) : 170;
    const age = Number(user.age) > 0 ? Number(user.age) : 30;
    const male = 10 * kg + 6.25 * cm - 5 * age + 5;
    const female = 10 * kg + 6.25 * cm - 5 * age - 161;
    const sex = this._sex(user);
    if (sex === 'male') return { bmr: Math.round(male), estimate: false, sex: sex };
    if (sex === 'female') return { bmr: Math.round(female), estimate: false, sex: sex };
    return { bmr: Math.round((male + female) / 2), estimate: true, sex: sex };
  },

  fromUser: function(user) {
    user = user || {};
    const kg = Number(user.weight) > 0 ? Number(user.weight) : 75;
    const days = Number(user.daysPerWeek || user.weeklyGoal) || 3;
    const factor = this.activityFactor(days);
    const b = this.bmr(user);
    const tdee = Math.round(b.bmr * factor);
    const goal = user.goal || 'hypertrophy';
    const sex = b.sex;
    const minAbs = sex === 'female' ? 1200 : sex === 'male' ? 1500 : 1350;
    const floor = Math.max(minAbs, Math.round(b.bmr * 1.1));
    let calories = tdee;
    let adj = 'maintenance';
    if (goal === 'fat_loss') {
      calories = Math.max(floor, Math.round(tdee * 0.8));
      adj = 'TDEE − 20%';
    } else if (goal === 'hypertrophy' || goal === 'strength') {
      calories = Math.round(tdee * 1.1);
      adj = 'TDEE + 10%';
    } else if (goal === 'weight_gain') {
      calories = Math.round(tdee * 1.15);
      adj = 'TDEE + 15%';
    } else {
      calories = tdee;
      adj = 'TDEE';
    }
    if (calories < floor) calories = floor;

    let protein = Math.round(kg * 1.8);
    const protMax = Math.round(kg * 2.2);
    if (protein > protMax) protein = protMax;
    const proteinPerKg = Math.round((protein / kg) * 100) / 100;

    const fat = Math.round(Math.max(kg * 0.8, (calories * 0.25) / 9));
    const carbKcal = calories - protein * 4 - fat * 9;
    const carbs = Math.max(0, Math.round(carbKcal / 4));

    const goalWord = goal === 'fat_loss' ? 'fat loss' : goal === 'weight_gain' ? 'weight gain' : goal === 'hypertrophy' ? 'muscle' : goal.replace('_', ' ');
    const est = b.estimate ? ' Sex was not given, so BMR is an average of the male and female formulas.' : '';
    const line = '≈' + calories.toLocaleString('en-GB') + ' kcal — from your height, weight, age and ' +
      days + ' session' + (days === 1 ? '' : 's') + '/week (' + adj + ' for ' + goalWord + '). An estimate; adjust by results.' + est;

    return {
      bmr: b.bmr,
      bmrEstimate: b.estimate,
      tdee: tdee,
      activityFactor: factor,
      daysPerWeek: days,
      calories: calories,
      protein: protein,
      proteinPerKg: proteinPerKg,
      fat: fat,
      carbs: carbs,
      floor: floor,
      goal: goal,
      line: line
    };
  },

  applyToUser: function(user) {
    const n = this.fromUser(user);
    user.calorieTarget = n.calories;
    user.proteinTarget = n.protein;
    user.fatTarget = n.fat;
    user.carbTarget = n.carbs;
    return n;
  }
};
window.NutritionMath = NutritionMath;
