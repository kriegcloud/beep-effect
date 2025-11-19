import { FsUtilsLive } from "@beep/tooling-utils/FsUtils";
import { DomainError, NoSuchFileError, resolveWorkspaceDirs } from "@beep/tooling-utils/repo";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as PgClient from "@effect/sql-pg/PgClient";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { identity } from "effect";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as HashMap from "effect/HashMap";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Str from "effect/String";
import postgres from "postgres";
import { Wait } from "testcontainers";

export class PgContainerError extends Data.TaggedError("PgContainerError")<{
  readonly message: string;
  readonly cause: unknown;
}> {}

export class PgContainerUnsupported extends Data.TaggedError("PgContainerUnsupported")<{
  readonly message: string;
  readonly cause?: unknown | undefined;
}> {}

const POSTGRES_USER = "test";
const POSTGRES_PASSWORD = "test";
const POSTGRES_DB = "test";

const setupDocker = Effect.gen(function* () {
  // Make sure to use Postgres 15 with pg_uuidv7 installed
  // Ensure you have the pg_uuidv7 docker image locally
  // You may need to modify pg_uuid's dockerfile to install the extension or build a new image from its base
  // https://github.com/fboulnois/pg_uuidv7

  const path = yield* Path.Path;
  const container = yield* Effect.tryPromise({
    try: () =>
      new PostgreSqlContainer("postgres:alpine")
        .withEnvironment({
          POSTGRES_USER: POSTGRES_USER,
          POSTGRES_PASSWORD: POSTGRES_PASSWORD,
          POSTGRES_DB: POSTGRES_DB,
        })
        .withExposedPorts(5432)
        .withWaitStrategy(Wait.forHealthCheck())
        .start(),
    catch: (error) =>
      new PgContainerError({
        message: `Failed to initialize new PgContainer`,
        cause: error,
      }),
  });

  const connectionString = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${container.getHost()}:${container.getFirstMappedPort()}/${POSTGRES_DB}`;
  yield* Effect.logInfo(`Connection string: ${connectionString}`);
  const client = postgres(connectionString);

  const db = drizzle(client);

  yield* Effect.tryPromise({
    try: () => db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_uuidv7`),
    catch: (error) =>
      new PgContainerError({
        message: `Failed to create pg_uuidv7 extension`,
        cause: error,
      }),
  });

  const workspaceMap = yield* resolveWorkspaceDirs;
  const adminPath = yield* HashMap.get("@beep/db-admin")(workspaceMap);
  const migrationPath = path.join(adminPath, "drizzle");
  yield* Effect.logInfo(`Migration path: ${migrationPath}`);

  yield* Effect.tryPromise({
    try: () => migrate(db, { migrationsFolder: migrationPath }),
    catch: (error) =>
      new PgContainerError({
        message: `Failed to migrate`,
        cause: error,
      }),
  });

  yield* Effect.logInfo(`Confirming database is ready.`);
  const confirmDatabaseReady = yield* Effect.tryPromise({
    try: () => db.execute(sql`SELECT 1`),
    catch: (e) =>
      new PgContainerError({
        message: `Failed to confirm database is ready`,
        cause: e,
      }),
  });
  yield* Effect.logInfo(`Database is ready.`);

  return { container, db, confirmDatabaseReady, client };
}).pipe(Effect.provide([BunContext.layer, FsUtilsLive]));

export class PgContainer extends Effect.Service<PgContainer>()("PgContainer", {
  scoped: Effect.acquireRelease(setupDocker, ({ container }) => Effect.promise(() => container.stop())),
}) {
  static readonly Live = Layer.empty.pipe(
    Layer.provideMerge(
      Layer.unwrapEffect(
        Effect.gen(function* () {
          const { container } = yield* PgContainer;

          return PgClient.layer({
            url: Redacted.make(container.getConnectionUri()),
            ssl: false,
            transformQueryNames: Str.camelToSnake,
            transformResultNames: Str.snakeToCamel,
            types: {
              getTypeParser: () =>
                ({
                  114: {
                    to: 25,
                    from: [114],
                    parse: identity,
                    serialize: identity,
                  },
                  1082: {
                    to: 25,
                    from: [1082],
                    parse: identity,
                    serialize: identity,
                  },
                  1114: {
                    to: 25,
                    from: [1114],
                    parse: identity,
                    serialize: identity,
                  },
                  1184: {
                    to: 25,
                    from: [1184],
                    parse: identity,
                    serialize: identity,
                  },
                  3802: {
                    to: 25,
                    from: [3802],
                    parse: identity,
                    serialize: identity,
                  },
                }) as const,
            },
          });
        })
      )
    ),
    Layer.provide([BunContext.layer, PgContainer.Default]),
    Layer.orDie
  );
}

const ApplySchemaDump = Layer.effectDiscard(
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const workspaceMap = yield* resolveWorkspaceDirs;
    const { container } = yield* PgContainer;

    const adminPath = yield* HashMap.get("@beep/db-admin")(workspaceMap);

    const migrationsFolder = path.join(adminPath, "drizzle");
    yield* Effect.logInfo(`Migration path: ${migrationsFolder}`);
    if (!(yield* fs.exists(migrationsFolder))) {
      yield* new DomainError({
        message: "Migrations directory not found",
        cause: new NoSuchFileError({
          path: migrationsFolder,
        }),
      });
    }
    const client = postgres(container.getConnectionUri());
    const db = drizzle(client);

    yield* Effect.tryPromise({
      try: () => migrate(db, { migrationsFolder }),
      catch: () =>
        new DomainError({
          message: "Failed to apply migrations",
          cause: new Error("Failed to apply migrations"),
        }),
    });
    yield* Effect.logInfo(`Confirming database is ready.`);
    yield* Effect.tryPromise({
      try: () => db.execute(sql`SELECT 1`),
      catch: () =>
        new DomainError({
          message: "Failed to confirm database is ready",
          cause: new Error("Failed to confirm database is ready"),
        }),
    });
  })
).pipe(Layer.provide([BunContext.layer, FsUtilsLive, PgContainer.Default]), Layer.orDie);

const PgClientTest = Layer.unwrapEffect(
  Effect.gen(function* () {
    const { container } = yield* PgContainer;
    const configProvider = ConfigProvider.fromJson({
      DB_PG_URL: container.getConnectionUri(),
    });
    return PgClient.layer({
      url: Redacted.make(container.getConnectionUri()),
      ssl: false,
      transformQueryNames: Str.camelToSnake,
      transformResultNames: Str.snakeToCamel,
    }).pipe(Layer.provideMerge(Layer.setConfigProvider(configProvider)));
  })
).pipe(Layer.provide(PgContainer.Default), Layer.orDie);

export const PgTest = ApplySchemaDump.pipe(Layer.provideMerge(PgClientTest));
