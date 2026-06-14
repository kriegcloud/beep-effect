---
title: ReferrerPolicy.schema.ts
nav_order: 180
parent: "@beep/schema"
---

## ReferrerPolicy.schema.ts overview

Schema for the `Referrer-Policy` header.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ReferrerPolicyHeader (type alias)](#referrerpolicyheader-type-alias)
  - [ReferrerPolicyOption (type alias)](#referrerpolicyoption-type-alias)
  - [ReferrerPolicyResponseHeader (class)](#referrerpolicyresponseheader-class)
  - [ReferrerPolicyValue (type alias)](#referrerpolicyvalue-type-alias)
  - [ReferrerPolicyValueList (type alias)](#referrerpolicyvaluelist-type-alias)
- [schemas](#schemas)
  - [Header](#header)
  - [Option](#option)
  - [ReferrerPolicyHeader](#referrerpolicyheader)
  - [ReferrerPolicyOption](#referrerpolicyoption)
  - [ReferrerPolicyValue](#referrerpolicyvalue)
  - [ReferrerPolicyValueList](#referrerpolicyvaluelist)
  - [ResponseHeader](#responseheader)
  - [Value](#value)
---

# models

## ReferrerPolicyHeader (type alias)

Type for rendered `Referrer-Policy` response headers.

**Signature**

```ts
type ReferrerPolicyHeader = typeof ReferrerPolicyHeader.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ReferrerPolicy/ReferrerPolicy.schema.ts#L254)

Since v0.0.0

## ReferrerPolicyOption (type alias)

Type for enabled or disabled `Referrer-Policy` options.

**Signature**

```ts
type ReferrerPolicyOption = typeof ReferrerPolicyOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ReferrerPolicy/ReferrerPolicy.schema.ts#L118)

Since v0.0.0

## ReferrerPolicyResponseHeader (class)

Model for a rendered `Referrer-Policy` response header.

**Example**

```ts
import * as O from "effect/Option"
import { ReferrerPolicyResponseHeader } from "@beep/schema/ReferrerPolicy"

const header = ReferrerPolicyResponseHeader.make({ name: "Referrer-Policy", value: O.some("no-referrer") })
console.log(header.name)
```

**Signature**

```ts
declare class ReferrerPolicyResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ReferrerPolicy/ReferrerPolicy.schema.ts#L135)

Since v0.0.0

## ReferrerPolicyValue (type alias)

Type for allowed `Referrer-Policy` values.

**Signature**

```ts
type ReferrerPolicyValue = typeof ReferrerPolicyValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ReferrerPolicy/ReferrerPolicy.schema.ts#L61)

Since v0.0.0

## ReferrerPolicyValueList (type alias)

Type for fallback lists of `Referrer-Policy` values.

**Signature**

```ts
type ReferrerPolicyValueList = typeof ReferrerPolicyValueList.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ReferrerPolicy/ReferrerPolicy.schema.ts#L90)

Since v0.0.0

# schemas

## Header

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Header: S.decodeTo<typeof ReferrerPolicyResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<false>, LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined>> & LiteralKitStatics<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"]>, AnnotatedSchema<S.$Array<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined>> & LiteralKitStatics<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"]>>>]>>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof ReferrerPolicyResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<false>, LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined>> & LiteralKitStatics<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"]>, AnnotatedSchema<S.$Array<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined>> & LiteralKitStatics<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"]>>>]>>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | ReferrerPolicyOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | ReferrerPolicyOption, headerValueCreator?: undefined | ((option?: undefined | ReferrerPolicyOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ReferrerPolicy/ReferrerPolicy.schema.ts#L263)

Since v0.0.0

## Option

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Option: AnnotatedSchema<S.Union<readonly [S.Literal<false>, LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined>> & LiteralKitStatics<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"]>, AnnotatedSchema<S.$Array<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined>> & LiteralKitStatics<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"]>>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ReferrerPolicy/ReferrerPolicy.schema.ts#L264)

Since v0.0.0

## ReferrerPolicyHeader

Schema that renders referrer policy options into a response header.

**Example**

```ts
import * as S from "effect/Schema"
import { ReferrerPolicyHeader } from "@beep/schema/ReferrerPolicy"

const header = S.decodeUnknownSync(ReferrerPolicyHeader)("no-referrer")
console.log(header.name)
```

**Signature**

```ts
declare const ReferrerPolicyHeader: S.decodeTo<typeof ReferrerPolicyResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<false>, LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined>> & LiteralKitStatics<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"]>, AnnotatedSchema<S.$Array<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined>> & LiteralKitStatics<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"]>>>]>>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof ReferrerPolicyResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<false>, LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined>> & LiteralKitStatics<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"]>, AnnotatedSchema<S.$Array<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined>> & LiteralKitStatics<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"]>>>]>>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | ReferrerPolicyOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | ReferrerPolicyOption, headerValueCreator?: undefined | ((option?: undefined | ReferrerPolicyOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ReferrerPolicy/ReferrerPolicy.schema.ts#L186)

Since v0.0.0

## ReferrerPolicyOption

Schema for enabled or disabled `Referrer-Policy` options.

**Example**

```ts
import * as S from "effect/Schema"
import { ReferrerPolicyOption } from "@beep/schema/ReferrerPolicy"

console.log(S.decodeUnknownSync(ReferrerPolicyOption)("no-referrer"))
```

**Signature**

```ts
declare const ReferrerPolicyOption: AnnotatedSchema<S.Union<readonly [S.Literal<false>, LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined>> & LiteralKitStatics<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"]>, AnnotatedSchema<S.$Array<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined>> & LiteralKitStatics<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"]>>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ReferrerPolicy/ReferrerPolicy.schema.ts#L106)

Since v0.0.0

## ReferrerPolicyValue

Schema for allowed `Referrer-Policy` values.

**Example**

```ts
import * as S from "effect/Schema"
import { ReferrerPolicyValue } from "@beep/schema/ReferrerPolicy"

console.log(S.is(ReferrerPolicyValue)("strict-origin")) // true
```

**Signature**

```ts
declare const ReferrerPolicyValue: LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined>> & LiteralKitStatics<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ReferrerPolicy/ReferrerPolicy.schema.ts#L48)

Since v0.0.0

## ReferrerPolicyValueList

Schema for fallback lists of `Referrer-Policy` values.

**Example**

```ts
import * as S from "effect/Schema"
import { ReferrerPolicyValueList } from "@beep/schema/ReferrerPolicy"

const values = S.decodeUnknownSync(ReferrerPolicyValueList)(["origin", "strict-origin"])
console.log(values.length)
```

**Signature**

```ts
declare const ReferrerPolicyValueList: AnnotatedSchema<S.$Array<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined>> & LiteralKitStatics<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"]>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ReferrerPolicy/ReferrerPolicy.schema.ts#L78)

Since v0.0.0

## ResponseHeader

Public aliases for concise namespace roles.

**Signature**

```ts
declare const ResponseHeader: typeof ReferrerPolicyResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ReferrerPolicy/ReferrerPolicy.schema.ts#L265)

Since v0.0.0

## Value

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Value: LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"], undefined>> & LiteralKitStatics<readonly ["no-referrer", "no-referrer-when-downgrade", "origin", "origin-when-cross-origin", "same-origin", "strict-origin", "strict-origin-when-cross-origin"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ReferrerPolicy/ReferrerPolicy.schema.ts#L266)

Since v0.0.0