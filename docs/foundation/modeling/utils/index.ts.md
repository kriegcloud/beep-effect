---
title: index.ts
nav_order: 12
parent: "@beep/utils"
---

## index.ts overview

export of effect/Function's dual helper for data first + data last strategies

Since v0.0.0

---
## Exports Grouped by Category
- [utilities](#utilities)
  - ["./GlobalValue.ts" (namespace export)](#globalvaluets-namespace-export)
  - ["./Random.ts" (namespace export)](#randomts-namespace-export)
  - ["./thunk.ts" (namespace export)](#thunkts-namespace-export)
  - [A (namespace export)](#a-namespace-export)
  - [Bool (namespace export)](#bool-namespace-export)
  - [DateTime (namespace export)](#datetime-namespace-export)
  - [Eq (namespace export)](#eq-namespace-export)
  - [Err (namespace export)](#err-namespace-export)
  - [FileSystem (namespace export)](#filesystem-namespace-export)
  - [Html (namespace export)](#html-namespace-export)
  - [N (namespace export)](#n-namespace-export)
  - [O (namespace export)](#o-namespace-export)
  - [P (namespace export)](#p-namespace-export)
  - [Str (namespace export)](#str-namespace-export)
  - [Stream (namespace export)](#stream-namespace-export)
  - [Struct (namespace export)](#struct-namespace-export)
  - [Text (namespace export)](#text-namespace-export)
  - [Utils (namespace export)](#utils-namespace-export)
  - [dual](#dual)
---

# utilities

## "./GlobalValue.ts" (namespace export)

Re-exports all named exports from the "./GlobalValue.ts" module.

**Signature**

```ts
export * from "./GlobalValue.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/index.ts#L119)

Since v0.0.0

## "./Random.ts" (namespace export)

Re-exports all named exports from the "./Random.ts" module.

**Example**

```ts
import { RandomValues } from "@beep/utils"

console.log(RandomValues.Default)
```

**Signature**

```ts
export * from "./Random.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/index.ts#L193)

Since v0.0.0

## "./thunk.ts" (namespace export)

Re-exports all named exports from the "./thunk.ts" module.

**Example**

```ts
import { thunkTrue } from "@beep/utils"

const value = thunkTrue()
console.log(value)
```

**Signature**

```ts
export * from "./thunk.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/index.ts#L267)

Since v0.0.0

## A (namespace export)

Re-exports all named exports from the "./Array.ts" module as `A`.

**Example**

```ts
import { A } from "@beep/utils"

const values = A.makeReadonly("beep")
console.log(values)
```

**Signature**

```ts
export * as A from "./Array.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/index.ts#L29)

Since v0.0.0

## Bool (namespace export)

Re-exports all named exports from the "./Bool.ts" module as `Bool`.

**Example**

```ts
import { Bool } from "@beep/utils"

console.log(Bool)
```

**Signature**

```ts
export * as Bool from "./Bool.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/index.ts#L43)

Since v0.0.0

## DateTime (namespace export)

Re-exports all named exports from the "./DateTime.ts" module as `DateTime`.

**Example**

```ts
import { DateTime } from "@beep/utils"

console.log(DateTime)
```

**Signature**

```ts
export * as DateTime from "./DateTime.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/index.ts#L57)

Since v0.0.0

## Eq (namespace export)

Re-exports all named exports from the "./Equal.ts" module as `Eq`.

**Example**

```ts
import { Eq } from "@beep/utils"

const equals = Eq.equals(42)(42)
console.log(equals)
```

**Signature**

```ts
export * as Eq from "./Equal.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/index.ts#L72)

Since v0.0.0

## Err (namespace export)

Re-exports all named exports from the "./Errors.ts" module as `Err`.

**Example**

```ts
import { Err } from "@beep/utils"
import { Effect } from "effect"

class MyError {
  readonly message: string

  constructor(message: string) {
    this.message = message
  }
}

const mapMyError = Err.mapToError((message: string) => new MyError(message))
const error = Effect.runSync(Effect.flip(mapMyError(Effect.fail("raw"), "Mapped failure.")))

console.log(error.message)
```

**Signature**

```ts
export * as Err from "./Errors.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/index.ts#L98)

Since v0.0.0

## FileSystem (namespace export)

Re-exports all named exports from the "./FileSystem.ts" module as `FileSystem`.

**Example**

```ts
import { FileSystem } from "@beep/utils"

console.log(FileSystem)
```

**Signature**

```ts
export * as FileSystem from "./FileSystem.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/index.ts#L112)

Since v0.0.0

## Html (namespace export)

Re-exports all named exports from the "./Html.ts" module as `Html`.

**Example**

```ts
import { Html } from "@beep/utils"

const escaped = Html.escapeHtml("<strong>beep</strong>")
console.log(escaped)
```

**Signature**

```ts
export * as Html from "./Html.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/index.ts#L134)

Since v0.0.0

## N (namespace export)

Re-exports all named exports from the "./Number.ts" module as `N`.

**Example**

```ts
import { N } from "@beep/utils"

const whole = N.isInteger(42)
console.log(whole)
```

**Signature**

```ts
export * as N from "./Number.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/index.ts#L149)

Since v0.0.0

## O (namespace export)

Re-exports all named exports from the "./Option.ts" module as `O`.

**Example**

```ts
import { O } from "@beep/utils"

const value = O.some("beep")
console.log(value)
```

**Signature**

```ts
export * as O from "./Option.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/index.ts#L164)

Since v0.0.0

## P (namespace export)

Re-exports all named exports from the "./Predicate.ts" module as `P`.

**Example**

```ts
import { P } from "@beep/utils"

const object = P.isObject({ ok: true })
console.log(object)
```

**Signature**

```ts
export * as P from "./Predicate.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/index.ts#L179)

Since v0.0.0

## Str (namespace export)

Re-exports all named exports from the "./Str.ts" module as `Str`.

**Example**

```ts
import { Str } from "@beep/utils"

const slug = Str.toSlug("Hello, Beep Effect!")
console.log(slug)
```

**Signature**

```ts
export * as Str from "./Str.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/index.ts#L208)

Since v0.0.0

## Stream (namespace export)

Re-exports all named exports from the "./Stream.ts" module as `Stream`.

**Example**

```ts
import { Stream } from "@beep/utils"

console.log(Stream)
```

**Signature**

```ts
export * as Stream from "./Stream.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/index.ts#L222)

Since v0.0.0

## Struct (namespace export)

Re-exports all named exports from the "./Struct.ts" module as `Struct`.

**Example**

```ts
import { Struct } from "@beep/utils"

const keys = Struct.keys({ id: 1, name: "Ada" })
console.log(keys)
```

**Signature**

```ts
export * as Struct from "./Struct.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/index.ts#L237)

Since v0.0.0

## Text (namespace export)

Re-exports all named exports from the "./Text.ts" module as `Text`.

**Example**

```ts
import { Text } from "@beep/utils"

const text = Text.joinLines(["alpha", "beta"])
console.log(text)
```

**Signature**

```ts
export * as Text from "./Text.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/index.ts#L252)

Since v0.0.0

## Utils (namespace export)

Re-exports all named exports from the "./Utils.ts" module as `Utils`.

**Signature**

```ts
export * as Utils from "./Utils.ts"
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/index.ts#L274)

Since v0.0.0

## dual

export of effect/Function's dual helper for data first + data last strategies

**Signature**

```ts
declare const dual: { <DataLast extends (...args: Array<any>) => any, DataFirst extends (...args: Array<any>) => any>(arity: Parameters<DataFirst>["length"], body: DataFirst): DataLast & DataFirst; <DataLast extends (...args: Array<any>) => any, DataFirst extends (...args: Array<any>) => any>(isDataFirst: (args: IArguments) => boolean, body: DataFirst): DataLast & DataFirst; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/index.ts#L14)

Since v0.0.0