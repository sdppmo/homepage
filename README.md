# 송도파트너스 홈페이지

K-COL 철골기둥 설계 플랫폼 - 기업 웹사이트

---

## 📁 프로젝트 구조

```
homepage/
├── assets/
│   └── images/
│       ├── background_vessel_nyc.png   # 메인 배경 이미지
│       ├── product.png                  # 제품 로고 (K-COL, SLIM-BOX 등)
│       └── sdppmo_logo.png             # 회사 로고
├── css/
│   └── styles.css                       # 스타일시트
├── js/
│   └── main.js                          # 자바스크립트
├── pages/
│   └── k-col web software/              # K-COL 계산기 페이지
├── index.html                           # 메인 페이지
├── Dockerfile                           # Docker 이미지 빌드
├── docker-compose.yml                   # 로컬 Docker 테스트
├── nginx.conf                           # 보안 강화 Nginx 설정
├── deploy-lightsail.sh                  # AWS Lightsail 배포 스크립트
├── start-server.bat                     # 로컬 서버 시작 (Windows)
├── start-server.ps1                     # 로컬 서버 시작 (PowerShell)
└── README.md                            # 프로젝트 문서
```

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| **반응형 레이아웃** | 모든 해상도(4K, 1080p 등)에서 화면 전체 채움 |
| **좌측 사이드바** | 네비게이션 메뉴, 로그인 폼, 브로셔 링크 |
| **메인 콘텐츠** | 배경 이미지, 환율 정보, 뉴스 |
| **푸터** | 연락처 정보 및 파트너 로고 |

---

## 🐳 Docker 배포

### 로컬 테스트

```bash
# Docker Compose로 빌드 및 실행
docker-compose up --build

# 브라우저에서 접속
open http://localhost:8080
```

### AWS Lightsail 배포

1. **AWS Lightsail 컨테이너 서비스 생성**
   - [AWS Lightsail Console](https://lightsail.aws.amazon.com/ls/webapp/home/containers) 접속
   - "Create container service" 클릭
   - 리전: `ap-northeast-2` (서울)
   - 용량: Nano (정적 사이트에 적합)
   - 서비스 이름: `songdopartners`

2. **배포 스크립트 설정**
   ```bash
   # deploy-lightsail.sh 편집하여 설정 확인
   SERVICE_NAME="songdopartners"
   AWS_REGION="ap-northeast-2"
   ```

3. **배포 실행**
   ```bash
   ./deploy-lightsail.sh
   ```

4. **HTTPS 설정**
   - Lightsail 콘솔에서 "Custom domains" 클릭
   - 도메인 추가 (예: kcol.kr)
   - SSL 인증서 자동 발급됨

---

## 🛡️ 보안 설정

본 프로젝트는 프로덕션 배포를 위한 보안 강화가 적용되어 있습니다.

### DDoS 및 Rate Limiting

| 보호 | 설정 | 목적 |
|------|------|------|
| 요청 제한 | IP당 10 req/s, burst 20 | 요청 폭주 방지 |
| 연결 제한 | IP당 동시 20개 | 연결 고갈 방지 |
| 타임아웃 | body/header 10s, keepalive 15s | Slowloris 공격 차단 |
| 연결 리셋 | `reset_timedout_connection on` | 리소스 신속 해제 |

### 공격 표면 축소

| 보호 | 차단 대상 |
|------|----------|
| HTTP 메서드 | `GET`, `HEAD`만 허용 (정적 사이트) |
| 경로 탐색 | `../` 패턴 차단 |
| 스크립트 인젝션 | `.php`, `.asp`, `.jsp`, `.cgi` 차단 |
| 설정 파일 | `.git`, `.env`, `.config`, `.yml` 차단 |
| WordPress 공격 | `wp-admin`, `xmlrpc` 차단 |
| 악성 봇 | `nikto`, `sqlmap`, `nmap`, `masscan` 차단 |
| 빈 User-Agent | 거부 |
| 잘못된 Host 헤더 | 연결 종료 (444) |

### 보안 헤더

```
X-Frame-Options: SAMEORIGIN              # 클릭재킹 방지
X-Content-Type-Options: nosniff          # MIME 스니핑 방지
X-XSS-Protection: 1; mode=block          # 레거시 XSS 필터
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
Content-Security-Policy: default-src 'self'; ...
```

### 컨테이너 보안

| 조치 | 구현 |
|------|------|
| 베이스 이미지 고정 | `nginx:1.25-alpine` (latest 미사용) |
| 도구 제거 | 컨테이너에서 `curl`, `wget` 제거 |
| 서버 토큰 | 버전 숨김 (`server_tokens off`) |
| 파일 권한 | 파일 644, 디렉토리 755 |
| 패키지 업데이트 | 빌드 시 `apk upgrade` |

### AWS Lightsail 보안

| 기능 | 이점 |
|------|------|
| **AWS Shield Standard** | 자동 DDoS 보호 (무료 포함) |
| **HTTPS 종료** | 로드밸런서에서 TLS 처리, 인증서 관리 불필요 |
| **Real IP 헤더** | `X-Forwarded-For` 올바르게 파싱 |
| **프라이빗 네트워크** | 컨테이너 직접 노출 안됨 |

### 보안 테스트

```bash
# Rate limiting 테스트 (약 20회 이후 429 반환)
for i in {1..30}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/; done

# 차단된 경로 테스트
curl -I http://localhost:8080/.git          # 404 반환
curl -I http://localhost:8080/../etc/passwd # 403 반환
curl -X POST http://localhost:8080/         # 405 반환

# 보안 헤더 확인
curl -I http://localhost:8080/ | grep -E "(X-Frame|X-Content|Content-Security)"
```

### 추가 권장 사항

1. **AWS WAF (선택)** - 고급 보호를 위해 Lightsail 배포에 AWS WAF 추가:
   - SQL 인젝션 규칙
   - XSS 규칙
   - 지역 차단
   - 봇 제어

2. **CloudWatch 알람** - 모니터링 대상:
   - 비정상적인 4xx/5xx 급증
   - 요청 수 이상 징후
   - CPU/메모리 급증

3. **정기 업데이트** - 월간 컨테이너 재빌드로 nginx 보안 패치 적용:
   ```bash
   docker build --pull --no-cache -t songdopartners-homepage .
   ```

---

## 🚀 로컬 개발

### 방법 1: Docker (권장)

```bash
docker-compose up --build
# http://localhost:8080 접속
```

### 방법 2: 스크립트 실행

`start-server.bat` 파일을 **더블클릭**하면 자동으로 서버가 시작됩니다.

```
========================================
   K-COL Homepage Server Launcher
========================================

[1/2] 기존 8080 포트 프로세스 확인 중...
     완료!

[2/2] 서버 시작 중...

========================================
   서버 주소: http://localhost:8080
   종료하려면 Ctrl+C 를 누르세요
========================================
```

### 방법 3: 수동 실행

```powershell
# Python 사용
cd C:\Users\sbd\sdppmo\homepage
python -m http.server 8080
```

그 후 브라우저에서 `http://localhost:8080` 접속

---

## 🛠 기술 스택

| 분류 | 기술 |
|------|------|
| **마크업** | HTML5 |
| **스타일** | CSS3 (Flexbox, Grid, CSS 변수) |
| **스크립트** | JavaScript ES6+ |
| **웹서버** | Nginx (Alpine) |
| **컨테이너** | Docker |
| **클라우드** | AWS Lightsail Container Service |

---

## 🌐 지원 브라우저

- ✅ Chrome (최신)
- ✅ Firefox (최신)
- ✅ Edge (최신)
- ✅ Safari (최신)

---

## 📞 연락처

| 항목 | 정보 |
|------|------|
| **웹사이트** | http://www.kcol.kr |
| **이메일** | sbd_pmo@naver.com |
| **본사 주소** | 인천광역시 연수구 컨벤시아대로 42번길 77번지 |
| **서울 사무소** | 추후 공개 |
