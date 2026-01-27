# Phase 4 Handoff: Priority 1 Refactor

> Context document for Phase 4 execution. Read this completely before starting.

---

## Previous Phase Summary

**Phase 3 (Schema Creation)** completed on 2026-01-27 with **PASS** status.

### Outputs Generated

| File | Location | Purpose |
|------|----------|---------|
| `errors.ts` | `apps/todox/src/app/lexical/schema/` | 4 TaggedError classes |
| `url.schema.ts` | `apps/todox/src/app/lexical/schema/` | URL validation schemas |
| `doc.schema.ts` | `apps/todox/src/app/lexical/schema/` | Document serialization schemas |
| `swipe.schema.ts` | `apps/todox/src/app/lexical/schema/` | Swipe gesture schemas |

### Schemas Available for Phase 4

#### Error Classes

```typescript
import {
  InvalidUrlError,
  ParseError,
  InvalidDocumentHashError,
  CompressionError,
} from "../schema";
```

#### URL Schemas

```typescript
import {
  SanitizedUrl,
  SupportedProtocol,
  UrlValidationResult,
} from "../schema";
```

#### Document Schemas

```typescript
import {
  SerializedDocument,
  DocumentHashString,
  SerializedDocumentConfig,
} from "../schema";
```

#### Swipe Schemas

```typescript
import {
  Force,
  TouchCoordinates,
  SwipeDirection,
  SwipeThreshold,
  SwipeEvent,
} from "../schema";
```

---

## Phase 4 Mission

Refactor **Priority 1 (High Complexity)** files using Effect patterns:

1. `docSerialization.ts` - 86 LOC, 9 async patterns
2. `swipe.ts` - 127 LOC, 6 native collections

### Target: docSerialization.ts

**Location**: `apps/todox/src/app/lexical/utils/docSerialization.ts`

**Current Implementation**:
- Uses `async/await` for compression streams
- Uses `Promise.all` for parallel operations
- Returns `Promise<T>` / `Promise<T | null>`
- Uses `atob`/`btoa` for base64 encoding

**Target Implementation**:
- Use `Effect.gen` with `yield*` for async operations
- Use `Effect.all` for parallelism
- Return `Effect<T, E>` with proper errors
- Keep native `atob`/`btoa` (no Effect equivalent)

**Transformation Plan**:

```typescript
// BEFORE
export async function docToHash(doc: SerializedDocument): Promise<string> {
  const cs = new CompressionStream('gzip');
  const writer = cs.writable.getWriter();
  // ...
}

// AFTER
export const docToHash = (doc: SerializedDocument): Effect.Effect<string, CompressionError> =>
  Effect.gen(function* () {
    const cs = new CompressionStream("gzip");
    const writer = cs.writable.getWriter();
    // Use Effect.promise for async operations
    // Use Effect.try for throwing operations
  });
```

### Target: swipe.ts

**Location**: `apps/todox/src/app/lexical/utils/swipe.ts`

**Current Implementation**:
- Uses `WeakMap<HTMLElement, ElementValues>` for element state
- Uses `Set<Listener>` for listener collections
- Uses native array iteration (`for...of`)

**Target Implementation**:
- **Keep WeakMap** - no Effect equivalent, serves GC purposes
- Use `MutableHashSet` for listener collections
- Use Effect array utilities where beneficial

**Transformation Plan**:

```typescript
// BEFORE
type ElementValues = {
  start: null | Force;
  listeners: Set<Listener>;
  // ...
};

// AFTER
import * as MutableHashSet from "effect/MutableHashSet";

type ElementValues = {
  start: null | Force;
  listeners: MutableHashSet.MutableHashSet<Listener>;
  // ...
};
```

---

## Decisions Already Made (Phases 1-3)

1. **Keep native `.replace()`** for regex string operations (no Effect alternative)
2. **Use native `.split()` + `A.fromIterable()`** for regex delimiter splits
3. **Keep native WeakMap** in `swipe.ts` for element state tracking
4. **Use MutableHashSet** for DOM event listener management (not immutable HashSet)
5. **Keep optional chaining** for simple DOM operations (`el?.focus()`)
6. **Keep native `atob`/`btoa`** - no Effect encoding utilities available

---

## Scope Exclusions (Confirmed)

The following files are **excluded** from Effect refactoring:

| File | Reason |
|------|--------|
| `getDOMRangeRect.ts` | Pure DOM manipulation, zero Effect benefit |
| `setFloatingElemPosition.ts` | DOM positioning math, no async/error handling |
| `setFloatingElemPositionForLinkEditor.ts` | Variant of above |
| `focusUtils.ts` | DOM focus API calls, no Effect patterns needed |

---

## Effect Pattern Reference

### Stream from ReadableStream

```typescript
import * as Stream from "effect/Stream";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

const readStream = <T>(reader: ReadableStreamDefaultReader<T>) =>
  Stream.unfold(reader, (r) =>
    Effect.gen(function* () {
      const result = yield* Effect.promise(() => r.read());
      if (result.done) return O.none();
      return O.some([result.value, r] as const);
    })
  );
```

### MutableHashSet Usage

```typescript
import * as MutableHashSet from "effect/MutableHashSet";

const listeners = MutableHashSet.empty<Listener>();
MutableHashSet.add(listeners, cb);     // Mutates in-place
MutableHashSet.remove(listeners, cb);  // Mutates in-place
MutableHashSet.forEach(listeners, (listener) => { /* ... */ });
```

### Effect.try for Throwing Operations

```typescript
const parseJson = (input: string) =>
  Effect.try({
    try: () => JSON.parse(input),
    catch: (e) => new ParseError({ message: String(e), input }),
  });
```

### Schema Decoding

```typescript
import * as S from "effect/Schema";

const decoded = yield* S.decodeUnknown(SerializedDocument)(jsonObject).pipe(
  Effect.mapError((e) => new ParseError({ message: "Invalid document format", input: JSON.stringify(jsonObject) }))
);
```

---

## Success Criteria

- [ ] `docSerialization.ts` refactored to use Effect patterns
- [ ] `swipe.ts` refactored to use MutableHashSet
- [ ] All async functions return `Effect<T, E>` instead of `Promise<T>`
- [ ] All errors use TaggedError classes from `errors.ts`
- [ ] Native exceptions caught with `Effect.try`
- [ ] Backward-compatible Promise wrappers added for migration
- [ ] No type errors in refactored files
- [ ] Unit tests added using `@beep/testkit` patterns
- [ ] `REFLECTION_LOG.md` updated with Phase 4 learnings
- [ ] `HANDOFF_P5.md` created
- [ ] `P5_ORCHESTRATOR_PROMPT.md` created

---

## Risk Areas

### High Risk
- **ReadableStream integration**: Complex interaction with CompressionStream/DecompressionStream
- **Type compatibility**: SerializedDocument schema must match @lexical/file interface exactly

### Medium Risk
- **MutableHashSet iteration**: Ensure `forEach` callback semantics match native Set
- **Backward compatibility**: Promise wrappers must maintain identical behavior

### Low Risk
- **Base64 encoding**: Native `atob`/`btoa` kept as-is

---

## Reference Files

| File | Purpose |
|------|---------|
| `specs/lexical-utils-effect-refactor/outputs/effect-api-research.md` | API migration patterns |
| `apps/todox/src/app/lexical/schema/` | Schema definitions |
| `.claude/rules/effect-patterns.md` | Effect conventions |
| `.claude/commands/patterns/effect-testing-patterns.md` | Test patterns |

---

## Context Budget

- Direct tool calls: Max 20 (implementation phase)
- File reads: Max 10 (reference and validation)
- Sub-agent delegations: Max 2 (test-writer, effect-researcher if needed)

Phase 4 is implementation-focused; prefer direct tool calls over delegation.
