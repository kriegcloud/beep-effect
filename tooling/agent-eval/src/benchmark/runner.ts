/**
 * Benchmark runner for multi-condition Codex/Claude reliability experiments.
 *
 * @since 0.0.0
 * @module
 */

import { spawn } from "node:child_process";
import { Effect } from "effect";
import type * as Path from "effect/Path";
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
  FailureSignature,
} from "../schemas/index.js";
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
  readonly strictTaskCount: number;
  readonly isolateInWorktree: boolean;
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
  readonly executionCwd: string;
}

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

const CodexTurnCompletedSchema = S.Struct({
  type: S.Literal("turn.completed"),
  usage: S.Struct({
    input_tokens: S.Int,
    output_tokens: S.Int,
  }),
});

const decodeCodexTurnCompleted = S.decodeUnknownSync(CodexTurnCompletedSchema);

const ClaudeUsageSchema = S.Struct({
  input_tokens: S.optional(S.Int),
  output_tokens: S.optional(S.Int),
});

const ClaudeJsonSchema = S.Struct({
  result: S.optional(S.String),
  message: S.optional(S.String),
  content: S.optional(S.String),
  total_cost_usd: S.optional(S.Number),
  usage: S.optional(ClaudeUsageSchema),
});

const decodeClaudeJson = S.decodeUnknownSync(ClaudeJsonSchema);

const modelForAgent = (agent: AgentName): string => (agent === "codex" ? "gpt-5.2" : "claude-sonnet-4-6");

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
  const words = prompt.split(/\s+/).filter((word) => word.length > 0).length;
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
  const lowered = prompt.toLowerCase();
  const facts: Array<string> = [];

  for (const entry of index) {
    const matched = entry.keywords.some((keyword) => lowered.includes(keyword.toLowerCase()));
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
  timeoutMinutes: number
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

    const timeoutMs = Math.max(1, timeoutMinutes) * 60_000;
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
      });
    }, timeoutMs);

    child.on("exit", (code) => {
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
      });
    });
  });

const runOneCommand = async (cwd: string, command: string, timeoutMinutes: number): Promise<boolean> => {
  const result = await runProcess("bash", ["-lc", command], cwd, timeoutMinutes);
  return result.success;
};

const runAcceptanceCommands = async (task: AgentTaskSpec, cwd: string, simulate: boolean): Promise<boolean> => {
  if (simulate) {
    return true;
  }

  for (const command of task.acceptanceCommands) {
    const passed = await runOneCommand(cwd, command, task.timeoutMinutes);
    if (!passed) {
      return false;
    }
  }

  return true;
};

const parseJsonLine = (line: string): unknown | null => {
  try {
    return JSON.parse(line) as unknown;
  } catch {
    return null;
  }
};

const parseCodexUsage = (stdout: string): { readonly inputTokens: number; readonly outputTokens: number } => {
  let inputTokens = 0;
  let outputTokens = 0;
  const lines = stdout
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  for (const line of lines) {
    const parsed = parseJsonLine(line);
    if (parsed === null) {
      continue;
    }

    try {
      const decoded = decodeCodexTurnCompleted(parsed);
      inputTokens = decoded.usage.input_tokens;
      outputTokens = decoded.usage.output_tokens;
    } catch {
      // Ignore non-matching lines in codex JSONL output.
    }
  }

  return {
    inputTokens,
    outputTokens,
  };
};

const parseClaudeOutput = (
  stdout: string
): {
  readonly assistantText: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly costUsd: number | null;
} => {
  const parsed = parseJsonLine(stdout);
  if (parsed === null) {
    return {
      assistantText: stdout,
      inputTokens: 0,
      outputTokens: 0,
      costUsd: null,
    };
  }

  try {
    const value = decodeClaudeJson(parsed);
    return {
      assistantText: value.result ?? value.message ?? value.content ?? stdout,
      inputTokens: value.usage?.input_tokens ?? 0,
      outputTokens: value.usage?.output_tokens ?? 0,
      costUsd: value.total_cost_usd ?? null,
    };
  } catch {
    return {
      assistantText: stdout,
      inputTokens: 0,
      outputTokens: 0,
      costUsd: null,
    };
  }
};

const collectTouchedPaths = (statusOutput: string): ReadonlyArray<string> => {
  const ignoredRoots = ["node_modules"] as const;
  const lines = statusOutput
    .split("\n")
    .map((line) => line.replace(/\r$/, ""))
    .filter((line) => line.trim().length > 0);

  const touched: Array<string> = [];
  for (const line of lines) {
    const rawPath = line.length > 3 ? line.slice(3).trim() : line.trim();
    const maybeRenamed = rawPath.includes(" -> ") ? (rawPath.split(" -> ").at(-1) ?? rawPath) : rawPath;
    const ignored = ignoredRoots.some((root) => maybeRenamed === root || maybeRenamed.startsWith(`${root}/`));
    if (ignored) {
      continue;
    }
    if (!touched.includes(maybeRenamed)) {
      touched.push(maybeRenamed);
    }
  }

  return touched;
};

const sourceFileExtensions = [".ts", ".tsx", ".js", ".jsx", ".mts", ".cts"] as const;

const isSourceFilePath = (filePath: string): boolean =>
  sourceFileExtensions.some((extension) => filePath.endsWith(extension));

const readTouchedSourceFiles = async (
  executionRoot: string,
  touchedPaths: ReadonlyArray<string>
): Promise<ReadonlyArray<TouchedSourceFile>> => {
  const files: Array<TouchedSourceFile> = [];

  for (const touchedPath of touchedPaths) {
    if (!isSourceFilePath(touchedPath)) {
      continue;
    }

    const readResult = await runProcess("cat", [touchedPath], executionRoot, 1);
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

const isPathAllowed = (filePath: string, allowlist: ReadonlyArray<string>): boolean =>
  allowlist.some((allowed) => filePath === allowed || filePath.startsWith(`${allowed}/`));

const allowlistPass = (touchedPaths: ReadonlyArray<string>, allowlist: ReadonlyArray<string>): boolean =>
  touchedPaths.every((filePath) => isPathAllowed(filePath, allowlist));

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

const runAgentCommand = async (
  agent: AgentName,
  model: string,
  promptPacket: string,
  cwd: string,
  timeoutMinutes: number
): Promise<ProcessResult> => {
  if (agent === "codex") {
    return runProcess("codex", ["exec", "--json", "--model", model, promptPacket], cwd, timeoutMinutes);
  }

  return runProcess("claude", ["-p", promptPacket, "--output-format", "json", "--model", model], cwd, timeoutMinutes);
};

const createWorktreePath = (pathApi: Path.Path, repoRoot: string, runId: string): string => {
  const safe = runId.replaceAll(":", "__").replaceAll("/", "__");
  const unique = `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
  return pathApi.join(repoRoot, "outputs", "agent-reliability", "worktrees", `${safe}__${unique}`);
};

const isRepoClean = async (repoRoot: string): Promise<boolean> => {
  const statusResult = await runProcess("git", ["-C", repoRoot, "status", "--porcelain"], repoRoot, 1);
  return statusResult.success && statusResult.stdout.trim().length === 0;
};

const ensureWorktreeDependencies = async (
  pathApi: Path.Path,
  repoRoot: string,
  worktreePath: string
): Promise<void> => {
  const repoNodeModules = pathApi.join(repoRoot, "node_modules");
  const worktreeNodeModules = pathApi.join(worktreePath, "node_modules");
  const hasRepoNodeModules = await runProcess("test", ["-d", repoNodeModules], repoRoot, 1);
  const hasWorktreeNodeModules = await runProcess("test", ["-e", worktreeNodeModules], repoRoot, 1);

  if (hasRepoNodeModules.success && !hasWorktreeNodeModules.success) {
    await runProcess("ln", ["-s", repoNodeModules, worktreeNodeModules], repoRoot, 1);
  }
};

const withRunCwd = async (
  pathApi: Path.Path,
  repoRoot: string,
  runId: string,
  enabled: boolean,
  action: (cwd: string) => Promise<LiveExecutionResult>
): Promise<LiveExecutionResult> => {
  if (!enabled) {
    return action(repoRoot);
  }

  const worktreePath = createWorktreePath(pathApi, repoRoot, runId);
  const addResult = await runProcess(
    "git",
    ["-C", repoRoot, "worktree", "add", "--detach", "--force", worktreePath],
    repoRoot,
    5
  );

  if (!addResult.success) {
    if (await isRepoClean(repoRoot)) {
      return action(repoRoot);
    }
    throw new AgentEvalInvariantError({
      message: `Failed to create isolated worktree for ${runId}: ${addResult.stderr || addResult.stdout}`,
    });
  }

  try {
    await ensureWorktreeDependencies(pathApi, repoRoot, worktreePath);
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
  isolateInWorktree: boolean,
  pathApi: Path.Path
): Promise<LiveExecutionResult> =>
  withRunCwd(pathApi, repoRoot, runId, isolateInWorktree, async (executionRoot) => {
    const taskRelative = pathApi.relative(repoRoot, taskCwd);
    const executionCwd = executionRoot === repoRoot ? taskCwd : pathApi.join(executionRoot, taskRelative);

    const commandResult = await runAgentCommand(
      tuple.agent,
      model,
      promptPacket,
      executionCwd,
      tuple.task.timeoutMinutes
    );
    const statusResult = await runProcess("git", ["status", "--porcelain"], executionRoot, 2);
    const touchedPaths = collectTouchedPaths(statusResult.stdout);
    const touchedSourceFiles = await readTouchedSourceFiles(executionRoot, touchedPaths);
    const allowlistOk = allowlistPass(touchedPaths, tuple.task.touchedPathAllowlist);

    const codexUsage = tuple.agent === "codex" ? parseCodexUsage(commandResult.stdout) : null;
    const claudeOutput = tuple.agent === "claude" ? parseClaudeOutput(commandResult.stdout) : null;
    const inputTokens = codexUsage?.inputTokens ?? claudeOutput?.inputTokens ?? 0;
    const outputTokens = codexUsage?.outputTokens ?? claudeOutput?.outputTokens ?? 0;
    const costUsd =
      claudeOutput?.costUsd ?? estimateCost(pricingTable, model, Math.max(0, inputTokens), Math.max(0, outputTokens));

    const transcript: AgentRunTranscript = {
      runId,
      taskId: tuple.task.id,
      agent: tuple.agent,
      model,
      command:
        tuple.agent === "codex"
          ? `codex exec --json --model ${model}`
          : `claude -p --output-format json --model ${model}`,
      promptPacket,
      rawOutput: commandResult.stdout,
      assistantText: claudeOutput?.assistantText ?? commandResult.stdout,
      inputTokens: Math.max(0, inputTokens),
      outputTokens: Math.max(0, outputTokens),
      costUsd: Math.max(0, costUsd),
      touchedPaths,
    };

    return {
      transcript,
      allowlistPass: allowlistOk,
      touchedPaths,
      touchedSourceFiles,
      commandPass: commandResult.success && !commandResult.timedOut,
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
        Array.from({ length: options.trials }, (_unused, index) => ({
          task,
          condition,
          agent,
          trial: index + 1,
        }))
      )
    )
  );

const executeRunTuple = async (options: RunBenchmarkOptions, tuple: RunTuple): Promise<AgentRunRecord> => {
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
  const model = modelForAgent(tuple.agent);
  const taskCwd = resolveTaskCwd(options.pathApi, options.repoRoot, tuple.task.cwd);
  const startMs = Date.now();

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
        options.isolateInWorktree,
        options.pathApi
      );

  const executionCwd = liveExecution?.executionCwd ?? taskCwd;
  const commandsPassed = await runAcceptanceCommands(tuple.task, executionCwd, options.simulate);

  const touchedSourceFiles = liveExecution?.touchedSourceFiles ?? [];
  const detectorInput = touchedSourceFiles
    .map((file) => [`// path: ${file.path}`, file.content].join("\n"))
    .join("\n\n");
  const wrongApi = detectWrongApis(detectorInput);
  const effectCompliance = detectEffectComplianceViolations(detectorInput);
  const endMs = Date.now();

  const estimatedTokens = estimateTokens(tuple.task.prompt, tuple.condition);
  const inputTokens = liveExecution?.transcript.inputTokens ?? estimatedTokens.input;
  const outputTokens = liveExecution?.transcript.outputTokens ?? estimatedTokens.output;
  const costUsd =
    liveExecution?.transcript.costUsd ?? estimateCost(options.pricingTable, model, inputTokens, outputTokens);

  const touchedPaths = liveExecution?.touchedPaths ?? [];
  const allowlistOk = liveExecution?.allowlistPass ?? true;
  const runPassed = (liveExecution?.commandPass ?? true) && commandsPassed;
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
        commandsPassed,
        allowlistOk
      );

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
 * @since 0.0.0
 * @category functions
 */
export const decodeCorrectionIndexJson = (content: string): ReadonlyArray<CorrectionEntry> =>
  decodeCorrectionEntries(content);

/**
 * Decode pricing table JSON content.
 *
 * @since 0.0.0
 * @category functions
 */
export const decodePricingTableJson = (content: string): PricingTable => decodePricingTable(content);

/**
 * Execute one benchmark suite.
 *
 * @since 0.0.0
 * @category functions
 */
export const runBenchmarkSuite = async (options: RunBenchmarkOptions): Promise<AgentBenchSuite> => {
  const runAtEpochMs = Date.now();
  const matrix = buildRunMatrix(options);
  const records = await Effect.runPromise(
    Effect.forEach(matrix, (tuple) => Effect.promise(() => executeRunTuple(options, tuple)), {
      concurrency: 1,
    })
  );

  return {
    formatVersion: 1,
    runAtEpochMs,
    strictTaskCount: options.strictTaskCount,
    conditions: options.conditions,
    records,
  };
};
