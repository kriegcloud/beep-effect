/**
 * Graphiti proxy services.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import {
  Clock,
  Context,
  Deferred,
  Duration,
  Effect,
  flow,
  Inspectable,
  Match,
  pipe,
  Queue,
  Ref,
  Result,
  SchemaTransformation,
  type Scope,
} from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import {
  Headers,
  HttpBody,
  HttpClient,
  HttpClientError,
  HttpClientRequest,
  HttpMethod,
  type HttpServerRequest,
  HttpServerResponse,
  UrlParams,
} from "effect/unstable/http";
import type { GraphitiProxyConfig } from "./ProxyConfig.js";

const $I = $RepoCliId.create("commands/Graphiti/internal/ProxyServices");

/**
 * Container health literal union.
 *
 * @example
 * ```ts
 * console.log("ContainerHealthState")
 * ```
 * @category models
 * @since 0.0.0
 */
export const ContainerHealthState = LiteralKit(["unknown", "healthy", "unhealthy", "starting"]).annotate(
  $I.annote("ContainerHealthState", {
    description: "Container health status as reported by docker inspect.",
  })
);

/**
 * Dependency health literal union.
 *
 * @example
 * ```ts
 * console.log("DependencyHealthState")
 * ```
 * @category models
 * @since 0.0.0
 */
export const DependencyHealthState = LiteralKit(["unknown", "ok", "degraded"]).annotate(
  $I.annote("DependencyHealthState", {
    description: "Dependency health status used by graphiti proxy.",
  })
);

const ProxyErrorKind = LiteralKit(["queue_full", "upstream_failure", "upstream_timeout", "shutting_down"]).annotate(
  $I.annote("ProxyErrorKind", {
    description: "Structured graphiti proxy error identifiers.",
  })
);

const ProxyHealthStatus = LiteralKit(["ok", "degraded"]).annotate(
  $I.annote("ProxyHealthStatus", {
    description: "Health endpoint status values.",
  })
);

class DependencyHealthDetails extends S.Class<DependencyHealthDetails>($I`DependencyHealthDetails`)(
  {
    falkor: ContainerHealthState,
    graphiti: ContainerHealthState,
  },
  $I.annote("DependencyHealthDetails", {
    description: "Dependency-level container health details.",
  })
) {}

/**
 * Cached dependency health snapshot payload.
 *
 * @example
 * ```ts
 * console.log("DependencyHealthSnapshot")
 * ```
 * @category models
 * @since 0.0.0
 */
export class DependencyHealthSnapshot extends S.Class<DependencyHealthSnapshot>($I`DependencyHealthSnapshot`)(
  {
    status: DependencyHealthState,
    details: DependencyHealthDetails,
  },
  $I.annote("DependencyHealthSnapshot", {
    description: "Cached dependency health snapshot.",
  })
) {}

/**
 * Queue and processing counters for proxy introspection.
 *
 * @example
 * ```ts
 * console.log("ProxyQueueStats")
 * ```
 * @category models
 * @since 0.0.0
 */
export class ProxyQueueStats extends S.Class<ProxyQueueStats>($I`ProxyQueueStats`)(
  {
    active: S.Number,
    queued: S.Number,
    peakQueueDepth: S.Number,
    processed: S.Number,
    failed: S.Number,
    rejected: S.Number,
    concurrency: S.Number,
    maxQueue: S.Number,
    upstream: S.String,
  },
  $I.annote("ProxyQueueStats", {
    description: "Queue and throughput counters for graphiti proxy.",
  })
) {}

/**
 * Structured JSON payload for health endpoints.
 *
 * @example
 * ```ts
 * console.log("ProxyHealthPayload")
 * ```
 * @category models
 * @since 0.0.0
 */
export class ProxyHealthPayload extends S.Class<ProxyHealthPayload>($I`ProxyHealthPayload`)(
  {
    status: ProxyHealthStatus,
    active: S.Number,
    queued: S.Number,
    peakQueueDepth: S.Number,
    processed: S.Number,
    failed: S.Number,
    rejected: S.Number,
    concurrency: S.Number,
    maxQueue: S.Number,
    upstream: S.String,
    dependencies: DependencyHealthDetails,
  },
  $I.annote("ProxyHealthPayload", {
    description: "JSON payload returned by /healthz and /metrics routes.",
  })
) {}

class ProxyErrorPayload extends S.Class<ProxyErrorPayload>($I`ProxyErrorPayload`)(
  {
    error: ProxyErrorKind,
    message: S.String,
  },
  $I.annote("ProxyErrorPayload", {
    description: "Structured proxy error payload.",
  })
) {}

const urlSearchParamsSchema = S.instanceOf(URLSearchParams).pipe(
  S.decodeTo(
    UrlParams.UrlParamsSchema,
    SchemaTransformation.transform({
      decode: UrlParams.fromInput,
      encode: (params) => {
        const next = new URLSearchParams();
        for (const [key, value] of params.params) {
          next.append(key, value);
        }
        return next;
      },
    })
  ),
  S.annotate(
    $I.annote("UrlSearchParamsToUrlParams", {
      description: "Schema transformation from URLSearchParams into Effect UrlParams.",
    })
  )
);

const decodeUrlSearchParams = S.decodeUnknownSync(urlSearchParamsSchema);
const decodeContainerHealthState = S.decodeUnknownOption(ContainerHealthState);
const unknownContainerHealthState: S.Schema.Type<typeof ContainerHealthState> = "unknown";
const absoluteRequestTargetPattern = /^(?:[a-zA-Z][a-zA-Z\d+.-]*:|\/\/)/;

const normalizeEndpointPath = (value: string): string => {
  const normalized = pipe(value, Str.replace(/\/+$/, ""));
  return Str.isNonEmpty(normalized) ? normalized : "/";
};

const isAllowedEndpointPath = (allowedPath: string, inboundPath: string): boolean =>
  allowedPath === "/" || inboundPath === allowedPath || pipe(inboundPath, Str.startsWith(`${allowedPath}/`));

const isAbsoluteRequestTarget = (value: string): boolean => O.isSome(Str.match(absoluteRequestTargetPattern)(value));

type ProxyErrorResponseOptions = {
  readonly headers?: Headers.Input | undefined;
  readonly status: number;
};

const mapHttpClientErrorToResponse = (error: HttpClientError.HttpClientError): HttpServerResponse.HttpServerResponse =>
  Match.value(error.reason._tag).pipe(
    Match.when("TransportError", () => proxyErrorResponse("upstream_failure", error.message, { status: 502 })),
    Match.when("EncodeError", () => proxyErrorResponse("upstream_failure", error.message, { status: 502 })),
    Match.when("InvalidUrlError", () => proxyErrorResponse("upstream_failure", error.message, { status: 500 })),
    Match.when("StatusCodeError", () => proxyErrorResponse("upstream_failure", error.message, { status: 502 })),
    Match.when("DecodeError", () => proxyErrorResponse("upstream_failure", error.message, { status: 502 })),
    Match.when("EmptyBodyError", () => proxyErrorResponse("upstream_failure", error.message, { status: 502 })),
    Match.orElse(() => proxyErrorResponse("upstream_failure", error.message, { status: 502 }))
  );

/**
 * Build a structured proxy error HTTP response.
 *
 * @param error - Structured proxy error kind.
 * @param message - Human-readable error message.
 * @param options - HTTP response options.
 * @returns Http server response with JSON error body.
 * @example
 * ```ts
 * console.log("proxyErrorResponse")
 * ```
 * @category models
 * @since 0.0.0
 */
export const proxyErrorResponse: {
  (
    error: S.Schema.Type<typeof ProxyErrorKind>,
    message: string,
    options: ProxyErrorResponseOptions
  ): HttpServerResponse.HttpServerResponse;
  (
    message: string,
    options: ProxyErrorResponseOptions
  ): (error: S.Schema.Type<typeof ProxyErrorKind>) => HttpServerResponse.HttpServerResponse;
} = dual(
  3,
  (
    error: S.Schema.Type<typeof ProxyErrorKind>,
    message: string,
    options: ProxyErrorResponseOptions
  ): HttpServerResponse.HttpServerResponse =>
    HttpServerResponse.jsonUnsafe(
      new ProxyErrorPayload({
        error,
        message,
      }),
      {
        status: options.status,
        headers: options.headers,
      }
    )
);

/**
 * Build a structured proxy health HTTP response.
 *
 * @param payload - Structured proxy health payload.
 * @param status - HTTP response status code.
 * @returns Http server response with JSON health body.
 * @example
 * ```ts
 * console.log("proxyHealthResponse")
 * ```
 * @category models
 * @since 0.0.0
 */
export const proxyHealthResponse: {
  (payload: ProxyHealthPayload, status: number): HttpServerResponse.HttpServerResponse;
  (status: number): (payload: ProxyHealthPayload) => HttpServerResponse.HttpServerResponse;
} = dual(
  2,
  (payload: ProxyHealthPayload, status: number): HttpServerResponse.HttpServerResponse =>
    HttpServerResponse.jsonUnsafe(payload, { status })
);

type GraphitiDependencyHealthServiceShape = {
  readonly snapshot: Effect.Effect<DependencyHealthSnapshot>;
};

type GraphitiProxyForwarderServiceShape = {
  readonly forward: (
    request: HttpServerRequest.HttpServerRequest
  ) => Effect.Effect<HttpServerResponse.HttpServerResponse, never, HttpClient.HttpClient>;
};

type GraphitiProxyQueueServiceShape = {
  readonly enqueue: (
    request: HttpServerRequest.HttpServerRequest
  ) => Effect.Effect<HttpServerResponse.HttpServerResponse>;
  readonly snapshot: Effect.Effect<ProxyQueueStats>;
  readonly beginShutdown: Effect.Effect<void>;
  readonly awaitDrain: (timeoutMs: number) => Effect.Effect<boolean>;
};

/**
 * Service tag for dependency health snapshots.
 *
 * @example
 * ```ts
 * console.log("GraphitiDependencyHealthService")
 * ```
 * @category models
 * @since 0.0.0
 */
export class GraphitiDependencyHealthService extends Context.Service<
  GraphitiDependencyHealthService,
  GraphitiDependencyHealthServiceShape
>()($I`GraphitiDependencyHealthService`) {}

/**
 * Service tag for forwarding requests to upstream graphiti.
 *
 * @example
 * ```ts
 * console.log("GraphitiProxyForwarderService")
 * ```
 * @category models
 * @since 0.0.0
 */
export class GraphitiProxyForwarderService extends Context.Service<
  GraphitiProxyForwarderService,
  GraphitiProxyForwarderServiceShape
>()($I`GraphitiProxyForwarderService`) {}

/**
 * Service tag for queueing and draining proxy traffic.
 *
 * @example
 * ```ts
 * console.log("GraphitiProxyQueueService")
 * ```
 * @category models
 * @since 0.0.0
 */
export class GraphitiProxyQueueService extends Context.Service<
  GraphitiProxyQueueService,
  GraphitiProxyQueueServiceShape
>()($I`GraphitiProxyQueueService`) {}

const unknownDependencySnapshot = () =>
  new DependencyHealthSnapshot({
    status: "unknown",
    details: new DependencyHealthDetails({
      falkor: "unknown",
      graphiti: "unknown",
    }),
  });

const parseContainerHealth = (value: string): S.Schema.Type<typeof ContainerHealthState> =>
  pipe(
    decodeContainerHealthState(pipe(value, Str.trim, Str.toLowerCase)),
    O.getOrElse(() => unknownContainerHealthState)
  );

const readContainerHealth = (
  dependencyHealthEnabled: boolean,
  containerName: string
): Effect.Effect<S.Schema.Type<typeof ContainerHealthState>> =>
  Effect.gen(function* () {
    if (!dependencyHealthEnabled) {
      return "unknown";
    }

    const result = yield* Effect.sync(() =>
      Bun.spawnSync({
        cmd: ["docker", "inspect", "--format", "{{.State.Health.Status}}", containerName],
        stdout: "pipe",
        stderr: "pipe",
      })
    );

    if (!result.success) {
      return "unknown";
    }

    const value = new TextDecoder("utf-8").decode(result.stdout);
    return parseContainerHealth(value);
  });

/**
 * Construct dependency health service implementation.
 *
 * @param config - Runtime graphiti proxy config.
 * @returns Effect producing dependency health service.
 * @example
 * ```ts
 * console.log("makeGraphitiDependencyHealthService")
 * ```
 * @category models
 * @since 0.0.0
 */
export const makeGraphitiDependencyHealthService = (
  config: GraphitiProxyConfig
): Effect.Effect<GraphitiDependencyHealthService["Service"]> =>
  Effect.gen(function* () {
    const cacheRef = yield* Ref.make({
      checkedAtMs: 0,
      snapshot: unknownDependencySnapshot(),
    });

    const snapshot = Effect.gen(function* () {
      const nowMs = yield* Clock.currentTimeMillis;
      const cache = yield* Ref.get(cacheRef);

      if (nowMs - cache.checkedAtMs < config.dependencyHealthTtlMs) {
        return cache.snapshot;
      }

      const falkor = yield* readContainerHealth(config.dependencyHealthEnabled, config.falkorContainer);
      const graphiti = yield* readContainerHealth(config.dependencyHealthEnabled, config.graphitiContainer);

      const status =
        config.dependencyHealthEnabled && (falkor !== "healthy" || graphiti !== "healthy") ? "degraded" : "ok";

      const nextSnapshot = new DependencyHealthSnapshot({
        status,
        details: new DependencyHealthDetails({
          falkor,
          graphiti,
        }),
      });

      yield* Ref.set(cacheRef, {
        checkedAtMs: nowMs,
        snapshot: nextSnapshot,
      });

      return nextSnapshot;
    });

    return GraphitiDependencyHealthService.of({
      snapshot,
    });
  });

/**
 * Construct upstream forwarder service implementation.
 *
 * @param config - Runtime graphiti proxy config.
 * @returns Forwarder service implementation.
 * @example
 * ```ts
 * console.log("makeGraphitiProxyForwarderService")
 * ```
 * @category models
 * @since 0.0.0
 */
export const makeGraphitiProxyForwarderService = (
  config: GraphitiProxyConfig
): GraphitiProxyForwarderService["Service"] => {
  const upstreamBase = new URL(config.upstream);
  const allowedEndpointPath = normalizeEndpointPath(upstreamBase.pathname);

  const forward = (
    request: HttpServerRequest.HttpServerRequest
  ): Effect.Effect<HttpServerResponse.HttpServerResponse, never, HttpClient.HttpClient> =>
    Effect.gen(function* () {
      if (isAbsoluteRequestTarget(request.url)) {
        return proxyErrorResponse("upstream_failure", "Graphiti proxy rejects absolute-form request targets.", {
          status: 400,
        });
      }

      const inboundUrl = new URL(request.url, "http://graphiti-proxy.local");
      const inboundPath = normalizeEndpointPath(inboundUrl.pathname);
      if (!isAllowedEndpointPath(allowedEndpointPath, inboundPath)) {
        return proxyErrorResponse("upstream_failure", `Graphiti proxy only forwards ${allowedEndpointPath}.`, {
          status: 404,
        });
      }

      const destination = new URL(upstreamBase.href);
      destination.pathname = inboundPath;
      destination.search = "";
      const urlParams = decodeUrlSearchParams(inboundUrl.searchParams);
      const headers = pipe(
        request.headers,
        Headers.remove("host"),
        Headers.remove("connection"),
        Headers.remove("content-length")
      );

      const method = HttpMethod.isHttpMethod(request.method) ? request.method : "GET";
      const hasBody = HttpMethod.hasBody(method);

      let upstreamRequest = HttpClientRequest.make(method)(destination.href, {
        headers,
        urlParams,
      });

      if (hasBody) {
        const requestBodyResult = yield* request.arrayBuffer.pipe(Effect.result);
        if (Result.isFailure(requestBodyResult)) {
          return proxyErrorResponse("upstream_failure", Inspectable.toStringUnknown(requestBodyResult.failure, 0), {
            status: 400,
          });
        }
        const bodyBytes = new Uint8Array(requestBodyResult.success);
        const contentTypeOption = Headers.get(headers, "content-type");
        const body = pipe(
          contentTypeOption,
          O.map((contentType) => HttpBody.uint8Array(bodyBytes, contentType)),
          O.getOrElse(() => HttpBody.uint8Array(bodyBytes))
        );
        upstreamRequest = HttpClientRequest.setBody(upstreamRequest, body);
      }

      const executeResult = yield* HttpClient.execute(upstreamRequest).pipe(
        Effect.timeoutOption(Duration.millis(config.requestTimeoutMs)),
        Effect.result
      );

      return yield* Result.match(executeResult, {
        onFailure: (error) =>
          Effect.succeed(
            HttpClientError.isHttpClientError(error)
              ? mapHttpClientErrorToResponse(error)
              : proxyErrorResponse("upstream_failure", Inspectable.toStringUnknown(error, 0), { status: 502 })
          ),
        onSuccess: flow(
          O.map((upstreamResponse) =>
            Effect.gen(function* () {
              const bodyBuffer = yield* Effect.orElseSucceed(upstreamResponse.arrayBuffer, () => new ArrayBuffer(0));
              return HttpServerResponse.uint8Array(new Uint8Array(bodyBuffer), {
                status: upstreamResponse.status,
                headers: upstreamResponse.headers,
              });
            })
          ),
          O.getOrElse(() =>
            Effect.succeed(
              proxyErrorResponse("upstream_timeout", `Upstream request timed out after ${config.requestTimeoutMs}ms`, {
                status: 504,
              })
            )
          )
        ),
      });
    });

  return GraphitiProxyForwarderService.of({
    forward,
  });
};

/**
 * Construct proxy queue service implementation.
 *
 * @param config - Runtime graphiti proxy config.
 * @param forwarderService - Forwarder service implementation.
 * @returns Effect producing queue service implementation.
 * @example
 * ```ts
 * console.log("makeGraphitiProxyQueueService")
 * ```
 * @category models
 * @since 0.0.0
 */
export const makeGraphitiProxyQueueService: {
  (
    config: GraphitiProxyConfig,
    forwarderService: GraphitiProxyForwarderService["Service"]
  ): Effect.Effect<GraphitiProxyQueueService["Service"], never, HttpClient.HttpClient | Scope.Scope>;
  (
    forwarderService: GraphitiProxyForwarderService["Service"]
  ): (
    config: GraphitiProxyConfig
  ) => Effect.Effect<GraphitiProxyQueueService["Service"], never, HttpClient.HttpClient | Scope.Scope>;
} = dual(
  2,
  (
    config: GraphitiProxyConfig,
    forwarderService: GraphitiProxyForwarderService["Service"]
  ): Effect.Effect<GraphitiProxyQueueService["Service"], never, HttpClient.HttpClient | Scope.Scope> =>
    Effect.gen(function* () {
      const queue = yield* Queue.dropping<{
        readonly request: HttpServerRequest.HttpServerRequest;
        readonly responseDeferred: Deferred.Deferred<HttpServerResponse.HttpServerResponse>;
      }>(config.maxQueue);

      const acceptingRef = yield* Ref.make(true);
      const activeRef = yield* Ref.make(0);
      const peakQueueDepthRef = yield* Ref.make(0);
      const processedRef = yield* Ref.make(0);
      const failedRef = yield* Ref.make(0);
      const rejectedRef = yield* Ref.make(0);
      const drainDeferred = yield* Deferred.make<void>();

      const checkDrain = Effect.gen(function* () {
        const accepting = yield* Ref.get(acceptingRef);
        if (accepting) {
          return;
        }

        const active = yield* Ref.get(activeRef);
        const queued = yield* Queue.size(queue);
        if (active === 0 && queued === 0) {
          yield* Deferred.succeed(drainDeferred, undefined).pipe(Effect.ignore);
        }
      });

      const worker = Effect.forever(
        Effect.gen(function* () {
          const job = yield* Queue.take(queue);
          yield* Ref.update(activeRef, (active) => active + 1);

          const response = yield* forwarderService.forward(job.request).pipe(
            Effect.catchDefect((cause) =>
              Effect.gen(function* () {
                yield* Ref.update(failedRef, (failed) => failed + 1);
                return proxyErrorResponse("upstream_failure", Inspectable.toStringUnknown(cause, 0), { status: 502 });
              })
            )
          );

          const queued = yield* Queue.size(queue);
          const active = yield* Ref.get(activeRef);

          const responseWithHeaders = pipe(
            response,
            HttpServerResponse.setHeader("x-graphiti-proxy-queued", `${queued}`),
            HttpServerResponse.setHeader("x-graphiti-proxy-active", `${active}`)
          );

          yield* Deferred.succeed(job.responseDeferred, responseWithHeaders).pipe(Effect.ignore);
          yield* Ref.update(processedRef, (processed) => processed + 1);
        }).pipe(
          Effect.ensuring(
            Ref.update(activeRef, (active) => (active > 0 ? active - 1 : 0)).pipe(Effect.andThen(checkDrain))
          )
        )
      ).pipe(Effect.catchDefect(() => Effect.void));

      const workerSlots = A.range(1, config.concurrency);
      yield* Effect.forEach(workerSlots, () => worker.pipe(Effect.forkScoped), {
        concurrency: "unbounded",
      });

      const enqueue = (
        request: HttpServerRequest.HttpServerRequest
      ): Effect.Effect<HttpServerResponse.HttpServerResponse> =>
        Effect.gen(function* () {
          const accepting = yield* Ref.get(acceptingRef);
          if (!accepting) {
            return proxyErrorResponse("shutting_down", "Graphiti proxy is shutting down.", {
              status: 503,
              headers: {
                "retry-after": "1",
              },
            });
          }

          const responseDeferred = yield* Deferred.make<HttpServerResponse.HttpServerResponse>();
          const offered = yield* Queue.offer(queue, { request, responseDeferred });

          if (!offered) {
            yield* Ref.update(rejectedRef, (rejected) => rejected + 1);
            return proxyErrorResponse("queue_full", `Graphiti proxy queue full (max ${config.maxQueue})`, {
              status: 503,
              headers: {
                "retry-after": "1",
              },
            });
          }

          const queued = yield* Queue.size(queue);
          yield* Ref.update(peakQueueDepthRef, (peak) => (queued > peak ? queued : peak));

          return yield* Deferred.await(responseDeferred);
        });

      const snapshot = Effect.gen(function* () {
        const queued = yield* Queue.size(queue);
        const active = yield* Ref.get(activeRef);
        const peakQueueDepth = yield* Ref.get(peakQueueDepthRef);
        const processed = yield* Ref.get(processedRef);
        const failed = yield* Ref.get(failedRef);
        const rejected = yield* Ref.get(rejectedRef);

        return new ProxyQueueStats({
          active,
          queued,
          peakQueueDepth,
          processed,
          failed,
          rejected,
          concurrency: config.concurrency,
          maxQueue: config.maxQueue,
          upstream: config.upstream,
        });
      });

      const beginShutdown = Ref.set(acceptingRef, false).pipe(Effect.andThen(checkDrain));

      const awaitDrain = (timeoutMs: number): Effect.Effect<boolean> =>
        Deferred.await(drainDeferred).pipe(Effect.timeoutOption(Duration.millis(timeoutMs)), Effect.map(O.isSome));

      return GraphitiProxyQueueService.of({
        enqueue,
        snapshot,
        beginShutdown,
        awaitDrain,
      });
    })
);
