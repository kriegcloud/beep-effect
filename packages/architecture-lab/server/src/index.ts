/**
 * Architecture lab server package.
 *
 * @packageDocumentation
 * @category handlers
 * @since 0.1.0
 */

/**
 * Package version for the architecture lab server role.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/architecture-lab-server"
 *
 * console.log(VERSION)
 * ```
 *
 * @category handlers
 * @since 0.1.0
 */
export const VERSION = "0.0.0" as const;

/**
 * Direct WorkItem server namespace export.
 *
 * @category handlers
 * @since 0.1.0
 */
export * as WorkItem from "./aggregates/WorkItem/index.js";
/**
 * Architecture lab server layer export.
 *
 * @category layers
 * @since 0.1.0
 */
export * from "./Layer.js";
