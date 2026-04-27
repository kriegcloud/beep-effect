/**
 * SQL integration-test harness helpers.
 * @module
 * @since 0.0.0
 */

import { $TestUtilsId } from "@beep/identity/packages";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import { PgClient } from "@effect/sql-pg";
import { SqliteClient as NodeSqliteClient } from "@effect/sql-sqlite-node";
import { Context, Duration, Effect, FileSystem, Layer, Path, Redacted } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import type { StartedTestContainer } from "testcontainers";

const $I = $TestUtilsId.create("SqlTest");
const PgliteImageName = "beep/pglite-testcontainers:0.4.5";
const PgliteDockerContextUrl = new URL("../docker/pglite", import.meta.url);
const PgliteHealthCheckCommand =
  "node -e \"const { Client } = require('pg'); const client = new Client({ host: '127.0.0.1', port: Number(process.env.PGPORT || '5432'), database: process.env.PGDATABASE, user: process.env.PGUSER, password: process.env.PGPASSWORD, ssl: false }); client.connect().then(() => client.query('select 1')).then(() => client.end()).catch((cause) => { console.error(cause); process.exit(1); });\"";

const SqlTestHarnessPhase = LiteralKit(["provision", "migrate", "seed", "teardown"]).annotate(
  $I.annote("SqlTestHarnessPhase", {
    description: "Lifecycle phases for reusable SQL integration-test harness failures.",
  })
);

const TestDatabaseDriver = LiteralKit(["bun-sqlite", "node-sqlite", "pglite-testcontainers"]).annotate(
  $I.annote("TestDatabaseDriver", {
    description: "Driver identifier for reusable SQL integration-test harnesses.",
  })
);

/**
 * Runtime metadata for an ephemeral integration-test database instance.
 *
 * @example
 * ```ts
 * import { TestDatabaseInfoShape } from "@beep/test-utils"
 * import * as O from "effect/Option"
 * const info = new TestDatabaseInfoShape({
 *   connectionUri: O.none(),
 *   containerId: O.none(),
 *   database: O.none(),
 *   databasePath: O.some("/tmp/test.db"),
 *   driver: "node-sqlite",
 *   host: O.none(),
 *   port: O.none(),
 *   tempDir: O.some("/tmp"),
 *   username: O.none()
 * })
 * void info.databasePath
 * ```
 * @category models
 * @since 0.0.0
 */
export class TestDatabaseInfoShape extends S.Class<TestDatabaseInfoShape>($I`TestDatabaseInfoShape`)(
  {
    connectionUri: S.Option(S.String),
    containerId: S.Option(S.String),
    database: S.Option(S.String),
    databasePath: S.Option(S.String),
    driver: TestDatabaseDriver,
    host: S.Option(S.String),
    port: S.Option(S.Number),
    tempDir: S.Option(S.String),
    username: S.Option(S.String),
  },
  $I.annote("TestDatabaseInfoShape", {
    description: "Runtime metadata for an ephemeral integration-test database instance.",
  })
) {}

/**
 * Runtime configuration for the PGLite Testcontainers SQL test driver.
 *
 * @example
 * ```ts
 * import { PgliteTestcontainersTestDriverConfig } from "@beep/test-utils"
 * const config = new PgliteTestcontainersTestDriverConfig({})
 * void config.maxConnections
 * ```
 * @category models
 * @since 0.0.0
 */
export class PgliteTestcontainersTestDriverConfig extends S.Class<PgliteTestcontainersTestDriverConfig>(
  $I`PgliteTestcontainersTestDriverConfig`
)(
  {
    database: S.String.pipe(
      S.withConstructorDefault(Effect.succeed("postgres")),
      S.withDecodingDefaultKey(Effect.succeed("postgres"))
    ),
    internalPort: S.Int.pipe(
      S.withConstructorDefault(Effect.succeed(5432)),
      S.withDecodingDefaultKey(Effect.succeed(5432))
    ),
    maxConnections: S.Int.pipe(
      S.withConstructorDefault(Effect.succeed(1)),
      S.withDecodingDefaultKey(Effect.succeed(1))
    ),
    password: S.String.pipe(
      S.withConstructorDefault(Effect.succeed("postgres")),
      S.withDecodingDefaultKey(Effect.succeed("postgres"))
    ),
    startupTimeoutMs: S.Int.pipe(
      S.withConstructorDefault(Effect.succeed(60_000)),
      S.withDecodingDefaultKey(Effect.succeed(60_000))
    ),
    username: S.String.pipe(
      S.withConstructorDefault(Effect.succeed("postgres")),
      S.withDecodingDefaultKey(Effect.succeed("postgres"))
    ),
  },
  $I.annote("PgliteTestcontainersTestDriverConfig", {
    description: "Runtime configuration for the PGLite Testcontainers SQL test driver.",
  })
) {}

/**
 * Constructor input accepted by the PGLite Testcontainers SQL test driver.
 *
 * @category models
 * @since 0.0.0
 */
export type PgliteTestcontainersTestDriverConfigInput =
  | Partial<typeof PgliteTestcontainersTestDriverConfig.Type>
  | undefined;
/**
 * Runtime metadata for an ephemeral integration-test database instance.
 *
 * @example
 * ```ts
 * import { TestDatabaseInfo } from "@beep/test-utils"
 * const key = TestDatabaseInfo
 * void key
 * ```
 * @category testing
 * @since 0.0.0
 */
export class TestDatabaseInfo extends Context.Service<TestDatabaseInfo, TestDatabaseInfoShape>()(
  $I`TestDatabaseInfo`
) {}

/**
 * Typed harness error surfaced while provisioning or preparing a test database.
 *
 * @example
 * ```ts
 * import { SqlTestHarnessError } from "@beep/test-utils"
 * import * as O from "effect/Option"
 * const error = new SqlTestHarnessError({
 *   cause: O.none(),
 *   driver: "node-sqlite",
 *   message: "setup failed",
 *   phase: "provision"
 * })
 * void error.message
 * ```
 * @category error handling
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
 * @example
 * ```ts
 * import type { SqlTestHooks } from "@beep/test-utils"
 * const hooks: SqlTestHooks = {}
 * void hooks
 * ```
 * @category models
 * @since 0.0.0
 */
export interface SqlTestHooks<MigrateError = never, SeedError = never> {
  readonly migrate?: undefined | Effect.Effect<void, MigrateError, SqlClient.SqlClient>;
  readonly seed?: undefined | Effect.Effect<void, SeedError, SqlClient.SqlClient>;
}

/**
 * Driver contract for reusable SQL integration-test layers.
 *
 * @example
 * ```ts
 * import { NodeSqliteTestDriver } from "@beep/test-utils"
 * import type { SqlTestDriver } from "@beep/test-utils"
 * type DriverName = SqlTestDriver<unknown, unknown, unknown>["name"]
 * const driverName: DriverName = NodeSqliteTestDriver.name
 * void driverName
 * ```
 * @category models
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

const makeNoNetworkInfo = (
  driver: Extract<typeof TestDatabaseDriver.Type, "bun-sqlite" | "node-sqlite">,
  databasePath: string,
  tempDir: string
): TestDatabaseInfoShape => ({
  connectionUri: O.none(),
  containerId: O.none(),
  database: O.none(),
  databasePath: O.some(databasePath),
  driver,
  host: O.none(),
  port: O.none(),
  tempDir: O.some(tempDir),
  username: O.none(),
});

const makePgliteConnectionUri = (host: string, port: number, config: PgliteTestcontainersTestDriverConfig): string => {
  const url = new URL("postgres://localhost");
  url.hostname = host;
  url.port = `${port}`;
  url.pathname = config.database;
  url.username = config.username;
  url.password = config.password;
  return url.href;
};

const makePgliteInfo = (
  container: StartedTestContainer,
  host: string,
  port: number,
  config: PgliteTestcontainersTestDriverConfig
): TestDatabaseInfoShape => ({
  connectionUri: O.some(makePgliteConnectionUri(host, port, config)),
  containerId: O.some(container.getId()),
  database: O.some(config.database),
  databasePath: O.none(),
  driver: "pglite-testcontainers",
  host: O.some(host),
  port: O.some(port),
  tempDir: O.none(),
  username: O.some(config.username),
});

const releasePgliteContainer = Effect.fn("SqlTest.releasePgliteContainer")(function* (container: StartedTestContainer) {
  yield* Effect.tryPromise({
    try: () => container.stop({ remove: true, removeVolumes: true }),
    catch: (cause) =>
      toHarnessError(
        "pglite-testcontainers",
        "teardown",
        "Failed to stop the PGLite Testcontainers SQL test driver.",
        cause
      ),
  }).pipe(
    Effect.catch(() => Effect.logWarning("Failed to stop PGLite SQL test container; ignoring teardown failure.")),
    Effect.asVoid
  );
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
 * @param options - Layer construction options, including the driver configuration, driver contract, and optional hooks.
 * @returns A fresh scoped layer that provisions the driver and runs migrate/seed hooks.
 * @example
 * ```ts
 * import { makeSqlTestLayer, NodeSqliteTestDriver } from "@beep/test-utils"
 * const layer = makeSqlTestLayer({
 *   config: undefined,
 *   driver: NodeSqliteTestDriver
 * })
 * void layer
 * ```
 * @category constructors
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

const loadTestcontainersModule = Effect.tryPromise({
  try: () => import("testcontainers"),
  catch: (cause) =>
    toHarnessError(
      "pglite-testcontainers",
      "provision",
      "Failed to load Testcontainers support for PGLite SQL tests.",
      cause
    ),
}).pipe(Effect.withSpan("SqlTest.PgliteTestcontainers.loadTestcontainers"));

const loadPgClientModule = Effect.tryPromise({
  try: () => import("@effect/sql-pg"),
  catch: (cause) =>
    toHarnessError(
      "pglite-testcontainers",
      "provision",
      "Failed to load PostgreSQL client support for PGLite SQL tests.",
      cause
    ),
}).pipe(Effect.withSpan("SqlTest.PgliteTestcontainers.loadPgClient"));

const startPgliteContainer = Effect.fn("SqlTest.startPgliteContainer")(function* (
  dockerContext: string,
  config: PgliteTestcontainersTestDriverConfig
) {
  const Testcontainers = yield* loadTestcontainersModule;
  const image = yield* Effect.tryPromise({
    try: () =>
      Testcontainers.GenericContainer.fromDockerfile(dockerContext).build(PgliteImageName, {
        deleteOnExit: false,
      }),
    catch: (cause) =>
      toHarnessError("pglite-testcontainers", "provision", "Failed to build the PGLite Testcontainers image.", cause),
  });

  return yield* Effect.acquireRelease(
    Effect.tryPromise({
      try: () =>
        image
          .withEnvironment({
            PGDATABASE: config.database,
            PGPASSWORD: config.password,
            PGPORT: `${config.internalPort}`,
            PGUSER: config.username,
          })
          .withExposedPorts(config.internalPort)
          .withHealthCheck({
            test: ["CMD-SHELL", PgliteHealthCheckCommand],
            interval: 250,
            timeout: 1_000,
            retries: 1_000,
          })
          .withStartupTimeout(config.startupTimeoutMs)
          .withWaitStrategy(
            Testcontainers.Wait.forAll([Testcontainers.Wait.forHealthCheck(), Testcontainers.Wait.forListeningPorts()])
          )
          .start(),
      catch: (cause) =>
        toHarnessError(
          "pglite-testcontainers",
          "provision",
          "Failed to start the PGLite Testcontainers SQL test driver.",
          cause
        ),
    }),
    releasePgliteContainer
  );
});

const buildPgliteTestcontainersLayer = Effect.fn("SqlTest.PgliteTestcontainersTestDriver.build")(
  function* (configInput: PgliteTestcontainersTestDriverConfigInput) {
    const config = new PgliteTestcontainersTestDriverConfig(configInput === undefined ? {} : configInput);
    const pathContext = yield* Layer.build(NodePath.layer);
    const path = Context.get(pathContext, Path.Path);
    const dockerContext = yield* path
      .fromFileUrl(PgliteDockerContextUrl)
      .pipe(
        Effect.mapError((cause) =>
          toHarnessError(
            "pglite-testcontainers",
            "provision",
            "Failed to resolve the PGLite Docker build context.",
            cause
          )
        )
      );
    const Pg = yield* loadPgClientModule;
    const container = yield* startPgliteContainer(dockerContext, config);
    const host = container.getHost();
    const port = container.getMappedPort(config.internalPort);

    return Layer.mergeAll(
      Pg.PgClient.layerFrom(
        Pg.PgClient.make({
          connectTimeout: Duration.seconds(5),
          database: config.database,
          host,
          maxConnections: config.maxConnections,
          password: Redacted.make(config.password),
          port,
          ssl: false,
          username: config.username,
        }).pipe(
          Effect.mapError((cause) =>
            toHarnessError(
              "pglite-testcontainers",
              "provision",
              "Failed to connect the Effect PostgreSQL client to the PGLite Testcontainers server.",
              cause
            )
          )
        )
      ),
      Layer.succeed(TestDatabaseInfo, makePgliteInfo(container, host, port, config))
    );
  },
  Effect.mapError((cause) =>
    S.is(SqlTestHarnessError)(cause)
      ? cause
      : toHarnessError(
          "pglite-testcontainers",
          "provision",
          "Failed to provision the PGLite Testcontainers SQL test driver.",
          cause
        )
  ),
  Effect.withSpan("SqlTest.PgliteTestcontainersTestDriver.build")
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
    Layer.succeed(TestDatabaseInfo, makeNoNetworkInfo("bun-sqlite", databasePath, tempDir))
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
 * @example
 * ```ts
 * import { BunSqliteTestDriver } from "@beep/test-utils"
 * const driverName = BunSqliteTestDriver.name
 * void driverName
 * ```
 * @category testing
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
  const context = yield* Layer.build(Layer.mergeAll(NodeFileSystem.layer, NodePath.layer));
  const fs = Context.get(context, FileSystem.FileSystem);
  const path = Context.get(context, Path.Path);
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
    Layer.succeed(TestDatabaseInfo, makeNoNetworkInfo("node-sqlite", databasePath, tempDir))
  );
}).pipe(
  Effect.mapError((cause) =>
    S.is(SqlTestHarnessError)(cause)
      ? cause
      : toHarnessError("node-sqlite", "provision", "Failed to provision the Node SQLite test driver.", cause)
  ),
  Effect.withSpan("SqlTest.NodeSqliteTestDriver.build")
);

/**
 * Fresh Node SQLite integration-test driver backed by a scoped temp directory.
 *
 * @example
 * ```ts
 * import { NodeSqliteTestDriver } from "@beep/test-utils"
 * const driverName = NodeSqliteTestDriver.name
 * void driverName
 * ```
 * @category testing
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

/**
 * Fresh PGLite integration-test driver backed by a scoped Testcontainers PostgreSQL wire-protocol server.
 *
 * @example
 * ```ts
 * import { PgliteTestcontainersTestDriver } from "@beep/test-utils"
 * const driverName = PgliteTestcontainersTestDriver.name
 * void driverName
 * ```
 * @category testing
 * @since 0.0.0
 */
export const PgliteTestcontainersTestDriver: SqlTestDriver<
  PgliteTestcontainersTestDriverConfigInput,
  PgClient.PgClient | SqlClient.SqlClient | TestDatabaseInfo,
  PgClient.PgClient
> = {
  makeLayer: (config) => Layer.unwrap(buildPgliteTestcontainersLayer(config)),
  name: "pglite-testcontainers",
  sqlClient: PgClient.PgClient,
};
