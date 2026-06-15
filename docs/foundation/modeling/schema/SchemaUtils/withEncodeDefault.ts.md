---
title: withEncodeDefault.ts
nav_order: 187
parent: "@beep/schema"
---

## withEncodeDefault.ts overview

A module containing a schema utility which provides a default value

Since v0.0.0

---
## Exports Grouped by Category
- [constructors](#constructors)
  - [BoolDefaultFalse](#booldefaultfalse)
  - [BoolDefaultTrue](#booldefaulttrue)
  - [boolWithDefault](#boolwithdefault)
- [models](#models)
  - [BoolDefaultFalse (type alias)](#booldefaultfalse-type-alias)
  - [BoolDefaultTrue (type alias)](#booldefaulttrue-type-alias)
- [utilities](#utilities)
  - [withEncodeDefault](#withencodedefault)
---

# constructors

## BoolDefaultFalse

Boolean schema field that decodes missing keys as `false`.

**Example**

```ts
import * as S from "effect/Schema"
import { BoolDefaultFalse } from "@beep/schema/SchemaUtils/withEncodeDefault"

const Settings = S.Struct({ visible: BoolDefaultFalse })

console.log(S.decodeUnknownSync(Settings)({}).visible) // false
```

**Signature**

```ts
declare const BoolDefaultFalse: AnnotatedSchema<S.decodeTo<S.toType<S.Boolean>, S.optionalKey<S.Boolean>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SchemaUtils/withEncodeDefault.ts#L101)

Since v0.0.0

## BoolDefaultTrue

Boolean schema field that decodes missing keys as `true`.

**Example**

```ts
import * as S from "effect/Schema"
import { BoolDefaultTrue } from "@beep/schema/SchemaUtils/withEncodeDefault"

const Settings = S.Struct({ enabled: BoolDefaultTrue })

console.log(S.decodeUnknownSync(Settings)({}).enabled) // true
```

**Signature**

```ts
declare const BoolDefaultTrue: AnnotatedSchema<S.decodeTo<S.toType<S.Boolean>, S.optionalKey<S.Boolean>, never, never>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SchemaUtils/withEncodeDefault.ts#L139)

Since v0.0.0

## boolWithDefault

Create a boolean schema field with a lazy decoding default.

**Example**

```ts
import * as S from "effect/Schema"
import { boolWithDefault } from "@beep/schema/SchemaUtils/withEncodeDefault"

const Enabled = boolWithDefault(true)
const Settings = S.Struct({ enabled: Enabled })

console.log(S.decodeUnknownSync(Settings)({}).enabled) // true
```

**Signature**

```ts
declare const boolWithDefault: (defaultValue: boolean) => S.decodeTo<S.toType<S.Boolean>, S.optionalKey<S.Boolean>, never, never>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SchemaUtils/withEncodeDefault.ts#L83)

Since v0.0.0

# models

## BoolDefaultFalse (type alias)

{@inheritDoc BoolDefaultFalse}

**Example**

```ts
import type { BoolDefaultFalse } from "@beep/schema/SchemaUtils/withEncodeDefault"

const visible: BoolDefaultFalse = false
console.log(visible)
```

**Signature**

```ts
type BoolDefaultFalse = typeof BoolDefaultFalse.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SchemaUtils/withEncodeDefault.ts#L121)

Since v0.0.0

## BoolDefaultTrue (type alias)

{@inheritDoc BoolDefaultTrue}

**Example**

```ts
import type { BoolDefaultTrue } from "@beep/schema/SchemaUtils/withEncodeDefault"

const enabled: BoolDefaultTrue = true
console.log(enabled)
```

**Signature**

```ts
type BoolDefaultTrue = typeof BoolDefaultTrue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SchemaUtils/withEncodeDefault.ts#L159)

Since v0.0.0

# utilities

## withEncodeDefault

Apply a decoding default to an optional encoded key.

This helper makes the encoded key optional and fills in a decoded value when
the key is missing. Encoding remains strict and still requires the decoded
value to be present.

**Example**

```ts
import * as S from "effect/Schema"
import { withEncodeDefault } from "@beep/schema/SchemaUtils/withEncodeDefault"

const Status = withEncodeDefault(S.String, () => "draft")
const Settings = S.Struct({ status: Status })

console.log(S.decodeUnknownSync(Settings)({}).status) // "draft"
```

**Signature**

```ts
declare const withEncodeDefault: { <const TSchema extends S.Top>(self: TSchema, defaultValue: () => TSchema["Type"]): S.decodeTo<S.toType<TSchema>, S.optionalKey<TSchema>>; <const TSchema extends S.Top>(defaultValue: () => TSchema["Type"]): (self: TSchema) => S.decodeTo<S.toType<TSchema>, S.optionalKey<TSchema>>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/SchemaUtils/withEncodeDefault.ts#L40)

Since v0.0.0