/**
 * Observability wiring for the Beep Graph gateway.
 *
 * Composes `@beep/observability` layers into a single Layer that
 * provides OTLP export, HttpApi request metrics, pretty logging,
 * and error reporting — all configured for the Beep Graph service.
 *
 * @module
 * @since 0.1.0
 */

import { LoggingConfig, layerConsoleLogger } from "@beep/observability";
import {
  layerErrorReporter,
  layerHttpApiTelemetryMiddleware,
  layerLocalLgtmServer,
  makeHttpApiMetrics,
  ServerObservabilityConfig,
} from "@beep/observability/server";
import { Layer } from "effect";
import type * as HttpClient from "effect/unstable/http/HttpClient";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SERVICE_NAME = "beepgraph-gateway";
const SERVICE_VERSION = "0.1.0";

// ---------------------------------------------------------------------------
// Configuration factory
// ---------------------------------------------------------------------------

/**
 * Build a `ServerObservabilityConfig` from environment variables.
 *
 * | Env Var | Default |
 * |---------|---------|
 * | `OTLP_BASE_URL` | `http://localhost:4318` |
 * | `OTLP_ENABLED` | `true` |
 * | `NODE_ENV` | `development` |
 * | `LOG_LEVEL` | `Info` |
 *
 * @since 0.1.0
 * @category config
 */
export const makeConfig = (): ServerObservabilityConfig => {
  const env = (key: string, fallback: string): string =>
    typeof process !== "undefined" && process.env[key] !== undefined ? process.env[key] : fallback;

  return new ServerObservabilityConfig({
    serviceName: SERVICE_NAME,
    serviceVersion: SERVICE_VERSION,
    environment: env("NODE_ENV", "development"),
    minLogLevel: env("LOG_LEVEL", "Info") as "Debug" | "Info" | "Warn" | "Error",
    otlpBaseUrl: env("OTLP_BASE_URL", "http://localhost:4318"),
    otlpEnabled: env("OTLP_ENABLED", "true") === "true",
    otlpResourceAttributes: {},
    devtoolsEnabled: env("DEVTOOLS_ENABLED", "false") === "true",
    devtoolsUrl: env("DEVTOOLS_URL", "ws://localhost:34437"),
    prometheusPrefix: "beepgraph",
  });
};

// ---------------------------------------------------------------------------
// HttpApi metrics
// ---------------------------------------------------------------------------

/**
 * Pre-built metrics for the Beep Graph HttpApi endpoints.
 *
 * @since 0.1.0
 * @category metrics
 */
export const beepGraphMetrics: ReturnType<typeof makeHttpApiMetrics> = makeHttpApiMetrics("beepgraph_api");

// ---------------------------------------------------------------------------
// Composed Layer
// ---------------------------------------------------------------------------

/**
 * Full observability stack for the Beep Graph gateway.
 *
 * Composes:
 * - OTLP trace/metric/log export (when `OTLP_ENABLED=true`)
 * - HttpApi request telemetry middleware
 * - Pretty console logger
 * - Error reporter
 *
 * @since 0.1.0
 * @category layers
 */
export const makeTelemetryLayer = (
  config: ServerObservabilityConfig = makeConfig()
): Layer.Layer<never, never, HttpClient.HttpClient> =>
  Layer.mergeAll(
    layerLocalLgtmServer(config),
    layerHttpApiTelemetryMiddleware({
      apiName: "BeepGraphApi",
      metrics: beepGraphMetrics,
    }),
    layerConsoleLogger(
      new LoggingConfig({
        format: "pretty",
        minLogLevel: config.minLogLevel,
      })
    ),
    layerErrorReporter()
  );
