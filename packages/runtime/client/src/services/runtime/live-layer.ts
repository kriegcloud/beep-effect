import { clientEnv } from "@beep/core-env/client";
import { QueryClient } from "@beep/runtime-client/services/common/QueryClient";
import { WorkerClient } from "@beep/runtime-client/worker/WorkerClient";
import { DevTools } from "@effect/experimental";
import { WebSdk } from "@effect/opentelemetry";
import type { Resource } from "@effect/opentelemetry/Resource";
import { FetchHttpClient } from "@effect/platform";
import type { HttpClient } from "@effect/platform/HttpClient";
import { BrowserSocket } from "@effect/platform-browser";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-web";
import type { QueryClient as TanstackQueryClient } from "@tanstack/react-query";
import * as Layer from "effect/Layer";
import type * as ManagedRuntime from "effect/ManagedRuntime";
import { NetworkMonitor } from "../common/NetworkMonitor";

export type HttpClientLive = Layer.Layer<HttpClient, never, never>;
export const HttpClientLive: HttpClientLive = FetchHttpClient.layer;

import * as Logger from "effect/Logger";
import * as LogLevel from "effect/LogLevel";

export type DevToolsLive = Layer.Layer<never, never, never>;
export const DevToolsLive: DevToolsLive =
  clientEnv.env === "dev"
    ? DevTools.layerWebSocket().pipe(Layer.provide(BrowserSocket.layerWebSocketConstructor))
    : Layer.empty;

export type WebSdkLive = Layer.Layer<Resource, never, never>;
export const WebSdkLive: WebSdkLive = WebSdk.layer(() => ({
  resource: { serviceName: `${clientEnv.appName}` },
  spanProcessor: new BatchSpanProcessor(
    new OTLPTraceExporter({
      url: clientEnv.otlpTraceExportedUrl.toString(),
    })
  ),
}));
export type NetworkMonitorLive = Layer.Layer<NetworkMonitor, never, never>;
export const NetworkMonitorLive: NetworkMonitorLive = NetworkMonitor.Default;

export type QueryClientLive = Layer.Layer<QueryClient, never, never>;
export const QueryClientLive: (queryClient: TanstackQueryClient) => QueryClientLive = (
  queryClient: TanstackQueryClient
) => QueryClient.make(queryClient);

export type WorkerClientLive = Layer.Layer<WorkerClient, never, never>;
export const WorkerClientLive: WorkerClientLive = WorkerClient.Default;

export type LogLevelLive = Layer.Layer<never, never, never>;
export const LogLevelLive: LogLevelLive = Logger.minimumLogLevel(
  clientEnv.env === "dev" ? LogLevel.Debug : LogLevel.Info
);

export type LoggerLive = Layer.Layer<never, never, never>;
export const LoggerLive: LoggerLive = clientEnv.env === "dev" ? Logger.pretty : Logger.json;
// NetworkMonitor | QueryClient | WorkerClient | HttpClient | Resource
type AppLayers = HttpClient | Resource | NetworkMonitor | WorkerClient | QueryClient;

export type AppLayer = Layer.Layer<AppLayers, never, never>;

export type AppLive = (queryClient: TanstackQueryClient) => AppLayer;

export const layer: AppLive = (queryClient: TanstackQueryClient) =>
  Layer.mergeAll(
    HttpClientLive,
    WebSdkLive,
    NetworkMonitorLive,
    WorkerClientLive,
    QueryClientLive(queryClient),
    DevToolsLive
  ).pipe(Layer.provide(LoggerLive));

export type LiveManagedRuntime = ManagedRuntime.ManagedRuntime<Layer.Layer.Success<AppLayer>, never>;
export type LiveRuntimeContext = ManagedRuntime.ManagedRuntime.Context<LiveManagedRuntime>;
