# Phase 5 Handoff: Native Error

## Phase Summary

Replace all native `Error` usage with Effect `S.TaggedError` schemas in `apps/todox/src/app/lexical/`.

---

## Working Memory (Critical Context)

### Success Criteria

- [ ] All `throw new Error()` replaced with `Effect.fail(new TaggedError())`
- [ ] All error classes defined as `S.TaggedError` schemas
- [ ] Shared errors in `apps/todox/src/app/lexical/schema/errors.ts`
- [ ] `bun run build` passes
- [ ] `bun run check` passes
- [ ] `bun run lint` passes

### Error Location Decision

| Scenario | Location |
|----------|----------|
| Error used in multiple files | `apps/todox/src/app/lexical/schema/errors.ts` |
| Error specific to one file | Top of that file, after imports |

### Constraints

- Orchestrator must NOT write code directly
- Maximum 5 effect-code-writer agents per batch

---

## Episodic Memory (Previous Phase)

### P4 Summary

Phase 4 replaced native Map with Effect HashMap/MutableHashMap.

### Key Learnings from P1-P4

**CRITICAL API PATTERNS (apply to P5):**

1. **Use `empty<T>()` for empty collections, NOT `make<T>()`**
   - Applies to MutableHashSet.empty<T>(), MutableHashMap.empty<K, V>()
   - HashMap.fromIterable([...entries]) with as const for typed entries

2. **MutableHashMap.get() returns Option<V>**
   - Always wrap with O.getOrUndefined() or O.match()

3. **Direct iteration - no .values() method**
   - `for (const item of set)` - MutableHashSet is directly iterable
   - `for (const [k, v] of map)` - MutableHashMap is directly iterable

4. **Deploy package-error-fixer agent if type errors occur**
   - Validated across P2, P3, P4 - single-pass resolution
   - Standard workflow: Discovery → Execute → Check → Fix → Verify

5. **React mutable collections: useRef not useMemo**
   - `useRef(MutableHashMap.empty<K, V>())` for stable reference

---

## Semantic Memory (Constants)

### Import Pattern

```typescript
import * as S from "effect/Schema";
import * as Effect from "effect/Effect";
```

### Schema Template

```typescript
export class MyError extends S.TaggedError<MyError>()("MyError", {
  message: S.String,
  // Add contextual fields as needed
}) {}
```

### Migration Pattern

```typescript
// BEFORE
throw new Error("User not found");

// AFTER
yield* Effect.fail(new UserNotFoundError({ message: "User not found" }));
```

---

## Procedural Memory (References)

| Document | Purpose |
|----------|---------|
| `MASTER_ORCHESTRATION.md#phase-5` | Phase 5 details |
| `agent-prompts/P5-error-discovery.md` | Discovery agent prompt |
| `agent-prompts/P5-code-writer.md` | Code writer agent prompt |

---

## Special Cases

### Lexical/React Callbacks That Must Throw

Some Lexical callbacks MUST throw for error propagation. Document but preserve:

```typescript
// This MUST throw - Lexical expects it
// TODO: Consider Effect wrapper at higher level
importJSON(json: SerializedNode): void {
  if (!json.valid) throw new Error("Invalid JSON");  // KEEP AS IS
}
```

---

## Execution Steps

Same pattern as previous phases:
1. Discovery (4 parallel agents)
2. Consolidation (1 agent)
3. Execution (batched parallel, 5 per batch)
4. Verification
5. Reflection
6. Handoff to P6

---

## Context Budget

| Memory Type | Budget | Estimated |
|-------------|--------|-----------|
| Total | 4,000 tokens | ~1,100 |

Within budget.
