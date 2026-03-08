import { $RuntimeServerId } from "@beep/identity/packages";
import * as BunHttpClient from "@effect/platform-bun/BunHttpClient";
import { DateTime, Duration, Effect, Layer, Metric, pipe, Tracer } from "effect";
import * as A from "effect/Array";
import * as S from "effect/Schema";
import * as Str from "effect/String";
import * as DevToolsClient from "effect/unstable/devtools/DevToolsClient";
import type * as DevToolsSchema from "effect/unstable/devtools/DevToolsSchema";
import * as Otlp from "effect/unstable/observability/Otlp";
import * as Socket from "effect/unstable/socket/Socket";

const $I = $RuntimeServerId.create("internal/SidecarObservability");

/**
 * Observability configuration for the repo-memory sidecar runtime.
 *
 * @since 0.0.0
 * @category Models
 */
export class SidecarObservabilityConfig extends S.Class<SidecarObservabilityConfig>($I`SidecarObservabilityConfig`)(
  {
    devtoolsEnabled: S.Boolean,
    devtoolsUrl: S.String,
    otlpBaseUrl: S.String,
    otlpEnabled: S.Boolean,
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

const defaultServiceName = "beep-repo-memory-sidecar";
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

const otelEnv = (name: string): string | undefined => {
  const value = process.env[name];
  if (value === undefined) {
    return undefined;
  }

  const normalized = pipe(value, Str.trim);
  return Str.isNonEmpty(normalized) ? normalized : undefined;
};

const parseResourceAttributes = (): Record<string, string> => {
  const encoded = otelEnv("OTEL_RESOURCE_ATTRIBUTES");
  if (encoded === undefined) {
    return {};
  }

  return pipe(
    encoded,
    Str.split(","),
    A.reduce({} as Record<string, string>, (attributes, pair) => {
      const separatorIndex = pipe(pair, Str.indexOf("="), (value) => value ?? -1);
      if (separatorIndex <= 0) {
        return attributes;
      }

      const key = pipe(pair, Str.slice(0, separatorIndex), Str.trim);
      const value = pipe(pair, Str.slice(separatorIndex + 1), Str.trim);

      if (!Str.isNonEmpty(key) || !Str.isNonEmpty(value)) {
        return attributes;
      }

      return {
        ...attributes,
        [key]: value,
      };
    })
  );
};

const makeOtlpResource = (config: SidecarObservabilityConfig) => ({
  serviceName: otelEnv("OTEL_SERVICE_NAME") ?? defaultServiceName,
  serviceVersion: otelEnv("OTEL_SERVICE_VERSION") ?? config.version,
  attributes: {
    deployment_environment: defaultEnvironment,
    beep_slice: defaultSlice,
    ...parseResourceAttributes(),
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

const toDevToolsSpanStatus = (status: Tracer.SpanStatus): DevToolsSchema.SpanStatus =>
  status._tag === "Started"
    ? {
        _tag: "Started",
        startTime: status.startTime,
      }
    : {
        _tag: "Ended",
        startTime: status.startTime,
        endTime: status.endTime,
      };

const toDevToolsParentSpan = (parent: Tracer.AnySpan | undefined): DevToolsSchema.ParentSpan | undefined => {
  if (parent === undefined) {
    return undefined;
  }

  if (parent._tag === "ExternalSpan") {
    return {
      _tag: "ExternalSpan",
      spanId: parent.spanId,
      traceId: parent.traceId,
      sampled: parent.sampled,
    };
  }

  return {
    _tag: "Span",
    spanId: parent.spanId,
    traceId: parent.traceId,
    name: parent.name,
    sampled: parent.sampled,
    attributes: parent.attributes,
    status: toDevToolsSpanStatus(parent.status),
    parent: toDevToolsParentSpan(parent.parent),
  };
};

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
 * @category Observability
 */
export const observeHttpRequest = <A, E extends { readonly status: number }, R>(
  options: {
    readonly method: string;
    readonly route: string;
    readonly successStatus: number;
  },
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R> =>
  currentTimeMillis.pipe(
    Effect.flatMap((startedAt) =>
      effect.pipe(
        Effect.matchEffect({
          onFailure: (error) =>
            currentTimeMillis.pipe(
              Effect.flatMap((endedAt) =>
                recordHttpRequestMetrics(options.method, options.route, error.status, endedAt - startedAt).pipe(
                  Effect.andThen(Effect.fail(error))
                )
              )
            ),
          onSuccess: (value) =>
            currentTimeMillis.pipe(
              Effect.flatMap((endedAt) =>
                recordHttpRequestMetrics(
                  options.method,
                  options.route,
                  options.successStatus,
                  endedAt - startedAt
                ).pipe(Effect.as(value))
              )
            ),
        })
      )
    )
  );

/**
 * Observe one HTTP request with success and failure metrics.
 *
 * @since 0.0.0
 * @category Observability
 */
export const provideSidecarObservability = <A, E, R>(
  config: SidecarObservabilityConfig,
  effect: Effect.Effect<A, E, R>
): Effect.Effect<A, E, R> => {
  let provided = effect.pipe(Effect.provide(Metric.enableRuntimeMetricsLayer));

  if (config.otlpEnabled) {
    provided = provided.pipe(
      Effect.provide(
        Otlp.layerProtobuf({
          baseUrl: config.otlpBaseUrl,
          resource: makeOtlpResource(config),
          loggerExportInterval: Duration.seconds(1),
          loggerMergeWithExisting: true,
          metricsExportInterval: Duration.seconds(10),
          metricsTemporality: "cumulative",
          tracerExportInterval: Duration.seconds(5),
          shutdownTimeout: Duration.seconds(3),
        }).pipe(Layer.provide(BunHttpClient.layer))
      )
    );
  }

  if (config.devtoolsEnabled) {
    provided = provided.pipe(Effect.provide(makeFilteredDevToolsLayer(config.devtoolsUrl)));
  }

  return provided;
};
