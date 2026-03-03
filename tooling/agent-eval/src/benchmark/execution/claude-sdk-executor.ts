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

const claudeCredentialsRequiredMessage =
  "Claude @beep/ai-sdk execution requires ANTHROPIC_API_KEY/API_KEY or CLAUDE_CODE_SESSION_ACCESS_TOKEN.";

const hasMissingCredentialSignals = (result: ExecutionResult): boolean =>
  containsMissingCredentialsMessage(result.stderr) ||
  containsMissingCredentialsMessage(result.stdout) ||
  containsMissingCredentialsMessage(result.assistantText);

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

/**
 * Probe runtime availability of the @beep/ai-sdk Claude execution path.
 *
 * @returns Availability status and unavailability reason when probing fails.
 * @domain agent-eval
 * @provides SdkAvailability
 * @depends BeepAiSdk
 * @errors none
 * @since 0.0.0
 * @category Utility
 */
export const probeClaudeSdkAvailability = async (): Promise<SdkAvailability> => {
  if (hasAuthCredentials()) {
    return {
      available: true,
      reason: null,
    };
  }

  return {
    available: false,
    reason: claudeCredentialsRequiredMessage,
  };
};

/**
 * Execute one run through the @beep/ai-sdk Claude path.
 *
 * @param request - Normalized execution request.
 * @returns Normalized execution result compatible with runner contracts.
 * @domain agent-eval
 * @provides ExecutionResult
 * @depends BeepAiSdk, AbortController
 * @errors none
 * @since 0.0.0
 * @category Utility
 */
export const runClaudeSdkExecution = async (request: ExecutionRequest): Promise<ExecutionResult> => {
  if (!hasAuthCredentials()) {
    throw new AgentEvalInvariantError({
      message: claudeCredentialsRequiredMessage,
    });
  }

  const primaryResult = await runBeepClaudeSdkExecution(request);
  if (hasMissingCredentialSignals(primaryResult)) {
    throw new AgentEvalInvariantError({
      message: claudeCredentialsRequiredMessage,
    });
  }

  return primaryResult;
};
