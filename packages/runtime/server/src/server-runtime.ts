import { Db } from "@beep/core-db";
import { ResendService } from "@beep/core-email";
import { serverEnv } from "@beep/core-env/server";
import { makePrettyConsoleLoggerLayer } from "@beep/errors/server";
import { FilesRepos } from "@beep/files-infra";
import { FilesDb } from "@beep/files-infra/db";
import { AuthEmailService, AuthService, IamRepos } from "@beep/iam-infra";
import { IamDb } from "@beep/iam-infra/db";
import { DevTools } from "@effect/experimental";
import { NodeSdk } from "@effect/opentelemetry";
import type { Resource } from "@effect/opentelemetry/Resource";
import { NodeSocket } from "@effect/platform-node";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
// import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
// import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
// import * as Duration from "effect/Duration";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";

import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";

import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Logger from "effect/Logger";
import * as LogLevel from "effect/LogLevel";
import * as ManagedRuntime from "effect/ManagedRuntime";

// const metricExporter = new OTLPMetricExporter({
//   url: "http://localhost:4318/v1/metrics",
// });
export const TelemetryLive = NodeSdk.layer(() => ({
  resource: { serviceName: `${serverEnv.app.name}-server` },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter({ url: "http://localhost:4318/v1/traces" })),
  logRecordProcessor: new BatchLogRecordProcessor(new OTLPLogExporter({ url: "http://localhost:4318/v1/logs" })),
  // metricReader: new PeriodicExportingMetricReader({
  //   exporter: metricExporter,
  //   exportIntervalMillis: Duration.toMillis("5 seconds"),
  // }),
}));
export const SliceRepositoriesLive = Layer.mergeAll(IamRepos.layer, FilesRepos.layer);

export const SliceDatabasesLive = Layer.mergeAll(IamDb.IamDb.Live, FilesDb.FilesDb.Live);

export type LoggerLive = Layer.Layer<never, never, never>;
export const LoggerLive: LoggerLive = serverEnv.app.env === "dev" ? makePrettyConsoleLoggerLayer() : Logger.json;
export type LogLevelLive = Layer.Layer<never, never, never>;
export const LogLevelLive: LogLevelLive = Logger.minimumLogLevel(
  serverEnv.app.env === "dev" ? LogLevel.Debug : LogLevel.Info
);
export type DevToolsLive = Layer.Layer<never, never, never>;

export const DevToolsLive: DevToolsLive =
  serverEnv.app.env === "dev"
    ? DevTools.layerWebSocket().pipe(Layer.provide(NodeSocket.layerWebSocketConstructor))
    : Layer.empty;
type Base = Layer.Layer<Resource, never, never>;
export const Base: Base = Layer.mergeAll(LoggerLive, TelemetryLive, DevToolsLive);

export const SliceDependenciesLayer = Layer.provideMerge(SliceDatabasesLive, Db.Live);

export const DbRepos = Layer.provideMerge(SliceRepositoriesLive, SliceDependenciesLayer);

const AuthEmailLive = AuthEmailService.DefaultWithoutDependencies.pipe(Layer.provide([ResendService.Default]));

export const ServicesDependencies = Layer.provideMerge(DbRepos, AuthEmailLive);

const AuthLive = AuthService.DefaultWithoutDependencies.pipe(Layer.provideMerge(ServicesDependencies));

const AppLive = AuthLive.pipe(Layer.provideMerge(LoggerLive));

export const serverRuntime = ManagedRuntime.make(AppLive.pipe(Layer.provide([Base, LogLevelLive])));

type ServerRuntimeEnv = Layer.Layer.Success<typeof AppLive>;

export const runServerPromise = <A, E>(
  effect: Effect.Effect<A, E, ServerRuntimeEnv>,
  spanName = "serverRuntime.runPromise",
  options?: Parameters<typeof serverRuntime.runPromise>[1]
) => serverRuntime.runPromise(Effect.withSpan(effect, spanName), options);

export const runServerPromiseExit = <A, E>(
  effect: Effect.Effect<A, E, ServerRuntimeEnv>,
  spanName = "serverRuntime.runPromiseExit",
  options?: Parameters<typeof serverRuntime.runPromiseExit>[1]
) => serverRuntime.runPromiseExit(Effect.withSpan(effect, spanName), options);
