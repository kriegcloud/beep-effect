# Phase 3e Handoff - Native Map Part 2

**Previous Phase**: 3d (Native Map Part 1) ✅ Complete
**Current Phase**: 3e (Native Map Part 2)
**Status**: Ready to Start

---

## Context

Phase 3d successfully migrated native `Map` to `MutableHashMap` in 5 high-impact files (24 fixes). Phase 3e completes the Map migration in the remaining 6 files (15 fixes).

### Completed Phases

| Phase | Description | Fixes |
|-------|-------------|-------|
| 3a | Foundation (errors, duplicates) | 12 |
| 3b | Type Safety (EntityIds) | 29 |
| 3c | Native Set → MutableHashSet | 22 |
| 3d | Native Map Part 1 | 24 |
| **Total** | | **87/240 (36%)** |

---

## Phase 3e Scope

**Goal**: Complete Map → MutableHashMap migration in remaining files.

| File | Violations | Lines |
|------|------------|-------|
| `GraphAssembler.ts` | 3 | 219, 371, 372 |
| `GraphRAGService.ts` | 3 | 300, 386, 440 |
| `ContextFormatter.ts` | 2 | 113, 152 |
| `RrfScorer.ts` | 3 | 98, 136, 146 |
| `GroundingService.ts` | 1 | 227 |
| `ExtractionPipeline.ts` | 2 | 288, 294 |
| `RelationExtractor.ts` | 1 | 288 |
| **Total** | **15** | |

---

## Lessons Learned from Phase 3d (CRITICAL)

### 1. Empty Map Creation - Use `empty<K, V>()` NOT `make<K, V>()`

```typescript
// WRONG - causes type error
MutableHashMap.make<string, number>();  // ❌

// CORRECT - use empty() for empty collections
MutableHashMap.empty<string, number>();  // ✅
```

### 2. Creating from Values

```typescript
// make() takes VARIADIC tuples (for non-empty maps)
MutableHashMap.make(["key1", 1], ["key2", 2]);  // ✅

// fromIterable() for array of tuples
MutableHashMap.fromIterable(entries);  // ✅
```

### 3. get() Returns Option<T>, NOT T | undefined

```typescript
import * as O from "effect/Option";

// With default value
const value = O.getOrElse(MutableHashMap.get(map, key), () => defaultValue);

// After has() check - safe to use getOrThrow
if (MutableHashMap.has(map, key)) {
  const value = O.getOrThrow(MutableHashMap.get(map, key));
}

// Check if None and early return
const valueOpt = MutableHashMap.get(map, key);
if (O.isNone(valueOpt)) return;
const value = valueOpt.value;
```

### 4. MutableHashMap HAS forEach (unlike MutableHashSet)

```typescript
// MutableHashMap - use directly
MutableHashMap.forEach(map, (value, key) => { ... });  // ✅

// MutableHashSet - must use Iterable.forEach
import * as Iterable from "effect/Iterable";
Iterable.forEach(set, (item) => { ... });  // Required for sets!
```

### 5. Size Property

```typescript
// WRONG
map.size  // ❌ Native Map property

// CORRECT
MutableHashMap.size(map)  // ✅
```

### 6. Converting Map Iterations

```typescript
// BEFORE - for...of with entries()
for (const [key, value] of map.entries()) { ... }

// AFTER - forEach
MutableHashMap.forEach(map, (value, key) => { ... });

// BEFORE - for...of with values()
for (const value of map.values()) { ... }

// AFTER - forEach ignoring key
MutableHashMap.forEach(map, (value) => { ... });
```

### 7. Building Results from Maps

```typescript
// BEFORE
return Array.from(map.entries()).map(([k, v]) => ({ k, v }));

// AFTER
const result: ResultType[] = [];
MutableHashMap.forEach(map, (value, key) => {
  result.push({ key, value });
});
return result;
```

### 8. Downstream Dependencies

When changing a function's parameter from `Map<K,V>` to `MutableHashMap<K,V>`, ALL callers must be updated. In Phase 3d, `EntityResolutionService.ts` needed fixing because it called `SameAsLinker.generateLinks()`.

**Check for callers before marking complete!**

---

## Replacement Patterns

### Basic Pattern

```typescript
// BEFORE - Native JavaScript
const map = new Map<string, number>();
map.set(key, value);
map.get(key);           // T | undefined
map.has(key);
map.size;
for (const [k, v] of map) { ... }

// AFTER - Effect MutableHashMap
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";

const map = MutableHashMap.empty<string, number>();
MutableHashMap.set(map, key, value);
MutableHashMap.get(map, key);    // Option<T> - MUST handle!
MutableHashMap.has(map, key);    // boolean
MutableHashMap.size(map);        // number
MutableHashMap.forEach(map, (value, key) => { ... });
```

### Pattern: Get-or-Create

```typescript
// BEFORE
if (!map.has(key)) {
  map.set(key, []);
}
map.get(key)!.push(item);

// AFTER
if (!MutableHashMap.has(map, key)) {
  MutableHashMap.set(map, key, []);
}
O.getOrThrow(MutableHashMap.get(map, key)).push(item);
```

### Pattern: Get with Default

```typescript
// BEFORE
const value = map.get(key) ?? defaultValue;

// AFTER
const value = O.getOrElse(MutableHashMap.get(map, key), () => defaultValue);
```

### Pattern: Conditional Get

```typescript
// BEFORE
const value = map.get(key);
if (value === undefined) continue;
// use value

// AFTER
const valueOpt = MutableHashMap.get(map, key);
if (O.isNone(valueOpt)) continue;
const value = valueOpt.value;
// use value
```

---

## Required Imports

Add to each file (if not present):

```typescript
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
```

---

## File-Specific Notes

### GraphAssembler.ts (3 fixes)
- Line 219: Entity lookup map
- Lines 371-372: Relation building maps
- Check for downstream callers in Extraction module

### GraphRAGService.ts (3 fixes)
- Lines 300, 386: Object.entries patterns - may also need R.toEntries
- Line 440: Result aggregation map

### ContextFormatter.ts (2 fixes)
- Lines 113, 152: Entity/relation formatting maps
- Simple local scope - no downstream dependencies

### RrfScorer.ts (3 fixes)
- Lines 98, 136, 146: Score aggregation maps
- May have non-null assertions to fix simultaneously

### GroundingService.ts (1 fix)
- Line 227: Confidence mapping
- Simple case

### ExtractionPipeline.ts (2 fixes)
- Lines 288, 294: Pipeline processing maps
- Check for downstream callers

### RelationExtractor.ts (1 fix)
- Line 288: Relation lookup map
- Simple case

---

## Verification Commands

```bash
# Type check
bun run check --filter @beep/knowledge-server

# Tests (55 should pass)
bun run test --filter @beep/knowledge-server

# Verify no native Map in target files
grep -rn "new Map<" \
  packages/knowledge/server/src/Extraction/GraphAssembler.ts \
  packages/knowledge/server/src/GraphRAG/GraphRAGService.ts \
  packages/knowledge/server/src/GraphRAG/ContextFormatter.ts \
  packages/knowledge/server/src/GraphRAG/RrfScorer.ts \
  packages/knowledge/server/src/Grounding/GroundingService.ts \
  packages/knowledge/server/src/Extraction/ExtractionPipeline.ts \
  packages/knowledge/server/src/Extraction/RelationExtractor.ts
# Should return empty (exit code 1)
```

---

## Success Criteria

| Check | Expected |
|-------|----------|
| `bun run check --filter @beep/knowledge-server` | Exit 0 |
| `bun run test --filter @beep/knowledge-server` | 55 pass |
| `grep "new Map<" (7 target files)` | 0 matches |

---

## After Completion

1. Update `MASTER_VIOLATIONS.md`:
   - Mark Phase 3e as ✅ COMPLETE
   - Update progress to ~102/240 (43%)
   - Update dependency diagram

2. Proceed to Phase 3f (Array Emptiness Checks - 35 fixes)

---

## Reference

- Master violations: `specs/knowledge-code-quality-audit/outputs/MASTER_VIOLATIONS.md`
- Phase 3d handoff: `specs/knowledge-code-quality-audit/handoffs/HANDOFF_P3d.md`
- Effect patterns: `.claude/rules/effect-patterns.md`
