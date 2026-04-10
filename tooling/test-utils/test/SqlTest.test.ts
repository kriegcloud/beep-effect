import {
  BunSqliteTestDriver,
  makeSqlTestLayer,
  NodeSqliteTestDriver,
  SqlTestHarnessError,
  type SqlTestHooks,
  TestDatabaseInfo,
} from "@beep/test-utils";
import { describe, expect, it } from "@effect/vitest";
import { Cause, Context, Effect, Exit, Layer, pipe, Scope } from "effect";
import * as A from "effect/Array";
import * as FileSystem from "effect/FileSystem";
import * as SqlClient from "effect/unstable/sql/SqlClient";

const isBunRuntime = process.versions.bun !== undefined;
const expectedDriver = isBunRuntime ? "bun-sqlite" : "node-sqlite";

const makeLayer = <MigrateError = never, SeedError = never>(hooks?: SqlTestHooks<MigrateError, SeedError>) =>
  isBunRuntime
    ? makeSqlTestLayer(
        hooks === undefined
          ? {
              config: undefined,
              driver: BunSqliteTestDriver,
            }
          : {
              config: undefined,
              driver: BunSqliteTestDriver,
              hooks,
            }
      )
    : makeSqlTestLayer(
        hooks === undefined
          ? {
              config: undefined,
              driver: NodeSqliteTestDriver,
            }
          : {
              config: undefined,
              driver: NodeSqliteTestDriver,
              hooks,
            }
      );

const doesTableExist = Effect.fn("SqlTest.doesTableExist")(function* (tableName: string) {
  const sql = (yield* SqlClient.SqlClient).withoutTransforms();
  const rows = yield* sql<{ readonly name: string }>`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table' AND name = ${tableName}
    `;
  return A.isReadonlyArrayNonEmpty(rows);
});

describe("SqlTest", () => {
  it.effect("creates a fresh SQLite database for each locally provided layer", () =>
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

  it.effect("runs migrate and seed hooks before the test effect executes", () =>
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
          values: pipe(
            rows,
            A.map((row) => row.value)
          ),
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

      expect(result.driver).toBe(expectedDriver);
      expect(result.databasePathExists).toBe(true);
      expect(result.tempDirExists).toBe(true);
      expect(result.values).toEqual(["alpha", "beta"]);
    })
  );

  it.effect("wraps hook failures in a typed harness error", () =>
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
          expect(failure.driver).toBe(expectedDriver);
        }
      }
    })
  );

  it.effect("removes the temporary SQLite directory when the layer scope closes", () =>
    Effect.gen(function* () {
      const scope = yield* Scope.make();
      const services = yield* Layer.buildWithScope(makeLayer(), scope);
      const info = Context.get(services, TestDatabaseInfo);
      const fs = Context.get(services, FileSystem.FileSystem);

      expect(yield* fs.exists(info.tempDir)).toBe(true);
      yield* Scope.close(scope, Exit.void);
      expect(yield* fs.exists(info.tempDir)).toBe(false);
    })
  );
});
