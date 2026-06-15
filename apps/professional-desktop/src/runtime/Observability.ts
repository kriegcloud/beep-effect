/**
 * Environment-driven observability for the desktop chat sidecar.
 *
 * Logs, traces, and metrics are exported via effect's native OTLP exporter
 * (`effect/unstable/observability` — no OpenTelemetry SDK dependency). Wiring is
 * standard-OTel-env driven and resolved through `effect/Config`:
 *
 *   OTEL_EXPORTER_OTLP_ENDPOINT  e.g. http://localhost:4318 — when unset, the
 *                                exporter is OFF and this layer collapses to
 *                                {@link Layer.empty}, so prod/dev wiring is just
 *                                an env var.
 *   DEVTOOLS                    true enables the Effect DevTools websocket
 *                                mirror via `@beep/observability/server`.
 *   DEVTOOLS_URL                defaults to ws://localhost:34437.
 *
 * @packageDocumentation
 * @since 0.0.0
 */

import { layerFilteredDevTools } from "@beep/observability/server";
import { O } from "@beep/utils";
import { Config, Effect, Layer } from "effect";
import { FetchHttpClient } from "effect/unstable/http";
import { Otlp, OtlpSerialization } from "effect/unstable/observability";

/**
 * OTLP observability layer for the sidecar. Gated on
 * `OTEL_EXPORTER_OTLP_ENDPOINT`: present ⇒ the effect-native OTLP exporter
 * (traces/logs/metrics over JSON to the standard OTel collector); absent ⇒
 * {@link Layer.empty}, so telemetry is opt-in and the sidecar runs with zero
 * external dependencies by default.
 *
 * @category layers
 * @since 0.0.0
 */
const OtlpLive: Layer.Layer<never> = Layer.unwrap(
  Effect.gen(function* () {
    const endpoint = yield* Config.option(Config.string("OTEL_EXPORTER_OTLP_ENDPOINT"));
    if (O.isNone(endpoint)) {
      return Layer.empty;
    }
    return Otlp.layerFromConfig({
      resource: {
        serviceName: "professional-desktop-sidecar",
        serviceVersion: "0.0.3",
      },
    }).pipe(Layer.provide([FetchHttpClient.layer, OtlpSerialization.layerJson]));
  }).pipe(Effect.orDie)
);

/**
 * Effect DevTools websocket mirror for local sidecar debugging. Gated by
 * `DEVTOOLS=true`, using the shared observability capability so the app does
 * not hand-roll devtools protocol plumbing.
 *
 * @category layers
 * @since 0.0.0
 */
const DevToolsLive: Layer.Layer<never> = Layer.unwrap(
  Effect.gen(function* () {
    const enabled = yield* Config.boolean("DEVTOOLS").pipe(Config.withDefault(false));
    if (!enabled) {
      return Layer.empty;
    }
    const url = yield* Config.string("DEVTOOLS_URL").pipe(Config.withDefault("ws://localhost:34437"));
    return layerFilteredDevTools({ url, shouldPublish: () => true });
  }).pipe(Effect.orDie)
);

/**
 * Sidecar observability layer: OTLP export plus optional Effect DevTools.
 *
 * @category layers
 * @since 0.0.0
 */
export const ObservabilityLive: Layer.Layer<never> = Layer.mergeAll(OtlpLive, DevToolsLive);
