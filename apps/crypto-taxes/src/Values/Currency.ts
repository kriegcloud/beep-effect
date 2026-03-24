/**
 * Currency - Entity representing a monetary currency
 *
 * Represents a monetary currency with ISO 4217 code, name, symbol,
 * decimal places, and active status.
 *
 * @module currency/Currency
 */
import { $CryptoTaxesId } from "@beep/identity";
import { LiteralKit, NonEmptyTrimmedStr } from "@beep/schema";
import type { Brand } from "effect";
import { HashMap } from "effect";
import * as A from "effect/Array";
import type * as O from "effect/Option";
import * as S from "effect/Schema";
import { CurrencyCode, USD } from "./CurrencyCode.ts";

const $I = $CryptoTaxesId.create("Values/Currency");

/**
 * DecimalPlaces - Valid decimal places for currencies
 *
 * Most currencies use 2 decimal places, but some use 0 (JPY, KRW),
 * 3 (KWD, BHD, OMR), or 4 (CLF) decimal places.
 */
export const DecimalPlaces = LiteralKit([0, 2, 3, 4]).pipe(
  $I.annoteSchema("DecimalPlaces", {
    description: "Number of decimal places for the currency (0, 2, 3, or 4)",
  })
);

/**
 * The DecimalPlaces type
 */
export type DecimalPlaces = typeof DecimalPlaces.Type;

/**
 * Type guard for DecimalPlaces using Schema.is
 */
export const isDecimalPlaces = S.is(DecimalPlaces);

/**
 * Currency - Entity representing a monetary currency
 *
 * Contains the ISO 4217 code, display name, symbol, decimal places,
 * and active status for a currency.
 */
export class Currency extends S.Class<Currency>($I`Currency`)(
  {
    /**
     * ISO 4217 currency code (e.g., USD, EUR, GBP)
     */
    code: CurrencyCode.annotateKey({
      description: "ISO 4217 currency code (e.g., USD, EUR, GBP)",
    }),
    /**
     * Display name of the currency (e.g., "US Dollar")
     */
    name: NonEmptyTrimmedStr.annotateKey({
      description: "Display name of the currency (e.g., 'US Dollar')",
    }),
    /**
     * Currency symbol for display (e.g., "$", "€", "£")
     */ symbol: S.Char.annotateKey({
      description: "Currency symbol for display (e.g., '$', '€', '£')",
    }),

    /**
     * Number of decimal places for the currency
     */
    decimalPlaces: DecimalPlaces.annotateKey({
      description: "Number of decimal places for the currency (0, 2, 3, or 4)",
    }),

    /**
     * Whether the currency is active for use
     */
    isActive: S.Boolean.annotateKey({
      description: "Whether the currency is active for use",
    }),
  },
  $I.annote("Currency", {
    description: "Currency - Entity representing a monetary currency",
    documentation:
      "Contains the ISO 4217 code, display name, symbol, decimal places,\nand active status for a currency.",
  })
) {
  /**
   * Format an amount with the currency symbol
   */
  readonly formatAmount: (amount: number) => string = (amount: number): string => {
    const formatted = amount.toFixed(this.decimalPlaces);
    return `${this.symbol}${formatted}`;
  };
}

/**
 * Type guard for Currency using Schema.is
 */
export const isCurrency = S.is(Currency);

// =============================================================================
// Predefined Common Currencies
// =============================================================================

/**
 * US Dollar
 */
export const USD_CURRENCY: Currency = Currency.makeUnsafe({
  code: USD,
  name: NonEmptyTrimmedStr.makeUnsafe("US Dollar"),
  symbol: "$",
  decimalPlaces: 2,
  isActive: true,
});
/**
 * Collection of all predefined currencies
 */
export const COMMON_CURRENCIES = [USD_CURRENCY] as const;

/**
 * Map of currency code to Currency entity for quick lookup
 */
export const CURRENCIES_BY_CODE: HashMap.HashMap<string & Brand.Brand<"CurrencyCode">, Currency> = HashMap.fromIterable(
  A.map(COMMON_CURRENCIES, (currency) => [currency.code, currency] as const)
);

/**
 * Get a currency by its code from the predefined currencies
 */
export const getCurrencyByCode = (code: CurrencyCode): O.Option<Currency> => HashMap.get(CURRENCIES_BY_CODE, code);
