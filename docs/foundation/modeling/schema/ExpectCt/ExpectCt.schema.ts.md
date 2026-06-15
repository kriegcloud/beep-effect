---
title: ExpectCt.schema.ts
nav_order: 81
parent: "@beep/schema"
---

## ExpectCt.schema.ts overview

Schema for the `Expect-CT` header.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ExpectCTConfig (class)](#expectctconfig-class)
  - [ExpectCTEnabled (type alias)](#expectctenabled-type-alias)
  - [ExpectCTHeader (type alias)](#expectctheader-type-alias)
  - [ExpectCTOption (type alias)](#expectctoption-type-alias)
  - [ExpectCTResponseHeader (class)](#expectctresponseheader-class)
- [schemas](#schemas)
  - [Config](#config)
  - [ExpectCTEnabled](#expectctenabled)
  - [ExpectCTHeader](#expectctheader)
  - [ExpectCTOption](#expectctoption)
  - [Header](#header)
  - [Option](#option)
  - [ResponseHeader](#responseheader)
---

# models

## ExpectCTConfig (class)

Configuration for the `Expect-CT` header.

**Example**

```ts
import { ExpectCTConfig } from "@beep/schema/ExpectCt"

const config = ExpectCTConfig.make({ enforce: true, maxAge: 86400 })
console.log(config.enforce)
```

**Signature**

```ts
declare class ExpectCTConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ExpectCt/ExpectCt.schema.ts#L38)

Since v0.0.0

## ExpectCTEnabled (type alias)

Type for tuple-based enabled `Expect-CT` configuration.

**Signature**

```ts
type ExpectCTEnabled = typeof ExpectCTEnabled.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ExpectCt/ExpectCt.schema.ts#L76)

Since v0.0.0

## ExpectCTHeader (type alias)

Type for rendered `Expect-CT` response headers.

**Signature**

```ts
type ExpectCTHeader = typeof ExpectCTHeader.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ExpectCt/ExpectCt.schema.ts#L267)

Since v0.0.0

## ExpectCTOption (type alias)

Type for enabled or disabled `Expect-CT` options.

**Signature**

```ts
type ExpectCTOption = typeof ExpectCTOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ExpectCt/ExpectCt.schema.ts#L104)

Since v0.0.0

## ExpectCTResponseHeader (class)

Model for a rendered `Expect-CT` response header.

**Example**

```ts
import * as O from "effect/Option"
import { ExpectCTResponseHeader } from "@beep/schema/ExpectCt"

const header = ExpectCTResponseHeader.make({ name: "Expect-CT", value: O.some("max-age=86400") })
console.log(header.name)
```

**Signature**

```ts
declare class ExpectCTResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ExpectCt/ExpectCt.schema.ts#L121)

Since v0.0.0

# schemas

## Config

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Config: typeof ExpectCTConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ExpectCt/ExpectCt.schema.ts#L276)

Since v0.0.0

## ExpectCTEnabled

Schema for tuple-based enabled `Expect-CT` configuration.

**Example**

```ts
import * as S from "effect/Schema"
import { ExpectCTConfig, ExpectCTEnabled } from "@beep/schema/ExpectCt"

const enabled = S.decodeUnknownSync(ExpectCTEnabled)([true, ExpectCTConfig.make({ enforce: true })])
console.log(enabled[0])
```

**Signature**

```ts
declare const ExpectCTEnabled: AnnotatedSchema<S.Tuple<readonly [S.Literal<true>, typeof ExpectCTConfig]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ExpectCt/ExpectCt.schema.ts#L64)

Since v0.0.0

## ExpectCTHeader

Schema that renders Expect-CT options into a response header.

**Example**

```ts
import * as S from "effect/Schema"
import { ExpectCTHeader } from "@beep/schema/ExpectCt"

const header = S.decodeUnknownSync(ExpectCTHeader)(true)
console.log(header.name)
```

**Signature**

```ts
declare const ExpectCTHeader: S.decodeTo<typeof ExpectCTResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Boolean, AnnotatedSchema<S.Tuple<readonly [S.Literal<true>, typeof ExpectCTConfig]>>]>>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof ExpectCTResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Boolean, AnnotatedSchema<S.Tuple<readonly [S.Literal<true>, typeof ExpectCTConfig]>>]>>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | ExpectCTOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | ExpectCTOption, headerValueCreator?: undefined | ((option?: undefined | ExpectCTOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ExpectCt/ExpectCt.schema.ts#L208)

Since v0.0.0

## ExpectCTOption

Schema for enabled or disabled `Expect-CT` options.

**Example**

```ts
import * as S from "effect/Schema"
import { ExpectCTOption } from "@beep/schema/ExpectCt"

console.log(S.decodeUnknownSync(ExpectCTOption)(true))
```

**Signature**

```ts
declare const ExpectCTOption: AnnotatedSchema<S.Union<readonly [S.Boolean, AnnotatedSchema<S.Tuple<readonly [S.Literal<true>, typeof ExpectCTConfig]>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ExpectCt/ExpectCt.schema.ts#L92)

Since v0.0.0

## Header

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Header: S.decodeTo<typeof ExpectCTResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Boolean, AnnotatedSchema<S.Tuple<readonly [S.Literal<true>, typeof ExpectCTConfig]>>]>>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof ExpectCTResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Boolean, AnnotatedSchema<S.Tuple<readonly [S.Literal<true>, typeof ExpectCTConfig]>>]>>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | ExpectCTOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | ExpectCTOption, headerValueCreator?: undefined | ((option?: undefined | ExpectCTOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ExpectCt/ExpectCt.schema.ts#L277)

Since v0.0.0

## Option

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Option: AnnotatedSchema<S.Union<readonly [S.Boolean, AnnotatedSchema<S.Tuple<readonly [S.Literal<true>, typeof ExpectCTConfig]>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ExpectCt/ExpectCt.schema.ts#L278)

Since v0.0.0

## ResponseHeader

Public aliases for concise namespace roles.

**Signature**

```ts
declare const ResponseHeader: typeof ExpectCTResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ExpectCt/ExpectCt.schema.ts#L279)

Since v0.0.0