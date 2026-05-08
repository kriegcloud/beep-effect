import { AIMetricsStack, loadAIMetricsStackArgs } from "../AIMetrics.ts";

const aiMetrics = new AIMetricsStack("ai-metrics", loadAIMetricsStackArgs());

export const stackName = aiMetrics.stackName;
export const rawArchiveDir = aiMetrics.rawArchiveDir;
export const duckDbPath = aiMetrics.duckDbPath;
export const services = aiMetrics.services;
export const defaultService = aiMetrics.defaultService;
export const otlpEndpoint = aiMetrics.otlpEndpoint;
export const otlpTraceUrl = aiMetrics.otlpTraceUrl;
export const installSpec = aiMetrics.installSpec;
export const phoenixPublicUrl = aiMetrics.phoenixPublicUrl;
export const phoenixTailnetHttpsPort = aiMetrics.phoenixTailnetHttpsPort;
export const remoteConfigRoot = aiMetrics.remoteConfigRoot;
export const remotePreflightStdout = aiMetrics.remotePreflightStdout;
export const remoteApplyStdout = aiMetrics.remoteApplyStdout;
export const remoteHealthStdout = aiMetrics.remoteHealthStdout;
