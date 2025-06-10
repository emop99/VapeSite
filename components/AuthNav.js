import {signOut, useSession} from 'next-auth/react';
import Link from 'next/link';
import {FaHeart} from 'react-icons/fa';

export default function AuthNav() {
  const {data: session, status} = useSession();

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

        <span className="text-sm text-goblin-light">
          <span className="font-medium">{session.user.name}</span> 님
        </span>
        <button
          onClick={() => signOut({callbackUrl: '/'})}
          className="text-sm bg-accent text-white px-3 py-1 rounded hover:bg-goblin-dark transition-colors"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Link href="/auth/signin" className="text-sm bg-accent text-white px-3 py-1 rounded hover:bg-goblin-dark transition-colors">
        로그인
      </Link>
      <Link href="/auth/signup"
            className="text-sm border border-goblin-light text-goblin-light px-3 py-1 rounded hover:bg-goblin-dark hover:text-white hover:border-goblin-dark transition-colors">
        회원가입
      </Link>
    </div>
  );
}
