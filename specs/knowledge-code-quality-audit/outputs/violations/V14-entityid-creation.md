# V14: EntityId Creation Audit

> Effect Pattern Enforcement Report

**Generated**: 2026-01-22
**Scope**: `packages/knowledge/**/src/**/*.ts`
**Source of Truth**: `.claude/rules/effect-patterns.md`

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Violations** | 9 |
| **Files Affected** | 5 |
| **Severity** | Medium |
| **Priority Score** | 2 |

---

## Rule Reference

**Pattern Violated**:
> Use branded EntityId factories from `@beep/shared-domain/entity-ids` instead of raw UUID generation.

**Violation Pattern**:
```typescript
// VIOLATIONS - Raw crypto.randomUUID() with manual prefix
id: `knowledge_same_as_link__${crypto.randomUUID()}`
const id = `knowledge_entity__${crypto.randomUUID()}`;
const relationId = `knowledge_relation__${crypto.randomUUID()}`;

// PARTIAL VIOLATION - Using .make() but still generating UUID manually
id: KnowledgeEntityIds.EmbeddingId.make(`knowledge_embedding__${crypto.randomUUID()}`)
```

**Correct Pattern**:
```typescript
import { KnowledgeEntityIds } from "@beep/shared-domain/entity-ids";

// CORRECT - Use .make() without arguments (factory generates ID internally)
const id = KnowledgeEntityIds.SameAsLinkId.make();
const entityId = KnowledgeEntityIds.KnowledgeEntityId.make();
const relationId = KnowledgeEntityIds.RelationId.make();
const embeddingId = KnowledgeEntityIds.EmbeddingId.make();
```

---

## Violations

### EmbeddingService.ts

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 151 | Redundant manual UUID generation with .make() | `KnowledgeEntityIds.EmbeddingId.make(\`knowledge_embedding__${crypto.randomUUID()}\`)` | `KnowledgeEntityIds.EmbeddingId.make()` |
| 253 | Redundant manual UUID generation with .make() | `KnowledgeEntityIds.EmbeddingId.make(\`knowledge_embedding__${crypto.randomUUID()}\`)` | `KnowledgeEntityIds.EmbeddingId.make()` |

<details>
<summary>Full Context (Lines 148-166)</summary>

```typescript
// Store in cache
yield* repo
  .insertVoid({
    id: KnowledgeEntityIds.EmbeddingId.make(`knowledge_embedding__${crypto.randomUUID()}`),
    organizationId,
    ontologyId,
    entityType: "entity",
    entityId: cacheKey,
    embedding: result.vector,
    contentText: O.some(text.slice(0, 1000)), // Truncate for storage
    model: result.model,
    // Audit fields
    source: O.some("embedding-service"),
    deletedAt: O.none(),
    createdBy: O.none(),
    updatedBy: O.none(),
    deletedBy: O.none(),
  })
```

</details>

**Note**: These are PARTIAL violations. The code correctly uses `KnowledgeEntityIds.EmbeddingId.make()` but unnecessarily passes a manually constructed string. The `.make()` factory should be called without arguments as it generates the properly prefixed UUID internally.

---

### SameAsLinker.ts

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 123 | Raw UUID generation without branded factory | `id: \`knowledge_same_as_link__${crypto.randomUUID()}\`` | `id: KnowledgeEntityIds.SameAsLinkId.make()` |
| 167 | Raw UUID generation without branded factory | `id: \`knowledge_same_as_link__${crypto.randomUUID()}\`` | `id: KnowledgeEntityIds.SameAsLinkId.make()` |

<details>
<summary>Full Context (Lines 120-128)</summary>

```typescript
const confidence = entityConfidences.get(memberId) ?? cluster.cohesion;

links.push({
  id: `knowledge_same_as_link__${crypto.randomUUID()}`,
  canonicalId: cluster.canonicalEntityId,
  memberId,
  confidence,
});
```

</details>

**Import Required**: Add `import { KnowledgeEntityIds } from "@beep/shared-domain";`

---

### EntityClusterer.ts

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 385 | Raw UUID generation without branded factory | `id: \`knowledge_entity_cluster__${crypto.randomUUID()}\`` | `id: KnowledgeEntityIds.EntityClusterId.make()` |

<details>
<summary>Full Context (Lines 381-391)</summary>

```typescript
const canonical = members[0];
if (!canonical) continue;

clusters.push({
  id: `knowledge_entity_cluster__${crypto.randomUUID()}`,
  canonicalEntityId: canonical.id,
  memberIds,
  cohesion,
  sharedTypes,
});
```

</details>

**Note**: File already imports `SharedEntityIds` but needs `KnowledgeEntityIds`.

---

### GraphAssembler.ts

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 230 | Raw UUID generation without branded factory | `const id = \`knowledge_entity__${crypto.randomUUID()}\`` | `const id = KnowledgeEntityIds.KnowledgeEntityId.make()` |
| 272 | Raw UUID generation without branded factory | `const relationId = \`knowledge_relation__${crypto.randomUUID()}\`` | `const relationId = KnowledgeEntityIds.RelationId.make()` |

<details>
<summary>Full Context (Lines 228-232)</summary>

```typescript
if (config.mergeEntities && entityIndex.has(key)) {
  continue;
}

const id = `knowledge_entity__${crypto.randomUUID()}`;

entityIndex.set(key, id);
```

</details>

<details>
<summary>Full Context (Lines 270-274)</summary>

```typescript
const subjectId = entityIndex.get(subjectKey);

if (!subjectId) {
  unresolvedSubjects++;

const relationId = `knowledge_relation__${crypto.randomUUID()}`;
```

</details>

**Import Required**: Add `import { KnowledgeEntityIds } from "@beep/shared-domain";`

---

### OntologyService.ts

| Line | Violation | Current Code | Correct Code |
|------|-----------|--------------|--------------|
| 263 | Redundant manual UUID generation with .make() | `KnowledgeEntityIds.ClassDefinitionId.make(\`knowledge_class_definition__${crypto.randomUUID()}\`)` | `KnowledgeEntityIds.ClassDefinitionId.make()` |
| 304 | Redundant manual UUID generation with .make() | `KnowledgeEntityIds.PropertyDefinitionId.make(\`knowledge_property_definition__${crypto.randomUUID()}\`)` | `KnowledgeEntityIds.PropertyDefinitionId.make()` |

<details>
<summary>Full Context (Lines 261-265)</summary>

```typescript
) =>
  Effect.sync(() => {
    const id = KnowledgeEntityIds.ClassDefinitionId.make(`knowledge_class_definition__${crypto.randomUUID()}`);

    return Entities.ClassDefinition.Model.insert.make({
```

</details>

<details>
<summary>Full Context (Lines 301-306)</summary>

```typescript
) =>
  Effect.sync(() => {
    const id = KnowledgeEntityIds.PropertyDefinitionId.make(
      `knowledge_property_definition__${crypto.randomUUID()}`
    );
```

</details>

**Note**: These are PARTIAL violations. The code correctly uses the branded factory but unnecessarily passes a manually constructed string.

---

## Cross-File Impact

| File | Violation Count | Modules Affected |
|------|-----------------|------------------|
| EmbeddingService.ts | 2 | Embedding |
| SameAsLinker.ts | 2 | EntityResolution |
| EntityClusterer.ts | 1 | EntityResolution |
| GraphAssembler.ts | 2 | Extraction |
| OntologyService.ts | 2 | Ontology |

**Impact Score**: 2 (Affects multiple modules but localized to ID generation)

---

## Dependency Analysis

### Depends On (Fix These First)
- [x] None - EntityId factories already exist in `@beep/shared-domain`

### Depended By (Fix These After)
- [ ] V01 - EntityId tables may reference these generated IDs

### Can Fix Independently
- [x] Yes - All fixes are localized string replacements

---

## Remediation Notes

### Special Considerations

1. **Partial vs Full Violations**: 4 violations use `.make()` but pass unnecessary manual strings; 5 violations bypass the factory entirely.

2. **Type Interface Mismatch**: The `SameAsLink` interface in `SameAsLinker.ts` (line 28) defines `id: string` rather than the branded `SameAsLinkId.Type`. Consider updating the interface to use the branded type.

3. **EntityCluster Interface**: Similarly, `EntityCluster` interface in `EntityClusterer.ts` (line 60) uses `id: string` instead of `EntityClusterId.Type`.

4. **Factory Behavior**: The `EntityId.make()` factory generates IDs with the correct prefix (e.g., `knowledge_same_as_link__`) followed by a UUID. Passing a manual string defeats the purpose and risks format inconsistency.

### Recommended Approach

1. Update imports to include `KnowledgeEntityIds` from `@beep/shared-domain`
2. Replace raw `crypto.randomUUID()` template strings with factory calls
3. Remove manual string arguments from existing `.make()` calls
4. Consider updating interfaces to use branded types (separate refactoring task)

### Imports to Add

```typescript
// Files: SameAsLinker.ts, GraphAssembler.ts
import { KnowledgeEntityIds } from "@beep/shared-domain";

// Files already have KnowledgeEntityIds: EmbeddingService.ts, OntologyService.ts, EntityClusterer.ts (partial)
// EntityClusterer.ts needs to add KnowledgeEntityIds to its existing SharedEntityIds import
```

### Interface Updates (Optional Follow-up)

```typescript
// SameAsLinker.ts - Update SameAsLink interface
export interface SameAsLink {
  readonly id: KnowledgeEntityIds.SameAsLinkId.Type;  // Changed from string
  // ... rest unchanged
}

// EntityClusterer.ts - Update EntityCluster interface
export interface EntityCluster {
  readonly id: KnowledgeEntityIds.EntityClusterId.Type;  // Changed from string
  // ... rest unchanged
}
```

---

## Verification Commands

```bash
# Verify no raw crypto.randomUUID() patterns remain
grep -rn "crypto\.randomUUID()" packages/knowledge/server/src/

# Verify no manual prefix patterns remain
grep -rn "knowledge_.*__\${crypto" packages/knowledge/server/src/

# Type check
bun run check --filter @beep/knowledge-server

# Run tests
bun run test --filter @beep/knowledge-*
```

---

## Audit Metadata

| Field | Value |
|-------|-------|
| **Agent** | V14 EntityId Creation Enforcer |
| **Duration** | ~5 minutes |
| **Files Scanned** | packages/knowledge/server/src/**/*.ts |
| **False Positives Excluded** | 0 |
