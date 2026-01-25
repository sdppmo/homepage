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
