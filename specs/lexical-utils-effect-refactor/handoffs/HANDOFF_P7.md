# Phase 7 Handoff: Remediation

> Context document for Phase 7 execution. Read this completely before starting.

---

## Previous Phase Summary

**Phase 6 (Verification)** completed on 2026-01-27 with **PARTIAL PASS** status.

Post-completion review identified the following gaps against rubric requirements:

| Issue | Rubric Points Lost | Severity |
|-------|-------------------|----------|
| `utils/index.ts` is empty | 2 | HIGH |
| `UrlPattern` schema missing | 3 | MEDIUM |
| `url.ts` uses inline regex instead of schema | 2 | MEDIUM |
| No tests created | 7 | HIGH |

**Total Points at Risk**: 14 points

---

## Phase 7 Mission

**Remediate** all identified gaps to achieve full rubric compliance:

1. Populate `utils/index.ts` barrel exports
2. Add `UrlPattern` schema with `S.pattern()`
3. Refactor `url.ts` to use schema pattern
4. Create test file with key test cases

---

## Task 1: Populate utils/index.ts

**File**: `apps/todox/src/app/lexical/utils/index.ts`

**Current State**: Empty (0 lines)

**Required Content**:

```typescript
/**
 * Lexical utility functions.
 *
 * @since 0.1.0
 */

// Document serialization (Effect-based)
export {
  docToHash,
  docToHashPromise,
  docFromHash,
  docFromHashPromise,
} from "./docSerialization";

// Swipe gesture listeners
export {
  addSwipeLeftListener,
  addSwipeRightListener,
  addSwipeUpListener,
  addSwipeDownListener,
} from "./swipe";

// URL utilities
export { sanitizeUrl, validateUrl } from "./url";

// Theme utilities
export { getThemeSelector } from "./getThemeSelector";

// Class joining
export { default as joinClasses } from "./joinClasses";

// Selection utilities
export { getSelectedNode } from "./getSelectedNode";

// DOM utilities (not refactored - DOM-centric)
export { getDOMRangeRect } from "./getDOMRangeRect";
export { setFloatingElemPosition } from "./setFloatingElemPosition";
export { setFloatingElemPositionForLinkEditor } from "./setFloatingElemPositionForLinkEditor";

// Focus utilities
export * from "./focusUtils";
```

---

## Task 2: Add UrlPattern Schema

**File**: `apps/todox/src/app/lexical/schema/url.schema.ts`

**Add after `SupportedProtocol`**:

```typescript
/**
 * URL validation pattern.
 * Matches common URL formats including protocol, domain, path, query, and fragment.
 *
 * @since 0.1.0
 */
export const UrlPattern = S.String.pipe(
  S.pattern(
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/
  ),
  S.annotations(
    $I.annotations("UrlPattern", {
      description: "Valid URL pattern matching common URL formats",
    })
  )
);

export declare namespace UrlPattern {
  export type Type = typeof UrlPattern.Type;
}
```

---

## Task 3: Refactor url.ts to Use Schema

**File**: `apps/todox/src/app/lexical/utils/url.ts`

**Changes Required**:

1. Import the pattern from schema
2. Remove inline regex definition
3. Use schema for validation

**Before**:
```typescript
import * as HashSet from "effect/HashSet";

const SUPPORTED_URL_PROTOCOLS = HashSet.fromIterable(["http:", "https:", "mailto:", "sms:", "tel:"]);

// ... sanitizeUrl ...

// Source: https://stackoverflow.com/a/8234912/2013580
const urlRegExp = new RegExp(
  /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/
);

export function validateUrl(url: string): boolean {
  return url === "https://" || urlRegExp.test(url);
}
```

**After**:
```typescript
import * as HashSet from "effect/HashSet";
import * as S from "effect/Schema";

import { UrlPattern } from "../schema/url.schema";

const SUPPORTED_URL_PROTOCOLS = HashSet.fromIterable(["http:", "https:", "mailto:", "sms:", "tel:"]);

// ... sanitizeUrl unchanged ...

/**
 * Validates a URL string against the UrlPattern schema.
 *
 * @since 0.1.0
 */
export function validateUrl(url: string): boolean {
  // TODO Fix UI for link insertion; it should never default to an invalid URL such as https://.
  if (url === "https://") {
    return true;
  }
  return S.is(UrlPattern)(url);
}
```

---

## Task 4: Create Test File

**File**: `apps/todox/test/lexical/utils.test.ts`

**Required Test Cases**:

```typescript
import { effect, strictEqual } from "@beep/testkit";
import * as Effect from "effect/Effect";
import * as O from "effect/Option";

import {
  docToHash,
  docFromHash,
  sanitizeUrl,
  validateUrl,
  joinClasses,
  getThemeSelector,
} from "../../src/app/lexical/utils";

// ============================================
// docSerialization tests
// ============================================

effect("docToHash produces hash string starting with #doc=", () =>
  Effect.gen(function* () {
    const doc = {
      editorState: { root: { type: "root", version: 1 } },
      lastSaved: Date.now(),
      source: "Lexical",
    };
    const hash = yield* docToHash(doc as any);
    strictEqual(hash.startsWith("#doc="), true);
  })
);

effect("docFromHash returns InvalidDocumentHashError for invalid hash", () =>
  Effect.gen(function* () {
    const result = yield* Effect.either(docFromHash("invalid"));
    strictEqual(result._tag, "Left");
    if (result._tag === "Left") {
      strictEqual(result.left._tag, "InvalidDocumentHashError");
    }
  })
);

effect("docToHash and docFromHash round-trip preserves data", () =>
  Effect.gen(function* () {
    const original = {
      editorState: { root: { type: "root", version: 1 } },
      lastSaved: 1234567890,
      source: "Test",
    };
    const hash = yield* docToHash(original as any);
    const restored = yield* docFromHash(hash);
    strictEqual(restored.lastSaved, original.lastSaved);
    strictEqual(restored.source, original.source);
  })
);

// ============================================
// url tests
// ============================================

effect("sanitizeUrl returns about:blank for javascript: protocol", () =>
  Effect.sync(() => {
    // eslint-disable-next-line no-script-url
    const result = sanitizeUrl("javascript:alert(1)");
    strictEqual(result, "about:blank");
  })
);

effect("sanitizeUrl allows https: protocol", () =>
  Effect.sync(() => {
    const result = sanitizeUrl("https://example.com");
    strictEqual(result, "https://example.com");
  })
);

effect("sanitizeUrl allows mailto: protocol", () =>
  Effect.sync(() => {
    const result = sanitizeUrl("mailto:test@example.com");
    strictEqual(result, "mailto:test@example.com");
  })
);

effect("validateUrl returns true for valid URL", () =>
  Effect.sync(() => {
    strictEqual(validateUrl("https://example.com/path?query=1"), true);
  })
);

effect("validateUrl returns true for https:// placeholder", () =>
  Effect.sync(() => {
    strictEqual(validateUrl("https://"), true);
  })
);

effect("validateUrl returns false for invalid URL", () =>
  Effect.sync(() => {
    strictEqual(validateUrl("not a url"), false);
  })
);

// ============================================
// joinClasses tests
// ============================================

effect("joinClasses filters out falsy values", () =>
  Effect.sync(() => {
    const result = joinClasses("a", false, "b", null, "c", undefined);
    strictEqual(result, "a b c");
  })
);

effect("joinClasses returns empty string for all falsy", () =>
  Effect.sync(() => {
    const result = joinClasses(false, null, undefined);
    strictEqual(result, "");
  })
);

effect("joinClasses handles single class", () =>
  Effect.sync(() => {
    const result = joinClasses("single");
    strictEqual(result, "single");
  })
);
```

---

## Verification Checklist

After completing all tasks:

### 1. Type Check

```bash
cd apps/todox && bun tsc --noEmit
```

**Expected**: Only pre-existing error in `setupEnv.ts:31`

### 2. Lint Check

```bash
bun run lint --filter @beep/todox
```

**Expected**: No new lint errors in modified files

### 3. Run Tests

```bash
bun run test --filter @beep/todox
```

**Expected**: All new tests pass

---

## Success Criteria

- [ ] `utils/index.ts` exports all utilities
- [ ] `url.schema.ts` has `UrlPattern` with `S.pattern()`
- [ ] `url.ts` uses `S.is(UrlPattern)` for validation
- [ ] `test/lexical/utils.test.ts` exists with 10+ test cases
- [ ] All tests pass
- [ ] Type check passes
- [ ] Lint passes

---

## Files to Modify/Create

| File | Action |
|------|--------|
| `apps/todox/src/app/lexical/utils/index.ts` | WRITE (populate) |
| `apps/todox/src/app/lexical/schema/url.schema.ts` | EDIT (add UrlPattern) |
| `apps/todox/src/app/lexical/utils/url.ts` | EDIT (use schema) |
| `apps/todox/test/lexical/utils.test.ts` | CREATE |
| `specs/lexical-utils-effect-refactor/README.md` | EDIT (update status) |
| `specs/lexical-utils-effect-refactor/REFLECTION_LOG.md` | EDIT (add P7 entry) |

---

## Reference Files

| File | Purpose |
|------|---------|
| `specs/lexical-utils-effect-refactor/RUBRICS.md` | Scoring criteria |
| `.claude/rules/effect-patterns.md` | Effect conventions |
| `.claude/commands/patterns/effect-testing-patterns.md` | Test patterns |
| `tooling/testkit/README.md` | Testkit API reference |
