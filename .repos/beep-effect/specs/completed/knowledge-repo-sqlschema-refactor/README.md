# Knowledge Repository SqlSchema Refactor

> Refactor knowledge server repository methods to use `SqlSchema` from `@effect/sql/SqlSchema` for type-safe request/result validation.

---

## Problem Statement

The knowledge server repository methods in `packages/knowledge/server/src/db/repos/` currently use raw SQL template literal queries with type assertions (e.g., `sql<Entities.Entity.Model>`). This approach:

1. **Lacks runtime validation** - Results are cast to types without schema validation
2. **Type assertion only** - `sql<Model>` tells TypeScript "trust me", but doesn't validate at runtime
3. **No input validation** - Query parameters aren't validated against schemas

## Why SqlSchema?

`SqlSchema` from `@effect/sql/SqlSchema` provides:

1. **Request validation** - Validates input parameters against a schema before executing
2. **Result validation** - Validates database rows against the domain Model schema
3. **Type inference** - Full type safety from input to output

## Target Pattern

**Current (type assertion only - NO validation):**
```typescript
const findByOntology = (ontologyId: string, organizationId: string, limit = 100) =>
  sql<Entities.Entity.Model>`
    SELECT * FROM ${sql(tableName)}
    WHERE organization_id = ${organizationId}
      AND ontology_id = ${ontologyId}
    LIMIT ${limit}
  `.pipe(Effect.mapError(DatabaseError.$match));
```

**Target (validated request AND result):**
```typescript
// Request schema validates input parameters
const FindByOntologyRequest = S.Struct({
  ontologyId: S.String,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
});

// SqlSchema validates both Request (input) and Result (output)
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

const findByOntology = (ontologyId: string, organizationId: string, limit = 100) =>
  findByOntologySchema({ ontologyId, organizationId, limit }).pipe(
    Effect.catchTag("ParseError", (e) => Effect.die(e)),
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan("EntityRepo.findByOntology", { /* ... */ }),
  );
```

## SqlSchema API Reference

From Effect documentation:

```typescript
// Returns ReadonlyArray<A> - for multiple rows
SqlSchema.findAll({ Request, Result, execute })

// Returns Option<A> - for zero or one row
SqlSchema.findOne({ Request, Result, execute })

// Returns A or fails with NoSuchElementException - exactly one row required
SqlSchema.single({ Request, Result, execute })

// Returns void - for INSERT/UPDATE/DELETE without RETURNING
SqlSchema.void({ Request, execute })
```

## Model Variants

`@effect/sql/Model.Class` provides schema variants:

```typescript
// Base model - use for SELECT results
Entities.Entity.Model

// Insert variant - use for INSERT operations
Entities.Entity.Model.insert

// Update variant - use for UPDATE operations
Entities.Entity.Model.update
```

---

## Scope

### Repos to Refactor (8 total)

| Repository | Custom Methods | Complexity |
|------------|----------------|------------|
| `Entity.repo.ts` | 4 methods | Medium |
| `Embedding.repo.ts` | 4 methods | High (vector queries) |
| `Relation.repo.ts` | 5 methods | Medium |
| `SameAsLink.repo.ts` | 7 methods | High (recursive CTE) |
| `EntityCluster.repo.ts` | 5 methods | Medium |
| `Ontology.repo.ts` | 0 custom | Low (base only) |
| `ClassDefinition.repo.ts` | 0 custom | Low (base only) |
| `PropertyDefinition.repo.ts` | 0 custom | Low (base only) |

### Total Method Count: 25 custom methods + base CRUD

---

## Success Criteria

- [ ] All custom repo methods use `SqlSchema.findAll`, `SqlSchema.findOne`, or `SqlSchema.void`
- [ ] Request schemas defined for each method's parameters
- [ ] Result schemas use appropriate Model variants (`.insert`, `.update`, base)
- [ ] ParseError handling added (`Effect.catchTag("ParseError", ...)`)
- [ ] Existing span annotations preserved
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes

---

## Phase Overview

### Phase 0: Discovery & Planning (This Document)
- Analyze current repo implementations
- Identify all methods requiring refactor
- Document Request schema shapes needed
- Create implementation plan

### Phase 1: Base Pattern Repos
Refactor repos with no custom methods (verify base pattern works):
- `Ontology.repo.ts`
- `ClassDefinition.repo.ts`
- `PropertyDefinition.repo.ts`

### Phase 2: Simple Custom Methods
Refactor repos with straightforward SELECT queries:
- `Entity.repo.ts` (4 methods)
- `EntityCluster.repo.ts` (5 methods)

### Phase 3: Complex Custom Methods
Refactor repos with advanced queries (vectors, recursive CTE):
- `Embedding.repo.ts` (4 methods - pgvector similarity)
- `Relation.repo.ts` (5 methods)
- `SameAsLink.repo.ts` (7 methods - recursive CTE)

### Phase 4: Verification & Cleanup
- Run full test suite
- Update AGENTS.md documentation
- Final review

---

## Key Patterns Reference

### SqlSchema API

```typescript
import * as SqlSchema from "@effect/sql/SqlSchema";

// For queries returning multiple rows
SqlSchema.findAll({ Request, Result, execute })

// For queries returning Option<single row>
SqlSchema.findOne({ Request, Result, execute })

// For queries returning exactly one row (or fails)
SqlSchema.single({ Request, Result, execute })

// For queries with no return value (INSERT/UPDATE/DELETE without RETURNING)
SqlSchema.void({ Request, execute })
```

### Model Variants

```typescript
import * as M from "@effect/sql/Model";

// For SELECT results - use base Model
Result: Entities.Entity.Model

// For INSERT operations - use .insert variant
Request: Entities.Entity.Model.insert

// For UPDATE operations - use .update variant
Request: Entities.Entity.Model.update
```

---

## Reference Files

| File | Purpose |
|------|---------|
| `packages/shared/domain/src/factories/db-repo.ts` | Canonical SqlSchema usage pattern |
| `packages/knowledge/domain/src/entities/` | Domain models with insert/update variants |
| `packages/knowledge/server/src/db/repos/` | Current repos to refactor |
| `node_modules/@effect/sql/src/SqlSchema.ts` | SqlSchema API reference |

---

## Related Documentation

- [Effect Patterns](../../.claude/rules/effect-patterns.md)
- [Database Patterns](../../documentation/patterns/database-patterns.md)
- [Spec Guide](../_guide/README.md)
