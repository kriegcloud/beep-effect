/**
 * Architecture lab WorkItem table package.
 *
 * @packageDocumentation
 * @category tables
 * @since 0.1.0
 */

/**
 * Package version for the architecture lab tables role.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/architecture-lab-tables"
 *
 * console.log(VERSION)
 * ```
 *
 * @category tables
 * @since 0.1.0
 */
export const VERSION = "0.0.0" as const;

/**
 * Direct WorkItem table namespace export.
 *
 * @category tables
 * @since 0.1.0
 */
export * as WorkItem from "./aggregates/WorkItem/index.js";
/**
 * Architecture lab Drizzle schema exports.
 *
 * @category tables
 * @since 0.1.0
 */
export * from "./tables.js";
