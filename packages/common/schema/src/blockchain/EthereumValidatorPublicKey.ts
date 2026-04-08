/**
 * Branded schema for canonical Ethereum validator public keys.
 *
 * Accepts lowercase `0x`-prefixed compressed BLS12-381 public keys.
 *
 * @since 0.0.0
 * @module @beep/schema/blockchain/EthereumValidatorPublicKey
 */

import { $SchemaId } from "@beep/identity/packages";
import { flow, Redacted } from "effect";
import * as S from "effect/Schema";
import * as SchemaUtils from "../SchemaUtils/index.ts";

const $I = $SchemaId.create("blockchain/EthereumValidatorPublicKey");

const ethereumValidatorPublicKeyPattern = /^0x[0-9a-f]{96}$/;

const EthereumValidatorPublicKeyChecks = S.makeFilterGroup(
  [
    S.isPattern(ethereumValidatorPublicKeyPattern, {
      identifier: $I`EthereumValidatorPublicKeyPatternCheck`,
      title: "Ethereum Validator Public Key Pattern",
      description: "A lowercase 0x-prefixed 48-byte compressed BLS12-381 public key.",
      message: "EthereumValidatorPublicKey must be a lowercase 0x-prefixed 48-byte public key",
    }),
  ],
  {
    identifier: $I`EthereumValidatorPublicKeyChecks`,
    title: "EthereumValidatorPublicKey",
    description: "Checks for canonical Ethereum validator public keys.",
  }
);

/**
 * Branded schema for canonical Ethereum validator public keys.
 *
 * @since 0.0.0
 * @category Validation
 */
export const EthereumValidatorPublicKey = S.String.check(EthereumValidatorPublicKeyChecks).pipe(
  S.brand("EthereumValidatorPublicKey"),
  S.annotate(
    $I.annote("EthereumValidatorPublicKey", {
      description: "Canonical lowercase 0x-prefixed compressed Ethereum validator public key.",
    })
  )
);

/**
 * Type for {@link EthereumValidatorPublicKey}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type EthereumValidatorPublicKey = typeof EthereumValidatorPublicKey.Type;

/**
 * Redacted schema for canonical Ethereum validator public keys.
 *
 * @since 0.0.0
 * @category Validation
 */
export const EthereumValidatorPublicKeyRedacted = EthereumValidatorPublicKey.pipe(
  S.RedactedFromValue,
  SchemaUtils.withStatics(() => ({
    makeRedacted: flow(EthereumValidatorPublicKey.make, Redacted.make),
  })),
  S.annotate(
    $I.annote("EthereumValidatorPublicKeyRedacted", {
      description: "Redacted canonical lowercase 0x-prefixed compressed Ethereum validator public key.",
    })
  )
);

/**
 * Type for {@link EthereumValidatorPublicKeyRedacted}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type EthereumValidatorPublicKeyRedacted = typeof EthereumValidatorPublicKeyRedacted.Type;
