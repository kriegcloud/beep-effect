/**
 * Package entry point for `@beep/canvas`.
 *
 * @packageDocumentation
 * @category components
 * @since 0.0.0
 */

/**
 * Package version for `@beep/canvas`.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/canvas"
 *
 * console.log(VERSION)
 * ```
 *
 * @category components
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;

/**
 * Canvas app component exports.
 *
 * @category components
 * @since 0.0.0
 */
export * from "./App.js";
/**
 * Canvas command bridge exports.
 *
 * @category commands
 * @since 0.0.0
 */
export * from "./commandBridge.js";
