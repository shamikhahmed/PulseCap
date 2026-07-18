'use strict';
/* ── PulseCap — Learn (module directory) — P4 contract classes ── */

reg('hub', function() {
  const completedLessons = typeof KnowledgeAcademy !== 'undefined' ? KnowledgeAcademy.completed().length : 0;
  const totalLessons = typeof KnowledgeAcademy !== 'undefined' ? KnowledgeAcademy.LESSONS.length : 8;
  const activeQuests = typeof QuestEngine !== 'undefined' ? QuestEngine.getActive().length : 0;

  function hubSection(label) {
    return '<div class="mod-section-label">' + esc(label) + '</div>';
  }

  function hubRow(ic, title, sub, screen, badge) {
    return '<div role="button" tabindex="0" class="mod-row" onclick="go(\'' + screen + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \')go(\'' + screen + '\')" aria-label="' + esc(title) + '">' +
      '<div class="mod-row__icon" style="display:flex;align-items:center;justify-content:center;color:var(--c1)">' + icon(ic, 20) + '</div>' +
      '<div class="mod-row__text">' +
      '<div class="mod-row__title">' + esc(title) + '</div>' +
      '<div class="mod-row__sub">' + esc(sub) + '</div>' +
      '</div>' +
      (badge ? '<div class="mod-row__badge">' + esc(badge) + '</div>' : '') +
      '<div class="mod-row__chev">›</div>' +
      '</div>';
  }

  const beginner = typeof BeginnerMode !== 'undefined' && BeginnerMode.on();

  return moduleTopbar('Learn', { right: '<button type="button" class="topbar-icon press" onclick="go(\'search\')" aria-label="Search" style="display:flex;align-items:center;justify-content:center">' + icon('search', 18) + '</button>' }) +
    '<p class="mod-lede">' + (beginner
      ? 'Start with Smart Coach and Academy. Advanced charts unlock when you turn off Beginner Mode in Settings → Training.'
      : 'Knowledge, coach, and tools. Training and body modules live under Train and Body.') + '</p>' +

    hubSection('Search & Coach') +
    '<div class="mod-list">' +
    hubRow('search', 'Search', 'Exercises · screens · encyclopedia', 'search', '') +
    hubRow('sparkles', 'Smart Coach', 'Offline Q&A — your logs, not cloud AI', 'assistant', '') +
    '</div>' +

    hubSection('Knowledge') +
    '<div class="mod-list">' +
    hubRow('gradcap', 'Knowledge Academy', 'Lessons · quizzes · XP', 'academy', completedLessons + '/' + totalLessons) +
    hubRow('book', 'Encyclopedia', 'Mobility · warmups · sports', 'encyclopedia', '') +
    (beginner ? '' : hubRow('dna', 'Anatomy', 'Muscle groups · functions', 'anatomy', '')) +
    (beginner ? '' : hubRow('calc', 'Calculators', '1RM · BMI · macros', 'calculators', '')) +
    (beginner ? '' : hubRow('chart', 'Visualizations', 'Charts · volume views', 'visualizations', '')) +
    '</div>' +

    hubSection('Missions') +
    '<div class="mod-list">' +
    hubRow('target', 'Quests', 'Challenges · streaks', 'quests', activeQuests > 0 ? activeQuests + ' active' : '') +
    '</div>' +

    '<div class="mod-spacer"></div>';
});

window.HubModule = { registered: true };
