self.addEventListener('install', (e) => {
    console.log('Nomad Eagle Service Worker Installed');
    e.waitUntil(
        caches.open('nomad-eagle-store').then((cache) => cache.addAll([
            '/',
            '/manifest.webmanifest',
            '/globe.svg',
        ])),
    );
});

self.addEventListener('fetch', (e) => {
    console.log(e.request.url);
    e.respondWith(
        caches.match(e.request).then((response) => response || fetch(e.request)),
    );
});
