import {NextResponse} from 'next/server';
import {getToken} from 'next-auth/jwt';

// 미들웨어 함수 정의
export async function middleware(request) {
  // 요청 경로 가져오기
  const path = request.nextUrl.pathname;

  // 요청이 어드민 페이지인지 확인
  const isAdminPage = path.startsWith('/admin');

  // 어드민 페이지가 아니라면 그냥 통과
  if (!isAdminPage) {
    return NextResponse.next();
  }

  // JWT 토큰 가져오기 (세션 정보 포함)
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET
  });

  // 인증되지 않은 사용자라면 로그인 페이지로 리디렉션
  if (!token) {
    const url = new URL('/auth/signin', `${process.env.NEXT_PUBLIC_SITE_URL}${request.nextUrl.pathname}`);
    url.searchParams.set('callbackUrl', encodeURI(`${process.env.NEXT_PUBLIC_SITE_URL}${request.nextUrl.pathname}`));
    return NextResponse.redirect(url);
  }

  // 어드민 권한이 아니라면 (grade가 'ADMIN'이 아니라면) 메인 페이지로 리디렉션
  // grade 값은 실제 DB 구조에 따라 변경 필요
  if (token.grade !== 'ADMIN') {
    return NextResponse.redirect(new URL('/', `${process.env.NEXT_PUBLIC_SITE_URL}${request.nextUrl.pathname}`));
  }

  // 어드민 권한이 확인되면 요청 허용
  return NextResponse.next();
}

// 미들웨어가 적용될 경로 설정
export const config = {
  // admin으로 시작하는 경로에만 미들웨어 적용
  matcher: '/admin/:path*',
};
