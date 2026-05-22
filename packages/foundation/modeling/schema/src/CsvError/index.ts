/**
 * Namespace-first public module for CSV errors.
 *
 * @example
 * ```ts
 * import * as CsvError from "@beep/schema/CsvError"
 *
 * const error = CsvError.make("Failed to parse CSV")
 * console.log(error.message)
 * ```
 *
 * @packageDocumentation
 * @since 0.0.0
 */
export * from "./CsvError.errors.ts";
