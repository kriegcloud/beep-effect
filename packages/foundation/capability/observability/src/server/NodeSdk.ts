/**
 * Node SDK observability layer construction for server runtimes.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import * as NodeSdk from "@effect/opentelemetry/NodeSdk";
import type * as OtelResource from "@effect/opentelemetry/Resource";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchLogRecordProcessor, type LogRecordProcessor } from "@opentelemetry/sdk-logs";
import { type MetricReader, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { BatchSpanProcessor, type SpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Duration, type Layer } from "effect";
import { dual } from "effect/Function";
import { type ServerObservabilityConfig, toOtlpResource } from "./Config.ts";

/**
 * Additional controls for the shared Node SDK layer.
 *
 * @since 0.0.0
 * @category models
 */
interface NodeSdkServerOptions {
  readonly loggerExportInterval?: Duration.Input | undefined;
  readonly loggerMergeWithExisting?: boolean | undefined;
  readonly logRecordProcessor?: LogRecordProcessor | ReadonlyArray<LogRecordProcessor> | undefined;
  readonly metricReader?: MetricReader | ReadonlyArray<MetricReader> | undefined;
  readonly metricsExportInterval?: Duration.Input | undefined;
  readonly metricTemporality?: NodeSdk.Configuration["metricTemporality"] | undefined;
  readonly shutdownTimeout?: Duration.Input | undefined;
  readonly spanProcessor?: SpanProcessor | ReadonlyArray<SpanProcessor> | undefined;
}

const endpointUrl = (baseUrl: string, path: string): string => new URL(path, `${baseUrl}/`).toString();

/**
 * Convert the shared server observability config into a Node SDK resource shape.
 *
 * @example
 * ```typescript
 * import { ServerObservabilityConfig, toNodeSdkResource } from "@beep/observability/server"
 *
 * declare const config: ServerObservabilityConfig
 * const resource = toNodeSdkResource(config)
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
export const toNodeSdkResource = (config: ServerObservabilityConfig): NonNullable<NodeSdk.Configuration["resource"]> =>
  toOtlpResource(config);

/**
 * Build a Node SDK configuration with OTLP HTTP defaults for local LGTM.
 *
 * @example
 * ```typescript
 * import { ServerObservabilityConfig, makeNodeSdkServerConfig } from "@beep/observability/server"
 *
 * declare const config: ServerObservabilityConfig
 * const sdkConfig = makeNodeSdkServerConfig(config)
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
export const makeNodeSdkServerConfig: {
  (config: ServerObservabilityConfig, options?: NodeSdkServerOptions | undefined): NodeSdk.Configuration;
  (options: NodeSdkServerOptions | undefined): (config: ServerObservabilityConfig) => NodeSdk.Configuration;
} = dual(2, (config: ServerObservabilityConfig, options?: NodeSdkServerOptions | undefined): NodeSdk.Configuration => {
  const loggerExportInterval = Duration.toMillis(
    Duration.fromInputUnsafe(options?.loggerExportInterval ?? Duration.seconds(1))
  );
  const metricsExportInterval = Duration.toMillis(
    Duration.fromInputUnsafe(options?.metricsExportInterval ?? Duration.seconds(10))
  );

  return {
    resource: toNodeSdkResource(config),
    spanProcessor:
      options?.spanProcessor ??
      (config.otlpEnabled
        ? [
            new BatchSpanProcessor(
              new OTLPTraceExporter({
                url: endpointUrl(config.otlpBaseUrl, "/v1/traces"),
              })
            ),
          ]
        : undefined),
    metricReader:
      options?.metricReader ??
      (config.otlpEnabled
        ? [
            new PeriodicExportingMetricReader({
              exporter: new OTLPMetricExporter({
                url: endpointUrl(config.otlpBaseUrl, "/v1/metrics"),
              }),
              exportIntervalMillis: metricsExportInterval,
            }),
          ]
        : undefined),
    logRecordProcessor:
      options?.logRecordProcessor ??
      (config.otlpEnabled
        ? [
            new BatchLogRecordProcessor(
              new OTLPLogExporter({
                url: endpointUrl(config.otlpBaseUrl, "/v1/logs"),
              }),
              {
                scheduledDelayMillis: loggerExportInterval,
              }
            ),
          ]
        : undefined),
    loggerMergeWithExisting: options?.loggerMergeWithExisting ?? true,
    metricTemporality: options?.metricTemporality ?? "cumulative",
    shutdownTimeout: options?.shutdownTimeout ?? Duration.seconds(3),
  };
});

/**
 * Build a shared Node SDK layer for server runtimes.
 *
 * @example
 * ```typescript
 * import { ServerObservabilityConfig, layerNodeSdkServer } from "@beep/observability/server"
 *
 * declare const config: ServerObservabilityConfig
 * const NodeSdkLive = layerNodeSdkServer(config)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const layerNodeSdkServer: {
  (config: ServerObservabilityConfig, options?: NodeSdkServerOptions | undefined): Layer.Layer<OtelResource.Resource>;
  (
    options: NodeSdkServerOptions | undefined
  ): (config: ServerObservabilityConfig) => Layer.Layer<OtelResource.Resource>;
} = dual(
  2,
  (config: ServerObservabilityConfig, options?: NodeSdkServerOptions | undefined): Layer.Layer<OtelResource.Resource> =>
    NodeSdk.layer(() => makeNodeSdkServerConfig(config, options))
);
