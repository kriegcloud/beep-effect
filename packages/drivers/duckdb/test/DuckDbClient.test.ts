import { DuckDbClient, DuckDbClientConfigData, DuckDbMigrator, DuckDbTestLayer } from "@beep/duckdb";
import { it } from "@beep/test-runner";
import { fcRuns } from "@beep/test-utils";
import { decimalValue } from "@duckdb/node-api";
import { assert, describe, expect } from "@effect/vitest";
import { assertNone, assertTrue } from "@effect/vitest/utils";
import * as A from "effect/Array";
import * as Config from "effect/Config";
import * as ConfigProvider from "effect/ConfigProvider";
import * as DateTime from "effect/DateTime";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import { pipe } from "effect/Function";
import * as Layer from "effect/Layer";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";
import * as Str from "effect/String";
import * as SqlClient from "effect/sql/SqlClient";
import * as TestClock from "effect/testing/TestClock";
import type { SqlError } from "effect/sql/SqlError";

const reasonOf = (error: SqlError): { readonly _tag: string; readonly operation?: string | undefined } => error.reason;

const assertUnknownError = (error: SqlError, operation: string): void => {
  assert.strictEqual(reasonOf(error)._tag, "UnknownError");
  assert.strictEqual(reasonOf(error).operation, operation);
};

const sameBytes = (actual: unknown, expected: ReadonlyArray<number>): void => {
  assert.instanceOf(actual, Uint8Array);
  assert.strictEqual((actual as Uint8Array).constructor, Uint8Array);
  assert.deepStrictEqual(A.fromIterable(actual as Uint8Array), A.fromIterable(expected));
};

const instantOf = (value: unknown): number => {
  assert.instanceOf(value, Date);
  return (value as Date).getTime();
};

const BIND_INSTANT = DateTime.toDateUtc(DateTime.makeUnsafe("2024-05-06T07:08:09.123Z"));
const CHICAGO_INSTANT = DateTime.toDateUtc(DateTime.makeUnsafe("2024-01-15T12:00:00Z"));
const makeInvalidDate = (): Date => {
  const date = DateTime.toDateUtc(DateTime.makeUnsafe(0));
  date.setTime(Number.NaN);
  return date;
};
const INVALID_DATE = makeInvalidDate();

const encodeConfigData = S.encodeEffect(DuckDbClientConfigData);
const decodeConfigData = S.decodeUnknownEffect(DuckDbClientConfigData);

describe("DuckDbClient", { concurrent: false }, () => {
  it.layer(DuckDbClient.layer({ databasePath: ":memory:" }), { timeout: "30 seconds" })((it) => {
    it.effect(
      "provides DuckDbClient and SqlClient as the same object",
      Effect.fnUntraced(function* () {
        const client = yield* DuckDbClient.DuckDbClient;
        const sql = yield* SqlClient.SqlClient;
        assert.strictEqual(client, sql);
        assert.strictEqual(client[DuckDbClient.TypeId], DuckDbClient.TypeId);
        assert.strictEqual(client.config.databasePath, ":memory:");
      })
    );

    it.effect(
      "reads its own writes through a repeated parameterless constant-filter query",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`CREATE TABLE stale_plan (singleton INTEGER, v INTEGER)`;
        const select = sql<{ readonly v: number }>`SELECT v FROM stale_plan WHERE singleton = 1`;
        const count = sql<{ readonly n: number }>`SELECT count(*) AS n FROM stale_plan WHERE singleton < 2`;
        assert.deepStrictEqual(yield* select, []);
        assert.deepStrictEqual(yield* count.values, [[0]]);
        yield* sql`INSERT INTO stale_plan VALUES (1, 7)`;
        assert.deepStrictEqual(yield* select, [{ v: 7 }]);
        assert.deepStrictEqual(yield* sql`SELECT v FROM stale_plan WHERE singleton = 1`, [{ v: 7 }]);
        assert.deepStrictEqual(yield* count.values, [[1]]);
        assert.deepStrictEqual(yield* sql`SELECT v FROM stale_plan WHERE singleton = ${1}`, [{ v: 7 }]);
      })
    );

    it.effect(
      "runs CRUD through the tagged template and record helpers",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`CREATE TABLE crud_people (id INTEGER PRIMARY KEY, name VARCHAR, age INTEGER)`;
        yield* sql`INSERT INTO crud_people ${sql.insert([
          { id: 1, name: "ada", age: 36 },
          { id: 2, name: "bob", age: 41 },
          { id: 3, name: "cy", age: 29 },
        ])}`;
        yield* sql`INSERT INTO crud_people ${sql.insert({ id: 4, name: "dee", age: 50 })}`;
        yield* sql`UPDATE crud_people SET ${sql.update({ id: 2, name: "bobby", age: 42 }, ["id"])} WHERE id = ${2}`;
        const selected = yield* sql<{
          readonly id: number;
          readonly name: string;
        }>`SELECT id, name FROM crud_people WHERE ${sql.in("id", [1, 2, 4])} ORDER BY id`;
        assert.deepStrictEqual(selected, [
          { id: 1, name: "ada" },
          { id: 2, name: "bobby" },
          { id: 4, name: "dee" },
        ]);
        const filtered = yield* sql`SELECT id FROM crud_people WHERE ${sql.and([
          sql`age > ${30}`,
          sql`name <> ${"dee"}`,
        ])} ORDER BY id`;
        assert.deepStrictEqual(filtered, [{ id: 1 }, { id: 2 }]);
        const inHelper = yield* sql`SELECT id FROM crud_people WHERE id IN ${sql.in([3, 4])} ORDER BY id`;
        assert.deepStrictEqual(inHelper, [{ id: 3 }, { id: 4 }]);
        yield* sql`DELETE FROM crud_people WHERE id = ${3}`;
        assert.deepStrictEqual(yield* sql`SELECT count(*) AS n FROM crud_people`, [{ n: 3 }]);
      })
    );

    it.effect(
      "updates rows with updateValues",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`CREATE TABLE uv_people (id INTEGER PRIMARY KEY, name VARCHAR)`;
        yield* sql`INSERT INTO uv_people ${sql.insert([
          { id: 1, name: "a" },
          { id: 2, name: "b" },
          { id: 3, name: "c" },
        ])}`;
        yield* sql`UPDATE uv_people SET name = data.name FROM ${sql.updateValues(
          [
            { id: 1, name: "x" },
            { id: 3, name: "z" },
          ],
          "data"
        )} WHERE uv_people.id = data.id`;
        assert.deepStrictEqual(yield* sql`SELECT id, name FROM uv_people ORDER BY id`, [
          { id: 1, name: "x" },
          { id: 2, name: "b" },
          { id: 3, name: "z" },
        ]);
      })
    );

    it.effect(
      "returns value rows through values and valuesUnprepared",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`CREATE TABLE values_rows (id INTEGER, name VARCHAR)`;
        yield* sql`INSERT INTO values_rows VALUES (1, 'one'), (2, 'two')`;
        assert.deepStrictEqual(yield* sql`SELECT id, name FROM values_rows ORDER BY id`.values, [
          [1, "one"],
          [2, "two"],
        ]);
        assert.deepStrictEqual(yield* sql`SELECT id, name FROM values_rows WHERE id = ${2}`.valuesUnprepared, [
          [2, "two"],
        ]);
        assert.deepStrictEqual(yield* sql`INSERT INTO values_rows VALUES (3, 'three')`.values, []);
      })
    );

    it.effect(
      "binds parameters on the unprepared path",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        assert.deepStrictEqual(yield* sql`SELECT ${5} AS v`.unprepared, [{ v: 5 }]);
      })
    );

    it.effect(
      "runs multi-statement SQL without params on both paths",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        assert.deepStrictEqual(
          yield* sql`CREATE TABLE multi_stmt (i INTEGER); INSERT INTO multi_stmt VALUES (1)`.unprepared,
          []
        );
        assert.deepStrictEqual(yield* sql`INSERT INTO multi_stmt VALUES (2); INSERT INTO multi_stmt VALUES (3)`, []);
        // second run hits the cached RunDirect entry
        yield* sql`INSERT INTO multi_stmt VALUES (2); INSERT INTO multi_stmt VALUES (3)`;
        assert.deepStrictEqual(yield* sql`SELECT count(*) AS n FROM multi_stmt`, [{ n: 5 }]);
      })
    );

    it.effect(
      "returns an empty result for blank SQL",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        assert.deepStrictEqual(yield* sql.unsafe("   "), []);
        assert.deepStrictEqual(yield* sql.unsafe("").unprepared, []);
        assert.deepStrictEqual(yield* sql.unsafe("  ").values, []);
        assert.strictEqual(yield* Stream.runCount(sql.unsafe(" ").stream), 0);
      })
    );

    it.effect(
      "returns [] for DDL and plain DML",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        assert.deepStrictEqual(yield* sql`CREATE TABLE ddl_dml (i INTEGER)`, []);
        assert.deepStrictEqual(yield* sql`INSERT INTO ddl_dml VALUES (1), (2)`, []);
        assert.deepStrictEqual(yield* sql`UPDATE ddl_dml SET i = i + 1`, []);
        assert.deepStrictEqual(yield* sql`DELETE FROM ddl_dml WHERE i = 3`, []);
      })
    );

    it.effect(
      "reports changes and rows through raw",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`CREATE TABLE raw_rows (id INTEGER)`;
        assert.deepStrictEqual(yield* sql`INSERT INTO raw_rows VALUES (1), (2)`.raw, { changes: 2, rows: [] });
        assert.deepStrictEqual(yield* sql`INSERT INTO raw_rows VALUES (3) RETURNING id`.raw, {
          changes: 0,
          rows: [{ id: 3 }],
        });
      })
    );

    it.effect(
      "reads integers as numbers by default and bigints under SafeIntegers",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        const query = sql`SELECT 9007199254740993::BIGINT AS b, 7::HUGEINT AS h, 8::UBIGINT AS u, [1::BIGINT] AS l, (SELECT count(*) FROM range(3)) AS c`;
        assert.deepStrictEqual(yield* query, [{ b: 9007199254740992, h: 7, u: 8, l: [1], c: 3 }]);
        const safe = yield* query.pipe(Effect.provideService(SqlClient.SafeIntegers, true));
        assert.deepStrictEqual(safe, [
          {
            b: BigInt("9007199254740993"),
            h: BigInt(7),
            u: BigInt(8),
            l: [BigInt(1)],
            c: BigInt(3),
          },
        ]);
      })
    );

    it.effect(
      "converts decimals, times, intervals, special timestamps, strings, and nested types",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`CREATE TYPE conv_mood AS ENUM ('ok', 'sad')`;
        const [row] = yield* sql`SELECT
          123.4::DECIMAL(4,1) AS small_dec,
          123456789012345.678::DECIMAL(18,3) AS big_dec,
          '12:34:56.123456'::TIME AS t,
          '12:34:56+05:30'::TIMETZ AS ttz,
          INTERVAL 1 DAY + INTERVAL 2 HOUR + INTERVAL 3 MONTH AS iv,
          'infinity'::TIMESTAMP AS inf,
          '550e8400-e29b-41d4-a716-446655440000'::UUID AS id,
          'ok'::conv_mood AS mood,
          '{"a":1}'::JSON AS j,
          {'a': 1, 'b': 'x'} AS st,
          map {'k': 1} AS mp,
          [1, 2, 3] AS ls`;
        assert.deepStrictEqual(row, {
          small_dec: 123.4,
          big_dec: "123456789012345.678",
          t: "12:34:56.123456",
          ttz: "12:34:56+05:30",
          iv: { months: 3, days: 1, micros: 7_200_000_000 },
          inf: "infinity",
          id: "550e8400-e29b-41d4-a716-446655440000",
          mood: "ok",
          j: '{"a":1}',
          st: { a: 1, b: "x" },
          mp: [{ key: "k", value: 1 }],
          ls: [1, 2, 3],
        });
        const [safe] = yield* sql`SELECT INTERVAL 2 HOUR AS iv`.pipe(
          Effect.provideService(SqlClient.SafeIntegers, true)
        );
        assert.deepStrictEqual(safe, { iv: { months: 0, days: 0, micros: BigInt(7_200_000_000) } });
      })
    );

    it.effect(
      "round-trips BLOB values as plain Uint8Array",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`CREATE TABLE blob_rows (b BLOB)`;
        yield* sql`INSERT INTO blob_rows VALUES (${new Uint8Array([1, 2, 250])})`;
        const [row] = yield* sql<{ readonly b: unknown }>`SELECT b FROM blob_rows`;
        sameBytes(row?.b, [1, 2, 250]);
        const [literal] = yield* sql<{ readonly b: unknown }>`SELECT '\\xAA\\xBB'::BLOB AS b`;
        sameBytes(literal?.b, [0xaa, 0xbb]);
      })
    );

    it.effect(
      "reads DATE, TIMESTAMP and TIMESTAMPTZ as Date",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        const [row] = yield* sql<{
          readonly d: unknown;
          readonly ts: unknown;
          readonly tz: unknown;
        }>`SELECT DATE '2024-01-02' AS d, TIMESTAMP '2024-01-02 03:04:05' AS ts, TIMESTAMPTZ '2024-01-02 03:04:05+00' AS tz`;
        assert.strictEqual(instantOf(row?.d), Date.UTC(2024, 0, 2));
        assert.strictEqual(instantOf(row?.ts), Date.UTC(2024, 0, 2, 3, 4, 5));
        assert.strictEqual(instantOf(row?.tz), Date.UTC(2024, 0, 2, 3, 4, 5));
      })
    );

    it.effect(
      "binds JavaScript values",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        assert.deepStrictEqual(yield* sql.unsafe("SELECT ?::INTEGER IS NULL AS n", [undefined]), [{ n: true }]);

        const instant = BIND_INSTANT;
        yield* sql`CREATE TABLE bind_dates (ts TIMESTAMP, tz TIMESTAMPTZ)`;
        yield* sql`INSERT INTO bind_dates VALUES (${instant}, ${instant})`;
        const [dates] = yield* sql<{ readonly ts: unknown; readonly tz: unknown }>`SELECT ts, tz FROM bind_dates`;
        assert.strictEqual(instantOf(dates?.ts), instant.getTime());
        assert.strictEqual(instantOf(dates?.tz), instant.getTime());

        const [bytes] = yield* sql.unsafe<{ readonly u: unknown; readonly i: unknown }>("SELECT ? AS u, ? AS i", [
          new Uint8Array([1, 2]),
          new Int8Array([-1, 3]),
        ]);
        sameBytes(bytes?.u, [1, 2]);
        sameBytes(bytes?.i, [255, 3]);

        yield* sql`CREATE TABLE bind_bigints (b BIGINT)`;
        yield* sql`INSERT INTO bind_bigints VALUES (${BigInt("9007199254740993")})`;
        assert.deepStrictEqual(
          yield* sql`SELECT b FROM bind_bigints`.pipe(Effect.provideService(SqlClient.SafeIntegers, true)),
          [{ b: BigInt("9007199254740993") }]
        );

        assert.deepStrictEqual(yield* sql.unsafe("SELECT ?::INTEGER[] AS l", [[1, 2, 3]]), [{ l: [1, 2, 3] }]);
        assert.deepStrictEqual(yield* sql.unsafe("SELECT list_sum(?) AS s", [[4, 5]]), [{ s: 9 }]);

        assert.deepStrictEqual(yield* sql.unsafe("SELECT ? AS j", [{ a: 1, b: "x" }]), [{ j: '{"a":1,"b":"x"}' }]);
        assert.deepStrictEqual(yield* sql.unsafe("SELECT (?::JSON)->>'a' AS a", [{ a: 1 }]), [{ a: "1" }]);

        assert.deepStrictEqual(yield* sql.unsafe("SELECT ? AS d", [decimalValue(BigInt(12345), 5, 2)]), [
          { d: 123.45 },
        ]);
      })
    );

    it.effect(
      "fails unbindable parameters with UnknownError carrying the method operation",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        assertUnknownError(yield* Effect.flip(sql.unsafe("SELECT ? AS x", [[]])), "execute");
        assertUnknownError(yield* Effect.flip(sql.unsafe("SELECT ? AS x", [new Map()])), "execute");
        assertUnknownError(yield* Effect.flip(sql.unsafe("SELECT ? AS x", [INVALID_DATE])), "execute");
        assertUnknownError(yield* Effect.flip(sql.unsafe("SELECT ? AS x", [[]]).unprepared), "executeUnprepared");
        assertUnknownError(yield* Effect.flip(sql.unsafe("SELECT ? AS x", [new Map()]).values), "executeValues");
        assertUnknownError(
          yield* Effect.flip(sql.unsafe("SELECT ? AS x", [new Map()]).valuesUnprepared),
          "executeValuesUnprepared"
        );
        assertUnknownError(
          yield* Effect.flip(sql.unsafe("SELECT ? AS x", [new Map()]).raw.pipe(Effect.asVoid)),
          "executeRaw"
        );
      })
    );

    it.effect(
      "fails the documented numeric bind limits with UnknownError",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        assert.strictEqual(reasonOf(yield* Effect.flip(sql.unsafe("SELECT ? AS x", [1e20])))._tag, "UnknownError");
        assert.strictEqual(reasonOf(yield* Effect.flip(sql.unsafe("SELECT ? AS x", [[1, 2.5]])))._tag, "UnknownError");
      })
    );

    it.effect(
      "uses UTC as the default session TimeZone",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        assert.deepStrictEqual(yield* sql`SELECT current_setting('TimeZone') AS tz`, [{ tz: "UTC" }]);
      })
    );

    it.effect(
      "never reuses earlier bindings on a cached statement with short binds",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        const text = "SELECT ?::INTEGER AS a, ?::INTEGER AS b";
        assert.deepStrictEqual(yield* sql.unsafe(text, [1, 2]), [{ a: 1, b: 2 }]);
        const error = yield* Effect.flip(sql.unsafe(text, [3]));
        assert.strictEqual(reasonOf(error)._tag, "UnknownError");
        assert.deepStrictEqual(yield* sql.unsafe(text, [4, 5]), [{ a: 4, b: 5 }]);
      })
    );

    it.effect(
      "invalidates cached statements after USE",
      Effect.fnUntraced(function* () {
        const client = yield* DuckDbClient.DuckDbClient;
        const sql = client;
        yield* client.attach(":memory:", "use_aux");
        yield* sql`CREATE TABLE use_aux.use_t (src VARCHAR)`;
        yield* sql`INSERT INTO use_aux.use_t VALUES ('aux')`;
        yield* sql`CREATE TABLE memory.main.use_t (src VARCHAR)`;
        yield* sql`INSERT INTO memory.main.use_t VALUES ('main')`;
        const select = sql`SELECT src FROM use_t`;
        assert.deepStrictEqual(yield* select, [{ src: "main" }]);
        yield* sql`USE use_aux`;
        assert.deepStrictEqual(yield* select, [{ src: "aux" }]);
        yield* sql`USE memory`;
        assert.deepStrictEqual(yield* select, [{ src: "main" }]);
        yield* client.detach("use_aux");
      })
    );

    it.effect(
      "pins DECIMAL widening rules",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`CREATE TABLE widen (x DECIMAL(10,2))`;
        yield* sql`INSERT INTO widen VALUES (1.25), (2.50)`;
        const [row] = yield* sql<Record<string, unknown>>`SELECT x, x * 2 AS d FROM widen WHERE x = 2.5`;
        assert.deepStrictEqual(row, { x: 2.5, d: "5.00" });
        assert.deepStrictEqual(yield* sql`SELECT sum(x) AS s, avg(x) AS a FROM widen`, [{ s: "3.75", a: 1.875 }]);
      })
    );

    it.effect(
      "interrupts a long-running query and keeps the connection usable",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        const [elapsed, exit] = yield* sql`SELECT count(*) AS n FROM range(20000000000)`.pipe(
          Effect.timeout("200 millis"),
          Effect.exit,
          Effect.timed,
          TestClock.withLive
        );
        pipe(exit, Exit.isFailure, assertTrue);
        assert.isBelow(Duration.toMillis(elapsed), 2000);
        assert.deepStrictEqual(yield* sql`SELECT 1 AS one`, [{ one: 1 }]);
      })
    );

    it.effect(
      "streams rows incrementally outside a transaction",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        assert.strictEqual(yield* Stream.runCount(sql`SELECT range AS i FROM range(10000)`.stream), 10000);
        const firstThree = yield* Stream.runCollect(
          Stream.take(sql<{ readonly i: number }>`SELECT range AS i FROM range(10000)`.stream, 3)
        );
        assert.deepStrictEqual(firstThree, [{ i: 0 }, { i: 1 }, { i: 2 }]);
        assert.deepStrictEqual(yield* sql`SELECT 1 AS one`, [{ one: 1 }]);
      })
    );

    it.effect(
      "materializes a stream inside withTransaction so per-row statements see every row",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        // 10000 rows: well past the 2048-row native chunk where a non-materialized stream truncates.
        const count = yield* sql<{ readonly i: number }>`SELECT range AS i FROM range(10000)`.stream.pipe(
          Stream.mapEffect((row) => sql`SELECT ${row.i} AS v`),
          Stream.runCount,
          sql.withTransaction
        );
        assert.strictEqual(count, 10000);
      })
    );

    it.effect(
      "sees a column added by ALTER TABLE through a cached statement",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`CREATE TABLE alter_t (a INTEGER)`;
        yield* sql`INSERT INTO alter_t VALUES (1)`;
        const select = sql`SELECT * FROM alter_t`;
        assert.deepStrictEqual(yield* select, [{ a: 1 }]);
        yield* sql`ALTER TABLE alter_t ADD COLUMN b INTEGER DEFAULT 7`;
        assert.deepStrictEqual(yield* select, [{ a: 1, b: 7 }]);
      })
    );

    it.effect(
      "reuses one cached statement for concurrent inserts inside a transaction",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`CREATE TABLE conc_tx (i INTEGER)`;
        yield* sql.withTransaction(
          Effect.all(
            A.makeBy(20, (i) => sql`INSERT INTO conc_tx VALUES (${i})`),
            { concurrency: "unbounded" }
          )
        );
        assert.deepStrictEqual(yield* sql`SELECT count(DISTINCT i) AS n, count(*) AS c FROM conc_tx`, [
          { n: 20, c: 20 },
        ]);
      })
    );

    it.effect(
      "runs driver extras",
      Effect.fnUntraced(function* () {
        const client = yield* DuckDbClient.DuckDbClient;
        yield* client.checkpoint();
        yield* client.checkpoint({ force: true });

        const refused = yield* Effect.flip(client.withTransaction(client.checkpoint()));
        assertUnknownError(refused, "checkpoint");

        yield* client.attach(":memory:", "extras_aux");
        assert.deepStrictEqual(
          yield* client`SELECT database_name FROM duckdb_databases() WHERE database_name = 'extras_aux'`,
          [{ database_name: "extras_aux" }]
        );
        yield* client.detach("extras_aux");
        assert.deepStrictEqual(
          yield* client`SELECT database_name FROM duckdb_databases() WHERE database_name = 'extras_aux'`,
          []
        );

        const rolledBack = yield* Effect.flip(
          client.withTransaction(client.attach(":memory:", "extras_rb").pipe(Effect.andThen(Effect.fail("rollback"))))
        );
        assert.strictEqual(rolledBack, "rollback");
        assert.deepStrictEqual(
          yield* client`SELECT database_name FROM duckdb_databases() WHERE database_name = 'extras_rb'`,
          []
        );

        yield* client.loadExtension("json");
        assertUnknownError(yield* Effect.flip(client.loadExtension("not_an_extension_xyz")), "loadExtension");
      })
    );

    it.effect(
      "compiles identifiers with and without a transform",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        const statement = sql`SELECT ${sql("someName")} FROM ${sql("someTable")} WHERE id = ${1}`;
        const transformed = DuckDbClient.makeCompiler(Str.camelToSnake);
        assert.deepStrictEqual(transformed.compile(statement, false), [
          'SELECT "some_name" FROM "some_table" WHERE id = ?',
          [1],
        ]);
        assert.deepStrictEqual(transformed.compile(statement, true), [
          'SELECT "someName" FROM "someTable" WHERE id = ?',
          [1],
        ]);
        assert.deepStrictEqual(DuckDbClient.makeCompiler().compile(statement, false), [
          'SELECT "someName" FROM "someTable" WHERE id = ?',
          [1],
        ]);
        assert.strictEqual(transformed.dialect, "sqlite");
      })
    );
  });

  it.layer(DuckDbClient.layerClient({ databasePath: ":memory:" }), { timeout: "30 seconds" })((it) => {
    it.effect(
      "layerClient provides DuckDbClient only",
      Effect.fnUntraced(function* () {
        const client = yield* DuckDbClient.DuckDbClient;
        assert.strictEqual(client[DuckDbClient.TypeId], DuckDbClient.TypeId);
        assertNone(yield* Effect.serviceOption(SqlClient.SqlClient));
      })
    );

    it.effect(
      "runs DuckDbMigrator against the DuckDB client",
      Effect.fnUntraced(function* () {
        const loader = DuckDbMigrator.fromRecord({
          "1_init": Effect.gen(function* () {
            const sql = yield* SqlClient.SqlClient;
            yield* sql`CREATE TABLE migrated (id INTEGER PRIMARY KEY, value VARCHAR)`;
          }),
          "2_seed": Effect.gen(function* () {
            const sql = yield* SqlClient.SqlClient;
            yield* sql`INSERT INTO migrated VALUES (1, 'hello')`;
          }),
        });
        const completed = yield* DuckDbMigrator.run({ loader }).pipe(
          Effect.provideServiceEffect(SqlClient.SqlClient, Effect.service(DuckDbClient.DuckDbClient))
        );
        assert.deepStrictEqual(completed, [
          [1, "init"],
          [2, "seed"],
        ]);
        const client = yield* DuckDbClient.DuckDbClient;
        assert.deepStrictEqual(yield* client`SELECT value FROM migrated`, [{ value: "hello" }]);
        const again = yield* DuckDbMigrator.run({ loader }).pipe(
          Effect.provideServiceEffect(SqlClient.SqlClient, Effect.service(DuckDbClient.DuckDbClient))
        );
        assert.deepStrictEqual(again, []);
      })
    );
  });

  it.layer(DuckDbTestLayer, { timeout: "30 seconds" })((it) => {
    it.effect(
      "DuckDbTestLayer answers select 1",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        assert.deepStrictEqual(yield* sql`SELECT 1 AS one`, [{ one: 1 }]);
      })
    );
  });

  it.layer(DuckDbClient.layer({ databasePath: ":memory:", timeZone: "America/Chicago" }), { timeout: "30 seconds" })(
    (it) => {
      it.effect(
        "keeps TIMESTAMPTZ instants and stores local wall time in naive TIMESTAMP",
        Effect.fnUntraced(function* () {
          const sql = yield* SqlClient.SqlClient;
          assert.deepStrictEqual(yield* sql`SELECT current_setting('TimeZone') AS tz`, [{ tz: "America/Chicago" }]);
          const instant = CHICAGO_INSTANT;
          yield* sql`CREATE TABLE chicago_dates (ts TIMESTAMP, tz TIMESTAMPTZ)`;
          yield* sql`INSERT INTO chicago_dates VALUES (${instant}, ${instant})`;
          const [row] = yield* sql<{
            readonly tz: unknown;
            readonly wall: string;
          }>`SELECT tz, strftime(ts, '%Y-%m-%d %H:%M:%S') AS wall FROM chicago_dates`;
          assert.strictEqual(instantOf(row?.tz), instant.getTime());
          assert.strictEqual(row?.wall, "2024-01-15 06:00:00");
        })
      );
    }
  );

  it.layer(DuckDbClient.layer({ databasePath: ":memory:", databaseOptions: { TimeZone: "Asia/Tokyo" } }), {
    timeout: "30 seconds",
  })((it) => {
    it.effect(
      "keeps a databaseOptions TimeZone when timeZone is not given",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        assert.deepStrictEqual(yield* sql`SELECT current_setting('TimeZone') AS tz`, [{ tz: "Asia/Tokyo" }]);
      })
    );
  });

  it.layer(
    DuckDbClient.layer({
      databasePath: ":memory:",
      transformQueryNames: Str.camelToSnake,
      transformResultNames: Str.snakeToCamel,
    }),
    { timeout: "30 seconds" }
  )((it) => {
    it.effect(
      "transforms names and withoutTransforms returns raw names with extras intact",
      Effect.fnUntraced(function* () {
        const client = yield* DuckDbClient.DuckDbClient;
        const sql = client;
        yield* sql`CREATE TABLE ${sql("transformPeople")} (${sql("firstName")} VARCHAR)`;
        yield* sql`INSERT INTO ${sql("transformPeople")} ${sql.insert({ firstName: "ada" })}`;
        assert.deepStrictEqual(yield* sql`SELECT * FROM transform_people`, [{ firstName: "ada" }]);
        const raw = client.withoutTransforms();
        assert.deepStrictEqual(yield* raw`SELECT * FROM transform_people`, [{ first_name: "ada" }]);
        assert.strictEqual(raw[DuckDbClient.TypeId], DuckDbClient.TypeId);
        assert.isFunction(raw.checkpoint);
        assert.isFunction(raw.attach);
        yield* raw.checkpoint();
      })
    );

    it.effect(
      "applies the null-safe row transform through execute, unprepared and stream",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        const query = () =>
          sql`SELECT [NULL, 1]::INTEGER[] AS some_list, [NULL, {'inner_key': 1}] AS some_structs, map {'k': 1} AS some_map`;
        const expected = {
          someList: [null, 1],
          someStructs: [null, { innerKey: 1 }],
          someMap: [{ key: "k", value: 1 }],
        };
        assert.deepStrictEqual(yield* query(), [expected]);
        assert.deepStrictEqual(yield* query().unprepared, [expected]);
        assert.deepStrictEqual(yield* Stream.runCollect(query().stream), [expected]);
      })
    );

    it.effect(
      "applies transformResultNames to streamed rows",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        assert.deepStrictEqual(yield* Stream.runCollect(sql`SELECT range AS some_value FROM range(3)`.stream), [
          { someValue: 0 },
          { someValue: 1 },
          { someValue: 2 },
        ]);
      })
    );
  });

  it.layer(DuckDbClient.layer({ databasePath: ":memory:", transformQueryNames: Str.camelToSnake }), {
    timeout: "30 seconds",
  })((it) => {
    it.effect(
      "keeps transforming identifiers under withoutTransforms when only transformQueryNames is set",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        const raw = sql.withoutTransforms();
        assert.deepStrictEqual(yield* raw`SELECT 1 AS ${raw("someName")}`, [{ some_name: 1 }]);
      })
    );
  });

  it.layer(DuckDbClient.layer({ databasePath: ":memory:", prepareCacheSize: 1 }), { timeout: "30 seconds" })((it) => {
    it.effect(
      "evicts and re-prepares statements with a one-entry cache",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        const results = yield* Effect.forEach(A.range(0, 199), (i) =>
          i % 2 === 0 ? sql`SELECT ${i}::INTEGER AS even` : sql`SELECT ${i}::INTEGER AS odd`
        );
        assert.deepStrictEqual(
          results,
          A.map(A.range(0, 199), (i) => (i % 2 === 0 ? [{ even: i }] : [{ odd: i }]))
        );
      })
    );
  });

  it.layer(DuckDbClient.layer({ databasePath: ":memory:", prepareCacheSize: 0 }), { timeout: "30 seconds" })((it) => {
    it.effect(
      "executes statements with the cache disabled",
      Effect.fnUntraced(function* () {
        const sql = yield* SqlClient.SqlClient;
        assert.deepStrictEqual(yield* sql`SELECT ${1}::INTEGER AS v`, [{ v: 1 }]);
        assert.deepStrictEqual(yield* sql`SELECT ${2}::INTEGER AS v`, [{ v: 2 }]);
        assert.deepStrictEqual(yield* sql`CREATE TABLE no_cache (i INTEGER); INSERT INTO no_cache VALUES (1), (2)`, []);
        assert.deepStrictEqual(yield* sql`SELECT count(*) AS n FROM no_cache`.raw, { changes: 0, rows: [{ n: 2 }] });
      })
    );
  });

  it.layer(
    DuckDbClient.layerConfig({ databasePath: Config.String("duckdb_path") }).pipe(
      Layer.provide(ConfigProvider.layer(ConfigProvider.fromUnknown({ duckdb_path: ":memory:" })))
    ),
    { timeout: "30 seconds" }
  )((it) => {
    it.effect(
      "builds layerConfig from a ConfigProvider",
      Effect.fnUntraced(function* () {
        const client = yield* DuckDbClient.DuckDbClient;
        assert.strictEqual(client.config.databasePath, ":memory:");
        assert.deepStrictEqual(yield* client`SELECT 1 AS one`, [{ one: 1 }]);
      })
    );
  });

  it.effect.prop(
    "round-trips DuckDbClientConfigData through its encoded form",
    [DuckDbClientConfigData],
    ([value]) =>
      Effect.gen(function* () {
        const decoded = yield* decodeConfigData(value);
        const roundTripped = yield* decodeConfigData(yield* encodeConfigData(decoded));
        expect(roundTripped).toEqual(decoded);
      }),
    { arbitrary: fcRuns(20) }
  );
});
