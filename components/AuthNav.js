import {signOut, useSession} from 'next-auth/react';
import Link from 'next/link';
import {FaChevronDown, FaCog, FaHeart, FaSignOutAlt, FaUser} from 'react-icons/fa';
import {useEffect, useRef, useState} from 'react';
import {useRouter} from 'next/router';

export default function AuthNav() {
  const {data: session, status} = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // 드롭다운 외부 클릭 시 메뉴 닫기
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        {/* 찜 목록 버튼 */}
        <Link
          href="/wishlist"
          className="text-goblin-light hover:text-accent transition-colors"
          aria-label="찜 목록 보기"
        >
          <FaHeart className="text-xl"/>
        </Link>

        {/* 회원 드롭다운 메뉴 - 새롭게 디자인 개선 */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center text-goblin-light hover:text-accent transition-all duration-200 ease-in-out rounded-full px-2 py-1 hover:bg-gray-100"
            aria-haspopup="true"
            aria-expanded={isMenuOpen}
          >
            <div className="flex items-center justify-center bg-goblin-light text-white rounded-full w-8 h-8 mr-2">
              <FaUser className="text-sm"/>
            </div>
            <span className="hidden sm:inline text-sm font-medium">{session.user.name} 님</span>
            <FaChevronDown className={`ml-1 text-xs transform transition-transform duration-300 ${isMenuOpen ? 'rotate-180' : ''}`}/>
          </button>

          {isMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-lg shadow-lg py-2 z-10 border border-gray-100 overflow-hidden transform transition-all duration-200 ease-in-out opacity-100 scale-100"
              style={{boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'}}>
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">안녕하세요</p>
                <p className="text-sm text-gray-500 truncate">{session.user.name} 님</p>
              </div>

              <Link href="/profile"
                    className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-colors duration-200">
                <FaUser className="mr-3 text-goblin-light"/>
                <span>회원 정보 수정</span>
              </Link>

              {session.user.grade === 'ADMIN' && (
                <Link href="/admin"
                      target="_blank"
                      className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 transition-colors duration-200">
                  <FaCog className="mr-3 text-goblin-light"/>
                  <span>어드민 페이지</span>
                </Link>
              )}

              <button
                onClick={() => signOut({callbackUrl: '/'})}
                className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-colors duration-200"
              >
                <FaSignOutAlt className="mr-3"/>
                <span>로그아웃</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 비로그인 상태일 때 회원 아이콘 클릭 시 로그인 페이지로 이동
  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => router.push('/auth/signin')}
        className="flex items-center justify-center bg-goblin-light text-white rounded-full w-8 h-8 hover:bg-accent transition-colors duration-200"
        aria-label="로그인"
      >
        <FaUser className="text-sm"/>
      </button>
    </div>
  );
}
