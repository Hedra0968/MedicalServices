const CACHE_NAME = "medical-services-cache-v1";
const urlsToCache = ["index.html", "assets/css/style.css", "assets/js/index.js"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(urlsToCache)));
});

self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
