/**
 * Benchmark suite comparison rendering.
 *
 * @since 0.0.0
 * @module
 */

import { String as Str } from "effect";
import type { AgentBenchSuite } from "../schemas/index.js";

const successRate = (suite: AgentBenchSuite): number => {
  if (suite.records.length === 0) {
    return 0;
  }
  const successes = suite.records.filter((record) => record.result.success).length;
  return (successes / suite.records.length) * 100;
};

const wrongApiIncidentCount = (suite: AgentBenchSuite): number =>
  suite.records.reduce((acc, record) => acc + record.result.wrongApiIncidentCount, 0);

type InferredRunMode = "simulate" | "live" | "unknown";

const inferRunMode = (suite: AgentBenchSuite): InferredRunMode => {
  if (suite.runMode !== undefined) {
    return suite.runMode;
  }

  if (suite.records.length === 0) {
    return "unknown";
  }

  const transcriptStates = suite.records.map((record) => record.transcript === null);
  return transcriptStates.every(Boolean) ? "simulate" : "live";
};

const uniqueSorted = (values: ReadonlyArray<string>): ReadonlyArray<string> => {
  const unique: Array<string> = [];
  for (const value of values) {
    if (!unique.includes(value)) {
      unique.push(value);
    }
  }
  return unique.sort((left, right) => Str.localeCompare(right)(left));
};

const uniqueSortedNumbers = (values: ReadonlyArray<number>): ReadonlyArray<number> => {
  const unique: Array<number> = [];
  for (const value of values) {
    if (!unique.includes(value)) {
      unique.push(value);
    }
  }
  return unique.sort((left, right) => left - right);
};

interface MatrixSummary {
  readonly tasks: ReadonlyArray<string>;
  readonly conditions: ReadonlyArray<string>;
  readonly agents: ReadonlyArray<string>;
  readonly trials: ReadonlyArray<number>;
}

const summarizeMatrix = (suite: AgentBenchSuite): MatrixSummary => ({
  tasks: uniqueSorted(suite.records.map((record) => record.task.id)),
  conditions: uniqueSorted(suite.conditions),
  agents: uniqueSorted(suite.records.map((record) => record.config.agent)),
  trials: uniqueSortedNumbers(suite.records.map((record) => record.config.trial)),
});

const arraysEqual = <T extends string | number>(left: ReadonlyArray<T>, right: ReadonlyArray<T>): boolean =>
  left.length === right.length && left.every((value, index) => value === (right[index] ?? null));

const matrixComparable = (
  baseline: AgentBenchSuite,
  candidate: AgentBenchSuite
): { comparable: boolean; caveats: string[] } => {
  const caveats: Array<string> = [];

  if (baseline.matrixFingerprint !== undefined && candidate.matrixFingerprint !== undefined) {
    if (baseline.matrixFingerprint !== candidate.matrixFingerprint) {
      caveats.push("matrixFingerprint differs between baseline and candidate.");
    }
  } else {
    const baselineSummary = summarizeMatrix(baseline);
    const candidateSummary = summarizeMatrix(candidate);
    if (!arraysEqual(baselineSummary.tasks, candidateSummary.tasks)) {
      caveats.push(
        `task IDs differ (baseline=${baselineSummary.tasks.join(",")} candidate=${candidateSummary.tasks.join(",")}).`
      );
    }
    if (!arraysEqual(baselineSummary.conditions, candidateSummary.conditions)) {
      caveats.push(
        `conditions differ (baseline=${baselineSummary.conditions.join(",")} candidate=${candidateSummary.conditions.join(",")}).`
      );
    }
    if (!arraysEqual(baselineSummary.agents, candidateSummary.agents)) {
      caveats.push(
        `agents differ (baseline=${baselineSummary.agents.join(",")} candidate=${candidateSummary.agents.join(",")}).`
      );
    }
    if (!arraysEqual(baselineSummary.trials, candidateSummary.trials)) {
      caveats.push(
        `trials differ (baseline=${baselineSummary.trials.join(",")} candidate=${candidateSummary.trials.join(",")}).`
      );
    }
  }

  return {
    comparable: caveats.length === 0,
    caveats,
  };
};

/**
 * Render markdown comparison between two benchmark suites.
 *
 * @param baseline - Baseline suite used as the reference run.
 * @param candidate - Candidate suite to compare against the baseline.
 * @param title - Report title rendered as the markdown heading.
 * @returns Markdown table with success-rate and wrong-API deltas.
 * @since 0.0.0
 * @category functions
 */
export const renderComparisonMarkdown = (
  baseline: AgentBenchSuite,
  candidate: AgentBenchSuite,
  title: string
): string => {
  const baselineStatus = baseline.status ?? "completed";
  const candidateStatus = candidate.status ?? "completed";
  const baselineRunMode = inferRunMode(baseline);
  const candidateRunMode = inferRunMode(candidate);
  const comparableMatrix = matrixComparable(baseline, candidate);
  const comparabilityCaveats: Array<string> = [...comparableMatrix.caveats];
  if (baselineRunMode !== "unknown" && candidateRunMode !== "unknown" && baselineRunMode !== candidateRunMode) {
    comparabilityCaveats.push(`runMode differs (baseline=${baselineRunMode}, candidate=${candidateRunMode}).`);
  }

  const baselineRate = successRate(baseline);
  const candidateRate = successRate(candidate);
  const baselineWrongApi = wrongApiIncidentCount(baseline);
  const candidateWrongApi = wrongApiIncidentCount(candidate);

  return [
    `# ${title}`,
    "",
    `- baselineRunAtEpochMs: ${baseline.runAtEpochMs}`,
    `- baselineStatus: ${baselineStatus}`,
    `- candidateRunAtEpochMs: ${candidate.runAtEpochMs}`,
    `- candidateStatus: ${candidateStatus}`,
    `- baselineRunMode: ${baselineRunMode}`,
    `- candidateRunMode: ${candidateRunMode}`,
    `- baselineExecutionBackend: ${baseline.executionBackend ?? "unknown"}`,
    `- candidateExecutionBackend: ${candidate.executionBackend ?? "unknown"}`,
    ...(baselineStatus !== "completed" || candidateStatus !== "completed"
      ? ["", "> WARNING: One or both suites are incomplete; compare deltas may not represent full matrix behavior."]
      : []),
    ...(comparabilityCaveats.length > 0
      ? [
          "",
          "> NON-COMPARABLE: baseline and candidate do not share equivalent matrix/run-mode assumptions.",
          ...comparabilityCaveats.map((caveat) => `> - ${caveat}`),
        ]
      : []),
    "",
    "| Metric | Baseline | Candidate | Delta |",
    "|---|---:|---:|---:|",
    `| Success Rate | ${baselineRate.toFixed(2)}% | ${candidateRate.toFixed(2)}% | ${(candidateRate - baselineRate).toFixed(2)}pp |`,
    `| Wrong-API Incidents | ${baselineWrongApi} | ${candidateWrongApi} | ${candidateWrongApi - baselineWrongApi} |`,
    `| Run Count | ${baseline.records.length} | ${candidate.records.length} | ${candidate.records.length - baseline.records.length} |`,
    "",
  ].join("\n");
};
