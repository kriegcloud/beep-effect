/**
 * Benchmark runner for multi-condition Codex/Claude reliability experiments.
 *
 * @since 0.0.0
 * @module
 */

import { spawn } from "node:child_process";
import { Effect, type Path, String as Str } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import { detectEffectComplianceViolations, detectWrongApis } from "../effect-v4-detector/index.js";
import { AgentEvalInvariantError } from "../errors.js";
import { type GraphitiMcpOptions, searchMemoryFacts } from "../graphiti/mcp.js";
import { type PolicyOverlay, selectFocusedSkills, selectPolicyPacket } from "../policies/index.js";
import type {
  AgentBenchSuite,
  AgentName,
  AgentRunRecord,
  AgentRunResult,
  AgentRunTranscript,
  AgentTaskSpec,
  BenchCondition,
  BenchSuiteStatus,
  FailureSignature,
} from "../schemas/index.js";
import { createExecutionResolver } from "./execution/index.js";
import type { ExecutionBackendMode, ExecutionResolver } from "./execution/types.js";
import { buildRetrievalPacket } from "./packet.js";

/**
 * Stable correction entry used for preflight packets.
 *
 * @since 0.0.0
 * @category models
 */
export interface CorrectionEntry {
  readonly id: string;
  readonly keywords: ReadonlyArray<string>;
  readonly fact: string;
}

/**
 * Static model pricing entry used for cost calculations.
 *
 * @since 0.0.0
 * @category models
 */
export interface PricingEntry {
  readonly model: string;
  readonly inputPerMillionUsd: number;
  readonly outputPerMillionUsd: number;
}

/**
 * Versioned static pricing table loaded from benchmark assets.
 *
 * @since 0.0.0
 * @category models
 */
export interface PricingTable {
  readonly version: string;
  readonly entries: ReadonlyArray<PricingEntry>;
  readonly fallback: PricingEntry;
}

/**
 * Model selection per agent.
 *
 * @since 0.0.0
 * @category models
 */
export interface AgentModels {
  readonly codex: string;
  readonly claude: string;
}

/**
 * Claude effort levels supported by CLI.
 *
 * @since 0.0.0
 * @category models
 */
export type ClaudeEffortLevel = "low" | "medium" | "high";

/**
 * Unified reasoning effort levels supported by benchmark CLI.
 *
 * @since 0.0.0
 * @category models
 */
export type ReasoningEffortLevel = "none" | "minimal" | "low" | "medium" | "high" | "xhigh";

/**
 * Runner options for one suite execution.
 *
 * @since 0.0.0
 * @category models
 */
export interface RunBenchmarkOptions {
  readonly tasks: ReadonlyArray<AgentTaskSpec>;
  readonly conditions: ReadonlyArray<BenchCondition>;
  readonly agents: ReadonlyArray<AgentName>;
  readonly trials: number;
  readonly simulate: boolean;
  readonly repoRoot: string;
  readonly pathApi: Path.Path;
  readonly policyOverlays: ReadonlyArray<PolicyOverlay>;
  readonly correctionIndex: ReadonlyArray<CorrectionEntry>;
  readonly pricingTable: PricingTable;
  readonly graphiti: GraphitiMcpOptions;
  readonly agentModels?: AgentModels;
  readonly claudeEffort?: ClaudeEffortLevel;
  readonly reasoningEffort?: ReasoningEffortLevel;
  readonly executionBackend: ExecutionBackendMode;
  readonly strictTaskCount: number;
  readonly isolateInWorktree: boolean;
  readonly worktreeRoot: string | undefined;
  readonly maxWallMinutes?: number;
  readonly onProgress?: (event: BenchmarkProgressEvent) => void | Promise<void>;
  readonly onDiagnostic?: (event: BenchmarkDiagnosticEvent) => void | Promise<void>;
}

interface RunTuple {
  readonly task: AgentTaskSpec;
  readonly condition: BenchCondition;
  readonly agent: AgentName;
  readonly trial: number;
}

interface ProcessResult {
  readonly success: boolean;
  readonly stdout: string;
  readonly stderr: string;
  readonly timedOut: boolean;
  readonly exitCode: number | null;
  readonly signal: string | null;
}

interface OutputTailSnapshot {
  readonly tail: string;
  readonly length: number;
  readonly truncated: boolean;
}

interface CommandOutputDiagnostics {
  readonly stdoutTail: string;
  readonly stderrTail: string;
  readonly stdoutLength: number;
  readonly stderrLength: number;
  readonly stdoutTruncated: boolean;
  readonly stderrTruncated: boolean;
  readonly tailCharLimit: number;
  readonly exitCode: number | null;
  readonly signal: string | null;
}

interface AcceptanceCommandResult {
  readonly success: boolean;
  readonly failedCommand: string | null;
  readonly timedOut: boolean;
  readonly abortedByWallCap: boolean;
  readonly failedCommandDiagnostics: CommandOutputDiagnostics | null;
}

interface StatusPorcelainParseEntry {
  readonly rawLine: string;
  readonly parsedPath: string;
  readonly ignored: boolean;
}

interface TouchedSourceFile {
  readonly path: string;
  readonly content: string;
}

interface LiveExecutionResult {
  readonly transcript: AgentRunTranscript;
  readonly allowlistPass: boolean;
  readonly touchedPaths: ReadonlyArray<string>;
  readonly touchedSourceFiles: ReadonlyArray<TouchedSourceFile>;
  readonly commandPass: boolean;
  readonly commandTimedOut: boolean;
  readonly commandStdoutTail: string;
  readonly commandStderrTail: string;
  readonly commandStdoutLength: number;
  readonly commandStderrLength: number;
  readonly commandStdoutTruncated: boolean;
  readonly commandStderrTruncated: boolean;
  readonly commandTailCharLimit: number;
  readonly commandBackend: "cli" | "sdk";
  readonly commandCompletionObserved: boolean;
  readonly commandExitCode: number | null;
  readonly commandSignal: string | null;
  readonly commandFallbackReason: string | null;
  readonly statusPorcelainRaw: string;
  readonly statusPorcelainParsed: ReadonlyArray<StatusPorcelainParseEntry>;
  readonly executionCwd: string;
}

/**
 * Progress event emitted while running the benchmark suite.
 *
 * @since 0.0.0
 * @category models
 */
export type BenchmarkProgressEvent =
  | {
      readonly type: "suite.started";
      readonly atEpochMs: number;
      readonly plannedRunCount: number;
      readonly strictTaskCount: number;
      readonly maxWallMinutes: number | null;
    }
  | {
      readonly type: "run.started";
      readonly atEpochMs: number;
      readonly runId: string;
      readonly runIndex: number;
      readonly totalRuns: number;
      readonly taskId: string;
      readonly condition: BenchCondition;
      readonly agent: AgentName;
      readonly trial: number;
    }
  | {
      readonly type: "run.completed";
      readonly atEpochMs: number;
      readonly runId: string;
      readonly runIndex: number;
      readonly totalRuns: number;
      readonly success: boolean;
      readonly failureType: FailureSignature["failureType"] | null;
      readonly wallMs: number;
    }
  | {
      readonly type: "suite.aborted";
      readonly atEpochMs: number;
      readonly completedRunCount: number;
      readonly plannedRunCount: number;
      readonly reason: string;
    }
  | {
      readonly type: "suite.completed";
      readonly atEpochMs: number;
      readonly status: BenchSuiteStatus;
      readonly completedRunCount: number;
      readonly plannedRunCount: number;
    };

/**
 * Diagnostic event emitted for run-level forensics and suite metrics.
 *
 * @since 0.0.0
 * @category models
 */
export type BenchmarkDiagnosticEvent =
  | {
      readonly type: "run.diagnostic";
      readonly atEpochMs: number;
      readonly runId: string;
      readonly taskId: string;
      readonly condition: BenchCondition;
      readonly agent: AgentName;
      readonly trial: number;
      readonly simulate: boolean;
      readonly model: string;
      readonly executionCwd: string;
      readonly touchedPaths: ReadonlyArray<string>;
      readonly touchedPathCount: number;
      readonly statusPorcelainRaw: string;
      readonly statusPorcelainParsed: ReadonlyArray<StatusPorcelainParseEntry>;
      readonly allowlist: {
        readonly pass: boolean;
        readonly firstViolationPath: string | null;
        readonly violationCount: number;
      };
      readonly command: {
        readonly success: boolean;
        readonly timedOut: boolean;
        readonly stdoutTail: string;
        readonly stderrTail: string;
        readonly stdoutLength: number;
        readonly stderrLength: number;
        readonly stdoutTruncated: boolean;
        readonly stderrTruncated: boolean;
        readonly tailCharLimit: number;
        readonly backend: "cli" | "sdk";
        readonly completionObserved: boolean;
        readonly exitCode: number | null;
        readonly signal: string | null;
        readonly fallbackReason: string | null;
      };
      readonly acceptance: AcceptanceCommandResult;
      readonly detector: {
        readonly wrongApiRuleIds: ReadonlyArray<string>;
        readonly effectComplianceRuleIds: ReadonlyArray<string>;
        readonly criticalIncidentCount: number;
      };
      readonly result: {
        readonly success: boolean;
        readonly failureType: FailureSignature["failureType"] | null;
        readonly rootCause: string | null;
        readonly wallMs: number;
        readonly costUsd: number;
      };
      readonly wallBudget: {
        readonly maxWallMinutes: number | null;
        readonly remainingMsAtRunStart: number | null;
        readonly remainingMsAtRunEnd: number | null;
      };
    }
  | {
      readonly type: "suite.metrics";
      readonly atEpochMs: number;
      readonly status: BenchSuiteStatus;
      readonly plannedRunCount: number;
      readonly completedRunCount: number;
      readonly totalCostUsd: number;
      readonly totalWallMs: number;
      readonly averageWallMs: number;
      readonly outcomeCounts: {
        readonly success: number;
        readonly wrong_api: number;
        readonly effect_compliance: number;
        readonly acceptance: number;
        readonly allowlist: number;
        readonly runtime: number;
      };
      readonly abortReason: string | null;
    };

const decodeCorrectionEntries = S.decodeUnknownSync(
  S.fromJsonString(
    S.Array(S.Struct({ id: S.NonEmptyString, keywords: S.Array(S.NonEmptyString), fact: S.NonEmptyString }))
  )
);

const PricingEntrySchema = S.Struct({
  model: S.NonEmptyString,
  inputPerMillionUsd: S.Number,
  outputPerMillionUsd: S.Number,
});

const PricingTableSchema = S.Struct({
  version: S.NonEmptyString,
  entries: S.Array(PricingEntrySchema),
  fallback: PricingEntrySchema,
});

const decodePricingTable = S.decodeUnknownSync(S.fromJsonString(PricingTableSchema));

const defaultAgentModels: AgentModels = {
  codex: "gpt-5.2",
  claude: "claude-sonnet-4-6",
};

const modelForAgent = (agent: AgentName, options: RunBenchmarkOptions): string => {
  const selected = options.agentModels ?? defaultAgentModels;
  return agent === "codex" ? selected.codex : selected.claude;
};
const epochNowMs = (): number => Math.round(performance.timeOrigin + performance.now());
const monotonicNowMs = (): number => performance.now();
const minutesToMs = (minutes: number): number => Math.max(1, Math.round(minutes * 60_000));
const commandDiagnosticTailCharLimit = 4_000;
const resolveDeadlineMs = (maxWallMinutes: number | undefined): number | undefined =>
  maxWallMinutes === undefined ? undefined : monotonicNowMs() + minutesToMs(maxWallMinutes);
const remainingTimeoutCapMs = (deadlineMs: number | undefined): number | undefined =>
  deadlineMs === undefined ? undefined : Math.max(1, Math.floor(deadlineMs - monotonicNowMs()));
const hasDeadlineElapsed = (deadlineMs: number | undefined): boolean =>
  deadlineMs !== undefined && deadlineMs <= monotonicNowMs();

const snapshotOutputTail = (content: string, maxChars: number): OutputTailSnapshot => {
  const normalizedMax = Math.max(1, maxChars);
  if (content.length <= normalizedMax) {
    return {
      tail: content,
      length: content.length,
      truncated: false,
    };
  }

  return {
    tail: content.slice(content.length - normalizedMax),
    length: content.length,
    truncated: true,
  };
};

const emitProgress = async (options: RunBenchmarkOptions, event: BenchmarkProgressEvent): Promise<void> => {
  if (options.onProgress === undefined) {
    return;
  }

  try {
    await options.onProgress(event);
  } catch {
    // Progress callbacks are best-effort and must not fail suite execution.
  }
};

const emitDiagnostic = async (options: RunBenchmarkOptions, event: BenchmarkDiagnosticEvent): Promise<void> => {
  if (options.onDiagnostic === undefined) {
    return;
  }

  try {
    await options.onDiagnostic(event);
  } catch {
    // Diagnostics callbacks are best-effort and must not fail suite execution.
  }
};

const tokenMultiplier = (condition: BenchCondition): number => {
  if (condition === "minimal") {
    return 0.8;
  }
  if (condition === "adaptive") {
    return 1;
  }
  if (condition === "adaptive_kg") {
    return 1.1;
  }
  return 1.25;
};

const estimateTokens = (
  prompt: string,
  condition: BenchCondition
): { readonly input: number; readonly output: number } => {
  const words = Str.split(/\s+/)(prompt).filter((word) => word.length > 0).length;
  const multiplier = tokenMultiplier(condition);
  return {
    input: Math.max(1, Math.round(words * 24 * multiplier)),
    output: Math.max(1, Math.round(words * 10 * (multiplier + 0.05))),
  };
};

const findPricingEntry = (pricingTable: PricingTable, model: string): PricingEntry =>
  pricingTable.entries.find((entry) => entry.model === model) ?? pricingTable.fallback;

const estimateCost = (pricingTable: PricingTable, model: string, inputTokens: number, outputTokens: number): number => {
  const entry = findPricingEntry(pricingTable, model);
  const inputCost = (inputTokens / 1_000_000) * entry.inputPerMillionUsd;
  const outputCost = (outputTokens / 1_000_000) * entry.outputPerMillionUsd;
  return inputCost + outputCost;
};

const relevantCorrectionFacts = (prompt: string, index: ReadonlyArray<CorrectionEntry>): ReadonlyArray<string> => {
  const lowered = Str.toLowerCase(prompt);
  const facts: Array<string> = [];

  for (const entry of index) {
    const matched = entry.keywords.some((keyword) => lowered.includes(Str.toLowerCase(keyword)));
    if (matched) {
      facts.push(entry.fact);
    }
  }

  return facts;
};

const resolveTaskCwd = (pathApi: Path.Path, repoRoot: string, taskCwd: string): string =>
  pathApi.isAbsolute(taskCwd) ? taskCwd : pathApi.join(repoRoot, taskCwd);

const runProcess = async (
  command: string,
  args: ReadonlyArray<string>,
  cwd: string,
  timeoutMinutes: number,
  timeoutCapMs?: number
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
      timeoutCapMs === undefined
        ? requestedTimeoutMs
        : Math.max(1, Math.min(requestedTimeoutMs, Math.floor(timeoutCapMs)));
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

const runOneCommand = async (
  cwd: string,
  command: string,
  timeoutMinutes: number,
  suiteDeadlineMs: number | undefined
): Promise<ProcessResult> => {
  const shell = process.env.SHELL;
  const resolvedShell = typeof shell === "string" && shell.length > 0 ? shell : "sh";
  return runProcess(resolvedShell, ["-lc", command], cwd, timeoutMinutes, remainingTimeoutCapMs(suiteDeadlineMs));
};

const runAcceptanceCommands = async (
  task: AgentTaskSpec,
  cwd: string,
  simulate: boolean,
  suiteDeadlineMs: number | undefined
): Promise<AcceptanceCommandResult> => {
  const emptyDiagnostics: CommandOutputDiagnostics = {
    stdoutTail: "",
    stderrTail: "",
    stdoutLength: 0,
    stderrLength: 0,
    stdoutTruncated: false,
    stderrTruncated: false,
    tailCharLimit: commandDiagnosticTailCharLimit,
    exitCode: null,
    signal: null,
  };

  if (simulate) {
    return {
      success: true,
      failedCommand: null,
      timedOut: false,
      abortedByWallCap: false,
      failedCommandDiagnostics: null,
    };
  }

  for (const command of task.acceptanceCommands) {
    if (hasDeadlineElapsed(suiteDeadlineMs)) {
      return {
        success: false,
        failedCommand: command,
        timedOut: true,
        abortedByWallCap: true,
        failedCommandDiagnostics: emptyDiagnostics,
      };
    }

    const commandResult = await runOneCommand(cwd, command, task.timeoutMinutes, suiteDeadlineMs);
    if (!commandResult.success) {
      const stdoutTail = snapshotOutputTail(commandResult.stdout, commandDiagnosticTailCharLimit);
      const stderrTail = snapshotOutputTail(commandResult.stderr, commandDiagnosticTailCharLimit);
      return {
        success: false,
        failedCommand: command,
        timedOut: commandResult.timedOut,
        abortedByWallCap: false,
        failedCommandDiagnostics: {
          stdoutTail: stdoutTail.tail,
          stderrTail: stderrTail.tail,
          stdoutLength: stdoutTail.length,
          stderrLength: stderrTail.length,
          stdoutTruncated: stdoutTail.truncated,
          stderrTruncated: stderrTail.truncated,
          tailCharLimit: commandDiagnosticTailCharLimit,
          exitCode: commandResult.exitCode,
          signal: commandResult.signal,
        },
      };
    }
  }

  return {
    success: true,
    failedCommand: null,
    timedOut: false,
    abortedByWallCap: false,
    failedCommandDiagnostics: null,
  };
};

/**
 * Parse `git status --porcelain --untracked-files=all` into concrete touched paths.
 *
 * @param statusOutput - Raw porcelain output.
 * @returns Parsed touched path list and raw-entry mapping used for diagnostics.
 * @since 0.0.0
 * @category functions
 */
export const parseStatusPorcelain = (
  statusOutput: string
): {
  readonly touchedPaths: ReadonlyArray<string>;
  readonly parsedEntries: ReadonlyArray<StatusPorcelainParseEntry>;
} => {
  const ignoredRoots = ["node_modules"] as const;
  const lines = Str.split("\n")(statusOutput)
    .map((line) => Str.replace(/\r$/, "")(line))
    .filter((line) => Str.trim(line).length > 0);

  const touched: Array<string> = [];
  const parsedEntries: Array<StatusPorcelainParseEntry> = [];
  for (const line of lines) {
    const rawPath = line.length > 3 ? Str.trim(Str.slice(3)(line)) : Str.trim(line);
    const maybeRenamed = rawPath.includes(" -> ") ? (Str.split(" -> ")(rawPath).at(-1) ?? rawPath) : rawPath;
    const ignored = ignoredRoots.some((root) => maybeRenamed === root || maybeRenamed.startsWith(`${root}/`));
    parsedEntries.push({
      rawLine: line,
      parsedPath: maybeRenamed,
      ignored,
    });

    if (ignored) {
      continue;
    }
    if (!touched.includes(maybeRenamed)) {
      touched.push(maybeRenamed);
    }
  }

  return {
    touchedPaths: touched,
    parsedEntries,
  };
};

const sourceFileExtensions = [".ts", ".tsx", ".js", ".jsx", ".mts", ".cts"] as const;

const isSourceFilePath = (filePath: string): boolean =>
  sourceFileExtensions.some((extension) => filePath.endsWith(extension));

const readTouchedSourceFiles = async (
  executionRoot: string,
  touchedPaths: ReadonlyArray<string>,
  suiteDeadlineMs: number | undefined
): Promise<ReadonlyArray<TouchedSourceFile>> => {
  const files: Array<TouchedSourceFile> = [];

  for (const touchedPath of touchedPaths) {
    if (!isSourceFilePath(touchedPath)) {
      continue;
    }

    const readResult = await runProcess("cat", [touchedPath], executionRoot, 1, remainingTimeoutCapMs(suiteDeadlineMs));
    if (!readResult.success) {
      continue;
    }

    files.push({
      path: touchedPath,
      content: readResult.stdout,
    });
  }

  return files;
};

/**
 * Check whether one touched path is within the allowlist contract.
 *
 * @param filePath - Relative touched file path.
 * @param allowlist - Allowlisted path roots for the task.
 * @returns `true` when the path is allowed.
 * @since 0.0.0
 * @category functions
 */
export const isPathAllowed = (filePath: string, allowlist: ReadonlyArray<string>): boolean =>
  allowlist.some((allowed) => filePath === allowed || filePath.startsWith(`${allowed}/`));

/**
 * Evaluate allowlist pass/fail for one run based on touched file paths.
 *
 * @param touchedPaths - Touched paths from porcelain parsing.
 * @param allowlist - Allowlisted path roots for the task.
 * @returns `true` when all touched paths are allowed.
 * @since 0.0.0
 * @category functions
 */
export const allowlistPass = (touchedPaths: ReadonlyArray<string>, allowlist: ReadonlyArray<string>): boolean =>
  touchedPaths.every((filePath) => isPathAllowed(filePath, allowlist));

/**
 * Return disallowed touched paths for diagnostic reporting.
 *
 * @param touchedPaths - Touched paths from porcelain parsing.
 * @param allowlist - Allowlisted path roots for the task.
 * @returns Paths that violate the allowlist.
 * @since 0.0.0
 * @category functions
 */
export const disallowedTouchedPaths = (
  touchedPaths: ReadonlyArray<string>,
  allowlist: ReadonlyArray<string>
): ReadonlyArray<string> => touchedPaths.filter((filePath) => !isPathAllowed(filePath, allowlist));

const renderPromptPacket = (
  task: AgentTaskSpec,
  condition: BenchCondition,
  selectedPolicyIds: ReadonlyArray<string>,
  selectedSkills: ReadonlyArray<string>,
  facts: ReadonlyArray<string>
): string =>
  [
    `Task ID: ${task.id}`,
    `Condition: ${condition}`,
    `Category: ${task.category}`,
    `Policies: ${selectedPolicyIds.join(", ")}`,
    `Skills: ${selectedSkills.join(", ")}`,
    "",
    "Prompt:",
    task.prompt,
    "",
    "Hard Constraints (must pass):",
    "- Use Effect-first modules and aliases; avoid native date/array/promise patterns in domain logic.",
    "- No node:fs/node:path imports or requires for benchmark task implementations.",
    "- No JSON.parse/JSON.stringify for typed boundaries; use Schema decode/encode helpers.",
    "- No try/catch, throw, new Error, or extends Error; use typed Effect error channels.",
    "- No nullable unions/initializers, no type assertions, and no non-null assertions.",
    "- Edit only allowlisted paths.",
    "",
    "Correction Facts:",
    ...facts.map((fact, index) => `${index + 1}. ${fact}`),
    "",
    "Touched Path Allowlist:",
    ...task.touchedPathAllowlist.map((filePath) => `- ${filePath}`),
  ].join("\n");

const createWorktreePath = (pathApi: Path.Path, worktreeRoot: string, runId: string): string => {
  const safe = runId.replaceAll(":", "__").replaceAll("/", "__");
  const unique = `${epochNowMs()}-${Math.round(Math.random() * 1_000_000)}`;
  return pathApi.join(worktreeRoot, `${safe}__${unique}`);
};

const ensureWorktreeDependencies = async (
  pathApi: Path.Path,
  repoRoot: string,
  worktreePath: string,
  suiteDeadlineMs: number | undefined
): Promise<void> => {
  const repoNodeModules = pathApi.join(repoRoot, "node_modules");
  const worktreeNodeModules = pathApi.join(worktreePath, "node_modules");
  const hasRepoNodeModules = await runProcess(
    "test",
    ["-d", repoNodeModules],
    repoRoot,
    1,
    remainingTimeoutCapMs(suiteDeadlineMs)
  );
  const hasWorktreeNodeModules = await runProcess(
    "test",
    ["-e", worktreeNodeModules],
    repoRoot,
    1,
    remainingTimeoutCapMs(suiteDeadlineMs)
  );

  if (hasRepoNodeModules.success && !hasWorktreeNodeModules.success) {
    await runProcess(
      "ln",
      ["-s", repoNodeModules, worktreeNodeModules],
      repoRoot,
      1,
      remainingTimeoutCapMs(suiteDeadlineMs)
    );
  }
};

const withRunCwd = async (
  pathApi: Path.Path,
  repoRoot: string,
  runId: string,
  enabled: boolean,
  worktreeRoot: string | undefined,
  suiteDeadlineMs: number | undefined,
  action: (cwd: string) => Promise<LiveExecutionResult>
): Promise<LiveExecutionResult> => {
  if (!enabled) {
    return action(repoRoot);
  }

  if (worktreeRoot === undefined) {
    throw new AgentEvalInvariantError({
      message: `Missing worktree root for isolated run ${runId}`,
    });
  }

  const worktreePath = createWorktreePath(pathApi, worktreeRoot, runId);
  const addResult = await runProcess(
    "git",
    ["-C", repoRoot, "worktree", "add", "--detach", "--force", worktreePath],
    repoRoot,
    5,
    remainingTimeoutCapMs(suiteDeadlineMs)
  );

  if (!addResult.success) {
    throw new AgentEvalInvariantError({
      message: `Failed to create isolated worktree for ${runId}: ${addResult.stderr || addResult.stdout}`,
    });
  }

  try {
    await ensureWorktreeDependencies(pathApi, repoRoot, worktreePath, suiteDeadlineMs);
    return await action(worktreePath);
  } finally {
    await runProcess("git", ["-C", repoRoot, "worktree", "remove", "--force", worktreePath], repoRoot, 5);
  }
};

const executeLiveRun = async (
  tuple: RunTuple,
  model: string,
  runId: string,
  repoRoot: string,
  taskCwd: string,
  promptPacket: string,
  pricingTable: PricingTable,
  executionResolver: ExecutionResolver,
  isolateInWorktree: boolean,
  worktreeRoot: string | undefined,
  reasoningEffort: ReasoningEffortLevel | undefined,
  claudeEffort: ClaudeEffortLevel | undefined,
  pathApi: Path.Path,
  suiteDeadlineMs: number | undefined
): Promise<LiveExecutionResult> =>
  withRunCwd(pathApi, repoRoot, runId, isolateInWorktree, worktreeRoot, suiteDeadlineMs, async (executionRoot) => {
    const taskRelative = pathApi.relative(repoRoot, taskCwd);
    const executionCwd = executionRoot === repoRoot ? taskCwd : pathApi.join(executionRoot, taskRelative);

    const executionResult = await executionResolver.execute({
      agent: tuple.agent,
      model,
      promptPacket,
      cwd: executionCwd,
      timeoutMinutes: tuple.task.timeoutMinutes,
      timeoutCapMs: remainingTimeoutCapMs(suiteDeadlineMs),
      reasoningEffort,
      claudeEffort,
    });
    const commandStdout = snapshotOutputTail(executionResult.stdout, commandDiagnosticTailCharLimit);
    const commandStderr = snapshotOutputTail(executionResult.stderr, commandDiagnosticTailCharLimit);
    const statusResult = await runProcess(
      "git",
      ["status", "--porcelain", "--untracked-files=all"],
      executionRoot,
      2,
      remainingTimeoutCapMs(suiteDeadlineMs)
    );
    const parsedStatus = parseStatusPorcelain(statusResult.stdout);
    const touchedPaths = parsedStatus.touchedPaths;
    const touchedSourceFiles = await readTouchedSourceFiles(executionRoot, touchedPaths, suiteDeadlineMs);
    const allowlistOk = allowlistPass(touchedPaths, tuple.task.touchedPathAllowlist);

    const inputTokens = Math.max(0, executionResult.inputTokens);
    const outputTokens = Math.max(0, executionResult.outputTokens);
    const costUsd =
      executionResult.costUsd ?? estimateCost(pricingTable, model, Math.max(0, inputTokens), Math.max(0, outputTokens));

    const transcript: AgentRunTranscript = {
      runId,
      taskId: tuple.task.id,
      agent: tuple.agent,
      model,
      command: executionResult.commandDescription,
      promptPacket,
      rawOutput: executionResult.stdout,
      assistantText: executionResult.assistantText,
      inputTokens,
      outputTokens,
      costUsd: Math.max(0, costUsd),
      touchedPaths,
      backend: executionResult.backend,
      completionObserved: executionResult.completionObserved,
      exitCode: executionResult.exitCode,
      signal: executionResult.signal,
    };

    return {
      transcript,
      allowlistPass: allowlistOk,
      touchedPaths,
      touchedSourceFiles,
      commandPass: executionResult.success && !executionResult.timedOut,
      commandTimedOut: executionResult.timedOut,
      commandStdoutTail: commandStdout.tail,
      commandStderrTail: commandStderr.tail,
      commandStdoutLength: commandStdout.length,
      commandStderrLength: commandStderr.length,
      commandStdoutTruncated: commandStdout.truncated,
      commandStderrTruncated: commandStderr.truncated,
      commandTailCharLimit: commandDiagnosticTailCharLimit,
      commandBackend: executionResult.backend,
      commandCompletionObserved: executionResult.completionObserved,
      commandExitCode: executionResult.exitCode,
      commandSignal: executionResult.signal,
      commandFallbackReason: executionResult.fallbackReason,
      statusPorcelainRaw: statusResult.stdout,
      statusPorcelainParsed: parsedStatus.parsedEntries,
      executionCwd,
    };
  });

const buildFailureSignature = (
  runId: string,
  tuple: RunTuple,
  wrongApiRuleIds: ReadonlyArray<string>,
  effectComplianceRuleIds: ReadonlyArray<string>,
  touchedPaths: ReadonlyArray<string>,
  commandPass: boolean,
  acceptancePass: boolean,
  allowlistOk: boolean
): FailureSignature => {
  const combinedRuleIds = [...wrongApiRuleIds];
  for (const ruleId of effectComplianceRuleIds) {
    if (!combinedRuleIds.includes(ruleId)) {
      combinedRuleIds.push(ruleId);
    }
  }

  const failureType = !allowlistOk
    ? "allowlist"
    : effectComplianceRuleIds.length > 0
      ? "effect_compliance"
      : wrongApiRuleIds.length > 0
        ? "wrong_api"
        : !commandPass
          ? "runtime"
          : !acceptancePass
            ? "acceptance"
            : "runtime";

  const rootCause = !allowlistOk
    ? "Touched path outside allowlist"
    : effectComplianceRuleIds.length > 0
      ? "Mandatory Effect-first compliance rule violation detected"
      : wrongApiRuleIds.length > 0
        ? "Critical Effect v4 API mismatch detected"
        : !commandPass
          ? "Agent command failed or timed out"
          : !acceptancePass
            ? "Acceptance command failure"
            : "Unknown runtime failure";

  return {
    id: `${runId}:signature`,
    runId,
    taskId: tuple.task.id,
    condition: tuple.condition,
    agent: tuple.agent,
    failureType,
    rootCause,
    ruleIds: combinedRuleIds,
    touchedPaths,
  };
};

const buildRunMatrix = (options: RunBenchmarkOptions): ReadonlyArray<RunTuple> =>
  options.tasks.flatMap((task) =>
    options.conditions.flatMap((condition) =>
      options.agents.flatMap((agent) =>
        A.makeBy(options.trials, (index) => ({
          task,
          condition,
          agent,
          trial: index + 1,
        }))
      )
    )
  );

const buildMatrixFingerprint = (matrix: ReadonlyArray<RunTuple>): string =>
  matrix.map((tuple) => `${tuple.task.id}|${tuple.condition}|${tuple.agent}|${tuple.trial}`).join("\n");

const summarizeExecutionBackend = (
  records: ReadonlyArray<AgentRunRecord>,
  requestedMode: ExecutionBackendMode
): "cli" | "sdk" | "mixed" => {
  const observedBackends: Array<"cli" | "sdk"> = [];
  for (const record of records) {
    const backend = record.transcript?.backend;
    if (backend === undefined || backend === null) {
      continue;
    }
    if (!observedBackends.includes(backend)) {
      observedBackends.push(backend);
    }
  }

  if (observedBackends.length === 0) {
    if (requestedMode === "cli") {
      return "cli";
    }
    if (requestedMode === "sdk") {
      return "sdk";
    }
    return "mixed";
  }

  return observedBackends.length === 1 ? (observedBackends[0] ?? "mixed") : "mixed";
};

const executeRunTuple = async (
  options: RunBenchmarkOptions,
  tuple: RunTuple,
  executionResolver: ExecutionResolver,
  suiteDeadlineMs: number | undefined
): Promise<AgentRunRecord> => {
  const remainingMsAtRunStart = remainingTimeoutCapMs(suiteDeadlineMs) ?? null;
  const policy = selectPolicyPacket(options.policyOverlays, tuple.condition, tuple.task.category);
  const skills = selectFocusedSkills(tuple.task.prompt, tuple.task.category, Math.min(3, policy.maxSkills));
  const correctionFacts = relevantCorrectionFacts(tuple.task.prompt, options.correctionIndex);

  const kgFacts =
    tuple.condition === "adaptive_kg" && !options.simulate
      ? await searchMemoryFacts(
          options.graphiti,
          `${tuple.task.prompt}\npaths: ${tuple.task.touchedPathAllowlist.join(", ")}`,
          policy.maxFacts
        ).catch(() => [])
      : [];

  const packet = buildRetrievalPacket([...correctionFacts, ...kgFacts], policy.maxFacts, policy.maxChars);
  const promptPacket = renderPromptPacket(tuple.task, tuple.condition, policy.selectedPolicyIds, skills, packet.facts);

  const runId = `${tuple.task.id}:${tuple.condition}:${tuple.agent}:${tuple.trial}`;
  const model = modelForAgent(tuple.agent, options);
  const taskCwd = resolveTaskCwd(options.pathApi, options.repoRoot, tuple.task.cwd);
  const startMs = monotonicNowMs();

  const liveExecution = options.simulate
    ? null
    : await executeLiveRun(
        tuple,
        model,
        runId,
        options.repoRoot,
        taskCwd,
        promptPacket,
        options.pricingTable,
        executionResolver,
        options.isolateInWorktree,
        options.worktreeRoot,
        options.reasoningEffort,
        options.claudeEffort,
        options.pathApi,
        suiteDeadlineMs
      );

  const executionCwd = liveExecution?.executionCwd ?? taskCwd;
  const acceptance = await runAcceptanceCommands(tuple.task, executionCwd, options.simulate, suiteDeadlineMs);

  const touchedSourceFiles = liveExecution?.touchedSourceFiles ?? [];
  const detectorInput = touchedSourceFiles
    .map((file) => [`// path: ${file.path}`, file.content].join("\n"))
    .join("\n\n");
  const wrongApi = detectWrongApis(detectorInput);
  const effectCompliance = detectEffectComplianceViolations(detectorInput);
  const endMs = monotonicNowMs();

  const estimatedTokens = estimateTokens(tuple.task.prompt, tuple.condition);
  const inputTokens = liveExecution?.transcript.inputTokens ?? estimatedTokens.input;
  const outputTokens = liveExecution?.transcript.outputTokens ?? estimatedTokens.output;
  const costUsd =
    liveExecution?.transcript.costUsd ?? estimateCost(options.pricingTable, model, inputTokens, outputTokens);

  const touchedPaths = liveExecution?.touchedPaths ?? [];
  const disallowedPaths = disallowedTouchedPaths(touchedPaths, tuple.task.touchedPathAllowlist);
  const allowlistOk = disallowedPaths.length === 0;
  const runPassed = (liveExecution?.commandPass ?? true) && acceptance.success;
  const criticalIncidentCount = wrongApi.criticalCount + effectCompliance.criticalCount;

  const result: AgentRunResult = {
    runId,
    taskId: tuple.task.id,
    success: runPassed && allowlistOk && criticalIncidentCount === 0,
    checkPass: runPassed,
    lintPass: runPassed,
    testPass: runPassed,
    wrongApiIncidentCount: criticalIncidentCount,
    steps: tuple.task.acceptanceCommands.length + skills.length + (tuple.condition === "adaptive_kg" ? 2 : 1),
    inputTokens,
    outputTokens,
    costUsd,
    wallMs: Math.max(0, endMs - startMs),
  };

  const failureSignature = result.success
    ? null
    : buildFailureSignature(
        result.runId,
        tuple,
        wrongApi.incidents.map((incident) => incident.ruleId),
        effectCompliance.incidents.map((incident) => incident.ruleId),
        touchedPaths,
        liveExecution?.commandPass ?? true,
        acceptance.success,
        allowlistOk
      );

  await emitDiagnostic(options, {
    type: "run.diagnostic",
    atEpochMs: epochNowMs(),
    runId,
    taskId: tuple.task.id,
    condition: tuple.condition,
    agent: tuple.agent,
    trial: tuple.trial,
    simulate: options.simulate,
    model,
    executionCwd,
    touchedPaths,
    touchedPathCount: touchedPaths.length,
    statusPorcelainRaw: liveExecution?.statusPorcelainRaw ?? "",
    statusPorcelainParsed: liveExecution?.statusPorcelainParsed ?? [],
    allowlist: {
      pass: allowlistOk,
      firstViolationPath: disallowedPaths[0] ?? null,
      violationCount: disallowedPaths.length,
    },
    command: {
      success: liveExecution?.commandPass ?? true,
      timedOut: liveExecution?.commandTimedOut ?? false,
      stdoutTail: liveExecution?.commandStdoutTail ?? "",
      stderrTail: liveExecution?.commandStderrTail ?? "",
      stdoutLength: liveExecution?.commandStdoutLength ?? 0,
      stderrLength: liveExecution?.commandStderrLength ?? 0,
      stdoutTruncated: liveExecution?.commandStdoutTruncated ?? false,
      stderrTruncated: liveExecution?.commandStderrTruncated ?? false,
      tailCharLimit: liveExecution?.commandTailCharLimit ?? commandDiagnosticTailCharLimit,
      backend: liveExecution?.commandBackend ?? "cli",
      completionObserved: liveExecution?.commandCompletionObserved ?? false,
      exitCode: liveExecution?.commandExitCode ?? null,
      signal: liveExecution?.commandSignal ?? null,
      fallbackReason: liveExecution?.commandFallbackReason ?? null,
    },
    acceptance,
    detector: {
      wrongApiRuleIds: wrongApi.incidents.map((incident) => incident.ruleId),
      effectComplianceRuleIds: effectCompliance.incidents.map((incident) => incident.ruleId),
      criticalIncidentCount,
    },
    result: {
      success: result.success,
      failureType: failureSignature?.failureType ?? null,
      rootCause: failureSignature?.rootCause ?? null,
      wallMs: result.wallMs,
      costUsd: result.costUsd,
    },
    wallBudget: {
      maxWallMinutes: options.maxWallMinutes ?? null,
      remainingMsAtRunStart,
      remainingMsAtRunEnd: remainingTimeoutCapMs(suiteDeadlineMs) ?? null,
    },
  });

  return {
    config: {
      agent: tuple.agent,
      model,
      condition: tuple.condition,
      trial: tuple.trial,
    },
    task: tuple.task,
    result,
    selectedPolicyIds: policy.selectedPolicyIds,
    selectedSkills: skills,
    correctionFacts,
    retrievedFacts: packet.facts,
    allowlistPass: allowlistOk,
    touchedPaths,
    transcript: liveExecution?.transcript ?? null,
    failureSignature,
  };
};

/**
 * Decode correction index JSON content.
 *
 * @param content - Raw JSON text containing correction entries.
 * @returns Parsed correction entries used for preflight packet shaping.
 * @since 0.0.0
 * @category functions
 */
export const decodeCorrectionIndexJson = (content: string): ReadonlyArray<CorrectionEntry> =>
  decodeCorrectionEntries(content);

/**
 * Decode pricing table JSON content.
 *
 * @param content - Raw JSON text containing model pricing metadata.
 * @returns Parsed pricing table for token cost estimation.
 * @since 0.0.0
 * @category functions
 */
export const decodePricingTableJson = (content: string): PricingTable => decodePricingTable(content);

const summarizeOutcomeCounts = (records: ReadonlyArray<AgentRunRecord>) => {
  const counts = {
    success: 0,
    wrong_api: 0,
    effect_compliance: 0,
    acceptance: 0,
    allowlist: 0,
    runtime: 0,
  };

  for (const record of records) {
    if (record.result.success) {
      counts.success += 1;
      continue;
    }

    const failureType = record.failureSignature?.failureType ?? "runtime";
    counts[failureType] += 1;
  }

  return counts;
};

/**
 * Execute one benchmark suite.
 *
 * @param options - Runner inputs including tasks, agents, conditions, and wiring.
 * @returns Completed benchmark suite with aggregated run records.
 * @since 0.0.0
 * @category functions
 */
export const runBenchmarkSuite = async (options: RunBenchmarkOptions): Promise<AgentBenchSuite> => {
  const runAtEpochMs = epochNowMs();
  const matrix = buildRunMatrix(options);
  const matrixFingerprint = buildMatrixFingerprint(matrix);
  const plannedRunCount = matrix.length;
  const records: Array<AgentRunRecord> = [];
  const suiteDeadlineMs = resolveDeadlineMs(options.maxWallMinutes);
  const maxWallMinutes = options.maxWallMinutes ?? null;
  const executionResolver = await createExecutionResolver({
    mode: options.executionBackend,
    agents: options.agents,
  });
  let abortReason: string | null = null;

  await emitProgress(options, {
    type: "suite.started",
    atEpochMs: epochNowMs(),
    plannedRunCount,
    strictTaskCount: options.strictTaskCount,
    maxWallMinutes,
  });

  await Effect.runPromise(
    Effect.forEach(
      matrix,
      (tuple, index) =>
        Effect.promise(async () => {
          if (abortReason !== null) {
            return;
          }

          if (hasDeadlineElapsed(suiteDeadlineMs)) {
            abortReason = `Reached max wall clock budget of ${maxWallMinutes} minutes`;
            await emitProgress(options, {
              type: "suite.aborted",
              atEpochMs: epochNowMs(),
              completedRunCount: records.length,
              plannedRunCount,
              reason: abortReason,
            });
            return;
          }

          const runId = `${tuple.task.id}:${tuple.condition}:${tuple.agent}:${tuple.trial}`;
          await emitProgress(options, {
            type: "run.started",
            atEpochMs: epochNowMs(),
            runId,
            runIndex: index + 1,
            totalRuns: plannedRunCount,
            taskId: tuple.task.id,
            condition: tuple.condition,
            agent: tuple.agent,
            trial: tuple.trial,
          });

          const record = await executeRunTuple(options, tuple, executionResolver, suiteDeadlineMs);
          records.push(record);

          await emitProgress(options, {
            type: "run.completed",
            atEpochMs: epochNowMs(),
            runId: record.result.runId,
            runIndex: index + 1,
            totalRuns: plannedRunCount,
            success: record.result.success,
            failureType: record.failureSignature?.failureType ?? null,
            wallMs: record.result.wallMs,
          });

          if (abortReason === null && records.length < plannedRunCount && hasDeadlineElapsed(suiteDeadlineMs)) {
            abortReason = `Reached max wall clock budget of ${maxWallMinutes} minutes`;
            await emitProgress(options, {
              type: "suite.aborted",
              atEpochMs: epochNowMs(),
              completedRunCount: records.length,
              plannedRunCount,
              reason: abortReason,
            });
          }
        }),
      {
        concurrency: 1,
      }
    )
  );

  const status: BenchSuiteStatus = abortReason === null ? "completed" : "aborted_wall_cap";
  await emitProgress(options, {
    type: "suite.completed",
    atEpochMs: epochNowMs(),
    status,
    completedRunCount: records.length,
    plannedRunCount,
  });

  const totalCostUsd = records.reduce((acc, record) => acc + record.result.costUsd, 0);
  const totalWallMs = records.reduce((acc, record) => acc + record.result.wallMs, 0);
  const averageWallMs = records.length === 0 ? 0 : totalWallMs / records.length;
  const outcomeCounts = summarizeOutcomeCounts(records);
  await emitDiagnostic(options, {
    type: "suite.metrics",
    atEpochMs: epochNowMs(),
    status,
    plannedRunCount,
    completedRunCount: records.length,
    totalCostUsd,
    totalWallMs,
    averageWallMs,
    outcomeCounts,
    abortReason,
  });

  const suite: AgentBenchSuite = {
    formatVersion: 1,
    runAtEpochMs,
    strictTaskCount: options.strictTaskCount,
    conditions: options.conditions,
    runMode: options.simulate ? "simulate" : "live",
    executionBackend: summarizeExecutionBackend(records, options.executionBackend),
    matrixFingerprint,
    status,
    plannedRunCount,
    completedRunCount: records.length,
    abortReason: abortReason ?? undefined,
    records,
  };

  return suite;
};
