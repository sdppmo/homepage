# Phase 2 Core Infrastructure - Learnings

## Completed: 2026-01-24

### Middleware Implementation

**Protected Patterns**:
- All 9 protected routes from Appendix A implemented
- Redirect preserves original URL: `/login?redirect={originalUrl}`
- Pattern matching uses `pathname.startsWith()` for flexibility

**Security Features**:
- Blocked patterns: `.git`, `.env`, `wp-admin`, `wp-login`, `.php`
- Returns 404 for blocked paths (not 403 to avoid information disclosure)
- Rate limiting: 10 req/s per IP with in-memory store

**IP Extraction**:
- Uses `x-forwarded-for` header (primary)
- Falls back to `x-real-ip` header
- Note: `request.ip` doesn't exist in Next.js NextRequest

### Rate Limiter Design

**Implementation**: In-memory Map with automatic cleanup
- Window: 1 second (1000ms)
- Limit: 10 requests per second (configurable)
- Cleanup: Every 5 minutes to prevent memory leaks
- Testing utilities: `clearRateLimit()`, `clearAllRateLimits()`

**Trade-offs**:
- ✅ Simple, no external dependencies
- ✅ Fast (in-memory)
- ❌ Not distributed (resets on server restart)
- ❌ Won't work across multiple instances (need Redis for that)

### Database Abstraction Layer

**Structure**:
```
src/lib/db/
├── types.ts      # TypeScript interfaces
├── users.ts      # User profile operations
└── usage.ts      # Usage logging operations
```

**Patterns**:
- All functions return `null` on error (not throw)
- Errors logged to console for debugging
- Server-side only (uses `createClient` from `@/lib/supabase/server`)
- Type-safe with TypeScript interfaces

### Protected Route Layout

**Location**: `src/app/(protected)/layout.tsx`

**Checks** (in order):
1. User authenticated (redirect to `/login` if not)
2. Profile exists (show error if not)
3. Account approved (show pending message if not)
4. Permission check (future: per-route basis)

**UI States**:
- Not authenticated → redirect
- No profile → error message
- Not approved → pending message with Korean text
- Approved → render children

### Testing Strategy

**Test Files Created**:
- `tests/lib/supabase.test.ts` - Client initialization
- `tests/middleware.test.ts` - Route protection, blocking, rate limiting
- `tests/lib/db/users.test.ts` - User profile operations
- `tests/lib/db/usage.test.ts` - Usage logging

**Vitest Gotchas**:
- `vi.mocked()` doesn't exist - use `vi.spyOn()` instead
- Server components need `next/headers` mocked
- Use `as any` for complex mock type issues
- `expect().resolves.not.toThrow()` doesn't work with async functions - use `.resolves.toBeDefined()` instead

**Mock Strategy**:
- Mock `next/headers` for server client tests
- Mock Supabase client at module level
- Use `mockReturnValueOnce()` for test-specific behavior
- Clear mocks in `beforeEach()` to avoid test pollution

### Build Verification

**Results**:
- ✅ All 21 tests pass
- ✅ Build succeeds in 2.5s
- ✅ No TypeScript errors
- ⚠️ Middleware deprecation warning (Next.js 16 prefers "proxy" convention)

**Routes Generated**:
- `/` - Static
- `/login` - Static
- `/test` - Dynamic (protected)
- `/api/health` - Dynamic

### Next Steps

Phase 2 complete. Ready for Phase 3 (Auth Pages):
- Login page with redirect handling
- Signup page with password validation
- Pending page with polling
- Password reset page

## Completed: 2026-01-24 (Phase 4.2)

### Product Pages Migration

**Pages Migrated**:
- `/products` (from `static-pages/products.html`)
- `/k-product/2h-steel` (from `static-pages/K-product/2H_steel_product.html`)

**Implementation Details**:
- Used Tailwind CSS for all styling, replicating the original design.
- Used `next/image` for optimized image delivery.
- Used `next/link` for client-side navigation.
- Implemented complex hover effects using Tailwind's `group` and `group-hover` utilities.
- The `/k-product/2h-steel` page is currently a static representation; interactive features (tabs, data loading) are not yet implemented.

**TypeScript Configuration**:
- Configured `tsconfig.json` to exclude the `supabase` directory, as it contains Deno code that is incompatible with the Next.js TypeScript configuration.

**Build and Type Checking**:
- Verified that `bun run build` completes successfully.
- Verified that `bun x tsc --noEmit` completes with no errors.
