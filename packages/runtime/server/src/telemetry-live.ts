import { serverEnv } from "@beep/core-env/server";
import * as Otlp from "@effect/opentelemetry/Otlp";
import * as FetchHttpClient from "@effect/platform/FetchHttpClient";
import * as Layer from "effect/Layer";

export type TelemetryLive = Layer.Layer<never, never, never>;
export const TelemetryLive = Otlp.layer({
  baseUrl: "https://localhost:4318",
  resource: {
    serviceName: `${serverEnv.app.name}-server`,
  },
}).pipe(Layer.provideMerge(FetchHttpClient.layer));
