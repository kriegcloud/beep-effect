# V10: Native Array Method Audit Report

**Audit Date**: 2026-01-22
**Scope**: `packages/knowledge/server/src/**/*.ts`
**Rule Reference**: `.claude/rules/effect-patterns.md` - Native Method Ban

## Summary

| Metric | Count |
|--------|-------|
| **Total Violations** | 9 |
| **Files Affected** | 6 |
| **False Positives Excluded** | 25+ |

## Violations Found

### 1. EmbeddingProvider.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Embedding/EmbeddingProvider.ts`
**Line**: 160

**Current Code**:
```typescript
embedBatch: (texts: ReadonlyArray<string>, _taskType: TaskType) =>
  Effect.succeed(
    texts.map(() => ({
      vector: new Array(768).fill(0) as ReadonlyArray<number>,
      model: "mock-embedding-model",
      usage: { totalTokens: 0 },
    }))
  ),
```

**Correct Pattern**:
```typescript
import * as A from "effect/Array";

embedBatch: (texts: ReadonlyArray<string>, _taskType: TaskType) =>
  Effect.succeed(
    A.map(texts, () => ({
      vector: new Array(768).fill(0) as ReadonlyArray<number>,
      model: "mock-embedding-model",
      usage: { totalTokens: 0 },
    }))
  ),
```

---

### 2. SameAsLinker.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/EntityResolution/SameAsLinker.ts`
**Line**: 290

**Current Code**:
```typescript
return Array.from(groups.entries()).map(([canonical, members]) => ({
  canonical,
  members,
}));
```

**Correct Pattern**:
```typescript
import * as A from "effect/Array";

return A.map(Array.from(groups.entries()), ([canonical, members]) => ({
  canonical,
  members,
}));
```

---

### 3. EntityClusterer.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/EntityResolution/EntityClusterer.ts`
**Line**: 355

**Current Code**:
```typescript
const members = memberIds.map((id) => entityById.get(id)).filter((e): e is AssembledEntity => e !== undefined);
```

**Correct Pattern**:
```typescript
import * as A from "effect/Array";

const members = F.pipe(
  memberIds,
  A.map((id) => entityById.get(id)),
  A.filter((e): e is AssembledEntity => e !== undefined)
);
```

---

### 4. CanonicalSelector.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/EntityResolution/CanonicalSelector.ts`
**Line**: 240

**Current Code**:
```typescript
const maxConfidence = Math.max(canonical.confidence, ...members.map((m) => m.confidence));
```

**Correct Pattern**:
```typescript
import * as A from "effect/Array";

const maxConfidence = Math.max(canonical.confidence, ...A.map(members, (m) => m.confidence));
```

---

### 5. EntityExtractor.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Extraction/EntityExtractor.ts`
**Line**: 188

**Current Code**:
```typescript
const classifiedMentions = new Set(allEntities.map((e) => e.mention.toLowerCase()));
```

**Correct Pattern**:
```typescript
import * as A from "effect/Array";

const classifiedMentions = new Set(A.map(allEntities, (e) => e.mention.toLowerCase()));
```

---

### 6. Embedding.repo.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/db/repos/Embedding.repo.ts`
**Line**: 91

**Current Code**:
```typescript
const vectorString = `[${A.join(queryVector.map(String), ",")}]`;
```

**Correct Pattern**:
```typescript
const vectorString = `[${A.join(A.map(queryVector, String), ",")}]`;
```

---

### 7. EntityResolutionService.ts (First Instance)

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/EntityResolution/EntityResolutionService.ts`
**Line**: 226

**Current Code**:
```typescript
const originalCount = graphs.reduce((sum, g) => sum + g.entities.length, 0);
```

**Correct Pattern**:
```typescript
import * as A from "effect/Array";

const originalCount = A.reduce(graphs, 0, (sum, g) => sum + g.entities.length);
```

---

### 8. EntityResolutionService.ts (Second Instance)

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/EntityResolution/EntityResolutionService.ts`
**Line**: 289

**Current Code**:
```typescript
const otherMembers = members.filter((m) => m.id !== canonical.id);
```

**Correct Pattern**:
```typescript
const otherMembers = A.filter(members, (m) => m.id !== canonical.id);
```

---

### 9. ContextFormatter.ts

**File**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/GraphRAG/ContextFormatter.ts`
**Line**: 50

**Current Code**:
```typescript
? ` (${A.map(attrEntries, ([k, v]) => `${extractLocalName(k)}: ${String(v)}`).join(", ")})`
```

**Correct Pattern**:
```typescript
? ` (${A.join(A.map(attrEntries, ([k, v]) => `${extractLocalName(k)}: ${String(v)}`), ", ")})`
```

---

## False Positives Excluded

The following patterns were correctly identified as **NOT violations** and excluded from this report:

### Valid Effect Array Usage (A.map, A.filter, A.reduce)
- `A.map(seedEntityIds, (id) => id)` - GraphRAGService.ts:257
- `A.map(entity.types, extractLocalName)` - ContextFormatter.ts:44
- `A.map(entities, formatEntity)` - ContextFormatter.ts:122
- `A.map(relations, (r) => formatRelation(r, entityLookup))` - ContextFormatter.ts:128
- `A.map(entities, formatEntityForEmbedding)` - EmbeddingService.ts:210
- `A.map(uncachedIndices, (i) => texts[i]!)` - EmbeddingService.ts:241
- `A.map(filteredEntities, (e) => e.id)` - ConfidenceFilter.ts:159
- `A.filter(entity.additionalTypes, (t) => ...)` - EntityExtractor.ts:110
- `A.filter(result.value.entities, (e) => ...)` - EntityExtractor.ts:178
- `A.reduce([...mentionResults], 0, (acc, r) => ...)` - ExtractionPipeline.ts:193
- Many more...

### Valid Effect.map Usage (Effect Functor)
- `Effect.map(parseFromStore)` - OntologyParser.ts:378
- `Effect.map((cache) => {...})` - OntologyCache.ts:150
- `Effect.map(A.head)` - Embedding.repo.ts:61, EntityCluster.repo.ts:46, 76, SameAsLink.repo.ts:75

### Valid Option.map Usage (Option Functor)
- `O.map(ontologyContext.findClass(d), (c) => c.label)` - PromptTemplates.ts:134, 135

## Recommendations

1. **Priority**: All 9 violations should be fixed to maintain codebase consistency
2. **Complexity**: All fixes are straightforward replacements
3. **Testing**: Run `bun run test --filter @beep/knowledge-server` after fixes
4. **Verification**: Run `bun run check --filter @beep/knowledge-server` to ensure type safety

## Pattern Reference

From `.claude/rules/effect-patterns.md`:

```typescript
// FORBIDDEN
array.map(x => x + 1)
array.filter(x => x > 0)
array.reduce((acc, x) => acc + x, 0)

// REQUIRED
import * as A from "effect/Array";
A.map(array, x => x + 1)
A.filter(array, x => x > 0)
A.reduce(array, 0, (acc, x) => acc + x)
```
