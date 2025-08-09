import React, {createContext, useContext, useEffect, useState} from 'react';
import {useSession} from 'next-auth/react';
import io from 'socket.io-client';
import {toast} from "react-hot-toast";

// 알림 컨텍스트 생성
const NotificationContext = createContext(null);

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

  // 세션이 변경될 때 소켓 연결 관리
  useEffect(() => {
    let cleanup;

    // 소켓 연결 함수
    const connectSocket = () => {
      if (!session?.user?.id) return () => {
      };

      const socketInstance = io(process.env.NEXT_PUBLIC_BASE_URL || window.location.origin, {
        withCredentials: true,
      });

      // 소켓 이벤트 핸들러 설정
      socketInstance.on('connect', () => {
        setIsConnected(true);

        // 사용자 인증
        socketInstance.emit('authenticate', session.user.id);
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
      });

      socketInstance.on('notification', (notification) => {

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
            window.focus();
            window.location.href = notification.url;
          };
        }
      });

      setSocket(socketInstance);

      // 컴포넌트 언마운트 시 소켓 연결 해제
      return () => {
        try {
          socketInstance.removeAllListeners?.();
        } catch (e) {
        }
        socketInstance.disconnect();
        setSocket(null);
        setIsConnected(false);
      };
    };

    // 소켓 연결
    cleanup = connectSocket();

    // 컴포넌트 언마운트 시 소켓 연결 해제
    return () => {
      if (typeof cleanup === 'function') cleanup();
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
  }, [session]);

  // 알림 읽음 처리 함수
  const markAsRead = async (notificationId) => {
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
  };

  // 모든 알림 읽음 처리 함수
  const markAllAsRead = async () => {
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
  };

  // 더 많은 알림 로드 함수
  const loadMoreNotifications = async (page = 2) => {
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
  };

  // 웹 푸시 알림 권한 요청 및 구독 함수
  const requestNotificationPermission = async () => {
    // 브라우저가 알림을 지원하는지 확인
    if (!('Notification' in window)) {
      return {success: false, reason: 'browser-no-support'};
    }

    // 이미 권한이 허용된 경우
    if (Notification.permission === 'granted') {
      // 서비스 워커 등록 및 푸시 구독 진행
      return await subscribeToPushNotifications();
    }

    // 권한이 거부되지 않은 경우 권한 요청
    if (Notification.permission !== 'denied') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // 권한이 허용된 경우 서비스 워커 등록 및 푸시 구독 진행
          return await subscribeToPushNotifications();
        } else {
          return {success: false, reason: 'permission-denied'};
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return {success: false, reason: 'permission-error', error};
      }
    }

    return {success: false, reason: 'permission-denied'};
  };

  // 푸시 알림 구독 함수
  const subscribeToPushNotifications = async () => {
    try {
      // 서비스 워커가 지원되는지 확인
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return {success: false, reason: 'push-not-supported'};
      }

      // 서비스 워커 등록
      const registration = await navigator.serviceWorker.register('/service-worker.js');

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
  };

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

  // 컨텍스트 값
  const value = {
    socket,
    isConnected,
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loadMoreNotifications,
    requestNotificationPermission,
  };

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