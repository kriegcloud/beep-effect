/**
 * Shared-domain primitive schemas used by BaseEntity and entity mixins.
 *
 * @module
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
 * import { Sha256 } from "@beep/shared-domain/entity/primitives"
 * import * as S from "effect/Schema"
 *
 * const hash = S.decodeUnknownSync(Sha256)("a".repeat(64))
 * console.log(hash)
 * ```
 *
 * @since 0.0.0
 * @category schemas
 */
export const Sha256 = Sha256Hex;

/**
 * Runtime type for {@link Sha256}.
 *
 * @since 0.0.0
 * @category models
 */
export type Sha256 = Sha256HexType;

/**
 * Ed25519 signature encoded as base64url text.
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
 * @since 0.0.0
 * @category models
 */
export type Ed25519Signature = typeof Ed25519Signature.Type;

/**
 * Stable encryption-key identifier.
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
 * @since 0.0.0
 * @category models
 */
export type EncryptionKeyId = typeof EncryptionKeyId.Type;

/**
 * Hybrid logical clock token.
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
 * @since 0.0.0
 * @category models
 */
export type HybridLogicalClock = typeof HybridLogicalClock.Type;

/**
 * Vector-clock map keyed by replica or device identifier.
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
 * @since 0.0.0
 * @category models
 */
export type VectorClock = typeof VectorClock.Type;
