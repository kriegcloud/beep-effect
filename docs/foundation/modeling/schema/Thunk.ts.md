---
title: Thunk.ts
nav_order: 210
parent: "@beep/schema"
---

## Thunk.ts overview

Thunk-oriented schema helpers.

Since v0.0.0

---
## Exports Grouped by Category
- [guards](#guards)
  - [isThunkUnknown](#isthunkunknown)
- [models](#models)
  - [ThunkUnknown (type alias)](#thunkunknown-type-alias)
  - [TypeId](#typeid)
  - [TypeId (type alias)](#typeid-type-alias)
- [validation](#validation)
  - [ThunkUnknown](#thunkunknown)
  - [make](#make)
  - [nominal](#nominal)
---

# guards

## isThunkUnknown

Type guard that checks whether a value satisfies the `ThunkUnknown`
schema.

**Example**

```ts
import { isThunkUnknown } from "@beep/schema/Thunk"

isThunkUnknown(() => 1)  // true
isThunkUnknown("hello")  // false
```

**Signature**

```ts
declare const isThunkUnknown: <I>(input: I) => input is I & (() => unknown) & Brand.Brand<IdentityString<`@beep/schema/Thunk/${string}`>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Thunk.ts#L123)

Since v0.0.0

# models

## ThunkUnknown (type alias)

Branded thunk type -- a zero-argument function returning `A`, branded with
`TypeId`.

**Example**

```ts
import { nominal, type ThunkUnknown } from "@beep/schema/Thunk"

const thunk = nominal(() => "ready") satisfies ThunkUnknown
console.log(thunk())
```

**Signature**

```ts
type ThunkUnknown<A> = Brand.Branded<() => A, TypeId>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Thunk.ts#L62)

Since v0.0.0

## TypeId

Unique brand identifier tag for `ThunkUnknown` values.

**Example**

```ts
import { TypeId } from "@beep/schema/Thunk"

console.log(TypeId)
```

**Signature**

```ts
declare const TypeId: IdentityString<`@beep/schema/Thunk/${string}`>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Thunk.ts#L29)

Since v0.0.0

## TypeId (type alias)

Type for `TypeId`.

**Example**

```ts
import { TypeId, type TypeId as TypeIdType } from "@beep/schema/Thunk"

const id = TypeId satisfies TypeIdType
console.log(id)
```

**Signature**

```ts
type TypeId = typeof TypeId
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Thunk.ts#L45)

Since v0.0.0

# validation

## ThunkUnknown

Schema that validates a value is a zero-argument function and brands it with
`TypeId`. Provides a `.generic` helper for creating typed thunk schemas.

**Example**

```ts
import * as S from "effect/Schema"
import { ThunkUnknown } from "@beep/schema/Thunk"

const thunk = S.decodeUnknownSync(ThunkUnknown)(() => "hello")
console.log(thunk)
```

**Signature**

```ts
declare const ThunkUnknown: S.brand<S.declare<() => unknown, () => unknown>, IdentityString<`@beep/schema/Thunk/${string}`>> & SchemaStatics<S.brand<S.declare<() => unknown, () => unknown>, IdentityString<`@beep/schema/Thunk/${string}`>>> & { generic: <A = never>(guard: (u: unknown) => u is () => A) => S.declare<() => A, () => A>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Thunk.ts#L98)

Since v0.0.0

## make

Builds a typed thunk schema from a type guard and a return-type schema
witness. The return schema is type-level only; validating it would require
invoking the thunk. Supports both data-first and data-last calling
conventions.

**Example**

```ts
import * as S from "effect/Schema"
import * as P from "effect/Predicate"
import { make } from "@beep/schema/Thunk"

const isStringThunk = (u: unknown): u is () => string =>
  P.isFunction(u) && P.isString(u())

const StringThunk = make(isStringThunk, S.String)
console.log(StringThunk)
```

**Signature**

```ts
declare const make: { <TSchema extends S.Top>(guard: (u: unknown) => u is () => S.Schema.Type<TSchema>, _returnSchema: TSchema): S.declare<() => S.Schema.Type<TSchema>>; <TSchema extends S.Top>(guard: (u: unknown) => u is () => S.Schema.Type<TSchema>): (_returnSchema: TSchema) => S.declare<() => S.Schema.Type<TSchema>>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Thunk.ts#L147)

Since v0.0.0

## nominal

Brand constructor that validates and brands a value as `ThunkUnknown`.

**Example**

```ts
import { nominal } from "@beep/schema/Thunk"

const thunk = nominal(() => 42)
console.log(thunk)
```

**Signature**

```ts
declare const nominal: Brand.Constructor<ThunkUnknown<unknown>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/Thunk.ts#L80)

Since v0.0.0