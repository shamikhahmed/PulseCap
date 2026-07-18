'use strict';

const CACHE = 'pulsecap-v71';
const ASSETS = [
  './css/capricorn-core.css',
  './',
  './index.html',
  './landing.html',
  './presentation.html',
  './pitch.html',
  './icon-192.png',
  './icon-512.png',
  './manifest.json',
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/identity.css',
  './js/storage.js',
  './js/data/equipment-db.js',
  './js/data/splits-db.js',
  './js/data/injuries-db.js',
  './js/data/foods-db.js',
  './js/app.js',
  './js/engines.js',
  './js/coach-kernel.js',
  './js/gym-tools.js',
  './js/modules/onboarding.js',
  './js/modules/dashboard.js',
  './js/modules/workout.js',
  './js/data/exercise-library.js',
  './js/data/form-loops.js',
  './js/modules/bodymap.js',
  './js/modules/calculators.js',
  './js/modules/coach.js',
  './js/modules/progress.js',
  './js/modules/nutrition.js',
  './js/modules/recovery.js',
  './js/modules/settings.js',
  './js/modules/profiles.js',
  './js/modules/anatomy.js',
  './js/modules/rehab.js',
  './js/modules/calisthenics.js',
  './js/modules/knowledge-graph.js',
  './js/modules/recovery-debt.js',
  './js/modules/physique.js',
  './js/modules/physique-archetype.js',
  './js/modules/injury-risk.js',
  './js/modules/training-intelligence.js',
  './js/modules/training-style.js',
  './js/modules/encyclopedia.js',
  './js/modules/advanced-search.js',
  './js/modules/visualizations.js',
  './js/modules/hub.js',
  './js/modules/equipment-setup.js',
  './js/modules/photos.js',
  './js/modules/body-intelligence.js',
  './js/modules/fitness-assistant.js',
  './js/modules/quests.js',
  './manifest.json',
  './icon.svg',
  './assets/apple-touch-icon-120.png',
  './assets/apple-touch-icon-152.png',
  './assets/apple-touch-icon-180.png',
  './js/capricorn-motion.js',
  './js/cap-demo-mode.js',
  './js/cap-desktop-nav.js',
  './js/capricorn-scene.js',
  './js/capricorn-premium-nav.js',
  './js/capricorn-cinematic.js',
  './js/capricorn-deck.js',
  './js/capricorn-deck-pro.js',
  './js/capricorn-pitch.js',
  './js/vendor/gsap.min.js',
  './js/vendor/ScrollTrigger.min.js',
  './privacy.html',
  './changelog.html',
];
const ASSET_URLS = new Set(ASSETS.map(a => new URL(a, self.location).href));

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
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
