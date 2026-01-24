# Issues - Next.js Migration

> Problems encountered, blockers, bugs, technical gotchas

---

## [2026-01-24T07:31] Session Start

*No issues yet - starting fresh*

---


## [2026-01-24T16:35] Phase 0.1 Issues

### Resolved Issues

#### 1. Pages Directory Conflict
**Problem**: Next.js detected existing `pages/` directory and threw error:
```
Error: `pages` and `app` directories should be under the same folder
```

**Root Cause**: Next.js thought the existing static HTML `pages/` folder was a Pages Router directory.

**Solution**: Renamed `pages/` to `static-pages/` to avoid conflict.

**Impact**: All references to `/pages/` in HTML files need updating.

### Known Limitations

#### 1. No Login Functionality Yet
- Created placeholder `/login` page
- Actual auth UI will be implemented in next phase
- Cannot test full auth flow yet

#### 2. Static Files Not Integrated
- Old static site still in root directory
- Need migration strategy for assets, CSS, JS
- Two separate apps running side-by-side for now

