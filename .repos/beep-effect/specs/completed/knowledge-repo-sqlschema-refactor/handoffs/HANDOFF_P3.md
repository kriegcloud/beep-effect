# Phase 3 Handoff: Complex Custom Methods

> Refactor Embedding.repo.ts, Relation.repo.ts, and SameAsLink.repo.ts with advanced queries.

---

## Phase 2 Summary (Completed 2026-01-22)

Phase 2 refactored simple custom methods:
- `Entity.repo.ts` - 4 methods now use SqlSchema
- `EntityCluster.repo.ts` - 4 methods now use SqlSchema (1 kept raw for count)

**Verification Results:**
- Type check: 27 tasks successful
- Tests: 55 pass, 0 fail, 149 expect() calls

**Key Learnings from Phase 2:**
1. `SqlSchema.void` doesn't return count - keep raw SQL for delete operations needing count
2. Raw SQL only has `SqlError` - don't add `ParseError` catchTag for raw SQL
3. Changed `type SharedEntityIds` to value import `SharedEntityIds` for Request schemas
4. Fixed JSONB operator typo (`@ >` → `@>`)
5. Empty array optimization: Keep `if (A.isEmptyReadonlyArray(ids)) return []` BEFORE SqlSchema call

---

## Working Memory (Critical)

### Success Criteria
- [ ] `Embedding.repo.ts` - 4 methods refactored
- [ ] `Relation.repo.ts` - 5 methods refactored
- [ ] `SameAsLink.repo.ts` - 7 methods refactored
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes

### Key Insight: What SqlSchema Does

```typescript
// BEFORE: Type assertion only - NO validation
sql<Model>`SELECT * FROM ...`

// AFTER: Validates Request (input) AND Result (output)
SqlSchema.findAll({
  Request: RequestSchema,     // Validates input params
  Result: Entities.Model,     // Validates DB rows against domain model
  execute: (req) => sql`...`
})
```

---

## Methods to Refactor

### Embedding.repo.ts (4 methods)

| Method | SqlSchema | Request Fields | Result |
|--------|-----------|----------------|--------|
| `findByCacheKey` | `findOne` | cacheKey, organizationId | `Entities.Embedding.Model` |
| `findSimilar` | `findAll` | queryVector, organizationId, limit, threshold | `SimilarityResult` |
| `findByEntityType` | `findAll` | entityType, organizationId, limit | `Entities.Embedding.Model` |
| `deleteByEntityIdPrefix` | `void` | entityIdPrefix, organizationId | void |

**Note on `findSimilar`**: The pgvector `::vector` cast happens inside execute:
```typescript
execute: (req) => {
  const vectorString = `[${A.join(req.queryVector.map(String), ",")}]`;
  return sql`... ${vectorString}::vector ...`;
}
```

### Relation.repo.ts (5 methods)

| Method | SqlSchema | Request Fields | Result |
|--------|-----------|----------------|--------|
| `findBySourceIds` | `findAll` | sourceIds, organizationId | `Entities.Relation.Model` |
| `findByTargetIds` | `findAll` | targetIds, organizationId | `Entities.Relation.Model` |
| `findByEntityIds` | `findAll` | entityIds, organizationId | `Entities.Relation.Model` |
| `findByPredicate` | `findAll` | predicateIri, organizationId, limit | `Entities.Relation.Model` |
| `countByOrganization` | `findAll` | organizationId | `S.Struct({ count: S.String })` |

### SameAsLink.repo.ts (7 methods)

| Method | SqlSchema | Request Fields | Result |
|--------|-----------|----------------|--------|
| `findByCanonical` | `findAll` | canonicalId, organizationId | `Entities.SameAsLink.Model` |
| `findByMember` | `findOne` | memberId, organizationId | `Entities.SameAsLink.Model` |
| `resolveCanonical` | `findOne` | entityId, organizationId | `S.Struct({ canonical_id: S.String })` |
| `findHighConfidence` | `findAll` | minConfidence, organizationId, limit | `Entities.SameAsLink.Model` |
| `findBySource` | `findAll` | sourceId, organizationId | `Entities.SameAsLink.Model` |
| `deleteByCanonical` | `void` | canonicalId, organizationId | void |
| `countMembers` | `findAll` | canonicalId, organizationId | `S.Struct({ count: S.Number })` |

---

## Implementation Pattern

```typescript
import * as SqlSchema from "@effect/sql/SqlSchema";
import * as S from "effect/Schema";

// 1. Define Request schema (can be S.Struct or S.Class)
const FindByOntologyRequest = S.Struct({
  ontologyId: S.String,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
});

// 2. Create SqlSchema
const findByOntologySchema = SqlSchema.findAll({
  Request: FindByOntologyRequest,
  Result: Entities.Entity.Model,  // Domain model validates DB rows
  execute: (req) => sql`
    SELECT * FROM ${sql(tableName)}
    WHERE organization_id = ${req.organizationId}
      AND ontology_id = ${req.ontologyId}
    LIMIT ${req.limit}
  `,
});

// 3. Implement method with error handling
const findByOntology = (ontologyId: string, organizationId: string, limit = 100) =>
  findByOntologySchema({ ontologyId, organizationId, limit }).pipe(
    Effect.catchTag("ParseError", (e) => Effect.die(e)),
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan("RepoName.methodName", { /* ... */ }),
  );
```

---

## Verification Steps

```bash
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
bun run lint:fix --filter @beep/knowledge-server
```

---

## Known Gotchas

1. **Empty array optimization**: Keep `if (A.isEmptyReadonlyArray(ids)) return []` BEFORE SqlSchema call
2. **Count queries**: PostgreSQL returns count as string, use `S.Struct({ count: S.String })`
3. **ParseError**: Always catch with `Effect.catchTag("ParseError", (e) => Effect.die(e))`

---

## Procedural Links

- [Embedding.repo.ts](../../../packages/knowledge/server/src/db/repos/Embedding.repo.ts)
- [Relation.repo.ts](../../../packages/knowledge/server/src/db/repos/Relation.repo.ts)
- [SameAsLink.repo.ts](../../../packages/knowledge/server/src/db/repos/SameAsLink.repo.ts)
