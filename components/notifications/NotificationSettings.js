import React, {useEffect, useState} from 'react';
import {FaBell, FaComment, FaExclamationTriangle, FaHeart, FaLock, FaMobile, FaReply} from 'react-icons/fa';
import {toast} from 'react-hot-toast';

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    commentEnabled: true,
    likeEnabled: true,
    replyEnabled: true,
    emailEnabled: false,
    pushEnabled: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // 설정 로드 및 브라우저 알림 권한 확인
  useEffect(() => {
    fetchSettings();
    checkNotificationPermission();
  }, []);

  // 브라우저 알림 권한 확인
  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    } else {
      setNotificationPermission('denied');
    }
  };

  // 브라우저 알림 권한 요청
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('이 브라우저는 알림을 지원하지 않습니다.');
      return;
    }

    setIsRequestingPermission(true);
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        toast.success('브라우저 알림 권한이 허용되었습니다.');
      } else if (permission === 'denied') {
        toast.error('브라우저 알림 권한이 거부되었습니다. 브라우저 설정에서 수동으로 허용해주세요.');
      }
    } catch (error) {
      console.error('알림 권한 요청 중 오류:', error);
      toast.error('알림 권한 요청 중 오류가 발생했습니다.');
    } finally {
      setIsRequestingPermission(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/notifications/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
      } else {
        toast.error('알림 설정을 불러올 수 없습니다.');
      }
    } catch (error) {
      console.error('알림 설정 조회 오류:', error);
      toast.error('알림 설정을 불러오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (settingKey, value) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [settingKey]: value
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        toast.success('알림 설정이 업데이트되었습니다.');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || '설정 업데이트에 실패했습니다.');
      }
    } catch (error) {
      console.error('설정 업데이트 오류:', error);
      toast.error('설정을 업데이트하는 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggle = (settingKey) => {
    // 브라우저 알림 권한이 거부된 경우 토글 비활성화
    if (notificationPermission !== 'granted') {
      toast.error('브라우저 알림 권한을 먼저 허용해주세요.');
      return;
    }

    const newValue = !settings[settingKey];
    setSettings(prev => ({
      ...prev,
      [settingKey]: newValue
    }));
    updateSetting(settingKey, newValue);
  };

  // 설정 항목이 비활성화되어야 하는지 확인
  const isSettingDisabled = () => {
    return notificationPermission !== 'granted' || isUpdating;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-md shadow-sm border p-3 sm:p-4 mb-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 sm:h-10 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const settingItems = [
    {
      key: 'commentEnabled',
      label: '댓글 알림',
      description: '내 게시글에 댓글이 달렸을 때 알림을 받습니다',
      icon: <FaComment className="text-blue-500 text-sm"/>
    },
    {
      key: 'likeEnabled',
      label: '좋아요 알림',
      description: '내 게시글이나 댓글에 좋아요를 받았을 때 알림을 받습니다',
      icon: <FaHeart className="text-red-500 text-sm"/>
    },
    {
      key: 'replyEnabled',
      label: '답글 알림',
      description: '내 댓글에 답글이 달렸을 때 알림을 받습니다',
      icon: <FaReply className="text-green-500 text-sm"/>
    },
    {
      key: 'pushEnabled',
      label: '푸시 알림',
      description: '브라우저 푸시 알림을 받습니다',
      icon: <FaMobile className="text-orange-500"/>
    }
  ];

  // 권한 상태에 따른 메시지 및 스타일
  const getPermissionInfo = () => {
    switch (notificationPermission) {
      case 'denied':
        return {
          message: '브라우저 알림 권한이 거부되어 알림 설정을 변경할 수 없습니다.',
          subMessage: '브라우저 설정에서 알림 권한을 허용해주세요.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-800',
          icon: <FaLock className="text-red-500 text-sm"/>
        };
      case 'default':
        return {
          message: '브라우저 알림을 받으려면 권한을 허용해주세요.',
          subMessage: '알림 권한을 허용하면 실시간으로 알림을 받을 수 있습니다.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800',
          icon: <FaExclamationTriangle className="text-yellow-500 text-sm"/>
        };
      default:
        return null;
    }
  };

  const permissionInfo = getPermissionInfo();

  return (
    <div className="bg-white max-w-4xl mx-auto p-4">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <FaBell className="text-blue-500 text-sm sm:text-base"/>
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">알림 설정</h2>
      </div>

      {/* 권한 요청 배너 */}
      {permissionInfo && (
        <div className={`${permissionInfo.bgColor} ${permissionInfo.borderColor} border rounded-md p-3 mb-3 sm:mb-4`}>
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {permissionInfo.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-xs sm:text-sm ${permissionInfo.textColor} mb-1`}>
                {permissionInfo.message}
              </p>
              <p className={`text-xs ${permissionInfo.textColor} opacity-80 mb-2`}>
                {permissionInfo.subMessage}
              </p>
              {notificationPermission === 'default' && (
                <button
                  onClick={requestNotificationPermission}
                  disabled={isRequestingPermission}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-xs sm:text-sm rounded-md transition-colors"
                >
                  {isRequestingPermission ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-white"></div>
                      권한 요청 중...
                    </>
                  ) : (
                    <>
                      <FaBell className="text-xs"/>
                      알림 권한 허용하기
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2 sm:space-y-3">
        {settingItems.map((item) => (
          <div
            key={item.key}
            className={`flex items-center justify-between p-2 sm:p-3 rounded-md transition-colors ${
              isSettingDisabled()
                ? 'bg-gray-100 opacity-60'
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0 mt-0.5">
                <div className={isSettingDisabled() ? 'opacity-50' : ''}>
                  {item.icon}
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className={`font-medium text-sm sm:text-base mb-0.5 ${
                  isSettingDisabled() ? 'text-gray-500' : 'text-gray-900'
                }`}>
                  {item.label}
                  {isSettingDisabled() && (
                    <FaLock className="inline ml-1 text-xs text-gray-400"/>
                  )}
                </h3>
                <p className={`text-xs sm:text-sm leading-tight ${
                  isSettingDisabled() ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {isSettingDisabled()
                    ? '브라우저 알림 권한을 허용하면 설정할 수 있습니다.'
                    : item.description
                  }
                </p>
              </div>
            </div>

            <div className="flex-shrink-0 ml-2">
              <button
                onClick={() => handleToggle(item.key)}
                disabled={isSettingDisabled()}
                className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors focus:outline-none disabled:cursor-not-allowed ${
                  isSettingDisabled()
                    ? 'bg-gray-300 focus:ring-gray-300'
                    : `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      settings[item.key] ? 'bg-blue-500' : 'bg-gray-200'
                    }`
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                    settings[item.key] && !isSettingDisabled()
                      ? 'translate-x-5 sm:translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isUpdating && (
        <div className="mt-2 sm:mt-3 flex items-center justify-center">
          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-500"></div>
          <span className="ml-1.5 sm:ml-2 text-xs sm:text-sm text-gray-600">설정 업데이트 중...</span>
        </div>
      )}
    </div>
  );
}