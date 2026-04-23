/**
 * Observability wiring for the repo-memory sidecar runtime.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { $RuntimeServerId } from "@beep/identity/packages";
import { observeHttpRequest as observeSharedHttpRequest } from "@beep/observability";
import { HttpApiTelemetryDescriptor, layerFilteredDevTools, observeHttpApiHandler } from "@beep/observability/server";
import { NonNegativeInt } from "@beep/schema";
import * as BunHttpClient from "@effect/platform-bun/BunHttpClient";
import { Duration, Effect, Layer, Metric, pipe } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as Otlp from "effect/unstable/observability/Otlp";

const $I = $RuntimeServerId.create("internal/SidecarObservability");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);

/**
 * Observability configuration for the repo-memory sidecar runtime.
 *
 * @example
 * ```ts
 * import * as S from "effect/Schema"
 * import { SidecarObservabilityConfig } from "@beep/runtime-server/internal/SidecarObservability"
 *
 * const isConfig = S.is(SidecarObservabilityConfig)
 *
 * void isConfig
 * ```
 *
 * @since 0.0.0
 * @category domain model
 */
export class SidecarObservabilityConfig extends S.Class<SidecarObservabilityConfig>($I`SidecarObservabilityConfig`)(
  {
    devtoolsEnabled: S.Boolean,
    devtoolsUrl: S.String,
    otlpBaseUrl: S.String,
    otlpEnabled: S.Boolean,
    otlpResourceAttributes: S.Record(S.String, S.String),
    otlpServiceName: S.String,
    otlpServiceVersion: S.String,
    version: S.String,
  },
  $I.annote("SidecarObservabilityConfig", {
    description: "Observability configuration for the repo-memory sidecar runtime.",
  })
) {}

const httpRequestsTotal = Metric.counter("beep_repo_memory_http_requests_total", {
  description: "Total control-plane HTTP requests handled by the repo-memory sidecar.",
  incremental: true,
});

const httpRequestDuration = Metric.timer("beep_repo_memory_http_request_duration_ms", {
  description: "Control-plane HTTP request duration for the repo-memory sidecar.",
});
const controlPlaneHttpMetrics = {
  requestsTotal: httpRequestsTotal,
  requestDuration: httpRequestDuration,
};

type ObserveSidecarHttpRequestOptions = {
  readonly method: string;
  readonly route: string;
  readonly successStatus: number;
};

const runsStartedTotal = Metric.counter("beep_repo_memory_runs_started_total", {
  description: "Total runs started at the handler/service layer (outside workflow scope).",
  incremental: true,
});

const runsCompletedTotal = Metric.counter("beep_repo_memory_runs_completed_total", {
  description: "Total runs completed at the handler/service layer (outside workflow scope).",
  incremental: true,
});

const runsFailedTotal = Metric.counter("beep_repo_memory_runs_failed_total", {
  description: "Total runs failed at the handler/service layer (outside workflow scope).",
  incremental: true,
});

const defaultEnvironment = "local";
const defaultSlice = "repo-memory-v0";
const devtoolsSpanPrefixes = [
  "GroundedRetrieval",
  "RepoMemorySql",
  "RepoRunService",
  "SidecarRuntime",
  "TypeScriptIndex",
] as const;

const makeOtlpResource = (config: SidecarObservabilityConfig) => ({
  serviceName: config.otlpServiceName,
  serviceVersion: config.otlpServiceVersion,
  attributes: {
    deployment_environment: defaultEnvironment,
    beep_slice: defaultSlice,
    ...config.otlpResourceAttributes,
  },
});

const shouldPublishDevToolsSpan = (name: string): boolean =>
  A.some(devtoolsSpanPrefixes, (prefix) => pipe(name, Str.startsWith(prefix)));

/**
 * Observe one HTTP request with success and failure metrics.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { observeHttpRequest } from "@beep/runtime-server/internal/SidecarObservability"
 *
 * const observed = observeHttpRequest(Effect.succeed("ok"), {
 *   method: "GET",
 *   route: "/health",
 *   successStatus: 200
 * })
 *
 * void observed
 * ```
 *
 * @since 0.0.0
 * @category cross cutting
 */
export const observeHttpRequest: {
  (
    options: ObserveSidecarHttpRequestOptions
  ): <A, E extends { readonly status: number }, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
  <A, E extends { readonly status: number }, R>(
    effect: Effect.Effect<A, E, R>,
    options: ObserveSidecarHttpRequestOptions
  ): Effect.Effect<A, E, R>;
} = dual(
  2,
  <A, E extends { readonly status: number }, R>(
    effect: Effect.Effect<A, E, R>,
    options: ObserveSidecarHttpRequestOptions
  ): Effect.Effect<A, E, R> =>
    observeHttpApiHandler(
      new HttpApiTelemetryDescriptor({
        apiName: "repo-memory-control-plane",
        groupName: "control-plane",
        endpointName: `${options.method} ${options.route}`,
        method: options.method,
        route: options.route,
        successStatus: decodeNonNegativeInt(options.successStatus),
      }),
      controlPlaneHttpMetrics,
      observeSharedHttpRequest(effect, {
        ...options,
        requestsTotal: httpRequestsTotal,
        requestDuration: httpRequestDuration,
      })
    )
);

/**
 * Provide OTLP, runtime metrics, and filtered devtools support to the sidecar.
 *
 * @example
 * ```ts
 * import { provideSidecarObservability } from "@beep/runtime-server/internal/SidecarObservability"
 *
 * const provide = provideSidecarObservability(config)
 *
 * void provide
 * ```
 *
 * @since 0.0.0
 * @category cross cutting
 */
export const provideSidecarObservability: {
  (config: SidecarObservabilityConfig): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
  <A, E, R>(effect: Effect.Effect<A, E, R>, config: SidecarObservabilityConfig): Effect.Effect<A, E, R>;
} = dual(
  2,
  <A, E, R>(effect: Effect.Effect<A, E, R>, config: SidecarObservabilityConfig): Effect.Effect<A, E, R> =>
    Effect.scoped(
      Layer.build(
        Layer.mergeAll(
          Metric.enableRuntimeMetricsLayer,
          config.otlpEnabled
            ? Otlp.layerProtobuf({
                baseUrl: config.otlpBaseUrl,
                resource: makeOtlpResource(config),
                loggerExportInterval: Duration.seconds(1),
                loggerMergeWithExisting: true,
                metricsExportInterval: Duration.seconds(10),
                metricsTemporality: "cumulative",
                tracerExportInterval: Duration.seconds(5),
                shutdownTimeout: Duration.seconds(3),
              }).pipe(Layer.provide(BunHttpClient.layer))
            : Layer.empty,
          config.devtoolsEnabled
            ? layerFilteredDevTools({
                url: config.devtoolsUrl,
                shouldPublish: shouldPublishDevToolsSpan,
              })
            : Layer.empty
        )
      ).pipe(
        Effect.flatMap(
          Effect.fnUntraced(function* (context) {
            return yield* effect.pipe(Effect.provide(context));
          })
        )
      )
    )
);

/**
 * Observe a run lifecycle at the handler/service layer (outside workflow
 * execution scope) to ensure OTLP metric providers receive the counters.
 *
 * Increments `beep_repo_memory_runs_started_total` before the effect runs,
 * then increments either `_completed_total` or `_failed_total` on completion.
 *
 * @example
 * ```ts
 * import { Effect } from "effect"
 * import { observeRunLifecycle } from "@beep/runtime-server/internal/SidecarObservability"
 *
 * const observed = observeRunLifecycle(Effect.succeed("completed"), {
 *   run_kind: "index"
 * })
 *
 * void observed
 * ```
 *
 * @since 0.0.0
 * @category cross cutting
 */
export const observeRunLifecycle: {
  (attributes: Record<string, string>): <A, E, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
  <A, E, R>(effect: Effect.Effect<A, E, R>, attributes: Record<string, string>): Effect.Effect<A, E, R>;
} = dual(
  2,
  <A, E, R>(effect: Effect.Effect<A, E, R>, attributes: Record<string, string>): Effect.Effect<A, E, R> =>
    Metric.update(Metric.withAttributes(runsStartedTotal, attributes), 1).pipe(
      Effect.andThen(
        Effect.fnUntraced(function* (_: unknown): Effect.fn.Return<A, E, R> {
          return yield* effect;
        })
      ),
      Effect.tap(() => Metric.update(Metric.withAttributes(runsCompletedTotal, attributes), 1)),
      Effect.tapError(() => Metric.update(Metric.withAttributes(runsFailedTotal, attributes), 1))
    )
);
