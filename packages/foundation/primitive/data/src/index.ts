/**
 * Core data values and utilities for the beep platform.
 *
 * Provides vendored, edge-compatible MIME type lookup utilities, calendar
 * constants, ISO 4217 currency codes, IANA timezone identifiers, and other
 * shared data constants used across packages.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Blockchain network metadata namespace.
 *
 * @example
 * ```typescript
 * import { Blockchain } from "@beep/data"
 *
 * console.assert(Blockchain.Networks.Ethereum.ticker === "ETH")
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export * as Blockchain from "./Blockchain.ts";
/**
 * Calendar constants namespace.
 *
 * @example
 * ```typescript
 * import { Calendar } from "@beep/data"
 *
 * console.assert(Calendar.MonthISOValues[0] === "01")
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export * as Calendar from "./Calendar.ts";
/**
 * ISO 4217 currency constants namespace.
 *
 * @example
 * ```typescript
 * import { CurrencyCodes } from "@beep/data"
 *
 * console.assert(CurrencyCodes.CurrencyCodeDataByCode.USD.currency === "US Dollar")
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export * as CurrencyCodes from "./CurrencyCodes.ts";
/**
 * Keyboard shortcut constants namespace.
 *
 * @example
 * ```typescript
 * import { KeyboardShortcuts } from "@beep/data"
 *
 * const hasCopyShortcut = KeyboardShortcuts.KeyboardShortcutDataValues.some(
 *   (shortcut) => shortcut.name === "copy"
 * )
 *
 * console.assert(hasCopyShortcut)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export * as KeyboardShortcuts from "./KeyboardShortcuts.ts";
/**
 * MIME type lookup utilities namespace.
 *
 * @example
 * ```typescript
 * import { MimeTypesData } from "@beep/data"
 *
 * console.assert(MimeTypesData.lookup("asset.json") === "application/json")
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export * as MimeTypesData from "./MimeTypes.ts";
/**
 * Unicode CLDR territory and continent constants namespace.
 *
 * @example
 * ```typescript
 * import { Territories } from "@beep/data"
 *
 * console.assert(Territories.TerritoryDataByCode.US.name === "United States")
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export * as Territories from "./Territories.ts";
/**
 * IANA timezone constants namespace.
 *
 * @example
 * ```typescript
 * import { Timezones } from "@beep/data"
 *
 * console.assert(Timezones.TimezoneDataByName.UTC.name === "UTC")
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export * as Timezones from "./Timezones.ts";
