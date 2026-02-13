import React, { useState, useEffect, useRef } from 'react';
import { IoChatbubblesSharp } from 'react-icons/io5';
import ChatWindow from './ChatWindow';
import { useSession } from 'next-auth/react';
import io from 'socket.io-client';

const ChatFloatingButton = () => {
  const { data: session } = useSession();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [guestNick, setGuestNick] = useState('익명');
  const [isLoading, setIsLoading] = useState(true);
  const isChatOpenRef = useRef(isChatOpen);
  const [scrollToBottom, setScrollToBottom] = useState(0);

  // isChatOpen 상태 동기화 및 카운트 초기화
  useEffect(() => {
    isChatOpenRef.current = isChatOpen;
    if (isChatOpen) {
      setUnreadCount(0);
    }
  }, [isChatOpen]);

  // 소켓 연결 및 히스토리 로드
  useEffect(() => {
    // 히스토리 로드
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/chat/history');
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        }
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();

    // 소켓 연결
    const socketInstance = io(process.env.NEXT_PUBLIC_BASE_URL || window.location.origin, {
      withCredentials: true,
    });

    socketInstance.on('connect', () => {
      if (session?.user?.id) {
        socketInstance.emit('authenticate', session.user.id);
      }
      socketInstance.emit('join_chat');
    });

    socketInstance.on('set_nickname', (nick) => {
      setGuestNick(nick);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session?.user?.id]);

  // 새로운 메시지 수신 리스너 (세션 상태 반영을 위해 별도 관리)
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (message) => {
      setMessages((prev) => [...prev, message]);
      
      // 채팅창이 닫혀있고, 본인이 보낸 메시지가 아닐 경우 카운트 증가
      const isMe = session?.user?.id && session.user.id === message.userId;
      if (!isChatOpenRef.current && !isMe) {
        setUnreadCount((prev) => prev + 1);
      } else if (isMe) {
        setScrollToBottom((prev) => prev + 1);
      }
    };

    socket.on('receive_message', handleMessage);
    return () => {
      socket.off('receive_message', handleMessage);
    };
  }, [socket, session?.user?.id]);

  // 세션 상태 변경 시 인증 정보 재전송
  useEffect(() => {
    if (socket && session?.user?.id) {
      socket.emit('authenticate', session.user.id);
    }
  }, [session?.user?.id, socket]);

  return (
    <>
      {/* 플로팅 버튼 */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-20 right-6 h-14 px-5 bg-black text-white rounded-full shadow-2xl flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all z-50 group"
        aria-label="채팅 열기"
      >
        <IoChatbubblesSharp className="text-2xl group-hover:rotate-12 transition-transform" />
        <span className="font-bold whitespace-nowrap">실시간 채팅</span>

        {/* 알림 배지 */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center px-1 z-[51]">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* 채팅창 */}
      <ChatWindow 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        socket={socket}
        messages={messages}
        guestNick={guestNick}
        isLoading={isLoading}
        scrollToBottom={scrollToBottom}
      />
    </>
  );
};

export default ChatFloatingButton;
