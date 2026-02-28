/**
 * Claude execution adapter routed through @beep/ai-sdk runtime.
 *
 * @since 0.0.0
 * @module
 */

import { run } from "@beep/ai-sdk";
import type { Options } from "@beep/ai-sdk/Schema/Options";
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

const isClaudeSdkModule = (value: unknown): value is ClaudeSdkModule =>
  isObjectRecord(value) && typeof value.query === "function";

const causeMessage = (cause: unknown): string => {
  if (isObjectRecord(cause) && isString(cause.message)) {
    return cause.message;
  }
  return String(cause);
};

const hasAuthCredentials = (): boolean => {
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY?.trim();
  const genericApiKey = process.env.API_KEY?.trim();
  const sessionToken = process.env.CLAUDE_CODE_SESSION_ACCESS_TOKEN?.trim();
  return (
    (anthropicApiKey !== undefined && anthropicApiKey.length > 0) ||
    (genericApiKey !== undefined && genericApiKey.length > 0) ||
    (sessionToken !== undefined && sessionToken.length > 0)
  );
};

const missingCredentialsMessage = "Missing API credentials";

const containsMissingCredentialsMessage = (value: string): boolean => value.includes(missingCredentialsMessage);

const shouldFallbackToLegacy = (result: ExecutionResult): boolean =>
  containsMissingCredentialsMessage(result.stderr) ||
  containsMissingCredentialsMessage(result.stdout) ||
  containsMissingCredentialsMessage(result.assistantText);

const loadLegacyClaudeSdkModule = async (): Promise<ClaudeSdkModule> => {
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

const resolveTimeoutMs = (request: ExecutionRequest): number =>
  request.timeoutCapMs === undefined
    ? Math.max(1, Math.round(request.timeoutMinutes * 60_000))
    : Math.max(1, Math.min(Math.round(request.timeoutMinutes * 60_000), Math.floor(request.timeoutCapMs)));

const runBeepClaudeSdkExecution = async (request: ExecutionRequest): Promise<ExecutionResult> => {
  const abortController = new AbortController();
  const timeoutMs = resolveTimeoutMs(request);

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
  let completionObserved = false;
  let successResultObserved = false;
  let assistantText = "";

  const options: Options = {
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
    ...(request.claudeEffort === undefined ? {} : { effort: request.claudeEffort }),
  };

  try {
    const resultMessage = await run(request.promptPacket, options);
    stdoutLines.push(stringifyEvent(resultMessage));
    completionObserved = true;
    if (!resultMessage.is_error) {
      successResultObserved = true;
    }

    assistantText = resultMessage.result;
    if (isNumber(resultMessage.total_cost_usd)) {
      costUsd = resultMessage.total_cost_usd;
    }

    const usage = resultMessage.usage;
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
  } catch (cause) {
    stderrLines.push(causeMessage(cause));
  } finally {
    clearTimeout(timer);
  }

  const stdout = `${stdoutLines.join("\n")}${stdoutLines.length === 0 ? "" : "\n"}`;
  const stderr = `${stderrLines.join("\n")}${stderrLines.length === 0 ? "" : "\n"}`;
  const success = completionObserved && successResultObserved && !timedOut;

  return {
    backend: "sdk",
    commandDescription: `@beep/ai-sdk run model=${request.model}`,
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

const runLegacyClaudeSdkExecution = async (
  request: ExecutionRequest,
  fallbackReason: string
): Promise<ExecutionResult> => {
  const module = await loadLegacyClaudeSdkModule();
  const abortController = new AbortController();
  const timeoutMs = resolveTimeoutMs(request);

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
    fallbackReason,
  };
};

/**
 * Probe runtime availability of the Claude Agent SDK module.
 *
 * @returns Availability status and unavailability reason when probing fails.
 * @domain agent-eval
 * @provides SdkAvailability
 * @depends ClaudeAgentSdk
 * @errors none
 * @since 0.0.0
 * @category functions
 */
export const probeClaudeSdkAvailability = async (): Promise<SdkAvailability> => {
  try {
    if (hasAuthCredentials()) {
      return {
        available: true,
        reason: null,
      };
    }

    await loadLegacyClaudeSdkModule();
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
 * @domain agent-eval
 * @provides ExecutionResult
 * @depends ClaudeAgentSdk, AbortController
 * @errors none
 * @since 0.0.0
 * @category functions
 */
export const runClaudeSdkExecution = async (request: ExecutionRequest): Promise<ExecutionResult> => {
  if (!hasAuthCredentials()) {
    return runLegacyClaudeSdkExecution(
      request,
      "Fell back to @anthropic-ai/claude-agent-sdk because @beep/ai-sdk credentials are unavailable."
    );
  }

  const primaryResult = await runBeepClaudeSdkExecution(request);
  if (shouldFallbackToLegacy(primaryResult)) {
    return runLegacyClaudeSdkExecution(
      request,
      "Fell back to @anthropic-ai/claude-agent-sdk because @beep/ai-sdk reported missing API credentials."
    );
  }

  return primaryResult;
};
