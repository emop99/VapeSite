import Layout from '../components/Layout';
import '../styles/globals.css';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// 앱 컴포넌트
function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // 스크롤 위치 관리
  useEffect(() => {
    // 페이지 변경 시 스크롤 위치 저장
    const handleRouteChangeStart = (url) => {
      // 현재 페이지가 입호흡 또는 폐호흡 페이지인 경우에만 스크롤 위치 저장
      if (router.pathname === '/lung-inhalation' || router.pathname === '/mouth-inhalation') {
        const scrollPosition = window.scrollY;
        localStorage.setItem(`scrollPosition_${router.pathname}`, scrollPosition.toString());
      }
    };

    // 페이지 로드 시 저장된 스크롤 위치로 복원
    const handleRouteChangeComplete = (url) => {
      // 입호흡 또는 폐호흡 페이지로 돌아온 경우에만 스크롤 위치 복원
      if (url === '/lung-inhalation' || url === '/mouth-inhalation') {
        const savedPosition = localStorage.getItem(`scrollPosition_${url}`);
        if (savedPosition) {
          setTimeout(() => {
            window.scrollTo(0, parseInt(savedPosition));
          }, 0);
        }
      }
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router]);

  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
