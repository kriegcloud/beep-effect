import { DuckDb, DuckDbConnectionOptions, DuckDbParquetExport } from "@beep/duckdb";
import { NodeServices } from "@effect/platform-node";
import { describe, expect, it } from "@effect/vitest";
import { Effect, FileSystem, Path } from "effect";

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
          }).pipe(Effect.provide(DuckDb.makeNodeLayer(new DuckDbConnectionOptions({ databasePath }))));
        })
      ).pipe(Effect.provide(NodeServices.layer));
    })
  );
});
