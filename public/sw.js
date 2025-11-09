// RuneXO SW v1.0.6 – safe, versioned cache & clean activate
const CACHE = "runexo-106";
const ASSETS = [
  "./",
  "./index.html?v=106",
  "./style.css?v=106",
  "./app.js?v=106",
  "./manifest.json?v=106",
  "./logo-dragon.png",
  "./icon-192.png",
  "./icon-512.png",
  "./sound/intro.mp3",
  "./sound/bg.mp3",
  "./sound/click.mp3",
  "./sound/win.mp3",
  "./sound/lose.mp3",
  "./sound/draw.mp3"
];

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(()=> self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  // Network-first for app shell with cache fallback (avoids stale)
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match(req))
  );
});
