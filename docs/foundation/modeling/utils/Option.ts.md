---
title: Option.ts
nav_order: 15
parent: "@beep/utils"
---

## Option.ts overview

Extended Option utilities built on `effect/Option`.

Since v0.0.0

---
## Exports Grouped by Category
- [filtering](#filtering)
  - [getSomesStruct](#getsomesstruct)
- [getters](#getters)
  - [propFromNullishOr](#propfromnullishor)
- [utilities](#utilities)
  - ["effect/Option" (namespace export)](#effectoption-namespace-export)
---

# filtering

## getSomesStruct

Compact a struct of `Option` values into an object containing only `Some`
fields.

This mirrors `Record.getSomes` at runtime while preserving heterogeneous
per-key value types for object-constructor payloads.

**Example**

```ts
import { O } from "@beep/utils"

const props = O.getSomesStruct({
  id: O.some(1),
  name: O.none<string>(),
})

console.log(props)
// { id: 1 }
```

**Signature**

```ts
declare const getSomesStruct: <const Self extends OptionStruct>(self: Self) => GetSomesStruct<Self>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Option.ts#L102)

Since v0.0.0

# getters

## propFromNullishOr

Retrieves a value from a struct by path and converts missing or nullish
results into an `Option`.

Mirrors `Struct.dotGet` path validation and tuple path support, then
applies `Option.fromNullishOr` to the retrieved value.

Supports a dual API:
- Data-last: `pipe(person, O.propFromNullishOr("age"))`
- Data-first: `O.propFromNullishOr(person, "age")`
- Tuple paths: `O.propFromNullishOr(person, ["profile", "age"] as const)`

**Example**

```ts
import { pipe } from "effect"
import { O } from "@beep/utils"

const user: { readonly name: string; readonly age: number | null } = {
  name: "Alice",
  age: null,
}

// Data-first -- nullish becomes none
const age = O.propFromNullishOr(user, "age")
// Option.none()

// Data-last (pipeable)
const name = pipe(user, O.propFromNullishOr("name"))
// Option.some("Alice")

console.log(age)
console.log(name)
```

**Signature**

```ts
declare const propFromNullishOr: { <const P extends string>(path: P): <S extends object>(self: P extends Paths<S> ? S : never) => O.Option<NonNullable<Get<S, P>>>; <const P extends ReadonlyArray<string>>(path: P): <S extends object>(self: S) => O.Option<NonNullable<Get<S, P>>>; <S extends object, const P extends string & Paths<S>>(self: S, path: P): O.Option<NonNullable<Get<S, P>>>; <S extends object, const P extends ReadonlyArray<string>>(self: S, path: P): O.Option<NonNullable<Get<S, P>>>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Option.ts#L60)

Since v0.0.0

# utilities

## "effect/Option" (namespace export)

Re-exports all named exports from the "effect/Option" module.

**Example**

```ts
import * as O from "@beep/utils/Option"

const value = O.some("beep")
console.log(value)
```

**Signature**

```ts
export * from "effect/Option"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Option.ts#L119)

Since v0.0.0