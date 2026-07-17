'use strict';
/* ── PulseCap Phase 3 — Quests, Missions, Achievement 2.0, Streak Protection ── */

/* ══════════════════════════════════════════════════════
   QUEST ENGINE — Auto-generated from user weak points
══════════════════════════════════════════════════════ */
const QuestEngine = {

  QUEST_TEMPLATES: [
    {
      id: 'chest_growth', category: 'Specialization', icon: '🫁',
      title: 'Chest Growth Quest',
      description: 'Complete focused chest training to build upper chest mass',
      condition: (data) => data.weakMuscles.includes('chest') || data.lowVolume.includes('Chest'),
      goals: [
        { type: 'workouts_with_muscle', muscle: 'chest', target: 8, label: '8 chest workouts' },
        { type: 'sets_muscle', muscle: 'chest', target: 120, label: '120 chest sets total' },
      ],
      reward: { xp: 500, badge: '🫁 Chest Builder', tip: 'Add incline pressing for upper chest development' },
      duration_weeks: 6,
    },
    {
      id: 'pull_strength', category: 'Strength', icon: '🔵',
      title: 'Pull Strength Quest',
      description: 'Build your back and pull strength to impressive levels',
      condition: (data) => data.weakMuscles.includes('back') || data.lowVolume.includes('Back'),
      goals: [
        { type: 'workouts_with_muscle', muscle: 'back', target: 10, label: '10 back workouts' },
        { type: 'pr_exercise', exercise: 'Pull-Ups', label: 'Hit a Pull-Up PR' },
        { type: 'sets_muscle', muscle: 'back', target: 150, label: '150 back sets total' },
      ],
      reward: { xp: 600, badge: '🔵 Back Builder', tip: 'Wide grip for lat width, close grip for thickness' },
      duration_weeks: 6,
    },
    {
      id: 'shoulder_health', category: 'Injury Prevention', icon: '🦾',
      title: 'Shoulder Health Quest',
      description: 'Fix push/pull imbalance and build bulletproof shoulders',
      condition: (data) => data.pushPullImbalance || data.weakMuscles.includes('shoulders'),
      goals: [
        { type: 'sessions_total', target: 6, label: '6 sessions with face pulls or rear delt work' },
        { type: 'joint_score', joint: 'shoulder', target: 75, label: 'Shoulder health score >= 75' },
      ],
      reward: { xp: 400, badge: '🦾 Shoulder Guardian', tip: 'Maintain 1:1 push to pull ratio permanently' },
      duration_weeks: 4,
    },
    {
      id: 'leg_day_warrior', category: 'Consistency', icon: '🦵',
      title: 'Leg Day Warrior',
      description: 'Stop skipping legs. Build serious lower body strength',
      condition: (data) => data.lowVolume.includes('Quads') || data.lowVolume.includes('Hamstrings'),
      goals: [
        { type: 'workouts_with_muscle', muscle: 'quads', target: 8, label: '8 leg sessions' },
        { type: 'pr_exercise', exercise: 'Back Squat', label: 'Set a Squat PR' },
      ],
      reward: { xp: 550, badge: '🦵 Leg Day Warrior', tip: 'Posterior chain is your athletic foundation' },
      duration_weeks: 6,
    },
    {
      id: 'consistency_30', category: 'Consistency', icon: '🔥',
      title: '30-Day Consistency Quest',
      description: 'Build the habit that builds the physique',
      condition: (data) => data.streak < 5,
      goals: [
        { type: 'sessions_total', target: 16, label: '16 sessions in 30 days' },
        { type: 'streak_days', target: 7, label: '7-day training streak' },
      ],
      reward: { xp: 700, badge: '🔥 Consistency Champion', tip: 'Consistency beats perfection every time' },
      duration_weeks: 4,
    },
    {
      id: 'strength_foundation', category: 'Strength', icon: '🏋️',
      title: 'Strength Foundation',
      description: 'Build real strength on the big compound lifts',
      condition: (data) => data.prs < 5,
      goals: [
        { type: 'pr_any', count: 5, label: 'Set 5 PRs on compound lifts' },
        { type: 'sessions_total', target: 12, label: '12 strength sessions' },
      ],
      reward: { xp: 800, badge: '💪 Strength Foundation', tip: 'PR frequency drops naturally — celebrate each one' },
      duration_weeks: 8,
    },
    {
      id: 'arm_specialization', category: 'Specialization', icon: '💪',
      title: 'Arm Specialization Block',
      description: 'Dedicated arm training to add size and definition',
      condition: (data) => data.lowVolume.includes('Biceps') || data.lowVolume.includes('Triceps'),
      goals: [
        { type: 'sets_muscle', muscle: 'biceps', target: 80, label: '80 bicep sets' },
        { type: 'sets_muscle', muscle: 'triceps', target: 80, label: '80 tricep sets' },
      ],
      reward: { xp: 450, badge: '💪 Arm Specialist', tip: 'Incline curls for maximum bicep stretch stimulus' },
      duration_weeks: 6,
    },
    {
      id: 'recovery_master', category: 'Recovery', icon: '😴',
      title: 'Recovery Master',
      description: 'Optimize your recovery to unlock your next level of gains',
      condition: (data) => data.recoveryDebt >= 50,
      goals: [
        { type: 'log_recovery', target: 7, label: 'Log recovery check-in 7 days' },
        { type: 'debt_below', target: 30, label: 'Get recovery debt below 30' },
      ],
      reward: { xp: 350, badge: '😴 Recovery Master', tip: 'Growth happens during recovery, not in the gym' },
      duration_weeks: 3,
    },
    {
      id: 'volume_champion', category: 'Volume', icon: '📈',
      title: 'Volume Champion',
      description: 'Hit impressive weekly volume milestones',
      condition: (data) => data.totalSessions >= 10,
      goals: [
        { type: 'total_volume_kg', target: 50000, label: '50,000 kg total volume' },
        { type: 'sessions_total', target: 20, label: '20 sessions completed' },
      ],
      reward: { xp: 600, badge: '📈 Volume Champion', tip: 'Track volume trends in your Progress screen' },
      duration_weeks: 8,
    },
    {
      id: 'calf_redemption', category: 'Specialization', icon: '🦵',
      title: 'Calf Redemption',
      description: 'The most neglected muscle group deserves attention',
      condition: (data) => data.lowVolume.includes('Calves'),
      goals: [
        { type: 'sets_muscle', muscle: 'calves', target: 60, label: '60 calf sets' },
        { type: 'sessions_with_calves', target: 12, label: '12 sessions including calves' },
      ],
      reward: { xp: 300, badge: '🦵 Calf Redeemed', tip: 'Calves need 4-5x/week high frequency to grow' },
      duration_weeks: 8,
    },
  ],

  _analyzeUser() {
    const ws = S.g('workouts') || [];
    const prs = S.g('prs') || [];
    const streak = typeof StreakEngine !== 'undefined' ? StreakEngine.get() : 0;
    const debt = typeof RecoveryDebtEngine !== 'undefined' ? RecoveryDebtEngine.calculate() : 30;
    const volRecs = typeof VolumeAllocationEngine !== 'undefined' ? VolumeAllocationEngine.recommendations() : [];

    const lowVolume = volRecs.filter(r => r.status === 'undertrained' || r.status === 'neglected').map(r => r.muscle);
    const lagging = typeof GrowthSimulator !== 'undefined' ? GrowthSimulator.laggingMuscles().map(m => m.muscle) : [];

    const pushSets = ws.slice(-10).reduce((total, w) => {
      return total + (w.exercises || []).filter(ex => ['bench','press','dip','push'].some(k => (ex.name||'').toLowerCase().includes(k))).reduce((a, ex) => a + (ex.sets||[]).filter(s=>s.done).length, 0);
    }, 0);
    const pullSets = ws.slice(-10).reduce((total, w) => {
      return total + (w.exercises || []).filter(ex => ['pull','row','lat','curl'].some(k => (ex.name||'').toLowerCase().includes(k))).reduce((a, ex) => a + (ex.sets||[]).filter(s=>s.done).length, 0);
    }, 0);

    return {
      weakMuscles: lagging,
      lowVolume,
      pushPullImbalance: pushSets > pullSets * 1.8,
      streak,
      recoveryDebt: debt,
      prs: prs.length,
      totalSessions: ws.length,
    };
  },

  getRecommended() {
    const data = this._analyzeUser();
    const active = this.getActive();
    const activeIds = active.map(q => q.templateId);
    const completed = S.g('completedQuests') || [];
    const completedIds = completed.map(q => q.id);

    return this.QUEST_TEMPLATES
      .filter(t => !activeIds.includes(t.id) && !completedIds.includes(t.id))
      .filter(t => { try { return t.condition(data); } catch(e) { return false; } })
      .slice(0, 3);
  },

  getActive() {
    return S.g('activeQuests') || [];
  },

  startQuest(templateId) {
    const template = this.QUEST_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    const active = this.getActive();
    if (active.find(q => q.templateId === templateId)) return;

    const quest = {
      id: isoNow(),
      templateId: template.id,
      title: template.title,
      icon: template.icon,
      description: template.description,
      category: template.category,
      goals: template.goals.map(g => ({ ...g, progress: 0, completed: false })),
      reward: template.reward,
      startDate: today(),
      dueDate: (() => { const d = new Date(); d.setDate(d.getDate() + template.duration_weeks * 7); return localISO(d); })(),
      status: 'active',
    };

    active.push(quest);
    S.set('activeQuests', active);
    return quest;
  },

  updateProgress() {
    const active = this.getActive();
    if (!active.length) return [];
    const ws = S.g('workouts') || [];
    const prs = S.g('prs') || [];
    const streak = typeof StreakEngine !== 'undefined' ? StreakEngine.get() : 0;
    const debt = typeof RecoveryDebtEngine !== 'undefined' ? RecoveryDebtEngine.calculate() : 50;

    const MUSCLE_KEYWORDS = {
      chest: ['bench','fly','chest','dip','pec','press'],
      back: ['pull','row','lat','deadlift'],
      shoulders: ['press','lateral','delt','shoulder','face pull'],
      biceps: ['curl','bicep','hammer'],
      triceps: ['tricep','pushdown','skull','close grip'],
      quads: ['squat','leg press','extension','hack'],
      hamstrings: ['deadlift','leg curl','nordic','rdl'],
      calves: ['calf'],
    };

    const updated = active.map(quest => {
      quest.goals = quest.goals.map(goal => {
        if (goal.completed) return goal;

        let progress = 0;

        if (goal.type === 'sessions_total') {
          progress = ws.length;
        } else if (goal.type === 'workouts_with_muscle') {
          const kws = MUSCLE_KEYWORDS[goal.muscle] || [];
          progress = ws.filter(w => (w.exercises || []).some(ex => kws.some(k => (ex.name||'').toLowerCase().includes(k)))).length;
        } else if (goal.type === 'sets_muscle') {
          const kws = MUSCLE_KEYWORDS[goal.muscle] || [];
          ws.forEach(w => {
            (w.exercises || []).forEach(ex => {
              if (kws.some(k => (ex.name||'').toLowerCase().includes(k))) {
                progress += (ex.sets || []).filter(s => s.done).length;
              }
            });
          });
        } else if (goal.type === 'pr_exercise') {
          progress = prs.filter(p => (p.exercise || '').toLowerCase().includes((goal.exercise || '').toLowerCase())).length > 0 ? 1 : 0;
        } else if (goal.type === 'pr_any') {
          progress = prs.length;
        } else if (goal.type === 'streak_days') {
          progress = streak;
        } else if (goal.type === 'total_volume_kg') {
          progress = Math.round(ws.reduce((a, w) => a + (w.totalVol || 0), 0));
        } else if (goal.type === 'debt_below') {
          progress = debt <= goal.target ? goal.target : debt;
        } else if (goal.type === 'log_recovery') {
          const recLogs = S.g('recoveryLogs') || [];
          progress = recLogs.filter(r => daysAgo(r.date) < 30).length;
        } else if (goal.type === 'joint_score') {
          progress = typeof JointHealthEngine !== 'undefined' ? JointHealthEngine.score(goal.joint).score : 50;
        }

        const completed = goal.target ? progress >= goal.target : progress >= 1;
        return { ...goal, progress: Math.min(progress, goal.target || progress), completed };
      });

      if (quest.goals.every(g => g.completed) && quest.status === 'active') {
        quest.status = 'completed';
        const xp = S.g('totalXP') || 0;
        S.set('totalXP', xp + (quest.reward.xp || 0));
        const badges = S.g('earnedBadges') || [];
        badges.push({ badge: quest.reward.badge, date: today(), questId: quest.templateId });
        S.set('earnedBadges', badges);
        const completedList = S.g('completedQuests') || [];
        completedList.push({ id: quest.templateId, completedDate: today(), reward: quest.reward });
        S.set('completedQuests', completedList);
        if (typeof celebrate === 'function') celebrate('⚔️', 'Quest Complete!', quest.title + ' · +' + (quest.reward.xp || 0) + ' XP', 2500);
      }

      return quest;
    });

    const stillActive = updated.filter(q => q.status === 'active');
    S.set('activeQuests', stillActive);

    return updated;
  },

  questProgress(quest) {
    if (!quest.goals.length) return 0;
    const total = quest.goals.reduce((a, g) => a + (g.target || 1), 0);
    const done = quest.goals.reduce((a, g) => a + Math.min(g.progress || 0, g.target || 1), 0);
    return Math.round((done / total) * 100);
  }
};
window.QuestEngine = QuestEngine;

/* ══════════════════════════════════════════════════════
   STREAK PROTECTION SYSTEM
══════════════════════════════════════════════════════ */
const StreakProtection = {

  PROTECTION_EXERCISES: [
    { id: 'mobility_flow', name: 'Mobility Flow', duration: '10 min', exercises: ['Hip 90-90 Stretch x60s each', 'Thoracic rotation x10', 'Ankle circles x10', 'Hip circles x10', 'Cat-cow x10', 'Pigeon pose x60s each'] },
    { id: 'foam_roll', name: 'Full Body Foam Roll', duration: '10 min', exercises: ['Quad foam roll x60s each', 'IT band x60s each', 'Upper back x60s', 'Lat stretch x45s each', 'Calf roll x60s each'] },
    { id: 'breathing', name: 'Recovery Breathing', duration: '5 min', exercises: ['Box breathing: 4s in, 4s hold, 4s out, 4s hold x10', 'Diaphragmatic breathing x5 min', 'Progressive relaxation'] },
    { id: 'walk', name: '10-Minute Walk', duration: '10 min', exercises: ['Easy-paced walk outdoors or indoors', 'Focus on breathing and relaxation', 'No intensity target — just movement'] },
  ],

  saveStreak(sessionId) {
    const session = this.PROTECTION_EXERCISES.find(s => s.id === sessionId);
    if (!session) return;

    const logs = S.g('recoveryDays') || [];
    logs.push({ date: today(), type: 'streak_saver', session: session.name, id: sessionId });
    S.set('recoveryDays', logs);

    const streak = S.g('streakSavers') || [];
    streak.push({ date: today() });
    S.set('streakSavers', streak);

    return session;
  },

  isTodaySaved() {
    const logs = S.g('recoveryDays') || [];
    return logs.some(l => l.date === today() && l.type === 'streak_saver');
  },

  needsProtection() {
    const ws = S.g('workouts') || [];
    const hasWorkoutToday = ws.some(w => w.date === today());
    if (hasWorkoutToday) return false;
    const streak = typeof StreakEngine !== 'undefined' ? StreakEngine.get() : 0;
    return streak >= 2;
  }
};
window.StreakProtection = StreakProtection;

/* ══════════════════════════════════════════════════════
   KNOWLEDGE ACADEMY
══════════════════════════════════════════════════════ */
const KnowledgeAcademy = {

  LESSONS: [
    {
      id: 'progressive_overload', module: 'Training Fundamentals', icon: '📈', xp: 100,
      title: 'Progressive Overload',
      summary: 'The #1 principle of muscle growth',
      content: 'Progressive overload is the gradual increase of stress on your muscles over time. Without it, your body has no reason to adapt.\n\nMethods:\n- Add weight (2.5kg upper, 5kg lower when you hit rep ceiling)\n- Add reps (same weight, more reps)\n- Add sets (increase volume)\n- Reduce rest time\n- Improve technique\n\nThe most important method is load progression. Track every session.',
      quiz: { question: 'What is the most effective progressive overload method?', options: ['More exercises', 'Increasing load over time', 'Training longer', 'More rest'], correct: 1 },
      unlock: 'Advanced Periodization lesson',
    },
    {
      id: 'muscle_protein_synthesis', module: 'Physiology', icon: '🔬', xp: 120,
      title: 'Muscle Protein Synthesis',
      summary: 'How muscles actually grow',
      content: 'Muscle growth (hypertrophy) occurs when muscle protein synthesis (MPS) exceeds muscle protein breakdown (MPB).\n\nKey drivers:\n- Training creates micro-damage which triggers MPS\n- Protein provides amino acids (building blocks)\n- Sleep is when MPS peaks (growth hormone release)\n- Leucine is the key amino acid trigger (found in whey, eggs, chicken)\n\nTarget: 1.8-2.2g protein/kg. Distribute across 3-4 meals. Post-workout window is real but not critical if daily intake is hit.',
      quiz: { question: 'When does muscle protein synthesis peak?', options: ['During training', 'Immediately post-workout', 'During sleep', 'In the morning'], correct: 2 },
      unlock: 'Nutrition Timing lesson',
    },
    {
      id: 'sleep_recovery', module: 'Recovery', icon: '😴', xp: 100,
      title: 'Sleep & Recovery Science',
      summary: 'Sleep is your most powerful anabolic tool',
      content: 'Sleep is not passive — it is when your body repairs and grows.\n\nWhat happens during sleep:\n- Growth hormone released (peaks in deep sleep)\n- Testosterone synthesis\n- Muscle protein synthesis elevated\n- Central nervous system recovery\n- Memory consolidation (skill learning)\n\nSleep deprivation effects:\n- Testosterone drops 15-20% after one week of 5hr sleep\n- Cortisol rises (catabolic)\n- Strength output reduces 5-10%\n- Injury risk increases\n\nTarget: 7-9 hours. Consistent sleep schedule matters more than duration.',
      quiz: { question: 'What happens to testosterone after one week of 5hr sleep?', options: ['Increases 10%', 'No change', 'Drops 15-20%', 'Doubles'], correct: 2 },
      unlock: 'Recovery Debt lesson',
    },
    {
      id: 'rep_ranges', module: 'Training Fundamentals', icon: '🔢', xp: 80,
      title: 'Rep Ranges & Adaptations',
      summary: 'Different rep ranges produce different results',
      content: 'Rep ranges target different physiological adaptations:\n\n- 1-5 reps: Neural strength (max force production, CNS adaptation)\n- 6-8 reps: Strength-hypertrophy overlap\n- 8-12 reps: Primary hypertrophy range (most research support)\n- 12-20 reps: Hypertrophy + metabolic stress + endurance\n- 20+ reps: Muscular endurance, metabolic conditioning\n\nKey insight: All rep ranges from 5-30 build similar muscle IF taken close to failure. The 8-12 range is optimal for most because it balances load and fatigue.',
      quiz: { question: 'Which rep range builds the most muscle per recent research?', options: ['Only 8-12 reps', '1-3 reps only', 'Any range taken close to failure', 'Only high reps'], correct: 2 },
      unlock: 'Periodization lesson',
    },
    {
      id: 'nutrition_basics', module: 'Nutrition', icon: '🥩', xp: 100,
      title: 'Nutrition for Muscle Growth',
      summary: 'Food is your body\'s building material',
      content: 'Muscle growth requires:\n\n1. PROTEIN: 1.8-2.2g per kg bodyweight. Sources: chicken, beef, eggs, fish, whey, Greek yogurt. Distribute across meals (30-40g per meal optimal).\n\n2. CALORIES: Slight surplus (+200-300 kcal) for lean muscle gain. Too large a surplus = fat gain.\n\n3. CARBOHYDRATES: Fuel your training. Do not fear them. Time around workouts.\n\n4. FATS: Essential for hormone production (testosterone). Minimum 0.8g/kg.\n\nSimple rule: Protein first, then calories, then everything else.',
      quiz: { question: 'What is the optimal protein intake for muscle growth?', options: ['0.5g/kg', '1.0g/kg', '1.8-2.2g/kg', '4.0g/kg'], correct: 2 },
      unlock: 'Advanced Nutrition lesson',
    },
    {
      id: 'compound_vs_isolation', module: 'Training Fundamentals', icon: '🏋️', xp: 80,
      title: 'Compound vs Isolation Exercises',
      summary: 'When to use each type for maximum results',
      content: 'Compound exercises:\n- Multiple joints and muscles\n- Higher neuromuscular demand\n- More hormonal response\n- Better for strength and mass\n- Examples: Squat, Deadlift, Bench, OHP, Row\n\nIsolation exercises:\n- Single joint\n- Target specific muscles\n- Lower fatigue — can add more volume\n- Best used AFTER compounds\n- Examples: Curl, Lateral Raise, Leg Curl\n\nOptimal structure: 2-3 compounds, 2-4 isolations per session. Compounds first — they require the most energy and focus.',
      quiz: { question: 'When should you perform isolation exercises in a session?', options: ['Before compounds', 'After compounds', 'Instead of compounds', 'Only on rest days'], correct: 1 },
      unlock: 'Exercise Selection lesson',
    },
    {
      id: 'deload_science', module: 'Recovery', icon: '📉', xp: 90,
      title: 'The Science of Deloading',
      summary: 'Planned rest supercompensates your strength',
      content: 'Deloading is a planned reduction in training stress to allow full recovery and supercompensation.\n\nSupercompensation theory:\n- Training leads to fatigue\n- Deload allows recovery\n- After recovery, fitness EXCEEDS previous baseline\n- This is where real gains happen\n\nWhen to deload:\n- Every 4-6 weeks of progressive training\n- When recovery debt is high\n- Before a performance test\n- When motivation drops significantly\n\nHow to deload:\n- Keep frequency (same days)\n- Reduce volume 40-50%\n- Reduce intensity to 60-70%\n- Duration: 5-7 days',
      quiz: { question: 'What is supercompensation?', options: ['Training harder', 'Post-deload fitness exceeding previous baseline', 'Taking more supplements', 'Training more frequently'], correct: 1 },
      unlock: 'Periodization lesson',
    },
    {
      id: 'mind_muscle', module: 'Training Fundamentals', icon: '🧠', xp: 70,
      title: 'Mind-Muscle Connection',
      summary: 'Think your way to better gains',
      content: 'The mind-muscle connection is the intentional focus on contracting a specific muscle during exercise.\n\nResearch shows:\n- Internal focus (think about the muscle) increases EMG activation\n- Particularly effective for isolation exercises\n- Less effective on heavy compound lifts (external focus better there)\n\nHow to develop it:\n- Start with very light weight\n- Touch the muscle you\'re training (tactile feedback)\n- Pause at peak contraction (1-2 seconds)\n- Slow the eccentric (lowering phase)\n- Visualise the muscle shortening and lengthening\n\nPractice this on curls, lateral raises, and chest flys first.',
      quiz: { question: 'When is mind-muscle connection MOST effective?', options: ['Heavy compound lifts', 'Isolation exercises at moderate weight', 'Cardio', 'Warming up'], correct: 1 },
      unlock: null,
    },
  ],

  completed() {
    return S.g('completedLessons') || [];
  },

  isCompleted(lessonId) {
    return this.completed().includes(lessonId);
  },

  completeLesson(lessonId, quizAnswer) {
    const lesson = this.LESSONS.find(l => l.id === lessonId);
    if (!lesson) return { success: false, message: 'Lesson not found' };
    if (this.isCompleted(lessonId)) return { success: false, message: 'Already completed' };

    const quizCorrect = !lesson.quiz || quizAnswer === lesson.quiz.correct;
    if (!quizCorrect) return { success: false, message: 'Incorrect answer — try again' };

    const xp = S.g('totalXP') || 0;
    S.set('totalXP', xp + lesson.xp);

    const completed = this.completed();
    completed.push(lessonId);
    S.set('completedLessons', completed);

    const moduleCount = this.LESSONS.filter(l => l.module === lesson.module && this.isCompleted(l.id)).length;
    const totalInModule = this.LESSONS.filter(l => l.module === lesson.module).length;
    if (moduleCount >= totalInModule - 1) {
      const badges = S.g('earnedBadges') || [];
      const badgeName = '🎓 ' + lesson.module + ' Expert';
      if (!badges.some(b => b.badge === badgeName)) {
        badges.push({ badge: badgeName, date: today(), type: 'academy' });
        S.set('earnedBadges', badges);
      }
    }

    if (typeof celebrate === 'function') celebrate('🎓', 'Lesson Complete!', '+' + lesson.xp + ' XP', 2000);
    return { success: true, xp: lesson.xp, unlock: lesson.unlock };
  },

  totalXP() {
    return S.g('totalXP') || 0;
  },

  level() {
    const xp = this.totalXP();
    if (xp >= 5000) return { level: 10, title: 'Elite', color: '#f5c842' };
    if (xp >= 3000) return { level: 8, title: 'Advanced', color: '#af52de' };
    if (xp >= 1500) return { level: 6, title: 'Intermediate', color: 'var(--c1)' };
    if (xp >= 500) return { level: 4, title: 'Developing', color: '#30d158' };
    return { level: 1, title: 'Novice', color: 'var(--txt3)' };
  },

  xpProgress() {
    const xp = this.totalXP();
    const thresholds = [0, 500, 1500, 3000, 5000];
    const level = this.level().level;
    const idx = Math.min(Math.floor(level / 2), thresholds.length - 2);
    const current = thresholds[idx];
    const next = thresholds[idx + 1] || thresholds[thresholds.length - 1];
    return { current: xp - current, needed: next - current, pct: Math.min(100, Math.round(((xp - current) / (next - current)) * 100)) };
  }
};
window.KnowledgeAcademy = KnowledgeAcademy;

/* ══════════════════════════════════════════════════════
   ACHIEVEMENT 2.0
══════════════════════════════════════════════════════ */
const AchievementEngine2 = {

  ACHIEVEMENTS: [
    { id: 'vol_10k', icon: '🏋️', title: '10,000 kg Lifted', desc: 'Total training volume milestone', check: () => { const ws = S.g('workouts')||[]; return ws.reduce((a,w)=>a+(w.totalVol||0),0) >= 10000; } },
    { id: 'vol_100k', icon: '💎', title: '100,000 kg Lifted', desc: 'Serious training volume', check: () => { const ws = S.g('workouts')||[]; return ws.reduce((a,w)=>a+(w.totalVol||0),0) >= 100000; } },
    { id: 'vol_500k', icon: '🌟', title: '500,000 kg Lifted', desc: 'Elite training volume', check: () => { const ws = S.g('workouts')||[]; return ws.reduce((a,w)=>a+(w.totalVol||0),0) >= 500000; } },
    { id: 'sessions_10', icon: '🔥', title: 'First 10 Sessions', desc: 'Habit forming begins', check: () => (S.g('workouts')||[]).length >= 10 },
    { id: 'sessions_50', icon: '⚡', title: '50 Sessions', desc: 'Committed to the process', check: () => (S.g('workouts')||[]).length >= 50 },
    { id: 'sessions_100', icon: '🏆', title: '100 Sessions', desc: 'Century milestone', check: () => (S.g('workouts')||[]).length >= 100 },
    { id: 'sessions_365', icon: '🎖️', title: '365 Sessions', desc: 'A full year of training', check: () => (S.g('workouts')||[]).length >= 365 },
    { id: 'pr_1', icon: '🥇', title: 'First PR', desc: 'You got stronger', check: () => (S.g('prs')||[]).length >= 1 },
    { id: 'pr_10', icon: '🥈', title: '10 PRs Set', desc: 'Consistently improving', check: () => (S.g('prs')||[]).length >= 10 },
    { id: 'pr_50', icon: '🥉', title: '50 PRs Set', desc: 'Strength progression master', check: () => (S.g('prs')||[]).length >= 50 },
    { id: 'streak_3', icon: '🔥', title: '3-Day Streak', desc: 'Momentum building', check: () => (typeof StreakEngine !== 'undefined' ? StreakEngine.get() : 0) >= 3 },
    { id: 'streak_7', icon: '💪', title: '7-Day Streak', desc: 'One full week of consistency', check: () => (typeof StreakEngine !== 'undefined' ? StreakEngine.get() : 0) >= 7 },
    { id: 'streak_30', icon: '🌟', title: '30-Day Streak', desc: 'Iron discipline', check: () => (typeof StreakEngine !== 'undefined' ? StreakEngine.get() : 0) >= 30 },
    { id: 'night_owl', icon: '🦉', title: 'Night Owl', desc: 'Logged a workout after 10pm', check: () => { const ws = S.g('workouts')||[]; return ws.some(w => { const h = new Date(w.startTime||w.date).getHours(); return h >= 22; }); } },
    { id: 'early_bird', icon: '🌅', title: 'Early Bird', desc: 'Logged a workout before 6am', check: () => { const ws = S.g('workouts')||[]; return ws.some(w => { const h = new Date(w.startTime||w.date).getHours(); return h < 6; }); } },
    { id: 'knowledge_start', icon: '📚', title: 'Knowledge Seeker', desc: 'Completed first Academy lesson', check: () => (S.g('completedLessons')||[]).length >= 1 },
    { id: 'knowledge_all', icon: '🎓', title: 'Fitness Scholar', desc: 'Completed all Academy lessons', check: () => (S.g('completedLessons')||[]).length >= KnowledgeAcademy.LESSONS.length },
    { id: 'quest_first', icon: '⚔️', title: 'Quest Accepted', desc: 'Started your first quest', check: () => (S.g('completedQuests')||[]).length >= 1 },
    { id: 'quest_master', icon: '👑', title: 'Quest Master', desc: 'Completed 5 quests', check: () => (S.g('completedQuests')||[]).length >= 5 },
  ],

  checkAll() {
    const earned = S.g('achievements') || [];
    const earnedIds = earned.map(a => a.id || a);
    const newlyEarned = [];

    this.ACHIEVEMENTS.forEach(a => {
      if (!earnedIds.includes(a.id)) {
        try {
          if (a.check()) {
            earned.push({ id: a.id, icon: a.icon, title: a.title, desc: a.desc, date: today() });
            newlyEarned.push(a);
          }
        } catch(e) {}
      }
    });

    if (newlyEarned.length) S.set('achievements', earned);
    return newlyEarned;
  },

  getEarned() {
    const earned = S.g('achievements') || [];
    return earned.map(a => {
      if (typeof a === 'string') return { id: a, icon: '🏆', title: a, desc: '', date: null };
      return a;
    });
  },

  getAll() {
    const earned = this.getEarned().map(a => a.id || a);
    return this.ACHIEVEMENTS.map(a => ({ ...a, isEarned: earned.includes(a.id) }));
  }
};
window.AchievementEngine2 = AchievementEngine2;

/* ══════════════════════════════════════════════════════
   PHYSIQUE TIMELINE
══════════════════════════════════════════════════════ */
const PhysiqueTimeline = {

  getPoints() {
    const stats = S.g('bodyStats') || [];
    return stats.map((s, i) => ({
      index: i,
      date: s.date || s.createdAt || today(),
      weight: s.weight,
      bodyFat: s.bodyFat,
      arms: s.arms,
      chest: s.chest,
      waist: s.waist,
      shoulders: s.shoulders,
      thighs: s.thighs,
      note: s.note || '',
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  changes() {
    const points = this.getPoints();
    if (points.length < 2) return null;
    const first = points[0];
    const last = points[points.length - 1];
    const weeksDiff = Math.round((new Date(last.date) - new Date(first.date)) / (7 * 86400000));

    return {
      weightChange: last.weight && first.weight ? Math.round((last.weight - first.weight) * 10) / 10 : null,
      bodyFatChange: last.bodyFat && first.bodyFat ? Math.round((last.bodyFat - first.bodyFat) * 10) / 10 : null,
      armChange: last.arms && first.arms ? Math.round((last.arms - first.arms) * 10) / 10 : null,
      chestChange: last.chest && first.chest ? Math.round((last.chest - first.chest) * 10) / 10 : null,
      waistChange: last.waist && first.waist ? Math.round((last.waist - first.waist) * 10) / 10 : null,
      weeks: weeksDiff,
      points: points.length,
    };
  }
};
window.PhysiqueTimeline = PhysiqueTimeline;

/* ══════════════════════════════════════════════════════
   QUESTS SCREEN
══════════════════════════════════════════════════════ */
reg('quests', function() {
  QuestEngine.updateProgress();
  const active = QuestEngine.getActive();
  const recommended = QuestEngine.getRecommended();
  const completed = S.g('completedQuests') || [];
  const badges = S.g('earnedBadges') || [];
  const xp = KnowledgeAcademy.totalXP();
  const level = KnowledgeAcademy.level();
  const xpProg = KnowledgeAcademy.xpProgress();

  AchievementEngine2.checkAll();

  return '<div class="topbar"><button type="button" onclick="history.length>1?history.back():go(\'hub\')" style="background:none;border:none;color:var(--txt3);cursor:pointer;font-size:14px;padding:0 16px;touch-action:manipulation" aria-label="Back">←</button><div class="topbar-title">⚔️ Quests & Missions</div></div>' +

    '<div style="margin:0 16px 14px;background:linear-gradient(135deg,rgba(245,200,66,0.1),rgba(175,82,222,0.08));border:1px solid rgba(245,200,66,0.2);border-radius:16px;padding:14px">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
    '<div><div style="font-size:14px;font-weight:800;color:' + level.color + '">Level ' + level.level + ' · ' + esc(level.title) + '</div>' +
    '<div style="font-size:11px;color:var(--txt3)">' + xp + ' total XP</div></div>' +
    '<div style="font-size:32px">⭐</div></div>' +
    '<div style="width:100%;height:8px;background:rgba(255,255,255,0.06);border-radius:4px">' +
    '<div style="width:' + xpProg.pct + '%;height:8px;border-radius:4px;background:' + level.color + '"></div></div>' +
    '<div style="font-size:11px;color:var(--txt3);margin-top:4px">' + xpProg.current + ' / ' + xpProg.needed + ' XP to next level</div>' +
    '</div>' +

    (active.length ? '<div style="margin:0 16px 14px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:10px">Active Quests (' + active.length + ')</div>' +
      active.map(q => {
        const pct = QuestEngine.questProgress(q);
        const daysLeft = q.dueDate ? Math.max(0, Math.round((new Date(q.dueDate) - new Date()) / 86400000)) : '?';
        return '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px;margin-bottom:10px">' +
          '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">' +
          '<div style="font-size:28px">' + q.icon + '</div>' +
          '<div style="flex:1"><div style="font-size:14px;font-weight:800;color:var(--txt)">' + esc(q.title) + '</div>' +
          '<div style="font-size:11px;color:var(--txt3)">' + esc(q.category) + ' · ' + daysLeft + ' days left</div></div>' +
          '<div style="font-size:18px;font-weight:900;color:var(--c1)">' + pct + '%</div>' +
          '</div>' +
          '<div style="width:100%;height:6px;background:rgba(255,255,255,0.06);border-radius:3px;margin-bottom:10px">' +
          '<div style="width:' + pct + '%;height:6px;border-radius:3px;background:var(--c1);transition:width 0.6s ease"></div></div>' +
          q.goals.map(g => '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border)">' +
            '<div style="font-size:14px">' + (g.completed ? '✅' : '⬜') + '</div>' +
            '<div style="flex:1;font-size:12px;color:' + (g.completed ? '#30d158' : 'var(--txt2)') + '">' + esc(g.label) + '</div>' +
            (g.target ? '<div style="font-size:11px;color:var(--txt3)">' + Math.min(g.progress||0, g.target) + '/' + g.target + '</div>' : '') +
            '</div>').join('') +
          '<div style="margin-top:10px;padding:8px 12px;background:rgba(var(--c1-rgb),0.08);border-radius:10px">' +
          '<div style="font-size:11px;color:var(--txt3)">Reward: <span style="color:var(--c1);font-weight:700">' + esc(q.reward.badge) + ' + ' + q.reward.xp + ' XP</span></div>' +
          '</div></div>';
      }).join('') + '</div>' : '') +

    (recommended.length ? '<div style="margin:0 16px 14px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:10px">Recommended For You</div>' +
      recommended.map(t => '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px;margin-bottom:10px;display:flex;gap:12px;align-items:flex-start">' +
        '<div style="font-size:32px;flex-shrink:0">' + t.icon + '</div>' +
        '<div style="flex:1">' +
        '<div style="font-size:14px;font-weight:800;color:var(--txt);margin-bottom:3px">' + esc(t.title) + '</div>' +
        '<div style="font-size:12px;color:var(--txt2);margin-bottom:8px">' + esc(t.description) + '</div>' +
        '<div style="font-size:11px;color:var(--txt3);margin-bottom:8px">Reward: ' + esc(t.reward.badge) + ' · ' + t.reward.xp + ' XP · ' + t.duration_weeks + ' weeks</div>' +
        '<button type="button" onclick="QuestEngine.startQuest(\'' + t.id + '\');go(\'quests\')" style="padding:8px 16px;background:var(--c1);border:none;border-radius:10px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;touch-action:manipulation">⚔️ Start Quest</button>' +
        '</div></div>').join('') + '</div>' : '') +

    (!active.length && !recommended.length ?
      '<div style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:20px;text-align:center">' +
      '<div style="font-size:40px;margin-bottom:10px">⚔️</div>' +
      '<div style="font-size:14px;font-weight:700;color:var(--txt);margin-bottom:6px">No Quests Yet</div>' +
      '<div style="font-size:12px;color:var(--txt2)">Complete more workouts and log data to unlock personalized quests.</div>' +
      '</div>' : '') +

    (badges.length ? '<div style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:10px">🏅 Earned Badges (' + badges.length + ')</div>' +
      '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
      badges.map(b => '<div style="background:rgba(var(--c1-rgb),0.1);border:1px solid rgba(var(--c1-rgb),0.2);border-radius:10px;padding:6px 12px;font-size:12px;font-weight:600;color:var(--c1)">' + esc(b.badge) + '</div>').join('') +
      '</div></div>' : '') +

    (StreakProtection.needsProtection() && !StreakProtection.isTodaySaved() ?
      '<div style="margin:0 16px 14px;background:rgba(255,159,10,0.08);border:1px solid rgba(255,159,10,0.3);border-radius:16px;padding:14px">' +
      '<div style="font-size:14px;font-weight:800;color:#ff9f0a;margin-bottom:6px">🛡️ Protect Your Streak</div>' +
      '<div style="font-size:12px;color:var(--txt2);margin-bottom:12px">No workout logged today. Complete a quick recovery session to save your streak.</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px">' +
      StreakProtection.PROTECTION_EXERCISES.map(s => '<button type="button" onclick="StreakProtection.saveStreak(\'' + s.id + '\');go(\'quests\')" style="padding:10px 14px;background:rgba(255,159,10,0.1);border:1px solid rgba(255,159,10,0.3);border-radius:12px;color:#ff9f0a;font-size:13px;font-weight:600;cursor:pointer;touch-action:manipulation;text-align:left">' + esc(s.name) + ' <span style="font-size:11px;opacity:0.7">(' + s.duration + ')</span></button>').join('') +
      '</div></div>' : '') +

    '<div style="height:20px"></div>';
});

/* ══════════════════════════════════════════════════════
   KNOWLEDGE ACADEMY SCREEN
══════════════════════════════════════════════════════ */
reg('academy', function(data) {
  const lessonId = data && data.lesson;

  if (lessonId) {
    const lesson = KnowledgeAcademy.LESSONS.find(l => l.id === lessonId);
    if (!lesson) return go('academy');
    const isCompleted = KnowledgeAcademy.isCompleted(lessonId);

    return '<div class="topbar">' +
      '<button type="button" onclick="go(\'academy\')" style="background:none;border:none;color:var(--txt3);cursor:pointer;font-size:14px;padding:0 16px">←</button>' +
      '<div class="topbar-title">' + lesson.icon + ' ' + esc(lesson.title) + '</div>' +
      '</div>' +

      '<div style="padding:16px">' +
      '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:14px">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:var(--txt3);margin-bottom:4px">' + esc(lesson.module) + '</div>' +
      '<div style="font-size:18px;font-weight:800;color:var(--txt);margin-bottom:8px">' + esc(lesson.title) + '</div>' +
      '<div style="font-size:13px;color:var(--txt2);line-height:1.8;white-space:pre-line;margin-bottom:16px">' + esc(lesson.content) + '</div>' +

      (isCompleted ? '<div style="background:rgba(48,209,88,0.1);border:1px solid rgba(48,209,88,0.3);border-radius:12px;padding:12px;text-align:center"><div style="font-size:13px;font-weight:700;color:#30d158">✅ Lesson Completed · +' + lesson.xp + ' XP earned</div></div>' :

      lesson.quiz ?
        '<div style="background:rgba(var(--c1-rgb),0.06);border:1px solid rgba(var(--c1-rgb),0.2);border-radius:12px;padding:14px">' +
        '<div style="font-size:12px;font-weight:700;color:var(--c1);margin-bottom:10px">📝 Quick Quiz</div>' +
        '<div style="font-size:13px;font-weight:700;color:var(--txt);margin-bottom:12px">' + esc(lesson.quiz.question) + '</div>' +
        lesson.quiz.options.map((opt, i) =>
          '<button type="button" onclick="var r=KnowledgeAcademy.completeLesson(\'' + lessonId + '\',' + i + ');if(r.success){go(\'academy\',{lesson:\'' + lessonId + '\'})}else{this.style.background=\'rgba(255,69,58,0.15)\';this.style.borderColor=\'rgba(255,69,58,0.4)\'}" ' +
          'style="width:100%;margin-bottom:8px;padding:12px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;color:var(--txt);font-size:13px;text-align:left;cursor:pointer;touch-action:manipulation">' +
          esc(opt) + '</button>'
        ).join('') +
        '</div>' : '<button type="button" onclick="var r=KnowledgeAcademy.completeLesson(\'' + lessonId + '\',0);go(\'academy\',{lesson:\'' + lessonId + '\'})" class="btn btn-primary" style="width:100%">Mark Complete · +' + lesson.xp + ' XP</button>'
      ) +
      '</div></div>' +
      '<div style="height:20px"></div>';
  }

  const xp = KnowledgeAcademy.totalXP();
  const level = KnowledgeAcademy.level();
  const xpProg = KnowledgeAcademy.xpProgress();
  const modules = [...new Set(KnowledgeAcademy.LESSONS.map(l => l.module))];

  return '<div class="topbar"><button type="button" class="topbar-icon press" onclick="go(\'dashboard\')" style="font-size:20px">‹</button><div class="topbar-title">🎓 Knowledge Academy</div></div>' +

    '<div style="margin:0 16px 14px;background:linear-gradient(135deg,rgba(var(--c1-rgb),0.1),rgba(0,0,0,0.2));border:1px solid rgba(var(--c1-rgb),0.2);border-radius:16px;padding:14px">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">' +
    '<div><div style="font-size:14px;font-weight:800;color:' + level.color + '">Level ' + level.level + ' · ' + esc(level.title) + '</div>' +
    '<div style="font-size:11px;color:var(--txt3)">' + xp + ' XP · ' + KnowledgeAcademy.completed().length + '/' + KnowledgeAcademy.LESSONS.length + ' lessons</div></div>' +
    '<div style="font-size:36px">🎓</div></div>' +
    '<div style="width:100%;height:6px;background:rgba(255,255,255,0.06);border-radius:3px">' +
    '<div style="width:' + xpProg.pct + '%;height:6px;border-radius:3px;background:' + level.color + '"></div></div>' +
    '</div>' +

    modules.map(mod => {
      const modLessons = KnowledgeAcademy.LESSONS.filter(l => l.module === mod);
      const completedCount = modLessons.filter(l => KnowledgeAcademy.isCompleted(l.id)).length;
      return '<div style="margin:0 16px 14px">' +
        '<div style="font-size:12px;font-weight:700;color:var(--txt3);text-transform:uppercase;letter-spacing:0.08em;margin-bottom:8px">' + esc(mod) + ' · ' + completedCount + '/' + modLessons.length + '</div>' +
        modLessons.map(l => {
          const done = KnowledgeAcademy.isCompleted(l.id);
          return '<div onclick="go(\'academy\',{lesson:\'' + l.id + '\'})" style="background:var(--bg3);border:1px solid ' + (done ? 'rgba(48,209,88,0.3)' : 'var(--border)') + ';border-radius:14px;padding:14px;margin-bottom:8px;cursor:pointer;touch-action:manipulation;display:flex;align-items:center;gap:12px">' +
            '<div style="font-size:28px">' + l.icon + '</div>' +
            '<div style="flex:1">' +
            '<div style="font-size:14px;font-weight:700;color:var(--txt)">' + esc(l.title) + '</div>' +
            '<div style="font-size:11px;color:var(--txt3)">' + esc(l.summary) + ' · ' + l.xp + ' XP</div>' +
            '</div>' +
            '<div style="font-size:20px">' + (done ? '✅' : '›') + '</div>' +
            '</div>';
        }).join('') +
        '</div>';
    }).join('') +

    '<div style="height:20px"></div>';
});

/* ══════════════════════════════════════════════════════
   PHYSIQUE TIMELINE SCREEN (body for Physique sub-tab)
══════════════════════════════════════════════════════ */
window.renderPhysiqueTimelineBody = function() {
  const points = PhysiqueTimeline.getPoints();
  const changes = PhysiqueTimeline.changes();

  return '<div class="topbar"><button type="button" onclick="history.length>1?history.back():go(\'hub\')" style="background:none;border:none;color:var(--txt3);cursor:pointer;font-size:14px;padding:0 16px;touch-action:manipulation" aria-label="Back">←</button><div class="topbar-title">📸 Physique Timeline</div></div>' +

    (points.length === 0 ?
      '<div style="padding:60px 20px;text-align:center"><div style="font-size:56px;margin-bottom:14px">📸</div>' +
      '<div style="font-size:16px;font-weight:800;color:var(--txt);margin-bottom:8px">No Measurements Yet</div>' +
      '<div style="font-size:13px;color:var(--txt2);line-height:1.6;max-width:260px;margin:0 auto">Add body measurements in Body tab to track your physique transformation over time.</div>' +
      '<button type="button" onclick="go(\'bodymap\')" class="btn btn-primary" style="margin-top:20px">Add First Measurement ›</button>' +
      '</div>' :

      (changes ?
        '<div style="margin:0 16px 14px;background:var(--bg3);border:1px solid var(--border);border-radius:16px;padding:14px">' +
        '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:12px">Transformation Summary · ' + changes.weeks + ' weeks · ' + changes.points + ' check-ins</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">' +
        [
          { label: 'Weight', val: changes.weightChange, unit: 'kg', positive: false },
          { label: 'Body Fat', val: changes.bodyFatChange, unit: '%', positive: false },
          { label: 'Arms', val: changes.armChange, unit: 'cm', positive: true },
          { label: 'Chest', val: changes.chestChange, unit: 'cm', positive: true },
          { label: 'Waist', val: changes.waistChange, unit: 'cm', positive: false },
        ].filter(c => c.val !== null).map(c => {
          const isGood = c.positive ? c.val > 0 : c.val < 0;
          const color = c.val === 0 ? 'var(--txt3)' : isGood ? '#30d158' : '#ff453a';
          return '<div style="background:rgba(255,255,255,0.03);border-radius:12px;padding:12px">' +
            '<div style="font-size:10px;color:var(--txt3);text-transform:uppercase;letter-spacing:0.06em;margin-bottom:4px">' + esc(c.label) + '</div>' +
            '<div style="font-size:20px;font-weight:900;color:' + color + '">' + (c.val > 0 ? '+' : '') + c.val + c.unit + '</div>' +
            '</div>';
        }).join('') +
        '</div></div>' : '') +

      '<div style="margin:0 16px 14px">' +
      '<div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--txt3);margin-bottom:12px">Measurement History</div>' +
      points.slice().reverse().map(p => '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:14px;margin-bottom:10px">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">' +
        '<div style="font-size:14px;font-weight:700;color:var(--txt)">' + esc(new Date(p.date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })) + '</div>' +
        (p.weight ? '<div style="font-size:16px;font-weight:900;color:var(--c1)">' + p.weight + 'kg</div>' : '') +
        '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px">' +
        [
          p.bodyFat ? { label: 'Body Fat', val: p.bodyFat + '%' } : null,
          p.arms ? { label: 'Arms', val: p.arms + 'cm' } : null,
          p.chest ? { label: 'Chest', val: p.chest + 'cm' } : null,
          p.waist ? { label: 'Waist', val: p.waist + 'cm' } : null,
          p.shoulders ? { label: 'Shoulders', val: p.shoulders + 'cm' } : null,
          p.thighs ? { label: 'Thighs', val: p.thighs + 'cm' } : null,
        ].filter(Boolean).map(m => '<div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:5px 10px;font-size:11px;color:var(--txt2)"><span style="color:var(--txt3)">' + esc(m.label) + ' </span><span style="font-weight:700">' + esc(m.val) + '</span></div>').join('') +
        '</div>' +
        (p.note ? '<div style="font-size:12px;color:var(--txt3);margin-top:8px;font-style:italic">' + esc(p.note) + '</div>' : '') +
        '</div>').join('') +
      '</div>'
    ) +

    '<div style="height:20px"></div>';
};

reg('physique-timeline', function() {
  /* Deprecated route — alias + unified Physique tabs (P3). */
  return window.renderPhysiqueUnified({ tab: 'timeline' });
});

