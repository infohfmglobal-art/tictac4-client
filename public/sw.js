// RuneXO offline cache (auto-update fixed)
const CACHE_NAME = "runexo-v1.0.4";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./logo-dragon.png",
  "./icon-192.png",
  "./icon-512.png",
  "./sound/bg.mp3",
  "./sound/click.mp3",
  "./sound/win.mp3",
  "./sound/lose.mp3",
  "./sound/draw.mp3",
  "./sound/intro.mp3"
];

// INSTALL: Cache all assets
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// ACTIVATE: Clear old caches
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

// FETCH: Online-first, then fallback to cache
self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
