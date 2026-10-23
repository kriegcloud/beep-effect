import { it } from "@beep/test-runner";
import {
  BunSqliteTestDriver,
  makeSqlTestLayer,
  PgExternalTestDriver,
  PgliteTestcontainersTestDriver,
  provideScopedLayer,
  SqlTestHarnessError,
  TestDatabaseInfo,
} from "@beep/test-utils";
import { describe, expect } from "@effect/vitest";
import * as Cause from "effect/Cause";
import * as Effect from "effect/Effect";
import * as Exit from "effect/Exit";
import * as Layer from "effect/Layer";
import * as O from "effect/Option";
import * as SqlClient from "effect/sql/SqlClient";
import { vi } from "vitest";

const transport = vi.hoisted(() => ({ rejectSqlite: false }));

// Exercise harness lifecycle logic with real local SQL clients at the transport seam.
vi.mock("@effect/platform-bun/BunFileSystem", () => import("@effect/platform-node/NodeFileSystem"));
vi.mock("@effect/platform-bun/BunPath", () => import("@effect/platform-node/NodePath"));
vi.mock("@effect/sql-sqlite-bun", () =>
  import("@effect/sql-sqlite-node/SqliteClient").then((SqliteClient) => ({
    SqliteClient: {
      layer: (config: Parameters<typeof SqliteClient.layer>[0]) =>
        transport.rejectSqlite
          ? Layer.effectContext(Effect.fail("fixture SQLite open failure"))
          : SqliteClient.layer(config),
    },
  }))
);
vi.mock("@effect/sql-pg", (importOriginal) =>
  importOriginal<typeof import("@effect/sql-pg")>().then((actual) =>
    import("@effect/sql-pglite/PgliteClient").then((local) => ({
      ...actual,
      PgClient: {
        ...actual.PgClient,
        make: () => local.make({}),
        makeClient: () => local.make({}),
      },
    }))
  )
);
vi.mock("pg", () => ({
  Client: class {
    connect = () => Promise.resolve();
    query = () => Promise.resolve({ rows: [] });
    end = () => Promise.resolve();
  },
}));
vi.mock("testcontainers", () => ({
  GenericContainer: class {
    static fromDockerfile = () => ({ build: () => Promise.resolve() });
    withEnvironment = () => this;
    withExposedPorts = () => this;
    withStartupTimeout = () => this;
    withWaitStrategy = () => this;
    start = () =>
      Promise.resolve({
        getHost: () => "127.0.0.1",
        getId: () => "transport-fixture",
        getMappedPort: () => 5432,
        stop: () => Promise.resolve(),
      });
  },
  Wait: { forListeningPorts: () => ({}) },
}));

describe("SqlTest transport lifecycle", () => {
  it.effect("runs the Bun driver lifecycle through Node-compatible transports", () =>
    Effect.gen(function* () {
      const info = yield* Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        yield* sql`CREATE TABLE transport_probe (value INTEGER)`;
        yield* sql`INSERT INTO transport_probe VALUES (42)`;
        expect(yield* sql`SELECT value FROM transport_probe`).toEqual([{ value: 42 }]);
        return yield* TestDatabaseInfo;
      }).pipe(provideScopedLayer(makeSqlTestLayer({ driver: BunSqliteTestDriver, config: undefined })));
      expect(info.driver).toBe("bun-sqlite");
      expect(O.isSome(info.databasePath)).toBe(true);
    })
  );

  it.effect("provisions an external session with a generated schema and connection metadata", () =>
    Effect.gen(function* () {
      const info = yield* Effect.gen(function* () {
        const sql = yield* SqlClient.SqlClient;
        const info = yield* TestDatabaseInfo;
        const schema = O.getOrThrow(info.schema);
        expect(yield* sql`SELECT current_schema() AS schema`).toEqual([{ schema }]);
        yield* sql`CREATE TABLE transport_probe (value INTEGER)`;
        return info;
      }).pipe(
        provideScopedLayer(
          makeSqlTestLayer({
            driver: PgExternalTestDriver,
            config: { connectionUri: "postgres://fixture:fixture@localhost:5432/fixture" },
          })
        )
      );
      expect(info.driver).toBe("pg-external");
      expect(info.database).toEqual(O.some("fixture"));
      expect(info.host).toEqual(O.some("localhost"));
      expect(info.port).toEqual(O.some(5432));
      expect(info.username).toEqual(O.some("fixture"));
    })
  );

  it.effect("supports external sessions without schema isolation or optional URI metadata", () =>
    Effect.gen(function* () {
      const info = yield* TestDatabaseInfo.pipe(
        provideScopedLayer(
          makeSqlTestLayer({
            driver: PgExternalTestDriver,
            config: { connectionUri: "postgres:///", isolation: "none" },
          })
        )
      );
      expect(info.schema).toEqual(O.none());
      expect(info.database).toEqual(O.none());
      expect(info.host).toEqual(O.none());
      expect(info.port).toEqual(O.none());
      expect(info.username).toEqual(O.none());
    })
  );

  it.effect("builds the container driver client and exposes its resource metadata", () =>
    Effect.gen(function* () {
      const info = yield* TestDatabaseInfo.pipe(
        provideScopedLayer(
          makeSqlTestLayer({
            driver: PgliteTestcontainersTestDriver,
            config: { password: "fixture" },
          })
        )
      );
      expect(info.driver).toBe("pglite-testcontainers");
      expect(info.containerId).toEqual(O.some("transport-fixture"));
      expect(info.port).toEqual(O.some(5432));
    })
  );
  it.effect("maps SQLite open failure at the Bun transport boundary", () =>
    Effect.gen(function* () {
      transport.rejectSqlite = true;
      const exit = yield* BunSqliteTestDriver.makeLayer(undefined).pipe(Layer.build, Effect.scoped, Effect.exit);
      transport.rejectSqlite = false;
      expect(Exit.isFailure(exit)).toBe(true);
      if (Exit.isFailure(exit)) {
        const error = Cause.squash(exit.cause);
        expect(SqlTestHarnessError.is(error)).toBe(true);
        if (SqlTestHarnessError.is(error)) expect(error.message).toBe("Failed to open the Bun SQLite test database.");
      }
    })
  );
});
