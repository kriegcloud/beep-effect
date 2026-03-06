import { $RuntimeServerId } from "@beep/identity/packages";
import { QueryRepoRunInput, RepoId, RunEventSequence, RunId } from "@beep/repo-memory-domain";
import { LocalRepoMemoryDriver, LocalRepoMemoryDriverConfig } from "@beep/repo-memory-drivers-local";
import { RepoMemoryServer, RepoMemoryServerError } from "@beep/repo-memory-server";
import {
  AnswerDraftedEvent,
  ControlPlaneApi,
  IndexRun,
  QueryRun,
  RepoRegistrationInput,
  type RepoRun,
  RetrievalPacketMaterializedEvent,
  RunAcceptedEvent,
  RunCompletedEvent,
  RunFailedEvent,
  RunInterruptedEvent,
  RunProgressUpdatedEvent,
  RunStartedEvent,
  RunStreamEvent,
  SidecarBadRequestPayload,
  SidecarBootstrap,
  SidecarInternalErrorPayload,
  SidecarNotFoundPayload,
} from "@beep/runtime-protocol";
import { FilePath, NonNegativeInt, TaggedErrorClass } from "@beep/schema";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunHttpServer from "@effect/platform-bun/BunHttpServer";
import * as BunPath from "@effect/platform-bun/BunPath";
import * as SqliteClient from "@effect/sql-sqlite-bun/SqliteClient";
import {
  Boolean as Bool,
  Cause,
  Clock,
  Config,
  type DateTime,
  Deferred,
  Effect,
  Fiber,
  FileSystem,
  Layer,
  Match,
  Path,
  pipe,
  Ref,
  Stream,
} from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Sse from "effect/unstable/encoding/Sse";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import * as HttpServer from "effect/unstable/http/HttpServer";
import * as HttpServerRequest from "effect/unstable/http/HttpServerRequest";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import { HttpApiBuilder } from "effect/unstable/httpapi";

const $I = $RuntimeServerId.create("index");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const decodeRunEventSequence = S.decodeUnknownSync(RunEventSequence);
const decodeRunId = S.decodeUnknownEffect(RunId);
const encodeRunStreamEventJson = S.encodeUnknownEffect(S.fromJsonString(RunStreamEvent));
const startedAtForRun = (run: RepoRun): DateTime.Utc =>
  pipe(
    run.startedAt,
    O.match({
      onNone: () => run.acceptedAt,
      onSome: (startedAt) => startedAt,
    })
  );
const completedAtForRun = (run: RepoRun): DateTime.Utc =>
  pipe(
    run.completedAt,
    O.match({
      onNone: () => startedAtForRun(run),
      onSome: (completedAt) => completedAt,
    })
  );

class RepoIdPathParams extends S.Class<RepoIdPathParams>($I`RepoIdPathParams`)(
  {
    repoId: RepoId,
  },
  $I.annote("RepoIdPathParams", {
    description: "Route params for repo-specific sidecar endpoints.",
  })
) {}

class RunIdPathParams extends S.Class<RunIdPathParams>($I`RunIdPathParams`)(
  {
    runId: RunId,
  },
  $I.annote("RunIdPathParams", {
    description: "Route params for run-specific sidecar endpoints.",
  })
) {}

class SidecarErrorPayload extends S.Class<SidecarErrorPayload>($I`SidecarErrorPayload`)(
  {
    message: S.String,
    status: S.Number,
  },
  $I.annote("SidecarErrorPayload", {
    description: "Typed JSON error payload returned by the local sidecar.",
  })
) {}

const sidecarErrorResponse = HttpServerResponse.schemaJson(SidecarErrorPayload);
const indexRunResponse = HttpServerResponse.schemaJson(IndexRun);
const queryRunResponse = HttpServerResponse.schemaJson(QueryRun);

/**
 * Startup configuration for the local sidecar runtime.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class SidecarRuntimeConfig extends S.Class<SidecarRuntimeConfig>($I`SidecarRuntimeConfig`)(
  {
    host: S.String,
    port: NonNegativeInt,
    appDataDir: FilePath,
    sessionId: S.String,
    version: S.String,
  },
  $I.annote("SidecarRuntimeConfig", {
    description: "Startup configuration passed from the desktop shell to the local sidecar runtime.",
  })
) {}

/**
 * Typed runtime error emitted during sidecar bootstrap and request handling.
 *
 * @since 0.0.0
 * @category Errors
 */
export class SidecarRuntimeError extends TaggedErrorClass<SidecarRuntimeError>($I`SidecarRuntimeError`)(
  "SidecarRuntimeError",
  {
    message: S.String,
    status: S.Number,
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
  },
  $I.annote("SidecarRuntimeError", {
    description: "Typed error for sidecar runtime bootstrap and HTTP operations.",
  })
) {}

const toRuntimeError = (message: string, status: number, cause?: unknown): SidecarRuntimeError =>
  new SidecarRuntimeError({
    message,
    status,
    cause: O.isOption(cause) ? cause : O.fromUndefinedOr(cause),
  });

type RuntimeBoundaryPayload = {
  readonly message: string;
  readonly status: number;
};

const progressEventForRun = (run: RepoRun): RunProgressUpdatedEvent =>
  Match.type<RepoRun>().pipe(
    Match.when(
      { kind: "index" },
      (indexRun) =>
        new RunProgressUpdatedEvent({
          kind: "progress",
          runId: indexRun.id,
          sequence: decodeRunEventSequence(3),
          emittedAt: startedAtForRun(indexRun),
          phase: "indexing",
          message: pipe(
            indexRun.indexedFileCount,
            O.match({
              onNone: () => "Repository indexing completed.",
              onSome: (count) => `Indexed ${count} TypeScript source files.`,
            })
          ),
          percent: O.some(decodeNonNegativeInt(100)),
        })
    ),
    Match.when(
      { kind: "query" },
      (queryRun) =>
        new RunProgressUpdatedEvent({
          kind: "progress",
          runId: queryRun.id,
          sequence: decodeRunEventSequence(3),
          emittedAt: startedAtForRun(queryRun),
          phase: "query",
          message: "Deterministic metadata-backed query response assembled.",
          percent: O.some(decodeNonNegativeInt(100)),
        })
    ),
    Match.exhaustive
  )(run);

const terminalEventForRun = (run: RepoRun) => {
  const emittedAt = completedAtForRun(run);

  return Match.type<RepoRun>().pipe(
    Match.when(
      { status: "failed" },
      (failedRun) =>
        new RunFailedEvent({
          kind: "failed",
          runId: failedRun.id,
          sequence: failedRun.lastEventSequence,
          emittedAt,
          message: pipe(
            failedRun.errorMessage,
            O.getOrElse(() => "Run failed.")
          ),
          run: failedRun,
        })
    ),
    Match.when(
      { status: "interrupted" },
      (interruptedRun) =>
        new RunInterruptedEvent({
          kind: "interrupted",
          runId: interruptedRun.id,
          sequence: interruptedRun.lastEventSequence,
          emittedAt,
          run: interruptedRun,
        })
    ),
    Match.orElse(
      (completedRun) =>
        new RunCompletedEvent({
          kind: "completed",
          runId: completedRun.id,
          sequence: completedRun.lastEventSequence,
          emittedAt,
          run: completedRun,
        })
    )
  )(run);
};

const buildRunEvents = (run: RepoRun): ReadonlyArray<RunStreamEvent> => {
  const startedAt = startedAtForRun(run);
  const baseEvents: Array<RunStreamEvent> = [
    new RunAcceptedEvent({
      kind: "accepted",
      runId: run.id,
      sequence: decodeRunEventSequence(1),
      emittedAt: run.acceptedAt,
      run,
    }),
    new RunStartedEvent({
      kind: "started",
      runId: run.id,
      sequence: decodeRunEventSequence(2),
      emittedAt: startedAt,
      run,
    }),
    progressEventForRun(run),
  ];

  if (run.kind === "query") {
    pipe(
      run.retrievalPacket,
      O.map((packet) =>
        baseEvents.push(
          new RetrievalPacketMaterializedEvent({
            kind: "retrieval-packet",
            runId: run.id,
            sequence: decodeRunEventSequence(4),
            emittedAt: packet.retrievedAt,
            packet,
          })
        )
      )
    );

    pipe(
      run.answer,
      O.map((answer) =>
        baseEvents.push(
          new AnswerDraftedEvent({
            kind: "answer",
            runId: run.id,
            sequence: decodeRunEventSequence(5),
            emittedAt: completedAtForRun(run),
            answer,
            citations: run.citations,
          })
        )
      )
    );
  }

  baseEvents.push(terminalEventForRun(run));
  return baseEvents;
};

const toSseStream = (events: ReadonlyArray<RunStreamEvent>) =>
  Stream.fromIterable(events).pipe(
    Stream.mapEffect((event) =>
      encodeRunStreamEventJson(event).pipe(
        Effect.map((data) =>
          Sse.encoder.write({
            _tag: "Event",
            event: event.kind,
            id: `${event.runId}:${event.sequence}`,
            data,
          })
        )
      )
    ),
    Stream.encodeText
  );

const hasMessage = (input: unknown): input is { readonly message: string } =>
  P.isObject(input) && P.hasProperty(input, "message") && P.isString(input.message);

const matchUnknownMessage = Match.type<unknown>().pipe(
  Match.when(P.isError, ({ message }) => message),
  Match.when(hasMessage, ({ message }) => message),
  Match.orElse(() => "Sidecar request failed.")
);

const matchUnknownStatus = Match.type<unknown>().pipe(
  Match.when(P.isTagged("SchemaError"), () => 400),
  Match.when(P.isTagged("HttpBodyError"), () => 400),
  Match.when(P.isTagged("HttpServerError"), () => 400),
  Match.when(S.is(RepoMemoryServerError), () => 500),
  Match.orElse(() => 500)
);

const toSidecarErrorPayload = (cause: Cause.Cause<unknown>): SidecarErrorPayload => {
  const error = Cause.squash(cause);

  return new SidecarErrorPayload({
    message: matchUnknownMessage(error),
    status: matchUnknownStatus(error),
  });
};

const toControlPlaneErrorPayload = (
  cause: Cause.Cause<unknown>
): SidecarBadRequestPayload | SidecarNotFoundPayload | SidecarInternalErrorPayload => {
  const error = Cause.squash(cause);

  if (P.isTagged("SchemaError")(error) || P.isTagged("HttpBodyError")(error) || P.isTagged("HttpServerError")(error)) {
    return new SidecarBadRequestPayload({
      message: matchUnknownMessage(error),
      status: 400,
    });
  }

  if (S.is(RepoMemoryServerError)(error) || S.is(SidecarRuntimeError)(error)) {
    const status = error.status;
    const message = error.message;

    if (status === 400) {
      return new SidecarBadRequestPayload({ message, status: 400 });
    }

    if (status === 404) {
      return new SidecarNotFoundPayload({ message, status: 404 });
    }

    return new SidecarInternalErrorPayload({ message, status: 500 });
  }

  return new SidecarInternalErrorPayload({
    message: matchUnknownMessage(error),
    status: 500,
  });
};

const firstPrettyError = (cause: Cause.Cause<unknown>): string =>
  pipe(
    Cause.prettyErrors(cause),
    A.map((error) => error.stack ?? error.message),
    A.head,
    O.getOrElse(() => Cause.pretty(cause))
  );

const logRuntimeBoundaryFailure = Effect.fn("SidecarRuntime.logBoundaryFailure")(function* (
  method: string,
  route: string,
  sessionId: string,
  payload: RuntimeBoundaryPayload,
  cause: Cause.Cause<unknown>
) {
  const interrupted = Cause.hasInterruptsOnly(cause);
  const renderedCause = Cause.pretty(cause);
  const primaryError = firstPrettyError(cause);
  const annotations = {
    session_id: sessionId,
    http_method: method,
    http_route: route,
    http_status: payload.status,
    interrupted,
  };

  yield* Effect.annotateCurrentSpan(annotations);

  return yield* Bool.match(interrupted, {
    onTrue: () =>
      Effect.logDebug({
        message: "sidecar request interrupted",
        error: primaryError,
        cause: renderedCause,
      }).pipe(Effect.annotateLogs(annotations)),
    onFalse: () =>
      Bool.match(payload.status < 500, {
        onTrue: () =>
          Effect.logWarning({
            message: "sidecar request failed",
            error: primaryError,
            cause: renderedCause,
          }).pipe(Effect.annotateLogs(annotations)),
        onFalse: () =>
          Effect.logError({
            message: "sidecar request failed",
            error: primaryError,
            cause: renderedCause,
          }).pipe(Effect.annotateLogs(annotations)),
      }),
  });
});

const handleRuntimeErrors = <A, E, R>(
  method: string,
  route: string,
  sessionId: string,
  effect: Effect.Effect<A, E, R>
) =>
  Effect.annotateCurrentSpan({
    session_id: sessionId,
    http_method: method,
    http_route: route,
  }).pipe(
    Effect.flatMap(() =>
      effect.pipe(
        Effect.annotateLogs({
          session_id: sessionId,
          http_method: method,
          http_route: route,
        }),
        Effect.withLogSpan(`${method} ${route}`)
      )
    ),
    Effect.catchCause((cause) => {
      const payload = toSidecarErrorPayload(cause);

      return logRuntimeBoundaryFailure(method, route, sessionId, payload, cause).pipe(
        Effect.flatMap(() => sidecarErrorResponse(payload, { status: payload.status }))
      );
    })
  );

const handleControlPlaneInternalErrors = <A, E, R>(
  method: string,
  route: string,
  sessionId: string,
  effect: Effect.Effect<A, E, R>
) =>
  Effect.annotateCurrentSpan({
    session_id: sessionId,
    http_method: method,
    http_route: route,
  }).pipe(
    Effect.flatMap(() =>
      effect.pipe(
        Effect.annotateLogs({
          session_id: sessionId,
          http_method: method,
          http_route: route,
        }),
        Effect.withLogSpan(`${method} ${route}`)
      )
    ),
    Effect.catchCause((cause) => {
      const payload = new SidecarInternalErrorPayload({
        message: matchUnknownMessage(Cause.squash(cause)),
        status: 500,
      });

      return logRuntimeBoundaryFailure(method, route, sessionId, payload, cause).pipe(
        Effect.flatMap(() => Effect.fail(payload))
      );
    })
  );

const handleControlPlaneErrors = <A, E, R>(
  method: string,
  route: string,
  sessionId: string,
  effect: Effect.Effect<A, E, R>
) =>
  Effect.annotateCurrentSpan({
    session_id: sessionId,
    http_method: method,
    http_route: route,
  }).pipe(
    Effect.flatMap(() =>
      effect.pipe(
        Effect.annotateLogs({
          session_id: sessionId,
          http_method: method,
          http_route: route,
        }),
        Effect.withLogSpan(`${method} ${route}`)
      )
    ),
    Effect.catchCause((cause) => {
      const payload = toControlPlaneErrorPayload(cause);

      return logRuntimeBoundaryFailure(method, route, sessionId, payload, cause).pipe(
        Effect.flatMap(() => Effect.fail(payload))
      );
    })
  );

const toPublicAddress = (config: SidecarRuntimeConfig, address: HttpServer.Address) =>
  Match.type<HttpServer.Address>().pipe(
    Match.when({ _tag: "TcpAddress" }, (tcpAddress) => {
      const rawHost = config.host === "0.0.0.0" ? "127.0.0.1" : config.host === "::" ? "::1" : config.host;
      const host = rawHost.includes(":") && !rawHost.startsWith("[") ? `[${rawHost}]` : rawHost;

      return Effect.succeed({
        baseUrl: `http://${host}:${tcpAddress.port}`,
        port: tcpAddress.port,
      });
    }),
    Match.orElse(() => Effect.fail(toRuntimeError("Sidecar runtime requires a TCP address.", 500)))
  )(address);

/**
 * Builds the live HTTP layer for the local sidecar runtime.
 *
 * @since 0.0.0
 * @category Layers
 */
export const sidecarLayer = (config: SidecarRuntimeConfig) => {
  const respondHealth = Effect.fn("SidecarRuntime.route.health")(function* () {
    const httpServer = yield* HttpServer.HttpServer;
    const startedAt = yield* Clock.currentTimeMillis;
    const publicAddress = yield* toPublicAddress(config, httpServer.address);
    return yield* S.decodeUnknownEffect(SidecarBootstrap)({
      sessionId: config.sessionId,
      host: config.host,
      port: publicAddress.port,
      baseUrl: publicAddress.baseUrl,
      pid: process.pid,
      version: config.version,
      status: "healthy",
      startedAt,
    }).pipe(Effect.mapError((cause) => toRuntimeError("Failed to encode sidecar bootstrap payload.", 500, cause)));
  });

  const respondListRepos = Effect.fn("SidecarRuntime.route.listRepos")(function* () {
    const repoMemoryServer = yield* RepoMemoryServer;
    return yield* repoMemoryServer.listRepos;
  });

  const respondRegisterRepo = Effect.fn("SidecarRuntime.route.registerRepo")(function* () {
    const input = yield* HttpServerRequest.schemaBodyJson(RepoRegistrationInput);
    const repoMemoryServer = yield* RepoMemoryServer;
    return yield* repoMemoryServer.registerRepo(input);
  });

  const respondStartIndexRun = Effect.fn("SidecarRuntime.route.startIndexRun")(function* () {
    const params = yield* HttpRouter.schemaParams(RepoIdPathParams);
    const repoMemoryServer = yield* RepoMemoryServer;
    const run = yield* repoMemoryServer.startIndexRun(params.repoId);
    return yield* indexRunResponse(run, { status: 201 });
  });

  const respondStartQueryRun = Effect.fn("SidecarRuntime.route.startQueryRun")(function* () {
    const input = yield* HttpServerRequest.schemaBodyJson(QueryRepoRunInput);
    const repoMemoryServer = yield* RepoMemoryServer;
    const run = yield* repoMemoryServer.startQueryRun(input);
    return yield* queryRunResponse(run, { status: 201 });
  });

  const respondListRuns = Effect.fn("SidecarRuntime.route.listRuns")(function* () {
    const repoMemoryServer = yield* RepoMemoryServer;
    return yield* repoMemoryServer.listRuns;
  });

  const respondGetRun = Effect.fn("SidecarRuntime.route.getRun")(function* (runId: string) {
    const repoMemoryServer = yield* RepoMemoryServer;
    const decodedRunId = yield* decodeRunId(runId);
    return yield* repoMemoryServer.getRun(decodedRunId);
  });

  const respondGetRunEvents = Effect.fn("SidecarRuntime.route.getRunEvents")(function* () {
    const params = yield* HttpRouter.schemaParams(RunIdPathParams);
    const repoMemoryServer = yield* RepoMemoryServer;
    const run = yield* repoMemoryServer.getRun(params.runId);
    const events = buildRunEvents(run);

    return HttpServerResponse.stream(toSseStream(events), {
      headers: {
        "cache-control": "no-cache",
        "content-type": "text/event-stream; charset=utf-8",
      },
    });
  });

  const controlPlaneHandlersLayer = Layer.mergeAll(
    HttpApiBuilder.group(ControlPlaneApi, "system", (handlers) =>
      handlers.handle("health", () =>
        handleControlPlaneInternalErrors("GET", "/api/v0/health", config.sessionId, respondHealth())
      )
    ),
    HttpApiBuilder.group(ControlPlaneApi, "repos", (handlers) =>
      handlers
        .handle("listRepos", () =>
          handleControlPlaneInternalErrors("GET", "/api/v0/repos", config.sessionId, respondListRepos())
        )
        .handleRaw("registerRepo", () =>
          handleControlPlaneErrors("POST", "/api/v0/repos", config.sessionId, respondRegisterRepo())
        )
    ),
    HttpApiBuilder.group(ControlPlaneApi, "runs", (handlers) =>
      handlers
        .handle("listRuns", () =>
          handleControlPlaneInternalErrors("GET", "/api/v0/runs", config.sessionId, respondListRuns())
        )
        .handle("getRun", ({ params }) =>
          handleControlPlaneErrors("GET", "/api/v0/runs/:runId", config.sessionId, respondGetRun(params.runId))
        )
    )
  );

  const controlPlaneApiLayer = HttpApiBuilder.layer(ControlPlaneApi).pipe(Layer.provide(controlPlaneHandlersLayer));

  const runExecutionRoutesLayer = HttpRouter.use(
    Effect.fn("SidecarRuntime.routes")(function* (router) {
      yield* router.add(
        "POST",
        "/api/v0/repos/:repoId/index-runs",
        handleRuntimeErrors("POST", "/api/v0/repos/:repoId/index-runs", config.sessionId, respondStartIndexRun())
      );

      yield* router.add(
        "POST",
        "/api/v0/query-runs",
        handleRuntimeErrors("POST", "/api/v0/query-runs", config.sessionId, respondStartQueryRun())
      );

      yield* router.add(
        "GET",
        "/api/v0/runs/:runId/events",
        handleRuntimeErrors("GET", "/api/v0/runs/:runId/events", config.sessionId, respondGetRunEvents())
      );
    })
  );

  const localDriverConfig = new LocalRepoMemoryDriverConfig({ appDataDir: config.appDataDir });
  const fileSystemLayer = Layer.mergeAll(BunFileSystem.layer, BunPath.layer);
  const sqliteLayer = Layer.unwrap(
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem;
      const path = yield* Path.Path;
      yield* fs.makeDirectory(config.appDataDir, { recursive: true });
      return SqliteClient.layer({
        filename: path.join(config.appDataDir, "repo-memory.sqlite"),
      });
    }).pipe(Effect.provide(fileSystemLayer))
  );
  const localDriverLayer = LocalRepoMemoryDriver.layer(localDriverConfig).pipe(
    Layer.provide([fileSystemLayer, sqliteLayer])
  );
  const repoMemoryLayer = RepoMemoryServer.layer.pipe(Layer.provide([localDriverLayer, fileSystemLayer]));
  const httpServerLayer = BunHttpServer.layer({ hostname: config.host, port: config.port });
  const routesLayer = Layer.mergeAll(controlPlaneApiLayer, runExecutionRoutesLayer);

  return HttpRouter.serve(routesLayer, {
    disableListenLog: true,
    disableLogger: true,
  }).pipe(Layer.provide([repoMemoryLayer, httpServerLayer]));
};

/**
 * Runs the sidecar runtime until shutdown is requested.
 *
 * @since 0.0.0
 * @category Constructors
 */
export const runSidecarRuntime = Effect.fn("SidecarRuntime.run")(function* (config: SidecarRuntimeConfig) {
  const runtimeAnnotations = {
    session_id: config.sessionId,
    host: config.host,
    port: config.port,
  };

  return yield* Effect.scoped(
    Effect.gen(function* () {
      yield* Effect.annotateCurrentSpan(runtimeAnnotations);

      const shutdownRequested = yield* Ref.make(false);
      const shutdownDeferred = yield* Deferred.make<void>();

      const requestShutdown = Effect.fn("SidecarRuntime.requestShutdown")(function* () {
        const alreadyRequested = yield* Ref.getAndSet(shutdownRequested, true);
        if (alreadyRequested) {
          return;
        }

        yield* Effect.logInfo({
          message: "repo-memory sidecar shutdown requested",
        }).pipe(Effect.annotateLogs(runtimeAnnotations));
        yield* Deferred.succeed(shutdownDeferred, void 0).pipe(Effect.ignore);
      });

      yield* Effect.acquireRelease(
        Effect.sync(() => {
          const handleSignal = () => {
            Effect.runFork(requestShutdown());
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

      const serverFiber = yield* Layer.launch(sidecarLayer(config)).pipe(
        Effect.mapError((cause) => toRuntimeError("Failed to launch sidecar runtime.", 500, cause)),
        Effect.forkScoped
      );
      const advertisedHost = config.host === "0.0.0.0" ? "127.0.0.1" : config.host === "::" ? "::1" : config.host;

      yield* Effect.logInfo({
        message: "repo-memory sidecar listening",
        base_url: `http://${advertisedHost}:${config.port}`,
        app_data_dir: config.appDataDir,
      }).pipe(Effect.annotateLogs(runtimeAnnotations));

      yield* Effect.raceFirst(Deferred.await(shutdownDeferred), Fiber.await(serverFiber).pipe(Effect.asVoid));
      yield* Fiber.interrupt(serverFiber);
    }).pipe(Effect.annotateLogs(runtimeAnnotations), Effect.withSpan("SidecarRuntime.runScoped"))
  );
});

/**
 * Loads sidecar runtime configuration from environment defaults.
 *
 * @since 0.0.0
 * @category Constructors
 */
export const loadSidecarRuntimeConfig = Effect.fn("SidecarRuntime.loadConfig")(function* () {
  const path = yield* Path.Path;
  const host = yield* Config.string("BEEP_REPO_MEMORY_HOST").pipe(Config.withDefault("127.0.0.1"));
  const port = yield* Config.number("BEEP_REPO_MEMORY_PORT").pipe(Config.withDefault(8788));
  const appDataDirInput = yield* Config.string("BEEP_REPO_MEMORY_APP_DATA_DIR").pipe(
    Config.withDefault(".beep/repo-memory")
  );
  const sessionIdOption = yield* Config.option(Config.string("BEEP_REPO_MEMORY_SESSION_ID"));
  const sessionId = yield* pipe(
    sessionIdOption,
    O.match({
      onNone: () => Clock.currentTimeMillis.pipe(Effect.map((now) => `sidecar-${now}`)),
      onSome: Effect.succeed,
    })
  );
  const version = yield* Config.string("BEEP_REPO_MEMORY_VERSION").pipe(Config.withDefault("0.0.0"));
  const appDataDir = path.resolve(appDataDirInput);

  const config = yield* S.decodeUnknownEffect(SidecarRuntimeConfig)({
    host,
    port,
    appDataDir,
    sessionId,
    version,
  }).pipe(Effect.mapError((cause) => toRuntimeError("Failed to load sidecar runtime config.", 500, cause)));

  yield* Effect.annotateCurrentSpan({
    session_id: config.sessionId,
    host: config.host,
    port: config.port,
  });

  yield* Effect.logDebug({
    message: "sidecar runtime config loaded",
    session_id: config.sessionId,
    host: config.host,
    port: config.port,
    app_data_dir: config.appDataDir,
  }).pipe(Effect.annotateLogs({ component: "sidecar-config" }));

  return config;
});
