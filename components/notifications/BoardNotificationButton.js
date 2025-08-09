import React, {useEffect, useState} from 'react';
import {useSession} from 'next-auth/react';
import {FaBell} from "react-icons/fa";

const BoardNotificationButton = ({boardId, boardName}) => {
  const {data: session} = useSession();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // 현재 게시판의 알림 설정 조회
  const fetchBoardPreference = async () => {
    if (!session) return;

    try {
      const response = await fetch('/api/notifications/board/preferences');
      if (response.ok) {
        const data = await response.json();
        const boardPref = data.preferences?.find(p => p.boardId === boardId);
        setIsEnabled(boardPref?.enabled !== false); // 기본값은 true
      }
    } catch (error) {
      console.error('게시판 알림 설정 조회 오류:', error);
    }
  };

  // 알림 설정 토글
  const toggleNotification = async () => {
    if (!session) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      setIsLoading(true);
      const newEnabled = !isEnabled;

      const response = await fetch('/api/notifications/board/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boardId,
          enabled: newEnabled
        }),
      });

      if (response.ok) {
        setIsEnabled(newEnabled);
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 2000);
      } else {
        throw new Error('설정 변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('알림 설정 변경 오류:', error);
      alert('설정 변경에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardPreference();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, boardId]);

  if (!session) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={toggleNotification}
        disabled={isLoading}
        className={`
          flex items-center px-4 py-2 rounded-md font-medium text-sm transition-all duration-200
          ${isEnabled
          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
          border border-gray-200
        `}
        title={`${boardName} 게시판 알림 ${isEnabled ? '끄기' : '켜기'}`}
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
        ) : (
          <FaBell className="text-xl md:text-lg"/>
        )}

        <span>
          {isEnabled ? '알림 ON' : '알림 OFF'}
        </span>
      </button>

      {/* 토글 완료 툴팁 */}
      {showTooltip && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md whitespace-nowrap z-10">
          {isEnabled ? '알림이 켜졌습니다' : '알림이 꺼졌습니다'}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default BoardNotificationButton;