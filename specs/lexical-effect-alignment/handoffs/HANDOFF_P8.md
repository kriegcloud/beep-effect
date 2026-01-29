# Phase 8 Handoff: Raw Regex

## Phase Summary

Replace raw regex usage with `effect/String` `Str.match` patterns in `apps/todox/src/app/lexical/`.

---

## Working Memory (Critical Context)

### Success Criteria

- [ ] All `str.match(/regex/)` replaced with `Str.match(/regex/)(str)`
- [ ] All `/regex/.test(str)` replaced with `O.isSome(Str.match(...))`
- [ ] All `/regex/.exec(str)` replaced with `Str.match(...)`
- [ ] All `str.replace(/regex/, rep)` replaced with `Str.replace(str, /regex/, rep)`
- [ ] `bun run build` passes
- [ ] `bun run check` passes
- [ ] `bun run lint` passes

### Constraints

- Orchestrator must NOT write code directly
- Maximum 5 effect-code-writer agents per batch

---

## Episodic Memory (Previous Phase)

### P7 Summary

Phase 7 replaced Promise-based patterns with Effect runtime patterns.

**P7 Key Results:**
- 9 files migrated (10 counting TweetNode async wrapper removal)
- Promise patterns concentrated in A-F plugins; G-Z already Effect-compliant
- 1 deferred (useAiStreaming.ts - external AI SDK)

**P7 Key Learnings (apply to P8):**
1. Effect.async() with cleanup function handles setTimeout patterns cleanly
2. .then() after runPromise should move inside Effect.gen or use Effect.tap
3. Promise.resolve() wrapping is unnecessary; use Effect.succeed() directly
4. async wrappers around runPromise in React callbacks are unnecessary overhead
5. Browser APIs convert cleanly to Effect.tryPromise in Effect.gen

**P7 Workflow:**
- Discovery → Execute → Verify (no Fix phase needed - zero type errors post-migration)

---

## Semantic Memory (Constants)

### Import Patterns

```typescript
import * as Str from "effect/String";
import * as O from "effect/Option";
```

### Migration Patterns

| Before | After |
|--------|-------|
| `str.match(/regex/)` | `Str.match(/regex/)(str)` |
| `/regex/.test(str)` | `O.isSome(Str.match(/regex/)(str))` |
| `/regex/.exec(str)` | `Str.match(/regex/)(str)` |
| `str.replace(/regex/, rep)` | `Str.replace(str, /regex/, rep)` |

### Pattern Template

```typescript
const parseUrl = (url: string) => {
  const match = Str.match(/pattern/)(url);
  return O.flatMap(match, ([_, group]) => O.fromNullable(group));
};
```

---

## Procedural Memory (References)

| Document | Purpose |
|----------|---------|
| `MASTER_ORCHESTRATION.md#phase-8` | Phase 8 details |
| `agent-prompts/P8-regex-discovery.md` | Discovery agent prompt |
| `agent-prompts/P8-code-writer.md` | Code writer agent prompt |

### Reference Example

`apps/todox/src/app/lexical/plugins/AutoEmbedPlugin/index.tsx:79-108`

---

## Execution Steps

Same pattern as previous phases:
1. Discovery (4 parallel agents)
2. Consolidation (1 agent)
3. Execution (batched parallel, 5 per batch)
4. Verification
5. Reflection
6. Handoff to P9

---

## Context Budget

| Memory Type | Budget | Estimated |
|-------------|--------|-----------|
| Total | 4,000 tokens | ~900 |

Within budget.
