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

    const ws = S.g('workouts') || [];
    const last = ws.slice().sort(function(a, b) {
      return String(b.date || '').localeCompare(String(a.date || ''));
    })[0];
    const weekN = (typeof StreakEngine !== 'undefined' && StreakEngine.weekWorkouts)
      ? StreakEngine.weekWorkouts().length : 0;
    const planned = Math.max(1, (user.gymDays && user.gymDays.length) || user.daysPerWeek || user.weeklyGoal || 4);
    const weekDots = Array.apply(null, { length: planned }).map(function(_, i) {
      return '<span class="' + (i < weekN ? 'on' : '') + '"></span>';
    }).join('');

    let lastBlock = '';
    if (last) {
      const sets = (last.exercises || []).reduce(function(n, ex) {
        return n + ((ex.sets || []).filter(function(s) { return s.done; }).length);
      }, 0);
      const when = last.date ? new Date(last.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : '';
      lastBlock = '<div class="dash-meta">' +
        '<div class="dash-meta__kicker">Last session</div>' +
        '<div class="dash-meta__title">' + esc(last.name || 'Workout') + '</div>' +
        '<div class="dash-meta__sub">' + esc(when) +
          (sets ? ' · ' + sets + ' sets' : '') +
          (last.duration ? ' · ' + last.duration + ' min' : '') +
        '</div></div>';
    }

    let nextBlock = '';
    if (typeof SplitEngine !== 'undefined' && SplitEngine.listSplitDays) {
      const days = SplitEngine.listSplitDays() || [];
      const cur = typeof SplitEngine.todayDayNumber === 'function' ? SplitEngine.todayDayNumber() : 1;
      const nxt = days.length ? days[cur % days.length] : null;
      if (nxt && (isRest || last)) {
        nextBlock = '<div class="dash-meta">' +
          '<div class="dash-meta__kicker">Next up</div>' +
          '<div class="dash-meta__title">' + esc(nxt.n || nxt.name || 'Next session') + '</div>' +
          '<div class="dash-meta__sub">' + esc(prettyMuscles(nxt.muscles, 3) || 'As planned') + '</div></div>';
      }
    }

    const weekBlock = '<div class="dash-meta">' +
      '<div class="dash-meta__kicker">This week</div>' +
      '<div class="dash-meta__title">' + weekN + ' of ' + planned + ' sessions logged</div>' +
      '<div class="dash-week" aria-hidden="true">' + weekDots + '</div>' +
      '<div class="dash-meta__sub">Rest days count. This is consistency, not a streak that punishes rest.</div></div>';

    const gapHtml = (typeof Equipment !== 'undefined' && Equipment.gapBanner) ? Equipment.gapBanner(ctx) : '';

    return '<div class="dash-screen">' + demoBanner + topbar +
      '<div class="dash-hero">' + sessionCard + insightLine + gapHtml + '</div>' +
      '<div class="dash-lower">' + lastBlock + nextBlock + weekBlock +
      '<div style="padding:0 16px 8px"><button type="button" class="btn btn-secondary" style="width:100%" onclick="go(\'progress\')">Progress</button></div>' +
      '</div></div>';
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
