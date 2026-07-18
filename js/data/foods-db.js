'use strict';
/* Offline food library — no API. Macros per common serving. */
window.FOODS_DB = [
  { id: 'egg', name: 'Egg (large)', cal: 72, p: 6, c: 0.4, f: 5, g: 50 },
  { id: 'egg_white', name: 'Egg white', cal: 17, p: 3.6, c: 0.2, f: 0, g: 33 },
  { id: 'chicken_breast', name: 'Chicken breast (cooked)', cal: 165, p: 31, c: 0, f: 3.6, g: 100 },
  { id: 'turkey', name: 'Turkey breast', cal: 135, p: 30, c: 0, f: 1, g: 100 },
  { id: 'salmon', name: 'Salmon', cal: 208, p: 20, c: 0, f: 13, g: 100 },
  { id: 'tuna', name: 'Tuna (canned in water)', cal: 86, p: 19, c: 0, f: 1, g: 100 },
  { id: 'beef_lean', name: 'Lean beef', cal: 250, p: 26, c: 0, f: 15, g: 100 },
  { id: 'greek_yogurt', name: 'Greek yogurt (plain)', cal: 97, p: 9, c: 3.6, f: 5, g: 100 },
  { id: 'cottage', name: 'Cottage cheese', cal: 98, p: 11, c: 3.4, f: 4.3, g: 100 },
  { id: 'whey', name: 'Whey protein scoop', cal: 120, p: 24, c: 3, f: 1.5, g: 30 },
  { id: 'milk', name: 'Milk (whole) 250ml', cal: 149, p: 8, c: 12, f: 8, g: 250 },
  { id: 'oats', name: 'Oats (dry)', cal: 389, p: 17, c: 66, f: 7, g: 100 },
  { id: 'rice', name: 'White rice (cooked)', cal: 130, p: 2.7, c: 28, f: 0.3, g: 100 },
  { id: 'brown_rice', name: 'Brown rice (cooked)', cal: 112, p: 2.3, c: 24, f: 0.8, g: 100 },
  { id: 'potato', name: 'Potato (baked)', cal: 93, p: 2.5, c: 21, f: 0.1, g: 100 },
  { id: 'sweet_potato', name: 'Sweet potato', cal: 86, p: 1.6, c: 20, f: 0.1, g: 100 },
  { id: 'banana', name: 'Banana (medium)', cal: 105, p: 1.3, c: 27, f: 0.4, g: 118 },
  { id: 'apple', name: 'Apple (medium)', cal: 95, p: 0.5, c: 25, f: 0.3, g: 182 },
  { id: 'berries', name: 'Mixed berries', cal: 57, p: 0.7, c: 14, f: 0.3, g: 100 },
  { id: 'broccoli', name: 'Broccoli', cal: 34, p: 2.8, c: 7, f: 0.4, g: 100 },
  { id: 'spinach', name: 'Spinach', cal: 23, p: 2.9, c: 3.6, f: 0.4, g: 100 },
  { id: 'avocado', name: 'Avocado (half)', cal: 160, p: 2, c: 8.5, f: 15, g: 100 },
  { id: 'almonds', name: 'Almonds', cal: 579, p: 21, c: 22, f: 50, g: 100 },
  { id: 'peanut_butter', name: 'Peanut butter (tbsp)', cal: 94, p: 4, c: 3, f: 8, g: 16 },
  { id: 'olive_oil', name: 'Olive oil (tbsp)', cal: 119, p: 0, c: 0, f: 13.5, g: 14 },
  { id: 'bread', name: 'Whole wheat bread (slice)', cal: 81, p: 4, c: 14, f: 1.1, g: 28 },
  { id: 'pasta', name: 'Pasta (cooked)', cal: 131, p: 5, c: 25, f: 1.1, g: 100 },
  { id: 'tofu', name: 'Tofu (firm)', cal: 144, p: 17, c: 3, f: 9, g: 100 },
  { id: 'lentils', name: 'Lentils (cooked)', cal: 116, p: 9, c: 20, f: 0.4, g: 100 },
  { id: 'beans', name: 'Black beans (cooked)', cal: 132, p: 8.9, c: 24, f: 0.5, g: 100 },
  { id: 'cheese', name: 'Cheddar cheese', cal: 403, p: 25, c: 1.3, f: 33, g: 100 },
  { id: 'rice_cake', name: 'Rice cake', cal: 35, p: 0.7, c: 7.3, f: 0.3, g: 9 },
  { id: 'honey', name: 'Honey (tbsp)', cal: 64, p: 0.1, c: 17, f: 0, g: 21 },
  { id: 'creatine_food', name: 'Creatine monohydrate (5g)', cal: 0, p: 0, c: 0, f: 0, g: 5 }
];

window.FoodEngine = {
  search: function(q) {
    q = String(q || '').toLowerCase().trim();
    if (!q) return FOODS_DB.slice(0, 12);
    return FOODS_DB.filter(function(f) { return f.name.toLowerCase().indexOf(q) !== -1; }).slice(0, 20);
  },
  toMeal: function(food, servings) {
    servings = Number(servings) || 1;
    return {
      name: food.name + (servings !== 1 ? ' ×' + servings : ''),
      calories: Math.round(food.cal * servings),
      protein: Math.round(food.p * servings * 10) / 10,
      carbs: Math.round(food.c * servings * 10) / 10,
      fat: Math.round(food.f * servings * 10) / 10,
      date: (typeof today === 'function' ? today() : new Date().toISOString().slice(0, 10)),
      time: new Date().toTimeString().slice(0, 5),
      foodId: food.id
    };
  }
};
