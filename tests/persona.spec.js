// @ts-check
const { test, expect } = require('@playwright/test');

const PERSONAS = {
  sara: {
    name: 'Sara', gender: 'female', sex: 'female', age: 29, height: 165, weight: 78,
    goal: 'fat_loss', exp: 'beginner', daysPerWeek: 3, weeklyGoal: 3,
    equipmentKit: 'machines_cables', equipmentConfigured: true,
    limitations: []
  },
  bilal: {
    name: 'Bilal', gender: 'male', sex: 'male', age: 24, height: 178, weight: 72,
    goal: 'hypertrophy', exp: 'intermediate', daysPerWeek: 5, weeklyGoal: 5,
    equipmentKit: 'full_gym', equipmentConfigured: true,
    limitations: []
  },
  tim: {
    name: 'Tim', gender: 'male', sex: 'male', age: 19, height: 175, weight: 58,
    goal: 'weight_gain', exp: 'beginner', daysPerWeek: 5, weeklyGoal: 5,
    equipmentKit: 'full_gym', equipmentConfigured: true,
    limitations: []
  },
  ayesha: {
    name: 'Ayesha', gender: 'female', sex: 'female', age: 35, height: 162, weight: 64,
    goal: 'fat_loss', exp: 'beginner', daysPerWeek: 2, weeklyGoal: 2,
    equipmentKit: 'home_minimal', equipmentConfigured: true, equipment: [],
    limitations: []
  }
};

function barbellForbidden(name) {
  return /barbell|deadlift|overhead press|bench press/i.test(name) && !/machine|smith|dumbbell|push-up|bodyweight/i.test(name);
}

test.describe('Persona personalization spine', () => {
  test('calories, protein and session count differ; equipment is respected', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => window.NutritionMath && window.PlanCatalog && window.Equipment);

    const out = await page.evaluate((personas) => {
      function seed(p) {
        const tags = window.Equipment.tagsForKit(p.equipmentKit);
        window.S.set('onboarded', true);
        window.S.set('trainingPlan', null);
        window.S.set('user', Object.assign({}, window.S.g('user') || {}, p, {
          equipment: p.equipmentKit === 'home_minimal' ? [] : tags,
          macrosPinned: false
        }));
        window.NutritionMath.applyToUser(window.S.g('user'));
        window.S.set('user', window.S.g('user'));
        const user = window.S.g('user');
        const n = window.NutritionMath.fromUser(user);
        const match = window.PlanCatalog.match(user);
        const names = [];
        Object.keys(match.plan.sessions || {}).forEach(function(id) {
          (match.plan.sessions[id].exercises || []).forEach(function(ex) {
            names.push(ex.name);
          });
        });
        const blocked = names.filter(function(name) {
          return !window.Equipment.canPerform(name, user);
        });
        window.go('nutrition');
        const text = document.getElementById('view').innerText;
        return {
          calories: n.calories,
          protein: n.protein,
          proteinPerKg: n.proteinPerKg,
          sessions: (match.plan.rotation || []).length,
          template: match.id,
          names: names,
          blocked: blocked,
          screenHasCalories: text.indexOf(String(n.calories)) >= 0,
          screenHas2200: /\b2200\b/.test(text)
        };
      }
      return {
        sara: seed(personas.sara),
        bilal: seed(personas.bilal),
        tim: seed(personas.tim),
        ayesha: seed(personas.ayesha)
      };
    }, PERSONAS);

    const cals = [out.sara.calories, out.bilal.calories, out.tim.calories, out.ayesha.calories];
    expect(new Set(cals).size).toBeGreaterThanOrEqual(3);
    expect(out.sara.calories).not.toBe(2200);
    expect(out.tim.calories).not.toBe(2200);
    expect(out.tim.calories).toBeGreaterThan(out.sara.calories);
    expect(out.tim.calories).toBeGreaterThan(2400);

    expect(out.sara.protein).not.toBe(out.bilal.protein);
    expect(out.sara.proteinPerKg).toBeLessThanOrEqual(2.2);
    expect(out.ayesha.proteinPerKg).toBeLessThanOrEqual(2.2);
    expect(out.sara.protein / 78).toBeLessThan(3);
    expect(out.ayesha.protein / 64).toBeLessThan(3);

    expect(out.sara.sessions).toBe(3);
    expect(out.bilal.sessions).toBe(5);
    expect(out.ayesha.sessions).toBe(2);
    expect(out.sara.template).toBe('machines_fb_3');
    expect(out.ayesha.template).toBe('home_bw');

    expect(out.sara.blocked).toEqual([]);
    expect(out.ayesha.blocked).toEqual([]);
    expect(out.ayesha.names.some(barbellForbidden)).toBeFalsy();
    expect(out.sara.names.some(function(n) { return /barbell row|deadlift|overhead press/i.test(n); })).toBeFalsy();

    expect(out.sara.screenHasCalories).toBeTruthy();
    expect(out.tim.screenHas2200).toBeFalsy();
  });

  test('owner seed stays machine/Smith with no barbell row or deadlift', async ({ page }) => {
    await page.goto('/?owner=1');
    await page.waitForFunction(() => window.TrainingPlanEngine && window.bootOwnerSeed);
    const out = await page.evaluate(() => {
      const p = window.TrainingPlanEngine.get();
      const names = [];
      Object.keys((p && p.sessions) || {}).forEach(function(id) {
        ((p.sessions[id].exercises) || []).forEach(function(ex) { names.push(ex.name); });
      });
      return {
        title: p && p.title,
        sessions: p && (p.rotation || []).length,
        names: names,
        kit: window.S.g('user.equipmentKit')
      };
    });
    expect(out.kit).toBe('machines_cables');
    expect(out.sessions).toBeGreaterThanOrEqual(5);
    expect(out.names.join(' ')).not.toMatch(/Barbell Row/i);
    expect(out.names.join(' ')).not.toMatch(/\bDeadlift\b/i);
    expect(out.names.join(' ')).not.toMatch(/\bOverhead Press\b/i);
  });
});
