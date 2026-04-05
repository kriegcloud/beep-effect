import { $RuntimeServerId } from "@beep/identity/packages";
import { renderObservedCause, summarizeCause } from "@beep/observability";
import { RunId, RunStreamFailure } from "@beep/repo-memory-model";
import {
  GroundedRetrievalService,
  IndexRepoRunWorkflow,
  QueryRepoRunWorkflow,
  RepoRunService,
  RepoRunServiceError,
  RepoRunWorkflows,
  RepoRunWorkflowsLayer,
  RepoSemanticEnrichmentService,
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
  HashSet,
  Layer,
  Path,
  pipe,
  Ref,
} from "effect";
import * as A from "effect/Array";
import * as Eq from "effect/Equal";
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
import * as SqlClient from "effect/unstable/sql/SqlClient";
import * as WorkflowProxy from "effect/unstable/workflow/WorkflowProxy";
import * as WorkflowProxyServer from "effect/unstable/workflow/WorkflowProxyServer";
import { encodeBootstrapStdoutLine, toBootstrapStdoutLine } from "./internal/BootstrapStdout.js";
import { observeHttpRequest, provideSidecarObservability } from "./internal/SidecarObservability.js";
import { loadSidecarOtlpConfig, resolveSidecarAppDataDir } from "./internal/SidecarRuntimeConfig.js";

const $I = $RuntimeServerId.create("index");
const decodeRunId = S.decodeUnknownEffect(RunId);
const decodeFilePath = S.decodeUnknownSync(FilePath);
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const SidecarPort = NonNegativeInt.pipe(
  S.check(S.isGreaterThan(0)),
  S.annotate(
    $I.annote("SidecarPort", {
      description: "Configured TCP port for the sidecar runtime; must be greater than zero.",
    })
  )
);
const decodeSidecarPort = S.decodeUnknownSync(SidecarPort);

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
  // FINDING-022: Content-Security-Policy header for API-only server.
  "content-security-policy": "default-src 'none'",
} as const;

// FINDING-023: Maximum request body size (256KB).
const maxBodySizeBytes = 262_144;

// FINDING-009/FINDING-016/FINDING-023: Transport-level validation middleware.
// Validates Content-Type, body presence for POST, and body size limits.
const sidecarRequestValidation = <E, R>(
  httpEffect: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>
): Effect.Effect<HttpServerResponse.HttpServerResponse, E, R | HttpServerRequest.HttpServerRequest> =>
  Effect.gen(function* () {
    const request = yield* HttpServerRequest.HttpServerRequest;
    const method = request.method;
    const url = request.url;
    const contentLength = request.headers["content-length"];

    // FINDING-023: Reject oversized request bodies.
    if (contentLength !== undefined) {
      const length = Number(contentLength);
      if (!Number.isNaN(length) && length > maxBodySizeBytes) {
        return HttpServerResponse.empty({ status: 413 });
      }
    }

    // Only apply POST-specific checks to non-cluster internal paths.
    if (method === "POST" && !pipe(url, Str.includes("__cluster"))) {
      // FINDING-016: Validate Content-Type for POST endpoints.
      const contentType = request.headers["content-type"];
      if (
        contentType !== undefined &&
        !pipe(contentType, Str.includes("application/json")) &&
        !pipe(contentType, Str.includes("ndjson"))
      ) {
        return HttpServerResponse.empty({ status: 415 });
      }

      // FINDING-009: Reject empty POST bodies.
      if (
        contentLength === "0" ||
        (contentLength === undefined && request.headers["transfer-encoding"] === undefined)
      ) {
        return HttpServerResponse.jsonUnsafe({ message: "Request body required", status: 400 }, { status: 400 });
      }
    }

    return yield* httpEffect;
  });

const isLoopbackHost = P.some([
  Eq.equals("localhost"),
  Eq.equals("127.0.0.1"),
  Eq.equals("::1"),
  Eq.equals("[::1]"),
  Str.endsWith(".localhost"),
]);
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

// FINDING-021: CORS pre-flight is handled by HttpMiddleware.cors which returns 204 for OPTIONS
// with Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers,
// and Access-Control-Max-Age headers when the origin passes isAllowedSidecarOrigin.
const sidecarTransportMiddlewareLayer = HttpRouter.middleware(
  flow(
    sidecarRequestValidation,
    HttpMiddleware.cors({
      allowedOrigins: isAllowedSidecarOrigin,
      allowedMethods: sidecarCorsAllowedMethods,
      allowedHeaders: sidecarCorsAllowedHeaders,
      credentials: true,
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
    port: SidecarPort,
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
 * @category DomainModel
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

// FINDING-013: Use mapError to produce a typed RunStreamFailure instead of letting ParseError die.
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

/**
 * Minimal error payload shape used at runtime HTTP boundaries before protocol-specific mapping.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class RuntimeBoundaryPayload extends S.Class<RuntimeBoundaryPayload>($I`RuntimeBoundaryPayload`)({
  message: S.String,
  status: S.Number,
}) {}

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
  const summary = summarizeCause(cause);
  const renderedCause = renderObservedCause(cause);
  const primaryError = firstPrettyError(cause);
  const annotations = {
    cause_classification: summary.classification,
    cause_fingerprint: summary.fingerprint.value,
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
      causeFingerprint: summary.fingerprint.value,
    }).pipe(Effect.annotateLogs(annotations));
  }

  if (payload.status < 500) {
    return yield* Effect.logWarning({
      message: "sidecar request failed",
      error: primaryError,
      cause: renderedCause,
      causeFingerprint: summary.fingerprint.value,
    }).pipe(Effect.annotateLogs(annotations));
  }

  return yield* Effect.logError({
    message: "sidecar request failed",
    error: primaryError,
    cause: renderedCause,
    causeFingerprint: summary.fingerprint.value,
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
  if (!P.isTagged(address, "TcpAddress")) {
    return Effect.fail(toRuntimeError("Sidecar runtime requires a TCP address.", 500, undefined));
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

// FINDING-017: Effect RPC protocol returns HTTP 200 for all RPC responses, including errors.
// RPC errors are encoded in the response body, not the HTTP status code.
// This is intentional protocol behavior -- typed clients decode errors from the body.
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
        InterruptRepoRun: flow(repoRunService.interruptRun, Effect.mapError(toRunStreamFailure)),
        ResumeRepoRun: flow(repoRunService.resumeRun, Effect.mapError(toRunStreamFailure)),
        StreamRunEvents: repoRunService.streamRunEvents,
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
 * @category Configuration
 */
export const sidecarLayer = (config: SidecarRuntimeConfig) =>
  Layer.unwrap(
    Effect.gen(function* () {
      const startedAt = yield* DateTime.now;

      // FINDING-002: Health endpoint reports server liveness.
      // The cluster runner table is not available in the handler context, so we
      // report "healthy" whenever the HTTP server is responding.  Cluster-level
      // runner health is monitored internally by the sharding subsystem.
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
        // FINDING-010: Strip null bytes from URL params to prevent injection.
        const sanitizedRunId = pipe(runId, Str.replaceAll("\0", ""));
        const repoRunService = yield* RepoRunService;
        const decodedRunId = yield* decodeRunId(sanitizedRunId).pipe(
          Effect.mapError((cause) => toRuntimeError(`Invalid run id: "${sanitizedRunId}".`, 400, cause))
        );
        return yield* repoRunService.getRun(decodedRunId);
      });

      const controlPlaneHandlersLayer = Layer.mergeAll(
        HttpApiBuilder.group(ControlPlaneApi, "system", (handlers) =>
          handlers.handle("health", () =>
            handleControlPlaneInternalErrors("GET", "/api/v0/health", config.sessionId, 200, respondHealth())
          )
        ),
        // FINDING-001: Use handle instead of handleRaw so the framework maps error types
        // to correct HTTP status codes via HttpApiSchema.status() annotations.
        HttpApiBuilder.group(ControlPlaneApi, "repos", (handlers) =>
          handlers
            .handle("listRepos", () =>
              handleControlPlaneInternalErrors("GET", "/api/v0/repos", config.sessionId, 200, respondListRepos())
            )
            .handle("registerRepo", () =>
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
      const sqliteBaseLayer = Layer.unwrap(
        Effect.gen(function* () {
          const fileSystemContext = yield* Layer.build(fileSystemLayer);

          return yield* Effect.gen(function* () {
            const fs = yield* FileSystem.FileSystem;
            const path = yield* Path.Path;
            yield* fs.makeDirectory(config.appDataDir, { recursive: true });

            return SqliteClient.layer({
              filename: path.join(config.appDataDir, "repo-memory.sqlite"),
            });
          }).pipe(Effect.provide(fileSystemContext));
        })
      );

      // FINDING-004: Set busy_timeout so SQLite retries internally for 5s on contention.
      // FINDING-002: Clear stale cluster locks/runners from a previous session on startup.
      // The DELETE statements are wrapped in catchAll because the tables may not yet exist
      // on the very first boot; they are created by SqlRunnerStorage during cluster init.
      const sqlitePostInitLayer = Layer.effectDiscard(
        Effect.gen(function* () {
          const sql = yield* SqlClient.SqlClient;
          yield* sql`PRAGMA busy_timeout = 5000`;
          yield* sql`DELETE FROM repo_memory_cluster_locks WHERE 1=1`.pipe(Effect.catchDefect(Effect.logDebug));
          yield* sql`DELETE FROM repo_memory_cluster_runners WHERE 1=1`.pipe(Effect.catchDefect(Effect.logDebug));
        })
      ).pipe(Layer.provide(sqliteBaseLayer));
      const sqliteLayer = Layer.merge(sqliteBaseLayer, sqlitePostInitLayer);

      const rpcSerializationLayer = RpcSerialization.layerNdjson;
      const shardingConfigLayer = ShardingConfig.layer({
        runnerAddress: O.some(makeRunnerAddress(config)),
        shardsPerGroup: 300,
        entityMailboxCapacity: 4096,
        entityMessagePollInterval: Duration.millis(250),
        entityReplyPollInterval: Duration.millis(100),
        sendRetryInterval: Duration.millis(100),
        refreshAssignmentsInterval: Duration.seconds(2),
        runnerHealthCheckInterval: Duration.seconds(30),
        // FINDING-002: Increase lock tolerance to avoid premature 503 under SQLite contention.
        shardLockExpiration: Duration.seconds(120),
        shardLockRefreshInterval: Duration.seconds(15),
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
      const semanticEnrichmentLayer = RepoSemanticEnrichmentService.layer;
      const repoRunServiceLayer = RepoRunService.layer.pipe(
        Layer.provide([
          fileSystemLayer,
          repoMemorySqlLayer,
          eventJournalLayer,
          groundedRetrievalLayer,
          semanticEnrichmentLayer,
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

      // FINDING-025: Reconcile cluster-tracked runs against repo_memory_runs on startup.
      // Wrapped in catchCause so that defects from missing tables on first boot
      // are logged as warnings and never crash the startup sequence.
      const startupReconciliationLayer = Layer.effectDiscard(
        Effect.gen(function* () {
          const sql = yield* SqlClient.SqlClient;
          const repoRunService = yield* RepoRunService;
          const knownRuns = yield* repoRunService.listRuns.pipe(
            Effect.catchCause(() => Effect.succeed([] as ReadonlyArray<unknown>))
          );
          const storedRuns = yield* sql<{ readonly id: string }>`SELECT id FROM repo_memory_runs`.pipe(
            Effect.catchCause(() => Effect.succeed([] as ReadonlyArray<{ readonly id: string }>))
          );
          const storedIds = pipe(
            storedRuns,
            A.map((r) => r.id),
            HashSet.fromIterable
          );
          const missingCount = A.length(
            A.filter(knownRuns as ReadonlyArray<{ readonly id: string }>, (r) => !HashSet.has(storedIds, r.id))
          );

          if (missingCount > 0) {
            yield* Effect.logWarning({
              message: `Startup reconciliation found ${missingCount} runs tracked by cluster but missing from repo_memory_runs table.`,
              session_id: config.sessionId,
            });
          }
        }).pipe(
          Effect.catchCause((cause) =>
            Effect.logWarning({
              message: "Startup run reconciliation skipped due to error.",
              error: Cause.pretty(cause),
            })
          ),
          Effect.withSpan("SidecarRuntime.startupReconciliation")
        )
      ).pipe(Layer.provide(sqliteLayer), Layer.provide(repoRunServiceLayer));

      const applicationRoutesLayer = Layer.mergeAll(
        controlPlaneApiLayer,
        repoRunRpcRouteLayer,
        prometheusMetricsLayer,
        startupReconciliationLayer
      ).pipe(Layer.provide(repoRunServiceLayer));

      const routesLayer = Layer.mergeAll(applicationRoutesLayer, clusterHttpRouteLayer).pipe(
        Layer.provide(sidecarTransportMiddlewareLayer)
      );
      const httpServerLayer = Layer.fresh(
        BunHttpServer.layer({
          hostname: config.host,
          port: config.port,
        })
      );

      return HttpRouter.serve(routesLayer, {
        disableListenLog: true,
        disableLogger: true,
      }).pipe(Layer.provideMerge(httpServerLayer), Layer.provideMerge(repoRunServiceLayer));
    })
  );

/**
 * Launches the sidecar HTTP layer with runtime observability applied once at the boundary.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export const launchSidecar = (config: SidecarRuntimeConfig) =>
  provideSidecarObservability(config, Layer.launch(Layer.fresh(sidecarLayer(config)))).pipe(
    Effect.mapError((cause) => toRuntimeError("Failed to launch sidecar runtime.", 500, cause))
  );

/**
 * Runs the sidecar runtime until shutdown is requested.
 *
 * @since 0.0.0
 * @category DomainModel
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
      const services = yield* Effect.services<never>();
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
 * @category Configuration
 */
export const loadSidecarRuntimeConfig = Effect.fn("SidecarRuntime.loadConfig")(function* () {
  const host = yield* Config.string("BEEP_REPO_MEMORY_HOST").pipe(Config.withDefault("127.0.0.1"));
  const port = yield* Config.number("BEEP_REPO_MEMORY_PORT").pipe(
    Config.orElse(() => Config.number("PORT")),
    Config.withDefault(8788)
  );
  const appDataDirInput = yield* Config.option(Config.string("BEEP_REPO_MEMORY_APP_DATA_DIR"));
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
  const appDataDir = yield* resolveSidecarAppDataDir(appDataDirInput);
  const { otlpServiceName, otlpServiceVersion, otlpResourceAttributes } = yield* loadSidecarOtlpConfig(version);

  const config = new SidecarRuntimeConfig({
    host,
    port: decodeSidecarPort(port),
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
