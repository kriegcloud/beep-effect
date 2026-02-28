/**
 * CLI-backed execution adapter for benchmark runs.
 *
 * @since 0.0.0
 * @module
 */

import { spawn } from "node:child_process";
import { String as Str } from "effect";
import type { ExecutionRequest, ExecutionResult } from "./types.js";

interface ProcessResult {
  readonly success: boolean;
  readonly stdout: string;
  readonly stderr: string;
  readonly timedOut: boolean;
  readonly exitCode: number | null;
  readonly signal: string | null;
}

const minutesToMs = (minutes: number): number => Math.max(1, Math.round(minutes * 60_000));

const parseJsonLine = (line: string): unknown | null => {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value);

const isString = (value: unknown): value is string => typeof value === "string";

const parseCodexOutput = (
  stdout: string
): {
  readonly assistantText: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly completionObserved: boolean;
} => {
  let inputTokens = 0;
  let outputTokens = 0;
  let completionObserved = false;
  let assistantText = stdout;

  const lines = Str.split("\n")(stdout)
    .map((line) => Str.trim(line))
    .filter((line) => line.length > 0);

  for (const line of lines) {
    const parsed = parseJsonLine(line);
    if (!isObjectRecord(parsed)) {
      continue;
    }

    const type = parsed.type;
    if (!isString(type)) {
      continue;
    }

    if (type === "turn.completed") {
      const usage = parsed.usage;
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

    if (type === "item.completed") {
      const item = parsed.item;
      if (!isObjectRecord(item)) {
        continue;
      }
      if (item.type !== "agent_message") {
        continue;
      }
      const text = item.text;
      if (isString(text)) {
        assistantText = text;
      }
    }
  }

  return {
    assistantText,
    inputTokens,
    outputTokens,
    completionObserved,
  };
};

const parseClaudeOutput = (
  stdout: string
): {
  readonly assistantText: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly completionObserved: boolean;
  readonly costUsd: number | null;
  readonly resultError: boolean;
} => {
  const trimmed = Str.trim(stdout);
  const parsed = parseJsonLine(trimmed);

  if (!isObjectRecord(parsed)) {
    return {
      assistantText: stdout,
      inputTokens: 0,
      outputTokens: 0,
      completionObserved: false,
      costUsd: null,
      resultError: false,
    };
  }

  const resultType = parsed.type;
  const completionObserved = resultType === "result";
  const maybeResult = parsed.result;
  const maybeMessage = parsed.message;
  const maybeContent = parsed.content;
  const assistantText =
    (isString(maybeResult) ? maybeResult : undefined) ??
    (isString(maybeMessage) ? maybeMessage : undefined) ??
    (isString(maybeContent) ? maybeContent : undefined) ??
    stdout;

  let inputTokens = 0;
  let outputTokens = 0;
  const usage = parsed.usage;
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

  const maybeCost = parsed.total_cost_usd;
  const costUsd = isNumber(maybeCost) ? maybeCost : null;

  const maybeIsError = parsed.is_error;
  const resultError = maybeIsError === true;

  return {
    assistantText,
    inputTokens,
    outputTokens,
    completionObserved,
    costUsd,
    resultError,
  };
};

const runProcess = async (
  command: string,
  args: ReadonlyArray<string>,
  cwd: string,
  timeoutMinutes: number,
  timeoutCapMs: number | undefined
): Promise<ProcessResult> =>
  new Promise((resolve) => {
    const child = spawn(command, [...args], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      detached: true,
    });

    let stdout = "";
    let stderr = "";
    let completed = false;

    const killProcessTree = () => {
      const pid = child.pid;
      if (pid === undefined) {
        child.kill("SIGKILL");
        return;
      }

      try {
        process.kill(-pid, "SIGKILL");
      } catch {
        child.kill("SIGKILL");
      }
    };

    child.stdout.on("data", (data) => {
      stdout += String(data);
    });

    child.stderr.on("data", (data) => {
      stderr += String(data);
    });

    const requestedTimeoutMs = minutesToMs(timeoutMinutes);
    const timeoutMs =
      timeoutCapMs === undefined ? requestedTimeoutMs : Math.max(1, Math.min(requestedTimeoutMs, timeoutCapMs));
    const timer = setTimeout(() => {
      if (completed) {
        return;
      }

      completed = true;
      killProcessTree();
      resolve({
        success: false,
        stdout,
        stderr,
        timedOut: true,
        exitCode: null,
        signal: "SIGKILL",
      });
    }, timeoutMs);

    child.on("exit", (code, signal) => {
      if (completed) {
        return;
      }

      completed = true;
      clearTimeout(timer);
      resolve({
        success: code === 0,
        stdout,
        stderr,
        timedOut: false,
        exitCode: code,
        signal: signal ?? null,
      });
    });

    child.on("error", (error) => {
      if (completed) {
        return;
      }

      completed = true;
      clearTimeout(timer);
      resolve({
        success: false,
        stdout,
        stderr: `${stderr}\n${String(error)}`,
        timedOut: false,
        exitCode: null,
        signal: null,
      });
    });
  });

const renderCodexCommandDescription = (model: string, reasoningEffort: ExecutionRequest["reasoningEffort"]): string =>
  `codex exec --json --model ${model}${
    reasoningEffort === undefined || reasoningEffort === "none"
      ? ""
      : ` --config model_reasoning_effort="${reasoningEffort}"`
  }`;

const renderClaudeCommandDescription = (model: string, claudeEffort: ExecutionRequest["claudeEffort"]): string =>
  `claude -p --output-format json --model ${model}${claudeEffort === undefined ? "" : ` --effort ${claudeEffort}`}`;

/**
 * Execute one agent run via existing CLI contracts.
 *
 * @param request - Execution request normalized by the runner.
 * @returns Normalized execution result including command output and token usage.
 * @domain agent-eval
 * @provides ExecutionResult
 * @depends CodexCli, ClaudeCli, ProcessRunner
 * @errors none
 * @since 0.0.0
 * @category functions
 */
export const runCliExecution = async (request: ExecutionRequest): Promise<ExecutionResult> => {
  if (request.agent === "codex") {
    const args: Array<string> = ["exec", "--json", "--model", request.model];
    if (request.reasoningEffort !== undefined && request.reasoningEffort !== "none") {
      args.push("--config", `model_reasoning_effort="${request.reasoningEffort}"`);
    }
    args.push(request.promptPacket);

    const processResult = await runProcess(
      "codex",
      args,
      request.cwd,
      request.timeoutMinutes,
      request.timeoutCapMs === undefined ? undefined : Math.floor(request.timeoutCapMs)
    );
    const parsed = parseCodexOutput(processResult.stdout);
    return {
      backend: "cli",
      commandDescription: renderCodexCommandDescription(request.model, request.reasoningEffort),
      success: processResult.success && !processResult.timedOut,
      timedOut: processResult.timedOut,
      stdout: processResult.stdout,
      stderr: processResult.stderr,
      assistantText: parsed.assistantText,
      inputTokens: parsed.inputTokens,
      outputTokens: parsed.outputTokens,
      costUsd: null,
      completionObserved: parsed.completionObserved,
      exitCode: processResult.exitCode,
      signal: processResult.signal,
      fallbackReason: null,
    };
  }

  const claudeArgs: Array<string> = ["-p", request.promptPacket, "--output-format", "json", "--model", request.model];
  if (request.claudeEffort !== undefined) {
    claudeArgs.push("--effort", request.claudeEffort);
  }

  const processResult = await runProcess(
    "claude",
    claudeArgs,
    request.cwd,
    request.timeoutMinutes,
    request.timeoutCapMs === undefined ? undefined : Math.floor(request.timeoutCapMs)
  );
  const parsed = parseClaudeOutput(processResult.stdout);
  const success = processResult.success && !processResult.timedOut && !parsed.resultError;

  return {
    backend: "cli",
    commandDescription: renderClaudeCommandDescription(request.model, request.claudeEffort),
    success,
    timedOut: processResult.timedOut,
    stdout: processResult.stdout,
    stderr: processResult.stderr,
    assistantText: parsed.assistantText,
    inputTokens: parsed.inputTokens,
    outputTokens: parsed.outputTokens,
    costUsd: parsed.costUsd,
    completionObserved: parsed.completionObserved,
    exitCode: processResult.exitCode,
    signal: processResult.signal,
    fallbackReason: null,
  };
};
