---
title: CrossOriginEmbedderPolicy.schema.ts
nav_order: 22
parent: "@beep/schema"
---

## CrossOriginEmbedderPolicy.schema.ts overview

Schema for the `Cross-Origin-Embedder-Policy` header.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [COEPResponseHeader (class)](#coepresponseheader-class)
  - [CoepValue (type alias)](#coepvalue-type-alias)
  - [CrossOriginEmbedderPolicyHeader (type alias)](#crossoriginembedderpolicyheader-type-alias)
  - [CrossOriginEmbedderPolicyOption (type alias)](#crossoriginembedderpolicyoption-type-alias)
- [schemas](#schemas)
  - [CoepValue](#coepvalue)
  - [CrossOriginEmbedderPolicyHeader](#crossoriginembedderpolicyheader)
  - [CrossOriginEmbedderPolicyOption](#crossoriginembedderpolicyoption)
  - [Header](#header)
  - [Option](#option)
  - [ResponseHeader](#responseheader)
---

# models

## COEPResponseHeader (class)

Schema for the Cross-Origin-Embedder-Policy response header output.

**Example**

```ts
import * as O from "effect/Option"
import { COEPResponseHeader } from "@beep/schema/CrossOriginEmbedderPolicy"

const header = COEPResponseHeader.make({ name: "Cross-Origin-Embedder-Policy", value: O.some("require-corp") })
console.log(header.name)
```

**Signature**

```ts
declare class COEPResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts#L101)

Since v0.0.0

## CoepValue (type alias)

Type for allowed `Cross-Origin-Embedder-Policy` values.

**Signature**

```ts
type CoepValue = typeof CoepValue.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts#L53)

Since v0.0.0

## CrossOriginEmbedderPolicyHeader (type alias)

Type for rendered `Cross-Origin-Embedder-Policy` response headers.

**Signature**

```ts
type CrossOriginEmbedderPolicyHeader = typeof CrossOriginEmbedderPolicyHeader.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts#L212)

Since v0.0.0

## CrossOriginEmbedderPolicyOption (type alias)

Type for enabled or disabled `Cross-Origin-Embedder-Policy` options.

**Signature**

```ts
type CrossOriginEmbedderPolicyOption = typeof CrossOriginEmbedderPolicyOption.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts#L84)

Since v0.0.0

# schemas

## CoepValue

Schema for allowed `Cross-Origin-Embedder-Policy` values.

**Example**

```ts
import * as S from "effect/Schema"
import { CoepValue } from "@beep/schema/CrossOriginEmbedderPolicy"

console.log(S.is(CoepValue)("require-corp")) // true
```

**Signature**

```ts
declare const CoepValue: LiteralKit<readonly ["unsafe-none", "require-corp", "credentialless"], undefined> & SchemaStatics<LiteralKit<readonly ["unsafe-none", "require-corp", "credentialless"], undefined>> & LiteralKitStatics<readonly ["unsafe-none", "require-corp", "credentialless"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts#L40)

Since v0.0.0

## CrossOriginEmbedderPolicyHeader

Schema for the Cross-Origin-Embedder-Policy response header.
Transforms a CrossOriginEmbedderPolicyOption input into a ResponseHeader output.

- `false` → decodes to `{ name: "Cross-Origin-Embedder-Policy", value: undefined }`
- `undefined` → decodes to `{ name: "Cross-Origin-Embedder-Policy", value: undefined }` (no default)
- Valid COEP value → decodes to `{ name: "Cross-Origin-Embedder-Policy", value: <value> }`

**Example**

```ts
import * as S from "effect/Schema"
import { CrossOriginEmbedderPolicyHeader } from "@beep/schema/CrossOriginEmbedderPolicy"

const header = S.decodeUnknownSync(CrossOriginEmbedderPolicyHeader)("require-corp")
console.log(header.name)
```

**Signature**

```ts
declare const CrossOriginEmbedderPolicyHeader: S.decodeTo<typeof COEPResponseHeader, S.Union<readonly [LiteralKit<readonly [false, "unsafe-none", "require-corp", "credentialless"], undefined> & SchemaStatics<LiteralKit<readonly [false, "unsafe-none", "require-corp", "credentialless"], undefined>> & LiteralKitStatics<readonly [false, "unsafe-none", "require-corp", "credentialless"]>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof COEPResponseHeader, S.Union<readonly [LiteralKit<readonly [false, "unsafe-none", "require-corp", "credentialless"], undefined> & SchemaStatics<LiteralKit<readonly [false, "unsafe-none", "require-corp", "credentialless"], undefined>> & LiteralKitStatics<readonly [false, "unsafe-none", "require-corp", "credentialless"]>, S.Undefined]>, never, never>> & { createValue: (option?: false | "unsafe-none" | "require-corp" | "credentialless" | undefined) => Effect.Effect<O.Option<string>, CspError | ForceHttpsRedirectError | XssProtectionError | ReferrerPolicyError | NoSniffError | NoOpenError | FrameGuardError | ExpectCtError | PermissionsPolicyError | CrossOriginOpenerPolicyError | CrossOriginEmbedderPolicyError | CrossOriginResourcePolicyError | PermittedCrossDomainPoliciesError | CoreError, never>; create: (option?: undefined | CrossOriginEmbedderPolicyOption, headerValueCreator?: undefined | ((option?: false | "unsafe-none" | "require-corp" | "credentialless" | undefined) => Effect.Effect<O.Option<string>, CspError | ForceHttpsRedirectError | XssProtectionError | ReferrerPolicyError | NoSniffError | NoOpenError | FrameGuardError | ExpectCtError | PermissionsPolicyError | CrossOriginOpenerPolicyError | CrossOriginEmbedderPolicyError | CrossOriginResourcePolicyError | PermittedCrossDomainPoliciesError | CoreError, never>)) => Effect.Effect<O.Option<ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts#L133)

Since v0.0.0

## CrossOriginEmbedderPolicyOption

Schema for enabled or disabled `Cross-Origin-Embedder-Policy` options.

**Example**

```ts
import * as S from "effect/Schema"
import { CrossOriginEmbedderPolicyOption } from "@beep/schema/CrossOriginEmbedderPolicy"

console.log(S.decodeUnknownSync(CrossOriginEmbedderPolicyOption)("require-corp"))
```

**Signature**

```ts
declare const CrossOriginEmbedderPolicyOption: LiteralKit<readonly [false, "unsafe-none", "require-corp", "credentialless"], undefined> & SchemaStatics<LiteralKit<readonly [false, "unsafe-none", "require-corp", "credentialless"], undefined>> & LiteralKitStatics<readonly [false, "unsafe-none", "require-corp", "credentialless"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts#L71)

Since v0.0.0

## Header

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Header: S.decodeTo<typeof COEPResponseHeader, S.Union<readonly [LiteralKit<readonly [false, "unsafe-none", "require-corp", "credentialless"], undefined> & SchemaStatics<LiteralKit<readonly [false, "unsafe-none", "require-corp", "credentialless"], undefined>> & LiteralKitStatics<readonly [false, "unsafe-none", "require-corp", "credentialless"]>, S.Undefined]>, never, never> & SchemaStatics<S.decodeTo<typeof COEPResponseHeader, S.Union<readonly [LiteralKit<readonly [false, "unsafe-none", "require-corp", "credentialless"], undefined> & SchemaStatics<LiteralKit<readonly [false, "unsafe-none", "require-corp", "credentialless"], undefined>> & LiteralKitStatics<readonly [false, "unsafe-none", "require-corp", "credentialless"]>, S.Undefined]>, never, never>> & { createValue: (option?: false | "unsafe-none" | "require-corp" | "credentialless" | undefined) => Effect.Effect<O.Option<string>, CspError | ForceHttpsRedirectError | XssProtectionError | ReferrerPolicyError | NoSniffError | NoOpenError | FrameGuardError | ExpectCtError | PermissionsPolicyError | CrossOriginOpenerPolicyError | CrossOriginEmbedderPolicyError | CrossOriginResourcePolicyError | PermittedCrossDomainPoliciesError | CoreError, never>; create: (option?: undefined | CrossOriginEmbedderPolicyOption, headerValueCreator?: undefined | ((option?: false | "unsafe-none" | "require-corp" | "credentialless" | undefined) => Effect.Effect<O.Option<string>, CspError | ForceHttpsRedirectError | XssProtectionError | ReferrerPolicyError | NoSniffError | NoOpenError | FrameGuardError | ExpectCtError | PermissionsPolicyError | CrossOriginOpenerPolicyError | CrossOriginEmbedderPolicyError | CrossOriginResourcePolicyError | PermittedCrossDomainPoliciesError | CoreError, never>)) => Effect.Effect<O.Option<ResponseHeader>, SecureHeaderError>; }
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts#L222)

Since v0.0.0

## Option

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Option: LiteralKit<readonly [false, "unsafe-none", "require-corp", "credentialless"], undefined> & SchemaStatics<LiteralKit<readonly [false, "unsafe-none", "require-corp", "credentialless"], undefined>> & LiteralKitStatics<readonly [false, "unsafe-none", "require-corp", "credentialless"]>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts#L223)

Since v0.0.0

## ResponseHeader

Public aliases for concise namespace roles.

**Signature**

```ts
declare const ResponseHeader: typeof COEPResponseHeader
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CrossOriginEmbedderPolicy/CrossOriginEmbedderPolicy.schema.ts#L221)

Since v0.0.0