// ⚡ RuneXO Progressive Web Service Worker
const CACHE_NAME = "runexo-v1.2.0";
const ASSETS = [
  "/", 
  "/index.html",
  "/app.js",
  "/style.css",

  // 🎵 Sounds
  "/sound/intro.mp3",
  "/sound/bg.mp3",
  "/sound/click.mp3",
  "/sound/win.mp3",
  "/sound/lose.mp3",
  "/sound/draw.mp3",

  // 🎨 Icons / Logos
  "/logo-dragon.png",
  "/icon-192.png",
  "/icon-512.png"
];

// 🔹 Install phase — cache all assets
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// 🔹 Activate — clean up old caches
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// 🔹 Fetch — serve from cache, fallback to network
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res =>
      res ||
      fetch(e.request).then(fetchRes => {
        return caches.open(CACHE_NAME).then(cache => {
          // Cache new files dynamically (except for dev tools)
          if (e.request.url.startsWith(self.location.origin)) {
            cache.put(e.request, fetchRes.clone());
          }
          return fetchRes;
        });
      }).catch(() => caches.match("/index.html"))
    )
  );
});
