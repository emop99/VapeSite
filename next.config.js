/** @type {import('next').NextConfig} */
// 환경에 따라 .env 또는 .env.dev 파일 로드
const path = require('path');
const fs = require('fs');

// 환경 변수 로드 함수
const loadEnvConfig = () => {
  const isDev = process.env.NODE_ENV !== 'production';
  const envFile = isDev ? '.env.dev' : '.env';

  try {
    const envPath = path.resolve(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      const envConfig = require('dotenv').config({ path: envPath });
      return envConfig.parsed;
    }
  } catch (error) {
    console.error(`Error loading ${envFile}:`, error);
  }

  return {};
};

// 환경 변수 로드
const envVars = loadEnvConfig();

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
    DATABASE_URL: envVars.DATABASE_URL || process.env.DATABASE_URL,
  },

  // 국제화 설정 (한국어 기본)
  i18n: {
    locales: ['ko'],
    defaultLocale: 'ko',
  },
};

module.exports = nextConfig;
