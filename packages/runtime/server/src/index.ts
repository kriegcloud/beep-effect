import { $RuntimeServerId } from "@beep/identity/packages";
import { RunId, RunStreamFailure } from "@beep/repo-memory-model";
import {
  GroundedRetrievalService,
  IndexRepoRunWorkflow,
  QueryRepoRunWorkflow,
  RepoRunService,
  RepoRunServiceError,
  RepoRunWorkflows,
  RepoRunWorkflowsLayer,
  TypeScriptIndexService,
} from "@beep/repo-memory-runtime";
import { RepoMemorySqlConfig, RepoMemorySqlLive } from "@beep/repo-memory-sqlite";
import {
  ControlPlaneApi,
  RepoRegistrationInput,
  RepoRunRpcGroup,
  SidecarBadRequestPayload,
  SidecarBootstrap,
  SidecarInternalErrorPayload,
  SidecarNotFoundPayload,
} from "@beep/runtime-protocol";
import { FilePath, makeStatusCauseError, NonNegativeInt, StatusCauseFields, TaggedErrorClass } from "@beep/schema";
import * as BunFileSystem from "@effect/platform-bun/BunFileSystem";
import * as BunHttpClient from "@effect/platform-bun/BunHttpClient";
import * as BunHttpServer from "@effect/platform-bun/BunHttpServer";
import * as BunPath from "@effect/platform-bun/BunPath";
import * as SqliteClient from "@effect/sql-sqlite-bun/SqliteClient";
import {
  Cause,
  Config,
  DateTime,
  Deferred,
  Duration,
  Effect,
  Fiber,
  FileSystem,
  flow,
  Layer,
  Path,
  pipe,
  Ref,
} from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as ClusterWorkflowEngine from "effect/unstable/cluster/ClusterWorkflowEngine";
import * as HttpRunner from "effect/unstable/cluster/HttpRunner";
import * as RunnerAddress from "effect/unstable/cluster/RunnerAddress";
import * as RunnerHealth from "effect/unstable/cluster/RunnerHealth";
import * as Runners from "effect/unstable/cluster/Runners";
import * as ShardingConfig from "effect/unstable/cluster/ShardingConfig";
import * as SqlMessageStorage from "effect/unstable/cluster/SqlMessageStorage";
import * as SqlRunnerStorage from "effect/unstable/cluster/SqlRunnerStorage";
import * as SqlEventLogJournal from "effect/unstable/eventlog/SqlEventLogJournal";
import * as HttpEffect from "effect/unstable/http/HttpEffect";
import * as HttpMiddleware from "effect/unstable/http/HttpMiddleware";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import * as HttpServer from "effect/unstable/http/HttpServer";
import * as HttpServerRequest from "effect/unstable/http/HttpServerRequest";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import * as PrometheusMetrics from "effect/unstable/observability/PrometheusMetrics";
import * as Reactivity from "effect/unstable/reactivity/Reactivity";
import * as RpcSerialization from "effect/unstable/rpc/RpcSerialization";
import * as RpcServer from "effect/unstable/rpc/RpcServer";
import * as WorkflowProxy from "effect/unstable/workflow/WorkflowProxy";
import * as WorkflowProxyServer from "effect/unstable/workflow/WorkflowProxyServer";
import { encodeBootstrapStdoutLine, toBootstrapStdoutLine } from "./internal/BootstrapStdout.js";
import { observeHttpRequest, provideSidecarObservability } from "./internal/SidecarObservability.js";
import { loadSidecarOtlpConfig } from "./internal/SidecarRuntimeConfig.js";

const $I = $RuntimeServerId.create("index");
const decodeRunId = S.decodeUnknownEffect(RunId);
const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);

const internalRunnerHost = (host: string): string => {
  if (host === "0.0.0.0") {
    return "127.0.0.1";
  }

  if (host === "::") {
    return "::1";
  }

  return host;
};

const makeRunnerAddress = (config: SidecarRuntimeConfig) =>
  RunnerAddress.make(internalRunnerHost(config.host), config.port);

const sidecarCorsAllowedMethods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"];
const sidecarCorsAllowedHeaders = [
  "Content-Type",
  "Authorization",
  "traceparent",
  "tracestate",
  "baggage",
  "b3",
  "x-b3-traceid",
  "x-b3-spanid",
  "x-b3-parentspanid",
  "x-b3-sampled",
  "x-b3-flags",
];
const sidecarSecurityHeaders = {
  "x-content-type-options": "nosniff",
  "x-frame-options": "DENY",
  "referrer-policy": "no-referrer",
} as const;

const isLoopbackHost = (hostname: string): boolean =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "::1" ||
  hostname === "[::1]" ||
  hostname.endsWith(".localhost");

const isAllowedSidecarOrigin = (origin: string): boolean => {
  try {
    const url = new URL(origin);

    if (url.protocol === "tauri:") {
      return url.hostname === "localhost";
    }

    return (url.protocol === "http:" || url.protocol === "https:") && isLoopbackHost(url.hostname);
  } catch {
    return false;
  }
};

const setSidecarSecurityHeaders = (response: HttpServerResponse.HttpServerResponse) =>
  HttpServerResponse.setHeaders(response, sidecarSecurityHeaders);

const sidecarTransportMiddlewareLayer = HttpRouter.middleware(
  flow(
    HttpMiddleware.cors({
      allowedOrigins: isAllowedSidecarOrigin,
      allowedMethods: sidecarCorsAllowedMethods,
      allowedHeaders: sidecarCorsAllowedHeaders,
      maxAge: 86_400,
    }),
    HttpEffect.withPreResponseHandler((_request, response) => Effect.succeed(setSidecarSecurityHeaders(response)))
  ),
  {
    global: true,
  }
);

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
    otlpEnabled: S.Boolean,
    otlpBaseUrl: S.String,
    otlpResourceAttributes: S.Record(S.String, S.String),
    otlpServiceName: S.String,
    otlpServiceVersion: S.String,
    devtoolsEnabled: S.Boolean,
    devtoolsUrl: S.String,
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
  StatusCauseFields,
  $I.annote("SidecarRuntimeError", {
    description: "Typed error for sidecar runtime bootstrap and transport boundaries.",
  })
) {}

const toRuntimeError = makeStatusCauseError(SidecarRuntimeError);

const toRunStreamFailure = (error: RepoRunServiceError): RunStreamFailure =>
  new RunStreamFailure({
    message: error.message,
    status: error.status,
  });

const decodeExecutionRunId = (workflowName: string, executionId: string) =>
  decodeRunId(executionId).pipe(
    Effect.mapError(
      () =>
        new RunStreamFailure({
          message: `Workflow "${workflowName}" returned an invalid execution id "${executionId}".`,
          status: 500,
        })
    )
  );

type RuntimeBoundaryPayload = {
  readonly message: string;
  readonly status: number;
};

const hasMessage = (input: unknown): input is { readonly message: string } =>
  P.isObject(input) && P.hasProperty(input, "message") && P.isString(input.message);

const matchUnknownMessage = (input: unknown): string => {
  if (P.isError(input)) {
    return input.message;
  }

  if (hasMessage(input)) {
    return input.message;
  }

  return "Sidecar request failed.";
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

  if (S.is(RepoRunServiceError)(error) || S.is(SidecarRuntimeError)(error)) {
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

    return new SidecarInternalErrorPayload({
      message: error.message,
      status: 500,
    });
  }

  return new SidecarInternalErrorPayload({
    message: matchUnknownMessage(error),
    status: 500,
  });
};

const firstPrettyError = (cause: Cause.Cause<unknown>): string => {
  const rendered = A.map(Cause.prettyErrors(cause), (error) => error.stack ?? error.message);
  return O.getOrElse(A.head(rendered), () => Cause.pretty(cause));
};

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

  if (interrupted) {
    return yield* Effect.logDebug({
      message: "sidecar request interrupted",
      error: primaryError,
      cause: renderedCause,
    }).pipe(Effect.annotateLogs(annotations));
  }

  if (payload.status < 500) {
    return yield* Effect.logWarning({
      message: "sidecar request failed",
      error: primaryError,
      cause: renderedCause,
    }).pipe(Effect.annotateLogs(annotations));
  }

  return yield* Effect.logError({
    message: "sidecar request failed",
    error: primaryError,
    cause: renderedCause,
  }).pipe(Effect.annotateLogs(annotations));
});

const handleControlPlaneInternalErrors = <A, E, R>(
  method: string,
  route: string,
  sessionId: string,
  successStatus: number,
  effect: Effect.Effect<A, E, R>
) =>
  observeHttpRequest(
    {
      method,
      route,
      successStatus,
    },
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
          Effect.andThen(Effect.fail(payload))
        );
      })
    )
  );

const handleControlPlaneErrors = <A, E, R>(
  method: string,
  route: string,
  sessionId: string,
  successStatus: number,
  effect: Effect.Effect<A, E, R>
) =>
  observeHttpRequest(
    {
      method,
      route,
      successStatus,
    },
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
          Effect.andThen(Effect.fail(payload))
        );
      })
    )
  );

const toPublicAddress = (config: SidecarRuntimeConfig, address: HttpServer.Address) => {
  if (address._tag !== "TcpAddress") {
    return Effect.fail(toRuntimeError("Sidecar runtime requires a TCP address.", 500));
  }

  const host = internalRunnerHost(config.host);
  const normalizedHost = pipe(host, Str.includes(":")) && !pipe(host, Str.startsWith("[")) ? `[${host}]` : host;

  return Effect.succeed({
    baseUrl: `http://${normalizedHost}:${address.port}`,
    port: address.port,
  });
};

const emitBootstrapStdoutLine = Effect.fn("SidecarRuntime.emitBootstrapStdoutLine")(function* (
  config: SidecarRuntimeConfig,
  startedAt: DateTime.Utc
) {
  const bootstrap = new SidecarBootstrap({
    sessionId: config.sessionId,
    version: config.version,
    host: config.host,
    port: config.port,
    baseUrl: `http://${internalRunnerHost(config.host)}:${config.port}`,
    pid: decodeNonNegativeInt(process.pid),
    status: "healthy",
    startedAt,
  });
  const encoded = yield* encodeBootstrapStdoutLine(toBootstrapStdoutLine(bootstrap)).pipe(
    Effect.mapError((cause) => toRuntimeError("Failed to encode sidecar bootstrap stdout line.", 500, cause))
  );

  yield* Effect.sync(() => {
    process.stdout.write(`${encoded}\n`);
  });
});

const makeRpcHandlersLayer = () => {
  const internalWorkflowRpcGroup = WorkflowProxy.toRpcGroup(RepoRunWorkflows, {
    prefix: "InternalRepoRun",
  });
  const publicRepoRunHandlersLayer = RepoRunRpcGroup.toLayer(
    Effect.gen(function* () {
      const repoRunService = yield* RepoRunService;

      return RepoRunRpcGroup.of({
        StartIndexRepoRun: (payload) =>
          Effect.gen(function* () {
            const executionId = yield* IndexRepoRunWorkflow.executionId(payload);
            const runId = yield* decodeExecutionRunId(IndexRepoRunWorkflow.name, executionId);
            const decision = yield* repoRunService
              .acceptIndexRun(payload, runId)
              .pipe(Effect.mapError(toRunStreamFailure));

            if (decision.dispatch) {
              yield* IndexRepoRunWorkflow.execute(payload, { discard: true }).pipe(Effect.asVoid);
            }

            return decision.ack;
          }),
        StartQueryRepoRun: (payload) =>
          Effect.gen(function* () {
            const executionId = yield* QueryRepoRunWorkflow.executionId(payload);
            const runId = yield* decodeExecutionRunId(QueryRepoRunWorkflow.name, executionId);
            const decision = yield* repoRunService
              .acceptQueryRun(payload, runId)
              .pipe(Effect.mapError(toRunStreamFailure));

            if (decision.dispatch) {
              yield* QueryRepoRunWorkflow.execute(payload, { discard: true }).pipe(Effect.asVoid);
            }

            return decision.ack;
          }),
        InterruptRepoRun: (payload) => repoRunService.interruptRun(payload).pipe(Effect.mapError(toRunStreamFailure)),
        ResumeRepoRun: (payload) => repoRunService.resumeRun(payload).pipe(Effect.mapError(toRunStreamFailure)),
        StreamRunEvents: (payload) => repoRunService.streamRunEvents(payload),
      });
    })
  );

  const internalWorkflowHandlersLayer = WorkflowProxyServer.layerRpcHandlers(RepoRunWorkflows, {
    prefix: "InternalRepoRun",
  });

  const rpcGroup = RepoRunRpcGroup.merge(internalWorkflowRpcGroup);
  const handlersLayer = Layer.mergeAll(publicRepoRunHandlersLayer, internalWorkflowHandlersLayer);

  return {
    handlersLayer,
    rpcGroup,
  } as const;
};

/**
 * Builds the live HTTP + RPC layer for the local sidecar runtime.
 *
 * @since 0.0.0
 * @category Layers
 */
export const sidecarLayer = (config: SidecarRuntimeConfig) =>
  Layer.unwrap(
    Effect.gen(function* () {
      const startedAt = yield* DateTime.now;

      const respondHealth = Effect.fn("SidecarRuntime.route.health")(function* () {
        const httpServer = yield* HttpServer.HttpServer;
        const publicAddress = yield* toPublicAddress(config, httpServer.address);

        return new SidecarBootstrap({
          sessionId: config.sessionId,
          host: config.host,
          port: decodeNonNegativeInt(publicAddress.port),
          baseUrl: publicAddress.baseUrl,
          pid: decodeNonNegativeInt(process.pid),
          version: config.version,
          status: "healthy",
          startedAt,
        });
      });

      const respondListRepos = Effect.fn("SidecarRuntime.route.listRepos")(function* () {
        const repoRunService = yield* RepoRunService;
        return yield* repoRunService.listRepos;
      });

      const respondRegisterRepo = Effect.fn("SidecarRuntime.route.registerRepo")(function* () {
        const input = yield* HttpServerRequest.schemaBodyJson(RepoRegistrationInput);
        const repoRunService = yield* RepoRunService;
        return yield* repoRunService.registerRepo(input);
      });

      const respondListRuns = Effect.fn("SidecarRuntime.route.listRuns")(function* () {
        const repoRunService = yield* RepoRunService;
        return yield* repoRunService.listRuns;
      });

      const respondGetRun = Effect.fn("SidecarRuntime.route.getRun")(function* (runId: string) {
        const repoRunService = yield* RepoRunService;
        const decodedRunId = yield* decodeRunId(runId).pipe(
          Effect.mapError((cause) => toRuntimeError(`Invalid run id: "${runId}".`, 400, cause))
        );
        return yield* repoRunService.getRun(decodedRunId);
      });

      const controlPlaneHandlersLayer = Layer.mergeAll(
        HttpApiBuilder.group(ControlPlaneApi, "system", (handlers) =>
          handlers.handle("health", () =>
            handleControlPlaneInternalErrors("GET", "/api/v0/health", config.sessionId, 200, respondHealth())
          )
        ),
        HttpApiBuilder.group(ControlPlaneApi, "repos", (handlers) =>
          handlers
            .handle("listRepos", () =>
              handleControlPlaneInternalErrors("GET", "/api/v0/repos", config.sessionId, 200, respondListRepos())
            )
            .handleRaw("registerRepo", () =>
              handleControlPlaneErrors("POST", "/api/v0/repos", config.sessionId, 201, respondRegisterRepo())
            )
        ),
        HttpApiBuilder.group(ControlPlaneApi, "runs", (handlers) =>
          handlers
            .handle("listRuns", () =>
              handleControlPlaneInternalErrors("GET", "/api/v0/runs", config.sessionId, 200, respondListRuns())
            )
            .handle("getRun", ({ params }) =>
              handleControlPlaneErrors("GET", "/api/v0/runs/:runId", config.sessionId, 200, respondGetRun(params.runId))
            )
        )
      );

      const controlPlaneApiLayer = HttpApiBuilder.layer(ControlPlaneApi).pipe(Layer.provide(controlPlaneHandlersLayer));

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
      const rpcSerializationLayer = RpcSerialization.layerNdjson;
      const shardingConfigLayer = ShardingConfig.layer({
        runnerAddress: makeRunnerAddress(config),
        shardsPerGroup: 300,
        entityMailboxCapacity: 4096,
        entityMessagePollInterval: Duration.millis(250),
        entityReplyPollInterval: Duration.millis(100),
        sendRetryInterval: Duration.millis(100),
        refreshAssignmentsInterval: Duration.seconds(2),
        runnerHealthCheckInterval: Duration.seconds(30),
        simulateRemoteSerialization: true,
      });
      const messageStorageLayer = SqlMessageStorage.layerWith({
        prefix: "repo_memory_cluster",
      }).pipe(Layer.provide([sqliteLayer, shardingConfigLayer]));
      const runnerStorageLayer = SqlRunnerStorage.layerWith({
        prefix: "repo_memory_cluster",
      }).pipe(Layer.provide([sqliteLayer, shardingConfigLayer]));
      const clusterClientProtocolLayer = HttpRunner.layerClientProtocolHttp({
        path: "__cluster",
      }).pipe(Layer.provide(BunHttpClient.layer), Layer.provide(rpcSerializationLayer));

      const runnerHealthLayer = RunnerHealth.layerPing.pipe(
        Layer.provide(Runners.layerRpc),
        Layer.provide(clusterClientProtocolLayer)
      );
      const clusterClientLayer = HttpRunner.layerClient.pipe(
        Layer.provide(clusterClientProtocolLayer),
        Layer.provide(runnerStorageLayer),
        Layer.provide(runnerHealthLayer),
        Layer.provide(messageStorageLayer),
        Layer.provide(shardingConfigLayer)
      );
      const clusterWorkflowLayer = ClusterWorkflowEngine.layer.pipe(
        Layer.provide(messageStorageLayer),
        Layer.provide(clusterClientLayer)
      );
      const clusterHttpRouteLayer = HttpRunner.layerHttpOptions({
        path: "/__cluster",
      }).pipe(
        Layer.provide(clusterClientProtocolLayer),
        Layer.provide(runnerStorageLayer),
        Layer.provide(runnerHealthLayer),
        Layer.provide(rpcSerializationLayer),
        Layer.provide(messageStorageLayer),
        Layer.provide(shardingConfigLayer),
        Layer.provide(clusterClientLayer)
      );

      const repoMemorySqlConfig = new RepoMemorySqlConfig({
        appDataDir: config.appDataDir,
      });
      const repoMemorySqlLayer = RepoMemorySqlLive(repoMemorySqlConfig).pipe(
        Layer.provide([fileSystemLayer, sqliteLayer])
      );
      const eventJournalLayer = SqlEventLogJournal.layer({
        entryTable: "repo_memory_run_journal",
        remotesTable: "repo_memory_run_journal_remotes",
      }).pipe(Layer.provide(sqliteLayer));
      const typeScriptIndexLayer = TypeScriptIndexService.layer.pipe(
        Layer.provide([fileSystemLayer, repoMemorySqlLayer])
      );
      const groundedRetrievalLayer = GroundedRetrievalService.layer.pipe(Layer.provide(repoMemorySqlLayer));
      const repoRunServiceLayer = RepoRunService.layer.pipe(
        Layer.provide([
          repoMemorySqlLayer,
          eventJournalLayer,
          groundedRetrievalLayer,
          typeScriptIndexLayer,
          Reactivity.layer,
        ])
      );
      const workflowHandlersLayer = RepoRunWorkflowsLayer.pipe(
        Layer.provide(clusterWorkflowLayer),
        Layer.provide(repoRunServiceLayer)
      );
      const { handlersLayer, rpcGroup } = makeRpcHandlersLayer();
      const repoRunRpcHandlersLayer = handlersLayer.pipe(
        Layer.provide(clusterWorkflowLayer),
        Layer.provide(workflowHandlersLayer),
        Layer.provide(repoRunServiceLayer)
      );
      const repoRunRpcRouteLayer = RpcServer.layerHttp({
        group: rpcGroup,
        path: "/api/v0/rpc",
        protocol: "http",
      }).pipe(Layer.provide(repoRunRpcHandlersLayer), Layer.provide(rpcSerializationLayer));
      const prometheusMetricsLayer = PrometheusMetrics.layerHttp({
        path: "/metrics",
      });

      const applicationRoutesLayer = Layer.mergeAll(
        controlPlaneApiLayer,
        repoRunRpcRouteLayer,
        prometheusMetricsLayer
      ).pipe(Layer.provide(repoRunServiceLayer));

      const routesLayer = Layer.mergeAll(applicationRoutesLayer, clusterHttpRouteLayer).pipe(
        Layer.provide(sidecarTransportMiddlewareLayer)
      );
      const httpServerLayer = Layer.fresh(
        BunHttpServer.layer({
          hostname: config.host,
          idleTimeout: 0,
          port: config.port,
        })
      );

      return HttpRouter.serve(routesLayer, {
        disableListenLog: true,
        disableLogger: true,
      }).pipe(Layer.provideMerge(httpServerLayer));
    })
  );

/**
 * Launches the sidecar HTTP layer with runtime observability applied once at the boundary.
 *
 * @since 0.0.0
 * @category Constructors
 */
export const launchSidecar = (config: SidecarRuntimeConfig) =>
  provideSidecarObservability(config, Layer.launch(Layer.fresh(sidecarLayer(config)))).pipe(
    Effect.mapError((cause) => toRuntimeError("Failed to launch sidecar runtime.", 500, cause))
  );

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

      const startedAt = yield* DateTime.now;
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

      const serverFiber = yield* launchSidecar(config).pipe(Effect.forkScoped);
      const advertisedHost = internalRunnerHost(config.host);

      yield* emitBootstrapStdoutLine(config, startedAt);
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
  const port = yield* Config.number("BEEP_REPO_MEMORY_PORT").pipe(
    Config.orElse(() => Config.number("PORT")),
    Config.withDefault(8788)
  );
  const appDataDirInput = yield* Config.string("BEEP_REPO_MEMORY_APP_DATA_DIR").pipe(
    Config.withDefault(".beep/repo-memory")
  );
  const sessionIdOption = yield* Config.option(Config.string("BEEP_REPO_MEMORY_SESSION_ID"));
  const sessionId = yield* O.match(sessionIdOption, {
    onNone: () => DateTime.now.pipe(Effect.map((now) => `sidecar-${DateTime.toEpochMillis(now)}`)),
    onSome: Effect.succeed,
  });
  const version = yield* Config.string("BEEP_REPO_MEMORY_VERSION").pipe(Config.withDefault("0.0.0"));
  const otlpEnabled = yield* Config.boolean("BEEP_REPO_MEMORY_OTLP_ENABLED").pipe(Config.withDefault(true));
  const otlpBaseUrl = yield* Config.string("BEEP_REPO_MEMORY_OTLP_BASE_URL").pipe(
    Config.withDefault("http://127.0.0.1:4318")
  );
  const devtoolsEnabled = yield* Config.boolean("BEEP_REPO_MEMORY_DEVTOOLS_ENABLED").pipe(Config.withDefault(false));
  const devtoolsUrl = yield* Config.string("BEEP_REPO_MEMORY_DEVTOOLS_URL").pipe(
    Config.withDefault("ws://127.0.0.1:34437")
  );
  const appDataDir = path.resolve(appDataDirInput);
  const { otlpServiceName, otlpServiceVersion, otlpResourceAttributes } = yield* loadSidecarOtlpConfig(version);

  const config = new SidecarRuntimeConfig({
    host,
    port: decodeNonNegativeInt(port),
    appDataDir: decodeFilePath(appDataDir),
    sessionId,
    version,
    otlpEnabled,
    otlpBaseUrl,
    otlpResourceAttributes,
    otlpServiceName,
    otlpServiceVersion,
    devtoolsEnabled,
    devtoolsUrl,
  });
  const otlpResourceAttributesCount = A.length(R.toEntries(config.otlpResourceAttributes));

  yield* Effect.annotateCurrentSpan({
    session_id: config.sessionId,
    host: config.host,
    port: config.port,
    otlp_enabled: config.otlpEnabled,
    otlp_base_url: config.otlpBaseUrl,
    otlp_service_name: config.otlpServiceName,
    otlp_service_version: config.otlpServiceVersion,
    otlp_resource_attributes_count: otlpResourceAttributesCount,
    devtools_enabled: config.devtoolsEnabled,
    devtools_url: config.devtoolsUrl,
  });

  yield* Effect.logDebug({
    message: "sidecar runtime config loaded",
    session_id: config.sessionId,
    host: config.host,
    port: config.port,
    app_data_dir: config.appDataDir,
    otlp_enabled: config.otlpEnabled,
    otlp_base_url: config.otlpBaseUrl,
    otlp_service_name: config.otlpServiceName,
    otlp_service_version: config.otlpServiceVersion,
    otlp_resource_attributes: config.otlpResourceAttributes,
    devtools_enabled: config.devtoolsEnabled,
    devtools_url: config.devtoolsUrl,
  }).pipe(Effect.annotateLogs({ component: "sidecar-config" }));

  return config;
});
