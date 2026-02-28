/**
 * Minimal MCP HTTP helpers for Graphiti add/search calls.
 *
 * @since 0.0.0
 * @module
 */

import { execFile } from "node:child_process";
import * as os from "node:os";
import { promisify } from "node:util";
import { AgentEvalProtocolError } from "../errors.js";

/**
 * Graphiti client options.
 *
 * @since 0.0.0
 * @category models
 */
export interface GraphitiMcpOptions {
  readonly url: string;
  readonly groupId: string;
}

interface GraphitiGuardConfig {
  readonly serialize: boolean;
  readonly lockDir: string;
  readonly lockTimeoutMs: number;
  readonly retryAttempts: number;
  readonly retryBaseMs: number;
  readonly retryMaxMs: number;
  readonly retryJitterMs: number;
  readonly requestTimeoutMs: number;
  readonly preflightEnabled: boolean;
  readonly preflightTimeoutMs: number;
  readonly preflightTtlMs: number;
  readonly circuitEnabled: boolean;
  readonly circuitFailureThreshold: number;
  readonly circuitOpenMs: number;
}

type GraphitiToolName = "search_memory_facts" | "add_memory";

const SessionByUrl = new Map<string, string>();
const CircuitByUrl = new Map<string, { readonly consecutiveFailures: number; readonly openUntilMs: number }>();
const PreflightByUrl = new Map<string, number>();
const execFileAsync = promisify(execFile);

const parseFactsFromJsonText = (text: string): ReadonlyArray<string> => {
  const regex = /"fact"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/g;
  const facts: Array<string> = [];

  for (const match of text.matchAll(regex)) {
    const value = match[1] ?? "";
    if (!facts.includes(value)) {
      facts.push(value);
    }
  }

  return facts;
};

const parsePositiveInt = (value: string | undefined, fallback: number): number => {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) {
    return fallback;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1" || normalized === "yes" || normalized === "on") {
    return true;
  }
  if (normalized === "false" || normalized === "0" || normalized === "no" || normalized === "off") {
    return false;
  }

  return fallback;
};

const getGuardConfig = (): GraphitiGuardConfig => ({
  serialize: parseBoolean(process.env.BEEP_GRAPHITI_SERIALIZE, true),
  lockDir: process.env.BEEP_GRAPHITI_LOCK_DIR ?? `${os.tmpdir()}/beep-graphiti-memory.lock`,
  lockTimeoutMs: parsePositiveInt(process.env.BEEP_GRAPHITI_LOCK_TIMEOUT_MS, 45_000),
  retryAttempts: parsePositiveInt(process.env.BEEP_GRAPHITI_RETRY_ATTEMPTS, 5),
  retryBaseMs: parsePositiveInt(process.env.BEEP_GRAPHITI_RETRY_BASE_MS, 200),
  retryMaxMs: parsePositiveInt(process.env.BEEP_GRAPHITI_RETRY_MAX_MS, 2_000),
  retryJitterMs: parsePositiveInt(process.env.BEEP_GRAPHITI_RETRY_JITTER_MS, 125),
  requestTimeoutMs: parsePositiveInt(process.env.BEEP_GRAPHITI_REQUEST_TIMEOUT_MS, 2_500),
  preflightEnabled: parseBoolean(process.env.BEEP_GRAPHITI_PREFLIGHT, true),
  preflightTimeoutMs: parsePositiveInt(process.env.BEEP_GRAPHITI_PREFLIGHT_TIMEOUT_MS, 2_000),
  preflightTtlMs: parsePositiveInt(process.env.BEEP_GRAPHITI_PREFLIGHT_TTL_MS, 5_000),
  circuitEnabled: parseBoolean(process.env.BEEP_GRAPHITI_CIRCUIT_ENABLED, true),
  circuitFailureThreshold: parsePositiveInt(process.env.BEEP_GRAPHITI_CIRCUIT_FAILURE_THRESHOLD, 1),
  circuitOpenMs: parsePositiveInt(process.env.BEEP_GRAPHITI_CIRCUIT_OPEN_MS, 60_000),
});

const toProtocolError = (message: string, cause?: unknown): AgentEvalProtocolError =>
  new AgentEvalProtocolError({
    message,
    cause,
  });

const sleep = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const jitteredBackoffMs = (config: GraphitiGuardConfig, attempt: number): number => {
  const exponential = config.retryBaseMs * 2 ** Math.max(0, attempt - 1);
  const capped = Math.min(exponential, config.retryMaxMs);
  const jitter = Math.floor(Math.random() * config.retryJitterMs);
  return capped + jitter;
};

const withRetry = async <A>(label: string, run: () => Promise<A>, resetState: () => void): Promise<A> => {
  const config = getGuardConfig();
  let lastFailure: unknown = undefined;

  for (let attempt = 1; attempt <= config.retryAttempts; attempt += 1) {
    try {
      return await run();
    } catch (cause) {
      lastFailure = cause;
      resetState();
      if (attempt >= config.retryAttempts) {
        break;
      }
      await sleep(jitteredBackoffMs(config, attempt));
    }
  }

  if (lastFailure instanceof AgentEvalProtocolError) {
    throw lastFailure;
  }
  throw toProtocolError(`Graphiti ${label} failed after ${String(config.retryAttempts)} attempts`, lastFailure);
};

const getCommandErrorText = (cause: unknown): string => {
  if (typeof cause !== "object" || cause === null) {
    return "";
  }

  if ("stderr" in cause && typeof cause.stderr === "string") {
    return cause.stderr;
  }

  if ("message" in cause && typeof cause.message === "string") {
    return cause.message;
  }

  return "";
};

const createLockDir = async (lockDir: string): Promise<boolean> => {
  try {
    await execFileAsync("mkdir", [lockDir]);
    return true;
  } catch (cause) {
    const errorText = getCommandErrorText(cause);
    if (errorText.includes("File exists")) {
      return false;
    }
    throw toProtocolError(`Unable to acquire Graphiti lock at ${lockDir}`, cause);
  }
};

const removeLockDir = async (lockDir: string): Promise<void> => {
  try {
    await execFileAsync("rmdir", [lockDir]);
  } catch {
    // Best effort lock cleanup.
  }
};

const acquireGlobalLock = async (): Promise<() => Promise<void>> => {
  const config = getGuardConfig();
  if (!config.serialize) {
    return async () => {};
  }

  const startedAtMs = Date.now();
  for (;;) {
    const created = await createLockDir(config.lockDir);
    if (created) {
      return async () => {
        await removeLockDir(config.lockDir);
      };
    }

    if (Date.now() - startedAtMs >= config.lockTimeoutMs) {
      throw toProtocolError(
        `Timed out waiting for Graphiti lock at ${config.lockDir} after ${String(config.lockTimeoutMs)}ms`
      );
    }

    await sleep(50 + Math.floor(Math.random() * 50));
  }
};

const withGlobalLock = async <A>(run: () => Promise<A>): Promise<A> => {
  const release = await acquireGlobalLock();
  try {
    return await run();
  } finally {
    await release();
  }
};

const invalidateSession = (url: string): void => {
  SessionByUrl.delete(url);
};

const getCircuitState = (url: string): { readonly consecutiveFailures: number; readonly openUntilMs: number } =>
  CircuitByUrl.get(url) ?? { consecutiveFailures: 0, openUntilMs: 0 };

const isCircuitOpen = (url: string, nowMs: number): boolean => getCircuitState(url).openUntilMs > nowMs;

const clearCircuitState = (url: string): void => {
  CircuitByUrl.set(url, { consecutiveFailures: 0, openUntilMs: 0 });
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const recordCircuitFailure = (config: GraphitiGuardConfig, url: string, nowMs: number): void => {
  if (!config.circuitEnabled) {
    return;
  }

  const current = getCircuitState(url);
  const consecutiveFailures = current.consecutiveFailures + 1;
  const openUntilMs =
    consecutiveFailures >= config.circuitFailureThreshold ? nowMs + config.circuitOpenMs : current.openUntilMs;
  CircuitByUrl.set(url, { consecutiveFailures, openUntilMs });
};

const recordCircuitSuccess = (config: GraphitiGuardConfig, url: string): void => {
  if (!config.circuitEnabled) {
    return;
  }
  const current = getCircuitState(url);
  if (current.consecutiveFailures !== 0 || current.openUntilMs !== 0) {
    clearCircuitState(url);
  }
};

const isLoopbackHost = (host: string): boolean => {
  const normalized = host.trim().toLowerCase();
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1" ||
    normalized === "[::1]" ||
    normalized === "0.0.0.0"
  );
};

const toHealthUrl = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    if (!isLoopbackHost(parsed.hostname)) {
      return null;
    }
    const normalizedPath = parsed.pathname.replace(/\/+$/, "");
    if (normalizedPath !== "/mcp") {
      return null;
    }
    return new URL("/healthz", parsed).toString();
  } catch {
    return null;
  }
};

const readNestedString = (value: unknown, path: ReadonlyArray<string>): string | undefined => {
  let current: unknown = value;
  for (const key of path) {
    if (!isRecord(current)) {
      return undefined;
    }
    current = current[key];
  }
  return typeof current === "string" ? current : undefined;
};

const ensureProxyPreflight = async (config: GraphitiGuardConfig, url: string): Promise<void> => {
  if (!config.preflightEnabled) {
    return;
  }

  const healthUrl = toHealthUrl(url);
  if (healthUrl === null) {
    return;
  }

  const nowMs = Date.now();
  const lastCheckedAt = PreflightByUrl.get(url);
  if (lastCheckedAt !== undefined && nowMs - lastCheckedAt <= config.preflightTtlMs) {
    return;
  }

  let response: Response;
  try {
    response = await fetch(healthUrl, {
      method: "GET",
      signal: AbortSignal.timeout(config.preflightTimeoutMs),
    });
  } catch (cause) {
    throw toProtocolError(
      `Graphiti proxy preflight failed: ${healthUrl} unreachable within ${String(config.preflightTimeoutMs)}ms`,
      cause
    );
  }

  const responseText = await response.text();
  if (!response.ok) {
    throw toProtocolError(`Graphiti proxy preflight failed: HTTP ${String(response.status)} from ${healthUrl}`);
  }

  try {
    const parsed = JSON.parse(responseText);
    const status = readNestedString(parsed, ["status"]);
    const falkor = readNestedString(parsed, ["dependencies", "falkor"]);
    const graphiti = readNestedString(parsed, ["dependencies", "graphiti"]);
    if (status !== undefined && status !== "ok") {
      throw toProtocolError(
        `Graphiti proxy preflight reported status=${status} (falkor=${falkor ?? "unknown"}, graphiti=${graphiti ?? "unknown"})`
      );
    }
    if ((falkor !== undefined && falkor !== "healthy") || (graphiti !== undefined && graphiti !== "healthy")) {
      throw toProtocolError(
        `Graphiti dependency unhealthy (falkor=${falkor ?? "unknown"}, graphiti=${graphiti ?? "unknown"})`
      );
    }
  } catch (cause) {
    if (cause instanceof AgentEvalProtocolError) {
      throw cause;
    }
  }

  PreflightByUrl.set(url, nowMs);
};

const isTimeoutError = (cause: unknown): boolean => {
  if (typeof cause !== "object" || cause === null) {
    return false;
  }

  const name = "name" in cause && typeof cause.name === "string" ? cause.name.toLowerCase() : "";
  const message = "message" in cause && typeof cause.message === "string" ? cause.message.toLowerCase() : "";

  return (
    name.includes("timeout") ||
    name.includes("abort") ||
    message.includes("timeout") ||
    message.includes("timed out") ||
    message.includes("aborted")
  );
};

const postMcp = async (
  config: GraphitiGuardConfig,
  url: string,
  headers: Record<string, string>,
  payload: unknown,
  operation: string
): Promise<Response> => {
  try {
    return await fetch(url, {
      method: "POST",
      headers: {
        accept: "application/json, text/event-stream",
        ...headers,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(config.requestTimeoutMs),
    });
  } catch (cause) {
    if (isTimeoutError(cause)) {
      throw toProtocolError(`Graphiti ${operation} timed out after ${String(config.requestTimeoutMs)}ms`, cause);
    }
    throw toProtocolError(`Graphiti ${operation} request failed`, cause);
  }
};

const ensureOk = async (response: Response, operation: string): Promise<void> => {
  if (response.ok) {
    return;
  }
  const body = await response.text();
  throw toProtocolError(`Graphiti ${operation} returned HTTP ${String(response.status)}: ${body}`);
};

const initializeSession = async (config: GraphitiGuardConfig, url: string): Promise<string> => {
  const cached = SessionByUrl.get(url);
  if (cached !== undefined) {
    return cached;
  }

  const initializeResponse = await postMcp(
    config,
    url,
    { "content-type": "application/json" },
    {
      jsonrpc: "2.0",
      id: "initialize",
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "agent-eval",
          version: "0.0.0",
        },
      },
    },
    "initialize"
  );
  await ensureOk(initializeResponse, "initialize");

  const sessionId = initializeResponse.headers.get("mcp-session-id");
  if (!sessionId) {
    throw toProtocolError("Graphiti MCP initialize missing mcp-session-id");
  }

  const initializedResponse = await postMcp(
    config,
    url,
    {
      "content-type": "application/json",
      "mcp-session-id": sessionId,
    },
    {
      jsonrpc: "2.0",
      method: "notifications/initialized",
    },
    "initialized notification"
  );
  await ensureOk(initializedResponse, "initialized notification");

  SessionByUrl.set(url, sessionId);
  return sessionId;
};

const callTool = async (
  config: GraphitiGuardConfig,
  url: string,
  sessionId: string,
  toolName: GraphitiToolName,
  args: unknown
): Promise<string> => {
  const response = await postMcp(
    config,
    url,
    {
      "content-type": "application/json",
      "mcp-session-id": sessionId,
    },
    {
      jsonrpc: "2.0",
      id: `${toolName}-call`,
      method: "tools/call",
      params: {
        name: toolName,
        arguments: args,
      },
    },
    `${toolName} tool call`
  );
  await ensureOk(response, `${toolName} tool call`);
  return response.text();
};

const executeTool = async (options: GraphitiMcpOptions, toolName: GraphitiToolName, args: unknown): Promise<string> => {
  const config = getGuardConfig();
  await ensureProxyPreflight(config, options.url);
  return withGlobalLock(() => {
    return withRetry(
      `${toolName} operation`,
      async () => {
        const sessionId = await initializeSession(config, options.url);
        try {
          return await callTool(config, options.url, sessionId, toolName, args);
        } catch (cause) {
          invalidateSession(options.url);
          throw cause;
        }
      },
      () => {
        invalidateSession(options.url);
      }
    );
  });
};

/**
 * Search memory facts from Graphiti via MCP HTTP transport.
 *
 * @param options - Graphiti MCP endpoint and group configuration.
 * @param query - Search query string sent to the Graphiti memory tool.
 * @param maxFacts - Maximum number of facts requested from Graphiti.
 * @returns Deduplicated fact strings extracted from the MCP response text.
 * @since 0.0.0
 * @category functions
 */
export const searchMemoryFacts = async (
  options: GraphitiMcpOptions,
  query: string,
  maxFacts: number
): Promise<ReadonlyArray<string>> => {
  const config = getGuardConfig();
  const nowMs = Date.now();
  if (config.circuitEnabled && isCircuitOpen(options.url, nowMs)) {
    return [];
  }

  try {
    const text = await executeTool(options, "search_memory_facts", {
      query,
      group_ids: [options.groupId],
      max_facts: maxFacts,
    });
    recordCircuitSuccess(config, options.url);
    return parseFactsFromJsonText(text);
  } catch (cause) {
    recordCircuitFailure(config, options.url, nowMs);
    throw cause;
  }
};

/**
 * Add a structured memory episode to Graphiti via MCP HTTP transport.
 *
 * @param options - Graphiti MCP endpoint and group configuration.
 * @param name - Episode title used as the Graphiti memory name.
 * @param episodeBody - Full episode content to persist in Graphiti memory.
 * @returns Resolves when the add-memory tool call completes.
 * @since 0.0.0
 * @category functions
 */
export const addMemoryEpisode = async (
  options: GraphitiMcpOptions,
  name: string,
  episodeBody: string
): Promise<void> => {
  await executeTool(options, "add_memory", {
    name,
    episode_body: episodeBody,
    group_id: options.groupId,
    source: "text",
    source_description: "agent-eval benchmark run",
  });
};
