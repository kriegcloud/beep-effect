/**
 * Stack Installer app exports.
 *
 * @packageDocumentation
 * @category components
 * @since 0.0.0
 */

/**
 * App version marker.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/stack-installer"
 *
 * console.log(VERSION)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;

/**
 * App-local live proof harness exports.
 *
 * @category workflows
 * @since 0.0.0
 */
export * from "./proof/P1ManualProof.js";
