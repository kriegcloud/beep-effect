import { ResendService } from "@beep/core-email";
import { AuthEmailService, AuthService } from "@beep/iam-infra";
import { DbLive } from "@beep/runtime-server/db-live";
import { DevToolsLive } from "@beep/runtime-server/dev-tools-live";
import { HttpClientLive } from "@beep/runtime-server/http-client-live";
import { LogLevelLive } from "@beep/runtime-server/log-level-live";
import { LoggerLive } from "@beep/runtime-server/logger-live";
import { SliceDatabasesLive } from "@beep/runtime-server/slice-databases-live";
import { SliceRepositoriesLive } from "@beep/runtime-server/slice-repositories-live";
import { TelemetryLive } from "@beep/runtime-server/telemetry-live";
import type { Resource } from "@effect/opentelemetry/Resource";
import type { HttpClient } from "@effect/platform/HttpClient";
import * as Layer from "effect/Layer";
import * as ManagedRuntime from "effect/ManagedRuntime";

export type BaseLayer = Layer.Layer<Resource | HttpClient, never, never>;

export const Base: BaseLayer = Layer.mergeAll(TelemetryLive, HttpClientLive, DevToolsLive, LogLevelLive);

export const SliceDependenciesLayer = Layer.provideMerge(SliceDatabasesLive, DbLive);

export const Db = Layer.provideMerge(SliceRepositoriesLive, SliceDependenciesLayer);

type AuthEmailLive = Layer.Layer<AuthEmailService, never, never>;
const AuthEmailLive: AuthEmailLive = AuthEmailService.DefaultWithoutDependencies.pipe(
  Layer.provide([ResendService.Default])
);

export const ServicesDependencies = Layer.mergeAll(Db, AuthEmailLive);

const AuthLive = AuthService.DefaultWithoutDependencies.pipe(Layer.provide(ServicesDependencies));

const AppLive = Layer.mergeAll(Base, AuthLive).pipe(Layer.provide(LoggerLive));

export const serverRuntime = ManagedRuntime.make(AppLive);
