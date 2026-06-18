/**
 * Graphiti proxy services.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { LiteralKit } from "@beep/schema";
import { A, Str } from "@beep/utils";
import {
  Chunk,
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
  Semaphore,
  Stream,
} from "effect";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import {
  Headers,
  HttpBody,
  HttpClient,
  HttpClientError,
  HttpClientRequest,
  HttpMethod,
  HttpServerResponse,
  UrlParams,
} from "effect/unstable/http";
import type { Scope } from "effect";
import type { HttpServerRequest } from "effect/unstable/http";
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
export const ContainerHealthState = LiteralKit(["unknown", "healthy", "unhealthy", "starting"]).pipe(
  $I.annoteSchema("ContainerHealthState", {
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
export const DependencyHealthState = LiteralKit(["unknown", "ok", "degraded"]).pipe(
  $I.annoteSchema("DependencyHealthState", {
    description: "Dependency health status used by graphiti proxy.",
  })
);

const ProxyErrorKind = LiteralKit([
  "queue_full",
  "payload_too_large",
  "upstream_failure",
  "upstream_timeout",
  "shutting_down",
]).pipe(
  $I.annoteSchema("ProxyErrorKind", {
    description: "Structured graphiti proxy error identifiers.",
  })
);

const ProxyHealthStatus = LiteralKit(["ok", "degraded"]).pipe(
  $I.annoteSchema("ProxyHealthStatus", {
    description: "Health endpoint status values.",
  })
);

const ProxyLane = LiteralKit(["queued", "fast"]).pipe(
  $I.annoteSchema("ProxyLane", {
    description: "Graphiti proxy forwarding lanes.",
  })
);
type ProxyLane = typeof ProxyLane.Type;

const GraphitiProxyFastMcpMethod = LiteralKit([
  "initialize",
  "notifications/initialized",
  "ping",
  "prompts/list",
  "resources/list",
  "tools/list",
]).pipe(
  $I.annoteSchema("GraphitiProxyFastMcpMethod", {
    description: "Cheap MCP methods allowed to bypass serialized Graphiti memory work.",
  })
);
const isGraphitiProxyFastMcpMethod = S.is(GraphitiProxyFastMcpMethod);

const GraphitiProxyFastMcpToolName = LiteralKit(["get_status"]).pipe(
  $I.annoteSchema("GraphitiProxyFastMcpToolName", {
    description: "Cheap Graphiti MCP tools allowed to bypass serialized Graphiti memory work.",
  })
);
const isGraphitiProxyFastMcpToolName = S.is(GraphitiProxyFastMcpToolName);

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
    active: S.Finite,
    queued: S.Finite,
    peakQueueDepth: S.Finite,
    processed: S.Finite,
    failed: S.Finite,
    rejected: S.Finite,
    concurrency: S.Finite,
    maxQueue: S.Finite,
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
    active: S.Finite,
    queued: S.Finite,
    peakQueueDepth: S.Finite,
    processed: S.Finite,
    failed: S.Finite,
    rejected: S.Finite,
    concurrency: S.Finite,
    maxQueue: S.Finite,
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

class GraphitiMcpToolCallParams extends S.Class<GraphitiMcpToolCallParams>($I`GraphitiMcpToolCallParams`)(
  {
    name: S.optionalKey(S.String),
  },
  $I.annote("GraphitiMcpToolCallParams", {
    description: "Subset of MCP tools/call params needed for proxy lane selection.",
  })
) {}

class GraphitiMcpJsonRpcRequest extends S.Class<GraphitiMcpJsonRpcRequest>($I`GraphitiMcpJsonRpcRequest`)(
  {
    method: S.String,
    params: S.optionalKey(GraphitiMcpToolCallParams),
  },
  $I.annote("GraphitiMcpJsonRpcRequest", {
    description: "Subset of a JSON-RPC MCP request needed for Graphiti proxy lane selection.",
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
  $I.annoteSchema("UrlSearchParamsToUrlParams", {
    description: "Schema transformation from URLSearchParams into Effect UrlParams.",
  })
);

const decodeUrlSearchParams = S.decodeUnknownEffect(urlSearchParamsSchema);
const decodeContainerHealthState = S.decodeUnknownOption(ContainerHealthState);
const decodeGraphitiMcpJsonRpcRequest = S.decodeUnknownOption(S.fromJsonString(GraphitiMcpJsonRpcRequest));
const unknownContainerHealthState: S.Schema.Type<typeof ContainerHealthState> = "unknown";
const absoluteRequestTargetPattern = /^(?:[a-zA-Z][a-zA-Z\d+.-]*:|\/\/)/;
const utf8Decoder = new TextDecoder("utf-8");

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
const matchHttpClientErrorToRes = Match.type<HttpClientError.HttpClientError["reason"]>().pipe(
  Match.withReturnType<HttpServerResponse.HttpServerResponse>(),
  Match.tags({
    TransportError: (error) => proxyErrorResponse("upstream_failure", error.message, { status: 502 }),
    EncodeError: (error) => proxyErrorResponse("upstream_failure", error.message, { status: 502 }),
    InvalidUrlError: (error) => proxyErrorResponse("upstream_failure", error.message, { status: 500 }),
    StatusCodeError: (error) => proxyErrorResponse("upstream_failure", error.message, { status: 502 }),
    DecodeError: (error) => proxyErrorResponse("upstream_failure", error.message, { status: 502 }),
    EmptyBodyError: (error) => proxyErrorResponse("upstream_failure", error.message, { status: 502 }),
  }),
  Match.orElse(() => proxyErrorResponse("upstream_failure", "Unknown error", { status: 502 }))
);
const mapHttpClientErrorToResponse = (error: HttpClientError.HttpClientError): HttpServerResponse.HttpServerResponse =>
  matchHttpClientErrorToRes(error.reason);

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
      ProxyErrorPayload.make({
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

type RequestTargetRejection = {
  readonly response: HttpServerResponse.HttpServerResponse;
};

type GraphitiProxyForwarderServiceShape = {
  readonly forward: (
    request: HttpServerRequest.HttpServerRequest,
    bodyBytes?: O.Option<Uint8Array>
  ) => Effect.Effect<HttpServerResponse.HttpServerResponse, never, HttpClient.HttpClient>;
  /**
   * Validate that a request targets the configured upstream subtree before its
   * body is consumed. Returns the rejection response when the target is
   * disallowed so callers can fail closed without buffering the body.
   */
  readonly rejectDisallowedTarget: (request: HttpServerRequest.HttpServerRequest) => O.Option<RequestTargetRejection>;
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

type BufferedProxyRequest = {
  readonly bodyBytes: O.Option<Uint8Array>;
  readonly request: HttpServerRequest.HttpServerRequest;
};

const unknownDependencySnapshot = () =>
  DependencyHealthSnapshot.make({
    status: "unknown",
    details: DependencyHealthDetails.make({
      falkor: "unknown",
      graphiti: "unknown",
    }),
  });

const parseContainerHealth = (value: string): S.Schema.Type<typeof ContainerHealthState> =>
  pipe(
    decodeContainerHealthState(pipe(value, Str.trim, Str.toLowerCase)),
    O.getOrElse(() => unknownContainerHealthState)
  );

type RequestBodyOutcome =
  | { readonly _tag: "Body"; readonly bodyBytes: O.Option<Uint8Array> }
  | { readonly _tag: "Oversized"; readonly declaredBytes: O.Option<number> }
  | { readonly _tag: "ReadError"; readonly cause: unknown };

const parseContentLength = (request: HttpServerRequest.HttpServerRequest): O.Option<number> =>
  pipe(
    Headers.get(request.headers, "content-length"),
    O.flatMap((raw) => {
      const parsed = globalThis.Number(pipe(raw, Str.trim));
      return globalThis.Number.isInteger(parsed) && parsed >= 0 ? O.some(parsed) : O.none<number>();
    })
  );

// Concatenate the bounded set of collected chunks into a single contiguous
// buffer. Only invoked once the running total is known to be within the cap, so
// the destination allocation is bounded by `maxBodyBytes`.
const concatChunkedBody = (chunks: Chunk.Chunk<Uint8Array>, totalBytes: number): Uint8Array => {
  const collected = Chunk.toReadonlyArray(chunks);
  const buffer = new Uint8Array(totalBytes);
  const writeChunk = (offset: number, chunk: Uint8Array): number => {
    buffer.set(chunk, offset);
    return offset + chunk.length;
  };
  A.reduce(collected, 0, writeChunk);
  return buffer;
};

const readRequestBodyBytes: (
  request: HttpServerRequest.HttpServerRequest,
  maxBodyBytes: number
) => Effect.Effect<RequestBodyOutcome> = Effect.fnUntraced(function* (request, maxBodyBytes) {
  const method = HttpMethod.isHttpMethod(request.method) ? request.method : "GET";
  if (!HttpMethod.hasBody(method)) {
    return { _tag: "Body", bodyBytes: O.none<Uint8Array>() };
  }

  // Fail closed on an advertised Content-Length before buffering any bytes.
  const declaredBytes = parseContentLength(request);
  if (O.exists(declaredBytes, (length) => length > maxBodyBytes)) {
    return { _tag: "Oversized", declaredBytes };
  }

  // Bounded streaming read: track a running total as chunks arrive and stop the
  // stream as soon as the total crosses the cap. A client that omits or
  // understates Content-Length (chunked upload) can no longer force the proxy to
  // buffer the whole body before the size check runs; `takeUntil` keeps only the
  // chunk that pushes past the cap and then halts, so peak memory stays bounded
  // to ~maxBodyBytes plus a single trailing chunk.
  const chunksRef = yield* Ref.make(Chunk.empty<Uint8Array>());
  const totalRef = yield* Ref.make(0);

  const boundedBody = request.stream.pipe(
    Stream.mapAccum(
      () => 0,
      (runningTotal, chunk): readonly [number, ReadonlyArray<readonly [Uint8Array, number]>] => {
        const nextTotal = runningTotal + chunk.length;
        return [nextTotal, [[chunk, nextTotal]]];
      }
    ),
    Stream.takeUntil(([, runningTotal]) => runningTotal > maxBodyBytes)
  );

  const drainResult = yield* boundedBody.pipe(
    Stream.runForEach(
      Effect.fnUntraced(function* ([chunk, runningTotal]) {
        yield* Ref.update(chunksRef, (chunks) => Chunk.append(chunks, chunk));
        yield* Ref.set(totalRef, runningTotal);
      })
    ),
    Effect.result
  );

  if (Result.isFailure(drainResult)) {
    return { _tag: "ReadError", cause: drainResult.failure };
  }

  const total = yield* Ref.get(totalRef);
  if (total > maxBodyBytes) {
    // Drop the collected chunks so the oversized body is not retained.
    yield* Ref.set(chunksRef, Chunk.empty<Uint8Array>());
    return { _tag: "Oversized", declaredBytes };
  }

  const chunks = yield* Ref.get(chunksRef);
  return { _tag: "Body", bodyBytes: O.some(concatChunkedBody(chunks, total)) };
});

/**
 * Tagged outcome of a bounded request-body read for testing assertions.
 *
 * @category testing
 * @since 0.0.0
 */
export type RequestBodyOutcomeForTesting = RequestBodyOutcome;

/**
 * Read a request body under the configured cap using a bounded streaming read.
 *
 * Exposed for tests: a client that omits or understates `Content-Length`
 * (chunked upload) is rejected as `Oversized` without buffering the entire body,
 * so peak memory stays bounded to roughly `maxBodyBytes` plus one trailing
 * chunk.
 *
 * @param request - Inbound proxied HTTP request.
 * @param maxBodyBytes - Maximum allowed body size in bytes.
 * @returns Effect producing the bounded request-body outcome.
 * @example
 * ```ts
 * console.log("readRequestBodyBytesForTesting")
 * ```
 * @category testing
 * @since 0.0.0
 */
export const readRequestBodyBytesForTesting: (
  request: HttpServerRequest.HttpServerRequest,
  maxBodyBytes: number
) => Effect.Effect<RequestBodyOutcome> = readRequestBodyBytes;

const isFastMcpRequestEnvelope = (envelope: GraphitiMcpJsonRpcRequest): boolean =>
  isGraphitiProxyFastMcpMethod(envelope.method) ||
  pipe(
    O.fromUndefinedOr(envelope.params),
    O.flatMap((params) => O.fromUndefinedOr(params.name)),
    O.exists(isGraphitiProxyFastMcpToolName)
  );

/**
 * Determine whether an MCP request body is cheap enough to bypass the serialized memory-work queue.
 *
 * @param bodyBytes - Optional UTF-8 JSON-RPC request body bytes.
 * @returns Whether the request can use the fast proxy lane.
 * @example
 * ```ts
 * import { isFastMcpRequestBody } from "@beep/repo-cli/commands/Graphiti/internal/ProxyServices"
 * import * as O from "effect/Option"
 *
 * console.log(isFastMcpRequestBody(O.none()))
 * ```
 * @category utilities
 * @since 0.0.0
 */
export const isFastMcpRequestBody: (bodyBytes: O.Option<Uint8Array>) => boolean = flow(
  O.match({
    onNone: () => true,
    onSome: (bytes) =>
      pipe(utf8Decoder.decode(bytes), decodeGraphitiMcpJsonRpcRequest, O.exists(isFastMcpRequestEnvelope)),
  })
);

const addProxyHeaders = (
  response: HttpServerResponse.HttpServerResponse,
  options: {
    readonly active: number;
    readonly lane: ProxyLane;
    readonly queued: number;
  }
): HttpServerResponse.HttpServerResponse =>
  pipe(
    response,
    HttpServerResponse.setHeader("x-graphiti-proxy-queued", `${options.queued}`),
    HttpServerResponse.setHeader("x-graphiti-proxy-active", `${options.active}`),
    HttpServerResponse.setHeader("x-graphiti-proxy-lane", options.lane)
  );

/**
 * Settle a forwarded response against the concurrency accounting slot.
 *
 * Streaming MCP/SSE responses complete their headers while the body keeps
 * flowing to the downstream client. To keep `GRAPHITI_PROXY_CONCURRENCY` and
 * `active` accounting honest, the release effect is deferred to the body
 * stream finalizer so the worker slot stays accounted until the stream closes,
 * errors, or is interrupted. Non-streaming responses release the slot
 * immediately.
 *
 * @param response - Forwarded upstream response.
 * @param release - Effect that releases the accounting slot exactly once.
 * @returns Effect producing the response with slot release wired to its body.
 */
const settleForwardedResponse: (
  response: HttpServerResponse.HttpServerResponse,
  release: Effect.Effect<void>
) => Effect.Effect<HttpServerResponse.HttpServerResponse> = Effect.fnUntraced(function* (response, release) {
  return yield* Match.value(response.body).pipe(
    Match.tag("Stream", (body) =>
      Effect.succeed(
        HttpServerResponse.setBody(
          response,
          HttpBody.stream(Stream.ensuring(body.stream, release), body.contentType, body.contentLength)
        )
      )
    ),
    Match.orElse(() => Effect.as(release, response))
  );
});

const readContainerHealth: (
  dependencyHealthEnabled: boolean,
  containerName: string
) => Effect.Effect<S.Schema.Type<typeof ContainerHealthState>> = Effect.fnUntraced(
  function* (dependencyHealthEnabled, containerName) {
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
  }
);

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
export const makeGraphitiDependencyHealthService: (
  config: GraphitiProxyConfig
) => Effect.Effect<GraphitiDependencyHealthService["Service"]> = Effect.fn(
  "GraphitiProxyServices.makeGraphitiDependencyHealthService"
)(function* (config) {
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

    const nextSnapshot = DependencyHealthSnapshot.make({
      status,
      details: DependencyHealthDetails.make({
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

  const rejectDisallowedTarget = (request: HttpServerRequest.HttpServerRequest): O.Option<RequestTargetRejection> => {
    if (isAbsoluteRequestTarget(request.url)) {
      return O.some({
        response: proxyErrorResponse("upstream_failure", "Graphiti proxy rejects absolute-form request targets.", {
          status: 400,
        }),
      });
    }

    const inboundUrl = new URL(request.url, "http://graphiti-proxy.local");
    const inboundPath = normalizeEndpointPath(inboundUrl.pathname);
    if (!isAllowedEndpointPath(allowedEndpointPath, inboundPath)) {
      return O.some({
        response: proxyErrorResponse("upstream_failure", `Graphiti proxy only forwards ${allowedEndpointPath}.`, {
          status: 404,
        }),
      });
    }

    return O.none();
  };

  const forward: (
    request: HttpServerRequest.HttpServerRequest,
    bodyBytes?: O.Option<Uint8Array>
  ) => Effect.Effect<HttpServerResponse.HttpServerResponse, never, HttpClient.HttpClient> = Effect.fnUntraced(
    function* (request, bodyBytes = O.none<Uint8Array>()) {
      const targetRejection = rejectDisallowedTarget(request);
      if (O.isSome(targetRejection)) {
        return targetRejection.value.response;
      }

      const inboundUrl = new URL(request.url, "http://graphiti-proxy.local");
      const inboundPath = normalizeEndpointPath(inboundUrl.pathname);

      const destination = new URL(upstreamBase.href);
      destination.pathname = inboundPath;
      destination.search = "";
      const urlParamsResult = yield* decodeUrlSearchParams(inboundUrl.searchParams).pipe(Effect.result);
      if (Result.isFailure(urlParamsResult)) {
        return proxyErrorResponse(
          "upstream_failure",
          `Graphiti proxy failed to decode request query parameters: ${urlParamsResult.failure.message}`,
          { status: 400 }
        );
      }
      const urlParams = urlParamsResult.success;
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
        const requestBodyResult = O.isSome(bodyBytes)
          ? Result.succeed(bodyBytes.value)
          : yield* request.arrayBuffer.pipe(
              Effect.map((buffer) => new Uint8Array(buffer)),
              Effect.result
            );
        if (Result.isFailure(requestBodyResult)) {
          return proxyErrorResponse("upstream_failure", Inspectable.toStringUnknown(requestBodyResult.failure, 0), {
            status: 400,
          });
        }
        const requestBodyBytes = requestBodyResult.success;
        const contentTypeOption = Headers.get(headers, "content-type");
        const body = pipe(
          contentTypeOption,
          O.map((contentType) => HttpBody.uint8Array(requestBodyBytes, contentType)),
          O.getOrElse(() => HttpBody.uint8Array(requestBodyBytes))
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
          O.map(flow(HttpServerResponse.fromClientResponse, Effect.succeed)),
          O.getOrElse(() =>
            Effect.succeed(
              proxyErrorResponse("upstream_timeout", `Upstream request timed out after ${config.requestTimeoutMs}ms`, {
                status: 504,
              })
            )
          )
        ),
      });
    }
  );

  return GraphitiProxyForwarderService.of({
    forward,
    rejectDisallowedTarget,
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
  Effect.fn("GraphitiProxyServices.makeGraphitiProxyQueueService")(function* (
    config: GraphitiProxyConfig,
    forwarderService: GraphitiProxyForwarderService["Service"]
  ): Effect.fn.Return<GraphitiProxyQueueService["Service"], never, HttpClient.HttpClient | Scope.Scope> {
    const httpClient = yield* HttpClient.HttpClient;
    const queue = yield* Queue.dropping<{
      readonly proxyRequest: BufferedProxyRequest;
      readonly responseDeferred: Deferred.Deferred<HttpServerResponse.HttpServerResponse>;
    }>(config.maxQueue);

    const acceptingRef = yield* Ref.make(true);
    const activeRef = yield* Ref.make(0);
    const peakQueueDepthRef = yield* Ref.make(0);
    const processedRef = yield* Ref.make(0);
    const failedRef = yield* Ref.make(0);
    const rejectedRef = yield* Ref.make(0);
    const drainDeferred = yield* Deferred.make<void>();
    // Bound every upstream forward (queued workers and the fast lane alike) to
    // the configured concurrency so fast-lane requests cannot open unbounded
    // concurrent upstream connections outside the serialized worker pool.
    const forwardSemaphore = yield* Semaphore.make(config.concurrency);

    const forwardProxyRequest = (proxyRequest: BufferedProxyRequest) =>
      forwarderService.forward(proxyRequest.request, proxyRequest.bodyBytes).pipe(
        Effect.provideService(HttpClient.HttpClient, httpClient),
        Effect.catchDefect(
          Effect.fnUntraced(function* (cause) {
            yield* Ref.update(failedRef, (failed) => failed + 1);
            return proxyErrorResponse("upstream_failure", Inspectable.toStringUnknown(cause, 0), { status: 502 });
          })
        )
      );

    const checkDrain = Effect.fnUntraced(function* () {
      const accepting = yield* Ref.get(acceptingRef);
      if (accepting) {
        return;
      }

      const active = yield* Ref.get(activeRef);
      const queued = yield* Queue.size(queue);
      if (active === 0 && queued === 0) {
        yield* Queue.shutdown(queue).pipe(Effect.ignore);
        yield* Deferred.succeed(drainDeferred, undefined).pipe(Effect.ignore);
      }
    });

    // Forward a request while holding both an active-count and a concurrency
    // permit for the full lifetime of the proxied response. For streaming
    // MCP/SSE bodies the slot is released only when the response body stream
    // closes, errors, or is interrupted, so a flood of never-ending streams
    // cannot bypass `GRAPHITI_PROXY_CONCURRENCY` while reporting zero `active`.
    const forwardWithSlot: (
      proxyRequest: BufferedProxyRequest
    ) => Effect.Effect<HttpServerResponse.HttpServerResponse> = Effect.fnUntraced(function* (proxyRequest) {
      yield* Ref.update(activeRef, (active) => active + 1);
      yield* forwardSemaphore.take(1);

      const releasedRef = yield* Ref.make(false);
      const releaseSlot = Effect.gen(function* () {
        const alreadyReleased = yield* Ref.getAndSet(releasedRef, true);
        if (alreadyReleased) {
          return;
        }
        yield* forwardSemaphore.release(1);
        yield* Ref.update(activeRef, (active) => (active > 0 ? active - 1 : 0));
        yield* checkDrain();
      });

      const response = yield* forwardProxyRequest(proxyRequest).pipe(Effect.onInterrupt(() => releaseSlot));
      return yield* settleForwardedResponse(response, releaseSlot);
    });

    const worker = Effect.forever(
      Effect.gen(function* () {
        const job = yield* Queue.take(queue);

        const response = yield* forwardWithSlot(job.proxyRequest);

        const queued = yield* Queue.size(queue);
        const active = yield* Ref.get(activeRef);

        const responseWithHeaders = addProxyHeaders(response, { active, lane: "queued", queued });

        yield* Deferred.succeed(job.responseDeferred, responseWithHeaders).pipe(Effect.ignore);
        yield* Ref.update(processedRef, (processed) => processed + 1);
      })
    ).pipe(Effect.catchDefect(() => Effect.void));

    const workerSlots = A.range(1, config.concurrency);
    yield* Effect.forEach(workerSlots, () => worker.pipe(Effect.forkScoped), {
      concurrency: "unbounded",
    });

    const enqueue: (
      request: HttpServerRequest.HttpServerRequest
    ) => Effect.Effect<HttpServerResponse.HttpServerResponse> = Effect.fnUntraced(function* (request) {
      const accepting = yield* Ref.get(acceptingRef);
      if (!accepting) {
        return proxyErrorResponse("shutting_down", "Graphiti proxy is shutting down.", {
          status: 503,
          headers: {
            "retry-after": "1",
          },
        });
      }

      // Fail closed on disallowed targets (absolute-form / non-/mcp) before the
      // request body is buffered, so rejected paths never allocate memory.
      const targetRejection = forwarderService.rejectDisallowedTarget(request);
      if (O.isSome(targetRejection)) {
        return targetRejection.value.response;
      }

      const bodyOutcome = yield* readRequestBodyBytes(request, config.maxBodyBytes);
      if (bodyOutcome._tag === "ReadError") {
        return proxyErrorResponse("upstream_failure", Inspectable.toStringUnknown(bodyOutcome.cause, 0), {
          status: 400,
        });
      }
      if (bodyOutcome._tag === "Oversized") {
        yield* Ref.update(rejectedRef, (rejected) => rejected + 1);
        return proxyErrorResponse(
          "payload_too_large",
          `Graphiti proxy rejected request body exceeding ${config.maxBodyBytes} bytes.`,
          { status: 413 }
        );
      }
      const proxyRequest: BufferedProxyRequest = {
        bodyBytes: bodyOutcome.bodyBytes,
        request,
      };

      if (isFastMcpRequestBody(proxyRequest.bodyBytes)) {
        const response = yield* forwardWithSlot(proxyRequest);
        yield* Ref.update(processedRef, (processed) => processed + 1);
        const queued = yield* Queue.size(queue);
        const active = yield* Ref.get(activeRef);
        return addProxyHeaders(response, { active, lane: "fast", queued });
      }

      const responseDeferred = yield* Deferred.make<HttpServerResponse.HttpServerResponse>();
      const offered = yield* Queue.offer(queue, {
        proxyRequest,
        responseDeferred,
      });

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

      return ProxyQueueStats.make({
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

    const beginShutdown = Ref.set(acceptingRef, false).pipe(Effect.andThen(checkDrain()));

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
