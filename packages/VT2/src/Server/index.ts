import { $I as $RootId } from "@beep/identity/packages";
import {
  SidecarBadRequestPayload,
  SidecarBootstrap,
  SidecarBootstrapStdoutEvent,
  type SidecarHealthStatus,
  SidecarInternalErrorPayload,
  SidecarNotFoundPayload,
} from "@beep/runtime-protocol";
import {
  FilePath,
  NonEmptyTrimmedStr,
  NonNegativeInt,
  TaggedErrorClass,
  UUID,
} from "@beep/schema";
import * as BunHttpServer from "@effect/platform-bun/BunHttpServer";
import * as BunServices from "@effect/platform-bun/BunServices";
import * as SqliteClient from "@effect/sql-sqlite-bun/SqliteClient";
import { Cause, Config, DateTime, Deferred, Effect, Fiber, FileSystem, Layer, Match, Path, Ref } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import * as SqlClient from "effect/unstable/sql/SqlClient";
import type { CreateVt2DocumentInput } from "../protocol.js";
import { Vt2ControlPlaneApi, Vt2Document } from "../protocol.js";

const $I = $RootId.create("VT2/Server/index");
const defaultHost = "127.0.0.1";
const defaultPort = 8790;
const repoRootMarkers: ReadonlyArray<string> = [".git", "bun.lock"];
const bootstrapStdoutJson = S.fromJsonString(SidecarBootstrapStdoutEvent);
const encodeBootstrapStdoutJson = S.encodeUnknownEffect(bootstrapStdoutJson);

const SidecarPort = NonNegativeInt.pipe(
  S.check(S.isGreaterThan(0)),
  S.annotate(
    $I.annote("SidecarPort", {
      description: "Configured TCP port for the VT2 sidecar runtime.",
    })
  )
);

/**
 * VT2 runtime configuration.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class Vt2RuntimeConfig extends S.Class<Vt2RuntimeConfig>($I`Vt2RuntimeConfig`)(
  {
    host: S.String,
    port: SidecarPort,
    appDataDir: FilePath,
    sessionId: S.String,
    version: S.String,
  },
  $I.annote("Vt2RuntimeConfig", {
    description: "Startup configuration for the VT2 sqlite-backed sidecar runtime.",
  })
) {}

/**
 * VT2 runtime error.
 *
 * @since 0.0.0
 * @category Errors
 */
class Vt2RuntimeErrorData extends TaggedErrorClass<Vt2RuntimeErrorData>($I`Vt2RuntimeError`)(
  "Vt2RuntimeError",
  {
    message: S.String,
    status: S.Number,
    cause: S.OptionFromOptionalKey(S.String),
  },
  $I.annote("Vt2RuntimeError", {
    description: "Typed error for VT2 bootstrap, sqlite, and HTTP workflows.",
  })
) {}

export type Vt2RuntimeError = InstanceType<typeof Vt2RuntimeErrorData>;

export const makeVt2RuntimeError = (message: string, status: number, cause?: unknown) =>
  new Vt2RuntimeErrorData({
    message,
    status,
    cause: O.fromUndefinedOr(cause).pipe(O.map((value) => (P.isString(value) ? value : "vt2-runtime-cause"))),
  });

const toRuntimeError = makeVt2RuntimeError;

class PackageJsonVersion extends S.Class<PackageJsonVersion>($I`PackageJsonVersion`)({
  version: S.String,
}) {}

class Vt2DocumentRow extends S.Class<Vt2DocumentRow>($I`Vt2DocumentRow`)(
  {
    id: UUID,
    title: NonEmptyTrimmedStr,
    body: S.String,
    created_at: S.DateTimeUtcFromMillis,
  },
  $I.annote("Vt2DocumentRow", {
    description: "SQLite row shape for persisted VT2 documents.",
  })
) {}

const decodeVt2DocumentRow = S.decodeUnknownEffect(Vt2DocumentRow);

/**
 * Bun runtime services used by VT2.
 *
 * @since 0.0.0
 * @category Layers
 */
export const bunLayer = BunServices.layer;

/**
 * SQLite client layer for VT2.
 *
 * @since 0.0.0
 * @category Layers
 */
export const sqliteLayer = (config: Vt2RuntimeConfig) =>
  SqliteClient.layer({
    filename: `${config.appDataDir}/vt2.sqlite`,
  });

type Vt2Store = {
  readonly bootstrap: Effect.Effect<SidecarBootstrap, Vt2RuntimeError>;
  readonly listDocuments: Effect.Effect<ReadonlyArray<Vt2Document>, Vt2RuntimeError>;
  readonly getDocument: (documentId: string) => Effect.Effect<Vt2Document, Vt2RuntimeError>;
  readonly createDocument: (input: CreateVt2DocumentInput) => Effect.Effect<Vt2Document, Vt2RuntimeError>;
};

const normalizeOptionalText = (value: O.Option<string>) =>
  value.pipe(O.map(Str.trim), O.flatMap(O.liftPredicate(Str.isNonEmpty)));

const internalRunnerHost = (host: string): string =>
  Match.value(host).pipe(
    Match.when("0.0.0.0", () => "127.0.0.1"),
    Match.when("::", () => "::1"),
    Match.orElse(() => host)
  );

const makeBootstrap = (config: Vt2RuntimeConfig, startedAt: DateTime.Utc, status: typeof SidecarHealthStatus.Type) =>
  new SidecarBootstrap({
    sessionId: config.sessionId,
    host: config.host,
    port: config.port,
    baseUrl: `http://${internalRunnerHost(config.host)}:${config.port}`,
    pid: NonNegativeInt.make(process.pid),
    version: config.version,
    status,
    startedAt,
  });

const findRepoRootOrStart = Effect.fn("Vt2Runtime.findRepoRootOrStart")(function* (startDirectory: string) {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const resolvedStartDirectory = path.resolve(startDirectory);

  const search = Effect.fn("Vt2Runtime.searchRepoRoot")(function* (currentDirectory: string): Effect.fn.Return<string> {
    const markerExists = yield* Effect.forEach(repoRootMarkers, (marker) =>
      fs.exists(path.join(currentDirectory, marker)).pipe(Effect.orElseSucceed(() => false))
    ).pipe(Effect.map(A.some((exists) => exists)));

    return yield* Match.value(markerExists).pipe(
      Match.when(true, () => Effect.succeed(currentDirectory)),
      Match.orElse(() => {
        const parentDirectory = path.dirname(currentDirectory);

        return Match.value(parentDirectory === currentDirectory).pipe(
          Match.when(true, () => Effect.succeed(resolvedStartDirectory)),
          Match.orElse(() => search(parentDirectory))
        );
      })
    );
  });

  return yield* search(resolvedStartDirectory);
});

const resolveVt2AppDataDir = Effect.fn("Vt2Runtime.resolveAppDataDir")(function* (appDataDir: O.Option<string>) {
  const path = yield* Path.Path;

  return yield* O.match(appDataDir, {
    onNone: () =>
      findRepoRootOrStart(process.cwd()).pipe(Effect.map((repoRoot) => path.resolve(repoRoot, ".beep/vt2"))),
    onSome: (configuredAppDataDir) => Effect.succeed(path.resolve(configuredAppDataDir)),
  });
});

const resolveVt2Version = Effect.fn("Vt2Runtime.resolveVersion")(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const packageJsonVersionJson = S.fromJsonString(PackageJsonVersion);
  const packageJsonPath = path.resolve(process.cwd(), "package.json");

  return yield* fs.readFileString(packageJsonPath).pipe(
    Effect.flatMap(S.decodeUnknownEffect(packageJsonVersionJson)),
    Effect.map((pkg) => pkg.version),
    Effect.orElseSucceed(() => "0.0.0")
  );
});

const hasMessage = (
  input: unknown
): input is {
  readonly message: string;
} => P.isObject(input) && P.hasProperty(input, "message") && P.isString(input.message);

const matchUnknownMessage = (input: unknown): string => {
  if (P.isError(input)) {
    return input.message;
  }

  if (hasMessage(input)) {
    return input.message;
  }

  return "VT2 request failed.";
};

const toControlPlanePayload = (
  cause: Cause.Cause<unknown>
): SidecarBadRequestPayload | SidecarNotFoundPayload | SidecarInternalErrorPayload => {
  const error = Cause.squash(cause);

  if (P.isTagged("SchemaError")(error) || P.isTagged("HttpBodyError")(error) || P.isTagged("HttpServerError")(error)) {
    return new SidecarBadRequestPayload({
      message: matchUnknownMessage(error),
      status: 400,
    });
  }

  if (S.is(Vt2RuntimeErrorData)(error)) {
    if (error.status === 400) {
      return new SidecarBadRequestPayload({
        message: error.message,
        status: 400,
      });
    }

    if (error.status === 404) {
      return new SidecarNotFoundPayload({
        message: error.message,
        status: 404,
      });
    }
  }

  return new SidecarInternalErrorPayload({
    message: matchUnknownMessage(error),
    status: 500,
  });
};

const makeDocument = (row: Vt2DocumentRow) =>
  new Vt2Document({
    id: row.id,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
  });

const makeVt2Store = Effect.fn("Vt2Store.make")(function* (config: Vt2RuntimeConfig, startedAt: DateTime.Utc) {
  const sql = yield* SqlClient.SqlClient;
  const documentsTable = sql("vt2_documents");

  const initializeTables = Effect.fn("Vt2Store.initializeTables")(function* (): Effect.fn.Return<
    void,
    Vt2RuntimeError
  > {
    yield* sql`PRAGMA busy_timeout = 5000`.pipe(
      Effect.mapError((cause) => toRuntimeError("Failed to configure the VT2 sqlite busy timeout.", 500, cause))
    );

    yield* sql`
      CREATE TABLE IF NOT EXISTS ${documentsTable} (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `.pipe(Effect.mapError((cause) => toRuntimeError("Failed to create the VT2 documents table.", 500, cause)));
  });

  const listDocuments: Effect.Effect<ReadonlyArray<Vt2Document>, Vt2RuntimeError> = Effect.gen(function* () {
    const rows = yield* sql<Vt2DocumentRow>`
      SELECT id, title, body, created_at
      FROM ${documentsTable}
      ORDER BY created_at DESC
    `.pipe(Effect.mapError((cause) => toRuntimeError("Failed to list VT2 documents.", 500, cause)));

    return yield* Effect.forEach(rows, (row) =>
      decodeVt2DocumentRow(row).pipe(
        Effect.map(makeDocument),
        Effect.mapError((cause) => toRuntimeError("Failed to decode persisted VT2 documents.", 500, cause))
      )
    );
  });

  const getDocument = Effect.fn("Vt2Store.getDocument")(function* (
    documentId: string
  ): Effect.fn.Return<Vt2Document, Vt2RuntimeError> {
    const rows = yield* sql<Vt2DocumentRow>`
      SELECT id, title, body, created_at
      FROM ${documentsTable}
      WHERE id = ${documentId}
      LIMIT 1
    `.pipe(Effect.mapError((cause) => toRuntimeError(`Failed to load VT2 document "${documentId}".`, 500, cause)));

    const row = yield* O.match(A.head(rows), {
      onNone: () =>
        Effect.fail(
          new Vt2RuntimeErrorData({
            message: `Document "${documentId}" was not found.`,
            status: 404,
            cause: O.none(),
          })
        ),
      onSome: Effect.succeed,
    });

    return yield* decodeVt2DocumentRow(row).pipe(
      Effect.map(makeDocument),
      Effect.mapError((cause) => toRuntimeError(`Failed to decode VT2 document "${documentId}".`, 500, cause))
    );
  });

  const createDocument = Effect.fn("Vt2Store.createDocument")(function* (
    input: CreateVt2DocumentInput
  ): Effect.fn.Return<Vt2Document, Vt2RuntimeError> {
    const createdAt = yield* DateTime.now;
    const row = new Vt2DocumentRow({
      id: UUID.make(crypto.randomUUID()),
      title: input.title,
      body: input.body,
      created_at: createdAt,
    });

    yield* sql`
      INSERT INTO ${documentsTable} (id, title, body, created_at)
      VALUES (${row.id}, ${row.title}, ${row.body}, ${DateTime.toEpochMillis(row.created_at)})
    `.pipe(Effect.mapError((cause) => toRuntimeError("Failed to create a VT2 document.", 500, cause)));

    return makeDocument(row);
  });

  yield* initializeTables();

  return {
    bootstrap: Effect.succeed(makeBootstrap(config, startedAt, "healthy")),
    listDocuments,
    getDocument,
    createDocument,
  } satisfies Vt2Store;
});

const handleInternalControlPlane = <A>(effect: Effect.Effect<A, Vt2RuntimeError>) =>
  effect.pipe(
    Effect.catchCause((cause) =>
      Effect.fail(
        new SidecarInternalErrorPayload({
          message: matchUnknownMessage(Cause.squash(cause)),
          status: 500,
        })
      )
    )
  );

const handleResourceControlPlane = <A>(effect: Effect.Effect<A, Vt2RuntimeError>) =>
  effect.pipe(Effect.catchCause((cause) => Effect.fail(toControlPlanePayload(cause))));

const emitBootstrapStdoutLine = Effect.fn("Vt2Runtime.emitBootstrapStdoutLine")(function* (
  config: Vt2RuntimeConfig,
  startedAt: DateTime.Utc
) {
  const bootstrap = makeBootstrap(config, startedAt, "healthy");
  const encoded = yield* encodeBootstrapStdoutJson(
    new SidecarBootstrapStdoutEvent({
      type: "bootstrap",
      sessionId: bootstrap.sessionId,
      host: bootstrap.host,
      port: bootstrap.port,
      baseUrl: bootstrap.baseUrl,
      pid: bootstrap.pid,
      version: bootstrap.version,
      status: bootstrap.status,
      startedAt: DateTime.toEpochMillis(bootstrap.startedAt),
    })
  ).pipe(Effect.mapError((cause) => toRuntimeError("Failed to encode the VT2 bootstrap line.", 500, cause)));

  yield* Effect.sync(() => {
    process.stdout.write(`${encoded}\n`);
  });
});

const controlPlaneHandlersLayer = (config: Vt2RuntimeConfig, startedAt: DateTime.Utc) =>
  Layer.unwrap(
    Effect.gen(function* () {
      const store = yield* makeVt2Store(config, startedAt);

      return Layer.mergeAll(
        HttpApiBuilder.group(Vt2ControlPlaneApi, "system", (handlers) =>
          handlers.handle("health", () => handleInternalControlPlane(store.bootstrap))
        ),
        HttpApiBuilder.group(Vt2ControlPlaneApi, "documents", (handlers) =>
          handlers
            .handle("listDocuments", () => handleInternalControlPlane(store.listDocuments))
            .handle("getDocument", ({ params }) => handleResourceControlPlane(store.getDocument(params.documentId)))
            .handle("createDocument", ({ payload }) => handleInternalControlPlane(store.createDocument(payload)))
        )
      );
    })
  ).pipe(Layer.provide(sqliteLayer(config).pipe(Layer.provide(bunLayer))));

const sidecarLayer = (config: Vt2RuntimeConfig, startedAt: DateTime.Utc) => {
  const apiLayer = HttpApiBuilder.layer(Vt2ControlPlaneApi).pipe(
    Layer.provide(controlPlaneHandlersLayer(config, startedAt))
  );

  return HttpRouter.serve(apiLayer, {
    disableListenLog: true,
    disableLogger: true,
  }).pipe(
    Layer.provideMerge(
      Layer.fresh(
        BunHttpServer.layer({
          hostname: config.host,
          port: config.port,
        })
      )
    )
  );
};

const launchVt2Sidecar = (config: Vt2RuntimeConfig, startedAt: DateTime.Utc) =>
  Layer.launch(Layer.fresh(sidecarLayer(config, startedAt))).pipe(
    Effect.mapError((cause) => toRuntimeError("Failed to launch the VT2 sidecar.", 500, cause))
  );

/**
 * Run the VT2 sidecar until shutdown is requested.
 *
 * @param config {Vt2RuntimeConfig} VT2 runtime configuration.
 * @returns {Effect.Effect<void, Vt2RuntimeError>} Long-lived sidecar process effect.
 *
 * @since 0.0.0
 * @category DomainLogic
 */
export const runVt2Runtime = Effect.fn("Vt2Runtime.run")(function* (config: Vt2RuntimeConfig) {
  const startedAt = yield* DateTime.now;
  const shutdownRequested = yield* Ref.make(false);
  const shutdownDeferred = yield* Deferred.make<void>();

  const requestShutdown = Effect.fn("Vt2Runtime.requestShutdown")(function* () {
    const alreadyRequested = yield* Ref.getAndSet(shutdownRequested, true);

    if (alreadyRequested) {
      return;
    }

    yield* Deferred.succeed(shutdownDeferred, void 0).pipe(Effect.ignore);
  });
  const services = yield* Effect.context<never>();
  const runRequestShutdown = Effect.runForkWith(services);

  yield* Effect.acquireRelease(
    Effect.sync(() => {
      const handleSignal = () => {
        void runRequestShutdown(requestShutdown());
      };

      process.on("SIGINT", handleSignal);
      process.on("SIGTERM", handleSignal);

      return handleSignal;
    }),
    (handleSignal) =>
      Effect.sync(() => {
        process.off("SIGINT", handleSignal);
        process.off("SIGTERM", handleSignal);
      })
  );

  const serverFiber = yield* launchVt2Sidecar(config, startedAt).pipe(Effect.forkScoped);

  yield* emitBootstrapStdoutLine(config, startedAt);
  yield* Effect.raceFirst(Deferred.await(shutdownDeferred), Fiber.await(serverFiber).pipe(Effect.asVoid));
  yield* Fiber.interrupt(serverFiber);
});

/**
 * Load VT2 runtime configuration from the process environment.
 *
 * @returns {Effect.Effect<Vt2RuntimeConfig, Config.ConfigError, BunServices.BunServices>} Resolved VT2 runtime configuration.
 *
 * @since 0.0.0
 * @category Configuration
 */
export const loadVt2RuntimeConfig = Effect.fn("Vt2Runtime.loadConfig")(function* () {
  const host = yield* Config.string("BEEP_VT2_HOST").pipe(
    Config.orElse(() => Config.string("BEEP_EDITOR_HOST")),
    Config.withDefault(defaultHost)
  );
  const port = yield* Config.number("BEEP_VT2_PORT").pipe(
    Config.orElse(() => Config.number("BEEP_EDITOR_PORT")),
    Config.orElse(() => Config.number("PORT")),
    Config.withDefault(defaultPort)
  );
  const appDataDirInput = yield* Config.option(
    Config.string("BEEP_VT2_APP_DATA_DIR").pipe(Config.orElse(() => Config.string("BEEP_EDITOR_APP_DATA_DIR")))
  );
  const sessionIdOption = yield* Config.option(
    Config.string("BEEP_VT2_SESSION_ID").pipe(Config.orElse(() => Config.string("BEEP_EDITOR_SESSION_ID")))
  );
  const versionOption = yield* Config.option(
    Config.string("BEEP_VT2_VERSION").pipe(Config.orElse(() => Config.string("BEEP_EDITOR_VERSION")))
  );
  const normalizedVersion = normalizeOptionalText(versionOption);
  const sessionId = yield* O.match(sessionIdOption, {
    onNone: () => DateTime.now.pipe(Effect.map((now) => `vt2-${DateTime.toEpochMillis(now)}`)),
    onSome: Effect.succeed,
  });
  const version = yield* O.match(normalizedVersion, {
    onNone: () => resolveVt2Version(),
    onSome: Effect.succeed,
  });
  const appDataDir = yield* resolveVt2AppDataDir(appDataDirInput);

  return new Vt2RuntimeConfig({
    host,
    port: SidecarPort.make(port),
    appDataDir: FilePath.make(appDataDir),
    sessionId,
    version,
  });
});
