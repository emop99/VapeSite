import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import {useRouter} from 'next/router';
import {useSession} from 'next-auth/react';
import AuthNav from './AuthNav';

// 레이아웃 컴포넌트
export default function Layout({ children, title = '쥬스고블린 | 전자담배 액상 최저가 비교 가격 변동' }) {
  const router = useRouter();
  const {data: session} = useSession();

  // 현재 경로에 따라 네비게이션 링크 활성화 여부 결정
  const isActive = (path) => {
    return router.pathname === path ? 'text-accent font-bold' : '';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!router.pathname.startsWith('/products/') && !router.pathname.startsWith('/community/post/') ? (
        <Head>
          <title>{title}</title>
          <meta name="description" content="전자담배 액상 최저가 비교 가격 변동 확인 사이트"/>
          <meta name="keywords" content="쥬스고블린, 베이핑, 전자담배, 입호흡, 폐호흡, 액상, 액상최저가, 최저가, 최저가검색, 액상 추천, 액상추천, 전자담배 추천, 전자담배추천, 가격비교, 액상가격비교, 액상 가격비교, 최저가 찾기, 최저가찾기"/>
          <link rel="icon" href="/favicon.ico" sizes="any"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

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
          <meta property="og:description" content="전자담배 액상 최저가 비교 가격 변동 확인 사이트"/>
          <meta property="og:image" content={`${process.env.NEXT_PUBLIC_SITE_URL}/image/juicegoblin_bi.png`}/>
          <meta property="og:site_name" content={title}/>

          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image"/>
          <meta property="twitter:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}${router.asPath}`}/>
          <meta property="twitter:title" content={title}/>
          <meta property="twitter:description" content="전자담배 액상 최저가 비교 가격 변동 확인 사이트"/>
          <meta property="twitter:image" content={`${process.env.NEXT_PUBLIC_SITE_URL}/image/juicegoblin_bi.png`}/>

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
            <div className="flex items-center justify-between w-full">
              <nav className="flex items-center space-x-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <Link href="/mouth-inhalation" className={`${isActive('/mouth-inhalation')} hover:text-accent text-goblin-light font-medium flex-shrink-0`}>
                  입호흡
                </Link>
                <Link href="/lung-inhalation" className={`${isActive('/lung-inhalation')} hover:text-accent text-goblin-light font-medium flex-shrink-0`}>
                  폐호흡
                </Link>
                <Link href="/ranking" className={`${isActive('/ranking')} hover:text-accent text-goblin-light font-medium flex-shrink-0`}>
                  랭킹
                </Link>
                <Link href="/community" className={`${isActive('/community')} hover:text-accent text-goblin-light font-medium flex-shrink-0`}>
                  커뮤니티
                </Link>
              </nav>
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
