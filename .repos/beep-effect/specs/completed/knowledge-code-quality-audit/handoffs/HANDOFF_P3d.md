# Handoff Document: Phase 3d Native Map Part 1

**Spec**: `knowledge-code-quality-audit`
**Phase**: 3d - Data Structures (Native Map Part 1)
**Created**: 2026-01-22
**Status**: Ready for implementation

---

## Session Summary

### What Was Completed

**Phase 3a (Foundation)** - 12 fixes:
- Created `CanonicalSelectionError` tagged error
- Extracted `cosineSimilarity`, `extractLocalName`, `formatEntityForEmbedding` to utilities

**Phase 3b (Type Safety)** - 29 fixes:
- V01: Added `.$type<EntityId.Type>()` to 19 table columns
- V04: Fixed error construction pattern
- V14: Fixed 9 EntityId creation patterns

**Phase 3c (Native Set)** - 22 fixes:
- Replaced all `new Set<T>()` with Effect's `MutableHashSet`
- All 8 files migrated successfully

### Current State

- All type checks pass: `bun run check --filter @beep/knowledge-server` ✅
- All tests pass: 55 tests, 0 failures ✅
- Zero native Set usages remain ✅

---

## Phase 3d Scope

### V12: Native Map Part 1 (~19 fixes)

Replace `new Map<K, V>()` with Effect's `MutableHashMap` in the 4 highest-impact files.

---

## Lessons Learned from Phase 3c (CRITICAL)

### 1. Empty Collection Creation

```typescript
// WRONG - Type parameter syntax doesn't work
MutableHashMap.make<string, number>();  // ❌ Type error!

// CORRECT - Use empty() for empty collections
MutableHashMap.empty<string, number>();  // ✅
```

### 2. Collection Creation from Values

```typescript
// make() takes VARIADIC tuple arguments
MutableHashMap.make(["key1", 1], ["key2", 2]);  // ✅

// fromIterable() takes an iterable of tuples
const entries: Array<[string, number]> = [["key1", 1], ["key2", 2]];
MutableHashMap.fromIterable(entries);  // ✅
```

### 3. Iteration - MutableHashMap HAS forEach

Unlike `MutableHashSet` (which requires `Iterable.forEach`), `MutableHashMap` **does** have its own `forEach`:

```typescript
// MutableHashMap - use MutableHashMap.forEach directly
MutableHashMap.forEach(map, (value, key) => { ... });  // ✅

// MutableHashSet - must use Iterable.forEach
import * as Iterable from "effect/Iterable";
Iterable.forEach(set, (item) => { ... });  // ✅
```

### 4. get() Returns Option

```typescript
// Native Map
const value = map.get(key);  // T | undefined
if (value !== undefined) { ... }

// MutableHashMap
import * as O from "effect/Option";
const optValue = MutableHashMap.get(map, key);  // Option<T>

// Pattern A: getOrElse for default
const value = O.getOrElse(optValue, () => defaultValue);

// Pattern B: Match/check
if (O.isSome(optValue)) {
  const value = optValue.value;
}

// Pattern C: Pipe with map
pipe(
  MutableHashMap.get(map, key),
  O.map((value) => doSomething(value))
);
```

---

## Replacement Patterns

### Basic Map Operations

```typescript
// BEFORE - Native JavaScript
const map = new Map<string, number>();
map.set(key, value);
map.get(key);       // T | undefined
map.has(key);
map.delete(key);
for (const [k, v] of map) { ... }

// AFTER - Effect MutableHashMap
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";

const map = MutableHashMap.empty<string, number>();
MutableHashMap.set(map, key, value);
MutableHashMap.get(map, key);   // Option<T>
MutableHashMap.has(map, key);   // boolean
MutableHashMap.remove(map, key);
MutableHashMap.forEach(map, (value, key) => { ... });
```

### Common Migration Patterns

#### Pattern 1: Map with subsequent .get() calls

```typescript
// BEFORE
const entityById = new Map<string, Entity>();
for (const entity of entities) {
  entityById.set(entity.id, entity);
}
const found = entityById.get(someId)!;  // Non-null assertion

// AFTER
const entityById = MutableHashMap.empty<string, Entity>();
for (const entity of entities) {
  MutableHashMap.set(entityById, entity.id, entity);
}
const found = pipe(
  MutableHashMap.get(entityById, someId),
  O.getOrThrow  // Or handle gracefully
);
```

#### Pattern 2: Map.get with fallback

```typescript
// BEFORE
const value = map.get(key) ?? defaultValue;

// AFTER
const value = pipe(
  MutableHashMap.get(map, key),
  O.getOrElse(() => defaultValue)
);
```

#### Pattern 3: Check existence then get

```typescript
// BEFORE
if (map.has(key)) {
  const value = map.get(key)!;
  doSomething(value);
}

// AFTER - Option 1: Use O.match
pipe(
  MutableHashMap.get(map, key),
  O.match({
    onNone: () => {},
    onSome: (value) => doSomething(value)
  })
);

// AFTER - Option 2: Keep has() check + O.getOrThrow
if (MutableHashMap.has(map, key)) {
  const value = pipe(MutableHashMap.get(map, key), O.getOrThrow);
  doSomething(value);
}
```

#### Pattern 4: new Map(Object.entries(obj))

```typescript
// BEFORE
const scoreMap = new Map<string, number>(Object.entries(scores));

// AFTER
import * as Struct from "effect/Struct";
const scoreMap = MutableHashMap.fromIterable(Struct.toEntries(scores));
```

---

## Files to Fix (Phase 3d - Part 1)

### Priority 1: EntityClusterer.ts (6 fixes)

| Line | Current Code | Fix |
|------|--------------|-----|
| 229 | `new Map<string, string>()` | `MutableHashMap.empty<string, string>()` |
| 230 | `new Map<string, number>()` | `MutableHashMap.empty<string, number>()` |
| 273 | `new Map<string, number>()` | `MutableHashMap.empty<string, number>()` |
| 299 | `new Map<string, string[]>()` | `MutableHashMap.empty<string, string[]>()` |
| 308 | `new Map<string, AssembledEntity>()` | `MutableHashMap.empty<string, AssembledEntity>()` |
| 400 | `new Map<string, readonly number[]>()` | `MutableHashMap.empty<string, readonly number[]>()` |

### Priority 2: SameAsLinker.ts (5 fixes)

| Line | Current Code | Fix |
|------|--------------|-----|
| 197 | `new Map<string, string>()` | `MutableHashMap.empty<string, string>()` |
| 229 | `new Map<string, string>()` | `MutableHashMap.empty<string, string>()` |
| 256 | `new Map<string, string>()` | `MutableHashMap.empty<string, string>()` |
| 275 | `new Map<string, string[]>()` | `MutableHashMap.empty<string, string[]>()` |
| 319 | `new Map<string, string>()` | `MutableHashMap.empty<string, string>()` |

### Priority 3: OntologyService.ts (6 fixes)

| Line | Current Code | Fix |
|------|--------------|-----|
| 71 | `new Map<string, ParsedClassDefinition>()` | `MutableHashMap.empty<...>()` |
| 76 | `new Map<string, ParsedPropertyDefinition>()` | `MutableHashMap.empty<...>()` |
| 82 | `new Map<string, ParsedPropertyDefinition[]>()` | `MutableHashMap.empty<...>()` |
| 93 | `new Map<string, MutableHashSet...>()` | `MutableHashMap.empty<...>()` |
| 141 | `new Map<string, ParsedPropertyDefinition>()` | `MutableHashMap.empty<...>()` |

**Note**: Line 93 has a Map of MutableHashSet values - already migrated Set in 3c.

### Priority 4: OntologyParser.ts (2 fixes)

| Line | Current Code | Fix |
|------|--------------|-----|
| 131 | `new Map<string, string[]>()` | `MutableHashMap.empty<string, string[]>()` |
| 238 | `new Map<string, string[]>()` | `MutableHashMap.empty<string, string[]>()` |

---

## Required Imports

Add to each file:

```typescript
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
```

---

## Verification Commands

```bash
# After each file
bun run check --filter @beep/knowledge-server

# Final verification
bun run test --filter @beep/knowledge-server

# Count remaining (Part 1 files only)
grep -rn "new Map<" packages/knowledge/server/src/EntityResolution/EntityClusterer.ts \
  packages/knowledge/server/src/EntityResolution/SameAsLinker.ts \
  packages/knowledge/server/src/Ontology/OntologyService.ts \
  packages/knowledge/server/src/Ontology/OntologyParser.ts
# Should return empty after Phase 3d
```

---

## Success Criteria

| Check | Expected |
|-------|----------|
| `bun run check --filter @beep/knowledge-server` | Exit 0 |
| `bun run test --filter @beep/knowledge-server` | 55 pass |
| `grep "new Map<" (4 target files)` | 0 matches |

---

## After Phase 3d

Next phase is **3e: Native Map Part 2** (~19 fixes in remaining files):
- EntityResolutionService.ts (4)
- GraphAssembler.ts (3)
- GraphRAGService.ts (3)
- ContextFormatter.ts (2)
- RrfScorer.ts (3)
- GroundingService.ts (1)
- ExtractionPipeline.ts (2)
- RelationExtractor.ts (1)
- EntityExtractor.ts (1)
- EmbeddingService.ts (1)

---

## Reference

- Master violations: `specs/knowledge-code-quality-audit/outputs/MASTER_VIOLATIONS.md`
- Effect MutableHashMap docs: https://effect.website/docs/data-types/mutable-hash-map
- Project patterns: `.claude/rules/effect-patterns.md`
