---
name: effect-data
description: >
  Replacing native Array, Object, String, and Number methods with Effect modules.
  Trigger on: data transformation, collection operations, array/object manipulation,
  string processing, pipe/flow composition.
version: 0.1.0
status: active
---

# Data Transformation with Effect Modules

## Core Rule

NEVER call methods on native objects. Effect re-exports every collection/primitive operation as a pipeable function.

| Native | Effect Module | Import |
|--------|--------------|--------|
| `[].map()`, `[].filter()`, `[].reduce()` | `effect/Array` | `import * as A from "effect/Array"` |
| `Object.keys()`, `Object.entries()` | `effect/Record` | `import * as R from "effect/Record"` |
| `"".split()`, `"".trim()` | `effect/String` | `import * as Str from "effect/String"` |
| `Date.now()` | `effect/DateTime` or `effect/Clock` | Use `Clock` service for testability |
| `Math.random()` | `effect/Random` | Use `Random` service for testability |
| `typeof x === "string"` | `effect/Predicate` | `import * as P from "effect/Predicate"` |

## Array Operations

```ts
import { pipe } from "effect"
import * as A from "effect/Array"
import * as O from "effect/Option"

// NEVER: users.filter(u => u.active).map(u => u.name)
// WHY: Effect's Array module returns readonly arrays and composes with pipe.
const activeNames = pipe(
  users,
  A.filter((u) => u.active),
  A.map((u) => u.name)
)

// NEVER: users.find(u => u.id === id)  (returns T | undefined)
// WHY: A.findFirst returns Option<T> — no null leak.
const found: O.Option<User> = pipe(
  users,
  A.findFirst((u) => u.id === id)
)

// filterMap: filter + map in one pass (return None to drop, Some to keep+transform)
const validEmails = pipe(
  users,
  A.filterMap((u) => u.email ? O.some(u.email) : O.none())
)

// groupBy: produces Record<string, NonEmptyArray<T>>
const byRole = pipe(users, A.groupBy((u) => u.role))
```

## Record (Object) Operations

```ts
import * as R from "effect/Record"

// NEVER: Object.keys(config)
const keys = R.keys(config)

// NEVER: Object.entries(config).map(...)
const mapped = pipe(
  config,
  R.map((value, key) => transform(value))
)

// Safe lookup returns Option, not undefined
// NEVER: config[key] (may be undefined)
const value: O.Option<string> = R.get(config, key)
```

## String Operations

```ts
import * as Str from "effect/String"
import { pipe } from "effect"

// WHY: Str functions are pipeable and composable.
const slug = pipe(
  rawTitle,
  Str.trim,
  Str.toLowerCase,
  Str.replace(/ +/g, "-")
)

// Type guards
Str.isNonEmpty(s)  // narrows to NonEmpty
Str.isEmpty(s)     // narrows to ""
```

## Predicate (Type Guards)

```ts
import * as P from "effect/Predicate"

// NEVER: typeof x === "string"
P.isString(x)   // x is string
P.isNumber(x)   // x is number
P.isObject(x)   // x is object (not null)

// Compose guards
const isActiveUser = P.struct({
  active: P.isBoolean,
  name: P.isString
})
```

## Pipe and Flow

```ts
import { pipe, flow } from "effect"

// pipe: value-first, immediate execution
const result = pipe(input, step1, step2, step3)

// flow: point-free function composition (no initial value)
const transform = flow(step1, step2, step3)
// later: transform(input)
```

## Verify

1. Grep for `.map(`, `.filter(`, `.reduce(`, `.find(` on arrays — all should be `A.map`, `A.filter`, etc.
2. Grep for `Object.keys`, `Object.entries`, `Object.values` — all should be `R.keys`, `R.entries`, `R.values`.
3. Grep for `typeof ` — all should be `P.isString`, `P.isNumber`, etc.
4. No `Date.now()` or `Math.random()` — use `Clock` and `Random` services.
