/**
 * HubSpot API driver.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Runtime configuration models and constants.
 *
 * @category configuration
 * @since 0.0.0
 */
export * from "./HubSpot.config.ts";
/**
 * Typed HubSpot driver errors.
 *
 * @category errors
 * @since 0.0.0
 */
export * from "./HubSpot.errors.ts";
/**
 * HubSpot Forms API service.
 *
 * @category services
 * @since 0.0.0
 */
export * from "./HubSpot.service.ts";

/**
 * Package version.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/hubspot"
 *
 * console.log(VERSION) // "0.0.0"
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;
