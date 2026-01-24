# Beta Site - Next.js Migration

> **URL**: https://beta.kcol.kr
> **Status**: In Development
> **Branch**: `feature/nextjs-migration`

---

## What Is This?

This is the **beta version** of the SongDoPartners (K-COL) website, being migrated from static HTML/Nginx to **Next.js 15 + Bun + TypeScript**.

**Production site**: https://kcol.kr (unchanged, still running nginx)
**Beta site**: https://beta.kcol.kr (this Next.js version)

---

## Why This Migration?

### Current Problems (Production)
1. **Slow protected pages**: 2-3 second load times due to Edge Function waterfall
2. **Exposed calculation logic**: Proprietary algorithms visible in client-side JavaScript
3. **Complex deployment**: Separate Edge Functions, Storage buckets, nginx config

### Goals
1. **Fast protected pages**: Target <500ms TTFB via Server-Side Rendering
2. **Protected calculations**: All proprietary logic runs server-side only
3. **Simplified stack**: Single Next.js app replaces nginx + Edge Functions

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Next.js 16.1.4 (App Router) |
| Runtime | Bun 1.3.5 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth | Supabase Auth (SSR) |
| Database | Supabase PostgreSQL |
| Hosting | AWS Lightsail Container |

---

## Quick Start (Development)

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Open http://localhost:3000
```

---

## Docker (Production)

```bash
# Build image
docker build -t sdppmo-nextjs .

# Run locally
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key \
  sdppmo-nextjs

# Check health
curl http://localhost:3000/health
```

---

## Deployment to Beta

```bash
# Build and push to Lightsail (beta container service)
./deploy-beta.sh

# Or manually:
docker build -t sdppmo-nextjs .
aws lightsail push-container-image \
  --service-name sdppmo-beta-container \
  --label nextjs \
  --image sdppmo-nextjs:latest \
  --region ap-northeast-2
```

---

## Migration Progress

### Phase 0: Stack Validation
- [x] Next.js 15 + Bun initialized
- [x] Supabase SSR auth working
- [x] Docker build working (254MB image)
- [ ] Beta Lightsail deployment
- [ ] Performance verification (<500ms TTFB)

### Phase 1-8: Full Migration
See `.sisyphus/plans/nextjs-migration.md` for complete task list.

---

## Key Differences from Production

| Aspect | Production (kcol.kr) | Beta (beta.kcol.kr) |
|--------|---------------------|---------------------|
| Server | Nginx (static) | Next.js (SSR) |
| Auth | Edge Functions | Middleware + SSR |
| Protected Pages | Supabase Storage | Server Components |
| Calculations | Client-side JS | Server Actions |
| Container | `sdppmo-container-service-1` | `sdppmo-beta-container` |

---

## Environment Variables

Required in `.env.local`:

```bash
# Public (exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Server-only
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Testing

```bash
# Run tests
bun test

# Type check
bun run typecheck

# Build check
bun run build
```

---

## Rollback Plan

If beta fails after going live:
1. DNS: Point beta.kcol.kr back to production container
2. Or: Delete beta container service entirely
3. Production (kcol.kr) remains unaffected throughout

---

## Contact

- **Repository**: github.com:sdppmo/homepage.git
- **Branch**: `feature/nextjs-migration`
- **Email**: sbd_pmo@naver.com
