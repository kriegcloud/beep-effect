# Quick Start

> 5-minute guide to understanding this refactor.

---

## The Problem

Knowledge server repos use raw SQL with **type assertion only**:

```typescript
// This does NOT validate - just tells TypeScript "trust me"
sql<Entities.Entity.Model>`SELECT * FROM entity WHERE ...`
```

If the database returns malformed data, it passes through unchecked.

---

## The Solution

Use `SqlSchema` to **validate both input AND output**:

```typescript
import * as SqlSchema from "@effect/sql/SqlSchema";

const mySchema = SqlSchema.findAll({
  Request: RequestSchema,           // Validates input parameters
  Result: Entities.Entity.Model,    // Validates DB rows against domain model
  execute: (req) => sql`SELECT * FROM entity WHERE org = ${req.organizationId}`,
});
```

Now:
- Input parameters are validated before the query runs
- Database rows are validated against your domain Model schema
- Parse errors are caught and handled

---

## SqlSchema Functions

| Function | Returns | Use When |
|----------|---------|----------|
| `SqlSchema.findAll` | `ReadonlyArray<A>` | SELECT returning multiple rows |
| `SqlSchema.findOne` | `Option<A>` | SELECT returning 0 or 1 row |
| `SqlSchema.single` | `A` | SELECT returning exactly 1 row |
| `SqlSchema.void` | `void` | INSERT/UPDATE/DELETE without RETURNING |

---

## Model Variants

Domain models from `@effect/sql/Model.Class` have variants:

```typescript
// For SELECT results - validates DB rows
Result: Entities.Entity.Model

// For INSERT operations
Request: Entities.Entity.Model.insert

// For UPDATE operations
Request: Entities.Entity.Model.update
```

---

## Example Transformation

**Before:**
```typescript
const findByOntology = (ontologyId: string, organizationId: string, limit = 100) =>
  sql<Entities.Entity.Model>`
    SELECT * FROM entity
    WHERE organization_id = ${organizationId}
      AND ontology_id = ${ontologyId}
    LIMIT ${limit}
  `.pipe(Effect.mapError(DatabaseError.$match));
```

**After:**
```typescript
const FindByOntologyRequest = S.Struct({
  ontologyId: S.String,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
});

const findByOntologySchema = SqlSchema.findAll({
  Request: FindByOntologyRequest,
  Result: Entities.Entity.Model,
  execute: (req) => sql`
    SELECT * FROM entity
    WHERE organization_id = ${req.organizationId}
      AND ontology_id = ${req.ontologyId}
    LIMIT ${req.limit}
  `,
});

const findByOntology = (ontologyId: string, organizationId: string, limit = 100) =>
  findByOntologySchema({ ontologyId, organizationId, limit }).pipe(
    Effect.catchTag("ParseError", (e) => Effect.die(e)),
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan("EntityRepo.findByOntology", { /* ... */ }),
  );
```

---

## Files to Modify

```
packages/knowledge/server/src/db/repos/
├── Entity.repo.ts         # 4 custom methods
├── Embedding.repo.ts      # 4 custom methods
├── Relation.repo.ts       # 5 custom methods
├── SameAsLink.repo.ts     # 7 custom methods
├── EntityCluster.repo.ts  # 5 custom methods
├── Ontology.repo.ts       # Base CRUD only
├── ClassDefinition.repo.ts # Base CRUD only
└── PropertyDefinition.repo.ts # Base CRUD only
```

---

## Verification

```bash
bun run check --filter @beep/knowledge-server
bun run test --filter @beep/knowledge-server
```

---

## Start Here

**Phase 1**: Verify base repos (no changes needed)
**Phase 2**: Refactor Entity.repo.ts and EntityCluster.repo.ts
**Phase 3**: Refactor Embedding.repo.ts, Relation.repo.ts, SameAsLink.repo.ts

Read `handoffs/P1_ORCHESTRATOR_PROMPT.md` to begin.
