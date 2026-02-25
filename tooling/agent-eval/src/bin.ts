#!/usr/bin/env node

/**
 * CLI entry point for agent-eval benchmarks.
 *
 * @since 0.0.0
 * @module
 */

import type { FileSystem, Path } from "effect";
import { Effect, HashMap } from "effect";
import * as O from "effect/Option";
import { handleBench } from "./commands/bench.js";
import { handleCompare } from "./commands/compare.js";
import { handleIngest } from "./commands/ingest.js";
import { handleReport } from "./commands/report.js";
import { AgentEvalPlatformLayer } from "./runtime.js";

const parseFlags = (argv: ReadonlyArray<string>): HashMap.HashMap<string, string> => {
  const entries: Array<readonly [string, string]> = [];

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index] ?? "";
    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1] ?? "";
    if (next.startsWith("--") || next.length === 0) {
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
          handleBench({
            output: readFlag(flags, "output", "outputs/agent-reliability/runs/latest.json"),
            reportOutput: readFlag(flags, "report-output", "outputs/agent-reliability/baseline-report.md"),
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
            isolateInWorktree: readBoolFlag(flags, "worktree", true),
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

  Effect.runPromise(program).catch((error) => {
    console.error(error);
    process.exit(1);
  });
};

run();
