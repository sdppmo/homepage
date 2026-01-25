# 송도파트너스 홈페이지

K-COL 철골기둥 설계 플랫폼 기업 웹사이트입니다.

**Live:** https://kcol.kr  
**Beta:** https://beta.kcol.kr

---

## 기술 스택

- **Framework:** Next.js 15 (App Router)
- **Runtime:** Bun
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Auth:** Supabase Auth
- **Database:** Supabase (PostgreSQL)
- **Deployment:** AWS Lightsail Container Service

---

## 빠른 시작

```bash
# 의존성 설치
bun install

# 개발 서버 실행
bun run dev

# 브라우저에서 확인
open http://localhost:3000
```

### Docker로 로컬 테스트

```bash
# 로컬 테스트 (Docker 필요)
./deploy.sh --local

# 브라우저에서 확인
open http://localhost:3000

# 테스트 종료
./deploy.sh --stop
```

---

## 배포

```bash
# AWS Lightsail로 배포 (보안 스캔 포함)
./deploy.sh

# 빠른 배포 (보안 스캔 생략)
./deploy.sh --quick
```

배포 전 필요사항:
- Docker Desktop 실행 중
- AWS CLI 설치 및 `aws configure` 완료
- IAM 사용자에 `AmazonLightsailFullAccess` 권한

---

## 프로젝트 구조

```
homepage/
├── src/
│   ├── app/                # Next.js App Router 페이지
│   │   ├── (auth)/         # 인증 페이지 (login, signup, pending)
│   │   ├── (protected)/    # 보호된 페이지 (로그인 필요)
│   │   │   ├── admin/      # 관리자 대시보드
│   │   │   └── k-col/      # K-COL 계산기
│   │   └── api/            # API 라우트
│   ├── components/         # React 컴포넌트
│   ├── lib/                # 유틸리티 함수
│   │   ├── supabase/       # Supabase 클라이언트
│   │   ├── db/             # 데이터베이스 쿼리
│   │   └── calculations/   # 서버사이드 계산 로직
│   └── actions/            # Server Actions
│
├── public/                 # 정적 파일 (이미지, PDF)
├── deploy.sh               # 배포 스크립트
├── Dockerfile              # Docker 빌드 설정
└── next.config.ts          # Next.js 설정
```

---

## deploy.sh 옵션

| 옵션 | 설명 |
|------|------|
| (없음) | 전체 배포: 빌드 → 보안 스캔 → Lightsail 푸시 |
| `--local` | 로컬 테스트만 (AWS 배포 안함) |
| `--stop` | 로컬 컨테이너 중지 및 정리 |
| `--quick` | 보안 스캔 생략 |
| `--build-only` | 이미지 빌드만 |
| `--deploy-only` | 기존 이미지 배포만 |

---

## 개발 명령어

```bash
# 개발 서버
bun run dev

# 타입 체크
bun run typecheck

# 테스트 실행
bun run test

# 프로덕션 빌드
bun run build

# 프로덕션 서버 실행
bun run start
```

---

## 보안

Next.js에 적용된 보호:

- **Security Headers:** X-Frame-Options, CSP, X-Content-Type-Options 등
- **Auth Middleware:** 보호된 페이지 접근 제어
- **Server Actions:** 계산 로직 서버사이드 실행 (클라이언트 노출 방지)
- **Rate Limiting:** API 라우트 요청 제한

테스트:
```bash
# 헤더 확인
curl -I http://localhost:3000/

# 보호된 페이지 테스트 (로그인 없이)
curl -I http://localhost:3000/k-col/calculator  # 302 redirect to /login
```

---

## 환경 변수

`.env.local` 파일 생성:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Optional
RESEND_API_KEY=xxx
ADMIN_ALERT_EMAIL=xxx
CRON_SECRET=xxx
```

---

## 연락처

- **웹사이트:** https://kcol.kr
- **이메일:** sbd_pmo@naver.com
- **주소:** 인천광역시 연수구 컨벤시아대로 42번길 77번지
