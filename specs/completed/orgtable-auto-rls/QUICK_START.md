# Quick Start - OrgTable Auto-RLS

> 5-minute orientation for new agent instances.

---

## What Is This Spec?

This spec extends `OrgTable.make()` to automatically generate RLS (Row-Level Security) policies. Instead of manually defining `pgPolicy()` in every table, the factory handles it.

**Before** (manual):
```typescript
export const member = OrgTable.make(MemberId)(
  { userId: pg.text("user_id") },
  (t) => [
    pg.pgPolicy("tenant_isolation_member", { ... }),  // Manual!
  ]
).enableRLS();
```

**After** (automatic):
```typescript
export const member = OrgTable.make(MemberId)(
  { userId: pg.text("user_id") },
  (t) => [/* indexes only */]
);
// RLS policy auto-generated!
```

---

## Current Status

| Phase | Status |
|-------|--------|
| P0: Research | Not Started |
| P1: Design | Not Started |
| P2: Implementation | Not Started |
| P3: Cleanup | Not Started |
| P4: Documentation | Not Started |

---

## Key Files

| File | Purpose |
|------|---------|
| `packages/shared/tables/src/org-table/OrgTable.ts` | Target modification |
| `packages/iam/tables/src/tables/member.table.ts` | Manual RLS example |
| `specs/rls-implementation/outputs/drizzle-research.md` | Prior RLS research |

---

## Proposed API

```typescript
// Standard (default) - auto RLS
OrgTable.make(entityId)(columns, extraConfig);

// Nullable organizationId
OrgTable.make(entityId, { rlsPolicy: 'nullable' })(columns, extraConfig);

// Opt-out (manual policy)
OrgTable.make(entityId, { rlsPolicy: 'none' })(columns, extraConfig);
```

---

## Start Phase 0

1. Read `handoffs/P0_ORCHESTRATOR_PROMPT.md`
2. Execute the three research tasks
3. Create `outputs/drizzle-api-analysis.md`
4. Update `REFLECTION_LOG.md`
5. Create P1 handoff documents

---

## Verification Commands

```bash
# Type check
bun run check --filter @beep/shared-tables

# Find existing policies
grep -r "pgPolicy" packages/*/tables/src/tables/

# Generate migration (after implementation)
bun run db:generate
```

---

## FAQ

**Q: What if verification fails?**
A: Each phase has a Decision Tree and Verification Failure Protocol in MASTER_ORCHESTRATION.md. Follow those steps before proceeding.

**Q: Can I skip phases?**
A: No. Each phase depends on artifacts from the previous phase. Skipping will cause context loss.

**Q: What if an agent fails?**
A: Document the failure in REFLECTION_LOG.md, try an alternative agent, or refine the prompt with more context.

**Q: How do I handle existing manual RLS?**
A: Phase 3 covers cleanup. Tables with non-standard policies should use `rlsPolicy: 'none'`.

---

## Questions?

- [README.md](./README.md) - Full overview
- [MASTER_ORCHESTRATION.md](./MASTER_ORCHESTRATION.md) - Detailed phases
- [RLS Implementation Spec](../rls-implementation/README.md) - Broader context
