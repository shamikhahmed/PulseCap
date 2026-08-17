'use strict';
/* Training-split metadata for Settings recommenders.
   These 20 ids are live in SplitEngine._getSplitDays (including custom).
   PlanCatalog templates (fullbody_3, ppl_6, machine_ppl_shoulder, …) are a
   separate prescribed-load layer — not a subset of this list. */

window.SplitsDB = {
  splits: [
    { id: 'ppl', name: 'Push Pull Legs', days: 6, level: ['intermediate','advanced'], goals: ['hypertrophy','recomp'], desc: 'Gold standard for muscle building. High frequency per muscle.' },
    { id: 'ppl_5', name: 'Push Pull Legs (5-day)', days: 5, level: ['intermediate'], goals: ['hypertrophy','maintenance'], desc: 'PPL with one rest day mid-week.' },
    { id: 'ul', name: 'Upper / Lower', days: 4, level: ['beginner','intermediate'], goals: ['hypertrophy','strength','recomp','general_health'], desc: 'Balanced frequency. Great for most people.' },
    { id: 'ul_3', name: 'Upper / Lower (3-day)', days: 3, level: ['beginner'], goals: ['general_health','fat_loss','maintenance','weight_gain'], desc: '3 days/week. Perfect for busy schedules.' },
    { id: 'fb', name: 'Full Body', days: 3, level: ['beginner'], goals: ['general_health','fat_loss','weight_gain','maintenance'], desc: 'Hit everything each session. Best for beginners.' },
    { id: 'fb_2', name: 'Full Body (2-day)', days: 2, level: ['beginner'], goals: ['general_health','maintenance','mobility'], desc: 'Minimum effective dose. Stay active with limited time.' },
    { id: 'bro', name: 'Bro Split', days: 5, level: ['intermediate'], goals: ['hypertrophy'], desc: 'One muscle group per day. Classic bodybuilding.' },
    { id: 'arnold', name: 'Arnold Split', days: 6, level: ['advanced'], goals: ['hypertrophy'], desc: 'Chest/Back, Shoulders/Arms, Legs ×2 per week.' },
    { id: 'phul', name: 'PHUL (Power Hypertrophy)', days: 4, level: ['intermediate','advanced'], goals: ['strength','hypertrophy'], desc: '2 power days + 2 hypertrophy days.' },
    { id: 'phat', name: 'PHAT', days: 5, level: ['advanced'], goals: ['hypertrophy','strength'], desc: 'Layne Norton style. Power + hypertrophy each week.' },
    { id: 'push_pull', name: 'Push / Pull', days: 4, level: ['intermediate'], goals: ['hypertrophy','strength'], desc: 'Upper split simplified. Legs on pull or push days.' },
    { id: 'str', name: 'Strength Focus', days: 4, level: ['intermediate','advanced'], goals: ['strength'], desc: 'Squat, bench, deadlift, OHP priority.' },
    { id: 'powerbuilding', name: 'Powerbuilding', days: 5, level: ['advanced'], goals: ['strength','hypertrophy'], desc: 'Heavy compounds + hypertrophy accessories.' },
    { id: 'home', name: 'Home Warrior', days: 4, level: ['beginner','intermediate'], goals: ['general_health','fat_loss','maintenance'], desc: 'Minimal equipment. DB, bands, bodyweight.' },
    { id: 'cardio_strength', name: 'Strength + Cardio', days: 4, level: ['beginner','intermediate'], goals: ['endurance','fat_loss','general_health'], desc: '2 lift days + 2 cardio sessions.' },
    { id: 'starting_strength', name: 'Starting Strength', days: 3, level: ['beginner'], goals: ['strength','weight_gain'], desc: 'Linear progression. Squat 3×/week.' },
    { id: 'stronglifts', name: 'StrongLifts 5×5', days: 3, level: ['beginner'], goals: ['strength','weight_gain'], desc: 'Simple 5×5 on big lifts. Add 2.5kg each session.' },
    { id: '531', name: '5/3/1', days: 4, level: ['intermediate','advanced'], goals: ['strength'], desc: 'Wendler 5/3/1. Sustainable long-term strength.' },
    { id: 'upper_lower_fb', name: 'UL + Full Body', days: 5, level: ['intermediate'], goals: ['hypertrophy','recomp'], desc: 'Upper, lower, full body rotation.' },
    { id: 'custom', name: 'Custom / Flexible', days: 0, level: ['beginner','intermediate','advanced','athlete'], goals: ['maintenance','general_health','mobility','longevity'], desc: 'You choose each day. No fixed structure.' }
  ],

  byId(id) { return this.splits.find(s => s.id === id); },

  recommend(user) {
    const goal = user.goal || 'hypertrophy';
    const exp = user.exp || 'intermediate';
    const days = user.weeklyGoal || user.gymDays?.length || 4;
    const env = user.trainingEnvironments || ['gym'];
    const homeOnly = env.length === 1 && env[0] === 'home';

    let scored = this.splits.map(s => {
      let score = 0;
      if (s.goals.includes(goal)) score += 30;
      if (s.level.includes(exp)) score += 20;
      if (s.days === 0) score += 5;
      else if (Math.abs(s.days - days) <= 1) score += 25;
      else if (Math.abs(s.days - days) <= 2) score += 10;
      if (homeOnly && s.id === 'home') score += 40;
      if (goal === 'weight_gain' && ['fb','starting_strength','stronglifts','ul'].includes(s.id)) score += 15;
      if (goal === 'general_health' && ['fb','ul_3','fb_2','cardio_strength'].includes(s.id)) score += 20;
      if (goal === 'fat_loss' && ['fb','ul_3','cardio_strength','home'].includes(s.id)) score += 15;
      if (exp === 'beginner' && ['fb','ul_3','starting_strength'].includes(s.id)) score += 15;
      return { split: s, score };
    });
    scored.sort((a, b) => b.score - a.score);
    const top = scored[0];
    return {
      id: top.split.id,
      name: top.split.name,
      daysPerWeek: top.split.days || days,
      reason: top.split.desc,
      alternatives: scored.slice(1, 4).map(x => x.split)
    };
  }
};
