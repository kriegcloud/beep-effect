import {
  layerNodeSdkServer,
  layerNodeSdkServerTraces,
  makeNodeSdkServerTraceConfig,
  ServerObservabilityConfig,
} from "@beep/observability/server";
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

const withOtlpTraceSink = async (use: (baseUrl: string, contentType: Promise<string>) => Promise<void>) => {
  let resolveContentType: (contentType: string) => void = () => {};
  const contentType = new Promise<string>((resolve) => {
    resolveContentType = resolve;
  });
  const server = Bun.serve({
    fetch: (request) => {
      const path = new URL(request.url).pathname;
      if (path === "/v1/traces") {
        resolveContentType(request.headers.get("content-type") ?? "");
      }

      return new Response(null, { status: 200 });
    },
    hostname: "127.0.0.1",
    port: 0,
  });

  try {
    await use(`http://127.0.0.1:${server.port}`, contentType);
  } finally {
    await server.stop(true);
  }
};

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

  it("builds trace-only config for Phoenix smoke exports", () => {
    const sdkConfig = makeNodeSdkServerTraceConfig(serverConfig);

    expect(sdkConfig.metricReader).toEqual([]);
    expect(sdkConfig.logRecordProcessor).toEqual([]);
  });

  it("exports trace-only OTLP spans as protobuf", async () => {
    await withOtlpTraceSink(async (otlpBaseUrl, contentType) => {
      await Effect.runPromise(
        Effect.void.pipe(
          Effect.withSpan("node-sdk-protobuf-export-test"),
          Effect.provide(
            layerNodeSdkServerTraces(
              new ServerObservabilityConfig({
                devtoolsEnabled: false,
                devtoolsUrl: "ws://localhost:34437",
                environment: "test",
                minLogLevel: "Info",
                otlpBaseUrl,
                otlpEnabled: true,
                otlpResourceAttributes: {},
                prometheusPrefix: "beep",
                serviceName: "beep-server",
                serviceVersion: "0.0.0",
              })
            )
          )
        )
      );

      const receivedContentType = await Promise.race([contentType, Bun.sleep(5_000).then(() => "timeout")]);
      expect(receivedContentType).toContain("application/x-protobuf");
    });
  });

  it("provides spans from the trace-only layer", async () => {
    const exporter = new InMemorySpanExporter();

    await Effect.runPromise(
      Effect.gen(function* () {
        const otelSpan = yield* OtelTracer.currentOtelSpan;
        expect(otelSpan).toBeDefined();
      }).pipe(
        Effect.withSpan("node-sdk-trace-only-test"),
        Effect.provide(
          layerNodeSdkServerTraces(serverConfig, {
            spanProcessor: [new SimpleSpanProcessor(exporter)],
          })
        )
      )
    );
  });
});
