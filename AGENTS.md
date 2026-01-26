# AI Agent Context - SongDoPartners Homepage

> This document provides context for AI agents working on this project.
> Last updated: 2026-01-25

## ⚠️ MANDATORY DEPLOYMENT WORKFLOW (AI AGENTS MUST FOLLOW)

**🚨 CRITICAL: NEVER deploy to production without EXPLICIT user consent! 🚨**

**NEVER deploy directly to beta or production. ALWAYS follow this exact sequence:**

### Step-by-Step Deployment Process

```
1. Make code changes
2. Run: ./deploy.sh --stop && ./deploy.sh --local --quick
3. STOP and ASK USER: "Local server is ready at http://localhost:3000. Please verify the changes."
4. WAIT for user approval
5. Only after approval: Deploy to beta (./deploy.sh --beta or appropriate command)
6. STOP and ASK USER: "Beta deployment complete. Please verify at https://beta.kcol.kr"
7. WAIT for user approval
8. Only after approval: Deploy to production (./deploy.sh)
```

### ⛔ PRODUCTION DEPLOYMENT RULES (NON-NEGOTIABLE)

1. **NEVER run `./deploy.sh` (production) without explicit user request**
2. **NEVER assume user wants production deployment** - always ask
3. **NEVER deploy to production just because beta works** - wait for user to say "deploy to production"
4. **If user says "deploy"** without specifying target, ASK: "Do you mean beta or production?"

### Why This Matters
- **Local testing catches bugs** before they reach any server
- **User verification** ensures changes match expectations
- **Beta testing** catches environment-specific issues
- **Production is sacred** - only deploy after full verification chain

### Common Mistakes to AVOID
- ❌ Deploying to beta/production without local testing first
- ❌ Assuming previous session's deployments are "fine to continue"
- ❌ Skipping user approval steps
- ❌ Running `docker` commands directly (always use `deploy.sh`)
- ❌ **Deploying to production without explicit user request**
- ❌ **Assuming "deploy" means production**

### Quick Reference
| Action | Command | Requires User Approval? |
|--------|---------|------------------------|
| Start local test | `./deploy.sh --stop && ./deploy.sh --local --quick` | No |
| Stop local | `./deploy.sh --stop` | No |
| Deploy to beta | After local approval | **YES** |
| Deploy to production | After beta approval | **YES - EXPLICIT REQUEST REQUIRED** |

---

## ⚠️ SECURITY FIRST

**Before implementing ANY feature involving authentication, authorization, or database access:**

1. **READ `/docs/SECURITY.md`** - Contains mandatory security checklist
2. **Verify RLS is enabled** on all tables (especially `user_profiles`)
3. **Never expose `SERVICE_ROLE_KEY`** in client-side code
4. **Run `./deploy.sh --test-security`** before deployment

**Critical Tables:**
- `user_profiles` - Controls admin access, approval status, permissions
- `usage_logs` - Analytics data
- `feature_definitions` - Feature registry

---

## Project Overview

**Project**: SongDoPartners (SDP) Corporate Homepage
**Purpose**: K-COL Steel Column Design Platform - Corporate website with product information, calculators, and news
**Stack**: Next.js 15 + Bun + TypeScript + Tailwind CSS, deployed to AWS Lightsail
**Domain**: https://kcol.kr, https://www.kcol.kr
**Beta**: https://beta.kcol.kr (for testing before production deployment)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS Lightsail                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Container Service: sdppmo-container-service-1 (PROD)   │    │
│  │  Container Service: sdppmo-beta-container (BETA)        │    │
│  │  Region: ap-northeast-2 (Seoul)                         │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │  Docker Container (Next.js 15 + Bun)            │    │    │
│  │  │  - Port 3000 (HTTP)                             │    │    │
│  │  │  - Health check: /health → /api/health          │    │    │
│  │  │  - Server-side rendering (SSR)                  │    │    │
│  │  │  - Server Actions for calculations              │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│  ┌───────────────────────────▼───────────────────────────┐      │
│  │  Lightsail Load Balancer                              │      │
│  │  - HTTPS termination (automatic SSL)                  │      │
│  │  - Custom domains: kcol.kr, www.kcol.kr, beta.kcol.kr │      │
│  │  - Public Endpoint (DNS, not static IP)               │      │
│  └───────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  AWS Route 53 (beta.kcol.kr)                                     │
│  DNS Provider: Gabia (kcol.kr, www.kcol.kr)                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  DNS Records:                                           │    │
│  │  kcol.kr      → CNAME → Lightsail prod endpoint         │    │
│  │  www.kcol.kr  → CNAME → Lightsail prod endpoint         │    │
│  │  beta.kcol.kr → ALIAS → Lightsail beta endpoint         │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Key Architecture Changes (2026-01-25)

**Migrated from Static HTML/Nginx to Next.js 15:**
- Server-side rendering (SSR) for all pages
- Server Actions for proprietary calculation logic (protected from client exposure)
- Middleware-based authentication (no more Edge Functions for protected pages)
- API routes replace Supabase Edge Functions
- Tailwind CSS replaces custom CSS

---

## Networking & DNS Configuration

### Key Concept: Lightsail Container DNS Endpoint

**Important**: Lightsail Container Services provide a **DNS endpoint (HTTPS URL)**, NOT a static IP address. This is different from Lightsail Instances which can have static IPs.

**Lightsail Endpoint Format:**
```
https://{service-name}.{random-id}.{region}.cs.amazonlightsail.com
```

**Current Endpoint:**
```
https://sdppmo-container-service-1.ja5e8wfj26k0j.ap-northeast-2.cs.amazonlightsail.com
```

### DNS Setup via Gabia

**Domain Registrar**: Gabia (가비아) - Korean domain registrar
**Domain**: `kcol.kr`

#### Understanding CNAME vs A Records

**Traditional Setup (with static IP):**
```
example.com      → A record     → 192.0.2.1 (IP address)
www.example.com  → CNAME record → example.com (resolves to same IP)
```

**Lightsail Container Setup (NO static IP, only DNS endpoint):**
```
kcol.kr          → ALIAS/ANAME  → sdppmo-container-service-1.xxx.cs.amazonlightsail.com
www.kcol.kr      → CNAME        → sdppmo-container-service-1.xxx.cs.amazonlightsail.com
```

#### Why This Is Different

1. **Lightsail Container Services don't provide static IPs** - only a DNS hostname
2. **You cannot use an A record** because A records require an IP address
3. **CNAME on apex domain (`kcol.kr`) is technically not allowed by DNS spec** - but some providers offer workarounds

#### DNS Records Configuration (in Gabia)

**Option A: If Gabia supports ALIAS/ANAME records**
| Type | Host | Value |
|------|------|-------|
| ALIAS | `@` (root) | `sdppmo-container-service-1.ja5e8wfj26k0j.ap-northeast-2.cs.amazonlightsail.com` |
| CNAME | `www` | `sdppmo-container-service-1.ja5e8wfj26k0j.ap-northeast-2.cs.amazonlightsail.com` |

**Option B: If Gabia only supports standard records**
| Type | Host | Value | Note |
|------|------|-------|------|
| URL Redirect | `@` (root) | `https://www.kcol.kr` | 301 redirect |
| CNAME | `www` | `sdppmo-container-service-1.ja5e8wfj26k0j.ap-northeast-2.cs.amazonlightsail.com` | Main site |

**Option C: CNAME Flattening (if supported)**
Some providers like Cloudflare offer "CNAME flattening" which allows CNAME-like behavior on apex domains.

#### Current Configuration (Verify in Gabia)

Check your Gabia DNS settings at https://dns.gabia.com/ to confirm which option is in use.

### SSL/HTTPS Certificate

**Managed by Lightsail:**
1. Certificates are auto-provisioned when you add custom domains in Lightsail Console
2. Lightsail uses AWS Certificate Manager (ACM) internally
3. Certificates auto-renew - no manual intervention needed

**Setup Steps (already completed):**
1. In Lightsail Console → Container Service → Custom domains
2. Added domains: `kcol.kr`, `www.kcol.kr`
3. Lightsail provided CNAME validation records
4. Added validation records to Gabia DNS
5. Certificate validated and attached automatically

### Traffic Flow

```
User Browser
     │
     ▼
kcol.kr (DNS query to Gabia)
     │
     ▼ CNAME resolution
     │
Lightsail Load Balancer (HTTPS:443)
     │
     ▼ SSL termination
     │
Container Service (HTTP:80)
     │
     ▼
Nginx → Static Files
```

### Important Notes

1. **No Static IP**: You cannot assign a static IP to Container Services. If the endpoint URL changes (rare), DNS records must be updated.

2. **Health Checks**: Lightsail checks `/health` endpoint every 30 seconds. If it fails, traffic is stopped.

3. **HTTP to HTTPS**: Lightsail automatically redirects HTTP to HTTPS for custom domains.

4. **DNS Propagation**: After changing DNS records in Gabia, allow up to 24-48 hours for global propagation (usually much faster).

---

## File Structure

```
homepage/
├── src/                        # Next.js 15 application source
│   ├── app/                    # App Router pages
│   │   ├── page.tsx            # Homepage
│   │   ├── layout.tsx          # Root layout
│   │   ├── (auth)/             # Auth pages (login, signup, pending, reset-password)
│   │   ├── (protected)/        # Protected pages (requires auth)
│   │   │   ├── admin/          # Admin dashboard
│   │   │   └── k-col/          # K-COL calculators and tools
│   │   ├── api/                # API routes (replaced Edge Functions)
│   │   │   ├── auth/           # Auth APIs
│   │   │   ├── admin/          # Admin APIs
│   │   │   ├── usage/          # Usage logging
│   │   │   ├── proxy/          # External API proxies
│   │   │   ├── cron/           # Scheduled jobs
│   │   │   └── health/         # Health check endpoint
│   │   └── [public pages]/     # products, papers, videos, etc.
│   │
│   ├── components/             # React components
│   │   ├── layout/             # Header, Footer, Sidebar
│   │   └── ui/                 # Reusable UI components
│   │
│   ├── lib/                    # Shared utilities
│   │   ├── supabase/           # Supabase clients (server, client, middleware)
│   │   ├── db/                 # Database query functions
│   │   └── calculations/       # Server-side calculation logic (PROTECTED)
│   │
│   ├── actions/                # Server Actions
│   └── proxy.ts                # Auth proxy for protected routes (Next.js 16+)
│
├── public/                     # Static assets
│   ├── images/                 # Product logos, backgrounds
│   └── pdf/                    # Downloadable brochures
│
├── # Configuration
├── next.config.ts              # Next.js config (redirects, headers, rewrites)
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies (Bun)
│
├── # Docker & Deployment
├── Dockerfile                  # Multi-stage Bun + Next.js build
├── deploy.sh                   # Main deployment script
├── .dockerignore               # Docker build exclusions
│
├── # Documentation
├── README.md                   # User documentation
├── AGENTS.md                   # This file - AI agent context
├── docs/                       # Documentation
│   ├── SECURITY.md             # Security checklist
│   └── AUTHENTICATION.md       # Auth flow documentation
│
├── # Environment (git-ignored)
├── .env.local                  # Supabase secrets
│
└── .gitignore                  # Git ignore rules
```

---

## Key Files Explained

### `deploy.sh` - Main Deployment Script

```bash
./deploy.sh                   # Full: build + security scan + deploy to Lightsail
./deploy.sh --local           # Build + run local server at http://localhost:3000
./deploy.sh --stop            # Stop local server + cleanup Docker images
./deploy.sh --build-only      # Build Docker image only
./deploy.sh --deploy-only     # Deploy existing image to Lightsail
./deploy.sh --quick           # Skip Trivy security scans
./deploy.sh --test-security   # Run security tests (RLS verification)
```

**Configuration (in script):**
- `SERVICE_NAME="sdppmo-container-service-1"`
- `AWS_REGION="ap-northeast-2"`
- `IMAGE_NAME="sdppmo-homepage"`
- `LOCAL_PORT=3000`
- `LOCAL_CONTAINER="sdppmo-local-test"`

**Features:**
- Pre-flight checks (Docker, AWS CLI, Lightsail access)
- Security vulnerability scanning via Trivy
- Security header validation
- macOS/Linux compatible

### `Dockerfile` - Container Build

- Multi-stage build: deps → builder → runner
- Base: `oven/bun:1` for build, `oven/bun:1-slim` for runtime
- Standalone Next.js output for minimal image size
- Health check: HTTP GET to `/api/health`
- Port: 3000

### `next.config.ts` - Next.js Configuration

**Security headers:**
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Content-Security-Policy (CSP)
- Referrer-Policy: strict-origin-when-cross-origin

**Redirects:**
- Old HTML URLs → New Next.js routes (301 permanent)
- See Appendix A in work plan for full mapping

**Rewrites:**
- `/health` → `/api/health` (for Lightsail health checks)

### `src/proxy.ts` - Auth Proxy (Next.js 16+)

**Protected route patterns:**
- `/k-col/*` - K-COL calculators (requires `access_column`)
- `/admin` - Admin dashboard (requires `role === 'admin'`)

**Behavior:**
- Checks Supabase session via `@supabase/ssr`
- Redirects unauthenticated users to `/login?redirect={originalUrl}`
- Refreshes session tokens automatically

> Note: Next.js 16 renamed `middleware.ts` to `proxy.ts`. The function export is now `proxy` instead of `middleware`.

---

## Known Issues & Technical Debt

### ✅ Resolved Security Issues

1. **~~Hardcoded Passwords in Frontend~~** *(Fixed 2026-01-18)*
   - Removed `TEMP_ACCOUNTS` object from `index.html`
   - Login now uses demo mode (any non-empty ID/password works)
   - No credentials stored in frontend code

2. **~~Admin Folder in Git~~** *(Fixed 2026-01-18)*
   - `admin/` folder removed from git history via `git filter-branch`
   - Added to `.gitignore` to prevent future commits
   - Excluded from Docker via `.dockerignore`

### 🟡 Technical Debt

1. **No Semantic Versioning**
   - Uses timestamps (e.g., `20260118-154455`), not semver
   - No git tag integration

2. **No CI/CD Pipeline**
   - Manual deployment via `deploy.sh`
   - Could be automated with GitHub Actions

### ✅ Recently Resolved (2026-01-20)

1. **Server-Side Authentication** *(Implemented)*
   - Supabase Auth with JWT tokens
   - Protected pages served via Edge Functions
   - Permission-based access control (access_column, access_beam)

2. **Admin Email Exposure** *(Fixed)*
   - Removed hardcoded admin emails from frontend
   - Admin status determined by database role only

---

## Common Tasks

### Deploy Changes to Production

```bash
# 1. Test locally first
./deploy.sh --local
# Open http://localhost:3000 and verify changes

# 2. Stop local server
./deploy.sh --stop

# 3. Commit changes
git add .
git commit -m "Description of changes"
git push origin main

# 4. Deploy to Lightsail
./deploy.sh
```

### Add New Page

1. Create page file in `src/app/[route]/page.tsx`
2. For protected pages, use `src/app/(protected)/[route]/page.tsx`
3. Use existing components from `src/components/`
4. Style with Tailwind CSS
5. Test with `./deploy.sh --local`

### Add New API Route

1. Create route file in `src/app/api/[route]/route.ts`
2. Export HTTP method handlers: `GET`, `POST`, etc.
3. Use `createServerClient` from `src/lib/supabase/server.ts` for auth
4. Write tests in `src/app/api/[route]/route.test.ts`

### Modify Protected Page Logic

1. UI components go in `src/app/(protected)/[route]/page.tsx`
2. Calculation logic goes in `src/lib/calculations/` (server-only)
3. Create Server Actions in `src/actions/` to invoke calculations
4. Never expose calculation code to client bundles

---

## Environment & Prerequisites

### Development Machine
- Docker Desktop
- AWS CLI v2 (for deployment)
- Python 3 (for local dev server alternative)

### AWS Configuration
- IAM User: `hosungk`
- Required Policy: `AmazonLightsailFullAccess`
- Region: `ap-northeast-2` (Seoul)

### Lightsail Service
- Name: `sdppmo-container-service-1`
- Power: Micro
- Scale: 1
- Custom Domains: `kcol.kr`, `www.kcol.kr`
- SSL: Auto-managed by Lightsail
- Endpoint: `https://sdppmo-container-service-1.ja5e8wfj26k0j.ap-northeast-2.cs.amazonlightsail.com/`

### DNS Provider
- Registrar: Gabia (가비아)
- Domain: `kcol.kr`
- Management: https://dns.gabia.com/

---

## Deployment Checklist

Before deploying:
- [ ] Test locally with `./deploy.sh --local`
- [ ] Check responsive design on mobile viewport
- [ ] Verify all links work
- [ ] Run `bun run typecheck` - no type errors
- [ ] Run `bun run test` - all tests pass
- [ ] Run security header check: `curl -I http://localhost:3000/`

After deploying:
- [ ] Wait 2-5 minutes for deployment
- [ ] Verify at https://kcol.kr
- [ ] Check https://www.kcol.kr redirects correctly
- [ ] Test health endpoint: `curl https://kcol.kr/health`
- [ ] Test login flow works

---

## Quick Reference

| Task | Command |
|------|---------|
| Local test (rebuild) | `./deploy.sh --stop && ./deploy.sh --local --quick` |
| Stop local | `./deploy.sh --stop` |
| Full deploy | `./deploy.sh` |
| Quick deploy | `./deploy.sh --quick` |
| Build only | `./deploy.sh --build-only` |
| Type check | `bun run typecheck` |
| Run tests | `bun run test` |
| Check status | `aws lightsail get-container-services --service-name sdppmo-container-service-1 --region ap-northeast-2` |
| View logs | `aws lightsail get-container-log --service-name sdppmo-container-service-1 --container-name homepage --region ap-northeast-2` |

### Local Development Workflow

**IMPORTANT**: 로컬 서버 재시작 시 반드시 다음 순서로 실행:

```bash
./deploy.sh --stop && ./deploy.sh --local --quick
```

- `--stop`: 기존 컨테이너 중지 및 정리
- `--local`: 로컬에서 Docker 컨테이너 실행
- `--quick`: Trivy 보안 스캔 생략 (개발 시 빠른 반복용)

**절대 사용하지 말 것**: `docker` 명령어 직접 사용 (항상 deploy.sh 스크립트 사용)

---

## Recent Changes (2026-01-25)

### Next.js Migration Complete
- ✅ Migrated from static HTML/Nginx to Next.js 15 + Bun + TypeScript
- ✅ All 25 pages converted to React Server Components
- ✅ Server-side rendering (SSR) for all pages
- ✅ Server Actions protect proprietary calculation logic
- ✅ Middleware-based authentication replaces Edge Functions
- ✅ API routes replace Supabase Edge Functions
- ✅ Tailwind CSS replaces custom CSS
- ✅ Beta deployment at https://beta.kcol.kr

### Protected Pages (Server-Side Calculations)
- ✅ `/k-col/auto-find-section` - Steel section finder
- ✅ `/k-col/calculator` - Cross-H column calculator
- ✅ `/k-col/boq-report` - Bill of Quantities report
- ✅ `/k-col/print`, `/k-col/calc-data-1`, `/k-col/calc-data-2` - Calculation outputs
- ✅ `/k-col/user-guide`, `/k-col/developer-guide` - Documentation

### Performance Improvements
- ✅ Protected page TTFB: ~75ms (was 2-3s with Edge Functions)
- ✅ No client-side waterfall for protected content
- ✅ Calculation code NOT exposed in client bundles

## Previous Changes (2026-01-22)

### Improved Signup Flow with Auto-Login
- ✅ Credentials stored in `sessionStorage` after signup for auto-login
- ✅ `pending.html` polls `check-email-verified` Edge Function (3 second interval)
- ✅ Auto-login after email verification using stored credentials
- ✅ Profile creation happens after email verification, before redirect
- ✅ Clean `signup.html` - removed all pending-related elements
- ✅ Redirect to home page (`/`) after successful verification

### Security Improvements
- ✅ Stored credentials auto-cleared after 10 minutes
- ✅ `beforeunload` event clears credentials (except on success redirect)
- ✅ Credentials cleared immediately after login attempt (success or fail)
- ✅ `isNavigatingToHome` flag prevents premature cleanup

### New Edge Functions
- ✅ `check-email-verified` - Queries `auth.users` directly for verification status
- ✅ `admin-users` updated - Fetches users from `auth.users`, left-joins `user_profiles`

### Rate Limit Adjustments
- ✅ Rate: 10r/s → 20r/s (prevents 429 on page load)
- ✅ Burst: 20 → 40
- ✅ Connections: 20 → 30

---

## Previous Changes (2026-01-21)

### Dedicated Auth Pages
- ✅ Added `/pages/auth/login.html` - standalone login page with modern dark theme
- ✅ Added `/pages/auth/signup.html` - standalone signup page with password requirements checklist
- ✅ Real-time password strength validation (8+ chars, upper/lower, number, special char)
- ✅ Removed modal-based authentication from main page
- ✅ Login redirects to dedicated page instead of showing modal

### Login Session Improvements
- ✅ Fixed login UI flickering on page load
- ✅ Proper token refresh handling - if expired, redirect to login
- ✅ Cached session check for instant UI display

### UI/UX Updates
- ✅ Auth section buttons fill container width
- ✅ Removed promotional text from auth section
- ✅ Clean, minimal button design

---

## Previous Changes (2026-01-20)

### Server-Side Protected Pages
- ✅ Added `serve-protected-page` Edge Function for secure page access
- ✅ Protected pages (Auto Find Section, BOQ) stored in Supabase Storage
- ✅ Permission-based access control (`access_column`, `access_beam`)
- ✅ In-memory caching for Edge Function performance
- ✅ Protected pages excluded from Docker image (`.dockerignore`)

### Security Improvements
- ✅ Removed hardcoded admin emails from frontend code
- ✅ Admin status determined by database `role` field only
- ✅ Hardcoded email in `send-admin-alert` moved to environment variable

### Deployment Automation
- ✅ Added `--upload-protected` to upload HTML to Supabase Storage
- ✅ Added `--deploy-functions` to deploy Edge Functions via Supabase CLI
- ✅ Full deploy now includes Supabase uploads automatically

### Previous Changes (2026-01-18)
- ✅ Supabase Auth integration (signup, login, session management)
- ✅ Korean localization for auth UI
- ✅ Password complexity requirements
- ✅ User profile management (business name, phone, etc.)

---

## Authentication Flow

### Login Flow
1. User clicks "로그인" button on main page
2. Redirects to `/login`
3. User enters email/password
4. Server Action validates credentials via Supabase Auth
5. On success, redirects back to original page (or homepage)

### Signup Flow
1. User clicks "회원가입" button on main page
2. Redirects to `/signup`
3. User enters email, password (with real-time validation), company info
4. On submit, credentials stored in `sessionStorage` (for auto-login)
5. Redirects to `/pending` with email verification waiting UI
6. `/pending` page polls `/api/auth/verify-status` every 3 seconds
7. When verified, auto-login using stored credentials
8. Profile created in `user_profiles` table
9. Redirects to home page with logged-in session

**Security for stored credentials:**
- `sessionStorage` (cleared when tab closes)
- 10 minute timeout auto-clear
- `beforeunload` cleanup (except on success redirect)
- Immediately cleared after login attempt

### Session Management
- Sessions managed by `@supabase/ssr` package
- Proxy (`src/proxy.ts`) checks session on every request
- If valid token exists → allow access to protected routes
- If token expired → proxy refreshes automatically
- If refresh fails → redirect to login page

### Protected Pages
- Protected pages are React Server Components in `src/app/(protected)/`
- Proxy checks authentication BEFORE page renders
- No client-side loading or waterfall
- Permission checks (`access_column`, `access_beam`) in layout.tsx
- Calculation logic runs server-side via Server Actions

### OAuth Login (Google, Kakao)

**Supported Providers:**
- Google (signInWithGoogle)
- Kakao (signInWithKakao)

**Flow:**
1. User clicks Google/Kakao button on `/login`
2. Server Action calls `supabase.auth.signInWithOAuth()`
3. User redirected to provider's login page
4. After auth, provider redirects to `/auth/callback?code=xxx&next=/`
5. Callback route exchanges code for session
6. User redirected to intended destination

**Code Locations:**
- OAuth actions: `src/app/(auth)/login/actions.ts`
- Callback handler: `src/app/auth/callback/route.ts`

---

## OAuth Provider Configuration (Supabase Dashboard)

### Google OAuth Setup
**Location**: Supabase Dashboard → Authentication → Providers → Google

1. Enable Google provider
2. Get credentials from [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
   - Create OAuth 2.0 Client ID (Web application)
   - Authorized redirect URI: `https://iwudkwhafyrhgzuntdgm.supabase.co/auth/v1/callback`
3. Enter Client ID and Client Secret in Supabase

### Kakao OAuth Setup
**Location**: Supabase Dashboard → Authentication → Providers → Kakao

1. Enable Kakao provider
2. Get credentials from [Kakao Developers](https://developers.kakao.com/):
   - Create application
   - Enable Kakao Login
   - Add redirect URI: `https://iwudkwhafyrhgzuntdgm.supabase.co/auth/v1/callback`
   - Get REST API Key (Client ID) and Client Secret
3. Enter Client ID and Client Secret in Supabase

### Email Linking Configuration (IMPORTANT)
**Location**: Supabase Dashboard → Authentication → Providers

To allow users who signed up with email to also login with Google/Kakao (and vice versa):

1. Go to **Authentication → Providers**
2. Scroll to **Email** provider settings
3. Enable **"Automatically link accounts with the same email"**

**Behavior when enabled:**
- User signs up with email `user@example.com`
- Later logs in with Google using same email
- Accounts are automatically linked (same user_id)
- User can login with either method

**Behavior when disabled:**
- User signs up with email `user@example.com`
- Tries to login with Google using same email
- Error: "User already registered" (separate accounts)

### Redirect URLs Configuration
**Location**: Supabase Dashboard → Authentication → URL Configuration

| Setting | Value |
|---------|-------|
| Site URL | `https://kcol.kr` |
| Redirect URLs | `https://kcol.kr/**`, `https://www.kcol.kr/**`, `https://beta.kcol.kr/**` |

**IMPORTANT**: Add `beta.kcol.kr` to Redirect URLs for testing OAuth on beta environment.

---

## Email Configuration (Supabase + Resend)

### Overview
- **Email Provider**: Resend (https://resend.com)
- **Sender Email**: `sdppmo@kcol.kr`
- **Integration**: Supabase Custom SMTP

### Supabase Dashboard Settings

#### 1. URL Configuration (중요!)
**Location**: Project Settings → Authentication → URL Configuration

| Setting | Value |
|---------|-------|
| Site URL | `https://kcol.kr` |
| Redirect URLs | `https://kcol.kr/**`, `https://www.kcol.kr/**` |

> ⚠️ **Site URL은 `{{ .ConfirmationURL }}`의 base URL로 사용됨**
> Site URL이 설정되지 않으면 이메일의 인증 링크가 작동하지 않음

#### 2. Custom SMTP Configuration
**Location**: Project Settings → Authentication → SMTP Settings

| Setting | Value |
|---------|-------|
| Enable Custom SMTP | ✅ On |
| Sender email | `sdppmo@kcol.kr` |
| Sender name | `송도파트너스피엠오` |
| Host | `smtp.resend.com` |
| Port | `465` |
| Username | `resend` |
| Password | Resend API Key (`re_xxxxxxxx`) |

#### 3. Email Templates
**Location**: Authentication → Email Templates

**Confirm Signup (회원가입 인증)**:
```html
<h2>송도파트너스피엠오 회원가입을 환영합니다</h2>

<p>안녕하세요,</p>

<p>송도파트너스피엠오 서비스에 가입해 주셔서 감사합니다.<br>
아래 버튼을 클릭하여 이메일 인증을 완료해 주세요.</p>

<p style="margin: 32px 0;">
  <a href="{{ .ConfirmationURL }}" style="background-color: #667eea; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600;">이메일 인증하기</a>
</p>

<p>버튼이 작동하지 않는 경우, 아래 링크를 브라우저에 직접 붙여넣어 주세요:<br>
<a href="{{ .ConfirmationURL }}">{{ .ConfirmationURL }}</a></p>

<hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0;">

<p style="font-size: 12px; color: #999999;">
※ 본 메일은 발신 전용이며, 회신하셔도 답변을 받으실 수 없습니다.
</p>

<p style="font-size: 13px; color: #666666;">
본 메일은 송도파트너스피엠오 회원가입 요청에 의해 자동 발송되었습니다.<br>
회원가입을 요청하지 않으셨다면 이 메일을 무시하셔도 됩니다.
</p>

<p style="font-size: 13px; color: #666666;">
주식회사 송도파트너스피엠오<br>
<a href="https://kcol.kr">https://kcol.kr</a> | sdppmo@kcol.kr
</p>
```

### Resend Dashboard Settings

#### Domain Configuration
**Location**: Resend Dashboard → Domains

1. Add domain: `kcol.kr`
2. Add DNS records to Gabia:
   - SPF record (TXT)
   - DKIM records (CNAME × 3)
   - Optional: DMARC record (TXT)

#### API Key
- Create API key with "Sending access" permission
- Use this key as SMTP password in Supabase

### Troubleshooting

| Issue | Solution |
|-------|----------|
| `{{ .ConfirmationURL }}` 빈 값 | Site URL 설정 확인 (Project Settings → Auth → URL Configuration) |
| 이메일 발송 안됨 | Resend 도메인 인증 상태 확인, DNS 레코드 전파 대기 (최대 48시간) |
| 인증 링크 클릭 시 404 | Redirect URLs에 도메인 추가 여부 확인 |
| 스팸함으로 이동 | DKIM, SPF, DMARC 레코드 모두 설정 권장 |

---

## Contact

- Email: sbd_pmo@naver.com
- Website: https://kcol.kr
- Repository: github.com:sdppmo/homepage.git
