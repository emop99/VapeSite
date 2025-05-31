import Layout from '../components/Layout';
import '../styles/globals.css';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';
import Script from 'next/script';
import * as gtag from '../lib/gtag';

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

  // Google Analytics 페이지 뷰 추적
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <>
      {/* Google Tag Manager - Global base code */}
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
      />
      <Script
        id="gtag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtag.GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Script
        id="google-ads"
        strategy="afterInteractive"
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4259248617155600`}
        crossorigin={`anonymous`}>
      </Script>
      <SessionProvider session={pageProps.session}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SessionProvider>
    </>
  );
}

export default MyApp;
