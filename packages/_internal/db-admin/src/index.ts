/**
 * \@beep/db-admin
 *
 * @category configuration
 * @since 0.0.0
 */

/**
 * Current package version.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/db-admin"
 *
 * console.log(VERSION)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;

/**
 * Migration target exports.
 *
 * @category configuration
 * @since 0.0.0
 */
export * from "./targets.js";
