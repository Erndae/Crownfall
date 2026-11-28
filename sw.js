// Crownfall offline cache. Bump VERSION when you upload a new index.html.
// Music in soundtrack/ is cached on demand.
const VERSION = 'crownfall-v256';
// v229: the first visit downloads only what the first session needs (the page once, scripts, icons, land and crown art,
// portraits, Crown City's walk-in). Later art (the other Lands' walk-ins, the ending paintings) is cached the first time
// it is shown, and topped up quietly a little after launch on a good connection, so the game still works offline.
const FILES = [
  './storybook.css?v=256', './assets/card-illustrations.webp',
  './assets/relics/street.webp', './assets/relics/medieval.webp', './assets/relics/greek.webp',
  './assets/relics/fantasy.webp', './assets/relics/throne.webp',
  './assets/opponents/iron-kingdom.webp', './assets/opponents/olympian-court.webp', './assets/opponents/road-opponents.webp', './assets/opponents/shattered-realm.webp', './assets/opponents/fallen-throne.webp', './assets/intro/bg-street.webp',
  './assets/intro/fig-city.webp', './assets/splash/crown-city-night.webp', './assets/splash/royal-courtyard.webp', './assets/splash/road-to-the-crown.webp',
  './gameplay-polish.js?v=256', './gameplay-polish.css?v=256', './assets/rulers/raven.webp', './assets/rulers/stag.webp',
  './assets/rulers/owl.webp', './assets/rulers/lion.webp', './assets/rulers/fox.webp', './piece-designs.js?v=256',
  './character-style.js?v=256', './character-style.css?v=256', './campaign-opponents.js?v=256', './campaign-dialogue.js?v=256',
  './city-board.css?v=256', './ruler-style.css?v=256', './downtown-journey.webp', './index.html',
  './manifest.webmanifest', './cf-icon-192.png', './cf-icon-512.png', './cf-touch-180.png',
  './cf-favicon-32.png', './crownfall-logo.webp', './crown-city.webp', './iron-kingdom.webp',
  './olympian-court.webp', './shattered-realm.webp', './fallen-throne.webp', './spray-paint-crown.webp',
  './iron-circlet.webp', './olive-wreath.webp', './moonstone-tiara.webp'
];
const LATER = [
  './assets/intro/bg-medieval.webp', './assets/intro/bg-greek.webp', './assets/intro/bg-fantasy.webp', './assets/intro/bg-throne.webp',
  './assets/intro/fig-c1.webp', './assets/intro/fig-c2.webp', './assets/intro/fig-c3.webp', './assets/intro/fig-c4.webp',
  './assets/ending/arrival.webp', './assets/ending/broken.webp', './assets/ending/turn.webp', './assets/ending/surrender.webp',
  './assets/ending/transformation.webp', './assets/ending/crown-refused.webp', './assets/ending/throne-approach.webp', './assets/ending/throne-walker.webp',
  './assets/ending/crown-lift.webp', './assets/ending/kingdom-balcony.webp'
];
// Cache each file on its own so one missing file can never stop the whole cache from installing.
const cacheAll = list => caches.open(VERSION).then(c => Promise.allSettled(list.map(f => c.match(f).then(hit => hit || c.add(f)))));
// the page asks for the rest once the first session is under way (see swTopUp in index.html)
self.addEventListener('message', e => { if(e.data && e.data.type === 'topup') e.waitUntil(cacheAll(LATER)); });
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => Promise.allSettled(FILES.map(f => c.add(f)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => /^crownfall-v\d+$/.test(k) && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if(url.origin === location.origin && url.pathname.endsWith('.mp4')) return; // Let the browser handle byte ranges.
  const keep = r => { if(r && r.ok){ const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); } return r; };  // never cache 404s
  if(url.origin === location.origin && url.pathname.endsWith('.mp3')){
    // music: cache first (fetched on demand the first time a track is needed, then reused)
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(keep)));
  } else if(url.origin === location.origin){
    // network first so updates show up; cache only as offline fallback
    e.respondWith(fetch(e.request).then(keep).catch(() => caches.match(e.request).then(r => r || (e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
  } else if(url.hostname.includes('fonts.g')){
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(keep)));
  }
});
