import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import {useRouter} from 'next/router';
import {useSession} from 'next-auth/react';
import {useEffect, useState, useRef} from 'react';
import AdSense from './AdSense';
import AuthNav from './AuthNav';
import RedDot from './RedDot';

// 레이아웃 컴포넌트
export default function Layout({children, title = '쥬스고블린 | 전자담배 액상 최저가 비교 가격 변동'}) {
  const router = useRouter();
  const {data: session} = useSession();
  const [redDotStatus, setRedDotStatus] = useState({under10k: false, community: false, ranking: false});

  const navRef = useRef(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);

  // GNB 가로 스크롤 시 그라데이션 표시 여부 결정
  const handleScroll = () => {
    if (navRef.current) {
      const {scrollLeft, scrollWidth, clientWidth} = navRef.current;
      setShowLeftGradient(scrollLeft > 0);
      setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  // 레드닷 정보 확인 (세션스토리지 활용)
  useEffect(() => {
    const checkRedDot = async () => {
      try {
        // 세션스토리지에서 캐시된 데이터 확인
        const cachedStatus = sessionStorage.getItem('redDotStatus');
        if (cachedStatus) {
          setRedDotStatus(JSON.parse(cachedStatus));
          return;
        }

        const response = await fetch('/api/common/red-dot');
        if (response.ok) {
          const data = await response.json();
          setRedDotStatus(data);
          // 브라우저 세션 동안 중복 호출 방지를 위해 저장
          sessionStorage.setItem('redDotStatus', JSON.stringify(data));
        }
      } catch (error) {
        console.error('레드닷 확인 중 오류:', error);
      }
    };

    checkRedDot();
  }, []);

  // 좌/우측 배너 스크립트를 배너 컨테이너 내부에 직접 주입
  // Next.js Script 컴포넌트의 body-hoist로 인해 하단에 렌더링되는 문제를 방지합니다.
  useEffect(() => {
    // 창 크기에 따라 배너 표시 제어 (FHD 기준)
    const controlByResolution = () => {
      try {
        const isFHDOrAbove = typeof window !== 'undefined' && window.innerWidth >= 1920;
        const leftBanner = document.getElementById('left-ad-banner');
        const rightBanner = document.getElementById('right-ad-banner');

        if (leftBanner) leftBanner.style.display = isFHDOrAbove ? 'block' : 'none';
        if (rightBanner) rightBanner.style.display = isFHDOrAbove ? 'block' : 'none';
      } catch (_) {
        // noop
      }
    };

    // 초기 1회 적용
    controlByResolution();
    // 리사이즈 이벤트 등록
    if (typeof window !== 'undefined') {
      const onResize = () => controlByResolution();
      window.addEventListener('resize', onResize);
      // cleanup listener
      var cleanupResize = () => window.removeEventListener('resize', onResize);
    }

    // cleanup on unmount
    return () => {
      if (typeof cleanupResize === 'function') cleanupResize();
    };
  }, []);

  // GNB 스크롤 이벤트 등록
  useEffect(() => {
    const nav = navRef.current;
    if (nav) {
      handleScroll();
      nav.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleScroll);
      return () => {
        nav.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
      };
    }
  }, []);

  // 현재 경로에 따라 네비게이션 링크 활성화 여부 결정
  const isActive = (path) => {
    return router.pathname === path ? 'text-accent font-bold' : '';
  };

  return (
      <div className="min-h-screen flex flex-col bg-background">
        {!router.pathname.startsWith('/products/') && !router.pathname.startsWith('/community/post/') ? (
            <Head>
              <title>{title}</title>
              <meta name="description" content="전자담배 액상 가격 비교 사이트, 전자담배 액상 가격비교, 전자담배 폐호흡 액상 가격비교, 전자담배 입호흡 액상 가격비교, 전자담배 인기 액상 정보 등등 다양한 정보를 제공하는 사이트입니다."/>
              <meta name="keywords" content="쥬스고블린, 베이핑, 전자담배, 입호흡, 폐호흡, 액상, 액상최저가, 최저가, 최저가검색, 액상 추천, 액상추천, 전자담배 추천, 전자담배추천, 가격비교, 액상가격비교, 액상 가격비교, 최저가 찾기, 최저가찾기"/>
              <link rel="icon" href="/favicon.ico" sizes="any"/>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

              <meta name="referrer" content="no-referrer-when-downgrade"/>

              {/* PWA 관련 메타 태그 */}
              <link rel="manifest" href="/manifest.json"/>
              <meta name="theme-color" content="#1A3A1A"/>
              <meta name="application-name" content="쥬스고블린"/>
              <meta name="apple-mobile-web-app-capable" content="yes"/>
              <meta name="apple-mobile-web-app-status-bar-style" content="default"/>
              <meta name="apple-mobile-web-app-title" content="쥬스고블린"/>
              <link rel="apple-touch-icon" href="/icons/icon-152x152.png"/>
              <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png"/>
              <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.png"/>
              <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-152x152.png"/>
              <meta name="msapplication-TileColor" content="#1A3A1A"/>
              <meta name="msapplication-TileImage" content="/icons/icon-144x144.png"/>
              <meta name="msapplication-tap-highlight" content="no"/>
              <meta name="mobile-web-app-capable" content="yes"/>
              <link
                  href="/image/no_search_product.png"
                  media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
                  rel="apple-touch-startup-image"
              />
              <link
                  href="/image/no_search_product.png"
                  media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
                  rel="apple-touch-startup-image"
              />
              <link
                  href="/image/no_search_product.png"
                  media="(device-width: 621px) and (device-height: 1104px) and (-webkit-device-pixel-ratio: 3)"
                  rel="apple-touch-startup-image"
              />
              <link
                  href="/image/no_search_product.png"
                  media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
                  rel="apple-touch-startup-image"
              />
              <link
                  href="/image/no_search_product.png"
                  media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)"
                  rel="apple-touch-startup-image"
              />
              <link
                  href="/image/no_search_product.png"
                  media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)"
                  rel="apple-touch-startup-image"
              />

              {/* Open Graph / Facebook */}
              <meta property="og:type" content="website"/>
              <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}${router.asPath}`}/>
              <meta property="og:title" content={title}/>
              <meta property="og:description" content="전자담배 액상 가격 비교 사이트, 전자담배 액상 가격비교, 전자담배 폐호흡 액상 가격비교, 전자담배 입호흡 액상 가격비교, 전자담배 인기 액상 정보 등등 다양한 정보를 제공하는 사이트입니다."/>
              <meta property="og:image" content={`${process.env.NEXT_PUBLIC_SITE_URL}/image/juicegoblin_bi.png`}/>
              <meta property="og:site_name" content={title}/>
              <meta property="og:image:width" content="1024"/>
              <meta property="og:image:height" content="1024"/>
              <meta property="og:locale" content="ko_KR"/>

              {/* Twitter */}
              <meta property="twitter:card" content="summary_large_image"/>
              <meta property="twitter:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}${router.asPath}`}/>
              <meta property="twitter:title" content={title}/>
              <meta property="twitter:description" content="전자담배 액상 가격 비교 사이트, 전자담배 액상 가격비교, 전자담배 폐호흡 액상 가격비교, 전자담배 입호흡 액상 가격비교, 전자담배 인기 액상 정보 등등 다양한 정보를 제공하는 사이트입니다."/>
              <meta property="twitter:image" content={`${process.env.NEXT_PUBLIC_SITE_URL}/image/juicegoblin_bi.png`}/>
              <meta name="twitter:site" content="@juicegoblin"/>

              {/* Additional SEO tags */}
              <meta name="robots" content="index, follow"/>
              <meta name="language" content="Korean"/>
              <meta name="author" content="쥬스고블린"/>
            </Head>
        ) : ``}

        {/* 헤더 - 고블린 테마 적용 */}
        <header className="bg-goblin-dark text-white shadow-md border-b-2 border-goblin-light">
          <div className="container py-4">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                {/* 로고 및 브랜드명 */}
                <Link href="/" className="flex items-center space-x-2">
                  <Image
                      src={`${process.env.NEXT_PUBLIC_SITE_URL}/image/juicegoblin_bi.png`}
                      alt="쥬스고블린"
                      width={80}
                      height={20}
                      priority
                      className="drop-shadow-md"
                  />
                  <span className="font-cursive text-3xl text-accent drop-shadow-sm">JuiceGoblin</span>
                </Link>

                {/* 인증 네비게이션 */}
                <AuthNav/>
              </div>

              {/* 메뉴 네비게이션 */}
              <div className="flex items-center justify-between w-full relative overflow-hidden">
                {/* 좌측 그라데이션 */}
                <div className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-goblin-dark to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showLeftGradient ? 'opacity-100' : 'opacity-0'}`}></div>

                <nav ref={navRef} className="flex items-center space-x-6 whitespace-nowrap scrollbar-hide py-2 overflow-x-auto px-4">
                  <Link href="/under10k" className={`${isActive('/under10k')} hover:text-accent text-goblin-light font-medium flex-shrink-0 relative`}>
                    만원미만
                    {redDotStatus.under10k && <RedDot top="-top-1" right="-right-3" />}
                  </Link>
                  <Link href="/ranking" className={`${isActive('/ranking')} hover:text-accent text-goblin-light font-medium flex-shrink-0 relative`}>
                    랭킹
                    {redDotStatus.ranking && <RedDot top="-top-1" right="-right-3" />}
                  </Link>
                  <Link href="/community/board/free-board" className={`${isActive('/community')} hover:text-accent text-goblin-light font-medium flex-shrink-0 relative`}>
                    커뮤니티
                    {redDotStatus.community && <RedDot top="-top-1" right="-right-3" />}
                  </Link>
                  <Link href="/mouth-inhalation" className={`${isActive('/mouth-inhalation')} hover:text-accent text-goblin-light font-medium flex-shrink-0`}>
                    입호흡
                  </Link>
                  <Link href="/lung-inhalation" className={`${isActive('/lung-inhalation')} hover:text-accent text-goblin-light font-medium flex-shrink-0`}>
                    폐호흡
                  </Link>
                </nav>

                {/* 우측 그라데이션 */}
                <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-goblin-dark to-transparent z-10 pointer-events-none transition-opacity duration-300 ${showRightGradient ? 'opacity-100' : 'opacity-0'}`}></div>
              </div>
            </div>
          </div>
        </header>

        {/* 메인 콘텐츠 - 고블린 테마 적용 */}
        <main className="flex-grow bg-background py-6">
          <div className="container mx-auto px-4">
            {children}
          </div>
        </main>

        {/* PC 전용 좌/우 고정 광고 배너 영역 */}
        {/* 화면 폭이 충분할 때만 노출되도록 lg 기준으로 표시합니다. */}
        <div className="hidden lg:block">
          {/* 좌측 배너 - 화면 중앙 정렬, 스크롤 고정 */}
          <div
              id="left-ad-banner"
              className="fixed left-4 top-1/2 -translate-y-1/2 z-40"
              style={{width: 300}}
              aria-label="left-side-ad"
          >
            {/* Google AdSense: PC_좌측_배너 */}
            <AdSense slot="9700648621" style={{display: 'block', width: 300}} />
          </div>

          {/* 우측 배너 - 화면 중앙 정렬, 스크롤 고정 */}
          <div
              id="right-ad-banner"
              className="fixed right-4 top-1/2 -translate-y-1/2 z-40"
              style={{width: 300}}
              aria-label="right-side-ad"
          >
            <AdSense slot="9833167103" style={{display: 'block', width: 300}} />
          </div>
        </div>

        {/* 푸터 - 고블린 테마 적용 */}
        <footer className="bg-goblin-dark text-white py-8 border-t-2 border-goblin-light">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* 회사 정보 */}
              <div>
                <h3 className="text-xl font-bold mb-8 text-accent">쥬스고블린</h3>
                <p className="mb-2 text-goblin-light">전자담배 액상 최저가 비교 가격 변동 확인 사이트</p>
                <p className="text-sm text-goblin-light opacity-80">© 2025 쥬스고블린. All rights reserved.</p>
              </div>

              {/* 기타 */}
              <div>
                {/*  <h3 className="text-xl font-bold mb-5 text-accent">기타</h3>*/}
                {/*  <ul className="text-goblin-light">*/}
                {/*    <li className="mb-2">*/}
                {/*      <Link href="/terms-of-service" className="hover:text-accent text-goblin-light">*/}
                {/*        서비스 약관*/}
                {/*      </Link>*/}
                {/*    </li>*/}
                {/*    <li className="mb-2">*/}
                {/*      <Link href="/privacy-policy" className="hover:text-accent text-goblin-light">*/}
                {/*        개인정보 처리방침*/}
                {/*      </Link>*/}
                {/*    </li>*/}
                {/*  </ul>*/}
              </div>

              {/* 연락처 */}
              <div>
                <h3 className="text-xl font-bold mb-5 text-accent">연락처</h3>
                <p className="mb-2 text-goblin-light">문의사항이 있으시면 연락주세요.</p>
                <p className="mb-2 text-goblin-light">이메일: juicegoblinofficial@gmail.com</p>
              </div>
            </div>
          </div>
        </footer>
      </div>
  );
}
