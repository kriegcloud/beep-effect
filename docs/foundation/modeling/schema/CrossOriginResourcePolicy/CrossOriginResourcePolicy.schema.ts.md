---
title: CrossOriginResourcePolicy.schema.ts
nav_order: 26
parent: "@beep/schema"
---

## CrossOriginResourcePolicy.schema.ts overview

Schema for the `Cross-Origin-Resource-Policy` header.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [CorpValue (type alias)](#corpvalue-type-alias)
  - [CrossOriginResourcePolicyHeader (type alias)](#crossoriginresourcepolicyheader-type-alias)
  - [CrossOriginResourcePolicyOption (type alias)](#crossoriginresourcepolicyoption-type-alias)
  - [CrossOriginResourcePolicyResponseHeader (class)](#crossoriginresourcepolicyresponseheader-class)
- [schemas](#schemas)
  - [CorpValue](#corpvalue)
  - [CrossOriginResourcePolicyHeader](#crossoriginresourcepolicyheader)
  - [CrossOriginResourcePolicyOption](#crossoriginresourcepolicyoption)
  - [Header](#header)
  - [Option](#option)
  - [ResponseHeader](#responseheader)
---

# models

## CorpValue (type alias)

Type for allowed `Cross-Origin-Resource-Policy` values.

**Signature**

```ts
type CorpValue = typeof CorpValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts#L51)

Since v0.0.0

## CrossOriginResourcePolicyHeader (type alias)

Type for rendered `Cross-Origin-Resource-Policy` response headers.

**Signature**

```ts
type CrossOriginResourcePolicyHeader = typeof CrossOriginResourcePolicyHeader.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts#L191)

Since v0.0.0

## CrossOriginResourcePolicyOption (type alias)

Type for enabled or disabled `Cross-Origin-Resource-Policy` options.

**Signature**

```ts
type CrossOriginResourcePolicyOption = typeof CrossOriginResourcePolicyOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts#L82)

Since v0.0.0

## CrossOriginResourcePolicyResponseHeader (class)

Model for a rendered `Cross-Origin-Resource-Policy` response header.

**Example**

```ts
import * as O from "effect/Option"
import { CrossOriginResourcePolicyResponseHeader } from "@beep/schema/CrossOriginResourcePolicy"

const header = CrossOriginResourcePolicyResponseHeader.make({
  name: "Cross-Origin-Resource-Policy",
  value: O.some("same-origin"),
})
console.log(header.name)
```

**Signature**

```ts
declare class CrossOriginResourcePolicyResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts#L102)

Since v0.0.0

# schemas

## CorpValue

Schema for allowed `Cross-Origin-Resource-Policy` values.

**Example**

```ts
import * as S from "effect/Schema"
import { CorpValue } from "@beep/schema/CrossOriginResourcePolicy"

console.log(S.is(CorpValue)("same-origin")) // true
```

**Signature**

```ts
declare const CorpValue: LiteralKit<readonly ["same-site", "same-origin", "cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly ["same-site", "same-origin", "cross-origin"], undefined>> & LiteralKitStatics<readonly ["same-site", "same-origin", "cross-origin"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts#L38)

Since v0.0.0

## CrossOriginResourcePolicyHeader

Schema that renders CORP options into a response header.

**Example**

```ts
import * as S from "effect/Schema"
import { CrossOriginResourcePolicyHeader } from "@beep/schema/CrossOriginResourcePolicy"

const header = S.decodeUnknownSync(CrossOriginResourcePolicyHeader)("same-origin")
console.log(header.name)
```

**Signature**

```ts
declare const CrossOriginResourcePolicyHeader: S.decodeTo<typeof CrossOriginResourcePolicyResponseHeader, S.Union<readonly [LiteralKit<readonly [false, "same-site", "same-origin", "cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly [false, "same-site", "same-origin", "cross-origin"], undefined>> & LiteralKitStatics<readonly [false, "same-site", "same-origin", "cross-origin"]>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof CrossOriginResourcePolicyResponseHeader, S.Union<readonly [LiteralKit<readonly [false, "same-site", "same-origin", "cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly [false, "same-site", "same-origin", "cross-origin"], undefined>> & LiteralKitStatics<readonly [false, "same-site", "same-origin", "cross-origin"]>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | CrossOriginResourcePolicyOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | CrossOriginResourcePolicyOption, headerValueCreator?: undefined | ((option?: undefined | CrossOriginResourcePolicyOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts#L131)

Since v0.0.0

## CrossOriginResourcePolicyOption

Schema for enabled or disabled `Cross-Origin-Resource-Policy` options.

**Example**

```ts
import * as S from "effect/Schema"
import { CrossOriginResourcePolicyOption } from "@beep/schema/CrossOriginResourcePolicy"

console.log(S.decodeUnknownSync(CrossOriginResourcePolicyOption)("same-site"))
```

**Signature**

```ts
declare const CrossOriginResourcePolicyOption: LiteralKit<readonly [false, "same-site", "same-origin", "cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly [false, "same-site", "same-origin", "cross-origin"], undefined>> & LiteralKitStatics<readonly [false, "same-site", "same-origin", "cross-origin"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts#L69)

Since v0.0.0

## Header

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Header: S.decodeTo<typeof CrossOriginResourcePolicyResponseHeader, S.Union<readonly [LiteralKit<readonly [false, "same-site", "same-origin", "cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly [false, "same-site", "same-origin", "cross-origin"], undefined>> & LiteralKitStatics<readonly [false, "same-site", "same-origin", "cross-origin"]>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof CrossOriginResourcePolicyResponseHeader, S.Union<readonly [LiteralKit<readonly [false, "same-site", "same-origin", "cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly [false, "same-site", "same-origin", "cross-origin"], undefined>> & LiteralKitStatics<readonly [false, "same-site", "same-origin", "cross-origin"]>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | CrossOriginResourcePolicyOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | CrossOriginResourcePolicyOption, headerValueCreator?: undefined | ((option?: undefined | CrossOriginResourcePolicyOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts#L200)

Since v0.0.0

## Option

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Option: LiteralKit<readonly [false, "same-site", "same-origin", "cross-origin"], undefined> & SchemaStatics<LiteralKit<readonly [false, "same-site", "same-origin", "cross-origin"], undefined>> & LiteralKitStatics<readonly [false, "same-site", "same-origin", "cross-origin"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts#L201)

Since v0.0.0

## ResponseHeader

Public aliases for concise namespace roles.

**Signature**

```ts
declare const ResponseHeader: typeof CrossOriginResourcePolicyResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginResourcePolicy/CrossOriginResourcePolicy.schema.ts#L202)

Since v0.0.0