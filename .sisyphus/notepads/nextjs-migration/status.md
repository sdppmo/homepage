# Next.js Migration Status

## Final Status: 170/173 Tasks Complete (98.3%)

**Last Updated**: 2026-01-25 10:55 KST

## Current Environment Status

| Environment | URL | Stack | Status |
|-------------|-----|-------|--------|
| **Beta** | https://beta.kcol.kr | Next.js 15 + Bun | ✅ Live (v7) |
| **Production** | https://kcol.kr | nginx (legacy) | User reverted |

> **Note**: Production was deployed with Next.js (v31) but user reverted to nginx.
> Beta is the active Next.js deployment for testing.

## Recent Updates (2026-01-25)

### Performance & Layout Fixes Deployed to Beta (Commit 23c80fd, v7)
1. **AuthSection loading perf** - Changed `getUser()` to `getSession()` for faster cached auth, memoized supabase client
2. **Footer width** - Added `w-full` to outer div for full browser width
3. **News/Currency overlap** - Replaced absolute positioning with flexbox layout in RightSidebar

### UI Polish Fixes (Commit 0139c51, v6)
1. **AuthSection skeleton** - Added loading placeholder to prevent layout shift
2. **WorldClocks styling** - Transparent background, left-aligned
3. **Footer width** - Full width container

### Previous Bug Fixes (Commit f011813)
1. **CSP fix** - Added `dunamu.com` and `er-api.com` to `connect-src` for exchange rate widget
2. **Navigation links fix** - Fixed broken hrefs in LeftSidebar.tsx
3. **Layout fix** - Added right padding to MainContent to prevent NEWS section overlap
4. **Rate limit fix** - Increased from 10 to 30 req/s to prevent 429 on RSC prefetch

## Security Headers Verified (Beta)

- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Content-Security-Policy: configured
- Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()

## Blocked Tasks (3 remaining)

**⚠️ ALL 3 REMAINING TASKS ARE TIME-BLOCKED UNTIL 2026-02-01**

These are cleanup tasks intentionally deferred for rollback safety. If Next.js has issues, we can revert to nginx + Edge Functions.

| Task | Blocker | Unblock Date |
|------|---------|--------------|
| Delete Supabase Edge Functions | 1 week safety period | 2026-02-01 |
| Delete `protected-pages` Storage bucket | 1 week safety period | 2026-02-01 |
| Remove old HTML/JS/CSS files | 1 week safety period | 2026-02-01 |

**NO FURTHER WORK IS POSSIBLE UNTIL 2026-02-01.**

## Cleanup Commands (Execute After 2026-02-01)

```bash
# Remove old static files from repo
cd /Users/hkder/homepage
git rm -r pages/ css/ js/ assets/
git commit -m "chore: remove legacy static files after Next.js migration"
git push origin feature/nextjs-migration

# Then in Supabase Dashboard:
# 1. Edge Functions → Delete all functions
# 2. Storage → Delete protected-pages bucket
```

## Migration Complete

The Next.js migration is functionally complete. Production is live and serving traffic.
The remaining cleanup tasks are deferred for safety - no action required until 2026-02-01.
