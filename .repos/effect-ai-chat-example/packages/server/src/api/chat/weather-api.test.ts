import { describe, expect, it } from "@effect/vitest";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientError from "effect/unstable/http/HttpClientError";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";
import { WeatherApi, WeatherApiError } from "./weather-api.js";

const makeHttpClient = (
  handler: (
    request: HttpClientRequest.HttpClientRequest,
  ) => Effect.Effect<HttpClientResponse.HttpClientResponse, HttpClientError.HttpClientError>,
) =>
  HttpClient.makeWith(
    Effect.fnUntraced(function*(requestEffect) {
      const request = yield* requestEffect;
      return yield* handler(request);
    }),
    Effect.succeed as HttpClient.HttpClient.Preprocess<HttpClientError.HttpClientError, never>,
  );

const makeTestWeatherApi = (client: HttpClient.HttpClient) =>
  Layer.effect(WeatherApi, WeatherApi.make).pipe(
    Layer.provide(Layer.succeed(HttpClient.HttpClient, client)),
  );

describe("WeatherApi", () => {
  it.effect("getForecast success returns formatted string", () => {
    const client = makeHttpClient((request) =>
      Effect.succeed(
        HttpClientResponse.fromWeb(
          request,
          new Response(
            JSON.stringify({
              current: { temperature_2m: 22, weather_code: 1, wind_speed_10m: 10 },
            }),
            { status: 200, headers: { "content-type": "application/json" } },
          ),
        ),
      )
    );

    return Effect.gen(function*() {
      const api = yield* WeatherApi;
      const result = yield* api.getForecast({ latitude: 40.7, longitude: -74.0 });
      expect(result).toBe("Temperature: 22°C, Weather code: 1, Wind: 10 km/h");
    }).pipe(Effect.provide(makeTestWeatherApi(client)));
  });

  it.effect("getForecast HttpClientError fails with WeatherApiError", () => {
    const client = makeHttpClient((request) => {
      const badResponse = HttpClientResponse.fromWeb(request, new Response(null, { status: 400 }));
      return Effect.fail(
        new HttpClientError.HttpClientError({
          reason: new HttpClientError.StatusCodeError({
            request,
            response: badResponse,
            description: "Bad Request",
          }),
        }),
      );
    });

    return Effect.gen(function*() {
      const api = yield* WeatherApi;
      const result = yield* api.getForecast({ latitude: 40.7, longitude: -74.0 }).pipe(
        Effect.flip,
      );
      expect(result).toBeInstanceOf(WeatherApiError);
      expect(result._tag).toBe("WeatherApiError");
      expect(result.reason).toBe("RequestFailed");
    }).pipe(Effect.provide(makeTestWeatherApi(client)));
  });

  it.effect("getForecast SchemaError fails with WeatherApiError", () => {
    const client = makeHttpClient((request) =>
      Effect.succeed(
        HttpClientResponse.fromWeb(
          request,
          new Response(
            JSON.stringify({ unexpected: "shape" }),
            { status: 200, headers: { "content-type": "application/json" } },
          ),
        ),
      )
    );

    return Effect.gen(function*() {
      const api = yield* WeatherApi;
      const result = yield* api.getForecast({ latitude: 40.7, longitude: -74.0 }).pipe(
        Effect.flip,
      );
      expect(result).toBeInstanceOf(WeatherApiError);
      expect(result._tag).toBe("WeatherApiError");
      expect(result.reason).toBe("InvalidResponse");
    }).pipe(Effect.provide(makeTestWeatherApi(client)));
  });
});
