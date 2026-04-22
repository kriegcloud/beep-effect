/**
 * Server-side observability layer composition for OTLP and devtools.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { Duration, Layer, Metric } from "effect";
import { dual } from "effect/Function";
import type * as HttpClient from "effect/unstable/http/HttpClient";
import * as Otlp from "effect/unstable/observability/Otlp";
import { type ServerObservabilityConfig, toOtlpResource } from "./Config.ts";
import { type DevToolsSpanFilter, layerFilteredDevTools } from "./DevTools.ts";

/**
 * Server-only local LGTM wiring for Effect OTLP + optional devtools.
 *
 * @example
 * ```typescript
 * import { Layer } from "effect"
 * import { ServerObservabilityConfig, layerLocalLgtmServer } from "@beep/observability/server"
 *
 * declare const config: ServerObservabilityConfig
 * const ObservabilityLive = layerLocalLgtmServer(config)
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const layerLocalLgtmServer: {
  (
    config: ServerObservabilityConfig,
    options?: {
      readonly shouldPublishDevToolsSpan?: DevToolsSpanFilter | undefined;
    }
  ): Layer.Layer<never, never, HttpClient.HttpClient>;
  (options: {
    readonly shouldPublishDevToolsSpan?: DevToolsSpanFilter | undefined;
  }): (config: ServerObservabilityConfig) => Layer.Layer<never, never, HttpClient.HttpClient>;
} = dual(
  2,
  (
    config: ServerObservabilityConfig,
    options?: {
      readonly shouldPublishDevToolsSpan?: DevToolsSpanFilter | undefined;
    }
  ): Layer.Layer<never, never, HttpClient.HttpClient> =>
    Layer.mergeAll(
      Metric.enableRuntimeMetricsLayer,
      config.otlpEnabled
        ? Otlp.layerProtobuf({
            baseUrl: config.otlpBaseUrl,
            resource: toOtlpResource(config),
            loggerExportInterval: Duration.seconds(1),
            loggerMergeWithExisting: true,
            metricsExportInterval: Duration.seconds(10),
            metricsTemporality: "cumulative",
            tracerExportInterval: Duration.seconds(5),
            shutdownTimeout: Duration.seconds(3),
          })
        : Layer.empty,
      config.devtoolsEnabled
        ? layerFilteredDevTools({
            url: config.devtoolsUrl,
            shouldPublish: options?.shouldPublishDevToolsSpan ?? (() => true),
          })
        : Layer.empty
    )
);
