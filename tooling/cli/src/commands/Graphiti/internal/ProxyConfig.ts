/**
 * Graphiti proxy runtime configuration.
 *
 * @since 0.0.0
 * @module
 */

import { $RepoCliId } from "@beep/identity/packages";
import { NormalizedBooleanString, TaggedErrorClass } from "@beep/schema";
import { Config, Effect, SchemaTransformation } from "effect";
import * as Bool from "effect/Boolean";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Graphiti/internal/ProxyConfig");

const makeDefaultedStringField = (name: string, fallback: string, description: string) =>
  S.UndefinedOr(S.String).pipe(
    S.decodeTo(
      S.String,
      SchemaTransformation.transform({
        decode: (value) => O.getOrElse(O.fromUndefinedOr(value), () => fallback),
        encode: (value) => value,
      })
    ),
    S.withConstructorDefault(() => O.some(fallback)),
    S.withDecodingDefault(() => fallback),
    S.annotate($I.annote(name, { description }))
  );

const makeDefaultedPositiveIntField = (name: string, fallback: number, description: string) =>
  S.UndefinedOr(S.String).pipe(
    S.decodeTo(
      S.Number,
      SchemaTransformation.transform({
        decode: (value) => {
          const normalized = O.getOrElse(O.fromUndefinedOr(value), () => `${fallback}`);
          const parsed = globalThis.Number(normalized);
          return globalThis.Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
        },
        encode: (value) => `${value}`,
      })
    ),
    S.withConstructorDefault(() => O.some(fallback)),
    S.withDecodingDefault(() => `${fallback}`),
    S.annotate($I.annote(name, { description }))
  );

const makeDefaultedBooleanField = (name: string, fallback: boolean, description: string) =>
  S.UndefinedOr(S.String).pipe(
    S.decodeTo(
      S.Boolean,
      SchemaTransformation.transform({
        decode: (value) => {
          const raw = O.getOrElse(O.fromUndefinedOr(value), () =>
            Bool.match(fallback, { onTrue: () => "true", onFalse: () => "false" })
          );
          return O.getOrElse(S.decodeUnknownOption(NormalizedBooleanString)(raw), () => fallback);
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

class GraphitiProxyConfigInput extends S.Class<GraphitiProxyConfigInput>($I`GraphitiProxyConfigInput`)(
  {
    listenHost: S.optional(S.String),
    listenPort: S.optional(S.String),
    concurrency: S.optional(S.String),
    maxQueue: S.optional(S.String),
    requestTimeoutMs: S.optional(S.String),
    shutdownDrainTimeoutMs: S.optional(S.String),
    verbose: S.optional(S.String),
    dependencyHealthEnabled: S.optional(S.String),
    dependencyHealthTtlMs: S.optional(S.String),
    falkorContainer: S.optional(S.String),
    graphitiContainer: S.optional(S.String),
    upstream: S.optional(S.String),
  },
  $I.annote("GraphitiProxyConfigInput", {
    description: "Raw optional environment values before GraphitiProxyConfig decoding defaults are applied.",
  })
) {}

/**
 * Runtime configuration schema for graphiti proxy.
 *
 * @since 0.0.0
 * @category DomainModel
 */
export class GraphitiProxyConfig extends S.Class<GraphitiProxyConfig>($I`GraphitiProxyConfig`)(
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
    shutdownDrainTimeoutMs: makeDefaultedPositiveIntField(
      "GraphitiProxyShutdownDrainTimeoutMs",
      15_000,
      "Graceful shutdown drain timeout in milliseconds."
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

/**
 * Raised when graphiti proxy configuration cannot be loaded.
 *
 * @since 0.0.0
 * @category Errors
 */
export class GraphitiProxyConfigLoadError extends TaggedErrorClass<GraphitiProxyConfigLoadError>(
  $I`GraphitiProxyConfigLoadError`
)(
  "GraphitiProxyConfigLoadError",
  {
    message: S.String,
    cause: S.optional(S.Defect),
  },
  $I.annote("GraphitiProxyConfigLoadError", {
    description: "Raised when graphiti proxy config cannot be decoded from Effect Config values.",
  })
) {}

const decodeGraphitiProxyConfig = S.decodeUnknownSync(GraphitiProxyConfig);

/**
 * Load graphiti proxy config from Effect Config environment values.
 *
 * @since 0.0.0
 * @category Constructors
 */
export const loadGraphitiProxyConfig = Effect.gen(function* () {
  const listenHost = yield* Config.option(Config.string("GRAPHITI_PROXY_HOST"));
  const listenPort = yield* Config.option(Config.string("GRAPHITI_PROXY_PORT"));
  const concurrency = yield* Config.option(Config.string("GRAPHITI_PROXY_CONCURRENCY"));
  const maxQueue = yield* Config.option(Config.string("GRAPHITI_PROXY_MAX_QUEUE"));
  const requestTimeoutMs = yield* Config.option(Config.string("GRAPHITI_PROXY_REQUEST_TIMEOUT_MS"));
  const shutdownDrainTimeoutMs = yield* Config.option(Config.string("GRAPHITI_PROXY_SHUTDOWN_DRAIN_TIMEOUT_MS"));
  const verbose = yield* Config.option(Config.string("GRAPHITI_PROXY_VERBOSE"));
  const dependencyHealthEnabled = yield* Config.option(Config.string("GRAPHITI_PROXY_DEPENDENCY_HEALTH_ENABLED"));
  const dependencyHealthTtlMs = yield* Config.option(Config.string("GRAPHITI_PROXY_DEPENDENCY_HEALTH_TTL_MS"));
  const falkorContainer = yield* Config.option(Config.string("GRAPHITI_PROXY_FALKOR_CONTAINER"));
  const graphitiContainer = yield* Config.option(Config.string("GRAPHITI_PROXY_GRAPHITI_CONTAINER"));
  const upstream = yield* Config.option(Config.string("GRAPHITI_PROXY_UPSTREAM"));

  const raw = new GraphitiProxyConfigInput({
    listenHost: O.getOrUndefined(listenHost),
    listenPort: O.getOrUndefined(listenPort),
    concurrency: O.getOrUndefined(concurrency),
    maxQueue: O.getOrUndefined(maxQueue),
    requestTimeoutMs: O.getOrUndefined(requestTimeoutMs),
    shutdownDrainTimeoutMs: O.getOrUndefined(shutdownDrainTimeoutMs),
    verbose: O.getOrUndefined(verbose),
    dependencyHealthEnabled: O.getOrUndefined(dependencyHealthEnabled),
    dependencyHealthTtlMs: O.getOrUndefined(dependencyHealthTtlMs),
    falkorContainer: O.getOrUndefined(falkorContainer),
    graphitiContainer: O.getOrUndefined(graphitiContainer),
    upstream: O.getOrUndefined(upstream),
  });

  return yield* Effect.try({
    try: () => decodeGraphitiProxyConfig(raw),
    catch: (cause) =>
      new GraphitiProxyConfigLoadError({
        message: "Failed to decode graphiti proxy config.",
        cause,
      }),
  });
});
