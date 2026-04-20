/**
 * ETH-denominated amount transported as a non-negative JSON number.
 *
 * Decodes into Effect `BigDecimal` for arithmetic safety.
 *
 * @since 0.0.0
 * @module \@beep/schema/blockchain/EthAmount
 */

import { $SchemaId } from "@beep/identity/packages";
import { BigDecimal, SchemaGetter } from "effect";
import * as S from "effect/Schema";

const $I = $SchemaId.create("blockchain/EthAmount");

const EthAmountInputChecks = S.makeFilterGroup(
  [
    S.isGreaterThanOrEqualTo(0).annotate({
      identifier: $I`EthAmountNonNegativeCheck`,
      title: "ETH Amount Non-Negative",
      description: "A non-negative ETH-denominated amount.",
      message: "EthAmount must be greater than or equal to 0",
    }),
  ],
  {
    identifier: $I`EthAmountInputChecks`,
    title: "EthAmount",
    description: "Checks for non-negative finite ETH-denominated JSON numbers.",
  }
);

const EthAmountInput = S.Finite.pipe(
  S.check(EthAmountInputChecks),
  S.annotate(
    $I.annote("EthAmountInput", {
      description: "Finite non-negative JSON number accepted at ETH amount boundaries.",
    })
  )
);

/**
 * ETH-denominated amount decoded from a non-negative JSON number into Effect
 * `BigDecimal`.
 *
 * @since 0.0.0
 * @category Validation
 */
export const EthAmount = EthAmountInput.pipe(
  S.decodeTo(S.BigDecimal, {
    decode: SchemaGetter.transform(BigDecimal.fromNumberUnsafe),
    encode: SchemaGetter.transform(BigDecimal.toNumberUnsafe),
  }),
  S.annotate(
    $I.annote("EthAmount", {
      description: "ETH-denominated amount decoded from a non-negative JSON number into Effect BigDecimal.",
    })
  )
);

/**
 * Type for {@link EthAmount}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type EthAmount = typeof EthAmount.Type;
