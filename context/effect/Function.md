# Function — Agent Context

> Best practices for using `effect/Function` in this codebase.

## Quick Reference

| Function | Purpose | Example |
|----------|---------|---------|
| `F.pipe(a, f, g)` | Left-to-right composition | `F.pipe(5, increment, double)` |
| `F.flow(f, g, h)` | Function composition | `F.flow(parse, validate, save)` |
| `F.identity` | Identity function (returns input) | `F.identity(42)` → `42` |
| `F.constant(x)` | Constant function (always returns x) | `F.constant(null)` → `() => null` |
| `F.dual(arity, fn)` | Data-first/data-last overloading | `F.dual(2, (a, b) => a + b)` |
| `F.compose(f, g)` | Right-to-left composition | `F.compose(double, increment)` |
| `F.flip(f)` | Reverse curried arguments | `F.flip(divide)(2)(10)` → `5` |
| `F.apply(...args)` | Apply arguments to function | `F.pipe(length, F.apply("hello"))` |

## Codebase Patterns

### ALWAYS Use Namespace Import

```typescript
// REQUIRED - Import as namespace
import * as F from "effect/Function";

// FORBIDDEN - Named imports
import { pipe, flow } from "effect/Function";  // WRONG!
```

### ALWAYS Use F.pipe for Data Flow

`F.pipe` is the PRIMARY composition primitive in this codebase. Use it for left-to-right data transformation:

```typescript
import * as F from "effect/Function";
import * as A from "effect/Array";
import * as Str from "effect/String";

// REQUIRED - F.pipe for readable data flow
const result = F.pipe(
  users,
  A.filter(u => u.active),
  A.map(u => u.name),
  A.join(", ")
);

const normalized = F.pipe(
  rawEmail,
  Str.trim,
  Str.toLowerCase,
  Str.slice(0, 100)
);

// FORBIDDEN - Nested function calls (hard to read)
const result = A.join(
  A.map(
    A.filter(users, u => u.active),
    u => u.name
  ),
  ", "
);

// FORBIDDEN - Native method chaining
const result = users
  .filter(u => u.active)
  .map(u => u.name)
  .join(", ");
```

**Why**: `F.pipe` makes data flow explicit (top-to-bottom), enables better type inference, and integrates seamlessly with Effect's data-last APIs.

### Use F.flow for Function Composition

Use `F.flow` when you need to create a reusable function pipeline:

```typescript
import * as F from "effect/Function";
import * as Str from "effect/String";

// REQUIRED - F.flow creates reusable function
const normalizeEmail = F.flow(
  Str.trim,
  Str.toLowerCase,
  Str.slice(0, 100)
);

// Use the composed function
const email = normalizeEmail(rawInput);

// Codebase example: paths builder (value-objects/paths.ts)
const buildOrgPath = F.flow(
  organization,
  (o) => ({ ...o, settings: o.id + "/settings" })
);
```

**When to use**:
- Creating reusable transformation pipelines
- Defining utilities that compose other utilities
- Building path helpers (see `packages/shared/domain/src/value-objects/paths.value.ts`)

**When NOT to use**:
- One-off data transformations → use `F.pipe` instead
- Effects that need dependency injection → use `Effect.gen`

### Use F.dual for Data-First/Data-Last APIs

`F.dual` enables functions that work both in pipelines and as standalone calls:

```typescript
import * as F from "effect/Function";
import * as A from "effect/Array";

// Codebase pattern (from common/utils/src/data/array.utils.ts)
export const slice: {
  (start: number): <A>(self: ReadonlyArray<A>) => Array<A>;
  (start: number, end: number): <A>(self: ReadonlyArray<A>) => Array<A>;
  <A>(self: ReadonlyArray<A>, start: number): Array<A>;
  <A>(self: ReadonlyArray<A>, start: number, end: number): Array<A>;
} = F.dual(
  (args: IArguments) => A.isArray(args[0]),
  <A>(self: ReadonlyArray<A>, start: number, end?: number): Array<A> =>
    end === undefined
      ? A.drop(self, start)
      : F.pipe(self, A.drop(start), A.take(end - start))
);

// Usage: Both styles work
F.pipe([1, 2, 3, 4, 5], slice(1, 3));  // [2, 3] (data-last)
slice([1, 2, 3, 4, 5], 1, 3);          // [2, 3] (data-first)
```

**Parameters**:
- **Arity number**: `F.dual(2, fn)` → function takes 2 args in data-first mode
- **Predicate**: `F.dual((args) => condition, fn)` → custom detection logic

**When to use**: When building reusable utilities that should work in both pipeline and direct-call contexts.

### Use F.constant for Thunks

Use `F.constant` to create lazy constant values:

```typescript
import * as F from "effect/Function";

// REQUIRED - Lazy constant
const getDefaultUser = F.constant({ id: "default", name: "Guest" });
const getNullFallback = F.constant(null);

// Usage
const user = maybeUser ?? getDefaultUser();

// FORBIDDEN - Direct value (evaluated eagerly)
const getDefaultUser = () => ({ id: "default", name: "Guest" });
```

**Specialized constants** (from Function module):
- `F.constTrue` → `() => true`
- `F.constFalse` → `() => false`
- `F.constNull` → `() => null`
- `F.constUndefined` → `() => undefined`
- `F.constVoid` → `() => void`

### Use F.identity for Pass-Through

```typescript
import * as F from "effect/Function";

// When you need a no-op transformation
const process = shouldTransform ? transform : F.identity;
const result = process(value);

// Schema transforms (when decoding = encoding)
const Schema = S.transformOrFail(
  S.String,
  BrandedId,
  { decode: validateId, encode: F.identity }
);
```

## Anti-Patterns

### 1. NEVER Use Native Nested Calls Over F.pipe

```typescript
// FORBIDDEN - Nested function calls
const result = Str.toUpperCase(Str.trim(Str.slice(input, 0, 10)));

// REQUIRED - F.pipe for readability
const result = F.pipe(
  input,
  Str.slice(0, 10),
  Str.trim,
  Str.toUpperCase
);
```

### 2. NEVER Use Native Method Chaining

```typescript
// FORBIDDEN - Native chaining
const ids = items.map(i => i.id).filter(id => id != null);

// REQUIRED - F.pipe with Effect utilities
const ids = F.pipe(
  items,
  A.map(i => i.id),
  A.filter(O.isSome)
);
```

### 3. NEVER Use F.flow for Single-Use Pipelines

```typescript
// FORBIDDEN - Overkill for one-off transform
const result = F.flow(
  Str.trim,
  Str.toLowerCase
)(input);

// REQUIRED - Use F.pipe for single-use
const result = F.pipe(
  input,
  Str.trim,
  Str.toLowerCase
);
```

### 4. NEVER Misuse F.compose (Right-to-Left)

`F.compose` evaluates right-to-left, which is counterintuitive. Prefer `F.pipe` or `F.flow`:

```typescript
// AVOID - Counterintuitive order
const transform = F.compose(toUpperCase, trim);
transform("  hello  ");  // Executes: trim first, then toUpperCase

// REQUIRED - Use F.flow (left-to-right)
const transform = F.flow(trim, toUpperCase);
transform("  hello  ");  // Executes: trim first, then toUpperCase
```

### 5. NEVER Create Unnamed F.dual Functions

```typescript
// FORBIDDEN - Anonymous dual (hard to debug)
const fn = F.dual(2, (a, b) => a + b);

// REQUIRED - Named function
export const add: {
  (b: number): (a: number) => number;
  (a: number, b: number): number;
} = F.dual(2, (a: number, b: number): number => a + b);
```

## Related Modules

- [Effect.md](./Effect.md) - Effect operations using `F.pipe`
- [Array.md](./Array.md) - Array operations composed with `F.pipe`
- [String.md](./String.md) - String operations composed with `F.pipe`
- [Option.md](./Option.md) - Option utilities with function composition
- `documentation/EFFECT_PATTERNS.md` - Full pattern reference

## Source Reference

[.repos/effect/packages/effect/src/Function.ts](../../.repos/effect/packages/effect/src/Function.ts)
