import Layout from '../components/Layout';
import '../styles/globals.css';
import {useRouter} from 'next/router';
import {useEffect} from 'react';
import {SessionProvider, useSession} from 'next-auth/react';
import * as gtag from '../lib/gtag';
import AdminLayout from '../components/admin/AdminLayout';
import Script from 'next/script';
import {Toaster} from 'react-hot-toast';
import {NotificationProvider} from '../contexts/NotificationContext';
import PWAInstallPrompt from '../components/PWAInstallPrompt';
import GoogleOneTapLogin from '../components/GoogleOneTapLogin';
import ChatFloatingButton from '../components/ChatFloatingButton';

// Google AdSense 컴포넌트
const GoogleAdSense = () => {
  const {data: session, status} = useSession();
  const router = useRouter();

  // 세션 로딩 중이거나 개발 환경, 어드민 경로, 또는 관리자 계정인 경우 AdSense 로드를 제외
  if (
      status === 'loading' ||
      process.env.NODE_ENV === 'development' ||
      router.pathname.startsWith('/admin') ||
      session?.user?.grade === 'ADMIN'
  ) {
    return null;
  }

  return (
      <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4259248617155600"
          crossOrigin="anonymous"
          strategy="afterInteractive"
      />
  );
};

// 앱 컴포넌트
function MyApp({Component, pageProps}) {
  const router = useRouter();

  // Google Analytics 페이지 뷰 추적
  useEffect(() => {
    const handleRouteChange = (url) => {
      // admin 경로는 제외
      if (url.startsWith('/admin')) return;

      // 개발 환경에서는 로깅하지 않음
      if (process.env.NODE_ENV === 'development') {
        console.log(`Logging pageview for ${url}`);
        return;
      }

      gtag.pageview(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
      <>
        {/* Toast 알림 컴포넌트 */}
        <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                style: {
                  background: '#3b8132',
                },
              },
              error: {
                style: {
                  background: '#e53e3e',
                },
              },
            }}
        />

        {/* Google Tag Manager - Global base code */}
        {process.env.NODE_ENV !== 'development' && !router.pathname.startsWith('/admin') ? (
            <>
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
              {/* Microsoft Clarity */}
              <Script
                  id="clarity-init"
                  strategy="afterInteractive"
                  dangerouslySetInnerHTML={{
                    __html: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "v9ybyazg4y");
              `,
                  }}
              />
            </>
        ) : ``}

        {/* PWA 설치 프롬프트 */}
        <PWAInstallPrompt/>

        <SessionProvider session={pageProps.session}>
          <GoogleAdSense/>
          <GoogleOneTapLogin/>
          <NotificationProvider>
            {router.pathname.startsWith('/admin') ?
             <AdminLayout>
               <Component {...pageProps} />
             </AdminLayout> :
             <>
               <Layout>
                 <Component {...pageProps} />
               </Layout>
               <ChatFloatingButton />
             </>
            }
          </NotificationProvider>
        </SessionProvider>
      </>
  );
}

export default MyApp;
