# Phase 4 Handoff: Native Map

## Phase Summary

Replace all native JavaScript `Map` usage with `effect/MutableHashMap` or `effect/HashMap` in `apps/todox/src/app/lexical/`.

---

## Working Memory (Critical Context)

### Success Criteria

- [ ] All `new Map()` replaced with `MutableHashMap.make()` or `HashMap.make()`
- [ ] All `.set()`, `.delete()`, `.clear()` use MutableHashMap
- [ ] All `.get()`, `.has()` use HashMap or MutableHashMap
- [ ] `bun run build` passes
- [ ] `bun run check` passes
- [ ] `bun run lint` passes

### Decision Criteria

- **Mutable operations** (`.set()`, `.delete()`, `.clear()`) → `MutableHashMap`
- **Immutable operations** (`.get()`, `.has()`, iteration only) → `HashMap`

### Constraints

- Orchestrator must NOT write code directly
- Maximum 5 effect-code-writer agents per batch

---

## Episodic Memory (Previous Phase)

### P3 Summary

Phase 3 replaced 9 native Set instances across 7 files:
- **Batch 1 (Mutable)**: CodeActionMenuPlugin, CommentPlugin, TableActionMenuPlugin, TableCellResizer, TableHoverActionsPlugin
- **Batch 2 (Immutable)**: TestRecorderPlugin, TypingPerfPlugin

### Key Learnings from P1-P3

**CRITICAL API PATTERNS (apply to P4):**

1. **Use `empty<T>()` for empty collections, NOT `make<T>()`**
   ```typescript
   // WRONG - causes type errors
   MutableHashSet.make<string>()
   MutableHashMap.make<string, number>()

   // CORRECT
   MutableHashSet.empty<string>()
   MutableHashMap.empty<string, number>()
   ```

2. **Direct iteration - no `.values()` method**
   ```typescript
   // WRONG
   for (const item of MutableHashSet.values(set)) { }

   // CORRECT - MutableHashSet is directly iterable
   for (const item of set) { }
   ```

3. **Deploy `package-error-fixer` agent if type errors occur**
   - Don't fix manually - deploy the agent with filter
   - Agent resolved 7 errors in P3 in one pass

4. **Discovery agents find most violations in `plugins/` directory**
   - `commenting/`, `utils/` often already Effect-compliant

---

## Semantic Memory (Constants)

### Import Patterns

```typescript
import * as MutableHashMap from "effect/MutableHashMap";
import * as HashMap from "effect/HashMap";
import * as O from "effect/Option";  // .get() returns Option
```

### Key Method Changes

| Native | Effect |
|--------|--------|
| `new Map()` | `MutableHashMap.empty<K, V>()` |
| `new Map([[k, v]])` | `MutableHashMap.make([k, v])` |
| `map.set(k, v)` | `MutableHashMap.set(map, k, v)` |
| `map.get(k)` | `MutableHashMap.get(map, k)` → `Option<V>` |
| `map.has(k)` | `MutableHashMap.has(map, k)` |
| `map.delete(k)` | `MutableHashMap.remove(map, k)` |
| `map.size` | `MutableHashMap.size(map)` |
| `for (const [k,v] of map)` | `for (const [k,v] of map)` (directly iterable) |

### Important Notes

1. **`get()` returns `Option<V>`**, not `V | undefined`. Callers must handle Option:
   ```typescript
   import * as O from "effect/Option";
   const value = MutableHashMap.get(map, key);
   O.match(value, {
     onNone: () => defaultValue,
     onSome: (v) => v
   });
   // OR
   O.getOrElse(value, () => defaultValue);
   ```

2. **Use `empty<K, V>()` for empty maps** (learned from P3):
   ```typescript
   // CORRECT
   const map = MutableHashMap.empty<string, number>();
   ```

---

## Procedural Memory (References)

| Document | Purpose |
|----------|---------|
| `MASTER_ORCHESTRATION.md#phase-4` | Phase 4 details |
| `agent-prompts/P4-map-discovery.md` | Discovery agent prompt |
| `agent-prompts/P4-code-writer.md` | Code writer agent prompt |

---

## Execution Steps

Same pattern as previous phases:
1. Discovery (4 parallel agents)
2. Consolidation (1 agent)
3. Execution (batched parallel, 5 per batch)
4. Verification
5. Reflection
6. Handoff to P5

---

## Context Budget

| Memory Type | Budget | Estimated |
|-------------|--------|-----------|
| Total | 4,000 tokens | ~950 |

Within budget.
