import { NodeSdk } from "@effect/opentelemetry";
import type * as Resource from "@effect/opentelemetry/Resource";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import type * as Layer from "effect/Layer";
import { otlpLogExporterUrl, otlpMetricExporterUrl, otlpTraceExporterUrl, serviceName } from "./Environment";

export type Tracing = Resource.Resource;

export type TracingLive = Layer.Layer<Tracing, never, never>;

export const TracingLive: TracingLive = NodeSdk.layer(() => ({
  resource: { serviceName },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter({ url: otlpTraceExporterUrl })),
  logRecordProcessor: new BatchLogRecordProcessor(new OTLPLogExporter({ url: otlpLogExporterUrl })),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({ url: otlpMetricExporterUrl }),
  }),
}));
