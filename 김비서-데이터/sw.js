// 김비서 Service Worker
const CACHE_NAME = 'kim-biseo-v1';
const urlsToCache = [
  '/',
  '/김비서-데이터/dashboard.html',
  '/김비서-데이터/manifest.json',
  '/김비서-데이터/icon-192.png',
  '/김비서-데이터/icon-512.png'
];

// 설치 이벤트
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] 캐시 설치 중...');
        return cache.addAll(urlsToCache).catch(err => {
          console.log('[Service Worker] 일부 리소스 캐시 실패 (오프라인 가능):', err);
        });
      })
  );
  self.skipWaiting();
});

// 활성화 이벤트
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] 이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 페치 이벤트 (캐시 우선)
self.addEventListener('fetch', event => {
  // CSS, JS, 이미지 등은 캐시 우선
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(event.request)
            .then(response => {
              // 성공한 응답은 캐시에 저장
              if (!response || response.status !== 200 || response.type === 'error') {
                return response;
              }
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              return response;
            })
            .catch(() => {
              // 오프라인: 캐시된 페이지 반환
              return caches.match('/김비서-데이터/dashboard.html');
            });
        })
    );
  }
});
