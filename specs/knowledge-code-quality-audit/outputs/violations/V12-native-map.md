# V12: Native Map Usage

> Effect Pattern Enforcement Report

**Generated**: 2026-01-22
**Scope**: `packages/knowledge/server/src/**/*.ts`
**Source of Truth**: `.claude/rules/effect-patterns.md`

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Violations** | 39 |
| **Files Affected** | 11 |
| **Severity** | Medium |

---

## Rule Definition

Native JavaScript `Map` should be replaced with Effect's `MutableHashMap` for mutable map operations. This ensures:
1. Consistent use of Effect utilities throughout the codebase
2. Better integration with Effect's functional programming patterns
3. Option-based return types for safer access (`get` returns `Option<V>` instead of `V | undefined`)

---

## Correct Pattern

```typescript
import * as MutableHashMap from "effect/MutableHashMap";

// CORRECT - Effect MutableHashMap
const cache = MutableHashMap.empty<string, Entity>();
MutableHashMap.set(cache, key, value);
const result = MutableHashMap.get(cache, key);  // Returns Option<V>
```

---

## Violations by File

### 1. `packages/knowledge/server/src/GraphRAG/RrfScorer.ts`

**Violations**: 3

#### Line 98 - Score accumulation map
```typescript
// VIOLATION
const scoreMap = new Map<T, number>();
```

**Context**: Used in `fuseRankings` function to accumulate RRF scores.

**Corrected**:
```typescript
import * as MutableHashMap from "effect/MutableHashMap";

const scoreMap = MutableHashMap.empty<T, number>();
// Access pattern:
const currentScore = O.getOrElse(MutableHashMap.get(scoreMap, id), () => 0);
MutableHashMap.set(scoreMap, id, currentScore + component);
```

#### Line 136 - Hop groups map
```typescript
// VIOLATION
const hopGroups = new Map<number, Array<T>>();
```

**Context**: Used in `assignGraphRanks` function to group entities by hop count.

**Corrected**:
```typescript
const hopGroups = MutableHashMap.empty<number, Array<T>>();
```

#### Line 146 - Rank map
```typescript
// VIOLATION
const rankMap = new Map<T, number>();
```

**Context**: Used in `assignGraphRanks` function to store graph ranks.

**Corrected**:
```typescript
const rankMap = MutableHashMap.empty<T, number>();
```

---

### 2. `packages/knowledge/server/src/GraphRAG/GraphRAGService.ts`

**Violations**: 3

#### Line 300 - Score map from object entries
```typescript
// VIOLATION
const scoreMap = new Map<string, number>(Object.entries(scores));
```

**Context**: Converting scores record to Map for context formatting.

**Corrected**:
```typescript
const scoreMap = F.pipe(
  R.toEntries(scores),
  A.reduce(
    MutableHashMap.empty<string, number>(),
    (map, [k, v]) => MutableHashMap.set(map, k, v)
  )
);
```

#### Line 386 - Score map from object entries (duplicate pattern)
```typescript
// VIOLATION
const scoreMap = new Map<string, number>(Object.entries(scores));
```

**Context**: Same pattern in `queryFromSeeds` function.

#### Line 440 - Entity hops tracking
```typescript
// VIOLATION
const entityHops = new Map<KnowledgeEntityIds.KnowledgeEntityId.Type, number>();
```

**Context**: Used in `traverseGraph` to track hop distances during BFS traversal.

**Corrected**:
```typescript
const entityHops = MutableHashMap.empty<KnowledgeEntityIds.KnowledgeEntityId.Type, number>();
```

---

### 3. `packages/knowledge/server/src/GraphRAG/ContextFormatter.ts`

**Violations**: 2

#### Line 113 - Entity lookup map
```typescript
// VIOLATION
const entityLookup = new Map<string, Entities.Entity.Model>();
```

**Context**: Used in `formatContext` for entity ID to model lookup.

**Corrected**:
```typescript
const entityLookup = MutableHashMap.empty<string, Entities.Entity.Model>();
for (const entity of entities) {
  MutableHashMap.set(entityLookup, entity.id, entity);
}
```

#### Line 152 - Entity lookup map (duplicate pattern)
```typescript
// VIOLATION
const entityLookup = new Map<string, Entities.Entity.Model>();
```

**Context**: Same pattern in `formatContextWithScores` function.

---

### 4. `packages/knowledge/server/src/Grounding/GroundingService.ts`

**Violations**: 1

#### Line 227 - Entity by ID lookup
```typescript
// VIOLATION
const entityById = new Map<string, AssembledEntity>();
```

**Context**: Used to build entity lookup for grounding relations.

**Corrected**:
```typescript
const entityById = MutableHashMap.empty<string, AssembledEntity>();
for (const entity of graph.entities) {
  MutableHashMap.set(entityById, entity.id, entity);
}
```

---

### 5. `packages/knowledge/server/src/EntityResolution/SameAsLinker.ts`

**Violations**: 5

#### Line 194 - Canonical map
```typescript
// VIOLATION
const canonicalMap = new Map<string, string>();
```

**Context**: Used in `areLinked` to build member-to-canonical mapping.

**Corrected**:
```typescript
const canonicalMap = MutableHashMap.empty<string, string>();
for (const link of links) {
  MutableHashMap.set(canonicalMap, link.memberId, link.canonicalId);
}
```

#### Line 226 - Canonical map (duplicate)
```typescript
// VIOLATION
const canonicalMap = new Map<string, string>();
```

**Context**: Used in `getCanonical` function.

#### Line 253 - Canonical map (duplicate)
```typescript
// VIOLATION
const canonicalMap = new Map<string, string>();
```

**Context**: Used in `computeTransitiveClosure` function.

#### Line 272 - Groups map
```typescript
// VIOLATION
const groups = new Map<string, string[]>();
```

**Context**: Used to group entities by canonical representative.

#### Line 316 - Canonical map (duplicate)
```typescript
// VIOLATION
const canonicalMap = new Map<string, string>();
```

**Context**: Used in `validateLinks` function.

---

### 6. `packages/knowledge/server/src/EntityResolution/EntityClusterer.ts`

**Violations**: 6

#### Line 267 - Union-find parent map
```typescript
// VIOLATION
const parent = new Map<string, string>();
```

**Context**: Used in agglomerative clustering for union-find data structure.

**Corrected**:
```typescript
const parent = MutableHashMap.empty<string, string>();
```

#### Line 268 - Union-find rank map
```typescript
// VIOLATION
const rank = new Map<string, number>();
```

**Context**: Used for union-by-rank optimization.

#### Line 311 - Cluster sizes map
```typescript
// VIOLATION
const clusterSizes = new Map<string, number>();
```

**Context**: Tracks cluster sizes during merging.

#### Line 337 - Cluster map
```typescript
// VIOLATION
const clusterMap = new Map<string, string[]>();
```

**Context**: Groups entity IDs by cluster root.

#### Line 346 - Entity by ID map
```typescript
// VIOLATION
const entityById = new Map<string, AssembledEntity>();
```

**Context**: Entity lookup by ID.

#### Line 438 - Embeddings map
```typescript
// VIOLATION
const embeddings = new Map<string, readonly number[]>();
```

**Context**: Caches entity embeddings during clustering.

---

### 7. `packages/knowledge/server/src/EntityResolution/EntityResolutionService.ts`

**Violations**: 4

#### Line 99 - ID mapping
```typescript
// VIOLATION
const idMapping = new Map<string, string>();
```

**Context**: Maps member entity IDs to canonical entity IDs.

#### Line 107 - Canonical by ID lookup
```typescript
// VIOLATION
const canonicalById = new Map<string, AssembledEntity>();
```

**Context**: Canonical entity lookup by ID.

#### Line 265 - Entity by ID map
```typescript
// VIOLATION
const entityById = new Map<string, AssembledEntity>();
```

**Context**: Entity lookup during resolution.

#### Line 302 - Confidence map
```typescript
// VIOLATION
const confidenceMap = new Map<string, number>();
```

**Context**: Maps entity IDs to confidence scores.

---

### 8. `packages/knowledge/server/src/Embedding/EmbeddingService.ts`

**Violations**: 1

#### Line 214 - Cached vectors map
```typescript
// VIOLATION
const cachedVectors = new Map<number, ReadonlyArray<number>>();
```

**Context**: Caches embedding vectors by index during batch embedding.

**Corrected**:
```typescript
const cachedVectors = MutableHashMap.empty<number, ReadonlyArray<number>>();
```

---

### 9. `packages/knowledge/server/src/Ontology/OntologyParser.ts`

**Violations**: 2

#### Line 129 - Predicate values map
```typescript
// VIOLATION
const map = new Map<string, string[]>();
```

**Context**: Used in `getPredicateValues` helper function.

#### Line 236 - Class properties map
```typescript
// VIOLATION
const classProperties = new Map<string, string[]>();
```

**Context**: Maps class IRIs to property IRIs.

---

### 10. `packages/knowledge/server/src/Ontology/OntologyService.ts`

**Violations**: 6

#### Line 69 - Class map
```typescript
// VIOLATION
const classMap = new Map<string, ParsedClassDefinition>();
```

**Context**: IRI-to-class lookup in `createOntologyContext`.

#### Line 74 - Property map
```typescript
// VIOLATION
const propertyMap = new Map<string, ParsedPropertyDefinition>();
```

**Context**: IRI-to-property lookup.

#### Line 80 - Class properties map
```typescript
// VIOLATION
const classPropertiesMap = new Map<string, ParsedPropertyDefinition[]>();
```

**Context**: Maps class IRIs to their properties.

#### Line 91 - Ancestor cache
```typescript
// VIOLATION
const ancestorCache = new Map<string, Set<string>>();
```

**Context**: Memoized ancestor computation cache.

**Note**: This also uses `Set<string>` which should be `MutableHashSet`.

#### Line 136 - All properties map
```typescript
// VIOLATION
const allPropsMap = new Map<string, ParsedPropertyDefinition>();
```

**Context**: Deduplication map in `getPropertiesForClass`.

---

### 11. `packages/knowledge/server/src/Extraction/ExtractionPipeline.ts`

**Violations**: 2

#### Line 288 - Entity by mention map
```typescript
// VIOLATION
const entityByMention = new Map<string, ClassifiedEntity>();
```

**Context**: Maps mention text to entity for chunk mapping.

#### Line 294 - Result map
```typescript
// VIOLATION
const result = new Map<number, ClassifiedEntity[]>();
```

**Context**: Maps chunk index to entities.

---

### 12. `packages/knowledge/server/src/Extraction/EntityExtractor.ts`

**Violations**: 1

#### Line 246 - Entity groups map
```typescript
// VIOLATION
const groups = new Map<string, { canonical: ClassifiedEntity; mentions: ClassifiedEntity[] }>();
```

**Context**: Groups entities by canonical name during resolution.

---

### 13. `packages/knowledge/server/src/Extraction/GraphAssembler.ts`

**Violations**: 3

#### Line 219 - Entity index map
```typescript
// VIOLATION
const entityIndex = new Map<string, string>();
```

**Context**: Maps entity keys to generated IDs during assembly.

#### Line 371 - Entity index (merge function)
```typescript
// VIOLATION
const entityIndex = new Map<string, AssembledEntity>();
```

**Context**: Entity deduplication during graph merge.

#### Line 372 - ID mapping
```typescript
// VIOLATION
const idMapping = new Map<string, string>();
```

**Context**: Maps old entity IDs to merged entity IDs.

---

### 14. `packages/knowledge/server/src/Extraction/RelationExtractor.ts`

**Violations**: 1

#### Line 288 - Seen triples map
```typescript
// VIOLATION
const seen = new Map<string, ExtractedTriple>();
```

**Context**: Deduplication during relation extraction.

**Corrected**:
```typescript
const seen = MutableHashMap.empty<string, ExtractedTriple>();
// Access pattern:
const existing = MutableHashMap.get(seen, key);
if (O.isNone(existing) || triple.confidence > existing.value.confidence) {
  MutableHashMap.set(seen, key, triple);
}
```

---

## Migration Guide

### Step 1: Add Import
```typescript
import * as MutableHashMap from "effect/MutableHashMap";
```

### Step 2: Replace Construction
```typescript
// Before
const map = new Map<K, V>();

// After
const map = MutableHashMap.empty<K, V>();
```

### Step 3: Replace Access Patterns

#### Setting values
```typescript
// Before
map.set(key, value);

// After
MutableHashMap.set(map, key, value);
```

#### Getting values
```typescript
// Before
const value = map.get(key);
if (value !== undefined) { ... }

// After
const maybeValue = MutableHashMap.get(map, key);
if (O.isSome(maybeValue)) {
  const value = maybeValue.value;
  ...
}

// Or with pipe and getOrElse
const value = F.pipe(
  MutableHashMap.get(map, key),
  O.getOrElse(() => defaultValue)
);
```

#### Checking existence
```typescript
// Before
if (map.has(key)) { ... }

// After
if (MutableHashMap.has(map, key)) { ... }
```

#### Iterating
```typescript
// Before
for (const [key, value] of map) { ... }

// After
for (const [key, value] of MutableHashMap.entries(map)) { ... }
```

#### Getting size
```typescript
// Before
const size = map.size;

// After
const size = MutableHashMap.size(map);
```

---

## Prioritization

| Priority | Files | Rationale |
|----------|-------|-----------|
| High | `EntityClusterer.ts`, `EntityResolutionService.ts`, `SameAsLinker.ts` | Core entity resolution logic with complex state management |
| Medium | `GraphRAGService.ts`, `GraphAssembler.ts`, `OntologyService.ts` | Frequently used service code |
| Low | `RrfScorer.ts`, `ContextFormatter.ts`, `OntologyParser.ts` | Helper utilities with localized scope |

---

## Impact Assessment

**Refactoring Complexity**: Medium-High
- 39 total occurrences across 11 files
- Many instances are interconnected (e.g., union-find in clustering)
- Requires careful attention to Option handling in access patterns

**Risk**: Low-Medium
- Pure refactoring with no behavior change
- Type system will catch most errors
- Recommend incremental file-by-file migration with tests

---

## Notes

1. Several files also use native `Set` (e.g., `OntologyService.ts:91` uses `Set<string>`), which should be addressed in a separate V13 audit for `MutableHashSet`.

2. Some Map usages are converted to arrays or Records immediately after population. Consider whether `HashMap` (immutable) is more appropriate than `MutableHashMap` for those cases.

3. The `getPredicateValues` function in `OntologyParser.ts` returns `Map<string, string[]>` as a return type - this affects the function signature and callers.
