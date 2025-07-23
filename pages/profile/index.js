import {useEffect, useState} from 'react';
import {signOut, useSession} from 'next-auth/react';
import {useRouter} from 'next/router';
import Head from 'next/head';

export default function ProfileEdit() {
  const {data: session, status} = useSession();
  const router = useRouter();

  const [formData, setFormData] = useState({
    nickName: '',
  });
  const [originalNickName, setOriginalNickName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 세션 정보가 로드되면 폼 데이터 초기화
  useEffect(() => {
    if (session && session.user) {
      setFormData({
        nickName: session.user.name,
      });
      setOriginalNickName(session.user.name);
    }
  }, [session]);

  // 로그인 상태가 아니면 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
    }
  }, [status, router]);

  const handleChange = (e) => {
    const {name, value} = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    // 닉네임 길이 검증
    if (formData.nickName.length < 2 || formData.nickName.length > 20) {
      setError('닉네임은 2자 이상 20자 이하여야 합니다.');
      return false;
    }

    // 변경사항이 없는 경우
    if (formData.nickName === originalNickName) {
      setError('변경된 내용이 없습니다.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 폼 유효성 검사
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickName: formData.nickName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '프로필 업데이트 중 오류가 발생했습니다.');
      }

      // 프로필 업데이트 성공
      setSuccess('프로필이 성공적으로 업데이트되었습니다.');
      setOriginalNickName(formData.nickName);

      // 세션 갱신을 위해 1.5초 후 로그아웃
      setTimeout(() => {
        signOut({callbackUrl: '/auth/signin'})
      }, 1500);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 중이거나 인증 확인 중일 때
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>회원 정보 수정 - VapeSite</title>
      </Head>
      <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
              회원 정보 수정
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              닉네임을 변경할 수 있습니다.
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{success}</span>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4 rounded-md shadow-sm">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">이메일</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={session.user.email}
                  disabled
                  className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-500 bg-gray-100 ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6"
                />
                <p className="mt-1 text-xs text-gray-500">이메일은 변경할 수 없습니다.</p>
              </div>

              <div>
                <label htmlFor="nickName" className="block text-sm font-medium text-gray-700">닉네임</label>
                <input
                  id="nickName"
                  name="nickName"
                  type="text"
                  autoComplete="nickname"
                  required
                  className="relative block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                  placeholder="닉네임을 입력하세요 (2-20자)"
                  value={formData.nickName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}
              >
                {isLoading ? '처리 중...' : '정보 수정하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}