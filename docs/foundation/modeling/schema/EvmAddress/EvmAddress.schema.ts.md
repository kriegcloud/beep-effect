---
title: EvmAddress.schema.ts
nav_order: 79
parent: "@beep/schema"
---

## EvmAddress.schema.ts overview

Branded schema for canonical mainnet EVM wallet addresses.

Accepts lowercase or EIP-55 checksummed addresses.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [EvmAddress (type alias)](#evmaddress-type-alias)
  - [EvmAddressRedacted (type alias)](#evmaddressredacted-type-alias)
- [schemas](#schemas)
  - [Redacted](#redacted)
  - [Schema](#schema)
- [validation](#validation)
  - [EvmAddress](#evmaddress)
  - [EvmAddressRedacted](#evmaddressredacted)
---

# models

## EvmAddress (type alias)

Type for `EvmAddress`.

**Signature**

```ts
type EvmAddress = typeof EvmAddress.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EvmAddress/EvmAddress.schema.ts#L100)

Since v0.0.0

## EvmAddressRedacted (type alias)

Type for `EvmAddressRedacted`.

**Signature**

```ts
type EvmAddressRedacted = typeof EvmAddressRedacted.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EvmAddress/EvmAddress.schema.ts#L132)

Since v0.0.0

# schemas

## Redacted

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Redacted: AnnotatedSchema<S.RedactedFromValue<AnnotatedSchema<S.brand<S.NonEmptyString, "EvmAddress">>> & { makeRedacted: (input: string, options?: S.MakeOptions | undefined) => Redacted.Redacted<string & Brand<"EvmAddress">>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EvmAddress/EvmAddress.schema.ts#L140)

Since v0.0.0

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: AnnotatedSchema<S.brand<S.NonEmptyString, "EvmAddress">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EvmAddress/EvmAddress.schema.ts#L140)

Since v0.0.0

# validation

## EvmAddress

Branded schema for canonical mainnet EVM wallet addresses.

**Example**

```ts
import { EvmAddress } from "@beep/schema/EvmAddress"
import * as S from "effect/Schema"

const address = S.decodeUnknownSync(EvmAddress)("0x0000000000000000000000000000000000000000")
console.log(address)
```

**Signature**

```ts
declare const EvmAddress: AnnotatedSchema<S.brand<S.NonEmptyString, "EvmAddress">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EvmAddress/EvmAddress.schema.ts#L87)

Since v0.0.0

## EvmAddressRedacted

Redacted schema for canonical mainnet EVM wallet addresses.

**Example**

```ts
import { EvmAddressRedacted } from "@beep/schema/EvmAddress"

const address = EvmAddressRedacted.makeRedacted("0x0000000000000000000000000000000000000000")
console.log(address)
```

**Signature**

```ts
declare const EvmAddressRedacted: AnnotatedSchema<S.RedactedFromValue<AnnotatedSchema<S.brand<S.NonEmptyString, "EvmAddress">>> & { makeRedacted: (input: string, options?: S.MakeOptions | undefined) => Redacted.Redacted<string & Brand<"EvmAddress">>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/EvmAddress/EvmAddress.schema.ts#L116)

Since v0.0.0