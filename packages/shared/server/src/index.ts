/**
 * \@beep/shared-server
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Current package version.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/shared-server"
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
 * @category exports
 */
export * as Factories from "./factories.js";
