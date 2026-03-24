/**
 * CurrencyCode - ISO 4217 currency code value object
 *
 * A branded type representing a valid ISO 4217 currency code (3 uppercase letters).
 * Uses S.brand for compile-time type safety.
 *
 * @module @beep/schema/CurrencyCode
 */

import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SchemaId.create("CurrencyCode");

/**
 * Schema for a valid ISO 4217 currency code.
 * Must be exactly 3 uppercase ASCII letters.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export const CurrencyCode = S.String.check(S.isPattern(/^[A-Z]{3}$/)).pipe(
  S.brand("CurrencyCode"),
  $I.annoteSchema("CurrencyCode", {
    description: "An ISO 4217 currency code (3 uppercase letters)",
  })
);

/**
 * The branded CurrencyCode type {@link CurrencyCode} {@inheritDoc CurrencyCode}
 *
 * @category DomainModel
 * @since 0.0.0
 */
export type CurrencyCode = typeof CurrencyCode.Type;

/**
 * Type guard for CurrencyCode using S.is
 * @category Validation
 * @since 0.0.0
 */
export const isCurrencyCode = S.is(CurrencyCode);

/**
 * Common ISO 4217 currency codes
 * Using Schema's .make() constructor which validates by default
 * @category Configuration
 * @since 0.0.0
 */
export const USD: CurrencyCode = CurrencyCode.makeUnsafe("USD");
/**
 * @category Configuration
 * @since 0.0.0
 */
export const EUR: CurrencyCode = CurrencyCode.makeUnsafe("EUR");
/**
 * @category Configuration
 * @since 0.0.0
 */
export const GBP: CurrencyCode = CurrencyCode.makeUnsafe("GBP");
/**
 * @category Configuration
 * @since 0.0.0
 */
export const JPY: CurrencyCode = CurrencyCode.makeUnsafe("JPY");
/**
 * @category Configuration
 * @since 0.0.0
 */
export const CHF: CurrencyCode = CurrencyCode.makeUnsafe("CHF");
/**
 * @category Configuration
 * @since 0.0.0
 */
export const CAD: CurrencyCode = CurrencyCode.makeUnsafe("CAD");
/**
 * @category Configuration
 * @since 0.0.0
 */
export const AUD: CurrencyCode = CurrencyCode.makeUnsafe("AUD");
/**
 * @category Configuration
 * @since 0.0.0
 */
export const CNY: CurrencyCode = CurrencyCode.makeUnsafe("CNY");
/**
 * @category Configuration
 * @since 0.0.0
 */
export const HKD: CurrencyCode = CurrencyCode.makeUnsafe("HKD");
/**
 * @category Configuration
 * @since 0.0.0
 */
export const SGD: CurrencyCode = CurrencyCode.makeUnsafe("SGD");
