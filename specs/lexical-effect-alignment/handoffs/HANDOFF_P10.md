# Phase 10 Handoff: Native Date

## Phase Summary

Replace all native `Date` usage with `effect/DateTime` in `apps/todox/src/app/lexical/`.

---

## Working Memory (Critical Context)

### Success Criteria

- [ ] All `new Date()` replaced with `DateTime.now` or `DateTime.unsafeNow()`
- [ ] All `Date.now()` replaced with `DateTime.now` (Effect context) or `DateTime.unsafeNow()`
- [ ] All date parsing uses `DateTime.make()`
- [ ] All date formatting uses `DateTime.format*` functions
- [ ] `bun run build` passes
- [ ] `bun run check` passes
- [ ] `bun run lint` passes

### Constraints

- Orchestrator must NOT write code directly
- Maximum 5 effect-code-writer agents per batch

---

## Episodic Memory (Previous Phase)

### P9 Summary

Phase 9 replaced switch statements with effect/Match.

**P9 Key Results:**
- 7 switch statements migrated across 6 files
- 0 new type errors introduced
- Pattern types: 4 simple string/number discriminants, 2 TestRecorderPlugin switches, 1 complex nested ToolbarPlugin

**P9 Key Learnings (apply to P10):**
1. Match.value().pipe() cleanly replaces switch statements with Match.when() for each case
2. switch(true) anti-pattern converts to Match.when with predicate functions: `Match.when((val) => val > X, ...)`
3. Match.exhaustive for complete discriminated unions; Match.orElse() for default handlers
4. Effectful switches (mutations, side effects) work naturally - handlers execute immediately
5. Discovery phase: switch patterns concentrate in plugins/; utility directories likely already compliant

---

## Semantic Memory (Constants)

### Import Pattern

```typescript
import * as DateTime from "effect/DateTime";
import * as O from "effect/Option";  // DateTime.make returns Option
```

### Migration Patterns

| Native | Effect |
|--------|--------|
| `new Date()` | `DateTime.now` or `DateTime.unsafeNow()` |
| `Date.now()` | `DateTime.now` (Effect context) |
| `new Date(str)` | `DateTime.make(str)` → `Option<DateTime>` |
| `date.getTime()` | `DateTime.toEpochMillis(dt)` |
| `date.toISOString()` | `DateTime.formatIso(dt)` |
| `date.getFullYear()` | `DateTime.getPartUtc(dt, "year")` |

### Implementation Notes

1. `DateTime.now` returns `Effect<DateTime.Utc>` - use in Effect context
2. `DateTime.unsafeNow()` returns `DateTime.Utc` - use in sync contexts
3. `DateTime.make()` returns `Option<DateTime>` - parsing may fail

---

## Procedural Memory (References)

| Document | Purpose |
|----------|---------|
| `MASTER_ORCHESTRATION.md#phase-10` | Phase 10 details |
| `agent-prompts/P10-date-discovery.md` | Discovery agent prompt |
| `agent-prompts/P10-code-writer.md` | Code writer agent prompt |

---

## Execution Steps

Same pattern as previous phases:
1. Discovery (4 parallel agents)
2. Consolidation (1 agent)
3. Execution (batched parallel, 5 per batch)
4. Verification
5. Reflection
6. Handoff to P11

---

## Context Budget

| Memory Type | Budget | Estimated |
|-------------|--------|-----------|
| Total | 4,000 tokens | ~900 |

Within budget.
