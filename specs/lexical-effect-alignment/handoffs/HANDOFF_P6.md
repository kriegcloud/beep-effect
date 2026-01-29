# Phase 6 Handoff: JSON.parse/stringify

## Phase Summary

Replace all raw `JSON.parse` and `JSON.stringify` usage with Effect Schema equivalents in `apps/todox/src/app/lexical/`.

---

## Working Memory (Critical Context)

### Success Criteria

- [ ] All `JSON.parse()` replaced with schema-based decoding
- [ ] All `JSON.stringify()` replaced with schema-based encoding
- [ ] JSON schemas defined for each data structure
- [ ] `bun run build` passes
- [ ] `bun run check` passes
- [ ] `bun run lint` passes

### Constraints

- Orchestrator must NOT write code directly
- Maximum 5 effect-code-writer agents per batch

---

## Episodic Memory (Previous Phase)

### P5 Summary

Phase 5 replaced native Error with Effect TaggedError schemas.

**P5 Key Results:**
- 13 violations migrated across 11 files
- Error schema reuse: `NodeNotRegisteredError` (6 uses), `MissingContextError` (4 uses), `EquationRenderError` (2 uses), `DragSelectionError` (1 use)
- Shared schemas in `apps/todox/src/app/lexical/schema/errors.ts`
- 1 special case documented (CommentPlugin onError callback must throw natively)

**P5 Key Learnings (apply to P6):**
1. Check existing schema files before creating new ones
2. TaggedError can throw synchronously for React hook compatibility
3. Framework callbacks (Lexical) may require native throw - document as SPECIAL CASE
4. Batch parallel agents (5 per batch) to prevent resource contention

---

## Semantic Memory (Constants)

### Import Pattern

```typescript
import * as S from "effect/Schema";
import * as Either from "effect/Either";
```

### Migration Pattern

```typescript
// BEFORE
const data = JSON.parse(jsonString);

// AFTER
const MySchema = S.Struct({
  name: S.String,
  value: S.Number,
});

const result = S.decodeUnknownEither(S.parseJson(MySchema))(jsonString);
Either.match(result, {
  onLeft: (error) => console.error("Parse error", error),
  onRight: (data) => console.log(data)
});
```

### Stringify Pattern

```typescript
// BEFORE
const json = JSON.stringify(obj);

// AFTER
const result = S.encodeUnknownEither(S.parseJson(MySchema))(obj);
```

---

## Procedural Memory (References)

| Document | Purpose |
|----------|---------|
| `MASTER_ORCHESTRATION.md#phase-6` | Phase 6 details |
| `agent-prompts/P6-json-discovery.md` | Discovery agent prompt |
| `agent-prompts/P6-code-writer.md` | Code writer agent prompt |

---

## Execution Steps

Same pattern as previous phases:
1. Discovery (4 parallel agents)
2. Consolidation (1 agent)
3. Execution (batched parallel, 5 per batch)
4. Verification
5. Reflection
6. Handoff to P7

---

## Context Budget

| Memory Type | Budget | Estimated |
|-------------|--------|-----------|
| Total | 4,000 tokens | ~900 |

Within budget.
