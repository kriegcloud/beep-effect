# Handoff Document: Remove Unsafe Code from react-recaptcha-v3

## Session Context

This handoff document provides all context needed to remove unsafe type assertions from the `react-recaptcha-v3` module in a fresh session.

---

## Objective

Remove all unsafe code patterns from `packages/shared/client/src/services/react-recaptcha-v3/` including:
- `as unknown as` type assertions
- `as` type assertions
- Unchecked type casts
- Replace with type-safe alternatives using Effect Schema, type guards, or proper validation

---

## Files to Modify

### Primary Files with Unsafe Code

1. **`recaptcha.atoms.ts`** - Core atoms implementation (highest priority)
2. **`ReCaptchaService.ts`** - Effect service implementation
3. **`ReCaptchaProvider.tsx`** - React provider (legacy, lower priority)

---

## Unsafe Code Inventory

### File: `recaptcha.atoms.ts`

| Line | Unsafe Pattern | Current Code |
|------|----------------|--------------|
| 92 | `as unknown as` | `window as unknown as Record<string, unknown>` |
| 213 | `as Record` | `win[CONFIG_KEY] as Record<string, unknown>` |
| 217 | `as Array` | `(cfg.fns as Array<() => void>).push(cb)` |
| 223 | `as Record` | `win.grecaptcha as Record<string, unknown>` |
| 230 | `as Record` | `(grecaptcha.enterprise as Record<string, unknown>).ready = readyFn` |
| 236-237 | `as ReCaptchaInstance` | `grecaptcha.enterprise as ReCaptchaInstance \| undefined` and `grecaptcha as unknown as ReCaptchaInstance` |
| 444 | `as HTMLDivElement` | `.querySelector(".grecaptcha-badge") as HTMLDivElement \| null` |

### File: `ReCaptchaService.ts`

| Line | Unsafe Pattern | Current Code |
|------|----------------|--------------|
| 132 | `as unknown as` | `window as unknown as Record<string, unknown>` |
| 196 | `as Record` | `getWindow()[CONFIG_KEY] as Record<string, unknown> \| undefined` |
| 222 | `as Record` | `win[CONFIG_KEY] as Record<string, unknown>` |
| 226 | `as Array` | `(cfg.fns as Array<() => void>).push(cb)` |
| 233 | `as Record` | `win.grecaptcha as Record<string, unknown>` |
| 240 | `as Record` | `(grecaptcha.enterprise as Record<string, unknown>).ready = readyFn` |
| 409, 418-419, 443, 449-450, 465 | Various `as` casts | grecaptcha and client casts |

### File: `ReCaptchaProvider.tsx`

| Line | Unsafe Pattern | Current Code |
|------|----------------|--------------|
| 260 | `as HTMLDivElement` | `.querySelector(".grecaptcha-badge") as HTMLDivElement \| null` |

---

## Type-Safe Replacement Strategies

### Strategy 1: Window Global Schema

Create an Effect Schema for the window globals:

```typescript
import * as S from "effect/Schema";
import * as O from "effect/Option";

// Schema for grecaptcha config
const GRecaptchaConfigSchema = S.Struct({
  fns: S.optional(S.Array(S.Unknown)), // Array of callbacks
  clients: S.optional(S.Record({ key: S.String, value: S.Unknown })),
});

// Type guard for window globals
const getGrecaptchaConfig = (win: Window): O.Option<typeof GRecaptchaConfigSchema.Type> => {
  const cfg = (win as Record<string, unknown>)[CONFIG_KEY];
  if (cfg === undefined || cfg === null) return O.none();
  const decoded = S.decodeUnknownOption(GRecaptchaConfigSchema)(cfg);
  return decoded;
};
```

### Strategy 2: ReCaptchaInstance Type Guard

Create a proper type guard for the ReCaptcha instance:

```typescript
import * as P from "effect/Predicate";

const isReCaptchaInstance = (value: unknown): value is ReCaptchaInstance =>
  P.isObject(value) &&
  P.hasProperty(value, "execute") &&
  P.isFunction(value.execute) &&
  P.hasProperty(value, "ready") &&
  P.isFunction(value.ready);

// Usage
const getInstance = (grecaptcha: unknown, useEnterprise: boolean): O.Option<ReCaptchaInstance> => {
  const target = useEnterprise && P.isObject(grecaptcha) && P.hasProperty(grecaptcha, "enterprise")
    ? grecaptcha.enterprise
    : grecaptcha;

  return isReCaptchaInstance(target) ? O.some(target) : O.none();
};
```

### Strategy 3: DOM Element Type Guards

Replace `as HTMLDivElement` with proper type guards:

```typescript
const isHTMLDivElement = (el: Element | null): el is HTMLDivElement =>
  el !== null && el instanceof HTMLDivElement;

// Usage
const badge = actualContainer.querySelector(".grecaptcha-badge");
if (isHTMLDivElement(badge)) {
  badge.style.setProperty("display", "none");
}
```

### Strategy 4: Safe Window Access

Create a safe window accessor using Effect:

```typescript
import * as Effect from "effect/Effect";

// Type-safe window property accessor
const getWindowProperty = <T>(
  key: string,
  guard: (value: unknown) => value is T
): Effect.Effect<O.Option<T>> =>
  Effect.sync(() => {
    if (typeof window === "undefined") return O.none();
    const value = (window as Record<string, unknown>)[key];
    return guard(value) ? O.some(value) : O.none();
  });
```

---

## Codebase Patterns to Follow

### Pattern 1: Effect Predicate Usage

```typescript
import * as P from "effect/Predicate";

// Use P.isObject, P.hasProperty, P.isFunction, P.isString, etc.
const isValidConfig = (cfg: unknown): cfg is { fns: Array<() => void> } =>
  P.isObject(cfg) &&
  P.hasProperty(cfg, "fns") &&
  Array.isArray(cfg.fns);
```

### Pattern 2: Option for Nullable Values

```typescript
import * as O from "effect/Option";
import * as F from "effect/Function";

// Convert nullable to Option
const safeGetInstance = F.pipe(
  O.fromNullable(grecaptcha),
  O.filter(isReCaptchaInstance)
);
```

### Pattern 3: Effect Schema for External Data

```typescript
import * as S from "effect/Schema";

const WindowGlobalSchema = S.Struct({
  grecaptcha: S.optional(S.Unknown),
  [CONFIG_KEY]: S.optional(S.Unknown),
});
```

---

## Files to Reference

### Existing Type-Safe Patterns in Codebase

1. `packages/common/schema/src/` - Schema patterns
2. `packages/shared/client/src/atom/files/` - Type-safe atom patterns
3. `packages/iam/client/src/errors.ts` - Error type patterns

### Module Dependencies

1. `./types.ts` - `ReCaptchaInstance` interface (may need to expand)
2. `./errors.ts` - Tagged errors (already implemented)
3. `./schemas.ts` - Existing schemas (may need to expand)

---

## Implementation Checklist

### Phase 1: Create Type Guards (`utils.ts` or new `guards.ts`)

- [ ] Create `isReCaptchaInstance` type guard
- [ ] Create `isGRecaptchaConfig` type guard
- [ ] Create `isHTMLDivElement` helper
- [ ] Create safe window property accessors

### Phase 2: Update `recaptcha.atoms.ts`

- [ ] Replace `getWindow()` with type-safe alternative
- [ ] Replace `win[CONFIG_KEY] as Record` with type guard
- [ ] Replace `cfg.fns as Array` with proper validation
- [ ] Replace `grecaptcha as Record` with type guard
- [ ] Replace `grecaptcha.enterprise as ReCaptchaInstance` with type guard
- [ ] Replace `.querySelector(...) as HTMLDivElement` with type guard
- [ ] Verify all `as` assertions are removed

### Phase 3: Update `ReCaptchaService.ts`

- [ ] Apply same patterns from Phase 2
- [ ] Ensure consistency with atoms implementation

### Phase 4: Update `ReCaptchaProvider.tsx` (if time permits)

- [ ] Apply DOM element type guards
- [ ] Consider if this legacy file needs full treatment

### Phase 5: Verification

- [ ] Run `bun run --filter @beep/shared-client check` - no type errors
- [ ] Run `bun run --filter @beep/shared-client build` - builds successfully
- [ ] Grep for remaining `as unknown as` patterns - should be zero
- [ ] Grep for remaining `as Record` patterns - should be zero or justified

---

## Success Criteria

1. **Zero `as unknown as` assertions** in the module
2. **Zero unchecked `as` casts** - all remaining casts must be:
   - After a type guard check, OR
   - With a TODO comment explaining why it's unavoidable
3. **Type-safe window access** using guards or Effect Schema
4. **No runtime behavior changes** - all changes are purely type-level safety improvements
5. **All checks pass**: `bun run --filter @beep/shared-client check && bun run --filter @beep/shared-client build`

---

## Gotchas

### 1. Window Type in TypeScript

TypeScript's `Window` type doesn't include arbitrary properties. You may need:

```typescript
declare global {
  interface Window {
    grecaptcha?: unknown;
    [key: `onLoadCallback_${string}`]: (() => void) | undefined;
  }
}
```

Or use a type-safe accessor pattern instead of declaration merging.

### 2. grecaptcha.enterprise

The enterprise variant has the same interface but lives under `.enterprise`. Handle both paths with a single type guard.

### 3. DOM Queries Return Element, Not Specific Types

`querySelector` returns `Element | null`, not `HTMLDivElement`. Always use `instanceof` checks or type guards.

### 4. Callback Registration

The `cfg.fns` array is used by Google's script to call callbacks. Ensure the array mutation is type-safe but don't break the runtime behavior.

---

## Test After Changes

```bash
# Type checking
bun run --filter @beep/shared-client check

# Build
bun run --filter @beep/shared-client build

# Verify no unsafe patterns remain
grep -rn "as unknown as" packages/shared/client/src/services/react-recaptcha-v3/
grep -rn "as Record" packages/shared/client/src/services/react-recaptcha-v3/
grep -rn "as Array" packages/shared/client/src/services/react-recaptcha-v3/
grep -rn "as ReCaptchaInstance" packages/shared/client/src/services/react-recaptcha-v3/
grep -rn "as HTML" packages/shared/client/src/services/react-recaptcha-v3/
```

---

## Priority Order

1. **`recaptcha.atoms.ts`** - This is the new Effect-first implementation, should be clean
2. **`ReCaptchaService.ts`** - Effect service, should also be clean
3. **`ReCaptchaProvider.tsx`** - Legacy React Context implementation, lower priority

Focus on making the atoms file exemplary first, then apply learnings to the service file.
