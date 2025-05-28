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
        <meta name="description" content="쥬스고블린에 오신 것을 환영합니다." />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
                <Link href="/community" className={`${isActive('/community')} hover:text-accent text-goblin-light font-medium`}>
                  커뮤니티
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
