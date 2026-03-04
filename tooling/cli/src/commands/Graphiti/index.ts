/**
 * Graphiti command suite.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import * as BunHttpClient from "@effect/platform-bun/BunHttpClient";
import { Boolean as Bool, Console, Effect, HashSet, Inspectable, pipe, flow, identity, SchemaTransformation, String as Str } from "effect";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import { Headers, HttpClient, HttpClientRequest, HttpClientResponse, HttpMethod, UrlParams } from "effect/unstable/http";
import { Command } from "effect/unstable/cli";

const $I = $RepoCliId.create("commands/Graphiti/index");

const TruthyBooleanString = HashSet.fromIterable(["true", "1", "yes", "on"]);
const FalseyBooleanString = HashSet.fromIterable(["false", "0", "no", "off"]);

const makeDefaultedStringField = (name: string, fallback: string, description: string) =>
{
  const thunkFallback = () => fallback;

  const thunkFallbackToString = flow(thunkFallback, String);
  const thunkSomeFallback = flow(thunkFallback, O.some)
  return S.UndefinedOr(S.String).pipe(
    S.decodeTo(
      S.String,
      SchemaTransformation.transform({
        decode: (value) => O.getOrElse(O.fromUndefinedOr(value), thunkFallback),
        encode: identity,
      })
    ),
    S.withConstructorDefault(thunkSomeFallback),
    S.withDecodingDefault(thunkFallbackToString),
    S.annotate($I.annote(name, { description }))
  )
};

const makeDefaultedPositiveIntField = (name: string, fallback: number, description: string) =>
{
  const thunkFallback = () => fallback;
  const thunkFallbackToString = flow(thunkFallback, String);

  const thunkSomeFallback = flow(thunkFallback, O.some)
  return S.UndefinedOr(S.String).pipe(
    S.decodeTo(
      S.Number,
      SchemaTransformation.transform({
        decode: (value) => {
          const normalized = O.getOrElse(O.fromUndefinedOr(value), thunkFallback);
          const parsed = globalThis.Number(normalized);
          return globalThis.Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
        },
        encode: (value) => `${value}`,
      })
    ),
    S.withConstructorDefault(thunkSomeFallback),
    S.withDecodingDefault(thunkFallbackToString),
    S.annotate($I.annote(name, { description }))
  )
};

const makeDefaultedBooleanField = (name: string, fallback: boolean, description: string) =>
  S.UndefinedOr(S.String).pipe(
    S.decodeTo(
      S.Boolean,
      SchemaTransformation.transform({
        decode: (value) => {
          const normalized = pipe(
            O.getOrElse(O.fromUndefinedOr(value), () => Bool.match(fallback, { onTrue: () => "true", onFalse: () => "false" })),
            Str.trim,
            Str.toLowerCase
          );

          return Bool.match(HashSet.has(TruthyBooleanString, normalized), {
            onTrue: () => true,
            onFalse: () =>
              Bool.match(HashSet.has(FalseyBooleanString, normalized), {
                onTrue: () => false,
                onFalse: () => fallback,
              }),
          });
        },
        encode: (value) => Bool.match(value, { onTrue: () => "true", onFalse: () => "false" }),
      })
    ),
    S.withConstructorDefault(() => O.some(fallback)),
    S.withDecodingDefault(() => Bool.match(fallback, { onTrue: () => "true", onFalse: () => "false" })),
    S.annotate($I.annote(name, { description }))
  );

const makeDefaultedUrlField = (name: string, fallback: string, description: string) =>
  S.UndefinedOr(S.String).pipe(
    S.decodeTo(
      S.String,
      SchemaTransformation.transform({
        decode: (value) => {
          const candidate = O.getOrElse(O.fromUndefinedOr(value), () => fallback);
          return URL.canParse(candidate) ? new URL(candidate).href : fallback;
        },
        encode: (value) => value,
      })
    ),
    S.withConstructorDefault(() => O.some(fallback)),
    S.withDecodingDefault(() => fallback),
    S.annotate($I.annote(name, { description }))
  );

class GraphitiProxyConfig extends S.Class<GraphitiProxyConfig>($I`GraphitiProxyConfig`)(
  {
    listenHost: makeDefaultedStringField(
      "GraphitiProxyListenHost",
      "127.0.0.1",
      "Proxy listen host for Graphiti queue proxy."
    ),
    listenPort: makeDefaultedPositiveIntField(
      "GraphitiProxyListenPort",
      8123,
      "Proxy listen port for Graphiti queue proxy."
    ),
    concurrency: makeDefaultedPositiveIntField(
      "GraphitiProxyConcurrency",
      1,
      "Maximum concurrent upstream requests processed by the proxy."
    ),
    maxQueue: makeDefaultedPositiveIntField(
      "GraphitiProxyMaxQueue",
      500,
      "Maximum queue depth before requests are rejected."
    ),
    requestTimeoutMs: makeDefaultedPositiveIntField(
      "GraphitiProxyRequestTimeoutMs",
      60_000,
      "Request timeout in milliseconds for upstream forwarding."
    ),
    verbose: makeDefaultedBooleanField("GraphitiProxyVerbose", false, "Enable verbose debug logging output."),
    dependencyHealthEnabled: makeDefaultedBooleanField(
      "GraphitiProxyDependencyHealthEnabled",
      true,
      "Enable dependency health checks against Graphiti backing containers."
    ),
    dependencyHealthTtlMs: makeDefaultedPositiveIntField(
      "GraphitiProxyDependencyHealthTtlMs",
      5_000,
      "Cached dependency health TTL in milliseconds."
    ),
    falkorContainer: makeDefaultedStringField(
      "GraphitiProxyFalkorContainer",
      "graphiti-mcp-falkordb-1",
      "Falkor container name used for dependency health checks."
    ),
    graphitiContainer: makeDefaultedStringField(
      "GraphitiProxyGraphitiContainer",
      "graphiti-mcp-graphiti-mcp-1",
      "Graphiti container name used for dependency health checks."
    ),
    upstream: makeDefaultedUrlField(
      "GraphitiProxyUpstream",
      "http://127.0.0.1:8000/mcp",
      "Upstream Graphiti MCP endpoint URL for proxied requests."
    ),
  },
  $I.annote("GraphitiProxyConfig", {
    description: "Runtime configuration for Graphiti queue proxy command.",
  })
) {}

const decodeGraphitiProxyConfig = S.decodeUnknownSync(GraphitiProxyConfig);
const encodeUnknownToJsonString = S.encodeUnknownSync(S.UnknownFromJsonString);
const UrlSearchParamsSchema = S.instanceOf(URLSearchParams).pipe(
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
    $I.annote("UrlSearchParamsSchema", {
      description: "Schema transformation from URLSearchParams into Effect UrlParams.",
    })
  )
);
const decodeUrlSearchParams = S.decodeUnknownSync(UrlSearchParamsSchema);

type QueueItem = {
  readonly request: Request;
  readonly resolve: (response: QueueResponse) => void;
};

type QueueResponse = {
  readonly response: HttpClientResponse.HttpClientResponse;
  readonly headers: Headers.Headers;
};

type DependencyHealthState = "unknown" | "ok" | "degraded";
type ContainerHealthState = "unknown" | "healthy" | "unhealthy" | "starting";

const toHttpMethod = (method: string): HttpMethod.HttpMethod => {
  const normalized = pipe(method, Str.toUpperCase);
  return HttpMethod.isHttpMethod(normalized) ? normalized : "GET";
};

const asWebResponse = ({ response, headers }: QueueResponse): Promise<Response> =>
  Effect.gen(function* () {
    const body = yield* Effect.orElseSucceed(response.arrayBuffer, () => new ArrayBuffer(0));
    return new Response(body, {
      status: response.status,
      headers,
    });
  }).pipe(Effect.runPromise);

const jsonResponse = (payload: unknown, init: ResponseInit): QueueResponse => {
  const headers = pipe(Headers.fromInput(init.headers), Headers.set("content-type", "application/json"));
  const request = HttpClientRequest.get("http://graphiti-proxy.local/internal");
  const response = HttpClientResponse.fromWeb(
    request,
    new Response(encodeUnknownToJsonString(payload), {
      ...init,
      headers,
    })
  );
  return {
    response,
    headers: response.headers,
  };
};

/**
 * Graphiti queue proxy subcommand.
 *
 * @since 0.0.0
 * @category UseCase
 */
const graphitiProxyCommand = Command.make(
  "proxy",
  {},
  Effect.fn(function* () {
    yield* Effect.sync(() => {
      const config = decodeGraphitiProxyConfig({
        listenHost: process.env.GRAPHITI_PROXY_HOST,
        listenPort: process.env.GRAPHITI_PROXY_PORT,
        concurrency: process.env.GRAPHITI_PROXY_CONCURRENCY,
        maxQueue: process.env.GRAPHITI_PROXY_MAX_QUEUE,
        requestTimeoutMs: process.env.GRAPHITI_PROXY_REQUEST_TIMEOUT_MS,
        verbose: process.env.GRAPHITI_PROXY_VERBOSE,
        dependencyHealthEnabled: process.env.GRAPHITI_PROXY_DEPENDENCY_HEALTH_ENABLED,
        dependencyHealthTtlMs: process.env.GRAPHITI_PROXY_DEPENDENCY_HEALTH_TTL_MS,
        falkorContainer: process.env.GRAPHITI_PROXY_FALKOR_CONTAINER,
        graphitiContainer: process.env.GRAPHITI_PROXY_GRAPHITI_CONTAINER,
        upstream: process.env.GRAPHITI_PROXY_UPSTREAM,
      });
      const upstreamBase = new URL(config.upstream);

      const state = {
        active: 0,
        queue: [] as Array<QueueItem>,
        peakQueueDepth: 0,
        processed: 0,
        failed: 0,
        rejected: 0,
      };

      const dependencyState = {
        checkedAtMs: 0,
        status: "unknown" as DependencyHealthState,
        details: {
          falkor: "unknown" as ContainerHealthState,
          graphiti: "unknown" as ContainerHealthState,
        },
      };

      const logger = {
        info: (message: string) => {
          console.log(`[graphiti-proxy] ${message}`);
        },
        debug: (message: string) => {
          if (config.verbose) {
            console.log(`[graphiti-proxy:debug] ${message}`);
          }
        },
        error: (message: string) => {
          console.error(`[graphiti-proxy:error] ${message}`);
        },
      };

      const queueStats = () => ({
        active: state.active,
        queued: state.queue.length,
        peakQueueDepth: state.peakQueueDepth,
        processed: state.processed,
        failed: state.failed,
        rejected: state.rejected,
        concurrency: config.concurrency,
        maxQueue: config.maxQueue,
        upstream: upstreamBase.href,
      });

      const readContainerHealth = (containerName: string): ContainerHealthState => {
        if (!config.dependencyHealthEnabled) {
          return "unknown";
        }

        const result = Bun.spawnSync({
          cmd: ["docker", "inspect", "--format", "{{.State.Health.Status}}", containerName],
          stdout: "pipe",
          stderr: "pipe",
        });

        if (!result.success) {
          return "unknown";
        }

        const value = pipe(new TextDecoder("utf-8").decode(result.stdout), Str.trim, Str.toLowerCase);
        if (value === "healthy" || value === "unhealthy" || value === "starting") {
          return value as ContainerHealthState;
        }
        return "unknown";
      };

      const currentDependencySnapshot = () => {
        const nowMs = performance.now();
        if (nowMs - dependencyState.checkedAtMs < config.dependencyHealthTtlMs) {
          return {
            status: dependencyState.status,
            details: dependencyState.details,
          };
        }

        const falkor = readContainerHealth(config.falkorContainer);
        const graphiti = readContainerHealth(config.graphitiContainer);
        const status: "ok" | "degraded" =
          config.dependencyHealthEnabled && (falkor !== "healthy" || graphiti !== "healthy") ? "degraded" : "ok";

        dependencyState.checkedAtMs = nowMs;
        dependencyState.status = status;
        dependencyState.details = {
          falkor,
          graphiti,
        };

        return {
          status,
          details: dependencyState.details,
        };
      };

      const healthResponse = () => {
        const dependency = currentDependencySnapshot();
        const status = dependency.status === "ok" ? "ok" : "degraded";
        const statusCode = status === "ok" ? 200 : 503;

        return jsonResponse(
          {
            status,
            ...queueStats(),
            dependencies: dependency.details,
          },
          {
            status: statusCode,
          }
        );
      };

      const executeUpstreamRequest = (request: HttpClientRequest.HttpClientRequest) =>
        HttpClient.execute(request).pipe(Effect.timeout(config.requestTimeoutMs), Effect.provide(BunHttpClient.layer));

      const forwardToUpstream = async (request: Request): Promise<QueueResponse> => {
        const inboundUrl = new URL(request.url);
        const destination = new URL(inboundUrl.pathname, upstreamBase);
        const urlParams = decodeUrlSearchParams(inboundUrl.searchParams);
        const headers = pipe(
          Headers.fromInput(request.headers),
          Headers.remove("host"),
          Headers.remove("connection"),
          Headers.remove("content-length")
        );

        const method = toHttpMethod(request.method);
        const hasBody = HttpMethod.hasBody(method);

        logger.debug(`forwarding ${method} ${inboundUrl.pathname} -> ${destination.href}`);

        const requestBody = hasBody ? new Uint8Array(await request.arrayBuffer()) : undefined;

        let upstreamRequest = HttpClientRequest.make(method)(destination.href, {
          headers,
          urlParams,
        });
        if (requestBody !== undefined) {
          upstreamRequest = HttpClientRequest.bodyUint8Array(upstreamRequest, requestBody, Headers.get(headers, "content-type"));
        }

        const upstreamResponse = await Effect.runPromise(executeUpstreamRequest(upstreamRequest));
        const responseHeaders = pipe(
          upstreamResponse.headers,
          Headers.set("x-graphiti-proxy-queued", `${state.queue.length}`),
          Headers.set("x-graphiti-proxy-active", `${state.active}`)
        );

        return {
          response: upstreamResponse,
          headers: responseHeaders,
        };
      };

      const runNext = (): void => {
        while (state.active < config.concurrency && state.queue.length > 0) {
          const next = state.queue.shift();
          if (next === undefined) {
            return;
          }

          state.active += 1;
          Promise.resolve()
            .then(() => forwardToUpstream(next.request))
            .then((response) => {
              state.processed += 1;
              next.resolve(response);
            })
            .catch((cause) => {
              state.failed += 1;
              const message = Inspectable.toStringUnknown(cause, 0);
              logger.error(`upstream request failed: ${message}`);
              next.resolve(
                jsonResponse(
                  {
                    error: "upstream_failure",
                    message,
                  },
                  {
                    status: 502,
                  }
                )
              );
            })
            .finally(() => {
              state.active -= 1;
              runNext();
            });
        }
      };

      const enqueueRequest = (request: Request): Promise<QueueResponse> =>
        new Promise((resolve) => {
          if (state.queue.length >= config.maxQueue) {
            state.rejected += 1;
            resolve(
              jsonResponse(
                {
                  error: "queue_full",
                  message: `Graphiti proxy queue full (max ${config.maxQueue})`,
                },
                {
                  status: 503,
                  headers: { "retry-after": "1" },
                }
              )
            );
            return;
          }

          state.queue.push({ request, resolve });
          if (state.queue.length > state.peakQueueDepth) {
            state.peakQueueDepth = state.queue.length;
          }
          runNext();
        });

      const server = Bun.serve({
        hostname: config.listenHost,
        port: config.listenPort,
        reusePort: true,
        async fetch(request) {
          const { pathname } = new URL(request.url);
          if (pathname === "/healthz" || pathname === "/metrics") {
            return asWebResponse(healthResponse());
          }

          return asWebResponse(await enqueueRequest(request));
        },
      });

      logger.info(`listening on http://${config.listenHost}:${server.port}`);
      logger.info(`forwarding to ${upstreamBase.href}`);
      logger.info(
        `queue settings concurrency=${config.concurrency} maxQueue=${config.maxQueue} timeoutMs=${config.requestTimeoutMs}`
      );
      logger.info("health endpoint: /healthz");
    });

    return yield* Effect.never;
  })
).pipe(Command.withDescription("Run the Graphiti MCP queue proxy"));

/**
 * Graphiti command group.
 *
 * @since 0.0.0
 * @category UseCase
 */
export const graphitiCommand = Command.make(
  "graphiti",
  {},
  Effect.fn(function* () {
    yield* Console.log("Graphiti commands:");
    yield* Console.log("- bun run beep graphiti proxy");
  })
).pipe(Command.withDescription("Graphiti operational commands"), Command.withSubcommands([graphitiProxyCommand]));
