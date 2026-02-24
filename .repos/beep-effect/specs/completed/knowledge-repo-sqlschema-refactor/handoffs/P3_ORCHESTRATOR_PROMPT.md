# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 implementation.

---

## Prompt

You are implementing Phase 3 of the `knowledge-repo-sqlschema-refactor` spec.

### Context

This spec refactors knowledge server repository methods to use `SqlSchema` from `@effect/sql/SqlSchema`. The key benefit is **validation**:

- **Request schema** validates input parameters
- **Result schema** validates database rows against the domain Model

Phase 2 refactored simple repos. Now we handle complex ones.

### Your Mission

Refactor 3 repos with advanced queries:

1. `packages/knowledge/server/src/db/repos/Embedding.repo.ts` (4 methods)
2. `packages/knowledge/server/src/db/repos/Relation.repo.ts` (5 methods)
3. `packages/knowledge/server/src/db/repos/SameAsLink.repo.ts` (7 methods)

### The Pattern

**BEFORE (type assertion only):**
```typescript
sql<Entities.Entity.Model>`SELECT * FROM ...`
```

**AFTER (validates input AND output):**
```typescript
const RequestSchema = S.Struct({
  ontologyId: S.String,
  organizationId: SharedEntityIds.OrganizationId,
});

const mySchema = SqlSchema.findAll({
  Request: RequestSchema,
  Result: Entities.Entity.Model,  // Domain model validates DB rows
  execute: (req) => sql`SELECT * FROM ... WHERE org = ${req.organizationId}`,
});
```

### SqlSchema Function Selection

| Use Case | Function |
|----------|----------|
| Multiple rows | `SqlSchema.findAll` |
| Zero or one row | `SqlSchema.findOne` |
| Exactly one row | `SqlSchema.single` |
| No return (DELETE) | `SqlSchema.void` |

### Import to Add

```typescript
import * as SqlSchema from "@effect/sql/SqlSchema";
```

### Verification

```bash
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
```

### Success Criteria

- [ ] All 16 methods use SqlSchema
- [ ] Request schemas defined for each method
- [ ] Result schemas use domain Models
- [ ] `bun run check` passes
- [ ] Tests pass
- [ ] REFLECTION_LOG.md updated

### Handoff Document

Read full context in: `specs/knowledge-repo-sqlschema-refactor/handoffs/HANDOFF_P3.md`

### After Completion

Update `REFLECTION_LOG.md` with Phase 3 learnings and mark spec as complete.
