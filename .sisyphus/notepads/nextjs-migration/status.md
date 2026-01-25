# Next.js Migration Status

## Final Status: 170/173 Tasks Complete (98.3%)

**Last Updated**: 2026-01-25 09:35 KST

## Recent Updates (2026-01-25)

### Bug Fixes Deployed (Commit f011813)
1. **CSP fix** - Added `dunamu.com` and `er-api.com` to `connect-src` for exchange rate widget
2. **Navigation links fix** - Fixed broken hrefs in LeftSidebar.tsx
3. **Layout fix** - Added right padding to MainContent to prevent NEWS section overlap
4. **Rate limit fix** - Increased from 10 to 30 req/s to prevent 429 on RSC prefetch

### Production Deployment
- Version 31 deployed to Lightsail
- All fixes live on https://kcol.kr

## Production Verification

| Domain | Status | Verified |
|--------|--------|----------|
| https://kcol.kr | HTTP 200, Next.js serving | 2026-01-25 |
| https://www.kcol.kr | HTTP 200, Next.js serving | 2026-01-25 |
| https://beta.kcol.kr | HTTP 200, Next.js serving | 2026-01-25 |

## Security Headers Verified

- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin
- Content-Security-Policy: configured
- Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=()

## Blocked Tasks (3 remaining)

All 3 remaining tasks are **intentionally blocked** until 2026-02-01 for rollback safety:

### 1. Delete Supabase Edge Functions
- **Blocker**: Safety period (1 week monitoring)
- **Unblock Date**: 2026-02-01
- **Action**: Delete from Supabase Dashboard → Edge Functions

### 2. Delete `protected-pages` Storage Bucket
- **Blocker**: Safety period (1 week monitoring)
- **Unblock Date**: 2026-02-01
- **Action**: Delete from Supabase Dashboard → Storage

### 3. Remove Old HTML/JS/CSS Files
- **Blocker**: Safety period (1 week monitoring)
- **Unblock Date**: 2026-02-01
- **Action**: `git rm -r pages/ css/ js/ assets/ && git commit && git push`

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
