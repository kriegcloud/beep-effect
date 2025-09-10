import { clientEnv } from "@beep/env/client";
import { DevTools } from "@effect/experimental";
import { WebSdk } from "@effect/opentelemetry";
import { BrowserSocket } from "@effect/platform-browser";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-web";
import { Layer } from "effect";

export * from "./client-services";
export const WebSdkLive = WebSdk.layer(() => ({
  resource: { serviceName: `${clientEnv.appName}-client` },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: clientEnv.otlpTraceExportedUrl.toString(),
    })
  ),
}));

export const DevToolsLive = DevTools.layerWebSocket().pipe(Layer.provide(BrowserSocket.layerWebSocketConstructor));
