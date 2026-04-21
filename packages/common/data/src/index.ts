/**
 * Core data values and utilities for the beep platform.
 *
 * Provides vendored, edge-compatible MIME type lookup utilities, calendar
 * constants, ISO 4217 currency codes, IANA timezone identifiers, and other
 * shared data constants used across packages.
 *
 * @module
 * @since 0.0.0
 */

/**
 * Blockchain network metadata namespace.
 *
 * @example
 * ```typescript
 * import { Blockchain } from "@beep/data"
 *
 * console.log(Blockchain.Networks.Ethereum.ticker)
 * ```
 *
 * @since 0.0.0
 * @category constants
 */
export * as Blockchain from "./Blockchain.ts";
/**
 * Calendar constants namespace.
 *
 * @example
 * ```typescript
 * import { Calendar } from "@beep/data"
 *
 * console.log(Calendar.MonthNameValues[0])
 * ```
 *
 * @since 0.0.0
 * @category constants
 */
export * as Calendar from "./Calendar.ts";

/**
 * ISO 4217 currency constants namespace.
 *
 * @example
 * ```typescript
 * import { CurrencyCodes } from "@beep/data"
 *
 * console.log(CurrencyCodes.CurrencyCodeDataValues[0].code)
 * ```
 *
 * @since 0.0.0
 * @category constants
 */
export * as CurrencyCodes from "./CurrencyCodes.ts";
/**
 * MIME type lookup utilities namespace.
 *
 * @example
 * ```typescript
 * import { MimeTypesData } from "@beep/data"
 *
 * console.log(MimeTypesData.lookup("asset.json"))
 * ```
 *
 * @since 0.0.0
 * @category constants
 */
export * as MimeTypesData from "./MimeTypes.ts";
/**
 * IANA timezone constants namespace.
 *
 * @example
 * ```typescript
 * import { Timezones } from "@beep/data"
 *
 * console.log(Timezones.TimezoneNameValues[0])
 * ```
 *
 * @since 0.0.0
 * @category constants
 */
export * as Timezones from "./Timezones.ts";
