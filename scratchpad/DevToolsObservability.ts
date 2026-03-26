import { $ScratchId } from "@beep/identity";
import {
  HttpMethod,
  HttpStatus,
  SchemaUtils,
  TaggedErrorClass, // packages/common/schema/src/TaggedErrorClass.ts
} from "@beep/schema";
// WebSdk.ts
import {
  Logger, // .repos/effect-v4/packages/opentelemetry/src/Logger.ts
  Metrics, // .repos/effect-v4/packages/opentelemetry/src/Metrics.ts
  NodeSdk, // .repos/effect-v4/packages/opentelemetry/src/NodeSdk.ts
  Tracer as OtelTracer, // .repos/effect-v4/packages/opentelemetry/src/Tracer.ts
  Resource, // .repos/effect-v4/packages/opentelemetry/src/Resource.ts
  WebSdk, // .repos/effect-v4/packages/opentelemetry/src/WebSdk.ts
} from "@effect/opentelemetry";
import {
  BunRuntime, // .repos/effect-v4/packages/platform-bun/src/BunRuntime.ts
  BunServices, // .repos/effect-v4/packages/platform-bun/src/BunServices.ts
} from "@effect/platform-bun";
import {
  Cause, // .repos/effect-v4/packages/effect/src/Cause.ts
  Clock,
  Data, // .repos/effect-v4/packages/effect/src/Clock.ts
  DateTime, // .repos/effect-v4/packages/effect/src/DateTime.ts
  Duration, // .repos/effect-v4/packages/effect/src/Duration.ts
  Effect, // .repos/effect-v4/packages/effect/src/Effect.ts
  ErrorReporter, // .repos/effect-v4/packages/effect/src/ErrorReporter.ts
  FileSystem,
  Layer, // .repos/effect-v4/packages/effect/src/FileSystem.ts
  Match, // .repos/effect-v4/packages/effect/src/Match.ts
  Metric, // .repos/effect-v4/packages/effect/src/Metric.ts
  Path, // .repos/effect-v4/packages/effect/src/Path.ts
} from "effect";
import * as A from "effect/Array"; // .repos/effect-v4/packages/effect/src/Array.ts
import { flow, pipe } from "effect/Function"; // .repos/effect-v4/packages/effect/src/Function.ts
import * as O from "effect/Option"; // .repos/effect-v4/packages/effect/src/Option.ts
import * as P from "effect/Predicate"; // .repos/effect-v4/packages/effect/src/Predicate.ts
import * as S from "effect/Schema"; // .repos/effect-v4/packages/effect/src/Schema.ts & // .repos/effect-v4/packages/effect/SCHEMA.md
import * as Str from "effect/String"; // .repos/effect-v4/packages/effect/src/String.ts
import type * as Tracer from "effect/Tracer";
import {
  DevTools, // .repos/effect-v4/packages/effect/src/unstable/devtools/Tracer.ts
  DevToolsClient, // .repos/effect-v4/packages/effect/src/unstable/devtools/Tracer.ts
  DevToolsSchema, // .repos/effect-v4/packages/effect/src/unstable/devtools/Tracer.ts
  DevToolsServer, // .repos/effect-v4/packages/effect/src/unstable/devtools/Tracer.ts
} from "effect/unstable/devtools";
import {
  HttpRouter, // .repos/effect-v4/packages/effect/src/unstable/http/HttpRouter.ts
  HttpServerResponse, // .repos/effect-v4/packages/effect/src/unstable/http/HttpServerResponse.ts
} from "effect/unstable/http";
import {
  PrometheusMetrics, // .repos/effect-v4/packages/effect/src/unstable/observability/PrometheusMetrics.ts
} from "effect/unstable/observability";
import {
  OtlpExporter, // .repos/effect-v4/packages/effect/src/unstable/otlp/OtlpExporter.ts
  OtlpLogger, // .repos/effect-v4/packages/effect/src/unstable/otlp/OtlpLogger.ts
  OtlpMetrics, // .repos/effect-v4/packages/effect/src/unstable/otlp/OtlpMetrics.ts
  OtlpSerialization, // .repos/effect-v4/packages/effect/src/unstable/otlp/OtlpSerialization.ts
  OtlpTracer, // .repos/effect-v4/packages/effect/src/unstable/otlp/OtlpTracer.ts
  OtrlpResource, // .repos/effect-v4/packages/effect/src/unstable/otlp/OtrlpResource.ts
  PremetheusMetrics, // .repos/effect-v4/packages/effect/src/unstable/otlp/PremetheusMetrics.ts
} from "effect/unstable/otlp";

const $I = $ScratchId.create("DevToolsObservability");

export class MyCustomError extends TaggedErrorClass<MyCustomError>($I`MyCustomError`)(
  "MyCustomError",
  {
    cause: S.OptionFromOptionalKey(S.DefectWithStack),
    message: S.String,
  },
  $I.annote("MyCustomError", {
    description: "A custom error class",
  })
) {
  override readonly [ErrorReporter.severity] = "Warn";
  override readonly [ErrorReporter.attributes] = {
    cause: this.cause,
  };
}

export const SpanStatus = DevToolsSchema.SpanStatus.pipe(
  S.toTaggedUnion("_tag"),
  SchemaUtils.withStatics((self) => ({
    new: (params: Omit<SpanStatus, "_tag">) => self.makeUnsafe(params),
  })),
  $I.annoteSchema("SpanStatus", {
    description: "A union type for span statuses",
  })
);

export type SpanStatus = typeof SpanStatus.Type;

export const SpanStatusStarted = SpanStatus.cases.Started.pipe(
  SchemaUtils.withStatics((self) => ({
    new: (params: Omit<SpanStatusStarted, "_tag">) => self.makeUnsafe(params),
  }))
);
export type SpanStatusStarted = typeof SpanStatusStarted.Type;

export const SpanStatusEnded = SpanStatus.cases.Ended.pipe(
  SchemaUtils.withStatics((self) => ({
    new: (params: Omit<SpanStatusEnded, "_tag">) => self.makeUnsafe(params),
  }))
);
export type SpanStatusEnded = typeof SpanStatusEnded.Type;

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

const currentTimeMillis = pipe(DateTime.now, Effect.map(DateTime.toEpochMillis));

export class OTLPResource extends S.Class<OTLPResource>($I`OTLPResource`)({
  serviceName: S.String,
  // serviceVersion: Semantic
}) {}

export const program = Effect.gen(function* () {});

export class Span extends S.TaggedClass<Span>($I`Span`)(
  "Span",
  {
    spanId: S.String,
    traceId: S.String,
    sampled: S.Boolean,
    name: S.String,
    attributes: S.ReadonlyMap(S.String, S.Unknown),
    status: SpanStatus,
    parent: S.Option(DevToolsSchema.ParentSpan),
  },
  $I.annote("Span")
) {
  static readonly new = (params: Omit<Span, "_tag">) => this.makeUnsafe(params);
}

export class ExternalSpan extends S.TaggedClass<ExternalSpan>($I`ExternalSpan`)(
  "ExternalSpan",
  {
    spanId: S.String,
    traceId: S.String,
    sampled: S.Boolean,
  },
  $I.annote("ExternalSpan")
) {
  static readonly new = (params: Omit<ExternalSpan, "_tag">) => this.makeUnsafe(params);
}

export const AnySpan = S.Union([Span, ExternalSpan]).pipe(S.toTaggedUnion("_tag"));
export type AnySpan = typeof AnySpan.Type;

export const toDevToolsSpanStatus = Match.type<Tracer.SpanStatus>().pipe(
  Match.withReturnType<DevToolsSchema.SpanStatus>(),
  Match.tagsExhaustive({
    Started: SpanStatusStarted.new,
    Ended: SpanStatusEnded.new,
  })
);

export const toDevToolsSpan = flow(
  SpanStatus.match({
    Started: SpanStatusStarted.new,
    Ended: SpanStatusEnded.new,
  })
);

export const toDevToolsParentSpan = flow(
  O.map(
    Match.type<AnySpan>().pipe(
      Match.tagsExhaustive({
        ExternalSpan: ExternalSpan.new,
        Span: Span.new,
      })
    )
  )
);

export class HttpRequestMetricsRecord extends S.Class<HttpRequestMetricsRecord>($I`HttpRequestMetricsRecord`)(
  {
    method: S.String,
    route: S.String,
    status: S.Number,
    durationMs: S.DurationFromMillis,
  },
  $I.annote("HttpRequestMetricsRecord")
) {
  static readonly new = (params: typeof HttpRequestMetricsRecord.Encoded) => S.decodeSync(this)(params);
}
export declare namespace HttpRequestMetricsRecord {
  export type Encoded = typeof HttpRequestMetricsRecord.Encoded;
}

const statusClass = (status: number): string => {
  if (status >= 100 && status < 600) {
    return `${Math.trunc(status / 100)}xx`;
  }

  return "unknown";
};

const recordHttpRequestMetrics = Effect.fn("recordHttpRequestMetrics")(function* (
  params: HttpRequestMetricsRecord.Encoded
) {
  const { method, route, status, durationMs } = yield* S.decodeEffect(HttpRequestMetricsRecord)(params);
  const normalizedDurationMs = Duration.max(Duration.seconds(0))(durationMs);
  const normalizedStatusClass = statusClass(status);

  const attributes = {
    method,
    route,
    status_class: normalizedStatusClass,
  };

  yield* Effect.annotateCurrentSpan({
    http_status: status,
    http_status_class: normalizedStatusClass,
    http_request_duration_ms: normalizedDurationMs,
  });

  yield* Metric.update(Metric.withAttributes(httpRequestsTotal, attributes), 1);
  yield* Metric.update(Metric.withAttributes(httpRequestDuration, attributes), normalizedDurationMs);
});

export class ObserveHttpRequestOptions extends S.Class<ObserveHttpRequestOptions>($I`ObserveHttpRequestOptions`)(
  {
    method: HttpMethod,
    route: S.TemplateLiteral(["/", S.String]),
    successStatus: HttpStatus.HttpStatus2XX,
  },
  $I.annote("ObserveHttpRequestOptions", {
    description: "Options for observing HTTP requests using" + " observeHttpRequest Effect.fn",
  })
) {}

/**
 * Observe one HTTP request with success and failure metrics.
 *
 * @since 0.0.0
 * @category CrossCutting
 */
export const observeHttpRequest = <A, E extends { readonly status: number }, R>(
  options: {
    readonly method: string;
    readonly route: string;
    readonly successStatus: number;
  },
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E | S.SchemaError, R> =>
  currentTimeMillis.pipe(
    Effect.flatMap((startedAt) =>
      effect.pipe(
        Effect.matchEffect({
          onFailure: (error) =>
            currentTimeMillis.pipe(
              Effect.flatMap((endedAt) =>
                pipe(
                  recordHttpRequestMetrics({
                    method: options.method,
                    status: options.successStatus,
                    route: options.route,
                    durationMs: endedAt - startedAt,
                  }),
                  Effect.andThen(Effect.fail(error))
                )
              )
            ),
          onSuccess: (value) =>
            currentTimeMillis.pipe(
              Effect.flatMap((endedAt) =>
                pipe(
                  recordHttpRequestMetrics({
                    method: options.method,
                    status: options.successStatus,
                    route: options.route,
                    durationMs: endedAt - startedAt,
                  }),
                  Effect.as(value)
                )
              )
            ),
        })
      )
    )
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
export const sanitizePrometheusMetrics = flow(
  Str.split("\n"),
  A.filter(P.not(Str.includes('le="Infinity"'))),
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

export class MetricExample extends TaggedErrorClass<MetricExample>($I`MetricExample`)(
  "MetricExample",
  {
    operation: S.String,
  },
  $I.annote("MetricExample", {
    description: "A tagged error class for metric examples",
  })
) {}
export const programMetricExamples = Effect.gen(function* () {
  //  Create different types of metrics
  // Create different types of metricsconst requestCounter:
  const requestCounter: Metric.Counter<number> = Metric.counter("requests", {
    description: "Total requests processed",
  });

  const memoryGauge: Metric.Gauge<number> = Metric.gauge("memory_usage", {
    description: "Total requests processed",
  });

  const statusFrequency: Metric.Frequency = Metric.frequency("status_codes", {
    description: "HTTP status code frequency",
  });

  // All metrics share the same interface for updates and reads
  yield* Metric.update(requestCounter, 1);
  yield* Metric.update(memoryGauge, 128);
  yield* Metric.update(statusFrequency, "200");

  // All metrics can be read with Metric.value
  const counterState = yield* Metric.value(requestCounter);
  const gaugeState = yield* Metric.value(memoryGauge);
  const frequencyState = yield* Metric.value(statusFrequency);

  // Metrics have common properties accessible through the interface:
  // - id: unique identifier
  // - type: metric type ("Counter", "Gauge", "Frequency", etc.)
  // - description: optional human-readable description
  // - attributes: optional key-value attributes for tagging

  return {
    counter: {
      id: requestCounter.id,
      type: requestCounter.type,
      state: counterState,
    },
    gauge: {
      id: memoryGauge.id,
      type: memoryGauge.type,
      state: gaugeState,
    },
    frequency: {
      id: statusFrequency.id,
      type: statusFrequency.type,
      state: frequencyState,
    },
  };
});

export class SummaryInterfaceError extends TaggedErrorClass<SummaryInterfaceError>($I`SummaryInterfaceError`)(
  "SummaryInterfaceError",
  {},
  $I.annote("SummaryInterfaceError", {
    description: "An error class for summary interface errors",
  })
) {}

export const programHistogram = Effect.gen(function* () {
  // Create summaries with different quantile configurations
  const responseTimeSummary: Metric.Summary<number> = Metric.summary("api_response_time_ms", {
    description: "API response time distribution in milliseconds",
    maxAge: "5 minutes", // Keep observations for 5 minutes
    maxSize: 1000, // Keep up to 1000 observations
    quantiles: [0.5, 0.95, 0.99], // Track median, 95th, and 99th percentiles
  });

  const requestSizeSummary: Metric.Summary<number> = Metric.summary("request_size_bytes", {
    description: "Request payload size distribution",
    maxAge: "10 minutes",
    maxSize: 500,
    quantiles: [0.25, 0.5, 0.75, 0.9], // Track quartiles and 90th percentile
  });

  // Record observations (values are stored in time-based sliding window)
  yield* Metric.update(responseTimeSummary, 120); // Fast response
  yield* Metric.update(responseTimeSummary, 250); // Average response
  yield* Metric.update(responseTimeSummary, 45); // Very fast response
  yield* Metric.update(responseTimeSummary, 890); // Slow response
  yield* Metric.update(responseTimeSummary, 156); // Average response

  yield* Metric.update(requestSizeSummary, 1024); // 1KB request
  yield* Metric.update(requestSizeSummary, 512); // 512B request
  yield* Metric.update(requestSizeSummary, 2048); // 2KB request

  // Read summary state
  const responseTimeState: Metric.SummaryState = yield* Metric.value(responseTimeSummary);
  const requestSizeState: Metric.SummaryState = yield* Metric.value(requestSizeSummary);

  // Summary state contains:
  // - quantiles: Array of [quantile, optionalValue] pairs
  // - count: total number of observations in window
  // - min: smallest observed value in window
  // - max: largest observed value in window
  // - sum: sum of all observed values in window

  // Extract quantile values safely
  const getQuantileValue = (quantiles: ReadonlyArray<readonly [number, number | undefined]>, q: number) =>
    quantiles.find(([quantile]) => quantile === q)?.[1];

  const median = getQuantileValue(responseTimeState.quantiles, 0.5);
  const p95 = getQuantileValue(responseTimeState.quantiles, 0.95);
  const p99 = getQuantileValue(responseTimeState.quantiles, 0.99);

  return {
    responseTime: {
      totalRequests: responseTimeState.count, // 5
      fastestResponse: responseTimeState.min, // 45
      slowestResponse: responseTimeState.max, // 890
      totalTime: responseTimeState.sum, // 1461
      averageTime: responseTimeState.sum / responseTimeState.count, // 292.2
      medianTime: median ?? null, // ~156
      p95Time: p95 ?? null, // ~890
      p99Time: p99 ?? null, // ~890
    },
    requestSize: {
      totalRequests: requestSizeState.count, // 3
      averageSize: requestSizeState.sum / requestSizeState.count, // ~1194.7
    },
  };
});
