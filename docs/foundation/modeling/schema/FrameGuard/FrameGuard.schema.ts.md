---
title: FrameGuard.schema.ts
nav_order: 99
parent: "@beep/schema"
---

## FrameGuard.schema.ts overview

Schema for the `X-Frame-Options` header.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [FrameGuardAllowFrom (type alias)](#frameguardallowfrom-type-alias)
  - [FrameGuardAllowFromConfig (class)](#frameguardallowfromconfig-class)
  - [FrameGuardHeader (type alias)](#frameguardheader-type-alias)
  - [FrameGuardMode (type alias)](#frameguardmode-type-alias)
  - [FrameGuardOption (type alias)](#frameguardoption-type-alias)
  - [FrameGuardResponseHeader (class)](#frameguardresponseheader-class)
- [schemas](#schemas)
  - [FrameGuardAllowFrom](#frameguardallowfrom)
  - [FrameGuardHeader](#frameguardheader)
  - [FrameGuardMode](#frameguardmode)
  - [FrameGuardOption](#frameguardoption)
  - [Header](#header)
  - [Mode](#mode)
  - [Option](#option)
  - [ResponseHeader](#responseheader)
---

# models

## FrameGuardAllowFrom (type alias)

Type for tuple-based `allow-from` frame guard configuration.

**Signature**

```ts
type FrameGuardAllowFrom = typeof FrameGuardAllowFrom.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FrameGuard/FrameGuard.schema.ts#L109)

Since v0.0.0

## FrameGuardAllowFromConfig (class)

Configuration for the deprecated `allow-from` frame guard mode.

**Example**

```ts
import { FrameGuardAllowFromConfig } from "@beep/schema/FrameGuard"

const config = FrameGuardAllowFromConfig.make({ uri: "https://example.com" })
console.log(config.uri)
```

**Signature**

```ts
declare class FrameGuardAllowFromConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FrameGuard/FrameGuard.schema.ts#L70)

Since v0.0.0

## FrameGuardHeader (type alias)

Type for rendered `X-Frame-Options` response headers.

**Signature**

```ts
type FrameGuardHeader = typeof FrameGuardHeader.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FrameGuard/FrameGuard.schema.ts#L286)

Since v0.0.0

## FrameGuardMode (type alias)

Type for direct `X-Frame-Options` policy modes.

**Signature**

```ts
type FrameGuardMode = typeof FrameGuardMode.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FrameGuard/FrameGuard.schema.ts#L54)

Since v0.0.0

## FrameGuardOption (type alias)

Type for enabled, disabled, or `allow-from` frame guard options.

**Signature**

```ts
type FrameGuardOption = typeof FrameGuardOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FrameGuard/FrameGuard.schema.ts#L137)

Since v0.0.0

## FrameGuardResponseHeader (class)

Model for a rendered `X-Frame-Options` response header.

**Example**

```ts
import * as O from "effect/Option"
import { FrameGuardResponseHeader } from "@beep/schema/FrameGuard"

const header = FrameGuardResponseHeader.make({ name: "X-Frame-Options", value: O.some("deny") })
console.log(header.name)
```

**Signature**

```ts
declare class FrameGuardResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FrameGuard/FrameGuard.schema.ts#L154)

Since v0.0.0

# schemas

## FrameGuardAllowFrom

Schema for tuple-based `allow-from` frame guard configuration.

**Example**

```ts
import * as S from "effect/Schema"
import { FrameGuardAllowFrom, FrameGuardAllowFromConfig } from "@beep/schema/FrameGuard"

const value = S.decodeUnknownSync(FrameGuardAllowFrom)([
  "allow-from",
  FrameGuardAllowFromConfig.make({ uri: "https://example.com" }),
])
console.log(value[0])
```

**Signature**

```ts
declare const FrameGuardAllowFrom: AnnotatedSchema<S.Tuple<readonly [S.Literal<"allow-from">, typeof FrameGuardAllowFromConfig]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FrameGuard/FrameGuard.schema.ts#L97)

Since v0.0.0

## FrameGuardHeader

Schema that renders frame guard options into a response header.

**Example**

```ts
import * as S from "effect/Schema"
import { FrameGuardHeader } from "@beep/schema/FrameGuard"

const header = S.decodeUnknownSync(FrameGuardHeader)("deny")
console.log(header.name)
```

**Signature**

```ts
declare const FrameGuardHeader: S.decodeTo<typeof FrameGuardResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<false>, LiteralKit<readonly ["deny", "sameorigin"], undefined> & SchemaStatics<LiteralKit<readonly ["deny", "sameorigin"], undefined>> & LiteralKitStatics<readonly ["deny", "sameorigin"]>, AnnotatedSchema<S.Tuple<readonly [S.Literal<"allow-from">, typeof FrameGuardAllowFromConfig]>>]>>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof FrameGuardResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<false>, LiteralKit<readonly ["deny", "sameorigin"], undefined> & SchemaStatics<LiteralKit<readonly ["deny", "sameorigin"], undefined>> & LiteralKitStatics<readonly ["deny", "sameorigin"]>, AnnotatedSchema<S.Tuple<readonly [S.Literal<"allow-from">, typeof FrameGuardAllowFromConfig]>>]>>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | FrameGuardOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | FrameGuardOption, headerValueCreator?: undefined | ((option?: undefined | FrameGuardOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FrameGuard/FrameGuard.schema.ts#L210)

Since v0.0.0

## FrameGuardMode

Schema for direct `X-Frame-Options` policy modes.

**Example**

```ts
import * as S from "effect/Schema"
import { FrameGuardMode } from "@beep/schema/FrameGuard"

console.log(S.is(FrameGuardMode)("deny")) // true
```

**Signature**

```ts
declare const FrameGuardMode: LiteralKit<readonly ["deny", "sameorigin"], undefined> & SchemaStatics<LiteralKit<readonly ["deny", "sameorigin"], undefined>> & LiteralKitStatics<readonly ["deny", "sameorigin"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FrameGuard/FrameGuard.schema.ts#L41)

Since v0.0.0

## FrameGuardOption

Schema for enabled, disabled, or `allow-from` frame guard options.

**Example**

```ts
import * as S from "effect/Schema"
import { FrameGuardOption } from "@beep/schema/FrameGuard"

console.log(S.decodeUnknownSync(FrameGuardOption)("sameorigin"))
```

**Signature**

```ts
declare const FrameGuardOption: AnnotatedSchema<S.Union<readonly [S.Literal<false>, LiteralKit<readonly ["deny", "sameorigin"], undefined> & SchemaStatics<LiteralKit<readonly ["deny", "sameorigin"], undefined>> & LiteralKitStatics<readonly ["deny", "sameorigin"]>, AnnotatedSchema<S.Tuple<readonly [S.Literal<"allow-from">, typeof FrameGuardAllowFromConfig]>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FrameGuard/FrameGuard.schema.ts#L125)

Since v0.0.0

## Header

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Header: S.decodeTo<typeof FrameGuardResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<false>, LiteralKit<readonly ["deny", "sameorigin"], undefined> & SchemaStatics<LiteralKit<readonly ["deny", "sameorigin"], undefined>> & LiteralKitStatics<readonly ["deny", "sameorigin"]>, AnnotatedSchema<S.Tuple<readonly [S.Literal<"allow-from">, typeof FrameGuardAllowFromConfig]>>]>>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof FrameGuardResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<false>, LiteralKit<readonly ["deny", "sameorigin"], undefined> & SchemaStatics<LiteralKit<readonly ["deny", "sameorigin"], undefined>> & LiteralKitStatics<readonly ["deny", "sameorigin"]>, AnnotatedSchema<S.Tuple<readonly [S.Literal<"allow-from">, typeof FrameGuardAllowFromConfig]>>]>>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | FrameGuardOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | FrameGuardOption, headerValueCreator?: undefined | ((option?: undefined | FrameGuardOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FrameGuard/FrameGuard.schema.ts#L295)

Since v0.0.0

## Mode

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Mode: LiteralKit<readonly ["deny", "sameorigin"], undefined> & SchemaStatics<LiteralKit<readonly ["deny", "sameorigin"], undefined>> & LiteralKitStatics<readonly ["deny", "sameorigin"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FrameGuard/FrameGuard.schema.ts#L296)

Since v0.0.0

## Option

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Option: AnnotatedSchema<S.Union<readonly [S.Literal<false>, LiteralKit<readonly ["deny", "sameorigin"], undefined> & SchemaStatics<LiteralKit<readonly ["deny", "sameorigin"], undefined>> & LiteralKitStatics<readonly ["deny", "sameorigin"]>, AnnotatedSchema<S.Tuple<readonly [S.Literal<"allow-from">, typeof FrameGuardAllowFromConfig]>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FrameGuard/FrameGuard.schema.ts#L297)

Since v0.0.0

## ResponseHeader

Public aliases for concise namespace roles.

**Signature**

```ts
declare const ResponseHeader: typeof FrameGuardResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/FrameGuard/FrameGuard.schema.ts#L298)

Since v0.0.0