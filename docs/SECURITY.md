# Security Documentation

> K-COL Steel Column Design Platform - Security Architecture
> Last updated: 2026-01-25

## Overview

This document describes the security measures implemented in the SongDoPartners homepage (K-COL platform) to protect proprietary calculation algorithms, user data, and system integrity.

---

## 1. Proprietary Calculation Protection

### Problem
The K-COL platform contains proprietary steel column design algorithms that must NOT be exposed to clients. In traditional client-side JavaScript applications, all code is visible in browser DevTools.

### Solution: Server Actions with `'use server'`

All calculation logic is protected using Next.js Server Actions, which execute exclusively on the server.

#### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  React Components                                        │    │
│  │  - Form inputs (dimensions, materials, loads)            │    │
│  │  - Results display                                       │    │
│  │  - NO calculation logic                                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              │ Server Action Call                │
│                              │ (encrypted RPC, not REST)         │
│                              ▼                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SERVER (Node.js)                          │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  src/actions/calculate.ts ('use server')                 │    │
│  │  - calculateCrossHColumn()                               │    │
│  │  - findOptimalSection()                                  │    │
│  │  - generateBOQ()                                         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  src/lib/calculations/ ('use server')                    │    │
│  │  - cross-h-column.ts (AISC 360 formulas)                 │    │
│  │  - steel-section.ts (section optimization)               │    │
│  │  - boq.ts (bill of quantities)                           │    │
│  │  *** NEVER included in client bundles ***                │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

#### Key Files

| File | Purpose | Protection |
|------|---------|------------|
| `src/actions/calculate.ts` | Server Action entry points | `'use server'` directive |
| `src/lib/calculations/cross-h-column.ts` | Cross-H column calculations | `'use server'` directive |
| `src/lib/calculations/steel-section.ts` | Section optimization | `'use server'` directive |
| `src/lib/calculations/boq.ts` | Bill of quantities | `'use server'` directive |

#### Verification

To verify calculations are NOT in client bundles:

```bash
# Build the application
bun run build

# Search for calculation code in client chunks
grep -r "calculateSection" .next/static/chunks/
# Should return NO results

# Search for AISC formulas
grep -r "phi_Pn" .next/static/chunks/
# Should return NO results
```

### Performance

Server Actions provide excellent performance:

| Metric | Value |
|--------|-------|
| Protected page TTFB | ~75ms |
| Calculation response | ~50-100ms |
| Previous (Edge Functions) | 2-3 seconds |

---

## 2. Authentication & Authorization

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     Authentication Flow                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User visits protected page (e.g., /k-col/calculator)        │
│                              │                                   │
│                              ▼                                   │
│  2. Proxy checks session (src/proxy.ts)                        │
│     - Calls supabase.auth.getUser()                             │
│     - Validates JWT token                                       │
│                              │                                   │
│              ┌───────────────┴───────────────┐                  │
│              │                               │                   │
│              ▼                               ▼                   │
│     No valid session              Valid session                  │
│              │                               │                   │
│              ▼                               ▼                   │
│  3a. Redirect to /login       3b. Check permissions              │
│      with ?redirect=...           (layout.tsx)                   │
│                                              │                   │
│                              ┌───────────────┴───────────────┐  │
│                              │                               │   │
│                              ▼                               ▼   │
│                     Not approved              Approved           │
│                              │                               │   │
│                              ▼                               ▼   │
│                  Show "Pending" message      Render page         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Protected Routes

Defined in `src/proxy.ts`:

```typescript
const PROTECTED_PATTERNS = [
  '/k-col/auto-find-section',
  '/k-col/calculator',
  '/k-col/boq-report',
  '/k-col/developer-guide',
  '/k-col/print',
  '/k-col/calc-data-1',
  '/k-col/calc-data-2',
  '/admin',
];
```

### Permission System

Defined in `src/app/(protected)/layout.tsx`:

| Route | Required Permission |
|-------|---------------------|
| `/k-col/*` (calculators) | `access_column` |
| `/admin` | `role === 'admin'` |

### User Profile Fields

| Field | Type | Purpose |
|-------|------|---------|
| `id` | UUID | Links to auth.users |
| `role` | string | 'user' or 'admin' |
| `is_approved` | boolean | Account approval status |
| `access_column` | boolean | K-COL calculator access |
| `access_beam` | boolean | K-BEAM calculator access (future) |

---

## 3. Rate Limiting

### Implementation

Located in `src/lib/rate-limit.ts`:

```typescript
// In-memory rate limiter
// Default: 60 requests per second per IP
export function rateLimit(ip: string, limit: number = 60): boolean
```

### Configuration

| Parameter | Value |
|-----------|-------|
| Window | 1 second |
| Default limit | 60 requests/second |
| Cleanup interval | 5 minutes |

### Proxy Integration

```typescript
// src/proxy.ts
const ip = request.headers.get('x-forwarded-for') || 
           request.headers.get('x-real-ip') || 
           'unknown';
if (!rateLimit(ip, 60)) {
  return new NextResponse('Too Many Requests', { status: 429 });
}
```

### RSC Prefetch Exemption

React Server Component prefetch requests (`?_rsc=...`) are exempted from rate limiting to prevent false positives during normal navigation.

---

## 4. Security Headers

Configured in `next.config.ts`:

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `SAMEORIGIN` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `X-XSS-Protection` | `1; mode=block` | XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Control referrer info |
| `Permissions-Policy` | `geolocation=(), microphone=(), camera=(), payment=()` | Disable unused APIs |
| `Content-Security-Policy` | See below | Control resource loading |

### Content Security Policy

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://quotation-api.dunamu.com https://open.er-api.com;
frame-src 'self' https://www.youtube.com https://youtube.com;
```

---

## 5. Blocked Patterns

Malicious request patterns are blocked at the middleware level:

```typescript
const BLOCKED_PATTERNS = [
  /^\/\.git/,      // Git directory access
  /^\/\.env/,      // Environment files
  /\/wp-admin/,    // WordPress admin (common attack vector)
  /\/wp-login/,    // WordPress login
  /\.php$/,        // PHP files (not used)
];
```

These return 404 immediately without processing.

---

## 6. Environment Variables

### Required Variables

| Variable | Purpose | Exposure |
|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Client (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Client (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key | Server only |

### Security Rules

1. **NEVER** expose `SUPABASE_SERVICE_ROLE_KEY` to client
2. **NEVER** commit `.env.local` to git
3. Variables without `NEXT_PUBLIC_` prefix are server-only

---

## 7. Database Security (Supabase RLS)

### Row Level Security

All tables have RLS enabled. Key policies:

#### `user_profiles` table

```sql
-- Users can only read their own profile
CREATE POLICY "Users can view own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

-- Only admins can update profiles
CREATE POLICY "Admins can update profiles"
ON user_profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### Service Role Usage

The `SERVICE_ROLE_KEY` bypasses RLS and is used only for:
- Admin operations (user management)
- Cron jobs (scheduled tasks)
- Server-side operations requiring elevated privileges

---

## 8. OAuth Security

### Supported Providers

- Google OAuth 2.0
- Kakao OAuth

### Redirect URL Validation

OAuth callbacks validate the redirect URL to prevent open redirect attacks:

```typescript
// src/app/auth/callback/route.ts
const allowedHosts = ['kcol.kr', 'www.kcol.kr', 'beta.kcol.kr', 'localhost'];
```

### Email Linking

Accounts with the same email are automatically linked (configured in Supabase Dashboard).

---

## 9. Security Checklist

### Before Deployment

- [ ] Run `bun run typecheck` - no type errors
- [ ] Run `bun run test` - all tests pass
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Check security headers: `curl -I https://kcol.kr/`
- [ ] Verify protected routes redirect to login
- [ ] Confirm calculations not in client bundles

### Periodic Review

- [ ] Review Supabase RLS policies
- [ ] Check for dependency vulnerabilities: `bun audit`
- [ ] Review access logs for suspicious patterns
- [ ] Verify rate limiting is effective

---

## 10. Incident Response

### If Credentials Are Exposed

1. **Immediately** rotate the exposed key in Supabase Dashboard
2. Update `.env.local` with new key
3. Redeploy application
4. Review access logs for unauthorized access
5. Notify affected users if necessary

### If Calculation Code Is Exposed

1. Verify `'use server'` directive is present in all calculation files
2. Rebuild and redeploy
3. Check client bundles for leaked code
4. Review git history for accidental commits

---

## Contact

For security concerns, contact: sbd_pmo@naver.com
