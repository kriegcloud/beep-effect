import { describe, expect, test } from "bun:test";
import { Cause, Effect, Exit, Layer, Scope, ServiceMap } from "effect";
import * as FileSystem from "effect/FileSystem";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import { BunSqliteTestDriver, makeSqlTestLayer, SqlTestHarnessError, TestDatabaseInfo } from "../src/index.js";

const makeLayer = (hooks?: {
  readonly migrate?: Effect.Effect<void, unknown, SqlClient.SqlClient>;
  readonly seed?: Effect.Effect<void, unknown, SqlClient.SqlClient>;
}) =>
  makeSqlTestLayer({
    config: undefined,
    driver: BunSqliteTestDriver,
    hooks,
  });

const doesTableExist = (tableName: string) =>
  Effect.gen(function* () {
    const sql = (yield* SqlClient.SqlClient).withoutTransforms();
    const rows = yield* sql<{ readonly name: string }>`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table' AND name = ${tableName}
    `;
    return rows.length > 0;
  });

describe("SqlTest", () => {
  test("creates a fresh SQLite database for each locally provided layer", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const createTable = Effect.gen(function* () {
          const sql = (yield* SqlClient.SqlClient).withoutTransforms();
          yield* sql`
              CREATE TABLE notes (
                id INTEGER PRIMARY KEY,
                body TEXT NOT NULL
              )
            `;
          yield* sql`
              INSERT INTO notes (body)
              VALUES ('first')
            `;

          return yield* doesTableExist("notes");
        }).pipe(Effect.provide(makeLayer(), { local: true }));

        const tableExistsAfterFreshProvision = yield* doesTableExist("notes").pipe(
          Effect.provide(makeLayer(), { local: true })
        );

        expect(yield* createTable).toBe(true);
        expect(tableExistsAfterFreshProvision).toBe(false);
      })
    );
  });

  test("runs migrate and seed hooks before the test effect executes", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const result = yield* Effect.gen(function* () {
          const info = yield* TestDatabaseInfo;
          const fs = yield* FileSystem.FileSystem;
          const sql = (yield* SqlClient.SqlClient).withoutTransforms();

          const rows = yield* sql<{ readonly value: string }>`
              SELECT value
              FROM seeded_values
              ORDER BY value ASC
            `;

          return {
            databasePathExists: yield* fs.exists(info.databasePath),
            driver: info.driver,
            tempDirExists: yield* fs.exists(info.tempDir),
            values: rows.map((row) => row.value),
          };
        }).pipe(
          Effect.provide(
            makeLayer({
              migrate: Effect.gen(function* () {
                const sql = (yield* SqlClient.SqlClient).withoutTransforms();
                yield* sql`
                    CREATE TABLE seeded_values (
                      value TEXT NOT NULL
                    )
                  `;
              }),
              seed: Effect.gen(function* () {
                const sql = (yield* SqlClient.SqlClient).withoutTransforms();
                yield* sql`
                    INSERT INTO seeded_values (value)
                    VALUES ('alpha'), ('beta')
                  `;
              }),
            }),
            { local: true }
          )
        );

        expect(result.driver).toBe("bun-sqlite");
        expect(result.databasePathExists).toBe(true);
        expect(result.tempDirExists).toBe(true);
        expect(result.values).toEqual(["alpha", "beta"]);
      })
    );
  });

  test("wraps hook failures in a typed harness error", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const exit = yield* Effect.exit(
          Effect.void.pipe(
            Effect.provide(
              makeLayer({
                migrate: Effect.fail("boom"),
              }),
              { local: true }
            )
          )
        );

        expect(Exit.isFailure(exit)).toBe(true);
        if (Exit.isFailure(exit)) {
          const failure = Cause.squash(exit.cause);

          expect(failure).toBeInstanceOf(SqlTestHarnessError);
          if (failure instanceof SqlTestHarnessError) {
            expect(failure.phase).toBe("migrate");
            expect(failure.driver).toBe("bun-sqlite");
          }
        }
      })
    );
  });

  test("removes the temporary SQLite directory when the layer scope closes", async () => {
    await Effect.runPromise(
      Effect.gen(function* () {
        const scope = yield* Scope.make();
        const services = yield* Layer.buildWithScope(makeLayer(), scope);
        const info = ServiceMap.get(services, TestDatabaseInfo);
        const fs = ServiceMap.get(services, FileSystem.FileSystem);

        expect(yield* fs.exists(info.tempDir)).toBe(true);
        yield* Scope.close(scope, Exit.void);
        expect(yield* fs.exists(info.tempDir)).toBe(false);
      })
    );
  });
});
