import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as FilesRepos from "@beep/files-infra/adapters/repositories";
import { FilesDb } from "@beep/files-infra/db";
import * as Entities from "@beep/iam-domain/entities";
import * as IamRepos from "@beep/iam-infra/adapters/repositories";
import { IamDb } from "@beep/iam-infra/db";
import * as BS from "@beep/schema/schema";
import * as Path from "@effect/platform/Path";
import * as BunContext from "@effect/platform-bun/BunContext";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as PgDrizzle from "@effect/sql-drizzle/Pg";
import * as PgClient from "@effect/sql-pg/PgClient";
import { faker } from "@faker-js/faker";
import { PostgreSqlContainer } from "@testcontainers/postgresql";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { Effect, Layer, Redacted } from "effect";
import * as Data from "effect/Data";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import postgres from "postgres";
import * as Schema from "../src/schema";

export class PgContainerError extends Data.TaggedError("PgContainerError")<{
  readonly message: string;
  readonly cause: unknown;
}> {}

export class PgContainerUnsupported extends Data.TaggedError("PgContainerUnsupported")<{
  readonly message: string;
  readonly cause?: unknown | undefined;
}> {}

export type PgContainerPreflightResult =
  | { readonly type: "ready" }
  | { readonly type: "skip"; readonly reason: string; readonly cause?: unknown | undefined };

const EXPLICIT_SKIP_ENV_VARS = ["BEEP_SKIP_PG_CONTAINER_TESTS", "SKIP_DOCKER_TESTS", "TESTCONTAINERS_DISABLED"];

const resolveExplicitSkipReason = (): string | undefined => {
  for (const env of EXPLICIT_SKIP_ENV_VARS) {
    const raw = process.env[env];
    if (typeof raw === "string" && raw.length > 0 && raw.toLowerCase() !== "false") {
      return `Environment variable ${env} is set, skipping PgContainer-dependent tests`;
    }
  }
  return undefined;
};

const extractMessage = (cause: unknown): string => (cause instanceof Error ? cause.message : String(cause ?? ""));

const classifyUnsupportedCause = (cause: unknown): string | undefined => {
  if (cause && typeof cause === "object" && "code" in cause) {
    const code = (cause as NodeJS.ErrnoException).code;
    if (code === "ENOENT") {
      return "Docker socket not found (is the Docker daemon running?)";
    }
    if (code === "ECONNREFUSED") {
      return "Docker daemon refused the connection";
    }
    if (code === "EACCES") {
      return "Access to the Docker socket was denied";
    }
  }

  const message = extractMessage(cause);
  const lower = message.toLowerCase();
  if (message.includes("operation not supported")) {
    return "Docker networking is not supported in this environment";
  }
  if (lower.includes("permission denied") || lower.includes("operation not permitted")) {
    return "Access to the Docker daemon was denied";
  }
  if (message.includes("connect ENOENT") || message.includes("ENOENT: no such file or directory")) {
    return "Docker socket not found (is the Docker daemon running?)";
  }
  if (message.includes("ECONNREFUSED")) {
    return "Docker daemon refused the connection";
  }
  if (lower.includes("unable to find image")) {
    return "Required Docker image is not available locally (pull the image or allow pulling)";
  }
  return undefined;
};

export const pgContainerPreflight: PgContainerPreflightResult = (() => {
  const explicitReason = resolveExplicitSkipReason();
  if (explicitReason) {
    return { type: "skip", reason: explicitReason };
  }

  try {
    const result = spawnSync("docker", ["run", "--rm", "--pull", "never", "alpine:3.19", "/bin/true"], {
      stdio: "pipe",
      encoding: "utf-8",
      timeout: 15_000,
    });

    if (result.error) {
      const reason = classifyUnsupportedCause(result.error);
      if (reason) {
        return { type: "skip", reason, cause: result.error };
      }
      throw result.error;
    }

    if (result.status === 0) {
      return { type: "ready" };
    }

    const stderr = result.stderr ?? "";
    const stdout = result.stdout ?? "";
    const combined = `${stderr}\n${stdout}`.trim();
    const reason = classifyUnsupportedCause(combined);
    if (reason) {
      return { type: "skip", reason, cause: combined };
    }
    return {
      type: "skip",
      reason: `Docker preflight failed with exit code ${result.status ?? "unknown"}`,
      cause: combined,
    };
  } catch (cause) {
    const reason = classifyUnsupportedCause(cause);
    if (reason) {
      return { type: "skip", reason, cause };
    }
    throw cause;
  }
})();

const POSTGRES_USER = "test";
const POSTGRES_PASSWORD = "test";
const POSTGRES_DB = "test";

const setupDocker = Effect.gen(function* () {
  // Make sure to use Postgres 15 with pg_uuidv7 installed
  // Ensure you have the pg_uuidv7 docker image locally
  // You may need to modify pg_uuid's dockerfile to install the extension or build a new image from its base
  // https://github.com/fboulnois/pg_uuidv7
  const preflight = yield* Effect.sync(() => pgContainerPreflight);
  if (preflight.type === "skip") {
    return yield* Effect.fail(
      new PgContainerUnsupported({
        message: preflight.reason,
        cause: preflight.cause,
      })
    );
  }

  const container = yield* Effect.tryPromise({
    try: () =>
      new PostgreSqlContainer("ghcr.io/fboulnois/pg_uuidv7:1.6.0")
        .withEnvironment({
          POSTGRES_USER: POSTGRES_USER,
          POSTGRES_PASSWORD: POSTGRES_PASSWORD,
          POSTGRES_DB: POSTGRES_DB,
        })
        .withExposedPorts(5432)
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

  const migrationPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../drizzle");
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
});

export class PgContainer extends Effect.Service<PgContainer>()("PgContainer", {
  scoped: Effect.acquireRelease(setupDocker, ({ container }) => Effect.promise(() => container.stop())),
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
        gender: "male",
        image: O.some(faker.image.avatar()),
      });

      const encoded = yield* S.encode(Entities.User.Model.insert)(mockedUser);
      yield* db.insert(Schema.user).values([encoded]);
    })
  ).pipe(
    Layer.provideMerge(
      Layer.unwrapEffect(
        Effect.gen(function* () {
          const { container } = yield* PgContainer;

          const pgClient = PgClient.layer({
            url: Redacted.make(container.getConnectionUri()),
            ssl: false,
            transformQueryNames: Str.camelToSnake,
            transformResultNames: Str.snakeToCamel,
          });

          const sliceDbLayer = Layer.mergeAll(IamDb.IamDb.Live, FilesDb.FilesDb.Live);

          const reposLayer = Layer.mergeAll(IamRepos.layer, FilesRepos.layer);

          const verticalSlicesLayer = Layer.provideMerge(reposLayer, sliceDbLayer);

          return Layer.provideMerge(verticalSlicesLayer, pgClient);
        })
      )
    ),
    Layer.provide(BunFileSystem.layer),
    Layer.provide(Path.layer),
    Layer.provide(PgContainer.Default),
    Layer.provide(BunContext.layer),
    Layer.orDie
  );
}
