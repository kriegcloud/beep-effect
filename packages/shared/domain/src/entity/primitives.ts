/**
 * Shared-domain primitive schemas used by BaseEntity and entity schemas.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SharedDomainId } from "@beep/identity/packages";
import { NonNegativeInt } from "@beep/schema/Int";
import type { Sha256Hex as Sha256HexType } from "@beep/schema/Sha256";
import { Sha256Hex } from "@beep/schema/Sha256";
import * as S from "effect/Schema";

const $I = $SharedDomainId.create("entity/primitives");

/**
 * SHA-256 digest encoded as lowercase hexadecimal text.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Sha256 } from "@beep/shared-domain/entity/primitives"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const hash = yield* S.decodeUnknownEffect(Sha256)("a".repeat(64))
 *   return hash
 * })
 * void program
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const Sha256 = Sha256Hex;

/**
 * Runtime type for {@link Sha256}.
 *
 * @example
 * ```ts
 * import type { Sha256 } from "@beep/shared-domain/entity/primitives"
 *
 * const printHash = (hash: Sha256) => console.log(hash)
 * void printHash
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type Sha256 = Sha256HexType;

/**
 * Ed25519 signature encoded as base64url text.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { Ed25519Signature } from "@beep/shared-domain/entity/primitives"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const signature = yield* S.decodeUnknownEffect(Ed25519Signature)("signature")
 *   return signature
 * })
 * void program
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const Ed25519Signature = S.NonEmptyString.pipe(
  S.brand("Ed25519Signature"),
  $I.annoteSchema("Ed25519Signature", {
    description: "Base64url-encoded Ed25519 signature.",
  })
);

/**
 * Runtime type for {@link Ed25519Signature}.
 *
 * @example
 * ```ts
 * import type { Ed25519Signature } from "@beep/shared-domain/entity/primitives"
 *
 * const printSignature = (signature: Ed25519Signature) => console.log(signature)
 * void printSignature
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type Ed25519Signature = typeof Ed25519Signature.Type;

/**
 * Stable encryption-key identifier.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { EncryptionKeyId } from "@beep/shared-domain/entity/primitives"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const keyId = yield* S.decodeUnknownEffect(EncryptionKeyId)("key")
 *   return keyId
 * })
 * void program
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const EncryptionKeyId = S.NonEmptyString.pipe(
  S.brand("EncryptionKeyId"),
  $I.annoteSchema("EncryptionKeyId", {
    description: "Stable identifier for a key used to encrypt persisted entity data.",
  })
);

/**
 * Runtime type for {@link EncryptionKeyId}.
 *
 * @example
 * ```ts
 * import type { EncryptionKeyId } from "@beep/shared-domain/entity/primitives"
 *
 * const printKeyId = (keyId: EncryptionKeyId) => console.log(keyId)
 * void printKeyId
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type EncryptionKeyId = typeof EncryptionKeyId.Type;

/**
 * Hybrid logical clock token.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { HybridLogicalClock } from "@beep/shared-domain/entity/primitives"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const clock = yield* S.decodeUnknownEffect(HybridLogicalClock)("clock")
 *   return clock
 * })
 * void program
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const HybridLogicalClock = S.NonEmptyString.pipe(
  S.brand("HybridLogicalClock"),
  $I.annoteSchema("HybridLogicalClock", {
    description: "Hybrid logical clock token used for local-first synchronization.",
  })
);

/**
 * Runtime type for {@link HybridLogicalClock}.
 *
 * @example
 * ```ts
 * import type { HybridLogicalClock } from "@beep/shared-domain/entity/primitives"
 *
 * const printClock = (clock: HybridLogicalClock) => console.log(clock)
 * void printClock
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type HybridLogicalClock = typeof HybridLogicalClock.Type;

/**
 * Vector-clock map keyed by replica or device identifier.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { VectorClock } from "@beep/shared-domain/entity/primitives"
 * import * as S from "effect/Schema"
 *
 * const program = Effect.gen(function* () {
 *   const clock = yield* S.decodeUnknownEffect(VectorClock)({ replica: 1 })
 *   return clock
 * })
 * void program
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const VectorClock = S.Record(S.String, NonNegativeInt).pipe(
  S.brand("VectorClock"),
  $I.annoteSchema("VectorClock", {
    description: "Vector clock map used to reason about distributed entity updates.",
  })
);

/**
 * Runtime type for {@link VectorClock}.
 *
 * @example
 * ```ts
 * import type { VectorClock } from "@beep/shared-domain/entity/primitives"
 *
 * const printClock = (clock: VectorClock) => console.log(clock)
 * void printClock
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export type VectorClock = typeof VectorClock.Type;
