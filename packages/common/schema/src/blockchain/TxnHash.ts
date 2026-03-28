/**
 * Branded schema for canonical mainnet blockchain transaction identifiers.
 *
 * Supports EVM, Bitcoin, and Solana families.
 *
 * @since 0.0.0
 * @module @beep/schema/blockchain/TxnHash
 */

import { $SchemaId } from "@beep/identity/packages";
import { base58 } from "@scure/base";
import * as S from "effect/Schema";

const $I = $SchemaId.create("blockchain/TxnHash");

const evmTxnHashPattern = /^0x[0-9a-f]{64}$/;
const bitcoinTxnHashPattern = /^[0-9a-f]{64}$/;

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

const isCanonicalTxnHash = (input: string): boolean =>
  evmTxnHashPattern.test(input) || bitcoinTxnHashPattern.test(input) || isCanonicalSolanaSignature(input);

const TxnHashChecks = S.makeFilterGroup(
  [
    S.makeFilter(isCanonicalTxnHash, {
      identifier: $I`TxnHashFormatCheck`,
      title: "Transaction Hash Format",
      description: "A canonical mainnet EVM, Bitcoin, or Solana transaction identifier.",
      message: "TxnHash must be a canonical mainnet EVM, Bitcoin, or Solana transaction identifier",
    }),
  ],
  {
    identifier: $I`TxnHashChecks`,
    title: "TxnHash",
    description: "Checks for canonical mainnet transaction identifiers across EVM, Bitcoin, and Solana families.",
  }
);

/**
 * Branded schema for canonical mainnet blockchain transaction identifiers.
 *
 * @since 0.0.0
 * @category Validation
 */
export const TxnHash = S.NonEmptyString.check(TxnHashChecks).pipe(
  S.brand("TxnHash"),
  S.annotate(
    $I.annote("TxnHash", {
      description: "Canonical mainnet transaction identifier for supported EVM, Bitcoin, and Solana networks.",
    })
  )
);

/**
 * Type for {@link TxnHash}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type TxnHash = typeof TxnHash.Type;
