import { Db } from "@beep/core-db";
import { ResendService } from "@beep/core-email";
import { AuthEmailService, AuthService } from "@beep/iam-infra";
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

type Base = Layer.Layer<Resource | HttpClient, never, never>;
export const Base: Base = Layer.mergeAll(TelemetryLive, HttpClientLive, DevToolsLive, LogLevelLive);

export const SliceDependenciesLayer = Layer.provideMerge(SliceDatabasesLive, Db.Live);

export const DbRepos = Layer.provideMerge(SliceRepositoriesLive, SliceDependenciesLayer);

const AuthEmailLive = AuthEmailService.DefaultWithoutDependencies.pipe(Layer.provide([ResendService.Default]));

export const ServicesDependencies = Layer.provideMerge(DbRepos, AuthEmailLive);

const AuthLive = AuthService.DefaultWithoutDependencies.pipe(Layer.provideMerge(ServicesDependencies));

const AppLive = Layer.provideMerge(Base, AuthLive).pipe(Layer.provideMerge(LoggerLive));

export const serverRuntime = ManagedRuntime.make(AppLive);
