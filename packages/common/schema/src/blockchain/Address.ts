/**
 * Branded schema for canonical mainnet blockchain wallet addresses.
 *
 * Supports EVM, Bitcoin, and Solana families.
 *
 * @since 0.0.0
 * @module @beep/schema/blockchain/Address
 */

import { $SchemaId } from "@beep/identity/packages";
import { sha256 } from "@noble/hashes/sha2.js";
import { keccak_256 } from "@noble/hashes/sha3.js";
import { base58, bech32, bech32m } from "@scure/base";
import { Encoding } from "effect";
import * as S from "effect/Schema";

const $I = $SchemaId.create("blockchain/Address");

const evmAddressPattern = /^0x[0-9a-fA-F]{40}$/;

const isBech32Like = (input: string): input is `${string}1${string}` => input.includes("1");

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

const decodeCanonicalBase58 = (input: string): Uint8Array | null => {
  try {
    const decoded = base58.decode(input);

    return base58.encode(decoded) === input ? decoded : null;
  } catch {
    return null;
  }
};

const isCanonicalEvmAddress = (input: string): boolean => {
  if (!evmAddressPattern.test(input)) {
    return false;
  }

  const address = input.slice(2);
  const lowercaseAddress = address.toLowerCase();

  if (address === lowercaseAddress) {
    return true;
  }

  const checksum = Encoding.encodeHex(keccak_256(new TextEncoder().encode(lowercaseAddress)));

  for (let index = 0; index < address.length; index += 1) {
    const character = address[index]!;
    const lowercaseCharacter = character.toLowerCase();
    const uppercaseCharacter = character.toUpperCase();

    if (lowercaseCharacter === uppercaseCharacter) {
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

const isCanonicalBitcoinBase58Address = (input: string): boolean => {
  const decoded = decodeCanonicalBase58(input);

  if (decoded === null || decoded.length !== 25) {
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

const isCanonicalBitcoinWitnessAddress = (input: string): boolean => {
  if (!input.startsWith("bc1") || input !== input.toLowerCase() || !isBech32Like(input)) {
    return false;
  }

  try {
    const decoded = bech32.decode(input);

    if (decoded.prefix !== "bc" || decoded.words.length === 0) {
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

    if (decoded.prefix !== "bc" || decoded.words.length === 0) {
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

const isCanonicalBitcoinAddress = (input: string): boolean =>
  isCanonicalBitcoinBase58Address(input) || isCanonicalBitcoinWitnessAddress(input);

const isCanonicalSolanaAddress = (input: string): boolean => {
  const decoded = decodeCanonicalBase58(input);

  return decoded !== null && decoded.length === 32;
};

const isCanonicalAddress = (input: string): boolean =>
  isCanonicalEvmAddress(input) || isCanonicalBitcoinAddress(input) || isCanonicalSolanaAddress(input);

const AddressChecks = S.makeFilterGroup(
  [
    S.makeFilter(isCanonicalAddress, {
      identifier: $I`AddressFormatCheck`,
      title: "Address Format",
      description: "A canonical mainnet EVM, Bitcoin, or Solana wallet address.",
      message: "Address must be a canonical mainnet EVM, Bitcoin, or Solana wallet address",
    }),
  ],
  {
    identifier: $I`AddressChecks`,
    title: "Address",
    description: "Checks for canonical mainnet wallet addresses across EVM, Bitcoin, and Solana families.",
  }
);

/**
 * Branded schema for canonical mainnet blockchain wallet addresses.
 *
 * @since 0.0.0
 * @category Validation
 */
export const Address = S.NonEmptyString.check(AddressChecks).pipe(
  S.brand("Address"),
  S.annotate(
    $I.annote("Address", {
      description: "Canonical mainnet wallet address for supported EVM, Bitcoin, and Solana networks.",
    })
  )
);

/**
 * Type for {@link Address}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type Address = typeof Address.Type;
