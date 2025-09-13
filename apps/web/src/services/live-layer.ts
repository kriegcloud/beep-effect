import { clientEnv } from "@beep/core-env/client";
import { DevTools } from "@effect/experimental";
import { WebSdk } from "@effect/opentelemetry";
import { FetchHttpClient } from "@effect/platform";
import { BrowserSocket } from "@effect/platform-browser";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-web";
import { Layer } from "effect";
import type * as ManagedRuntime from "effect/ManagedRuntime";
import type { NetworkMonitor } from "@/services/common/NetworkMonitor";
import type { QueryClient } from "./common/QueryClient";
import type { WorkerClient } from "./worker/WorkerClient.ts";

export type LiveLayerType = Layer.Layer<NetworkMonitor | QueryClient | WorkerClient>;
export type LiveManagedRuntime = ManagedRuntime.ManagedRuntime<Layer.Layer.Success<LiveLayerType>, never>;
export type LiveRuntimeContext = ManagedRuntime.ManagedRuntime.Context<LiveManagedRuntime>;

export const HttpClientLive = FetchHttpClient.layer;

export const WebSdkLive = WebSdk.layer(() => ({
  resource: { serviceName: `${clientEnv.appName}-client` },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: clientEnv.otlpTraceExportedUrl.toString(),
    })
  ),
}));

export const DevToolsLive = DevTools.layerWebSocket().pipe(Layer.provide(BrowserSocket.layerWebSocketConstructor));
