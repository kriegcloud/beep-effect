# Phase 2 Handoff: Simple Custom Methods

> Refactor Entity.repo.ts and EntityCluster.repo.ts with straightforward SELECT queries.

---

## Phase 1 Summary (Completed 2026-01-22)

Phase 1 verified that base pattern repos work correctly:
- `Ontology.repo.ts`, `ClassDefinition.repo.ts`, `PropertyDefinition.repo.ts` confirmed working
- `DbRepo.make()` factory uses SqlSchema correctly for base CRUD
- No modifications were needed

**Verification Results:**
- Type check: 27 tasks successful, all cached
- Tests: 55 pass, 0 fail, 149 expect() calls

**Key Learning:** The factory demonstrates all necessary patterns:
- `SqlSchema.single` for insert/update (Request/Result)
- `SqlSchema.findOne` for optional single-row
- `SqlSchema.void` for operations returning nothing
- `ParseError` → `Effect.die(e)` pattern for schema failures

---

## Working Memory (Critical)

### Success Criteria
- [ ] `Entity.repo.ts` - 4 methods refactored with SqlSchema
- [ ] `EntityCluster.repo.ts` - 5 methods refactored with SqlSchema
- [ ] All Request schemas defined with proper types
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] `bun run test --filter @beep/knowledge-server` passes

### Blocking Issues
None expected - these are straightforward SELECT queries.

### Constraints
- Preserve existing span annotations exactly
- Preserve existing error mapping patterns
- Request schemas should use branded EntityIds where applicable

---

## Episodic Memory (Previous Context)

### Phase 1 Findings
- Base CRUD pattern is verified working
- SqlSchema functions: `findAll`, `findOne`, `single`, `void`
- ParseError must be caught and converted to die

---

## Methods to Refactor

### Entity.repo.ts (4 methods)

#### 1. findByIds
**Current:**
```typescript
const findByIds = (
  ids: ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type>,
  organizationId: SharedEntityIds.OrganizationId.Type
): Effect.Effect<ReadonlyArray<Entities.Entity.Model>, DatabaseError> =>
  Effect.gen(function* () {
    if (A.isEmptyReadonlyArray(ids)) return [];
    return yield* sql<Entities.Entity.Model>`
      SELECT * FROM ${sql(tableName)}
      WHERE organization_id = ${organizationId}
        AND id IN ${sql.in(ids)}
    `.pipe(Effect.mapError(...));
  });
```

**Target Request Schema:**
```typescript
class FindByIdsRequest extends S.Class<FindByIdsRequest>("FindByIdsRequest")({
  ids: S.Array(KnowledgeEntityIds.KnowledgeEntityId),
  organizationId: SharedEntityIds.OrganizationId,
}) {}
```

**Target Implementation:**
```typescript
const findByIdsSchema = SqlSchema.findAll({
  Request: FindByIdsRequest,
  Result: Entities.Entity.Model,
  execute: (req) => sql`
    SELECT * FROM ${sql(tableName)}
    WHERE organization_id = ${req.organizationId}
      AND id IN ${sql.in(req.ids)}
  `,
});

const findByIds = (
  ids: ReadonlyArray<KnowledgeEntityIds.KnowledgeEntityId.Type>,
  organizationId: SharedEntityIds.OrganizationId.Type
): Effect.Effect<ReadonlyArray<Entities.Entity.Model>, DatabaseError> =>
  Effect.gen(function* () {
    if (A.isEmptyReadonlyArray(ids)) return [];
    return yield* findByIdsSchema({ ids: [...ids], organizationId });
  }).pipe(
    Effect.catchTag("ParseError", (e) => Effect.die(e)),
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan("EntityRepo.findByIds", {
      captureStackTrace: false,
      attributes: { count: ids.length, organizationId },
    })
  );
```

#### 2. findByOntology
**Request Schema:**
```typescript
class FindByOntologyRequest extends S.Class<FindByOntologyRequest>("FindByOntologyRequest")({
  ontologyId: S.String,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
}) {}
```

#### 3. findByType
**Request Schema:**
```typescript
class FindByTypeRequest extends S.Class<FindByTypeRequest>("FindByTypeRequest")({
  typeIri: S.String,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
}) {}
```

#### 4. countByOrganization
**Request Schema:**
```typescript
class CountByOrganizationRequest extends S.Class<CountByOrganizationRequest>("CountByOrganizationRequest")({
  organizationId: SharedEntityIds.OrganizationId,
}) {}
```

**Result Schema:**
```typescript
class CountResult extends S.Class<CountResult>("CountResult")({
  count: S.String,  // PostgreSQL returns count as string
}) {}
```

---

### EntityCluster.repo.ts (5 methods)

#### 1. findByCanonicalEntity
**Request Schema:**
```typescript
class FindByCanonicalEntityRequest extends S.Class<FindByCanonicalEntityRequest>("FindByCanonicalEntityRequest")({
  canonicalEntityId: KnowledgeEntityIds.KnowledgeEntityId,
  organizationId: SharedEntityIds.OrganizationId,
}) {}
```
**SqlSchema:** `SqlSchema.findOne` (returns Option)

#### 2. findByMember
**Request Schema:**
```typescript
class FindByMemberRequest extends S.Class<FindByMemberRequest>("FindByMemberRequest")({
  memberId: S.String,
  organizationId: SharedEntityIds.OrganizationId,
}) {}
```
**SqlSchema:** `SqlSchema.findOne` (returns Option)

#### 3. findByOntology
**Request Schema:**
```typescript
class FindClustersByOntologyRequest extends S.Class<FindClustersByOntologyRequest>("FindClustersByOntologyRequest")({
  ontologyId: S.String,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
}) {}
```
**SqlSchema:** `SqlSchema.findAll`

#### 4. findHighCohesion
**Request Schema:**
```typescript
class FindHighCohesionRequest extends S.Class<FindHighCohesionRequest>("FindHighCohesionRequest")({
  minCohesion: S.Number,
  organizationId: SharedEntityIds.OrganizationId,
  limit: S.Number,
}) {}
```
**SqlSchema:** `SqlSchema.findAll`

#### 5. deleteByOntology
**Request Schema:**
```typescript
class DeleteByOntologyRequest extends S.Class<DeleteByOntologyRequest>("DeleteByOntologyRequest")({
  ontologyId: S.String,
  organizationId: SharedEntityIds.OrganizationId,
}) {}
```
**SqlSchema:** `SqlSchema.void`
**Note:** Returns count - need to handle via raw sql result

---

## Implementation Pattern

```typescript
// 1. Define Request schema at top of extensions generator
class MyRequest extends S.Class<MyRequest>("MyRequest")({
  field1: SomeSchema,
  field2: SomeOtherSchema,
}) {}

// 2. Define SqlSchema inside makeExtensions Effect.gen
const myMethodSchema = SqlSchema.findAll({
  Request: MyRequest,
  Result: Entities.MyModel.Model,
  execute: (req) => sql`
    SELECT * FROM ${sql(tableName)}
    WHERE field1 = ${req.field1}
  `,
});

// 3. Implement method with error handling
const myMethod = (field1: Type1, field2: Type2) =>
  myMethodSchema({ field1, field2 }).pipe(
    Effect.catchTag("ParseError", (e) => Effect.die(e)),
    Effect.mapError(DatabaseError.$match),
    Effect.withSpan("RepoName.myMethod", {
      captureStackTrace: false,
      attributes: { field1, field2 },
    })
  );
```

---

## Verification Steps

```bash
# After each repo file modification
bun run check --filter @beep/knowledge-server

# After completing both repos
bun run test --filter @beep/knowledge-server

# Lint fix
bun run lint:fix --filter @beep/knowledge-server
```

---

## Known Issues & Gotchas

1. **Array to mutable**: `SqlSchema.findAll` returns `ReadonlyArray`, match existing return types
2. **Count results**: PostgreSQL returns count as string, need intermediate schema
3. **Empty array optimization**: Keep the `if (A.isEmptyReadonlyArray(ids)) return []` check BEFORE SqlSchema call
4. **Default parameters**: Handle defaults in the method signature, not the schema

---

## Procedural Links

- [Entity.repo.ts](../../../packages/knowledge/server/src/db/repos/Entity.repo.ts)
- [EntityCluster.repo.ts](../../../packages/knowledge/server/src/db/repos/EntityCluster.repo.ts)
- [Entity model](../../../packages/knowledge/domain/src/entities/entity/entity.model.ts)
- [EntityCluster model](../../../packages/knowledge/domain/src/entities/entity-cluster/entity-cluster.model.ts)

---

## Next Phase

After Phase 2 completes, proceed to **Phase 3** for complex methods (pgvector, recursive CTE).
