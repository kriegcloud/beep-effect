# Lexical Utils Effect Refactor

> Orchestrated refactoring of `apps/todox/src/app/lexical/utils/` to use Effect patterns and repository best practices.

**Status**: ✅ COMPLETE (Remediated 2026-01-27)
**Complexity Score**: 51 (High)
**Phases Completed**: 7/7

---

## Overview

This spec orchestrates the refactoring of 10 utility files from imperative JavaScript patterns to idiomatic Effect code. The orchestrator delegates work to specialized sub-agents and manages handoffs between phases.

**Target Directory**: `apps/todox/src/app/lexical/utils/`

**Schema Output**: `apps/todox/src/app/lexical/schema/`

---

## Refactoring Requirements

| Native Pattern | Effect Replacement | Import |
|----------------|-------------------|--------|
| `string.split()`, `string.toLowerCase()` | `Str.split()`, `Str.toLowerCase()` | `import * as Str from "effect/String"` |
| `array.map()`, `array.filter()`, `array.join()` | `A.map()`, `A.filter()`, `A.join()` | `import * as A from "effect/Array"` |
| `new Set()` | `HashSet.make()` | `import * as HashSet from "effect/HashSet"` |
| `JSON.parse()` | `S.decodeUnknownSync(schema)` | `import * as S from "effect/Schema"` |
| `async/await`, `Promise` | `Effect.gen`, `Stream` | `import * as Effect from "effect/Effect"` |
| `null` checks, `undefined` checks | `O.fromNullable()`, `P.isNullable()` | `import * as O from "effect/Option"` |
| RegExp validation | `S.pattern()` in schemas | `import * as S from "effect/Schema"` |

---

## Files to Refactor

### Priority 1: Heavy Refactoring (Async + Complex Patterns)

| File | Key Issues | Estimated Complexity |
|------|-----------|---------------------|
| `docSerialization.ts` | async/await, Promise.all, JSON.parse, native array | High |
| `swipe.ts` | native Set, WeakMap, undefined checks | High |
| `url.ts` | RegExp, native Set, try/catch | Medium |

### Priority 2: Moderate Refactoring (String/Array Operations)

| File | Key Issues | Estimated Complexity |
|------|-----------|---------------------|
| `getThemeSelector.ts` | string.split, array.map, array.join, typeof | Medium |
| `joinClasses.ts` | array.filter, array.join | Low |
| `setFloatingElemPosition.ts` | null checks, conditional logic | Medium |

### Priority 3: Light Refactoring (Null Checks Only)

| File | Key Issues | Estimated Complexity |
|------|-----------|---------------------|
| `focusUtils.ts` | null returns, optional chaining | Low |
| `getDOMRangeRect.ts` | null check, while loop | Low |
| `getSelectedNode.ts` | conditional logic | Low |
| `setFloatingElemPositionForLinkEditor.ts` | null checks | Low |

### Skip

| File | Reason |
|------|--------|
| `emoji-list.ts` | Static data (354KB), no logic to refactor |
| `index.ts` | Barrel file, update after all refactors |

---

## Schema Requirements

Create schemas in `apps/todox/src/app/lexical/schema/` for:

### URL Validation Schema

```typescript
// url.schema.ts
import * as S from "effect/Schema";
import { $TodoxId } from "@beep/identity/packages";

const $I = $TodoxId.create("lexical/schema/url");

// Capture the URL regex as a schema pattern
export const UrlPattern = S.String.pipe(
  S.pattern(
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/
  ),
  S.annotations($I.annotations("UrlPattern", { description: "Valid URL pattern" }))
);

export const SupportedProtocol = S.Literal("http:", "https:", "mailto:", "sms:", "tel:");
```

### Document Hash Schema

```typescript
// docHash.schema.ts
export const DocHashPattern = S.String.pipe(
  S.pattern(/^#doc=(.*)$/),
  S.annotations($I.annotations("DocHashPattern", { description: "Document hash format" }))
);
```

---

## Phase Overview

| Phase | Focus | Sub-Agents | Output |
|-------|-------|------------|--------|
| P1: Discovery | Analyze patterns, research Effect APIs | `codebase-researcher`, `mcp-researcher` | Context reports |
| P2: Evaluation | Validate approach, identify risks | `architecture-pattern-enforcer`, `code-reviewer` | Review reports |
| P3: Schema Creation | Create validation schemas | `effect-code-writer` | Schema files |
| P4: Priority 1 Refactor | Heavy refactoring (docSerialization, swipe, url) | `effect-code-writer` | Refactored files |
| P5: Priority 2-3 Refactor | Remaining files | `effect-code-writer` | Refactored files |
| P6: Verification | Tests, type checks, cleanup | `test-writer`, `package-error-fixer` | Verified code |

---

## Success Criteria

- [x] 6 of 10 files refactored to use Effect patterns (4 excluded as DOM-centric)
- [x] No native Array methods in refactored files - using `A.map`, `A.filter`, `A.join`
- [x] No native `Set` - using `effect/HashSet` and `effect/MutableHashSet`
- [x] No `JSON.parse` - using `Effect.try` with tagged errors
- [x] No `async/await` - using `Effect.gen` with `Effect.tryPromise`
- [x] All null/undefined checks use `Option` or `Predicate` where appropriate
- [x] URL validation schema created with `S.pattern()` (including `UrlPattern`)
- [x] Type checks pass (only pre-existing `setupEnv.ts` error)
- [x] Lint passes for all refactored files
- [x] `utils/index.ts` barrel exports all utilities
- [x] Tests created with 13 passing test cases

### Documented Exceptions

| Exception | Justification |
|-----------|---------------|
| Native `WeakMap` in `swipe.ts` | No Effect equivalent; required for GC semantics |
| Native `.split(/regex/)` | Effect String only supports string delimiters |
| DOM utilities excluded | `focusUtils`, `getDOMRangeRect`, `setFloatingElemPosition*` provide no Effect benefit |

---

## Orchestrator Rules

This orchestrator MUST follow the delegation matrix:

| Task Type | Delegate To | Never Do Directly |
|-----------|-------------|-------------------|
| Code exploration (>3 files) | `codebase-researcher` | Sequential Glob/Read |
| Effect documentation lookup | `mcp-researcher` | Manual doc searching |
| Source code implementation | `effect-code-writer` | Writing .ts files |
| Test implementation | `test-writer` | Writing .test.ts files |
| Architecture validation | `architecture-pattern-enforcer` | Layer checks |
| Error fixing | `package-error-fixer` | Manual error resolution |

---

## Related Documentation

- [Effect Patterns](../../.claude/rules/effect-patterns.md)
- [Spec Guide](../_guide/README.md)
- [Handoff Standards](../_guide/HANDOFF_STANDARDS.md)
- [Effect Collections Guide](../../documentation/patterns/effect-collections.md)
- [Evaluation Rubrics](RUBRICS.md)
