/**
 * Claude Agent SDK execution adapter.
 *
 * @since 0.0.0
 * @module
 */

import { AgentEvalInvariantError } from "../../errors.js";
import type { ExecutionRequest, ExecutionResult, SdkAvailability } from "./types.js";

interface ClaudeQuery extends AsyncGenerator<unknown, void> {
  close(): void;
}

interface ClaudeSdkModule {
  query(params: { readonly prompt: string; readonly options?: Record<string, unknown> }): ClaudeQuery;
}

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isString = (value: unknown): value is string => typeof value === "string";

const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

const causeMessage = (cause: unknown): string => {
  if (isObjectRecord(cause) && isString(cause.message)) {
    return cause.message;
  }
  return String(cause);
};

const isClaudeSdkModule = (value: unknown): value is ClaudeSdkModule =>
  isObjectRecord(value) && typeof value.query === "function";

const loadClaudeSdkModule = async (): Promise<ClaudeSdkModule> => {
  const loaded = await import("@anthropic-ai/claude-agent-sdk");
  if (isClaudeSdkModule(loaded)) {
    return loaded;
  }

  throw new AgentEvalInvariantError({
    message: "Loaded @anthropic-ai/claude-agent-sdk but missing query function.",
  });
};

const stringifyEvent = (event: unknown): string => {
  try {
    return JSON.stringify(event);
  } catch {
    return String(event);
  }
};

/**
 * Probe runtime availability of the Claude Agent SDK module.
 *
 * @returns Availability status and unavailability reason when probing fails.
 * @since 0.0.0
 * @category functions
 */
export const probeClaudeSdkAvailability = async (): Promise<SdkAvailability> => {
  try {
    await loadClaudeSdkModule();
    return {
      available: true,
      reason: null,
    };
  } catch (cause) {
    return {
      available: false,
      reason: causeMessage(cause),
    };
  }
};

/**
 * Execute one run through the Claude Agent SDK.
 *
 * @param request - Normalized execution request.
 * @returns Normalized execution result compatible with runner contracts.
 * @since 0.0.0
 * @category functions
 */
export const runClaudeSdkExecution = async (request: ExecutionRequest): Promise<ExecutionResult> => {
  const module = await loadClaudeSdkModule();
  const abortController = new AbortController();
  const timeoutMs =
    request.timeoutCapMs === undefined
      ? Math.max(1, Math.round(request.timeoutMinutes * 60_000))
      : Math.max(1, Math.min(Math.round(request.timeoutMinutes * 60_000), Math.floor(request.timeoutCapMs)));

  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    abortController.abort();
  }, timeoutMs);

  const stdoutLines: Array<string> = [];
  const stderrLines: Array<string> = [];

  let inputTokens = 0;
  let outputTokens = 0;
  let costUsd: number | null = null;
  let assistantText = "";
  let completionObserved = false;
  let successResultObserved = false;

  const options: Record<string, unknown> = {
    cwd: request.cwd,
    model: request.model,
    includePartialMessages: true,
    permissionMode: "bypassPermissions",
    allowDangerouslySkipPermissions: true,
    settingSources: ["project", "local", "user"],
    abortController,
    stderr: (data: string) => {
      stderrLines.push(data);
    },
  };
  if (request.claudeEffort !== undefined) {
    options.effort = request.claudeEffort;
  }

  const query = module.query({
    prompt: request.promptPacket,
    options,
  });

  try {
    for await (const event of query) {
      stdoutLines.push(stringifyEvent(event));
      if (!isObjectRecord(event)) {
        continue;
      }

      if (event.type !== "result") {
        continue;
      }

      completionObserved = true;
      const subtype = event.subtype;
      const isError = event.is_error;
      if (subtype === "success" && isError !== true) {
        successResultObserved = true;
      }

      const maybeResult = event.result;
      if (isString(maybeResult)) {
        assistantText = maybeResult;
      }

      const maybeCost = event.total_cost_usd;
      if (isNumber(maybeCost)) {
        costUsd = maybeCost;
      }

      const usage = event.usage;
      if (isObjectRecord(usage)) {
        const maybeInput = usage.input_tokens;
        const maybeOutput = usage.output_tokens;
        if (isNumber(maybeInput) && Number.isInteger(maybeInput)) {
          inputTokens = maybeInput;
        }
        if (isNumber(maybeOutput) && Number.isInteger(maybeOutput)) {
          outputTokens = maybeOutput;
        }
      }
    }
  } catch (cause) {
    stderrLines.push(causeMessage(cause));
  } finally {
    clearTimeout(timer);
    query.close();
  }

  const stdout = `${stdoutLines.join("\n")}${stdoutLines.length === 0 ? "" : "\n"}`;
  const stderr = `${stderrLines.join("\n")}${stderrLines.length === 0 ? "" : "\n"}`;
  const success = completionObserved && successResultObserved && !timedOut;

  return {
    backend: "sdk",
    commandDescription: `claude-agent-sdk query model=${request.model}`,
    success,
    timedOut,
    stdout,
    stderr,
    assistantText: assistantText.length === 0 ? stdout : assistantText,
    inputTokens,
    outputTokens,
    costUsd,
    completionObserved,
    exitCode: null,
    signal: null,
    fallbackReason: null,
  };
};
