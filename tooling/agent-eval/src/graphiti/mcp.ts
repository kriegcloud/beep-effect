/**
 * Minimal MCP HTTP helpers for Graphiti add/search calls.
 *
 * @since 0.0.0
 * @module
 */

import { execFile } from "node:child_process";
import * as os from "node:os";
import { promisify } from "node:util";
import {
  callMcpTool,
  ensureGraphitiProxyPreflight,
  initializeMcpSession,
  parseBoolean as parseBooleanShared,
  parsePositiveInt as parsePositiveIntShared,
} from "@beep/repo-utils";
import { Effect } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
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

const getGuardConfig = (): GraphitiGuardConfig => ({
  serialize: parseBooleanShared(O.fromNullishOr(process.env.BEEP_GRAPHITI_SERIALIZE), true),
  lockDir: process.env.BEEP_GRAPHITI_LOCK_DIR ?? `${os.tmpdir()}/beep-graphiti-memory.lock`,
  lockTimeoutMs: parsePositiveIntShared(O.fromNullishOr(process.env.BEEP_GRAPHITI_LOCK_TIMEOUT_MS), 45_000),
  retryAttempts: parsePositiveIntShared(O.fromNullishOr(process.env.BEEP_GRAPHITI_RETRY_ATTEMPTS), 5),
  retryBaseMs: parsePositiveIntShared(O.fromNullishOr(process.env.BEEP_GRAPHITI_RETRY_BASE_MS), 200),
  retryMaxMs: parsePositiveIntShared(O.fromNullishOr(process.env.BEEP_GRAPHITI_RETRY_MAX_MS), 2_000),
  retryJitterMs: parsePositiveIntShared(O.fromNullishOr(process.env.BEEP_GRAPHITI_RETRY_JITTER_MS), 125),
  requestTimeoutMs: parsePositiveIntShared(O.fromNullishOr(process.env.BEEP_GRAPHITI_REQUEST_TIMEOUT_MS), 2_500),
  preflightEnabled: parseBooleanShared(O.fromNullishOr(process.env.BEEP_GRAPHITI_PREFLIGHT), true),
  preflightTimeoutMs: parsePositiveIntShared(O.fromNullishOr(process.env.BEEP_GRAPHITI_PREFLIGHT_TIMEOUT_MS), 2_000),
  preflightTtlMs: parsePositiveIntShared(O.fromNullishOr(process.env.BEEP_GRAPHITI_PREFLIGHT_TTL_MS), 5_000),
  circuitEnabled: parseBooleanShared(O.fromNullishOr(process.env.BEEP_GRAPHITI_CIRCUIT_ENABLED), true),
  circuitFailureThreshold: parsePositiveIntShared(
    O.fromNullishOr(process.env.BEEP_GRAPHITI_CIRCUIT_FAILURE_THRESHOLD),
    1
  ),
  circuitOpenMs: parsePositiveIntShared(O.fromNullishOr(process.env.BEEP_GRAPHITI_CIRCUIT_OPEN_MS), 60_000),
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
  typeof value === "object" && value !== null && !A.isArray(value);

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

const ensureProxyPreflight = async (config: GraphitiGuardConfig, url: string): Promise<void> => {
  if (!config.preflightEnabled) {
    return;
  }

  const nowMs = Date.now();
  const lastCheckedAt = PreflightByUrl.get(url);
  if (lastCheckedAt !== undefined && nowMs - lastCheckedAt <= config.preflightTtlMs) {
    return;
  }

  try {
    await Effect.runPromise(ensureGraphitiProxyPreflight(url));
  } catch (cause) {
    throw toProtocolError("Graphiti proxy preflight failed", cause);
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

const initializeSession = async (config: GraphitiGuardConfig, url: string): Promise<string> => {
  void config;
  const cached = SessionByUrl.get(url);
  if (cached !== undefined) {
    return cached;
  }

  const sessionId = await Effect.runPromise(
    initializeMcpSession(url, "agent-eval", "0.0.0", O.some(config.requestTimeoutMs))
  ).catch((cause) => {
    if (isTimeoutError(cause)) {
      throw toProtocolError(`Graphiti initialize timed out after ${String(config.requestTimeoutMs)}ms`, cause);
    }
    throw toProtocolError("Graphiti MCP initialize failed", cause);
  });

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
  const safeArgs = isRecord(args) ? args : {};
  return Effect.runPromise(
    callMcpTool(url, sessionId, toolName, safeArgs, `${toolName}-call`, O.some(config.requestTimeoutMs))
  )
    .then((response) => {
      if (response.result.isError) {
        throw toProtocolError(response.result.message);
      }
      return response.body;
    })
    .catch((cause) => {
      if (isTimeoutError(cause)) {
        throw toProtocolError(`Graphiti ${toolName} timed out after ${String(config.requestTimeoutMs)}ms`, cause);
      }
      throw toProtocolError(`Graphiti ${toolName} tool call failed`, cause);
    });
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
