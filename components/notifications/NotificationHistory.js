import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNotification} from '../../contexts/NotificationContext';
import {formatDistanceToNow} from 'date-fns';
import {ko} from 'date-fns/locale';
import {FaCheck, FaCheckDouble, FaComment, FaEye, FaHeart, FaReply} from 'react-icons/fa';

export default function NotificationHistory() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loadMoreNotifications
  } = useNotification();

  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const scrollRef = useRef(null);

  // 알림 타입별 아이콘 및 색상
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'comment':
        return <FaComment className="text-blue-500"/>;
      case 'like':
        return <FaHeart className="text-red-500"/>;
      case 'reply':
        return <FaReply className="text-green-500"/>;
      default:
        return <FaEye className="text-gray-500"/>;
    }
  };

  // 알림 타입별 메시지 생성
  const getNotificationMessage = (notification) => {
    const senderName = notification.Sender?.nickName || '알 수 없는 사용자';
    const postTitle = notification.Post?.title ?
      `"${notification.Post.title.length > 20 ? notification.Post.title.substring(0, 20) + '...' : notification.Post.title}"` :
      '게시글';

    switch (notification.type) {
      case 'comment':
        return `${senderName}님이 ${postTitle}에 댓글을 작성했습니다.`;
      case 'like':
        return `${senderName}님이 ${postTitle}를 좋아합니다.`;
      case 'reply':
        return `${senderName}님이 회원님의 댓글에 답글을 작성했습니다.`;
      default:
        return notification.content || '새로운 알림이 있습니다.';
    }
  };

  // 시간 포맷팅
  const formatTime = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, {addSuffix: true, locale: ko});
    } catch (error) {
      return '방금 전';
    }
  };

  // 알림 클릭 핸들러
  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // URL이 있으면 이동
    if (notification.url) {
      window.location.href = notification.url;
    }
  };

  // 모든 알림 읽음 처리
  const handleMarkAllAsRead = async () => {
    setIsLoading(true);
    await markAllAsRead();
    setIsLoading(false);
  };

  // 무한 스크롤을 위한 더 많은 알림 로드
  const handleLoadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    const nextPage = currentPage + 1;
    const result = await loadMoreNotifications(nextPage);

    if (result) {
      setCurrentPage(nextPage);
      setHasMore(nextPage < result.totalPages);
    } else {
      setHasMore(false);
    }
    setIsLoading(false);
  }, [isLoading, hasMore, currentPage, loadMoreNotifications]);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isLoading || !hasMore) return;

    const {scrollTop, scrollHeight, clientHeight} = scrollRef.current;

    // 스크롤이 바닥에서 100px 이내에 도달하면 더 로드
    if (scrollHeight - scrollTop - clientHeight < 100) {
      handleLoadMore();
    }
  }, [handleLoadMore, isLoading, hasMore]);

  // 스크롤 이벤트 리스너 등록
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    // 스크롤 이벤트에 throttle 적용 (성능 최적화)
    let timeoutId = null;
    const throttledHandleScroll = () => {
      if (timeoutId) return;
      timeoutId = setTimeout(() => {
        handleScroll();
        timeoutId = null;
      }, 100);
    };

    scrollElement.addEventListener('scroll', throttledHandleScroll);

    return () => {
      scrollElement.removeEventListener('scroll', throttledHandleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [handleScroll]);

  // 필터링된 알림 목록
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">알림 내역</h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* 필터 버튼 */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === 'unread'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              읽지 않음 {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              onClick={() => setFilter('read')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === 'read'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              읽음
            </button>
          </div>

          {/* 모두 읽음 처리 버튼 */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
            >
              <FaCheckDouble/>
              모두 읽음
            </button>
          )}
        </div>
      </div>

      {/* 알림 목록 - 무한 스크롤 컨테이너 */}
      <div
        ref={scrollRef}
        className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto"
        style={{scrollbarWidth: 'thin'}}
      >
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FaEye className="mx-auto text-4xl mb-4 opacity-50"/>
            <p className="text-lg">
              {filter === 'unread' ? '읽지 않은 알림이 없습니다.' :
                filter === 'read' ? '읽은 알림이 없습니다.' :
                  '알림이 없습니다.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`
                p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md
                ${notification.isRead
                ? 'bg-white border-gray-200 hover:bg-gray-50'
                : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
              }
              `}
            >
              <div className="flex items-start gap-3">
                {/* 알림 아이콘 */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* 알림 내용 */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 leading-relaxed">
                    {getNotificationMessage(notification)}
                  </p>

                  {/* 댓글 내용 미리보기 */}
                  {notification.Comment?.content && (
                    <p className="text-xs text-gray-600 mt-1 bg-gray-100 p-2 rounded italic">
                      &quot;{notification.Comment.content.length > 50
                      ? notification.Comment.content.substring(0, 50) + '...'
                      : notification.Comment.content}&quot;
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>

                {/* 읽음/읽지않음 표시 */}
                <div className="flex-shrink-0">
                  {notification.isRead ? (
                    <FaCheck className="text-gray-400 text-sm"/>
                  ) : (
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* 무한 스크롤 로딩 인디케이터 */}
        {isLoading && filteredNotifications.length > 0 && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-500">더 많은 알림을 불러오는 중...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}