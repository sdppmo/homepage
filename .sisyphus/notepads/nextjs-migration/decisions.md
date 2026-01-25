
### [2026-01-25T17:30] Admin Dashboard Decisions

#### 1. Use Server Actions for Data Operations
**Decision**: Use Next.js Server Actions for all admin dashboard data operations (list users, update user, create user, delete user, get usage stats).

**Rationale**:
- Simplifies data fetching and mutation by co-locating server-side logic with client-side components.
- Provides built-in security and type safety.
- Eliminates the need for separate API routes for these operations.

#### 2. Use Placeholder Charts for Analytics
**Decision**: Use placeholder elements for the analytics charts instead of integrating Chart.js immediately.

**Rationale**:
- The primary goal of this phase is to migrate the core functionality of the admin dashboard.
- Integrating Chart.js and implementing the necessary data aggregation logic would significantly increase the scope and time required for this task.
- Placeholder charts allow us to verify the layout and structure of the analytics tab without getting bogged down in implementation details.
- Chart.js integration can be done in a future phase.
