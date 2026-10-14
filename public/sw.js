const CACHE = "rks-shell-v2";
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(["/manifest.webmanifest", "/icon.svg"])).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith("rks-shell-") && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  // Never substitute HTML for JavaScript, RSC payloads or timing downloads.
  if (event.request.method !== "GET" || event.request.mode !== "navigate") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok && response.headers.get("content-type")?.includes("text/html")) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, copy)));
    }
    return response;
  }).catch(async () => (await caches.match(event.request)) || new Response("You are offline. Reconnect and reload this page.", { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } })));
});
