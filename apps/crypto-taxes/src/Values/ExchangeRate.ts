/**
 * ExchangeRate - Entity representing currency exchange rates
 *
 * Records currency exchange rates for conversion with from/to currencies,
 * rate, effective date, rate type, and source.
 *
 * @module Values/ExchangeRate
 */

import {$CryptoTaxesId} from "@beep/identity";
import {LiteralKit} from "@beep/schema";
import * as S from "effect/Schema";
import {BigDecimal} from "effect";
import * as A from "effect/Array";
import {CurrencyCode} from "./CurrencyCode.ts";

const $I = $CryptoTaxesId.create("Values/ExchangeRate");

/**
 * ExchangeRateId - Branded UUID string for exchange rate identification
 *
 * Uses Effect's built-in UUID schema with additional branding for type safety.
 */
export const ExchangeRateId = S.NonEmptyString.check(S.isUUID(7))
.pipe(
  S.brand("ExchangeRateId"),
  $I.annoteSchema(
    "ExchangeRateId",
    {
      description: "ExchangeRateId - Branded UUID string for exchange rate identification",
      documentation: "Uses Effect's built-in UUID schema with additional branding for type safety."
    }
  )
);

/**
 * The branded ExchangeRateId type
 */
export type ExchangeRateId = typeof ExchangeRateId.Type;

/**
 * Type guard for ExchangeRateId using Schema.is
 */
export const isExchangeRateId = S.is(ExchangeRateId);

/**
 * RateType - Type of exchange rate
 *
 * - Spot: Current market rate at a point in time
 * - Average: Period average rate (e.g., monthly average)
 * - Historical: Rate at original transaction date
 * - Closing: End of period rate (e.g., month-end, year-end)
 */
export const RateType = LiteralKit([
  "Spot",
  "Average",
  "Historical",
  "Closing"
])
.pipe($I.annoteSchema(
  "RateType",
  {
    description: "RateType - Type of exchange rate",
    documentation: A.join(
      [
        "- Spot: Current market rate at a point in time",
        "- Average: Period average rate (e.g., monthly average)",
        "- Historical: Rate at original transaction date",
        "- Closing: End of period rate (e.g., month-end, year-end)"
      ],
      "\n"
    )
  }
));

/**
 * The RateType type
 */
export type RateType = typeof RateType.Type

/**
 * Type guard for RateType using Schema.is
 */
export const isRateType = S.is(RateType);

/**
 * RateSource - Source of the exchange rate
 *
 * - Manual: Manually entered by a user
 * - Import: Imported from a file or external system
 * - API: Retrieved from an API feed
 */
export const RateSource = LiteralKit([
  "Manual",
  "Import",
  "API"
])
.pipe($I.annoteSchema(
  "RateSource",
  {
    description: "RateSource - Source of the exchange rate",
    documentation: A.join(
      [
        "- Manual: Manually entered by a user",
        "- Import: Imported from a file or external system",
        "- API: Retrieved from an API feed"
      ],
      "\n"
    )
  }
));


/**
 * The RateSource type
 */
export type RateSource = typeof RateSource.Type

/**
 * Type guard for RateSource using Schema.is
 */
export const isRateSource = S.is(RateSource);

/**
 * Rate - A positive BigDecimal representing an exchange rate
 *
 * Exchange rates must be positive (greater than 0).
 * Uses BigDecimal for high precision decimal arithmetic.
 */
export const Rate = S.BigDecimal.check(S.makeFilter(BigDecimal.isPositive))
.pipe(
  S.brand("Rate"),
  $I.annoteSchema(
    "Rate",
    {
      description: "Rate - A positive BigDecimal representing an exchange rate",
      documentation: "Exchange rates must be positive (greater than 0). Uses BigDecimal for high precision decimal arithmetic."
    }
  )
);


/**
 * The branded Rate type
 */
export type Rate = typeof Rate.Type

/**
 * Type guard for Rate using Schema.is
 */
export const isRate = S.is(Rate);


/**
 * ExchangeRate - Entity representing a currency exchange rate
 *
 * Records the conversion rate between two currencies at a specific date,
 * with metadata about the rate type and source.
 */
export class ExchangeRate extends S.Class<ExchangeRate>($I`ExchangeRate`)(
  {
    /**
     * Unique identifier for the exchange rate
     */
    id: ExchangeRateId.annotateKey({
      description: "Unique identifier for the exchange rate"
    }),
    /**
     * Source currency code (the currency being converted from)
     */
    fromCurrency: CurrencyCode.annotateKey({
      description: "Source currency code (the currency being converted from)"
    }),
    /**
     * Target currency code (the currency being converted to)
     */
    toCurrency: CurrencyCode.annotateKey({
      description: "Target currency code (the currency being converted to)"
    }),
    /**
     * The exchange rate value (how many units of toCurrency per 1 unit of fromCurrency)
     */
    rate: Rate.annotateKey({
      description: "The exchange rate value (how many units of toCurrency per 1 unit of fromCurrency)"
    })
  }) {
}
