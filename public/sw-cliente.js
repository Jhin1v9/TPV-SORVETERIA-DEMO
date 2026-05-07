const CACHE_NAME = 'tropicale-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/logo/ChatGPT%20Image%2025%20abr%202026,%2008_46_42.png',
  '/assets/logo/icon-192x192.png',
  '/assets/logo/icon-512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fase 9 — Fetch caching para assets estáticos
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Só cacheia GET requests
  if (request.method !== 'GET') return;

  // Cache-first para assets estáticos
  if (
    request.destination === 'image' ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.url.includes('/assets/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          // Cacheia a resposta
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
          return response;
        }).catch(() => {
          // Se falhar e tiver no cache, retorna cache
          return cached || new Response('', { status: 404 });
        });
      }),
    );
  }
});

self.addEventListener('push', (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {
      title: 'Tropicale',
      body: event.data ? event.data.text() : 'Seu pedido foi atualizado.',
    };
  }

  const title = payload.title || 'Tropicale';
  const options = {
    body: payload.body || 'Seu pedido foi atualizado.',
    icon: payload.icon || '/favicon.ico',
    badge: payload.badge || '/favicon.ico',
    data: payload.data || {},
    tag: payload.tag || 'tropicale-order-update',
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existingClient = allClients.find((client) => 'focus' in client);

    if (existingClient) {
      await existingClient.focus();
      if ('navigate' in existingClient) {
        await existingClient.navigate(targetUrl);
      }
      return;
    }

    await self.clients.openWindow(targetUrl);
  })());
});
