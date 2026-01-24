
## Completed: 2026-01-24 (Phase 4.3)

### Videos Page Migration

**Page Migrated**:
- `/videos` (from `static-pages/videos.html`)

**Implementation Details**:
- Used Tailwind CSS for all styling, replicating the original design.
- Used `next/link` for client-side navigation.
- Implemented responsive design using Tailwind breakpoints.
- Used a responsive wrapper for YouTube embeds to maintain a 16:9 aspect ratio.
- Used placeholder divs for missing videos.

**Build and Type Checking**:
- Verified that `bun x tsc --noEmit` completes with no errors.

## Completed: 2026-01-24 (Phase 5.1)

### Server-side calculations (Next.js)

- Next.js “`'use server'` file” constraint: modules with `'use server'` **cannot export non-async values** (constants/types). Keep exported surface as **async functions only**; keep constants internal, and expose them via async getters if needed.
- To preserve “ported EXACTLY” HTML function signatures without leaking constants, expose both:
  - a structured-input async action (for app code), and
  - a positional-args async wrapper (for parity with legacy HTML).
- Verification for “no client bundle exposure”: after `bun x next build`, search `.next/static/chunks` for markers like `calculateSection(` / `rolledHStandardThickness` / `findOptimalSection`.
- `bun x tsc --noEmit` can fail on Bun scripts if Bun globals aren’t typed; a minimal `src/bun-globals.d.ts` avoids adding external deps.
