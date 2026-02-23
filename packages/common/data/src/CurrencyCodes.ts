/**
 * ISO 4217 currency code data.
 *
 * Provides a typed constant array of all active ISO 4217 currency entries
 * including their three-letter code, numeric code, decimal digit count,
 * currency name, and the countries where each currency is used.
 *
 * @module
 * @since 0.0.0
 */

import * as internal from "./internal/data/currency-codes.js";

// -------------------------------------------------------------------------------------
// types
// -------------------------------------------------------------------------------------

/**
 * A single ISO 4217 currency entry containing the three-letter code,
 * numeric code, decimal digits, human-readable currency name, and an
 * array of countries where the currency is used.
 *
 * @since 0.0.0
 * @category types
 * @example
 * ```ts
 * import type { CurrencyCodeData } from "@beep/data/CurrencyCodes"
 *
 * const entry: CurrencyCodeData = {
 *   code: "AED",
 *   number: "784",
 *   digits: 2,
 *   currency: "UAE Dirham",
 *   countries: ["United Arab Emirates (The)"]
 * }
 * ```
 */
export type CurrencyCodeData = (typeof internal.CurrencyCodeDataValues)[number];

/**
 * Union of all ISO 4217 three-letter currency code strings.
 *
 * @since 0.0.0
 * @category types
 * @example
 * ```ts
 * import type { CurrencyCode } from "@beep/data/CurrencyCodes"
 *
 * const usd: CurrencyCode = "USD"
 * const eur: CurrencyCode = "EUR"
 * ```
 */
export type CurrencyCode = CurrencyCodeData["code"];

// -------------------------------------------------------------------------------------
// constants
// -------------------------------------------------------------------------------------

/**
 * Complete array of all active ISO 4217 currency entries.
 *
 * Each entry contains a `code` (three-letter), `number` (three-digit),
 * `digits` (decimal places), `currency` (human name), and `countries`
 * (array of country names where the currency is used).
 *
 * Sourced from the official ISO 4217 published list.
 *
 * @since 0.0.0
 * @category constants
 * @example
 * ```ts
 * import { CurrencyCodeDataValues } from "@beep/data/CurrencyCodes"
 *
 * CurrencyCodeDataValues[0].code // "AED"
 * CurrencyCodeDataValues[0].currency // "UAE Dirham"
 * ```
 */
export const CurrencyCodeDataValues: typeof internal.CurrencyCodeDataValues = internal.CurrencyCodeDataValues;
