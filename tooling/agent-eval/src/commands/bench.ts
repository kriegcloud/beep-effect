/**
 * Bench command implementation.
 *
 * @since 0.0.0
 * @module
 */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import * as S from "effect/Schema";
import { loadTaskCatalog } from "../benchmark/catalog.js";
import { renderBenchmarkMarkdown } from "../benchmark/report.js";
import { loadCorrectionIndex, runBenchmarkSuite } from "../benchmark/runner.js";
import { loadPolicyOverlays } from "../policies/index.js";
import { AgentBenchSuiteSchema, type AgentBenchSuite } from "../schemas/index.js";

/**
 * Bench command arguments.
 *
 * @since 0.0.0
 * @category models
 */
export interface BenchArgs {
  readonly output: string;
  readonly reportOutput: string;
  readonly taskDirectory: string;
  readonly policyDirectory: string;
  readonly correctionIndexFile: string;
  readonly simulate: boolean;
  readonly trials: number;
  readonly graphitiUrl: string;
  readonly graphitiGroupId: string;
}

const decodeSuite = S.decodeUnknownSync(AgentBenchSuiteSchema);

/**
 * Execute benchmark run and persist JSON + markdown artifacts.
 *
 * @since 0.0.0
 * @category commands
 */
export const handleBench = async (args: BenchArgs): Promise<AgentBenchSuite> => {
  const outputPath = path.resolve(args.output);
  const reportPath = path.resolve(args.reportOutput);

  const tasks = await loadTaskCatalog(path.resolve(args.taskDirectory), 18);
  const overlays = await loadPolicyOverlays(path.resolve(args.policyDirectory));
  const correctionIndex = await loadCorrectionIndex(path.resolve(args.correctionIndexFile));

  const suite = await runBenchmarkSuite({
    tasks,
    conditions: ["current", "minimal", "adaptive", "adaptive_kg"],
    agents: ["codex", "claude"],
    trials: args.trials,
    simulate: args.simulate,
    repoRoot: process.cwd(),
    policyOverlays: overlays,
    correctionIndex,
    graphiti: {
      url: args.graphitiUrl,
      groupId: args.graphitiGroupId,
    },
    strictTaskCount: 18,
  });

  const validatedSuite = decodeSuite(suite);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(validatedSuite, null, 2)}\n`, "utf8");

  const report = renderBenchmarkMarkdown(validatedSuite, "Agent Reliability Benchmark Report");
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, report, "utf8");

  return validatedSuite;
};

/**
 * Read one benchmark suite from JSON file.
 *
 * @since 0.0.0
 * @category commands
 */
export const readSuiteFile = async (filePath: string): Promise<AgentBenchSuite> => {
  const content = await readFile(path.resolve(filePath), "utf8");
  const decode = S.decodeUnknownSync(S.fromJsonString(AgentBenchSuiteSchema));
  return decode(content);
};
