import { layerNodeSdkServer, ServerObservabilityConfig } from "@beep/observability/server";
import * as OtelTracer from "@effect/opentelemetry/Tracer";
import { InMemorySpanExporter, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { Effect } from "effect";
import { describe, expect, it } from "vitest";

const serverConfig = new ServerObservabilityConfig({
  serviceName: "beep-server",
  serviceVersion: "0.0.0",
  environment: "test",
  minLogLevel: "Info",
  otlpBaseUrl: "http://localhost:4318",
  otlpEnabled: false,
  otlpResourceAttributes: {},
  devtoolsEnabled: false,
  devtoolsUrl: "ws://localhost:34437",
  prometheusPrefix: "beep",
});

describe("NodeSdk", () => {
  it("provides OpenTelemetry spans when processors are configured", async () => {
    const exporter = new InMemorySpanExporter();

    await Effect.runPromise(
      Effect.gen(function* () {
        const otelSpan = yield* OtelTracer.currentOtelSpan;
        expect(otelSpan).toBeDefined();
      }).pipe(
        Effect.withSpan("node-sdk-test"),
        Effect.provide(
          layerNodeSdkServer(serverConfig, {
            spanProcessor: [new SimpleSpanProcessor(exporter)],
          })
        )
      )
    );
  });
});
