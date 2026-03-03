// cspell:ignore codegraph
import { Effect, pipe, String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as R from "effect/Record";
import * as S from "effect/Schema";
import { parseBoolean, parsePositiveInt } from "../kg/transforms.js";
import { GraphitiPreflightError } from "./errors.js";

/**
 * Detect whether a host represents local loopback.
 *
 * @param host - Hostname or IP portion of a URL.
 * @returns `true` when host is a local loopback alias.
 * @category Uncategorized
 * @since 0.0.0
 */
export const isLoopbackHost = (host: string): boolean => {
  const normalized = pipe(host, Str.trim, Str.toLowerCase);
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized === "[::1]" ||
    normalized === "0.0.0.0"
  );
};

/**
 * Determine whether an MCP URL points at the local graphiti proxy route.
 *
 * @param url - Candidate MCP URL.
 * @returns `true` when URL resolves to the local Graphiti proxy MCP endpoint.
 * @category Uncategorized
 * @since 0.0.0
 */
export const isProxyGraphitiMcpUrl = (url: string): boolean => {
  if (!URL.canParse(url)) {
    return false;
  }
  const parsed = new URL(url);
  const normalizedPath = Str.endsWith("/")(parsed.pathname) ? parsed.pathname.slice(0, -1) : parsed.pathname;
  const port = parsed.port.length > 0 ? parsed.port : parsed.protocol === "https:" ? "443" : "80";
  return isLoopbackHost(parsed.hostname) && port === "8123" && normalizedPath === "/mcp";
};

const isRecord = (value: unknown): value is Record<string, unknown> => P.isObject(value) && !A.isArray(value);
const decodeJson = S.decodeUnknownOption(S.UnknownFromJsonString);

const readNestedString = (value: unknown, path: ReadonlyArray<string>): O.Option<string> => {
  return pipe(
    path,
    A.reduce(O.some(value) as O.Option<unknown>, (current, key) =>
      pipe(current, O.filter(isRecord), O.flatMap(R.get(key)))
    ),
    O.filter(P.isString)
  );
};

const parseHealthPayload = (body: string): O.Option<Record<string, unknown>> =>
  pipe(body, decodeJson, O.filter(isRecord));

/**
 * Ensure local graphiti proxy is healthy before MCP operations.
 *
 * @param graphitiUrl - MCP URL used for Graphiti operations.
 * @returns Effect that succeeds when preflight passes or is disabled.
 * @category Uncategorized
 * @since 0.0.0
 */
export const ensureGraphitiProxyPreflight = Effect.fn("Graphiti.ensureGraphitiProxyPreflight")(function* (
  graphitiUrl: string
) {
  const preflightEnabled = parseBoolean(O.fromNullishOr(process.env.BEEP_GRAPHITI_PROXY_PREFLIGHT), true);
  if (!preflightEnabled || !isProxyGraphitiMcpUrl(graphitiUrl)) {
    return;
  }

  const timeoutMs = parsePositiveInt(O.fromNullishOr(process.env.BEEP_GRAPHITI_PREFLIGHT_TIMEOUT_MS), 3_000);
  const healthUrl = new URL("/healthz", graphitiUrl).toString();

  const response = yield* Effect.tryPromise({
    try: () =>
      fetch(healthUrl, {
        method: "GET",
        signal: AbortSignal.timeout(timeoutMs),
      }),
    catch: (cause) =>
      new GraphitiPreflightError({
        message: `Graphiti proxy preflight failed: unable to reach ${healthUrl} within ${String(timeoutMs)}ms.`,
        cause,
      }),
  });

  const responseText = yield* Effect.tryPromise({
    try: () => response.text(),
    catch: (cause) =>
      new GraphitiPreflightError({
        message: `Graphiti proxy preflight failed: unable to read ${healthUrl} response body.`,
        cause,
      }),
  });

  if (!response.ok) {
    return yield* new GraphitiPreflightError({
      message: `Graphiti proxy preflight failed: ${healthUrl} returned HTTP ${String(response.status)}.`,
    });
  }

  const payload = parseHealthPayload(responseText);
  if (O.isNone(payload)) {
    return;
  }

  const status = readNestedString(payload.value, ["status"]);
  if (O.isSome(status) && status.value !== "ok") {
    return yield* new GraphitiPreflightError({
      message: `Graphiti proxy preflight failed: ${healthUrl} reported status '${status.value}'.`,
    });
  }

  const falkor = readNestedString(payload.value, ["dependencies", "falkor"]);
  const graphiti = readNestedString(payload.value, ["dependencies", "graphiti"]);
  const unhealthy =
    (O.isSome(falkor) && falkor.value !== "healthy") || (O.isSome(graphiti) && graphiti.value !== "healthy");

  if (unhealthy) {
    return yield* new GraphitiPreflightError({
      message: `Graphiti dependency unhealthy (falkor=${O.getOrElse(falkor, () => "unknown")}, graphiti=${O.getOrElse(graphiti, () => "unknown")}).`,
    });
  }
});
