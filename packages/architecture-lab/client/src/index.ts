/**
 * Package entry point for `@beep/architecture-lab-client`.
 *
 * @packageDocumentation
 * @category clients
 * @since 0.0.0
 */

/**
 * Package version for the architecture lab client role.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/architecture-lab-client"
 *
 * console.log(VERSION)
 * ```
 *
 * @category clients
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;

/**
 * Direct WorkItem client namespace export.
 *
 * @category clients
 * @since 0.0.0
 */
export * as WorkItem from "./aggregates/WorkItem/index.js";
