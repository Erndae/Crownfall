// Crownfall offline cache. Bump VERSION when you upload a new index.html.
const VERSION = 'crownfall-v58';
const FILES = ['./', './index.html', './manifest.webmanifest', './cf-icon-192.png', './cf-icon-512.png', './cf-touch-180.png', './cf-favicon-32.png', './assets/crownfall-logo.webp', './assets/crown-city.webp', './assets/iron-kingdom.webp', './assets/olympian-court.webp', './assets/shattered-realm.webp', './assets/fallen-throne.webp', './assets/rulers/kingpin-vex.webp', './assets/rulers/king-aldric.webp', './assets/rulers/athena.webp', './assets/rulers/morwen.webp', './assets/rulers/crownless-king.webp', './assets/crowns/spray-paint-crown.webp', './assets/crowns/iron-circlet.webp', './assets/crowns/olive-wreath.webp', './assets/crowns/moonstone-tiara.webp'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if(url.origin === location.origin){
    // network first for the game page so updates show up, cache as fallback
    e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
  } else if(url.hostname.includes('fonts.g')){
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return res; })));
  }
});
