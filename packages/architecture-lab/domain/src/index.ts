/**
 * Architecture lab canonical WorkItem domain package.
 *
 * @packageDocumentation
 * @category aggregates
 * @since 0.1.0
 */

/**
 * Package version for the architecture lab domain role.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/architecture-lab-domain"
 *
 * console.log(VERSION)
 * ```
 *
 * @category aggregates
 * @since 0.1.0
 */
export const VERSION = "0.0.0" as const;

/**
 * Aggregate namespace exports for the architecture lab domain package.
 *
 * @category aggregates
 * @since 0.1.0
 */
export * as Aggregates from "./aggregates/index.js";
/**
 * Direct WorkItem aggregate namespace export.
 *
 * @category aggregates
 * @since 0.1.0
 */
export * as WorkItem from "./aggregates/WorkItem/index.js";
