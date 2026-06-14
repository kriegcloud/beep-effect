---
title: CryptoWalletAddress.schema.ts
nav_order: 30
parent: "@beep/schema"
---

## CryptoWalletAddress.schema.ts overview

Branded schema for canonical mainnet blockchain wallet addresses.

Supports EVM, Bitcoin, and Solana families.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [CryptoWalletAddress (type alias)](#cryptowalletaddress-type-alias)
  - [CryptoWalletAddressRedacted (type alias)](#cryptowalletaddressredacted-type-alias)
- [schemas](#schemas)
  - [Redacted](#redacted)
  - [Schema](#schema)
- [validation](#validation)
  - [CryptoWalletAddress](#cryptowalletaddress)
  - [CryptoWalletAddressRedacted](#cryptowalletaddressredacted)
---

# models

## CryptoWalletAddress (type alias)

Type for `CryptoWalletAddress`.

**Signature**

```ts
type CryptoWalletAddress = typeof CryptoWalletAddress.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CryptoWalletAddress/CryptoWalletAddress.schema.ts#L203)

Since v0.0.0

## CryptoWalletAddressRedacted (type alias)

Type for `CryptoWalletAddressRedacted`.

**Signature**

```ts
type CryptoWalletAddressRedacted = typeof CryptoWalletAddressRedacted.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CryptoWalletAddress/CryptoWalletAddress.schema.ts#L235)

Since v0.0.0

# schemas

## Redacted

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Redacted: AnnotatedSchema<S.RedactedFromValue<AnnotatedSchema<S.brand<S.NonEmptyString, "CryptoWalletAddress">>> & { makeRedacted: (input: string, options?: S.MakeOptions | undefined) => Redacted.Redacted<string & Brand<"CryptoWalletAddress">>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CryptoWalletAddress/CryptoWalletAddress.schema.ts#L243)

Since v0.0.0

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: AnnotatedSchema<S.brand<S.NonEmptyString, "CryptoWalletAddress">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CryptoWalletAddress/CryptoWalletAddress.schema.ts#L243)

Since v0.0.0

# validation

## CryptoWalletAddress

Branded schema for canonical mainnet blockchain wallet addresses.

**Example**

```ts
import { CryptoWalletAddress } from "@beep/schema/CryptoWalletAddress"
import * as S from "effect/Schema"

const address = S.decodeUnknownSync(CryptoWalletAddress)("0x0000000000000000000000000000000000000000")
console.log(address)
```

**Signature**

```ts
declare const CryptoWalletAddress: AnnotatedSchema<S.brand<S.NonEmptyString, "CryptoWalletAddress">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CryptoWalletAddress/CryptoWalletAddress.schema.ts#L190)

Since v0.0.0

## CryptoWalletAddressRedacted

Redacted Branded schema for canonical mainnet blockchain wallet addresses.

**Example**

```ts
import { CryptoWalletAddressRedacted } from "@beep/schema/CryptoWalletAddress"

const address = CryptoWalletAddressRedacted.makeRedacted("0x0000000000000000000000000000000000000000")
console.log(address)
```

**Signature**

```ts
declare const CryptoWalletAddressRedacted: AnnotatedSchema<S.RedactedFromValue<AnnotatedSchema<S.brand<S.NonEmptyString, "CryptoWalletAddress">>> & { makeRedacted: (input: string, options?: S.MakeOptions | undefined) => Redacted.Redacted<string & Brand<"CryptoWalletAddress">>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CryptoWalletAddress/CryptoWalletAddress.schema.ts#L219)

Since v0.0.0