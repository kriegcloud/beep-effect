---
title: PermittedCrossDomainPolicies.schema.ts
nav_order: 173
parent: "@beep/schema"
---

## PermittedCrossDomainPolicies.schema.ts overview

Schema for the `X-Permitted-Cross-Domain-Policies` header.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [PermittedCrossDomainPoliciesHeader (type alias)](#permittedcrossdomainpoliciesheader-type-alias)
  - [PermittedCrossDomainPoliciesOption (type alias)](#permittedcrossdomainpoliciesoption-type-alias)
  - [PermittedCrossDomainPoliciesResponseHeader (class)](#permittedcrossdomainpoliciesresponseheader-class)
  - [PermittedCrossDomainPoliciesValue (type alias)](#permittedcrossdomainpoliciesvalue-type-alias)
- [schemas](#schemas)
  - [Header](#header)
  - [Option](#option)
  - [PermittedCrossDomainPoliciesHeader](#permittedcrossdomainpoliciesheader)
  - [PermittedCrossDomainPoliciesOption](#permittedcrossdomainpoliciesoption)
  - [PermittedCrossDomainPoliciesValue](#permittedcrossdomainpoliciesvalue)
  - [ResponseHeader](#responseheader)
  - [Value](#value)
---

# models

## PermittedCrossDomainPoliciesHeader (type alias)

Type for rendered `X-Permitted-Cross-Domain-Policies` response headers.

**Signature**

```ts
type PermittedCrossDomainPoliciesHeader = typeof PermittedCrossDomainPoliciesHeader.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts#L206)

Since v0.0.0

## PermittedCrossDomainPoliciesOption (type alias)

Type for enabled or disabled cross-domain policy options.

**Signature**

```ts
type PermittedCrossDomainPoliciesOption = typeof PermittedCrossDomainPoliciesOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts#L89)

Since v0.0.0

## PermittedCrossDomainPoliciesResponseHeader (class)

Model for a rendered `X-Permitted-Cross-Domain-Policies` response header.

**Example**

```ts
import * as O from "effect/Option"
import { PermittedCrossDomainPoliciesResponseHeader } from "@beep/schema/PermittedCrossDomainPolicies"

const header = PermittedCrossDomainPoliciesResponseHeader.make({
  name: "X-Permitted-Cross-Domain-Policies",
  value: O.some("none"),
})
console.log(header.name)
```

**Signature**

```ts
declare class PermittedCrossDomainPoliciesResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts#L109)

Since v0.0.0

## PermittedCrossDomainPoliciesValue (type alias)

Type for allowed `X-Permitted-Cross-Domain-Policies` values.

**Signature**

```ts
type PermittedCrossDomainPoliciesValue = typeof PermittedCrossDomainPoliciesValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts#L58)

Since v0.0.0

# schemas

## Header

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Header: S.decodeTo<typeof PermittedCrossDomainPoliciesResponseHeader, S.Union<readonly [LiteralKit<readonly [false, "none", "master-only", "by-content-type", "by-ftp-filename", "all"], undefined> & SchemaStatics<LiteralKit<readonly [false, "none", "master-only", "by-content-type", "by-ftp-filename", "all"], undefined>> & LiteralKitStatics<readonly [false, "none", "master-only", "by-content-type", "by-ftp-filename", "all"]>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof PermittedCrossDomainPoliciesResponseHeader, S.Union<readonly [LiteralKit<readonly [false, "none", "master-only", "by-content-type", "by-ftp-filename", "all"], undefined> & SchemaStatics<LiteralKit<readonly [false, "none", "master-only", "by-content-type", "by-ftp-filename", "all"], undefined>> & LiteralKitStatics<readonly [false, "none", "master-only", "by-content-type", "by-ftp-filename", "all"]>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | PermittedCrossDomainPoliciesOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | PermittedCrossDomainPoliciesOption, headerValueCreator?: undefined | ((option?: undefined | PermittedCrossDomainPoliciesOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts#L215)

Since v0.0.0

## Option

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Option: LiteralKit<readonly [false, "none", "master-only", "by-content-type", "by-ftp-filename", "all"], undefined> & SchemaStatics<LiteralKit<readonly [false, "none", "master-only", "by-content-type", "by-ftp-filename", "all"], undefined>> & LiteralKitStatics<readonly [false, "none", "master-only", "by-content-type", "by-ftp-filename", "all"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts#L216)

Since v0.0.0

## PermittedCrossDomainPoliciesHeader

Schema that renders cross-domain policy options into a response header.

**Example**

```ts
import * as S from "effect/Schema"
import { PermittedCrossDomainPoliciesHeader } from "@beep/schema/PermittedCrossDomainPolicies"

const header = S.decodeUnknownSync(PermittedCrossDomainPoliciesHeader)("none")
console.log(header.name)
```

**Signature**

```ts
declare const PermittedCrossDomainPoliciesHeader: S.decodeTo<typeof PermittedCrossDomainPoliciesResponseHeader, S.Union<readonly [LiteralKit<readonly [false, "none", "master-only", "by-content-type", "by-ftp-filename", "all"], undefined> & SchemaStatics<LiteralKit<readonly [false, "none", "master-only", "by-content-type", "by-ftp-filename", "all"], undefined>> & LiteralKitStatics<readonly [false, "none", "master-only", "by-content-type", "by-ftp-filename", "all"]>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof PermittedCrossDomainPoliciesResponseHeader, S.Union<readonly [LiteralKit<readonly [false, "none", "master-only", "by-content-type", "by-ftp-filename", "all"], undefined> & SchemaStatics<LiteralKit<readonly [false, "none", "master-only", "by-content-type", "by-ftp-filename", "all"], undefined>> & LiteralKitStatics<readonly [false, "none", "master-only", "by-content-type", "by-ftp-filename", "all"]>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | PermittedCrossDomainPoliciesOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | PermittedCrossDomainPoliciesOption, headerValueCreator?: undefined | ((option?: undefined | PermittedCrossDomainPoliciesOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts#L138)

Since v0.0.0

## PermittedCrossDomainPoliciesOption

Schema for enabled or disabled cross-domain policy options.

**Example**

```ts
import * as S from "effect/Schema"
import { PermittedCrossDomainPoliciesOption } from "@beep/schema/PermittedCrossDomainPolicies"

console.log(S.decodeUnknownSync(PermittedCrossDomainPoliciesOption)("master-only"))
```

**Signature**

```ts
declare const PermittedCrossDomainPoliciesOption: LiteralKit<readonly [false, "none", "master-only", "by-content-type", "by-ftp-filename", "all"], undefined> & SchemaStatics<LiteralKit<readonly [false, "none", "master-only", "by-content-type", "by-ftp-filename", "all"], undefined>> & LiteralKitStatics<readonly [false, "none", "master-only", "by-content-type", "by-ftp-filename", "all"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts#L76)

Since v0.0.0

## PermittedCrossDomainPoliciesValue

Schema for allowed `X-Permitted-Cross-Domain-Policies` values.

**Example**

```ts
import * as S from "effect/Schema"
import { PermittedCrossDomainPoliciesValue } from "@beep/schema/PermittedCrossDomainPolicies"

console.log(S.is(PermittedCrossDomainPoliciesValue)("none")) // true
```

**Signature**

```ts
declare const PermittedCrossDomainPoliciesValue: LiteralKit<readonly ["none", "master-only", "by-content-type", "by-ftp-filename", "all"], undefined> & SchemaStatics<LiteralKit<readonly ["none", "master-only", "by-content-type", "by-ftp-filename", "all"], undefined>> & LiteralKitStatics<readonly ["none", "master-only", "by-content-type", "by-ftp-filename", "all"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts#L45)

Since v0.0.0

## ResponseHeader

Public aliases for concise namespace roles.

**Signature**

```ts
declare const ResponseHeader: typeof PermittedCrossDomainPoliciesResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts#L217)

Since v0.0.0

## Value

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Value: LiteralKit<readonly ["none", "master-only", "by-content-type", "by-ftp-filename", "all"], undefined> & SchemaStatics<LiteralKit<readonly ["none", "master-only", "by-content-type", "by-ftp-filename", "all"], undefined>> & LiteralKitStatics<readonly ["none", "master-only", "by-content-type", "by-ftp-filename", "all"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermittedCrossDomainPolicies/PermittedCrossDomainPolicies.schema.ts#L218)

Since v0.0.0