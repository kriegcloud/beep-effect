---
title: EthereumValidatorPublicKey.schema.ts
nav_order: 77
parent: "@beep/schema"
---

## EthereumValidatorPublicKey.schema.ts overview

Branded schema for canonical Ethereum validator public keys.

Accepts lowercase `0x`-prefixed compressed BLS12-381 public keys.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [EthereumValidatorPublicKey (type alias)](#ethereumvalidatorpublickey-type-alias)
  - [EthereumValidatorPublicKeyRedacted (type alias)](#ethereumvalidatorpublickeyredacted-type-alias)
- [schemas](#schemas)
  - [Redacted](#redacted)
  - [Schema](#schema)
- [validation](#validation)
  - [EthereumValidatorPublicKey](#ethereumvalidatorpublickey)
  - [EthereumValidatorPublicKeyRedacted](#ethereumvalidatorpublickeyredacted)
---

# models

## EthereumValidatorPublicKey (type alias)

Type for `EthereumValidatorPublicKey`.

**Signature**

```ts
type EthereumValidatorPublicKey = typeof EthereumValidatorPublicKey.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts#L69)

Since v0.0.0

## EthereumValidatorPublicKeyRedacted (type alias)

Type for `EthereumValidatorPublicKeyRedacted`.

**Signature**

```ts
type EthereumValidatorPublicKeyRedacted = typeof EthereumValidatorPublicKeyRedacted.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts#L103)

Since v0.0.0

# schemas

## Redacted

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Redacted: AnnotatedSchema<S.RedactedFromValue<AnnotatedSchema<S.brand<S.String, "EthereumValidatorPublicKey">>> & { makeRedacted: (input: string, options?: S.MakeOptions | undefined) => Redacted.Redacted<string & Brand<"EthereumValidatorPublicKey">>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts#L111)

Since v0.0.0

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: AnnotatedSchema<S.brand<S.String, "EthereumValidatorPublicKey">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts#L111)

Since v0.0.0

# validation

## EthereumValidatorPublicKey

Branded schema for canonical Ethereum validator public keys.

**Example**

```ts
import { EthereumValidatorPublicKey } from "@beep/schema/EthereumValidatorPublicKey"
import * as S from "effect/Schema"

const key = S.decodeUnknownSync(EthereumValidatorPublicKey)(
  "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
)
console.log(key)
```

**Signature**

```ts
declare const EthereumValidatorPublicKey: AnnotatedSchema<S.brand<S.String, "EthereumValidatorPublicKey">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts#L52)

Since v0.0.0

## EthereumValidatorPublicKeyRedacted

Redacted schema for canonical Ethereum validator public keys.

**Example**

```ts
import { EthereumValidatorPublicKeyRedacted } from "@beep/schema/EthereumValidatorPublicKey"

const key = EthereumValidatorPublicKeyRedacted.makeRedacted(
  "0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000"
)
console.log(key)
```

**Signature**

```ts
declare const EthereumValidatorPublicKeyRedacted: AnnotatedSchema<S.RedactedFromValue<AnnotatedSchema<S.brand<S.String, "EthereumValidatorPublicKey">>> & { makeRedacted: (input: string, options?: S.MakeOptions | undefined) => Redacted.Redacted<string & Brand<"EthereumValidatorPublicKey">>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EthereumValidatorPublicKey/EthereumValidatorPublicKey.schema.ts#L87)

Since v0.0.0