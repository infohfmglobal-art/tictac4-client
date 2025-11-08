const CACHE_NAME = "runexo-v106";
const ASSETS = [
  "./",
  "./index.html",
  "./app.js",
  "./style.css",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./sound/intro.mp3",
  "./sound/bg.mp3",
  "./sound/click.mp3",
  "./sound/win.mp3",
  "./sound/lose.mp3",
  "./sound/draw.mp3"
];

// INSTALL — Precache core assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// ACTIVATE — Clear old cache versions
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// FETCH — Online-first strategy, with safe caching
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // ✅ Only cache fully loaded, valid responses
        if (response.ok && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});

// MESSAGE — Allow skipWaiting from new service worker updates
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
