import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { IoSend, IoClose, IoChatbubbles, IoShieldCheckmark, IoArrowDown } from 'react-icons/io5';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

const ChatWindow = ({ isOpen, onClose, socket, messages, guestNick, isLoading, scrollToBottom }) => {
  const { data: session } = useSession();
  const [newMessage, setNewMessage] = useState('');
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [showNewMessageNotify, setShowNewMessageNotify] = useState(false);
  const messagesEndRef = useRef(null);
  const scrollRef = useRef(null);

  const handleAgree = () => {
    setHasAgreed(true);
  };

  // 스크롤 위치 감지
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // 바닥 근처에 있으면 (오차 범위 50px)
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsAtBottom(atBottom);
    if (atBottom) {
      setShowNewMessageNotify(false);
    }
  };

  // 초기 오픈 시, 약관 동의 시, 및 외부 스크롤 요청 시
  useEffect(() => {
    if (isOpen && hasAgreed) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setIsAtBottom(true);
      setShowNewMessageNotify(false);
    }
  }, [isOpen, hasAgreed, scrollToBottom]);

  // 새 메시지 수신 시 처리
  useEffect(() => {
    if (!isOpen || messages.length === 0 || !hasAgreed) return;

    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      const lastMessage = messages[messages.length - 1];
      const isMe = session?.user?.id === lastMessage.userId;
      if (isMe) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        setShowNewMessageNotify(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, isOpen, hasAgreed]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    const messageData = {
      userId: session?.user?.id || null,
      nickName: session?.user?.nickName || session?.user?.name || guestNick,
      message: newMessage,
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-20 right-4 w-[calc(100%-2rem)] sm:w-96 h-[550px] max-h-[calc(100vh-120px)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden border border-gray-200 dark:border-gray-700 transition-all duration-300 transform ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
      {/* 헤더 */}
      <div className="bg-primary p-3 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-2">
          <IoChatbubbles className="text-xl" />
          <h3 className="font-bold text-lg text-white">전체 채팅</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
          <IoClose className="text-2xl" />
        </button>
      </div>

      {/* 메시지 리스트 */}
      <div className="flex-1 relative overflow-hidden bg-gray-50 dark:bg-gray-900">
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto p-4 space-y-4 scrollbar-hide relative"
        >
          {!hasAgreed ? (
          <div className="absolute inset-0 z-10 bg-gray-50/95 dark:bg-gray-900/95 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <IoShieldCheckmark className="text-3xl text-primary" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">채팅 이용 약관 동의</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              쥬스고블린 익명 채팅 서비스 이용을 위해<br />
              이용 약관에 동의가 필요합니다.<br />
              <Link href="/chat-terms" target="_blank" className="text-sky-300 hover:underline font-medium">
                [약관 상세 보기]
              </Link>
            </p>
            <button
              onClick={handleAgree}
              className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
            >
              동의하고 채팅 시작하기
            </button>
          </div>
        ) : isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            <p>아직 채팅 내역이 없습니다.</p>
            <p className="text-sm">먼저 인사를 건네보세요!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = session?.user?.id === msg.userId || (session?.user?.id === undefined && msg.nickName === guestNick);
            return (
              <div key={msg.id || index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {!isMe && <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{msg.nickName}</span>}
                  <span className="text-[10px] text-gray-400">
                    {format(new Date(msg.createdAt), 'HH:mm', { locale: ko })}
                  </span>
                </div>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm shadow-sm ${
                  isMe 
                    ? 'bg-primary text-white rounded-tr-none' 
                    : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-600'
                }`}>
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
        </div>

        {/* 새 메시지 알림 */}
        {hasAgreed && showNewMessageNotify && (
          <div className="absolute bottom-4 inset-x-0 flex justify-center z-20 pointer-events-none">
            <button 
              onClick={() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
                setShowNewMessageNotify(false);
              }}
              className="pointer-events-auto bg-primary/90 hover:bg-primary text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold flex items-center gap-2 transition-all animate-bounce"
            >
              <IoArrowDown /> 새로운 메시지가 있습니다
            </button>
          </div>
        )}
      </div>

      {/* 입력부 */}
      {hasAgreed && (
        <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2 items-center">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={session ? "메시지를 입력하세요..." : `${guestNick}으로 채팅에 참여하세요...`}
            className="flex-1 bg-gray-100 dark:bg-gray-900 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-primary dark:text-white"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="bg-primary text-white p-2 rounded-full disabled:opacity-50 hover:scale-105 transition-transform shrink-0"
          >
            <IoSend />
          </button>
        </form>
      )}
    </div>
  );
};

export default ChatWindow;
