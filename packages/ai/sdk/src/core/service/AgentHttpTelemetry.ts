import {
  HttpApiTelemetryMiddleware,
  layerHttpApiTelemetryMiddleware,
  makeHttpApiMetrics,
} from "@beep/observability/server";
import { AgentHttpApi } from "./AgentHttpApi.js";

const metricPrefix = "beep_ai_sdk_http_api";
const descriptionPrefix = "Agent SDK HTTP API request";

/**
 * Shared metric bundle for the agent HTTP API server surface.
 *
 * @since 0.0.0
 * @category Observability
 */
export type AgentHttpMetrics = ReturnType<typeof makeHttpApiMetrics>;

/**
 * Shared metric bundle for the agent HTTP API server surface.
 *
 * @since 0.0.0
 * @category Observability
 */
export const agentHttpMetrics: AgentHttpMetrics = makeHttpApiMetrics(metricPrefix, descriptionPrefix);

const AgentObservedHttpApiValue = AgentHttpApi.middleware(HttpApiTelemetryMiddleware);

/**
 * Agent HTTP API with shared server-side observability middleware applied.
 *
 * @since 0.0.0
 * @category Observability
 */
export const AgentObservedHttpApi: typeof AgentObservedHttpApiValue = AgentObservedHttpApiValue;

/**
 * Shared telemetry layer for the agent HTTP API server surface.
 *
 * @since 0.0.0
 * @category Observability
 */
export const layer = layerHttpApiTelemetryMiddleware({
  apiName: "agent-sdk-http-api",
  metrics: agentHttpMetrics,
});
