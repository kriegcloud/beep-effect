# IAM Effect Patterns - Reflection Log

## Session: Initial Spec Creation

**Date**: 2026-01-15
**Phase**: 0 - Scaffolding

### What Was Accomplished

1. Analyzed current IAM client package structure:
   - `core/` - sign-out, get-session
   - `sign-in/email/` - email sign-in
   - `sign-up/email/` - email sign-up
   - `_common/` - shared schemas, errors, annotations

2. Identified inconsistencies in current patterns:
   - Handler signature variations (optional vs required params)
   - Session signal notification gaps
   - Schema annotation approach variance
   - Boilerplate repetition across handlers

3. Created comprehensive spec with:
   - Problem statement and success criteria
   - Current state analysis
   - Proposed patterns (handler factory, atom factory, state machine)
   - Phase plan with agent recommendations
   - Anti-patterns and gotchas

### Key Findings

#### Handler Pattern Analysis

Three distinct handler signature patterns exist:
1. **No payload** (`get-session`) - simplest case
2. **Optional payload** (`sign-out`) - payload may be undefined
3. **Required structured payload** (`sign-in`, `sign-up`) - `{ payload, fetchOptions }`

This inconsistency makes it harder to create generic tooling.

#### Session Signal Gap

| Handler | Notifies? | Issue |
|---------|-----------|-------|
| sign-in-email | Yes (conditional) | Only when `response.error` is null |
| sign-out | No | Missing - UI won't refresh |
| sign-up-email | No | Missing - user appears not logged in |
| get-session | No | Correct - read-only |

This is a critical gap that affects user experience.

#### Boilerplate Repetition

Every handler follows this pattern:
```typescript
export const Handler = Effect.fn("name")(function* (payload) {
  const response = yield* Effect.tryPromise({
    try: () => client.method(payload),
    catch: Common.IamError.fromUnknown,
  });
  return yield* S.decodeUnknown(Contract.Success)(response.data);
});
```

This could be reduced to:
```typescript
export const Handler = createHandler({
  name: "name",
  execute: (payload) => client.method(payload),
  successSchema: Contract.Success,
  mutatesSession: true,
});
```

### What Worked Well

1. Reading actual source files revealed inconsistencies that weren't obvious from documentation
2. The effect-atom skill file provided context for state machine patterns
3. Comparing multiple handlers side-by-side highlighted signature variations

### What Needs Attention

1. **Better Auth Error Handling**: Current handlers ignore `response.error` field
2. **State Machine Pattern**: Not currently implemented anywhere in IAM
3. **Test Coverage**: Current test files are placeholder only

### Questions for Next Phase

1. Should we maintain backwards compatibility with existing handler signatures?
2. Should state machine pattern be opt-in or default for multi-step flows?
3. How should error responses from Better Auth be surfaced to UI?

### Prompt Improvements for Phase 1

When running Phase 1 (deep analysis), include:
- Explicit search for `$sessionSignal` usage
- Check for `response.error` handling
- Identify any existing factory patterns in codebase
- Look for state machine precedents in other packages

---

## Session: [Next Session Title]

**Date**: [Date]
**Phase**: [Phase Number]

[Learnings will be added here]
