import { Effect, Layer, pipe } from "effect";
import * as A from "effect/Array";
import * as P from "effect/Predicate";
import * as Str from "effect/String";
import * as HttpRouter from "effect/unstable/http/HttpRouter";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import * as PrometheusMetrics from "effect/unstable/observability/PrometheusMetrics";

/**
 * Strip duplicate terminal histogram buckets from Prometheus exposition text.
 *
 * @since 0.0.0
 * @category Observability
 */
export const sanitizePrometheusMetrics = (text: string): string =>
  pipe(text, Str.split("\n"), A.filter(P.not(Str.includes('le="Infinity"'))), A.join("\n"));

/**
 * Create a sanitized Prometheus metrics route.
 *
 * @since 0.0.0
 * @category Layers
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
