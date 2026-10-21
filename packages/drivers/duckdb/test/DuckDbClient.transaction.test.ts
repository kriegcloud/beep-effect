import { DuckDbClient } from "@beep/duckdb";
import { it } from "@beep/test-runner";
import { DuckDBInstance } from "@duckdb/node-api";
import { assert, describe, expect } from "@effect/vitest";
import * as Deferred from "effect/Deferred";
import * as Effect from "effect/Effect";
import * as Fiber from "effect/Fiber";
import * as Ref from "effect/Ref";
import * as Reactivity from "effect/reactivity/Reactivity";
import * as SqlClient from "effect/sql/SqlClient";
import * as TestClock from "effect/testing/TestClock";
import type { DuckDBConnection } from "@duckdb/node-api";
import type { SqlError } from "effect/sql/SqlError";

const NESTED_MESSAGE =
  "DuckDB cannot roll back a nested transaction on its own; COMMIT refused and the whole transaction rolled back";
const ABORTED_MESSAGE =
  "DuckDB aborted this transaction after an earlier statement failed; COMMIT refused because DuckDB would roll it back silently";

const LONG_QUERY = "select count(*) from range(20000000000)";

// `it.effect` installs TestClock, so wall-clock waits must run with the live clock.
const liveSleep = (millis: number): Effect.Effect<void> => Effect.sleep(`${millis} millis`).pipe(TestClock.withLive);

const countRows = (sql: SqlClient.SqlClient, table: string): Effect.Effect<number, SqlError> =>
  sql
    .unsafe<{ readonly n: number }>(`select count(*)::INTEGER as n from ${table}`)
    .pipe(Effect.map((rows) => rows[0]?.n ?? -1));

const expectRefusedCommit = (error: SqlError, message: string): void => {
  expect(error.reason._tag).toBe("UnknownError");
  expect(error.reason.operation).toBe("commitTransaction");
  expect(error.reason.message).toBe(message);
};

const expectUsable = (sql: SqlClient.SqlClient): Effect.Effect<void, SqlError> =>
  sql
    .unsafe<{ readonly one: number }>("select 1 as one")
    .pipe(Effect.map((rows) => expect(rows).toEqual([{ one: 1 }])));

const acquireInstance = Effect.acquireRelease(
  Effect.promise(() => DuckDBInstance.create(":memory:")),
  (instance) => Effect.sync(() => instance.closeSync())
);

const acquireRawConnection = (instance: DuckDBInstance) =>
  Effect.acquireRelease(
    Effect.promise(() => instance.connect()),
    (connection) => Effect.sync(() => connection.closeSync())
  );

const runRaw = (connection: DuckDBConnection, sqlText: string): Effect.Effect<void> =>
  Effect.promise(() => connection.run(sqlText)).pipe(Effect.asVoid);

describe("DuckDbClient transactions", { concurrent: false }, () => {
  it.layer(DuckDbClient.layer({ databasePath: ":memory:" }), { timeout: "30 seconds" })((it) => {
    it.effect(
      "commits a successful transaction",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`create table tx_commit (id INTEGER)`;
        yield* sql.withTransaction(
          Effect.gen(function* () {
            yield* sql`insert into tx_commit values (1)`;
            yield* sql`insert into tx_commit values (2)`;
          })
        );
        expect(yield* countRows(sql, "tx_commit")).toBe(2);
      })
    );

    it.effect(
      "rolls back on failure",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`create table tx_rollback (id INTEGER)`;
        const error = yield* sql
          .withTransaction(sql`insert into tx_rollback values (1)`.pipe(Effect.andThen(Effect.fail("boom" as const))))
          .pipe(Effect.flip);
        expect(error).toBe("boom");
        expect(yield* countRows(sql, "tx_rollback")).toBe(0);
      })
    );

    it.effect(
      "commits both levels of a nested transaction",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`create table tx_nested_commit (id INTEGER)`;
        yield* sql.withTransaction(
          Effect.gen(function* () {
            yield* sql`insert into tx_nested_commit values (1)`;
            yield* sql.withTransaction(sql`insert into tx_nested_commit values (2)`);
          })
        );
        expect(yield* countRows(sql, "tx_nested_commit")).toBe(2);
      })
    );

    it.effect(
      "refuses the outer commit after a nested rollback the outer body caught",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`create table tx_nested_rollback (id INTEGER)`;
        const error = yield* sql
          .withTransaction(
            Effect.gen(function* () {
              yield* sql`insert into tx_nested_rollback values (1)`;
              yield* sql
                .withTransaction(
                  sql`insert into tx_nested_rollback values (2)`.pipe(Effect.andThen(Effect.fail("inner" as const)))
                )
                .pipe(Effect.ignore);
            })
          )
          .pipe(Effect.flip);
        expectRefusedCommit(error, NESTED_MESSAGE);
        expect(yield* countRows(sql, "tx_nested_rollback")).toBe(0);
        yield* expectUsable(sql);
      })
    );

    it.effect(
      "refuses the commit after a swallowed constraint error",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`create table tx_constraint (id INTEGER PRIMARY KEY)`;
        const error = yield* sql
          .withTransaction(
            Effect.gen(function* () {
              yield* sql`insert into tx_constraint values (1)`;
              yield* sql`insert into tx_constraint values (1)`.pipe(Effect.ignore);
            })
          )
          .pipe(Effect.flip);
        expectRefusedCommit(error, ABORTED_MESSAGE);
        expect(yield* countRows(sql, "tx_constraint")).toBe(0);
      })
    );

    it.effect(
      "keeps the connection usable after a refused commit",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`create table tx_usable (id INTEGER PRIMARY KEY)`;
        yield* sql
          .withTransaction(
            Effect.gen(function* () {
              yield* sql`insert into tx_usable values (1)`;
              yield* sql`insert into tx_usable values (1)`.pipe(Effect.ignore);
            })
          )
          .pipe(Effect.flip);
        yield* expectUsable(sql);
        yield* sql.withTransaction(sql`insert into tx_usable values (2)`);
        expect(yield* countRows(sql, "tx_usable")).toBe(1);
      })
    );

    it.effect(
      "commits after a swallowed parser error",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`create table tx_parser (id INTEGER)`;
        yield* sql.withTransaction(
          Effect.gen(function* () {
            yield* sql`insert into tx_parser values (1)`;
            const parserError = yield* sql.unsafe("frobnicate nonsense from").pipe(Effect.flip);
            expect(parserError.reason._tag).toBe("SqlSyntaxError");
          })
        );
        expect(yield* countRows(sql, "tx_parser")).toBe(1);
      })
    );

    it.effect(
      "refuses the commit after a swallowed interrupted statement",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`create table tx_interrupt (id INTEGER)`;
        const error = yield* sql
          .withTransaction(
            Effect.gen(function* () {
              yield* sql`insert into tx_interrupt values (1)`;
              yield* sql.unsafe(LONG_QUERY).pipe(Effect.timeout("200 millis"), TestClock.withLive, Effect.ignore);
            })
          )
          .pipe(Effect.flip);
        expectRefusedCommit(error, ABORTED_MESSAGE);
        expect(yield* countRows(sql, "tx_interrupt")).toBe(0);
        yield* expectUsable(sql);
      })
    );

    it.effect(
      "refuses the commit after a failed nested BEGIN TRANSACTION",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`create table tx_nested_begin (id INTEGER)`;
        const error = yield* sql
          .withTransaction(
            Effect.gen(function* () {
              yield* sql`insert into tx_nested_begin values (1)`;
              yield* sql`BEGIN TRANSACTION`.pipe(Effect.ignore);
            })
          )
          .pipe(Effect.flip);
        expectRefusedCommit(error, ABORTED_MESSAGE);
        expect(yield* countRows(sql, "tx_nested_begin")).toBe(0);
        yield* expectUsable(sql);
      })
    );

    it.effect(
      "refuses the commit after a failed nested START TRANSACTION",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`create table tx_nested_start (id INTEGER)`;
        const error = yield* sql
          .withTransaction(
            Effect.gen(function* () {
              yield* sql`insert into tx_nested_start values (1)`;
              yield* sql`START TRANSACTION`.pipe(Effect.ignore);
            })
          )
          .pipe(Effect.flip);
        expectRefusedCommit(error, ABORTED_MESSAGE);
        expect(yield* countRows(sql, "tx_nested_start")).toBe(0);
        yield* expectUsable(sql);
      })
    );

    it.effect(
      "serializes concurrent nested transactions inside one outer transaction",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`create table tx_nested_concurrent (name VARCHAR)`;
        const firstStarted = yield* Deferred.make<void>();
        const events = yield* Ref.make<ReadonlyArray<string>>([]);
        const record = (event: string) => Ref.update(events, (all) => [...all, event]);

        yield* sql.withTransaction(
          Effect.all(
            [
              sql.withTransaction(
                Effect.gen(function* () {
                  yield* Deferred.succeed(firstStarted, undefined);
                  yield* liveSleep(100);
                  yield* sql`insert into tx_nested_concurrent values ('first')`;
                  yield* record("first-end");
                })
              ),
              Deferred.await(firstStarted).pipe(
                Effect.andThen(
                  sql.withTransaction(
                    Effect.gen(function* () {
                      yield* record("second-start");
                      yield* sql`insert into tx_nested_concurrent values ('second')`;
                    })
                  )
                )
              ),
            ],
            { concurrency: "unbounded" }
          )
        );

        expect(yield* Ref.get(events)).toEqual(["first-end", "second-start"]);
        const rows = yield* sql<{ readonly name: string }>`select name from tx_nested_concurrent order by name`;
        expect(rows).toEqual([{ name: "first" }, { name: "second" }]);
      })
    );

    it.effect(
      "rolls back when the transaction fiber is interrupted",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`create table tx_fiber_interrupt (id INTEGER)`;
        const inserted = yield* Deferred.make<void>();
        const fiber = yield* sql
          .withTransaction(
            Effect.gen(function* () {
              yield* sql`insert into tx_fiber_interrupt values (1)`;
              yield* Deferred.succeed(inserted, undefined);
              return yield* Effect.never;
            })
          )
          .pipe(Effect.forkChild);
        yield* Deferred.await(inserted);
        yield* Fiber.interrupt(fiber);
        expect(yield* countRows(sql, "tx_fiber_interrupt")).toBe(0);
        yield* expectUsable(sql);
      })
    );

    it.effect(
      "rejects a manual SAVEPOINT outside a transaction as a syntax error",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        const error = yield* sql.unsafe("SAVEPOINT effect_sql_1").pipe(Effect.flip);
        expect(error.reason._tag).toBe("SqlSyntaxError");
      })
    );
  });

  it.layer(Reactivity.layer, { timeout: "30 seconds" })((it) => {
    it.effect(
      "maps a commit-time conflict to SerializationError and keeps the client usable",
      Effect.fnUntraced(function* () {
        const instance = yield* acquireInstance;
        const conn2 = yield* acquireRawConnection(instance);
        const sql = yield* DuckDbClient.fromInstance({ instance });
        yield* sql`create table tx_commit_conflict (id INTEGER PRIMARY KEY)`;

        const error = yield* sql
          .withTransaction(
            Effect.gen(function* () {
              yield* sql`insert into tx_commit_conflict values (3)`;
              yield* runRaw(conn2, "BEGIN TRANSACTION");
              yield* runRaw(conn2, "insert into tx_commit_conflict values (3)");
              yield* runRaw(conn2, "COMMIT");
            })
          )
          .pipe(Effect.flip);

        expect(error.reason._tag).toBe("SerializationError");
        assert.isTrue(error.isRetryable);
        yield* expectUsable(sql);
        expect(yield* countRows(sql, "tx_commit_conflict")).toBe(1);
        yield* sql.withTransaction(sql`insert into tx_commit_conflict values (4)`);
        expect(yield* countRows(sql, "tx_commit_conflict")).toBe(2);
      })
    );

    it.effect(
      "maps a catalog write-write conflict to SerializationError and keeps the client usable",
      Effect.fnUntraced(function* () {
        const instance = yield* acquireInstance;
        const conn2 = yield* acquireRawConnection(instance);
        const sql = yield* DuckDbClient.fromInstance({ instance });

        yield* runRaw(conn2, "BEGIN TRANSACTION");
        yield* runRaw(conn2, "create table cc (i INTEGER)");
        const error = yield* sql.withTransaction(sql`create table cc (i INTEGER)`).pipe(Effect.flip);
        expect(error.reason._tag).toBe("SerializationError");
        yield* runRaw(conn2, "COMMIT");

        yield* expectUsable(sql);
        expect(yield* countRows(sql, "cc")).toBe(0);
      })
    );
  });
});
