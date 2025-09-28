import { clientEnv } from "@beep/core-env/client";
import { QueryClient } from "@beep/runtime-client/services/common/query-client";
import { WorkerClient } from "@beep/runtime-client/worker/worker-client";
import { DevTools } from "@effect/experimental";
import * as Otlp from "@effect/opentelemetry/Otlp";
import { FetchHttpClient } from "@effect/platform";
import type { HttpClient } from "@effect/platform/HttpClient";
import { BrowserSocket } from "@effect/platform-browser";
import type { QueryClient as TanstackQueryClient } from "@tanstack/react-query";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as LogLevel from "effect/LogLevel";
import type * as ManagedRuntime from "effect/ManagedRuntime";
import { NetworkMonitor } from "../common/network-monitor";

export type HttpClientLive = Layer.Layer<HttpClient, never, never>;
export const HttpClientLive: HttpClientLive = FetchHttpClient.layer;

export type DevToolsLive = Layer.Layer<never, never, never>;
export const DevToolsLive: DevToolsLive =
  clientEnv.env === "dev"
    ? DevTools.layerWebSocket().pipe(Layer.provide(BrowserSocket.layerWebSocketConstructor))
    : Layer.empty;

export type WebSdkLive = Layer.Layer<never, never, never>;
export const WebSdkLive: WebSdkLive = Otlp.layer({
  baseUrl: "http://localhost:4318/v1/traces",
  resource: {
    serviceName: `${clientEnv.appName} client`,
  },
}).pipe(Layer.provideMerge(FetchHttpClient.layer));

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
type AppLayers = HttpClient | NetworkMonitor | WorkerClient | QueryClient;

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
