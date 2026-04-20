/**
 * Branded schema for canonical mainnet blockchain wallet addresses.
 *
 * Supports EVM, Bitcoin, and Solana families.
 *
 * @since 0.0.0
 * @module \@beep/schema/blockchain/CryptoWalletAddress
 */

import { $SchemaId } from "@beep/identity/packages";
import { Str } from "@beep/utils";
import { sha256 } from "@noble/hashes/sha2.js";
import { keccak_256 } from "@noble/hashes/sha3.js";
import { base58, bech32, bech32m } from "@scure/base";
import { Encoding, flow, pipe, Redacted, Result } from "effect";
import * as A from "effect/Array";
import * as Eq from "effect/Equal";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as SchemaUtils from "../SchemaUtils/index.ts";

const $I = $SchemaId.create("blockchain/CryptoWalletAddress");

const evmCryptoWalletAddressPattern = /^0x[0-9a-fA-F]{40}$/;

const isBech32Like = (input: string): input is `${string}1${string}` => Str.includes("1")(input);

const equalBytes = (left: Uint8Array, right: Uint8Array): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (left[index] !== right[index]) {
      return false;
    }
  }

  return true;
};

const decodeCanonicalBase58 = (input: string): Uint8Array | null =>
  pipe(
    Result.try(() => base58.decode(input)),
    Result.getOrNull
  );

const isCanonicalEvmCryptoWalletAddress = (input: string): boolean => {
  if (!evmCryptoWalletAddressPattern.test(input)) {
    return false;
  }

  const address = Str.slice(2)(input);
  const lowercaseCryptoWalletAddress = Str.toLowerCase(address);

  if (address === lowercaseCryptoWalletAddress) {
    return true;
  }

  const checksum = Encoding.encodeHex(keccak_256(new TextEncoder().encode(lowercaseCryptoWalletAddress)));

  for (let index = 0; index < address.length; index += 1) {
    const character = address[index]!;
    const lowercaseCharacter = Str.toLowerCase(character);
    const uppercaseCharacter = Str.toUpperCase(character);

    if (Eq.equals(lowercaseCharacter, uppercaseCharacter)) {
      continue;
    }

    const checksumNibble = Number.parseInt(checksum[index]!, 16);
    const shouldBeUppercase = checksumNibble >= 8;

    if (shouldBeUppercase ? character !== uppercaseCharacter : character !== lowercaseCharacter) {
      return false;
    }
  }

  return true;
};

const isCanonicalBitcoinBase58CryptoWalletAddress = (input: string): boolean => {
  const decoded = decodeCanonicalBase58(input);

  if (P.isNull(decoded) || decoded.length !== 25) {
    return false;
  }

  const version = decoded[0];

  if (version !== 0x00 && version !== 0x05) {
    return false;
  }

  const payload = decoded.subarray(0, 21);
  const checksum = decoded.subarray(21);
  const expectedChecksum = sha256(sha256(payload)).subarray(0, 4);

  return equalBytes(checksum, expectedChecksum);
};

const isCanonicalBitcoinWitnessCryptoWalletAddress = (input: string): boolean => {
  if (!Str.startsWith("bc1")(input) || input !== Str.toLowerCase(input) || !isBech32Like(input)) {
    return false;
  }

  try {
    const decoded = bech32.decode(input);

    if (decoded.prefix !== "bc" || A.isReadonlyArrayEmpty(decoded.words)) {
      return false;
    }

    const [version, ...programWords] = decoded.words;

    if (version !== 0) {
      return false;
    }

    const program = bech32.fromWords(programWords);

    return program.length === 20 || program.length === 32;
  } catch {}

  try {
    const decoded = bech32m.decode(input);

    if (decoded.prefix !== "bc" || A.isReadonlyArrayEmpty(decoded.words)) {
      return false;
    }

    const [version, ...programWords] = decoded.words;

    if (version !== 1) {
      return false;
    }

    const program = bech32m.fromWords(programWords);

    return program.length === 32;
  } catch {
    return false;
  }
};

const isCanonicalBitcoinCryptoWalletAddress = (input: string): boolean =>
  isCanonicalBitcoinBase58CryptoWalletAddress(input) || isCanonicalBitcoinWitnessCryptoWalletAddress(input);

const isCanonicalSolanaCryptoWalletAddress = (input: string): boolean => {
  const decoded = decodeCanonicalBase58(input);

  return P.isNotNull(decoded) && decoded.length === 32;
};

const isCanonicalCryptoWalletAddress = P.some([
  isCanonicalEvmCryptoWalletAddress,
  isCanonicalBitcoinCryptoWalletAddress,
  isCanonicalSolanaCryptoWalletAddress,
]);
const CryptoWalletAddressChecks = S.makeFilterGroup(
  [
    S.makeFilter(isCanonicalCryptoWalletAddress, {
      identifier: $I`CryptoWalletAddressFormatCheck`,
      title: "CryptoWalletAddress Format",
      description: "A canonical mainnet EVM, Bitcoin, or Solana wallet address.",
      message: "CryptoWalletAddress must be a canonical mainnet EVM, Bitcoin, or Solana wallet address",
    }),
  ],
  {
    identifier: $I`CryptoWalletAddressChecks`,
    title: "CryptoWalletAddress",
    description: "Checks for canonical mainnet wallet addresses across EVM, Bitcoin, and Solana families.",
  }
);

/**
 * Branded schema for canonical mainnet blockchain wallet addresses.
 *
 * @since 0.0.0
 * @category Validation
 */
export const CryptoWalletAddress = S.NonEmptyString.check(CryptoWalletAddressChecks).pipe(
  S.brand("CryptoWalletAddress"),
  S.annotate(
    $I.annote("CryptoWalletAddress", {
      description: "Canonical mainnet wallet address for supported EVM, Bitcoin, and Solana networks.",
    })
  )
);

/**
 * Type for {@link CryptoWalletAddress}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CryptoWalletAddress = typeof CryptoWalletAddress.Type;

/**
 * Redacted Branded schema for canonical mainnet blockchain wallet addresses.
 *
 * @since 0.0.0
 * @category Validation
 */
export const CryptoWalletAddressRedacted = CryptoWalletAddress.pipe(
  S.RedactedFromValue,
  SchemaUtils.withStatics(() => ({
    makeRedacted: flow(CryptoWalletAddress.make, Redacted.make),
  })),
  S.annotate(
    $I.annote("CryptoWalletAddressRedacted", {
      description:
        "Redacted Canonical mainnet wallet address for supported" + " EVM," + " Bitcoin, and Solana networks.",
    })
  )
);

/**
 * Type for {@link CryptoWalletAddressRedacted}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type CryptoWalletAddressRedacted = typeof CryptoWalletAddressRedacted.Type;
