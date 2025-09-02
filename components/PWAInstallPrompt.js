import {useEffect, useState} from 'react';
import {FaDownload, FaMobile, FaTimes} from 'react-icons/fa';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // iOS 기기 확인
    const checkIOS = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    };

    setIsIOS(checkIOS());

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); // 기본 설치 프롬프트 방지
      setDeferredPrompt(e);

      // 사용자가 이전에 설치를 거부하지 않았다면 프롬프트 표시
      const dismissedTime = localStorage.getItem('pwa-install-dismissed');
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000; // 24시간

      if (!dismissedTime || (now - parseInt(dismissedTime)) > oneDay) {
        setTimeout(() => setShowPrompt(true), 3000); // 3초 후 표시
      }
    };

    // 앱이 이미 설치되었는지 확인
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // iOS에서는 Safari인지 확인하고 standalone 모드가 아닌 경우에만 표시
    if (checkIOS()) {
      const isInStandaloneMode = window.navigator.standalone === true;
      const isSafari = /safari/.test(navigator.userAgent.toLowerCase()) &&
        !/chrome|crios|fxios/.test(navigator.userAgent.toLowerCase());

      if (!isInStandaloneMode && isSafari) {
        const dismissedTime = localStorage.getItem('pwa-install-dismissed');
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;

        if (!dismissedTime || (now - parseInt(dismissedTime)) > oneDay) {
          setTimeout(() => setShowPrompt(true), 3000);
        }
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // PWA 설치 핸들러
  const handleInstallClick = async () => {
    if (!deferredPrompt && !isIOS) return;

    if (isIOS) {
      // iOS 사용자를 위한 안내만 제공
      setShowPrompt(false);
      return;
    }

    try {
      // 설치 프롬프트 표시
      const result = await deferredPrompt.prompt();

      // 사용자의 선택 확인
      const choiceResult = await deferredPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
      } else {
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error('Error during PWA installation:', error);
    }
  };

  // 프롬프트 닫기
  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  // 하루 동안 보지 않기
  const handleDismissForDay = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-goblin-dark text-white p-4 shadow-lg z-50 animate-slideUp">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 아이콘과 메시지 */}
          <div className="flex items-center space-x-3 flex-1">
            <div className="bg-primary text-white p-2 rounded-lg animate-bounce">
              <FaMobile className="text-xl"/>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-accent text-sm sm:text-base">
                쥬스고블린 앱 설치하기
              </h3>
              <p className="text-goblin-light text-xs sm:text-sm animate-pulse">
                {isIOS
                  ? '공유 버튼을 눌러 "홈 화면에 추가"를 선택하세요'
                  : '앱을 설치하여 더 빠르고 편리하게 이용하세요'
                }
              </p>
            </div>
          </div>

          {/* 버튼들 */}
          <div className="flex items-center space-x-2 ml-4">
            {!isIOS && (
              <button
                onClick={handleInstallClick}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-dark transition-all duration-200 flex items-center space-x-1 hover:scale-105 hover:shadow-lg"
              >
                <FaDownload className="text-xl animate-bounce"/>
                <span className="sm:inline">설치</span>
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="text-accent hover:text-gray-600 transition-all duration-200 p-1 hover:rotate-90"
              aria-label="닫기"
            >
              <FaTimes className="text-lg"/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}