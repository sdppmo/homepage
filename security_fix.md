# Security Bug Fix Report

**Project**: SongDoPartners Homepage (K-COL)  
**Date**: 2026-01-25  
**Branch**: `feature/nextjs-migration`

---

## Summary

| Severity | Found | Fixed |
|----------|-------|-------|
| CRITICAL | 7 | 7 |
| HIGH | 8 | 8 |
| MEDIUM | 6 | 6 |
| LOW | 8 | 5 |
| **Total** | **29** | **26** |

**Note**: 3 LOW issues in `src/features/admin/admin.ts` (Chart.js `any` types) were intentionally left unfixed as they are external library types in a legacy file.

---

## CRITICAL Fixes (7/7)

### 1. KOSIS Proxy API - Missing Authentication
**File**: `src/app/api/proxy/kosis/route.ts`  
**Commit**: `a443ff1`

**Before**: API endpoint was publicly accessible without authentication.

**After**: 
- Added Supabase session check via `createClient()`
- Returns 401 if no valid session
- Added 30-second timeout to prevent hanging requests

### 2. Verify-Status API - No Rate Limiting
**File**: `src/app/api/auth/verify-status/route.ts`  
**Commit**: `032f3f1`

**Before**: Endpoint could be called unlimited times, enabling email enumeration attacks.

**After**:
- Added in-memory rate limiting (5 requests per second per IP)
- Added email format validation
- Sanitized error messages to prevent information leakage

### 3. Password in sessionStorage - XSS Risk
**File**: `src/app/(auth)/pending/page.tsx`  
**Commit**: `21bbaad`

**Before**: User password was stored in `sessionStorage` for auto-login after email verification.

**After**:
- Removed all password storage from client-side
- After email verification, user is redirected to login page
- Clear messaging explains the redirect

### 4. Calculate.ts Server Actions - Missing Auth
**File**: `src/actions/calculate.ts`  
**Commit**: `4f6c6fd`

**Before**: Server Actions could be called without authentication.

**After**:
- Added `requireAuth()` helper function
- All exported Server Actions now check authentication first
- Returns error if user is not authenticated

### 5. BOQ.ts Server Actions - Missing Auth
**File**: `src/actions/boq.ts`  
**Commit**: `4f6c6fd`

**Before**: Server Actions could be called without authentication.

**After**:
- Added `requireAuth()` helper function
- All exported Server Actions now check authentication first
- Returns error if user is not authenticated

### 6. Signup API - No Rate Limiting
**File**: `src/app/api/auth/signup/route.ts`  
**Commit**: `8b26425`

**Before**: Signup endpoint had no rate limiting, enabling brute force attacks.

**After**:
- Added in-memory rate limiting (3 requests per minute per IP)
- Sanitized error messages to prevent information leakage
- Generic error messages for auth failures

### 7. CRON_SECRET - Timing Attack Vulnerability
**File**: `src/app/api/cron/cleanup/route.ts`  
**Commit**: `e82277a`

**Before**: Used simple string comparison (`===`) for secret validation.

**After**:
- Used `crypto.timingSafeEqual()` for constant-time comparison
- Prevents timing attacks that could leak secret length/content

---

## HIGH Fixes (8/8)

### 1-2. Division by Zero Guards
**File**: `src/lib/calculations/boq.ts`  
**Commit**: `4f6c6fd`

Added guards before division operations:
- `totalWeight` check before calculating `averageWeight`
- `totalCount` check before calculating percentages

### 3-4. Unsafe Array Access
**File**: `src/lib/calculations/boq.ts`  
**Commit**: `4f6c6fd`

Added empty array checks:
- Check `sections.length > 0` before accessing `sections[0]`
- Check `results.length > 0` before accessing `results[0]`

### 5-6. Fetch Timeout Missing
**Files**: `src/app/api/proxy/kosis/route.ts`, `src/app/api/admin/alert/route.ts`  
**Commits**: `a443ff1`, `4f6c6fd`

Added `AbortController` with 30-second timeout to all external API calls:
- KOSIS API proxy
- Resend email API

### 7-8. Error Message Exposure
**Files**: `src/app/api/auth/signup/route.ts`, `src/app/api/auth/verify-status/route.ts`  
**Commits**: `8b26425`, `032f3f1`

Sanitized error messages:
- Generic "Authentication failed" instead of specific Supabase errors
- Prevents information leakage about user existence

---

## MEDIUM Fixes (6/6)

### 1. Missing Root Error Boundary
**File**: `src/app/error.tsx` (new)  
**Commit**: `09248ea`

Created root error boundary with:
- Korean UI for error messages
- Reset functionality
- Graceful error handling

### 2. Missing Root Loading State
**File**: `src/app/loading.tsx` (new)  
**Commit**: `09248ea`

Created root loading component with:
- Centered spinner animation
- Consistent with app design

### 3-4. useEffect Missing Dependencies
**File**: `src/app/(auth)/pending/page.tsx`  
**Commit**: `09248ea`

Fixed React anti-patterns:
- Wrapped callback functions in `useCallback`
- Added proper dependency arrays to `useEffect`

### 5-6. router.push Instead of router.replace
**File**: `src/app/(auth)/pending/page.tsx`  
**Commit**: `09248ea`

Changed navigation after auth:
- `router.push()` → `router.replace()`
- Prevents back-button issues after authentication

---

## LOW Fixes (5/8)

### 1. `any` Type in login/actions.ts
**File**: `src/app/(auth)/login/actions.ts`  
**Commit**: (included in LOW bug fix commit)

Added `LoginState` interface to replace `any` type.

### 2. `any` Type in admin/actions.ts
**File**: `src/app/(protected)/admin/actions.ts`  
**Commit**: (this session)

Added proper interfaces:
- `CreateUserData` for user creation
- `UsageStats`, `UserActivity`, etc. for analytics

### 3-5. `any` Types in admin/page.tsx
**File**: `src/app/(protected)/admin/page.tsx`  
**Commit**: (this session)

Fixed:
- `useState<any>` → `useState<UsageStats | null>`
- `catch (error: any)` → `catch (error)` with `instanceof Error` check
- `user: any` in map functions → `user: UserActivity`

### Not Fixed (Intentional)

**File**: `src/features/admin/admin.ts` (lines 34, 39, 40)

Chart.js `any` types left as-is because:
- External library without built-in TypeScript support
- Legacy file (old admin dashboard)
- Adding `@types/chart.js` would be overkill

---

## Major Discovery: .gitignore Issues

During the security audit, we discovered that `.gitignore` had overly broad patterns that were **ignoring critical source directories**:

### Problem
```gitignore
lib/      # Was ignoring src/lib/ (19 files, 2492 lines!)
admin/    # Was ignoring src/app/api/admin/ (8 files, 2113 lines!)
```

### Fix
**Commits**: `7bde0e1`, `41abdc2`

Changed to absolute paths:
```gitignore
/lib/     # Only ignores root /lib/, not src/lib/
/admin/   # Only ignores root /admin/, not src/app/api/admin/
```

### Impact
- **19 files** in `src/lib/` were not being tracked
- **8 files** in admin directories were not being tracked
- Total **4,605 lines of code** were missing from git

---

## Commits Summary

| Commit | Description |
|--------|-------------|
| `a443ff1` | security: add authentication and timeout to KOSIS proxy API |
| `032f3f1` | security: add rate limiting and validation to verify-status API |
| `21bbaad` | security: remove password from sessionStorage (XSS risk) |
| `4f6c6fd` | security: add authentication to Server Actions |
| `8b26425` | security: add rate limiting to signup API |
| `e82277a` | security: use constant-time comparison for CRON_SECRET |
| `09248ea` | fix: add error boundary and loading states, fix React anti-patterns |
| `7bde0e1` | fix: add src/lib directory to git (was incorrectly ignored) |
| `41abdc2` | fix: add admin directories to git (was incorrectly ignored) |

---

## Verification

All fixes verified with:
- `bun run typecheck` - No type errors
- `bun run test` - All tests pass
- `lsp_diagnostics` - No errors in changed files

---

## Recommendations

1. **Add CI/CD security scanning** - Integrate Trivy or similar into GitHub Actions
2. **Add rate limiting middleware** - Consider a centralized rate limiting solution
3. **Security audit schedule** - Run security audits quarterly
4. **Dependency updates** - Keep dependencies updated for security patches
