# Decisions - Next.js Migration

> Architectural choices, trade-offs made, rationales

---

## [2026-01-24T12:02] Edge Functions Strategy Update

### Decision: Create NEW Next.js API Routes, Keep Existing Edge Functions

**Context**: User clarified that existing Supabase Edge Functions are serving production (kcol.kr).

**Decision**:
1. **DO NOT modify** existing Edge Functions in `supabase/functions/`
2. **Create NEW** Next.js API routes in `src/app/api/` for the beta/Next.js app
3. Production (kcol.kr) continues using Edge Functions
4. Beta (beta.kcol.kr) uses Next.js API routes
5. After migration verified (1 week), deprecate Edge Functions

**Rationale**:
- Zero downtime for production
- Clean separation between old and new systems
- Easy rollback if issues arise

**API Route Mapping** (Phase 7):
| Edge Function | Next.js Route |
|---------------|---------------|
| `serve-protected-page` | N/A (replaced by SSR) |
| `admin-users` | `/api/admin/users` |
| `approve-user` | `/api/admin/approve` |
| `check-email-verified` | `/api/auth/verify-status` (already exists) |
| `signup-user` | `/api/auth/signup` |
| `send-admin-alert` | `/api/admin/alert` |
| `log-usage` | `/api/usage/log` |
| `kosis-proxy` | `/api/proxy/kosis` |
| `cleanup-unverified-users` | `/api/cron/cleanup` |

---


### Architecture Decisions

1. **Keep Supabase Auth + DB, deprecate Edge Functions**
   - Rationale: Preserve existing users, consolidate server logic into Next.js
   - Trade-off: Need to migrate 9 Edge Functions to API routes

2. **Server-side calculations via Server Actions**
   - Rationale: Protect proprietary algorithms from client exposure
   - Trade-off: Slightly more latency for calculations, but security is priority

3. **Single package (no monorepo)**
   - Rationale: Simpler for this project size, faster to set up
   - Trade-off: Less separation of concerns

4. **Tailwind CSS**
   - Rationale: Fast development, utility-first, good DX
   - Trade-off: Need to convert existing CSS

---

