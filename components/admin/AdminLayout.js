import {useState} from 'react';
import {signOut, useSession} from 'next-auth/react';
import {useRouter} from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import Image from 'next/image';
import {FiActivity, FiBarChart2, FiBox, FiGlobe, FiLogOut, FiMenu, FiShoppingBag, FiUser, FiUsers} from 'react-icons/fi';

// 어드민 레이아웃 컴포넌트
const AdminLayout = ({children, title = '관리자 페이지 - 쥬스고블린'}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const {data: session, status} = useSession();
  const router = useRouter();

  // 현재 활성화된 메뉴 항목 확인
  const isActive = (path) => {
    return router.pathname === path || router.pathname.startsWith(`${path}/`);
  };

  // 로딩 중이거나 인증되지 않은 경우
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Head>
        <title>{title}</title>
        <meta name="description" content="쥬스고블린 관리자 페이지"/>
        <link rel="icon" href="/favicon.ico"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <meta name="robots" content="noindex, nofollow"/>
      </Head>

      {/* 사이드바 */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-goblin-dark text-white shadow-lg transition-all duration-300 overflow-hidden fixed h-full z-20`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          <div className={`${!sidebarOpen && 'hidden'} flex items-center space-x-2`}>
            <Image
              src={`${process.env.NEXT_PUBLIC_SITE_URL}/image/juicegoblin_bi.png`}
              alt="쥬스고블린"
              width={40}
              height={40}
              className="rounded-md"
            />
            <span className="text-xl font-semibold">관리자</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-700 focus:outline-none"
            aria-label="토글 사이드바"
          >
            <FiMenu className="h-6 w-6 text-white"/>
          </button>
        </div>

        <nav className="mt-6">
          <div className="px-4 py-2 text-xs text-gray-400 uppercase">
            {sidebarOpen && '메인 메뉴'}
          </div>

          <Link href="/admin"
                className={`flex items-center px-4 py-3 ${router.pathname === '/admin' ? 'bg-goblin-light text-white font-bold' : 'text-gray-300 hover:bg-goblin-light'}`}>
            <FiBarChart2 className="h-5 w-5"/>
            {sidebarOpen && <span className="ml-3">대시보드</span>}
          </Link>

          <Link href="/admin/products"
                className={`flex items-center px-4 py-3 ${isActive('/admin/products') ? 'bg-goblin-light text-white font-bold' : 'text-gray-300 hover:bg-goblin-light'}`}>
            <FiBox className="h-5 w-5"/>
            {sidebarOpen && <span className="ml-3">상품 관리</span>}
          </Link>

          <Link href="/admin/manufacturers"
                className={`flex items-center px-4 py-3 ${isActive('/admin/manufacturers') ? 'bg-goblin-light text-white font-bold' : 'text-gray-300 hover:bg-goblin-light'}`}>
            <FiShoppingBag className="h-5 w-5"/>
            {sidebarOpen && <span className="ml-3">제조사 관리</span>}
          </Link>

          <Link href="/admin/seller-sites"
                className={`flex items-center px-4 py-3 ${isActive('/admin/seller-sites') ? 'bg-goblin-light text-white font-bold' : 'text-gray-300 hover:bg-goblin-light'}`}>
            <FiGlobe className="h-5 w-5"/>
            {sidebarOpen && <span className="ml-3">판매 사이트 관리</span>}
          </Link>

          <Link href="/admin/users"
                className={`flex items-center px-4 py-3 ${isActive('/admin/users') ? 'bg-goblin-light text-white font-bold' : 'text-gray-300 hover:bg-goblin-light'}`}>
            <FiUsers className="h-5 w-5"/>
            {sidebarOpen && <span className="ml-3">회원 관리</span>}
          </Link>

          <Link href="/admin/crawler-logs"
                className={`flex items-center px-4 py-3 ${isActive('/admin/crawler-logs') ? 'bg-goblin-light text-white font-bold' : 'text-gray-300 hover:bg-goblin-light'}`}>
            <FiActivity className="h-5 w-5"/>
            {sidebarOpen && <span className="ml-3">크롤링 기록</span>}
          </Link>
        </nav>

        {/* 하단 사용자 정보 */}
        {sidebarOpen && (
          <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
            <div className="flex items-center">
              <div className="bg-gray-600 rounded-full p-2">
                <FiUser className="h-5 w-5 text-white"/>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{session?.user?.name || '관리자'}</p>
                <p className="text-xs text-gray-400">{session?.user?.email}</p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* 메인 컨텐츠 */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* 상단 네비게이션 바 */}
        <header className="bg-white shadow-sm py-3 px-6 fixed w-full z-10" style={{width: `calc(100% - ${sidebarOpen ? '16rem' : '5rem'})`}}>
          <div className="flex items-center justify-between">
            {/* 제목 및 경로 */}
            <div className="flex items-center space-x-6">
              <h1 className="text-xl font-semibold text-gray-800">
                {router.pathname === '/admin' && '대시보드'}
                {router.pathname.startsWith('/admin/products') && '상품 관리'}
                {router.pathname.startsWith('/admin/manufacturers') && '제조사 관리'}
                {router.pathname.startsWith('/admin/users') && '회원 관리'}
                {router.pathname.startsWith('/admin/settings') && '시스템 설정'}
              </h1>
            </div>

            {/* 사용자 메뉴 */}
            <div className="flex items-center">
              <div className="relative">
                <button
                  className="flex items-center text-sm focus:outline-none"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                >
                  <span className="mx-2">{session?.user?.name || '관리자'}</span>
                  <div className="bg-gray-200 h-8 w-8 rounded-full flex items-center justify-center">
                    <FiUser className="h-5 w-5 text-gray-600"/>
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link href="/" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      메인 사이트
                    </Link>

                    <button
                      onClick={() => signOut({callbackUrl: '/'})}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                    >
                      <div className="flex items-center">
                        <FiLogOut className="mr-2"/>
                        로그아웃
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 페이지 콘텐츠 */}
        <main className="pt-20 p-6">
          {children}
        </main>

        {/* 푸터 */}
        <footer className="bg-white border-t border-gray-200 p-4 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} 쥬스고블린 어드민. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
