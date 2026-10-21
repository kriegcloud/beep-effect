/**
 * In-memory DuckDB client layer for tests.
 *
 * **Details**
 *
 * Every build of the layer opens a fresh private `:memory:` database, so a test
 * that builds it in its own scope gets an isolated database.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { layer } from "./DuckDbClient.service.ts";
import type * as Layer from "effect/Layer";
import type * as SqlClient from "effect/sql/SqlClient";
import type { SqlError } from "effect/sql/SqlError";
import type { DuckDbClient } from "./DuckDbClient.service.ts";

/**
 * In-memory DuckDB layer providing `DuckDbClient` and the generic `SqlClient`.
 *
 * **Example** (Query an isolated in-memory database)
 *
 * ```ts
 * import { DuckDbTestLayer } from "@beep/duckdb"
 * import * as Effect from "effect/Effect"
 * import * as SqlClient from "effect/sql/SqlClient"
 *
 * const program = Effect.gen(function* () {
 *   const sql = yield* SqlClient.SqlClient
 *   return yield* sql`select 1 as n`
 * }).pipe(Effect.provide(DuckDbTestLayer))
 *
 * Effect.runPromise(program)
 * ```
 *
 * @category testing
 * @since 0.0.0
 */
export const DuckDbTestLayer: Layer.Layer<DuckDbClient | SqlClient.SqlClient, SqlError> = layer({
  databasePath: ":memory:",
});
