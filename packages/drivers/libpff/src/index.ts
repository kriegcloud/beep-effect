/**
 * libpff file-processing driver boundary.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Typed libpff driver errors.
 *
 * @category errors
 * @since 0.0.0
 */
export * from "./Libpff.errors.ts";
/**
 * libpff-backed file-processing engine scaffold.
 *
 * @category services
 * @since 0.0.0
 */
export * from "./Libpff.service.ts";

/**
 * Package version.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/libpff"
 *
 * console.log(VERSION)
 * ```
 *
 * @category constants
 * @since 0.0.0
 */
export const VERSION = "0.0.0" as const;
