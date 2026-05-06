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
 * @category clients
 */
export * from "./Postgres.client.ts";

/**
 * Public Postgres Drizzle composition exports.
 *
 * @since 0.0.0
 * @category services
 */
export * from "./Postgres.drizzle.ts";

/**
 * Public Postgres error exports.
 *
 * @since 0.0.0
 * @category errors
 */
export * from "./Postgres.errors.ts";

/**
 * Public Postgres formatting exports.
 *
 * @since 0.0.0
 * @category formatting
 */
export * from "./Postgres.format.ts";

/**
 * Public PostgreSQL SQLSTATE exports.
 *
 * @since 0.0.0
 * @category models
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
