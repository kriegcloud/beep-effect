/**
 * Branded schema for canonical mainnet blockchain transaction identifiers.
 *
 * Supports EVM, Bitcoin, and Solana families.
 *
 * @since 0.0.0
 * @module @beep/schema/blockchain/CryptoTxnHash
 */

import { $SchemaId } from "@beep/identity/packages";
import { base58 } from "@scure/base";
import { flow, Redacted } from "effect";
import * as S from "effect/Schema";
import * as SchemaUtils from "../SchemaUtils/index.ts";

const $I = $SchemaId.create("blockchain/CryptoTxnHash");

const evmCryptoTxnHashPattern = /^0x[0-9a-f]{64}$/;
const bitcoinCryptoTxnHashPattern = /^[0-9a-f]{64}$/;

const decodeCanonicalBase58 = (input: string): Uint8Array | null => {
  try {
    const decoded = base58.decode(input);

    return base58.encode(decoded) === input ? decoded : null;
  } catch {
    return null;
  }
};

const isCanonicalSolanaSignature = (input: string): boolean => {
  const decoded = decodeCanonicalBase58(input);

  return decoded !== null && decoded.length === 64;
};

const isCanonicalCryptoTxnHash = (input: string): boolean =>
  evmCryptoTxnHashPattern.test(input) || bitcoinCryptoTxnHashPattern.test(input) || isCanonicalSolanaSignature(input);

const CryptoTxnHashChecks = S.makeFilterGroup(
  [
    S.makeFilter(isCanonicalCryptoTxnHash, {
      identifier: $I`CryptoTxnHashFormatCheck`,
      title: "Transaction Hash Format",
      description: "A canonical mainnet EVM, Bitcoin, or Solana transaction identifier.",
      message: "CryptoTxnHash must be a canonical mainnet EVM, Bitcoin, or Solana transaction identifier",
    }),
  ],
  {
    identifier: $I`CryptoTxnHashChecks`,
    title: "CryptoTxnHash",
    description: "Checks for canonical mainnet transaction identifiers across EVM, Bitcoin, and Solana families.",
  }
);

/**
 * Branded schema for canonical mainnet blockchain transaction identifiers.
 *
 * @since 0.0.0
 * @category Validation
 */
export const CryptoTxnHash = S.NonEmptyString.check(CryptoTxnHashChecks).pipe(
  S.brand("CryptoTxnHash"),
  S.annotate(
    $I.annote("CryptoTxnHash", {
      description: "Canonical mainnet transaction identifier for supported EVM, Bitcoin, and Solana networks.",
    })
  )
);

/**
 * Type for {@link CryptoTxnHash}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CryptoTxnHash = typeof CryptoTxnHash.Type;

/**
 * Redacted schema for canonical mainnet blockchain transaction identifiers.
 *
 * @since 0.0.0
 * @category Validation
 */
export const CryptoTxnHashRedacted = CryptoTxnHash.pipe(
  S.RedactedFromValue,
  SchemaUtils.withStatics(() => ({
    makeRedacted: flow(CryptoTxnHash.make, Redacted.make),
  })),
  S.annotate(
    $I.annote("CryptoTxnHashRedacted", {
      description: "Redacted canonical mainnet transaction identifier for supported EVM, Bitcoin, and Solana networks.",
    })
  )
);

/**
 * Type for {@link CryptoTxnHashRedacted}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CryptoTxnHashRedacted = typeof CryptoTxnHashRedacted.Type;
