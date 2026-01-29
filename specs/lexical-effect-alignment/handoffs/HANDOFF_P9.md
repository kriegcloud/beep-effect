# Phase 9 Handoff: Switch Statements

## Phase Summary

Replace all `switch` statements with `effect/Match` in `apps/todox/src/app/lexical/`.

---

## Working Memory (Critical Context)

### Success Criteria

- [ ] All `switch` statements replaced with `Match.value().pipe(...)`
- [ ] Discriminated unions use `Match.type()` with `Match.tag()`
- [ ] Type switches use appropriate predicates
- [ ] Fall-through cases use `Match.whenOr()`
- [ ] `bun run build` passes
- [ ] `bun run check` passes
- [ ] `bun run lint` passes

### Constraints

- Orchestrator must NOT write code directly
- Maximum 5 effect-code-writer agents per batch

---

## Episodic Memory (Previous Phase)

### P8 Summary

Phase 8 replaced raw regex with `effect/String` Str.match patterns.

**P8 Key Results:**
- 12 files migrated, 18 patterns replaced
- Pattern types: 5 `.match()`, 6 `.test()`, 7 `.exec()`
- 1 type error from incorrect curried call syntax (fixed manually)
- Workflow: Discovery → Execute → Check → Fix → Verify

**P8 Key Learnings (apply to P9):**
1. Str.match uses curried data-last signature: `Str.match(regex)(string)`, NOT `Str.match(string, regex)`
2. `.test()` patterns convert to `O.isSome(Str.match(regex)(str))`
3. Both `.exec()` and `.match()` convert to `Str.match(regex)(str)` returning Option
4. Global regex uses `Str.matchAll(regex)(str)` with `A.fromIterable()` for arrays
5. Cache dynamic RegExp outside loops for performance

---

## Semantic Memory (Constants)

### Import Pattern

```typescript
import * as Match from "effect/Match";
```

### Migration Patterns

```typescript
// BEFORE
switch (value) {
  case "a": return 1;
  case "b": return 2;
  default: return 0;
}

// AFTER
Match.value(value).pipe(
  Match.when("a", () => 1),
  Match.when("b", () => 2),
  Match.orElse(() => 0)
)
```

### Type Switches (typeof)

```typescript
// BEFORE
switch (typeof value) {
  case "string": return "str";
  case "number": return "num";
}

// AFTER
Match.value(value).pipe(
  Match.when(Match.string, () => "str"),
  Match.when(Match.number, () => "num"),
  Match.orElse(() => "unknown")
)
```

### Discriminated Unions

```typescript
// BEFORE
switch (node._type) {
  case "paragraph": ...
  case "heading": ...
}

// AFTER
Match.type<MyUnion>().pipe(
  Match.tag("paragraph", (p) => ...),
  Match.tag("heading", (h) => ...),
  Match.exhaustive
)
```

### Fall-through Cases

```typescript
// BEFORE
switch (val) {
  case "a":
  case "b":
    return "ab";
}

// AFTER
Match.value(val).pipe(
  Match.whenOr("a", "b", () => "ab"),
  Match.orElse(() => "other")
)
```

---

## Procedural Memory (References)

| Document | Purpose |
|----------|---------|
| `MASTER_ORCHESTRATION.md#phase-9` | Phase 9 details |
| `agent-prompts/P9-switch-discovery.md` | Discovery agent prompt |
| `agent-prompts/P9-code-writer.md` | Code writer agent prompt |

---

## Execution Steps

Same pattern as previous phases:
1. Discovery (4 parallel agents)
2. Consolidation (1 agent)
3. Execution (batched parallel, 5 per batch)
4. Verification
5. Reflection
6. Handoff to P10

---

## Context Budget

| Memory Type | Budget | Estimated |
|-------------|--------|-----------|
| Total | 4,000 tokens | ~1,100 |

Within budget.
