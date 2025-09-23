# JuiceGoblin

전자담배 제품 정보 및 커뮤니티 웹사이트

## 프로젝트 소개

JuiceGoblin은 전자담배 제품 정보 및 최저가 비교 서비스를 제공하는 종합 웹 플랫폼입니다.

사용자들은 다양한 전자담배 제품의 가격을 비교하고, 커뮤니티를 통해 정보를 공유할 수 있습니다.
관리자는 제품 관리, 사용자 관리, 크롤러 관리 등의 기능을 통해 플랫폼을 운영할 수 있습니다.

## 주요 기능

### 사용자 기능

- 제품 검색 및 가격 비교
- 위시리스트 관리
- 커뮤니티 게시판 (글 작성, 댓글, 이미지 업로드)
- 실시간 알림
- 사용자 프로필 관리
- PWA 지원 (모바일 앱처럼 사용 가능)

### 관리자 기능

- 제품 관리 (추가, 수정, 삭제)
- 제조사 관리
- 판매사이트 관리
- 크롤러 로그 관리
- 사용자 관리
- 가격 비교 데이터 관리

### 기술적 특징

- 실시간 소켓 통신 (Socket.IO)
- 웹 푸시 알림
- 이미지 업로드 및 관리
- 검색 엔진 (Elasticsearch)
- 반응형 디자인

## 기술 스택

### 프론트엔드

- React 19.1.0
- Next.js 15.4.7
- Tailwind CSS 3.3.0
- TipTap 에디터 (다양한 확장 기능)
    - @tiptap/extension-color
    - @tiptap/extension-image
    - @tiptap/extension-link
    - @tiptap/extension-text-style
    - @tiptap/extension-youtube
- React Icons 5.5.0
- Swiper 11.2.8
- React Hot Toast (알림)
- Next PWA (Progressive Web App)

### 백엔드
- Next.js API Routes
- MySQL2 3.6.0 (with Sequelize ORM 6.33.0)
- Elasticsearch 9.0.2
- NextAuth.js 4.24.11 (Google OAuth 인증)
- Socket.IO 4.8.1 (실시간 통신)
- Web Push 3.6.7 (푸시 알림)
- Formidable (파일 업로드)
- Date-fns (날짜 처리)

### 개발 도구

- TypeScript 5.2.0
- ESLint
- Cross-env (환경변수 관리)
- PM2 (프로세스 관리)

## 설치 및 실행

### 환경 요구사항

- Node.js 18+
- MySQL 또는 MariaDB
- Elasticsearch

### 설치

```bash
npm install
```

### 환경변수 설정

`.env.local` 파일을 생성하고 다음 환경변수들을 설정하세요:

```
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3002
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 데이터베이스 설정

```bash
# MySQL 데이터베이스 생성 후 DDL.sql 파일 실행
mysql -u username -p database_name < DDL.sql
```

### 개발 서버 실행

```bash
# Next.js 개발 서버 (포트 3002)
npm run dev

# 커스텀 서버 (Express + Socket.IO)
npm run dev:server
```

### 프로덕션 빌드

```bash
npm run build
npm start
```

## 프로젝트 구조

```
VapeSite/
├── components/          # React 컴포넌트
│   ├── admin/          # 관리자 컴포넌트
│   ├── community/      # 커뮤니티 컴포넌트
│   └── notifications/  # 알림 컴포넌트
├── contexts/           # React Context
├── lib/               # 라이브러리 및 유틸리티
├── middleware.js      # Next.js 미들웨어
├── models/            # Sequelize 모델
├── pages/             # Next.js 페이지
│   ├── admin/         # 관리자 페이지
│   ├── api/           # API 라우트
│   ├── auth/          # 인증 페이지
│   ├── community/     # 커뮤니티 페이지
│   ├── products/      # 제품 페이지
│   ├── profile/       # 프로필 페이지
│   └── wishlist/      # 위시리스트 페이지
├── public/            # 정적 파일
├── styles/            # CSS 파일
├── utils/             # 유틸리티 함수
├── DDL.sql           # 데이터베이스 스키마
├── ecosystem.config.js # PM2 설정
└── server.js         # 커스텀 서버
