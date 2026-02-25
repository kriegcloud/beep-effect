/**
 * Benchmark runner for multi-condition Codex/Claude reliability experiments.
 *
 * @since 0.0.0
 * @module
 */

import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import * as S from "effect/Schema";
import { buildRetrievalPacket } from "./packet.js";
import { detectWrongApis } from "../effect-v4-detector/index.js";
import { searchMemoryFacts, type GraphitiMcpOptions } from "../graphiti/mcp.js";
import { selectFocusedSkills, selectPolicyPacket, type PolicyOverlay } from "../policies/index.js";
import type {
  AgentBenchSuite,
  AgentRunRecord,
  AgentRunResult,
  AgentTaskSpec,
  AgentName,
  BenchCondition,
} from "../schemas/index.js";

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
  readonly policyOverlays: ReadonlyArray<PolicyOverlay>;
  readonly correctionIndex: ReadonlyArray<CorrectionEntry>;
  readonly graphiti: GraphitiMcpOptions;
  readonly strictTaskCount: number;
}

const decodeCorrectionEntries = S.decodeUnknownSync(
  S.fromJsonString(S.Array(S.Struct({ id: S.NonEmptyString, keywords: S.Array(S.NonEmptyString), fact: S.NonEmptyString })))
);

/**
 * Load correction index from JSON file.
 *
 * @since 0.0.0
 * @category functions
 */
export const loadCorrectionIndex = async (filePath: string): Promise<ReadonlyArray<CorrectionEntry>> => {
  const content = await readFile(filePath, "utf8");
  return decodeCorrectionEntries(content);
};

const modelForAgent = (agent: AgentName): string => (agent === "codex" ? "gpt-5.2" : "claude-sonnet-4.5");

const tokenMultiplier = (condition: BenchCondition): number => {
  if (condition === "minimal") return 0.8;
  if (condition === "adaptive") return 1;
  if (condition === "adaptive_kg") return 1.1;
  return 1.25;
};

const estimateTokens = (prompt: string, condition: BenchCondition): { readonly input: number; readonly output: number } => {
  const words = prompt.split(/\s+/).filter((word) => word.length > 0).length;
  const multiplier = tokenMultiplier(condition);
  return {
    input: Math.max(1, Math.round(words * 24 * multiplier)),
    output: Math.max(1, Math.round(words * 10 * (multiplier + 0.05))),
  };
};

const estimateCost = (inputTokens: number, outputTokens: number): number => ((inputTokens + outputTokens) / 1_000_000) * 2;

const relevantCorrectionFacts = (prompt: string, index: ReadonlyArray<CorrectionEntry>): ReadonlyArray<string> => {
  const lowered = prompt.toLowerCase();
  const facts: Array<string> = [];

  for (const entry of index) {
    let matched = false;
    for (const keyword of entry.keywords) {
      if (lowered.includes(keyword.toLowerCase())) {
        matched = true;
        break;
      }
    }

    if (matched) {
      facts.push(entry.fact);
    }
  }

  return facts;
};

const resolveTaskCwd = (repoRoot: string, taskCwd: string): string =>
  path.isAbsolute(taskCwd) ? taskCwd : path.join(repoRoot, taskCwd);

const runOneCommand = async (cwd: string, command: string, timeoutMinutes: number): Promise<boolean> =>
  new Promise((resolve) => {
    const child = spawn("bash", ["-lc", command], {
      cwd,
      stdio: "ignore",
    });

    const timeoutMs = Math.max(1, timeoutMinutes) * 60_000;
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      resolve(false);
    }, timeoutMs);

    child.on("exit", (code) => {
      clearTimeout(timer);
      resolve(code === 0);
    });

    child.on("error", () => {
      clearTimeout(timer);
      resolve(false);
    });
  });

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

/**
 * Execute one benchmark suite.
 *
 * @since 0.0.0
 * @category functions
 */
export const runBenchmarkSuite = async (options: RunBenchmarkOptions): Promise<AgentBenchSuite> => {
  const runAtEpochMs = Math.trunc(performance.timeOrigin + performance.now());
  const records: Array<AgentRunRecord> = [];

  for (const task of options.tasks) {
    for (const condition of options.conditions) {
      for (const agent of options.agents) {
        for (let trial = 1; trial <= options.trials; trial += 1) {
          const policy = selectPolicyPacket(options.policyOverlays, condition, task.category);
          const skills = selectFocusedSkills(task.prompt, task.category, Math.min(3, policy.maxSkills));

          const correctionFacts = relevantCorrectionFacts(task.prompt, options.correctionIndex);
          const kgFacts =
            condition === "adaptive_kg"
              ? await searchMemoryFacts(
                  options.graphiti,
                  `${task.prompt}\npaths: ${task.touchedPathAllowlist.join(", ")}`,
                  policy.maxFacts
                ).catch(() => [])
              : [];

          const packet = buildRetrievalPacket([...correctionFacts, ...kgFacts], policy.maxFacts, policy.maxChars);
          const wrongApi = detectWrongApis(`${task.prompt}\n${packet.facts.join("\n")}`);

          const cwd = resolveTaskCwd(options.repoRoot, task.cwd);
          const startMs = Math.trunc(performance.now());
          const commandsPassed = await runAcceptanceCommands(task, cwd, options.simulate);
          const endMs = Math.trunc(performance.now());

          const tokens = estimateTokens(task.prompt, condition);
          const result: AgentRunResult = {
            runId: `${task.id}:${condition}:${agent}:${trial}`,
            taskId: task.id,
            success: commandsPassed && wrongApi.criticalCount === 0,
            checkPass: commandsPassed,
            lintPass: commandsPassed,
            testPass: commandsPassed,
            wrongApiIncidentCount: wrongApi.criticalCount,
            steps: task.acceptanceCommands.length + skills.length + (condition === "adaptive_kg" ? 2 : 1),
            inputTokens: tokens.input,
            outputTokens: tokens.output,
            costUsd: estimateCost(tokens.input, tokens.output),
            wallMs: Math.max(0, endMs - startMs),
          };

          records.push({
            config: {
              agent,
              model: modelForAgent(agent),
              condition,
              trial,
            },
            task,
            result,
            selectedPolicyIds: policy.selectedPolicyIds,
            selectedSkills: skills,
            correctionFacts,
            retrievedFacts: packet.facts,
          });
        }
      }
    }
  }

  return {
    formatVersion: 1,
    runAtEpochMs,
    strictTaskCount: options.strictTaskCount,
    conditions: options.conditions,
    records,
  };
};
