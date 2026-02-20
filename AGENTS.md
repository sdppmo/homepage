# AI Agent Context - SongDoPartners Homepage

> This document provides context for AI agents working on this project.
> Last updated: 2026-02-06

## Project Overview

**Project**: SongDoPartners (SDP) Corporate Homepage
**Purpose**: K-COL Steel Column Design Platform - Corporate website with product information, calculators, and news
**Stack**: Static HTML/CSS/JS served via Nginx in Docker, deployed to AWS Lightsail
**Domain**: https://kcol.kr, https://www.kcol.kr

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Lightsail                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Container Service: sdppmo-container-service-1          │    │
│  │  Region: ap-northeast-2 (Seoul)                         │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  Docker Container (nginx:alpine)                │    │    │
│  │  │  - Port 80 (HTTP)                               │    │    │
│  │  │  - Health check: /health                        │    │    │
│  │  │  - Static files in /usr/share/nginx/html        │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│  ┌───────────────────────────▼───────────────────────────┐      │
│  │  Lightsail Load Balancer                              │      │
│  │  - HTTPS termination (automatic SSL)                  │      │
│  │  - Custom domains: kcol.kr, www.kcol.kr               │      │
│  └───────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  DNS Provider: Gabia (Korean Registrar)                          │
│  Domain: kcol.kr                                                 │
│  kcol.kr      → CNAME → Lightsail endpoint                       │
│  www.kcol.kr  → CNAME → Lightsail endpoint                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
homepage/
├── index.html              # Main homepage
├── css/
│   └── styles.css          # All styles including responsive design
├── js/
│   ├── auth-config.js      # Supabase config (URL, public key)
│   ├── auth.js             # Supabase authentication
│   ├── auth-guard.js       # Page access guard (for protected pages)
│   ├── feature-guard.js    # Permission-based UI access control
│   ├── protected-loader.js # Loads protected pages via Edge Function
│   ├── clocks.js           # World clocks
│   ├── login.js            # Login UI + session state
│   ├── main.js             # Global init + navigation
│   └── modal.js            # Project selection modal
├── assets/
│   ├── images/             # Product logos, backgrounds, partner logos
│   ├── pdf/                # Downloadable brochures
│   └── powerpoint/         # Source slide decks
├── pages/
│   ├── auth/               # Authentication pages
│   │   ├── login.html      # Dedicated login page
│   │   ├── signup.html     # Dedicated signup page
│   │   └── pending.html    # Pending approval page
│   ├── k-col web software/ # K-COL calculator pages
│   │   └── protected/      # Loader shells for protected pages
│   └── K-product/          # Product pages
│
├── supabase/
│   └── functions/
│       ├── serve-protected-page/  # Serves protected HTML with auth check
│       ├── admin-users/           # Admin user management API
│       └── send-admin-alert/      # New user notification emails
│
├── # Docker & Deployment
├── Dockerfile              # Security-hardened nginx:alpine image
├── nginx.conf              # Production nginx config with security headers
├── docker-compose.yml      # Local testing
├── deploy.sh               # Main deployment script (Mac/Linux bash)
├── deploy.bat              # Main deployment script (Windows CMD)
├── .dockerignore           # Excludes sensitive/protected files from Docker
│
├── scripts/
│   ├── start-server.sh         # Local Python server (Mac/Linux)
│   ├── start-server.bat        # Local Python server (Windows)
│   ├── deploy-edge-functions.py
│   └── upload-protected-pages.py
│
├── README.md               # User documentation
├── AGENTS.md               # This file - AI agent context
├── .env.local              # Supabase secrets (git-ignored)
└── .gitignore
```

---

## Deployment Scripts

### Mac/Linux: `deploy.sh`

```bash
./deploy.sh                   # Full: build + security scan + deploy
./deploy.sh --quick           # Skip Trivy security scan (faster)
./deploy.sh --local           # Build + run local server only
./deploy.sh --stop            # Stop local server
./deploy.sh --build-only      # Build Docker image only
./deploy.sh --deploy-only     # Deploy existing image only
./deploy.sh --upload-protected  # Upload protected pages to Supabase
./deploy.sh --deploy-functions  # Deploy Edge Functions to Supabase
```

### Windows: `deploy.bat`

```batch
deploy.bat                    # Full: build + security scan + deploy
deploy.bat -quick             # Skip Trivy security scan (faster)
deploy.bat -local             # Build + run local server only
deploy.bat -stop              # Stop local server
deploy.bat -help              # Show help
```

**Note**: Windows `deploy.bat` is a standalone CMD batch script (not PowerShell).

### Configuration (in scripts)

- `SERVICE_NAME=sdppmo-container-service-1`
- `AWS_REGION=ap-northeast-2`
- `IMAGE_NAME=sdppmo-homepage`
- `LOCAL_PORT=8080`

---

## Quick Reference

| Task | Mac/Linux | Windows |
|------|-----------|---------|
| Full deploy | `./deploy.sh` | `deploy.bat` |
| Quick deploy | `./deploy.sh --quick` | `deploy.bat -quick` |
| Local test | `./deploy.sh --local` | `deploy.bat -local` |
| Stop local | `./deploy.sh --stop` | `deploy.bat -stop` |
| Build only | `./deploy.sh --build-only` | *(use full deploy)* |
| Check status | `aws lightsail get-container-services --service-name sdppmo-container-service-1 --region ap-northeast-2` |
| View logs | `aws lightsail get-container-log --service-name sdppmo-container-service-1 --container-name homepage --region ap-northeast-2` |

---

## Common Tasks

### Deploy Changes to Production

```bash
# Mac/Linux
./deploy.sh

# Windows
deploy.bat
```

That's it. The script handles: pre-flight checks, Docker build, local test, push to Lightsail, and deployment.

### Local Development

```bash
# Mac/Linux
./deploy.sh --local           # Start local server at http://localhost:8080
./deploy.sh --stop            # Stop when done

# Windows
deploy.bat -local
deploy.bat -stop
```

---

## Environment & Prerequisites

### Development Machine
- Docker Desktop (running)
- AWS CLI v2 configured (`aws configure`)

### AWS Configuration
- Region: `ap-northeast-2` (Seoul)
- Required Policy: `AmazonLightsailFullAccess`

### Lightsail Service
- Name: `sdppmo-container-service-1`
- Power: Micro, Scale: 1
- Custom Domains: `kcol.kr`, `www.kcol.kr`
- SSL: Auto-managed by Lightsail
- Endpoint: `https://sdppmo-container-service-1.ja5e8wfj26k0j.ap-northeast-2.cs.amazonlightsail.com/`

### DNS Provider
- Registrar: Gabia (가비아)
- Domain: `kcol.kr`

---

## Recent Changes (2026-01-25)

### Windows Deployment Rewrite
- ✅ Removed `deploy.ps1` (PowerShell had issues with AWS CLI stderr handling and JSON quoting)
- ✅ Rewrote `deploy.bat` as standalone CMD batch script
- ✅ Same functionality as `deploy.sh`: build, test, push, deploy with retry loop
- ✅ Inline JSON with escaped quotes for `--containers` / `--public-endpoint`

### Deployment Flow Improvements
- ✅ Retry loop for `create-container-service-deployment` (4 attempts, 12s delay)
- ✅ Better error messages and status output

---

## Previous Changes (2026-01-22)

### Improved Signup Flow with Auto-Login
- ✅ Credentials stored in `sessionStorage` after signup for auto-login
- ✅ `pending.html` polls `check-email-verified` Edge Function
- ✅ Auto-login after email verification
- ✅ Redirect to home page after successful verification

---

## Previous Changes (2026-01-21)

### Dedicated Auth Pages
- ✅ `/pages/auth/login.html` - standalone login page
- ✅ `/pages/auth/signup.html` - standalone signup page with password validation
- ✅ Removed modal-based authentication from main page

---

## Authentication Flow

### Login Flow
1. User clicks "로그인" → redirects to `/pages/auth/login.html`
2. User enters email/password
3. On success, redirects back to homepage

### Signup Flow
1. User clicks "회원가입" → redirects to `/pages/auth/signup.html`
2. User enters email, password, company info
3. Credentials stored in `sessionStorage` for auto-login
4. Redirects to `/pages/auth/pending.html`
5. Polls for email verification
6. When verified, auto-login and redirect to homepage

### Protected Pages
- **소스(HTML)** : `dev/` 하위 (4개) — `upload-protected-pages.py`로 Supabase Storage에 업로드
  - `dev/auto-find-section.html`, `dev/boq-report.html`, `dev/compositebeam-calculator.html`, `dev/composite-castellatedbeam-design-calculator.html`
- Loader shells in `/pages/k-col web software/protected/`
- Calls `serve-protected-page` Edge Function
- Edge Function validates JWT and checks permissions
- Returns page content from Supabase Storage if authorized

### 보 스팬(Beam span) 8m 제한
- 적용 페이지: 합성보 계산기(`dev/compositebeam-calculator.html`), 합성 캐스틀레이티드 보(`dev/composite-castellatedbeam-design-calculator.html`)
- 관리자 여부: `user_profiles.role === 'admin'` (Supabase, `js/auth.js`의 `isAdmin()`)

| 사용자     | 보 스팬 입력        | 계산 실행      |
|-----------|---------------------|----------------|
| 일반 사용자 | 8m 초과 시 8m로 제한 | 8m 초과 시 승인 안내 후 제한 |
| 관리자     | 제한 없음 (예: 50m까지) | 8m 초과도 그대로 계산 |

---

## Admin (운영자)

- **등록된 관리자**: teddy1092@gmail.com (이미 `user_profiles.role = 'admin'` 으로 등록됨)
- 운영자 권한은 Supabase `user_profiles.role = 'admin'` 으로 판별됩니다.
- 최초 운영자 부트스트랩: `admin-users` Edge Function의 `bootstrap_admin` 액션 사용 시, Supabase 시크릿 **ADMIN_EMAIL_ALLOWLIST**에 해당 이메일을 포함해야 합니다 (쉼표로 복수 지정 가능).
- 추가 운영자는 기존 운영자 계정으로 `/pages/admin.html` 에서 사용자 역할을 "관리자"로 설정하면 됩니다.

---

## Contact

- Email: sbd_pmo@naver.com
- Website: https://kcol.kr
