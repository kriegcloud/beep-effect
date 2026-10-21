/**
 * DuckDB driver package: an `effect/sql` client, its Migrator, and the legacy
 * product-neutral `DuckDb` service.
 *
 * **Details**
 *
 * `DuckDbClient` implements the generic `effect/sql` `SqlClient` over
 * `@duckdb/node-api` and reports the `"sqlite"` dialect. `DuckDbMigrator`
 * re-exports the `effect/sql/Migrator` loaders and binds `run`/`layer`. The
 * flat exports keep the legacy `DuckDb` service (JSON rows, named `$param`
 * records), which never provides `SqlClient`.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

/**
 * Public DuckDB driver error models and normalization helpers.
 *
 * @since 0.0.0
 * @category errors
 */
export * from "./DuckDb.errors.ts";
/**
 * Public DuckDB driver request, row, and client configuration schemas.
 *
 * @since 0.0.0
 * @category models
 */
export * from "./DuckDb.models.ts";
/**
 * Legacy DuckDB service, adapter contract, and layers.
 *
 * @since 0.0.0
 * @category services
 */
export * from "./DuckDb.service.ts";
/**
 * In-memory DuckDB client layer for tests.
 *
 * @since 0.0.0
 * @category testing
 */
export * from "./DuckDb.test-layer.ts";
/**
 * The DuckDB `effect/sql` client module.
 *
 * **Example** (Query through the client layer)
 *
 * ```ts
 * import { DuckDbClient } from "@beep/duckdb"
 * import * as Effect from "effect/Effect"
 *
 * const program = Effect.gen(function* () {
 *   const sql = yield* DuckDbClient.DuckDbClient
 *   return yield* sql<{ readonly n: number }>`select 1 as n`
 * }).pipe(Effect.provide(DuckDbClient.layer({ databasePath: ":memory:" })))
 *
 * Effect.runPromise(program).then((rows) => console.log(rows)) // [{ n: 1 }]
 * ```
 *
 * @since 0.0.0
 * @category services
 */
export * as DuckDbClient from "./DuckDbClient.service.ts";
/**
 * The DuckDB Migrator module.
 *
 * **Example** (Run record migrations)
 *
 * ```ts
 * import { DuckDbClient, DuckDbMigrator } from "@beep/duckdb"
 * import * as Effect from "effect/Effect"
 * import * as SqlClient from "effect/sql/SqlClient"
 *
 * const program = DuckDbMigrator.run({
 *   loader: DuckDbMigrator.fromRecord({
 *     "1_create": Effect.flatMap(SqlClient.SqlClient, (sql) => sql`create table t (id integer primary key)`)
 *   })
 * }).pipe(Effect.provide(DuckDbClient.layer({ databasePath: ":memory:" })))
 *
 * Effect.runPromise(program).then((applied) => console.log(applied)) // [[1, "create"]]
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export * as DuckDbMigrator from "./DuckDbMigrator.service.ts";
