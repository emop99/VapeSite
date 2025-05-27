import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Error() {
  const router = useRouter();
  const { error } = router.query;

  const errors = {
    default: '인증 중 오류가 발생했습니다.',
    configuration: '서버 설정 오류가 발생했습니다.',
    accessdenied: '접근 권한이 없습니다.',
    verification: '이메일 인증에 실패했습니다.',
    'signin-required': '이 페이지에 접근하려면 로그인이 필요합니다.',
  };

  const errorMessage = error && errors[error] ? errors[error] : errors.default;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            오류 발생
          </h2>
        </div>
        
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{errorMessage}</span>
        </div>
        
        <div className="flex items-center justify-center">
          <Link href="/auth/signin" className="text-primary hover:text-primary-dark">
            로그인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}