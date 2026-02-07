# Phase 2 Orchestrator Prompt

Copy-paste this prompt to start Phase 2 implementation.

---

## Prompt

You are implementing Phase 2 of the `knowledge-repo-sqlschema-refactor` spec.

### Context

This spec refactors knowledge server repository methods to use `SqlSchema` from `@effect/sql/SqlSchema` for type-safe request/result validation.

Phase 1 (completed 2026-01-22) verified that base pattern repos work correctly:
- Type check: 27 tasks successful
- Tests: 55 pass, 0 fail, 149 expect() calls
- No code changes required for base repos

Now we refactor repos with simple custom methods.

### Your Mission

**Refactor 2 repos with straightforward SELECT queries:**

1. `packages/knowledge/server/src/db/repos/Entity.repo.ts` (4 methods)
2. `packages/knowledge/server/src/db/repos/EntityCluster.repo.ts` (5 methods)

### Tasks

For each custom method in both repos:

1. **Define a Request schema** as an `S.Class` for the method's parameters
2. **Create SqlSchema** using appropriate function (`findAll`, `findOne`, `void`)
3. **Update method implementation** to use the schema
4. **Add ParseError handling**: `Effect.catchTag("ParseError", (e) => Effect.die(e))`
5. **Preserve existing** span annotations and error mapping

### Critical Patterns

**Request Schema:**
```typescript
class FindByOntologyRequest extends S.Class<FindByOntologyRequest>("FindByOntologyRequest")({
  ontologyId: S.String,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
}) {}
```

**SqlSchema Usage:**
```typescript
const findByOntologySchema = SqlSchema.findAll({
  Request: FindByOntologyRequest,
  Result: Entities.Entity.Model,
  execute: (req) => sql`
    SELECT * FROM ${sql(SharedEntityIds.OrganizationId.tableName)}
    WHERE organization_id = ${req.organizationId}
      AND ontology_id = ${req.ontologyId}
    LIMIT ${req.limit}
  `,
});
```

**Method Implementation:**
```typescript
const findByOntology = (ontologyId: string, organizationId: string, limit = 100) =>
  findByOntologySchema({ ontologyId, organizationId, limit }).pipe(
    Effect.catchTag("ParseError", (e) => Effect.die(e)),
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan("EntityRepo.findByOntology", { /* ... */ }),
  );
```

### Import to Add

At top of each repo file:
```typescript
import * as SqlSchema from "@effect/sql/SqlSchema";
```

### SqlSchema Function Selection

| Return Type | Use |
|-------------|-----|
| `ReadonlyArray<A>` | `SqlSchema.findAll` |
| `Option<A>` | `SqlSchema.findOne` |
| `A` (exactly one) | `SqlSchema.single` |
| `void` | `SqlSchema.void` |

### Verification Commands

```bash
# After each modification
bun run check --filter @beep/knowledge-server

# After both repos complete
bun run test --filter @beep/knowledge-server
bun run lint:fix --filter @beep/knowledge-server
```

### Success Criteria

- [ ] Entity.repo.ts: 4 methods using SqlSchema
- [ ] EntityCluster.repo.ts: 5 methods using SqlSchema
- [ ] All Request schemas properly typed
- [ ] ParseError handling added to all methods
- [ ] `bun run check` passes
- [ ] Tests pass
- [ ] REFLECTION_LOG.md updated

### Handoff Document

Read full context in: `specs/knowledge-repo-sqlschema-refactor/handoffs/HANDOFF_P2.md`

### After Completion

Create:
1. `handoffs/HANDOFF_P3.md` with detailed context for Phase 3
2. `handoffs/P3_ORCHESTRATOR_PROMPT.md` with copy-paste prompt
3. Update `REFLECTION_LOG.md` with Phase 2 learnings
