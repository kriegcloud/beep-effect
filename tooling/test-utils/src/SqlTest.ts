import { $TestUtilsId } from "@beep/identity/packages";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { SqliteClient as NodeSqliteClient } from "@effect/sql-sqlite-node";
import { Context, Effect, FileSystem, Layer, Path } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as SqlClient from "effect/unstable/sql/SqlClient";

const $I = $TestUtilsId.create("SqlTest");

const SqlTestHarnessPhase = LiteralKit(["provision", "migrate", "seed", "teardown"]).annotate(
  $I.annote("SqlTestHarnessPhase", {
    description: "Lifecycle phases for reusable SQL integration-test harness failures.",
  })
);

const TestDatabaseDriver = LiteralKit(["bun-sqlite", "node-sqlite"]).annotate(
  $I.annote("TestDatabaseDriver", {
    description: "Driver identifier for reusable SQL integration-test harnesses.",
  })
);

/**
 * Runtime metadata for an ephemeral integration-test database instance.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class TestDatabaseInfoShape extends S.Class<TestDatabaseInfoShape>($I`TestDatabaseInfoShape`)(
  {
    databasePath: S.String,
    driver: TestDatabaseDriver,
    tempDir: S.String,
  },
  $I.annote("TestDatabaseInfoShape", {
    description: "Runtime metadata for an ephemeral integration-test database instance.",
  })
) {}
/**
 * Runtime metadata for an ephemeral integration-test database instance.
 *
 * @category PortContract
 * @since 0.0.0
 */
export class TestDatabaseInfo extends Context.Service<TestDatabaseInfo, TestDatabaseInfoShape>()(
  $I`TestDatabaseInfo`
) {}

/**
 * Typed harness error surfaced while provisioning or preparing a test database.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export class SqlTestHarnessError extends TaggedErrorClass<SqlTestHarnessError>($I`SqlTestHarnessError`)(
  "SqlTestHarnessError",
  {
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
    driver: TestDatabaseDriver,
    message: S.String,
    phase: SqlTestHarnessPhase,
  },
  $I.annote("SqlTestHarnessError", {
    description: "Typed integration-test harness error for SQL database provisioning and setup hooks.",
  })
) {}

/**
 * Optional database setup hooks executed after the driver layer has been built.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export interface SqlTestHooks<MigrateError = never, SeedError = never> {
  readonly migrate?: undefined | Effect.Effect<void, MigrateError, SqlClient.SqlClient>;
  readonly seed?: undefined | Effect.Effect<void, SeedError, SqlClient.SqlClient>;
}

/**
 * Driver contract for reusable SQL integration-test layers.
 *
 * @category DomainModel
 * @since 0.0.0
 */
export interface SqlTestDriver<Config, Services, SqlService extends Services> {
  readonly makeLayer: (config: Config) => Layer.Layer<Services, SqlTestHarnessError>;
  readonly name: typeof TestDatabaseDriver.Type;
  readonly sqlClient: Context.Key<SqlService, SqlClient.SqlClient>;
}

const toHarnessError = (
  driver: typeof TestDatabaseDriver.Type,
  phase: typeof SqlTestHarnessPhase.Type,
  message: string,
  cause?: unknown
): SqlTestHarnessError =>
  new SqlTestHarnessError({
    cause: O.fromUndefinedOr(cause),
    driver,
    message,
    phase,
  });

const runHook = <Services, SqlService extends Services, HookError>(
  driver: typeof TestDatabaseDriver.Type,
  phase: Extract<typeof SqlTestHarnessPhase.Type, "migrate" | "seed">,
  sqlClient: Context.Key<SqlService, SqlClient.SqlClient>,
  hook: undefined | Effect.Effect<void, HookError, SqlClient.SqlClient>,
  context: Context.Context<Services>
): Effect.Effect<void, SqlTestHarnessError> =>
  hook === undefined
    ? Effect.void
    : hook.pipe(
        Effect.provideService(SqlClient.SqlClient, Context.get(context, sqlClient)),
        Effect.mapError((cause) =>
          toHarnessError(
            driver,
            phase,
            phase === "migrate" ? "SQL test migrate hook failed." : "SQL test seed hook failed.",
            cause
          )
        )
      );

/**
 * Build a fresh, scoped SQL integration-test layer for a concrete driver.
 *
 * @param options Layer construction options.
 * @param options.config Driver configuration forwarded to the selected test driver.
 * @param options.driver Driver contract used to provision services and the SQL client.
 * @param options.hooks Optional migrate and seed hooks executed after provisioning.
 * @returns A fresh scoped layer that provisions the driver and runs migrate/seed hooks.
 * @category Configuration
 * @since 0.0.0
 */
export const makeSqlTestLayer = <
  Config,
  Services,
  SqlService extends Services,
  MigrateError = never,
  SeedError = never,
>(options: {
  readonly config: Config;
  readonly driver: SqlTestDriver<Config, Services, SqlService>;
  readonly hooks?: SqlTestHooks<MigrateError, SeedError>;
}): Layer.Layer<Services, SqlTestHarnessError> =>
  Layer.unwrap(
    Effect.gen(function* () {
      const context = yield* Layer.build(Layer.fresh(options.driver.makeLayer(options.config)));

      yield* runHook(options.driver.name, "migrate", options.driver.sqlClient, options.hooks?.migrate, context);
      yield* runHook(options.driver.name, "seed", options.driver.sqlClient, options.hooks?.seed, context);

      return Layer.succeedContext(context);
    }).pipe(
      Effect.withSpan("SqlTest.makeLayer"),
      Effect.annotateLogs({
        component: "test-utils",
        driver: options.driver.name,
      })
    )
  );

const buildBunSqliteLayer = Effect.gen(function* () {
  const BunFileSystem = yield* Effect.tryPromise({
    try: () => import("@effect/platform-bun/BunFileSystem"),
    catch: (cause) =>
      toHarnessError("bun-sqlite", "provision", "Failed to load Bun filesystem support for SQL tests.", cause),
  });
  const BunPath = yield* Effect.tryPromise({
    try: () => import("@effect/platform-bun/BunPath"),
    catch: (cause) =>
      toHarnessError("bun-sqlite", "provision", "Failed to load Bun path support for SQL tests.", cause),
  });
  const BunSqliteClient = yield* Effect.tryPromise({
    try: () => import("@effect/sql-sqlite-bun"),
    catch: (cause) =>
      toHarnessError("bun-sqlite", "provision", "Failed to load Bun SQLite support for SQL tests.", cause),
  });
  const context = yield* Layer.build(Layer.mergeAll(BunFileSystem.layer, BunPath.layer));
  const fs = Context.get(context, FileSystem.FileSystem);
  const path = Context.get(context, Path.Path);
  const tempDir = yield* fs
    .makeTempDirectoryScoped({ prefix: "beep-sql-test-" })
    .pipe(
      Effect.mapError((cause) =>
        toHarnessError("bun-sqlite", "provision", "Failed to create a temporary SQLite test directory.", cause)
      )
    );
  const databasePath = path.join(tempDir, "test.db");

  return Layer.mergeAll(
    BunFileSystem.layer,
    BunPath.layer,
    BunSqliteClient.SqliteClient.layer({ filename: databasePath }),
    Layer.succeed(TestDatabaseInfo, {
      databasePath,
      driver: "bun-sqlite",
      tempDir,
    } satisfies TestDatabaseInfoShape)
  );
}).pipe(
  Effect.mapError((cause) =>
    S.is(SqlTestHarnessError)(cause)
      ? cause
      : toHarnessError("bun-sqlite", "provision", "Failed to provision the Bun SQLite test driver.", cause)
  ),
  Effect.withSpan("SqlTest.BunSqliteTestDriver.build")
);

/**
 * Fresh Bun SQLite integration-test driver backed by a scoped temp directory.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const BunSqliteTestDriver: SqlTestDriver<
  void,
  FileSystem.FileSystem | Path.Path | SqlClient.SqlClient | TestDatabaseInfo,
  SqlClient.SqlClient
> = {
  makeLayer: () => Layer.unwrap(buildBunSqliteLayer),
  name: "bun-sqlite",
  sqlClient: SqlClient.SqlClient,
};

const buildNodeSqliteLayer = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const tempDir = yield* fs
    .makeTempDirectoryScoped({ prefix: "beep-sql-test-" })
    .pipe(
      Effect.mapError((cause) =>
        toHarnessError("node-sqlite", "provision", "Failed to create a temporary SQLite test directory.", cause)
      )
    );
  const databasePath = path.join(tempDir, "test.db");

  return Layer.mergeAll(
    NodeFileSystem.layer,
    NodePath.layer,
    NodeSqliteClient.layer({ filename: databasePath }),
    Layer.succeed(TestDatabaseInfo, {
      databasePath,
      driver: "node-sqlite",
      tempDir,
    } satisfies TestDatabaseInfoShape)
  );
}).pipe(
  Effect.mapError((cause) =>
    S.is(SqlTestHarnessError)(cause)
      ? cause
      : toHarnessError("node-sqlite", "provision", "Failed to provision the Node SQLite test driver.", cause)
  ),
  Effect.provide([NodeFileSystem.layer, NodePath.layer]),
  Effect.withSpan("SqlTest.NodeSqliteTestDriver.build")
);

/**
 * Fresh Node SQLite integration-test driver backed by a scoped temp directory.
 *
 * @category Configuration
 * @since 0.0.0
 */
export const NodeSqliteTestDriver: SqlTestDriver<
  void,
  FileSystem.FileSystem | Path.Path | SqlClient.SqlClient | NodeSqliteClient.SqliteClient | TestDatabaseInfo,
  SqlClient.SqlClient
> = {
  makeLayer: () => Layer.unwrap(buildNodeSqliteLayer),
  name: "node-sqlite",
  sqlClient: SqlClient.SqlClient,
};
