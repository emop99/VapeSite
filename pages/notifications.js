import React, {useEffect} from 'react';
import {useSession} from 'next-auth/react';
import {useRouter} from 'next/router';
import NotificationHistory from '../components/notifications/NotificationHistory';
import NotificationSettings from '../components/notifications/NotificationSettings';

export default function NotificationsPage() {
  const {data: session, status} = useSession();
  const router = useRouter();

  // 로그인하지 않은 사용자는 로그인 페이지로 리디렉션
  useEffect(() => {
    if (status === 'loading') return; // 세션 로딩 중

    if (!session) {
      router.push('/auth/signin?callbackUrl=/notifications');
    }
  }, [session, status, router]);

  // 로딩 상태 표시
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 로그인하지 않은 경우 빈 화면 (리디렉션 대기)
  if (!session) {
    return null;
  }

  return (
    <>
      <NotificationSettings/>
      <NotificationHistory/>
    </>
  );
}