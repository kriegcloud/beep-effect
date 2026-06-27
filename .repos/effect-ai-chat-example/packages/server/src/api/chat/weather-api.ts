import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Schema from "effect/Schema";
import * as FetchHttpClient from "effect/unstable/http/FetchHttpClient";
import * as HttpClient from "effect/unstable/http/HttpClient";
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest";
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse";

const WeatherResponse = Schema.Struct({
  current: Schema.Struct({
    temperature_2m: Schema.Number,
    weather_code: Schema.Number,
    wind_speed_10m: Schema.Number,
  }),
});

export class WeatherApiError extends Schema.TaggedErrorClass<WeatherApiError>()(
  "WeatherApiError",
  {
    reason: Schema.Literals(["RequestFailed", "InvalidResponse"]),
    message: Schema.String,
  },
) {}

export class WeatherApi extends Context.Service<WeatherApi>()("@app/chat/WeatherApi", {
  make: Effect.gen(function*() {
    const httpClient = (yield* HttpClient.HttpClient).pipe(
      HttpClient.mapRequest((req) =>
        req.pipe(HttpClientRequest.prependUrl("https://api.open-meteo.com/v1"))
      ),
      HttpClient.retryTransient({}),
    );

    return {
      getForecast: (params: { readonly latitude: number; readonly longitude: number; }) =>
        httpClient.get("/forecast", {
          urlParams: {
            latitude: params.latitude,
            longitude: params.longitude,
            current: "temperature_2m,weather_code,wind_speed_10m",
          },
        }).pipe(
          Effect.flatMap(HttpClientResponse.schemaBodyJson(WeatherResponse)),
          Effect.catchTags({
            HttpClientError: (error) =>
              Effect.fail(new WeatherApiError({ reason: "RequestFailed", message: error.message })),
            SchemaError: (error) =>
              Effect.fail(
                new WeatherApiError({ reason: "InvalidResponse", message: error.message }),
              ),
          }),
          Effect.map(
            (data) =>
              `Temperature: ${data.current.temperature_2m}°C, Weather code: ${data.current.weather_code}, Wind: ${data.current.wind_speed_10m} km/h`,
          ),
        ),
    };
  }),
}) {
  static layer: Layer.Layer<WeatherApi> = Layer.effect(this, this.make).pipe(
    Layer.provide(FetchHttpClient.layer),
    Layer.orDie,
  );
}
