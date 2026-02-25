#!/usr/bin/env node

/**
 * CLI entry point for agent-eval benchmarks.
 *
 * @since 0.0.0
 * @module
 */

import { Console } from "node:console";
import { handleBench } from "./commands/bench.js";
import { handleCompare } from "./commands/compare.js";
import { handleIngest } from "./commands/ingest.js";
import { handleReport } from "./commands/report.js";

const parseFlags = (argv: ReadonlyArray<string>): ReadonlyMap<string, string> => {
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

  return new Map(entries);
};

const readFlag = (flags: ReadonlyMap<string, string>, key: string, fallback: string): string => flags.get(key) ?? fallback;

const readIntFlag = (flags: ReadonlyMap<string, string>, key: string, fallback: number): number => {
  const raw = flags.get(key);
  if (!raw) {
    return fallback;
  }
  const value = Number.parseInt(raw, 10);
  return Number.isNaN(value) ? fallback : value;
};

const readBoolFlag = (flags: ReadonlyMap<string, string>, key: string, fallback: boolean): boolean => {
  const raw = flags.get(key);
  if (!raw) {
    return fallback;
  }
  if (raw === "true") {
    return true;
  }
  if (raw === "false") {
    return false;
  }
  return fallback;
};

const printHelp = () => {
  const out = new Console(process.stdout, process.stderr);
  out.log("agent-eval commands:");
  out.log("  bench   --run reliability benchmark suite");
  out.log("  report  --render markdown report from suite json");
  out.log("  compare --compare baseline vs candidate suite");
  out.log("  ingest  --emit/publish failed-run feedback episodes");
};

const run = async () => {
  const [command = "help", ...rest] = process.argv.slice(2);
  const flags = parseFlags(rest);

  if (command === "bench") {
    const simulate = !readBoolFlag(flags, "live", false);
    await handleBench({
      output: readFlag(flags, "output", "outputs/agent-reliability/runs/latest.json"),
      reportOutput: readFlag(flags, "report-output", "outputs/agent-reliability/baseline-report.md"),
      taskDirectory: readFlag(flags, "task-directory", "benchmarks/agent-reliability/tasks"),
      policyDirectory: readFlag(flags, "policy-directory", ".agents/policies"),
      correctionIndexFile: readFlag(
        flags,
        "correction-index-file",
        "benchmarks/agent-reliability/effect-v4-corrections.json"
      ),
      simulate,
      trials: readIntFlag(flags, "trials", 2),
      graphitiUrl: readFlag(flags, "graphiti-url", "http://localhost:8000/mcp"),
      graphitiGroupId: readFlag(flags, "graphiti-group-id", "beep-dev"),
    });
    return;
  }

  if (command === "report") {
    await handleReport({
      input: readFlag(flags, "input", "outputs/agent-reliability/runs/latest.json"),
      output: readFlag(flags, "output", "outputs/agent-reliability/weekly/latest-report.md"),
      title: readFlag(flags, "title", "Agent Reliability Weekly Report"),
    });
    return;
  }

  if (command === "compare") {
    await handleCompare({
      baseline: readFlag(flags, "baseline", "outputs/agent-reliability/runs/baseline.json"),
      candidate: readFlag(flags, "candidate", "outputs/agent-reliability/runs/latest.json"),
      output: readFlag(flags, "output", "outputs/agent-reliability/weekly/compare.md"),
      title: readFlag(flags, "title", "Agent Reliability Comparison"),
    });
    return;
  }

  if (command === "ingest") {
    await handleIngest({
      input: readFlag(flags, "input", "outputs/agent-reliability/runs/latest.json"),
      output: readFlag(flags, "output", "outputs/agent-reliability/episodes/latest.json"),
      graphitiUrl: readFlag(flags, "graphiti-url", "http://localhost:8000/mcp"),
      graphitiGroupId: readFlag(flags, "graphiti-group-id", "beep-dev"),
      publish: readBoolFlag(flags, "publish", false),
    });
    return;
  }

  printHelp();
};

run().catch((error) => {
  const out = new Console(process.stdout, process.stderr);
  out.error(error);
  process.exit(1);
});
