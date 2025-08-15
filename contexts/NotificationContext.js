import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useSession} from 'next-auth/react';
import io from 'socket.io-client';
import {toast} from "react-hot-toast";
import {useRouter} from "next/navigation";

// 알림 컨텍스트 생성
const NotificationContext = createContext(null);

// Base64 문자열을 Uint8Array로 변환하는 유틸리티 함수
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  AUTHENTICATE: 'authenticate',
  NOTIFICATION: 'notification',
  CONNECT_ERROR: 'connect_error',
};

/**
 * 알림 컨텍스트 제공자 컴포넌트
 * 소켓 연결 및 알림 관련 기능 제공
 */
export const NotificationProvider = ({children}) => {
  const {data: session} = useSession();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false); // 푸시 구독 처리 중 상태
  const isSubscribingRef = useRef(false); // 중복 실행 방지를 위한 동기적 플래그
  const router = useRouter();

  // 세션이 변경될 때 소켓 연결 관리
  useEffect(() => {
    if (!session?.user?.id) {
      return;
    }

    const connectSocket = () => {
      const socketInstance = io(process.env.NEXT_PUBLIC_BASE_URL || window.location.origin, {
        withCredentials: true,
      });

      // 소켓 이벤트 핸들러 설정
      socketInstance.on(SOCKET_EVENTS.CONNECT, () => {
        setIsConnected(true);
        // 사용자 인증
        socketInstance.emit(SOCKET_EVENTS.AUTHENTICATE, session.user.id);
      });

      socketInstance.on(SOCKET_EVENTS.DISCONNECT, () => {
        setIsConnected(false);
      });

      socketInstance.on(SOCKET_EVENTS.CONNECT_ERROR, (error) => {
        console.error('Socket connection error:', error);
      });

      socketInstance.on(SOCKET_EVENTS.NOTIFICATION, (notification) => {
        // 새 알림을 목록에 추가
        setNotifications(prev => [notification, ...prev]);
        // 읽지 않은 알림 수 증가
        setUnreadCount(prev => prev + 1);

        // 브라우저 알림 표시 (사용자가 허용한 경우)
        if (Notification.permission === 'granted') {
          const title = '쥬스고블린 알림';
          const options = {
            body: notification.content,
            icon: '/icons/icon-72x72.png',
            badge: '/icons/icon-96x96.png',
            data: {
              url: notification.url,
            },
          };

          const browserNotification = new Notification(title, options);

          // 알림 클릭 시 해당 URL로 이동
          browserNotification.onclick = () => {
            router.push(notification.url);
            window.focus();
          };
        }
      });

      setSocket(socketInstance);

      // 컴포넌트 언마운트 시 소켓 연결 해제
      return socketInstance;
    };

    const socketInstance = connectSocket();

    return () => {
      socketInstance?.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [session?.user?.id]);

  // 초기 알림 데이터 로드
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session?.user) return;

      try {
        const response = await fetch('/api/notifications?limit=20');
        if (response.ok) {
          const data = await response.json();
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    fetchNotifications();
  }, [session?.user?.id]);

  // 알림 읽음 처리 함수
  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({id: notificationId}),
      });

      if (response.ok) {
        // 알림 목록 업데이트
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? {...notification, isRead: true}
              : notification
          )
        );

        // 읽지 않은 알림 수 감소
        setUnreadCount(prev => Math.max(0, prev - 1));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      return false;
    }
  }, []);

  // 모든 알림 읽음 처리 함수
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({all: true}),
      });

      if (response.ok) {
        const data = await response.json();
        // 알림 목록 업데이트
        setNotifications(prev =>
          prev.map(notification => ({...notification, isRead: true}))
        );

        // 읽지 않은 알림 수 초기화
        setUnreadCount(0);
        toast.success(data.message);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('모든 알림 읽음 처리에 실패했습니다.');
      return false;
    }
  }, []);

  // 더 많은 알림 로드 함수
  const loadMoreNotifications = useCallback(async (page = 2) => {
    try {
      const response = await fetch(`/api/notifications?page=${page}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(prev => [...prev, ...data.notifications]);
        return data.pagination;
      }
      return null;
    } catch (error) {
      console.error('Failed to load more notifications:', error);
      return null;
    }
  }, []);

  // 푸시 알림 구독 함수
  const subscribeToPushNotifications = useCallback(async () => {
    try {
      // 서비스 워커가 지원되는지 확인
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return {success: false, reason: 'push-not-supported'};
      }

      // 서비스 워커 등록
      const registration = await navigator.serviceWorker.register('/sw.js');

      // 기존 구독 확인
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        return {success: true, subscription: existingSubscription, alreadySubscribed: true};
      }

      // 서버의 공개 키 가져오기 (환경 변수에서)
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) {
        return {success: false, reason: 'missing-vapid-key'};
      }

      // 새 구독 생성
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      // 구독 정보를 서버에 전송
      const response = await fetch('/api/notifications/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          userAgent: navigator.userAgent
        }),
      });

      if (!response.ok) {
        console.error('Failed to send subscription to server:', await response.text());
        return {success: false, reason: 'server-error'};
      }

      return {success: true, subscription};
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return {success: false, reason: 'subscription-error', error};
    }
  }, []);

  // 웹 푸시 알림 권한 요청 및 구독 함수
  const requestNotificationPermission = useCallback(async () => {
    // Ref를 사용하여 중복 실행을 즉시 방지
    if (isSubscribingRef.current) {
      return {success: false, reason: 'in-progress'};
    }
    // 플래그를 동기적으로 설정하고, UI 업데이트를 위해 상태도 변경
    isSubscribingRef.current = true;
    setIsSubscribing(true);

    try {
      // 1. 브라우저 지원 여부 확인
      if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        return {success: false, reason: 'browser-no-support'};
      }

      // 2. 현재 권한 상태 확인 및 필요한 경우 요청
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

      // 3. 최종 권한이 'granted'인 경우에만 구독 진행
      if (permission === 'granted') {
        return await subscribeToPushNotifications();
      }

      // 4. 거부된 경우
      return {success: false, reason: 'permission-denied'};

    } catch (error) {
      console.error('Error during notification permission or subscription process:', error);
      return {success: false, reason: 'permission-error', error};
    } finally {
      // 처리가 끝나면 플래그와 상태를 모두 초기화
      isSubscribingRef.current = false;
      setIsSubscribing(false);
    }
  }, [subscribeToPushNotifications]);

  // 컨텍스트 값
  const value = useMemo(() => ({
      socket,
      isConnected,
      notifications,
      unreadCount,
      isSubscribing,
      markAsRead,
      markAllAsRead,
      loadMoreNotifications,
      requestNotificationPermission,
    }),
    [socket, isConnected, notifications, unreadCount, isSubscribing, markAsRead, markAllAsRead, loadMoreNotifications, requestNotificationPermission]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// 알림 컨텍스트 사용 훅
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};