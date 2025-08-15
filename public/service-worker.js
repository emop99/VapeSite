// 서비스 워커 파일
// 웹 푸시 알림 및 오프라인 기능 처리

// 1. Workbox 라이브러리 로드
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// 2. VAPID 키 (next-pwa에 의해 주입됨)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

if (workbox) {
  // 3. Workbox 모듈 별칭 설정
  const {precacheAndRoute, cleanupOutdatedCaches} = workbox.precaching;
  const {registerRoute, setCatchHandler} = workbox.routing;
  const {NetworkFirst, CacheFirst, StaleWhileRevalidate} = workbox.strategies;
  const {ExpirationPlugin} = workbox.expiration;
  const {CacheableResponsePlugin} = workbox.cacheableResponse;

  // 4. Precaching 설정
  cleanupOutdatedCaches(); // 이전 버전의 precache 정리

  // 사전 캐싱 중 404 오류를 일으키는 문제가 있는 매니페스트를 필터링합니다.
  const precacheManifest = (self.__WB_MANIFEST || []).filter(
    (entry) => !entry.url.includes('dynamic-css-manifest.json') && !entry.url.includes('/uploads/')
  );
  // next-pwa가 빌드 시 생성된 정적 파일들을 자동으로 캐싱하도록 하는 플레이스홀더
  precacheAndRoute(precacheManifest);

  // 5. 오프라인 Fallback 설정
  const OFFLINE_URL = '/offline.html';
  setCatchHandler(({event}) => {
    if (event.request.mode === 'navigate') {
      return caches.match(OFFLINE_URL);
    }
    return Response.error();
  });

  // 6. 캐싱 전략 라우팅 설정
  // API 요청: 네트워크 우선, 5분간 캐시
  registerRoute(
    ({request}) => request.url.includes('/api/'),
    new NetworkFirst({
      cacheName: 'juicegoblin-api-cache',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        }),
        new CacheableResponsePlugin({statuses: [200]}),
      ],
    })
  );

  // 이미지 요청: 캐시 우선, 30일간 캐시
  registerRoute(
    ({request, url}) =>
      request.destination === 'image',
    new CacheFirst({
      cacheName: 'juicegoblin-image-cache',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
        }),
        new CacheableResponsePlugin({statuses: [0, 200]}), // 0 for opaque responses (CORS)
      ],
    })
  );

  // CSS, JS, 폰트 등 정적 리소스: Stale-While-Revalidate 전략
  registerRoute(
    ({request}) =>
      request.destination === 'style' ||
      request.destination === 'script' ||
      request.destination === 'font' ||
      request.destination === 'worker',
    new StaleWhileRevalidate({
      cacheName: 'juicegoblin-static-resources',
    })
  );
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}

// Base64 문자열을 Uint8Array로 변환하는 유틸리티 함수
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = self.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

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

  const handleSubscriptionChange = async () => {
    try {
      let newSubscription = event.newSubscription;

      // 브라우저가 새 구독을 제공하지 않으면 수동으로 재구독
      if (!newSubscription) {
        console.log('Service Worker: New subscription not provided, re-subscribing...');
        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        newSubscription = await self.registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      // 갱신된 구독 정보를 서버에 전송
      const response = await fetch('/api/notifications/push/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          oldSubscription: event.oldSubscription,
          newSubscription: newSubscription,
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        throw new Error('Server error during subscription update.');
      }

      console.log('Service Worker: Push subscription updated successfully.');
    } catch (error) {
      console.error('Service Worker: Error handling push subscription change:', error);
    }
  };

  event.waitUntil(handleSubscriptionChange());
});