'use strict';
/* Ember survivor: daily session decision without Recovery Debt jargon screen.
   Ports the decide() spine from quarantined recovery-debt.js — soft deps only. */

const DailyDecision = {
  decide() {
    const readiness = typeof ReadinessEngine !== 'undefined' ? ReadinessEngine.score() : 70;
    const streak = typeof StreakEngine !== 'undefined' ? StreakEngine.get() : 0;

    const injury = typeof InjuriesDB !== 'undefined' ? InjuriesDB.assessActive() : { shouldRest: false, messages: [] };
    if (injury.shouldRest) {
      return {
        decision: 'rest', title: 'Injury Recovery', ic: 'bandage', tint: 'c4', color: 'var(--danger)',
        reason: (injury.messages[0] || 'A severe injury is flagged') + '. Skip lifting today — easy walking is fine.',
        actions: ['Walk 20-30 min easy', 'Follow Rehab protocols', 'Log pain changes'],
        confidence: 96
      };
    }

    const skips = (typeof S !== 'undefined' && S.g('skippedDays')) || [];
    const lastSkip = skips[skips.length - 1];
    const todayISO = typeof today === 'function' ? today() : new Date().toISOString().slice(0, 10);
    if (lastSkip && lastSkip.date === todayISO) {
      return {
        decision: 'rest', allowTrain: true, title: 'Day Skipped', ic: 'calendar', tint: 'c2', color: '#8e8e93',
        reason: lastSkip.shifted
          ? (lastSkip.name || 'Session') + ' moved to your next gym day. The week shifts with you.'
          : 'Schedule holds. A short walk today keeps the habit alive.',
        actions: ['Walk 15-20 min if you can', 'Hit protein anyway', 'Back next gym day'],
        confidence: 90
      };
    }

    if (typeof SplitEngine !== 'undefined' && SplitEngine.isScheduledRestDay()) {
      return {
        decision: 'rest', allowTrain: true, title: 'Scheduled Rest Day', ic: 'leaf', tint: 'c3', color: 'var(--success)',
        reason: 'Today isn\'t one of your gym days. Active recovery beats the couch.',
        actions: ['20-30 min walk', 'Mobility 10 min', 'Sleep 8+ hours'],
        confidence: 90
      };
    }

    if (readiness < 30) {
      return {
        decision: 'rest', title: 'Take the Day', ic: 'bed', tint: 'c4', color: 'var(--danger)',
        reason: 'Readiness is very low (' + readiness + '/100). Rest is the session today.',
        actions: ['Sleep 8+ hours', 'Short walk only', 'Eat and hydrate'],
        confidence: 95
      };
    }

    if (readiness < 45) {
      return {
        decision: 'light', title: 'Go Light Today', ic: 'walk', tint: 'c5', color: 'var(--caution)',
        reason: 'Readiness is behind (' + readiness + '/100). Show up, move well, leave wanting more.',
        actions: ['Drop load 30-40%', 'Cut a set', 'No failure sets'],
        confidence: 88
      };
    }

    if (streak >= 21) {
      return {
        decision: 'deload', title: 'Ease Off', ic: 'trendDown', tint: 'c5', color: 'var(--caution)',
        reason: 'Long training streak (' + streak + ' days). Back off volume so you come back stronger.',
        actions: ['Same lifts', 'Half the volume', '60-70% usual load'],
        confidence: 82
      };
    }

    if (readiness >= 85) {
      return {
        decision: 'push', title: 'Green Light', ic: 'flame', tint: 'c3', color: 'var(--success)',
        reason: 'Readiness ' + readiness + '/100. Good day to push hard on the main lift.',
        actions: ['Push main lift', 'Leave 1-2 reps in reserve', 'Warm up thoroughly'],
        confidence: 91
      };
    }

    return {
      decision: 'train', title: 'Train As Planned', ic: 'dumbbell', tint: 'c1', color: 'var(--accent)',
      reason: 'Readiness ' + readiness + '/100. Normal day — do the work.',
      actions: ['Run your session', 'Progress where last week felt easy', 'Log every set'],
      confidence: 84
    };
  }
};
window.DailyDecision = DailyDecision;
