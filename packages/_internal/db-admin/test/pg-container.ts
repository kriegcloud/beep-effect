import { fileURLToPath } from "node:url";
import { Entities } from "@beep/iam-domain";
import { BS } from "@beep/schema";
import * as Path from "@effect/platform/Path";
import * as NodeContext from "@effect/platform-node/NodeContext";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import { PgClient } from "@effect/sql-pg";
import { faker } from "@faker-js/faker";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { Effect, Layer, Redacted } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import path from "path";
import postgres from "postgres";
import * as Schema from "../src/schema";

export async function setupDockerTestDb() {
  const POSTGRES_USER = "test";
  const POSTGRES_PASSWORD = "test";
  const POSTGRES_DB = "test";

  // Make sure to use Postgres 15 with pg_uuidv7 installed
  // Ensure you have the pg_uuidv7 docker image locally
  // You may need to modify pg_uuid's dockerfile to install the extension or build a new image from its base
  // https://github.com/fboulnois/pg_uuidv7
  const container = await new PostgreSqlContainer("ghcr.io/fboulnois/pg_uuidv7:1.6.0")
    .withEnvironment({
      POSTGRES_USER: POSTGRES_USER,
      POSTGRES_PASSWORD: POSTGRES_PASSWORD,
      POSTGRES_DB: POSTGRES_DB,
    })
    .withExposedPorts(5432)
    .start();

  const connectionString = `postgres://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${container.getHost()}:${container.getFirstMappedPort()}/${POSTGRES_DB}`;
  const client = postgres(connectionString);
  const db = drizzle(client);

  await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_uuidv7`);
  const migrationPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../drizzle");
  await migrate(db, { migrationsFolder: migrationPath });

  const confirmDatabaseReady = await db.execute(sql`SELECT 1`);

  return { container, db, confirmDatabaseReady, client };
}

export class PgContainer extends Effect.Service<PgContainer>()("PgContainer", {
  scoped: Effect.acquireRelease(
    Effect.promise(() => setupDockerTestDb()),
    ({ container }) => Effect.promise(() => container.stop())
  ),
}) {
  static readonly Live = Layer.effectDiscard(
    Effect.gen(function* () {
      const db = yield* PgDrizzle.make<typeof Schema>({
        schema: Schema,
      });

      const mockedUser = Entities.User.Model.insert.make({
        email: BS.Email.make("test@example.com"),
        name: "beep",
        emailVerified: false,
        image: O.some(faker.image.avatar()),
        twoFactorEnabled: O.some(false),
        isAnonymous: O.some(false),
      });
      const encoded = yield* S.encode(Entities.User.Model.insert)(mockedUser);
      yield* db.insert(Schema.userTable).values([encoded]);
    })
  ).pipe(
    Layer.provideMerge(
      Layer.unwrapEffect(
        Effect.gen(function* () {
          const { container } = yield* PgContainer;
          return PgClient.layer({
            url: Redacted.make(container.getConnectionUri()),
            ssl: false,
            transformResultNames: Str.snakeToCamel,
          });
        })
      )
    ),

    Layer.provide(NodeFileSystem.layer),
    Layer.provide(Path.layer),
    Layer.provide(PgContainer.Default),
    Layer.provide(NodeContext.layer),
    Layer.orDie
  );
}
// Layer.provide(IamRepos.layer, FilesRepos.layer),
//
