---
title: NoOpen.schema.ts
nav_order: 160
parent: "@beep/schema"
---

## NoOpen.schema.ts overview

Schema for the `X-Download-Options` header.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [NoOpenHeader (type alias)](#noopenheader-type-alias)
  - [NoOpenOption (type alias)](#noopenoption-type-alias)
  - [NoOpenResponseHeader (class)](#noopenresponseheader-class)
  - [NoOpenValue (type alias)](#noopenvalue-type-alias)
- [schemas](#schemas)
  - [Header](#header)
  - [NoOpenHeader](#noopenheader)
  - [NoOpenOption](#noopenoption)
  - [NoOpenValue](#noopenvalue)
  - [Option](#option)
  - [ResponseHeader](#responseheader)
  - [Value](#value)
---

# models

## NoOpenHeader (type alias)

Type for rendered `X-Download-Options` response headers.

**Signature**

```ts
type NoOpenHeader = typeof NoOpenHeader.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoOpen/NoOpen.schema.ts#L192)

Since v0.0.0

## NoOpenOption (type alias)

Type for enabled or disabled `X-Download-Options` options.

**Signature**

```ts
type NoOpenOption = typeof NoOpenOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoOpen/NoOpen.schema.ts#L83)

Since v0.0.0

## NoOpenResponseHeader (class)

Model for a rendered `X-Download-Options` response header.

**Example**

```ts
import * as O from "effect/Option"
import { NoOpenResponseHeader } from "@beep/schema/NoOpen"

const header = NoOpenResponseHeader.make({ name: "X-Download-Options", value: O.some("noopen") })
console.log(header.name)
```

**Signature**

```ts
declare class NoOpenResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoOpen/NoOpen.schema.ts#L100)

Since v0.0.0

## NoOpenValue (type alias)

Type for the `X-Download-Options` header value.

**Signature**

```ts
type NoOpenValue = typeof NoOpenValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoOpen/NoOpen.schema.ts#L52)

Since v0.0.0

# schemas

## Header

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Header: S.decodeTo<typeof NoOpenResponseHeader, S.UndefinedOr<LiteralKit<readonly [false, "noopen"], undefined> & SchemaStatics<LiteralKit<readonly [false, "noopen"], undefined>> & LiteralKitStatics<readonly [false, "noopen"]>>, never, never> & SchemaStatics<S.decodeTo<typeof NoOpenResponseHeader, S.UndefinedOr<LiteralKit<readonly [false, "noopen"], undefined> & SchemaStatics<LiteralKit<readonly [false, "noopen"], undefined>> & LiteralKitStatics<readonly [false, "noopen"]>>, never, never>> & { createValue: (option?: undefined | NoOpenOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | NoOpenOption, headerValueCreator?: undefined | ((option?: undefined | NoOpenOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoOpen/NoOpen.schema.ts#L200)

Since v0.0.0

## NoOpenHeader

Schema that renders X-Download-Options options into a response header.

**Example**

```ts
import * as S from "effect/Schema"
import { NoOpenHeader } from "@beep/schema/NoOpen"

const header = S.decodeUnknownSync(NoOpenHeader)("noopen")
console.log(header.name)
```

**Signature**

```ts
declare const NoOpenHeader: S.decodeTo<typeof NoOpenResponseHeader, S.UndefinedOr<LiteralKit<readonly [false, "noopen"], undefined> & SchemaStatics<LiteralKit<readonly [false, "noopen"], undefined>> & LiteralKitStatics<readonly [false, "noopen"]>>, never, never> & SchemaStatics<S.decodeTo<typeof NoOpenResponseHeader, S.UndefinedOr<LiteralKit<readonly [false, "noopen"], undefined> & SchemaStatics<LiteralKit<readonly [false, "noopen"], undefined>> & LiteralKitStatics<readonly [false, "noopen"]>>, never, never>> & { createValue: (option?: undefined | NoOpenOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | NoOpenOption, headerValueCreator?: undefined | ((option?: undefined | NoOpenOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoOpen/NoOpen.schema.ts#L127)

Since v0.0.0

## NoOpenOption

Schema for enabled or disabled `X-Download-Options` options.

**Example**

```ts
import * as S from "effect/Schema"
import { NoOpenOption } from "@beep/schema/NoOpen"

console.log(S.decodeUnknownSync(NoOpenOption)("noopen"))
```

**Signature**

```ts
declare const NoOpenOption: LiteralKit<readonly [false, "noopen"], undefined> & SchemaStatics<LiteralKit<readonly [false, "noopen"], undefined>> & LiteralKitStatics<readonly [false, "noopen"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoOpen/NoOpen.schema.ts#L70)

Since v0.0.0

## NoOpenValue

Schema for the `X-Download-Options` header value.

**Example**

```ts
import * as S from "effect/Schema"
import { NoOpenValue } from "@beep/schema/NoOpen"

console.log(S.is(NoOpenValue)("noopen")) // true
```

**Signature**

```ts
declare const NoOpenValue: LiteralKit<readonly ["noopen"], undefined> & SchemaStatics<LiteralKit<readonly ["noopen"], undefined>> & LiteralKitStatics<readonly ["noopen"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoOpen/NoOpen.schema.ts#L39)

Since v0.0.0

## Option

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Option: LiteralKit<readonly [false, "noopen"], undefined> & SchemaStatics<LiteralKit<readonly [false, "noopen"], undefined>> & LiteralKitStatics<readonly [false, "noopen"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoOpen/NoOpen.schema.ts#L200)

Since v0.0.0

## ResponseHeader

Public aliases for concise namespace roles.

**Signature**

```ts
declare const ResponseHeader: typeof NoOpenResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoOpen/NoOpen.schema.ts#L200)

Since v0.0.0

## Value

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Value: LiteralKit<readonly ["noopen"], undefined> & SchemaStatics<LiteralKit<readonly ["noopen"], undefined>> & LiteralKitStatics<readonly ["noopen"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/NoOpen/NoOpen.schema.ts#L200)

Since v0.0.0