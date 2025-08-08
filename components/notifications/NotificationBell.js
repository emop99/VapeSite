import React from 'react';
import {FaBell} from 'react-icons/fa';
import {useNotification} from '../../contexts/NotificationContext';

export default function NotificationBell({onClick, className = ''}) {
  const {unreadCount} = useNotification();

  return (
    <button
      onClick={onClick}
      className={`relative text-goblin-light hover:text-accent active:text-accent transition-colors p-2 -m-2 min-h-[44px] min-w-[44px] flex items-center justify-center ${className}`}
      aria-label={`알림 내역 보기${unreadCount > 0 ? ` (읽지 않음 ${unreadCount}개)` : ''}`}
      title={`알림${unreadCount > 0 ? ` (${unreadCount}개)` : ''}`}
    >
      <FaBell className="text-xl md:text-lg"/>
      {unreadCount > 0 && (
        <span
          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-[10px] md:text-[9px] leading-none px-1.5 py-0.5 shadow-md min-w-[18px] h-[18px] md:min-w-[16px] md:h-[16px] flex items-center justify-center font-medium">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
