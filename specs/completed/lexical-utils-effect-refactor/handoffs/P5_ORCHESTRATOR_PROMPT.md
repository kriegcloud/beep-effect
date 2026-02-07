# Phase 5 Orchestrator Prompt

Copy-paste this prompt to start Phase 5 implementation.

---

## Prompt

You are implementing Phase 5 (Priority 2-3 Refactor) of the lexical-utils-effect-refactor spec.

### Context

Phase 4 (Priority 1 Refactor) is complete with PASS status. The following files were refactored:
- `docSerialization.ts` - Effect.gen, TaggedErrors, Promise wrappers
  - `swipe.ts` - MutableHashSet, native WeakMap preserved

### Key Learnings from Phase 4

1. **MutableHashSet.forEach does NOT exist** - use native `for...of` iteration instead
   2. **Effect.tryPromise** wraps Promise-returning APIs with custom error mapping
   3. **Effect.try** wraps synchronous throwing operations (JSON.parse, atob)
   4. **Promise wrappers** use `Effect.option + O.getOrNull` for null-returning compatibility

### Your Mission

Refactor **Priority 2 (Medium)** and **Priority 3 (Low)** files using Effect patterns:

1. **getThemeSelector.ts** (25 LOC) - string/array methods, error throw
   2. **joinClasses.ts** (13 LOC) - array filter/join
   3. **url.ts** (38 LOC) - Set collection, try/catch
   4. **getSelectedNode.ts** (27 LOC) - review only, likely minimal changes

**This is an implementation phase** - use tools directly, don't delegate to sub-agents.

### getThemeSelector.ts Refactoring

**Location**: `apps/todox/src/app/lexical/utils/getThemeSelector.ts`

**Key Transformations**:

1. **Keep native `.split(/\s+/g)`** - Str.split doesn't support regex

   2. **Convert array methods to Effect/Array**:
```typescript
// FROM
return className
  .split(/\s+/g)
  .map((cls) => `.${cls}`)
  .join();

// TO
const classes = className.split(/\s+/g);
return A.map(classes, (cls) => `.${cls}`).pipe(A.join(""));
```

3. **Replace typeof with P.isString**:
```typescript
// FROM
if (typeof className !== 'string') {

// TO
import * as P from "effect/Predicate";
if (!P.isString(className)) {
```

4. **Replace throw with Effect.fail** (optional - may keep sync for simplicity):
```typescript
// If keeping synchronous, the throw can stay
// If converting to Effect:
return Effect.fail(new ThemeLookupError({ name, message: "..." }));
```

### joinClasses.ts Refactoring

**Location**: `apps/todox/src/app/lexical/utils/joinClasses.ts`

**Key Transformations**:

```typescript
// FROM
export function joinClasses(
  ...args: Array<string | boolean | null | undefined>
) {
  return args.filter(Boolean).join(' ');
}

// TO
import * as A from "effect/Array";
import * as P from "effect/Predicate";

export function joinClasses(
  ...args: Array<string | boolean | null | undefined>
): string {
  return A.filter(args, P.isString).pipe(A.join(" "));
}
```

**Notes**:
- `A.filter(args, P.isString)` replaces `.filter(Boolean)` and is more precise
  - `A.join(" ")` replaces `.join(' ')`
  - Function remains synchronous - no Effect wrapper needed

### url.ts Refactoring

**Location**: `apps/todox/src/app/lexical/utils/url.ts`

**Key Transformations**:

1. **Replace Set with HashSet**:
```typescript
// FROM
const SUPPORTED_URL_PROTOCOLS = new Set(['http:', 'https:', ...]);
SUPPORTED_URL_PROTOCOLS.has(parsedUrl.protocol)

// TO
import * as HashSet from "effect/HashSet";
const SUPPORTED_URL_PROTOCOLS = HashSet.fromIterable(['http:', 'https:', ...]);
HashSet.has(SUPPORTED_URL_PROTOCOLS, parsedUrl.protocol)
```

2. **Replace try/catch with Effect.try** (optional):
```typescript
// FROM
try {
  const parsedUrl = new URL(url);
  if (!SUPPORTED_URL_PROTOCOLS.has(parsedUrl.protocol)) {
    return 'about:blank';
  }
  return url;
} catch {
  return url;
}

// TO (keeping sync for simplicity)
import * as Effect from "effect/Effect";
const result = Effect.try({
  try: () => new URL(url),
  catch: () => null,
}).pipe(Effect.runSync);

if (result === null) return url;
if (!HashSet.has(SUPPORTED_URL_PROTOCOLS, result.protocol)) {
  return 'about:blank';
}
return url;
```

**Notes**: url.ts can stay mostly synchronous. The main change is Set → HashSet.

### getSelectedNode.ts Review

**Location**: `apps/todox/src/app/lexical/utils/getSelectedNode.ts`

**Likely no changes needed** - this file uses Lexical types and has no native JavaScript patterns requiring conversion. Review and confirm.

### Critical Patterns

**From `.claude/rules/effect-patterns.md`**:
- `A.map(array, fn)` - NOT `array.map(fn)`
  - `A.filter(array, pred)` - NOT `array.filter(pred)`
  - `A.join(array, sep)` - NOT `array.join(sep)`
  - `HashSet.fromIterable(arr)` - NOT `new Set(arr)`
  - `HashSet.has(set, value)` - NOT `set.has(value)`
  - `P.isString(x)` - NOT `typeof x === 'string'`

**Native exceptions allowed**:
- `.split(/regex/)` - Str.split doesn't support regex
  - `.replace(/regex/, str)` - no Effect alternative

### Verification

After refactoring:
1. Run `bun tsc --noEmit` in `apps/todox` to verify no type errors
   2. Ensure all functions maintain their original signatures
   3. Check imports are properly added

### Success Criteria

- [ ] `getThemeSelector.ts` uses A.map, A.join, P.isString
  - [ ] `joinClasses.ts` uses A.filter, A.join
  - [ ] `url.ts` uses HashSet
  - [ ] `getSelectedNode.ts` reviewed (no changes expected)
  - [ ] No type errors in refactored files
  - [ ] `REFLECTION_LOG.md` updated with Phase 5 learnings
  - [ ] `HANDOFF_P6.md` created (Verification phase)
  - [ ] `P6_ORCHESTRATOR_PROMPT.md` created

### Reference Files

- Phase 4 implementations: `apps/todox/src/app/lexical/utils/docSerialization.ts`, `swipe.ts`
  - Effect patterns: `.claude/rules/effect-patterns.md`
  - Handoff context: `specs/lexical-utils-effect-refactor/handoffs/HANDOFF_P5.md`
  - Schema errors: `apps/todox/src/app/lexical/schema/errors.ts`

### Scope Exclusions

Do NOT refactor these files (confirmed in Phase 2):
- `focusUtils.ts` - DOM-centric, optional chaining only
  - `getDOMRangeRect.ts` - Pure DOM manipulation
  - `setFloatingElemPosition.ts` - DOM positioning math
  - `setFloatingElemPositionForLinkEditor.ts` - Variant of above

### Next Phase

After completing Phase 5:
1. Update `REFLECTION_LOG.md` with learnings
   2. Create `handoffs/HANDOFF_P6.md` (Verification phase context)
   3. Create `handoffs/P6_ORCHESTRATOR_PROMPT.md` (copy-paste prompt)

### Notes

- These are simpler files than Phase 4 - expect faster completion
  - `joinClasses.ts` is pure utility with no external dependencies
  - `url.ts` may need a new error class if converting fully to Effect (optional)
  - Focus on array/collection method replacements; keep functions synchronous where possible
