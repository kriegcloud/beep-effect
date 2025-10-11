import { clientEnv } from "@beep/core-env/client";
import { QueryClient as RuntimeQueryClient } from "@beep/runtime-client/services/common/query-client";
import { WorkerClient } from "@beep/runtime-client/worker/worker-client";

import { WebSdk } from "@effect/opentelemetry";
import { FetchHttpClient } from "@effect/platform";
import type { HttpClient } from "@effect/platform/HttpClient";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import type { QueryClient as TanstackQueryClient } from "@tanstack/react-query";

import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as LogLevel from "effect/LogLevel";
import type * as ManagedRuntime from "effect/ManagedRuntime";

import { NetworkMonitor } from "../common/network-monitor";

// ============================================================================
// Environment constants
// ============================================================================

const isDevEnvironment = clientEnv.env === "dev";
const serviceName = `${clientEnv.appName}-client`;
const otlpTraceExporterUrl = clientEnv.otlpTraceExportedUrl.toString();
const otlpLogExporterUrl = clientEnv.otlpLogExportedUrl.toString();

// ============================================================================
// Observability
// ============================================================================

/**
 * Configures the Web OpenTelemetry SDK to export traces and logs via OTLP.
 */
export const TelemetryLive = WebSdk.layer(() => ({
  resource: { serviceName },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter({ url: otlpTraceExporterUrl })),
  logRecordProcessor: new BatchLogRecordProcessor(new OTLPLogExporter({ url: otlpLogExporterUrl })),
})).pipe(Layer.provideMerge(FetchHttpClient.layer));

/** Provides pretty logging locally and structured logs in production. */
export const LoggerLive = isDevEnvironment ? Logger.pretty : Logger.json;

/** Dynamically tunes the minimum log level to suit the environment. */
export const LogLevelLive = Logger.minimumLogLevel(isDevEnvironment ? LogLevel.Debug : LogLevel.Info);

/** Shared observability stack for the client runtime. */
export const ObservabilityLive = Layer.mergeAll(LoggerLive, TelemetryLive);

// ============================================================================
// Runtime infrastructure
// ============================================================================

/** Supplies the Fetch-based HttpClient implementation. */
export const HttpClientLive = FetchHttpClient.layer;

/** Observes browser connectivity changes to expose a NetworkMonitor service. */
export const NetworkMonitorLive = NetworkMonitor.Default;

/** Provides access to the worker transport used by the runtime. */
export const WorkerClientLive = WorkerClient.Default;

/** Converts the provided TanStack QueryClient into an Effect layer. */
export const makeQueryClientLayer = (queryClient: TanstackQueryClient) => RuntimeQueryClient.make(queryClient);

// ============================================================================
// Runtime assembly
// ============================================================================

type ClientRuntimeServices = HttpClient | NetworkMonitor | WorkerClient | RuntimeQueryClient;

export type ClientRuntimeLayer = Layer.Layer<ClientRuntimeServices, never, never>;

export type ClientRuntimeLive = (queryClient: TanstackQueryClient) => ClientRuntimeLayer;

/**
 * Builds the live client runtime layer with observability, networking, and worker services.
 */
export const createClientRuntimeLayer: ClientRuntimeLive = (queryClient) =>
  Layer.mergeAll(
    HttpClientLive,
    ObservabilityLive,
    NetworkMonitorLive,
    WorkerClientLive,
    makeQueryClientLayer(queryClient)
  ).pipe(Layer.provide(LogLevelLive));

/** Maintains the previous export name for backwards compatibility. */
export const layer = createClientRuntimeLayer;

// ============================================================================
// Runtime helpers
// ============================================================================

export type LiveManagedRuntime = ManagedRuntime.ManagedRuntime<Layer.Layer.Success<ClientRuntimeLayer>, never>;
export type LiveRuntimeContext = ManagedRuntime.ManagedRuntime.Context<LiveManagedRuntime>;

type ClientRuntimeEnv = Layer.Layer.Success<ClientRuntimeLayer>;
type RunPromiseOptions = Parameters<LiveManagedRuntime["runPromise"]>[1];
type RunPromiseExitOptions = Parameters<LiveManagedRuntime["runPromiseExit"]>[1];

/**
 * Runs an Effect within the client runtime, wrapping it in an observability span.
 */
export const runClientPromise = <A, E>(
  runtime: LiveManagedRuntime,
  effect: Effect.Effect<A, E, ClientRuntimeEnv>,
  spanName = "clientRuntime.runPromise",
  options?: RunPromiseOptions
) => runtime.runPromise(Effect.withSpan(effect, spanName), options);

/**
 * Returns a helper function bound to a specific runtime for repeated invocations.
 */
export const makeRunClientPromise =
  (runtime: LiveManagedRuntime, spanName = "clientRuntime.runPromise", options?: RunPromiseOptions) =>
  <A, E>(effect: Effect.Effect<A, E, ClientRuntimeEnv>) =>
    runClientPromise(runtime, effect, spanName, options);

/**
 * Runs an Effect within the client runtime and returns its Exit value.
 */
export const runClientPromiseExit = <A, E>(
  runtime: LiveManagedRuntime,
  effect: Effect.Effect<A, E, ClientRuntimeEnv>,
  spanName = "clientRuntime.runPromiseExit",
  options?: RunPromiseExitOptions
) => runtime.runPromiseExit(Effect.withSpan(effect, spanName), options);

/**
 * Returns a helper function that captures Exit values from Effects run in the client runtime.
 */
export const makeRunClientPromiseExit =
  (runtime: LiveManagedRuntime, spanName = "clientRuntime.runPromiseExit", options?: RunPromiseExitOptions) =>
  <A, E>(effect: Effect.Effect<A, E, ClientRuntimeEnv>) =>
    runClientPromiseExit(runtime, effect, spanName, options);
