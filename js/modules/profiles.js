'use strict';
/* ── PulseCap v4 — Profile Switcher ── */

reg('profiles', function() {
  const profs = S.profiles();
  const activeId = S.activeId();

  const profileCards = profs.map(function(p) {
    const isActive = p.id === activeId;
    const isDemo = p.id === 'demo';
    return '<div class="card card-tap" style="margin:0 16px 12px;' +
      (isActive ? 'border-color:var(--c1);background:rgba(var(--c1-rgb),0.06)' : '') +
      '" onclick="switchToProfile(\''+p.id+'\')">' +
      '<div style="display:flex;align-items:center;gap:16px">' +
      '<div style="width:52px;height:52px;border-radius:16px;' +
      'background:var(--grad);display:flex;align-items:center;justify-content:center;font-size:24px">' +
      p.avatar + '</div>' +
      '<div  class="flex-1">' +
      '<div style="font-size:16px;font-weight:700;color:var(--txt)">' + esc(p.name) + '</div>' +
      '<div  class="muted-12 mt-2">' +
      (isDemo ? '🤖 Demo data' : isActive ? '✅ Active profile' : 'Tap to switch') +
      '</div></div>' +
      (isActive ? '<div style="color:var(--c1);font-size:20px">●</div>' :
        (!isDemo ? '<button type="button" onclick="event.stopPropagation();deleteProfile(\''+p.id+'\')" style="color:var(--c4);font-size:13px;font-weight:600;padding:8px;background:none;border:none;cursor:pointer;touch-action:manipulation">Delete</button>' : '')) +
      '</div></div>';
  }).join('');

  return moduleTopbar('Profiles', {
    right: '<button type="button" class="topbar-icon press" onclick="go(\'settings\')" aria-label="Close">✕</button>'
  }) +

    sh('Your Profiles') +
    profileCards +

    '<div  class="pad-x-16-b">' +
    '<button type="button" class="btn btn-secondary mb-10"  onclick="showCreateProfile()">+ New Profile</button>' +
    '<button type="button" class="btn btn-secondary mb-10" onclick="loadSamplePersonas()">Load sample athletes</button>' +
    (activeId === 'demo' ? '' :
      '<button type="button" class="btn" style="background:rgba(123,95,255,0.1);border:1px solid rgba(123,95,255,0.25);color:#7b5fff;margin-bottom:10px" onclick="openDemoProfile()">🤖 Open demo profile</button>' +
      '<a href="?demo=1" class="btn btn-secondary" style="display:block;text-align:center;text-decoration:none;margin-bottom:0">Fresh demo snapshot ↗</a>') +
    '</div>' +

    sh('What is Demo Mode?') +
    '<div class="card card-solid" style="margin:0 16px 20px">' +
    '<div style="font-size:14px;color:var(--txt2);line-height:1.65">' +
    'Demo is a separate profile with sample workouts, PRs, body stats, and supplements. Switch back anytime from this screen — your real profiles stay on this device.' +
    '</div></div>' +

    '<div  class="spacer-bottom"></div>';
});

window.switchToProfile = function(id) {
  S.switchProfile(id);
  toast('Switched to ' + (S.profiles().find(function(p){return p.id===id;})||{}).name, 'ok');
  go('dashboard');
};

window.deleteProfile = function(id) {
  const prof = S.profiles().find(function(p){return p.id===id;});
  if (!prof) return;
  modal('Delete Profile?',
    '<div style="font-size:15px;color:var(--txt2);line-height:1.6">Delete <strong>'+esc(prof.name)+'</strong>? All workouts, PRs, and data for this profile will be permanently removed.</div>',
    '<button type="button" class="btn btn-danger mt-12" onclick="confirmDeleteProfile(\''+id+'\')">Delete Profile</button>' +
    '<button type="button" class="btn btn-secondary mt-8" onclick="closeModal()" >Cancel</button>'
  );
};

window.confirmDeleteProfile = function(id) {
  S.deleteProfile(id);
  closeModal();
  toast('Profile deleted', 'ok');
  go('profiles');
};

window.loadSamplePersonas = function() {
  var ids = S.seedPersonas(false, false);
  toast(ids.length + ' sample athletes ready — tap one to switch', 'ok', 3500);
  go('profiles');
};

window.openDemoProfile = function() {
  if (S.hasRealUserData && S.hasRealUserData() && S.activeId() !== 'demo') {
    modal('Open demo profile?',
      '<div style="font-size:15px;color:var(--txt2);line-height:1.65">Switch to the sample <strong>Demo Mode</strong> profile? Your real workout data stays saved — switch back here anytime.</div>',
      '<button type="button" class="btn btn-primary mt-12" onclick="confirmOpenDemoProfile()">Open demo profile</button>' +
      '<button type="button" class="btn btn-secondary mt-8" onclick="closeModal()" >Cancel</button>'
    );
    return;
  }
  confirmOpenDemoProfile();
};

window.confirmOpenDemoProfile = function() {
  closeModal();
  S.openDemoProfile();
  applyTheme(S.g('user.theme') || S.g('user.mode') || 'dark');
  toast('🤖 Demo profile — switch back in Profiles anytime', 'ok', 4000);
  go('dashboard');
};

window.showCreateProfile = function() {
  const avatars = ['💪','🏋️','🔥','⚡','🎯','🧠','🏆','🤖','👑','🦁','🐺','🚀'];
  const avatarBtns = avatars.map(function(a) {
    return '<button type="button" onclick="selectAvatar(\''+a+'\')" id="av-btn-'+a.codePointAt(0)+'" '+
      'style="font-size:28px;padding:8px;background:var(--bg3);border:2px solid var(--border);border-radius:12px;cursor:pointer;touch-action:manipulation;transition:border-color 0.15s" class="av-btn">'+a+'</button>';
  }).join('');

  modal('Create Profile',
    '<div style="margin-bottom:16px">' +
    '<label class="field-label">Name</label>' +
    '<input id="new-prof-name" class="field" type="text" placeholder="Enter name" maxlength="20">' +
    '</div>' +
    '<label class="field-label">Avatar</label>' +
    '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:4px">' + avatarBtns + '</div>' +
    '<div id="av-preview" style="margin-top:12px;font-size:13px;color:var(--txt3)">Selected: 💪</div>',
    '<button type="button" class="btn btn-primary" onclick="createNewProfile()" style="margin-top:16px">Create Profile</button>'
  );
  window._selectedAvatar = '💪';
};

window.selectAvatar = function(a) {
  window._selectedAvatar = a;
  document.querySelectorAll('.av-btn').forEach(function(b) {
    b.style.borderColor = 'var(--border)';
  });
  const preview = document.getElementById('av-preview');
  if (preview) preview.textContent = 'Selected: ' + a;
};

window.createNewProfile = function() {
  const name = (document.getElementById('new-prof-name')||{}).value || '';
  if (!name.trim()) { toast('Enter a name', 'warn'); return; }
  const id = S.createProfile(name.trim(), window._selectedAvatar || '💪');
  closeModal();
  toast('Profile created!', 'ok');
  go('onboarding');
};
