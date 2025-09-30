import { clientEnv } from "@beep/core-env/client";
import { QueryClient } from "@beep/runtime-client/services/common/query-client";
import { WorkerClient } from "@beep/runtime-client/worker/worker-client";
import { DevTools } from "@effect/experimental";
import { WebSdk } from "@effect/opentelemetry";
import { FetchHttpClient } from "@effect/platform";
import type { HttpClient } from "@effect/platform/HttpClient";
import { BrowserSocket } from "@effect/platform-browser";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import type { QueryClient as TanstackQueryClient } from "@tanstack/react-query";
import * as Duration from "effect/Duration";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as LogLevel from "effect/LogLevel";
import type * as ManagedRuntime from "effect/ManagedRuntime";
import { NetworkMonitor } from "../common/network-monitor";

const metricExporter = new OTLPMetricExporter({
  url: "http://localhost:4318/v1/metrics",
});

export type HttpClientLive = Layer.Layer<HttpClient, never, never>;
export const HttpClientLive: HttpClientLive = FetchHttpClient.layer;

export type DevToolsLive = Layer.Layer<never, never, never>;
export const DevToolsLive: DevToolsLive =
  clientEnv.env === "dev"
    ? DevTools.layerWebSocket().pipe(Layer.provide(BrowserSocket.layerWebSocketConstructor))
    : Layer.empty;

export type WebSdkLive = Layer.Layer<never, never, never>;
export const WebSdkLive: WebSdkLive = WebSdk.layer(() => ({
  resource: {
    serviceName: `beep-effect-client`,
  },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter({ url: "http://localhost:4318/v1/traces" })),
  logRecordProcessor: new BatchLogRecordProcessor(new OTLPLogExporter({ url: "http://localhost:4318/v1/logs" })),
  metricReader: new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: Duration.toMillis("5 seconds"),
  }),
})).pipe(Layer.provideMerge(FetchHttpClient.layer));

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

type ClientRuntimeEnv = Layer.Layer.Success<AppLayer>;
type RunPromiseOptions = Parameters<LiveManagedRuntime["runPromise"]>[1];
type RunPromiseExitOptions = Parameters<LiveManagedRuntime["runPromiseExit"]>[1];

export const runClientPromise = <A, E>(
  runtime: LiveManagedRuntime,
  effect: Effect.Effect<A, E, ClientRuntimeEnv>,
  spanName = "clientRuntime.runPromise",
  options?: RunPromiseOptions
) => runtime.runPromise(Effect.withSpan(effect, spanName), options);

export const makeRunClientPromise =
  (runtime: LiveManagedRuntime, spanName = "clientRuntime.runPromise", options?: RunPromiseOptions) =>
  <A, E>(effect: Effect.Effect<A, E, ClientRuntimeEnv>) =>
    runClientPromise(runtime, effect, spanName, options);

export const runClientPromiseExit = <A, E>(
  runtime: LiveManagedRuntime,
  effect: Effect.Effect<A, E, ClientRuntimeEnv>,
  spanName = "clientRuntime.runPromiseExit",
  options?: RunPromiseExitOptions
) => runtime.runPromiseExit(Effect.withSpan(effect, spanName), options);

export const makeRunClientPromiseExit =
  (runtime: LiveManagedRuntime, spanName = "clientRuntime.runPromiseExit", options?: RunPromiseExitOptions) =>
  <A, E>(effect: Effect.Effect<A, E, ClientRuntimeEnv>) =>
    runClientPromiseExit(runtime, effect, spanName, options);
