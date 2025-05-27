import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';

export default function AuthNav() {
  const { data: session, status } = useSession();

  if (session) {
    return (
      <div className="flex items-center space-x-4">
        <span className="text-sm">
          <span className="font-medium">{session.user.name}</span> 님
        </span>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-sm bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <Link href="/auth/signin" className="text-sm bg-primary text-white px-3 py-1 rounded hover:bg-primary-dark">
        로그인
      </Link>
    </div>
  );
}