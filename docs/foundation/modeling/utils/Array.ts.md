---
title: Array.ts
nav_order: 1
parent: "@beep/utils"
---

## Array.ts overview

Helpers for non-empty array invariants and Effect array interop.

Since v0.0.0

---
## Exports Grouped by Category
- [combinators](#combinators)
  - [flatMapNonEmpty](#flatmapnonempty)
  - [flatMapNonEmptyReadonly](#flatmapnonemptyreadonly)
  - [mapNonEmpty](#mapnonempty)
  - [mapNonEmptyReadonly](#mapnonemptyreadonly)
- [constructors](#constructors)
  - [fromIterableNonEmpty](#fromiterablenonempty)
  - [makeReadonly](#makereadonly)
- [elements](#elements)
  - [indexOf](#indexof)
  - [lastIndexOf](#lastindexof)
- [getters](#getters)
  - [entries](#entries)
  - [keys](#keys)
  - [slice](#slice)
  - [values](#values)
- [guards](#guards)
  - [assertNonEmptyArray](#assertnonemptyarray)
  - [assertNonEmptyReadonlyArray](#assertnonemptyreadonlyarray)
- [predicates](#predicates)
  - [matchToBoolean](#matchtoboolean)
- [utilities](#utilities)
  - ["effect/Array" (namespace export)](#effectarray-namespace-export)
  - [appendAllInPlace](#appendallinplace)
  - [appendInPlace](#appendinplace)
  - [sortInPlace](#sortinplace)
  - [spliceInPlace](#spliceinplace)
---

# combinators

## flatMapNonEmpty

Like `Array.flatMap` but asserts the result as `NonEmptyArray`.

Safe because flat-mapping non-empty input with a function returning
non-empty arrays always produces a non-empty output.
Supports both data-first and data-last calling conventions.

**Example**

```ts
import { pipe } from "effect"
import { A } from "@beep/utils"

const items: A.NonEmptyReadonlyArray<number> = [1, 2, 3]

// Data-first
const expanded = A.flatMapNonEmpty(items, (n): A.NonEmptyReadonlyArray<number> => [n, n * 10])

// Data-last (pipeable)
const doubled = pipe(items, A.flatMapNonEmpty((n): A.NonEmptyReadonlyArray<number> => [n, n]))

console.log(expanded)
console.log(doubled)
```

**Signature**

```ts
declare const flatMapNonEmpty: { <T, U>(f: (a: T, i: number) => A.NonEmptyReadonlyArray<U>): (self: A.NonEmptyReadonlyArray<T>) => A.NonEmptyArray<U>; <T, U>(self: A.NonEmptyReadonlyArray<T>, f: (a: T, i: number) => A.NonEmptyReadonlyArray<U>): A.NonEmptyArray<U>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Array.ts#L165)

Since v0.0.0

## flatMapNonEmptyReadonly

Like `Array.flatMap` but asserts the result as `NonEmptyReadonlyArray`.

Safe because flat-mapping non-empty input with a function returning
non-empty arrays always produces a non-empty output.
Supports both data-first and data-last calling conventions.

**Example**

```ts
import { pipe } from "effect"
import { A } from "@beep/utils"

const items: A.NonEmptyReadonlyArray<string> = ["hi", "bye"]

// Data-first
const expanded = A.flatMapNonEmptyReadonly(
  items,
  (item): A.NonEmptyReadonlyArray<string> => [item, item.toUpperCase()]
)

// Data-last (pipeable)
const doubled = pipe(
  items,
  A.flatMapNonEmptyReadonly((item): A.NonEmptyReadonlyArray<string> => [item, item])
)

console.log(expanded)
console.log(doubled)
```

**Signature**

```ts
declare const flatMapNonEmptyReadonly: { <T, U>(f: (a: T, i: number) => A.NonEmptyReadonlyArray<U>): (self: A.NonEmptyReadonlyArray<T>) => A.NonEmptyReadonlyArray<U>; <T, U>(self: A.NonEmptyReadonlyArray<T>, f: (a: T, i: number) => A.NonEmptyReadonlyArray<U>): A.NonEmptyReadonlyArray<U>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Array.ts#L245)

Since v0.0.0

## mapNonEmpty

Like `Array.map` but asserts the result as `NonEmptyArray`.

Safe because mapping a non-empty input always produces a non-empty output.
Supports both data-first and data-last calling conventions.

**Example**

```ts
import { pipe } from "effect"
import { A } from "@beep/utils"

const items: A.NonEmptyReadonlyArray<number> = [1, 2, 3]

// Data-first
const doubled = A.mapNonEmpty(items, (n) => n * 2)

// Data-last (pipeable)
const tripled = pipe(items, A.mapNonEmpty((n) => n * 3))

console.log(doubled)
console.log(tripled)
```

**Signature**

```ts
declare const mapNonEmpty: { <T, U>(f: (a: T, i: number) => U): (self: A.NonEmptyReadonlyArray<T>) => A.NonEmptyArray<U>; <T, U>(self: A.NonEmptyReadonlyArray<T>, f: (a: T, i: number) => U): A.NonEmptyArray<U>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Array.ts#L129)

Since v0.0.0

## mapNonEmptyReadonly

Like `Array.map` but asserts the result as `NonEmptyReadonlyArray`.

Safe because mapping a non-empty input always produces a non-empty output.
Supports both data-first and data-last calling conventions.

**Example**

```ts
import { pipe } from "effect"
import { A } from "@beep/utils"

const items: A.NonEmptyReadonlyArray<string> = ["a", "b", "c"]

// Data-first
const upper = A.mapNonEmptyReadonly(items, (s) => s.toUpperCase())

// Data-last (pipeable)
const prefixed = pipe(items, A.mapNonEmptyReadonly((s) => `item-${s}`))

console.log(upper)
console.log(prefixed)
```

**Signature**

```ts
declare const mapNonEmptyReadonly: { <T, U>(f: (a: T, i: number) => U): (self: A.NonEmptyReadonlyArray<T>) => A.NonEmptyReadonlyArray<U>; <T, U>(self: A.NonEmptyReadonlyArray<T>, f: (a: T, i: number) => U): A.NonEmptyReadonlyArray<U>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Array.ts#L203)

Since v0.0.0

# constructors

## fromIterableNonEmpty

Converts an iterable into a `NonEmptyReadonlyArray`, asserting that at
least one element is present.

Throws if the iterable yields zero elements.

**Example**

```ts
import { A } from "@beep/utils"

const fromSet = A.fromIterableNonEmpty(new Set([1, 2, 3]))
// [1, 2, 3] narrowed to NonEmptyReadonlyArray<number>

console.log(fromSet)
```

**Signature**

```ts
declare const fromIterableNonEmpty: <const TArray>(collection: Iterable<TArray>) => A.NonEmptyReadonlyArray<TArray>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Array.ts#L575)

Since v0.0.0

## makeReadonly

Normalizes a value-or-array into a `ReadonlyArray`.

If the input is already an array it is returned as-is; otherwise it is
wrapped in a single-element array via `Array.of`.

**Example**

```ts
import { A } from "@beep/utils"

const single = A.makeReadonly("hello")
// ["hello"]

const multi = A.makeReadonly(["a", "b"])
// ["a", "b"]

console.log(single)
console.log(multi)
```

**Signature**

```ts
declare const makeReadonly: <T>(a: T | Array<T>) => ReadonlyArray<T>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Array.ts#L555)

Since v0.0.0

# elements

## indexOf

Finds the first index where `value` appears in `self`.

Returns `Option.none()` when the value is absent instead of leaking the
native `-1` sentinel.

**Example**

```ts
import { pipe } from "effect"
import { A, O } from "@beep/utils"

const index = pipe(["alpha", "beta"], A.indexOf("beta"))
console.log(O.getOrUndefined(index))
```

**Signature**

```ts
declare const indexOf: { <T>(value: T, fromIndex?: number): (self: ReadonlyArray<T>) => O.Option<number>; <T>(self: ReadonlyArray<T>, value: T, fromIndex?: number): O.Option<number>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Array.ts#L279)

Since v0.0.0

## lastIndexOf

Finds the last index where `value` appears in `self`.

Returns `Option.none()` when the value is absent instead of leaking the
native `-1` sentinel.

**Example**

```ts
import { pipe } from "effect"
import { A, O } from "@beep/utils"

const index = pipe(["a", "b", "a"], A.lastIndexOf("a"))
console.log(O.getOrUndefined(index))
```

**Signature**

```ts
declare const lastIndexOf: { <T>(value: T, fromIndex?: number): (self: ReadonlyArray<T>) => O.Option<number>; <T>(self: ReadonlyArray<T>, value: T, fromIndex?: number): O.Option<number>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Array.ts#L308)

Since v0.0.0

# getters

## entries

Materializes array entries as readonly `[index, value]` pairs.

**Example**

```ts
import { A } from "@beep/utils"

const entries = A.entries(["x", "y"])
console.log(entries)
```

**Signature**

```ts
declare const entries: <T>(self: ReadonlyArray<T>) => Array<readonly [number, T]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Array.ts#L359)

Since v0.0.0

## keys

Materializes the numeric indexes of `self`.

**Example**

```ts
import { A } from "@beep/utils"

const indexes = A.keys(["x", "y"])
console.log(indexes)
```

**Signature**

```ts
declare const keys: (self: ReadonlyArray<unknown>) => Array<number>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Array.ts#L376)

Since v0.0.0

## slice

Returns an immutable copy of the selected range from `self`.

This central wrapper preserves native `slice` range semantics while keeping
consumers on the Effect-first `A` helper surface.

**Example**

```ts
import { pipe } from "effect"
import { A } from "@beep/utils"

const middle = pipe([1, 2, 3, 4], A.slice(1, 3))
console.log(middle)
```

**Signature**

```ts
declare const slice: { (start?: number, end?: number): <T>(self: ReadonlyArray<T>) => Array<T>; <T>(self: ReadonlyArray<T>, start?: number, end?: number): Array<T>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Array.ts#L337)

Since v0.0.0

## values

Returns a shallow immutable copy of the values in `self`.

**Example**

```ts
import { A } from "@beep/utils"

const values = A.values(["x", "y"])
console.log(values)
```

**Signature**

```ts
declare const values: <T>(self: ReadonlyArray<T>) => Array<T>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Array.ts#L392)

Since v0.0.0

# guards

## assertNonEmptyArray

Asserts that `input` is a mutable non-empty array, throwing on failure.

Uses `Schema.asserts` under the hood so the error includes full decode
context when the assertion fails.

**Example**

```ts
import { A } from "@beep/utils"

const items: unknown = [1, 2, 3]
A.assertNonEmptyArray(items)
// items is now narrowed to NonEmptyArray<unknown>
```

**Signature**

```ts
declare const assertNonEmptyArray: (input: unknown) => asserts input is A.NonEmptyArray<TUnsafe.Any>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Array.ts#L66)

Since v0.0.0

## assertNonEmptyReadonlyArray

Asserts that `input` is a readonly non-empty array, throwing on failure.

Uses `Schema.asserts` under the hood so the error includes full decode
context when the assertion fails.

**Example**

```ts
import { A } from "@beep/utils"

const items: unknown = ["a", "b"]
A.assertNonEmptyReadonlyArray(items)
// items is now narrowed to NonEmptyReadonlyArray<unknown>
```

**Signature**

```ts
declare const assertNonEmptyReadonlyArray: (input: unknown) => asserts input is A.NonEmptyReadonlyArray<TUnsafe.Any>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Array.ts#L87)

Since v0.0.0

# predicates

## matchToBoolean

Returns `true` when the array is non-empty, `false` otherwise.

A thin wrapper around `Array.match` that collapses a readonly array into a
boolean without inspecting its elements.

**Example**

```ts
import { A } from "@beep/utils"

const hasItems = A.matchToBoolean([1, 2, 3])
// true

const empty = A.matchToBoolean([])
// false

console.log(hasItems)
console.log(empty)
```

**Signature**

```ts
declare const matchToBoolean: (self: ReadonlyArray<unknown>) => boolean
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Array.ts#L39)

Since v0.0.0

# utilities

## "effect/Array" (namespace export)

Re-exports all named exports from the "effect/Array" module.

**Example**

```ts
import { A } from "@beep/utils"

const values = A.makeReadonly("beep")
console.log(values)
```

**Signature**

```ts
export * from "effect/Array"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Array.ts#L530)

Since v0.0.0

## appendAllInPlace

Appends all `values` to a mutable array and returns the same array reference.

Use this only when mutation identity is intentional. Pure code should prefer
`A.appendAll`.

**Example**

```ts
import { A } from "@beep/utils"

const values = ["a"]
A.appendAllInPlace(values, ["b", "c"])

console.log(values)
```

**Signature**

```ts
declare const appendAllInPlace: { <T>(values: Iterable<T>): (self: Array<T>) => Array<T>; <T>(self: Array<T>, values: Iterable<T>): Array<T>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Array.ts#L442)

Since v0.0.0

## appendInPlace

Appends `value` to a mutable array and returns the same array reference.

Use this only at mutation-preserving boundaries such as local accumulators,
queue state, or adapter APIs where replacing the array identity would change
behavior. Pure code should prefer `A.append`.

**Example**

```ts
import { A } from "@beep/utils"

const values = [1, 2]
const same = A.appendInPlace(values, 3)

console.log(same === values)
console.log(values)
```

**Signature**

```ts
declare const appendInPlace: { <T>(value: T): (self: Array<T>) => Array<T>; <T>(self: Array<T>, value: T): Array<T>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Array.ts#L415)

Since v0.0.0

## sortInPlace

Sorts a mutable array in place using an explicit `Order`.

Prefer pure `A.sort` unless callers intentionally rely on the same array
reference being reordered.

**Example**

```ts
import { A } from "@beep/utils"
import * as Order from "effect/Order"

const values = [3, 1, 2]
const same = A.sortInPlace(values, Order.Number)

console.log(same === values)
console.log(values)
```

**Signature**

```ts
declare const sortInPlace: { <T>(order: Order.Order<T>): (self: Array<T>) => Array<T>; <T>(self: Array<T>, order: Order.Order<T>): Array<T>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Array.ts#L473)

Since v0.0.0

## spliceInPlace

Removes and inserts items in a mutable array and returns the removed values.

This intentionally mirrors native `splice` return semantics while keeping
mutation explicit and centralized. Prefer immutable composition with
`A.remove`, `A.insertAt`, `A.appendAll`, and `A.slice` when identity is not
required.

**Example**

```ts
import { A } from "@beep/utils"

const values = ["a", "b", "c"]
const removed = A.spliceInPlace(values, 1, 1, "x")

console.log(removed)
console.log(values)
```

**Signature**

```ts
declare const spliceInPlace: { <T>(start: number, deleteCount?: number, ...items: Array<T>): (self: Array<T>) => Array<T>; <T>(self: Array<T>, start: number, deleteCount?: number, ...items: Array<T>): Array<T>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/Array.ts#L503)

Since v0.0.0