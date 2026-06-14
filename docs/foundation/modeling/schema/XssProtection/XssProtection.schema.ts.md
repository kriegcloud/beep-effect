---
title: XssProtection.schema.ts
nav_order: 222
parent: "@beep/schema"
---

## XssProtection.schema.ts overview

Schema for the `X-XSS-Protection` header.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [XSSProtectionHeader (type alias)](#xssprotectionheader-type-alias)
  - [XSSProtectionMode (type alias)](#xssprotectionmode-type-alias)
  - [XSSProtectionOption (type alias)](#xssprotectionoption-type-alias)
  - [XSSProtectionReport (type alias)](#xssprotectionreport-type-alias)
  - [XSSProtectionReportConfig (class)](#xssprotectionreportconfig-class)
  - [XSSProtectionResponseHeader (class)](#xssprotectionresponseheader-class)
- [schemas](#schemas)
  - [Header](#header)
  - [Mode](#mode)
  - [Option](#option)
  - [ResponseHeader](#responseheader)
  - [XSSProtectionHeader](#xssprotectionheader)
  - [XSSProtectionMode](#xssprotectionmode)
  - [XSSProtectionOption](#xssprotectionoption)
  - [XSSProtectionReport](#xssprotectionreport)
---

# models

## XSSProtectionHeader (type alias)

Type for rendered `X-XSS-Protection` response headers.

**Signature**

```ts
type XSSProtectionHeader = typeof XSSProtectionHeader.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/XssProtection/XssProtection.schema.ts#L270)

Since v0.0.0

## XSSProtectionMode (type alias)

Type for direct `X-XSS-Protection` policy modes.

**Signature**

```ts
type XSSProtectionMode = typeof XSSProtectionMode.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/XssProtection/XssProtection.schema.ts#L53)

Since v0.0.0

## XSSProtectionOption (type alias)

Type for enabled, disabled, or report-mode XSS protection options.

**Signature**

```ts
type XSSProtectionOption = typeof XSSProtectionOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/XssProtection/XssProtection.schema.ts#L136)

Since v0.0.0

## XSSProtectionReport (type alias)

Type for tuple-based `X-XSS-Protection` report configuration.

**Signature**

```ts
type XSSProtectionReport = typeof XSSProtectionReport.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/XssProtection/XssProtection.schema.ts#L108)

Since v0.0.0

## XSSProtectionReportConfig (class)

Configuration for `X-XSS-Protection` report mode.

**Example**

```ts
import { XSSProtectionReportConfig } from "@beep/schema/XssProtection"

const config = XSSProtectionReportConfig.make({ uri: "https://example.com/report" })
console.log(config.uri)
```

**Signature**

```ts
declare class XSSProtectionReportConfig
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/XssProtection/XssProtection.schema.ts#L69)

Since v0.0.0

## XSSProtectionResponseHeader (class)

Model for a rendered `X-XSS-Protection` response header.

**Example**

```ts
import * as O from "effect/Option"
import { XSSProtectionResponseHeader } from "@beep/schema/XssProtection"

const header = XSSProtectionResponseHeader.make({ name: "X-XSS-Protection", value: O.some("1") })
console.log(header.name)
```

**Signature**

```ts
declare class XSSProtectionResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/XssProtection/XssProtection.schema.ts#L153)

Since v0.0.0

# schemas

## Header

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Header: S.decodeTo<typeof XSSProtectionResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<false>, LiteralKit<readonly ["sanitize", "block-rendering"], undefined> & SchemaStatics<LiteralKit<readonly ["sanitize", "block-rendering"], undefined>> & LiteralKitStatics<readonly ["sanitize", "block-rendering"]>, AnnotatedSchema<S.Tuple<readonly [S.Literal<"report">, typeof XSSProtectionReportConfig]>>]>>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof XSSProtectionResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<false>, LiteralKit<readonly ["sanitize", "block-rendering"], undefined> & SchemaStatics<LiteralKit<readonly ["sanitize", "block-rendering"], undefined>> & LiteralKitStatics<readonly ["sanitize", "block-rendering"]>, AnnotatedSchema<S.Tuple<readonly [S.Literal<"report">, typeof XSSProtectionReportConfig]>>]>>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | XSSProtectionOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: false | "sanitize" | "block-rendering" | readonly ["report", XSSProtectionReportConfig] | undefined, headerValueCreator?: ((option?: undefined | XSSProtectionOption) => Effect.Effect<O.Option<string>, SecureHeaderError>) | undefined) => Effect.Effect<O.Option<internal.ResponseHeader>, CspError | ForceHttpsRedirectError | XssProtectionError | ReferrerPolicyError | NoSniffError | NoOpenError | FrameGuardError | ExpectCtError | PermissionsPolicyError | CrossOriginOpenerPolicyError | CrossOriginEmbedderPolicyError | CrossOriginResourcePolicyError | PermittedCrossDomainPoliciesError | CoreError, never>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/XssProtection/XssProtection.schema.ts#L279)

Since v0.0.0

## Mode

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Mode: LiteralKit<readonly ["sanitize", "block-rendering"], undefined> & SchemaStatics<LiteralKit<readonly ["sanitize", "block-rendering"], undefined>> & LiteralKitStatics<readonly ["sanitize", "block-rendering"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/XssProtection/XssProtection.schema.ts#L280)

Since v0.0.0

## Option

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Option: AnnotatedSchema<S.Union<readonly [S.Literal<false>, LiteralKit<readonly ["sanitize", "block-rendering"], undefined> & SchemaStatics<LiteralKit<readonly ["sanitize", "block-rendering"], undefined>> & LiteralKitStatics<readonly ["sanitize", "block-rendering"]>, AnnotatedSchema<S.Tuple<readonly [S.Literal<"report">, typeof XSSProtectionReportConfig]>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/XssProtection/XssProtection.schema.ts#L281)

Since v0.0.0

## ResponseHeader

Public aliases for concise namespace roles.

**Signature**

```ts
declare const ResponseHeader: typeof XSSProtectionResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/XssProtection/XssProtection.schema.ts#L282)

Since v0.0.0

## XSSProtectionHeader

Schema that renders XSS protection options into a response header.

**Example**

```ts
import * as S from "effect/Schema"
import { XSSProtectionHeader } from "@beep/schema/XssProtection"

const header = S.decodeUnknownSync(XSSProtectionHeader)("block-rendering")
console.log(header.name)
```

**Signature**

```ts
declare const XSSProtectionHeader: S.decodeTo<typeof XSSProtectionResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<false>, LiteralKit<readonly ["sanitize", "block-rendering"], undefined> & SchemaStatics<LiteralKit<readonly ["sanitize", "block-rendering"], undefined>> & LiteralKitStatics<readonly ["sanitize", "block-rendering"]>, AnnotatedSchema<S.Tuple<readonly [S.Literal<"report">, typeof XSSProtectionReportConfig]>>]>>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof XSSProtectionResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<false>, LiteralKit<readonly ["sanitize", "block-rendering"], undefined> & SchemaStatics<LiteralKit<readonly ["sanitize", "block-rendering"], undefined>> & LiteralKitStatics<readonly ["sanitize", "block-rendering"]>, AnnotatedSchema<S.Tuple<readonly [S.Literal<"report">, typeof XSSProtectionReportConfig]>>]>>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | XSSProtectionOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: false | "sanitize" | "block-rendering" | readonly ["report", XSSProtectionReportConfig] | undefined, headerValueCreator?: ((option?: undefined | XSSProtectionOption) => Effect.Effect<O.Option<string>, SecureHeaderError>) | undefined) => Effect.Effect<O.Option<internal.ResponseHeader>, CspError | ForceHttpsRedirectError | XssProtectionError | ReferrerPolicyError | NoSniffError | NoOpenError | FrameGuardError | ExpectCtError | PermissionsPolicyError | CrossOriginOpenerPolicyError | CrossOriginEmbedderPolicyError | CrossOriginResourcePolicyError | PermittedCrossDomainPoliciesError | CoreError, never>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/XssProtection/XssProtection.schema.ts#L217)

Since v0.0.0

## XSSProtectionMode

Schema for direct `X-XSS-Protection` policy modes.

**Example**

```ts
import * as S from "effect/Schema"
import { XSSProtectionMode } from "@beep/schema/XssProtection"

console.log(S.is(XSSProtectionMode)("block-rendering")) // true
```

**Signature**

```ts
declare const XSSProtectionMode: LiteralKit<readonly ["sanitize", "block-rendering"], undefined> & SchemaStatics<LiteralKit<readonly ["sanitize", "block-rendering"], undefined>> & LiteralKitStatics<readonly ["sanitize", "block-rendering"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/XssProtection/XssProtection.schema.ts#L40)

Since v0.0.0

## XSSProtectionOption

Schema for enabled, disabled, or report-mode XSS protection options.

**Example**

```ts
import * as S from "effect/Schema"
import { XSSProtectionOption } from "@beep/schema/XssProtection"

console.log(S.decodeUnknownSync(XSSProtectionOption)("sanitize"))
```

**Signature**

```ts
declare const XSSProtectionOption: AnnotatedSchema<S.Union<readonly [S.Literal<false>, LiteralKit<readonly ["sanitize", "block-rendering"], undefined> & SchemaStatics<LiteralKit<readonly ["sanitize", "block-rendering"], undefined>> & LiteralKitStatics<readonly ["sanitize", "block-rendering"]>, AnnotatedSchema<S.Tuple<readonly [S.Literal<"report">, typeof XSSProtectionReportConfig]>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/XssProtection/XssProtection.schema.ts#L124)

Since v0.0.0

## XSSProtectionReport

Schema for tuple-based `X-XSS-Protection` report configuration.

**Example**

```ts
import * as S from "effect/Schema"
import { XSSProtectionReport, XSSProtectionReportConfig } from "@beep/schema/XssProtection"

const value = S.decodeUnknownSync(XSSProtectionReport)([
  "report",
  XSSProtectionReportConfig.make({ uri: "https://example.com/report" }),
])
console.log(value[0])
```

**Signature**

```ts
declare const XSSProtectionReport: AnnotatedSchema<S.Tuple<readonly [S.Literal<"report">, typeof XSSProtectionReportConfig]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/XssProtection/XssProtection.schema.ts#L96)

Since v0.0.0