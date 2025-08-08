// 서비스 워커 파일
// 웹 푸시 알림 및 오프라인 기능 처리

// 캐시 이름 설정
const CACHE_NAME = 'juicegoblin-cache-v1';
const STATIC_CACHE_NAME = 'juicegoblin-static-v1';
const DYNAMIC_CACHE_NAME = 'juicegoblin-dynamic-v1';

// 오프라인 페이지 URL
const OFFLINE_URL = '/offline.html';

// 사전 캐싱할 정적 자산 목록
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/image/juicegoblin_bi.png',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// 설치 이벤트 처리
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  // 정적 자산 사전 캐싱
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch(error => {
        console.error('Service Worker: Pre-caching failed:', error);
      })
  );

  self.skipWaiting(); // 새 서비스 워커가 즉시 활성화되도록 함
});

// 활성화 이벤트 처리
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  // 이전 캐시 정리
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // 현재 버전의 캐시가 아닌 경우 삭제
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== STATIC_CACHE_NAME &&
            cacheName !== DYNAMIC_CACHE_NAME
          ) {
            console.log('Service Worker: Clearing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  return self.clients.claim(); // 모든 클라이언트에 대한 제어권 획득
});

// 네트워크 요청 가로채기 (fetch 이벤트)
self.addEventListener('fetch', (event) => {
  // API 요청은 네트워크 우선 전략 사용
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // HTML 페이지 요청은 네트워크 우선, 실패 시 오프라인 페이지 제공
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(OFFLINE_URL);
        })
    );
    return;
  }

  // 이미지, CSS, JS 등 정적 자산은 캐시 우선 전략 사용
  if (
    event.request.destination === 'style' ||
    event.request.destination === 'script' ||
    event.request.destination === 'image' ||
    event.request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          // 캐시에 있으면 캐시에서 제공
          if (cachedResponse) {
            return cachedResponse;
          }

          // 캐시에 없으면 네트워크에서 가져오고 캐시에 저장
          return fetch(event.request)
            .then((networkResponse) => {
              // 유효한 응답인 경우에만 캐시에 저장
              if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
              }

              // 응답을 복제하여 캐시에 저장 (스트림은 한 번만 사용 가능)
              const responseToCache = networkResponse.clone();
              caches.open(DYNAMIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });

              return networkResponse;
            })
            .catch(() => {
              // 네트워크 요청 실패 시 오프라인 대체 이미지 제공 (이미지인 경우)
              if (event.request.destination === 'image') {
                return caches.match('/image/offline-image.png');
              }
              return null;
            });
        })
    );
    return;
  }

  // 기타 요청은 네트워크 우선, 실패 시 캐시 사용
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // GET 요청인 경우에만 캐시에 저장
        if (event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(DYNAMIC_CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }

        return networkResponse;
      })
      .catch(() => {
        // GET 요청인 경우에만 캐시에서 확인
        if (event.request.method === 'GET') {
          return caches.match(event.request);
        }
        // 다른 메서드의 요청은 실패 시 null 반환
        return null;
      })
  );
});

// 푸시 이벤트 처리
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received');

  let notificationData = {};

  try {
    // 푸시 데이터 파싱
    if (event.data) {
      notificationData = event.data.json();
    }
  } catch (error) {
    console.error('Service Worker: Error parsing push data', error);
    notificationData = {
      title: '새 알림',
      body: '새로운 알림이 도착했습니다.',
      icon: '/image/juicegoblin_bi.png',
      badge: '/icons/icon-72x72.png',
      data: {
        url: '/',
      },
    };
  }

  const title = notificationData.title || '쥬스고블린 알림';
  const options = {
    body: notificationData.body,
    icon: notificationData.icon || '/image/juicegoblin_bi.png',
    badge: notificationData.badge || '/icons/icon-72x72.png',
    data: notificationData.data || {},
    vibrate: [100, 50, 100],
    requireInteraction: true, // 사용자가 상호작용할 때까지 알림 유지
  };

  // 알림 표시
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 알림 클릭 이벤트 처리
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification click received');

  event.notification.close(); // 알림 닫기

  // 알림 데이터에서 URL 가져오기
  const url = event.notification.data?.url || '/';

  // 클라이언트 창 열기
  event.waitUntil(
    clients.matchAll({type: 'window'}).then((clientList) => {
      // 이미 열린 창이 있는지 확인
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }

      // 열린 창이 없으면 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// 푸시 구독 변경 이벤트 처리
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Service Worker: Push subscription changed');

  // 서버에 새 구독 정보 전송
  event.waitUntil(
    fetch('/api/notifications/push/update-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        oldSubscription: event.oldSubscription,
        newSubscription: event.newSubscription,
      }),
    })
  );
});