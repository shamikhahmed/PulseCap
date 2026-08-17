'use strict';
/* My Plan / plan import review — gym-time path, not a 41-page document. */

function _planDraft() {
  return window._planImportDraft || S.g('planImportDraft');
}
function _setPlanDraft(d) {
  window._planImportDraft = d;
  try { S.set('planImportDraft', d); } catch (e) { /* quota — keep memory copy */ }
}

function _planSafetyCard(p) {
  if (!p) return '';
  const rules = (p.safety && p.safety.romRules) || [];
  return '<div class="card card-solid mb-14" style="border-color:rgba(255,69,58,0.28)">' +
    '<div class="settings-section-title" style="margin-top:0;color:var(--danger)">Stop conditions</div>' +
    '<div class="body-13" style="margin-bottom:10px">' + esc((p.safety && p.safety.disclaimer) || '') + '</div>' +
    (rules.length ? '<div style="font-size:12px;color:var(--txt2);line-height:1.5">' +
      rules.slice(0, 6).map(function(r) {
        return '<div style="margin-bottom:8px"><strong class="c-txt">' + esc(r.movement) + '</strong> — ' + esc(r.stop) + '</div>';
      }).join('') + '</div>' : '') +
    '</div>';
}

reg('my-plan', function() {
  const engine = typeof TrainingPlanEngine !== 'undefined' ? TrainingPlanEngine : null;
  const active = engine && engine.hasActive();
  const p = active ? engine.get() : null;
  const sess = active ? engine.todaySession() : null;
  const review = active ? engine.review() : null;
  const top = moduleBackTopbar('My Plan', 'settings');

  if (!active) {
    return top +
      '<div class="pad-16">' +
      moduleLede('Install a built-in program or import a text PDF / JSON. Smart Coach stays on-device — this is not a cloud AI planner.') +
      '<div class="card card-solid mb-14">' +
      '<div class="row-title-15">Machine-only PPL (shoulder-safe)</div>' +
      '<div class="body-13" style="margin:8px 0 12px">6-day Push/Pull/Legs A/B, Sunday rest, week-5 deload, prehab, ROM limits, logged starting loads. Machines and cables first.</div>' +
      '<button type="button" class="btn btn-primary" style="width:100%;min-height:44px" onclick="beginInstallMachinePpl()">Review & install</button>' +
      '</div>' +
      '<div class="card card-solid mb-14">' +
      '<div class="row-title-15">Import a plan</div>' +
      '<div class="body-13" style="margin:8px 0 12px">PulseCap JSON is the reliable format. Text PDFs are extracted on this device and always go through a review. Scanned PDFs need a paste or JSON. Nothing is uploaded.</div>' +
      '<label class="btn btn-secondary" style="width:100%;min-height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer">' +
      'Choose PDF or JSON<input type="file" accept=".json,.pdf,.txt,application/pdf,application/json,text/plain" style="display:none" aria-label="Choose PDF or JSON" onchange="handlePlanFile(this)"></label>' +
      '<button type="button" class="btn btn-ghost" style="width:100%;min-height:44px;margin-top:8px" onclick="showPlanPaste()">Paste plan text</button>' +
      '</div>' +
      '<p class="mod-lede">Your current split stays until you install or import. Workout history is never replaced by a plan.</p>' +
      '</div>' + uiSpacer();
  }

  const isRest = !!(sess && sess.rest);
  const cta = isRest
    ? '<button type="button" class="btn btn-secondary" style="width:100%;min-height:44px" onclick="go(\'recovery\')">Recovery tools</button>'
    : '<button type="button" class="btn btn-primary" style="width:100%;min-height:44px" onclick="startPlannedWorkout()">Start ' + esc((sess && sess.name) || 'session') + '</button>';

  const exPreview = (!isRest && sess && sess.exercises) ? sess.exercises.slice(0, 8).map(function(ex) {
    const load = engine.loadFor(ex.name, ex.startKg);
    return '<div style="display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)">' +
      '<div><div style="font-size:14px;font-weight:700">' + esc(ex.name) + '</div>' +
      '<div class="muted-12">' + esc((ex.sets || 3) + '×' + (ex.reps || [10, 12]).join('–') + ' · RPE ' + (ex.rpe || [8]).join('–') + (ex.tempo ? ' · ' + ex.tempo : '')) + '</div></div>' +
      '<div class="muted-12" style="white-space:nowrap">' + esc(String(load.kg || ex.startKg || '')) + '</div></div>';
  }).join('') : '';

  const pick = engine.listSessions().map(function(s) {
    const on = sess && !sess.rest && (sess.id === s.id || sess.key === s.id);
    return '<button type="button" class="press mod-chip' + (on ? ' on' : '') + '" style="min-height:44px" onclick="pickPlanSession(' + jsArg(s.id) + ')">' + esc(s.name.split('—')[0].trim()) + '</button>';
  }).join('');

  return top +
    '<div class="pad-16">' +
    '<div class="card card-solid mb-14" style="border-color:rgba(var(--c1-rgb),0.25)">' +
    '<div class="muted-11">' + esc(p.title) + (engine.isDeload() ? ' · Deload' : ' · Week ' + engine.weekIndex()) + '</div>' +
    '<div class="row-title" style="margin:6px 0 8px">' + esc(isRest ? 'Full rest' : (sess && sess.name) || 'Session') + '</div>' +
    '<div class="body-13" style="margin-bottom:12px">' + esc(isRest ? (sess.reason || 'Sunday rest.') : ((sess.exercises || []).length + ' lifts · cardio after lifting · log RPE')) + '</div>' +
    cta +
    (!isRest ? '<button type="button" class="btn btn-ghost" style="width:100%;min-height:44px;margin-top:8px" onclick="go(\'workout\')">Open Train hub</button>' : '') +
    '</div>' +
    uiSection('This week') +
    '<div class="mb-14" style="display:flex;flex-wrap:wrap;gap:8px">' + pick + '</div>' +
    (exPreview ? '<div class="card card-solid mb-14">' + uiSection('Prescribed') + exPreview + '</div>' : '') +
    (review ? '<div class="card card-solid mb-14">' + (review.lines || []).map(function(l) {
      return '<div class="body-13" style="margin-bottom:8px">' + esc(l) + '</div>';
    }).join('') + '</div>' : '') +
    _planSafetyCard(p) +
    '<button type="button" class="btn btn-secondary" style="width:100%;min-height:44px;margin-bottom:8px" onclick="exportPlanJson()">Export plan JSON</button>' +
    '<button type="button" class="btn btn-ghost" style="width:100%;min-height:44px;color:var(--danger)" onclick="confirmRemovePlan()">Remove plan — keep history</button>' +
    '</div>' + uiSpacer();
});

reg('plan-import', function() {
  const parsed = _planDraft();
  const top = moduleBackTopbar('Review import', 'my-plan');
  if (!parsed || !parsed.draft) {
    return top + '<div class="pad-16">' + moduleLede('No import waiting. Choose a file from My Plan.') +
      '<button type="button" class="btn btn-primary" style="min-height:44px" onclick="go(\'my-plan\')">Back to My Plan</button></div>';
  }
  const d = parsed.draft;
  const sessions = Object.keys(d.sessions || {}).map(function(id) { return d.sessions[id]; });
  const unmatched = parsed.unmatched || [];
  const warnings = parsed.warnings || [];
  const sessHtml = sessions.map(function(s) {
    return '<div class="card card-solid mb-10"><div class="row-title-15">' + esc(s.name) + '</div>' +
      (s.exercises || []).map(function(ex) {
        return '<div class="muted-12" style="padding:6px 0;border-bottom:1px solid var(--border)">' + esc(ex.name) +
          ' · ' + esc((ex.sets || 3) + '×' + (ex.reps || [10]).join('–')) + '</div>';
      }).join('') + '</div>';
  }).join('');
  const unHtml = unmatched.length ?
    '<div class="card card-solid mb-14" style="border-color:rgba(255,159,10,0.35)">' +
    '<div class="settings-section-title" style="margin-top:0">Needs mapping</div>' +
    unmatched.slice(0, 12).map(function(u) {
      return '<div class="body-13" style="margin-bottom:8px">' + esc(u.from) +
        (u.candidates && u.candidates[0] ? ' → ' + esc(u.candidates[0]) : ' (unmatched)') + '</div>';
    }).join('') + '</div>' : '';

  return top +
    '<div class="pad-16">' +
    moduleLede('Nothing is saved until you confirm. This is a Smart Coach mapping, not an AI diagnosis.') +
    (warnings.length ? '<div class="card mb-14">' + warnings.map(function(w) { return '<div class="body-13">' + esc(w) + '</div>'; }).join('') + '</div>' : '') +
    unHtml +
    sessHtml +
    _planSafetyCard(d) +
    '<label class="card card-solid mb-14" style="display:flex;gap:10px;align-items:flex-start;min-height:44px">' +
    '<input id="plan-ack" type="checkbox" style="width:22px;height:22px;margin-top:2px">' +
    '<span class="body-13">I understand this is not medical clearance. I will stop on sharp pain, clunk, or instability.</span></label>' +
    '<button type="button" class="btn btn-primary" style="width:100%;min-height:44px" onclick="confirmImportedPlan()">Save this plan</button>' +
    '<button type="button" class="btn btn-ghost" style="width:100%;min-height:44px;margin-top:8px" onclick="cancelPlanImport()">Discard import</button>' +
    '</div>' + uiSpacer();
});

window.beginInstallMachinePpl = function() {
  modal('Shoulder-safe plan',
    '<div class="body-13" style="line-height:1.55;margin-bottom:12px">This template is machine/cable-first because of shoulder risk. It is not a clinician clearance. Stop on clunk, shift, or sharp pain.</div>' +
    '<label style="display:flex;gap:10px;align-items:flex-start;margin-bottom:12px"><input id="ppl-ack" type="checkbox" style="width:22px;height:22px"><span class="body-13">I will keep the listed range-of-motion limits even if I feel fine today.</span></label>',
    '<button type="button" class="btn btn-primary" style="width:100%;min-height:44px" onclick="installMachinePpl()">Install plan</button>' +
    '<button type="button" class="btn btn-secondary mt-8" style="width:100%;min-height:44px" onclick="closeModal()">Cancel</button>');
};

window.installMachinePpl = function() {
  const box = document.getElementById('ppl-ack');
  if (!box || !box.checked) { toast('Tick the safety box to install', 'warn'); return; }
  try {
    TrainingPlanEngine.installTemplate('machine_ppl_shoulder', { acknowledgedSafety: true });
    closeModal();
    toast('Plan installed — today follows the rotation', 'ok');
    go('my-plan');
  } catch (e) {
    toast(e.message || 'Could not install plan', 'err');
  }
};

window.handlePlanFile = function(input) {
  const file = input.files && input.files[0];
  input.value = '';
  if (!file || typeof PlanImport === 'undefined') return;
  toast('Reading on this device…', 'ok');
  PlanImport.readFile(file).then(function(res) {
    if (!res || !res.ok) {
      toast((res && res.error) || 'Could not read that file', 'err', 5000);
      return;
    }
    _setPlanDraft(res);
    go('plan-import');
  }).catch(function(err) {
    toast(err && err.message ? err.message : 'Import failed', 'err', 5000);
  });
};

window.showPlanPaste = function() {
  modal('Paste plan text',
    '<div class="body-13" style="margin-bottom:8px">Works for copied coach PDFs. Review still required.</div>' +
    '<textarea id="plan-paste" class="field" style="height:180px;font-size:14px" placeholder="PUSH A — Chest…"></textarea>',
    '<button type="button" class="btn btn-primary mt-14" style="width:100%;min-height:44px" onclick="importPastedPlan()">Parse text</button>' +
    '<button type="button" class="btn btn-secondary mt-8" style="width:100%;min-height:44px" onclick="closeModal()">Cancel</button>');
};

window.importPastedPlan = function() {
  const el = document.getElementById('plan-paste');
  const text = el ? el.value : '';
  const res = parsePlanText(text);
  if (!res.ok) { toast(res.error || 'Could not parse', 'err', 5000); return; }
  _setPlanDraft(res);
  closeModal();
  go('plan-import');
};

window.confirmImportedPlan = function() {
  const ack = document.getElementById('plan-ack');
  if (!ack || !ack.checked) { toast('Confirm the safety note first', 'warn'); return; }
  const parsed = _planDraft();
  if (!parsed || !parsed.draft) { toast('Import expired', 'err'); return; }
  try {
    TrainingPlanEngine.installPlan(parsed.draft, { acknowledgedSafety: true });
    _setPlanDraft(null);
    toast('Plan saved on this device', 'ok');
    go('my-plan');
  } catch (e) {
    toast(e.message || 'Could not save plan', 'err', 5000);
  }
};

window.cancelPlanImport = function() {
  _setPlanDraft(null);
  go('my-plan');
};

window.pickPlanSession = function(id) {
  TrainingPlanEngine.setTodaySession(id);
  toast('Today’s session updated', 'ok');
  go('my-plan');
};

window.startPlannedWorkout = function() {
  if (typeof startWorkout === 'function') startWorkout();
};

window.confirmRemovePlan = function() {
  modal('Remove plan?',
    '<div class="body-13">Workout history, PRs, and body logs stay. Only the active program is removed.</div>',
    '<button type="button" class="btn btn-danger mt-14" style="width:100%;min-height:44px" onclick="removeTrainingPlan()">Remove plan</button>' +
    '<button type="button" class="btn btn-secondary mt-8" style="width:100%;min-height:44px" onclick="closeModal()">Keep plan</button>');
};

window.removeTrainingPlan = function() {
  TrainingPlanEngine.removePlan();
  closeModal();
  toast('Plan removed — history kept', 'ok');
  go('my-plan');
};

window.exportPlanJson = function() {
  const p = TrainingPlanEngine.get();
  if (!p) return;
  const blob = new Blob([JSON.stringify({ trainingPlan: p }, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'PulseCap-plan-' + (typeof today === 'function' ? today() : 'export') + '.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Plan JSON exported', 'ok');
};

window.logPlanShoulder = function(score) {
  const n = Number(score);
  if (!(n >= 0)) return;
  if (typeof getActiveWorkout === 'function' && getActiveWorkout()) {
    getActiveWorkout().shoulderPain = n;
  }
  S.set('lastShoulderPain', { date: today(), score: n });
  if (n >= 7) toast('High shoulder score — stop that lift and use an alternative next time', 'warn', 5000);
};
