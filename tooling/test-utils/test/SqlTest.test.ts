import {
  BunSqliteTestDriver,
  makeSqlTestLayer,
  NodeSqliteTestDriver,
  PgliteTestcontainersTestDriver,
  SqlTestHarnessError,
  type SqlTestHooks,
  TestDatabaseInfo,
} from "@beep/test-utils";
import { beforeAll, describe, expect, it } from "@effect/vitest";
import { Cause, Context, Effect, Exit, Layer, pipe, Scope } from "effect";
import * as A from "effect/Array";
import * as FileSystem from "effect/FileSystem";
import * as O from "effect/Option";
import * as SqlClient from "effect/unstable/sql/SqlClient";

const isBunRuntime = process.versions.bun !== undefined;
const expectedDriver = isBunRuntime ? "bun-sqlite" : "node-sqlite";
let pgliteTestcontainersAvailable = false;

beforeAll(
  () =>
    import("testcontainers")
      .then(({ getContainerRuntimeClient }) => getContainerRuntimeClient())
      .then(
        () => {
          pgliteTestcontainersAvailable = true;
        },
        () => {
          pgliteTestcontainersAvailable = false;
        }
      ),
  30_000
);

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

const makePgliteLayer = <MigrateError = never, SeedError = never>(hooks?: SqlTestHooks<MigrateError, SeedError>) =>
  makeSqlTestLayer(
    hooks === undefined
      ? {
          config: undefined,
          driver: PgliteTestcontainersTestDriver,
        }
      : {
          config: undefined,
          driver: PgliteTestcontainersTestDriver,
          hooks,
        }
  );

const skipPgliteWhenUnavailable = (ctx: { readonly skip: (message?: string) => void }) =>
  pgliteTestcontainersAvailable
    ? Effect.void
    : Effect.sync(() => ctx.skip("Docker/Testcontainers is unavailable for PGLite integration tests."));

const doesTableExist = Effect.fn("SqlTest.doesTableExist")(function* (tableName: string) {
  const sql = (yield* SqlClient.SqlClient).withoutTransforms();
  const rows = yield* sql<{ readonly name: string }>`
      SELECT name
      FROM sqlite_master
      WHERE type = 'table' AND name = ${tableName}
  `;
  return A.isReadonlyArrayNonEmpty(rows);
});

const doesPostgresTableExist = Effect.fn("SqlTest.doesPostgresTableExist")(function* (tableName: string) {
  const sql = (yield* SqlClient.SqlClient).withoutTransforms();
  const rows = yield* sql<{ readonly table_name: string }>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = ${tableName}
    `;
  return A.isReadonlyArrayNonEmpty(rows);
});

const isContainerInspectable = Effect.fn("SqlTest.isContainerInspectable")(function* (containerId: string) {
  return yield* Effect.tryPromise({
    try: async () => {
      const { getContainerRuntimeClient } = await import("testcontainers");
      const runtime = await getContainerRuntimeClient();
      await runtime.container.inspect(runtime.container.getById(containerId));
      return true;
    },
    catch: () => false,
  }).pipe(Effect.catchAll(Effect.succeed));
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
        const databasePath = yield* Effect.fromOption(info.databasePath).pipe(Effect.orDie);
        const tempDir = yield* Effect.fromOption(info.tempDir).pipe(Effect.orDie);

        const rows = yield* sql<{ readonly value: string }>`
          SELECT value
          FROM seeded_values
          ORDER BY value ASC
        `;

        return {
          databasePathExists: yield* fs.exists(databasePath),
          driver: info.driver,
          tempDirExists: yield* fs.exists(tempDir),
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
      const tempDir = yield* Effect.fromOption(info.tempDir).pipe(Effect.orDie);

      expect(yield* fs.exists(tempDir)).toBe(true);
      yield* Scope.close(scope, Exit.void);
      expect(yield* fs.exists(tempDir)).toBe(false);
    })
  );

  it.effect(
    "starts a PGLite Testcontainers database and runs select 1 through SqlClient",
    (ctx) =>
      Effect.gen(function* () {
        yield* skipPgliteWhenUnavailable(ctx);

        const result = yield* Effect.gen(function* () {
          const sql = (yield* SqlClient.SqlClient).withoutTransforms();
          const info = yield* TestDatabaseInfo;
          const rows = yield* sql<{ readonly one: number }>`SELECT 1 AS one`;

          return {
            connectionUri: O.isSome(info.connectionUri),
            containerId: O.isSome(info.containerId),
            database: O.isSome(info.database),
            driver: info.driver,
            host: O.isSome(info.host),
            one: pipe(
              rows,
              A.head,
              O.map((row) => row.one),
              O.getOrElse(() => 0)
            ),
            port: O.isSome(info.port),
            username: O.isSome(info.username),
          };
        }).pipe(Effect.provide(makePgliteLayer(), { local: true }));

        expect(result.driver).toBe("pglite-testcontainers");
        expect(result.one).toBe(1);
        expect(result.connectionUri).toBe(true);
        expect(result.containerId).toBe(true);
        expect(result.database).toBe(true);
        expect(result.host).toBe(true);
        expect(result.port).toBe(true);
        expect(result.username).toBe(true);
      }),
    120_000
  );

  it.effect(
    "supports PostgreSQL table creation, insert, and query syntax through PGLite",
    (ctx) =>
      Effect.gen(function* () {
        yield* skipPgliteWhenUnavailable(ctx);

        const values = yield* Effect.gen(function* () {
          const sql = (yield* SqlClient.SqlClient).withoutTransforms();
          yield* sql`
            CREATE TABLE notes (
              id SERIAL PRIMARY KEY,
              body TEXT NOT NULL
            )
          `;
          yield* sql`
            INSERT INTO notes (body)
            VALUES ('alpha'), ('beta')
          `;
          const rows = yield* sql<{ readonly body: string }>`
            SELECT body
            FROM notes
            ORDER BY id ASC
          `;

          return pipe(
            rows,
            A.map((row) => row.body)
          );
        }).pipe(Effect.provide(makePgliteLayer(), { local: true }));

        expect(values).toEqual(["alpha", "beta"]);
      }),
    120_000
  );

  it.effect(
    "creates isolated PGLite containers for fresh scoped layers",
    (ctx) =>
      Effect.gen(function* () {
        yield* skipPgliteWhenUnavailable(ctx);

        const createTable = Effect.gen(function* () {
          const sql = (yield* SqlClient.SqlClient).withoutTransforms();
          yield* sql`
            CREATE TABLE isolated_notes (
              id SERIAL PRIMARY KEY,
              body TEXT NOT NULL
            )
          `;
          yield* sql`
            INSERT INTO isolated_notes (body)
            VALUES ('first')
          `;

          return yield* doesPostgresTableExist("isolated_notes");
        }).pipe(Effect.provide(makePgliteLayer(), { local: true }));

        const tableExistsAfterFreshProvision = yield* doesPostgresTableExist("isolated_notes").pipe(
          Effect.provide(makePgliteLayer(), { local: true })
        );

        expect(yield* createTable).toBe(true);
        expect(tableExistsAfterFreshProvision).toBe(false);
      }),
    120_000
  );

  it.effect(
    "runs PGLite migrate and seed hooks before the test effect executes",
    (ctx) =>
      Effect.gen(function* () {
        yield* skipPgliteWhenUnavailable(ctx);

        const result = yield* Effect.gen(function* () {
          const info = yield* TestDatabaseInfo;
          const sql = (yield* SqlClient.SqlClient).withoutTransforms();

          const rows = yield* sql<{ readonly value: string }>`
            SELECT value
            FROM seeded_values
            ORDER BY value ASC
          `;

          return {
            driver: info.driver,
            values: pipe(
              rows,
              A.map((row) => row.value)
            ),
          };
        }).pipe(
          Effect.provide(
            makePgliteLayer({
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

        expect(result.driver).toBe("pglite-testcontainers");
        expect(result.values).toEqual(["alpha", "beta"]);
      }),
    120_000
  );

  it.effect(
    "wraps PGLite hook failures in a typed harness error",
    (ctx) =>
      Effect.gen(function* () {
        yield* skipPgliteWhenUnavailable(ctx);

        const exit = yield* Effect.exit(
          Effect.void.pipe(
            Effect.provide(
              makePgliteLayer({
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
            expect(failure.driver).toBe("pglite-testcontainers");
          }
        }
      }),
    120_000
  );

  it.effect(
    "stops and removes the PGLite container when the layer scope closes",
    (ctx) =>
      Effect.gen(function* () {
        yield* skipPgliteWhenUnavailable(ctx);

        const scope = yield* Scope.make();
        const services = yield* Layer.buildWithScope(makePgliteLayer(), scope);
        const info = Context.get(services, TestDatabaseInfo);
        const containerId = yield* Effect.fromOption(info.containerId).pipe(Effect.orDie);

        expect(yield* isContainerInspectable(containerId)).toBe(true);
        yield* Scope.close(scope, Exit.void);
        expect(yield* isContainerInspectable(containerId)).toBe(false);
      }),
    120_000
  );
});
