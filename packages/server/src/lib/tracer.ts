import * as NodeSdk from "@effect/opentelemetry/NodeSdk";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";

export const TracerLive = NodeSdk.layer(() => ({
  resource: {
    serviceName: "effect-playground",
  },
  spanProcessor: [
    new BatchSpanProcessor(new OTLPTraceExporter({ url: "http://localhost:4318/v1/traces" })),
  ],
  logRecordProcessor: [
    new BatchLogRecordProcessor(new OTLPLogExporter({ url: "http://localhost:4318/v1/logs" })),
  ],
}));
