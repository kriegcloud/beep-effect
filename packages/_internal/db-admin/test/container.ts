import { fileURLToPath } from "node:url";
import { DocumentsRepos } from "@beep/documents-server";
import { DocumentsDb } from "@beep/documents-server/db";
import { IamRepos } from "@beep/iam-server";
import { IamDb } from "@beep/iam-server/db";
import { KnowledgeDb, KnowledgeRepos } from "@beep/knowledge-server/db";
import { DbClient, SharedDb, SharedRepos, TenantContext } from "@beep/shared-server";
import { TenantContextTag } from "@beep/testkit/rls";
import * as FileSystem from "@effect/platform/FileSystem";
import * as Path from "@effect/platform/Path";
import * as BunContext from "@effect/platform-bun/BunContext";
import type * as SqlClient from "@effect/sql/SqlClient";
import type * as SqlError from "@effect/sql/SqlError";
import * as PgClient from "@effect/sql-pg/PgClient";
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

export class DevContainerError extends Data.TaggedError("DevContainerError")<{
  message: string;
  cause?: unknown;
}> {}

export type SliceDatabaseClients = DocumentsDb.Db | IamDb.Db | KnowledgeDb.Db | SharedDb.Db;
export type SliceDatabaseClientsLive = Layer.Layer<SliceDatabaseClients, never, DbClient.PgClientServices>;
export const SliceDatabaseClientsLive: SliceDatabaseClientsLive = Layer.mergeAll(
  IamDb.layer,
  DocumentsDb.layer,
  KnowledgeDb.layer,
  SharedDb.layer
);

type SliceRepositories = DocumentsRepos.Repos | IamRepos.Repos | KnowledgeRepos.Repos | SharedRepos.Repos;
//
// type L = Layer.Layer.Context<typeof IamRepos.layer>
type SliceReposLive = Layer.Layer<SliceRepositories, never, DbClient.PgClientServices | SliceDatabaseClients>;
export const SliceReposLive: SliceReposLive = Layer.mergeAll(
  IamRepos.layer,
  DocumentsRepos.layer,
  KnowledgeRepos.layer,
  SharedRepos.layer
).pipe(Layer.orDie);

/**
 * Layer that maps TenantContext.TenantContext to TenantContextTag for test helpers.
 */
const TenantContextTagLayer = Layer.effect(TenantContextTag, TenantContext.TenantContext);

export type CoreSliceServices =
  | SqlClient.SqlClient
  | SliceDatabaseClients
  | SliceRepositories
  | TenantContext.TenantContext
  | TenantContextTag;

export type CoreSliceServicesLive = Layer.Layer<CoreSliceServices, ConfigError.ConfigError | SqlError.SqlError, never>;

export const CoreSliceServicesLive = (layer: typeof DbClient.layer): CoreSliceServicesLive =>
  SliceReposLive.pipe(
    Layer.provideMerge(TenantContextTagLayer),
    Layer.provideMerge(TenantContext.TenantContext.layer),
    Layer.provideMerge(SliceDatabaseClientsLive),
    Layer.provideMerge(layer)
  );

export class PgContainerError extends Data.TaggedError("PgContainerError")<{
  readonly message: string;
  readonly cause: unknown;
}> {}

export class DomainError extends S.TaggedError<DomainError>()("DomainError", {
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

const PG_TEST_DEBUG = process.env.PG_TEST_DEBUG === "1";
const dbg = (...args: ReadonlyArray<unknown>) => {
  if (PG_TEST_DEBUG) {
    // Bun test output can suppress Effect logger output; use stderr for debugging.
    console.error("[PgTest]", ...args);
  }
};

const postgresSilentNotices = { onnotice: () => {} } as const;

// Non-superuser role used by tests to ensure RLS is actually enforced.
// The container bootstrap user is effectively superuser and would bypass RLS.
const APP_DB_USER = "app_user";
const APP_DB_PASSWORD = "app_password";

const setupDocker = Effect.gen(function* () {
  // Make sure to use Postgres 15 with pg_uuidv7 installed
  // Ensure you have the pg_uuidv7 docker image locally
  // You may need to modify pg_uuid's dockerfile to install the extension or build a new image from its base
  // https://github.com/fboulnois/pg_uuidv7
  const { PostgreSqlContainer } = yield* Effect.tryPromise({
    try: () => import("@testcontainers/postgresql"),
    catch: (cause) => new DevContainerError({ message: "Failed to load testcontainers", cause }),
  });
  const container = yield* Effect.tryPromise({
    try: () =>
      new PostgreSqlContainer("pgvector/pgvector:pg17")
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
  dbg("container started", { host: container.getHost(), port: container.getFirstMappedPort() });
  yield* Effect.logInfo(`Connection string: ${connectionString}`);
  const client = postgres(connectionString, postgresSilentNotices);

  const db = drizzle(client);

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

export const PgTest = Layer.scopedContext(
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem;
    const path = yield* Path.Path;
    const { container } = yield* PgContainer;

    const currentDir = path.dirname(fileURLToPath(import.meta.url));
    const migrationsFolder = path.join(currentDir, "../drizzle");
    dbg("starting migrations", { migrationsFolder });
    yield* Effect.logInfo(`Migration path: ${migrationsFolder}`);
    if (!(yield* fs.exists(migrationsFolder))) {
      return yield* new DomainError({
        message: "Migrations directory not found",
        cause: { path: migrationsFolder },
      });
    }

    // Apply migrations and bootstrap non-superuser test role using a superuser connection.
    yield* Effect.acquireUseRelease(
      Effect.sync(() => {
        const client = postgres(container.getConnectionUri(), postgresSilentNotices);
        const db = drizzle(client);
        return { client, db };
      }),
      ({ db }) =>
        Effect.tryPromise({
          try: async () => {
            await migrate(db, { migrationsFolder });
            dbg("migrations complete");

            dbg("creating/granting app_user");
            await db.execute(
              sql.raw(`
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${APP_DB_USER}') THEN
    CREATE ROLE ${APP_DB_USER} LOGIN PASSWORD '${APP_DB_PASSWORD}';
  END IF;
END $$;
              `)
            );
            await db.execute(sql.raw(`GRANT USAGE ON SCHEMA public TO ${APP_DB_USER};`));
            // Some tests create ad-hoc tables (e.g. CHECK/NOT NULL constraint tests).
            // Grant CREATE so those tests exercise DatabaseError matching under the non-superuser role.
            await db.execute(sql.raw(`GRANT CREATE ON SCHEMA public TO ${APP_DB_USER};`));
            await db.execute(
              sql.raw(`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${APP_DB_USER};`)
            );
            await db.execute(sql.raw(`GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${APP_DB_USER};`));
            await db.execute(
              sql.raw(
                `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${APP_DB_USER};`
              )
            );
            await db.execute(
              sql.raw(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ${APP_DB_USER};`)
            );

            // Smoke check: ensure the non-superuser role can connect.
            const u = new URL(container.getConnectionUri());
            u.username = APP_DB_USER;
            u.password = APP_DB_PASSWORD;
            dbg("app_user smoke connect", { url: `${u.protocol}//${u.host}${u.pathname}` });
            const appClient = postgres(u.toString(), postgresSilentNotices);
            const appDb = drizzle(appClient);
            await appDb.execute(sql`SELECT 1`);
            await appClient.end();
            dbg("app_user smoke connect ok");

            await db.execute(sql`SELECT 1`);
            dbg("schema ready");
          },
          catch: (cause) =>
            new DomainError({
              message: "Failed to bootstrap schema for tests",
              cause,
            }),
        }),
      ({ client }) => Effect.promise(() => client.end()).pipe(Effect.ignore)
    );

    // Build the app DB layer using the container host/port and app_user credentials.
    const parsed = PgConnString.parse(container.getConnectionUri());
    dbg("building effect pg client config", { host: parsed.host, port: parsed.port, database: parsed.database });
    const configProvider = ConfigProvider.fromJson({
      DB_PG: {
        HOST: parsed.host ?? "localhost",
        PORT: String(parsed.port ?? 5432),
        USER: APP_DB_USER,
        PASSWORD: APP_DB_PASSWORD,
        DATABASE: parsed.database ?? "postgres",
        SSL: "false",
      },
    });

    // Ensure config reads in DbClient/ConnectionConfig occur under our provider.
    yield* Effect.withConfigProviderScoped(configProvider);
    dbg("constructing CoreSliceServicesLive(DbClient.layer)");

    return yield* Layer.build(CoreSliceServicesLive(DbClient.layer));
  })
).pipe(Layer.provide([BunContext.layer, PgContainer.Default]), Layer.orDie);
