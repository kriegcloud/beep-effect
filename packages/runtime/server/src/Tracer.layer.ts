import { serverEnv } from "@beep/shared-server/ServerEnv";
import { NodeSdk } from "@effect/opentelemetry";
import type * as Resource from "@effect/opentelemetry/Resource";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import type * as Layer from "effect/Layer";

export type Tracing = Resource.Resource;

export type TracingLive = Layer.Layer<Tracing, never, never>;

export const layer: TracingLive = NodeSdk.layer(() => ({
  resource: { serviceName: `${serverEnv.app.name}-server` },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter({ url: serverEnv.otlp.traceExporterUrl.toString() })),
  logRecordProcessor: new BatchLogRecordProcessor(
    new OTLPLogExporter({ url: serverEnv.otlp.logExporterUrl.toString() })
  ),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({ url: serverEnv.otlp.metricExporterUrl.toString() }),
  }),
}));
