const CACHE_NAME = 'cloudmaster-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-512.png',
  '/favicon.ico'
];

// インストール時に静的アセットをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// アクティベート時に古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stale-while-revalidate 戦略
self.addEventListener('fetch', (event) => {
  // GETリクエスト以外、またはブラウザ拡張機能などのリクエストは無視
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          // 正常なレスポンスのみキャッシュを更新
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => {
          // ネットワークエラー時はキャッシュにフォールバック、
          // キャッシュもなければ503エラーレスポンスを返す（nullはNG）
          return cachedResponse || caches.match('/').then((fallback) => {
            return fallback || new Response('Network error', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
        });

        // キャッシュがあればそれを返しつつ裏で更新、なければネットワークを待つ
        return cachedResponse || fetchPromise;
      }).catch(() => {
        // オフラインかつキャッシュがない場合のフォールバック
        return caches.match('/').then((fallback) => {
          return fallback || new Response('Offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      });
    })
  );
});

