// RuneXO offline cache
const CACHE_NAME = "runexo-v1.0.3";
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

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).catch(() => r))
  );
});
