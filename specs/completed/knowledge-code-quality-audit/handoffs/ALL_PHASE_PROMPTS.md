# All Phase Orchestrator Prompts

Quick-start prompts for each remaining phase. Copy the relevant section.

---

## Phase 3c: Native Set (V09) - 22 fixes

```
You are implementing Phase 3c (Native Set) of the `knowledge-code-quality-audit` spec.

**Completed**: Phases 3a, 3b (41 fixes)
**This Phase**: Replace `new Set<T>()` with `MutableHashSet.make<T>()` (22 fixes)

Pattern:
- `new Set<T>()` → `MutableHashSet.make<T>()`
- `set.add(x)` → `MutableHashSet.add(set, x)`
- `set.has(x)` → `MutableHashSet.has(set, x)`
- `for (x of set)` → `MutableHashSet.forEach(set, (x) => ...)`

Files: EntityClusterer, SameAsLinker, CanonicalSelector, OntologyService, OntologyParser, GraphRAGService, ConfidenceFilter, GraphAssembler

Verify: `grep -rn "new Set<" packages/knowledge/server/src/` returns empty
Reference: specs/knowledge-code-quality-audit/handoffs/P3c_ORCHESTRATOR_PROMPT.md
```

---

## Phase 3d: Native Map Part 1 (V12) - 20 fixes

```
You are implementing Phase 3d (Native Map Part 1) of the `knowledge-code-quality-audit` spec.

**Completed**: Phases 3a-3c (63 fixes)
**This Phase**: Replace `new Map<K,V>()` in hotspot files (20 fixes)

Pattern:
- `new Map<K,V>()` → `MutableHashMap.make<K,V>()`
- `map.set(k, v)` → `MutableHashMap.set(map, k, v)`
- `map.get(k)` → `MutableHashMap.get(map, k)` (returns Option!)
- `map.has(k)` → `MutableHashMap.has(map, k)`

CRITICAL: MutableHashMap.get() returns Option<V>, not V | undefined

Files: EntityClusterer (6), SameAsLinker (5), OntologyService (6), OntologyParser (2)

Verify: Type check passes, tests pass
```

---

## Phase 3e: Native Map Part 2 (V12) - 19 fixes

```
You are implementing Phase 3e (Native Map Part 2) of the `knowledge-code-quality-audit` spec.

**Completed**: Phases 3a-3d (83 fixes)
**This Phase**: Replace `new Map<K,V>()` in remaining files (19 fixes)

Same pattern as 3d. Files: EntityResolutionService (4), GraphAssembler (3), GraphRAGService (3), ContextFormatter (2), RrfScorer (3), GroundingService (1), ExtractionPipeline (2), RelationExtractor (1)

Verify: `grep -rn "new Map<" packages/knowledge/server/src/` returns empty
```

---

## Phase 3f: Array Emptiness (V05) - 35 fixes

```
You are implementing Phase 3f (Array Emptiness) of the `knowledge-code-quality-audit` spec.

**Completed**: Phases 3a-3e (102 fixes)
**This Phase**: Replace array length checks (35 fixes)

Pattern:
- `if (arr.length === 0)` → `if (A.isEmptyReadonlyArray(arr))`
- `if (arr.length > 0)` → `if (!A.isEmptyReadonlyArray(arr))`
- `if (arr.length)` → `if (!A.isEmptyReadonlyArray(arr))`

Import: `import * as A from "effect/Array"`

Files: EntityClusterer, SameAsLinker, CanonicalSelector, GraphAssembler, EntityExtractor, GraphRAGService, ContextFormatter, EntityResolutionService, GroundingService, ConfidenceFilter, ExtractionPipeline
```

---

## Phase 3g: Non-null Assertions (V11) - 26 fixes

```
You are implementing Phase 3g (Non-null Assertions) of the `knowledge-code-quality-audit` spec.

**Completed**: Phases 3a-3f (137 fixes)
**This Phase**: Replace `!` assertions with Option handling (26 fixes)

Pattern:
- `map.get(k)!` → `pipe(MutableHashMap.get(map, k), O.getOrThrow)` or `O.getOrElse`
- `arr[0]!` → `pipe(A.head(arr), O.getOrThrow)`
- `obj.prop!` → Use O.fromNullable or refactor

Import: `import * as O from "effect/Option"`

Files: EntityClusterer, SameAsLinker, CanonicalSelector, EmbeddingService, OntologyService, OntologyParser, GraphAssembler, ConfidenceFilter
```

---

## Phase 3h: String Methods (V03) - 21 fixes

```
You are implementing Phase 3h (String Methods) of the `knowledge-code-quality-audit` spec.

**Completed**: Phases 3a-3g (163 fixes)
**This Phase**: Replace native string methods (21 fixes)

Pattern:
- `str.lastIndexOf(x)` → `Str.lastIndexOf(str, x)` (returns Option!)
- `str.slice(a, b)` → `Str.slice(str, a, b)`
- `str.indexOf(x)` → `Str.indexOf(str, x)` (returns Option!)

Import: `import * as Str from "effect/String"`

Files: EntityClusterer, EmbeddingService, GroundingService, ContextFormatter
```

---

## Phase 3i: toLowerCase (V15) - 14 fixes

```
You are implementing Phase 3i (toLowerCase) of the `knowledge-code-quality-audit` spec.

**Completed**: Phases 3a-3h (184 fixes)
**This Phase**: Replace .toLowerCase() (14 fixes)

Pattern:
- `str.toLowerCase()` → `Str.toLowerCase(str)`

Import: `import * as Str from "effect/String"` (likely already added in 3h)

Files: OntologyService, EntityResolutionService, GraphAssembler, EntityExtractor, RelationExtractor, ConfidenceFilter
```

---

## Phase 3j: Array Operations (V10, V13) - 12 fixes

```
You are implementing Phase 3j (Array Operations) of the `knowledge-code-quality-audit` spec.

**Completed**: Phases 3a-3i (198 fixes)
**This Phase**: Replace native array methods (12 fixes)

Pattern:
- `arr.map(fn)` → `A.map(arr, fn)`
- `arr.sort()` → `A.sort(arr, Order.number)` or custom Order
- `arr.sort((a,b) => ...)` → `A.sort(arr, Order.make((a,b) => ...))`

Import: `import * as Order from "effect/Order"` (for sort)

V10 Files: EntityClusterer, SameAsLinker, ContextFormatter, EntityExtractor, EntityResolutionService
V13 Files: EntityClusterer (2), MentionExtractor (1)
```

---

## Phase 3k: Modernization (V07, V08, V16, V18) - 22 fixes

```
You are implementing Phase 3k (Modernization) of the `knowledge-code-quality-audit` spec.

**Completed**: Phases 3a-3j (210 fixes)
**This Phase**: Modern Effect patterns (22 fixes)

Patterns:
- V07 Switch: `switch(x)` → `Match.value(x).pipe(Match.when(...), Match.exhaustive)`
- V08 Object.entries: `Object.entries(obj)` → `R.toEntries(obj)`
- V16 Date: `new Date()` → `DateTime.unsafeNow()` or `DateTime.now`
- V18 Empty[]: `const arr: T[] = []` → `const arr = A.empty<T>()`

Imports:
- `import * as Match from "effect/Match"`
- `import * as R from "effect/Record"`
- `import * as DateTime from "effect/DateTime"`

V07: CanonicalSelector (1)
V08: CanonicalSelector (2), GraphRAGService (2)
V16: OntologyCache (4), ExtractionPipeline (2)
V18: Multiple files (11)
```

---

## Phase 3l: Optimization (V17) - 8 fixes (Optional)

```
You are implementing Phase 3l (Optimization) of the `knowledge-code-quality-audit` spec.

**Completed**: Phases 3a-3k (232 fixes)
**This Phase**: Consider Chunk for hot paths (8 candidates)

This phase is OPTIONAL. Only proceed if:
1. All other phases complete
2. Performance profiling indicates benefit

Pattern: For large collections with many transformations, Chunk provides better performance.

Candidates in: EntityResolutionService, ExtractionPipeline, GraphRAGService, EntityClusterer

Requires profiling before implementation.
```

---

## Summary Table

| Phase | Category | Fixes | Cumulative |
|-------|----------|-------|------------|
| 3a ✅ | Foundation | 12 | 12 |
| 3b ✅ | Type Safety | 29 | 41 |
| 3c | Native Set | 22 | 63 |
| 3d | Native Map P1 | 20 | 83 |
| 3e | Native Map P2 | 19 | 102 |
| 3f | Array Empty | 35 | 137 |
| 3g | Non-null ! | 26 | 163 |
| 3h | String Methods | 21 | 184 |
| 3i | toLowerCase | 14 | 198 |
| 3j | Array Ops | 12 | 210 |
| 3k | Modernization | 22 | 232 |
| 3l | Optimization | 8 | 240 |
