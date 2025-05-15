/** @type {import('next').NextConfig} */
const nextConfig = {
  // 리액트 스트릭트 모드 활성화
  reactStrictMode: true,
  
  // 이미지 최적화 설정
  images: {
    domains: ['localhost'],
    // 필요시 외부 이미지 도메인 추가
    // domains: ['localhost', 'example.com'],
  },
  
  // 환경 변수 설정
  env: {
    // 데이터베이스 연결 정보
    DATABASE_URL: process.env.DATABASE_URL,
  },
  
  // 국제화 설정 (한국어 기본)
  i18n: {
    locales: ['ko'],
    defaultLocale: 'ko',
  },
};

module.exports = nextConfig;