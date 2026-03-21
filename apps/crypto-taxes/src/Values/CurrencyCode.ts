/**
 * CurrencyCode - ISO 4217 currency code value object
 *
 * A branded type representing a valid ISO 4217 currency code (3 uppercase letters).
 * Uses Schema.brand for compile-time type safety.
 *
 * @module currency/CurrencyCode
 */

import * as S from "effect/Schema";
import { $CryptoTaxesId } from "@beep/identity";

const $I = $CryptoTaxesId.create("Values/CurrencyCode");

/**
 * Schema for a valid ISO 4217 currency code.
 * Must be exactly 3 uppercase ASCII letters.
 */
export const CurrencyCode = S.String.check(S.isPattern(/^[A-Z]{3}$/)).pipe(
  S.brand("CurrencyCode")
).pipe(
  $I.annoteSchema("CurrencyCode", {
    description: "ISO 4217 currency code (3 uppercase letters)"
  })
);


/**
 * The branded CurrencyCode type
 */
export type CurrencyCode = typeof CurrencyCode.Type;

/**
 * Type guard for CurrencyCode using Schema.is
 */
export const isCurrencyCode = S.is(CurrencyCode)


/**
 * Common ISO 4217 currency codes
 * Using Schema's .make() constructor which validates by default
 */
export const USD: CurrencyCode = CurrencyCode.makeUnsafe("USD");
