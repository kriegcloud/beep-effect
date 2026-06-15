---
title: PermissionsPolicy.schema.ts
nav_order: 171
parent: "@beep/schema"
---

## PermissionsPolicy.schema.ts overview

Schema for the `Permissions-Policy` header.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [PermissionsPolicyAllowlistedOrigin (type alias)](#permissionspolicyallowlistedorigin-type-alias)
  - [PermissionsPolicyDirective (type alias)](#permissionspolicydirective-type-alias)
  - [PermissionsPolicyDirectiveKey (type alias)](#permissionspolicydirectivekey-type-alias)
  - [PermissionsPolicyDirectiveValue (type alias)](#permissionspolicydirectivevalue-type-alias)
  - [PermissionsPolicyDirectiveValueSingle (type alias)](#permissionspolicydirectivevaluesingle-type-alias)
  - [PermissionsPolicyDirectives (type alias)](#permissionspolicydirectives-type-alias)
  - [PermissionsPolicyHeader (type alias)](#permissionspolicyheader-type-alias)
  - [PermissionsPolicyOption (type alias)](#permissionspolicyoption-type-alias)
  - [PermissionsPolicyOptionStruct (class)](#permissionspolicyoptionstruct-class)
  - [PermissionsPolicyResponseHeader (class)](#permissionspolicyresponseheader-class)
  - [QuotedOrigin (type alias)](#quotedorigin-type-alias)
- [schemas](#schemas)
  - [Header](#header)
  - [Option](#option)
  - [PermissionsPolicyAllowlistedOrigin](#permissionspolicyallowlistedorigin)
  - [PermissionsPolicyDirective](#permissionspolicydirective)
  - [PermissionsPolicyDirectiveKey](#permissionspolicydirectivekey)
  - [PermissionsPolicyDirectiveValue](#permissionspolicydirectivevalue)
  - [PermissionsPolicyDirectiveValueSingle](#permissionspolicydirectivevaluesingle)
  - [PermissionsPolicyDirectives](#permissionspolicydirectives)
  - [PermissionsPolicyHeader](#permissionspolicyheader)
  - [PermissionsPolicyOption](#permissionspolicyoption)
  - [QuotedOrigin](#quotedorigin)
  - [ResponseHeader](#responseheader)
---

# models

## PermissionsPolicyAllowlistedOrigin (type alias)

Type for origins accepted inside list-valued directives.

**Signature**

```ts
type PermissionsPolicyAllowlistedOrigin = typeof PermissionsPolicyAllowlistedOrigin.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L209)

Since v0.0.0

## PermissionsPolicyDirective (type alias)

Type for supported `Permissions-Policy` directive names.

**Signature**

```ts
type PermissionsPolicyDirective = typeof PermissionsPolicyDirective.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L81)

Since v0.0.0

## PermissionsPolicyDirectiveKey (type alias)

Type for record keys accepted by `PermissionsPolicyDirectives`.

**Signature**

```ts
type PermissionsPolicyDirectiveKey = typeof PermissionsPolicyDirectiveKey.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L116)

Since v0.0.0

## PermissionsPolicyDirectiveValue (type alias)

Type for any directive value accepted by `Permissions-Policy`.

**Signature**

```ts
type PermissionsPolicyDirectiveValue = typeof PermissionsPolicyDirectiveValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L241)

Since v0.0.0

## PermissionsPolicyDirectiveValueSingle (type alias)

Type for single-token directive allowlist values.

**Signature**

```ts
type PermissionsPolicyDirectiveValueSingle = typeof PermissionsPolicyDirectiveValueSingle.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L181)

Since v0.0.0

## PermissionsPolicyDirectives (type alias)

Type for a directive map used to build the header value.

**Signature**

```ts
type PermissionsPolicyDirectives = typeof PermissionsPolicyDirectives.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L273)

Since v0.0.0

## PermissionsPolicyHeader (type alias)

Type for rendered `Permissions-Policy` response headers.

**Signature**

```ts
type PermissionsPolicyHeader = typeof PermissionsPolicyHeader.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L465)

Since v0.0.0

## PermissionsPolicyOption (type alias)

Type for enabled or disabled `Permissions-Policy` configuration.

**Signature**

```ts
type PermissionsPolicyOption = typeof PermissionsPolicyOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L326)

Since v0.0.0

## PermissionsPolicyOptionStruct (class)

Structured configuration for the `Permissions-Policy` header.

**Example**

```ts
import { PermissionsPolicyOptionStruct } from "@beep/schema/PermissionsPolicy"

const option = PermissionsPolicyOptionStruct.make({ directives: { camera: "none" } })
console.log(option.directives.camera)
```

**Signature**

```ts
declare class PermissionsPolicyOptionStruct
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L289)

Since v0.0.0

## PermissionsPolicyResponseHeader (class)

Model for the rendered `Permissions-Policy` response header.

**Example**

```ts
import * as O from "effect/Option"
import { PermissionsPolicyResponseHeader } from "@beep/schema/PermissionsPolicy"

const header = PermissionsPolicyResponseHeader.make({ name: "Permissions-Policy", value: O.some("camera=()") })
console.log(header.name)
```

**Signature**

```ts
declare class PermissionsPolicyResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L343)

Since v0.0.0

## QuotedOrigin (type alias)

Type for quoted origin values in directive allowlists.

**Signature**

```ts
type QuotedOrigin = typeof QuotedOrigin.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L150)

Since v0.0.0

# schemas

## Header

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Header: S.decodeTo<typeof PermissionsPolicyResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<false>, typeof PermissionsPolicyOptionStruct]>>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof PermissionsPolicyResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<false>, typeof PermissionsPolicyOptionStruct]>>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | PermissionsPolicyOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | PermissionsPolicyOption, headerValueCreator?: undefined | ((option?: undefined | PermissionsPolicyOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L474)

Since v0.0.0

## Option

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Option: AnnotatedSchema<S.Union<readonly [S.Literal<false>, typeof PermissionsPolicyOptionStruct]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L475)

Since v0.0.0

## PermissionsPolicyAllowlistedOrigin

Schema for origins accepted inside list-valued directives.

**Example**

```ts
import * as S from "effect/Schema"
import { PermissionsPolicyAllowlistedOrigin } from "@beep/schema/PermissionsPolicy"

console.log(S.decodeUnknownSync(PermissionsPolicyAllowlistedOrigin)("self"))
```

**Signature**

```ts
declare const PermissionsPolicyAllowlistedOrigin: AnnotatedSchema<S.Union<readonly [S.Literal<"self">, AnnotatedSchema<S.String>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L197)

Since v0.0.0

## PermissionsPolicyDirective

Schema for supported `Permissions-Policy` directive names.

**Example**

```ts
import * as S from "effect/Schema"
import { PermissionsPolicyDirective } from "@beep/schema/PermissionsPolicy"

console.log(S.is(PermissionsPolicyDirective)("camera")) // true
```

**Signature**

```ts
declare const PermissionsPolicyDirective: LiteralKit<readonly ["accelerometer", "ambient-light-sensor", "autoplay", "battery", "camera", "cross-origin-isolated", "display-capture", "document-domain", "encrypted-media", "execution-while-not-rendered", "execution-while-out-of-viewport", "fullscreen", "geolocation", "gyroscope", "keyboard-map", "magnetometer", "microphone", "midi", "navigation-override", "payment", "picture-in-picture", "publickey-credentials-get", "screen-wake-lock", "sync-xhr", "usb", "web-share", "xr-spatial-tracking"], undefined> & SchemaStatics<LiteralKit<readonly ["accelerometer", "ambient-light-sensor", "autoplay", "battery", "camera", "cross-origin-isolated", "display-capture", "document-domain", "encrypted-media", "execution-while-not-rendered", "execution-while-out-of-viewport", "fullscreen", "geolocation", "gyroscope", "keyboard-map", "magnetometer", "microphone", "midi", "navigation-override", "payment", "picture-in-picture", "publickey-credentials-get", "screen-wake-lock", "sync-xhr", "usb", "web-share", "xr-spatial-tracking"], undefined>> & LiteralKitStatics<readonly ["accelerometer", "ambient-light-sensor", "autoplay", "battery", "camera", "cross-origin-isolated", "display-capture", "document-domain", "encrypted-media", "execution-while-not-rendered", "execution-while-out-of-viewport", "fullscreen", "geolocation", "gyroscope", "keyboard-map", "magnetometer", "microphone", "midi", "navigation-override", "payment", "picture-in-picture", "publickey-credentials-get", "screen-wake-lock", "sync-xhr", "usb", "web-share", "xr-spatial-tracking"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L68)

Since v0.0.0

## PermissionsPolicyDirectiveKey

Schema for record keys accepted by `PermissionsPolicyDirectives`.

**Example**

```ts
import * as S from "effect/Schema"
import { PermissionsPolicyDirectiveKey } from "@beep/schema/PermissionsPolicy"

console.log(S.decodeUnknownSync(PermissionsPolicyDirectiveKey)("fullscreen"))
```

**Signature**

```ts
declare const PermissionsPolicyDirectiveKey: AnnotatedSchema<S.String>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L97)

Since v0.0.0

## PermissionsPolicyDirectiveValue

Schema for any directive value accepted by `Permissions-Policy`.

**Example**

```ts
import * as S from "effect/Schema"
import { PermissionsPolicyDirectiveValue } from "@beep/schema/PermissionsPolicy"

console.log(S.decodeUnknownSync(PermissionsPolicyDirectiveValue)(["self"]))
```

**Signature**

```ts
declare const PermissionsPolicyDirectiveValue: AnnotatedSchema<S.Union<readonly [LiteralKit<readonly ["*", "self", "none"], undefined> & SchemaStatics<LiteralKit<readonly ["*", "self", "none"], undefined>> & LiteralKitStatics<readonly ["*", "self", "none"]>, AnnotatedSchema<S.String>, S.$Array<AnnotatedSchema<S.Union<readonly [S.Literal<"self">, AnnotatedSchema<S.String>]>>>]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L225)

Since v0.0.0

## PermissionsPolicyDirectiveValueSingle

Schema for single-token directive allowlist values.

**Example**

```ts
import * as S from "effect/Schema"
import { PermissionsPolicyDirectiveValueSingle } from "@beep/schema/PermissionsPolicy"

console.log(S.is(PermissionsPolicyDirectiveValueSingle)("self")) // true
```

**Signature**

```ts
declare const PermissionsPolicyDirectiveValueSingle: LiteralKit<readonly ["*", "self", "none"], undefined> & SchemaStatics<LiteralKit<readonly ["*", "self", "none"], undefined>> & LiteralKitStatics<readonly ["*", "self", "none"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L168)

Since v0.0.0

## PermissionsPolicyDirectives

Schema for a directive map used to build the header value.

**Example**

```ts
import * as S from "effect/Schema"
import { PermissionsPolicyDirectives } from "@beep/schema/PermissionsPolicy"

const directives = S.decodeUnknownSync(PermissionsPolicyDirectives)({ camera: "none" })
console.log(directives.camera)
```

**Signature**

```ts
declare const PermissionsPolicyDirectives: AnnotatedSchema<S.$Record<AnnotatedSchema<S.String>, AnnotatedSchema<S.Union<readonly [LiteralKit<readonly ["*", "self", "none"], undefined> & SchemaStatics<LiteralKit<readonly ["*", "self", "none"], undefined>> & LiteralKitStatics<readonly ["*", "self", "none"]>, AnnotatedSchema<S.String>, S.$Array<AnnotatedSchema<S.Union<readonly [S.Literal<"self">, AnnotatedSchema<S.String>]>>>]>>>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L258)

Since v0.0.0

## PermissionsPolicyHeader

Schema that renders options into a `Permissions-Policy` response header.

**Example**

```ts
import * as S from "effect/Schema"
import { PermissionsPolicyHeader } from "@beep/schema/PermissionsPolicy"

const header = S.decodeUnknownSync(PermissionsPolicyHeader)({ directives: { camera: "none" } })
console.log(header.value)
```

**Signature**

```ts
declare const PermissionsPolicyHeader: S.decodeTo<typeof PermissionsPolicyResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<false>, typeof PermissionsPolicyOptionStruct]>>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof PermissionsPolicyResponseHeader, S.Union<readonly [AnnotatedSchema<S.Union<readonly [S.Literal<false>, typeof PermissionsPolicyOptionStruct]>>, S.Undefined]>, never, never>> & { createValue: (option?: undefined | PermissionsPolicyOption) => Effect.Effect<O.Option<string>, SecureHeaderError>; create: (option?: undefined | PermissionsPolicyOption, headerValueCreator?: undefined | ((option?: undefined | PermissionsPolicyOption) => Effect.Effect<O.Option<string>, SecureHeaderError>)) => Effect.Effect<O.Option<internal.ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L402)

Since v0.0.0

## PermissionsPolicyOption

Schema for enabled or disabled `Permissions-Policy` configuration.

**Example**

```ts
import * as S from "effect/Schema"
import { PermissionsPolicyOption } from "@beep/schema/PermissionsPolicy"

console.log(S.decodeUnknownSync(PermissionsPolicyOption)(false))
```

**Signature**

```ts
declare const PermissionsPolicyOption: AnnotatedSchema<S.Union<readonly [S.Literal<false>, typeof PermissionsPolicyOptionStruct]>>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L314)

Since v0.0.0

## QuotedOrigin

Schema for quoted origin values in directive allowlists.

**Example**

```ts
import * as S from "effect/Schema"
import { QuotedOrigin } from "@beep/schema/PermissionsPolicy"

console.log(S.decodeUnknownSync(QuotedOrigin)("\"https://example.com\""))
```

**Signature**

```ts
declare const QuotedOrigin: AnnotatedSchema<S.String>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L132)

Since v0.0.0

## ResponseHeader

Public aliases for concise namespace roles.

**Signature**

```ts
declare const ResponseHeader: typeof PermissionsPolicyResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/PermissionsPolicy/PermissionsPolicy.schema.ts#L476)

Since v0.0.0