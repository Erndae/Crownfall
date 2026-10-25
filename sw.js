// Crownfall offline cache. Bump VERSION when you upload a new index.html.
// Music in soundtrack/ is cached on demand.
const VERSION = 'crownfall-v164';
const FILES = ['./gameplay-polish.js?v=164','./gameplay-polish.css?v=164','./assets/rulers/raven.webp','./assets/rulers/stag.webp','./assets/rulers/owl.webp','./assets/rulers/lion.webp','./assets/rulers/fox.webp','./piece-designs.js?v=164','./character-style.js?v=164','./character-style.css?v=164','./campaign-opponents.js?v=164','./campaign-dialogue.js?v=164','./city-board.css?v=164','./ruler-style.css?v=164','./downtown-journey.webp', './', './index.html', './legacy.html', './manifest.webmanifest', './cf-icon-192.png', './cf-icon-512.png', './cf-touch-180.png', './cf-favicon-32.png', './crownfall-logo.webp', './crown-city.webp', './iron-kingdom.webp', './olympian-court.webp', './shattered-realm.webp', './fallen-throne.webp', './kingpin-vex.webp', './king-aldric.webp', './athena.webp', './morwen.webp', './crownless-king.webp', './spray-paint-crown.webp', './iron-circlet.webp', './olive-wreath.webp', './moonstone-tiara.webp'];
// Cache each file on its own so one missing file can never stop the whole cache from installing.
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => Promise.allSettled(FILES.map(f => c.add(f)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => /^crownfall-v\d+$/.test(k) && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
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
