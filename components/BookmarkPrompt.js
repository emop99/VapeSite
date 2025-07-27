import {useEffect, useState} from 'react';

/**
 * BookmarkPrompt 컴포넌트
 *
 * 사용자가 웹사이트를 즐겨찾기에 추가하도록 유도하며,
 * 브라우저별 안내를 비침습적인 배너로 표시합니다.
 */
export default function BookmarkPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [browserInfo, setBrowserInfo] = useState({
    name: '',
    shortcutKey: '',
    isMobile: false
  });

  useEffect(() => {
    const hasSeenPrompt = localStorage.getItem('bookmarkPromptSeen');
    const lastShownDate = localStorage.getItem('bookmarkPromptLastShown');

    const shouldShow = !hasSeenPrompt ||
      (lastShownDate && (Date.now() - parseInt(lastShownDate)) > 7 * 24 * 60 * 60 * 1000);

    if (shouldShow) {
      detectBrowser();

      const timer = setTimeout(() => {
        setIsVisible(true);
        localStorage.setItem('bookmarkPromptSeen', 'true');
        localStorage.setItem('bookmarkPromptLastShown', Date.now().toString());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const detectBrowser = () => {
    const userAgent = window.navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    let browserName = '';
    let shortcutKey = '';

    if (isMobile) {
      browserName = 'mobile';
      // Mobile browsers typically use a "Add to Home Screen" option
      shortcutKey = '브라우저 메뉴에서 "홈 화면에 추가" 옵션';
    } else {
      // Desktop browser detection
      if (userAgent.indexOf('Chrome') > -1) {
        browserName = 'Chrome';
        shortcutKey = 'Ctrl+D (Windows/Linux) 또는 ⌘+D (Mac)';
      } else if (userAgent.indexOf('Firefox') > -1) {
        browserName = 'Firefox';
        shortcutKey = 'Ctrl+D (Windows/Linux) 또는 ⌘+D (Mac)';
      } else if (userAgent.indexOf('Safari') > -1) {
        browserName = 'Safari';
        shortcutKey = '⌘+D';
      } else if (userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg') > -1) {
        browserName = 'Edge';
        shortcutKey = 'Ctrl+D (Windows) 또는 ⌘+D (Mac)';
      } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) {
        browserName = 'Internet Explorer';
        shortcutKey = 'Ctrl+D';
      } else {
        browserName = '브라우저';
        shortcutKey = 'Ctrl+D 또는 ⌘+D';
      }
    }

    setBrowserInfo({
      name: browserName,
      shortcutKey,
      isMobile
    });
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-goblin-dark text-white p-4 shadow-lg z-50 animate-slideUp">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center mb-3 sm:mb-0">
          <div className="mr-3 text-accent">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"/>
            </svg>
          </div>
          <div>
            <p className="font-medium">쥬스고블린을 즐겨찾기에 추가하세요!</p>
            <p className="text-sm text-goblin-light">
              {browserInfo.isMobile
                ? `${browserInfo.shortcutKey}을 사용하세요.`
                : `${browserInfo.name}에서 ${browserInfo.shortcutKey}를 누르세요.`}
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleDismiss}
            className="bg-transparent hover:bg-white/10 text-white px-3 py-2 rounded-md transition-colors"
          >
            나중에
          </button>
        </div>
      </div>
    </div>
  );
}