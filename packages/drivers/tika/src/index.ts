/**
 * Apache Tika file-processing driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Typed Tika driver errors.
 *
 * @category errors
 * @since 0.0.0
 */
export * from "./Tika.errors.ts";
/**
 * Tika-backed file-processing engine scaffold.
 *
 * @category services
 * @since 0.0.0
 */
export * from "./Tika.service.ts";

/**
 * Package version.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/tika"
 *
 * console.log(VERSION)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;
