/**
 * IANA timezone name data.
 *
 * Provides a typed constant array of all commonly used IANA timezone
 * identifiers (e.g. `"America/New_York"`, `"Europe/London"`, `"UTC"`).
 *
 * @module
 * @since 0.0.0
 */

import * as internal from "./internal/data/timezones.js";

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
 * @category types
 * @example
 * ```ts
 * import type { TimezoneName } from "@beep/data/Timezones"
 *
 * const tz: TimezoneName = "America/New_York"
 * ```
 */
export type TimezoneName = (typeof internal.TimezoneNameValues)[number];

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
 * ```ts
 * import { TimezoneNameValues } from "@beep/data/Timezones"
 *
 * TimezoneNameValues[0] // "Africa/Abidjan"
 * ```
 */
export const TimezoneNameValues: typeof internal.TimezoneNameValues = internal.TimezoneNameValues;
