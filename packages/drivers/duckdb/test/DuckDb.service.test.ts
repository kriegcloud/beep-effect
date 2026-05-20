import { DuckDb, DuckDbConnectionOptions, DuckDbError, DuckDbParquetExport } from "@beep/duckdb";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Effect, Exit, FileSystem, Layer, Path } from "effect";

const provideScopedLayer =
  <ROut, E2, RIn>(layer: Layer.Layer<ROut, E2, RIn>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E | E2, RIn | Exclude<R, ROut>> =>
    Effect.scoped(Layer.build(layer).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context)))));

const withTempDirectory = <A, E, R>(use: (tmpDir: string) => Effect.Effect<A, E, R>) =>
  Effect.acquireUseRelease(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      return yield* fs.makeTempDirectory();
    }),
    use,
    (tmpDir) =>
      Effect.gen(function* () {
        const fs = yield* FileSystem.FileSystem;
        yield* fs.remove(tmpDir, { recursive: true, force: true });
      })
  );

describe("@beep/duckdb", () => {
  it("normalizes unknown failures into typed DuckDB errors", () => {
    const cause = new Error("native failed");
    const error = DuckDbError.fromUnknown("query", cause, {
      databasePath: "metrics.duckdb",
      message: "Custom DuckDB failure.",
      statement: "SELECT broken",
    });

    expect(error).toBeInstanceOf(DuckDbError);
    expect(error.cause).toBe(cause);
    expect(error.databasePath).toBe("metrics.duckdb");
    expect(error.message).toBe("Custom DuckDB failure.");
    expect(error.operation).toBe("query");
    expect(error.statement).toBe("SELECT broken");
  });

  it("preserves existing DuckDB errors and supports the data-last normalizer form", () => {
    const existing = new DuckDbError({
      message: "Already normalized.",
      operation: "run",
    });

    expect(DuckDbError.fromUnknown("query", existing)).toBe(existing);

    const normalizeRunFailure = DuckDbError.fromUnknown("plain failure");
    const normalized = normalizeRunFailure("run");

    expect(normalized).toBeInstanceOf(DuckDbError);
    expect(normalized.message).toBe("DuckDB operation failed.");
    expect(normalized.operation).toBe("run");
  });

  it.effect(
    "runs statements, queries rows, and exports parquet",
    Effect.fn(function* () {
      yield* withTempDirectory(
        Effect.fn(function* (tmpDir) {
          const path = yield* Path.Path;
          const fs = yield* FileSystem.FileSystem;
          const databasePath = path.join(tmpDir, "metrics.duckdb");
          const parquetPath = path.join(tmpDir, "exports", "events.parquet");
          yield* fs.makeDirectory(path.dirname(parquetPath), { recursive: true });

          yield* Effect.gen(function* () {
            const duckdb = yield* DuckDb;
            yield* duckdb.withTransaction(
              Effect.fn(function* (transaction) {
                yield* transaction.run("CREATE TABLE events (id VARCHAR, value INTEGER)");
                yield* transaction.run("INSERT INTO events VALUES ($id, $value)", { id: "run-1", value: 42 });
              })
            );

            const rows = yield* duckdb.query("SELECT id, value FROM events ORDER BY id");
            expect(rows).toEqual([{ id: "run-1", value: 42 }]);

            yield* duckdb.copyTableToParquet(
              new DuckDbParquetExport({
                filePath: parquetPath,
                tableName: "events",
              })
            );
            expect(yield* fs.exists(parquetPath)).toBe(true);
          }).pipe(provideScopedLayer(DuckDb.makeNodeLayer(new DuckDbConnectionOptions({ databasePath }))));
        })
      ).pipe(provideScopedLayer(NodeServices.layer));
    })
  );

  it.effect(
    "preserves in-memory state across client operations",
    Effect.fn(function* () {
      yield* Effect.gen(function* () {
        const duckdb = yield* DuckDb;
        yield* duckdb.run("CREATE TABLE memory_events (id VARCHAR, value INTEGER)");
        yield* duckdb.run("INSERT INTO memory_events VALUES ($id, $value)", { id: "memory-1", value: 7 });

        const rows = yield* duckdb.query("SELECT id, value FROM memory_events ORDER BY id");
        expect(rows).toEqual([{ id: "memory-1", value: 7 }]);
      }).pipe(provideScopedLayer(DuckDb.makeNodeLayer(new DuckDbConnectionOptions({ databasePath: ":memory:" }))));
    })
  );

  it.effect(
    "rolls back failed nested transactions on the same connection",
    Effect.fn(function* () {
      yield* withTempDirectory(
        Effect.fn(function* (tmpDir) {
          const path = yield* Path.Path;
          const databasePath = path.join(tmpDir, "metrics.duckdb");

          yield* Effect.gen(function* () {
            const duckdb = yield* DuckDb;
            yield* duckdb.run("CREATE TABLE tx_events (id VARCHAR)");

            const exit = yield* Effect.exit(
              duckdb.withTransaction(
                Effect.fn(function* (transaction) {
                  yield* transaction.run("INSERT INTO tx_events VALUES ('outer')");
                  yield* transaction.withTransaction((nested) => nested.run("INSERT INTO tx_events VALUES ('inner')"));
                  return yield* new DuckDbError({
                    message: "force rollback",
                    operation: "test",
                  });
                })
              )
            );

            expect(Exit.isFailure(exit)).toBe(true);
            const rows = yield* duckdb.query("SELECT count(*) AS count FROM tx_events");
            expect(rows).toEqual([{ count: "0" }]);
          }).pipe(provideScopedLayer(DuckDb.makeNodeLayer(new DuckDbConnectionOptions({ databasePath }))));
        })
      ).pipe(provideScopedLayer(NodeServices.layer));
    })
  );
});
