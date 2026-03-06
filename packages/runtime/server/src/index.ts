import { $RuntimeServerId } from "@beep/identity/packages";
import { RepoId, RunId } from "@beep/repo-memory-domain";
import { LocalRepoMemoryDriver, LocalRepoMemoryDriverConfig } from "@beep/repo-memory-drivers-local";
import { RepoMemoryServer, type RepoMemoryServerError } from "@beep/repo-memory-server";
import {
  IndexRun,
  QueryRun,
  QueryRunInput,
  RepoRegistration,
  RepoRegistrationInput,
  RepoRun,
  RunAnswerEvent,
  RunCompletedEvent,
  RunErrorEvent,
  RunProgressEvent,
  RunRetrievalPacketEvent,
  RunStreamEvent,
  SidecarBootstrap,
} from "@beep/runtime-protocol";
import { FilePath, NonNegativeInt, TaggedErrorClass } from "@beep/schema";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunHttpServer from "@effect/platform-bun/BunHttpServer";
import * as BunPath from "@effect/platform-bun/BunPath";
import { Cause, Clock, Config, Deferred, Effect, Fiber, Layer, Match, pipe, Ref, ServiceMap } from "effect";
import * as A from "effect/Array";
import * as Bool from "effect/Boolean";
import * as O from "effect/Option";
import * as Path from "effect/Path";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import * as Stream from "effect/Stream";
import * as Sse from "effect/unstable/encoding/Sse";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import * as HttpServer from "effect/unstable/http/HttpServer";
import * as HttpServerRequest from "effect/unstable/http/HttpServerRequest";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";

const $I = $RuntimeServerId.create("index");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const encodeRunStreamEventJson = S.encodeUnknownEffect(S.fromJsonString(RunStreamEvent));

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
const sidecarBootstrapResponse = HttpServerResponse.schemaJson(SidecarBootstrap);
const repoListResponse = HttpServerResponse.schemaJson(S.Array(RepoRegistration));
const repoResponse = HttpServerResponse.schemaJson(RepoRegistration);
const runListResponse = HttpServerResponse.schemaJson(S.Array(RepoRun));
const runResponse = HttpServerResponse.schemaJson(RepoRun);
const indexRunResponse = HttpServerResponse.schemaJson(IndexRun);
const queryRunResponse = HttpServerResponse.schemaJson(QueryRun);

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

export interface SidecarRuntimeShape {
  readonly bootstrap: Effect.Effect<SidecarBootstrap, SidecarRuntimeError>;
  readonly getRun: (runId: RunId) => Effect.Effect<RepoRun, SidecarRuntimeError>;
  readonly getRunEvents: (runId: RunId) => Effect.Effect<ReadonlyArray<RunStreamEvent>, SidecarRuntimeError>;
  readonly listRepos: Effect.Effect<ReadonlyArray<RepoRegistration>, SidecarRuntimeError>;
  readonly listRuns: Effect.Effect<ReadonlyArray<RepoRun>, SidecarRuntimeError>;
  readonly registerRepo: (input: RepoRegistrationInput) => Effect.Effect<RepoRegistration, SidecarRuntimeError>;
  readonly startIndexRun: (repoId: RepoId) => Effect.Effect<IndexRun, SidecarRuntimeError>;
  readonly startQueryRun: (input: QueryRunInput) => Effect.Effect<QueryRun, SidecarRuntimeError>;
}

export class SidecarRuntime extends ServiceMap.Service<SidecarRuntime, SidecarRuntimeShape>()($I`SidecarRuntime`) {
  static readonly layer = (
    config: SidecarRuntimeConfig
  ): Layer.Layer<SidecarRuntime, never, HttpServer.HttpServer | RepoMemoryServer> =>
    Layer.effect(SidecarRuntime, makeSidecarRuntime(config));
}

const makeSidecarRuntime = Effect.fn("SidecarRuntime.make")(function* (config: SidecarRuntimeConfig) {
  const repoMemoryServer = yield* RepoMemoryServer;
  const httpServer = yield* HttpServer.HttpServer;
  const startedAt = yield* Clock.currentTimeMillis;

  const toRuntimeError = (message: string, status: number, cause?: unknown): SidecarRuntimeError =>
    new SidecarRuntimeError({
      message,
      status,
      cause: O.isOption(cause) ? cause : O.fromUndefinedOr(cause),
    });

  const runtimeAnnotations = (annotations: Record<string, unknown>): Record<string, unknown> => ({
    session_id: config.sessionId,
    ...annotations,
  });

  const annotateRuntimeSpan = Effect.fn("SidecarRuntime.annotateSpan")(function* (
    annotations: Record<string, unknown>
  ) {
    yield* Effect.annotateCurrentSpan(runtimeAnnotations(annotations));
  });

  const withRuntimeLogAnnotations = <A, E, R>(
    annotations: Record<string, unknown>,
    effect: Effect.Effect<A, E, R>
  ): Effect.Effect<A, E, R> => effect.pipe(Effect.annotateLogs(runtimeAnnotations(annotations)));

  const mapServerError = <A>(effect: Effect.Effect<A, RepoMemoryServerError>) =>
    effect.pipe(Effect.mapError((error) => toRuntimeError(error.message, error.status, error.cause)));

  const toPublicAddress = Effect.fn("SidecarRuntime.toPublicAddress")(function* (address: HttpServer.Address) {
    return yield* Match.type<HttpServer.Address>().pipe(
      Match.when({ _tag: "TcpAddress" }, (tcpAddress) => {
        const rawHost = config.host === "0.0.0.0" ? "127.0.0.1" : config.host === "::" ? "::1" : config.host;
        const host = rawHost.includes(":") && !rawHost.startsWith("[") ? `[${rawHost}]` : rawHost;

        return Effect.succeed({
          baseUrl: `http://${host}:${tcpAddress.port}`,
          port: tcpAddress.port,
        });
      }),
      Match.orElse(() =>
        Effect.fail(toRuntimeError("Sidecar runtime requires a TCP address to publish a local base URL.", 500))
      )
    )(address);
  });

  const buildBootstrap = Effect.fn("SidecarRuntime.bootstrap")(function* () {
    yield* annotateRuntimeSpan({
      host: config.host,
      port: config.port,
    });

    const publicAddress = yield* toPublicAddress(httpServer.address);

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

  const bootstrap: SidecarRuntimeShape["bootstrap"] = buildBootstrap().pipe(
    Effect.withSpan("SidecarRuntime.bootstrap"),
    Effect.annotateLogs(runtimeAnnotations({}))
  );

  const getRun: SidecarRuntimeShape["getRun"] = Effect.fn("SidecarRuntime.getRun")(function* (runId) {
    yield* annotateRuntimeSpan({ run_id: runId });
    return yield* withRuntimeLogAnnotations({ run_id: runId }, mapServerError(repoMemoryServer.getRun(runId)));
  });

  const getRunEvents: SidecarRuntimeShape["getRunEvents"] = Effect.fn("SidecarRuntime.getRunEvents")(function* (runId) {
    yield* annotateRuntimeSpan({ run_id: runId });
    const run = yield* withRuntimeLogAnnotations({ run_id: runId }, mapServerError(repoMemoryServer.getRun(runId)));
    return buildRunEvents(run);
  });

  const listRepos: SidecarRuntimeShape["listRepos"] = withRuntimeLogAnnotations(
    {},
    mapServerError(repoMemoryServer.listRepos)
  ).pipe(Effect.withSpan("SidecarRuntime.listRepos"), Effect.annotateLogs(runtimeAnnotations({})));

  const listRuns: SidecarRuntimeShape["listRuns"] = withRuntimeLogAnnotations(
    {},
    mapServerError(repoMemoryServer.listRuns)
  ).pipe(Effect.withSpan("SidecarRuntime.listRuns"), Effect.annotateLogs(runtimeAnnotations({})));

  const registerRepo: SidecarRuntimeShape["registerRepo"] = Effect.fn("SidecarRuntime.registerRepo")(function* (input) {
    yield* annotateRuntimeSpan({ repo_path: input.repoPath });
    return yield* withRuntimeLogAnnotations(
      { repo_path: input.repoPath },
      mapServerError(repoMemoryServer.registerRepo(input))
    );
  });

  const startIndexRun: SidecarRuntimeShape["startIndexRun"] = Effect.fn("SidecarRuntime.startIndexRun")(
    function* (repoId) {
      yield* annotateRuntimeSpan({ repo_id: repoId });
      return yield* withRuntimeLogAnnotations(
        { repo_id: repoId },
        mapServerError(repoMemoryServer.startIndexRun(repoId))
      );
    }
  );

  const startQueryRun: SidecarRuntimeShape["startQueryRun"] = Effect.fn("SidecarRuntime.startQueryRun")(
    function* (input) {
      const annotations = {
        repo_id: input.repoId,
        question_length: input.question.length,
      };

      yield* annotateRuntimeSpan(annotations);
      return yield* withRuntimeLogAnnotations(annotations, mapServerError(repoMemoryServer.startQueryRun(input)));
    }
  );

  return {
    bootstrap,
    getRun,
    getRunEvents,
    listRepos,
    listRuns,
    registerRepo,
    startIndexRun,
    startQueryRun,
  } satisfies SidecarRuntimeShape;
});

const progressEventForRun = Match.type<RepoRun>().pipe(
  Match.when(
    { kind: "index" },
    (run) =>
      new RunProgressEvent({
        _tag: "progress",
        runId: run.id,
        phase: "indexing",
        message: `Indexed ${run.indexedFileCount} TypeScript source files.`,
        percent: O.some(decodeNonNegativeInt(100)),
        emittedAt: run.startedAt,
      })
  ),
  Match.when(
    { kind: "query" },
    (run) =>
      new RunProgressEvent({
        _tag: "progress",
        runId: run.id,
        phase: "query",
        message: "Deterministic metadata-backed query response assembled.",
        percent: O.some(decodeNonNegativeInt(100)),
        emittedAt: run.startedAt,
      })
  ),
  Match.exhaustive
);

const queryEventsForRun = (run: RepoRun, emittedAt: number): ReadonlyArray<RunStreamEvent> =>
  Match.type<RepoRun>().pipe(
    Match.when({ kind: "query" }, (queryRun) =>
      A.appendAll(
        O.match(queryRun.retrievalPacket, {
          onNone: A.empty<RunStreamEvent>,
          onSome: (packet) =>
            A.of(
              new RunRetrievalPacketEvent({
                _tag: "retrieval-packet",
                runId: queryRun.id,
                packet,
                emittedAt,
              })
            ),
        }),
        O.match(queryRun.answer, {
          onNone: A.empty<RunStreamEvent>,
          onSome: (answer) =>
            A.of(
              new RunAnswerEvent({
                _tag: "answer",
                runId: queryRun.id,
                answer,
                citations: queryRun.citations,
                emittedAt,
              })
            ),
        })
      )
    ),
    Match.orElse(() => A.empty<RunStreamEvent>())
  )(run);

const buildRunEvents = (run: RepoRun): ReadonlyArray<RunStreamEvent> => {
  const terminalAt = pipe(
    run.completedAt,
    O.getOrElse(() => run.startedAt)
  );
  const progressEvent = progressEventForRun(run);
  const queryEvents = queryEventsForRun(run, terminalAt);
  const errorEvents = O.match(run.errorMessage, {
    onNone: A.empty<RunStreamEvent>,
    onSome: (message) =>
      A.of(
        new RunErrorEvent({
          _tag: "error",
          runId: run.id,
          message,
          emittedAt: terminalAt,
        })
      ),
  });
  const baseEvents: ReadonlyArray<RunStreamEvent> = A.of(progressEvent);

  return pipe(
    baseEvents,
    A.appendAll(queryEvents),
    A.appendAll(errorEvents),
    A.append(
      new RunCompletedEvent({
        _tag: "completed",
        runId: run.id,
        status: run.status,
        emittedAt: terminalAt,
      })
    )
  );
};

const toSseStream = (events: ReadonlyArray<RunStreamEvent>) =>
  Stream.fromIterable(events).pipe(
    Stream.mapEffect((event) =>
      encodeRunStreamEventJson(event).pipe(
        Effect.map((data) =>
          Sse.encoder.write({
            _tag: "Event",
            event: event._tag,
            id: `${event.runId}:${event.emittedAt}`,
            data,
          })
        )
      )
    ),
    Stream.encodeText
  );

const hasMessage = (input: unknown): input is { readonly message: string } =>
  P.isObject(input) && P.hasProperty(input, "message") && P.isString(input.message);

const isSidecarRuntimeError = (input: unknown): input is SidecarRuntimeError => input instanceof SidecarRuntimeError;

const matchUnknownMessage = Match.type<unknown>().pipe(
  Match.when(isSidecarRuntimeError, ({ message }) => message),
  Match.when(P.isError, ({ message }) => message),
  Match.when(hasMessage, ({ message }) => message),
  Match.orElse(() => "Sidecar request failed.")
);

const matchUnknownStatus = Match.type<unknown>().pipe(
  Match.when(isSidecarRuntimeError, ({ status }) => status),
  Match.when(P.isTagged("SchemaError"), () => 400),
  Match.when(P.isTagged("HttpBodyError"), () => 400),
  Match.when(P.isTagged("HttpServerError"), () => 400),
  Match.orElse(() => 500)
);

const toSidecarErrorPayload = (cause: Cause.Cause<unknown>): SidecarErrorPayload => {
  const error = Cause.squash(cause);

  return new SidecarErrorPayload({
    message: matchUnknownMessage(error),
    status: matchUnknownStatus(error),
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
  payload: SidecarErrorPayload,
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

export const sidecarLayer = (config: SidecarRuntimeConfig): Layer.Layer<never, never, never> => {
  const respondHealth = Effect.fn("SidecarRuntime.route.health")(function* () {
    const runtime = yield* SidecarRuntime;
    const bootstrap = yield* runtime.bootstrap;
    return yield* sidecarBootstrapResponse(bootstrap);
  });

  const respondListRepos = Effect.fn("SidecarRuntime.route.listRepos")(function* () {
    const runtime = yield* SidecarRuntime;
    const repos = yield* runtime.listRepos;
    return yield* repoListResponse(repos);
  });

  const respondRegisterRepo = Effect.fn("SidecarRuntime.route.registerRepo")(function* () {
    const input = yield* HttpServerRequest.schemaBodyJson(RepoRegistrationInput);
    const runtime = yield* SidecarRuntime;
    const repo = yield* runtime.registerRepo(input);
    return yield* repoResponse(repo, { status: 201 });
  });

  const respondStartIndexRun = Effect.fn("SidecarRuntime.route.startIndexRun")(function* () {
    const params = yield* HttpRouter.schemaParams(RepoIdPathParams);
    const runtime = yield* SidecarRuntime;
    const run = yield* runtime.startIndexRun(params.repoId);
    return yield* indexRunResponse(run, { status: 201 });
  });

  const respondStartQueryRun = Effect.fn("SidecarRuntime.route.startQueryRun")(function* () {
    const input = yield* HttpServerRequest.schemaBodyJson(QueryRunInput);
    const runtime = yield* SidecarRuntime;
    const run = yield* runtime.startQueryRun(input);
    return yield* queryRunResponse(run, { status: 201 });
  });

  const respondListRuns = Effect.fn("SidecarRuntime.route.listRuns")(function* () {
    const runtime = yield* SidecarRuntime;
    const runs = yield* runtime.listRuns;
    return yield* runListResponse(runs);
  });

  const respondGetRun = Effect.fn("SidecarRuntime.route.getRun")(function* () {
    const params = yield* HttpRouter.schemaParams(RunIdPathParams);
    const runtime = yield* SidecarRuntime;
    const run = yield* runtime.getRun(params.runId);
    return yield* runResponse(run);
  });

  const respondGetRunEvents = Effect.fn("SidecarRuntime.route.getRunEvents")(function* () {
    const params = yield* HttpRouter.schemaParams(RunIdPathParams);
    const runtime = yield* SidecarRuntime;
    const events = yield* runtime.getRunEvents(params.runId);

    return HttpServerResponse.stream(toSseStream(events), {
      headers: {
        "cache-control": "no-cache",
        "content-type": "text/event-stream; charset=utf-8",
      },
    });
  });

  const routesLayer = HttpRouter.use(
    Effect.fn("SidecarRuntime.routes")(function* (router) {
      yield* router.add(
        "GET",
        "/api/v0/health",
        handleRuntimeErrors("GET", "/api/v0/health", config.sessionId, respondHealth())
      );

      yield* router.add(
        "GET",
        "/api/v0/repos",
        handleRuntimeErrors("GET", "/api/v0/repos", config.sessionId, respondListRepos())
      );

      yield* router.add(
        "POST",
        "/api/v0/repos",
        handleRuntimeErrors("POST", "/api/v0/repos", config.sessionId, respondRegisterRepo())
      );

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
        "/api/v0/runs",
        handleRuntimeErrors("GET", "/api/v0/runs", config.sessionId, respondListRuns())
      );

      yield* router.add(
        "GET",
        "/api/v0/runs/:runId",
        handleRuntimeErrors("GET", "/api/v0/runs/:runId", config.sessionId, respondGetRun())
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
  const localDriverLayer = LocalRepoMemoryDriver.layer(localDriverConfig).pipe(Layer.provide(fileSystemLayer));
  const repoMemoryLayer = RepoMemoryServer.layer.pipe(Layer.provide([localDriverLayer, fileSystemLayer]));
  const httpServerLayer = BunHttpServer.layer({ hostname: config.host, port: config.port });
  const runtimeLayer = SidecarRuntime.layer(config).pipe(Layer.provide([repoMemoryLayer, httpServerLayer]));

  return HttpRouter.serve(routesLayer, {
    disableListenLog: true,
    disableLogger: true,
  }).pipe(Layer.provide([runtimeLayer, httpServerLayer]));
};

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

      const serverFiber = yield* Layer.launch(sidecarLayer(config)).pipe(Effect.forkScoped);
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
  }).pipe(
    Effect.mapError(
      (cause) =>
        new SidecarRuntimeError({
          message: "Failed to load sidecar runtime config.",
          status: 500,
          cause: O.fromUndefinedOr(cause),
        })
    )
  );

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
