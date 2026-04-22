/**
 * \@beep/shared-tables
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Current package version.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/shared-tables"
 *
 * const version = VERSION
 *
 * void version
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const VERSION = "0.0.0" as const;

/**
 * @since 0.0.0
 * @category types
 */
export * from "./columns.js";

/**
 * @since 0.0.0
 * @category constructors
 */
export * as Common from "./common.js";

/**
 * @since 0.0.0
 * @category constructors
 */
export * as Table from "./table.js";
