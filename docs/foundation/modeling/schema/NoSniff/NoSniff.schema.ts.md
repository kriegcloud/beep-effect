---
title: NoSniff.schema.ts
nav_order: 162
parent: "@beep/schema"
---

## NoSniff.schema.ts overview

Schema for the `X-Content-Type-Options` header.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [NoSniffHeader (type alias)](#nosniffheader-type-alias)
  - [NoSniffOption (type alias)](#nosniffoption-type-alias)
  - [NoSniffResponseHeader (class)](#nosniffresponseheader-class)
  - [NoSniffValue (type alias)](#nosniffvalue-type-alias)
- [schemas](#schemas)
  - [Header](#header)
  - [NoSniffHeader](#nosniffheader)
  - [NoSniffOption](#nosniffoption)
  - [NoSniffValue](#nosniffvalue)
  - [Option](#option)
  - [ResponseHeader](#responseheader)
  - [Value](#value)
---

# models

## NoSniffHeader (type alias)

Type-level representation of `NoSniffHeader`.

**Signature**

```ts
type NoSniffHeader = typeof NoSniffHeader.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoSniff/NoSniff.schema.ts#L194)

Since v0.0.0

## NoSniffOption (type alias)

Type-level representation of `NoSniffOption`.

**Signature**

```ts
type NoSniffOption = typeof NoSniffOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoSniff/NoSniff.schema.ts#L85)

Since v0.0.0

## NoSniffResponseHeader (class)

Parsed `X-Content-Type-Options` response header with name and optional value.

**Example**

```ts
import * as Option from "effect/Option"
import { NoSniffResponseHeader } from "@beep/schema/NoSniff"

const header = new NoSniffResponseHeader({ name: "X-Content-Type-Options", value: Option.none() })
console.log(header)
```

**Signature**

```ts
declare class NoSniffResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoSniff/NoSniff.schema.ts#L102)

Since v0.0.0

## NoSniffValue (type alias)

Type-level representation of `NoSniffValue`.

**Signature**

```ts
type NoSniffValue = typeof NoSniffValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoSniff/NoSniff.schema.ts#L53)

Since v0.0.0

# schemas

## Header

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Header: S.decodeTo<typeof NoSniffResponseHeader, S.Union<readonly [LiteralKit<readonly [false, "nosniff"], undefined> & SchemaStatics<LiteralKit<readonly [false, "nosniff"], undefined>> & LiteralKitStatics<readonly [false, "nosniff"]>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof NoSniffResponseHeader, S.Union<readonly [LiteralKit<readonly [false, "nosniff"], undefined> & SchemaStatics<LiteralKit<readonly [false, "nosniff"], undefined>> & LiteralKitStatics<readonly [false, "nosniff"]>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | NoSniffOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | NoSniffOption, headerValueCreator?: undefined | ((option?: undefined | NoSniffOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoSniff/NoSniff.schema.ts#L203)

Since v0.0.0

## NoSniffHeader

One-way schema that decodes `X-Content-Type-Options` options into the response header.

**Example**

```ts
import { Effect } from "effect"
import { NoSniffHeader } from "@beep/schema/NoSniff"

const program = NoSniffHeader.create()
console.log(program)
```

**Signature**

```ts
declare const NoSniffHeader: S.decodeTo<typeof NoSniffResponseHeader, S.Union<readonly [LiteralKit<readonly [false, "nosniff"], undefined> & SchemaStatics<LiteralKit<readonly [false, "nosniff"], undefined>> & LiteralKitStatics<readonly [false, "nosniff"]>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof NoSniffResponseHeader, S.Union<readonly [LiteralKit<readonly [false, "nosniff"], undefined> & SchemaStatics<LiteralKit<readonly [false, "nosniff"], undefined>> & LiteralKitStatics<readonly [false, "nosniff"]>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | NoSniffOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | NoSniffOption, headerValueCreator?: undefined | ((option?: undefined | NoSniffOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoSniff/NoSniff.schema.ts#L129)

Since v0.0.0

## NoSniffOption

Schema for `X-Content-Type-Options` option values, including `false` to disable.

**Example**

```ts
import * as S from "effect/Schema"
import { NoSniffOption } from "@beep/schema/NoSniff"

const decoded = S.decodeUnknownSync(NoSniffOption)(false)
console.log(decoded)
```

**Signature**

```ts
declare const NoSniffOption: LiteralKit<readonly [false, "nosniff"], undefined> & SchemaStatics<LiteralKit<readonly [false, "nosniff"], undefined>> & LiteralKitStatics<readonly [false, "nosniff"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoSniff/NoSniff.schema.ts#L72)

Since v0.0.0

## NoSniffValue

Schema for supported `X-Content-Type-Options` header values.

**Example**

```ts
import * as S from "effect/Schema"
import { NoSniffValue } from "@beep/schema/NoSniff"

const decoded = S.decodeUnknownSync(NoSniffValue)("nosniff")
console.log(decoded)
```

**Signature**

```ts
declare const NoSniffValue: LiteralKit<readonly ["nosniff"], undefined> & SchemaStatics<LiteralKit<readonly ["nosniff"], undefined>> & LiteralKitStatics<readonly ["nosniff"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoSniff/NoSniff.schema.ts#L40)

Since v0.0.0

## Option

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Option: LiteralKit<readonly [false, "nosniff"], undefined> & SchemaStatics<LiteralKit<readonly [false, "nosniff"], undefined>> & LiteralKitStatics<readonly [false, "nosniff"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoSniff/NoSniff.schema.ts#L204)

Since v0.0.0

## ResponseHeader

Public aliases for concise namespace roles.

**Signature**

```ts
declare const ResponseHeader: typeof NoSniffResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoSniff/NoSniff.schema.ts#L205)

Since v0.0.0

## Value

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Value: LiteralKit<readonly ["nosniff"], undefined> & SchemaStatics<LiteralKit<readonly ["nosniff"], undefined>> & LiteralKitStatics<readonly ["nosniff"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoSniff/NoSniff.schema.ts#L206)

Since v0.0.0