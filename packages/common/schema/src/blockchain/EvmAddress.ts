/**
 * Branded schema for canonical mainnet EVM wallet addresses.
 *
 * Accepts lowercase or EIP-55 checksummed addresses.
 *
 * @since 0.0.0
 * @module @beep/schema/blockchain/EvmAddress
 */

import { $SchemaId } from "@beep/identity/packages";
import { Str } from "@beep/utils";
import { keccak_256 } from "@noble/hashes/sha3.js";
import { Encoding } from "effect";
import * as Eq from "effect/Equal";
import { flow, Redacted } from "effect";
import * as S from "effect/Schema";
import * as SchemaUtils from "../SchemaUtils/index.ts";

const $I = $SchemaId.create("blockchain/EvmAddress");

const evmAddressPattern = /^0x[0-9a-fA-F]{40}$/;

const isCanonicalEvmAddress = (input: string): boolean => {
  if (!evmAddressPattern.test(input)) {
    return false;
  }

  const addressBody = Str.slice(2)(input);
  const lowercaseAddressBody = Str.toLowerCase(addressBody);

  if (addressBody === lowercaseAddressBody) {
    return true;
  }

  const checksum = Encoding.encodeHex(keccak_256(new TextEncoder().encode(lowercaseAddressBody)));

  for (let index = 0; index < addressBody.length; index += 1) {
    const character = addressBody[index]!;
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

const EvmAddressChecks = S.makeFilterGroup(
  [
    S.makeFilter(isCanonicalEvmAddress, {
      identifier: $I`EvmAddressFormatCheck`,
      title: "EVM Address Format",
      description: "A canonical mainnet EVM address in lowercase or valid EIP-55 checksum form.",
      message: "EvmAddress must be a canonical mainnet EVM address",
    }),
  ],
  {
    identifier: $I`EvmAddressChecks`,
    title: "EvmAddress",
    description: "Checks for canonical mainnet EVM addresses.",
  }
);

/**
 * Branded schema for canonical mainnet EVM wallet addresses.
 *
 * @since 0.0.0
 * @category Validation
 */
export const EvmAddress = S.NonEmptyString.check(EvmAddressChecks).pipe(
  S.brand("EvmAddress"),
  S.annotate(
    $I.annote("EvmAddress", {
      description: "Canonical mainnet EVM address in lowercase or valid EIP-55 checksum form.",
    })
  )
);

/**
 * Type for {@link EvmAddress}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type EvmAddress = typeof EvmAddress.Type;

/**
 * Redacted schema for canonical mainnet EVM wallet addresses.
 *
 * @since 0.0.0
 * @category Validation
 */
export const EvmAddressRedacted = EvmAddress.pipe(
  S.RedactedFromValue,
  SchemaUtils.withStatics(() => ({
    makeRedacted: flow(EvmAddress.makeUnsafe, Redacted.make),
  })),
  S.annotate(
    $I.annote("EvmAddressRedacted", {
      description: "Redacted canonical mainnet EVM address in lowercase or valid EIP-55 checksum form.",
    })
  )
);

/**
 * Type for {@link EvmAddressRedacted}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type EvmAddressRedacted = typeof EvmAddressRedacted.Type;
