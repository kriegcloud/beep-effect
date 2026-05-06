/**
 * @packageDocumentation
 * \@beep/test-utils
 * @category testing
 * @since 0.0.0
 */

/**
 * SQL test utility exports.
 *
 * @category testing
 * @since 0.0.0
 */
export * from "./SqlTest.js";

/**
 * Package version marker for test utilities.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/test-utils"
 * const version = VERSION
 * void version
 * ```
 * @category configuration
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;
