// SesliOku önbellek: uygulama internetsiz açılsın
const V = 'sesli-app-1795104517087', CDN = 'sesli-cdn-1', ORT = 'sesli-ort-1.30';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V && k !== CDN && k !== ORT).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    if (u.pathname.includes('/ema/')) return;                  // model dosyaları zaten uygulamanın deposunda saklanır
    if (u.pathname.includes('/ort/')) {                        // ses motoru: bir kez iner, güncellemede yeniden inmez
      e.respondWith(caches.open(ORT).then(c => c.match(r).then(h => h || fetch(r).then(res => { if (res.ok) c.put(r, res.clone()); return res; })))); return;
    }
    e.respondWith(fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); } return res; })
      .catch(() => caches.match(r).then(h => h || caches.match('index.html'))));
  } else if (u.hostname === 'cdn.jsdelivr.net' || u.hostname === 'fonts.googleapis.com' || u.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(CDN).then(c => c.match(r).then(h => h || fetch(r).then(res => { if (res.ok || res.type === 'opaque') c.put(r, res.clone()); return res; }))));
  }
});
