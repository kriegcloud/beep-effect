/**
 * `@beep/postgres` driver-level Postgres runtime and diagnostics.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Public Postgres client service exports.
 *
 * @since 0.0.0
 * @category exports
 */
export * from "./Postgres.client.ts";

/**
 * Public Postgres Drizzle composition exports.
 *
 * @since 0.0.0
 * @category exports
 */
export * from "./Postgres.drizzle.ts";

/**
 * Public Postgres error exports.
 *
 * @since 0.0.0
 * @category exports
 */
export * from "./Postgres.errors.ts";

/**
 * Public Postgres formatting exports.
 *
 * @since 0.0.0
 * @category exports
 */
export * from "./Postgres.format.ts";

/**
 * Public PostgreSQL SQLSTATE exports.
 *
 * @since 0.0.0
 * @category exports
 */
export * from "./Postgres.sqlstate.ts";

/**
 * Package version.
 *
 * @example
 * ```ts
 * import { VERSION } from "@beep/postgres"
 *
 * void VERSION
 * ```
 *
 * @since 0.0.0
 * @category configuration
 */
export const VERSION = "0.0.0" as const;
