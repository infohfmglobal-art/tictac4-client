// RuneXO SW v106 — network-first for html/js to avoid stale code
const CACHE_NAME = "runexo-v106";
const STATIC_ASSETS = [
  "./",
  "./index.html?v=106",
  "./style.css?v=106",
  "./app.js?v=106",
  "./manifest.json?v=106",
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

self.addEventListener("install", (e)=>{
  e.waitUntil(
    caches.open(CACHE_NAME).then(c=>c.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e)=>{
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e)=>{
  const req = e.request;
  const url = new URL(req.url);

  // network-first for html/js
  const isHtmlOrJs = req.destination === "document" || req.destination === "script" ||
                     url.pathname.endsWith(".html") || url.pathname.endsWith(".js");

  if (isHtmlOrJs) {
    e.respondWith(
      fetch(req).then(res=>{
        const copy = res.clone();
        caches.open(CACHE_NAME).then(c=>c.put(req, copy));
        return res;
      }).catch(()=> caches.match(req))
    );
    return;
  }

  // cache-first for everything else
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res=>{
      const copy = res.clone();
      caches.open(CACHE_NAME).then(c=>c.put(req, copy));
      return res;
    }))
  );
});
