// Offline support: serve the app from the cache, refresh the cache in the background.
// Bump CACHE when releasing a new version so installed copies update right away.
const CACHE = "cmr-form-v1";
const ASSETS = [
  "./",
  "index.html",
  "styles.css",
  "manifest.webmanifest",
  "js/app.js",
  "js/numbers.js",
  "js/sheet.js",
  "js/texts.js",
  "icons/icon.svg",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      // Only this app's old caches: the other tools on the same site keep theirs.
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("cmr-form-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  const network = fetch(request)
    .then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    })
    .catch(() => null);
  event.waitUntil(network);

  event.respondWith(
    (async () => {
      const cached = await caches.match(request, { ignoreSearch: true });
      if (cached) return cached;
      const response = await network;
      if (response) return response;
      if (request.mode === "navigate") {
        const shell = await caches.match("index.html");
        if (shell) return shell;
      }
      return Response.error();
    })(),
  );
});
