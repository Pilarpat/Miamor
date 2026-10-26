// Mi amor ❤️ – Service Worker mínimo (offline básico)
const CACHE = 'miamor-v3';

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    const c = list.find(w => 'focus' in w);
    return c ? c.focus() : self.clients.openWindow('./#sec-detail');
  }));
});
const CORE = ['./', './index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Network-first para la página, cache-first para recursos externos (Tailwind, fuentes)
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const isPage = e.request.mode === 'navigate';
  e.respondWith(
    isPage
      ? fetch(e.request).then(r => { caches.open(CACHE).then(c => c.put('./index.html', r.clone())); return r; })
          .catch(() => caches.match('./index.html'))
      : caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
          if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
          return r;
        }))
  );
});
