---
title: CrossOriginOpenerPolicy.schema.ts
nav_order: 24
parent: "@beep/schema"
---

## CrossOriginOpenerPolicy.schema.ts overview

Schema for the `Cross-Origin-Opener-Policy` header.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [CoopValue (type alias)](#coopvalue-type-alias)
  - [CrossOriginOpenerPolicyHeader (type alias)](#crossoriginopenerpolicyheader-type-alias)
  - [CrossOriginOpenerPolicyOption (type alias)](#crossoriginopenerpolicyoption-type-alias)
  - [CrossOriginOpenerPolicyResponseHeader (class)](#crossoriginopenerpolicyresponseheader-class)
- [schemas](#schemas)
  - [CoopValue](#coopvalue)
  - [CrossOriginOpenerPolicyHeader](#crossoriginopenerpolicyheader)
  - [CrossOriginOpenerPolicyOption](#crossoriginopenerpolicyoption)
  - [Header](#header)
  - [Option](#option)
  - [ResponseHeader](#responseheader)
---

# models

## CoopValue (type alias)

Type-level representation of `CoopValue`.

**Signature**

```ts
type CoopValue = typeof CoopValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts#L52)

Since v0.0.0

## CrossOriginOpenerPolicyHeader (type alias)

Type-level representation of `CrossOriginOpenerPolicyHeader`.

**Signature**

```ts
type CrossOriginOpenerPolicyHeader = typeof CrossOriginOpenerPolicyHeader.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts#L193)

Since v0.0.0

## CrossOriginOpenerPolicyOption (type alias)

Type-level representation of `CrossOriginOpenerPolicyOption`.

**Signature**

```ts
type CrossOriginOpenerPolicyOption = typeof CrossOriginOpenerPolicyOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts#L84)

Since v0.0.0

## CrossOriginOpenerPolicyResponseHeader (class)

Parsed `Cross-Origin-Opener-Policy` response header with name and optional value.

**Example**

```ts
import * as Option from "effect/Option"
import { CrossOriginOpenerPolicyResponseHeader } from "@beep/schema/CrossOriginOpenerPolicy"

const header = new CrossOriginOpenerPolicyResponseHeader({
  name: "Cross-Origin-Opener-Policy",
  value: Option.some("same-origin")
})
console.log(header)
```

**Signature**

```ts
declare class CrossOriginOpenerPolicyResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts#L104)

Since v0.0.0

# schemas

## CoopValue

Schema for supported `Cross-Origin-Opener-Policy` header values.

**Example**

```ts
import * as S from "effect/Schema"
import { CoopValue } from "@beep/schema/CrossOriginOpenerPolicy"

const decoded = S.decodeUnknownSync(CoopValue)("same-origin")
console.log(decoded)
```

**Signature**

```ts
declare const CoopValue: LiteralKit<readonly ["unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"], undefined> & SchemaStatics<LiteralKit<readonly ["unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"], undefined>> & LiteralKitStatics<readonly ["unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts#L39)

Since v0.0.0

## CrossOriginOpenerPolicyHeader

One-way schema that decodes COOP options into the `Cross-Origin-Opener-Policy` response header.

**Example**

```ts
import { Effect } from "effect"
import { CrossOriginOpenerPolicyHeader } from "@beep/schema/CrossOriginOpenerPolicy"

const program = CrossOriginOpenerPolicyHeader.create("same-origin")
console.log(program)
```

**Signature**

```ts
declare const CrossOriginOpenerPolicyHeader: S.decodeTo<typeof CrossOriginOpenerPolicyResponseHeader, S.Union<readonly [LiteralKit<readonly [false, "unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"], undefined> & SchemaStatics<LiteralKit<readonly [false, "unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"], undefined>> & LiteralKitStatics<readonly [false, "unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"]>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof CrossOriginOpenerPolicyResponseHeader, S.Union<readonly [LiteralKit<readonly [false, "unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"], undefined> & SchemaStatics<LiteralKit<readonly [false, "unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"], undefined>> & LiteralKitStatics<readonly [false, "unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"]>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | CrossOriginOpenerPolicyOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | CrossOriginOpenerPolicyOption, headerValueCreator?: undefined | ((option?: undefined | CrossOriginOpenerPolicyOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts#L133)

Since v0.0.0

## CrossOriginOpenerPolicyOption

Schema for `Cross-Origin-Opener-Policy` option values, including `false` to disable.

**Example**

```ts
import * as S from "effect/Schema"
import { CrossOriginOpenerPolicyOption } from "@beep/schema/CrossOriginOpenerPolicy"

const decoded = S.decodeUnknownSync(CrossOriginOpenerPolicyOption)(false)
console.log(decoded)
```

**Signature**

```ts
declare const CrossOriginOpenerPolicyOption: LiteralKit<readonly [false, "unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"], undefined> & SchemaStatics<LiteralKit<readonly [false, "unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"], undefined>> & LiteralKitStatics<readonly [false, "unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts#L71)

Since v0.0.0

## Header

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Header: S.decodeTo<typeof CrossOriginOpenerPolicyResponseHeader, S.Union<readonly [LiteralKit<readonly [false, "unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"], undefined> & SchemaStatics<LiteralKit<readonly [false, "unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"], undefined>> & LiteralKitStatics<readonly [false, "unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"]>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof CrossOriginOpenerPolicyResponseHeader, S.Union<readonly [LiteralKit<readonly [false, "unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"], undefined> & SchemaStatics<LiteralKit<readonly [false, "unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"], undefined>> & LiteralKitStatics<readonly [false, "unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"]>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | CrossOriginOpenerPolicyOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | CrossOriginOpenerPolicyOption, headerValueCreator?: undefined | ((option?: undefined | CrossOriginOpenerPolicyOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts#L202)

Since v0.0.0

## Option

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Option: LiteralKit<readonly [false, "unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"], undefined> & SchemaStatics<LiteralKit<readonly [false, "unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"], undefined>> & LiteralKitStatics<readonly [false, "unsafe-none", "same-origin-allow-popups", "same-origin", "same-origin-plus-COEP"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts#L203)

Since v0.0.0

## ResponseHeader

Public aliases for concise namespace roles.

**Signature**

```ts
declare const ResponseHeader: typeof CrossOriginOpenerPolicyResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginOpenerPolicy/CrossOriginOpenerPolicy.schema.ts#L204)

Since v0.0.0