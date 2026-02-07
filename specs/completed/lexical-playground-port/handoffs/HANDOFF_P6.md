# Phase 6 Handoff: Effect Pattern Conversion (Continuation)

> **Date**: 2026-01-27
> **Phase**: 6 - Effect Patterns
> **Status**: IN PROGRESS (60% Complete)

---

## CRITICAL: YOU ARE THE ORCHESTRATOR

**You MUST NOT write or research code yourself.**

As the orchestrator, your role is to:

1. **Delegate ALL code modifications** to the `effect-code-writer` sub-agent
2. **Delegate ALL codebase research** to the `Explore` sub-agent
3. **Delegate ALL testing** to the `test-writer` sub-agent
4. **Track progress** using the TodoWrite tool
5. **Verify results** by running commands and checking outputs
6. **Make decisions** about which patterns to apply

**Sub-agents to use:**

| Agent | When to Use |
|-------|-------------|
| `effect-code-writer` | ANY code modification (conversions, fixes, new code) |
| `Explore` | Finding files, understanding patterns, researching codebase |
| `test-writer` | Creating or updating tests |
| `package-error-fixer` | Fixing type/build/lint errors for a package |

---

## Session Progress Summary

### What Was Completed This Session

| Task | Status | Details |
|------|--------|---------|
| Study ActionsPlugin canonical reference | ✅ DONE | Both Pattern A (network) and Pattern B (browser APIs) understood |
| Convert CopyButton to Effect | ✅ DONE | Uses Pattern B with Clipboard service |
| Convert PrettierButton to Effect | ✅ DONE | Uses Pattern B with Effect.tryPromise |
| Convert TweetNode to Effect | ✅ DONE | Uses Pattern B for Twitter widget SDK |
| Convert ImagesPlugin JSON.parse | ✅ DONE | Uses Either.try + Option pattern |
| Convert PollNode JSON.parse | ✅ DONE | Uses Either.try + Option pattern |
| Convert ExcalidrawComponent JSON.parse | ✅ DONE | Uses Either.try with fallback |
| Convert DateTimeNode JSON.parse (2 calls) | ✅ DONE | Uses Either.try + Option pattern |
| Add error classes to schema/errors.ts | ✅ DONE | ClipboardError, PrettierError, TwitterError, etc. |
| Update P5_ORCHESTRATOR_PROMPT.md | ✅ DONE | Added Pattern E & F, fixed sync constraints |

### Current Metrics

| Metric | Original | Current | Target |
|--------|----------|---------|--------|
| `try {` blocks | 7 | 4 | 0 |
| `JSON.parse` (unprotected) | 7 | 1 (setupEnv.ts) | 0 |
| `throw new Error` / `new Error` | 46 | 44 | 0 |
| Type assertions (`as`) | 78 | 78 | TBD |

### Files Modified This Session

```
apps/todox/src/app/lexical/schema/errors.ts  (NEW - error classes)
apps/todox/src/app/lexical/plugins/CodeActionMenuPlugin/components/CopyButton/index.tsx
apps/todox/src/app/lexical/plugins/CodeActionMenuPlugin/components/PrettierButton/index.tsx
apps/todox/src/app/lexical/nodes/TweetNode.tsx
apps/todox/src/app/lexical/plugins/ImagesPlugin/index.tsx
apps/todox/src/app/lexical/nodes/PollNode.tsx
apps/todox/src/app/lexical/nodes/ExcalidrawNode/ExcalidrawComponent.tsx
apps/todox/src/app/lexical/nodes/DateTimeNode/DateTimeNode.tsx
specs/lexical-playground-port/handoffs/P5_ORCHESTRATOR_PROMPT.md
```

---

## CRITICAL PATTERN REQUIREMENTS

### Pattern Selection Guide

| Context | Pattern | Key Insight |
|---------|---------|-------------|
| Network calls (HTTP) | Pattern A: Effect.Service + makeAtomRuntime + runtime.fn | Full Effect service with Layer composition |
| Async browser APIs | Pattern B: useRuntime() + makeRunClientPromise() | In React components with async callbacks |
| Sync outside React | Pattern E: effect/Either + effect/Option | **NO runtime needed** - for Lexical callbacks, useMemo |
| Sync with services | Pattern F: makeRunClientSync(runtime) | When Effect services needed synchronously |

### Pattern E: Either/Option for Sync Operations (CRITICAL)

**This is the key pattern for remaining conversions.** Most Lexical code is synchronous and outside React lifecycle.

```typescript
import * as Either from "effect/Either";
import * as O from "effect/Option";

// Safe JSON parsing - NO RUNTIME NEEDED
function $convertSomeElement(domNode: HTMLElement): DOMConversionOutput | null {
  const attr = O.fromNullable(domNode.getAttribute("data-something"));

  return O.getOrNull(
    O.flatMap(attr, (data) =>
      O.map(
        Either.getRight(Either.try(() => JSON.parse(data))),
        (parsed) => ({ node: $createSomeNode(parsed) })
      )
    )
  );
}
```

**Key utilities:**
- `Either.try({ try, catch })` or `Either.try(() => ...)` - Wrap throwing operations
- `Either.getRight(either)` - Convert Either to Option (discards Left)
- `O.fromNullable(value)` - Convert nullable to Option
- `O.flatMap(option, fn)` - Chain Option operations
- `O.map(option, fn)` - Transform Option value
- `O.getOrNull(option)` - Extract value or null (at Lexical API boundaries)
- `O.getOrElse(option, fallback)` - Extract value or fallback
- `O.all([...options])` - Combine multiple Options (all must be Some)

### Sync Effect Constraints (CRITICAL)

**In synchronous Effect code:**
- ❌ **NEVER** use `yield*` or `Effect.gen`
- ❌ **NEVER** use `Effect.tryPromise` or any async operation
- ✅ Use `Effect.try` for synchronous try/catch
- ✅ Use `Effect.pipe` with `Effect.flatMap` / `Effect.andThen` / `Effect.map`

```typescript
// ✅ CORRECT - Sync Effect with pipe
const result = runSync(
  Effect.try({
    try: () => someOperation(),
    catch: (e) => new MyError({ cause: e }),
  }).pipe(
    Effect.flatMap((result) => Effect.succeed(transform(result))),
    Effect.catchAll(() => Effect.succeed(fallbackValue))
  )
);
```

### NEVER Use null as Standin - Use Option

```typescript
// ❌ WRONG - null as default
const result = Either.match(either, {
  onLeft: () => null,
  onRight: (v) => v,
});

// ✅ CORRECT - Use Option throughout, getOrNull only at API boundary
const result = O.getOrNull(Either.getRight(either));
```

---

## Remaining Work

### Priority 1: Remaining try/catch Blocks (4 files)

| File | Location | Conversion Approach |
|------|----------|---------------------|
| `commenting/models.ts` | Lines 399, 416 | Complex - YJS operations, may need Pattern B |
| `TestRecorderPlugin/index.tsx` | Line 18 | Simple - use Either.try |
| `setupEnv.ts` | Line 20 | Use Either.try for JSON.parse |

### Priority 2: throw new Error / new Error (44 remaining)

**Many are in sync contexts that require Pattern E (Either/Option) or invariant-style checks.**

Key files with `throw new Error`:

```bash
# Run to get full list
grep -rn "throw new Error\|new Error" apps/todox/src/app/lexical/
```

Major categories:

| Category | Example | Conversion Approach |
|----------|---------|---------------------|
| Missing context | `throw new Error("useSettings: cannot find SettingsContext")` | Keep as invariant (React convention) |
| Invalid state | `throw new Error("TableCellResizer: Expected table node")` | Either.left or S.TaggedError |
| Node type errors | `throw new Error("Expected ImageNode")` | Use $isXNode() guard + Option |
| API errors | `throw new Error("Failed to load")` | S.TaggedError + Effect.fail |

### Priority 3: Type Assertions (78 `as` casts)

Address AFTER Effect patterns complete. Strategy:
- DOM element casts → proper type guards
- Lexical node casts → `$isXNode()` type guards
- Event target casts → `P.isHTMLInputElement()` etc.

---

## Canonical References

| File | Purpose |
|------|---------|
| `plugins/ActionsPlugin/index.tsx` | **CANONICAL** - Shows Pattern A (network) + Pattern B (browser) |
| `utils/docSerialization.ts` | Pure Effect with Effect.gen, Effect.try, tagged errors |
| `schema/errors.ts` | All tagged error classes for this codebase |
| `packages/runtime/client/src/runtime.ts#L35-52` | Sync runners: runClientSync, makeRunClientSync |
| `.claude/skills/effect-atom.md` | Complete effect-atom documentation |

---

## Error Classes Already Defined

The following error classes exist in `apps/todox/src/app/lexical/schema/errors.ts`:

```typescript
// Document errors
DocHashError
DocGzipError

// UI/Browser errors
ClipboardError
PrettierError
UnsupportedLanguageError
TwitterError

// Lexical errors
NodeNotRegisteredError
DomElementNotFoundError
MissingContextError
ThemePropertyError
Canvas2DContextError
TableCellError
CollapsibleError
```

**When adding new errors**, add them to this file following the existing pattern:

```typescript
class MyNewError extends S.TaggedError<MyNewError>()($I`MyNewError`, {
  message: S.String,
  cause: S.optional(S.Defect),
}) {}
```

---

## Verification Commands

```bash
# After each file conversion
bunx turbo run lint --filter=@beep/todox
bunx turbo run check --filter=@beep/todox

# Final verification
bunx turbo run build --filter=@beep/todox

# Progress checks
grep -r "try {" apps/todox/src/app/lexical/ | wc -l           # Target: 0
grep -r "JSON.parse" apps/todox/src/app/lexical/ | wc -l      # Check they use Either.try
grep -rn "throw new Error\|new Error" apps/todox/src/app/lexical/ | wc -l  # Target: 0
grep -r " as " apps/todox/src/app/lexical/ | grep -v "import" | wc -l     # Target: 0
```

---

## Success Criteria

### Phase 6 (Effect Patterns)
- [ ] All `try {` blocks converted (4 → 0)
- [ ] All `JSON.parse` wrapped in Either.try (1 → 0)
- [ ] All `throw new Error` converted to S.TaggedError or Option handling (44 → 0)
- [ ] Network calls use Pattern A (Effect.Service + makeAtomRuntime)
- [ ] Browser API calls use Pattern B (useRuntime + makeRunClientPromise)
- [ ] Sync operations use Pattern E (Either/Option) or Pattern F (makeRunClientSync)

### Phase 5 (Type Assertions) - After Phase 6
- [ ] Type assertions (`as`) replaced with type guards (78 → 0)
- [ ] Non-null assertions minimized

### Final Validation
- [ ] All quality commands pass (lint, check, build)
- [ ] Editor functional testing (use browser MCP tools):
  - [ ] Editor loads without crashes
  - [ ] Can type text
  - [ ] Bold/Italic formatting works
  - [ ] Toolbar dropdowns functional
  - [ ] Share button works
  - [ ] Import/Export buttons work

---

## Orchestration Instructions

### Starting the Session

1. **Read this handoff completely**
2. **Update TodoWrite** with remaining tasks
3. **Verify current state** by running grep commands

### For Each Conversion Task

1. **Delegate to `effect-code-writer`** with explicit instructions:
   - File path
   - What pattern to use (A, B, E, or F)
   - Expected error handling
   - Reference to canonical implementation

2. **Verify the change** with lint/check commands

3. **Update progress** in TodoWrite

### Example Delegation Prompt

```
Convert the try/catch block in apps/todox/src/app/lexical/setupEnv.ts (line 20)
to use Pattern E (Either/Option).

The JSON.parse should be wrapped with Either.try() and the error case handled
with Option fallback.

Reference implementation: apps/todox/src/app/lexical/nodes/DateTimeNode/DateTimeNode.tsx
(isGDocsDateType function)
```

---

## Known Issues & Decisions

### Context Hook Invariants

Many `throw new Error` in context hooks are React invariants:

```typescript
if (settingsContext === undefined) {
  throw new Error("useSettings: cannot find SettingsContext");
}
```

**Decision**: These MAY remain as-is. React convention is to throw for missing required contexts. Converting to Effect would change the API contract. **Discuss with user if unsure.**

### React Suspense Patterns

Some files use Promises for React Suspense:

```typescript
// ImageComponent.tsx - Promise cache for Suspense
const imageCache = new Map<string, Promise<void>>();
```

**Decision**: May need to stay as Promise for Suspense compatibility. Effect integration with Suspense is complex.

### WebSocket Timeout (Acceptable)

The collaboration plugin throws timeout errors - this is acceptable for MVP as collaboration is disabled by default.

---

## Session Notes

### Lessons Learned

1. **Pattern E (Either/Option) is preferred for Lexical callbacks** - No runtime needed, cleaner code
2. **yield* cannot be used in sync Effects** - Must use Effect.pipe with flatMap/andThen
3. **Option should wrap internal state, getOrNull at API boundaries** - Never use null as standin internally
4. **S.decodeUnknownEither works with Either patterns** - For schema validation without runtime

### User Corrections Applied

1. Fixed misleading statement about "Effect cannot be used in sync contexts"
2. Added reference to `packages/runtime/client/src/runtime.ts#L35-52`
3. Added Pattern E documentation for Either/Option sync operations
4. Added Pattern F documentation for sync Effects with runtime
5. Clarified yield* constraint in sync code
6. Mandated Option usage over null standins
