import { $RuntimeServerId } from "@beep/identity/packages";
import * as BunHttpClient from "@effect/platform-bun/BunHttpClient";
import { DateTime, Duration, Effect, Layer, Match, Metric, pipe, Tracer } from "effect";
import * as A from "effect/Array";
import * as O from "effect/Option";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as DevToolsClient from "effect/unstable/devtools/DevToolsClient";
import type * as DevToolsSchema from "effect/unstable/devtools/DevToolsSchema";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import * as Otlp from "effect/unstable/observability/Otlp";
import * as PrometheusMetrics from "effect/unstable/observability/PrometheusMetrics";
import * as Socket from "effect/unstable/socket/Socket";

const $I = $RuntimeServerId.create("internal/SidecarObservability");

/**
 * Observability configuration for the repo-memory sidecar runtime.
 *
 * @since 0.0.0
 * @category DomainModel
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

const currentTimeMillis = DateTime.now.pipe(Effect.map(DateTime.toEpochMillis));

const metricAttributes = (attributes: Record<string, string>) => attributes;

const makeOtlpResource = (config: SidecarObservabilityConfig) => ({
  serviceName: config.otlpServiceName,
  serviceVersion: config.otlpServiceVersion,
  attributes: {
    deployment_environment: defaultEnvironment,
    beep_slice: defaultSlice,
    ...config.otlpResourceAttributes,
  },
});

const statusClass = (status: number): string => {
  if (status >= 100 && status < 600) {
    return `${Math.trunc(status / 100)}xx`;
  }

  return "unknown";
};

const shouldPublishDevToolsSpan = (name: string): boolean =>
  A.some(devtoolsSpanPrefixes, (prefix) => pipe(name, Str.startsWith(prefix)));

const toDevToolsSpanStatus = Match.type<Tracer.SpanStatus>().pipe(
  Match.withReturnType<DevToolsSchema.SpanStatus>(),
  Match.tagsExhaustive({
    Started: ({ startTime }) => ({ _tag: "Started", startTime }),
    Ended: ({ startTime, endTime, exit }) => ({ _tag: "Ended", startTime, endTime, exit }),
  })
);

const toDevToolsParentSpan = (parent: O.Option<Tracer.AnySpan>): O.Option<DevToolsSchema.ParentSpan> =>
  O.match(parent, {
    onNone: O.none,
    onSome: (value) =>
      O.some(
        Match.value(value).pipe(
          Match.withReturnType<DevToolsSchema.ParentSpan>(),
          Match.tagsExhaustive({
            ExternalSpan: ({ spanId, traceId, sampled }) => ({ _tag: "ExternalSpan", spanId, traceId, sampled }),
            Span: ({ spanId, traceId, name, sampled, attributes, status, parent }) => ({
              _tag: "Span",
              spanId,
              traceId,
              name,
              sampled,
              attributes,
              status: toDevToolsSpanStatus(status),
              parent: toDevToolsParentSpan(parent),
            }),
          })
        )
      ),
  });

const toDevToolsSpan = (span: Tracer.Span): DevToolsSchema.Span => ({
  _tag: "Span",
  spanId: span.spanId,
  traceId: span.traceId,
  name: span.name,
  sampled: span.sampled,
  attributes: span.attributes,
  status: toDevToolsSpanStatus(span.status),
  parent: toDevToolsParentSpan(span.parent),
});

// The stock Effect DevTools tracer currently behaves poorly on the Bun sidecar
// when every low-level span is mirrored, so we only emit the higher-value
// repo-memory/runtime spans here and leave the feature default-disabled.
const makeFilteredDevToolsLayer = (url: string): Layer.Layer<never> => {
  const socketClientLayer = DevToolsClient.layer.pipe(
    Layer.provide(Socket.layerWebSocket(url)),
    Layer.provide(Socket.layerWebSocketConstructorGlobal)
  );

  return Layer.effect(
    Tracer.Tracer,
    Effect.gen(function* () {
      const client = yield* DevToolsClient.DevToolsClient;
      const currentTracer = yield* Effect.tracer;

      return Tracer.make({
        span(options) {
          const span = currentTracer.span(options);

          if (!shouldPublishDevToolsSpan(span.name)) {
            return span;
          }

          client.sendUnsafe(toDevToolsSpan(span));

          return span;
        },
        context: currentTracer.context,
      });
    })
  ).pipe(Layer.provide(socketClientLayer));
};

const recordHttpRequestMetrics = Effect.fn("SidecarObservability.recordHttpRequestMetrics")(function* (
  method: string,
  route: string,
  status: number,
  durationMs: number
) {
  const normalizedDurationMs = Math.max(0, durationMs);
  const normalizedStatusClass = statusClass(status);
  const attributes = metricAttributes({
    method,
    route,
    status_class: normalizedStatusClass,
  });

  yield* Effect.annotateCurrentSpan({
    http_status: status,
    http_status_class: normalizedStatusClass,
    http_request_duration_ms: normalizedDurationMs,
  });
  yield* Metric.update(Metric.withAttributes(httpRequestsTotal, attributes), 1);
  yield* Metric.update(Metric.withAttributes(httpRequestDuration, attributes), Duration.millis(normalizedDurationMs));
});

/**
 * Observe one HTTP request with success and failure metrics.
 *
 * @since 0.0.0
 * @category CrossCutting
 */
export const provideSidecarObservability = <A, E, R>(
  config: SidecarObservabilityConfig,
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R> =>
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
        config.devtoolsEnabled ? makeFilteredDevToolsLayer(config.devtoolsUrl) : Layer.empty
      )
    ).pipe(Effect.flatMap((context) => effect.pipe(Effect.provide(context))))
  );

/**
 * Strip duplicate terminal histogram buckets from Prometheus exposition text.
 *
 * Effect's `formatHistogram` emits `boundary.toString()` which produces
 * `le="Infinity"` for the last bucket, then adds an explicit `le="+Inf"`
 * bucket. This post-processor removes the `le="Infinity"` lines so that
 * Prometheus scrapers do not see duplicate terminal buckets.
 *
 * @since 0.0.0
 * @category Observability
 */
export const sanitizePrometheusMetrics = (text: string): string =>
  pipe(
    text,
    Str.split("\n"),
    A.filter((line) => !pipe(line, Str.includes('le="Infinity"'))),
    A.join("\n")
  );

/**
 * Creates a Layer that serves a sanitized `/metrics` HTTP endpoint.
 *
 * Wraps `PrometheusMetrics.format` with {@link sanitizePrometheusMetrics} to
 * strip duplicate terminal histogram buckets before returning the response.
 *
 * @since 0.0.0
 * @category Observability
 */
export const layerPrometheusMetricsHttp = (
  options?: PrometheusMetrics.HttpOptions | undefined
): Layer.Layer<never, never, HttpRouter.HttpRouter> => {
  const { path: routePath, ...formatOptions } = options ?? {};

  return Layer.effectDiscard(
    Effect.gen(function* () {
      const router = yield* HttpRouter.HttpRouter;

      const handler = Effect.gen(function* () {
        const raw = yield* PrometheusMetrics.format(formatOptions);
        const body = sanitizePrometheusMetrics(raw);
        return HttpServerResponse.text(body, {
          contentType: "text/plain; version=0.0.4; charset=utf-8",
        });
      });

      yield* router.add("GET", routePath ?? "/metrics", handler);
    })
  );
};

/**
 * Observe a run lifecycle at the handler/service layer (outside workflow
 * execution scope) to ensure OTLP metric providers receive the counters.
 *
 * Increments `beep_repo_memory_runs_started_total` before the effect runs,
 * then increments either `_completed_total` or `_failed_total` on completion.
 *
 * @since 0.0.0
 * @category CrossCutting
 */
export const observeRunLifecycle = <A, E, R>(
  attributes: Record<string, string>,
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R> =>
  Metric.update(Metric.withAttributes(runsStartedTotal, attributes), 1).pipe(
    Effect.andThen(effect),
    Effect.tap(() => Metric.update(Metric.withAttributes(runsCompletedTotal, attributes), 1)),
    Effect.tapError(() => Metric.update(Metric.withAttributes(runsFailedTotal, attributes), 1))
  );
