# Code Quality Review: Lexical Utils Effect Refactor

**Generated**: 2026-01-27
**Reviewer**: Code Reviewer Agent
**Scope**: Validation of Effect transformation patterns for Lexical utilities
**References**:
- `specs/lexical-utils-effect-refactor/AGENT_PROMPTS.md`
- `specs/lexical-utils-effect-refactor/outputs/codebase-analysis.md`
- `specs/lexical-utils-effect-refactor/outputs/effect-api-research.md`
- `.claude/rules/effect-patterns.md`

---

## Executive Summary

The proposed Effect transformation patterns demonstrate **strong alignment** with repository standards. However, several **critical issues** and **edge cases** require addressing before implementation. The primary concerns involve:

1. **API gaps in Effect stdlib** (no regex support in Str.split, no Str.replace)
2. **Inappropriate transformations** (DOM-heavy utilities with minimal Effect benefit)
3. **Breaking signature changes** that cascade through the codebase
4. **Missing error handling patterns** for Web API integration

**Overall Assessment**: NEEDS_WORK

---

## Transformation Pattern Analysis

### 1. async/await → Effect.gen with yield*

**Pattern Correctness**: **CORRECT**

**Edge Cases Identified**:

#### Issue 1.1: Cascading Breaking Changes

**Severity**: HIGH

Functions changing from `Promise<T>` to `Effect<T, E, R>` will cascade through all callers. Need migration compatibility layers:

```typescript
// Add backward-compatible Promise wrapper during migration
export const docToHashPromise = (doc: SerializedDocument): Promise<string> =>
  Effect.runPromise(docToHash(doc));
```

#### Issue 1.2: ReadableStream Integration Pattern Bug

**Severity**: MEDIUM

The proposed `Stream.unfold` pattern has a type signature error:

```typescript
// WRONG - Effect.option breaks signature
.pipe(Effect.option)

// CORRECT - Stream.unfold expects Effect<Option<[A, S]>>
const readStream = <T>(reader: ReadableStreamDefaultReader<T>) =>
  Stream.unfold(reader, (r) =>
    Effect.gen(function* () {
      const result = yield* Effect.promise(() => r.read())
      if (result.done) return O.none()
      return O.some([result.value, r] as const)
    })
  )
```

---

### 2. Set → HashSet

**Pattern Correctness**: **CORRECT** with caveats

#### Issue 2.1: Immutability Impact on swipe.ts

**Severity**: HIGH

Using immutable HashSet breaks DOM event listener patterns. Event handlers hold references to old instances.

**Correct Pattern**: Use `MutableHashSet` for DOM integration:

```typescript
import * as MutableHashSet from "effect/MutableHashSet"

const listeners = MutableHashSet.empty<Listener>()
MutableHashSet.add(listeners, cb)     // Mutates in-place
MutableHashSet.remove(listeners, cb)  // Mutates in-place
```

#### Issue 2.2: WeakMap Has No Effect Equivalent

**Severity**: MEDIUM

**Correct Pattern**: **Keep native WeakMap** for DOM element keying:

```typescript
// KEEP NATIVE - Effect has no WeakMap equivalent
const elements = new WeakMap<HTMLElement, ElementValues>()
```

**Justification**: WeakMap serves legitimate GC-sensitive purpose with no Effect alternative.

---

### 3. null checks → Option or Predicate

**Pattern Correctness**: **PARTIALLY CORRECT**

#### Issue 3.1: Optional Chaining Transformation Overhead

**Severity**: LOW

The proposed transformation for `el?.focus()` is technically correct but inappropriate for DOM side effects.

**Correct Pattern**: **Keep optional chaining** for simple DOM operations:

```typescript
// KEEP NATIVE - No Effect benefit for DOM side effects
el?.focus()
return event?.detail === 0
```

---

### 4. Array Methods → A.* Functions

**Pattern Correctness**: **CORRECT**

#### Issue 4.1: getThemeSelector.ts - Regex Split Limitation

**Severity**: HIGH

`Str.split` only accepts plain string delimiters, NOT regex.

**Correct Pattern**:
```typescript
import * as A from "effect/Array"
import * as F from "effect/Function"

F.pipe(
  className.split(/\s+/g),  // Keep native split for regex
  A.fromIterable,           // Convert to ReadonlyArray
  A.map((cls) => `.${cls}`),
  A.join(",")
)
```

#### Issue 4.2: joinClasses.ts - Boolean Filter Pattern

**Severity**: MEDIUM

**Correct Pattern**:
```typescript
import * as A from "effect/Array"
import * as P from "effect/Predicate"
import * as F from "effect/Function"

F.pipe(
  args,
  A.filter(P.isTruthy),  // Use Predicate instead of Boolean
  A.join(' ')
)
```

---

### 5. JSON.parse → S.decodeUnknownSync

**Pattern Correctness**: **PARTIALLY CORRECT**

#### Issue 5.1: Missing Schema Definition

**Severity**: HIGH (BLOCKER)

`SerializedDocumentSchema` is **not defined** in the codebase. The `SerializedDocument` type is imported from `@lexical/file` as a TypeScript interface, NOT a runtime schema.

**Required Work**:
1. Create schema definition in `apps/todox/src/app/lexical/schema/schemas.ts`
2. Export schema from barrel exports
3. Update docSerialization.ts imports

#### Issue 5.2: Error Handling for decodeUnknownSync

**Severity**: MEDIUM

`decodeUnknownSync` throws synchronously on parse failure, breaking Effect error handling.

**Correct Pattern**: Use `S.decodeUnknown` (effectful) instead:

```typescript
const result = yield* S.decodeUnknown(S.parseJson(SerializedDocumentSchema))(jsonString).pipe(
  Effect.option  // Convert ParseError to None
)
```

---

## Critical Missing Patterns

### Missing Pattern 1: Tagged Error Definitions

**Severity**: HIGH

**Required Work**: Create `apps/todox/src/app/lexical/schema/errors.ts`

```typescript
import * as S from "effect/Schema"
import { $TodoxId } from "@beep/identity/packages"

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
```

### Missing Pattern 2: Effect.try Wrapping for Web APIs

**Severity**: MEDIUM

```typescript
const parseUrl = (input: string) =>
  Effect.try({
    try: () => new URL(input),
    catch: () => new InvalidUrlError({ message: "Invalid URL format", url: input })
  })
```

### Missing Pattern 3: Testing Strategy for Effect Functions

**Severity**: HIGH

Test examples in AGENT_PROMPTS.md don't match @beep/testkit requirements:

```typescript
// CORRECT PATTERN
effect("sanitizeUrl - allows https protocol", () =>
  Effect.gen(function* () {
    const result = yield* sanitizeUrl("https://example.com")  // Yield Effect
    strictEqual(result, "https://example.com")
  })
)
```

---

## Inappropriate Transformations

### Anti-pattern 1: DOM-Heavy Utilities

**Files**: `getDOMRangeRect.ts`, `setFloatingElemPosition.ts`, `setFloatingElemPositionForLinkEditor.ts`

**Recommendation**: **Exclude from refactor**. Effect transformation provides zero benefit for pure DOM manipulation utilities.

**Exception**: Wrap at call site only if called from Effect pipelines:

```typescript
yield* Effect.sync(() => setFloatingElemPosition(elem, target, scroller))
```

---

## Recommendations

### High Priority (Blocking)

1. **Fix Stream.unfold Pattern** - Remove incorrect `.pipe(Effect.option)` wrapper
2. **Use MutableHashSet for DOM Integration** - Replace immutable HashSet in swipe.ts
3. **Handle Str.split Regex Limitation** - Use hybrid native split + A.fromIterable
4. **Define Tagged Errors** - Create errors.ts schema file
5. **Create SerializedDocumentSchema** - Required for JSON.parse transformation

### Medium Priority (Should Fix Before PR)

6. **Add Migration Compatibility Layers** - Promise wrappers during migration
7. **Fix Test Patterns** - Ensure tests yield Effects properly
8. **Keep Native WeakMap** - Document exception to native collection ban
9. **Use Effect.try for Web APIs** - Wrap throwing constructors like `new URL()`

### Low Priority (Polish)

10. **Exclude DOM-Heavy Utilities** - Mark as out-of-scope
11. **Keep Optional Chaining for Simple Cases** - Don't over-transform `el?.focus()`
12. **Simplify Null Checks in Loops** - Keep native `!= null` for while loops

---

## Final Assessment

**Status**: NEEDS_WORK

**Summary**:
- **Strengths**: Core transformation patterns (async → Effect.gen, Set → HashSet, Array methods) are sound
- **Weaknesses**: Critical API gaps, missing error schemas, incorrect Stream patterns, over-aggressive transformations
- **Blockers**: Must fix High Priority issues before implementation

**Estimated Rework**: 8-12 hours to address all High Priority issues

**Next Steps**:
1. Fix Stream.unfold pattern in effect-api-research.md
2. Update AGENT_PROMPTS.md with corrected patterns
3. Create error schema file
4. Define scope exclusions (DOM utilities)
5. Re-validate transformations against updated patterns

---

**Document Location**: `specs/lexical-utils-effect-refactor/outputs/code-quality-review.md`
