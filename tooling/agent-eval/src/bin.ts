#!/usr/bin/env node

/**
 * CLI entry point for agent-eval benchmarks.
 *
 * @since 0.0.0
 * @module
 */

import type { FileSystem, Path } from "effect";
import { Cause, Effect, HashMap } from "effect";
import * as A from "effect/Array";
import * as Exit from "effect/Exit";
import * as O from "effect/Option";
import * as Str from "effect/String";
import { handleBench } from "./commands/bench.js";
import {
  parseBenchAgentsFlag,
  parseBenchConditionsFlag,
  parseClaudeEffortFlag,
  parseMaxWallMinutesFlag,
  parseModelFlag,
  parseReasoningFlag,
  parseTaskIdsFlag,
  parseWorktreeRootFlag,
  resolveDefaultWorktreeRoot,
} from "./commands/bench-flags.js";
import { handleCompare } from "./commands/compare.js";
import { handleIngest } from "./commands/ingest.js";
import { handleReport } from "./commands/report.js";
import { AgentEvalConfigError } from "./errors.js";
import { AgentEvalPlatformLayer } from "./runtime.js";

const parseFlags = (argv: ReadonlyArray<string>): HashMap.HashMap<string, string> => {
  const entries = A.empty<readonly [string, string]>();

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index] ?? "";
    if (!Str.startsWith("--")(token)) {
      continue;
    }

    const key = Str.slice(2)(token);
    const next = argv[index + 1] ?? "";
    if (Str.startsWith("--")(next) || next.length === 0) {
      entries.push([key, "true"]);
      continue;
    }

    entries.push([key, next]);
    index += 1;
  }

  return HashMap.fromIterable(entries);
};

const readFlag = (flags: HashMap.HashMap<string, string>, key: string, fallback: string): string =>
  O.getOrElse(HashMap.get(flags, key), () => fallback);

const readOptionalFlag = (flags: HashMap.HashMap<string, string>, key: string): string | undefined => {
  const raw = HashMap.get(flags, key);
  return O.isSome(raw) ? raw.value : undefined;
};

const readIntFlag = (flags: HashMap.HashMap<string, string>, key: string, fallback: number): number => {
  const raw = HashMap.get(flags, key);
  if (O.isNone(raw)) {
    return fallback;
  }
  const value = Number.parseInt(raw.value, 10);
  return Number.isNaN(value) ? fallback : value;
};

const readBoolFlag = (flags: HashMap.HashMap<string, string>, key: string, fallback: boolean): boolean => {
  const raw = HashMap.get(flags, key);
  if (O.isNone(raw)) {
    return fallback;
  }
  if (raw.value === "true") {
    return true;
  }
  if (raw.value === "false") {
    return false;
  }
  return fallback;
};

const toConfigError = (cause: unknown, message: string): AgentEvalConfigError =>
  cause instanceof AgentEvalConfigError ? cause : new AgentEvalConfigError({ message, cause });

const toClaudeCompatibleReasoning = (
  reasoning: "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | undefined
): "low" | "medium" | "high" | undefined => {
  if (reasoning === undefined) {
    return undefined;
  }
  if (reasoning === "low" || reasoning === "medium" || reasoning === "high") {
    return reasoning;
  }
  throw new AgentEvalConfigError({
    message: `--reasoning=${reasoning} is not supported when Claude is selected. Use: low, medium, high.`,
  });
};

const printHelp = () => {
  console.log("agent-eval commands:");
  console.log("  bench   --run reliability benchmark suite");
  console.log("  report  --render markdown report from suite json");
  console.log("  compare --compare baseline vs candidate suite");
  console.log("  ingest  --emit/publish failed-run feedback episodes");
};

const run = () => {
  const [command = "help", ...rest] = process.argv.slice(2);
  const flags = parseFlags(rest);

  const commandEffect: Effect.Effect<void, unknown, FileSystem.FileSystem | Path.Path> =
    command === "bench"
      ? Effect.asVoid(
          Effect.gen(function* () {
            const output = readFlag(flags, "output", "outputs/agent-reliability/runs/latest.json");
            const conditions = yield* Effect.try({
              try: () => parseBenchConditionsFlag(readFlag(flags, "conditions", "")),
              catch: (cause) => toConfigError(cause, "Invalid --conditions flag"),
            });
            const agents = yield* Effect.try({
              try: () => parseBenchAgentsFlag(readFlag(flags, "agents", "")),
              catch: (cause) => toConfigError(cause, "Invalid --agents flag"),
            });
            const taskIds = yield* Effect.try({
              try: () => parseTaskIdsFlag(readFlag(flags, "task-ids", "")),
              catch: (cause) => toConfigError(cause, "Invalid --task-ids flag"),
            });
            const maxWallMinutes = yield* Effect.try({
              try: () => parseMaxWallMinutesFlag(readOptionalFlag(flags, "max-wall-minutes")),
              catch: (cause) => toConfigError(cause, "Invalid --max-wall-minutes flag"),
            });
            const isolateInWorktree = readBoolFlag(flags, "worktree", true);
            const worktreeRootOverride = yield* Effect.try({
              try: () => parseWorktreeRootFlag(readOptionalFlag(flags, "worktree-root"), process.env.HOME),
              catch: (cause) => toConfigError(cause, "Invalid --worktree-root flag"),
            });
            const worktreeRoot = yield* Effect.try({
              try: () =>
                isolateInWorktree
                  ? (worktreeRootOverride ?? resolveDefaultWorktreeRoot(process.env.XDG_CACHE_HOME, process.env.HOME))
                  : undefined,
              catch: (cause) => toConfigError(cause, "Unable to resolve default --worktree-root"),
            });
            const codexModel = yield* Effect.try({
              try: () => parseModelFlag(readOptionalFlag(flags, "codex-model"), "--codex-model", "gpt-5.2"),
              catch: (cause) => toConfigError(cause, "Invalid --codex-model flag"),
            });
            const claudeModel = yield* Effect.try({
              try: () => parseModelFlag(readOptionalFlag(flags, "claude-model"), "--claude-model", "claude-sonnet-4-6"),
              catch: (cause) => toConfigError(cause, "Invalid --claude-model flag"),
            });
            const claudeEffort = yield* Effect.try({
              try: () => parseClaudeEffortFlag(readOptionalFlag(flags, "claude-effort")),
              catch: (cause) => toConfigError(cause, "Invalid --claude-effort flag"),
            });
            const reasoning = yield* Effect.try({
              try: () => parseReasoningFlag(readOptionalFlag(flags, "reasoning")),
              catch: (cause) => toConfigError(cause, "Invalid --reasoning flag"),
            });
            const effectiveReasoning = yield* Effect.try({
              try: () => {
                if (reasoning !== undefined && claudeEffort !== undefined && reasoning !== claudeEffort) {
                  throw new AgentEvalConfigError({
                    message: `Conflicting reasoning flags: --reasoning=${reasoning} and --claude-effort=${claudeEffort}`,
                  });
                }
                return reasoning ?? claudeEffort;
              },
              catch: (cause) => toConfigError(cause, "Invalid reasoning configuration"),
            });
            const effectiveClaudeEffort = yield* Effect.try({
              try: () => (agents.includes("claude") ? toClaudeCompatibleReasoning(effectiveReasoning) : undefined),
              catch: (cause) => toConfigError(cause, "Invalid reasoning configuration for Claude"),
            });

            return yield* handleBench({
              output,
              reportOutput: readFlag(flags, "report-output", "outputs/agent-reliability/baseline-report.md"),
              progressOutput: readFlag(flags, "progress-output", `${output}.progress.jsonl`),
              diagnostics: readBoolFlag(flags, "diagnostics", false),
              diagnosticsOutput: readFlag(flags, "diagnostics-output", `${output}.diagnostics.jsonl`),
              taskDirectory: readFlag(flags, "task-directory", "benchmarks/agent-reliability/tasks"),
              strictTaskCount: readIntFlag(flags, "strict-task-count", 18),
              smoke: readBoolFlag(flags, "smoke", false),
              smokeTaskLimit: readIntFlag(flags, "smoke-task-limit", 1),
              smokeTimeoutMinutes: readIntFlag(flags, "smoke-timeout-minutes", 1),
              policyDirectory: readFlag(flags, "policy-directory", ".agents/policies"),
              correctionIndexFile: readFlag(
                flags,
                "correction-index-file",
                "benchmarks/agent-reliability/effect-v4-corrections.json"
              ),
              pricingFile: readFlag(flags, "pricing-file", "benchmarks/agent-reliability/pricing.json"),
              simulate: !readBoolFlag(flags, "live", false),
              trials: readIntFlag(flags, "trials", 2),
              graphitiUrl: readFlag(flags, "graphiti-url", "http://localhost:8000/mcp"),
              graphitiGroupId: readFlag(flags, "graphiti-group-id", "beep-dev"),
              isolateInWorktree,
              worktreeRoot,
              codexModel,
              claudeModel,
              claudeEffort: effectiveClaudeEffort,
              reasoningEffort: effectiveReasoning,
              conditions,
              agents,
              taskIds,
              maxWallMinutes,
            });
          })
        )
      : command === "report"
        ? Effect.asVoid(
            handleReport({
              input: readFlag(flags, "input", "outputs/agent-reliability/runs/latest.json"),
              output: readFlag(flags, "output", "outputs/agent-reliability/weekly/latest-report.md"),
              title: readFlag(flags, "title", "Agent Reliability Weekly Report"),
            })
          )
        : command === "compare"
          ? Effect.asVoid(
              handleCompare({
                baseline: readFlag(flags, "baseline", "outputs/agent-reliability/runs/baseline.json"),
                candidate: readFlag(flags, "candidate", "outputs/agent-reliability/runs/latest.json"),
                output: readFlag(flags, "output", "outputs/agent-reliability/weekly/compare.md"),
                title: readFlag(flags, "title", "Agent Reliability Comparison"),
              })
            )
          : command === "ingest"
            ? Effect.asVoid(
                handleIngest({
                  input: readFlag(flags, "input", "outputs/agent-reliability/runs/latest.json"),
                  output: readFlag(flags, "output", "outputs/agent-reliability/episodes/latest.json"),
                  graphitiUrl: readFlag(flags, "graphiti-url", "http://localhost:8000/mcp"),
                  graphitiGroupId: readFlag(flags, "graphiti-group-id", "beep-dev"),
                  publish: readBoolFlag(flags, "publish", false),
                })
              )
            : Effect.sync(printHelp);

  const program = commandEffect.pipe(Effect.provide(AgentEvalPlatformLayer));

  Effect.runPromiseExit(program).then((exit) => {
    if (Exit.isFailure(exit)) {
      console.error(Cause.pretty(exit.cause));
      process.exit(1);
    }
  });
};

run();
