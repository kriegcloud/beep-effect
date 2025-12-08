import { fileURLToPath } from "node:url";
import { DocumentsRepos } from "@beep/documents-infra";
import { DocumentsDb } from "@beep/documents-infra/db";
import { IamRepos } from "@beep/iam-infra";
import { IamDb } from "@beep/iam-infra/db";
import { Db, SharedDb } from "@beep/shared-infra/Db";
import { SharedRepos } from "@beep/shared-infra/repos";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as BunContext from "@effect/platform-bun/BunContext";
import type * as SqlClient from "@effect/sql/SqlClient";
import type * as SqlError from "@effect/sql/SqlError";
import * as PgClient from "@effect/sql-pg/PgClient";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { identity } from "effect";
import type * as ConfigError from "effect/ConfigError";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as P from "effect/Predicate";
import * as Redacted from "effect/Redacted";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as PgConnString from "pg-connection-string";
import postgres from "postgres";
import { Wait } from "testcontainers";
export type SliceDatabaseClients = DocumentsDb.DocumentsDb | IamDb.IamDb | SharedDb.SharedDb;
export type SliceDatabaseClientsLive = Layer.Layer<SliceDatabaseClients, never, Db.PgClientServices>;
export const SliceDatabaseClientsLive: SliceDatabaseClientsLive = Layer.mergeAll(
  IamDb.IamDb.Live,
  DocumentsDb.DocumentsDb.Live,
  SharedDb.SharedDb.Live
);

type SliceRepositories = DocumentsRepos.DocumentsRepos | IamRepos.IamRepos | SharedRepos.SharedRepos;
//
// type L = Layer.Layer.Context<typeof IamRepos.layer>
type SliceReposLive = Layer.Layer<SliceRepositories, never, Db.PgClientServices | SliceDatabaseClients>;
export const SliceReposLive: SliceReposLive = Layer.mergeAll(
  IamRepos.layer,
  DocumentsRepos.layer,
  SharedRepos.layer
).pipe(Layer.orDie);

export type CoreSliceServices = SqlClient.SqlClient | SliceDatabaseClients | SliceRepositories;

export type CoreSliceServicesLive = Layer.Layer<CoreSliceServices, ConfigError.ConfigError | SqlError.SqlError, never>;

export const CoreSliceServicesLive = (layer: typeof Db.layer): CoreSliceServicesLive =>
  SliceReposLive.pipe(Layer.provideMerge(Layer.provideMerge(SliceDatabaseClientsLive, layer)));

export class PgContainerError extends Data.TaggedError("PgContainerError")<{
  readonly message: string;
  readonly cause: unknown;
}> {}

export class DomainError extends S.TaggedError<DomainError>("DomainError")("DomainError", {
  message: S.String,
  cause: S.Defect,
}) {
  static readonly is = S.is(DomainError);

  static readonly selfOrMap = (e: unknown) => {
    if (DomainError.is(e)) {
      return e;
    }

    if (e instanceof Error) {
      return new DomainError({
        message: e.message,
        cause: e,
      });
    }

    return new DomainError({
      cause: e,
      message:
        P.or(P.isObject, P.isRecord)(e) && P.hasProperty("message")(e) && P.isString(e.message) ? e.message : String(e),
    });
  };

  static readonly mapError = Effect.mapError(DomainError.selfOrMap);
}

const POSTGRES_USER = "test";
const POSTGRES_PASSWORD = "test";
const POSTGRES_DB = "test";

const setupDocker = Effect.gen(function* () {
  // Make sure to use Postgres 15 with pg_uuidv7 installed
  // Ensure you have the pg_uuidv7 docker image locally
  // You may need to modify pg_uuid's dockerfile to install the extension or build a new image from its base
  // https://github.com/fboulnois/pg_uuidv7

  // const path = yield* Path.Path;
  //
  // const currentPath = fileURLToPath(import.meta.url);

  const migrationPath = "/home/elpresidank/YeeBois/projects/beep-effect/packages/_internal/db-admin/drizzle";

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
}).pipe(Effect.provide([BunContext.layer]));

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

    const { container } = yield* PgContainer;

    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const migrationsFolder = path.join(currentDir, "../drizzle");
    yield* Effect.logInfo(`Migration path: ${migrationsFolder}`);
    if (!(yield* fs.exists(migrationsFolder))) {
      return yield* new DomainError({
        message: "Migrations directory not found",
        cause: {
          path: migrationsFolder,
        },
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
).pipe(Layer.provide([BunContext.layer, PgContainer.Default]), Layer.orDie);

const PgClientTest = Layer.unwrapEffect(
  Effect.gen(function* () {
    const { container } = yield* PgContainer;

    // Parse connection URI into components
    const parsed = PgConnString.parse(container.getConnectionUri());

    // Create ConfigProvider with NESTED structure
    const configProvider = ConfigProvider.fromJson({
      DB: {
        PG: {
          HOST: parsed.host ?? "localhost",
          PORT: String(parsed.port ?? 5432),
          USER: parsed.user ?? "postgres",
          PASSWORD: parsed.password ?? "postgres",
          DATABASE: parsed.database ?? "postgres",
          SSL: "false",
        },
      },
    });

    // Use PgClient.layer WITHOUT explicit params, apply ConfigProvider
    return CoreSliceServicesLive(Db.layer).pipe(Layer.provide(Layer.setConfigProvider(configProvider)));
  })
).pipe(Layer.provide(PgContainer.Default), Layer.orDie);

export const PgTest = ApplySchemaDump.pipe(Layer.provideMerge(PgClientTest));
