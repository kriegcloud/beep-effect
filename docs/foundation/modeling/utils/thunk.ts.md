---
title: thunk.ts
nav_order: 22
parent: "@beep/utils"
---

## thunk.ts overview

A module containing utilities which return thunks of data

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [thunk](#thunk)
  - [thunkEffect](#thunkeffect)
  - [thunkEffectSucceed](#thunkeffectsucceed)
  - [thunkEffectSucceedNone](#thunkeffectsucceednone)
  - [thunkEmptyArray](#thunkemptyarray)
  - [thunkEmptyReadonlyArray](#thunkemptyreadonlyarray)
  - [thunkEmptyRecord](#thunkemptyrecord)
  - [thunkResultFailVoid](#thunkresultfailvoid)
  - [thunkSome](#thunksome)
  - [thunkSomeEmptyArray](#thunksomeemptyarray)
  - [thunkSomeEmptyRecord](#thunksomeemptyrecord)
  - [thunkSomeNone](#thunksomenone)
- [utilities](#utilities)
  - [thunk0](#thunk0)
  - [thunk1](#thunk1)
  - [thunkEffectSucceedNull](#thunkeffectsucceednull)
  - [thunkEffectVoid](#thunkeffectvoid)
  - [thunkEmptyStr](#thunkemptystr)
  - [thunkFalse](#thunkfalse)
  - [thunkNegative1](#thunknegative1)
  - [thunkNull](#thunknull)
  - [thunkSomeEmptyStr](#thunksomeemptystr)
  - [thunkSomeFalse](#thunksomefalse)
  - [thunkSomeTrue](#thunksometrue)
  - [thunkTrue](#thunktrue)
  - [thunkUndefined](#thunkundefined)
  - [thunkVoid](#thunkvoid)
---

# constructors

## thunk

Creates a thunk that always returns the provided value.

**Example**

```ts
import { thunk } from "@beep/utils/thunk"

const getFortyTwo = thunk(42)
const value = getFortyTwo()
// 42

console.log(value)
```

**Signature**

```ts
declare const thunk: <A>(value: A) => LazyArg<A>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L31)

Since v0.0.0

## thunkEffect

Lifts an Effect value into a thunk that returns it unchanged.

**Example**

```ts
import { Effect } from "effect"
import { thunkEffect } from "@beep/utils/thunk"

const getEffect = thunkEffect(Effect.succeed(42))
const eff = getEffect()

console.log(eff)
```

**Signature**

```ts
declare const thunkEffect: <T>(effect: T) => LazyArg<T>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L235)

Since v0.0.0

## thunkEffectSucceed

Creates a thunk that returns `Effect.succeed(a)`.

**Example**

```ts
import { thunkEffectSucceed } from "@beep/utils/thunk"

const getEffect = thunkEffectSucceed("hello")
const eff = getEffect()

console.log(eff)
```

**Signature**

```ts
declare const thunkEffectSucceed: <A>(a: A) => LazyArg<Effect.Effect<A, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L274)

Since v0.0.0

## thunkEffectSucceedNone

Returns `Effect.succeed(Option.none())`.

**Example**

```ts
import { thunkEffectSucceedNone } from "@beep/utils/thunk"

const eff = thunkEffectSucceedNone<string>()

console.log(eff)
```

**Signature**

```ts
declare const thunkEffectSucceedNone: <A = never>(..._: ReadonlyArray<unknown>) => Effect.Effect<O.Option<A>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L310)

Since v0.0.0

## thunkEmptyArray

Returns a thunk that yields a fresh empty mutable array on each call.

**Example**

```ts
import { thunkEmptyArray } from "@beep/utils/thunk"

const getArr = thunkEmptyArray<number>()
const arr = getArr()
// []

console.log(arr)
```

**Signature**

```ts
declare const thunkEmptyArray: <A = never>() => LazyArg<Array<A>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L197)

Since v0.0.0

## thunkEmptyReadonlyArray

Returns a thunk that yields a fresh empty readonly array on each call.

**Example**

```ts
import { thunkEmptyReadonlyArray } from "@beep/utils/thunk"

const getArr = thunkEmptyReadonlyArray<string>()
const arr = getArr()
// []

console.log(arr)
```

**Signature**

```ts
declare const thunkEmptyReadonlyArray: <A = never>() => LazyArg<ReadonlyArray<A>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L216)

Since v0.0.0

## thunkEmptyRecord

Returns a thunk that yields an empty record.

**Example**

```ts
import { thunkEmptyRecord } from "@beep/utils/thunk"

const rec = thunkEmptyRecord<string, number>()

console.log(rec)
```

**Signature**

```ts
declare const thunkEmptyRecord: <K extends string | symbol = never, V = never>() => Record<R.ReadonlyRecord.NonLiteralKey<K>, V>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L327)

Since v0.0.0

## thunkResultFailVoid

Returns a thunk yielding `Result.failVoid`.

Useful for representing an explicitly-set "empty" value inside a nested
`Result` structure.

**Example**

```ts
import { thunkResultFailVoid } from "@beep/utils/thunk"

const resultFailure = thunkResultFailVoid()


console.log(resultFailure)
```

**Signature**

```ts
declare const thunkResultFailVoid: () => Result.Result<never, void>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L499)

Since v0.0.0

## thunkSome

Creates a thunk that yields `Option.some(value)`.

**Example**

```ts
import { thunkSome } from "@beep/utils/thunk"

const getSome = thunkSome(42)
const opt = getSome()
// Option.some(42)

console.log(opt)
```

**Signature**

```ts
declare const thunkSome: <A>(value: A) => (() => O.Option<A>)
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L346)

Since v0.0.0

## thunkSomeEmptyArray

Returns a thunk yielding `Option.some([])`.

**Example**

```ts
import { thunkSomeEmptyArray } from "@beep/utils/thunk"

const opt = thunkSomeEmptyArray<number>()
// Option.some([])

console.log(opt)
```

**Signature**

```ts
declare const thunkSomeEmptyArray: <A = never>() => O.Option<Array<A>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L439)

Since v0.0.0

## thunkSomeEmptyRecord

Returns a thunk yielding `Option.some({})`.

**Example**

```ts
import { thunkSomeEmptyRecord } from "@beep/utils/thunk"

const opt = thunkSomeEmptyRecord<string, number>()
// Option.some({})

console.log(opt)
```

**Signature**

```ts
declare const thunkSomeEmptyRecord: <K extends string | symbol = never, V = never>() => O.Option<Record<R.ReadonlyRecord.NonLiteralKey<K>, V>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L457)

Since v0.0.0

## thunkSomeNone

Returns a thunk yielding `Option.some(Option.none())`.

Useful for representing an explicitly-set "empty" value inside a nested
`Option` structure.

**Example**

```ts
import { thunkSomeNone } from "@beep/utils/thunk"

const opt = thunkSomeNone<string>()
// Option.some(Option.none())

console.log(opt)
```

**Signature**

```ts
declare const thunkSomeNone: <A>() => O.Option<O.Option<A>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L478)

Since v0.0.0

# utilities

## thunk0

A thunk that always yields `0`.

**Example**

```ts
import { thunk0 } from "@beep/utils/thunk"

const value = thunk0()
// 0

console.log(value)
```

**Signature**

```ts
declare const thunk0: LazyArg<number>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L160)

Since v0.0.0

## thunk1

A thunk that always yields `1`.

**Example**

```ts
import { thunk1 } from "@beep/utils/thunk"

const value = thunk1()
// 1

console.log(value)
```

**Signature**

```ts
declare const thunk1: LazyArg<number>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L178)

Since v0.0.0

## thunkEffectSucceedNull

A thunk that returns `Effect.succeed(null)`.

**Example**

```ts
import { thunkEffectSucceedNull } from "@beep/utils/thunk"

const eff = thunkEffectSucceedNull()

console.log(eff)
```

**Signature**

```ts
declare const thunkEffectSucceedNull: (..._: ReadonlyArray<unknown>) => Effect.Effect<null, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L291)

Since v0.0.0

## thunkEffectVoid

A thunk that returns `Effect.void`.

**Example**

```ts
import { thunkEffectVoid } from "@beep/utils/thunk"

const eff = thunkEffectVoid()

console.log(eff)
```

**Signature**

```ts
declare const thunkEffectVoid: (..._: ReadonlyArray<unknown>) => Effect.Effect<void, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L254)

Since v0.0.0

## thunkEmptyStr

A thunk that always yields the empty string.

**Example**

```ts
import { thunkEmptyStr } from "@beep/utils/thunk"

const value = thunkEmptyStr()
// ""

console.log(value)
```

**Signature**

```ts
declare const thunkEmptyStr: LazyArg<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L142)

Since v0.0.0

## thunkFalse

A thunk that always yields `false`.

**Example**

```ts
import { thunkFalse } from "@beep/utils/thunk"

const value = thunkFalse()
// false

console.log(value)
```

**Signature**

```ts
declare const thunkFalse: LazyArg<false>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L124)

Since v0.0.0

## thunkNegative1

A thunk yielding `-1`.

**Example**

```ts
import { thunkNegative1 } from "@beep/utils/thunk"

const value = thunkNegative1()
// -1

console.log(value)
```

**Signature**

```ts
declare const thunkNegative1: LazyArg<number>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L385)

Since v0.0.0

## thunkNull

A thunk that always yields `null`.

**Example**

```ts
import { thunkNull } from "@beep/utils/thunk"

const value = thunkNull()
// null

console.log(value)
```

**Signature**

```ts
declare const thunkNull: LazyArg<null>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L52)

Since v0.0.0

## thunkSomeEmptyStr

A thunk yielding `Option.some("")`.

**Example**

```ts
import { thunkSomeEmptyStr } from "@beep/utils/thunk"

const opt = thunkSomeEmptyStr()
// Option.some("")

console.log(opt)
```

**Signature**

```ts
declare const thunkSomeEmptyStr: () => O.Option<string>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L367)

Since v0.0.0

## thunkSomeFalse

A thunk yielding `Option.some(false)`.

**Example**

```ts
import { thunkSomeFalse } from "@beep/utils/thunk"

const opt = thunkSomeFalse()
// Option.some(false)

console.log(opt)
```

**Signature**

```ts
declare const thunkSomeFalse: () => O.Option<boolean>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L403)

Since v0.0.0

## thunkSomeTrue

A thunk yielding `Option.some(true)`.

**Example**

```ts
import { thunkSomeTrue } from "@beep/utils/thunk"

const opt = thunkSomeTrue()
// Option.some(true)

console.log(opt)
```

**Signature**

```ts
declare const thunkSomeTrue: () => O.Option<true>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L421)

Since v0.0.0

## thunkTrue

A thunk that always yields `true`.

**Example**

```ts
import { thunkTrue } from "@beep/utils/thunk"

const value = thunkTrue()
// true

console.log(value)
```

**Signature**

```ts
declare const thunkTrue: LazyArg<true>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L106)

Since v0.0.0

## thunkUndefined

A thunk that always yields `undefined`.

**Example**

```ts
import { thunkUndefined } from "@beep/utils/thunk"

const value = thunkUndefined()
// undefined

console.log(value)
```

**Signature**

```ts
declare const thunkUndefined: LazyArg<undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L70)

Since v0.0.0

## thunkVoid

A thunk that always yields `void 0` (equivalent to `undefined`).

**Example**

```ts
import { thunkVoid } from "@beep/utils/thunk"

const value = thunkVoid()
// undefined

console.log(value)
```

**Signature**

```ts
declare const thunkVoid: LazyArg<undefined>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/utils/src/thunk.ts#L88)

Since v0.0.0