'use strict';
/* ── PulseCap — Explore (legacy route; prefer Search + Home More row) ── */

reg('hub', function() {
  const completedLessons = typeof KnowledgeAcademy !== 'undefined' ? KnowledgeAcademy.completed().length : 0;
  const totalLessons = typeof KnowledgeAcademy !== 'undefined' ? KnowledgeAcademy.LESSONS.length : 8;
  const activeQuests = typeof QuestEngine !== 'undefined' ? QuestEngine.getActive().length : 0;

  function hubSection(label) {
    return '<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:var(--txt3);padding:0 16px;margin-top:24px;margin-bottom:10px">' + label + '</div>';
  }

  function hubRow(icon, title, sub, screen, badge) {
    return '<div role="button" tabindex="0" onclick="go(\'' + screen + '\')" onkeydown="if(event.key===\'Enter\'||event.key===\' \')go(\'' + screen + '\')" aria-label="' + title + '" style="display:flex;align-items:center;gap:14px;padding:13px 16px;cursor:pointer;touch-action:manipulation;border-bottom:1px solid var(--border)">' +
      '<div style="width:40px;height:40px;border-radius:12px;background:var(--bg3);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">' + icon + '</div>' +
      '<div style="flex:1;min-width:0">' +
      '<div style="font-size:14px;font-weight:700;color:var(--txt)">' + esc(title) + '</div>' +
      '<div style="font-size:11px;color:var(--txt3);margin-top:1px">' + esc(sub) + '</div>' +
      '</div>' +
      (badge ? '<div style="font-size:11px;font-weight:700;color:var(--c1);background:rgba(var(--c1-rgb),0.12);padding:3px 8px;border-radius:8px;flex-shrink:0">' + esc(badge) + '</div>' : '') +
      '<div style="font-size:16px;color:var(--txt3);flex-shrink:0">›</div>' +
      '</div>';
  }

  return '<div class="topbar"><button onclick="go(\'dashboard\')" style="background:none;border:none;color:var(--txt3);cursor:pointer;font-size:14px;padding:0 16px;touch-action:manipulation" aria-label="Back">←</button><div class="topbar-title">Explore</div>' +
    '<button onclick="go(\'search\')" style="background:none;border:none;color:var(--txt3);font-size:20px;cursor:pointer;padding:0 16px;touch-action:manipulation">🔍</button>' +
    '</div>' +
    '<p style="padding:12px 16px 0;font-size:12px;color:var(--txt3);line-height:1.45">Quick links to advanced tools. Use <strong>Search</strong> on Home for everything else.</p>' +

    hubSection('Intelligence') +
    '<div style="background:var(--bg3);border-top:1px solid var(--border)">' +
    hubRow('🧬', 'Body Intelligence', 'Recovery · Joints · DNA Profile', 'body-intelligence', '') +
    hubRow('🧠', 'Training Intel', 'Volume · Specialization · Age', 'training-intel', '') +
    hubRow('📊', 'Physique Analysis', 'Scores · Growth simulator', 'physique', '') +
    '</div>' +

    hubSection('Learn & Recover') +
    '<div style="background:var(--bg3);border-top:1px solid var(--border)">' +
    hubRow('🎓', 'Knowledge Academy', 'Lessons · Quizzes · XP', 'academy', completedLessons + '/' + totalLessons) +
    hubRow('📖', 'Encyclopedia', 'Mobility · Warmups · Sports', 'encyclopedia', '') +
    hubRow('🩹', 'Rehab Protocols', 'Injury recovery programs', 'rehab', '') +
    hubRow('🔍', 'Global Search', 'Find any screen or exercise', 'search', '') +
    '</div>' +

    hubSection('Missions') +
    '<div style="background:var(--bg3);border-top:1px solid var(--border)">' +
    hubRow('⚔️', 'Quests & Missions', 'Auto-generated challenges', 'quests', activeQuests > 0 ? activeQuests + ' active' : '') +
    hubRow('📈', 'Progress & PRs', 'Charts · Volume · History', 'progress', '') +
    '</div>' +

    '<div style="height:30px"></div>';
});

window.HubModule = { registered: true };
