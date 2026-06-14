---
title: ForceHttpsRedirect.schema.ts
nav_order: 97
parent: "@beep/schema"
---

## ForceHttpsRedirect.schema.ts overview

Schema for the `Strict-Transport-Security` header.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [ForceHttpsRedirectConfig (class)](#forcehttpsredirectconfig-class)
  - [ForceHttpsRedirectEnabled (type alias)](#forcehttpsredirectenabled-type-alias)
  - [ForceHttpsRedirectHeader (type alias)](#forcehttpsredirectheader-type-alias)
  - [ForceHttpsRedirectOption (type alias)](#forcehttpsredirectoption-type-alias)
  - [ForceHttpsRedirectResponseHeader (class)](#forcehttpsredirectresponseheader-class)
- [schemas](#schemas)
  - [Config](#config)
  - [ForceHttpsRedirectEnabled](#forcehttpsredirectenabled)
  - [ForceHttpsRedirectHeader](#forcehttpsredirectheader)
  - [ForceHttpsRedirectOption](#forcehttpsredirectoption)
  - [Header](#header)
  - [Option](#option)
  - [ResponseHeader](#responseheader)
---

# models

## ForceHttpsRedirectConfig (class)

Configuration for the `Strict-Transport-Security` header.

**Example**

```ts
import { ForceHttpsRedirectConfig } from "@beep/schema/ForceHttpsRedirect"

const config = ForceHttpsRedirectConfig.make({ includeSubDomains: true, preload: true })
console.log(config.includeSubDomains)
```

**Signature**

```ts
declare class ForceHttpsRedirectConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts#L38)

Since v0.0.0

## ForceHttpsRedirectEnabled (type alias)

Type for tuple-based enabled `Strict-Transport-Security` configuration.

**Signature**

```ts
type ForceHttpsRedirectEnabled = typeof ForceHttpsRedirectEnabled.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts#L79)

Since v0.0.0

## ForceHttpsRedirectHeader (type alias)

Type for rendered `Strict-Transport-Security` response headers.

**Signature**

```ts
type ForceHttpsRedirectHeader = typeof ForceHttpsRedirectHeader.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts#L238)

Since v0.0.0

## ForceHttpsRedirectOption (type alias)

Type for enabled or disabled `Strict-Transport-Security` options.

**Signature**

```ts
type ForceHttpsRedirectOption = typeof ForceHttpsRedirectOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts#L107)

Since v0.0.0

## ForceHttpsRedirectResponseHeader (class)

Model for a rendered `Strict-Transport-Security` response header.

**Example**

```ts
import * as O from "effect/Option"
import { ForceHttpsRedirectResponseHeader } from "@beep/schema/ForceHttpsRedirect"

const header = ForceHttpsRedirectResponseHeader.make({
  name: "Strict-Transport-Security",
  value: O.some("max-age=31536000"),
})
console.log(header.name)
```

**Signature**

```ts
declare class ForceHttpsRedirectResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts#L127)

Since v0.0.0

# schemas

## Config

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Config: typeof ForceHttpsRedirectConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts#L247)

Since v0.0.0

## ForceHttpsRedirectEnabled

Schema for tuple-based enabled `Strict-Transport-Security` configuration.

**Example**

```ts
import * as S from "effect/Schema"
import { ForceHttpsRedirectConfig, ForceHttpsRedirectEnabled } from "@beep/schema/ForceHttpsRedirect"

const enabled = S.decodeUnknownSync(ForceHttpsRedirectEnabled)([
  true,
  ForceHttpsRedirectConfig.make({ includeSubDomains: true }),
])
console.log(enabled[0])
```

**Signature**

```ts
declare const ForceHttpsRedirectEnabled: AnnotatedSchema<S.Tuple<readonly [S.Literal<true>, typeof ForceHttpsRedirectConfig]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts#L67)

Since v0.0.0

## ForceHttpsRedirectHeader

Schema that renders Strict-Transport-Security options into a response header.

**Example**

```ts
import * as S from "effect/Schema"
import { ForceHttpsRedirectHeader } from "@beep/schema/ForceHttpsRedirect"

const header = S.decodeUnknownSync(ForceHttpsRedirectHeader)(true)
console.log(header.name)
```

**Signature**

```ts
declare const ForceHttpsRedirectHeader: S.decodeTo<typeof ForceHttpsRedirectResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Boolean, AnnotatedSchema<S.Tuple<readonly [S.Literal<true>, typeof ForceHttpsRedirectConfig]>>]>>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof ForceHttpsRedirectResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Boolean, AnnotatedSchema<S.Tuple<readonly [S.Literal<true>, typeof ForceHttpsRedirectConfig]>>]>>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | ForceHttpsRedirectOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | ForceHttpsRedirectOption, headerValueCreator?: undefined | ((option?: undefined | ForceHttpsRedirectOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts#L167)

Since v0.0.0

## ForceHttpsRedirectOption

Schema for enabled or disabled `Strict-Transport-Security` options.

**Example**

```ts
import * as S from "effect/Schema"
import { ForceHttpsRedirectOption } from "@beep/schema/ForceHttpsRedirect"

console.log(S.decodeUnknownSync(ForceHttpsRedirectOption)(true))
```

**Signature**

```ts
declare const ForceHttpsRedirectOption: AnnotatedSchema<S.Union<readonly [S.Boolean, AnnotatedSchema<S.Tuple<readonly [S.Literal<true>, typeof ForceHttpsRedirectConfig]>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts#L95)

Since v0.0.0

## Header

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Header: S.decodeTo<typeof ForceHttpsRedirectResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Boolean, AnnotatedSchema<S.Tuple<readonly [S.Literal<true>, typeof ForceHttpsRedirectConfig]>>]>>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof ForceHttpsRedirectResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Boolean, AnnotatedSchema<S.Tuple<readonly [S.Literal<true>, typeof ForceHttpsRedirectConfig]>>]>>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | ForceHttpsRedirectOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | ForceHttpsRedirectOption, headerValueCreator?: undefined | ((option?: undefined | ForceHttpsRedirectOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts#L248)

Since v0.0.0

## Option

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Option: AnnotatedSchema<S.Union<readonly [S.Boolean, AnnotatedSchema<S.Tuple<readonly [S.Literal<true>, typeof ForceHttpsRedirectConfig]>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts#L249)

Since v0.0.0

## ResponseHeader

Public aliases for concise namespace roles.

**Signature**

```ts
declare const ResponseHeader: typeof ForceHttpsRedirectResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/ForceHttpsRedirect/ForceHttpsRedirect.schema.ts#L250)

Since v0.0.0