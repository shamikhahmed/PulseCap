'use strict';
/* Training-split metadata for Settings recommenders.
   These 20 ids are live in SplitEngine._getSplitDays (including custom).
   PlanCatalog templates (fullbody_3, ppl_6, machine_ppl_shoulder, …) are a
   separate prescribed-load layer — not a subset of this list. */

window.SplitsDB = {
  splits: [
    { id: 'ppl', name: 'Push Pull Legs', days: 6, level: ['beginner','intermediate','advanced'], goals: ['hypertrophy','recomp','weight_gain'], desc: 'Gold standard for muscle building. High frequency per muscle.' },
    { id: 'ppl_5', name: 'Push Pull Legs (5-day)', days: 5, level: ['intermediate','advanced'], goals: ['hypertrophy','maintenance','weight_gain'], desc: 'PPL with one rest day mid-week.' },
    { id: 'ul', name: 'Upper / Lower', days: 4, level: ['beginner','intermediate','advanced'], goals: ['hypertrophy','strength','recomp','general_health','fat_loss','weight_gain'], desc: 'Balanced frequency. Great for most people.' },
    { id: 'ul_3', name: 'Upper / Lower (3-day)', days: 3, level: ['beginner','intermediate'], goals: ['general_health','fat_loss','maintenance','weight_gain','hypertrophy'], desc: '3 days/week. Perfect for busy schedules.' },
    { id: 'fb', name: 'Full Body', days: 3, level: ['beginner','intermediate','advanced'], goals: ['general_health','fat_loss','weight_gain','maintenance','hypertrophy','strength'], desc: 'Hit everything each session. Best for beginners.' },
    { id: 'fb_2', name: 'Full Body (2-day)', days: 2, level: ['beginner','intermediate','advanced'], goals: ['general_health','maintenance','mobility','fat_loss','hypertrophy','strength','weight_gain'], desc: 'Minimum effective dose. Stay active with limited time.' },
    { id: 'bro', name: 'Bro Split', days: 5, level: ['intermediate'], goals: ['hypertrophy'], desc: 'One muscle group per day. Classic bodybuilding.' },
    { id: 'arnold', name: 'Arnold Split', days: 6, level: ['advanced'], goals: ['hypertrophy'], desc: 'Chest/Back, Shoulders/Arms, Legs ×2 per week.' },
    { id: 'phul', name: 'PHUL (Power Hypertrophy)', days: 4, level: ['intermediate','advanced'], goals: ['strength','hypertrophy'], desc: '2 power days + 2 hypertrophy days.' },
    { id: 'phat', name: 'PHAT', days: 5, level: ['advanced'], goals: ['hypertrophy','strength'], desc: 'Layne Norton style. Power + hypertrophy each week.' },
    { id: 'push_pull', name: 'Push / Pull', days: 4, level: ['intermediate'], goals: ['hypertrophy','strength'], desc: 'Upper split simplified. Legs on pull or push days.' },
    { id: 'str', name: 'Strength Focus', days: 4, level: ['intermediate','advanced'], goals: ['strength'], desc: 'Squat, bench, deadlift, OHP priority.' },
    { id: 'powerbuilding', name: 'Powerbuilding', days: 5, level: ['advanced'], goals: ['strength','hypertrophy'], desc: 'Heavy compounds + hypertrophy accessories.' },
    { id: 'home', name: 'Home Warrior', days: 4, level: ['beginner','intermediate','advanced'], goals: ['general_health','fat_loss','maintenance','hypertrophy'], desc: 'Minimal equipment. DB, bands, bodyweight.' },
    { id: 'cardio_strength', name: 'Strength + Cardio', days: 4, level: ['beginner','intermediate'], goals: ['endurance','fat_loss','general_health'], desc: '2 lift days + 2 cardio sessions.' },
    { id: 'starting_strength', name: 'Starting Strength', days: 3, level: ['beginner'], goals: ['strength','weight_gain'], desc: 'Linear progression. Squat 3×/week.' },
    { id: 'stronglifts', name: 'StrongLifts 5×5', days: 3, level: ['beginner'], goals: ['strength','weight_gain'], desc: 'Simple 5×5 on big lifts. Add 2.5kg each session.' },
    { id: '531', name: '5/3/1', days: 4, level: ['intermediate','advanced'], goals: ['strength'], desc: 'Wendler 5/3/1. Sustainable long-term strength.' },
    { id: 'upper_lower_fb', name: 'UL + Full Body', days: 5, level: ['intermediate'], goals: ['hypertrophy','recomp'], desc: 'Upper, lower, full body rotation.' },
    { id: 'ppl_3', name: 'Push Pull Legs (3-day)', days: 3, level: ['beginner','intermediate'], goals: ['hypertrophy','maintenance'], desc: 'Each muscle once a week with full recovery. Good when 3 days is all you have.' },
    { id: 'fb_4', name: 'Full Body (4-day)', days: 4, level: ['intermediate','advanced'], goals: ['general_health','fat_loss','hypertrophy','strength'], desc: 'Four shorter whole-body sessions. High frequency, easy to recover from.' },
    { id: 'torso_limbs', name: 'Torso / Limbs', days: 4, level: ['intermediate','advanced'], goals: ['hypertrophy','recomp'], desc: 'Chest, back and shoulders one day; legs and arms the next. Twice a week each.' },
    { id: 'pplul', name: 'PPL + Upper/Lower (PPLUL)', days: 5, level: ['intermediate','advanced'], goals: ['hypertrophy','strength','weight_gain'], desc: 'Push, Pull, Legs, then Upper, Lower — each muscle about twice a week in 5 days.' },
    { id: 'arnold_3', name: 'Chest/Back · Shoulders/Arms · Legs (3-day)', days: 3, level: ['intermediate','advanced'], goals: ['hypertrophy'], desc: 'The Arnold pairing run once a week.' },
    { id: 'ul_6', name: 'Upper / Lower (6-day)', days: 6, level: ['advanced'], goals: ['hypertrophy','strength'], desc: 'Upper/Lower three times a week. High volume — for experienced lifters.' },
    { id: 'seven_day', name: '7-Day (with active recovery)', days: 7, level: ['intermediate','advanced'], goals: ['general_health','fat_loss','endurance'], desc: 'Five lifting days plus two easy mobility + zone 2 days. Not seven hard days.' },
    { id: 'custom', name: 'Custom / Flexible', days: 0, level: ['beginner','intermediate','advanced','athlete'], goals: ['maintenance','general_health','mobility','longevity'], desc: 'You choose each day. No fixed structure.' }
  ],

  byId(id) { return this.splits.find(s => s.id === id); },

  /* Barbell-centred programmes — wrong call for anyone without a rack */
  BARBELL: ['starting_strength', 'stronglifts', '531', 'str', 'powerbuilding', 'phul', 'phat'],

  recommend(user) {
    const goal = user.goal || 'hypertrophy';
    const exp = user.exp || 'intermediate';
    const days = parseInt(user.weeklyGoal || user.daysPerWeek, 10) || user.gymDays?.length || 4;
    const env = user.trainingEnvironments || ['gym'];
    const kit = user.equipmentKit || 'full_gym';
    const homeOnly = kit === 'home_minimal' || (env.length === 1 && env[0] === 'home');
    const noBarbell = kit !== 'full_gym' || homeOnly;

    let scored = this.splits.map(s => {
      let score = 0;
      if (s.goals.includes(goal)) score += 30;
      score += s.level.includes(exp) ? 20 : -25;
      /* Days the person actually has: exact fit wins; one fewer is fine;
         MORE days than they can train is the worst outcome (missed sessions,
         lopsided weeks). Custom is never auto-picked. */
      if (s.days === 0) score -= 50;
      else if (s.days === days) score += 40;
      else if (s.days === days - 1) score += 22;
      else if (s.days === days + 1) score -= 10;
      else score -= 30;
      if (noBarbell && this.BARBELL.includes(s.id)) score -= 60;
      if (kit === 'dumbbells' && s.id === 'home') score += 20;
      if (homeOnly && s.id === 'home') score += 40;
      if (kit === 'full_gym' && !homeOnly && s.id === 'home') score -= 40;
      if (goal === 'strength' && !noBarbell && ['str','531','stronglifts','starting_strength','phul','powerbuilding'].includes(s.id)) score += 12;
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
