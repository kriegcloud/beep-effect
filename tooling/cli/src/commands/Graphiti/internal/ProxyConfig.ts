/**
 * Graphiti proxy runtime configuration.
 *
 * @module
 * @since 0.0.0
 */

import { $RepoCliId } from "@beep/identity/packages";
import { NormalizedBooleanString, TaggedErrorClass } from "@beep/schema";
import { Config, Effect, SchemaGetter } from "effect";
import * as Bool from "effect/Boolean";
import * as O from "effect/Option";
import * as S from "effect/Schema";

const $I = $RepoCliId.create("commands/Graphiti/internal/ProxyConfig");

const makeDefaultedStringField = (name: string, fallback: string, description: string) =>
  S.UndefinedOr(S.String).pipe(
    S.decodeTo(S.String, {
      decode: SchemaGetter.transform((value: string | undefined) =>
        O.getOrElse(O.fromUndefinedOr(value), () => fallback)
      ),
      encode: SchemaGetter.transform((value: string) => value),
    }),
    S.withConstructorDefault(Effect.succeed(fallback)),
    S.withDecodingDefault(Effect.succeed(fallback)),
    S.annotate($I.annote(name, { description }))
  );

const makeDefaultedPositiveIntField = (name: string, fallback: number, description: string) =>
  S.UndefinedOr(S.String).pipe(
    S.decodeTo(S.Number, {
      decode: SchemaGetter.transform((value: string | undefined) => {
        const normalized = O.getOrElse(O.fromUndefinedOr(value), () => `${fallback}`);
        const parsed = globalThis.Number(normalized);
        return globalThis.Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
      }),
      encode: SchemaGetter.transform((value: number) => `${value}`),
    }),
    S.withConstructorDefault(Effect.succeed(fallback)),
    S.withDecodingDefault(Effect.succeed(`${fallback}`)),
    S.annotate($I.annote(name, { description }))
  );

const makeDefaultedBooleanField = (name: string, fallback: boolean, description: string) =>
  S.UndefinedOr(S.String).pipe(
    S.decodeTo(S.Boolean, {
      decode: SchemaGetter.transform((value: string | undefined) => {
        const raw = O.getOrElse(O.fromUndefinedOr(value), () =>
          Bool.match(fallback, { onTrue: () => "true", onFalse: () => "false" })
        );
        return O.getOrElse(S.decodeUnknownOption(NormalizedBooleanString)(raw), () => fallback);
      }),
      encode: SchemaGetter.transform((value: boolean) =>
        Bool.match(value, { onTrue: () => "true", onFalse: () => "false" })
      ),
    }),
    S.withConstructorDefault(Effect.succeed(fallback)),
    S.withDecodingDefault(Effect.succeed(Bool.match(fallback, { onTrue: () => "true", onFalse: () => "false" }))),
    S.annotate($I.annote(name, { description }))
  );

const makeDefaultedUrlField = (name: string, fallback: string, description: string) =>
  S.UndefinedOr(S.String).pipe(
    S.decodeTo(S.String, {
      decode: SchemaGetter.transform((value: string | undefined) => {
        const candidate = O.getOrElse(O.fromUndefinedOr(value), () => fallback);
        return URL.canParse(candidate) ? new URL(candidate).href : fallback;
      }),
      encode: SchemaGetter.transform((value: string) => value),
    }),
    S.withConstructorDefault(Effect.succeed(fallback)),
    S.withDecodingDefault(Effect.succeed(fallback)),
    S.annotate($I.annote(name, { description }))
  );

class GraphitiProxyConfigInput extends S.Class<GraphitiProxyConfigInput>($I`GraphitiProxyConfigInput`)(
  {
    listenHost: S.optionalKey(S.String),
    listenPort: S.optionalKey(S.String),
    concurrency: S.optionalKey(S.String),
    maxQueue: S.optionalKey(S.String),
    requestTimeoutMs: S.optionalKey(S.String),
    shutdownDrainTimeoutMs: S.optionalKey(S.String),
    verbose: S.optionalKey(S.String),
    dependencyHealthEnabled: S.optionalKey(S.String),
    dependencyHealthTtlMs: S.optionalKey(S.String),
    falkorContainer: S.optionalKey(S.String),
    graphitiContainer: S.optionalKey(S.String),
    upstream: S.optionalKey(S.String),
  },
  $I.annote("GraphitiProxyConfigInput", {
    description: "Raw optional environment values before GraphitiProxyConfig decoding defaults are applied.",
  })
) {}

/**
 * Runtime configuration schema for graphiti proxy.
 *
 * @category DomainModel
 * @since 0.0.0
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
 * @category DomainModel
 * @since 0.0.0
 */
export class GraphitiProxyConfigLoadError extends TaggedErrorClass<GraphitiProxyConfigLoadError>(
  $I`GraphitiProxyConfigLoadError`
)(
  "GraphitiProxyConfigLoadError",
  {
    message: S.String,
    cause: S.optionalKey(S.Defect),
  },
  $I.annote("GraphitiProxyConfigLoadError", {
    description: "Raised when graphiti proxy config cannot be decoded from Effect Config values.",
  })
) {}

const decodeGraphitiProxyConfig = S.decodeUnknownSync(GraphitiProxyConfig);

/**
 * Load graphiti proxy config from Effect Config environment values.
 *
 * @category DomainModel
 * @since 0.0.0
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
