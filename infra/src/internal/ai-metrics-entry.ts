import { AIMetricsStack, loadAIMetricsStackArgs } from "../AIMetrics.js";

const aiMetrics = new AIMetricsStack("ai-metrics", loadAIMetricsStackArgs());

export const stackName = aiMetrics.stackName;
export const rawArchiveDir = aiMetrics.rawArchiveDir;
export const duckDbPath = aiMetrics.duckDbPath;
export const installSpec = aiMetrics.installSpec;
