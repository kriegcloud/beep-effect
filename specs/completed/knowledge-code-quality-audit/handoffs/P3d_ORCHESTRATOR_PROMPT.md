# Phase 3d Orchestrator Prompt - Native Map Part 1

Copy-paste this prompt to start Phase 3d implementation.

---

## Prompt

You are implementing Phase 3d (Native Map Part 1) of the `knowledge-code-quality-audit` spec.

### Context

**Completed**: Phases 3a, 3b, 3c - 63 fixes done (Foundation, Type Safety, Native Set).

**This Phase**: Replace `new Map<K, V>()` with Effect's `MutableHashMap` (19 fixes across 4 files)

### Lessons Learned from Phase 3c (CRITICAL)

**1. Empty collection creation - DO NOT use type parameter with make():**
```typescript
// WRONG - causes type error
MutableHashMap.make<string, number>();  // ❌

// CORRECT - use empty() for empty collections
MutableHashMap.empty<string, number>();  // ✅
```

**2. Creating from values:**
```typescript
// make() takes VARIADIC tuples
MutableHashMap.make(["key1", 1], ["key2", 2]);  // ✅

// fromIterable() for array of tuples
MutableHashMap.fromIterable(entries);  // ✅
```

**3. Iteration - MutableHashMap HAS forEach (unlike MutableHashSet):**
```typescript
// MutableHashMap - use directly
MutableHashMap.forEach(map, (value, key) => { ... });  // ✅

// MutableHashSet - must use Iterable.forEach
import * as Iterable from "effect/Iterable";
Iterable.forEach(set, (item) => { ... });  // Required for sets!
```

**4. get() returns Option<T>, NOT T | undefined:**
```typescript
import * as O from "effect/Option";

// With default value
const value = O.getOrElse(MutableHashMap.get(map, key), () => defaultValue);

// After has() check
if (MutableHashMap.has(map, key)) {
  const value = O.getOrThrow(MutableHashMap.get(map, key));
}
```

### Replacement Pattern

```typescript
// BEFORE - Native JavaScript
const map = new Map<string, number>();
map.set(key, value);
map.get(key);           // T | undefined
map.has(key);
for (const [k, v] of map) { ... }

// AFTER - Effect MutableHashMap
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";

const map = MutableHashMap.empty<string, number>();
MutableHashMap.set(map, key, value);
MutableHashMap.get(map, key);    // Option<T> - MUST handle!
MutableHashMap.has(map, key);    // boolean
MutableHashMap.forEach(map, (value, key) => { ... });
```

### Files to Fix

| File | Line Numbers | Count |
|------|--------------|-------|
| `EntityResolution/EntityClusterer.ts` | 229, 230, 273, 299, 308, 400 | 6 |
| `EntityResolution/SameAsLinker.ts` | 197, 229, 256, 275, 319 | 5 |
| `Ontology/OntologyService.ts` | 71, 76, 82, 93, 141 | 5+ |
| `Ontology/OntologyParser.ts` | 131, 238 | 2 |

### Required Imports

Add to each file (if not present):
```typescript
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
```

### Common Pattern: new Map(Object.entries(obj))

```typescript
// BEFORE
const scoreMap = new Map<string, number>(Object.entries(scores));

// AFTER
import * as Struct from "effect/Struct";
const scoreMap = MutableHashMap.fromIterable(Struct.toEntries(scores));
```

### Verification

```bash
# Type check
bun run check --filter @beep/knowledge-server

# Tests (55 should pass)
bun run test --filter @beep/knowledge-server

# Verify no native Map in target files
grep -rn "new Map<" packages/knowledge/server/src/EntityResolution/EntityClusterer.ts \
  packages/knowledge/server/src/EntityResolution/SameAsLinker.ts \
  packages/knowledge/server/src/Ontology/OntologyService.ts \
  packages/knowledge/server/src/Ontology/OntologyParser.ts
# Should return empty
```

### Success Criteria

| Check | Expected |
|-------|----------|
| `bun run check --filter @beep/knowledge-server` | Exit 0 |
| `bun run test --filter @beep/knowledge-server` | 55 pass |
| `grep "new Map<" (4 target files)` | 0 matches |

### Common Pitfalls

1. **Using make<K,V>() for empty maps** - Use `empty<K,V>()` instead
2. **Forgetting Option import** - `get()` returns `Option<T>`
3. **for...of loops** - Use `MutableHashMap.forEach(map, fn)`
4. **Map spread `[...map]`** - Not directly supported, use forEach or convert
5. **Object.entries** - Use `Struct.toEntries()` from `effect/Struct`

### After Completion

Update `MASTER_VIOLATIONS.md` to mark Phase 3d complete, then proceed to Phase 3e (Native Map Part 2).

### Reference

- Full handoff: `specs/knowledge-code-quality-audit/handoffs/HANDOFF_P3d.md`
- Master violations: `specs/knowledge-code-quality-audit/outputs/MASTER_VIOLATIONS.md`
