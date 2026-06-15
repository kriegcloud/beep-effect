---
title: CryptoTxnHash.schema.ts
nav_order: 28
parent: "@beep/schema"
---

## CryptoTxnHash.schema.ts overview

Branded schema for canonical mainnet blockchain transaction identifiers.

Supports EVM, Bitcoin, and Solana families.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [CryptoTxnHash (type alias)](#cryptotxnhash-type-alias)
  - [CryptoTxnHashRedacted (type alias)](#cryptotxnhashredacted-type-alias)
- [schemas](#schemas)
  - [Redacted](#redacted)
  - [Schema](#schema)
- [validation](#validation)
  - [CryptoTxnHash](#cryptotxnhash)
  - [CryptoTxnHashRedacted](#cryptotxnhashredacted)
---

# models

## CryptoTxnHash (type alias)

Type for `CryptoTxnHash`.

**Signature**

```ts
type CryptoTxnHash = typeof CryptoTxnHash.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CryptoTxnHash/CryptoTxnHash.schema.ts#L84)

Since v0.0.0

## CryptoTxnHashRedacted (type alias)

Type for `CryptoTxnHashRedacted`.

**Signature**

```ts
type CryptoTxnHashRedacted = typeof CryptoTxnHashRedacted.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CryptoTxnHash/CryptoTxnHash.schema.ts#L118)

Since v0.0.0

# schemas

## Redacted

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Redacted: AnnotatedSchema<S.RedactedFromValue<AnnotatedSchema<S.brand<S.NonEmptyString, "CryptoTxnHash">>> & { makeRedacted: (input: string, options?: S.MakeOptions | undefined) => Redacted.Redacted<string & Brand<"CryptoTxnHash">>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CryptoTxnHash/CryptoTxnHash.schema.ts#L126)

Since v0.0.0

## Schema

Public aliases for concise namespace roles.

**Signature**

```ts
declare const Schema: AnnotatedSchema<S.brand<S.NonEmptyString, "CryptoTxnHash">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CryptoTxnHash/CryptoTxnHash.schema.ts#L126)

Since v0.0.0

# validation

## CryptoTxnHash

Branded schema for canonical mainnet blockchain transaction identifiers.

**Example**

```ts
import { CryptoTxnHash } from "@beep/schema/CryptoTxnHash"
import * as S from "effect/Schema"

const hash = S.decodeUnknownSync(CryptoTxnHash)(
  "0x0000000000000000000000000000000000000000000000000000000000000000"
)
console.log(hash)
```

**Signature**

```ts
declare const CryptoTxnHash: AnnotatedSchema<S.brand<S.NonEmptyString, "CryptoTxnHash">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CryptoTxnHash/CryptoTxnHash.schema.ts#L71)

Since v0.0.0

## CryptoTxnHashRedacted

Redacted schema for canonical mainnet blockchain transaction identifiers.

**Example**

```ts
import { CryptoTxnHashRedacted } from "@beep/schema/CryptoTxnHash"

const hash = CryptoTxnHashRedacted.makeRedacted(
  "0x0000000000000000000000000000000000000000000000000000000000000000"
)
console.log(hash)
```

**Signature**

```ts
declare const CryptoTxnHashRedacted: AnnotatedSchema<S.RedactedFromValue<AnnotatedSchema<S.brand<S.NonEmptyString, "CryptoTxnHash">>> & { makeRedacted: (input: string, options?: S.MakeOptions | undefined) => Redacted.Redacted<string & Brand<"CryptoTxnHash">>; }>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/foundation/modeling/schema/src/CryptoTxnHash/CryptoTxnHash.schema.ts#L102)

Since v0.0.0