/**
 * `effect/sql` connection over one native DuckDB connection.
 *
 * **Details**
 *
 * Every native call runs under the connection's {@link NativeGate} op lock and
 * is cancelled settle-aware. Statements on the prepared path go through a
 * per-connection `ScopedCache` of prepared statements whose bindings are
 * cleared before every bind; `USE` and `SET`/`RESET schema|search_path`
 * invalidate that cache. The connection tracks the DuckDB transaction phase,
 * emulates the `SAVEPOINT` pair `SqlClient.make` generates for nested
 * transactions, and exposes the safe `COMMIT` that refuses a transaction
 * DuckDB already aborted or that lost a nested rollback.
 *
 * @packageDocumentation
 * @internal
 * @since 0.0.0
 */

import { ResultReturnType } from "@duckdb/node-api";
import * as Context from "effect/Context";
import * as Data from "effect/Data";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as MutableRef from "effect/MutableRef";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as Scope from "effect/Scope";
import * as ScopedCache from "effect/ScopedCache";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";
import * as SqlClient from "effect/sql/SqlClient";
import { converterFor } from "./convert.ts";
import { NativeGate } from "./gate.ts";
import { ignoreNative } from "./native.ts";
import { bindTypes, normalizeParameters } from "./parameters.ts";
import {
  ABORT_PROBE_SQL,
  afterFailure,
  afterInterrupt,
  afterSuccess,
  CommitDecision,
  classifyControl,
  decideCommit,
  isAbortedTransactionError,
  refusedCommit,
  TransactionPhase,
} from "./transaction.ts";
import type {
  DuckDBConnection,
  DuckDBPreparedStatement,
  DuckDBResult,
  DuckDBValue,
  DuckDBValueConverter,
} from "@duckdb/node-api";
import type * as SqlConnection from "effect/sql/SqlConnection";
import type { SqlError } from "effect/sql/SqlError";

const ConnectionTypeId = "~@beep/duckdb/internal/connection";

const RUN_DIRECT_PATTERN =
  /^Invalid Input Error: (?:Cannot prepare multiple statements at once|No statement to prepare)/;

const CONTROL_OPERATIONS: Readonly<Record<string, string>> = {
  begin: "beginTransaction",
  commit: "commitTransaction",
  rollback: "rollbackTransaction",
};

type Row = Record<string, unknown>;

type RowsTransform = (<A extends object>(rows: ReadonlyArray<A>) => ReadonlyArray<A>) | undefined;

type Reader<A> = (result: DuckDBResult, converter: DuckDBValueConverter<unknown>) => Promise<A>;

type CachedStatement = Data.TaggedEnum<{
  Prepared: { readonly statement: DuckDBPreparedStatement };
  RunDirect: {};
}>;

const CachedStatement = Data.taggedEnum<CachedStatement>();

type DuckDbConnection = SqlConnection.Connection & {
  readonly [ConnectionTypeId]: typeof ConnectionTypeId;
  readonly native: DuckDBConnection;
  readonly gate: NativeGate;
  readonly isTransaction: () => boolean;
  readonly commit: Effect.Effect<void, SqlError>;
  readonly runDriverStatement: (sql: string, operation: string) => Effect.Effect<void, SqlError>;
};

type ConnectionOptions = {
  readonly native: DuckDBConnection;
  readonly prepareCacheSize: number;
  readonly prepareCacheTTL: Duration.Input;
};

const isQueryResult = (result: DuckDBResult): boolean => result.returnType === ResultReturnType.QUERY_RESULT;

const readRows: Reader<ReadonlyArray<Row>> = (result, converter) =>
  isQueryResult(result) ? result.convertRowObjects(converter) : Promise.resolve([]);

const readValues: Reader<ReadonlyArray<ReadonlyArray<unknown>>> = (result, converter) =>
  isQueryResult(result) ? result.convertRows(converter) : Promise.resolve([]);

const readRaw: Reader<{ readonly changes: number; readonly rows: ReadonlyArray<Row> }> = (result, converter) =>
  readRows(result, converter).then((rows) => ({ changes: result.rowsChanged, rows }));

const EMPTY_RAW = { changes: 0, rows: [] };

const isRunDirectError = (error: SqlError): boolean =>
  P.hasProperty(error.reason.cause, "message") &&
  P.isString(error.reason.cause.message) &&
  RUN_DIRECT_PATTERN.test(error.reason.cause.message);

const isBlank = (sql: string): boolean => Str.isEmpty(Str.trim(sql));

const nativeBinds = (binds: Array<DuckDBValue>): Array<DuckDBValue> | undefined =>
  binds.length > 0 ? binds : undefined;

const applyTransform = <A extends object>(rows: ReadonlyArray<A>, transformRows: RowsTransform): ReadonlyArray<A> =>
  transformRows === undefined ? rows : transformRows(rows);

const currentConverter: Effect.Effect<DuckDBValueConverter<unknown>> = Effect.withFiber((fiber) =>
  Effect.succeed(fiber.context.pipe(Context.get(SqlClient.SafeIntegers), converterFor))
);

/**
 * Returns `true` when a `SqlConnection.Connection` is a DuckDB connection made
 * by {@link makeConnection}.
 *
 * **Example** (Narrow a generic connection)
 *
 * ```ts
 * import { isDuckDbConnection } from "./connection.ts"
 *
 * console.log(isDuckDbConnection({})) // false
 * ```
 *
 * @internal
 * @category utilities
 * @since 0.0.0
 */
export const isDuckDbConnection = (u: unknown): u is DuckDbConnection => P.hasProperty(u, ConnectionTypeId);

/**
 * Build the `effect/sql` connection over one native DuckDB connection.
 *
 * **Details**
 *
 * The prepared-statement cache lives in its own scope, which the connection
 * scope closes under the op lock, so every cached statement is destroyed while
 * no other native operation runs on the connection. A `prepareCacheSize` of 0
 * or less disables the cache; every statement then runs through
 * `connection.run`. Statements without bind values always run through
 * `connection.run` as well: DuckDB plans a parameterless prepared statement
 * once against the table statistics of that moment, so a cached copy can keep
 * returning stale results after later writes. The native connection itself is
 * never closed here.
 *
 * **Example** (Wrap a native connection)
 *
 * ```ts
 * import * as Effect from "effect/Effect"
 * import { acquireConnection, acquireInstance } from "./native.ts"
 * import { makeConnection } from "./connection.ts"
 *
 * const program = Effect.scoped(
 *   Effect.gen(function* () {
 *     const native = yield* Effect.flatMap(acquireInstance({ databasePath: ":memory:" }), acquireConnection)
 *     const connection = yield* makeConnection({ native, prepareCacheSize: 200, prepareCacheTTL: "10 minutes" })
 *     return yield* connection.execute("select 1 as n", [], undefined)
 *   })
 * )
 * ```
 *
 * @internal
 * @category constructors
 * @since 0.0.0
 */
export const makeConnection = Effect.fnUntraced(function* (options: ConnectionOptions) {
  const { native } = options;
  const gate = new NativeGate(native);
  const state = MutableRef.make<TransactionPhase>(TransactionPhase.Idle());
  const isTransaction = (): boolean => state.pipe(MutableRef.get, TransactionPhase.$is("Active"));

  const lookup = (sql: string): Effect.Effect<CachedStatement, SqlError, Scope.Scope> =>
    Effect.uninterruptibleMask((restore) =>
      restore(
        gate.runUnlocked(
          "prepare",
          () => native.prepare(sql),
          (late) => late.destroySync()
        )
      ).pipe(
        Effect.tap((statement) =>
          Effect.addFinalizer(() => Effect.sync(() => ignoreNative(() => statement.destroySync())))
        ),
        Effect.map((statement) => CachedStatement.Prepared({ statement }))
      )
    ).pipe(Effect.catchIf(isRunDirectError, () => Effect.succeed(CachedStatement.RunDirect())));

  const connectionScope = yield* Effect.scope;
  const cacheScope = yield* Scope.make();
  const prepareCacheTTL = options.prepareCacheTTL;
  const cache =
    options.prepareCacheSize > 0
      ? O.some(
          yield* ScopedCache.makeWith({
            lookup,
            capacity: options.prepareCacheSize,
            timeToLive: (exit) => (Exit.isSuccess(exit) ? prepareCacheTTL : Duration.zero),
          }).pipe(Scope.provide(cacheScope))
        )
      : O.none();
  // Once closed, `ScopedCache.get` interrupts its caller; a statement that
  // outlives the client scope takes the direct path instead, like a statement
  // without binds, and fails with the native connection error.
  const cacheClosed = MutableRef.make(false);
  yield* Scope.addFinalizer(
    connectionScope,
    gate.withLock(
      Effect.sync(() => MutableRef.set(cacheClosed, true)).pipe(Effect.andThen(Scope.close(cacheScope, Exit.void)))
    )
  );

  const runLocked = <A>(
    sql: string,
    binds: Array<DuckDBValue>,
    prepared: boolean,
    control: ReturnType<typeof classifyControl>,
    operation: string,
    read: Reader<A>,
    converter: DuckDBValueConverter<unknown>
  ): Effect.Effect<A, SqlError> => {
    const op = O.getOrElse(R.get(CONTROL_OPERATIONS, control), () => operation);
    const direct = gate.runUnlocked(op, () =>
      native.run(sql, nativeBinds(binds), bindTypes(binds)).then((r) => read(r, converter))
    );
    // DuckDB plans a parameterless prepared statement once, with the table
    // statistics of that moment, so a constant filter pruned on an empty table
    // stays empty after later writes. Only statements with binds are re-planned
    // per execution, so only those use the cache.
    const viaCache = O.filter(
      cache,
      () => prepared && control === "statement" && binds.length > 0 && !MutableRef.get(cacheClosed)
    );
    const run = O.match(viaCache, {
      onNone: () => direct,
      onSome: (statements) =>
        Effect.flatMap(ScopedCache.get(statements, sql), (entry) =>
          CachedStatement.$match(entry, {
            Prepared: ({ statement }) =>
              gate.runUnlocked(op, () => {
                statement.clearBindings();
                statement.bind(binds, bindTypes(binds));
                return statement.run().then((r) => read(r, converter));
              }),
            RunDirect: () => direct,
          })
        ),
    });
    const invalidate = O.match(
      O.filter(cache, () => control === "catalogContext"),
      {
        onNone: () => Effect.void,
        onSome: ScopedCache.invalidateAll,
      }
    );
    return gate.withLock(Effect.tap(run, () => invalidate));
  };

  const runStatement = <A>(
    sql: string,
    params: ReadonlyArray<unknown>,
    operation: string,
    prepared: boolean,
    read: Reader<A>,
    empty: A
  ): Effect.Effect<A, SqlError> =>
    Effect.suspend(() => {
      const control = classifyControl(sql);
      const active = isTransaction();
      if (active && control === "savepoint") {
        return Effect.succeed(empty);
      }
      if (active && control === "rollbackSavepoint") {
        return Effect.sync(() => {
          MutableRef.update(state, afterSuccess(control, sql));
          return empty;
        });
      }
      if (isBlank(sql)) {
        return Effect.succeed(empty);
      }
      return Effect.fromResult(normalizeParameters(params, operation)).pipe(
        Effect.flatMap((binds) =>
          Effect.flatMap(currentConverter, (converter) =>
            runLocked(sql, binds, prepared, control, operation, read, converter)
          )
        ),
        Effect.tap(() => Effect.sync(() => MutableRef.update(state, afterSuccess(control, sql)))),
        Effect.tapError((error) => Effect.sync(() => MutableRef.update(state, afterFailure(control, error)))),
        Effect.onInterrupt(() => Effect.sync(() => MutableRef.update(state, afterInterrupt(control, operation))))
      );
    });

  const runRows = (
    sql: string,
    params: ReadonlyArray<unknown>,
    operation: string,
    prepared: boolean,
    transformRows: RowsTransform
  ): Effect.Effect<ReadonlyArray<Row>, SqlError> =>
    Effect.map(runStatement(sql, params, operation, prepared, readRows, []), (rows) =>
      applyTransform(rows, transformRows)
    );

  const incrementalStream = (
    sql: string,
    params: ReadonlyArray<unknown>,
    transformRows: RowsTransform
  ): Effect.Effect<Stream.Stream<Row, SqlError>, SqlError, Scope.Scope> =>
    Effect.fromResult(normalizeParameters(params, "executeStream")).pipe(
      Effect.flatMap((binds) =>
        Effect.flatMap(currentConverter, (converter) =>
          gate.holdLock.pipe(
            Effect.andThen(
              gate.runUnlocked("executeStream", () => native.stream(sql, nativeBinds(binds), bindTypes(binds)))
            ),
            Effect.map((result) => {
              const iterator = result.yieldConvertedRowObjects(converter);
              return Stream.paginate(undefined, () =>
                Effect.map(
                  gate.runUnlocked("executeStream", () => iterator.next()),
                  (next): readonly [ReadonlyArray<Row>, O.Option<undefined>] =>
                    next.done === true ? [[], O.none()] : [applyTransform(next.value, transformRows), O.some(undefined)]
                )
              );
            })
          )
        )
      )
    );

  const commitNow = gate
    .run("commitTransaction", () => native.run("COMMIT"))
    .pipe(Effect.ensuring(Effect.sync(() => MutableRef.set(state, TransactionPhase.Idle()))), Effect.asVoid);

  const commit: Effect.Effect<void, SqlError> = Effect.suspend(() =>
    CommitDecision.$match(state.pipe(MutableRef.get, decideCommit), {
      Refuse: ({ error }) => Effect.fail(error),
      ProbeThenCommit: ({ failure }) =>
        gate
          .run("commitTransaction", () => native.run(ABORT_PROBE_SQL))
          .pipe(
            Effect.matchEffect({
              onFailure: (probeError) =>
                Effect.fail(isAbortedTransactionError(probeError) ? refusedCommit("aborted", failure) : probeError),
              onSuccess: () => commitNow,
            })
          ),
      Commit: () => commitNow,
    })
  );

  const connection: DuckDbConnection = {
    [ConnectionTypeId]: ConnectionTypeId,
    native,
    gate,
    isTransaction,
    commit,
    runDriverStatement: (sql, operation) => Effect.asVoid(runStatement(sql, [], operation, false, readRows, [])),
    execute: (sql, params, transformRows) => runRows(sql, params, "execute", true, transformRows),
    executeUnprepared: (sql, params, transformRows) => runRows(sql, params, "executeUnprepared", false, transformRows),
    executeRaw: (sql, params) => runStatement(sql, params, "executeRaw", true, readRaw, EMPTY_RAW),
    executeValues: (sql, params) => runStatement(sql, params, "executeValues", true, readValues, []),
    executeValuesUnprepared: (sql, params) =>
      runStatement(sql, params, "executeValuesUnprepared", false, readValues, []),
    executeStream: (sql, params, transformRows) =>
      Stream.unwrap(
        Effect.suspend(
          (): Effect.Effect<Stream.Stream<Row, SqlError>, SqlError, Scope.Scope> =>
            isTransaction()
              ? Effect.succeed(
                  runRows(sql, params, "executeStream", false, transformRows).pipe(Stream.fromIterableEffect)
                )
              : isBlank(sql)
                ? Effect.succeed(Stream.empty)
                : incrementalStream(sql, params, transformRows)
        )
      ),
  };
  return connection;
});
