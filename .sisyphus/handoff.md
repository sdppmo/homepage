# Handoff: Next.js Migration Project

> **Created**: 2026-01-24 12:52 KST
> **Status**: Planning Phase - Work plan generation in progress
> **Branch**: `feature/nextjs-migration` (to be created)

---

## Project Summary

**Goal**: Migrate SongDoPartners (SDP) homepage from static HTML/Nginx to modern Next.js/Bun/TypeScript stack.

**Primary Driver**: Protected page loading is slow due to 5-step client-side waterfall:
1. Shell HTML loads
2. Supabase SDK loads from CDN (~200KB)
3. Session check (localStorage + refresh)
4. Edge Function call (`serve-protected-page`)
5. Supabase Storage download → `document.write()`

**Solution**: Server-Side Rendering (SSR) with Next.js eliminates this waterfall entirely.

---

## Confirmed Decisions (User Interview Complete)

| Decision | Choice | Notes |
|----------|--------|-------|
| Deployment Platform | **AWS Lightsail** | Keep current infra, Next.js in Docker |
| Backend Services | **Keep Supabase** | Auth + Database, but design for future migration |
| Migration Approach | **Big Bang** | Replace entire static site at once |
| Styling | **Tailwind CSS** | Utility-first, fast development |
| Testing | **TDD with Vitest** | Write tests as we build |
| Branch Strategy | **feature/nextjs-migration** | Single feature branch |

---

## Current Architecture (What We Have)

```
homepage/
├── index.html              # Main homepage
├── css/styles.css          # All styles
├── js/                     # 15+ JS files
│   ├── auth.js             # Supabase auth (client-side)
│   ├── auth-config.js      # Supabase credentials
│   ├── protected-loader.js # The slow loading culprit
│   └── ...
├── pages/                  # 26 HTML pages
│   ├── auth/               # login, signup, pending, reset
│   ├── k-col web software/ # calculators (protected)
│   └── K-product/          # product pages
├── supabase/
│   └── functions/          # 10 Edge Functions
├── assets/                 # images, PDFs, PPTs
├── Dockerfile              # nginx:alpine
├── nginx.conf              # security headers, rate limiting
└── deploy.sh               # AWS Lightsail deployment
```

### Key Files to Understand
- `/js/protected-loader.js` - Current slow loading implementation
- `/supabase/functions/serve-protected-page/index.ts` - Edge Function being replaced
- `/js/auth.js` - Client-side Supabase auth (moving to server-side)
- `/deploy.sh` - Will need updates for new stack

---

## Target Architecture (What We're Building)

```
homepage/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Homepage
│   │   ├── (auth)/             # Auth route group
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   └── ...
│   │   ├── (protected)/        # Protected route group
│   │   │   ├── layout.tsx      # Auth check wrapper
│   │   │   └── k-col/
│   │   │       ├── auto-find-section/page.tsx
│   │   │       └── ...
│   │   └── api/                # API routes (replace Edge Functions)
│   │       ├── auth/
│   │       ├── admin/
│   │       └── ...
│   ├── components/             # Shared React components
│   ├── lib/
│   │   ├── supabase/           # Supabase client (server + client)
│   │   └── db/                 # Database queries (abstracted)
│   └── middleware.ts           # Auth middleware
├── public/                     # Static assets (images, PDFs)
├── tests/                      # Vitest tests
├── tailwind.config.ts
├── next.config.ts
├── Dockerfile                  # Bun + Next.js
├── package.json
└── deploy.sh                   # Updated for new stack
```

---

## Metis Gap Analysis (Completed)

### Critical Gaps Identified

1. **Next.js Version**: "Next.js 16" doesn't exist. Use Next.js 15 (latest stable).

2. **Bun Clarification Needed**: Runtime vs Package Manager?
   - **Auto-resolved**: Use Bun as both runtime AND package manager

3. **@supabase/ssr vs auth-helpers**: 
   - **Auto-resolved**: Use `@supabase/ssr` (auth-helpers is deprecated)

4. **Lightsail Memory**: Current Micro tier (512MB) may be insufficient for Next.js SSR
   - **Action**: Test and upgrade if needed

5. **Rate Limiting**: nginx has rate limiting, Next.js doesn't
   - **Auto-resolved**: Implement rate limiting middleware

6. **Security Headers**: nginx sets headers, need to replicate in Next.js
   - **Auto-resolved**: Configure in `next.config.ts` headers

### Guardrails (MUST NOT)

| Forbidden | Reason |
|-----------|--------|
| Database schema changes | Out of scope |
| New auth providers | Keep Supabase only |
| GraphQL/tRPC | Not requested |
| Prisma/Drizzle ORM | Use Supabase client directly |
| Component libraries (shadcn) | Use Tailwind directly |
| State management (Redux) | Use React state |
| CI/CD pipelines | Manual deploy only |
| i18n infrastructure | Not requested |

---

## Migration Plan (High-Level Phases)

### Phase 0: Validation (BLOCKING)
Before any migration, prove the stack works:
1. Create minimal Bun + Next.js 15 + @supabase/ssr app
2. Implement single protected page with middleware auth
3. Build Docker image and deploy to Lightsail
4. Verify memory usage, cold start time, auth flow

**Exit Criteria**: Protected page loads in <500ms on Lightsail

### Phase 1: Project Setup
1. Create `feature/nextjs-migration` branch
2. Initialize Next.js 15 with Bun
3. Configure Tailwind CSS
4. Set up Vitest
5. Create Dockerfile for Bun + Next.js
6. Port environment variables

### Phase 2: Core Infrastructure
1. Implement Supabase clients (server + browser)
2. Create auth middleware
3. Set up protected route layout
4. Implement security headers
5. Add rate limiting middleware

### Phase 3: Auth Pages
1. `/login` - Login page
2. `/signup` - Signup page  
3. `/pending` - Pending approval page
4. `/reset-password` - Password reset

### Phase 4: Public Pages
1. Homepage (`/`)
2. Product pages
3. Papers, Videos, CAD files, etc.
4. Static asset migration to `/public`

### Phase 5: Protected Pages (The Main Goal)
1. Auto Find Section
2. Cross-H Column Calculator
3. BOQ Report
4. Admin dashboard

### Phase 6: API Routes
Replace all 10 Edge Functions:
1. `serve-protected-page` → SSR (no longer needed)
2. `admin-users` → `/api/admin/users`
3. `approve-user` → `/api/admin/approve`
4. `check-email-verified` → `/api/auth/verify-email`
5. `signup-user` → `/api/auth/signup`
6. `send-admin-alert` → `/api/admin/alert`
7. `log-usage` → `/api/usage/log`
8. `kosis-proxy` → `/api/proxy/kosis`
9. `cleanup-unverified-users` → Cron job or API
10. `serve-admin-page` → SSR admin route

### Phase 7: Deployment & Cutover
1. Update `deploy.sh` for new stack
2. Test on Lightsail
3. DNS cutover (if needed)
4. Verify all functionality
5. Monitor for issues

---

## Acceptance Criteria

### Functional
- [ ] All 26 pages render correctly
- [ ] Login/signup/logout flows work
- [ ] Protected pages load without waterfall (<500ms)
- [ ] Admin dashboard functions
- [ ] Email verification works
- [ ] Password reset works
- [ ] Permission checks enforced

### Non-Functional
- [ ] Docker image builds successfully
- [ ] Runs on Lightsail (may need tier upgrade)
- [ ] Health check endpoint works
- [ ] HTTPS via Lightsail load balancer
- [ ] Custom domains work (kcol.kr)

### Testing
- [ ] Vitest configured
- [ ] API routes have unit tests
- [ ] Auth flow has integration tests

---

## Open Questions (Need User Input)

1. **URL Structure**: Remove `.html` extensions? (e.g., `/pages/auth/login.html` → `/login`)
   - Recommendation: Yes, use clean URLs with redirects for old URLs

2. **World Clocks Feature**: Keep or drop?
   - Current: `clocks.js` shows world clocks on homepage

3. **Performance Target**: What's acceptable load time for protected pages?
   - Recommendation: <500ms (currently 2-3 seconds)

---

## Resources & References

### tokscale Repository (Reference)
- URL: https://github.com/junhoyeo/tokscale
- Tech: Next.js 16, Bun, styled-components, Drizzle ORM
- Key patterns: Server Components, custom sessions, middleware auth

### Key Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [@supabase/ssr](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Bun + Next.js](https://bun.sh/guides/ecosystem/nextjs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vitest](https://vitest.dev/)

### Current Project Files
- Draft: `.sisyphus/drafts/modern-web-migration.md`
- This handoff: `.sisyphus/handoff.md`

---

## Next Steps for Continuing Session

1. **Review this handoff** to understand context
2. **Answer open questions** if user hasn't already
3. **Generate detailed work plan** to `.sisyphus/plans/nextjs-migration.md`
4. **Ask about Momus review** (high accuracy mode)
5. **Create feature branch** and begin Phase 0 validation

---

## Commands to Resume

```bash
# Read the draft
cat .sisyphus/drafts/modern-web-migration.md

# Read this handoff
cat .sisyphus/handoff.md

# When ready to start work
git checkout -b feature/nextjs-migration
```

---

*Handoff created by Sisyphus planning session. Continue with `/plan` or start work directly.*
