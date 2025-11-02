import * as OtlpTracer from "@effect/opentelemetry/OtlpTracer";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as Config from "effect/Config";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Redacted from "effect/Redacted";

export const TracerLayer = Layer.unwrapEffect(
  Effect.gen(function* () {
    const apiKey = yield* Config.redacted("VITE_HONEYCOMB_API_KEY").pipe(Config.option);
    if (Option.isNone(apiKey)) {
      return Layer.empty;
    }
    return OtlpTracer.layer({
      url: "https://api.honeycomb.io/v1/traces",
      headers: {
        "X-Honeycomb-Team": Redacted.value(apiKey.value),
        "X-Honeycomb-Dataset": "bunnings-lite",
      },
      resource: {
        serviceName: "bunnings-client",
      },
    }).pipe(Layer.provide(FetchHttpClient.layer));
  })
);
