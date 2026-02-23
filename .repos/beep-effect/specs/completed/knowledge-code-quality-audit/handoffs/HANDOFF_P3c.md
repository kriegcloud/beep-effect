# Handoff Document: Phase 3c Data Structures

**Spec**: `knowledge-code-quality-audit`
**Phase**: 3c - Data Structures
**Created**: 2026-01-22
**Status**: Ready for implementation

---

## Session Summary

### What Was Completed

**Phase 3a (Foundation)** - 12 fixes:
- Created `CanonicalSelectionError` tagged error in `packages/knowledge/domain/src/errors/entity-resolution.errors.ts`
- Extracted `cosineSimilarity` to `packages/knowledge/server/src/utils/vector.ts`
- Extracted `extractLocalName` and `formatEntityForEmbedding` to `packages/knowledge/server/src/utils/formatting.ts`
- Updated all files that used duplicate code to import from utilities

**Phase 3b (Type Safety)** - 29 fixes:
- V01: Added `.$type<EntityId.Type>()` to 19 table columns across 8 files in `packages/knowledge/tables/src/tables/`
- V04: Fixed error construction in `EmbeddingService.ts` - changed cast pattern to `new EmbeddingError({...})`
- V14: Fixed 9 EntityId creation patterns to use `.create()` instead of manual string construction

### Current State

- All type checks pass: `bun run check --filter @beep/knowledge-server` ✅
- All tests pass: 55 tests, 0 failures ✅
- `MASTER_VIOLATIONS.md` updated to show Phases 3a and 3b complete

---

## Phase 3c Scope

### V09: Native Set (22 violations)

Pattern to replace:
```typescript
// Native JavaScript
const set = new Set<string>();
set.add(item);
set.has(item);
for (const item of set) { ... }
set.delete(item);
set.clear();
set.size;

// Effect MutableHashSet
import * as MutableHashSet from "effect/MutableHashSet";
const set = MutableHashSet.make<string>();
MutableHashSet.add(set, item);
MutableHashSet.has(set, item);
MutableHashSet.forEach(set, (item) => { ... });
MutableHashSet.remove(set, item);
// No clear - create new set
MutableHashSet.size(set);
```

### V12: Native Map (39 violations)

Pattern to replace:
```typescript
// Native JavaScript
const map = new Map<string, number>();
map.set(key, value);
map.get(key);  // T | undefined
map.has(key);
for (const [k, v] of map) { ... }

// Effect MutableHashMap
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
const map = MutableHashMap.make<string, number>();
MutableHashMap.set(map, key, value);
MutableHashMap.get(map, key);  // Option<T>
MutableHashMap.has(map, key);
MutableHashMap.forEach(map, (value, key) => { ... });
```

**Critical**: `MutableHashMap.get()` returns `Option<T>` not `T | undefined`. You must handle this:
```typescript
// Pattern 1: getOrElse for default value
const value = pipe(
  MutableHashMap.get(map, key),
  O.getOrElse(() => defaultValue)
);

// Pattern 2: Check and get (when you already checked has())
if (MutableHashMap.has(map, key)) {
  const value = pipe(MutableHashMap.get(map, key), O.getOrThrow);
}

// Pattern 3: Map over Option
pipe(
  MutableHashMap.get(map, key),
  O.map((value) => doSomething(value))
);
```

---

## Files by Priority

### High-Impact Files (fix these first)

| File | V09 | V12 | Total | Notes |
|------|-----|-----|-------|-------|
| `EntityClusterer.ts` | 6 | 6 | 12 | Hotspot file |
| `SameAsLinker.ts` | 18 | 5 | 23 | Most Set violations |
| `OntologyService.ts` | 7 | 6 | 13 | Many Set/Map |

### Medium Files

| File | V09 | V12 | Total |
|------|-----|-----|-------|
| `CanonicalSelector.ts` | 3 | 0 | 3 |
| `OntologyParser.ts` | 9 | 2 | 11 |
| `GraphRAGService.ts` | 6 | 3 | 9 |
| `ConfidenceFilter.ts` | 7 | 0 | 7 |
| `GraphAssembler.ts` | 3 | 3 | 6 |

### Lower Files

| File | V09 | V12 | Total |
|------|-----|-----|-------|
| `EntityResolutionService.ts` | 0 | 4 | 4 |
| `ContextFormatter.ts` | 0 | 2 | 2 |
| `RrfScorer.ts` | 0 | 3 | 3 |
| `GroundingService.ts` | 0 | 1 | 1 |
| `ExtractionPipeline.ts` | 0 | 2 | 2 |
| `RelationExtractor.ts` | 0 | 1 | 1 |
| `EmbeddingService.ts` | 0 | 1 | 1 |

---

## Verification After Each File

```bash
# Quick syntax check for single file
bun tsc --noEmit packages/knowledge/server/src/path/to/File.ts

# Full type check (takes longer due to dependency cascade)
bun run check --filter @beep/knowledge-server
```

---

## Common Pitfalls

1. **Forgetting to import Option**: MutableHashMap.get returns Option, you need `import * as O from "effect/Option"`

2. **for...of loops**: These don't work with MutableHashSet/Map. Use `.forEach()` or convert to array first

3. **Set.prototype.has in A.some**: Replace `A.some(array, set.has)` with `A.some(array, (item) => MutableHashSet.has(set, item))`

4. **Map spread**: `[...map]` doesn't work - use `MutableHashMap.toEntries(map)` or `Array.from(MutableHashMap.toEntries(map))`

5. **Mutability**: MutableHashSet/Map are mutable (unlike most Effect data structures). The `add`/`set` operations mutate in place and return the collection.

---

## Related Documentation

- Effect MutableHashSet: https://effect.website/docs/data-types/mutable-hash-set
- Effect MutableHashMap: https://effect.website/docs/data-types/mutable-hash-map
- Project patterns: `.claude/rules/effect-patterns.md`

---

## After Phase 3c

Next phase is **3d: Method Patterns** (108 fixes):
- V03: String methods → Str.*
- V05: Array emptiness → A.isEmptyReadonlyArray
- V10: Native A.map → A.map
- V11: Non-null assertions → Option patterns
- V13: Array.sort → A.sort + Order
- V15: toLowerCase → Str.toLowerCase

Many V11 fixes will be easier after Phase 3c since Map.get Option handling addresses the underlying issue.
