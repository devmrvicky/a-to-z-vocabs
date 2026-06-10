/* =====================================================
   SERVICE WORKER — offline-first caching
===================================================== */

const CACHE_NAME    = 'ssc-vocab-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './js/utils.js',
  './js/db.js',
  './js/modal.js',
  './js/bookmark.js',
  './js/search.js',
  './js/difficulty.js',
  './js/speech.js',
  './js/filters.js',
  './js/render.js',
  './js/data-loader.js',
  './js/word-editor.js',
  './js/section-tabs.js',
  './js/quiz-engine.js',
  './js/quiz-ui.js',
  './js/app.js',
];

const DATA_ASSETS = [
  './data/vocabs/a.json','./data/vocabs/b.json','./data/vocabs/c.json',
  './data/vocabs/d.json','./data/vocabs/e.json','./data/vocabs/f.json',
  './data/vocabs/g.json','./data/vocabs/h.json','./data/vocabs/i.json',
  './data/vocabs/j.json','./data/vocabs/k.json','./data/vocabs/l.json',
  './data/vocabs/m.json','./data/vocabs/n.json','./data/vocabs/o.json',
  './data/vocabs/p.json','./data/vocabs/q.json','./data/vocabs/r.json',
  './data/vocabs/s.json','./data/vocabs/t.json','./data/vocabs/u.json',
  './data/vocabs/v.json','./data/vocabs/w.json','./data/vocabs/y.json',
  './data/vocabs/z.json',
  './data/syns/syns.json',
  './data/ows/ows.json',
  './data/idioms/idioms.json',
];

/* ---- INSTALL: cache all static + data assets ---- */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Cache static assets (required — fail install if missing)
      return cache.addAll(STATIC_ASSETS).then(() =>
        // Cache data assets (best-effort — don't fail install)
        Promise.allSettled(DATA_ASSETS.map(url =>
          cache.add(url).catch(() => {/* skip missing */})
        ))
      );
    }).then(() => self.skipWaiting())
  );
});

/* ---- ACTIVATE: remove old caches ---- */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* ---- FETCH: cache-first for assets, network-first for HTML ---- */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Only handle same-origin GET requests
  if (event.request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // HTML: network-first (get fresh index.html if possible)
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return res;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Everything else: cache-first with network fallback
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return res;
      }).catch(() => new Response('Offline', { status: 503 }));
    })
  );
});
