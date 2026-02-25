/**
 * Benchmark suite comparison rendering.
 *
 * @since 0.0.0
 * @module
 */

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

/**
 * Render markdown comparison between two benchmark suites.
 *
 * @since 0.0.0
 * @category functions
 */
export const renderComparisonMarkdown = (
  baseline: AgentBenchSuite,
  candidate: AgentBenchSuite,
  title: string
): string => {
  const baselineRate = successRate(baseline);
  const candidateRate = successRate(candidate);
  const baselineWrongApi = wrongApiIncidentCount(baseline);
  const candidateWrongApi = wrongApiIncidentCount(candidate);

  return [
    `# ${title}`,
    "",
    `- baselineRunAtEpochMs: ${baseline.runAtEpochMs}`,
    `- candidateRunAtEpochMs: ${candidate.runAtEpochMs}`,
    "",
    "| Metric | Baseline | Candidate | Delta |",
    "|---|---:|---:|---:|",
    `| Success Rate | ${baselineRate.toFixed(2)}% | ${candidateRate.toFixed(2)}% | ${(candidateRate - baselineRate).toFixed(2)}pp |`,
    `| Wrong-API Incidents | ${baselineWrongApi} | ${candidateWrongApi} | ${candidateWrongApi - baselineWrongApi} |`,
    `| Run Count | ${baseline.records.length} | ${candidate.records.length} | ${candidate.records.length - baseline.records.length} |`,
    "",
  ].join("\n");
};
