import * as path from "node:path";
import { fileURLToPath } from "node:url";
import * as FileSystem from "@effect/platform/FileSystem";
import * as NodeContext from "@effect/platform-node/NodeContext";
import * as SqlClient from "@effect/sql/SqlClient";
import * as PgClient from "@effect/sql-pg/PgClient";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import * as d from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Redacted from "effect/Redacted";
import * as Str from "effect/String";
import * as pg from "pg";
// TODO use this setup https://github.com/radixdlt/radix-incentives/blob/78b29f6a95cdbe20582bfa70dbe76614664292e4/experiments/preview/src/index.ts#L2
// TODO or this https://github.com/typeonce-dev/paddle-payments-full-stack-typescript-app/blob/4829ee5e0abf35d4b87a8763049a013b77c59221/apps/server/test/paddle.test.ts
export async function setupDockerTestDb() {
  const POSTGRES_USER = "test";
  const POSTGRES_PASSWORD = "test";
  const POSTGRES_DB = "test";

  // Make sure to use Postgres 15 with pg_uuidv7 installed
  // Ensure you have the pg_uuidv7 docker image locally
  // You may need to modify pg_uuid's dockerfile to install the extension or build a new image from its base
  // https://github.com/fboulnois/pg_uuidv7
  const container = await new PostgreSqlContainer("pg_uuidv7")
    .withEnvironment({
      POSTGRES_USER: POSTGRES_USER,
      POSTGRES_PASSWORD: POSTGRES_PASSWORD,
      POSTGRES_DB: POSTGRES_DB,
    })
    .withExposedPorts(5432)
    .start();

  const connectionString = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${container.getHost()}:${container.getFirstMappedPort()}/${POSTGRES_DB}`;
  const client = new pg.Pool({
    connectionString,
  });
  const db = drizzle(client);

  await db.execute(d.sql`CREATE EXTENSION IF NOT EXISTS pg_uuidv7`);
  const migrationPath = path.join(process.cwd(), "src/db/migrations");
  await migrate(db, {
    migrationsFolder: migrationPath,
  });

  const confirmDatabaseReady = await db.execute(d.sql`SELECT 1`);

  return { container, db, confirmDatabaseReady, client };
}

export class PgContainer extends Effect.Service<PgContainer>()("PgContainer", {
  scoped: Effect.acquireRelease(
    Effect.promise(() => new PostgreSqlContainer("postgres:alpine").start()),
    (container) => Effect.promise(() => container.stop())
  ),
}) {
  static readonly Live = Layer.effectDiscard(
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      const fs = yield* FileSystem.FileSystem;

      const currentFileDir = path.dirname(fileURLToPath(import.meta.url));
      const schemaPath = path.resolve(currentFileDir, "../../../../database/src/migrations/sql/_schema.sql");

      const schema = yield* fs.readFileString(schemaPath);
      yield* sql.unsafe(schema);
    })
  ).pipe(
    Layer.provideMerge(
      Layer.unwrapEffect(
        Effect.gen(function* () {
          const container = yield* PgContainer;
          return PgClient.layer({
            url: Redacted.make(container.getConnectionUri()),
            ssl: false,
            transformResultNames: Str.snakeToCamel,
          });
        })
      )
    ),
    Layer.provide(PgContainer.Default),
    Layer.provide(NodeContext.layer),
    Layer.orDie
  );
}
