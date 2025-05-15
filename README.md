# 전자담배 액상 최저가 사이트

Next.js와 MariaDB를 사용한 전자담배 액상 최저가 비교 웹사이트입니다.

## 기술 스택

- **프론트엔드**: Next.js (최신 버전)
- **스타일링**: Tailwind CSS
- **백엔드**: Next.js API Routes
- **데이터베이스**: MariaDB (최신 버전)
- **웹 서버**: Nginx (최신 버전)
- **배포 환경**: Docker

## 시작하기

### 사전 요구사항

- Docker 및 Docker Compose가 설치되어 있어야 합니다.
- Git이 설치되어 있어야 합니다.

### 설치 및 실행

1. 저장소를 클론합니다:

```bash
git clone https://github.com/yourusername/vapesite.git
cd vapesite
```

2. 호스트 파일에 도메인 설정을 추가합니다:
   - Windows: `C:\Windows\System32\drivers\etc\hosts` 파일을 관리자 권한으로 열고 다음 줄을 추가합니다:
     ```
     127.0.0.1 test.com www.test.com
     ```
   - Mac/Linux: `/etc/hosts` 파일을 관리자 권한으로 열고 다음 줄을 추가합니다:
     ```
     127.0.0.1 test.com www.test.com
     ```

3. Docker Compose를 사용하여 애플리케이션을 실행합니다:

```bash
docker-compose up -d
```

4. 브라우저에서 [http://test.com](http://test.com)으로 접속하여 웹사이트를 확인합니다.

## 프로젝트 구조

```
vapesite/
├── components/       # 재사용 가능한 컴포넌트
├── lib/              # 유틸리티 함수 및 데이터베이스 연결
├── models/           # 데이터베이스 모델
├── nginx/            # Nginx 설정 파일
│   └── default.conf  # test.com 도메인 설정
├── pages/            # 페이지 및 API 라우트
│   ├── api/          # API 엔드포인트
│   └── index.js      # 메인 페이지
├── public/           # 정적 파일
├── styles/           # 스타일시트
├── docker-compose.yml # Docker 구성 파일
├── Dockerfile        # Next.js 애플리케이션 Docker 이미지 설정
├── next.config.js    # Next.js 설정
└── package.json      # 프로젝트 의존성
```

## 기능

- 전자담배 액상 제품 목록 조회
- 브랜드, 가격 범위로 필터링
- 가격 및 이름으로 정렬
- 제품 상세 정보 표시
- 판매처 링크 제공

## 스타일링 및 디자인 시스템

이 프로젝트는 Tailwind CSS를 사용하여 일관된 디자인 시스템을 구현했습니다.

### 디자인 컨셉

- **색상 팔레트**: 프로젝트 전체에서 일관된 색상 테마를 사용합니다.
  - Primary: 인디고 색상 (#4F46E5)
  - Secondary: 에메랄드 색상 (#10B981)
  - Accent: 앰버 색상 (#F59E0B)
  - Background: 밝은 회색 배경 (#F9FAFB)
  - Text: 어두운 텍스트 색상 (#1F2937)

- **컴포넌트**: 재사용 가능한 UI 컴포넌트를 정의했습니다.
  - 버튼: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-accent`
  - 카드: `.card`
  - 입력 필드: `.input`
  - 선택 필드: `.select`

### Tailwind CSS 설정

Tailwind CSS 설정은 다음 파일에서 관리됩니다:

- `tailwind.config.js`: 색상, 폰트, 반응형 디자인 등의 테마 설정
- `postcss.config.js`: PostCSS 플러그인 설정
- `styles/globals.css`: 전역 스타일 및 커스텀 컴포넌트 정의

### 레이아웃 시스템

모든 페이지는 `components/Layout.js` 컴포넌트를 통해 일관된 레이아웃을 유지합니다. 이 레이아웃은 다음 요소를 포함합니다:

- 헤더: 로고 및 네비게이션
- 메인 콘텐츠 영역
- 푸터: 사이트 정보 및 링크

### 반응형 디자인

모든 페이지는 다양한 화면 크기에 맞게 최적화되어 있습니다:

- 모바일: 기본 레이아웃
- 태블릿: `sm:` 및 `md:` 접두사 사용 (640px, 768px)
- 데스크톱: `lg:` 및 `xl:` 접두사 사용 (1024px, 1280px)
- 대형 화면: `2xl:` 접두사 사용 (1536px)

## 개발 환경 설정

개발 모드로 실행하려면:

```bash
# 패키지 설치
npm install

# 개발 서버 실행
npm run dev
```

## 데이터베이스 관리

MariaDB 데이터베이스는 Docker 볼륨을 통해 데이터를 유지합니다. 데이터베이스에 직접 접근하려면:

```bash
docker exec -it vapesite-mariadb mysql -u vapeuser -p
# 비밀번호 입력: vapepassword
```

## 도메인 설정

현재 이 프로젝트는 `test.com` 도메인으로 설정되어 있습니다. 이는 개발 및 테스트 목적으로 사용되며, 실제 배포 시 변경될 예정입니다.

### 도메인 접근 방법

1. 호스트 파일에 도메인 매핑을 추가합니다 (설치 및 실행 섹션 참조).
2. 브라우저에서 `http://test.com`으로 접속합니다.

### 도메인 변경 방법

도메인을 변경하려면 다음 파일들을 수정해야 합니다:

1. `nginx/default.conf` 파일에서 `server_name` 지시문을 새 도메인으로 변경:
   ```
   server_name 새도메인.com www.새도메인.com;
   ```

2. `docker-compose.yml` 파일에서 `extra_hosts` 섹션을 새 도메인으로 변경:
   ```
   extra_hosts:
     - "새도메인.com:127.0.0.1"
     - "www.새도메인.com:127.0.0.1"
   ```

3. 호스트 파일에서 도메인 매핑을 새 도메인으로 변경.

## 배포

프로덕션 환경에 배포하려면:

1. 환경 변수를 적절히 설정합니다.
2. 다음 명령어로 배포합니다:

```bash
docker-compose up -d --build
```

### 개발 모드와 프로덕션 모드

- **개발 모드**: 기본적으로 `docker-compose.yml` 파일은 프로덕션 모드로 설정되어 있습니다. 개발 모드로 실행하려면 `docker-compose.yml` 파일에서 다음 부분의 주석을 해제하세요:
  ```yaml
  volumes:
    - ./:/app
    - /app/node_modules
  ```
  그리고 Dockerfile에서 다음과 같이 변경하세요:
  ```dockerfile
  # 프로덕션 빌드
  # RUN npm run build

  # 개발 환경에서 실행
  CMD ["npm", "run", "dev"]
  ```

- **프로덕션 모드**: 프로덕션 모드에서는 Docker 빌드 과정에서 Next.js 애플리케이션이 빌드되고, 컨테이너 내에서 빌드된 파일이 실행됩니다. 이 모드에서는 소스 코드 변경 시 컨테이너를 다시 빌드해야 합니다.

## 라이센스

이 프로젝트는 MIT 라이센스 하에 배포됩니다.
