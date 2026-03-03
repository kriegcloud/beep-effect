import { String as Str } from "effect";
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
  readonly labeledPrompts: number;
  readonly top5Hits: number;
  readonly reviewerScoreCount: number;
  readonly reviewerScoreMean: number | null;
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
    readonly labeledPrompts: number;
    readonly top5Hits: number;
    readonly reviewerScoreCount: number;
    readonly reviewerScoreMean: number | null;
  }> = [];

  for (let index = 0; index < keys.length; index += 1) {
    const key = keys[index] ?? "unknown";
    const records = groups[index] ?? [];
    const runs = records.length;
    const successes = records.filter((record) => record.result.success).length;
    const wrongApi = records.reduce((acc, record) => acc + record.result.wrongApiIncidentCount, 0);
    const medianCost = median(records.map((record) => record.result.costUsd));
    const labeledPrompts = records.filter((record) => record.retrievalTop5?.labeled === true).length;
    const top5Hits = records.filter((record) => record.retrievalTop5?.hit === true).length;
    const reviewerScores = records.flatMap(
      (record) => record.kgContextReview?.reviewerScores.map((entry) => entry.score) ?? []
    );
    const reviewerScoreCount = reviewerScores.length;
    const reviewerScoreMean =
      reviewerScores.length === 0
        ? null
        : reviewerScores.reduce((accumulator, score) => accumulator + score, 0) / reviewerScores.length;

    rows.push({
      key,
      runs,
      successes,
      wrongApi,
      medianCost,
      labeledPrompts,
      top5Hits,
      reviewerScoreCount,
      reviewerScoreMean,
    });
  }

  return rows.sort((left, right) => Str.localeCompare(right.key)(left.key));
};

/**
 * Render markdown report for one benchmark suite.
 *
 * @param suite - Benchmark suite containing run records and metadata.
 * @param title - Report title rendered at the top of the markdown output.
 * @returns Markdown report grouped by condition and by agent/model.
 * @since 0.0.0
 * @category Utility
 */
export const renderBenchmarkMarkdown = (suite: AgentBenchSuite, title: string): string => {
  const status = suite.status ?? "completed";
  const plannedRunCount = suite.plannedRunCount ?? suite.records.length;
  const completedRunCount = suite.completedRunCount ?? suite.records.length;
  const byCondition = summarizeByKey(suite, (record) => record.config.condition);
  const byAgent = summarizeByKey(suite, (record) => `${record.config.agent}:${record.config.model}`);

  const conditionRows = byCondition
    .map((row) => {
      const successRate = row.runs === 0 ? 0 : (row.successes / row.runs) * 100;
      const top5HitRate =
        row.labeledPrompts === 0 ? "n/a" : `${((row.top5Hits / row.labeledPrompts) * 100).toFixed(2)}%`;
      const reviewerMean = row.reviewerScoreMean === null ? "n/a" : row.reviewerScoreMean.toFixed(2);
      return `| ${row.key} | ${row.runs} | ${row.successes} | ${successRate.toFixed(2)}% | ${row.wrongApi} | $${row.medianCost.toFixed(4)} | ${top5HitRate} | ${reviewerMean} |`;
    })
    .join("\n");

  const agentRows = byAgent
    .map((row) => {
      const successRate = row.runs === 0 ? 0 : (row.successes / row.runs) * 100;
      const top5HitRate =
        row.labeledPrompts === 0 ? "n/a" : `${((row.top5Hits / row.labeledPrompts) * 100).toFixed(2)}%`;
      const reviewerMean = row.reviewerScoreMean === null ? "n/a" : row.reviewerScoreMean.toFixed(2);
      return `| ${row.key} | ${row.runs} | ${row.successes} | ${successRate.toFixed(2)}% | ${row.wrongApi} | $${row.medianCost.toFixed(4)} | ${top5HitRate} | ${reviewerMean} |`;
    })
    .join("\n");

  return [
    `# ${title}`,
    "",
    `- formatVersion: ${suite.formatVersion}`,
    `- runAtEpochMs: ${suite.runAtEpochMs}`,
    `- runMode: ${suite.runMode ?? "unknown"}`,
    `- executionBackend: ${suite.executionBackend ?? "unknown"}`,
    `- status: ${status}`,
    `- strictTaskCount: ${suite.strictTaskCount}`,
    `- plannedRunCount: ${plannedRunCount}`,
    `- completedRunCount: ${completedRunCount}`,
    `- totalRuns: ${suite.records.length}`,
    ...(status === "aborted_wall_cap"
      ? [
          "",
          "> WARNING: Suite is incomplete due to max wall clock budget.",
          ...(suite.abortReason !== undefined && suite.abortReason !== null
            ? [`> abortReason: ${suite.abortReason}`]
            : []),
        ]
      : []),
    "",
    "## By Condition",
    "",
    "| Condition | Runs | Successes | Success Rate | Wrong-API Incidents | Median Cost | Retrieval Top-5 Hit Rate | KG Relevance Mean |",
    "|---|---:|---:|---:|---:|---:|---:|---:|",
    conditionRows,
    "",
    "## By Agent",
    "",
    "| Agent:Model | Runs | Successes | Success Rate | Wrong-API Incidents | Median Cost | Retrieval Top-5 Hit Rate | KG Relevance Mean |",
    "|---|---:|---:|---:|---:|---:|---:|---:|",
    agentRows,
    "",
  ].join("\n");
};
