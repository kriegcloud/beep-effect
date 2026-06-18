/**
 * `@beep/pglite` driver-level in-process PGlite (embedded PostgreSQL) runtime.
 *
 * Wraps `@effect/sql-pglite` and aliases its client under the `@effect/sql-pg`
 * PgClient tag so Drizzle-backed repositories run unchanged against an
 * in-process database.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Package version.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/pglite"
 *
 * console.log(VERSION)
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const VERSION = "0.0.0" as const;

/**
 * Public PGlite driver error exports.
 *
 * @since 0.0.0
 * @category errors
 */
export * from "./Pglite.errors.ts";
/**
 * Public PGlite in-memory test layer exports.
 *
 * @since 0.0.0
 * @category layers
 */
export * from "./Pglite.test-layer.ts";
/**
 * Public PGlite client service and layer exports.
 *
 * @since 0.0.0
 * @category services
 */
export * from "./PgliteClient.service.ts";
