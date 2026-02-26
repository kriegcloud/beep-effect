/**
 * Codex SDK execution adapter.
 *
 * @since 0.0.0
 * @module
 */

import { AgentEvalInvariantError } from "../../errors.js";
import type { ExecutionRequest, ExecutionResult, SdkAvailability } from "./types.js";

interface CodexThreadRunStreamedResult {
  readonly events: AsyncGenerator<unknown, void>;
}

interface CodexThread {
  runStreamed(input: string, turnOptions?: { readonly signal?: AbortSignal }): Promise<CodexThreadRunStreamedResult>;
}

interface CodexClient {
  startThread(options?: Record<string, unknown>): CodexThread;
}

interface CodexSdkModule {
  readonly Codex: new (options?: Record<string, unknown>) => CodexClient;
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

const isCodexSdkModule = (value: unknown): value is CodexSdkModule =>
  isObjectRecord(value) && typeof value.Codex === "function";

const loadCodexSdkModule = async (): Promise<CodexSdkModule> => {
  const loaded = await import("@openai/codex-sdk");
  if (isCodexSdkModule(loaded)) {
    return loaded;
  }

  throw new AgentEvalInvariantError({
    message: "Loaded @openai/codex-sdk but missing Codex constructor.",
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
 * Probe runtime availability of the Codex SDK module.
 *
 * @returns Availability status and unavailability reason when probing fails.
 * @since 0.0.0
 * @category functions
 */
export const probeCodexSdkAvailability = async (): Promise<SdkAvailability> => {
  try {
    await loadCodexSdkModule();
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

const mapCodexReasoningEffort = (
  effort: ExecutionRequest["reasoningEffort"]
): "minimal" | "low" | "medium" | "high" | "xhigh" | undefined => {
  if (effort === undefined || effort === "none") {
    return undefined;
  }
  return effort;
};

/**
 * Execute one run through the Codex SDK.
 *
 * @param request - Normalized execution request.
 * @returns Normalized execution result compatible with runner contracts.
 * @since 0.0.0
 * @category functions
 */
export const runCodexSdkExecution = async (request: ExecutionRequest): Promise<ExecutionResult> => {
  const module = await loadCodexSdkModule();
  const codex = new module.Codex();
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
  const assistantMessages: Array<string> = [];

  let inputTokens = 0;
  let outputTokens = 0;
  let completionObserved = false;
  let sawTurnFailure = false;

  try {
    const thread = codex.startThread({
      model: request.model,
      workingDirectory: request.cwd,
      approvalPolicy: "never",
      sandboxMode: "danger-full-access",
      networkAccessEnabled: true,
      skipGitRepoCheck: false,
      modelReasoningEffort: mapCodexReasoningEffort(request.reasoningEffort),
    });
    const streamedTurn = await thread.runStreamed(request.promptPacket, { signal: abortController.signal });

    for await (const event of streamedTurn.events) {
      stdoutLines.push(stringifyEvent(event));
      if (!isObjectRecord(event)) {
        continue;
      }

      const type = event.type;
      if (!isString(type)) {
        continue;
      }

      if (type === "turn.completed") {
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
        completionObserved = true;
        continue;
      }

      if (type === "turn.failed") {
        sawTurnFailure = true;
        continue;
      }

      if (type === "item.completed") {
        const item = event.item;
        if (!isObjectRecord(item)) {
          continue;
        }
        if (item.type !== "agent_message") {
          continue;
        }
        if (isString(item.text)) {
          assistantMessages.push(item.text);
        }
      }
    }
  } catch (cause) {
    stderrLines.push(causeMessage(cause));
  } finally {
    clearTimeout(timer);
  }

  const stdout = `${stdoutLines.join("\n")}${stdoutLines.length === 0 ? "" : "\n"}`;
  const stderr = `${stderrLines.join("\n")}${stderrLines.length === 0 ? "" : "\n"}`;
  const assistantText = assistantMessages.at(-1) ?? stdout;
  const success = completionObserved && !sawTurnFailure && !timedOut;

  return {
    backend: "sdk",
    commandDescription: `codex-sdk runStreamed model=${request.model}`,
    success,
    timedOut,
    stdout,
    stderr,
    assistantText,
    inputTokens,
    outputTokens,
    costUsd: null,
    completionObserved,
    exitCode: null,
    signal: null,
    fallbackReason: null,
  };
};
