/**
 * Product-neutral DuckDB execution service.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { make } from "@beep/identity";
import {
  type DuckDBConnection,
  DuckDBInstance,
  type DuckDBValue,
  quotedIdentifier,
  quotedString,
} from "@duckdb/node-api";
import { Context, Effect, Layer } from "effect";
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

type NativeUse<A> = (connection: DuckDBConnection) => Effect.Effect<A, DuckDbError>;

const connectionFailure =
  (operation: string, options: DuckDbConnectionOptions, statement?: string | undefined, message?: string | undefined) =>
  (cause: unknown): DuckDbError =>
    DuckDbError.fromUnknown(operation, cause, {
      databasePath: options.databasePath,
      ...R.getSomes({ message: O.fromUndefinedOr(message) }),
      ...R.getSomes({ statement: O.fromUndefinedOr(statement) }),
    });

const acquireConnection = (
  options: DuckDbConnectionOptions,
  operation: string
): Effect.Effect<NativeConnection, DuckDbError> =>
  Effect.tryPromise({
    try: async () => {
      const instance = await DuckDBInstance.create(options.databasePath, options.databaseOptions);
      const connection = await instance.connect();
      return { connection, instance };
    },
    catch: connectionFailure(operation, options, undefined, "Failed to open DuckDB connection."),
  });

const releaseConnection = ({ connection, instance }: NativeConnection): Effect.Effect<void> =>
  Effect.try({
    try: () => {
      connection.closeSync();
      instance.closeSync();
    },
    catch: () => undefined,
  }).pipe(
    Effect.asVoid,
    Effect.catch(() => Effect.void)
  );

const runOnConnection = (
  operation: string,
  options: DuckDbConnectionOptions,
  connection: DuckDBConnection,
  statement: string,
  parameters?: DuckDbQueryParameters | undefined
): Effect.Effect<void, DuckDbError> =>
  Effect.tryPromise({
    try: () => connection.run(statement, parameters),
    catch: connectionFailure(operation, options, statement),
  }).pipe(Effect.asVoid);

const queryOnConnection = (
  options: DuckDbConnectionOptions,
  connection: DuckDBConnection,
  statement: string,
  parameters?: DuckDbQueryParameters | undefined
): Effect.Effect<DuckDbRows, DuckDbError> =>
  Effect.gen(function* () {
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

const withConnection = <A>(
  options: DuckDbConnectionOptions,
  operation: string,
  use: NativeUse<A>
): Effect.Effect<A, DuckDbError> =>
  Effect.acquireUseRelease(
    acquireConnection(options, operation),
    ({ connection }) => use(connection),
    releaseConnection
  );

const copyStatement = (request: DuckDbParquetExport): string =>
  `COPY ${quotedIdentifier(request.tableName)} TO ${quotedString(request.filePath)} (FORMAT parquet)`;

const makeConnectionClient = (
  options: DuckDbConnectionOptions,
  useConnection: <A>(operation: string, use: NativeUse<A>) => Effect.Effect<A, DuckDbError>
): DuckDbClient => {
  const run = (statement: string, parameters?: DuckDbQueryParameters | undefined): Effect.Effect<void, DuckDbError> =>
    useConnection("run", (connection) => runOnConnection("run", options, connection, statement, parameters));

  const query = (
    statement: string,
    parameters?: DuckDbQueryParameters | undefined
  ): Effect.Effect<DuckDbRows, DuckDbError> =>
    useConnection("query", (connection) => queryOnConnection(options, connection, statement, parameters));

  const runMany = (statements: ReadonlyArray<string>): Effect.Effect<void, DuckDbError> =>
    Effect.forEach(statements, (statement) => run(statement), { discard: true });

  const copyTableToParquet = (request: DuckDbParquetExport): Effect.Effect<void, DuckDbError> =>
    run(copyStatement(request));

  const withTransaction = <A, R>(
    use: (transaction: DuckDbClient) => Effect.Effect<A, DuckDbError, R>
  ): Effect.Effect<A, DuckDbError, R> =>
    Effect.acquireUseRelease(
      acquireConnection(options, "withTransaction"),
      ({ connection }) =>
        Effect.gen(function* () {
          const transaction = makeConnectionClient(options, (_operation, useNative) => useNative(connection));
          yield* runOnConnection("withTransaction", options, connection, "BEGIN TRANSACTION");
          const value = yield* use(transaction);
          yield* runOnConnection("withTransaction", options, connection, "COMMIT");
          return value;
        }),
      releaseConnection
    );

  return {
    copyTableToParquet,
    query,
    run,
    runMany,
    withTransaction,
  };
};

const makeNodeClient = (options: DuckDbConnectionOptions): DuckDbClient =>
  makeConnectionClient(options, (operation, use) => withConnection(options, operation, use));

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
  static readonly makeNodeLayer = (options: DuckDbConnectionOptions): Layer.Layer<DuckDb> =>
    Layer.succeed(DuckDb, DuckDb.of(DuckDb.makeNodeClient(options)));
}
