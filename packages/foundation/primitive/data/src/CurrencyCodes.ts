/**
 * ISO 4217 currency code data.
 *
 * Provides a typed constant array of all active ISO 4217 currency entries
 * including their three-letter code, numeric code, decimal digit count,
 * currency name, and the countries where each currency is used.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as internal from "./generated/iso4217.ts";

// -------------------------------------------------------------------------------------
// types
// -------------------------------------------------------------------------------------

/**
 * A single ISO 4217 currency entry containing the three-letter code,
 * numeric code, decimal digits, human-readable currency name, and an
 * array of countries where the currency is used.
 *
 * @since 0.0.0
 * @category models
 * @example
 * ```typescript
 * import { CurrencyCodeDataValues, type CurrencyCodeData } from "@beep/data/CurrencyCodes"
 *
 * const entry: CurrencyCodeData = CurrencyCodeDataValues[0]
 * console.log(entry)
 * ```
 */
export type CurrencyCodeData = (typeof internal.CurrencyCodeDataValues)[number];

/**
 * Union of all ISO 4217 three-letter currency code strings.
 *
 * @since 0.0.0
 * @category models
 * @example
 * ```typescript
 * import type { CurrencyCode } from "@beep/data/CurrencyCodes"
 *
 * const usd: CurrencyCode = "USD"
 * const eur: CurrencyCode = "EUR"
 * console.log(usd)
 * console.log(eur)
 * ```
 */
export type CurrencyCode = CurrencyCodeData["code"];

/**
 * Stable source metadata for the generated ISO 4217 dataset.
 *
 * @since 0.0.0
 * @category models
 */
export type CurrencyCodeDataMetadata = typeof internal.CurrencyCodeDataMetadata;

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
 * ```typescript
 * import { CurrencyCodeDataValues } from "@beep/data/CurrencyCodes"
 *
 * CurrencyCodeDataValues[0].code // "AED"
 * CurrencyCodeDataValues[0].currency // "UAE Dirham"
 * ```
 */
export const CurrencyCodeDataValues: typeof internal.CurrencyCodeDataValues = internal.CurrencyCodeDataValues;

/**
 * Stable source metadata for the generated ISO 4217 dataset.
 *
 * @since 0.0.0
 * @category constants
 */
export const CurrencyCodeDataMetadata: typeof internal.CurrencyCodeDataMetadata = internal.CurrencyCodeDataMetadata;

/**
 * Published date reported by the official ISO 4217 List One feed.
 *
 * @since 0.0.0
 * @category constants
 */
export const CurrencyCodeDataPublished: typeof internal.CurrencyCodeDataPublished = internal.CurrencyCodeDataPublished;

/**
 * Official source URL for the ISO 4217 List One feed.
 *
 * @since 0.0.0
 * @category constants
 */
export const CurrencyCodeDataSourceUrl: typeof internal.CurrencyCodeDataSourceUrl = internal.CurrencyCodeDataSourceUrl;

/**
 * SHA-256 digest of the official source payload used for the generated dataset.
 *
 * @since 0.0.0
 * @category constants
 */
export const CurrencyCodeDataSourceSha256: typeof internal.CurrencyCodeDataSourceSha256 =
  internal.CurrencyCodeDataSourceSha256;

/**
 * ISO 4217 currency entries keyed by alphabetic code.
 *
 * @since 0.0.0
 * @category constants
 */
export const CurrencyCodeDataByCode: typeof internal.CurrencyCodeDataByCode = internal.CurrencyCodeDataByCode;

/**
 * ISO 4217 alphabetic code literals.
 *
 * @since 0.0.0
 * @category constants
 */
export const CurrencyCodeDataCodeValues: typeof internal.CurrencyCodeDataCodeValues =
  internal.CurrencyCodeDataCodeValues;

/**
 * ISO 4217 currency names keyed by alphabetic code.
 *
 * @since 0.0.0
 * @category constants
 */
export const CurrencyCodeDataNameByCode: typeof internal.CurrencyCodeDataNameByCode =
  internal.CurrencyCodeDataNameByCode;

/**
 * ISO 4217 alphabetic code to currency-name literal pairs.
 *
 * @since 0.0.0
 * @category constants
 */
export const CurrencyCodeDataCodeNamePairs: typeof internal.CurrencyCodeDataCodeNamePairs =
  internal.CurrencyCodeDataCodeNamePairs;
