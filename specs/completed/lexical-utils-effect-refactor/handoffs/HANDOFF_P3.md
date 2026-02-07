# Phase 3 Handoff: Schema Creation

> Context document for Phase 3 execution. Read this completely before starting.

---

## Previous Phase Summary

**Phase 2 (Evaluation)** completed on 2026-01-27 with **CONDITIONAL PASS** status.

### Outputs Generated

| File | Location | Purpose |
|------|----------|---------|
| `architecture-review.md` | `outputs/` | 6 compliance checks, architectural validation |
| `code-quality-review.md` | `outputs/` | 5 transformation patterns, code review |

### Key Findings from Phase 2

#### Architecture Review Results

| Check | Status | Action Required |
|-------|--------|-----------------|
| Import Conventions | CONDITIONAL PASS | Migrate native methods to Effect |
| Schema Location | PASS | Follow existing patterns |
| Cross-Boundary Imports | CONDITIONAL PASS | Migrate node:crypto to @effect/platform |
| File Organization | PASS | Clean dependency graph |
| Effect Pattern Compliance | FAIL → CONDITIONAL PASS | Fix all native method violations |
| Testing Strategy | PASS | Use @beep/testkit patterns |

#### Critical Issues Identified

**Blocking Issues** (must resolve in Phase 3):

1. **SerializedDocumentSchema missing** - No runtime schema for `@lexical/file` types
2. **Tagged errors undefined** - Need `InvalidUrlError`, `ParseError`, `InvalidDocumentHashError`
3. **MutableHashSet for DOM** - Event listeners require mutation, not immutable HashSet

**Pattern Corrections**:

1. **Stream.unfold**: Remove `.pipe(Effect.option)` - signature is `Effect<Option<[A, S]>>`
2. **Str.split**: Use hybrid `native.split(/regex/)` + `A.fromIterable()`
3. **WeakMap**: Keep native - no Effect equivalent, serves GC purposes
4. **Optional chaining**: Keep `el?.focus()` for simple DOM operations

---

## Phase 3 Mission

Create all required schemas and error types before implementation begins.

### Required Schemas

#### 1. Error Schemas (`errors.ts`)

Location: `apps/todox/src/app/lexical/schema/errors.ts`

```typescript
import * as S from "effect/Schema"
import { $TodoxId } from "@beep/identity"

const $I = $TodoxId.create("lexical/schema/errors")

export class InvalidUrlError extends S.TaggedError<InvalidUrlError>()($I`InvalidUrlError`, {
  message: S.String,
  url: S.String,
}) {}

export class ParseError extends S.TaggedError<ParseError>()($I`ParseError`, {
  message: S.String,
  input: S.String,
}) {}

export class InvalidDocumentHashError extends S.TaggedError<InvalidDocumentHashError>()($I`InvalidDocumentHashError`, {
  message: S.String,
  hash: S.String,
}) {}

export class CompressionError extends S.TaggedError<CompressionError>()($I`CompressionError`, {
  message: S.String,
  cause: S.optional(S.String),
}) {}
```

#### 2. URL Schema (`url.schema.ts`)

Location: `apps/todox/src/app/lexical/schema/url.schema.ts`

```typescript
import * as S from "effect/Schema"
import { $TodoxId } from "@beep/identity"

const $I = $TodoxId.create("lexical/schema/url")

export class SanitizedUrl extends S.Class<SanitizedUrl>($I`SanitizedUrl`)({
  value: S.String,
}) {}
```

#### 3. Document Schema (`doc.schema.ts`)

Location: `apps/todox/src/app/lexical/schema/doc.schema.ts`

**REQUIRES ANALYSIS**: Must analyze `@lexical/file` types to create matching runtime schema.

#### 4. Swipe Schema (`swipe.schema.ts`)

Location: `apps/todox/src/app/lexical/schema/swipe.schema.ts`

```typescript
import * as S from "effect/Schema"
import { $TodoxId } from "@beep/identity"

const $I = $TodoxId.create("lexical/schema/swipe")

export class SwipeDirection extends S.Class<SwipeDirection>($I`SwipeDirection`)({
  direction: S.Literal("left", "right", "up", "down"),
}) {}

export class SwipeThreshold extends S.Class<SwipeThreshold>($I`SwipeThreshold`)({
  xThreshold: S.Number,
  yThreshold: S.Number,
}) {}
```

---

## Scope Exclusions (Confirmed)

The following files are **excluded** from Effect refactoring per Phase 2 review:

| File | Reason |
|------|--------|
| `getDOMRangeRect.ts` | Pure DOM manipulation, zero Effect benefit |
| `setFloatingElemPosition.ts` | DOM positioning math, no async/error handling |
| `setFloatingElemPositionForLinkEditor.ts` | Variant of above |
| `focusUtils.ts` | DOM focus API calls, no Effect patterns needed |

These files may be wrapped at call sites if called from Effect pipelines:

```typescript
yield* Effect.sync(() => setFloatingElemPosition(elem, target, scroller))
```

---

## Decisions Already Made

From Phase 1 & 2:

1. **Keep native `.replace()`** for regex string operations (no Effect alternative)
2. **Use native `.split()` + `A.fromIterable()`** for regex delimiter splits
3. **Keep native WeakMap** in `swipe.ts` for element state tracking
4. **Use MutableHashSet** for DOM event listener management (not immutable HashSet)
5. **Keep optional chaining** for simple DOM operations (`el?.focus()`)
6. **Exclude DOM-heavy utilities** from refactoring scope

---

## Success Criteria

- [ ] `errors.ts` created with all TaggedError classes
- [ ] `url.schema.ts` created with SanitizedUrl
- [ ] `doc.schema.ts` created with SerializedDocument schema
- [ ] `swipe.schema.ts` created with gesture schemas
- [ ] `schema/index.ts` updated with barrel exports
- [ ] All schemas use `$TodoxId` annotations
- [ ] No circular dependencies introduced
- [ ] `REFLECTION_LOG.md` updated with Phase 3 learnings
- [ ] `HANDOFF_P4.md` created
- [ ] `P4_ORCHESTRATOR_PROMPT.md` created

---

## Risk Areas

### High Risk
- **SerializedDocument schema**: `@lexical/file` types are complex; runtime schema must match exactly
- **Schema validation performance**: Don't add overhead to hot paths

### Medium Risk
- **Error schema usage**: Ensure all error types are imported correctly

### Low Risk
- **Barrel exports**: Simple re-export additions

---

## Reference Files

| File | Purpose |
|------|---------|
| `specs/lexical-utils-effect-refactor/outputs/architecture-review.md` | Compliance validation |
| `specs/lexical-utils-effect-refactor/outputs/code-quality-review.md` | Pattern corrections |
| `apps/todox/src/app/lexical/schema/schemas.ts` | Existing schema patterns |
| `@lexical/file` | Source for SerializedDocument type |
| `.claude/rules/effect-patterns.md` | Schema conventions |

---

## Context Budget

- Direct tool calls: Max 10 (schema creation phase)
- File reads: Max 5 (@lexical/file analysis)
- Sub-agent delegations: Max 1 (effect-schema-expert if needed)

Phase 3 is implementation-focused; use tools directly rather than delegating.
