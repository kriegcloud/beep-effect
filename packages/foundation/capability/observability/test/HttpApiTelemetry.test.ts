import {
  HttpApiTelemetryDescriptor,
  httpApiFailureStatus,
  httpApiSuccessStatus,
  makeHttpApiTelemetryDescriptor,
  observeHttpApiEffect,
  observeHttpApiHandler,
} from "@beep/observability/server";
import { Context, Effect, Metric } from "effect";
import * as S from "effect/Schema";
import * as HttpServerResponse from "effect/unstable/http/HttpServerResponse";
import { HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";
import { describe, expect, it } from "vitest";

describe("HttpApiTelemetry", () => {
  it("reads explicit HttpApiSchema statuses", () => {
    expect(httpApiSuccessStatus(S.String.pipe(HttpApiSchema.status(201)))).toBe(201);
    expect(httpApiSuccessStatus(S.String)).toBe(200);
  });

  it("tracks HTTP API request metrics", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const requestsTotal = Metric.counter("test_http_api_requests_total");
        const requestDuration = Metric.timer("test_http_api_request_duration_ms");
        const descriptor = new HttpApiTelemetryDescriptor({
          apiName: "test-api",
          groupName: "system",
          endpointName: "health",
          method: "GET",
          route: "/health",
          successStatus: httpApiSuccessStatus(S.String),
        });

        yield* observeHttpApiHandler(
          descriptor,
          {
            requestsTotal,
            requestDuration,
          },
          Effect.succeed("ok")
        );

        const state = yield* Metric.value(
          Metric.withAttributes(requestsTotal, {
            method: "GET",
            route: "/health",
            status_class: "2xx",
          })
        );

        expect(state.count).toBe(1);
      })
    ));

  it("observes encoded HttpServerResponse values and schema-derived failure statuses", () =>
    Effect.runPromise(
      Effect.gen(function* () {
        const requestsTotal = Metric.counter("test_http_api_effect_requests_total");
        const requestDuration = Metric.timer("test_http_api_effect_request_duration_ms");
        const endpoint = HttpApiEndpoint.get("health", "/health", {
          success: S.String,
          error: S.Struct({
            message: S.String,
          }).pipe(HttpApiSchema.status(503)),
        });
        const descriptor = makeHttpApiTelemetryDescriptor("test-api", HttpApiGroup.make("system"), endpoint);

        const response = yield* observeHttpApiEffect(
          descriptor,
          endpoint,
          {
            requestsTotal,
            requestDuration,
          },
          Effect.succeed(HttpServerResponse.text("ok", { status: 202 }))
        );

        expect(response.status).toBe(202);

        const successState = yield* Metric.value(
          Metric.withAttributes(requestsTotal, {
            method: "GET",
            route: "/health",
            status_class: "2xx",
          })
        );

        expect(successState.count).toBe(1);
        expect(httpApiFailureStatus(endpoint, { message: "backend unavailable" })).toBe(503);

        const failureExit = yield* Effect.exit(
          observeHttpApiEffect(
            descriptor,
            endpoint,
            {
              requestsTotal,
              requestDuration,
            },
            Effect.fail({
              message: "backend unavailable",
            })
          )
        );

        expect(failureExit._tag).toBe("Failure");

        const failureState = yield* Metric.value(
          Metric.withAttributes(requestsTotal, {
            method: "GET",
            route: "/health",
            status_class: "5xx",
          })
        );

        expect(failureState.count).toBe(1);
      }).pipe(Effect.provide(Context.empty() as Context.Context<unknown>))
    ));
});
