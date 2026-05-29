/**
 * CurrencyCode - ISO 4217 currency code value object
 *
 * A branded type representing a valid ISO 4217 currency code (3 uppercase letters).
 * Uses S.brand for compile-time type safety.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $SchemaId } from "@beep/identity";
import * as S from "effect/Schema";

const $I = $SchemaId.create("CurrencyCode");

/**
 * Schema for a valid ISO 4217 currency code (exactly 3 uppercase ASCII letters).
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
export const CurrencyCode = S.String.check(S.isPattern(/^[A-Z]{3}$/)).pipe(
  S.brand("CurrencyCode"),
  $I.annoteSchema("CurrencyCode", {
    description: "An ISO 4217 currency code (3 uppercase letters)",
  })
);

/**
 * {@inheritDoc CurrencyCode}
 *
 * @example
 * ```ts
 * import type { CurrencyCode } from "@beep/schema/CurrencyCode"
 *
 * const currency: CurrencyCode = "EUR" as CurrencyCode
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type CurrencyCode = typeof CurrencyCode.Type;

/**
 * Type guard for {@link CurrencyCode}.
 *
 * @example
 * ```ts
 * import { isCurrencyCode } from "@beep/schema/CurrencyCode"
 *
 * console.log(isCurrencyCode("USD")) // true
 * console.log(isCurrencyCode("usd")) // false
 * ```
 *
 * @category validation
 * @since 0.0.0
 */
export const isCurrencyCode = S.is(CurrencyCode);

/**
 * ISO 4217 constant for United States Dollar.
 *
 * @example
 * ```ts
 * import { USD } from "@beep/schema/CurrencyCode"
 *
 * console.log(USD) // "USD"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const USD: CurrencyCode = CurrencyCode.make("USD");
/**
 * ISO 4217 constant for Euro.
 *
 * @example
 * ```ts
 * import { EUR } from "@beep/schema/CurrencyCode"
 *
 * console.log(EUR)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const EUR: CurrencyCode = CurrencyCode.make("EUR");
/**
 * ISO 4217 constant for British Pound Sterling.
 *
 * @example
 * ```ts
 * import { GBP } from "@beep/schema/CurrencyCode"
 *
 * console.log(GBP)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const GBP: CurrencyCode = CurrencyCode.make("GBP");
/**
 * ISO 4217 constant for Japanese Yen.
 *
 * @example
 * ```ts
 * import { JPY } from "@beep/schema/CurrencyCode"
 *
 * console.log(JPY)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const JPY: CurrencyCode = CurrencyCode.make("JPY");
/**
 * ISO 4217 constant for Swiss Franc.
 *
 * @example
 * ```ts
 * import { CHF } from "@beep/schema/CurrencyCode"
 *
 * console.log(CHF)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const CHF: CurrencyCode = CurrencyCode.make("CHF");
/**
 * ISO 4217 constant for Canadian Dollar.
 *
 * @example
 * ```ts
 * import { CAD } from "@beep/schema/CurrencyCode"
 *
 * console.log(CAD)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const CAD: CurrencyCode = CurrencyCode.make("CAD");
/**
 * ISO 4217 constant for Australian Dollar.
 *
 * @example
 * ```ts
 * import { AUD } from "@beep/schema/CurrencyCode"
 *
 * console.log(AUD)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const AUD: CurrencyCode = CurrencyCode.make("AUD");
/**
 * ISO 4217 constant for Chinese Yuan.
 *
 * @example
 * ```ts
 * import { CNY } from "@beep/schema/CurrencyCode"
 *
 * console.log(CNY)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const CNY: CurrencyCode = CurrencyCode.make("CNY");
/**
 * ISO 4217 constant for Hong Kong Dollar.
 *
 * @example
 * ```ts
 * import { HKD } from "@beep/schema/CurrencyCode"
 *
 * console.log(HKD)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const HKD: CurrencyCode = CurrencyCode.make("HKD");
/**
 * ISO 4217 constant for Singapore Dollar.
 *
 * @example
 * ```ts
 * import { SGD } from "@beep/schema/CurrencyCode"
 *
 * console.log(SGD)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const SGD: CurrencyCode = CurrencyCode.make("SGD");
