#!/usr/bin/env node

import { appendFileSync, existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const runDirectory = path.join(process.cwd(), ".turbo", "runs");

const resolveSummaryPath = () => {
  const explicitPath = process.argv[2];

  if (explicitPath) {
    return path.resolve(process.cwd(), explicitPath);
  }

  if (!existsSync(runDirectory)) {
    return undefined;
  }

  const candidates = readdirSync(runDirectory)
    .filter((entry) => entry.endsWith(".json"))
    .map((entry) => path.join(runDirectory, entry))
    .sort((left, right) => statSync(right).mtimeMs - statSync(left).mtimeMs);

  return candidates[0];
};

const formatDuration = (durationMs) => `${(durationMs / 1000).toFixed(2)}s`;

const summaryPath = resolveSummaryPath();

if (summaryPath === undefined || !existsSync(summaryPath)) {
  console.log("[turbo-summary] No run summary file found.");
  process.exit(0);
}

const run = JSON.parse(readFileSync(summaryPath, "utf8"));
const tasks = Object.values(run.tasks ?? {});
const longestTasks = tasks
  .map((task) => {
    const startTime = task.execution?.startTime;
    const endTime = task.execution?.endTime;
    const durationMs = typeof startTime === "number" && typeof endTime === "number" ? endTime - startTime : 0;

    return {
      taskId: task.taskId,
      durationMs,
      cacheStatus: task.cache?.status ?? "UNKNOWN",
    };
  })
  .filter((task) => task.durationMs > 0)
  .sort((left, right) => right.durationMs - left.durationMs)
  .slice(0, 5);

const cacheHits = tasks.filter((task) => task.cache?.status === "HIT").length;
const localHits = tasks.filter((task) => task.cache?.status === "HIT" && task.cache?.local === true).length;
const remoteHits = tasks.filter((task) => task.cache?.status === "HIT" && task.cache?.remote === true).length;
const cacheMisses = tasks.filter((task) => task.cache?.status === "MISS").length;
const cacheBypassed = tasks.filter((task) => task.resolvedTaskDefinition?.cache === false).length;
const runDurationMs =
  typeof run.execution?.startTime === "number" && typeof run.execution?.endTime === "number"
    ? run.execution.endTime - run.execution.startTime
    : 0;

const lines = [
  "## Turbo Summary",
  "",
  `- Command: \`${run.execution?.command ?? "unknown"}\``,
  `- Attempted tasks: ${run.execution?.attempted ?? tasks.length}`,
  `- Successful tasks: ${run.execution?.success ?? 0}`,
  `- Cached tasks: ${cacheHits} (${localHits} local, ${remoteHits} remote)`,
  `- Cache misses: ${cacheMisses}`,
  `- Cache-disabled tasks: ${cacheBypassed}`,
  `- Run duration: ${formatDuration(runDurationMs)}`,
  `- Summary file: \`${path.relative(process.cwd(), summaryPath)}\``,
];

if (longestTasks.length > 0) {
  lines.push("", "| Task | Duration | Cache |", "| --- | ---: | --- |");

  for (const task of longestTasks) {
    lines.push(`| \`${task.taskId}\` | ${formatDuration(task.durationMs)} | ${task.cacheStatus} |`);
  }
}

const renderedSummary = `${lines.join("\n")}\n`;
const githubSummaryPath = process.env.GITHUB_STEP_SUMMARY;

if (githubSummaryPath) {
  appendFileSync(githubSummaryPath, renderedSummary);
} else {
  console.log(renderedSummary);
}
