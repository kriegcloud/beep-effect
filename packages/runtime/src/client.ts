import { clientEnv } from "@beep/env/client";
import { DevTools } from "@effect/experimental";
import { WebSdk } from "@effect/opentelemetry";
import { FetchHttpClient } from "@effect/platform";
import { BrowserSocket } from "@effect/platform-browser";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-web";
import { Layer } from "effect";

export const HttpClientLive = FetchHttpClient.layer;

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

export const ClientRuntime = Layer.mergeAll(HttpClientLive, WebSdkLive, DevToolsLive);
