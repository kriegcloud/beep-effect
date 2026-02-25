/**
 * Markdown report rendering for benchmark suites.
 *
 * @since 0.0.0
 * @module
 */

import type { AgentBenchSuite } from "../schemas/index.js";

const median = (values: ReadonlyArray<number>): number => {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  const isEven = sorted.length % 2 === 0;

  if (isEven) {
    const left = sorted[middle - 1] ?? 0;
    const right = sorted[middle] ?? 0;
    return (left + right) / 2;
  }

  return sorted[middle] ?? 0;
};

const summarizeByKey = (
  suite: AgentBenchSuite,
  keySelector: (record: AgentBenchSuite["records"][number]) => string
): ReadonlyArray<{
  readonly key: string;
  readonly runs: number;
  readonly successes: number;
  readonly wrongApi: number;
  readonly medianCost: number;
}> => {
  const keys: Array<string> = [];
  const groups: Array<Array<AgentBenchSuite["records"][number]>> = [];

  for (const record of suite.records) {
    const key = keySelector(record);
    const index = keys.indexOf(key);
    if (index >= 0) {
      groups[index]?.push(record);
    } else {
      keys.push(key);
      groups.push([record]);
    }
  }

  const rows: Array<{
    readonly key: string;
    readonly runs: number;
    readonly successes: number;
    readonly wrongApi: number;
    readonly medianCost: number;
  }> = [];

  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index] ?? "unknown";
    const records = groups[index] ?? [];
    const runs = records.length;
    const successes = records.filter((record) => record.result.success).length;
    const wrongApi = records.reduce((acc, record) => acc + record.result.wrongApiIncidentCount, 0);
    const medianCost = median(records.map((record) => record.result.costUsd));

    rows.push({ key, runs, successes, wrongApi, medianCost });
  }

  return rows.sort((left, right) => left.key.localeCompare(right.key));
};

/**
 * Render markdown report for one benchmark suite.
 *
 * @since 0.0.0
 * @category functions
 */
export const renderBenchmarkMarkdown = (suite: AgentBenchSuite, title: string): string => {
  const byCondition = summarizeByKey(suite, (record) => record.config.condition);
  const byAgent = summarizeByKey(suite, (record) => `${record.config.agent}:${record.config.model}`);

  const conditionRows = byCondition
    .map((row) => {
      const successRate = row.runs === 0 ? 0 : (row.successes / row.runs) * 100;
      return `| ${row.key} | ${row.runs} | ${row.successes} | ${successRate.toFixed(2)}% | ${row.wrongApi} | $${row.medianCost.toFixed(4)} |`;
    })
    .join("\n");

  const agentRows = byAgent
    .map((row) => {
      const successRate = row.runs === 0 ? 0 : (row.successes / row.runs) * 100;
      return `| ${row.key} | ${row.runs} | ${row.successes} | ${successRate.toFixed(2)}% | ${row.wrongApi} | $${row.medianCost.toFixed(4)} |`;
    })
    .join("\n");

  return [
    `# ${title}`,
    "",
    `- formatVersion: ${suite.formatVersion}`,
    `- runAtEpochMs: ${suite.runAtEpochMs}`,
    `- strictTaskCount: ${suite.strictTaskCount}`,
    `- totalRuns: ${suite.records.length}`,
    "",
    "## By Condition",
    "",
    "| Condition | Runs | Successes | Success Rate | Wrong-API Incidents | Median Cost |",
    "|---|---:|---:|---:|---:|---:|",
    conditionRows,
    "",
    "## By Agent",
    "",
    "| Agent:Model | Runs | Successes | Success Rate | Wrong-API Incidents | Median Cost |",
    "|---|---:|---:|---:|---:|---:|",
    agentRows,
    "",
  ].join("\n");
};
