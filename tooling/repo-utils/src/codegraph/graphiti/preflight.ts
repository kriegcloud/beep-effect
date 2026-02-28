import { pipe, String as Str } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import { parseBoolean, parsePositiveInt } from "../kg/transforms.js";
import { GraphitiPreflightError } from "./errors.js";

/**
 * Detect whether a host represents local loopback.
 *
 * @param host - Hostname or IP portion of a URL.
 * @returns `true` when host is a local loopback alias.
 *
 * @category codegraph-graphiti
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
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export const isProxyGraphitiMcpUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    const normalizedPath = parsed.pathname.endsWith("/") ? parsed.pathname.slice(0, -1) : parsed.pathname;
    const port = parsed.port.length > 0 ? parsed.port : parsed.protocol === "https:" ? "443" : "80";
    return isLoopbackHost(parsed.hostname) && port === "8123" && normalizedPath === "/mcp";
  } catch {
    return false;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> => P.isObject(value) && !A.isArray(value);

const readNestedString = (value: unknown, path: ReadonlyArray<string>): O.Option<string> => {
  let current: unknown = value;
  for (const key of path) {
    if (!isRecord(current)) {
      return O.none();
    }
    current = current[key];
  }
  return P.isString(current) ? O.some(current) : O.none();
};

const parseHealthPayload = (body: string): O.Option<Record<string, unknown>> => {
  const parseJson = S.decodeUnknownSync(S.UnknownFromJsonString);
  let decoded: unknown;
  try {
    decoded = parseJson(body);
  } catch {
    return O.none();
  }
  return isRecord(decoded) ? O.some(decoded) : O.none();
};

/**
 * Ensure local graphiti proxy is healthy before MCP operations.
 *
 * @param graphitiUrl - MCP URL used for Graphiti operations.
 * @returns Resolves when preflight passes or is disabled.
 *
 * @category codegraph-graphiti
 * @since 0.0.0
 */
export const ensureGraphitiProxyPreflight = async (graphitiUrl: string): Promise<void> => {
  const preflightEnabled = parseBoolean(O.fromNullishOr(process.env.BEEP_GRAPHITI_PROXY_PREFLIGHT), true);
  if (!preflightEnabled || !isProxyGraphitiMcpUrl(graphitiUrl)) {
    return;
  }

  const timeoutMs = parsePositiveInt(O.fromNullishOr(process.env.BEEP_GRAPHITI_PREFLIGHT_TIMEOUT_MS), 3_000);
  const healthUrl = new URL("/healthz", graphitiUrl).toString();

  let response: Response;
  try {
    response = await fetch(healthUrl, {
      method: "GET",
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (cause) {
    throw new GraphitiPreflightError({
      message: `Graphiti proxy preflight failed: unable to reach ${healthUrl} within ${String(timeoutMs)}ms.`,
      cause,
    });
  }

  const responseText = await response.text();
  if (!response.ok) {
    throw new GraphitiPreflightError({
      message: `Graphiti proxy preflight failed: ${healthUrl} returned HTTP ${String(response.status)}.`,
    });
  }

  const payload = parseHealthPayload(responseText);
  if (O.isNone(payload)) {
    return;
  }

  const status = readNestedString(payload.value, ["status"]);
  if (O.isSome(status) && status.value !== "ok") {
    throw new GraphitiPreflightError({
      message: `Graphiti proxy preflight failed: ${healthUrl} reported status '${status.value}'.`,
    });
  }

  const falkor = readNestedString(payload.value, ["dependencies", "falkor"]);
  const graphiti = readNestedString(payload.value, ["dependencies", "graphiti"]);
  const unhealthy =
    (O.isSome(falkor) && falkor.value !== "healthy") || (O.isSome(graphiti) && graphiti.value !== "healthy");

  if (unhealthy) {
    throw new GraphitiPreflightError({
      message: `Graphiti dependency unhealthy (falkor=${O.getOrElse(falkor, () => "unknown")}, graphiti=${O.getOrElse(graphiti, () => "unknown")}).`,
    });
  }
};
