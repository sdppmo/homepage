# Authentication System Documentation

> **Project**: SongDoPartners Homepage (K-COL)
> **Last Updated**: 2026-01-25
> **Stack**: Next.js 15 + Supabase Auth + @supabase/ssr

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           AUTHENTICATION FLOW                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────┐    ┌──────────────┐    ┌─────────────────┐                │
│  │  Browser │───▶│  Middleware  │───▶│  Protected Page │                │
│  │  Client  │    │  (cookies)   │    │  (Server-side)  │                │
│  └──────────┘    └──────────────┘    └─────────────────┘                │
│       │                 │                     │                          │
│       │                 │                     │                          │
│       ▼                 ▼                     ▼                          │
│  ┌──────────┐    ┌──────────────┐    ┌─────────────────┐                │
│  │ Supabase │    │   Session    │    │   User Profile  │                │
│  │   Auth   │    │   Refresh    │    │   (Database)    │                │
│  └──────────┘    └──────────────┘    └─────────────────┘                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
src/
├── lib/supabase/
│   ├── client.ts          # Browser client (createBrowserClient)
│   ├── server.ts          # Server client (createServerClient) + Admin client
│   └── middleware.ts      # Middleware client for session refresh
│
├── proxy.ts               # Route protection + rate limiting (Next.js 16+)
│
├── app/
│   ├── (auth)/            # Auth pages (public)
│   │   ├── layout.tsx     # Shared auth page layout
│   │   ├── login/
│   │   │   ├── page.tsx   # Login UI
│   │   │   └── actions.ts # Server actions (login, OAuth)
│   │   ├── signup/
│   │   │   └── page.tsx   # Signup UI
│   │   ├── pending/
│   │   │   └── page.tsx   # Email verification waiting
│   │   └── reset-password/
│   │       └── page.tsx   # Password reset
│   │
│   ├── (protected)/       # Protected pages (requires auth)
│   │   ├── layout.tsx     # Auth check + permission check
│   │   ├── admin/         # Admin dashboard
│   │   └── k-col/         # K-COL calculators
│   │
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts   # OAuth callback handler
│   │
│   └── api/auth/
│       ├── signup/
│       │   └── route.ts   # Signup API (admin client)
│       ├── verify-status/
│       │   └── route.ts   # Email verification check
│       └── logout/
│           └── route.ts   # Server-side logout
│
└── components/layout/
    └── AuthSection.tsx    # Login/logout UI component
```

---

## Supabase Clients

### 1. Browser Client (`src/lib/supabase/client.ts`)

Used in client components (`'use client'`).

```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**Usage**: AuthSection, signup form, password reset

### 2. Server Client (`src/lib/supabase/server.ts`)

Used in Server Components, Server Actions, and API routes.

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) { /* set cookies */ },
    },
  });
}
```

**Usage**: Protected layout, login action, logout API

### 3. Admin Client (`src/lib/supabase/server.ts`)

Uses `SUPABASE_SERVICE_ROLE_KEY` for admin operations.

```typescript
export function createAdminClient() {
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
```

**Usage**: Signup API (create user), admin operations

### 4. Middleware Client (`src/lib/supabase/middleware.ts`)

Used in Next.js middleware for session refresh.

```typescript
export async function updateSession(request: NextRequest) {
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) { /* set on request and response */ },
    },
  });
  
  const { data: { session } } = await supabase.auth.getSession();
  return { user: session?.user ?? null, response };
}
```

**Key**: Uses `getSession()` (fast, local) not `getUser()` (slow, network call)

---

## Authentication Flows

### 1. Email/Password Login

```
User                    Login Page              Server Action           Supabase
  │                         │                        │                     │
  │─── Enter credentials ──▶│                        │                     │
  │                         │─── login() ───────────▶│                     │
  │                         │                        │─── signInWithPassword ──▶│
  │                         │                        │◀── session + cookies ────│
  │                         │◀── redirect(/) ────────│                     │
  │◀── Page with session ───│                        │                     │
```

**Files**: 
- `src/app/(auth)/login/page.tsx` - UI
- `src/app/(auth)/login/actions.ts` - `login()` server action

### 2. OAuth Login (Google/Kakao)

```
User                    Login Page              Server Action           Supabase           OAuth Provider
  │                         │                        │                     │                     │
  │─── Click Google ───────▶│                        │                     │                     │
  │                         │─── signInWithGoogle() ▶│                     │                     │
  │                         │                        │─── signInWithOAuth ▶│                     │
  │                         │                        │◀── OAuth URL ────────│                     │
  │◀── redirect(OAuth URL) ─│                        │                     │                     │
  │─────────────────────────────────────────────────────────────────────────────── Login ──────▶│
  │◀────────────────────────────────────────────────────────────────────────── code + state ───│
  │─── /auth/callback?code=xxx ──────────────────────────────────────────────▶│                │
  │                         │                        │◀── exchangeCodeForSession ──────────────│
  │                         │                        │─── Create profile if needed ────────────▶│
  │◀── redirect(/) ─────────│                        │                     │                     │
```

**Files**:
- `src/app/(auth)/login/actions.ts` - `signInWithGoogle()`, `signInWithKakao()`
- `src/app/auth/callback/route.ts` - OAuth callback handler

**OAuth Callback Logic**:
1. Exchange code for session
2. Check if `user_profiles` record exists
3. If not, create profile (auto-approve OAuth users)
4. Redirect to intended destination

### 3. Signup Flow

```
User                    Signup Page             Supabase Auth           Pending Page
  │                         │                        │                     │
  │─── Fill form ──────────▶│                        │                     │
  │                         │─── signUp() ──────────▶│                     │
  │                         │                        │─── Send verification email
  │                         │─── Store credentials in sessionStorage       │
  │                         │─── redirect(/pending) ─────────────────────▶│
  │                         │                        │                     │─── Poll /api/auth/verify-status
  │                         │                        │                     │    every 3 seconds
  │─── Click email link ────────────────────────────▶│                     │
  │                         │                        │─── Mark verified ───│
  │                         │                        │                     │◀── verified: true
  │                         │                        │                     │─── Auto-login with stored credentials
  │◀── redirect(/) ─────────────────────────────────────────────────────────│
```

**Files**:
- `src/app/(auth)/signup/page.tsx` - Signup form with password validation
- `src/app/(auth)/pending/page.tsx` - Verification waiting page
- `src/app/api/auth/verify-status/route.ts` - Check verification status

**Security**:
- Credentials stored in `sessionStorage` (cleared on tab close)
- Auto-cleared after 10 minutes
- Cleared immediately after login attempt

### 4. Logout Flow

```
User                    AuthSection             Logout API              Supabase
  │                         │                        │                     │
  │─── Click Logout ───────▶│                        │                     │
  │                         │─── POST /api/auth/logout ─────────────────▶│
  │                         │                        │─── signOut() ──────▶│
  │                         │                        │◀── Clear cookies ───│
  │                         │◀── success ────────────│                     │
  │                         │─── supabase.auth.signOut() (client) ───────▶│
  │                         │─── window.location.href = '/' ──────────────│
  │◀── Homepage (logged out) │                        │                     │
```

**Files**:
- `src/components/layout/AuthSection.tsx` - `handleLogout()`
- `src/app/api/auth/logout/route.ts` - Server-side cookie clearing

**Why Server-Side Logout?**
- Client-side `signOut()` clears local state but may not clear server cookies
- Server-side logout via `@supabase/ssr` properly clears HTTP-only cookies
- Both are called for complete session termination

### 5. Password Reset Flow

```
User                    Reset Page              Supabase Auth
  │                         │                        │
  │─── Enter email ────────▶│                        │
  │                         │─── resetPasswordForEmail() ──▶│
  │                         │                        │─── Send reset email
  │◀── Check email ─────────│                        │
  │                         │                        │
  │─── Click reset link ───▶│ (with token)           │
  │                         │─── updateUser({ password }) ──▶│
  │                         │◀── success ────────────│
  │◀── redirect(/login) ────│                        │
```

**File**: `src/app/(auth)/reset-password/page.tsx`

---

## Route Protection

### Proxy (`src/proxy.ts`)

Runs on every request (except static files). Next.js 16 renamed middleware to proxy.

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

export async function proxy(request: NextRequest) {
  // 1. Block malicious paths (.git, .env, wp-admin)
  // 2. Rate limiting (60 req/s per IP)
  // 3. Session refresh via updateSession()
  // 4. Redirect unauthenticated users to /login
}
```

### Protected Layout (`src/app/(protected)/layout.tsx`)

Server-side checks after middleware passes.

```typescript
export default async function ProtectedLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) redirect('/login');
  
  const profile = await getUserProfile(user.id);
  
  if (!profile) return <ProfileError />;
  if (!profile.is_approved) return <PendingApproval />;
  
  return <>{children}</>;
}
```

**Permission Checks**:
- `is_approved` - User must be approved by admin
- `access_column` - Required for K-COL pages
- `access_beam` - Required for beam pages (future)
- `role === 'admin'` - Required for admin dashboard

---

## Session Management

### Cookie Structure

Supabase SSR uses HTTP-only cookies:
- `sb-<project-ref>-auth-token` - Access token
- `sb-<project-ref>-auth-token-code-verifier` - PKCE verifier (OAuth)

### Session Refresh

Handled automatically by middleware:
1. `updateSession()` reads cookies
2. If token expired, Supabase SDK refreshes automatically
3. New cookies set on response

### Performance Optimization

**Middleware uses `getSession()` not `getUser()`**:
- `getSession()` - Reads JWT from cookies, validates locally (~0ms)
- `getUser()` - Network call to Supabase server (~200-500ms)

For route protection, `getSession()` is sufficient. The JWT signature is validated locally.

---

## Database Schema

### `user_profiles` Table

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  business_name TEXT,
  business_number TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',        -- 'user' | 'admin'
  is_approved BOOLEAN DEFAULT FALSE,
  access_column BOOLEAN DEFAULT FALSE,
  access_beam BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Profile Creation

**Email Signup**: Profile created by `/api/auth/signup` after user creation
**OAuth Signup**: Profile created by `/auth/callback` after first OAuth login

---

## Environment Variables

```bash
# Public (exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Server-only (never exposed)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Supabase Dashboard Configuration

### Authentication > Providers

| Provider | Status | Notes |
|----------|--------|-------|
| Email | Enabled | Requires email verification |
| Google | Enabled | Requires Google Cloud Console setup |
| Kakao | Enabled | Requires Kakao Developers setup |

### Authentication > URL Configuration

| Setting | Value |
|---------|-------|
| Site URL | `https://kcol.kr` |
| Redirect URLs | `https://kcol.kr/**`, `https://www.kcol.kr/**`, `https://beta.kcol.kr/**` |

### Authentication > Email Templates

Custom Korean templates for:
- Confirm Signup (회원가입 인증)
- Reset Password (비밀번호 재설정)

---

## Security Considerations

### 1. Never Expose Service Role Key
- Only use in server-side code
- Never import in client components

### 2. PKCE for OAuth
- Supabase uses PKCE (Proof Key for Code Exchange) by default
- Code verifier stored in HTTP-only cookie

### 3. Session Security
- HTTP-only cookies prevent XSS access
- Secure flag set in production (HTTPS only)
- SameSite=Lax prevents CSRF

### 4. Rate Limiting
- 60 requests/second per IP
- Prevents brute force attacks

### 5. Password Requirements
- Minimum 8 characters
- Lowercase letter (a-z)
- Uppercase letter (A-Z)
- Number (0-9)
- Special character (!@#$%^&*...)

---

## Troubleshooting

### Logout Not Working
**Symptom**: User appears logged in after clicking logout
**Cause**: Client-side signOut() doesn't clear server cookies
**Solution**: Call `/api/auth/logout` before client signOut()

### OAuth Redirect to Wrong URL
**Symptom**: After OAuth, redirects to Supabase URL instead of app
**Cause**: Using `request.url` instead of `host` header in callback
**Solution**: Use `getBaseUrl()` helper that reads `x-forwarded-host` header

### Session Check Slow
**Symptom**: Auth check takes 500ms+ on every page load
**Cause**: Using `getUser()` in middleware (network call)
**Solution**: Use `getSession()` instead (local JWT validation)

### Protected Page Shows Briefly Before Redirect
**Symptom**: Flash of protected content before login redirect
**Cause**: Client-side auth check instead of server-side
**Solution**: Use Server Components with `redirect()` in layout

---

## Testing Checklist

- [ ] Email login works
- [ ] Google OAuth login works
- [ ] Kakao OAuth login works
- [ ] Signup creates user and profile
- [ ] Email verification flow works
- [ ] Logout clears session completely
- [ ] Protected pages redirect to login
- [ ] Admin pages require admin role
- [ ] Password reset flow works
- [ ] Session persists across page refreshes
- [ ] Session expires after inactivity

---

## Related Files

- `AGENTS.md` - Project context for AI agents
- `docs/SECURITY.md` - Security checklist
- `.env.local` - Environment variables (git-ignored)
