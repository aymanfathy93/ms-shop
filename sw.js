// Service worker — يخلّي التطبيق يفتح بسرعة ويتثبّت على الموبايل
const CACHE = 'ms-app-v2';
const SHELL = ['./', './index.html', './logo.js', './config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const CDN = /^https:\/\/(cdnjs\.cloudflare\.com|unpkg\.com|fonts\.googleapis\.com|fonts\.gstatic\.com)\//;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // طلبات السيرفر (POST) مش بتتخزن
  const url = new URL(req.url);
  if (url.origin === location.origin) {                   // ملفات التطبيق: من النت الأول، ولو مفيش نت من الكاش
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
  } else if (CDN.test(req.url)) {                         // المكتبات والخطوط: من الكاش الأول
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(n => { const cp = n.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return n; })));
  }
});
