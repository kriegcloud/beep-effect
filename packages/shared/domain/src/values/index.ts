/**
 * The shared domain values module - Contains modules for shared value objects.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * LocalDate - Value object representing a local date.
 *
 * @example
 * ```ts
 * import { LocalDate } from "@beep/shared-domain/values"
 *
 * console.log(LocalDate.today().toISOString())
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export * as LocalDate from "./LocalDate/index.ts";
