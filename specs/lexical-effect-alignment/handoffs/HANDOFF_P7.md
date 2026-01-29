# Phase 7 Handoff: Promise-Based Code

## Phase Summary

Replace Promise-based patterns with Effect runtime patterns for non-network code in `apps/todox/src/app/lexical/`.

---

## Working Memory (Critical Context)

### Success Criteria

- [ ] All `async function` replaced with `Effect.gen`
- [ ] All `await promise` replaced with `yield* Effect.promise`
- [ ] All `Promise.resolve/reject` replaced with `Effect.succeed/fail`
- [ ] React components use `useRuntime` pattern
- [ ] `bun run build` passes
- [ ] `bun run check` passes
- [ ] `bun run lint` passes

### Constraints

- Orchestrator must NOT write code directly
- Maximum 5 effect-code-writer agents per batch
- **Network-related promises MAY be kept** (external API calls)

---

## Episodic Memory (Previous Phase)

### P6 Summary

Phase 6 replaced JSON.parse/stringify with Effect Schema equivalents.

**P6 Key Results:**
- 11 violations migrated across 6 files
- S.parseJson(schema) pattern for combined JSON parse+validate
- S.mutable() required for schemas returning mutable types
- Type assertions needed after S.Unknown for external library types

**P6 Key Learnings (apply to P7):**
1. External library types may require type assertions after Effect patterns
2. Discovery → Execute → Check → Fix → Verify workflow is standard
3. Batching 5 agents prevents resource contention
4. Fix agents can handle predictable type error patterns efficiently

---

## Semantic Memory (Constants)

### Import Patterns

```typescript
import * as Effect from "effect/Effect";
import { useRuntime } from "@/hooks/useRuntime";
```

### Migration Patterns

| Before | After |
|--------|-------|
| `async function fn()` | `Effect.gen(function* () { ... })` |
| `await promise` | `yield* Effect.promise(() => promise)` |
| `Promise.resolve(x)` | `Effect.succeed(x)` |
| `Promise.reject(e)` | `Effect.fail(e)` |
| `new Promise()` | `Effect.async()` |

### React Hook Pattern

```typescript
function MyComponent() {
  const runtime = useRuntime();

  const handleAction = () => {
    runtime.runPromise(
      Effect.gen(function* () {
        // Effect code here
      })
    );
  };
}
```

---

## Procedural Memory (References)

| Document | Purpose |
|----------|---------|
| `MASTER_ORCHESTRATION.md#phase-7` | Phase 7 details |
| `agent-prompts/P7-promise-discovery.md` | Discovery agent prompt |
| `agent-prompts/P7-code-writer.md` | Code writer agent prompt |

---

## Reference Examples

- `apps/todox/src/app/lexical/nodes/embeds/TweetNode.tsx`
- `apps/todox/src/app/lexical/nodes/ExcalidrawNode/ExcalidrawImage.tsx`

---

## Execution Steps

Same pattern as previous phases:
1. Discovery (4 parallel agents)
2. Consolidation (1 agent)
3. Execution (batched parallel, 5 per batch)
4. Verification
5. Reflection
6. Handoff to P8

---

## Context Budget

| Memory Type | Budget | Estimated |
|-------------|--------|-----------|
| Total | 4,000 tokens | ~1,000 |

Within budget.
