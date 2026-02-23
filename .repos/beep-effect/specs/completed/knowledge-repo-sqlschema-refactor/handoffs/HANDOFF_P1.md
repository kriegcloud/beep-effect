# Phase 1 Handoff: Base Pattern Repos

> Refactor repos with no custom methods to verify base pattern works correctly.

---

## Phase 1 Summary

This phase focuses on verifying that the base CRUD operations from `DbRepo.make()` are working correctly with SqlSchema. These repos have no custom methods, making them ideal for validation.

---

## Working Memory (Critical)

### Success Criteria
- [ ] `Ontology.repo.ts` - verify builds and types correctly
- [ ] `ClassDefinition.repo.ts` - verify builds and types correctly
- [ ] `PropertyDefinition.repo.ts` - verify builds and types correctly
- [ ] `bun run check --filter @beep/knowledge-server` passes
- [ ] No functional changes to base CRUD behavior

### Blocking Issues
None identified - this phase is primarily verification.

### Constraints
- Do NOT modify the `DbRepo.make()` factory - it already uses SqlSchema correctly
- Do NOT add custom methods - verify existing pattern only

---

## Episodic Memory (Previous Context)

### Phase 0 Findings
- Analyzed all 8 repository files
- Base CRUD operations in `DbRepo.make()` already use SqlSchema correctly
- These 3 repos use only base operations with no extensions

### Key Decision Made
Start with base repos because:
1. No code changes required - only verification
2. Validates the factory pattern works correctly
3. Creates confidence before refactoring custom methods

---

## Semantic Memory (Project Constants)

### Repository File Locations
```
packages/knowledge/server/src/db/repos/
├── Ontology.repo.ts
├── ClassDefinition.repo.ts
└── PropertyDefinition.repo.ts
```

### Base CRUD Operations (from DbRepo.make)
| Method | SqlSchema Function | Already Correct |
|--------|-------------------|-----------------|
| `insert` | `SqlSchema.single` | Yes |
| `insertVoid` | `SqlSchema.void` | Yes |
| `insertManyVoid` | `SqlSchema.void` | Yes |
| `update` | `SqlSchema.single` | Yes |
| `updateVoid` | `SqlSchema.void` | Yes |
| `findById` | `SqlSchema.findOne` | Yes |
| `delete` | `SqlSchema.void` | Yes |

---

## Methods to Verify

### 1. Ontology.repo.ts

**Current Implementation:**
```typescript
export class OntologyRepo extends Effect.Service<OntologyRepo>()($I`OntologyRepo`, {
  dependencies,
  accessors: true,
  effect: DbRepo.make(KnowledgeEntityIds.OntologyId, Entities.Ontology.Model, Effect.succeed({})),
}) {}
```

**Verification:**
- Uses `DbRepo.make` with correct EntityId and Model
- No custom extensions (`Effect.succeed({})`)
- Should work correctly as-is

### 2. ClassDefinition.repo.ts

**Current Implementation:**
```typescript
export class ClassDefinitionRepo extends Effect.Service<ClassDefinitionRepo>()($I`ClassDefinitionRepo`, {
  dependencies,
  accessors: true,
  effect: DbRepo.make(KnowledgeEntityIds.ClassDefinitionId, Entities.ClassDefinition.Model, Effect.succeed({})),
}) {}
```

**Verification:**
- Uses `DbRepo.make` with correct EntityId and Model
- No custom extensions
- Should work correctly as-is

### 3. PropertyDefinition.repo.ts

**Current Implementation:**
```typescript
export class PropertyDefinitionRepo extends Effect.Service<PropertyDefinitionRepo>()($I`PropertyDefinitionRepo`, {
  dependencies,
  accessors: true,
  effect: DbRepo.make(KnowledgeEntityIds.PropertyDefinitionId, Entities.PropertyDefinition.Model, Effect.succeed({})),
}) {}
```

**Verification:**
- Uses `DbRepo.make` with correct EntityId and Model
- No custom extensions
- Should work correctly as-is

---

## Verification Steps

```bash
# 1. Type check the package
bun run check --filter @beep/knowledge-server

# 2. Run tests to ensure base operations work
bun run test --filter @beep/knowledge-server

# 3. Verify domain models have correct insert/update variants
bun tsc --noEmit packages/knowledge/domain/src/entities/ontology/ontology.model.ts
bun tsc --noEmit packages/knowledge/domain/src/entities/class-definition/class-definition.model.ts
bun tsc --noEmit packages/knowledge/domain/src/entities/property-definition/property-definition.model.ts
```

---

## Known Issues & Gotchas

1. **Model Variants**: Ensure `Entities.*.Model` classes extend `M.Class` and have proper `insert`/`update` variants
2. **EntityId Alignment**: Verify table names match between EntityId and Model
3. **Dependencies**: All repos use `dependencies` from `_common.ts` which provides `KnowledgeDb.layer`

---

## Procedural Links

- [db-repo.ts factory](../../../packages/shared/domain/src/factories/db-repo.ts) - Reference implementation
- [Ontology model](../../../packages/knowledge/domain/src/entities/ontology/ontology.model.ts)
- [ClassDefinition model](../../../packages/knowledge/domain/src/entities/class-definition/class-definition.model.ts)
- [PropertyDefinition model](../../../packages/knowledge/domain/src/entities/property-definition/property-definition.model.ts)

---

## Next Phase

After Phase 1 verification passes, proceed to **Phase 2** for simple custom method refactoring.
