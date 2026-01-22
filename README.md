# 송도파트너스 홈페이지

K-COL 철골기둥 설계 플랫폼 기업 웹사이트입니다.

**Live:** https://kcol.kr

---

## 빠른 시작

```bash
# 로컬 테스트 (Docker 필요)
./deploy.sh --local

# 브라우저에서 확인
open http://localhost:8080

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
├── index.html          # 메인 페이지
├── css/styles.css      # 스타일 (반응형 포함)
├── js/main.js          # 스크립트
├── assets/             # 이미지, PDF
├── pages/              # 하위 페이지들
│
├── deploy.sh           # 배포/테스트 통합 스크립트
├── Dockerfile          # 보안 강화 nginx 이미지
├── nginx.conf          # 프로덕션 nginx 설정
└── docker-compose.yml  # 로컬 Docker 테스트용
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

## 보안

nginx에 적용된 보호:

- **Rate Limiting:** IP당 20 req/s, burst 40
- **연결 제한:** IP당 동시 30개
- **차단 패턴:** path traversal, .php/.git/.env, WordPress 공격, 악성 봇
- **보안 헤더:** X-Frame-Options, CSP, X-Content-Type-Options 등

테스트:
```bash
# 헤더 확인
curl -I http://localhost:8080/

# 차단 경로 테스트
curl -I http://localhost:8080/.git  # 404
```

---

## 로컬 개발 (Docker 없이)

```bash
# Python 사용
python -m http.server 8080

# 또는
./scripts/start-server.sh      # Mac/Linux
scripts/start-server.bat       # Windows
```

---

## 연락처

- **웹사이트:** https://kcol.kr
- **이메일:** sbd_pmo@naver.com
- **주소:** 인천광역시 연수구 컨벤시아대로 42번길 77번지
