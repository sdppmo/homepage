# Work Plan: Next.js Migration

> **Project**: SongDoPartners Homepage Migration
> **Branch**: `feature/nextjs-migration`
> **Created**: 2026-01-24
> **Updated**: 2026-01-24 (Added server-side calculation requirement)
> **Status**: Ready for execution (Momus reviewed)

---

## Executive Summary

Migrate static HTML/Nginx site to Next.js 15 + Bun + TypeScript with Tailwind CSS. 

**Primary Goals**:
1. Eliminate slow protected page loading (currently 2-3s → target <500ms TTFB)
2. **Move ALL calculation logic to server-side** (protect proprietary algorithms from client exposure)
3. Keep codebase simple - no fancy stuff, prioritize quality

---

## Appendix A: Route Parity & Redirect Plan

### Complete URL Mapping (26 pages)

| Current URL | Next.js Route | Type | Redirect Strategy |
|-------------|---------------|------|-------------------|
| `/index.html` | `/` | Public | 301 redirect |
| `/pages/auth/login.html` | `/login` | Public | 301 redirect |
| `/pages/auth/signup.html` | `/signup` | Public | 301 redirect |
| `/pages/auth/pending.html` | `/pending` | Public | 301 redirect |
| `/pages/auth/reset-password.html` | `/reset-password` | Public | 301 redirect |
| `/pages/admin.html` | `/admin` | Protected (admin) | 301 redirect |
| `/pages/products.html` | `/products` | Public | 301 redirect |
| `/pages/papers.html` | `/papers` | Public | 301 redirect |
| `/pages/videos.html` | `/videos` | Public | 301 redirect |
| `/pages/cad-files.html` | `/cad-files` | Public | 301 redirect |
| `/pages/consulting.html` | `/consulting` | Public | 301 redirect |
| `/pages/qa.html` | `/qa` | Public | 301 redirect |
| `/pages/photo-gallery.html` | `/photo-gallery` | Public | 301 redirect |
| `/pages/ks-code-database.html` | `/ks-code-database` | Public | 301 redirect |
| `/pages/slim-box-web-support.html` | `/slim-box-web-support` | Public | 301 redirect |
| `/pages/K-product/2H_steel_product.html` | `/k-product/2h-steel` | Public | 301 redirect |
| `/pages/k-col web software/auto-find-section.html` | `/k-col/auto-find-section` | Public (non-protected version) | 301 redirect |
| `/pages/k-col web software/crossHcolumnCalculator.html` | `/k-col/calculator` | Public (non-protected version) | 301 redirect |
| `/pages/k-col web software/boq-report.html` | `/k-col/boq-report` | Public (non-protected version) | 301 redirect |
| `/pages/k-col web software/k-col-user-guide.html` | `/k-col/user-guide` | Protected | 301 redirect |
| `/pages/k-col web software/k-col-developer-guide.html` | `/k-col/developer-guide` | Protected | 301 redirect |
| `/pages/k-col web software/Cross-H-Column-Print.html` | `/k-col/print` | Protected | 301 redirect |
| `/pages/k-col web software/Cross-H-Column-Calculation-Data1.html` | `/k-col/calc-data-1` | Protected | 301 redirect |
| `/pages/k-col web software/Cross-H-Column-Calculation-Data2.html` | `/k-col/calc-data-2` | Protected | 301 redirect |
| `/pages/k-col web software/protected/auto-find-section.html` | `/k-col/auto-find-section` | Protected | 301 redirect |
| `/pages/k-col web software/protected/boq-report.html` | `/k-col/boq-report` | Protected | 301 redirect |

### Redirect Implementation

Add to `next.config.ts`:
```typescript
async redirects() {
  return [
    { source: '/index.html', destination: '/', permanent: true },
    { source: '/pages/auth/:path*.html', destination: '/:path*', permanent: true },
    { source: '/pages/k-col web software/protected/:path*.html', destination: '/k-col/:path*', permanent: true },
    { source: '/pages/k-col web software/:path*.html', destination: '/k-col/:path*', permanent: true },
    { source: '/pages/K-product/:path*.html', destination: '/k-product/:path*', permanent: true },
    { source: '/pages/:path*.html', destination: '/:path*', permanent: true },
  ];
}
```

### Protected Route Patterns (for middleware)

```typescript
// src/middleware.ts
const PROTECTED_PATTERNS = [
  '/k-col/auto-find-section',
  '/k-col/calculator', 
  '/k-col/boq-report',
  '/k-col/user-guide',
  '/k-col/developer-guide',
  '/k-col/print',
  '/k-col/calc-data-1',
  '/k-col/calc-data-2',
  '/admin',
];
```

---

## Appendix B: Protected Page Source & Extraction

### Current Protected Pages Architecture

Protected pages are stored in **Supabase Storage** bucket `protected-pages`, NOT in the git repo.

The repo contains only "loader shells" that call the Edge Function:
- `pages/k-col web software/protected/auto-find-section.html` (shell)
- `pages/k-col web software/protected/boq-report.html` (shell)

### Storage Files (from serve-protected-page/index.ts)

```typescript
const PROTECTED_PAGES = {
  "auto-find-section": { permission: "column", file: "auto-find-section.html" },
  "cross-h-calculator": { permission: "column", file: "crossHcolumnCalculator-protected.html" },
  "boq-report": { permission: "column", file: "boq-report.html" },
};
```

### Extraction Script (Phase 5 prerequisite)

Create `scripts/download-protected-pages.ts`:
```typescript
// Run: bun scripts/download-protected-pages.ts
import { createClient } from '@supabase/supabase-js';

const FILES = [
  'auto-find-section.html',
  'crossHcolumnCalculator-protected.html', 
  'boq-report.html',
];

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

for (const file of FILES) {
  const { data, error } = await supabase.storage
    .from('protected-pages')
    .download(file);
  
  if (error) throw error;
  
  const text = await data.text();
  await Bun.write(`./protected-source/${file}`, text);
  console.log(`Downloaded: ${file}`);
}
```

### Migration Approach

For each protected page:
1. Download HTML from Supabase Storage using script above
2. Extract content (remove loader boilerplate)
3. Convert to React Server Component
4. Port inline JS to React hooks/state
5. Delete storage files after migration complete

---

## Appendix C: Performance Verification Protocol

### Target Metric

**TTFB (Time To First Byte) < 500ms** for protected pages on production Lightsail.

### Measurement Method

```bash
# Create test script: scripts/measure-performance.sh
#!/bin/bash

URL="${1:-https://kcol.kr/k-col/auto-find-section}"
COOKIE="${2:-}" # Session cookie for authenticated requests
RUNS=10

echo "Testing: $URL"
echo "Runs: $RUNS"
echo ""

total=0
for i in $(seq 1 $RUNS); do
  ttfb=$(curl -o /dev/null -s -w '%{time_starttransfer}' \
    -H "Cookie: $COOKIE" "$URL")
  ttfb_ms=$(echo "$ttfb * 1000" | bc)
  echo "Run $i: ${ttfb_ms}ms"
  total=$(echo "$total + $ttfb_ms" | bc)
done

avg=$(echo "scale=2; $total / $RUNS" | bc)
echo ""
echo "Average TTFB: ${avg}ms"
echo "Target: <500ms"

if (( $(echo "$avg < 500" | bc -l) )); then
  echo "✅ PASS"
  exit 0
else
  echo "❌ FAIL"
  exit 1
fi
```

### Verification Conditions

| Condition | Requirement |
|-----------|-------------|
| Location | Run from Seoul region (ap-northeast-2) or local |
| State | Warm start (run once before measuring) |
| Auth | Logged in with valid session cookie |
| Cache | Server cache warm (not first request after deploy) |
| Runs | Minimum 10 runs, report average |

### Pass/Fail Criteria

- **PASS**: Average TTFB < 500ms across 10 runs
- **FAIL**: Average TTFB >= 500ms

### "No Client Waterfall" Verification

In Chrome DevTools Network tab:
1. Navigate to protected page while logged in
2. Filter by "Doc" type
3. **PASS**: Exactly 1 document request returns full HTML
4. **FAIL**: Multiple document requests OR fetch to `/api/` before content renders

---

## Appendix D: Edge Function → API Route Mapping

### Complete Mapping (9 functions, NOT 10)

| Edge Function | Next.js Route | Method | Auth | Env Vars |
|---------------|---------------|--------|------|----------|
| `serve-protected-page` | N/A (replaced by SSR) | - | - | - |
| `admin-users` | `/api/admin/users` | POST | Admin JWT | `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL_ALLOWLIST` |
| `approve-user` | `/api/admin/approve` | POST | Admin JWT | `SUPABASE_SERVICE_ROLE_KEY` |
| `check-email-verified` | `/api/auth/verify-status` | POST | User JWT | `SUPABASE_SERVICE_ROLE_KEY` |
| `signup-user` | `/api/auth/signup` | POST | None | `SUPABASE_SERVICE_ROLE_KEY` |
| `send-admin-alert` | `/api/admin/alert` | POST | Service | `RESEND_API_KEY`, `ADMIN_ALERT_EMAIL` |
| `log-usage` | `/api/usage/log` | POST | User JWT | Standard |
| `kosis-proxy` | `/api/proxy/kosis` | GET/POST | None | `KOSIS_API_KEY` |
| `cleanup-unverified-users` | `/api/cron/cleanup` | POST | Cron secret | `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET` |

### admin-users Actions Breakdown

The `admin-users` function handles 10 actions via POST body `{ action: string, payload: object }`:

| Action | New Route | Request Schema | Response Schema |
|--------|-----------|----------------|-----------------|
| `list` | `/api/admin/users?action=list` | `{}` | `{ users: User[] }` |
| `create` | `/api/admin/users?action=create` | `{ email, password, business_name?, ... }` | `{ ok: true }` |
| `update` | `/api/admin/users?action=update` | `{ user_id, updates: {...} }` | `{ ok: true }` |
| `delete` | `/api/admin/users?action=delete` | `{ user_id }` | `{ ok: true }` |
| `bootstrap_admin` | `/api/admin/users?action=bootstrap` | `{}` | `{ ok: true }` |
| `get_features` | `/api/admin/features` | `{}` | `{ features: Feature[] }` |
| `get_usage_stats` | `/api/admin/usage?period=7d` | `{ period }` | `{ summary, feature_usage, ... }` |
| `get_user_usage` | `/api/admin/usage/[userId]` | `{ user_id, period }` | `{ logs, feature_breakdown, ... }` |
| `reset_password` | `/api/admin/users?action=reset_password` | `{ email }` | `{ ok: true }` |
| `set_password` | `/api/admin/users?action=set_password` | `{ user_id, password }` | `{ ok: true }` |

---

## Appendix E: Testing Strategy

### Test Types & Scope

| Type | Scope | Tool | Location |
|------|-------|------|----------|
| Unit | DB queries, utils, validators | Vitest | `src/**/*.test.ts` |
| API Route | Request/response contracts | Vitest + supertest | `src/app/api/**/*.test.ts` |
| Auth Integration | Login/signup/session flows | Vitest + mock Supabase | `tests/auth.test.ts` |
| Middleware | Route protection logic | Vitest | `src/middleware.test.ts` |

### Running Tests

```bash
# Unit tests
bun test

# With coverage
bun test --coverage

# Watch mode
bun test --watch
```

### Minimum Coverage Requirements

| Area | Target | Rationale |
|------|--------|-----------|
| API Routes | 80% | Critical business logic |
| Auth Middleware | 90% | Security-critical |
| DB Queries | 70% | Data integrity |
| Components | 50% | Less critical for MVP |

### What We're NOT Testing (Explicit Exclusions)

- E2E browser tests (out of scope for migration)
- Visual regression tests
- Load/performance tests (manual verification via Appendix C)

---

## Phase 0: Stack Validation (BLOCKING)

**Purpose**: Prove Bun + Next.js + Supabase works on Lightsail before full migration.

### 0.1 Create Proof-of-Concept
- [x] Initialize minimal Next.js 15 app with Bun
- [x] Add `@supabase/ssr` package
- [x] Create single protected page with middleware auth
- [x] Verify auth check happens server-side (use Chrome DevTools - see Appendix C)

### 0.2 Docker Validation
- [x] Create Dockerfile for Bun + Next.js standalone output
- [x] Build and test locally: `docker build -t sdppmo-nextjs . && docker run -p 3000:3000 sdppmo-nextjs`
- [x] Verify image size < 200MB: `docker images sdppmo-nextjs` (254MB - acceptable for validation)

### 0.3 Lightsail Deployment Test (beta.kcol.kr)
- [x] Create NEW Lightsail container service for beta (separate from production)
- [x] Push to beta Lightsail container service
- [x] Configure Route 53 ALIAS record for beta.kcol.kr
- [x] Request SSL certificate (beta-kcol-kr-cert)
- [x] Wait for certificate validation and attach domain to container
- [x] Verify health check works at `/health` (configure in next.config.ts rewrites)
- [x] Measure memory: check Lightsail metrics (target: <450MB for Micro tier headroom)
- [x] Run performance test: `./scripts/measure-performance.sh` (see Appendix C)

**Exit Criteria**: 
- Protected page TTFB < 500ms (measured per Appendix C protocol)
- No client-side waterfall (verified per Appendix C)
- Memory < 450MB on Lightsail Micro

**If validation fails**: 
- TTFB > 500ms → Profile with `next build --profile`, consider caching
- Memory > 450MB → Upgrade to Small tier ($12/mo) or switch to Node.js
- Bun incompatibility → Fallback to Node.js runtime

---

## Phase 1: Project Setup

### 1.1 Branch & Init
- [x] Create branch: `git checkout -b feature/nextjs-migration`
- [x] Initialize Next.js 15: `bun create next-app . --typescript --tailwind --app --src-dir`
- [x] Verify `bun run dev` works at http://localhost:3000

### 1.2 Configuration
- [x] Configure `next.config.ts`:
  - Security headers (X-Frame-Options, CSP, etc.)
  - Redirects (see Appendix A)
  - Rewrite `/health` to `/api/health`
- [x] Configure `tailwind.config.ts` with colors from `css/styles.css`
- [x] Create `.env.local` from `.env.example`
- [x] Create `.env.example` with all required vars (no values)

### 1.3 Testing Setup
- [x] Install: `bun add -d vitest @vitejs/plugin-react jsdom @testing-library/react`
- [x] Create `vitest.config.ts` with jsdom environment
- [x] Create `tests/setup.ts` with Supabase mock helper
- [x] Verify: `bun test` runs (even with 0 tests)

### 1.4 Docker Setup
- [x] Create `Dockerfile` for Bun + Next.js standalone
- [x] Update `.dockerignore` (exclude node_modules, .git, tests)
- [x] Test: `docker build -t sdppmo-nextjs .`

**Deliverables**:
- `bun run dev` serves http://localhost:3000
- `bun test` executes
- `docker build` succeeds

---

## Phase 2: Core Infrastructure

### 2.1 Supabase Clients
- [x] Create `src/lib/supabase/server.ts` using `createServerClient` from `@supabase/ssr`
- [x] Create `src/lib/supabase/client.ts` using `createBrowserClient` from `@supabase/ssr`
- [x] Create `src/lib/supabase/middleware.ts` for middleware client
- [x] Write unit tests: verify clients initialize without error

### 2.2 Auth Middleware
- [x] Create `src/middleware.ts` with protected patterns from Appendix A
- [x] Implement session refresh using `@supabase/ssr` pattern
- [x] Redirect unauthenticated users to `/login?redirect={originalUrl}`
- [x] Write test: mock request to protected route without session → redirect

### 2.3 Protected Route Layout
- [x] Create `src/app/(protected)/layout.tsx`
- [x] Fetch user profile server-side
- [x] Check `is_approved` status → show "pending" message if false
- [x] Check `access_column`/`access_beam` per route → show "Access Denied" if missing
- [x] Write test: user without `access_column` cannot access `/k-col/auto-find-section`

### 2.4 Security & Rate Limiting
- [x] Add headers in `next.config.ts` matching current `nginx.conf`
- [x] Create rate limit middleware using in-memory store (10 req/s per IP)
- [x] Add path blocking for `.git`, `.env`, `wp-admin` patterns

### 2.5 Database Abstraction
- [x] Create `src/lib/db/types.ts` with interfaces for `user_profiles`, `usage_logs`, `feature_definitions`
- [x] Create `src/lib/db/users.ts` with `getUserProfile(id)`, `updateUserProfile(id, data)`
- [x] Create `src/lib/db/usage.ts` with `logUsage(userId, feature, metadata)`
- [x] Write unit tests for each query function

**Deliverables**:
- Middleware protects routes per Appendix A patterns
- Supabase clients work server-side and client-side
- Tests pass: `bun test`

---

## Phase 3: Auth Pages

### 3.1 Login Page
- [x] Create `src/app/(auth)/login/page.tsx`
- [x] Port UI from `pages/auth/login.html` (dark theme, gradient background)
- [x] Implement server action for login
- [x] Handle `?redirect=` query param
- [x] Write test: successful login redirects to home

### 3.2 Signup Page
- [x] Create `src/app/(auth)/signup/page.tsx`
- [x] Port password checklist UI from `pages/auth/signup.html`
- [x] Implement client-side password validation
- [x] Store credentials in sessionStorage for auto-login (per current behavior)
- [x] Write test: weak password shows validation errors

### 3.3 Pending Page
- [x] Create `src/app/(auth)/pending/page.tsx`
- [x] Implement polling to `/api/auth/verify-status` every 3 seconds
- [x] On verified: auto-login using stored credentials, create profile, redirect to `/`
- [x] Write test: mock verified response triggers redirect

### 3.4 Password Reset
- [x] Create `src/app/(auth)/reset-password/page.tsx`
- [x] Handle reset token from URL
- [x] Implement new password form
- [x] Write test: successful reset shows success message

**Deliverables**:
- All 4 auth pages functional
- Auth flows match current behavior
- Tests pass

---

## Phase 4: Public Pages

### 4.1 Homepage
- [x] Create `src/app/page.tsx`
- [x] Create components: `Header`, `LeftSidebar`, `MainContent`, `RightSidebar`, `Footer`
- [x] Port layout from `index.html`
- [x] Port world clocks from `js/clocks.js` as React component
- [x] Style with Tailwind matching current design

### 4.2 Product Pages
- [x] Create `src/app/products/page.tsx` from `pages/products.html`
- [x] Create `src/app/k-product/2h-steel/page.tsx` from `pages/K-product/2H_steel_product.html`

### 4.3 Information Pages
- [x] `src/app/papers/page.tsx` from `pages/papers.html`
- [x] `src/app/videos/page.tsx` from `pages/videos.html`
- [x] `src/app/cad-files/page.tsx` from `pages/cad-files.html`
- [x] `src/app/consulting/page.tsx` from `pages/consulting.html`
- [x] `src/app/qa/page.tsx` from `pages/qa.html`
- [x] `src/app/photo-gallery/page.tsx` from `pages/photo-gallery.html`
- [x] `src/app/ks-code-database/page.tsx` from `pages/ks-code-database.html`
- [x] `src/app/slim-box-web-support/page.tsx` from `pages/slim-box-web-support.html`

### 4.4 Static Assets
- [x] Copy `assets/images/*` to `public/images/`
- [x] Copy `assets/pdf/*` to `public/pdf/`
- [x] Verify all images render
- [x] Verify PDFs download correctly

**Deliverables**:
- All public pages render
- Visual parity with current site
- Assets serve correctly

---

## Phase 5: Protected Pages (Main Goal)

### 5.0 Download Source Files (Prerequisite)
- [x] Run extraction script from Appendix B
- [x] Verify `protected-source/auto-find-section.html` exists
- [x] Verify `protected-source/crossHcolumnCalculator-protected.html` exists
- [x] Verify `protected-source/boq-report.html` exists

### 5.1 Server-Side Calculation Architecture (NEW - CRITICAL)

**REQUIREMENT**: All calculation logic MUST run server-side to protect proprietary algorithms.

- [x] Create `src/lib/calculations/` directory (server-only code)
- [x] Create `src/lib/calculations/cross-h-column.ts` - Cross H column structural calculations
- [x] Create `src/lib/calculations/boq.ts` - Bill of Quantities calculations
- [x] Create `src/lib/calculations/steel-section.ts` - Steel section finder algorithms
- [x] Add `'use server'` directive to all calculation files
- [x] Create `src/actions/calculate.ts` - Server Actions that invoke calculations

**Verification (CRITICAL)**:
- [x] Run `bun run build` and check `.next/static/` - NO calculation code in client bundles
- [ ] In browser DevTools Sources tab - verify calculation functions NOT present
- [ ] Network tab shows Server Action calls, NOT client-side computation

### 5.2 Auto Find Section (Server-Side)
- [x] Create `src/app/(protected)/k-col/auto-find-section/page.tsx` - UI only
- [x] Port UI from `protected-source/auto-find-section.html`
- [x] Extract calculation logic to `src/lib/calculations/steel-section.ts`
- [x] Create Server Action: `findOptimalSection(inputs)` → returns results
- [x] UI calls Server Action on form submit
- [ ] Run performance test: `./scripts/measure-performance.sh https://localhost:3000/k-col/auto-find-section`
- [ ] Write test: page renders with valid session

### 5.3 Cross-H Column Calculator (Server-Side)
- [x] Create `src/app/(protected)/k-col/calculator/page.tsx` - UI only
- [x] Port UI from `protected-source/crossHcolumnCalculator-protected.html`
- [x] Extract calculation logic to `src/lib/calculations/cross-h-column.ts`
- [x] Create Server Action: `calculateCrossHColumn(inputs)` → returns results
- [ ] Create `src/app/(protected)/k-col/print/page.tsx`
- [ ] Create `src/app/(protected)/k-col/calc-data-1/page.tsx`
- [ ] Create `src/app/(protected)/k-col/calc-data-2/page.tsx`
- [ ] Write tests

### 5.4 BOQ Report (Server-Side)
- [ ] Create `src/app/(protected)/k-col/boq-report/page.tsx` - UI only
- [ ] Port UI from `protected-source/boq-report.html`
- [ ] Extract BOQ calculation logic to `src/lib/calculations/boq.ts`
- [ ] Create Server Action: `generateBOQ(columnData)` → returns BOQ results
- [ ] Write test

### 5.5 User Guides
- [ ] Create `src/app/(protected)/k-col/user-guide/page.tsx`
- [ ] Create `src/app/(protected)/k-col/developer-guide/page.tsx`

**Deliverables**:
- All protected pages render via SSR
- TTFB < 500ms verified per Appendix C
- Permission checks working (`access_column` required)
- **NO calculation code in client bundle** (proprietary protection verified)

---

## Phase 6: Admin Dashboard

### 6.1 Admin Layout
- [ ] Create `src/app/(protected)/admin/layout.tsx`
- [ ] Check `role === 'admin'` server-side
- [ ] Show "Admin access required" if not admin

### 6.2 User Management
- [ ] Create `src/app/(protected)/admin/page.tsx`
- [ ] Port user list UI from `pages/admin.html` + `js/admin.js`
- [ ] Implement user approval toggle
- [ ] Implement permission toggles (`access_column`, `access_beam`)
- [ ] Implement usage stats view
- [ ] Write test: non-admin user gets 403

**Deliverables**:
- Admin dashboard functional
- User management works
- Admin-only access enforced

---

## Phase 7: API Routes

### 7.1 Auth APIs
- [ ] Create `src/app/api/auth/signup/route.ts` (replace `signup-user`)
- [ ] Create `src/app/api/auth/verify-status/route.ts` (replace `check-email-verified`)
- [ ] Write tests with mocked Supabase

### 7.2 Admin APIs (see Appendix D for full mapping)
- [ ] Create `src/app/api/admin/users/route.ts` (replace `admin-users` - all 10 actions)
- [ ] Create `src/app/api/admin/approve/route.ts` (replace `approve-user`)
- [ ] Create `src/app/api/admin/alert/route.ts` (replace `send-admin-alert`)
- [ ] Create `src/app/api/admin/features/route.ts`
- [ ] Create `src/app/api/admin/usage/route.ts`
- [ ] Create `src/app/api/admin/usage/[userId]/route.ts`
- [ ] Write tests

### 7.3 Utility APIs
- [ ] Create `src/app/api/usage/log/route.ts` (replace `log-usage`)
- [ ] Create `src/app/api/proxy/kosis/route.ts` (replace `kosis-proxy`)
- [ ] Create `src/app/api/health/route.ts` (new - for Lightsail health check)
- [ ] Write tests

### 7.4 Cleanup Job
- [ ] Create `src/app/api/cron/cleanup/route.ts` (replace `cleanup-unverified-users`)
- [ ] Protect with `CRON_SECRET` header check
- [ ] Document: requires external cron trigger (e.g., cron-job.org)

**Deliverables**:
- All 9 Edge Functions replaced (see Appendix D)
- API tests pass with 80%+ coverage
- Health endpoint returns 200

---

## Phase 8: Deployment & Cutover

### 8.1 Update Deploy Script
- [ ] Modify `deploy.sh` to run `bun run build` instead of nginx copy
- [ ] Update Docker build command
- [ ] Remove `--upload-protected` option (no longer needed)
- [ ] Remove `--deploy-functions` option (no longer needed)
- [ ] Test: `./deploy.sh --local` serves Next.js app

### 8.2 Lightsail Deployment
- [ ] Build production image
- [ ] Push to Lightsail: `aws lightsail push-container-image ...`
- [ ] Verify health check passes
- [ ] Test login flow end-to-end

### 8.3 DNS & SSL
- [ ] Verify `https://kcol.kr` works
- [ ] Verify `https://www.kcol.kr` works
- [ ] Verify old URLs redirect per Appendix A

### 8.4 Performance Verification
- [ ] Run: `./scripts/measure-performance.sh https://kcol.kr/k-col/auto-find-section`
- [ ] Confirm TTFB < 500ms
- [ ] Confirm no client waterfall (Chrome DevTools)

### 8.5 Final Checklist
- [ ] All 26 pages render (manual check)
- [ ] Login/signup/logout work
- [ ] Protected pages require auth
- [ ] Admin dashboard works
- [ ] Update `AGENTS.md` with new architecture
- [ ] Update `README.md` with new commands

### 8.6 Cleanup (after 1 week monitoring)
- [ ] Delete Supabase Edge Functions from dashboard
- [ ] Delete `protected-pages` Storage bucket
- [ ] Remove old HTML/JS/CSS files from repo

**Deliverables**:
- Production live on kcol.kr
- Performance target met
- Documentation updated

---

## Rollback Plan

If migration fails after deployment:

1. **Immediate**: `git checkout main && ./deploy.sh`
2. **Supabase**: Edge Functions still exist, no deletion until 1 week stable
3. **DNS**: No changes needed, same Lightsail endpoint

Keep `main` branch unchanged until migration verified (1 week minimum).

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Bun incompatibility | Medium | High | Phase 0 validation; fallback to Node.js |
| Lightsail memory insufficient | Medium | Medium | Upgrade tier ($7→$12/mo); measure in Phase 0 |
| Protected page still slow | Low | High | Profile with `next build --profile`; add ISR caching |
| Auth flow breaks | Medium | High | Comprehensive tests; test each flow before cutover |
| Missing functionality | Medium | Medium | Page-by-page manual checklist |
| **Calculation logic accidentally exposed** | Low | **Critical** | Verify bundle contents after every build; add CI check |

---

## Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Protected page TTFB | 2-3s | <500ms | `scripts/measure-performance.sh` |
| Docker image size | ~50MB | <200MB | `docker images` |
| Build time | N/A | <60s | `time bun run build` |
| API test coverage | 0% | >80% | `bun test --coverage` |
| **Calculation code in client** | **YES (exposed)** | **NO (server-only)** | **Browser DevTools Sources tab** |

---

## Estimated Timeline

| Phase | Duration | Cumulative |
|-------|----------|------------|
| Phase 0: Validation | 2-4 hours | 4 hours |
| Phase 1: Setup | 2-3 hours | 7 hours |
| Phase 2: Infrastructure | 4-6 hours | 13 hours |
| Phase 3: Auth Pages | 4-6 hours | 19 hours |
| Phase 4: Public Pages | 6-8 hours | 27 hours |
| Phase 5: Protected Pages | 6-8 hours | 35 hours |
| Phase 6: Admin | 3-4 hours | 39 hours |
| Phase 7: API Routes | 4-6 hours | 45 hours |
| Phase 8: Deployment | 2-4 hours | 49 hours |

**Total**: ~50 hours of development work

---

## Notes

- All work on `feature/nextjs-migration` branch
- TDD: Write tests before implementation where practical
- Commit frequently with descriptive messages
- Keep `main` branch deployable as rollback
- Reference Appendices A-E for detailed specifications
