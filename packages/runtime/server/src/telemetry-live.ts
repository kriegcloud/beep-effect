import { serverEnv } from "@beep/core-env/server";
import { NodeSdk } from "@effect/opentelemetry";
import type { Resource } from "@effect/opentelemetry/Resource";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import type * as Layer from "effect/Layer";

export type TelemetryLive = Layer.Layer<Resource, never, never>;
export const TelemetryLive: TelemetryLive = NodeSdk.layer(() => ({
  resource: { serviceName: `${serverEnv.app.name}-server` },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: serverEnv.otlp.traceExporterUrl.toString(),
    })
  ),
}));
