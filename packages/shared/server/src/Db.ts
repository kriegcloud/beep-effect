/**
 * Database client and service exports for PostgreSQL connectivity.
 *
 * @since 0.1.0
 */

/**
 * Namespace containing database client utilities and PostgreSQL integration.
 *
 * Provides low-level database types, connection management, and query execution utilities.
 *
 * @example
 * ```typescript
 * import { Db } from "@beep/shared-server"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   // Use Db namespace for low-level database operations
 *   const client = yield* Db.PgClient
 * })
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
import { Db } from "./internal/db";

export { Db };

/**
 * Re-exports SharedDb service and related database utilities.
 *
 * @example
 * ```typescript
 * import { SharedDb } from "@beep/shared-server"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const db = yield* SharedDb.SharedDb
 *   // Use database service
 * })
 * ```
 *
 * @category exports
 * @since 0.1.0
 */
export * from "./db/index";
