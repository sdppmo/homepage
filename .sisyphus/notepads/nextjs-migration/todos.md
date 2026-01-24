## Todos (Next.js Migration – Phase 5.1)

- [ ] (1) Create server-only calculation modules under `src/lib/calculations/`
  - [x] steel-section.ts (Single H, Cross H section, optimal search, unit weight)
  - [x] cross-h-column.ts (quickCalculate port)
  - [ ] boq.ts (BOQ grouping + plate/rolled-H generators)
- [ ] (2) Add Server Actions wrapper in `src/actions/calculate.ts`
- [ ] (3) Verify: `bun x tsc --noEmit` passes
- [ ] (4) Verify: `bun run build` passes
- [ ] (5) Update notepads (learnings/issues/decisions if needed)
