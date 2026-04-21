/**
 * Shared numeric schemas used across NLP domains and tool boundaries.
 *
 * @since 0.0.0
 * @module
 */

import { $NlpId } from "@beep/identity";
import { isPositive } from "@beep/schema";
import * as S from "effect/Schema";

const $I = $NlpId.create("internal/numbers");

const UnitIntervalChecks = S.makeFilterGroup(
  [
    S.isGreaterThanOrEqualTo(0).annotate({
      description: "A number greater than or equal to 0.",
      message: "Expected a number greater than or equal to 0",
    }),
    S.isLessThanOrEqualTo(1).annotate({
      description: "A number less than or equal to 1.",
      message: "Expected a number less than or equal to 1",
    }),
  ],
  {
    description: "Checks for numeric values between 0 and 1 inclusive.",
    identifier: $I`UnitIntervalChecks`,
    title: "Unit Interval Checks",
  }
);

/**
 * Numeric value between 0 and 1 inclusive.
 *
 * @since 0.0.0
 * @category Validation
 */
export const UnitInterval = S.Number.check(UnitIntervalChecks).annotate(
  $I.annote("UnitInterval", {
    description: "A numeric value between 0 and 1 inclusive.",
  })
);

/**
 * Runtime type for {@link UnitInterval}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type UnitInterval = typeof UnitInterval.Type;

/**
 * Strictly positive numeric value.
 *
 * @since 0.0.0
 * @category Validation
 */
export const PositiveNumber = S.Number.check(
  isPositive.annotate({
    description: "A number greater than 0.",
    message: "Expected a number greater than 0",
  })
).annotate(
  $I.annote("PositiveNumber", {
    description: "A numeric value greater than 0.",
  })
);

/**
 * Runtime type for {@link PositiveNumber}.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export type PositiveNumber = typeof PositiveNumber.Type;
