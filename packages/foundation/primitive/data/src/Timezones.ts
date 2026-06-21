/**
 * IANA timezone name data.
 *
 * Provides a typed constant array of all commonly used IANA timezone
 * identifiers (e.g. `"America/New_York"`, `"Europe/London"`, `"UTC"`).
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import * as internal from "./generated/iana-timezones.ts";

// -------------------------------------------------------------------------------------
// types
// -------------------------------------------------------------------------------------

/**
 * Union of all IANA timezone identifier strings.
 *
 * Each member is a full IANA timezone name such as `"America/New_York"`
 * or `"Europe/London"`.
 *
 * @since 0.0.0
 * @category models
 * @example
 * ```typescript
 * import type { TimezoneName } from "@beep/data/Timezones"
 *
 * const tz: TimezoneName = "America/New_York"
 * console.log(tz)
 * ```
 */
export type TimezoneName = (typeof internal.TimezoneNameValues)[number];

/**
 * A single generated IANA timezone entry.
 *
 * @since 0.0.0
 * @category models
 */
export type TimezoneData = (typeof internal.TimezoneDataValues)[number];

// -------------------------------------------------------------------------------------
// constants
// -------------------------------------------------------------------------------------

/**
 * Complete array of all commonly used IANA timezone identifiers.
 *
 * Covers Africa, America, Antarctica, Arctic, Asia, Atlantic,
 * Australia, Etc, Europe, Indian, and Pacific regions plus `"UTC"`.
 *
 * @since 0.0.0
 * @category constants
 * @example
 * ```typescript
 * import { TimezoneNameValues } from "@beep/data/Timezones"
 *
 * TimezoneNameValues[0] // "Africa/Abidjan"
 * ```
 */
export const TimezoneNameValues: typeof internal.TimezoneNameValues = internal.TimezoneNameValues;

/**
 * Stable source metadata for the generated IANA tzdb dataset.
 *
 * @since 0.0.0
 * @category constants
 */
export const TimezoneDataMetadata: typeof internal.TimezoneDataMetadata = internal.TimezoneDataMetadata;

/**
 * IANA tzdb version used for the generated dataset.
 *
 * @since 0.0.0
 * @category constants
 */
export const TimezoneDataVersion: typeof internal.TimezoneDataVersion = internal.TimezoneDataVersion;

/**
 * IANA tzdb data-only source URL.
 *
 * @since 0.0.0
 * @category constants
 */
export const TimezoneDataSourceUrl: typeof internal.TimezoneDataSourceUrl = internal.TimezoneDataSourceUrl;

/**
 * SHA-256 digest of the official source payload used for the generated dataset.
 *
 * @since 0.0.0
 * @category constants
 */
export const TimezoneDataSourceSha256: typeof internal.TimezoneDataSourceSha256 = internal.TimezoneDataSourceSha256;

/**
 * Generated IANA timezone entries.
 *
 * @since 0.0.0
 * @category constants
 */
export const TimezoneDataValues: typeof internal.TimezoneDataValues = internal.TimezoneDataValues;

/**
 * Generated IANA timezone entries keyed by timezone identifier.
 *
 * @since 0.0.0
 * @category constants
 */
export const TimezoneDataByName: typeof internal.TimezoneDataByName = internal.TimezoneDataByName;
