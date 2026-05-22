/**
 * SQL integration-test harness helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { randomUUID } from "node:crypto";
import { $TestUtilsId } from "@beep/identity/packages";
import { LiteralKit, TaggedErrorClass } from "@beep/schema";
import { O, Str } from "@beep/utils";
import * as NodeFileSystem from "@effect/platform-node/NodeFileSystem";
import * as NodePath from "@effect/platform-node/NodePath";
import type * as PgClient from "@effect/sql-pg/PgClient";
import { SqliteClient as NodeSqliteClient } from "@effect/sql-sqlite-node";
import { Config, Context, Duration, Effect, FileSystem, Layer, Path, pipe, Redacted, Schedule } from "effect";
import * as S from "effect/Schema";
import * as Reactivity from "effect/unstable/reactivity/Reactivity";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import { ConnectionError, SqlError } from "effect/unstable/sql/SqlError";
import type { GenericContainer, StartedTestContainer } from "testcontainers";

const $I = $TestUtilsId.create("SqlTest");
const PgliteImageName = "beep/pglite-testcontainers:0.4.5";
const PgliteDockerContextUrl = new URL("../docker/pglite", import.meta.url);
const PgliteHealthCheckCommand =
  "node -e \"const { Client } = require('pg'); const client = new Client({ host: '127.0.0.1', port: Number(process.env.PGPORT || '5432'), database: process.env.PGDATABASE, user: process.env.PGUSER, password: process.env.PGPASSWORD, ssl: false }); client.connect().then(() => client.query('select 1')).then(() => client.end()).catch((cause) => { console.error(cause); process.exit(1); });\"";
const PgliteHealthCheckIntervalMs = 1_000;
const PgExternalClientEndTimeout = Duration.seconds(1);
const PgExternalSchemaDropTimeout = Duration.seconds(10);
let pgliteImageBuild = O.none<Promise<GenericContainer>>();

const SqlTestHarnessPhase = LiteralKit(["provision", "migrate", "seed", "teardown"]).annotate(
  $I.annote("SqlTestHarnessPhase", {
    description: "Lifecycle phases for reusable SQL integration-test harness failures.",
  })
);

const TestDatabaseDriver = LiteralKit(["bun-sqlite", "node-sqlite", "pglite-testcontainers", "pg-external"]).annotate(
  $I.annote("TestDatabaseDriver", {
    description: "Driver identifier for reusable SQL integration-test harnesses.",
  })
);

const PgExternalIsolationMode = LiteralKit(["schema", "none"]).annotate(
  $I.annote("PgExternalIsolationMode", {
    description: "Isolation mode for shared external PostgreSQL SQL test drivers.",
  })
);

const PgliteTcpPort = S.Int.check(
  S.isBetween(
    {
      maximum: 65_535,
      minimum: 1,
    },
    {
      description: "A TCP port number accepted by Docker and PostgreSQL clients.",
      identifier: $I`PgliteTcpPortRangeCheck`,
      message: "PGLite TCP ports must be between 1 and 65535",
      title: "PGLite TCP Port Range",
    }
  )
).annotate(
  $I.annote("PgliteTcpPort", {
    description: "TCP port number used by the PGLite Testcontainers SQL test driver.",
  })
);

const PglitePositiveInteger = S.Int.check(
  S.isGreaterThan(0, {
    description: "A positive integer accepted by the PGLite Testcontainers SQL test driver.",
    identifier: $I`PglitePositiveIntegerCheck`,
    message: "PGLite numeric configuration values must be greater than zero",
    title: "PGLite Positive Integer",
  })
).annotate(
  $I.annote("PglitePositiveInteger", {
    description: "Positive integer used by the PGLite Testcontainers SQL test driver.",
  })
);

const PgExternalSchemaPrefix = S.String.check(
  S.isPattern(/^[A-Za-z_][A-Za-z0-9_]*$/, {
    description: "A PostgreSQL identifier-safe prefix for generated integration-test schemas.",
    identifier: $I`PgExternalSchemaPrefixPattern`,
    message: "PostgreSQL test schema prefixes must be valid unquoted identifiers",
    title: "PostgreSQL External Schema Prefix",
  })
).annotate(
  $I.annote("PgExternalSchemaPrefix", {
    description: "Identifier-safe prefix used when creating external PostgreSQL test schemas.",
  })
);

/**
 * Runtime metadata for an ephemeral integration-test database instance.
 *
 * @example
 * ```ts
 * import { TestDatabaseInfoShape } from "@beep/test-utils"
 * import * as O from "effect/Option"
 * const info = TestDatabaseInfoShape.make({
 *   connectionUri: O.none(),
 *   containerId: O.none(),
 *   database: O.none(),
 *   databasePath: O.some("/tmp/test.db"),
 *   driver: "node-sqlite",
 *   host: O.none(),
 *   port: O.none(),
 *   schema: O.none(),
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
    port: S.Option(PgliteTcpPort),
    schema: S.Option(S.String),
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
 * const config = PgliteTestcontainersTestDriverConfig.make({})
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
    internalPort: PgliteTcpPort.pipe(
      S.withConstructorDefault(Effect.succeed(5432)),
      S.withDecodingDefaultKey(Effect.succeed(5432))
    ),
    maxConnections: PglitePositiveInteger.pipe(
      S.withConstructorDefault(Effect.succeed(1)),
      S.withDecodingDefaultKey(Effect.succeed(1))
    ),
    password: S.String.pipe(
      S.withConstructorDefault(Effect.sync(randomUUID)),
      S.withDecodingDefaultKey(Effect.sync(randomUUID))
    ),
    startupTimeoutMs: PglitePositiveInteger.pipe(
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
export type PgliteTestcontainersTestDriverConfigInput = Partial<PgliteTestcontainersTestDriverConfig> | undefined;

/**
 * Runtime configuration for an externally managed PostgreSQL-compatible SQL test driver.
 *
 * @example
 * ```ts
 * import { PgExternalTestDriverConfig } from "@beep/test-utils"
 * const config = PgExternalTestDriverConfig.make({
 *   connectionUri: "postgres://postgres:postgres@127.0.0.1:5432/postgres"
 * })
 * void config.isolation
 * ```
 * @category models
 * @since 0.0.0
 */
export class PgExternalTestDriverConfig extends S.Class<PgExternalTestDriverConfig>($I`PgExternalTestDriverConfig`)(
  {
    connectTimeoutMs: PglitePositiveInteger.pipe(
      S.withConstructorDefault(Effect.succeed(5_000)),
      S.withDecodingDefaultKey(Effect.succeed(5_000))
    ),
    connectionUri: S.String,
    isolation: PgExternalIsolationMode.pipe(
      S.withConstructorDefault(Effect.succeed("schema" as const)),
      S.withDecodingDefaultKey(Effect.succeed("schema" as const))
    ),
    maxConnections: PglitePositiveInteger.pipe(
      S.withConstructorDefault(Effect.succeed(1)),
      S.withDecodingDefaultKey(Effect.succeed(1))
    ),
    schemaPrefix: PgExternalSchemaPrefix.pipe(
      S.withConstructorDefault(Effect.succeed("beep_test")),
      S.withDecodingDefaultKey(Effect.succeed("beep_test"))
    ),
    ssl: S.Literal(false).pipe(
      S.withConstructorDefault(Effect.succeed(false as const)),
      S.withDecodingDefaultKey(Effect.succeed(false as const))
    ),
  },
  $I.annote("PgExternalTestDriverConfig", {
    description: "Runtime configuration for an externally managed PostgreSQL-compatible SQL test driver.",
  })
) {}

/**
 * Constructor input accepted by the external PostgreSQL SQL test driver.
 *
 * @category models
 * @since 0.0.0
 */
export type PgExternalTestDriverConfigInput = Partial<PgExternalTestDriverConfig> | undefined;

/**
 * Mode selector for the public PGLite SQL test layer helper.
 *
 * @category models
 * @since 0.0.0
 */
export type PgliteSqlTestLayerMode = "auto" | "external" | "testcontainers";

/**
 * Options for `makePgliteSqlTestLayer`.
 *
 * @category models
 * @since 0.0.0
 */
export interface PgliteSqlTestLayerOptions<MigrateError = never, SeedError = never> {
  readonly external?: PgExternalTestDriverConfigInput;
  readonly hooks?: SqlTestHooks<MigrateError, SeedError>;
  readonly mode?: PgliteSqlTestLayerMode;
  readonly testcontainers?: PgliteTestcontainersTestDriverConfigInput;
}

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
 * const error = SqlTestHarnessError.make({
 *   cause: O.none(),
 *   driver: "node-sqlite",
 *   message: "setup failed",
 *   phase: "provision"
 * })
 * void error.message
 * ```
 * @category error-handling
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
  SqlTestHarnessError.make({
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
  schema: O.none(),
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
  schema: O.none(),
  tempDir: O.none(),
  username: O.some(config.username),
});

const databaseNameFromConnectionUri = (parsed: URL): O.Option<string> =>
  pipe(parsed.pathname, Str.replace(/^\//, ""), O.liftPredicate(Str.isNonEmpty));

const makeExternalPgInfo = (connectionUri: string, parsed: URL, schema: O.Option<string>): TestDatabaseInfoShape => ({
  connectionUri: O.some(connectionUri),
  containerId: O.none(),
  database: databaseNameFromConnectionUri(parsed),
  databasePath: O.none(),
  driver: "pg-external",
  host: pipe(parsed.hostname, O.liftPredicate(Str.isNonEmpty)),
  port: pipe(
    parsed.port,
    O.liftPredicate(Str.isNonEmpty),
    O.map((port) => Number.parseInt(port, 10))
  ),
  schema,
  tempDir: O.none(),
  username: pipe(parsed.username, O.liftPredicate(Str.isNonEmpty)),
});

/**
 * Scoped PGLite Testcontainers resource metadata.
 *
 * @example
 * ```ts
 * import type { PgliteTestcontainerResource } from "@beep/test-utils"
 * declare const resource: PgliteTestcontainerResource
 * void resource.connectionUri
 * ```
 * @category models
 * @since 0.0.0
 */
export interface PgliteTestcontainerResource {
  readonly config: PgliteTestcontainersTestDriverConfig;
  readonly connectionUri: string;
  readonly container: StartedTestContainer;
  readonly host: string;
  readonly port: number;
}

interface StartedPgliteContainer {
  readonly container: StartedTestContainer;
  readonly host: string;
  readonly port: number;
}

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

const loadPgClientModule = (driver: Extract<typeof TestDatabaseDriver.Type, "pglite-testcontainers" | "pg-external">) =>
  Effect.tryPromise({
    try: () => import("@effect/sql-pg"),
    catch: (cause) =>
      toHarnessError(driver, "provision", "Failed to load PostgreSQL client support for SQL tests.", cause),
  }).pipe(Effect.withSpan(`SqlTest.${driver}.loadPgClient`));

const loadPgModule = Effect.tryPromise({
  try: () => import("pg"),
  catch: (cause) => toHarnessError("pg-external", "provision", "Failed to load pg support for SQL tests.", cause),
}).pipe(Effect.withSpan("SqlTest.PgExternalTestDriver.loadPg"));

const PgConnectRetryPolicy = Schedule.both(Schedule.spaced(Duration.millis(250)), Schedule.recurs(20));

const decodePgliteTestcontainersTestDriverConfig = S.decodeUnknownEffect(PgliteTestcontainersTestDriverConfig);
const decodePgExternalTestDriverConfig = S.decodeUnknownEffect(PgExternalTestDriverConfig);

const makePgliteConfig = Effect.fn("SqlTest.PgliteTestcontainersTestDriver.makeConfig")(function* (
  configInput: PgliteTestcontainersTestDriverConfigInput
) {
  return yield* decodePgliteTestcontainersTestDriverConfig(configInput === undefined ? {} : configInput).pipe(
    Effect.mapError((cause) =>
      toHarnessError("pglite-testcontainers", "provision", "Invalid PGLite Testcontainers SQL test config.", cause)
    )
  );
});

const makePgExternalConfig = Effect.fn("SqlTest.PgExternalTestDriver.makeConfig")(function* (
  configInput: PgExternalTestDriverConfigInput
) {
  return yield* decodePgExternalTestDriverConfig(configInput === undefined ? {} : configInput).pipe(
    Effect.mapError((cause) =>
      toHarnessError("pg-external", "provision", "Invalid external PostgreSQL SQL test config.", cause)
    )
  );
});

const resolvePgliteDockerContext = Effect.fn("SqlTest.PgliteTestcontainers.resolveDockerContext")(function* () {
  const pathContext = yield* Layer.build(NodePath.layer);
  const path = Context.get(pathContext, Path.Path);
  return yield* path
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
});

const getPgliteImageBuild = (Testcontainers: typeof import("testcontainers"), dockerContext: string) =>
  pipe(
    pgliteImageBuild,
    O.getOrElse(() => {
      const build = Testcontainers.GenericContainer.fromDockerfile(dockerContext).build(PgliteImageName, {
        deleteOnExit: false,
      });

      pgliteImageBuild = O.some(build);
      return build;
    })
  );

const startPgliteContainer = Effect.fn("SqlTest.startPgliteContainer")(function* (
  dockerContext: string,
  config: PgliteTestcontainersTestDriverConfig
) {
  const Testcontainers = yield* loadTestcontainersModule;
  yield* Effect.tryPromise({
    try: () => getPgliteImageBuild(Testcontainers, dockerContext),
    catch: (cause) =>
      toHarnessError("pglite-testcontainers", "provision", "Failed to build the PGLite Testcontainers image.", cause),
  });

  const makeContainer = () =>
    new Testcontainers.GenericContainer(PgliteImageName)
      .withEnvironment({
        PGDATABASE: config.database,
        PGPASSWORD: config.password,
        PGPORT: `${config.internalPort}`,
        PGUSER: config.username,
      })
      .withHealthCheck({
        test: ["CMD-SHELL", PgliteHealthCheckCommand],
        interval: PgliteHealthCheckIntervalMs,
        timeout: 1_000,
        retries: Math.ceil(config.startupTimeoutMs / PgliteHealthCheckIntervalMs),
      })
      .withStartupTimeout(config.startupTimeoutMs)
      .withWaitStrategy(Testcontainers.Wait.forHealthCheck());

  const startBridgeContainer = Effect.tryPromise({
    try: (): Promise<StartedPgliteContainer> =>
      makeContainer()
        .withExposedPorts(config.internalPort)
        .start()
        .then((container) => ({
          container,
          host: container.getHost(),
          port: container.getMappedPort(config.internalPort),
        })),
    catch: (cause) =>
      toHarnessError(
        "pglite-testcontainers",
        "provision",
        "Failed to start the PGLite Testcontainers SQL test driver.",
        cause
      ),
  });

  return yield* Effect.acquireRelease(startBridgeContainer, (started) => releasePgliteContainer(started.container));
});

/**
 * Start a scoped PGLite Testcontainers PostgreSQL wire-protocol resource.
 *
 * @param configInput - Optional PGLite Testcontainers configuration.
 * @returns Scoped container metadata, including the PostgreSQL connection URI.
 * @example
 * ```ts
 * import { makePgliteTestcontainerResource } from "@beep/test-utils"
 * import { Effect } from "effect"
 * const program = Effect.scoped(makePgliteTestcontainerResource())
 * void program
 * ```
 * @category constructors
 * @since 0.0.0
 */
export const makePgliteTestcontainerResource = Effect.fn("SqlTest.makePgliteTestcontainerResource")(function* (
  configInput: PgliteTestcontainersTestDriverConfigInput = undefined
) {
  const config = yield* makePgliteConfig(configInput);
  const dockerContext = yield* resolvePgliteDockerContext();
  const started = yield* startPgliteContainer(dockerContext, config);
  const container = started.container;
  const host = started.host;
  const port = started.port;
  const connectionUri = makePgliteConnectionUri(host, port, config);

  return {
    config,
    connectionUri,
    container,
    host,
    port,
  };
});

const parsePgExternalConnectionUri = Effect.fn("SqlTest.PgExternalTestDriver.parseConnectionUri")(function* (
  connectionUri: string
) {
  const parsed = yield* Effect.try({
    try: () => new URL(connectionUri),
    catch: (cause) => toHarnessError("pg-external", "provision", "Invalid external PostgreSQL connection URI.", cause),
  });

  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    return yield* toHarnessError(
      "pg-external",
      "provision",
      "External PostgreSQL connection URI must use the postgres or postgresql protocol."
    );
  }

  return parsed;
});

const makePgExternalSchemaName = Effect.fn("SqlTest.PgExternalTestDriver.makeSchemaName")(function* (prefix: string) {
  const uuid = randomUUID();
  return `${prefix}_${pipe(uuid, Str.replaceAll("-", "_"))}`;
});

const createPgExternalSchema = Effect.fn("SqlTest.PgExternalTestDriver.createSchema")(function* (
  sql: SqlClient.SqlClient,
  schemaName: string
) {
  yield* sql`CREATE SCHEMA ${sql(schemaName)}`.pipe(
    Effect.mapError((cause) =>
      toHarnessError("pg-external", "provision", "Failed to create external PostgreSQL test schema.", cause)
    )
  );
  yield* sql`SET search_path TO ${sql(schemaName)}, public`.pipe(
    Effect.mapError((cause) =>
      toHarnessError("pg-external", "provision", "Failed to set external PostgreSQL test schema search path.", cause)
    )
  );
});

const resetPgExternalSearchPath = Effect.fn("SqlTest.PgExternalTestDriver.resetSearchPath")(function* (
  sql: SqlClient.SqlClient
) {
  yield* sql`SET search_path TO public`.pipe(
    Effect.catch(() => Effect.logWarning("Failed to reset external PostgreSQL search_path before schema teardown.")),
    Effect.asVoid
  );
});

const dropPgExternalSchema = Effect.fn("SqlTest.PgExternalTestDriver.dropSchema")(function* (
  sql: SqlClient.SqlClient,
  schemaName: string
) {
  yield* Effect.gen(function* () {
    yield* resetPgExternalSearchPath(sql);
    yield* sql`DROP SCHEMA IF EXISTS ${sql(schemaName)} CASCADE`;
  }).pipe(
    Effect.timeoutOption(PgExternalSchemaDropTimeout),
    Effect.flatMap(
      O.match({
        onNone: () => Effect.logWarning(`Timed out dropping external PostgreSQL test schema ${schemaName}.`),
        onSome: () => Effect.void,
      })
    ),
    Effect.catch(() => Effect.logWarning(`Failed to drop external PostgreSQL test schema ${schemaName}.`)),
    Effect.asVoid
  );
});

const acquirePgExternalSchema = Effect.fn("SqlTest.PgExternalTestDriver.acquireSchema")(function* (
  sql: SqlClient.SqlClient,
  schemaName: string
) {
  yield* Effect.acquireRelease(Effect.succeed(schemaName), (name) => dropPgExternalSchema(sql, name));
  yield* createPgExternalSchema(sql, schemaName);
});

const buildPgliteTestcontainersLayer = Effect.fn("SqlTest.PgliteTestcontainersTestDriver.build")(
  function* (configInput: PgliteTestcontainersTestDriverConfigInput) {
    const resource = yield* makePgliteTestcontainerResource(configInput);
    const Pg = yield* loadPgClientModule("pglite-testcontainers");

    return Layer.mergeAll(
      Pg.PgClient.layerFrom(
        Pg.PgClient.make({
          connectTimeout: Duration.seconds(5),
          database: resource.config.database,
          host: resource.host,
          maxConnections: resource.config.maxConnections,
          password: Redacted.make(resource.config.password),
          port: resource.port,
          ssl: false,
          username: resource.config.username,
        }).pipe(
          Effect.retry(PgConnectRetryPolicy),
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
      Layer.succeed(TestDatabaseInfo, makePgliteInfo(resource.container, resource.host, resource.port, resource.config))
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

const buildPgExternalLayer: (
  configInput: PgExternalTestDriverConfigInput
) => Effect.Effect<
  Layer.Layer<PgClient.PgClient | SqlClient.SqlClient | TestDatabaseInfo, SqlTestHarnessError>,
  SqlTestHarnessError,
  never
> = Effect.fn("SqlTest.PgExternalTestDriver.build")(
  function* (configInput: PgExternalTestDriverConfigInput) {
    const config = yield* makePgExternalConfig(configInput);
    const parsed = yield* parsePgExternalConnectionUri(config.connectionUri);
    const Pg = yield* loadPgClientModule("pg-external");
    const PgNative = yield* loadPgModule;

    return Layer.effectContext(
      Effect.gen(function* () {
        const reactivityContext = yield* Layer.build(Reactivity.layer);
        const reactivity = Context.get(reactivityContext, Reactivity.Reactivity);
        const client = yield* Pg.PgClient.fromClient({
          acquire: Effect.acquireRelease(
            Effect.tryPromise({
              try: () => {
                const client = new PgNative.Client({
                  connectionString: config.connectionUri,
                  connectionTimeoutMillis: config.connectTimeoutMs,
                  ssl: config.ssl,
                });
                return client
                  .connect()
                  .then(() => client.query("SELECT 1"))
                  .then(() => client);
              },
              catch: (cause) =>
                SqlError.make({
                  reason: ConnectionError.make({
                    cause,
                    message: "PgExternalTestDriver: Failed to connect",
                    operation: "connect",
                  }),
                }),
            }),
            (client) =>
              Effect.promise(() => client.end()).pipe(Effect.timeoutOption(PgExternalClientEndTimeout), Effect.asVoid)
          ),
          acquireForStream: false,
        }).pipe(
          Effect.retry(PgConnectRetryPolicy),
          Effect.provideService(Reactivity.Reactivity, reactivity),
          Effect.mapError((cause) =>
            toHarnessError(
              "pg-external",
              "provision",
              "Failed to connect the Effect PostgreSQL client to the external SQL test server.",
              cause
            )
          )
        );
        const sql = client.withoutTransforms();
        const schema =
          config.isolation === "schema" ? O.some(yield* makePgExternalSchemaName(config.schemaPrefix)) : O.none();

        yield* pipe(
          schema,
          O.match({
            onNone: () => Effect.void,
            onSome: (schemaName) => acquirePgExternalSchema(sql, schemaName),
          })
        );

        return Context.make(Pg.PgClient.PgClient, client).pipe(
          Context.add(SqlClient.SqlClient, client),
          Context.add(TestDatabaseInfo, makeExternalPgInfo(config.connectionUri, parsed, schema))
        );
      })
    );
  },
  Effect.mapError((cause) =>
    S.is(SqlTestHarnessError)(cause)
      ? cause
      : toHarnessError(
          "pg-external",
          "provision",
          "Failed to provision the external PostgreSQL SQL test driver.",
          cause
        )
  ),
  Effect.withSpan("SqlTest.PgExternalTestDriver.build")
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
  SqlClient.SqlClient
> = {
  makeLayer: (config) => Layer.unwrap(buildPgliteTestcontainersLayer(config)),
  name: "pglite-testcontainers",
  sqlClient: SqlClient.SqlClient,
};

/**
 * External PostgreSQL-compatible integration-test driver backed by a caller-managed server.
 *
 * @example
 * ```ts
 * import { PgExternalTestDriver } from "@beep/test-utils"
 * const driverName = PgExternalTestDriver.name
 * void driverName
 * ```
 * @category testing
 * @since 0.0.0
 */
export const PgExternalTestDriver: SqlTestDriver<
  PgExternalTestDriverConfigInput,
  PgClient.PgClient | SqlClient.SqlClient | TestDatabaseInfo,
  SqlClient.SqlClient
> = {
  makeLayer: (config) => Layer.unwrap(buildPgExternalLayer(config)),
  name: "pg-external",
  sqlClient: SqlClient.SqlClient,
};

const resolvePgliteExternalConfig = Effect.fn("SqlTest.resolvePgliteExternalConfig")(function* (
  config: PgExternalTestDriverConfigInput
) {
  const envConnectionUri = yield* Config.string("BEEP_TEST_DATABASE_URL").pipe(
    Config.option,
    Effect.orElseSucceed(O.none<string>)
  );
  if (config?.connectionUri !== undefined || O.isNone(envConnectionUri) || !Str.isNonEmpty(envConnectionUri.value)) {
    return config;
  }

  return {
    ...config,
    connectionUri: envConnectionUri.value,
  };
});

const shouldUseExternalPgliteLayer = (mode: PgliteSqlTestLayerMode, config: PgExternalTestDriverConfigInput): boolean =>
  mode === "external" || (mode === "auto" && config?.connectionUri !== undefined);

/**
 * Build the recommended PGLite SQL test layer for vertical-slice integration tests.
 *
 * In `auto` mode, `BEEP_TEST_DATABASE_URL` selects the cheap shared external
 * PostgreSQL driver. Without that environment variable, the helper falls back
 * to the scoped PGLite Testcontainers driver.
 *
 * @param options - Optional mode, driver configuration, and migrate/seed hooks.
 * @returns A SQL test layer backed by either the shared external PGLite server or a scoped Testcontainer.
 * @example
 * ```ts
 * import { makePgliteSqlTestLayer } from "@beep/test-utils"
 * const layer = makePgliteSqlTestLayer()
 * void layer
 * ```
 * @category constructors
 * @since 0.0.0
 */
export const makePgliteSqlTestLayer = <MigrateError = never, SeedError = never>(
  options: PgliteSqlTestLayerOptions<MigrateError, SeedError> = {}
): Layer.Layer<PgClient.PgClient | SqlClient.SqlClient | TestDatabaseInfo, SqlTestHarnessError> =>
  Layer.unwrap(
    Effect.gen(function* () {
      const mode = options.mode ?? "auto";
      const externalConfig = yield* resolvePgliteExternalConfig(options.external);

      if (shouldUseExternalPgliteLayer(mode, externalConfig)) {
        return options.hooks === undefined
          ? makeSqlTestLayer({
              config: externalConfig,
              driver: PgExternalTestDriver,
            })
          : makeSqlTestLayer({
              config: externalConfig,
              driver: PgExternalTestDriver,
              hooks: options.hooks,
            });
      }

      return options.hooks === undefined
        ? makeSqlTestLayer({
            config: options.testcontainers,
            driver: PgliteTestcontainersTestDriver,
          })
        : makeSqlTestLayer({
            config: options.testcontainers,
            driver: PgliteTestcontainersTestDriver,
            hooks: options.hooks,
          });
    })
  );
