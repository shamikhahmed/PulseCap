'use strict';

const CACHE = 'pulsecap-v122';
const ASSETS = [
  './',
  './index.html',
  './landing.html',
  './presentation.html',
  './pitch.html',
  './icon-192.png',
  './icon-512.png',
  './icon-48.png',
  './icon-72.png',
  './icon-96.png',
  './icon-128.png',
  './icon-144.png',
  './icon-152.png',
  './icon-167.png',
  './icon-180.png',
  './icon-256.png',
  './icon-384.png',
  './icon-1024.png',

  './icon-maskable-192.png',
  './icon-maskable-512.png',

  './assets/apple-touch-startup-320x568-light.png',
  './assets/apple-touch-startup-320x568-dark.png',
  './assets/apple-touch-startup-375x667-light.png',
  './assets/apple-touch-startup-375x667-dark.png',
  './assets/apple-touch-startup-375x812-light.png',
  './assets/apple-touch-startup-375x812-dark.png',
  './assets/apple-touch-startup-390x844-light.png',
  './assets/apple-touch-startup-390x844-dark.png',
  './assets/apple-touch-startup-414x736-light.png',
  './assets/apple-touch-startup-414x736-dark.png',
  './assets/apple-touch-startup-414x896-light.png',
  './assets/apple-touch-startup-414x896-dark.png',
  './assets/apple-touch-startup-428x926-light.png',
  './assets/apple-touch-startup-428x926-dark.png',
  './manifest.json',
  './css/tokens.css',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/ember-components.css',
  './css/shell.css',
  './css/identity.css',
  './js/storage.js',
  './js/core/nutrition-math.js',
  './js/core/equipment.js',
  './js/data/equipment-db.js',
  './js/data/splits-db.js',
  './js/data/injuries-db.js',
  './js/data/foods-db.js',
  './js/data/exercise-db.js',
  './js/data/training-plan-schema.js',
  './js/data/plans/machine-ppl.js',
  './js/data/plans/catalog.js',
  './js/app.js',
  './js/engines.js',
  './js/core/daily-decision.js',
  './js/coach-kernel.js',
  './js/training-plan.js',
  './js/core/profile.js',
  './js/core/engine.js',
  './js/plan-import.js',
  './js/gym-tools.js',
  './js/modules/onboarding.js',
  './js/modules/dashboard.js',
  './js/modules/workout.js',
  './js/data/exercise-library.js',
  './js/data/form-loops.js',
  './js/modules/coach.js',
  './js/modules/progress.js',
  './js/modules/nutrition.js',
  './js/modules/recovery.js',
  './js/modules/settings.js',
  './js/modules/profiles.js',
  './js/modules/rehab.js',
  './js/modules/equipment-setup.js',
  './js/modules/photos.js',
  './js/modules/my-plan.js',
  './icon.svg',
  './assets/apple-touch-icon-120.png',
  './assets/apple-touch-icon-152.png',
  './assets/apple-touch-icon-180.png',
  './js/cap-demo-mode.js',
  './privacy.html',
  './changelog.html',
  './assets/qr-pulsecap.png',
];
const ASSET_URLS = new Set(ASSETS.map(a => new URL(a, self.location).href));

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
  );
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const reqUrl = new URL(e.request.url);
  const sameOrigin = reqUrl.origin === self.location.origin;
  const isNavigation = e.request.mode === 'navigate';
  e.respondWith(
    caches.match(e.request)
      .then(r => r || fetch(e.request).then(res => {
        if (sameOrigin && res && res.ok && (ASSET_URLS.has(reqUrl.href) || isNavigation)) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }))
      .catch(() => isNavigation ? caches.match('./index.html') : Promise.reject())
  );
});
