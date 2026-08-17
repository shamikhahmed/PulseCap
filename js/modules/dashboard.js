'use strict';
/* Ember Today — one session CTA + one insight. */

const THEMES = ['carbon', 'aurora', 'sunset', 'midnight', 'electric', 'stealth', 'forest', 'light'];
function _nextTheme(t) { const i = THEMES.indexOf(t); return THEMES[(i + 1) % THEMES.length]; }
window._nextTheme = _nextTheme;

reg('dashboard', function() {
  try {
    const ctx = (typeof Profile !== 'undefined' && Profile.deriveContext) ? Profile.deriveContext() : {};
    const user = ctx.user || S.g('user') || {};
    const name = (user.name || 'Athlete').split(' ')[0];
    const hr = new Date().getHours();
    const greeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    const todayStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    const isDemoMode = S.activeId() === 'demo';
    const dd = ctx.decision || (typeof DailyDecision !== 'undefined' ? DailyDecision.decide() : null);
    const splitDay = ctx.session || (typeof SplitEngine !== 'undefined' ? SplitEngine.getSplitDay() : { n: 'Train' });
    const insight = (typeof EmberEngine !== 'undefined' && EmberEngine.insight) ? EmberEngine.insight() : (ctx.insight || { title: 'Train as planned', body: 'Log the session.' });
    const isRest = dd && dd.decision === 'rest';
    const isLight = dd && dd.decision === 'light';
    const sessName = isRest
      ? (dd.title || 'Rest day')
      : (splitDay.name || splitDay.n || 'Today’s session');
    const sessSub = isRest
      ? (dd.reason || 'Optional easy movement only.')
      : (prettyMuscles(splitDay.muscles, 3) || insight.body || '');
    const cta = isRest
      ? '<button type="button" class="btn btn-secondary" style="width:100%" onclick="go(\'recovery\')">Recovery check-in</button>' +
        (dd && dd.allowTrain ? '<button type="button" class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="startWorkout&&startWorkout()">Train anyway</button>' : '')
      : '<button type="button" class="btn btn-primary" style="width:100%" onclick="startWorkout&&startWorkout()">' +
        (isLight ? 'Start light session' : 'Start workout') + '</button>' +
        '<button type="button" class="btn btn-ghost" style="width:100%;margin-top:8px" onclick="confirmSkipToday()">Can’t train today?</button>';

    const demoBanner = isDemoMode
      ? '<div class="dash-demo-banner"><div class="dash-demo-label">Demo Mode</div>' +
        '<button type="button" onclick="go(\'profiles\')" class="dash-demo-switch">Switch</button></div>'
      : '';

    const topbar = '<div class="topbar"><div class="topbar-left"><div>' +
      '<div class="row-title">' + esc(greeting) + ', ' + esc(name) + '</div>' +
      '<div class="muted-11">' + esc(todayStr) + '</div></div></div></div>';

    const sessionCard = '<div class="dash-session card" style="margin:0 16px 16px">' +
      '<div class="dash-session__kicker">' + (isRest ? 'Today’s guidance' : 'Today’s session') + '</div>' +
      '<div class="dash-session__title">' + esc(sessName) + '</div>' +
      '<div class="dash-session__sub">' + esc(sessSub) + '</div>' +
      cta +
      '</div>';

    const insightLine = '<div class="banner" style="margin:0 16px 16px">' +
      '<strong>' + esc(insight.title || 'Insight') + '</strong> — ' + esc(insight.body || '') +
      '</div>';

    return demoBanner + topbar + sessionCard + insightLine +
      '<div style="padding:0 16px 24px"><button type="button" class="btn btn-secondary" style="width:100%" onclick="go(\'progress\')">Progress</button></div>';
  } catch (e) {
    console.error('dashboard', e);
    return '<div class="pad-16"><strong>Today error</strong><div class="muted-11">' + esc(e.message) + '</div>' +
      '<button type="button" class="btn btn-secondary" onclick="go(\'dashboard\')">Retry</button></div>';
  }
});

window.openMorningBriefing = function() {
  S.set('settings.lastBriefingDate', localISO(new Date()));
  go('briefing');
};
