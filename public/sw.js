const CACHE_NAME = 'nomad-eagle-v2';

self.addEventListener('install', (e) => {
    console.log('Nomad Eagle Service Worker v2 Installed');
    // Force the new SW to take over immediately
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll([
            '/globe.svg',
        ])),
    );
});

self.addEventListener('activate', (e) => {
    console.log('Nomad Eagle Service Worker v2 Activated');
    // Clean up old caches
    e.waitUntil(
        caches.keys().then((names) =>
            Promise.all(
                names
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    // Only cache static assets (images, fonts, etc.)
    // NEVER cache HTML pages or API routes — always go to network
    if (
        e.request.method !== 'GET' ||
        url.pathname.startsWith('/api/') ||
        e.request.headers.get('accept')?.includes('text/html')
    ) {
        return; // Let the browser handle it normally (network)
    }

    // For static assets: network-first with cache fallback
    e.respondWith(
        fetch(e.request)
            .then((response) => {
                // Cache the fresh response
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
                return response;
            })
            .catch(() => caches.match(e.request))
    );
});
