# Phase 3 Orchestrator Prompt

Copy-paste this prompt to start Phase 3 implementation.

---

## Prompt

You are implementing Phase 3 (Schema Creation) of the lexical-utils-effect-refactor spec.

### Context

Phase 2 (Evaluation) is complete with CONDITIONAL PASS status. Two review documents have been generated:
- `outputs/architecture-review.md` - 6 compliance checks, architectural validation
- `outputs/code-quality-review.md` - 5 transformation patterns validated

Key blockers identified:
- SerializedDocumentSchema missing
- Tagged errors undefined
- MutableHashSet required for DOM (not immutable HashSet)

### Your Mission

Create all required schemas and error types before implementation can begin.

**This is an implementation phase** - use tools directly, don't delegate to sub-agents.

### Required Files to Create

#### 1. Error Schemas

Create: `apps/todox/src/app/lexical/schema/errors.ts`

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

#### 2. URL Schema

Create: `apps/todox/src/app/lexical/schema/url.schema.ts`

```typescript
import * as S from "effect/Schema"
import { $TodoxId } from "@beep/identity"

const $I = $TodoxId.create("lexical/schema/url")

export class SanitizedUrl extends S.Class<SanitizedUrl>($I`SanitizedUrl`)({
  value: S.String,
}) {}
```

#### 3. Document Schema (REQUIRES ANALYSIS)

Create: `apps/todox/src/app/lexical/schema/doc.schema.ts`

First, analyze `@lexical/file` types to understand the `SerializedDocument` interface structure.

Look at:
- `node_modules/@lexical/file/LexicalFile.d.ts`
- Or the Lexical source to understand the shape

Then create a runtime schema that matches.

#### 4. Swipe Schema

Create: `apps/todox/src/app/lexical/schema/swipe.schema.ts`

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

#### 5. Update Barrel Export

Update: `apps/todox/src/app/lexical/schema/index.ts`

Add exports for all new schema files:
```typescript
export * from "./errors"
export * from "./url.schema"
export * from "./doc.schema"
export * from "./swipe.schema"
```

### Critical Patterns

**Schema conventions** (from `.claude/rules/effect-patterns.md`):
- Use `$TodoxId` for annotations
- PascalCase constructors: `S.String`, `S.Number`, `S.Struct()`
- Namespace imports: `import * as S from "effect/Schema"`

**Error conventions**:
- Extend `S.TaggedError` for all error types
- Include `message: S.String` in all errors
- Include relevant context (url, hash, input) for debugging

### Verification

After creating schemas:
1. Run `bun run check --filter @beep/todox` to verify no type errors
2. Verify all schemas are exported from barrel
3. Verify no circular dependencies

### Success Criteria

- [ ] `errors.ts` created with 4 TaggedError classes
- [ ] `url.schema.ts` created with SanitizedUrl
- [ ] `doc.schema.ts` created with SerializedDocument schema
- [ ] `swipe.schema.ts` created with gesture schemas
- [ ] `schema/index.ts` updated with barrel exports
- [ ] Type check passes
- [ ] `REFLECTION_LOG.md` updated with Phase 3 learnings
- [ ] `HANDOFF_P4.md` created
- [ ] `P4_ORCHESTRATOR_PROMPT.md` created

### Reference Files

- Phase 2 outputs: `specs/lexical-utils-effect-refactor/outputs/`
- Existing schemas: `apps/todox/src/app/lexical/schema/schemas.ts`
- Effect patterns: `.claude/rules/effect-patterns.md`
- Handoff context: `specs/lexical-utils-effect-refactor/handoffs/HANDOFF_P3.md`

### Next Phase

After completing Phase 3:
1. Update `REFLECTION_LOG.md` with learnings
2. Create `handoffs/HANDOFF_P4.md` (Priority 1 Refactor context)
3. Create `handoffs/P4_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)
