---
title: Function.ts
nav_order: 8
parent: "@beep/utils"
---

## Function.ts overview

Re-export the standard Effect function helpers.

**Example**

```ts
import { pipe } from "@beep/utils/Function"

const doubled = pipe(2, (value) => value * 2)

console.log(doubled)
```

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [curry](#curry)
  - [reverseCurry](#reversecurry)
  - [tupledCurry](#tupledcurry)
  - [uncurry](#uncurry)
- [constructors](#constructors)
  - [lazy](#lazy)
  - [tuple](#tuple)
- [interop](#interop)
  - ["effect/Function" (namespace export)](#effectfunction-namespace-export)
---

# combinators

## curry

Convert a two-argument function into a curried function.

**Example**

```ts
import { curry } from "@beep/utils/Function"

const join = (left: string, right: string) => `${left}:${right}`
const result = curry(join)("beep")("effect")

console.log(result)
```

**Signature**

```ts
declare const curry: <A, B, C>(fn: (a: A, b: B) => C) => (a: A) => (b: B) => C
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Function.ts#L137)

Since v0.0.0

## reverseCurry

Reverse the argument order of a two-argument curried function.

**Example**

```ts
import { reverseCurry } from "@beep/utils/Function"

const append = (suffix: string) => (value: string) => `${value}${suffix}`
const appendTo = reverseCurry(append)
const result = appendTo("beep")("-effect")

console.log(result)
```

**Signature**

```ts
declare const reverseCurry: <A, B, C>(fn: (b: B) => (a: A) => C) => (a: A) => (b: B) => C
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Function.ts#L112)

Since v0.0.0

## tupledCurry

Convert a curried two-argument function into a tuple-consuming function.

**Example**

```ts
import { tupledCurry } from "@beep/utils/Function"

const join = (left: string) => (right: string) => `${left}:${right}`
const joinTuple = tupledCurry(join)
const result = joinTuple(["beep", "effect"])

console.log(result)
```

**Signature**

```ts
declare const tupledCurry: <A, B, C>(fn: (a: A) => (b: B) => C) => (arg0: [A, B]) => C
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Function.ts#L86)

Since v0.0.0

## uncurry

Convert a curried two-argument function into an uncurried function.

**Example**

```ts
import { uncurry } from "@beep/utils/Function"

const join = (left: string) => (right: string) => `${left}:${right}`
const result = uncurry(join)("beep", "effect")

console.log(result)
```

**Signature**

```ts
declare const uncurry: <A, B, C>(fn: (a: A) => (b: B) => C) => (arg0: A, arg1: B) => C
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Function.ts#L162)

Since v0.0.0

# constructors

## lazy

Memoize a nullary function and return the cached result after the first call.

**Example**

```ts
import { lazy } from "@beep/utils/Function"

let calls = 0
const readOnce = lazy(() => {
  calls += 1
  return calls
})

const first = readOnce()
const second = readOnce()

console.log(first)
console.log(second)
```

**Signature**

```ts
declare const lazy: <A>(fn: () => A) => () => A
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Function.ts#L192)

Since v0.0.0

## tuple

Construct a readonly tuple from the provided elements.

**Example**

```ts
import { tuple } from "@beep/utils/Function"

const pair = tuple("id", 123)
const first = pair[0]
const second = pair[1]

console.log(first)
console.log(second)
```

**Signature**

```ts
declare const tuple: <const T extends ReadonlyArray<unknown>>(...elements: T) => Readonly<T>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Function.ts#L60)

Since v0.0.0

# interop

## "effect/Function" (namespace export)

Re-exports all named exports from the "effect/Function" module.

**Example**

```ts
import { pipe } from "@beep/utils/Function"

const doubled = pipe(2, (value) => value * 2)

console.log(doubled)
```

**Signature**

```ts
export * from "effect/Function"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Function.ts#L37)

Since v0.0.0