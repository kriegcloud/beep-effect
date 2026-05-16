/**
 * Product-neutral DuckDB execution service.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { make } from "@beep/identity";
import { A } from "@beep/utils";
import {
  type DuckDBConnection,
  DuckDBInstance,
  type DuckDBValue,
  quotedIdentifier,
  quotedString,
} from "@duckdb/node-api";
import { Context, Effect, Exit, Layer, Scope } from "effect";
import * as O from "effect/Option";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { DuckDbError } from "./DuckDb.errors.ts";
import { type DuckDbConnectionOptions, type DuckDbParquetExport, DuckDbRows } from "./DuckDb.models.ts";

const { $DuckdbId } = make("duckdb");
const $I = $DuckdbId.create("DuckDb.service");
const decodeRows = S.decodeUnknownEffect(DuckDbRows);

/**
 * Parameter values accepted by the DuckDB Node API.
 *
 * @example
 * ```ts
 * import type { DuckDbQueryParameters } from "@beep/duckdb"
 *
 * const params: DuckDbQueryParameters = { id: "run-1" }
 * void params
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export type DuckDbQueryParameters = Array<DuckDBValue> | Record<string, DuckDBValue>;

/**
 * Narrow adapter accepted by {@link DuckDb.makeLayer}.
 *
 * @example
 * ```ts
 * import type { DuckDbClient } from "@beep/duckdb"
 * import { Effect } from "effect"
 *
 * const client: DuckDbClient = {
 *   copyTableToParquet: () => Effect.void,
 *   query: () => Effect.succeed([]),
 *   run: () => Effect.void,
 *   runMany: () => Effect.void,
 *   withTransaction: (use) => use(client)
 * }
 *
 * void client
 * ```
 *
 * @category models
 * @since 0.0.0
 */
export interface DuckDbClient {
  readonly copyTableToParquet: (request: DuckDbParquetExport) => Effect.Effect<void, DuckDbError>;
  readonly query: (
    statement: string,
    parameters?: DuckDbQueryParameters | undefined
  ) => Effect.Effect<DuckDbRows, DuckDbError>;
  readonly run: (statement: string, parameters?: DuckDbQueryParameters | undefined) => Effect.Effect<void, DuckDbError>;
  readonly runMany: (statements: ReadonlyArray<string>) => Effect.Effect<void, DuckDbError>;
  readonly withTransaction: <A, R>(
    use: (transaction: DuckDbClient) => Effect.Effect<A, DuckDbError, R>
  ) => Effect.Effect<A, DuckDbError, R>;
}

/**
 * Runtime shape exposed by the {@link DuckDb} service.
 *
 * @example
 * ```ts
 * import type { DuckDbShape } from "@beep/duckdb"
 * import { Effect } from "effect"
 *
 * const service: DuckDbShape = {
 *   copyTableToParquet: () => Effect.void,
 *   query: () => Effect.succeed([]),
 *   run: () => Effect.void,
 *   runMany: () => Effect.void,
 *   withTransaction: (use) => use(service)
 * }
 *
 * void service
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export interface DuckDbShape extends DuckDbClient {}

interface NativeConnection {
  readonly connection: DuckDBConnection;
  readonly instance: DuckDBInstance;
}

type NativeUse<A, R = never> = (connection: DuckDBConnection) => Effect.Effect<A, DuckDbError, R>;

const connectionFailure =
  (operation: string, options: DuckDbConnectionOptions, statement?: string | undefined, message?: string | undefined) =>
  (cause: unknown): DuckDbError =>
    DuckDbError.fromUnknown(operation, cause, {
      databasePath: options.databasePath,
      ...R.getSomes({
        message: O.fromUndefinedOr(message),
      }),
      ...R.getSomes({ statement: O.fromUndefinedOr(statement) }),
    });

const releaseConnection = Effect.fn("DuckDb.releaseConnection")(
  ({ connection, instance }: NativeConnection): Effect.Effect<void> =>
    Effect.try({
      try: () => {
        connection.closeSync();
        instance.closeSync();
      },
      catch: () => undefined,
    }).pipe(
      Effect.asVoid,
      Effect.catch(() => Effect.void)
    )
);

const runOnConnection = Effect.fn("DuckDb.runOnConnection")(
  (
    operation: string,
    options: DuckDbConnectionOptions,
    connection: DuckDBConnection,
    statement: string,
    parameters?: DuckDbQueryParameters | undefined
  ): Effect.Effect<void, DuckDbError> =>
    Effect.tryPromise({
      try: () => connection.run(statement, parameters),
      catch: connectionFailure(operation, options, statement),
    }).pipe(Effect.asVoid)
);

const queryOnConnection = Effect.fn("DuckDb.queryOnConnection")(function* (
  options: DuckDbConnectionOptions,
  connection: DuckDBConnection,
  statement: string,
  parameters?: DuckDbQueryParameters | undefined
) {
  const rows = yield* Effect.tryPromise({
    try: async () => {
      const reader = await connection.runAndReadAll(statement, parameters);
      return reader.getRowObjectsJson();
    },
    catch: connectionFailure("query", options, statement),
  });
  return yield* decodeRows(rows).pipe(
    Effect.mapError((cause) =>
      DuckDbError.fromUnknown("query", cause, {
        databasePath: options.databasePath,
        message: "DuckDB query returned a non-JSON-compatible row shape.",
        statement,
      })
    )
  );
});

const acquireSharedConnection = (options: DuckDbConnectionOptions) => {
  let nativePromise: Promise<NativeConnection> | undefined;

  return Effect.fn("DuckDb.acquireSharedConnection")(
    (operation: string): Effect.Effect<NativeConnection, DuckDbError> =>
      Effect.tryPromise({
        try: () => {
          nativePromise ??= DuckDBInstance.create(options.databasePath, options.databaseOptions)
            .then(async (instance) => ({
              connection: await instance.connect(),
              instance,
            }))
            .catch((cause) => {
              nativePromise = undefined;
              throw cause;
            });
          return nativePromise;
        },
        catch: connectionFailure(operation, options, undefined, "Failed to open DuckDB connection."),
      })
  );
};

const acquireScopedSharedConnection = (options: DuckDbConnectionOptions, scope: Scope.Scope) => {
  const getConnection = acquireSharedConnection(options);
  let finalizerRegistered = false;

  return Effect.fn("DuckDb.acquireScopedSharedConnection")(function* (operation: string) {
    const native = yield* getConnection(operation);
    if (!finalizerRegistered) {
      finalizerRegistered = true;
      yield* Scope.addFinalizer(scope, releaseConnection(native));
    }
    return native;
  });
};

const copyStatement = (request: DuckDbParquetExport): string =>
  `COPY ${quotedIdentifier(request.tableName)} TO ${quotedString(request.filePath)} (FORMAT parquet)`;

const makeConnectionClient = (
  options: DuckDbConnectionOptions,
  useConnection: <A, R>(operation: string, use: NativeUse<A, R>) => Effect.Effect<A, DuckDbError, R>,
  transactionScoped = false
): DuckDbClient => {
  const run = Effect.fn("DuckDb.run")(
    (statement: string, parameters?: DuckDbQueryParameters | undefined): Effect.Effect<void, DuckDbError> =>
      useConnection("run", (connection) => runOnConnection("run", options, connection, statement, parameters)).pipe(
        Effect.withSpan("db.query", {
          attributes: {
            "db.operation": "run",
            "db.system": "duckdb",
          },
        })
      )
  );

  const query = Effect.fn("DuckDb.query")(
    (statement: string, parameters?: DuckDbQueryParameters | undefined): Effect.Effect<DuckDbRows, DuckDbError> =>
      useConnection("query", (connection) => queryOnConnection(options, connection, statement, parameters)).pipe(
        Effect.withSpan("db.query", {
          attributes: {
            "db.operation": "query",
            "db.system": "duckdb",
          },
        })
      )
  );

  const runMany = Effect.fn("DuckDb.runMany")(
    (statements: ReadonlyArray<string>): Effect.Effect<void, DuckDbError> =>
      Effect.forEach(statements, (statement) => run(statement), { discard: true }).pipe(
        Effect.withSpan("db.query", {
          attributes: {
            "db.operation": "run_many",
            "db.statement_count": A.length(statements),
            "db.system": "duckdb",
          },
        })
      )
  );

  const copyTableToParquet = Effect.fn("DuckDb.copyTableToParquet")(
    (request: DuckDbParquetExport): Effect.Effect<void, DuckDbError> =>
      run(copyStatement(request)).pipe(
        Effect.withSpan("db.export", {
          attributes: {
            "db.operation": "copy_table_to_parquet",
            "db.system": "duckdb",
            "db.table": request.tableName,
          },
        })
      )
  );
  let client: DuckDbClient;
  const withTransaction = Effect.fn("DuckDb.withTransaction")(function* <A, R>(
    use: (transaction: DuckDbClient) => Effect.Effect<A, DuckDbError, R>
  ): Effect.fn.Return<A, DuckDbError, R> {
    return yield* transactionScoped
      ? use(client)
      : useConnection(
          "withTransaction",
          Effect.fn("DuckDb.withTransactionOnConnection")(function* (connection: DuckDBConnection) {
            const transaction = makeConnectionClient(
              options,
              Effect.fn("DuckDb.useTransactionConnection")(function* <A, R>(
                _operation: string,
                useNative: NativeUse<A, R>
              ): Effect.fn.Return<A, DuckDbError, R> {
                return yield* useNative(connection);
              }),
              true
            );
            yield* runOnConnection("withTransaction", options, connection, "BEGIN TRANSACTION");
            const exit = yield* Effect.exit(use(transaction));
            if (Exit.isSuccess(exit)) {
              return yield* runOnConnection("withTransaction", options, connection, "COMMIT").pipe(
                Effect.as(exit.value)
              );
            }

            yield* runOnConnection("withTransaction", options, connection, "ROLLBACK").pipe(
              Effect.catch(() => Effect.void)
            );
            return yield* Effect.failCause(exit.cause);
          })
        ).pipe(
          Effect.withSpan("db.transaction", {
            attributes: {
              "db.system": "duckdb",
            },
          })
        );
  });

  client = {
    copyTableToParquet,
    query,
    run,
    runMany,
    withTransaction,
  };
  return client;
};

const makeNodeClient = (options: DuckDbConnectionOptions): DuckDbClient => {
  const getConnection = acquireSharedConnection(options);
  const useNodeConnection = Effect.fn("DuckDb.useNodeConnection")(function* <A, R>(
    operation: string,
    use: NativeUse<A, R>
  ): Effect.fn.Return<A, DuckDbError, R> {
    const { connection } = yield* getConnection(operation);
    return yield* use(connection);
  });
  return makeConnectionClient(options, useNodeConnection);
};

const makeNodeLayer = (options: DuckDbConnectionOptions): Layer.Layer<DuckDb> =>
  Layer.effectContext(
    Effect.gen(function* () {
      const scope = yield* Scope.Scope;
      const getConnection = acquireScopedSharedConnection(options, scope);
      const useLayerConnection = Effect.fn("DuckDb.useLayerConnection")(function* <A, R>(
        operation: string,
        useNative: NativeUse<A, R>
      ): Effect.fn.Return<A, DuckDbError, R> {
        const { connection } = yield* getConnection(operation);
        return yield* useNative(connection);
      });
      return Context.make(DuckDb, DuckDb.of(makeConnectionClient(options, useLayerConnection)));
    })
  );

/**
 * Effect service for product-neutral DuckDB execution.
 *
 * @example
 * ```ts
 * import { DuckDb } from "@beep/duckdb"
 *
 * const service = DuckDb
 * void service
 * ```
 *
 * @category services
 * @since 0.0.0
 */
export class DuckDb extends Context.Service<DuckDb, DuckDbShape>()($I`DuckDb`) {
  /**
   * Build a Layer from a narrow product-neutral DuckDB adapter.
   *
   * @example
   * ```ts
   * import { DuckDb, type DuckDbClient } from "@beep/duckdb"
   * import { Effect } from "effect"
   *
   * const client: DuckDbClient = {
   *   copyTableToParquet: () => Effect.void,
   *   query: () => Effect.succeed([]),
   *   run: () => Effect.void,
   *   runMany: () => Effect.void,
   *   withTransaction: (use) => use(client)
   * }
   *
   * const layer = DuckDb.makeLayer(client)
   * void layer
   * ```
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly makeLayer = (client: DuckDbClient): Layer.Layer<DuckDb> => Layer.succeed(DuckDb, DuckDb.of(client));

  /**
   * Build a native DuckDB Node API client.
   *
   * @example
   * ```ts
   * import { DuckDb, DuckDbConnectionOptions } from "@beep/duckdb"
   *
   * const client = DuckDb.makeNodeClient(new DuckDbConnectionOptions({
   *   databasePath: "metrics.duckdb"
   * }))
   *
   * void client
   * ```
   *
   * @category constructors
   * @since 0.0.0
   */
  static readonly makeNodeClient = makeNodeClient;

  /**
   * Build the native DuckDB Node API service layer.
   *
   * @example
   * ```ts
   * import { DuckDb, DuckDbConnectionOptions } from "@beep/duckdb"
   *
   * const layer = DuckDb.makeNodeLayer(new DuckDbConnectionOptions({
   *   databasePath: "metrics.duckdb"
   * }))
   *
   * void layer
   * ```
   *
   * @category layers
   * @since 0.0.0
   */
  static readonly makeNodeLayer = makeNodeLayer;
}
