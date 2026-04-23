/**
 * HTTP API telemetry descriptors, metrics, and middleware helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { $ObservabilityId } from "@beep/identity/packages";
import { NonNegativeInt } from "@beep/schema";
import { Cause, Clock, Duration, Effect, Exit, Layer, Metric, SchemaAST } from "effect";
import * as A from "effect/Array";
import { dual } from "effect/Function";
import * as O from "effect/Option";
import * as P from "effect/Predicate";
import * as S from "effect/Schema";
import type * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import { type HttpApiEndpoint, type HttpApiGroup, HttpApiMiddleware, HttpApiSchema } from "effect/unstable/httpapi";
import { observeHttpRequest, statusClass } from "../Metric.ts";

const $I = $ObservabilityId.create("server/HttpApiTelemetry");
const decodeNonNegativeInt = S.decodeUnknownSync(NonNegativeInt);
const resolveHttpApiStatus = SchemaAST.resolveAt<number>("httpApiStatus");

class HttpApiStatusField extends S.Class<HttpApiStatusField>($I`HttpApiStatusField`)(
  { status: NonNegativeInt },
  $I.annote("HttpApiStatusField", {
    description: "Internal helper schema for decoding runtime HTTP status fields.",
  })
) {}

const decodeStatusField = S.decodeUnknownOption(HttpApiStatusField);

/**
 * Shared HTTP API telemetry descriptor.
 *
 * @example
 * ```typescript
 * import { NonNegativeInt } from "@beep/schema"
 * import * as S from "effect/Schema"
 * import { HttpApiTelemetryDescriptor } from "@beep/observability/server"
 *
 * const successStatus = S.decodeUnknownSync(NonNegativeInt)(201)
 * const descriptor = new HttpApiTelemetryDescriptor({
 *
 *
 *
 *
 *
 *
 * })
 * ```
 *
 * @since 0.0.0
 * @category models
 */
export class HttpApiTelemetryDescriptor extends S.Class<HttpApiTelemetryDescriptor>($I`HttpApiTelemetryDescriptor`)(
  {
    apiName: S.String,
    groupName: S.String,
    endpointName: S.String,
    method: S.String,
    route: S.String,
    successStatus: NonNegativeInt,
  },
  $I.annote("HttpApiTelemetryDescriptor", {
    description: "Shared HTTP API telemetry descriptor.",
  })
) {}

/**
 * Shared metric bundle for HTTP API request observation.
 *
 * @since 0.0.0
 * @category models
 */
interface HttpApiMetricSet {
  readonly requestDuration: Metric.Metric<import("effect/Duration").Duration, unknown>;
  readonly requestsTotal: Metric.Counter<number>;
}

/**
 * Options for the shared HTTP API telemetry middleware layer.
 *
 * @since 0.0.0
 * @category models
 */
interface HttpApiTelemetryMiddlewareOptions {
  readonly apiName: string;
  readonly metrics: HttpApiMetricSet;
}

interface ObserveHttpApiEffectOptions {
  readonly descriptor: HttpApiTelemetryDescriptor;
  readonly endpoint: HttpApiEndpoint.AnyWithProps;
  readonly metrics: HttpApiMetricSet;
}

interface ObserveHttpApiHandlerOptions {
  readonly descriptor: HttpApiTelemetryDescriptor;
  readonly metrics: HttpApiMetricSet;
}

const isHttpApiMetricSet = (value: unknown): value is HttpApiMetricSet =>
  P.hasProperty(value, "requestDuration") && P.hasProperty(value, "requestsTotal");

const isObserveHttpApiEffectOptions = (value: unknown): value is ObserveHttpApiEffectOptions =>
  P.hasProperty(value, "descriptor") && P.hasProperty(value, "endpoint") && P.hasProperty(value, "metrics");

const isObserveHttpApiHandlerOptions = (value: unknown): value is ObserveHttpApiHandlerOptions =>
  P.hasProperty(value, "descriptor") && P.hasProperty(value, "metrics");

const isObserveHttpApiEffectDataFirst = (args: IArguments): boolean => Effect.isEffect(args[0]) || args.length >= 4;

const isObserveHttpApiHandlerDataFirst = (args: IArguments): boolean => Effect.isEffect(args[0]) || args.length >= 3;

const isHttpServerResponseEffect = <E, R>(
  value: unknown
): value is Effect.Effect<HttpServerResponse.HttpServerResponse, E, R> => Effect.isEffect(value);

const isHttpApiHandlerEffect = <A, E extends { readonly status: number }, R>(
  value: unknown
): value is Effect.Effect<A, E, R> => Effect.isEffect(value);

/**
 * Resolve the declared success status from an HttpApiSchema value.
 *
 * @example
 * ```typescript
 * import * as S from "effect/Schema"
 * import { httpApiSuccessStatus } from "@beep/observability/server"
 *
 * const status = httpApiSuccessStatus(S.String, 200)
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
export const httpApiSuccessStatus = (schema: S.Top, fallback = 200): NonNegativeInt =>
  decodeNonNegativeInt(resolveHttpApiStatus(schema.ast) ?? fallback);

const httpApiErrorStatus = (schema: S.Top, fallback = 500): NonNegativeInt =>
  decodeNonNegativeInt(resolveHttpApiStatus(schema.ast) ?? fallback);

const endpointSuccessSchemas = (endpoint: HttpApiEndpoint.AnyWithProps): ReadonlyArray<S.Top> => {
  const schemas = A.fromIterable(endpoint.success);
  return A.isReadonlyArrayNonEmpty(schemas) ? schemas : A.make(HttpApiSchema.NoContent);
};

const endpointErrorSchemas = (endpoint: HttpApiEndpoint.AnyWithProps): ReadonlyArray<S.Top> => {
  let schemas = A.fromIterable(endpoint.error);
  const containsSchema = A.containsWith<S.Top>((left, right) => left === right);

  for (const middleware of endpoint.middlewares) {
    const service = middleware as unknown as HttpApiMiddleware.AnyService;

    for (const schema of service.error) {
      if (!containsSchema(schemas, schema)) {
        schemas = A.append(schemas, schema);
      }
    }
  }

  return schemas;
};

/**
 * Create a reusable HTTP API metric set for one metric prefix.
 *
 * @example
 * ```typescript
 * import { makeHttpApiMetrics } from "@beep/observability/server"
 *
 * const metrics = makeHttpApiMetrics("todox_api")
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
export const makeHttpApiMetrics = (prefix: string, descriptionPrefix = "HTTP API request"): HttpApiMetricSet => ({
  requestsTotal: Metric.counter(`${prefix}_requests_total`, {
    description: `${descriptionPrefix} count.`,
    incremental: true,
  }),
  requestDuration: Metric.timer(`${prefix}_request_duration_ms`, {
    description: `${descriptionPrefix} duration.`,
  }),
});

const descriptorAnnotations = (descriptor: HttpApiTelemetryDescriptor) => ({
  http_api: descriptor.apiName,
  http_group: descriptor.groupName,
  http_endpoint: descriptor.endpointName,
  http_method: descriptor.method,
  http_route: descriptor.route,
});

const telemetryAttributes = (descriptor: HttpApiTelemetryDescriptor, statusLabel: string): Record<string, string> => ({
  method: descriptor.method,
  route: descriptor.route,
  status_class: statusLabel,
});

const updateHttpApiMetrics = (
  descriptor: HttpApiTelemetryDescriptor,
  metrics: HttpApiMetricSet,
  statusLabel: string,
  durationMs: number
): Effect.Effect<void> => {
  const attributes = telemetryAttributes(descriptor, statusLabel);
  return Metric.update(Metric.withAttributes(metrics.requestsTotal, attributes), 1).pipe(
    Effect.andThen(
      Metric.update(Metric.withAttributes(metrics.requestDuration, attributes), Duration.millis(durationMs))
    )
  );
};

const annotateHttpApiOutcome = (
  descriptor: HttpApiTelemetryDescriptor,
  options: {
    readonly durationMs: number;
    readonly failureKind?: "failure" | "defect" | "interrupted" | undefined;
    readonly status?: number | undefined;
  }
): Effect.Effect<void> => {
  const statusLabel = options.status === undefined ? "unknown" : statusClass(options.status);
  return Effect.annotateCurrentSpan({
    ...descriptorAnnotations(descriptor),
    ...(options.failureKind === undefined ? {} : { http_failure_kind: options.failureKind }),
    ...(options.status === undefined
      ? {
          http_status_class: statusLabel,
        }
      : {
          http_status: options.status,
          http_status_class: statusLabel,
        }),
    http_request_duration_ms: options.durationMs,
  });
};

/**
 * Create a telemetry descriptor directly from Effect HttpApi metadata.
 *
 * @example
 * ```typescript
 * import { makeHttpApiTelemetryDescriptor } from "@beep/observability/server"
 * import type { HttpApiGroup, HttpApiEndpoint } from "effect/unstable/httpapi"
 *
 * declare const group: HttpApiGroup.AnyWithProps
 * declare const endpoint: HttpApiEndpoint.AnyWithProps
 * const descriptor = makeHttpApiTelemetryDescriptor("TodoApi", group, endpoint)
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
export const makeHttpApiTelemetryDescriptor: {
  (
    apiName: string,
    group: HttpApiGroup.AnyWithProps,
    endpoint: HttpApiEndpoint.AnyWithProps
  ): HttpApiTelemetryDescriptor;
  (
    group: HttpApiGroup.AnyWithProps,
    endpoint: HttpApiEndpoint.AnyWithProps
  ): (apiName: string) => HttpApiTelemetryDescriptor;
} = dual(
  3,
  (apiName: string, group: HttpApiGroup.AnyWithProps, endpoint: HttpApiEndpoint.AnyWithProps) =>
    new HttpApiTelemetryDescriptor({
      apiName,
      groupName: group.identifier,
      endpointName: endpoint.name,
      method: endpoint.method,
      route: endpoint.path,
      successStatus: httpApiSuccessStatus(endpointSuccessSchemas(endpoint)[0]),
    })
);

/**
 * Resolve the concrete status of a failed HTTP API effect from the runtime
 * error first, then from matching endpoint error schemas.
 *
 * @example
 * ```typescript
 * import { httpApiFailureStatus } from "@beep/observability/server"
 * import type { HttpApiEndpoint } from "effect/unstable/httpapi"
 *
 * declare const endpoint: HttpApiEndpoint.AnyWithProps
 * const status = httpApiFailureStatus(endpoint, new Error("not found"))
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
export const httpApiFailureStatus: {
  (endpoint: HttpApiEndpoint.AnyWithProps, error: unknown): number | undefined;
  (error: unknown): (endpoint: HttpApiEndpoint.AnyWithProps) => number | undefined;
} = dual(2, (endpoint: HttpApiEndpoint.AnyWithProps, error: unknown): number | undefined =>
  O.getOrUndefined(
    decodeStatusField(error).pipe(
      O.map(({ status }) => status),
      O.orElse(() => (S.isSchemaError(error) ? O.some(400) : O.none())),
      O.orElse(() => {
        for (const schema of endpointErrorSchemas(endpoint)) {
          if (S.is(schema)(error)) {
            const status = schema.pipe(httpApiErrorStatus);
            return O.some(status);
          }
        }

        return O.none();
      })
    )
  )
);

/**
 * Observe one encoded HTTP API effect where the success value is an
 * `HttpServerResponse`.
 *
 * @example
 * ```typescript
 * import { Effect } from "effect"
 * import {
 *
 *
 *
 * } from "@beep/observability/server"
 * import type { HttpApiEndpoint } from "effect/unstable/httpapi"
 * import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse"
 *
 * declare const descriptor: HttpApiTelemetryDescriptor
 * declare const endpoint: HttpApiEndpoint.AnyWithProps
 * const metrics = makeHttpApiMetrics("todox_api")
 * const handler = Effect.succeed(HttpServerResponse.empty({ status: 200 }))
 * const observed = observeHttpApiEffect(descriptor, endpoint, metrics, handler)
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
const observeHttpApiEffectImpl = <E, R>(
  effect: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>,
  options: ObserveHttpApiEffectOptions
): Effect.Effect<HttpServerResponse.HttpServerResponse, E, R> =>
  Clock.currentTimeMillis.pipe(
    Effect.flatMap((startedAt) =>
      Effect.annotateCurrentSpan({
        ...descriptorAnnotations(options.descriptor),
        http_success_status: decodeNonNegativeInt(options.descriptor.successStatus),
      }).pipe(
        Effect.andThen(effect.pipe(Effect.annotateLogs(descriptorAnnotations(options.descriptor)))),
        Effect.exit,
        Effect.flatMap((exit) =>
          Clock.currentTimeMillis.pipe(
            Effect.flatMap((endedAt) => {
              const durationMs = Math.max(0, endedAt - startedAt);

              if (Exit.isSuccess(exit)) {
                return annotateHttpApiOutcome(options.descriptor, {
                  durationMs,
                  status: exit.value.status,
                }).pipe(
                  Effect.andThen(
                    updateHttpApiMetrics(
                      options.descriptor,
                      options.metrics,
                      statusClass(exit.value.status),
                      durationMs
                    )
                  ),
                  Effect.as(exit.value)
                );
              }

              const failure = Cause.findErrorOption(exit.cause);
              const status = O.isSome(failure) ? httpApiFailureStatus(options.endpoint, failure.value) : undefined;
              const failureKind = Cause.hasInterruptsOnly(exit.cause)
                ? "interrupted"
                : O.isSome(failure)
                  ? "failure"
                  : "defect";
              const statusLabel = status === undefined ? "unknown" : statusClass(status);

              return annotateHttpApiOutcome(options.descriptor, {
                durationMs,
                failureKind,
                status,
              }).pipe(
                Effect.andThen(updateHttpApiMetrics(options.descriptor, options.metrics, statusLabel, durationMs)),
                Effect.andThen(Effect.failCause(exit.cause))
              );
            })
          )
        )
      )
    )
  );

/**
 * Observes an HTTP API Effect and records request metrics.
 *
 * @category observability
 * @since 0.0.0
 */
export const observeHttpApiEffect: {
  <E, R>(
    effect: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>,
    options: ObserveHttpApiEffectOptions
  ): Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>;
  (
    options: ObserveHttpApiEffectOptions
  ): <E, R>(
    effect: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>
  ) => Effect.Effect<HttpServerResponse.HttpServerResponse, E, R>;
} = dual(isObserveHttpApiEffectDataFirst, function <
  E,
  R,
>(effect: Effect.Effect<HttpServerResponse.HttpServerResponse, E, R> | HttpApiTelemetryDescriptor, options: ObserveHttpApiEffectOptions | HttpApiEndpoint.AnyWithProps): Effect.Effect<
  HttpServerResponse.HttpServerResponse,
  E,
  R
> {
  if (Effect.isEffect(effect) && isObserveHttpApiEffectOptions(options)) {
    return observeHttpApiEffectImpl(effect, options);
  }

  const legacyMetrics: unknown = arguments[2];
  const legacyEffect: unknown = arguments[3];

  if (
    !Effect.isEffect(effect) &&
    !isObserveHttpApiEffectOptions(options) &&
    isHttpApiMetricSet(legacyMetrics) &&
    isHttpServerResponseEffect<E, R>(legacyEffect)
  ) {
    return observeHttpApiEffectImpl(legacyEffect, {
      descriptor: effect,
      endpoint: options,
      metrics: legacyMetrics,
    });
  }

  return Effect.die("Invalid observeHttpApiEffect arguments");
});

/**
 * Shared server-side HttpApi middleware service for request metrics, span
 * annotations, and log correlation.
 *
 * @example
 * ```typescript
 * import { HttpApiTelemetryMiddleware } from "@beep/observability/server"
 *
 * void HttpApiTelemetryMiddleware
 * ```
 *
 * @since 0.0.0
 * @category services
 */
export class HttpApiTelemetryMiddleware extends HttpApiMiddleware.Service<HttpApiTelemetryMiddleware>()(
  $I`HttpApiTelemetryMiddleware`
) {}

/**
 * Build a layer that instruments all endpoints where the middleware is
 * applied.
 *
 * @example
 * ```typescript
 * import { makeHttpApiMetrics, layerHttpApiTelemetryMiddleware } from "@beep/observability/server"
 *
 * const metrics = makeHttpApiMetrics("todox_api")
 * const TelemetryLive = layerHttpApiTelemetryMiddleware({
 *
 *
 * })
 * ```
 *
 * @since 0.0.0
 * @category layers
 */
export const layerHttpApiTelemetryMiddleware = (
  options: HttpApiTelemetryMiddlewareOptions
): Layer.Layer<HttpApiTelemetryMiddleware> =>
  Layer.succeed(HttpApiTelemetryMiddleware, (httpEffect, middlewareOptions) =>
    observeHttpApiEffect(httpEffect, {
      descriptor: makeHttpApiTelemetryDescriptor(options.apiName, middlewareOptions.group, middlewareOptions.endpoint),
      endpoint: middlewareOptions.endpoint,
      metrics: options.metrics,
    })
  );

/**
 * Observe one HTTP API handler with shared span/log annotations.
 *
 * @example
 * ```typescript
 * import { Effect } from "effect"
 * import {
 *
 *
 *
 * } from "@beep/observability/server"
 *
 * declare const descriptor: HttpApiTelemetryDescriptor
 * const metrics = makeHttpApiMetrics("todox_api")
 * const handler = Effect.succeed({ status: 200 as const })
 * const observed = observeHttpApiHandler(descriptor, metrics, handler)
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
const observeHttpApiHandlerImpl = <A, E extends { readonly status: number }, R>(
  effect: Effect.Effect<A, E, R>,
  options: ObserveHttpApiHandlerOptions
): Effect.Effect<A, E, R> =>
  observeHttpRequest(
    Effect.annotateCurrentSpan({
      http_api: options.descriptor.apiName,
      http_group: options.descriptor.groupName,
      http_endpoint: options.descriptor.endpointName,
      http_method: options.descriptor.method,
      http_route: options.descriptor.route,
      http_success_status: decodeNonNegativeInt(options.descriptor.successStatus),
    }).pipe(
      Effect.andThen(
        effect.pipe(
          Effect.annotateLogs({
            http_api: options.descriptor.apiName,
            http_group: options.descriptor.groupName,
            http_endpoint: options.descriptor.endpointName,
            http_method: options.descriptor.method,
            http_route: options.descriptor.route,
          })
        )
      )
    ),
    {
      method: options.descriptor.method,
      route: options.descriptor.route,
      successStatus: options.descriptor.successStatus,
      requestsTotal: options.metrics.requestsTotal,
      requestDuration: options.metrics.requestDuration,
    }
  );

/**
 * Observes an HTTP API handler Effect and records request metrics.
 *
 * @category observability
 * @since 0.0.0
 */
export const observeHttpApiHandler: {
  <A, E extends { readonly status: number }, R>(
    effect: Effect.Effect<A, E, R>,
    options: ObserveHttpApiHandlerOptions
  ): Effect.Effect<A, E, R>;
  (
    options: ObserveHttpApiHandlerOptions
  ): <A, E extends { readonly status: number }, R>(effect: Effect.Effect<A, E, R>) => Effect.Effect<A, E, R>;
  <A, E extends { readonly status: number }, R>(
    descriptor: HttpApiTelemetryDescriptor,
    metrics: HttpApiMetricSet,
    effect: Effect.Effect<A, E, R>
  ): Effect.Effect<A, E, R>;
} = dual(isObserveHttpApiHandlerDataFirst, function <
  A,
  E extends { readonly status: number },
  R,
>(effect: Effect.Effect<A, E, R> | HttpApiTelemetryDescriptor, options: ObserveHttpApiHandlerOptions | HttpApiMetricSet): Effect.Effect<
  A,
  E,
  R
> {
  if (Effect.isEffect(effect) && isObserveHttpApiHandlerOptions(options)) {
    return observeHttpApiHandlerImpl(effect, options);
  }

  const legacyEffect: unknown = arguments[2];

  if (
    !Effect.isEffect(effect) &&
    !isObserveHttpApiHandlerOptions(options) &&
    isHttpApiHandlerEffect<A, E, R>(legacyEffect)
  ) {
    return observeHttpApiHandlerImpl(legacyEffect, {
      descriptor: effect,
      metrics: options,
    });
  }

  return Effect.die("Invalid observeHttpApiHandler arguments");
});
