/**
 * Architecture lab UI package.
 *
 * @packageDocumentation
 * @category models
 * @since 0.1.0
 */

/**
 * Package version for the architecture lab UI role.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/architecture-lab-ui"
 *
 * console.log(VERSION)
 * ```
 *
 * @category models
 * @since 0.1.0
 */
export const VERSION = "0.0.0" as const;

/**
 * Direct WorkItem UI namespace export.
 *
 * @category models
 * @since 0.1.0
 */
export * as WorkItem from "./aggregates/WorkItem/index.js";
