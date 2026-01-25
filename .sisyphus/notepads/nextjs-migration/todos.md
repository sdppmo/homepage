## Todos (Next.js Migration – Phase 5.1)

- [x] (1) Create server-only calculation modules under `src/lib/calculations/`
  - [x] steel-section.ts (Single H, Cross H section, optimal search, unit weight)
  - [x] cross-h-column.ts (quickCalculate port)
  - [x] boq.ts (BOQ grouping + plate/rolled-H generators)
- [x] (2) Add Server Actions wrapper in `src/actions/calculate.ts`
- [x] (3) Verify: `bun x tsc --noEmit` passes
- [x] (4) Verify: `bun run build` passes
- [x] (5) Update notepads (learnings/issues/decisions if needed)

## Status: COMPLETE (2026-01-25)

All Phase 5.1 tasks completed. Server-side calculations implemented and verified.

---

## Final Status (2026-01-25)

**Migration Progress: 170/173 tasks complete (98.3%)**

### Completed This Session
- [x] Git commit: Fixed RSC prefetch rate limiting, Dunamu API URL, removed .next/ from git
- [x] Pushed to feature/nextjs-migration branch
- [x] Beta verified healthy (https://beta.kcol.kr/health → OK)

### Remaining Tasks (BLOCKED until 2026-02-01)
The following 3 tasks are intentionally blocked for rollback safety:

1. `[ ]` Delete Supabase Edge Functions from dashboard
2. `[ ]` Delete `protected-pages` Storage bucket
3. `[ ]` Remove old HTML/JS/CSS files from repo

**Reason**: 1 week stability period required before cleanup. If issues arise, we can rollback to the old nginx+Edge Functions architecture.

**Unblock Date**: 2026-02-01 (6 days from now)

### Deployment Status
| Environment | URL | Version | Status |
|-------------|-----|---------|--------|
| Production | https://kcol.kr | Old (nginx) | User reverted |
| Beta | https://beta.kcol.kr | Next.js v5 | ✅ Running |

### Next Actions (when user is ready)
1. Test beta.kcol.kr thoroughly
2. Deploy to production: `./deploy.sh` (requires user approval)
3. After 2026-02-01: Execute cleanup tasks
