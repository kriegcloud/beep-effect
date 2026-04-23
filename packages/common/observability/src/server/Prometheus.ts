/**
 * Prometheus metrics sanitization and HTTP route helpers.
 *
 * @packageDocumentation
 * @since 0.0.0
 */
import { Effect, flow, Layer } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import * as PrometheusMetrics from "effect/unstable/observability/PrometheusMetrics";

/**
 * Strip duplicate terminal histogram buckets from Prometheus exposition text.
 *
 * @example
 * ```typescript
 * import { sanitizePrometheusMetrics } from "@beep/observability/server"
 *
 * const raw = 'my_metric_bucket{le="Infinity"} 5\nmy_metric_bucket{le="1"} 3'
 * const clean = sanitizePrometheusMetrics(raw)
 * ```
 *
 * @since 0.0.0
 * @category observability
 */
export const sanitizePrometheusMetrics: (text: string) => string = flow(
  Str.split("\n"),
  A.filter(P.not(Str.includes('le="Infinity"'))),
  A.join("\n")
);

/**
 * Create a sanitized Prometheus metrics route.
 *
 * @example
 * ```typescript
 * import { layerPrometheusMetricsHttp } from "@beep/observability/server"
 *
 * const PrometheusLive = layerPrometheusMetricsHttp({ path: "/metrics" })
 * ```
 *
 * @since 0.0.0
 * @category layers
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
