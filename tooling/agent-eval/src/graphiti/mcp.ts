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
}

type GraphitiToolName = "search_memory_facts" | "add_memory";

const SessionByUrl = new Map<string, string>();
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
    await execFileAsync("rm", ["-rf", lockDir]);
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

const postMcp = async (
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
    });
  } catch (cause) {
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

const initializeSession = async (url: string): Promise<string> => {
  const cached = SessionByUrl.get(url);
  if (cached !== undefined) {
    return cached;
  }

  const initializeResponse = await postMcp(
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

const callTool = async (url: string, sessionId: string, toolName: GraphitiToolName, args: unknown): Promise<string> => {
  const response = await postMcp(
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

const executeTool = async (options: GraphitiMcpOptions, toolName: GraphitiToolName, args: unknown): Promise<string> =>
  withGlobalLock(() =>
    withRetry(
      `${toolName} operation`,
      async () => {
        const sessionId = await initializeSession(options.url);
        try {
          return await callTool(options.url, sessionId, toolName, args);
        } catch (cause) {
          invalidateSession(options.url);
          throw cause;
        }
      },
      () => {
        invalidateSession(options.url);
      }
    )
  );

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
  const text = await executeTool(options, "search_memory_facts", {
    query,
    group_ids: [options.groupId],
    max_facts: maxFacts,
  });
  return parseFactsFromJsonText(text);
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
