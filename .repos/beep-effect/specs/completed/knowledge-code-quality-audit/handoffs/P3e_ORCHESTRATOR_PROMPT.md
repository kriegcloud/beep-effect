# Phase 3e Orchestrator Prompt - Native Map Part 2

Copy-paste this prompt to start Phase 3e implementation.

---

## Prompt

You are implementing Phase 3e (Native Map Part 2) of the `knowledge-code-quality-audit` spec.

### Context

**Completed**: Phases 3a, 3b, 3c, 3d - 87 fixes done (Foundation, Type Safety, Native Set, Native Map Part 1).

**This Phase**: Complete `new Map<K, V>()` → `MutableHashMap` migration (15 fixes across 7 files)

### Lessons Learned from Phase 3d (CRITICAL)

**1. Empty collection creation - Use empty(), NOT make():**
```typescript
// WRONG - causes type error
MutableHashMap.make<string, number>();  // ❌

// CORRECT - use empty() for empty collections
MutableHashMap.empty<string, number>();  // ✅
```

**2. get() returns Option<T>, NOT T | undefined:**
```typescript
import * as O from "effect/Option";

// With default value
const value = O.getOrElse(MutableHashMap.get(map, key), () => defaultValue);

// After has() check
if (MutableHashMap.has(map, key)) {
  const value = O.getOrThrow(MutableHashMap.get(map, key));
}

// Check if None and early return
const valueOpt = MutableHashMap.get(map, key);
if (O.isNone(valueOpt)) continue;
const value = valueOpt.value;
```

**3. MutableHashMap HAS forEach (unlike MutableHashSet):**
```typescript
// MutableHashMap - use directly
MutableHashMap.forEach(map, (value, key) => { ... });  // ✅

// Note: callback signature is (value, key), NOT (key, value)!
```

**4. Size is a function, not a property:**
```typescript
MutableHashMap.size(map)  // ✅
// NOT map.size
```

**5. Check for downstream callers:**
When changing a function's parameter type, ALL callers must be updated. Grep for function usage before marking complete.

### Replacement Pattern

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

### Files to Fix

| File | Violations | Lines |
|------|------------|-------|
| `Extraction/GraphAssembler.ts` | 3 | 219, 371, 372 |
| `GraphRAG/GraphRAGService.ts` | 3 | 300, 386, 440 |
| `GraphRAG/ContextFormatter.ts` | 2 | 113, 152 |
| `GraphRAG/RrfScorer.ts` | 3 | 98, 136, 146 |
| `Grounding/GroundingService.ts` | 1 | 227 |
| `Extraction/ExtractionPipeline.ts` | 2 | 288, 294 |
| `Extraction/RelationExtractor.ts` | 1 | 288 |

### Required Imports

Add to each file (if not present):
```typescript
import * as MutableHashMap from "effect/MutableHashMap";
import * as O from "effect/Option";
```

### Verification

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
# Should return empty
```

### Success Criteria

| Check | Expected |
|-------|----------|
| `bun run check --filter @beep/knowledge-server` | Exit 0 |
| `bun run test --filter @beep/knowledge-server` | 55 pass |
| `grep "new Map<" (7 target files)` | 0 matches |

### Common Pitfalls

1. **Using make<K,V>() for empty maps** - Use `empty<K,V>()` instead
2. **Forgetting Option import** - `get()` returns `Option<T>`
3. **for...of loops** - Use `MutableHashMap.forEach(map, (value, key) => ...)`
4. **forEach callback order** - It's `(value, key)`, NOT `(key, value)`
5. **Map spread `[...map]`** - Not supported, use forEach or convert
6. **Forgetting to check callers** - Function signature changes break callers

### After Completion

Update `MASTER_VIOLATIONS.md` to mark Phase 3e complete, then proceed to Phase 3f (Array Emptiness Checks - 35 fixes).

### Reference

- Full handoff: `specs/knowledge-code-quality-audit/handoffs/HANDOFF_P3e.md`
- Master violations: `specs/knowledge-code-quality-audit/outputs/MASTER_VIOLATIONS.md`
