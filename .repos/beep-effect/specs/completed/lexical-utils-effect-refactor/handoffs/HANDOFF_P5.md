# Phase 5 Handoff: Priority 2-3 Refactor

> Context document for Phase 5 execution. Read this completely before starting.

---

## Previous Phase Summary

**Phase 4 (Priority 1 Refactor)** completed on 2026-01-27 with **PASS** status.

### Files Refactored in Phase 4

| File | Changes |
|------|---------|
| `docSerialization.ts` | Converted to Effect.gen, TaggedErrors, Promise wrappers |
| `swipe.ts` | Set → MutableHashSet, kept native WeakMap |

### Key Learnings from Phase 4

1. **MutableHashSet.forEach does NOT exist** - use native `for...of` iteration
2. **Effect.tryPromise for Web APIs** - clean pattern for wrapping ReadableStream
3. **Effect.try for sync fallible ops** - JSON.parse, atob, etc.
4. **Promise wrappers** - `Effect.option + O.getOrNull` matches null-returning signatures

---

## Phase 5 Mission

Refactor **Priority 2 (Medium Complexity)** and **Priority 3 (Low Complexity)** files.

### Priority 2 Files (Must Refactor)

| File | LOC | Native Patterns | Target Changes |
|------|-----|-----------------|----------------|
| `getThemeSelector.ts` | 25 | `.split()`, `.map()`, `.join()`, `throw Error` | A.*, S.TaggedError |
| `joinClasses.ts` | 13 | `.filter()`, `.join()` | A.filter, A.join |

### Priority 3 Files (Recommended Refactor)

| File | LOC | Native Patterns | Target Changes |
|------|-----|-----------------|----------------|
| `url.ts` | 38 | `new Set()`, `.has()`, `try/catch` | HashSet, Effect.try |
| `getSelectedNode.ts` | 27 | None - already Effect-compatible | Minimal cleanup only |

### Scope Exclusions (Confirmed)

The following files are **excluded** from refactoring per Phase 2 evaluation:

| File | Reason |
|------|--------|
| `focusUtils.ts` | DOM-centric, only optional chaining |
| `getDOMRangeRect.ts` | Pure DOM manipulation |
| `setFloatingElemPosition.ts` | DOM positioning math |
| `setFloatingElemPositionForLinkEditor.ts` | Variant of above |

---

## Target: getThemeSelector.ts

**Location**: `apps/todox/src/app/lexical/utils/getThemeSelector.ts`

**Current Implementation**:
```typescript
const className = getTheme()?.[name];
if (typeof className !== 'string') {
  throw new Error(`...`);
}
return className
  .split(/\s+/g)  // Native regex split
  .map((cls) => `.${cls}`)  // Native map
  .join();  // Native join
```

**Target Implementation**:
```typescript
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as Effect from "effect/Effect";
import { ThemeLookupError } from "../schema/errors";

// Option 1: Keep native .split() for regex (no Effect alternative)
const classes = className.split(/\s+/g);
return A.map(classes, (cls) => `.${cls}`).pipe(A.join(""));

// Error handling: Convert throw to Effect.fail
if (!P.isString(className)) {
  return Effect.fail(new ThemeLookupError({ ... }));
}
```

**Notes**:
- Keep native `.split(/\s+/g)` - Str.split doesn't support regex
- Convert array methods to A.map, A.join
- Replace typeof check with P.isString
- Replace throw with S.TaggedError (may need new error class)

---

## Target: joinClasses.ts

**Location**: `apps/todox/src/app/lexical/utils/joinClasses.ts`

**Current Implementation**:
```typescript
export function joinClasses(
  ...args: Array<string | boolean | null | undefined>
) {
  return args.filter(Boolean).join(' ');
}
```

**Target Implementation**:
```typescript
import * as A from "effect/Array";
import * as P from "effect/Predicate";

export function joinClasses(
  ...args: Array<string | boolean | null | undefined>
): string {
  return A.filter(args, P.isString).pipe(A.join(" "));
}
```

**Notes**:
- Replace `.filter(Boolean)` with `A.filter(args, P.isString)`
- Replace `.join(' ')` with `A.join(" ")`
- Function remains synchronous - no Effect wrapper needed

---

## Target: url.ts

**Location**: `apps/todox/src/app/lexical/utils/url.ts`

**Current Implementation**:
```typescript
const SUPPORTED_URL_PROTOCOLS = new Set(['http:', 'https:', ...]);

export function sanitizeUrl(url: string): string {
  try {
    const parsedUrl = new URL(url);
    if (!SUPPORTED_URL_PROTOCOLS.has(parsedUrl.protocol)) {
      return 'about:blank';
    }
    return url;
  } catch {
    return url;
  }
}
```

**Target Implementation**:
```typescript
import * as HashSet from "effect/HashSet";
import * as Effect from "effect/Effect";
import { InvalidUrlError } from "../schema/errors";

const SUPPORTED_URL_PROTOCOLS = HashSet.fromIterable(['http:', 'https:', ...]);

export const sanitizeUrl = (url: string): Effect.Effect<string, InvalidUrlError> =>
  Effect.try({
    try: () => new URL(url),
    catch: () => new InvalidUrlError({ message: "Invalid URL format", url }),
  }).pipe(
    Effect.flatMap((parsedUrl) =>
      HashSet.has(SUPPORTED_URL_PROTOCOLS, parsedUrl.protocol)
        ? Effect.succeed(url)
        : Effect.succeed("about:blank")
    )
  );

// Backward-compatible wrapper
export const sanitizeUrlSync = (url: string): string =>
  Effect.runSync(
    Effect.catchAll(sanitizeUrl(url), () => Effect.succeed(url))
  );
```

**Notes**:
- Replace `new Set()` with `HashSet.fromIterable()`
- Replace `.has()` with `HashSet.has()`
- Replace try/catch with Effect.try
- Add sync wrapper for backward compatibility

---

## Effect Pattern Reference

### Array Operations

```typescript
import * as A from "effect/Array";

// Filter
A.filter(array, (x) => condition)       // Keeps truthy results
A.filter(array, P.isString)             // With predicate function

// Map
A.map(array, (x) => transform(x))

// Join
A.join(array, " ")                      // Join with separator
```

### HashSet Operations (Immutable)

```typescript
import * as HashSet from "effect/HashSet";

// Create
const set = HashSet.fromIterable(['a', 'b', 'c']);
const empty = HashSet.empty<string>();

// Query
HashSet.has(set, 'a')                   // Returns boolean
HashSet.size(set)                       // Returns number

// Modify (returns new set)
HashSet.add(set, 'd')                   // Returns new HashSet
HashSet.remove(set, 'a')                // Returns new HashSet
```

### Predicate Type Guards

```typescript
import * as P from "effect/Predicate";

P.isString(value)                       // value is string
P.isNumber(value)                       // value is number
P.isBoolean(value)                      // value is boolean
P.isNullable(value)                     // value is null | undefined
```

---

## Success Criteria

- [ ] `getThemeSelector.ts` refactored (A.map, A.join, P.isString)
- [ ] `joinClasses.ts` refactored (A.filter, A.join)
- [ ] `url.ts` refactored (HashSet, Effect.try)
- [ ] `getSelectedNode.ts` reviewed (minimal changes if any)
- [ ] No type errors in refactored files
- [ ] `REFLECTION_LOG.md` updated with Phase 5 learnings
- [ ] `HANDOFF_P6.md` created (Verification phase)
- [ ] `P6_ORCHESTRATOR_PROMPT.md` created

---

## Risk Areas

### Low Risk
- **joinClasses.ts** - Simple array operations, straightforward conversion
- **getSelectedNode.ts** - Already Effect-compatible, may need no changes

### Medium Risk
- **getThemeSelector.ts** - Error throw needs TaggedError; may need new error class
- **url.ts** - HashSet integration with URL parsing; ensure backward compatibility

---

## Reference Files

| File | Purpose |
|------|---------|
| `specs/lexical-utils-effect-refactor/REFLECTION_LOG.md` | Phase 4 learnings |
| `apps/todox/src/app/lexical/schema/errors.ts` | Existing TaggedError classes |
| `apps/todox/src/app/lexical/utils/docSerialization.ts` | Phase 4 reference implementation |
| `.claude/rules/effect-patterns.md` | Effect conventions |

---

## Context Budget

- Direct tool calls: Max 15 (simpler files)
- File reads: Max 8 (reference and validation)
- Sub-agent delegations: Max 1 (if needed for complex pattern)

Phase 5 is implementation-focused; prefer direct tool calls over delegation.
