'use strict';
/* ── PulseCap — Learn (module directory) ── */

reg('hub', function() {
  const completedLessons = typeof KnowledgeAcademy !== 'undefined' ? KnowledgeAcademy.completed().length : 0;
  const totalLessons = typeof KnowledgeAcademy !== 'undefined' ? KnowledgeAcademy.LESSONS.length : 8;
  const activeQuests = typeof QuestEngine !== 'undefined' ? QuestEngine.getActive().length : 0;

  function hubSection(label) {
    return '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--txt3);padding:0 16px;margin-top:24px;margin-bottom:10px">' + esc(label) + '</div>';
  }

  function hubRow(icon, title, sub, screen, badge) {
    return '<div role="button" tabindex="0" onclick="go(\'' + screen + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \')go(\'' + screen + '\')" aria-label="' + esc(title) + '" style="display:flex;align-items:center;gap:14px;padding:13px 16px;cursor:pointer;touch-action:manipulation;border-bottom:1px solid var(--border)">' +
      '<div style="width:40px;height:40px;border-radius:12px;background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">' + icon + '</div>' +
      '<div style="flex:1;min-width:0">' +
      '<div style="font-size:14px;font-weight:700;color:var(--txt)">' + esc(title) + '</div>' +
      '<div style="font-size:11px;color:var(--txt3);margin-top:1px">' + esc(sub) + '</div>' +
      '</div>' +
      (badge ? '<div style="font-size:11px;font-weight:700;color:var(--c1);background:rgba(var(--c1-rgb),0.12);padding:3px 8px;border-radius:8px;flex-shrink:0">' + esc(badge) + '</div>' : '') +
      '<div style="font-size:16px;color:var(--txt3);flex-shrink:0">›</div>' +
      '</div>';
  }

  return '<div class="topbar"><div class="topbar-title">Learn</div>' +
    '<button type="button" onclick="go(\'search\')" style="background:none;border:none;color:var(--txt3);font-size:20px;cursor:pointer;padding:0 16px;touch-action:manipulation" aria-label="Search">🔍</button>' +
    '</div>' +
    '<p style="padding:12px 16px 0;font-size:12px;color:var(--txt3);line-height:1.45">Knowledge, coach, and tools. Training and body modules live under Train and Body.</p>' +

    hubSection('Search & Coach') +
    '<div style="background:var(--bg3);border-top:1px solid var(--border)">' +
    hubRow('🔍', 'Search', 'Exercises · screens · encyclopedia', 'search', '') +
    hubRow('💬', 'Smart Coach', 'Offline Q&A assistant', 'assistant', '') +
    '</div>' +

    hubSection('Knowledge') +
    '<div style="background:var(--bg3);border-top:1px solid var(--border)">' +
    hubRow('🎓', 'Knowledge Academy', 'Lessons · quizzes · XP', 'academy', completedLessons + '/' + totalLessons) +
    hubRow('📖', 'Encyclopedia', 'Mobility · warmups · sports', 'encyclopedia', '') +
    hubRow('🔬', 'Anatomy', 'Muscle groups · functions', 'anatomy', '') +
    hubRow('🧮', 'Calculators', '1RM · BMI · macros', 'calculators', '') +
    hubRow('📊', 'Visualizations', 'Charts · volume views', 'visualizations', '') +
    '</div>' +

    hubSection('Missions') +
    '<div style="background:var(--bg3);border-top:1px solid var(--border)">' +
    hubRow('⚔️', 'Quests', 'Challenges · streaks', 'quests', activeQuests > 0 ? activeQuests + ' active' : '') +
    '</div>' +

    '<div style="height:30px"></div>';
});

window.HubModule = { registered: true };
