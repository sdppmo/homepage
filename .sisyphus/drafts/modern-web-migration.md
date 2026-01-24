# Draft: Modern Web Framework Migration

## Requirements (confirmed)
- **Primary Goal**: Migrate from static HTML/Nginx to modern web framework
- **Reference Architecture**: tokscale repository (https://github.com/junhoyeo/tokscale)
- **Technology Stack Target**: Bun, TypeScript
- **Critical Issue**: Protected page loading is slow - needs architectural fix

## Current Architecture Analysis

### What We Have Now
```
Static HTML/CSS/JS → Nginx (Docker) → AWS Lightsail Container Service
                  ↓
Protected pages use "Shell + Edge Function" pattern:
1. Shell HTML loads (fast)
2. SDK loads from CDN (slow)
3. Session check (slow)
4. Edge Function invokes Supabase Storage download (slow)
5. document.write() replaces page (blocking, janky)
```

### Key Pain Points Identified
1. **Multiple Round Trips**: Shell → SDK → Session → Edge Function → Storage → Render
2. **Cold Starts**: Supabase Edge Functions may have cold start latency
3. **CDN Dependency**: Supabase SDK loaded from jsDelivr on every protected page
4. **`document.write()`**: Blocking operation, poor UX

### Current File Counts
- 26 HTML files (public + protected)
- 15+ JS files (auth, loaders, UI logic)
- Edge Functions: 9 (auth, admin, protected pages, etc.)
- Storage: Protected HTML stored in Supabase Storage bucket

## tokscale Reference Analysis

### Tech Stack
- **Runtime**: Bun
- **Framework**: Next.js 16.0.7 (App Router)
- **React**: 19.2.0
- **TypeScript**: 5.x
- **ORM**: Drizzle ORM with Neon Serverless Postgres
- **Styling**: styled-components + GitHub Primer
- **Deployment**: Vercel optimized (but adaptable)

### Key Patterns from tokscale
1. **Server Components**: Auth check happens server-side, no client waterfall
2. **Custom Session**: PostgreSQL-backed sessions (not Supabase Auth)
3. **Middleware Auth**: Auth check in Next.js middleware, not client JS
4. **API Routes**: Standard Next.js Route Handlers (`route.ts`)

## Research Findings

### Bun + TypeScript Frameworks
| Framework | Best For | Notes |
|-----------|----------|-------|
| Elysia | Max Bun performance | Bun-native, TypeBox validation |
| Hono | Edge + Portability | Cross-platform (Bun/CF/Node) |
| Next.js + Bun | SSR + React | Most feature-complete |

### Performance Fix Strategy
**Problem**: Client-side waterfall for protected pages

**Solution**: Server-Side Rendering (SSR) with Streaming
1. Auth check happens server-side (middleware)
2. Protected content fetched server-side
3. Single request returns fully-rendered HTML
4. No SDK loading, no Edge Function round-trip

## Confirmed Decisions (from user interview)

### Architecture Decisions
1. **Deployment Platform**: **AWS Lightsail** (keep current infra, Next.js in Docker)
2. **Backend Services**: **Keep Supabase for now** (auth, database) - but architecture should allow future migration to Vercel/Railway/Neon
3. **Migration Approach**: **Big Bang replacement** (replace entire static site with Next.js at once)
4. **Styling**: **Tailwind CSS** (utility-first, fast development)
5. **Testing**: **TDD approach** with Vitest (like tokscale)
6. **Branch Strategy**: Single feature branch `feature/nextjs-migration`

### Implications
- Next.js will run in Docker container on Lightsail (not Vercel serverless)
- Supabase client will be used server-side (SSR) AND client-side
- Need abstraction layer for database access (easier future migration)
- No Supabase Edge Functions needed - Next.js API routes replace them
- All development on `feature/nextjs-migration` branch until complete

## Open Questions (remaining)

### Technical Decisions Needed
1. **Styling approach**: Keep plain CSS or adopt styled-components/Tailwind?
2. **Component library**: None, Primer React, shadcn/ui, or other?
3. **Project structure**: Single package or monorepo?

## Scope Boundaries

### INCLUDE (confirmed)
- Main homepage conversion to React/Next.js
- Auth pages (login, signup, pending, reset-password)
- Protected pages (calculators, BOQ) - NOW SSR, no more slow loading
- Admin panel
- Product pages (K-product, consulting, papers, etc.)
- All public pages

### EXCLUDE (confirmed)
- PDF/static asset serving (use Next.js public folder or CDN)
- Database schema changes (keep existing user_profiles, usage_logs, etc.)
- Supabase Migration scripts (future task)

### TO BE REPLACED
- Nginx static serving → Next.js
- Supabase Edge Functions → Next.js API routes
- Client-side auth (auth.js) → Server Components + middleware
- protected-loader.js → Direct SSR page components

## Test Strategy Decision
- **Infrastructure exists**: NO (currently no package.json or test framework)
- **User wants tests**: YES (TDD approach)
- **Framework choice**: Vitest (matches tokscale, fast with Bun)
- **QA approach**: TDD - write tests first, then implement
