---
title: withKeyDefaults.ts
nav_order: 188
parent: "@beep/schema"
---

## withKeyDefaults.ts overview

Attach the same default value for constructor creation and missing-key
decoding.

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [BoolKeyDefaultFalse](#boolkeydefaultfalse)
  - [BoolKeyDefaultTrue](#boolkeydefaulttrue)
  - [boolKeyWithDefault](#boolkeywithdefault)
  - [withEmptyArrayDefaults](#withemptyarraydefaults)
- [models](#models)
  - [BoolKeyDefaultFalse (type alias)](#boolkeydefaultfalse-type-alias)
  - [BoolKeyDefaultTrue (type alias)](#boolkeydefaulttrue-type-alias)
- [utilities](#utilities)
  - [withKeyDefaults](#withkeydefaults)
---

# constructors

## BoolKeyDefaultFalse

Boolean schema field that defaults constructor input and missing keys to
`false`.

**Example**

```ts
import * as S from "effect/Schema"
import { BoolKeyDefaultFalse } from "@beep/schema/SchemaUtils/withKeyDefaults"

const Settings = S.Struct({ visible: BoolKeyDefaultFalse })

console.log(S.decodeUnknownSync(Settings)({}).visible) // false
```

**Signature**

```ts
declare const BoolKeyDefaultFalse: AnnotatedSchema<S.withDecodingDefaultKey<S.withConstructorDefault<S.Boolean>, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SchemaUtils/withKeyDefaults.ts#L207)

Since v0.0.0

## BoolKeyDefaultTrue

Boolean schema field that defaults constructor input and missing keys to
`true`.

**Example**

```ts
import * as S from "effect/Schema"
import { BoolKeyDefaultTrue } from "@beep/schema/SchemaUtils/withKeyDefaults"

const Settings = S.Struct({ enabled: BoolKeyDefaultTrue })

console.log(S.decodeUnknownSync(Settings)({}).enabled) // true
```

**Signature**

```ts
declare const BoolKeyDefaultTrue: AnnotatedSchema<S.withDecodingDefaultKey<S.withConstructorDefault<S.Boolean>, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SchemaUtils/withKeyDefaults.ts#L246)

Since v0.0.0

## boolKeyWithDefault

Create a boolean schema field with a shared constructor and missing-key
default.

**Example**

```ts
import * as S from "effect/Schema"
import { boolKeyWithDefault } from "@beep/schema/SchemaUtils/withKeyDefaults"

const Enabled = boolKeyWithDefault(true)
const Settings = S.Struct({ enabled: Enabled })

console.log(S.decodeUnknownSync(Settings)({}).enabled) // true
```

**Signature**

```ts
declare const boolKeyWithDefault: (defaultValue: boolean) => S.withDecodingDefaultKey<S.withConstructorDefault<S.Boolean>, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SchemaUtils/withKeyDefaults.ts#L188)

Since v0.0.0

## withEmptyArrayDefaults

Apply empty readonly-array defaults for constructor creation and missing
value decoding.

This helper is intended for array fields whose default should be
`A.empty<TValue>()`. It keeps the element schema inference from the provided
array schema while avoiding repeated default wiring at each call site.

**Example**

```ts
import { A } from "@beep/utils"
import * as S from "effect/Schema"
import { withEmptyArrayDefaults } from "@beep/schema/SchemaUtils/withKeyDefaults"

const Tags = S.Array(S.String).pipe(withEmptyArrayDefaults<string>())
const Settings = S.Struct({ tags: Tags })
const settings = S.decodeUnknownSync(Settings)({})

console.log(A.isReadonlyArrayEmpty(settings.tags)) // true
```

**Signature**

```ts
declare const withEmptyArrayDefaults: { <TValue>(): <const TSchema extends S.$Array<S.Schema<TValue>> & S.WithoutConstructorDefault>(self: TSchema) => S.withDecodingDefaultType<S.withConstructorDefault<TSchema>>; <TValue, const TSchema extends S.$Array<S.Schema<TValue>> & S.WithoutConstructorDefault = S.$Array<S.Schema<TValue>> & S.WithoutConstructorDefault>(self: TSchema): S.withDecodingDefaultType<S.withConstructorDefault<TSchema>>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SchemaUtils/withKeyDefaults.ts#L158)

Since v0.0.0

# models

## BoolKeyDefaultFalse (type alias)

{@inheritDoc BoolKeyDefaultFalse}

**Example**

```ts
import type { BoolKeyDefaultFalse } from "@beep/schema/SchemaUtils/withKeyDefaults"

const visible: BoolKeyDefaultFalse = false
console.log(visible)
```

**Signature**

```ts
type BoolKeyDefaultFalse = typeof BoolKeyDefaultFalse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SchemaUtils/withKeyDefaults.ts#L227)

Since v0.0.0

## BoolKeyDefaultTrue (type alias)

{@inheritDoc BoolKeyDefaultTrue}

**Example**

```ts
import type { BoolKeyDefaultTrue } from "@beep/schema/SchemaUtils/withKeyDefaults"

const enabled: BoolKeyDefaultTrue = true
console.log(enabled)
```

**Signature**

```ts
type BoolKeyDefaultTrue = typeof BoolKeyDefaultTrue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SchemaUtils/withKeyDefaults.ts#L266)

Since v0.0.0

# utilities

## withKeyDefaults

Applies a shared default value to a schema field for both constructor-time
defaults and decoding-time missing keys.

This helper combines `Schema.withConstructorDefault` and
`Schema.withDecodingDefaultKey` using the same value, so the provided default
must be valid for both the schema's runtime `Type` and encoded `Encoded`
representation.

Supports both call styles:
- Data-last: `pipe(S.String, withKeyDefaults("draft"))`
- Data-first: `withKeyDefaults(S.String, "draft")`

**Example**

```ts
import * as S from "effect/Schema"
import { withKeyDefaults } from "@beep/schema/SchemaUtils/withKeyDefaults"

const Status = withKeyDefaults(S.String, "draft")
const Settings = S.Struct({ status: Status })

console.log(S.decodeUnknownSync(Settings)({}).status) // "draft"
```

**Signature**

```ts
declare const withKeyDefaults: { <const TSchema extends S.Top & S.WithoutConstructorDefault>(defaultValue: TSchema["Type"] & TSchema["Encoded"]): (self: TSchema) => S.withDecodingDefaultKey<S.withConstructorDefault<TSchema>>; <const TSchema extends S.Top & S.WithoutConstructorDefault>(self: TSchema, defaultValue: TSchema["Type"] & TSchema["Encoded"]): S.withDecodingDefaultKey<S.withConstructorDefault<TSchema>>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SchemaUtils/withKeyDefaults.ts#L50)

Since v0.0.0