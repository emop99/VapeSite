import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import AuthNav from './AuthNav';

// 레이아웃 컴포넌트
export default function Layout({ children, title = '쥬스고블린' }) {
  const router = useRouter();

  // 현재 경로에 따라 네비게이션 링크 활성화 여부 결정
  const isActive = (path) => {
    return router.pathname === path ? 'text-accent font-bold' : '';
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Head>
        <title>{title}</title>
        <meta name="description" content="쥬스고블린에 오신 것을 환영합니다. 최고의 베이핑 제품을 만나보세요."/>
        <meta name="keywords" content="쥬스고블린, 베이핑, 전자담배, 입호흡, 폐호흡, 액상"/>
        <link rel="icon" href="/favicon.ico" sizes="any"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website"/>
        <meta property="og:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}${router.asPath}`}/>
        <meta property="og:title" content={title}/>
        <meta property="og:description" content="쥬스고블린에 오신 것을 환영합니다. 최고의 베이핑 제품을 만나보세요."/>
        <meta property="og:image" content={`${process.env.NEXT_PUBLIC_SITE_URL}/image/juicegoblin_bi.png`}/>

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image"/>
        <meta property="twitter:url" content={`${process.env.NEXT_PUBLIC_SITE_URL}${router.asPath}`}/>
        <meta property="twitter:title" content={title}/>
        <meta property="twitter:description" content="쥬스고블린에 오신 것을 환영합니다. 최고의 베이핑 제품을 만나보세요."/>
        <meta property="twitter:image" content={`${process.env.NEXT_PUBLIC_SITE_URL}/image/juicegoblin_bi.png`}/>

        {/* Additional SEO tags */}
        <meta name="robots" content="index, follow"/>
        <meta name="language" content="Korean"/>
        <meta name="author" content="쥬스고블린"/>
      </Head>

      {/* 헤더 - 고블린 테마 적용 */}
      <header className="bg-goblin-dark text-white shadow-md border-b-2 border-goblin-light">
        <div className="container py-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            {/* 로고 및 브랜드명 */}
            <Link href="/" className="flex items-center space-x-2">
              <Image 
                src="/image/juicegoblin_bi.png" 
                alt="쥬스고블린" 
                width={80}
                height={20}
                priority
                className="drop-shadow-md"
              />
              <span className="font-cursive text-3xl text-accent drop-shadow-sm inline md:hidden">JuiceGoblin</span>
            </Link>

            {/* 네비게이션 - 고블린 테마 적용 */}
            <div className="flex items-center justify-between w-full">
              <nav className="flex items-center space-x-6">
                <Link href="/mouth-inhalation" className={`${isActive('/mouth-inhalation')} hover:text-accent text-goblin-light font-medium`}>
                  입호흡
                </Link>
                <Link href="/lung-inhalation" className={`${isActive('/lung-inhalation')} hover:text-accent text-goblin-light font-medium`}>
                  폐호흡
                </Link>
              </nav>

              {/* 인증 네비게이션 */}
              {/*<AuthNav />*/}
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
              <p className="mb-2 text-goblin-light">쥬스고블린 공식 사이트</p>
              <p className="text-sm text-goblin-light opacity-80">© 2025 쥬스고블린. All rights reserved.</p>
            </div>

            <div className="hidden md:block">
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
