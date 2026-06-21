/**
 * CurrencyCode - ISO 4217 currency code value object.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { CurrencyCodes as CurrencyCodesData } from "@beep/data";
import { $SchemaId } from "@beep/identity";
import { A, Struct } from "@beep/utils";
import { cast } from "@beep/utils/Function";
import { pipe } from "effect";
import * as S from "effect/Schema";
import { LiteralKit } from "./LiteralKit/index.ts";

const $I = $SchemaId.create("CurrencyCode");

const currencyNameOptions = pipe(
  Struct.entriesNonEmpty(CurrencyCodesData.CurrencyCodeDataNameByCode),
  A.map(([, name]) => name),
  A.dedupe
);
const currencyNameOptionsNonEmpty = cast<
  ReadonlyArray<CurrencyCodesData.CurrencyCodeData["currency"]>,
  A.NonEmptyReadonlyArray<CurrencyCodesData.CurrencyCodeData["currency"]>
>(currencyNameOptions);

/**
 * Schema for active ISO 4217 currency code literals.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { CurrencyCode } from "@beep/schema/CurrencyCode"
 *
 * const code = S.decodeUnknownSync(CurrencyCode)("USD")
 * console.log(code) // "USD"
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export const CurrencyCode = LiteralKit(Struct.keysNonEmpty(CurrencyCodesData.CurrencyCodeDataByCode)).pipe(
  $I.annoteSchema("CurrencyCode", {
    description: "An active ISO 4217 currency code.",
  })
);

/**
 * {@inheritDoc CurrencyCode}
 *
 * @category models
 * @since 0.0.0
 */
export type CurrencyCode = typeof CurrencyCode.Type;

/**
 * Schema for active ISO 4217 currency display-name literals.
 *
 * @category models
 * @since 0.0.0
 */
export const CurrencyName = LiteralKit(currencyNameOptionsNonEmpty).pipe(
  $I.annoteSchema("CurrencyName", {
    description: "An active ISO 4217 currency display name.",
  })
);

/**
 * {@inheritDoc CurrencyName}
 *
 * @category models
 * @since 0.0.0
 */
export type CurrencyName = typeof CurrencyName.Type;

/**
 * Type guard for {@link CurrencyCode}.
 *
 * @category validation
 * @since 0.0.0
 */
export const isCurrencyCode = S.is(CurrencyCode);

/**
 * ISO 4217 constant for United States Dollar.
 *
 * @category constants
 * @since 0.0.0
 */
export const USD: CurrencyCode = CurrencyCode.make("USD");
/**
 * ISO 4217 constant for Euro.
 *
 * @category constants
 * @since 0.0.0
 */
export const EUR: CurrencyCode = CurrencyCode.make("EUR");
/**
 * ISO 4217 constant for British Pound Sterling.
 *
 * @category constants
 * @since 0.0.0
 */
export const GBP: CurrencyCode = CurrencyCode.make("GBP");
/**
 * ISO 4217 constant for Japanese Yen.
 *
 * @category constants
 * @since 0.0.0
 */
export const JPY: CurrencyCode = CurrencyCode.make("JPY");
/**
 * ISO 4217 constant for Swiss Franc.
 *
 * @category constants
 * @since 0.0.0
 */
export const CHF: CurrencyCode = CurrencyCode.make("CHF");
/**
 * ISO 4217 constant for Canadian Dollar.
 *
 * @category constants
 * @since 0.0.0
 */
export const CAD: CurrencyCode = CurrencyCode.make("CAD");
/**
 * ISO 4217 constant for Australian Dollar.
 *
 * @category constants
 * @since 0.0.0
 */
export const AUD: CurrencyCode = CurrencyCode.make("AUD");
/**
 * ISO 4217 constant for Chinese Yuan.
 *
 * @category constants
 * @since 0.0.0
 */
export const CNY: CurrencyCode = CurrencyCode.make("CNY");
/**
 * ISO 4217 constant for Hong Kong Dollar.
 *
 * @category constants
 * @since 0.0.0
 */
export const HKD: CurrencyCode = CurrencyCode.make("HKD");
/**
 * ISO 4217 constant for Singapore Dollar.
 *
 * @category constants
 * @since 0.0.0
 */
export const SGD: CurrencyCode = CurrencyCode.make("SGD");
