/**
 * DuckDB driver extras attached to the `effect/sql` client.
 *
 * **Details**
 *
 * Parquet export, checkpoints, extension loading and installation, and
 * `ATTACH`/`DETACH`. Each extra runs one tracked statement on the client's
 * connection: on the transaction connection when called inside
 * `withTransaction` (parquet export and checkpoint refuse there), otherwise on
 * a connection leased from the client. `ATTACH` and `LOAD` act on the database
 * instance, so their effects are visible to every client of the same database
 * and outlive the calling client's scope.
 *
 * @packageDocumentation
 * @internal
 * @since 0.0.0
 */

import { $DuckdbId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { quotedIdentifier, quotedString } from "@duckdb/node-api";
import * as A from "effect/Array";
import * as Effect from "effect/Effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import { SqlError, UnknownError } from "effect/sql/SqlError";
import { isDuckDbConnection } from "./connection.ts";
import type * as Scope from "effect/Scope";
import type * as SqlClient from "effect/sql/SqlClient";
import type * as SqlConnection from "effect/sql/SqlConnection";
import type {
  DuckDbAppendRows,
  DuckDbDatabaseExport,
  DuckDbDatabaseImport,
  DuckDbParquetExport,
} from "../DuckDb.models.ts";

const $I = $DuckdbId.create("internal/extras");

const DuckDbDriverOperation = LiteralKit([
  "copyTableToParquet",
  "exportDatabase",
  "importDatabase",
  "checkpoint",
  "loadExtension",
  "installExtension",
  "attach",
  "detach",
]).pipe(
  $I.annoteSchema("DuckDbDriverOperation", {
    description: "Driver extra operation names.",
  })
);

type DuckDbDriverOperation = typeof DuckDbDriverOperation.Type;

const PARQUET_IN_TRANSACTION =
  "DuckDB Parquet export cannot run inside an active transaction because filesystem writes are not rolled back with database changes.";

const CHECKPOINT_IN_TRANSACTION = "DuckDB checkpoint is a database-level operation; run it outside withTransaction.";

const runOn = (
  connection: SqlConnection.Connection,
  sql: string,
  operation: DuckDbDriverOperation
): Effect.Effect<void, SqlError> =>
  isDuckDbConnection(connection)
    ? connection.runDriverStatement(sql, operation)
    : Effect.die(`DuckDbClient.${operation}: the connection is not a DuckDB connection`);

/**
 * Build the driver extras for one client.
 *
 * **Details**
 *
 * `client` supplies the transaction service used to detect an open
 * `withTransaction`; `acquirer` leases the client's connection outside a
 * transaction.
 *
 * **Example** (Build extras for a client)
 *
 * ```ts
 * import type * as Effect from "effect/Effect"
 * import type * as Scope from "effect/Scope"
 * import type * as SqlClient from "effect/sql/SqlClient"
 * import type * as SqlConnection from "effect/sql/SqlConnection"
 * import type { SqlError } from "effect/sql/SqlError"
 * import { makeExtras } from "./extras.ts"
 *
 * declare const client: SqlClient.SqlClient
 * declare const acquirer: Effect.Effect<SqlConnection.Connection, SqlError, Scope.Scope>
 *
 * const extras = makeExtras({ client, acquirer })
 * const checkpoint = extras.checkpoint()
 * ```
 *
 * @internal
 * @category constructors
 * @since 0.0.0
 */
export const makeExtras = (options: {
  readonly client: SqlClient.SqlClient;
  readonly acquirer: Effect.Effect<SqlConnection.Connection, SqlError, Scope.Scope>;
}) => {
  const useConnection = (
    operation: DuckDbDriverOperation,
    refusal: O.Option<string>,
    sql: string
  ): Effect.Effect<void, SqlError> =>
    Effect.flatMap(
      Effect.serviceOption(options.client.transactionService),
      O.match({
        onNone: () =>
          Effect.scoped(Effect.flatMap(options.acquirer, (connection) => runOn(connection, sql, operation))),
        onSome: ([connection]) =>
          O.isSome(refusal)
            ? Effect.fail(
                SqlError.make({
                  reason: UnknownError.make({ cause: "active transaction", message: refusal.value, operation }),
                })
              )
            : runOn(connection, sql, operation),
      })
    );

  const copyTableToParquet = Effect.fn("DuckDbClient.copyTableToParquet")(
    (request: DuckDbParquetExport): Effect.Effect<void, SqlError> =>
      useConnection(
        DuckDbDriverOperation.Enum.copyTableToParquet,
        O.some(PARQUET_IN_TRANSACTION),
        `COPY ${quotedIdentifier(request.tableName)} TO ${quotedString(request.filePath)} (FORMAT parquet)`
      )
  );

  const appendRows = Effect.fn("DuckDbClient.appendRows")(
    (request: typeof DuckDbAppendRows.Encoded): Effect.Effect<void, SqlError> => {
      const appendOn = (connection: SqlConnection.Connection) =>
        isDuckDbConnection(connection)
          ? connection.appendRows(request)
          : Effect.die("DuckDbClient.appendRows: the connection is not a DuckDB connection");
      return Effect.flatMap(
        Effect.serviceOption(options.client.transactionService),
        O.match({
          onNone: () => Effect.scoped(Effect.flatMap(options.acquirer, appendOn)),
          onSome: ([connection]) => appendOn(connection),
        })
      );
    }
  );

  const exportDatabase = Effect.fn("DuckDbClient.exportDatabase")(
    (request: typeof DuckDbDatabaseExport.Encoded): Effect.Effect<void, SqlError> =>
      useConnection(
        DuckDbDriverOperation.Enum.exportDatabase,
        O.some("DuckDB database export cannot run inside withTransaction: filesystem writes survive rollback."),
        `EXPORT DATABASE ${quotedString(request.directory)} (FORMAT ${request.format === "parquet" ? "parquet" : "csv"})`
      )
  );
  const importDatabase = Effect.fn("DuckDbClient.importDatabase")(
    (request: typeof DuckDbDatabaseImport.Encoded): Effect.Effect<void, SqlError> =>
      useConnection(
        DuckDbDriverOperation.Enum.importDatabase,
        O.none(),
        `IMPORT DATABASE ${quotedString(request.directory)}`
      )
  );

  const checkpoint = Effect.fn("DuckDbClient.checkpoint")(
    (checkpointOptions?: { readonly force?: boolean | undefined } | undefined): Effect.Effect<void, SqlError> =>
      useConnection(
        DuckDbDriverOperation.Enum.checkpoint,
        O.some(CHECKPOINT_IN_TRANSACTION),
        checkpointOptions?.force === true ? "FORCE CHECKPOINT" : "CHECKPOINT"
      )
  );

  const loadExtension = Effect.fn("DuckDbClient.loadExtension")(
    (name: string): Effect.Effect<void, SqlError> =>
      useConnection(DuckDbDriverOperation.Enum.loadExtension, O.none(), `LOAD ${quotedString(name)}`)
  );

  const installExtension = Effect.fn("DuckDbClient.installExtension")(
    (name: string): Effect.Effect<void, SqlError> =>
      useConnection(DuckDbDriverOperation.Enum.installExtension, O.none(), `INSTALL ${quotedString(name)}`)
  );

  const attach = Effect.fn("DuckDbClient.attach")(
    (
      path: string,
      alias: string,
      attachOptions?: { readonly readOnly?: boolean | undefined } | undefined
    ): Effect.Effect<void, SqlError> =>
      useConnection(
        DuckDbDriverOperation.Enum.attach,
        O.none(),
        `ATTACH ${quotedString(path)} AS ${quotedIdentifier(alias)}${attachOptions?.readOnly === true ? " (READ_ONLY)" : ""}`
      )
  );

  const detach = Effect.fn("DuckDbClient.detach")(
    (alias: string): Effect.Effect<void, SqlError> =>
      useConnection(DuckDbDriverOperation.Enum.detach, O.none(), `DETACH ${quotedIdentifier(alias)}`)
  );

  return {
    exportDatabase,
    importDatabase,
    appendRows,
    copyTableToParquet,
    checkpoint,
    loadExtension,
    installExtension,
    attach,
    detach,
  };
};

/**
 * Set every own property of `extras` on `target` and return `target`.
 *
 * **Details**
 *
 * The `Object.assign(client, extras)` of upstream Effect SQL drivers, written
 * with `Reflect.ownKeys`/`Reflect.set` (string and symbol keys). The extras
 * become own enumerable properties of the callable client, so
 * `withoutTransforms()` keeps them.
 *
 * **Example** (Attach a property to a function)
 *
 * ```ts
 * import { attachExtras } from "./extras.ts"
 *
 * const target = attachExtras(() => 1, { label: "one" })
 * console.log(target.label, target()) // "one" 1
 * ```
 *
 * @internal
 * @category utilities
 * @since 0.0.0
 */
export const attachExtras: {
  <X extends object>(extras: X): <T extends object>(target: T) => T & X;
  <T extends object, X extends object>(target: T, extras: X): T & X;
} = dual(2, <T extends object, X extends object>(target: T, extras: X): T & X => {
  A.forEach(Reflect.ownKeys(extras), (key) => {
    Reflect.set(target, key, Reflect.get(extras, key));
  });
  return target as T & X;
});
