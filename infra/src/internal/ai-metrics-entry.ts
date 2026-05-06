import { AIMetricsStack, loadAIMetricsStackArgs } from "../AIMetrics.ts";

const aiMetrics = new AIMetricsStack("ai-metrics", loadAIMetricsStackArgs());

export const stackName = aiMetrics.stackName;
export const rawArchiveDir = aiMetrics.rawArchiveDir;
export const duckDbPath = aiMetrics.duckDbPath;
export const installSpec = aiMetrics.installSpec;
