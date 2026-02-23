# V11: Non-null Assertions

> Effect Pattern Enforcement Report

**Generated**: 2026-01-22
**Scope**: `packages/knowledge/server/src/**/*.ts`
**Source of Truth**: `.claude/rules/effect-patterns.md`

---

## Summary

| Metric | Value |
|--------|-------|
| **Total Violations** | 26 |
| **Files Affected** | 8 |
| **Severity** | Medium |

---

## Rule Definition

Use Effect `Option` and `Array` utilities instead of non-null assertions (`!`) for handling potentially null/undefined values. This ensures:
1. Explicit handling of absence cases rather than runtime crashes
2. Type-safe unwrapping with proper error handling
3. Consistent use of Effect patterns throughout the codebase

**Violation Pattern**:
```typescript
// VIOLATIONS
cluster[0]!
result.data!.value
object!.property
array[index]!
map.get(key)!
```

**Correct Pattern**:
```typescript
import * as O from "effect/Option";
import * as A from "effect/Array";

// CORRECT - Array access
A.head(cluster)  // Returns Option<T>
A.get(array, index)  // Returns Option<T>

// CORRECT - Map access
O.fromNullable(map.get(key))

// CORRECT - Object property access
O.fromNullable(object).pipe(O.map(o => o.property))
```

---

## Violations

### File 1: `OntologyParser.ts`

**Path**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Ontology/OntologyParser.ts`

#### Violation 1.1 (Line 140)

**Context**: Building predicate-to-values map for ontology parsing.

**Current Code**:
```typescript
if (!map.has(subject)) {
  map.set(subject, []);
}
map.get(subject)!.push(value);
```

**Corrected Code**:
```typescript
const existing = map.get(subject) ?? [];
existing.push(value);
map.set(subject, existing);
```

**Alternative (Effect-idiomatic)**:
```typescript
O.fromNullable(map.get(subject)).pipe(
  O.getOrElse(() => {
    const arr: string[] = [];
    map.set(subject, arr);
    return arr;
  })
).push(value);
```

---

#### Violation 1.2 (Line 243)

**Context**: Building class-to-properties mapping.

**Current Code**:
```typescript
if (!classProperties.has(domainIri)) {
  classProperties.set(domainIri, []);
}
classProperties.get(domainIri)!.push(propIri);
```

**Corrected Code**:
```typescript
const existing = classProperties.get(domainIri) ?? [];
existing.push(propIri);
classProperties.set(domainIri, existing);
```

---

### File 2: `OntologyService.ts`

**Path**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Ontology/OntologyService.ts`

#### Violation 2.1 (Line 86)

**Context**: Building class properties map from parsed ontology.

**Current Code**:
```typescript
if (!classPropertiesMap.has(domainIri)) {
  classPropertiesMap.set(domainIri, []);
}
classPropertiesMap.get(domainIri)!.push(prop);
```

**Corrected Code**:
```typescript
const existing = classPropertiesMap.get(domainIri) ?? [];
existing.push(prop);
classPropertiesMap.set(domainIri, existing);
```

---

#### Violation 2.2 (Line 95)

**Context**: Memoized ancestor computation with cache lookup.

**Current Code**:
```typescript
if (ancestorCache.has(classIri)) {
  return ancestorCache.get(classIri)!;
}
```

**Corrected Code**:
```typescript
const cached = ancestorCache.get(classIri);
if (cached !== undefined) {
  return cached;
}
```

**Alternative (Effect-idiomatic)**:
```typescript
const cached = O.fromNullable(ancestorCache.get(classIri));
if (O.isSome(cached)) {
  return cached.value;
}
```

---

### File 3: `RrfScorer.ts`

**Path**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/GraphRAG/RrfScorer.ts`

#### Violation 3.1 (Line 102)

**Context**: Iterating over ranked list with index access.

**Current Code**:
```typescript
for (let i = 0; i < rankedList.length; i++) {
  const id = rankedList[i]!;
  const rank = i + 1;
  // ...
}
```

**Corrected Code**:
```typescript
A.forEach(rankedList, (id, i) => {
  const rank = i + 1;
  const component = rrfComponent(rank, k);
  const currentScore = scoreMap.get(id) ?? 0;
  scoreMap.set(id, currentScore + component);
});
```

---

### File 4: `ConfidenceFilter.ts`

**Path**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Grounding/ConfidenceFilter.ts`

#### Violation 4.1 (Line 291)

**Context**: Computing statistics - accessing first element of sorted array.

**Current Code**:
```typescript
const min = sorted[0]!;
```

**Corrected Code**:
```typescript
const min = O.getOrElse(A.head(sorted), () => 0);
```

---

#### Violation 4.2 (Line 292)

**Context**: Computing statistics - accessing last element of sorted array.

**Current Code**:
```typescript
const max = sorted[sorted.length - 1]!;
```

**Corrected Code**:
```typescript
const max = O.getOrElse(A.last(sorted), () => 0);
```

---

#### Violation 4.3 (Line 295)

**Context**: Computing median with multiple index accesses.

**Current Code**:
```typescript
const median = sorted.length % 2 === 0
  ? (sorted[midIndex - 1]! + sorted[midIndex]!) / 2
  : sorted[midIndex]!;
```

**Corrected Code**:
```typescript
const median = sorted.length % 2 === 0
  ? F.pipe(
      O.all([A.get(sorted, midIndex - 1), A.get(sorted, midIndex)]),
      O.map(([a, b]) => (a + b) / 2),
      O.getOrElse(() => 0)
    )
  : O.getOrElse(A.get(sorted, midIndex), () => 0);
```

**Note**: Since this function already has an early return for empty arrays (line 286-288), a simpler approach might be acceptable here with documented safety.

---

### File 5: `GroundingService.ts`

**Path**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Grounding/GroundingService.ts`

#### Violation 5.1 (Line 128)

**Context**: Cosine similarity calculation with indexed loop.

**Current Code**:
```typescript
for (let i = 0; i < a.length; i++) {
  const aVal = a[i]!;
  const bVal = b[i]!;
  dotProduct += aVal * bVal;
  // ...
}
```

**Corrected Code**:
```typescript
A.zip(a, b).forEach(([aVal, bVal]) => {
  dotProduct += aVal * bVal;
  normA += aVal * aVal;
  normB += bVal * bVal;
});
```

**Alternative (functional reduction)**:
```typescript
const { dotProduct, normA, normB } = A.reduce(
  A.zip(a, b),
  { dotProduct: 0, normA: 0, normB: 0 },
  (acc, [aVal, bVal]) => ({
    dotProduct: acc.dotProduct + aVal * bVal,
    normA: acc.normA + aVal * aVal,
    normB: acc.normB + bVal * bVal,
  })
);
```

---

#### Violation 5.2 (Line 129)

**Context**: Same loop as above - second array access.

**Current Code**:
```typescript
const bVal = b[i]!;
```

**Corrected Code**: See Violation 5.1 - combined fix.

---

### File 6: `EmbeddingService.ts`

**Path**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Embedding/EmbeddingService.ts`

#### Violation 6.1 (Line 217)

**Context**: Iterating over texts array with index.

**Current Code**:
```typescript
for (let i = 0; i < texts.length; i++) {
  const text = texts[i]!;
  // ...
}
```

**Corrected Code**:
```typescript
for (let i = 0; i < texts.length; i++) {
  const textOpt = A.get(texts, i);
  if (O.isNone(textOpt)) continue;
  const text = textOpt.value;
  // ...
}
```

**Alternative (forEach)**:
```typescript
yield* Effect.forEach(A.zipWithIndex(texts), ([text, i]) =>
  Effect.gen(function* () {
    const cacheKey = computeCacheKey(text, provider.config.model);
    // ...
  })
);
```

---

#### Violation 6.2 (Line 241)

**Context**: Mapping uncached indices to texts.

**Current Code**:
```typescript
const uncachedTexts = A.map(uncachedIndices, (i) => texts[i]!);
```

**Corrected Code**:
```typescript
const uncachedTexts = A.filterMap(uncachedIndices, (i) => A.get(texts, i));
```

---

#### Violation 6.3 (Line 246)

**Context**: Storing new embeddings - accessing index from uncachedIndices.

**Current Code**:
```typescript
const entityIndex = uncachedIndices[j]!;
```

**Corrected Code**:
```typescript
const entityIndexOpt = A.get(uncachedIndices, j);
if (O.isNone(entityIndexOpt)) continue;
const entityIndex = entityIndexOpt.value;
```

---

#### Violation 6.4 (Line 247)

**Context**: Accessing entity from entities array using index.

**Current Code**:
```typescript
const entity = entities[entityIndex]!;
```

**Corrected Code**:
```typescript
const entityOpt = A.get(entities, entityIndex);
if (O.isNone(entityOpt)) continue;
const entity = entityOpt.value;
```

---

#### Violation 6.5 (Line 248)

**Context**: Accessing text from texts array using index.

**Current Code**:
```typescript
const text = texts[entityIndex]!;
```

**Corrected Code**:
```typescript
const textOpt = A.get(texts, entityIndex);
if (O.isNone(textOpt)) continue;
const text = textOpt.value;
```

---

#### Violation 6.6 (Line 249)

**Context**: Accessing result from results array.

**Current Code**:
```typescript
const result = results[j]!;
```

**Corrected Code**:
```typescript
const resultOpt = A.get(results, j);
if (O.isNone(resultOpt)) continue;
const result = resultOpt.value;
```

**Recommended Refactor**: Combine all loop index accesses using `A.zip`:
```typescript
for (const [j, entityIndex] of A.zipWithIndex(uncachedIndices)) {
  const combined = O.all({
    entity: A.get(entities, entityIndex),
    text: A.get(texts, entityIndex),
    result: A.get(results, j),
  });

  if (O.isNone(combined)) continue;
  const { entity, text, result } = combined.value;
  // ...
}
```

---

### File 7: `CanonicalSelector.ts`

**Path**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/EntityResolution/CanonicalSelector.ts`

#### Violation 7.1 (Line 143)

**Context**: A.reduce with initial value from array index.

**Current Code**:
```typescript
selected = A.reduce(cluster, cluster[0]!, (best, current) =>
  current.confidence > best.confidence ? current : best
);
```

**Corrected Code**:
```typescript
selected = F.pipe(
  A.head(cluster),
  O.map((first) => A.reduce(cluster, first, (best, current) =>
    current.confidence > best.confidence ? current : best
  )),
  O.getOrUndefined
);
```

**Alternative (cleaner)**:
```typescript
selected = F.pipe(
  A.reduce(cluster, O.none<AssembledEntity>(), (best, current) =>
    F.pipe(
      best,
      O.map(b => current.confidence > b.confidence ? current : b),
      O.orElse(() => O.some(current))
    )
  ),
  O.getOrUndefined
);
```

---

#### Violation 7.2 (Line 151)

**Context**: Same pattern for "most_attributes" strategy.

**Current Code**:
```typescript
selected = A.reduce(cluster, cluster[0]!, (best, current) =>
  countAttributes(current) > countAttributes(best) ? current : best
);
```

**Corrected Code**: Same pattern as Violation 7.1

---

#### Violation 7.3 (Line 159)

**Context**: Same pattern for "most_mentions" strategy.

**Current Code**:
```typescript
selected = A.reduce(cluster, cluster[0]!, (best, current) =>
  current.mention.length > best.mention.length ? current : best
);
```

**Corrected Code**: Same pattern as Violation 7.1

---

#### Violation 7.4 (Line 173)

**Context**: Same pattern for "hybrid" strategy.

**Current Code**:
```typescript
selected = A.reduce(cluster, cluster[0]!, (best, current) =>
  computeHybridScore(current, weights) > computeHybridScore(best, weights) ? current : best
);
```

**Corrected Code**: Same pattern as Violation 7.1

**Recommended Refactor**: Extract a helper function:
```typescript
const selectBestBy = <T>(
  items: readonly T[],
  compare: (a: T, b: T) => boolean
): O.Option<T> =>
  F.pipe(
    A.head(items),
    O.map((first) => A.reduce(items, first, (best, current) =>
      compare(current, best) ? current : best
    ))
  );
```

---

### File 8: `SameAsLinker.ts`

**Path**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/EntityResolution/SameAsLinker.ts`

#### Violation 8.1 (Line 206)

**Context**: Following canonical chain in map lookup.

**Current Code**:
```typescript
while (canonicalMap.has(current) && !visited.has(current)) {
  visited.add(current);
  current = canonicalMap.get(current)!;
}
```

**Corrected Code**:
```typescript
while (!visited.has(current)) {
  const next = canonicalMap.get(current);
  if (next === undefined) break;
  visited.add(current);
  current = next;
}
```

---

#### Violation 8.2 (Line 236)

**Context**: Same canonical chain following pattern.

**Current Code**:
```typescript
while (canonicalMap.has(current) && !visited.has(current)) {
  visited.add(current);
  current = canonicalMap.get(current)!;
}
```

**Corrected Code**: Same pattern as Violation 8.1

---

#### Violation 8.3 (Line 265)

**Context**: Same canonical chain following pattern in transitive closure.

**Current Code**:
```typescript
while (canonicalMap.has(current) && !visited.has(current)) {
  visited.add(current);
  current = canonicalMap.get(current)!;
}
```

**Corrected Code**: Same pattern as Violation 8.1

---

#### Violation 8.4 (Line 331)

**Context**: Same canonical chain following pattern in validation.

**Current Code**:
```typescript
while (canonicalMap.has(current)) {
  if (visited.has(current)) {
    issues.push(`Cycle detected involving: ${current}`);
    break;
  }
  visited.add(current);
  current = canonicalMap.get(current)!;
}
```

**Corrected Code**:
```typescript
while (true) {
  const next = canonicalMap.get(current);
  if (next === undefined) break;
  if (visited.has(current)) {
    issues.push(`Cycle detected involving: ${current}`);
    break;
  }
  visited.add(current);
  current = next;
}
```

**Recommended Refactor**: Extract a shared helper:
```typescript
const followCanonicalChain = (
  start: string,
  canonicalMap: Map<string, string>
): string => {
  let current = start;
  const visited = new Set<string>();

  while (true) {
    const next = canonicalMap.get(current);
    if (next === undefined || visited.has(current)) break;
    visited.add(current);
    current = next;
  }

  return current;
};
```

---

### File 9: `EntityExtractor.ts`

**Path**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Extraction/EntityExtractor.ts`

#### Violation 9.1 (Line 252)

**Context**: Grouping entities by canonical name.

**Current Code**:
```typescript
if (groups.has(key)) {
  const group = groups.get(key)!;
  group.mentions.push(entity);
  // ...
}
```

**Corrected Code**:
```typescript
const group = groups.get(key);
if (group !== undefined) {
  group.mentions.push(entity);
  // ...
}
```

---

### File 10: `GraphAssembler.ts`

**Path**: `/home/elpresidank/YeeBois/projects/beep-effect/packages/knowledge/server/src/Extraction/GraphAssembler.ts`

#### Violation 10.1 (Line 383)

**Context**: Entity deduplication during graph merging.

**Current Code**:
```typescript
if (!entityIndex.has(key)) {
  entityIndex.set(key, entity);
  idMapping.set(entity.id, entity.id);
} else {
  const existing = entityIndex.get(key)!;
  idMapping.set(entity.id, existing.id);
}
```

**Corrected Code**:
```typescript
const existing = entityIndex.get(key);
if (existing === undefined) {
  entityIndex.set(key, entity);
  idMapping.set(entity.id, entity.id);
} else {
  idMapping.set(entity.id, existing.id);
}
```

---

## Pattern Categories

### Category A: Map.get() after Map.has() check (11 violations)

Files: `OntologyParser.ts`, `OntologyService.ts`, `SameAsLinker.ts`, `EntityExtractor.ts`, `GraphAssembler.ts`

**Pattern**:
```typescript
if (map.has(key)) {
  map.get(key)!.doSomething();
}
```

**Recommended Fix**:
```typescript
const value = map.get(key);
if (value !== undefined) {
  value.doSomething();
}
```

### Category B: Array index access in loops (11 violations)

Files: `RrfScorer.ts`, `ConfidenceFilter.ts`, `GroundingService.ts`, `EmbeddingService.ts`

**Pattern**:
```typescript
for (let i = 0; i < arr.length; i++) {
  const item = arr[i]!;
}
```

**Recommended Fix**:
```typescript
A.forEach(arr, (item, i) => { ... });
// or
for (const [item, i] of A.zipWithIndex(arr)) { ... }
```

### Category C: A.reduce with indexed initial value (4 violations)

File: `CanonicalSelector.ts`

**Pattern**:
```typescript
A.reduce(arr, arr[0]!, reducer);
```

**Recommended Fix**:
```typescript
F.pipe(
  A.head(arr),
  O.map(first => A.reduce(arr, first, reducer))
);
```

---

## Priority Ranking

| Priority | Files | Impact | Effort |
|----------|-------|--------|--------|
| **High** | `EmbeddingService.ts` | 6 violations, data integrity | Medium |
| **High** | `CanonicalSelector.ts` | 4 violations, core logic | Medium |
| **Medium** | `SameAsLinker.ts` | 4 violations, entity resolution | Low |
| **Medium** | `ConfidenceFilter.ts` | 4 violations, statistics | Medium |
| **Low** | `OntologyParser.ts`, `OntologyService.ts` | 4 violations, initialization | Low |
| **Low** | `GroundingService.ts`, `RrfScorer.ts` | 3 violations, utilities | Low |
| **Low** | `EntityExtractor.ts`, `GraphAssembler.ts` | 2 violations, deduplication | Low |

---

## Recommendations

### Immediate Actions

1. **SameAsLinker.ts**: Extract shared `followCanonicalChain` helper to eliminate 4 duplicate patterns
2. **CanonicalSelector.ts**: Create generic `selectBestBy` utility for reduce-with-head pattern
3. **EmbeddingService.ts**: Refactor loop to use `A.zip` for safe parallel array access

### Codebase-wide

1. Add ESLint rule `@typescript-eslint/no-non-null-assertion` to prevent future violations
2. Consider adding Effect-native Map wrapper: `EffectMap.get(map, key): Option<V>`
3. Document the "check-then-get" pattern alternatives in effect-patterns.md

---

## References

- Source of Truth: `.claude/rules/effect-patterns.md`
- Effect Option: `import * as O from "effect/Option"`
- Effect Array: `import * as A from "effect/Array"`
- Effect Function: `import * as F from "effect/Function"`
