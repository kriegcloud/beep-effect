/**
 * DuckDB adapter for the shared Effect SQL migration runner.
 *
 * **Details**
 *
 * Re-exports the `effect/sql/Migrator` loaders and error types and binds
 * `run`/`layer` to the current `SqlClient`. With the `"sqlite"` dialect the
 * Migrator creates `effect_sql_migrations` through its fallback DDL, which
 * DuckDB accepts. At effect 4.0.5 a failing migration is a defect
 * (`MigrationError` via `Effect.die`), and the whole batch of that run (earlier
 * migrations of the same run included) is rolled back. `run`/`layer` read the
 * generic `SqlClient`: under `DuckDbClient.layerClient` provide it explicitly
 * (`Effect.provideServiceEffect(SqlClient.SqlClient, Effect.service(DuckDbClient.DuckDbClient))`).
 * Concurrent runs against one file are not lock-coordinated on DuckDB: the
 * history insert does not conflict at insert time. `dumpSchema` is not
 * implemented.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as Layer from "effect/Layer";
import * as Migrator from "effect/sql/Migrator";
import type * as Effect from "effect/Effect";
import type * as SqlClient from "effect/sql/SqlClient";
import type { SqlError } from "effect/sql/SqlError";

/**
 * The `effect/sql/Migrator` loaders (`fromRecord`, `fromGlob`, `fromBabelGlob`,
 * `fromFileSystem`), `make`, and `MigrationError`.
 *
 * **Example** (Build a record loader)
 *
 * ```ts
 * import { DuckDbMigrator } from "@beep/duckdb"
 * import * as Effect from "effect/Effect"
 * import * as SqlClient from "effect/sql/SqlClient"
 *
 * const loader = DuckDbMigrator.fromRecord({
 *   "1_create_events": Effect.flatMap(SqlClient.SqlClient, (sql) => sql`create table events (id integer)`)
 * })
 * console.log(loader)
 * ```
 *
 * @category constructors
 * @since 0.0.0
 */
export * from "effect/sql/Migrator";

/**
 * Run the pending migrations of a loader against the current `SqlClient`.
 *
 * **Details**
 *
 * Returns the `[id, name]` pairs applied by this run, in order.
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
 * @category constructors
 * @since 0.0.0
 */
export const run: <R2 = never>(
  options: Migrator.MigratorOptions<R2>
) => Effect.Effect<
  ReadonlyArray<readonly [id: number, name: string]>,
  Migrator.MigrationError | SqlError,
  SqlClient.SqlClient | R2
> = Migrator.make({});

/**
 * Layer that runs the pending migrations of a loader when it is built.
 *
 * **Example** (Migrate on layer build)
 *
 * ```ts
 * import { DuckDbClient, DuckDbMigrator } from "@beep/duckdb"
 * import * as Effect from "effect/Effect"
 * import * as Layer from "effect/Layer"
 * import * as SqlClient from "effect/sql/SqlClient"
 *
 * const MigrationsLive = DuckDbMigrator.layer({
 *   loader: DuckDbMigrator.fromRecord({
 *     "1_create": Effect.flatMap(SqlClient.SqlClient, (sql) => sql`create table t (id integer)`)
 *   })
 * }).pipe(Layer.provideMerge(DuckDbClient.layer({ databasePath: ":memory:" })))
 * console.log(MigrationsLive)
 * ```
 *
 * @category layers
 * @since 0.0.0
 */
export const layer = <R>(
  options: Migrator.MigratorOptions<R>
): Layer.Layer<never, Migrator.MigrationError | SqlError, SqlClient.SqlClient | R> => Layer.effectDiscard(run(options));
