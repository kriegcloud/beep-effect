---
title: primitives.ts
nav_order: 19
parent: "@beep/shared-domain"
---

## primitives.ts overview

Shared-domain primitive schemas used by BaseEntity and entity schemas.

Since v0.0.0

---
## Exports Grouped by Category
- [models](#models)
  - [Ed25519Signature (type alias)](#ed25519signature-type-alias)
  - [EncryptionKeyId (type alias)](#encryptionkeyid-type-alias)
  - [HybridLogicalClock (type alias)](#hybridlogicalclock-type-alias)
  - [Sha256 (type alias)](#sha256-type-alias)
  - [VectorClock (type alias)](#vectorclock-type-alias)
- [schemas](#schemas)
  - [Ed25519Signature](#ed25519signature)
  - [EncryptionKeyId](#encryptionkeyid)
  - [HybridLogicalClock](#hybridlogicalclock)
  - [Sha256](#sha256)
  - [VectorClock](#vectorclock)
---

# models

## Ed25519Signature (type alias)

Runtime type for `Ed25519Signature`.

**Example**

```ts
import type { Ed25519Signature } from "@beep/shared-domain/entity/primitives"

const printSignature = (signature: Ed25519Signature) => console.log(signature)
console.log(printSignature)
```

**Signature**

```ts
type Ed25519Signature = typeof Ed25519Signature.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/primitives.ts#L94)

Since v0.0.0

## EncryptionKeyId (type alias)

Runtime type for `EncryptionKeyId`.

**Example**

```ts
import type { EncryptionKeyId } from "@beep/shared-domain/entity/primitives"

const printKeyId = (keyId: EncryptionKeyId) => console.log(keyId)
console.log(printKeyId)
```

**Signature**

```ts
type EncryptionKeyId = typeof EncryptionKeyId.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/primitives.ts#L136)

Since v0.0.0

## HybridLogicalClock (type alias)

Runtime type for `HybridLogicalClock`.

**Example**

```ts
import type { HybridLogicalClock } from "@beep/shared-domain/entity/primitives"

const printClock = (clock: HybridLogicalClock) => console.log(clock)
console.log(printClock)
```

**Signature**

```ts
type HybridLogicalClock = typeof HybridLogicalClock.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/primitives.ts#L178)

Since v0.0.0

## Sha256 (type alias)

Runtime type for `Sha256`.

**Example**

```ts
import type { Sha256 } from "@beep/shared-domain/entity/primitives"

const printHash = (hash: Sha256) => console.log(hash)
console.log(printHash)
```

**Signature**

```ts
type Sha256 = Sha256HexType
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/primitives.ts#L52)

Since v0.0.0

## VectorClock (type alias)

Runtime type for `VectorClock`.

**Example**

```ts
import type { VectorClock } from "@beep/shared-domain/entity/primitives"

const printClock = (clock: VectorClock) => console.log(clock)
console.log(printClock)
```

**Signature**

```ts
type VectorClock = typeof VectorClock.Type
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/primitives.ts#L220)

Since v0.0.0

# schemas

## Ed25519Signature

Ed25519 signature encoded as base64url text.

**Example**

```ts
import { Effect } from "effect"
import { Ed25519Signature } from "@beep/shared-domain/entity/primitives"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const signature = yield* S.decodeUnknownEffect(Ed25519Signature)("signature")
  return signature
})
console.log(program)
```

**Signature**

```ts
declare const Ed25519Signature: AnnotatedSchema<S.brand<S.NonEmptyString, "Ed25519Signature">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/primitives.ts#L73)

Since v0.0.0

## EncryptionKeyId

Stable encryption-key identifier.

**Example**

```ts
import { Effect } from "effect"
import { EncryptionKeyId } from "@beep/shared-domain/entity/primitives"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const keyId = yield* S.decodeUnknownEffect(EncryptionKeyId)("key")
  return keyId
})
console.log(program)
```

**Signature**

```ts
declare const EncryptionKeyId: AnnotatedSchema<S.brand<S.NonEmptyString, "EncryptionKeyId">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/primitives.ts#L115)

Since v0.0.0

## HybridLogicalClock

Hybrid logical clock token.

**Example**

```ts
import { Effect } from "effect"
import { HybridLogicalClock } from "@beep/shared-domain/entity/primitives"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const clock = yield* S.decodeUnknownEffect(HybridLogicalClock)("clock")
  return clock
})
console.log(program)
```

**Signature**

```ts
declare const HybridLogicalClock: AnnotatedSchema<S.brand<S.NonEmptyString, "HybridLogicalClock">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/primitives.ts#L157)

Since v0.0.0

## Sha256

SHA-256 digest encoded as lowercase hexadecimal text.

**Example**

```ts
import { Effect } from "effect"
import { Sha256 } from "@beep/shared-domain/entity/primitives"
import { Str } from "@beep/utils"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const hash = yield* S.decodeUnknownEffect(Sha256)(Str.repeat("a", 64))
  return hash
})
console.log(program)
```

**Signature**

```ts
declare const Sha256: AnnotatedSchema<S.brand<S.String, "Sha256Hex">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/primitives.ts#L36)

Since v0.0.0

## VectorClock

Vector-clock map keyed by replica or device identifier.

**Example**

```ts
import { Effect } from "effect"
import { VectorClock } from "@beep/shared-domain/entity/primitives"
import * as S from "effect/Schema"

const program = Effect.gen(function* () {
  const clock = yield* S.decodeUnknownEffect(VectorClock)({ replica: 1 })
  return clock
})
console.log(program)
```

**Signature**

```ts
declare const VectorClock: AnnotatedSchema<S.brand<S.$Record<S.String, AnnotatedSchema<S.brand<S.brand<S.Int, "Int">, "NonNegativeInt">>>, "VectorClock">>
```

[Source](https://github.com/kriegcloud/beep-effect/tree/main/packages/shared/domain/src/entity/primitives.ts#L199)

Since v0.0.0