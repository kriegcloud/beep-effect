import { Db } from "@beep/core-db";
import { ResendService } from "@beep/core-email";
import { serverEnv } from "@beep/core-env/server";
import { makePrettyConsoleLoggerLayer } from "@beep/errors/server";
import { FilesRepos } from "@beep/files-infra";
import { TasksRepos } from "@beep/tasks-infra";
import { FilesDb } from "@beep/files-infra/db";
import { AuthEmailService, AuthService, IamConfig, IamRepos } from "@beep/iam-infra";
import { IamDb } from "@beep/iam-infra/db";
import { TasksDb } from "@beep/tasks-infra/db";
import { DevTools } from "@effect/experimental";
import { NodeSdk } from "@effect/opentelemetry";
import { BunSocket } from "@effect/platform-bun";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";

import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as ManagedRuntime from "effect/ManagedRuntime";

// ============================================================================
// Environment constants
// ============================================================================

const isDevEnvironment = serverEnv.app.env === "dev";
const serviceName = `${serverEnv.app.name}-server`;
const otlpTraceExporterUrl = serverEnv.otlp.traceExporterUrl.toString();
const otlpLogExporterUrl = serverEnv.otlp.logExporterUrl.toString();
const otlpMetricExporterUrl = serverEnv.otlp.metricExporterUrl.toString();

// ============================================================================
// Telemetry
// ============================================================================

/**
 * Configures the OpenTelemetry SDK with OTLP exporters for traces and logs.
 */
export const TelemetryLive = NodeSdk.layer(() => ({
  resource: { serviceName },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter({ url: otlpTraceExporterUrl })),
  logRecordProcessor: new BatchLogRecordProcessor(new OTLPLogExporter({ url: otlpLogExporterUrl })),
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({ url: otlpMetricExporterUrl }),
  }),
}));

// ============================================================================
// Logging & developer tooling
// ============================================================================

/** Provides JSON logging in production and a pretty console logger locally. */
export const LoggerLive = isDevEnvironment ? makePrettyConsoleLoggerLayer() : Logger.json;

/** Dynamically adjusts the minimum log level based on the environment. */
export const LogLevelLive = Logger.minimumLogLevel(serverEnv.app.logLevel);

/**
 * Optional developer tools, exposed only in development to avoid production overhead.
 */
export const DevToolsLive = isDevEnvironment
  ? DevTools.layerWebSocket().pipe(Layer.provide(BunSocket.layerWebSocketConstructor))
  : Layer.empty;

/** Shared base layer containing observability infrastructure. */
export const ObservabilityLive = Layer.mergeAll(LoggerLive, TelemetryLive, DevToolsLive);

// ============================================================================
// Persistence slices
// ============================================================================

/** Combines infra-specific repositories required by the server runtime. */
export const SliceRepositoriesLive = Layer.mergeAll(IamRepos.layer, FilesRepos.layer, TasksRepos.layer);

/** Establishes connections to the databases used by the runtime. */
export const SliceDatabasesLive = Layer.mergeAll(IamDb.IamDb.Live, FilesDb.FilesDb.Live, TasksDb.TasksDb.Live);

/** Provides database connections to the common database layer. */
export const DatabaseInfrastructureLive = Layer.provideMerge(SliceDatabasesLive, Db.Live);

/** Supplies repository services backed by the configured databases. */
export const RepositoriesLive = Layer.provideMerge(SliceRepositoriesLive, DatabaseInfrastructureLive);

// ============================================================================
// Domain services
// ============================================================================

/** Enables email delivery for authentication flows. */
const AuthEmailLive = AuthEmailService.DefaultWithoutDependencies.pipe(
  Layer.provide([ResendService.Default, IamConfig.Live])
);

/** Aggregates the service layer dependencies consumed by Auth and related modules. */
export const CoreServicesLive = Layer.provideMerge(RepositoriesLive, AuthEmailLive);

const AuthLive = AuthService.DefaultWithoutDependencies.pipe(Layer.provide([CoreServicesLive, IamConfig.Live]));

const AppLive = AuthLive.pipe(Layer.provideMerge(LoggerLive));

// ============================================================================
// Runtime helpers
// ============================================================================

/**
 * Managed runtime powering the server layer. Provides telemetry, logging, and service dependencies.
 */
export const serverRuntime = ManagedRuntime.make(AppLive.pipe(Layer.provide([ObservabilityLive, LogLevelLive])));

type ServerRuntimeEnv = Layer.Layer.Success<typeof AppLive>;

/**
 * Runs an Effect within the configured server runtime while recording a tracing span.
 */
export const runServerPromise = <A, E>(
  effect: Effect.Effect<A, E, ServerRuntimeEnv>,
  spanName = "serverRuntime.runPromise",
  options?: Parameters<typeof serverRuntime.runPromise>[1] | undefined
) => serverRuntime.runPromise(Effect.withSpan(effect, spanName), options);

/**
 * Runs an Effect within the configured server runtime and captures the full Exit value.
 */
export const runServerPromiseExit = <A, E>(
  effect: Effect.Effect<A, E, ServerRuntimeEnv>,
  spanName = "serverRuntime.runPromiseExit",
  options?:
    | {
        readonly signal?: AbortSignal | undefined;
      }
    | undefined
) => serverRuntime.runPromiseExit(Effect.withSpan(effect, spanName), options);
